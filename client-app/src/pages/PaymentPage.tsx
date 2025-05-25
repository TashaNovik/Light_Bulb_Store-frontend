import React from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  SimpleGrid,
  Icon,
  Alert, 
  Badge,
} from '@chakra-ui/react';
import { FaCreditCard, FaMoneyBillWave, FaShieldAlt, FaCheckCircle } from 'react-icons/fa';
import Breadcrumbs from '../components/Breadcrumbs/Breadcrumbs';

const PaymentPage: React.FC = () => {
  const breadcrumbItems = [
    { label: 'Главная', href: '/' },
    { label: 'Оплата', isCurrentPage: true }
  ];

  return (
    <Box bg="bg.canvas" py={6}>
      <Container maxW="1200px">
        <VStack gap={8} align="stretch">
          <Breadcrumbs items={breadcrumbItems} />

          {/* Способы оплаты */}
          <SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
            {/* Онлайн оплата */}
            <Box bg="bg.panel" p={6} borderRadius="lg" shadow="sm">
              <HStack mb={4}>
                <Icon as={FaCreditCard} w={8} h={8} color="brand.500" />
                <Heading as="h3" size="md" color="gray.800">
                  Онлайн оплата
                </Heading>
              </HStack>
              <VStack gap={3} align="start">
                <Text color="gray.700">
                  Банковские карты Visa, MasterCard, МИР
                </Text>
                <Badge colorPalette="green">Безопасно</Badge>
                <Text fontSize="sm" color="gray.600">
                  Мгновенное подтверждение платежа
                </Text>
                <Text fontSize="sm" color="gray.600">
                  SSL-шифрование данных
                </Text>
              </VStack>
            </Box>

            {/* Наличными курьеру */}
            <Box bg="bg.panel" p={6} borderRadius="lg" shadow="sm">
              <HStack mb={4}>
                <Icon as={FaMoneyBillWave} w={8} h={8} color="brand.500" />
                <Heading as="h3" size="md" color="gray.800">
                  Наличными курьеру
                </Heading>
              </HStack>
              <VStack gap={3} align="start">
                <Text color="gray.700">
                  Оплата при получении заказа
                </Text>
                <Badge colorPalette="blue">Удобно</Badge>
                <Text fontSize="sm" color="gray.600">
                  Только для курьерской доставки
                </Text>
                <Text fontSize="sm" color="gray.600">
                  Комиссия 3% от суммы заказа
                </Text>
              </VStack>
            </Box>

            {/* Банковский перевод */}
            <Box bg="bg.panel" p={6} borderRadius="lg" shadow="sm">
              <HStack mb={4}>
                <Icon as={FaCheckCircle} w={8} h={8} color="brand.500" />
                <Heading as="h3" size="md" color="gray.800">
                  Банковский перевод
                </Heading>
              </HStack>
              <VStack gap={3} align="start">
                <Text color="gray.700">
                  Для юридических лиц и индивидуальных предпринимателей
                </Text>
                <Text fontSize="sm" color="gray.600">
                  После оформления заказа мы вышлем счет на оплату
                </Text>
                <Text fontSize="sm" color="gray.600">
                  Срок поступления средств: 1-3 рабочих дня
                </Text>
              </VStack>
            </Box>

            {/* При самовывозе */}
            <Box bg="bg.panel" p={6} borderRadius="lg" shadow="sm">
              <HStack mb={4}>
                <Icon as={FaShieldAlt} w={8} h={8} color="green.500" />
                <Heading as="h3" size="md" color="gray.800">
                  Безопасность платежей
                </Heading>
              </HStack>
              <VStack gap={3} align="start">
                <Text color="gray.700">
                  • Все платежи обрабатываются через защищенное соединение SSL
                </Text>
                <Text color="gray.700">
                  • Данные банковских карт не сохраняются на наших серверах
                </Text>
                <Text color="gray.700">
                  • Поддержка технологии 3D Secure для дополнительной защиты
                </Text>
                <Text color="gray.700">
                  • Соответствие стандарту PCI DSS
                </Text>
              </VStack>
            </Box>
          </SimpleGrid>

          {/* Возврат средств */}
          <Box bg="bg.panel" p={6} borderRadius="lg" shadow="sm">
            <Heading as="h3" size="md" mb={4} color="gray.800">
              Возврат средств
            </Heading>
            <VStack gap={3} align="start">
              <Text color="gray.700">
                В случае возврата товара денежные средства возвращаются тем же способом, которым была произведена оплата:
              </Text>
              <Text color="gray.700">
                • При оплате картой — на банковскую карту в течение 5-10 рабочих дней
              </Text>
              <Text color="gray.700">
                • При оплате наличными — наличными при возврате товара
              </Text>
              <Text color="gray.700">
                • При банковском переводе — на расчетный счет в течение 3-5 рабочих дней
              </Text>
            </VStack>
          </Box>

          {/* Важная информация */}
          <Alert.Root status="info" borderRadius="lg">
            <Alert.Indicator />
            <VStack align="start" gap={2}>
              <Text fontWeight="semibold">
                Важно знать
              </Text>
              <Text fontSize="sm">
                При оплате наличными курьеру добавляется комиссия 3% от суммы заказа. 
                Рекомендуем использовать онлайн-оплату для экономии средств.
              </Text>
            </VStack>
          </Alert.Root>

          {/* Контакты */}
          <Box bg="bg.panel" p={6} borderRadius="lg" shadow="sm">
            <Heading as="h3" size="md" mb={4} color="gray.800">
              Вопросы по оплате?
            </Heading>
            <Text color="gray.700" mb={3}>
              Обращайтесь к нашим специалистам:
            </Text>
            <VStack gap={2} align="start">
              <Text color="gray.700">
                📞 Телефон: +7 (495) 123-45-67
              </Text>
              <Text color="gray.700">
                📧 Email: payment@lampochka.ru
              </Text>
              <Text color="gray.700">
                ⏰ Режим работы: Пн-Пт 9:00-18:00, Сб 10:00-16:00
              </Text>
            </VStack>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
};

export default PaymentPage;