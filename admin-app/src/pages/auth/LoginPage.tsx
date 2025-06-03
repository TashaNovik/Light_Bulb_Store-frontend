import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Heading,
  Input,
  VStack,
  Text,
  Alert,
} from "@chakra-ui/react";
import { Field } from "@/components/ui/field";
import { useAdminContext } from "../../components/AdminProvider/AdminProvider";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, isAuthenticated, isLoading } = useAdminContext();
  const navigate = useNavigate();
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate("/admin/products");
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Don't render login form if already authenticated
  if (isAuthenticated) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const success = await login(username, password);
      if (success) {
        navigate("/admin/products");
      } else {
        setError("Неверный логин или пароль");
      }
    } catch (err) {
      setError("Ошибка подключения к серверу");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Box
        minH="100vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
        bg="#fcfaf6"
      >
        <Text>Загрузка...</Text>
      </Box>
    );
  }

  return (
    <Box display="flex" alignItems="center" justifyContent="center" p="20px">
      <Box
        bg="white"
        p="40px"
        borderRadius="8px"
        boxShadow="0 2px 10px rgba(0,0,0,0.1)"
        w="100%"
        maxW="400px"
      >
        <VStack gap="25px" align="stretch">
          <Box textAlign="center">
            <Heading size="lg" mb="10px" color="#333">
              Панель администратора
            </Heading>
            <Text color="#666" fontSize="14px">
              Войдите в систему для управления магазином
            </Text>
          </Box>
          {error && (
            <Alert.Root status="error" borderRadius="5px">
              {error}
            </Alert.Root>
          )}
          <form onSubmit={handleSubmit}>
            <VStack gap="20px" align="stretch">
              <Field required label="Логин" fontWeight={600}>
                <Input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Введите логин"
                  border="1px solid #ccc"
                  borderRadius="5px"
                  disabled={isSubmitting}
                />
              </Field>
              <Field required label="Пароль" fontWeight={600}>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Введите пароль"
                  border="1px solid #ccc"
                  borderRadius="5px"
                  disabled={isSubmitting}
                />
              </Field>{" "}
              <Button
                type="submit"
                bg="#79b74a"
                color="white"
                _hover={{ bg: "#6aa23c" }}
                _disabled={{ opacity: 0.6, cursor: "not-allowed" }}
                disabled={isSubmitting || !username || !password}
                size="lg"
                mt="10px"
              >
                {isSubmitting ? "Вход..." : "Войти"}
              </Button>
            </VStack>
          </form>{" "}
          <Box textAlign="center" mt="15px">
            <Text
              as="button"
              onClick={() => navigate("/password-reset")}
              color="#79b74a"
              fontSize="14px"
              textDecoration="underline"
              cursor="pointer"
              _hover={{ color: "#6aa23c" }}
              bg="transparent"
              border="none"
            >
              Забыли пароль?
            </Text>
          </Box>
        </VStack>
      </Box>
    </Box>
  );
}
