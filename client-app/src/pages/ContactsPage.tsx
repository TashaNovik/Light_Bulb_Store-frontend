import React from "react";
import { Box, Container, Heading, Text, VStack, Link, SimpleGrid, HStack, } from "@chakra-ui/react";
import Breadcrumbs from "../components/Breadcrumbs/Breadcrumbs";

const ContactsPage: React.FC = () => {
  const breadcrumbItems = [
    { label: "Главная", href: "/" },
    { label: "Контакты", isCurrentPage: true },
  ];
  return (
    <Box bg="bg.canvas" py={6}>
      <Container maxW="1200px">
        <VStack gap={8} align="stretch">
          <Breadcrumbs items={breadcrumbItems} />

          <VStack gap={6} align="start">
            <Text fontSize="lg" color="gray.600" lineHeight="1.6">
                Мы всегда рады помочь вам и ответить на любые вопросы! Свяжитесь с нами удобным для вас способом:
            </Text>
          </VStack>

          <SimpleGrid columns={{ base: 1, md: 2 }} gap={8}>
            <Box bg="bg.panel" p={6} borderRadius="lg" shadow="sm">
              <VStack gap={10} align="start">
                <Heading as="h2" size="lg" color="gray.800">
                  Общие вопросы и поддержка клиентов:
                </Heading>
                <VStack align="start" gap={4} textAlign="left">
                  <HStack gap={2}>
                    <Text as="span" fontWeight="bold">Телефон: </Text>
                    <Link href="tel:+74951234567" color="blue.600">+7 (495) 123-45-67</Link>
                  </HStack>
                  <HStack gap={2}>
                    <Text as="span"  fontWeight="bold">Время работы колл-центра: </Text>
                    <Text>Пн-Пт, с 09:00 до 19:00 (по московскому времени)</Text>
                  </HStack>
                  <HStack gap={2}>
                    <Text fontWeight="bold">E-mail: </Text>
                    <Link href="mailto:info@lampochka.store" color="blue.600">info@lampochka.store</Link>
                  </HStack>
                </VStack>
              </VStack>
            </Box>

            <Box bg="bg.panel" p={6} borderRadius="lg" shadow="sm">
              <VStack align="start" textAlign="left" gap={4}>
                <Heading as="h3" size="md" color="gray.800" mb={4}>
                    Отдел продаж (оформление заказов, консультации по товарам):
                </Heading>
                  <VStack>
                    <VStack align="start" gap={1} textAlign="left">
                      <Text fontWeight="bold">Менеджер по работе с клиентами, Анна Иванова:</Text>
                      <HStack pl={5}>
                        <Text as="span" fontWeight="bold">Телефон: </Text>
                        <Link href="tel:+74951234568" color="blue.600">+7 (495) 123-45-68</Link>
                      </HStack>
                      <HStack pl={5}>
                        <Text as="span" fontWeight="bold">E-mail: </Text>
                        <Link href="mailto:sales@lampochka.store" color="blue.600">sales@lampochka.store</Link>
                      </HStack>
                    </VStack>
                  </VStack>
                  <HStack>
                    <VStack align="stretch" gap={1}>
                    <Text fontWeight="bold">Специалист по продукции, Петр Смирнов:</Text>
                      <HStack pl={5}>
                        <Text as="span" fontWeight="bold">Телефон: </Text>
                        <Link href="tel:+74951234568" color="blue.600">+7 (495) 123-45-69</Link>
                      </HStack>
                      <HStack pl={5}>
                        <Text as="span" fontWeight="bold">E-mail: </Text>
                        <Link href="mailto:sales@lampochka.store" color="blue.600">product@lampochka.store</Link>
                      </HStack>
                    </VStack>
                  </HStack>
              </VStack>
            </Box>

            <Box bg="bg.panel" p={6} borderRadius="lg" shadow="sm">
              <VStack gap={2} align="start">
                <Heading as="h3" size="md" color="gray.800" mb={4}>
                    Вопросы по доставке и самовывозу:
                </Heading>
                <HStack>
                  <VStack align="stretch" gap={1} textAlign="left">
                    <Text fontWeight="bold">Специалист по доставке, Иван Петров:</Text>
                    <HStack pl={5}>
                      <Text as="span" fontWeight="bold">Телефон: </Text>
                      <Link href="tel:+74951234568" color="blue.600">+7 (495) 123-45-70</Link>
                    </HStack>
                    <HStack pl={5}>
                      <Text as="span" fontWeight="bold">E-mail: </Text>
                      <Link href="mailto:sales@lampochka.store" color="blue.600">delivery@lampochka.store</Link>
                    </HStack>
                  </VStack>
                </HStack> 
                <HStack>
                  <VStack align="left" gap={1} textAlign="left">
                    <Text fontWeight="bold">Служба логистики:</Text> 
                    <HStack pl={5}>
                      <Text as="span" fontWeight="bold">Телефон: </Text>
                      <Link href="tel:+74951234568" color="blue.600">+7 (495) 123-45-71</Link>
                    </HStack>
                    <HStack pl={5}>
                      <Text as="span" fontWeight="bold">E-mail: </Text>
                      <Link href="mailto:sales@lampochka.store" color="blue.600">logistics@lampochka.store</Link>
                    </HStack>
                  </VStack>
                </HStack>
              </VStack>  
            </Box>

            <Box bg="bg.panel" p={8} borderRadius="lg" shadow="sm">
              <VStack gap={2} align="start">
                <Heading as="h3" size="md" color="gray.800" mb={6} textAlign="center">
                    Наш адрес (для самовывоза и почтовой корреспонденции):
                </Heading>
                <HStack textAlign={"left"} gap={4}>
                  <Text>ООО «Лампочка», [123456], г. Москва, ул. Светлая, д. 10, офис 5.</Text>
                </HStack>
                <VStack align="start" gap={2} textAlign="left">
                  <Heading as="h2" size="md" color="gray.800" mb={2} mt={4}>
                    Реквизиты: ООО «Лампочка»
                  </Heading>
                  <VStack ml={5}align="start" gap={1} textAlign="left">
                    <Text><Text as="span" fontWeight="bold">ИНН:</Text> 7700123456</Text>
                    <Text><Text as="span" fontWeight="bold">КПП:</Text> 770001001</Text>
                    <Text><Text as="span" fontWeight="bold">ОГРН:</Text> 1234567890123</Text> 
                  </VStack>
                </VStack>
              </VStack>
            </Box>
          </SimpleGrid>
        </VStack>
      </Container>
    </Box>
  );
};

export default ContactsPage;