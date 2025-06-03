import {
  Box,
  Button,
  Flex,
  Heading,
  Input,
  Image,
  HStack,
  Text,
  Table,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useState, useMemo, useEffect } from "react";
import { ProductService, type Product } from "../../services/ProductService";
import { toaster } from "@/components/ui/toaster";
import { AlertDialog } from "@/components/ui/alert-dialog";

export default function ProductsPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // AlertDialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const productsData = await ProductService.getAll();
      setProducts(productsData);
    } catch (err: any) {
      console.error("Error fetching products:", err);
      setError(err.message || "Ошибка загрузки товаров");
      toaster.create({
        title: "Ошибка",
        description: "Ошибка загрузки товаров",
        type: "error",
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1); // Reset to first page when searching
  };
  const handleDeleteProduct = async (
    productId: string,
    productName: string
  ) => {
    setSelectedProduct({ id: productId, name: productName });
    setIsDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedProduct) return;

    setIsDeleting(true);
    try {
      await ProductService.delete(selectedProduct.id);

      // Remove product from local state
      setProducts((prev) => prev.filter((p) => p.id !== selectedProduct.id));

      toaster.create({
        title: "Успешно",
        description: "Товар успешно удален",
        type: "success",
        duration: 3000,
      });
    } catch (err: any) {
      console.error("Error deleting product:", err);
      toaster.create({
        title: "Ошибка",
        description: err.message || "Ошибка при удалении товара",
        type: "error",
        duration: 5000,
      });
    } finally {
      setIsDeleting(false);
      setIsDialogOpen(false);
      setSelectedProduct(null);
    }
  };

  const handleCancelDelete = () => {
    setIsDialogOpen(false);
    setSelectedProduct(null);
  };

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;

    const query = searchQuery.toLowerCase();
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        product.sku.toLowerCase().includes(query) ||
        product.manufacturer_name.toLowerCase().includes(query)
    );
  }, [products, searchQuery]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredProducts.slice(startIndex, endIndex);
  }, [filteredProducts, currentPage]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      let startPage = Math.max(1, currentPage - 2);
      let endPage = Math.min(totalPages, currentPage + 2);

      if (currentPage <= 3) {
        endPage = Math.min(totalPages, 5);
      }

      if (currentPage >= totalPages - 2) {
        startPage = Math.max(1, totalPages - 4);
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }

    return pages;
  };

  if (loading) {
    return (
      <Box>
        <Text>Загрузка товаров...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Text color="red.500">{error}</Text>
        <Button onClick={fetchProducts} mt={4}>
          Повторить попытку
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Flex justify="space-between" align="center" mb="25px">
        <Heading size="lg" fontWeight="600">
          Товары
        </Heading>
        <Button
          bg="#79b74a"
          color="white"
          _hover={{ bg: "#6aa23c" }}
          onClick={() => navigate("/admin/products/new")}
        >
          Добавить товары
        </Button>
      </Flex>

      <Box mb="20px">
        <Input
          placeholder="Поиск по названию, описанию, SKU, производителю..."
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          maxW="400px"
          border="1px solid #ccc"
          borderRadius="5px"
        />
      </Box>

      <Box
        bg="white"
        boxShadow="0 1px 3px rgba(0,0,0,0.05)"
        borderRadius="md"
        overflow="hidden"
      >
        <Table.Root>
          <Table.Header>
            <Table.Row bg="#f8f9fa">
              <Table.ColumnHeader
                fontSize="14px"
                fontWeight="600"
                color="#555"
                p="15px"
              >
                Название
              </Table.ColumnHeader>
              <Table.ColumnHeader
                fontSize="14px"
                fontWeight="600"
                color="#555"
                p="15px"
              >
                SKU
              </Table.ColumnHeader>
              <Table.ColumnHeader
                fontSize="14px"
                fontWeight="600"
                color="#555"
                p="15px"
              >
                Описание
              </Table.ColumnHeader>
              <Table.ColumnHeader
                fontSize="14px"
                fontWeight="600"
                color="#555"
                p="15px"
              >
                Производитель
              </Table.ColumnHeader>
              <Table.ColumnHeader
                fontSize="14px"
                fontWeight="600"
                color="#555"
                p="15px"
              >
                Цена
              </Table.ColumnHeader>
              <Table.ColumnHeader
                fontSize="14px"
                fontWeight="600"
                color="#555"
                p="15px"
              >
                Остаток
              </Table.ColumnHeader>
              <Table.ColumnHeader
                fontSize="14px"
                fontWeight="600"
                color="#555"
                p="15px"
              >
                Изображение
              </Table.ColumnHeader>
              <Table.ColumnHeader
                fontSize="14px"
                fontWeight="600"
                color="#555"
                p="15px"
              >
                Действия
              </Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {paginatedProducts.length > 0 ? (
              paginatedProducts.map((product) => (
                <Table.Row key={product.id} borderBottom="1px solid #e2e8f0">
                  <Table.Cell p="15px" maxW="200px">
                    <Text fontWeight="500" lineClamp={2}>
                      {product.name}
                    </Text>
                  </Table.Cell>
                  <Table.Cell p="15px">
                    <Text fontSize="sm" color="gray.600">
                      {product.sku}
                    </Text>
                  </Table.Cell>
                  <Table.Cell p="15px" maxW="300px">
                    <Text fontSize="sm" color="gray.600" lineClamp={3}>
                      {product.description}
                    </Text>
                  </Table.Cell>
                  <Table.Cell p="15px">
                    <Text fontSize="sm" color="gray.600">
                      {product.manufacturer_name}
                    </Text>
                  </Table.Cell>
                  <Table.Cell p="15px">
                    <Text fontWeight="600">{product.current_price} руб</Text>
                  </Table.Cell>
                  <Table.Cell p="15px">
                    <Text fontSize="sm" color="gray.600">
                      {product.stock_quantity} шт.
                    </Text>
                  </Table.Cell>
                  <Table.Cell p="15px">
                    <Image
                      src={
                        product.image_url ||
                        "https://via.placeholder.com/50x50/CCCCCC/FFFFFF?text=No+Image"
                      }
                      alt={product.name}
                      maxH="50px"
                      maxW="50px"
                      objectFit="cover"
                      borderRadius="4px"
                    />
                  </Table.Cell>
                  <Table.Cell p="15px">
                    <HStack gap="5px">
                      <Button
                        size="sm"
                        bg="#ffc107"
                        color="#333"
                        border="1px solid #ffc107"
                        _hover={{ bg: "#e0a800" }}
                        onClick={() =>
                          navigate(`/admin/products/${product.id}/edit`)
                        }
                      >
                        Редактировать
                      </Button>
                      <Button
                        size="sm"
                        bg="#dc3545"
                        color="white"
                        border="1px solid #dc3545"
                        _hover={{ bg: "#c82333" }}
                        onClick={() =>
                          handleDeleteProduct(product.id, product.name)
                        }
                      >
                        Удалить
                      </Button>
                    </HStack>
                  </Table.Cell>
                </Table.Row>
              ))
            ) : (
              <Table.Row>
                <Table.Cell colSpan={8} textAlign="center" p="40px">
                  <Text color="gray.500">
                    {searchQuery ? "Товары не найдены" : "Нет товаров"}
                  </Text>
                </Table.Cell>
              </Table.Row>
            )}
          </Table.Body>
        </Table.Root>
      </Box>

      {/* Pagination */}
      {totalPages > 1 && (
        <Flex justify="space-between" align="center" mt="20px">
          <Text fontSize="sm" color="#666">
            Показано {(currentPage - 1) * itemsPerPage + 1}-
            {Math.min(currentPage * itemsPerPage, filteredProducts.length)} из{" "}
            {filteredProducts.length} записей
          </Text>
          <HStack gap="5px">
            <Button
              disabled={currentPage === 1}
              size="sm"
              variant="outline"
              onClick={() => handlePageChange(currentPage - 1)}
              _disabled={{ opacity: 0.4, cursor: "not-allowed" }}
            >
              ←
            </Button>

            {getPageNumbers().map((page) => (
              <Button
                key={page}
                size="sm"
                bg={currentPage === page ? "#79b74a" : "transparent"}
                color={currentPage === page ? "white" : "#79b74a"}
                border="1px solid"
                borderColor={currentPage === page ? "#79b74a" : "#ddd"}
                _hover={{
                  bg: currentPage === page ? "#6aa23c" : "#f5f5f5",
                }}
                onClick={() => handlePageChange(page)}
              >
                {page}
              </Button>
            ))}

            {totalPages > 5 && currentPage < totalPages - 2 && (
              <>
                <Text>...</Text>
                <Button
                  size="sm"
                  variant="outline"
                  color="#79b74a"
                  borderColor="#ddd"
                  onClick={() => handlePageChange(totalPages)}
                >
                  {totalPages}
                </Button>
              </>
            )}

            <Button
              disabled={currentPage === totalPages}
              size="sm"
              variant="outline"
              onClick={() => handlePageChange(currentPage + 1)}
              _disabled={{ opacity: 0.4, cursor: "not-allowed" }}
            >
              →
            </Button>
          </HStack>{" "}
        </Flex>
      )}

      {/* AlertDialog for product deletion confirmation */}
      <AlertDialog
        open={isDialogOpen}
        onOpenChange={(details) => setIsDialogOpen(details.open)}
        title="Подтверждение удаления"
        description={
          selectedProduct
            ? `Вы уверены, что хотите удалить товар "${selectedProduct.name}"?`
            : ""
        }
        confirmText="Удалить"
        cancelText="Отмена"
        colorScheme="red"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        isLoading={isDeleting}
      />
    </Box>
  );
}
