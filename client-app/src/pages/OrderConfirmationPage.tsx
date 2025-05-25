import React, { useState, useEffect } from "react";
import { Link } from "react-router";
import {
  Box,
  Container,
  VStack,
  Heading,
  Text,
  Button,
  Image
} from "@chakra-ui/react";
import { type Order } from "../services/api";

const OrderConfirmationPage: React.FC = () => {
  const [orderData, setOrderData] = useState<Order | null>(null);
  console.log("order data:", orderData);

  useEffect(() => {
    // Get order data from localStorage
    const savedOrderData = localStorage.getItem('orderData');
    if (savedOrderData) {
      try {
        const parsedOrder = JSON.parse(savedOrderData);
        setOrderData(parsedOrder);
      } catch (error) {
        console.error('Error parsing order data:', error);
      }
    }
  }, []);

  if (!orderData) {
    return (
      <Box as="main" py={20} minH="60vh" display="flex" alignItems="center" justifyContent="center">
        <Container maxW="500px">
          <Box bg="white" p={10} borderRadius="lg" textAlign="center" shadow="sm" border="1px solid" borderColor="gray.200">
            <Text>Загрузка данных заказа...</Text>
          </Box>
        </Container>
      </Box>
    );
  }

  return (
    <> 
      {/* Main Content */}
      <Box 
        as="main" 
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        py={20}
        minH="60vh"
      >
        <Container maxW="600px">
          <Box
            bg="white"
            p={10}
            borderRadius="lg"
            textAlign="center"
            shadow="sm"
            border="1px solid"
            borderColor="gray.200"
          >
            <VStack gap={6}>
              {/* Success Icon */}
              <Box>
                <Image 
                  src="/assets/icons/success_done.svg" 
                  alt="Заказ успешно оформлен"
                  w="80px"
                  h="80px"
                />
              </Box>

              {/* Title */}
              <Heading 
                as="h1" 
                size="lg" 
                color="gray.800"
                fontWeight="semibold"
              >
                Спасибо, ваш заказ оформлен!
              </Heading>

              {/* Order Info */}
              <Box textAlign="left" w="100%" p={4} bg="gray.50" borderRadius="md">
                <VStack gap={3} align="stretch">
                  <Text fontSize="lg" fontWeight="semibold">
                    Номер заказа: {orderData.order_number}
                  </Text>
                  
                  <Text>
                    <Text as="span" fontWeight="medium">Клиент:</Text> {orderData.customer_name}
                  </Text>
                  
                  <Text>
                    <Text as="span" fontWeight="medium">Email:</Text> {orderData.customer_email}
                  </Text>
                  
                  <Text>
                    <Text as="span" fontWeight="medium">Телефон:</Text> {orderData.customer_phone}
                  </Text>

                  <Text>
                    <Text as="span" fontWeight="medium">Адрес доставки:</Text>{" "}
                    {orderData.shipping_address
                      ? `${orderData.shipping_address.city}, ${orderData.shipping_address.street_address}, ${orderData.shipping_address.apartment || ""}
                        , ${orderData.shipping_address.postal_code || ""}, ${orderData.shipping_address.address_notes || ""}`.replace(/,\s*$/, "")
                      : "Самовывоз из магазина"}
                  </Text>

                  <Text>
                    <Text as="span" fontWeight="medium">Сумма заказа:</Text> {Number(orderData.total_amount).toFixed(2)} ₽
                  </Text>
                </VStack>
              </Box>

              {/* Items List */}
              <Box w="100%">
                <Heading size="md" mb={3}>Товары в заказе:</Heading>
                <VStack gap={2} align="stretch">
                  {orderData.items.map((item) => (
                    <Box key={item.id} p={3} bg="gray.50" borderRadius="md">
                      <Text>
                        <Text as="span" fontWeight="medium">{item.product_snapshot_name}</Text>{" "}
                        × {item.quantity} шт. = {Number(item.subtotal_amount).toFixed(2)} ₽
                      </Text>
                    </Box>
                  ))}
                </VStack>
              </Box>

              {/* Action Button */}
              <Box pt={4}>
                <Button
                  as={Link}
                  to="/"
                  bg="#4CAF50"
                  color="white"
                  size="lg"
                  px={8}
                  py={3}
                  borderRadius="md"
                  fontWeight="medium"
                  _hover={{
                    bg: "#45a049"
                  }}
                  _active={{
                    bg: "#45a049"
                  }}
                >
                  Продолжить покупки
                </Button>
              </Box>
            </VStack>
          </Box>
        </Container>
      </Box>
    </>
  );
};

export default OrderConfirmationPage;