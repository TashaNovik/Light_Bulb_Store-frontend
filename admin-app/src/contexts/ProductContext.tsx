import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { apiService, type ApiProduct } from "../services/api";
import type { Product } from "../services/api";

interface ProductContextType {
  products: Product[];
  loading: boolean;
  error: string | null;
  getProductById: (id: string) => Product | undefined;
  refreshProducts: () => Promise<void>;
  searchProducts: (query: string) => Product[];
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

// Transform API product to match frontend Product type
const transformApiProduct = (apiProduct: ApiProduct): Product => ({
  ...apiProduct,
  alt: apiProduct.name,
});

export const ProductProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const staticProducts: Product[] = [];
  const [products, setProducts] = useState<Product[]>(staticProducts);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      // Try to fetch from API first
      const apiProducts = await apiService.getProducts();
      const transformedProducts = apiProducts.map(transformApiProduct);
      setProducts(transformedProducts);
    } catch (err) {
      console.warn("Failed to fetch from API, using static data:", err);
      // Fall back to static data on error
      setProducts(staticProducts);
      setError("Не удалось загрузить данные с сервера.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check if API is available on mount
    const checkApiAndFetch = async () => {
      try {
        await apiService.healthCheck();
        await fetchProducts();
      } catch (err) {
        console.warn("API not available, using static data");
        setProducts(staticProducts);
        setError(null); // Don't show error for initial load with static data
      }
    };

    checkApiAndFetch();
  }, []);

  const getProductById = (id: string): Product | undefined => {
    return products.find((product) => product.id === id);
  };
  const refreshProducts = async () => {
    await fetchProducts();
  };

  const searchProducts = (query: string): Product[] => {
    if (!query.trim()) {
      return products;
    }

    const searchTerm = query.toLowerCase();
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm) ||
        product.sku.toLowerCase().includes(searchTerm) ||
        product.manufacturer_name.toLowerCase().includes(searchTerm) ||
        Object.values(product.attributes).some(
          (attr) => attr && attr.toString().toLowerCase().includes(searchTerm)
        )
    );
  };

  const contextValue: ProductContextType = {
    products,
    loading,
    error,
    getProductById,
    refreshProducts,
    searchProducts,
  };

  return (
    <ProductContext.Provider value={contextValue}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProductContext = (): ProductContextType => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error("useProductContext must be used within a ProductProvider");
  }
  return context;
};
