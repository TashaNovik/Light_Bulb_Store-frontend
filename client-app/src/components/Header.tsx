import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import {
  Box,
  Container,
  Flex,
  HStack,
  Image,
  Input,
  Button,
  Text,
} from "@chakra-ui/react";
import { LiaBarsSolid as Bars } from "react-icons/lia";
import { useCartContext } from "../contexts/CartContext";
import { useSearchContext } from "../contexts/SearchContext";

interface HeaderProps {
  cartCount?: number;
}

const Header: React.FC<HeaderProps> = () => {
  const cartCount = useCartContext().cartCount || 0;
  const navigate = useNavigate();
  const { searchQuery, setSearchQuery } = useSearchContext();
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);

  // Sync local search input with global search state
  useEffect(() => {
    setLocalSearchQuery(searchQuery);
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(localSearchQuery.trim());
    navigate("/");
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSearchQuery(e.target.value);
  };

  const handleLogoClick = () => {
    setSearchQuery("");
    setLocalSearchQuery("");
  };

  const handleCatalogClick = () => {
    setSearchQuery("");
    setLocalSearchQuery("");
  };

  return (
    <Box as="header" borderBottom="1px solid" borderColor="gray.300">
      <Box bg="#e9f5e9">
        <Container
          className="container header-top-container"
          maxW="1200px"
          mx="auto"
        >
          {" "}
          <Flex align="center" justify="space-between" w="full">
            <Link to="/" className="logo header-logo" onClick={handleLogoClick}>
              <Image
                src="/assets/icons/logolampa.png"
                alt="Логотип Лампочка"
                height="40px"
              />
            </Link>

            <Button
              as={Link}
              to="/"
              onClick={handleCatalogClick}
              variant="outline"
              bg="#f0f0f0"
              borderColor="gray.400"
              color="gray.700"
              _hover={{ bg: "gray.200", borderColor: "gray.500" }}
              borderRadius="md"
              ml={5}
            >
              <HStack>
                <Bars />
                <Text className="catalog-text">Каталог товаров</Text>
              </HStack>
            </Button>
            <Flex
              as="form"
              onSubmit={handleSearchSubmit}
              flex="1"
              mx={5}
              align="center"
            >
              <Input
                value={localSearchQuery}
                onChange={handleSearchInputChange}
                type="search"
                name="search"
                placeholder="Поиск по товарам"
                aria-label="Поиск по товарам"
                colorPalette={"gray"}
                border="1px solid #cccccc"
                bg={"white"}
                _hover={{ borderColor: "gray.400" }}
                borderRadius="md"
                _placeholder={{ color: "gray.500" }}
              />
              <Button
                type="submit"
                variant="ghost"
                p={2}
                ml={2}
                _hover={{
                  bg: "transparent",
                  borderColor: "gray.300",
                  borderRadius: "md",
                }}
              >
                <Image
                  src="/assets/icons/search.svg"
                  alt="Найти"
                  width="20px"
                  height="20px"
                />
              </Button>
            </Flex>

            <Button
              as={Link}
              to="/cart"
              variant={"outline"}
              borderColor="transparent"
              _hover={{
                bg: "transparent",
                color: "black",
                borderColor: "gray.300",
                borderRadius: "md",
              }}
            >
              <HStack>
                <Image
                  src="/assets/icons/cart.svg"
                  alt=""
                  width="27px"
                  height="27px"
                  className="cart-icon"
                />
                <Text
                  className="cart-count"
                  bg="red.500"
                  color="white"
                  borderRadius="full"
                  px={2}
                  py={1}
                  fontSize="sm"
                  minW="20px"
                  textAlign="center"
                >
                  {cartCount}
                </Text>
              </HStack>
            </Button>
          </Flex>
        </Container>
      </Box>

      <Box as="nav" className="main-nav" bg="#e9f5e9" py={4}>
        <Container maxW="1200px">
          <HStack display="flex" justify="space-between" align="center" mb="3">
            <Button
              as={Link}
              to="/about"
              variant={"outline"}
              borderColor="transparent"
              _hover={{
                bg: "transparent",
                color: "black",
                borderColor: "gray.300",
                borderRadius: "md",
              }}
            >
              <HStack>
                <Image
                  src="/assets/icons/about_market.svg"
                  alt=""
                  width="30px"
                  height="30px"
                  mr="2"
                />
                <Text>О магазине</Text>
              </HStack>
            </Button>

            <Button
              as={Link}
              to="/delivery"
              variant={"outline"}
              borderColor="transparent"
              _hover={{
                bg: "transparent",
                color: "black",
                borderColor: "gray.300",
                borderRadius: "md",
              }}
            >
              <HStack>
                <Image
                  src="/assets/icons/delivery.svg"
                  alt=""
                  width="30px"
                  height="30px"
                  mr="2"
                />
                <Text>Доставка</Text>
              </HStack>
            </Button>

            <Button
              as={Link}
              to="/payment"
              variant={"outline"}
              borderColor="transparent"
              _hover={{
                bg: "transparent",
                color: "black",
                borderColor: "gray.300",
                borderRadius: "md",
              }}
            >
              <HStack>
                <Image
                  src="/assets/icons/payment.svg"
                  alt=""
                  width="30px"
                  height="30px"
                  mr="2"
                />
                <Text>Оплата</Text>
              </HStack>
            </Button>

            <Button
              as={Link}
              to="/manufacturer"
              variant={"outline"}
              borderColor="transparent"
              _hover={{
                bg: "transparent",
                color: "black",
                borderColor: "gray.300",
                borderRadius: "md",
              }}
            >
              <HStack>
                <Image
                  src="/assets/icons/factory.svg"
                  alt=""
                  width="30px"
                  height="30px"
                  mr="2"
                />
                <Text>Производители</Text>
              </HStack>
            </Button>
          </HStack>
        </Container>
      </Box>
    </Box>
  );
};

export default Header;
