import { Box, Flex, Text, Button, Image } from "@chakra-ui/react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { useAdminContext } from "../AdminProvider/AdminProvider";
import { Link } from "react-router";

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { adminUser, logout } = useAdminContext();
  const navItems = [
    { path: "/admin/orders", label: "Заказы" },
    { path: "/admin/products", label: "Товары" },
    { path: "/admin/users", label: "Администраторы" },
    { path: "/admin/audit-log", label: "Журнал аудита" },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const displayName = adminUser
    ? `${adminUser.firstName || ""} ${adminUser.lastName || ""}`.trim() ||
      adminUser.username
    : "Администратор";

  return (
    <Flex minH="100vh" bg="#fcfaf6">
      {/* Sidebar */}
      <Box
        minWidth="340px"
        maxWidth="340px"
        bg="#f8f5f0"
        p="20px 0"
        borderRight="1px solid #e0dcd5"
      >
        {/* Logo */}
        <Flex
          align="center"
          px="20px"
          pb="20px"
          mb="20px"
          borderBottom="1px solid #e0dcd5"
          h="57px"
        >
          <Link to="/" className="logo header-logo">
            <Image
              src="/assets/icons/logolampa.png"
              alt="Логотип Лампочка"
              height="40px"
            />
          </Link>
        </Flex>

        {/* Navigation */}
        <Box>
          {navItems.map((item) => (
            <Button
              key={item.path}
              w="calc(100% - 20px)"
              mx="10px"
              mb="5px"
              justifyContent="flex-start"
              bg={isActive(item.path) ? "#e9f5e9" : "transparent"}
              color={isActive(item.path) ? "#79b74a" : "#555"}
              fontWeight={isActive(item.path) ? "600" : "400"}
              _hover={{ bg: "#e9f5e9", color: "#79b74a" }}
              borderRadius="5px"
              onClick={() => navigate(item.path)}
            >
              {item.label}
            </Button>
          ))}
        </Box>
      </Box>

      {/* Main Content */}
      <Flex direction="column" flex="1">
        {/* Header */}
        <Flex
          justify="space-between"
          align="center"
          bg="white"
          px="30px"
          py="20px"
          borderBottom="1px solid #e0dcd5"
        >
          <Text fontSize="20px" fontWeight="600" color="#333">
            Панель администратора
          </Text>
          <Flex align="center">
            <Text mr="15px" color="#555">
              {displayName}
            </Text>
            <Button
              size="sm"
              bg="#e55335"
              color="white"
              _hover={{ bg: "#c8432b" }}
              onClick={handleLogout}
            >
              Выход
            </Button>
          </Flex>
        </Flex>

        {/* Content Area */}
        <Box p="30px" flex="1" overflowY="auto">
          <Outlet />
        </Box>
      </Flex>
    </Flex>
  );
}
