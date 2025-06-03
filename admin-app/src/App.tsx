import { Routes, Route } from "react-router-dom";
import { Box } from "@chakra-ui/react";
import { Toaster } from "./components/ui/toaster";

// Auth pages
import PasswordResetRequest from "./pages/auth/PasswordResetRequest";
import PasswordChange from "./pages/auth/PasswordChange";

// Admin dashboard pages
import ProductsPage from "./pages/admin/ProductsPage";
import AddProductPage from "./pages/admin/AddProductPage";
import EditProductPage from "./pages/admin/EditProductPage";
import OrdersPage from "./pages/admin/OrdersPage";
import OrderDetailPage from "./pages/admin/OrderDetailPage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import AddAdminUserPage from "./pages/admin/AddAdminUserPage";
import EditAdminUserPage from "./pages/admin/EditAdminUserPage";
import AuditLogPage from "./pages/admin/AuditLogPage";
import LoginPage from "./pages/auth/LoginPage";

// Layout components
import AdminLayout from "./components/layout/AdminLayout";
import AuthLayout from "./components/layout/AuthLayout";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Box>
      <Routes>
        {/* Auth routes */}
        <Route path="/" element={<AuthLayout />}>
          <Route index element={<LoginPage />} />
          <Route path="password-reset" element={<PasswordResetRequest />} />
          <Route path="password-change" element={<PasswordChange />} />
        </Route>

        {/* Admin routes - all protected */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<ProductsPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="products/new" element={<AddProductPage />} />
          <Route path="products/:id/edit" element={<EditProductPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="orders/:id" element={<OrderDetailPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="users/new" element={<AddAdminUserPage />} />
          <Route path="users/:id/edit" element={<EditAdminUserPage />} />
          <Route path="audit-log" element={<AuditLogPage />} />
        </Route>

        {/* Catch all route - redirect to login */}
        <Route path="*" element={<LoginPage />} />
      </Routes>
      <Toaster />
    </Box>
  );
}

export default App;
