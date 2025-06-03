import {
  Box,
  Flex,
  Heading,
  Table,
  HStack,
  Text,
  Badge,
  Button,
  createListCollection,
} from "@chakra-ui/react";
import {
  SelectRoot,
  SelectItem,
  SelectTrigger,
  SelectContent,
  SelectValueText,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import { AuditLogService } from "../../services/AuditLogService";
import type { AuditLog } from "../../contexts/AdminContext";

export default function AuditLogPage() {
  const [searchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [entityFilter, setEntityFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableActions, setAvailableActions] = useState<string[]>([]);
  const [availableResourceTypes, setAvailableResourceTypes] = useState<
    string[]
  >([]);

  const actionOptions = createListCollection({
    items: [
      { label: "Все действия", value: "" },
      ...availableActions.map((action) => ({ label: action, value: action })),
    ],
  });

  const entityOptions = createListCollection({
    items: [
      { label: "Все сущности", value: "" },
      ...availableResourceTypes.map((type) => ({ label: type, value: type })),
    ],
  });

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);

      const filters: any = {};
      if (actionFilter) filters.action = actionFilter;
      if (entityFilter) filters.targetResourceType = entityFilter;
      if (searchQuery) {
      }

      const result = await AuditLogService.list(currentPage, 10, filters);
      setLogs(result.data);
      setPagination(result.pagination);
    } catch (err) {
      setError("Ошибка загрузки журнала аудита");
      console.error("Error fetching audit logs:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFilterOptions = async () => {
    try {
      const [actions, resourceTypes] = await Promise.all([
        AuditLogService.getActions(),
        AuditLogService.getResourceTypes(),
      ]);
      setAvailableActions(actions);
      setAvailableResourceTypes(resourceTypes);
    } catch (err) {
      console.error("Error fetching filter options:", err);
    }
  };

  useEffect(() => {
    fetchFilterOptions();
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [currentPage, actionFilter, entityFilter]);

  useEffect(() => {
    // Debounce search
    const timeoutId = setTimeout(() => {
      if (currentPage === 1) {
        fetchLogs();
      } else {
        setCurrentPage(1);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleActionFilterChange = (value: string) => {
    setActionFilter(value);
    setCurrentPage(1);
  };

  const handleEntityFilterChange = (value: string) => {
    setEntityFilter(value);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= pagination.totalPages) {
      setCurrentPage(page);
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (pagination.totalPages <= maxVisiblePages) {
      for (let i = 1; i <= pagination.totalPages; i++) {
        pages.push(i);
      }
    } else {
      let startPage = Math.max(1, currentPage - 2);
      let endPage = Math.min(pagination.totalPages, currentPage + 2);

      if (currentPage <= 3) {
        endPage = Math.min(pagination.totalPages, 5);
      }

      if (currentPage >= pagination.totalPages - 2) {
        startPage = Math.max(1, pagination.totalPages - 4);
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }

    return pages;
  };

  const getActionBadge = (action: string) => {
    const actionColors: { [key: string]: { bg: string; color: string } } = {
      create: { bg: "#f6ffed", color: "#52c41a" },
      update: { bg: "#fffbe6", color: "#faad14" },
      delete: { bg: "#fff2f0", color: "#ff4d4f" },
      login: { bg: "#e6f7ff", color: "#1890ff" },
      logout: { bg: "#f0f0f0", color: "#666" },
      block: { bg: "#fff2f0", color: "#ff4d4f" },
      unblock: { bg: "#f6ffed", color: "#52c41a" },
    };

    const colors = actionColors[action.toLowerCase()] || {
      bg: "#f0f0f0",
      color: "#333",
    };

    return (
      <Badge
        px="8px"
        py="4px"
        borderRadius="12px"
        fontSize="11px"
        fontWeight="600"
        bg={colors.bg}
        color={colors.color}
      >
        {action}
      </Badge>
    );
  };

  if (loading && logs.length === 0) {
    return (
      <Box>
        <Text>Загрузка...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Text color="red.500">{error}</Text>
        <Button onClick={fetchLogs} mt={4}>
          Повторить
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Heading size="lg" mb="25px" fontWeight="600">
        Журнал аудита
      </Heading>

      <Flex mb="20px" gap="15px" align="center" wrap="wrap">
        <Flex align="center" gap="8px">
          <Text fontSize="14px" color="#555">
            Действие:
          </Text>
          <SelectRoot
            collection={actionOptions}
            value={actionFilter ? [actionFilter] : [""]}
            onValueChange={(details) =>
              handleActionFilterChange(details.value[0] || "")
            }
            w="200px"
          >
            <SelectTrigger
              border="1px solid #ccc"
              borderRadius="5px"
              bg="white"
              fontSize="14px"
            >
              <SelectValueText placeholder="Все действия" />
            </SelectTrigger>
            <SelectContent>
              {actionOptions.items.map(
                (item: { label: string; value: string }) => (
                  <SelectItem key={item.value} item={item}>
                    {item.label}
                  </SelectItem>
                )
              )}
            </SelectContent>
          </SelectRoot>
        </Flex>

        <Flex align="center" gap="8px">
          <Text fontSize="14px" color="#555">
            Сущность:
          </Text>
          <SelectRoot
            collection={entityOptions}
            value={entityFilter ? [entityFilter] : [""]}
            onValueChange={(details) =>
              handleEntityFilterChange(details.value[0] || "")
            }
            w="150px"
          >
            <SelectTrigger
              border="1px solid #ccc"
              borderRadius="5px"
              bg="white"
              fontSize="14px"
            >
              <SelectValueText placeholder="Все сущности" />
            </SelectTrigger>
            <SelectContent>
              {entityOptions.items.map(
                (item: { label: string; value: string }) => (
                  <SelectItem key={item.value} item={item}>
                    {item.label}
                  </SelectItem>
                )
              )}
            </SelectContent>
          </SelectRoot>
        </Flex>
      </Flex>

      <Box
        bg="white"
        boxShadow="0 1px 3px rgba(0,0,0,0.05)"
        borderRadius="md"
        overflow="hidden"
      >
        <Table.Root size="sm">
          <Table.Header>
            <Table.Row bg="#f8f9fa">
              <Table.ColumnHeader fontWeight="600" color="#333" fontSize="12px">
                Время
              </Table.ColumnHeader>
              <Table.ColumnHeader fontWeight="600" color="#333" fontSize="12px">
                Действие
              </Table.ColumnHeader>
              <Table.ColumnHeader fontWeight="600" color="#333" fontSize="12px">
                Тип ресурса
              </Table.ColumnHeader>
              <Table.ColumnHeader fontWeight="600" color="#333" fontSize="12px">
                ID ресурса
              </Table.ColumnHeader>
              <Table.ColumnHeader fontWeight="600" color="#333" fontSize="12px">
                ID Пользователя
              </Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {logs.map((log, index) => (
              <Table.Row
                key={log.id}
                css={{
                  "&:hover": { bg: "#f5f5f5" },
                }}
                borderBottom={
                  index === logs.length - 1 ? "none" : "1px solid #eee"
                }
              >
                <Table.Cell fontSize="12px" color="#555">
                  {new Date(log.timestamp).toLocaleString("ru-RU")}
                </Table.Cell>
                <Table.Cell>{getActionBadge(log.action)}</Table.Cell>
                <Table.Cell fontSize="12px">
                  {log.targetResourceType}
                </Table.Cell>
                <Table.Cell fontSize="12px" fontFamily="mono" color="#1890ff">
                  {log.targetResourceId}
                </Table.Cell>
                <Table.Cell fontSize="12px">{log.userId}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Box>

      {logs.length === 0 && !loading && (
        <Box textAlign="center" py="40px" color="#666">
          <Text>Записи не найдены</Text>
        </Box>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <Flex justify="space-between" align="center" mt="20px">
          <Text fontSize="sm" color="#666">
            Показано {(currentPage - 1) * pagination.itemsPerPage + 1}-
            {Math.min(
              currentPage * pagination.itemsPerPage,
              pagination.totalItems
            )}{" "}
            из {pagination.totalItems} записей
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

            {pagination.totalPages > 5 &&
              currentPage < pagination.totalPages - 2 && (
                <>
                  <Text>...</Text>
                  <Button
                    size="sm"
                    variant="outline"
                    color="#79b74a"
                    borderColor="#ddd"
                    onClick={() => handlePageChange(pagination.totalPages)}
                  >
                    {pagination.totalPages}
                  </Button>
                </>
              )}

            <Button
              disabled={currentPage === pagination.totalPages}
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
    </Box>
  );
}
