import {
  Box,
  Button,
  Flex,
  Heading,
  Input,
  Table,
  HStack,
  Text,
  Badge,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AdminUserService } from "../../services/AdminUserService";
import type { AdminUser } from "../../contexts/AdminContext";
import { AlertDialog } from "../../components/ui/alert-dialog";

export default function AdminUsersPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // AlertDialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<AdminUser | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await AdminUserService.list(currentPage, 10, searchQuery);
      setAdmins(result.data);
      setPagination(result.pagination);
    } catch (err) {
      setError("Ошибка загрузки администраторов");
      console.error("Error fetching admins:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, [currentPage, searchQuery]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= pagination.totalPages) {
      setCurrentPage(page);
    }
  };
  const handleStatusToggle = (admin: AdminUser) => {
    setSelectedAdmin(admin);
    setIsDialogOpen(true);
  };

  const handleConfirmStatusToggle = async () => {
    if (!selectedAdmin) return;

    const newStatus = !selectedAdmin.isActive;

    try {
      setIsUpdating(true);
      await AdminUserService.updateStatus(selectedAdmin.id, newStatus);
      await fetchAdmins(); // Refresh the list
      setIsDialogOpen(false);
      setSelectedAdmin(null);
    } catch (err) {
      console.error("Error updating admin status:", err);
      alert("Ошибка при изменении статуса администратора");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelStatusToggle = () => {
    setIsDialogOpen(false);
    setSelectedAdmin(null);
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

  const getStatusBadge = (isActive: boolean) => {
    if (isActive) {
      return (
        <Badge
          px="8px"
          py="4px"
          borderRadius="12px"
          fontSize="12px"
          fontWeight="600"
          bg="#f6ffed"
          color="#52c41a"
          border="1px solid #b7eb8f"
        >
          Активен
        </Badge>
      );
    } else {
      return (
        <Badge
          px="8px"
          py="4px"
          borderRadius="12px"
          fontSize="12px"
          fontWeight="600"
          bg="#fff2f0"
          color="#ff4d4f"
          border="1px solid #ffccc7"
        >
          Заблокирован
        </Badge>
      );
    }
  };

  if (loading && admins.length === 0) {
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
        <Button onClick={fetchAdmins} mt={4}>
          Повторить
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Flex justify="space-between" align="center" mb="25px">
        <Heading size="lg" fontWeight="600">
          Администраторы
        </Heading>
        <Button
          bg="#79b74a"
          color="white"
          _hover={{ bg: "#6aa23c" }}
          onClick={() => navigate(`/admin/users/new/`)}
        >
          Добавить администратора
        </Button>
      </Flex>
      <Box mb="20px">
        <Input
          placeholder="Поиск по имени, email..."
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
              <Table.ColumnHeader fontWeight="600" color="#333">
                Имя пользователя
              </Table.ColumnHeader>
              <Table.ColumnHeader fontWeight="600" color="#333">
                ФИО
              </Table.ColumnHeader>
              <Table.ColumnHeader fontWeight="600" color="#333">
                Email
              </Table.ColumnHeader>
              <Table.ColumnHeader fontWeight="600" color="#333">
                Статус
              </Table.ColumnHeader>
              <Table.ColumnHeader fontWeight="600" color="#333">
                Действия
              </Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {admins.map((admin, index) => (
              <Table.Row
                key={admin.id}
                _hover={{ bg: "#f5f5f5" }}
                borderBottom={
                  index === admins.length - 1 ? "none" : "1px solid #eee"
                }
              >
                <Table.Cell>{admin.username}</Table.Cell>
                <Table.Cell>
                  {`${admin.firstName} ${admin.lastName}`.trim() || "-"}
                </Table.Cell>
                <Table.Cell>{admin.email}</Table.Cell>
                <Table.Cell>{getStatusBadge(admin.isActive)}</Table.Cell>
                <Table.Cell>
                  <HStack gap="5px">
                    <Button
                      size="sm"
                      bg="#ffc107"
                      color="#333"
                      border="1px solid #ffc107"
                      _hover={{ bg: "#e0a800" }}
                      onClick={() => navigate(`/admin/users/${admin.id}/edit`)}
                    >
                      Редактировать
                    </Button>
                    <Button
                      size="sm"
                      bg={admin.isActive ? "#dc3545" : "#28a745"}
                      color="white"
                      border={`1px solid ${
                        admin.isActive ? "#dc3545" : "#28a745"
                      }`}
                      _hover={{ bg: admin.isActive ? "#c82333" : "#218838" }}
                      onClick={() => handleStatusToggle(admin)}
                    >
                      {admin.isActive ? "Заблокировать" : "Разблокировать"}
                    </Button>
                  </HStack>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Box>
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
          </HStack>{" "}
        </Flex>
      )}{" "}
      {/* AlertDialog for status confirmation */}
      <AlertDialog
        open={isDialogOpen}
        onOpenChange={(details) => setIsDialogOpen(details.open)}
        title="Подтверждение действия"
        description={
          selectedAdmin
            ? `Вы уверены, что хотите ${
                selectedAdmin.isActive ? "заблокировать" : "разблокировать"
              } администратора ${selectedAdmin.username}?`
            : ""
        }
        confirmText={
          selectedAdmin?.isActive ? "Заблокировать" : "Разблокировать"
        }
        cancelText="Отмена"
        colorScheme={selectedAdmin?.isActive ? "red" : "green"}
        onConfirm={handleConfirmStatusToggle}
        onCancel={handleCancelStatusToggle}
        isLoading={isUpdating}
      />
    </Box>
  );
}
