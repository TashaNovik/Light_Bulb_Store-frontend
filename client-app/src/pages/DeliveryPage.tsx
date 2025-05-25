import React from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  SimpleGrid,
  Alert,
  Icon,
  Badge
  ,
} from '@chakra-ui/react'; 
import { FaTruck, FaClock, FaMapMarkerAlt, FaBox } from 'react-icons/fa';
import Breadcrumbs from '../components/Breadcrumbs/Breadcrumbs';

const DeliveryPage: React.FC = () => {
  const breadcrumbItems = [
    { label: 'Главная', href: '/' },
    { label: 'Доставка', isCurrentPage: true }
  ];

  return (
    <Box bg="bg.canvas" py={6}>
      <Container maxW="1200px">
      <VStack gap={8} align="stretch">
      <Breadcrumbs items={breadcrumbItems} />

          <VStack gap={6} align="start">
            <Text fontSize="lg" color="gray.600" lineHeight="1.6">
              Мы предлагаем несколько удобных способов получения заказа
            </Text>
          </VStack>

          <SimpleGrid columns={{ base: 1, lg: 2 }} gap={6}>
            {/* Доставка курьером */}
            <Box bg="bg.panel" p={6} borderRadius="lg" shadow="sm">
              <HStack mb={4}>
                <Icon as={FaTruck} w={8} h={8} color="brand.500" />
                <Heading as="h3" size="md" color="gray.800">
                  Курьерская доставка
                </Heading>
              </HStack>
              <VStack gap={3} align="start">
                <Text color="gray.700">
                  Доставка курьером по Москве и Московской области
                </Text>
                <HStack>
                  <Icon as={FaClock} color="gray.500" />
                  <Text fontSize="sm" color="gray.600">
                    1-2 рабочих дня
                  </Text>
                </HStack>
                <HStack>
                  <Text fontSize="sm" color="gray.600">Стоимость:</Text>
                  <Badge colorPalette="brand">300 руб</Badge>
                </HStack>
                <Text fontSize="sm" color="green.600" fontWeight="semibold">
                  Бесплатно при заказе от 3000 руб
                </Text>
              </VStack>
            </Box>

            {/* Самовывоз */}
            <Box bg="bg.panel" p={6} borderRadius="lg" shadow="sm">
              <HStack mb={4}>
                <Icon as={FaBox} w={8} h={8} color="brand.500" />
                <Heading as="h3" size="md" color="gray.800">
                  Пункт выдачи
                </Heading>
              </HStack>
              <VStack gap={3} align="start">
                <Text color="gray.700">
                  Самовывоз из нашего пункта выдачи
                </Text>
                <HStack>
                  <Icon as={FaClock} color="gray.500" />
                  <Text fontSize="sm" color="gray.600">
                    В день заказа
                  </Text>
                </HStack>
                <HStack>
                  <Text fontSize="sm" color="gray.600">Стоимость:</Text>
                  <Badge colorPalette="green">Бесплатно</Badge>
                </HStack>
                <HStack>
                  <Icon as={FaMapMarkerAlt} color="gray.500" />
                  <Text fontSize="sm" color="gray.600">
                    ул. Примерная, д. 1, стр. 2
                  </Text>
                </HStack>
              </VStack>
            </Box>
          </SimpleGrid>

          {/* Информация */}
          <Alert.Root status="info" borderRadius="lg">
            <Alert.Indicator />
            <VStack gap={2} align="start">
              <Text color="gray.700">
                • Доставка осуществляется в рабочие дни с 10:00 до 18:00
              </Text>
              <Text color="gray.700">
                • При заказе до 14:00 доставка возможна в тот же день (только для Москвы)
              </Text>
              <Text color="gray.700">
                • Крупногабаритные товары доставляются отдельно, стоимость рассчитывается индивидуально
              </Text>
              <Text color="gray.700">
                • При получении товара обязательно проверьте его целостность в присутствии курьера
              </Text>
              <Text color="gray.700">
                • В случае обнаружения повреждений составляется акт и товар заменяется бесплатно
              </Text>
            </VStack>
          </Alert.Root>
        </VStack>
      </Container>
    </Box>
  );
};

export default DeliveryPage;