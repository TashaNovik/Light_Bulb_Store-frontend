import {
  Box,
  Button,
  HStack,
  Text,
  Badge,
  Heading,
  Flex,
  Table,
  Input,
  Spinner,
  Alert,
  createListCollection,
} from "@chakra-ui/react";
import {
  SelectRoot,
  SelectItem,
  SelectTrigger,
  SelectContent,
  SelectValueText,
} from "@/components/ui/select";

import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { OrderService } from "../../services/OrderService";

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  created_at: string;
  status_name: string;
  status_code: string;
  total_amount: number;
  currency: string;
  status_ref: {
    code: string;
    name: string;
  };
}

const statusColors: Record<
  string,
  { bg: string; color: string; border: string }
> = {
  NEW: { bg: "#e6f7ff", color: "#1890ff", border: "#91d5ff" },
  PENDING_PAYMENT: { bg: "#fff1f0", color: "#f5222d", border: "#ffccc7" },
  PROCESSING: { bg: "#fffbe6", color: "#faad14", border: "#ffe58f" },
  SHIPPED: { bg: "#f0f5ff", color: "#722ed1", border: "#d3adf7" },
  DELIVERED: { bg: "#f6ffed", color: "#52c41a", border: "#b7eb8f" },
  CANCELLED: { bg: "#fff1f0", color: "#f5222d", border: "#ffccc7" },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [availableStatuses, setAvailableStatuses] = useState<
    Array<{ id: string; code: string; name: string }>
  >([]);
  const itemsPerPage = 10;

  // Load available statuses on component mount
  useEffect(() => {
    const loadStatuses = async () => {
      try {
        const statuses = await OrderService.getOrderStatuses();
        setAvailableStatuses(statuses);
      } catch (err) {
        console.error("Error loading order statuses:", err);
        // Fallback to hardcoded statuses if backend fails
        setAvailableStatuses([
          { id: "1", code: "NEW", name: "Новый" },
          { id: "2", code: "PENDING_PAYMENT", name: "Ожидает оплаты" },
          { id: "3", code: "PROCESSING", name: "В обработке" },
          { id: "4", code: "SHIPPED", name: "Отправлен" },
          { id: "5", code: "DELIVERED", name: "Доставлен" },
          { id: "6", code: "CANCELLED", name: "Отменен" },
        ]);
      }
    };
    loadStatuses();
  }, []);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    loadOrders();
  }, [currentPage, debouncedSearchQuery, statusFilter]);

  // Reset to first page when search or filter changes
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [debouncedSearchQuery, statusFilter]);
  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      const skip = (currentPage - 1) * itemsPerPage;
      const params = {
        skip: skip,
        limit: itemsPerPage,
        ...(debouncedSearchQuery && { search: debouncedSearchQuery }),
        ...(statusFilter !== "all" && { status: statusFilter }),
      };

      console.log("Loading orders with params:", params); // Debug log

      const response = await OrderService.getOrders(params);

      console.log("Orders response:", response); // Debug log

      // Defensive programming - ensure we always have an array
      const ordersData = Array.isArray(response.data) ? response.data : [];
      setOrders(ordersData);
      setTotalOrders(response.total || 0);
      setTotalPages(Math.ceil((response.total || 0) / itemsPerPage));
    } catch (err) {
      console.error("Error loading orders:", err);
      setError(err instanceof Error ? err.message : "Ошибка загрузки заказов");
      // Set empty array on error to prevent map errors
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    // currentPage will be reset by useEffect when debouncedSearchQuery changes
  };

  const handleStatusFilterChange = (value: string) => {
    console.log("Status filter changed:", value); // Debug log
    setStatusFilter(value);
    // currentPage will be reset by useEffect when statusFilter changes
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
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
      let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

      if (endPage - startPage < maxVisiblePages - 1) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }

    return pages;
  };
  const statusOptions = createListCollection({
    items: [
      { label: "Все статусы", value: "all" },
      ...availableStatuses.map((status) => ({
        label: status.name,
        value: status.code,
      })),
    ],
  });
  const getStatusBadge = (statusName: string) => {
    // Map status names to codes for color lookup
    const statusCodeMapping: Record<string, string> = {
      Новый: "NEW",
      "Ожидает оплаты": "PENDING_PAYMENT",
      "В обработке": "PROCESSING",
      Отправлен: "SHIPPED",
      Доставлен: "DELIVERED",
      Отменен: "CANCELLED",
    };

    const statusCode = statusCodeMapping[statusName] || "NEW";
    const colors = statusColors[statusCode] || statusColors["NEW"];

    return (
      <Badge
        px="8px"
        py="4px"
        borderRadius="12px"
        fontSize="12px"
        fontWeight="600"
        bg={colors.bg}
        color={colors.color}
        border={`1px solid ${colors.border}`}
      >
        {statusName}
      </Badge>
    );
  };
  if (error) {
    return (
      <Box>
        <Flex justify="space-between" align="center" mb="25px">
          <Heading size="lg" fontWeight="600">
            Заказы
          </Heading>
        </Flex>
        <Alert.Root status="error">
          <Alert.Indicator />
          <Alert.Title>Ошибка!</Alert.Title>
          <Alert.Description>{error}</Alert.Description>
        </Alert.Root>
        <Button mt={4} onClick={loadOrders}>
          Повторить попытку
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Flex justify="space-between" align="center" mb="25px">
        <Heading size="lg" fontWeight="600">
          Заказы
        </Heading>
      </Flex>
      <Flex mb="20px" gap="20px" align="center">
        <Box position="relative">
          <Input
            placeholder="Номер заказа, ФИО покупателя"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            maxW="400px"
            border="1px solid #ccc"
            borderRadius="5px"
          />
          {searchQuery !== debouncedSearchQuery && (
            <Box
              position="absolute"
              right="8px"
              top="50%"
              transform="translateY(-50%)"
            >
              <Spinner size="sm" />
            </Box>
          )}
        </Box>
        <Text>Статус:</Text>{" "}
        <SelectRoot
          collection={statusOptions}
          value={statusFilter ? [statusFilter] : [""]}
          onValueChange={(details) =>
            handleStatusFilterChange(details.value[0] || "")
          }
          w="200px"
        >
          <SelectTrigger>
            <SelectValueText placeholder="Все статусы" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.items.map((option) => (
              <SelectItem key={option.value} item={option}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </SelectRoot>
      </Flex>
      {loading ? (
        <Box display="flex" justifyContent="center" py="50px">
          <Spinner size="lg" />
        </Box>
      ) : (
        <>
          <Box
            bg="white"
            boxShadow="0 1px 3px rgba(0,0,0,0.05)"
            borderRadius="md"
            overflow="hidden"
          >
            <Table.Root>
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeader fontWeight="600" color="#333">
                    Номер заказа
                  </Table.ColumnHeader>
                  <Table.ColumnHeader fontWeight="600" color="#333">
                    Дата заказа
                  </Table.ColumnHeader>
                  <Table.ColumnHeader fontWeight="600" color="#333">
                    ФИО покупателя
                  </Table.ColumnHeader>
                  <Table.ColumnHeader fontWeight="600" color="#333">
                    Общая сумма
                  </Table.ColumnHeader>
                  <Table.ColumnHeader fontWeight="600" color="#333">
                    Статус заказа
                  </Table.ColumnHeader>
                  <Table.ColumnHeader fontWeight="600" color="#333">
                    Действия
                  </Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {Array.isArray(orders) && orders.length > 0 ? (
                  orders.map((order) => (
                    <Table.Row key={order.id}>
                      <Table.Cell fontWeight="500">
                        {order.order_number}
                      </Table.Cell>
                      <Table.Cell>
                        {new Date(order.created_at).toLocaleDateString("ru-RU")}
                      </Table.Cell>
                      <Table.Cell>{order.customer_name}</Table.Cell>
                      <Table.Cell>
                        {order.total_amount} {order.currency}
                      </Table.Cell>
                      <Table.Cell>
                        {getStatusBadge(order.status_ref.name)}
                      </Table.Cell>
                      <Table.Cell>
                        <Button
                          as={Link}
                          to={`/admin/orders/${order.id}`}
                          size="sm"
                          bg="#79b74a"
                          color="white"
                          _hover={{ bg: "#6aa23c" }}
                        >
                          Открыть
                        </Button>
                      </Table.Cell>
                    </Table.Row>
                  ))
                ) : (
                  <Table.Row>
                    <Table.Cell
                      colSpan={6}
                      textAlign="center"
                      py="20px"
                      color="gray.500"
                    >
                      {error ? "Ошибка загрузки данных" : "Заказы не найдены"}
                    </Table.Cell>
                  </Table.Row>
                )}
              </Table.Body>
            </Table.Root>
          </Box>

          {/* Pagination */}
          {Array.isArray(orders) && orders.length > 0 && totalPages > 1 && (
            <Flex justify="space-between" align="center" mt="20px">
              <Text fontSize="sm" color="gray.600">
                Показано {(currentPage - 1) * itemsPerPage + 1}-
                {Math.min(currentPage * itemsPerPage, totalOrders)} из{" "}
                {totalOrders} записей
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

                <Button
                  disabled={currentPage === totalPages}
                  size="sm"
                  variant="outline"
                  onClick={() => handlePageChange(currentPage + 1)}
                  _disabled={{ opacity: 0.4, cursor: "not-allowed" }}
                >
                  →
                </Button>
              </HStack>
            </Flex>
          )}
        </>
      )}
    </Box>
  );
}
