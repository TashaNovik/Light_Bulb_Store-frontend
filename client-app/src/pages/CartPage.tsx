import React from "react";
import { Link } from "react-router";
import { 
  Box, 
  Container, 
  Flex, 
  Heading, 
  VStack, 
  HStack, 
  Image, 
  Text, 
  Button, 
  Badge,
  Separator,
  Card
} from "@chakra-ui/react";
import { LuMinus, LuPlus, LuX } from "react-icons/lu"; 
import { useCartContext } from "../contexts/CartContext";

const CartPage: React.FC = () => {
  const { cartItems, updateQuantity, removeItem } = useCartContext();
  console.log("Cart items:", cartItems);
  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('ru-RU') + ' руб';
  };

  if (cartItems.length === 0) {
    return (
      <Box bg="bg.canvas" py={6}>
        <Container maxW="6xl">
          <VStack gap={8} textAlign="center">
            <Heading size="xl" color="gray.700">
              Корзина пуста
            </Heading>
            <Text color="gray.500" fontSize="lg">
              Добавьте товары в корзину, чтобы оформить заказ
            </Text>
            <Link to="/">
              <Button
                size="lg"
                colorPalette="red"
                px={8}
              >
                Перейти к покупкам
              </Button>
            </Link>
          </VStack>
        </Container>
      </Box>
    );
  }

  return (
    <Box as="main" py={6}>
      <Container maxW="6xl">
        <Flex justify="space-between" align="center" mb={8}>
          <Heading size="xl" color="gray.800">
            Корзина ({cartItems.length})
          </Heading>
          <Link to="/">
            <Button
              variant="ghost"
              size="lg"
              colorPalette="gray"
              aria-label="Вернуться к покупкам"
            >
              <LuX />
            </Button>
          </Link>
        </Flex>

        <VStack gap={4} align="stretch">
          {cartItems.map((item) => (
            <Card.Root key={item.id} variant="outline" bg="white" border={"0.5px solid"} borderColor="gray.400">
              <Card.Body p={6}>
                <Flex gap={6} align="center">
                  <Box
                    flexShrink={0}
                    borderRadius="lg"
                    overflow="hidden"
                    bg="gray.100"
                  >
                    <Image
                      src={item.image}
                      alt={item.name}
                      boxSize="120px"
                      objectFit="cover"
                    />
                  </Box>
                  
                  <Box flex="1">
                    <Heading size="lg" mb={3} color="gray.800" lineHeight="shorter">
                      {item.name}
                    </Heading>
                    
                    <Flex align="center" gap={3}>
                      <Button
                        size="sm"
                        variant="outline"
                        colorPalette="red"
                        onClick={() => updateQuantity(item.id, -1)}
                        disabled={item.quantity <= 1}
                        aria-label="Уменьшить количество"
                      >
                        <LuMinus />
                      </Button>
                      
                      <Badge
                        px={4}
                        py={2}
                        colorPalette="blue"
                        variant="subtle"
                        borderRadius="md"
                        fontSize="md"
                        fontWeight="semibold"
                        textAlign="center"
                      >
                        {item.quantity}
                      </Badge>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        colorPalette="red"
                        onClick={() => updateQuantity(item.id, 1)}
                        aria-label="Увеличить количество"
                      >
                        <LuPlus />
                      </Button>
                    </Flex>
                  </Box>
                  
                  <VStack alignItems="end" gap={3} flexShrink={0}>
                    <VStack gap={1} alignItems="end">
                      <Text fontSize="lg" fontWeight="semibold" color="gray.700">
                        {formatPrice(item.price)}/шт
                      </Text>
                      <Text fontSize="xl" fontWeight="bold" color="red.500">
                        {formatPrice(item.price * item.quantity)}
                      </Text>
                    </VStack>
                    
                    <Button
                      size="sm"
                      variant="ghost"
                      colorPalette="red"
                      onClick={() => removeItem(item.id)}
                      aria-label="Удалить товар из корзины"
                      _hover={{ bg: "red.50" }}
                    >
                      <LuX />
                    </Button>
                  </VStack>
                </Flex>
              </Card.Body>
            </Card.Root>
          ))}
        </VStack>

        <Separator my={8} borderWidth="0.5px" borderColor="gray.200"/>

        <Card.Root variant="outline" bg="white"  border={"0.5px solid"} borderColor="gray.400" mb={6}>
          <Card.Body p={6}>
            <Flex justify="space-between" align="center">
              <Text fontSize="2xl" fontWeight="bold" color="gray.800">
                Итого к оплате:
              </Text>
              <Text fontSize="3xl" fontWeight="bold" color="red.500">
                {formatPrice(getTotalPrice())}
              </Text>
            </Flex>
          </Card.Body>
        </Card.Root>

        <HStack gap={4} justify="center" flexWrap="wrap">
          <Link to="/">
            <Button
              size="lg"
              variant="outline"
              colorPalette="gray"
              borderColor="gray.300"
              minW="220px"
              px={8}
              py={6}
            >
              Продолжить покупки
            </Button>
          </Link>
          <Link to="/checkout">
            <Button
              size="lg"
              colorPalette="red"
              minW="220px"
              px={8}
              py={6}
            >
              Оформить заказ
            </Button>
          </Link>
        </HStack>
      </Container>
    </Box>
  );
};

export default CartPage;
