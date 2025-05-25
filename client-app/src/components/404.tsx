import React from "react";
import { useLocation } from "react-router";
import { Link } from "react-router";
import { 
  Box, 
  Container, 
  VStack, 
  Heading, 
  Text, 
  Button,
  Card
} from "@chakra-ui/react";
import { FiAlertCircle, FiHome } from "react-icons/fi";

const NotFound: React.FC = () => {
  const location = useLocation();
  
  // Handle Chrome DevTools and other system requests silently
  if (location.pathname.includes('.well-known') || 
      location.pathname.includes('favicon') ||
      location.pathname.includes('robots.txt')) {
    return null;
  }

  return (
    <Box as="main" py={16} bg="gray.50" minH="100vh">
      <Container maxW="4xl">
        <Card.Root variant="elevated" bg="white" shadow="lg">
          <Card.Body p={12}>
            <VStack gap={8} textAlign="center">
              <Box color="red.400" fontSize="6xl">
                <FiAlertCircle />
              </Box>
              
              <VStack gap={4}>
                <Heading 
                  size="3xl" 
                  color="gray.800"
                  fontWeight="bold"
                >
                  404
                </Heading>
                
                <Heading 
                  size="xl" 
                  color="gray.700"
                  fontWeight="semibold"
                >
                  Страница не найдена
                </Heading>
                
                <Text 
                  fontSize="lg" 
                  color="gray.600"
                  maxW="md"
                  lineHeight="relaxed"
                >
                  Извините, запрашиваемая страница не существует. 
                  Возможно, она была перемещена или удалена.
                </Text>
              </VStack>

              <VStack gap={4}>
                <Link to="/">
                  <Button
                    size="lg"
                    colorPalette="red"
                    px={8}
                    py={6}
                  >
                    <FiHome />
                  </Button>
                </Link>
                
                <Text fontSize="sm" color="gray.500">
                  Или используйте навигацию выше для поиска нужной страницы
                </Text>
              </VStack>
            </VStack>
          </Card.Body>
        </Card.Root>
      </Container>
    </Box>
  );
};

export default NotFound;