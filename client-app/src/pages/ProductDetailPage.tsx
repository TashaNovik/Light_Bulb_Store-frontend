import {
    Box,
    Flex,
    VStack,
    Image,
    Text,
    Heading,
    Button, 
    Container,
    Spacer,
    Spinner,
    Alert,
  } from '@chakra-ui/react'; 
import { useParams, useNavigate } from 'react-router-dom';
import { useCartContext } from '../contexts/CartContext';
import { useProductContext } from '../contexts/ProductContext';
import Breadcrumbs from '../components/Breadcrumbs/Breadcrumbs';
import { toaster } from "../components/ui/toaster";

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem } = useCartContext();
  const { getProductById, loading, error } = useProductContext();

  const product = id ? getProductById(id) : undefined;

  if (loading) {
    return (
      <Container maxW="container.xl" py={8}>
        <VStack gap={4} align="center" justify="center" minH="400px">
          <Spinner size="xl" color="red.500" />
          <Text>Загрузка товара...</Text>
        </VStack>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxW="container.xl" py={8}>
        <Alert.Root status="error">
          <Alert.Indicator />
          <Alert.Title>Ошибка загрузки</Alert.Title>
          <Alert.Description>{error}</Alert.Description>
        </Alert.Root>
      </Container>
    );
  }

  // If product not found, redirect to main page
  if (!product) {
    navigate('/');
    return null;
  }

  const breadcrumbItems = [
    { label: 'Главная', href: '/' },
    { label: 'Каталог', href: '/' },
    { label: product.name, isCurrentPage: true }
  ];

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.current_price,
      image: product.image_url
    });
    toaster.create({
      title: 'Товар добавлен в корзину',
      description: product.name,
      duration: 3000,
      type: 'success'
    });
    console.log('Added to cart:', product.name);
  };

  return ( 
      <Container maxW="container.xl" py={8}>
      
      <Breadcrumbs items={breadcrumbItems} /> 

        <Flex direction={{ base: 'column', md: 'row' }} gap={{ base: 6, md: 10 }} py={6}>
          <VStack
            flex={{ base: '1', md: '0 0 40%' }}
            align="start"
            gap={4}
            w="100%"
          >
            <Box
              borderWidth="1px"
              borderColor="gray.200"
              borderRadius="md"
              overflow="hidden"
              p={0}
              w="100%"
              maxW={{ base: '100%', sm: '380px' }}
              mx="auto"
            >
              <Image
                src={product.image_url}
                alt={product.alt}
                objectFit="contain"
                w="100%"
                h="auto"
              />
            </Box>
            <Heading size="lg" fontWeight="bold" mt={2} display={{ base: 'block', md: 'none' }}>
              {product.name}
            </Heading>
          </VStack>

          <VStack flex="1" align="start" gap={6} w="100%">
            <Heading size="lg" fontWeight="bold" display={{ base: 'none', md: 'block' }}>
              {product.name}
            </Heading>


            <VStack align="start" gap={2} w="100%">
              <Heading size="md" fontWeight="bold">Описание товара:</Heading>
              <Text fontSize="sm" color="gray.700">
                {product.description}
              </Text>
            </VStack>

            <VStack align="start" gap={3} w="100%">
              <Heading size="md" fontWeight="bold">Характеристики:</Heading>
              <Flex w="100%" justifyContent="space-between" fontSize="sm">
                <Text color="gray.600">Артикул:</Text>
                <Text fontWeight="medium" color="gray.800" textAlign="right">{product.sku}</Text>
              </Flex>
              <Flex w="100%" justifyContent="space-between" fontSize="sm">
                <Text color="gray.600">Производитель:</Text>
                <Text fontWeight="medium" color="gray.800" textAlign="right">{product.manufacturer_name}</Text>
              </Flex>
              <Flex w="100%" justifyContent="space-between" fontSize="sm">
                <Text color="gray.600">Материал:</Text>
                <Text fontWeight="medium" color="gray.800" textAlign="right">{product.attributes.material}</Text>
              </Flex>
              <Flex w="100%" justifyContent="space-between" fontSize="sm">
                <Text color="gray.600">Цвет:</Text>
                <Text fontWeight="medium" color="gray.800" textAlign="right">{product.attributes.color}</Text>
              </Flex>
              <Flex w="100%" justifyContent="space-between" fontSize="sm">
                <Text color="gray.600">Высота:</Text>
                <Text fontWeight="medium" color="gray.800" textAlign="right">{product.attributes.height}</Text>
              </Flex>
              <Flex w="100%" justifyContent="space-between" fontSize="sm">
                <Text color="gray.600">Диаметр основания:</Text>
                <Text fontWeight="medium" color="gray.800" textAlign="right">{product.attributes.base_diameter}</Text>
              </Flex>
              <Flex w="100%" justifyContent="space-between" fontSize="sm">
                <Text color="gray.600">Длина кабеля:</Text>
                <Text fontWeight="medium" color="gray.800" textAlign="right">{product.attributes.cable_length}</Text>
              </Flex>
              <Flex w="100%" justifyContent="space-between" fontSize="sm">
                <Text color="gray.600">Тип лампы:</Text>
                <Text fontWeight="medium" color="gray.800" textAlign="right">{product.attributes.lamp_type}</Text>
              </Flex>
              <Flex w="100%" justifyContent="space-between" fontSize="sm">
                <Text color="gray.600">Стиль:</Text>
                <Text fontWeight="medium" color="gray.800" textAlign="right">{product.attributes.style}</Text>
              </Flex>
              {product.attributes.power && (
                <Flex w="100%" justifyContent="space-between" fontSize="sm">
                  <Text color="gray.600">Мощность:</Text>
                  <Text fontWeight="medium" color="gray.800" textAlign="right">{product.attributes.power}</Text>
                </Flex>
              )}
              {product.attributes.voltage && (
                <Flex w="100%" justifyContent="space-between" fontSize="sm">
                  <Text color="gray.600">Напряжение:</Text>
                  <Text fontWeight="medium" color="gray.800" textAlign="right">{product.attributes.voltage}</Text>
                </Flex>
              )}
            </VStack>

            <Spacer />

            <VStack align="start" gap={1} w="100%" mt={4}>
              <Text fontSize="2xl" fontWeight="bold" color="gray.800">
                Цена: {product.current_price.toLocaleString('ru-RU')} руб
              </Text>
              <Text fontSize="md" color="green.600" fontWeight="medium">
                В наличии: {product.stock_quantity} шт.
              </Text>
            </VStack>

            <Button
              onClick={handleAddToCart}
              colorScheme="green"
              bg="green.100"
              color="green.700"
              _hover={{ bg: "green.200" }}
              size="lg"
              w={{ base: 'full', sm: 'auto' }} // Full width on small screens, auto on larger
              minW="200px" 
              py={6}
            >
              Добавить в корзину
            </Button>
          </VStack>
        </Flex>
      </Container> 
  );
};

export default ProductDetailPage;