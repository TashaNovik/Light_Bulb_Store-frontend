import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { useCartContext } from "../contexts/CartContext";
import { useProductContext } from "../contexts/ProductContext";
import { useSearchContext } from "../contexts/SearchContext";
import {
  Box,
  Container,
  SimpleGrid,
  Card,
  Image,
  Text,
  VStack,
  HStack,
  Heading,
  IconButton,
  Spinner,
  Alert,
} from "@chakra-ui/react";
import { toaster } from "../components/ui/toaster";

const MainPage: React.FC = () => {
  const { addItem } = useCartContext();
  const { products, loading, error, searchProducts } = useProductContext();
  const { searchQuery, isSearchActive } = useSearchContext();

  // Filter products based on search query
  const displayedProducts = useMemo(() => {
    if (isSearchActive) {
      return searchProducts(searchQuery);
    }
    return products;
  }, [products, searchQuery, isSearchActive, searchProducts]);

  // Add to cart functionality using shared context
  const addToCart = (product: (typeof products)[0]) => {
    console.log("Adding to cart:", product);
    addItem({
      id: product.id,
      name: product.name,
      price: product.current_price,
      image: product.image_url,
    });
    toaster.create({
      title: "Товар добавлен в корзину",
      description: product.name,
      duration: 3000,
      type: "success",
    });
  };

  if (loading) {
    return (
      <Box
        as="main"
        className="page-main"
        display="flex"
        justifyContent="center"
        alignItems="center"
        minH="400px"
      >
        <VStack gap={4}>
          <Spinner size="xl" color="red.500" />
          <Text>Загрузка товаров...</Text>
        </VStack>
      </Box>
    );
  }

  if (error) {
    return (
      <Box as="main" className="page-main" py={6}>
        <Container maxW="1200px">
          <Alert.Root status="error">
            <Alert.Indicator />
            <Alert.Title>Ошибка загрузки</Alert.Title>
            <Alert.Description>{error}</Alert.Description>
          </Alert.Root>
        </Container>
      </Box>
    );
  }
  return (
    <Box as="main" className="page-main">
      <Container className="container" maxW="1200px">
        <Box as="section" className="catalog">
          {isSearchActive && (
            <Box py={4}>
              <Text fontSize="lg" color="gray.600">
                Результаты поиска для "{searchQuery}":{" "}
                {displayedProducts.length} товар(ов)
              </Text>
            </Box>
          )}

          {displayedProducts.length === 0 && isSearchActive ? (
            <Box py={8} textAlign="center">
              <Text fontSize="lg" color="gray.500">
                По запросу "{searchQuery}" ничего не найдено
              </Text>
              <Text fontSize="md" color="gray.400" mt={2}>
                Попробуйте изменить поисковый запрос
              </Text>
            </Box>
          ) : (
            <SimpleGrid
              className="product-grid"
              columns={{ base: 2, md: 3, lg: 4, xl: 5 }}
              gap={6}
              py={6}
            >
              {displayedProducts.map((product) => (
                <Card.Root
                  key={product.id}
                  className="product-card"
                  variant="elevated"
                  size="sm"
                  bg="white"
                  border="1px solid"
                  borderColor="gray.300"
                  _hover={{
                    borderColor: "blue.500",
                    transform: "translateY(-2px)",
                  }}
                  transition="all 0.2s"
                  data-product-id={product.id}
                  data-name={product.name}
                  data-price={product.current_price}
                  data-image={product.image_url}
                >
                  <Card.Body p={4}>
                    <VStack gap={3} align="stretch">
                      <Box className="product-image-link" cursor="pointer">
                        <Image
                          className="product-image"
                          src={product.image_url}
                          alt={product.alt}
                          width="146px"
                          height="146px"
                          objectFit="contain"
                          mx="auto"
                          display="block"
                        />
                      </Box>

                      <VStack gap={2} className="product-info" align="stretch">
                        <Link
                          to={`/products/${product.id}`}
                          style={{ textDecoration: "none" }}
                        >
                          <Heading
                            className="product-title"
                            size="sm"
                            textAlign="center"
                            color="gray.800"
                            _hover={{ color: "blue.500" }}
                            cursor="pointer"
                          >
                            {product.name}
                          </Heading>
                        </Link>

                        <HStack
                          className="product-buy"
                          justify="space-between"
                          align="center"
                        >
                          <Text
                            className="product-price"
                            fontWeight="bold"
                            fontSize="md"
                            color="gray.800"
                          >
                            {product.current_price.toLocaleString("ru-RU")} руб
                          </Text>
                          <IconButton
                            className="add-to-cart-button"
                            onClick={() => addToCart(product)}
                            variant="ghost"
                            size="sm"
                            colorPalette="blue"
                            aria-label="Добавить в корзину"
                            _hover={{ bg: "blue.50" }}
                          >
                            <Image
                              src="/assets/icons/cart.svg"
                              alt=""
                              width="24px"
                              height="24px"
                              className="cart-icon"
                            />
                          </IconButton>
                        </HStack>
                      </VStack>
                    </VStack>
                  </Card.Body>
                </Card.Root>
              ))}
            </SimpleGrid>
          )}
        </Box>
      </Container>
    </Box>
  );
};

export default MainPage;
