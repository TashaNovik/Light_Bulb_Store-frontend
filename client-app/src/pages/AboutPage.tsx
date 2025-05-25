import React from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  SimpleGrid,
} from '@chakra-ui/react';
import Breadcrumbs from '../components/Breadcrumbs/Breadcrumbs';

const AboutPage: React.FC = () => {
  const breadcrumbItems = [
    { label: 'Главная', href: '/' },
    { label: 'О магазине', isCurrentPage: true }
  ];

  return (
    <Box bg="bg.canvas" py={6}>
      <Container maxW="1200px">
        <VStack gap={8} align="stretch">
          <Breadcrumbs items={breadcrumbItems} />

          <VStack gap={6} align="start">
            <Heading as="h1" size="xl" color="gray.800">
              О магазине «Лампочка»
            </Heading>

            <Text fontSize="lg" color="gray.600" lineHeight="1.6">
              Добро пожаловать в наш интернет-магазин светильников и осветительных приборов!
            </Text>
          </VStack>

          <SimpleGrid columns={{ base: 1, md: 2 }} gap={8}>
            <Box bg="bg.panel" p={6} borderRadius="lg" shadow="sm">
              <VStack gap={4} align="start">
                <Heading as="h2" size="lg" color="gray.800">
                  Наша история
                </Heading>
                <Text color="gray.700" lineHeight="1.7">
                  Компания "Лампочка" была основана в 2008 году с простой миссией: 
                  предоставить каждому клиенту доступ к качественному и стильному освещению. 
                  За годы работы мы выросли от небольшого магазина до крупного поставщика 
                  осветительного оборудования в России.
                </Text>
                <Text color="gray.700" lineHeight="1.7">
                  Сегодня мы гордимся тем, что помогли тысячам клиентов создать уютную 
                  и комфортную атмосферу в их домах и офисах. Наша команда постоянно 
                  работает над расширением ассортимента и улучшением качества обслуживания.
                </Text>
              </VStack>
            </Box>

            <Box bg="bg.panel" p={6} borderRadius="lg" shadow="sm">
              <Heading as="h3" size="md" color="gray.800" mb={4}>
                Наша миссия
              </Heading>
              <Text color="gray.700" lineHeight="1.6">
                Сделать качественное освещение доступным для каждого, предоставляя 
                широкий выбор продукции, профессиональные консультации и 
                превосходное обслуживание клиентов.
              </Text>
            </Box>

            <Box bg="bg.panel" p={6} borderRadius="lg" shadow="sm">
              <Heading as="h3" size="md" color="gray.800" mb={4}>
                Наши ценности
              </Heading>
              <VStack gap={2} align="start">
                <Text color="gray.700">• Качество продукции</Text>
                <Text color="gray.700">• Честность и прозрачность</Text>
                <Text color="gray.700">• Забота о клиентах</Text>
                <Text color="gray.700">• Инновации и развитие</Text>
                <Text color="gray.700">• Экологическая ответственность</Text>
              </VStack>
            </Box>

            <Box bg="bg.panel" p={8} borderRadius="lg" shadow="sm">
              <Heading as="h3" size="md" color="gray.800" mb={6} textAlign="center">
                Цифры, которые говорят о нас
              </Heading>
              <SimpleGrid columns={{ base: 2, md: 4 }} gap={6}>
                <VStack>
                  <Text fontSize="3xl" fontWeight="bold" color="brand.600">15+</Text>
                  <Text color="gray.600" textAlign="center">лет опыта</Text>
                </VStack>
                <VStack>
                  <Text fontSize="3xl" fontWeight="bold" color="brand.600">50k+</Text>
                  <Text color="gray.600" textAlign="center">довольных клиентов</Text>
                </VStack>
                <VStack>
                {/* <Text fontSize="3xl" fontWeight="bold" color="brand.600">10k+</Text> */}
                <Text fontSize="3xl" fontWeight="bold" color="brand.600">24</Text>
                  <Text color="gray.600" textAlign="center">часа на доставку по Москве</Text>
                </VStack>
                <VStack>
                  <Text fontSize="3xl" fontWeight="bold" color="brand.600">20</Text>
                  <Text color="gray.600" textAlign="center">эксклюзивных моделей в коллекции</Text>
                </VStack>
              </SimpleGrid>
            </Box>
          </SimpleGrid>
        </VStack>
      </Container>
    </Box>
  );
};

export default AboutPage;