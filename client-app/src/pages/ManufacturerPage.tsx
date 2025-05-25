import React from "react";
import Breadcrumbs from "../components/Breadcrumbs/Breadcrumbs";

import { Container, Box, Heading, Text, Grid, GridItem, List, ListItem, Separator } from "@chakra-ui/react";

const ManufacturersPage: React.FC = () => {
  const breadcrumbItems = [
    { label: 'Главная', href: '/' },
    { label: 'Производство', isCurrentPage: true }
  ];
  return (
    <>

    <Box bg="bg.canvas" py={6}> 
          <Container maxW="1200px"> 
          <Breadcrumbs items={breadcrumbItems} /> 
                <Box mb={10}>
                  <Heading as="h2" size="xl" mb={4} textAlign="center">Наше производство: Как мы создаем свет</Heading>
                  <Text fontSize="md" color="gray.700" mb={3} textAlign="left">
                    В ООО "Лампочка" мы гордимся тем, что являемся производителями высококачественной светотехнической продукции. Наша миссия - не просто продавать лампочки, а обеспечивать ваши дома и рабочие места надежным, энергоэффективным и безопасным светом. Мы контролируем каждый этап создания нашей продукции, от выбора сырья до финальной упаковки, чтобы вы получали только лучшее.
                  </Text>
                  <Text fontSize="md" color="gray.700" textAlign="left">
                    Мы верим, что собственное производство позволяет нам не только гарантировать качество, но и предлагать вам инновационные решения по доступным ценам.
                  </Text>
                </Box>
                <Separator my={8} />

                <Box mb={10}>
                  <Heading as="h3" size="lg" mb={6} textAlign="center">Путешествие вашей лампочки: от идеи до света</Heading>
                  <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6}>
                    <GridItem p={5} borderWidth="1px" borderRadius="md" bg="gray.50">
                      <Heading as="h4" size="md" mb={2} textAlign="left">1. Закупка и проверка комплектующих</Heading>
                      <Text fontSize="sm" color="gray.600"  textAlign="left">Мы тщательно отбираем поставщиков и используем только сертифицированные компоненты, которые проходят строгий входной контроль.</Text>
                    </GridItem>
                    <GridItem p={5} borderWidth="1px" borderRadius="md" bg="gray.50">
                      <Heading as="h4" size="md" mb={2} textAlign="left">2. Высокоточная сборка</Heading>
                      <Text fontSize="sm" color="gray.600"  textAlign="left">Наши производственные линии оснащены современным оборудованием, что позволяет осуществлять сборку с максимальной точностью.</Text>
                    </GridItem>
                    <GridItem p={5} borderWidth="1px" borderRadius="md" bg="gray.50">
                      <Heading as="h4" size="md" mb={2} textAlign="left">3. Многоступенчатый контроль качества</Heading>
                      <Text fontSize="sm" color="gray.600"  textAlign="left">Каждая лампочка проходит несколько этапов проверки: на яркость, цветопередачу, энергопотребление и долговечность.</Text>
                    </GridItem>
                    <GridItem p={5} borderWidth="1px" borderRadius="md" bg="gray.50">
                      <Heading as="h4" size="md" mb={2} textAlign="left">4. Упаковка и отгрузка</Heading>
                      <Text fontSize="sm" color="gray.600"  textAlign="left">Надежная упаковка гарантирует сохранность продукции при транспортировке, чтобы она дошла до вас в идеальном состоянии.</Text>
                    </GridItem>
                  </Grid>
                </Box>
                <Separator my={8} />

                <Box mb={10}>
                  <Heading as="h3" size="lg" mb={4} textAlign="center">Технологии, которые делают свет лучше</Heading>
                  <Text fontSize="md" color="gray.700" mb={4} textAlign="left">
                    Мы постоянно следим за новейшими разработками в области светотехники и внедряем передовые технологии в наше производство:
                  </Text>
                  <List.Root pl={5} gap={2} color="gray.600"  textAlign="left">
                    <ListItem>
                      <Text  fontWeight="bold"  >Современные светодиоды (LED):</Text> Обеспечивают высокую энергоэффективность, долгий срок службы и отличное качество света.
                    </ListItem>
                    <ListItem>
                      <Text as="span" fontWeight="bold"  >Экологичные материалы:</Text> Мы используем материалы, безопасные для здоровья человека и окружающей среды, не содержащие ртуть и другие вредные вещества.
                    </ListItem>
                    <ListItem>
                      <Text as="span" fontWeight="bold"  >Оптимизированный теплоотвод:</Text> Конструкция наших ламп обеспечивает эффективное рассеивание тепла, что продлевает их срок службы.
                    </ListItem>
                    <ListItem>
                      <Text as="span" fontWeight="bold"  >Автоматизированные процессы:</Text> Снижают риск человеческой ошибки и повышают стабильность качества продукции.
                    </ListItem>
                  </List.Root>
                </Box>
                <Separator my={8} />

                <Box mb={10}>
                  <Heading as="h3" size="lg" mb={4} textAlign="center">Гарантия качества от ООО "Лампочка"</Heading>
                  <Text fontSize="md" color="gray.700" mb={4} textAlign="left">
                    Качество – наш главный приоритет. Система менеджмента качества на производстве ООО "Лампочка" включает:
                  </Text>
                  <List.Root gap={2} color="gray.600" pl={5} textAlign="left">
                    <ListItem>Входной контроль сырья и комплектующих.</ListItem>
                    <ListItem>Межоперационный контроль на всех ключевых этапах сборки.</ListItem>
                    <ListItem>100% тестирование готовой продукции перед упаковкой.</ListItem>
                    <ListItem>Периодические испытания на долговечность и соответствие заявленным характеристикам в собственной лаборатории.</ListItem>
                    <ListItem>Соответствие стандартам ГОСТ и ТР ТС.</ListItem>
                  </List.Root>
                  <Text fontSize="md" color="gray.700" mt={4} textAlign="left">
                    Мы уверены в своей продукции и предоставляем гарантию на все наши изделия.
                  </Text>
                </Box>
                <Separator my={8} />

                <Box mb={10}>
                  <Heading as="h3" size="lg" mb={4} textAlign="center">Забота об экологии и вашей безопасности</Heading>
                  <Text fontSize="md" color="gray.700" textAlign={"left"}>
                    ООО "Лампочка" стремится минимизировать воздействие на окружающую среду. Мы используем энергосберегающие технологии не только в наших продуктах, но и на самом производстве. Наши лампочки не требуют специальной утилизации, так как не содержат вредных компонентов.
                  </Text>
                </Box>
                <Separator my={8} />

                <Box mb={8}>
                  <Heading as="h3" size="lg" mb={4} textAlign="center">Почему выбирают лампочки от производителя ООО "Лампочка"?</Heading>
                  <List.Root gap={2} color="gray.600" textAlign="left">
                    <ListItem>
                      <Text as="span" fontWeight="bold">Прямой контроль качества:</Text> Мы отвечаем за каждый этап.
                    </ListItem>
                    <ListItem>
                      <Text as="span" fontWeight="bold">Лучшие цены:</Text> Отсутствие посредников позволяет нам предлагать выгодные условия.
                    </ListItem>
                    <ListItem>
                      <Text as="span" fontWeight="bold">Гарантия от производителя:</Text> Быстрое решение любых вопросов.
                    </ListItem>
                    <ListItem>
                      <Text as="span" fontWeight="bold">Актуальная информация:</Text> Мы всегда готовы предоставить полные данные о нашей продукции.
                    </ListItem>
                  </List.Root>
                </Box> 
          </Container>
        </Box>
    </>
  );
};

export default ManufacturersPage;