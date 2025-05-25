import React from "react";
import { Link } from "react-router-dom";
import {
  Box,
  Container,
  Flex,
  HStack,
  VStack,
  Image,
  Text,
  Button
} from "@chakra-ui/react";

const Footer: React.FC = () => {
  return (
    <Box as="footer"  bg="#e9f5e9" py={8} borderTop="1px solid" borderColor="gray.300">
      <Container   maxW="1200px" mx="auto" px={0}>
        <Flex
          direction={{ base: "column", md: "row" }}
          justify="space-between"
          align={{ base: "center", md: "flex-start" }}
          textAlign={{ base: "center", md: "left" }}
          gap={8}
        >
          <Box className="footer-column footer-logo-column" mt={0}>
            <Link to="/">
              <Image src="/assets/icons/logolampa.png" alt="Логотип Лампочка" height="40px" />
            </Link>
          </Box>

          <Box mx="auto">
          <VStack className="footer-column footer-socials-column" align="center" gap={4}>
            <HStack className="socials-title" align="center">
              <Image src="/assets/icons/click.svg" alt="" width="27px" height="27px" className="socials-icon" />
              <Text fontWeight="medium" color="gray.700">Мы в соцсетях</Text>
            </HStack>
            <HStack>
                  <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" className="socials-link facebook">
                    <HStack _hover={{ color: "blue.500" }}>
                      <Image src="/assets/icons/facebook.svg" alt="" width="20px" height="20px" className="socials-icon" />
                      <Text fontSize="sm" fontWeight="medium">Facebook</Text>
                    </HStack>
                  </a>
                  <a href="https://www.youtube.com" target="_blank" rel="noopener noreferrer" className="socials-link youtube">
                    <HStack _hover={{ color: "red.500" }}>
                      <Image src="/assets/icons/youtube.svg" alt="" width="20px" height="20px" className="socials-icon" />
                      <Text fontSize="sm" fontWeight="medium">Youtube</Text>
                    </HStack>
                  </a>
                  <a href="https://wa.me/" target="_blank" rel="noopener noreferrer" className="socials-link whatsapp">
                    <HStack _hover={{ color: "green.500" }}>
                      <Image src="/assets/icons/whatsapp.svg" alt="" width="20px" height="20px" className="socials-icon" />
                      <Text fontSize="sm" fontWeight="medium">Whatsapp</Text>
                    </HStack>
                  </a>
            </HStack>
            <HStack>
                  <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" className="socials-link instagram">
                    <HStack _hover={{ color: "pink.500" }}>
                      <Image src="/assets/icons/instagram.svg" alt="" width="20px" height="20px" className="socials-icon" />
                      <Text fontSize="sm" fontWeight="medium">Instagram</Text>
                    </HStack>
                  </a>
                  <a href="https://t.me/" target="_blank" rel="noopener noreferrer" className="socials-link telegram">
                    <HStack _hover={{ color: "blue.400" }}>
                      <Image src="/assets/icons/telegram.svg" alt="" width="20px" height="20px" className="socials-icon" />
                      <Text fontSize="sm" fontWeight="medium">Telegram</Text>
                    </HStack>
                  </a>
                  <a href="viber://chat" className="socials-link viber">
                    <HStack _hover={{ color: "purple.500" }}>
                      <Image src="/assets/icons/viber.svg" alt="" width="20px" height="20px" className="socials-icon" />
                      <Text fontSize="sm" fontWeight="medium">Viber</Text>
                    </HStack>
                  </a>
            </HStack>
          </VStack>
          </Box>
          <HStack  mr="0" className="footer-column footer-actions-column" gap={6}>
            <Button 
              as={Link}
              to="/contacts" 
              className="button button-red contacts-button"
              bg="red.500"
              color="white"
              border="2px solid"
              borderColor="red.600"
              _hover={{ bg: "red.600", borderColor: "gray.800" }}
              px={5}
              py={2}
              fontWeight="medium"
            >
              Перейти в контакты
            </Button>
            <Button 
              className="button button-red subscribe-button" 
              type="button"
              bg="red.500"
              color="white"
              border="2px solid"
              borderColor="red.600"
              _hover={{ bg: "red.600", borderColor: "gray.800" }}
              px={5}
              py={2}
              fontWeight="medium"
              leftIcon={<Image src="/assets/icons/user-plus.svg" alt="" width="18px" height="18px" className="subscribe-icon" />}
            >
              Подписаться
            </Button>
          </HStack>
        </Flex>
      </Container>
    </Box>
  );
};

export default Footer;