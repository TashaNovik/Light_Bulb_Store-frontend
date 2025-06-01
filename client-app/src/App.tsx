import { Routes, Route } from "react-router-dom";
import ProductDetailPage from "./pages/ProductDetailPage";
import AboutPage from "./pages/AboutPage";
import MainPage from "./pages/MainPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderConfirmationPage from "./pages/OrderConfirmationPage";
import DeliveryPage from "./pages/DeliveryPage";
import PaymentPage from "./pages/PaymentPage";
import ManufacturerPage from "./pages/ManufacturerPage";
import ContactsPage from "./pages/ContactsPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { Flex, Box } from "@chakra-ui/react";
import { ProductProvider } from "./contexts/ProductContext";
import { CartProvider } from "./contexts/CartContext";
import { SearchProvider } from "./contexts/SearchContext";
import { Toaster } from "./components/ui/toaster";

function App() {
  return (
    <ProductProvider>
      <CartProvider>
        <SearchProvider>
          <Flex direction="column" minH="100vh">
            <Header />
            <Box flex="1">
              <Routes>
                <Route path="/" element={<MainPage />} />
                <Route path="/products/:id" element={<ProductDetailPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route
                  path="/order-confirmation"
                  element={<OrderConfirmationPage />}
                />
                <Route path="/delivery" element={<DeliveryPage />} />
                <Route path="/payment" element={<PaymentPage />} />
                <Route path="/manufacturer" element={<ManufacturerPage />} />
                <Route path="/contacts" element={<ContactsPage />} />
                <Route path="/admin/login" element={<AdminLoginPage />} />
                <Route
                  path="/admin/dashboard"
                  element={<AdminDashboardPage />}
                />
              </Routes>
            </Box>
            <Footer />
          </Flex>
          <Toaster />
        </SearchProvider>
      </CartProvider>
    </ProductProvider>
  );
}

export default App;
