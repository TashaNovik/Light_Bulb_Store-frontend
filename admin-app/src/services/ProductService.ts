import { AuthService } from "./AuthService";

const PRODUCT_API_BASE_URL =
  import.meta.env.VITE_PRODUCT_API_URL || "http://localhost:8002";

export interface CreateProductRequest {
  name: string;
  sku: string;
  description?: string;
  manufacturer_name?: string;
  current_price: number;
  stock_quantity?: number;
  image_url?: string;
  attributes?: Record<string, any>;
}

export interface UpdateProductRequest {
  name?: string;
  sku?: string;
  description?: string;
  manufacturer_name?: string;
  current_price?: number;
  stock_quantity?: number;
  image_url?: string;
  attributes?: Record<string, any>;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  description: string;
  manufacturer_name: string;
  current_price: number;
  stock_quantity: number;
  image_url: string;
  attributes: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export class ProductService {
  private static async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const tokens = AuthService.getTokens();
    if (!tokens) {
      throw new Error("Not authenticated");
    }

    const url = `${PRODUCT_API_BASE_URL}${endpoint}`;

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokens.accessToken}`,
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        if (response.status === 401) {
          AuthService.clearTokens();
          throw new Error("Unauthorized - please login again");
        }

        const errorText = await response.text();
        let errorMessage = `HTTP error! status: ${response.status}`;

        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.detail || errorJson.message || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }

        throw new Error(errorMessage);
      }

      // Handle 204 No Content responses
      if (response.status === 204) {
        return null as T;
      }

      return await response.json();
    } catch (error) {
      console.error(`Product API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  static async getAll(
    skip: number = 0,
    limit: number = 100
  ): Promise<Product[]> {
    return this.request<Product[]>(
      `/admin/products?skip=${skip}&limit=${limit}`
    );
  }

  static async getById(id: string): Promise<Product> {
    return this.request<Product>(`/admin/products/${id}`);
  }

  static async create(data: CreateProductRequest): Promise<Product> {
    // Generate SKU if not provided
    if (!data.sku) {
      data.sku = `LAMP-${Date.now()}`;
    }

    // Set default manufacturer if not provided
    if (!data.manufacturer_name) {
      data.manufacturer_name = 'ООО "Лампочка"';
    }

    return this.request<Product>("/admin/products", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  static async update(
    id: string,
    data: UpdateProductRequest
  ): Promise<Product> {
    return this.request<Product>(`/admin/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }
  static async delete(id: string): Promise<void> {
    return this.request<void>(`/admin/products/${id}`, {
      method: "DELETE",
    });
  }
  static async uploadImage(
    file: File
  ): Promise<{ image_url: string; filename: string }> {
    const formData = new FormData();
    formData.append("file", file);

    const tokens = AuthService.getTokens();
    if (!tokens) {
      throw new Error("Not authenticated");
    }

    try {
      const response = await fetch(
        `${PRODUCT_API_BASE_URL}/admin/products/upload-image`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${tokens.accessToken}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Image upload failed:", error);
      throw error;
    }
  }
  static async deleteImage(filename: string): Promise<void> {
    return this.request<void>(`/admin/products/image/${filename}`, {
      method: "DELETE",
    });
  }
}
