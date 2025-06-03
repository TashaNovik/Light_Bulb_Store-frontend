import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAdminContext } from "./AdminProvider/AdminProvider";
import { Text, Flex } from "@chakra-ui/react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAdminContext();
  const location = useLocation();

  if (isLoading) {
    return (
      <Flex minH="100vh" align="center" justify="center" bg="#fcfaf6">
        <Text>Загрузка...</Text>
      </Flex>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login page, but save the current location
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
