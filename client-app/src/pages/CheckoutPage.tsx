import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  Box,
  Container,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Input,
  Textarea,
  Card,
  Fieldset,
  SimpleGrid,
  RadioGroup,
  Field
} from "@chakra-ui/react";
import {
  LuHandshake,
  LuTruck,
  LuDollarSign,
  LuMapPin,
  LuUser,
  LuCreditCard,
  LuBuilding
} from "react-icons/lu";
import {
  FaArchway
} from "react-icons/fa";
import {
  MdOutlinePayments
} from "react-icons/md";
import { useCartContext } from "../contexts/CartContext";
import { apiService, type CreateOrderRequest } from "../services/api";

interface FormData {
  client_name: string;
  client_surname: string;
  client_phone: string;
  client_email: string;
  delivery_method: string;
  payment_method: string;
  delivery_city: string;
  delivery_street: string;
  delivery_house: string;
  delivery_notes: string;
  postal_code: string;
  address_notes: string;
}

// Схема валидации с yup
const validationSchema = yup.object({
  client_name: yup.string().required("Имя обязательно для заполнения"),
  client_surname: yup.string().required("Фамилия обязательна для заполнения"),
  client_phone: yup.string().required("Телефон обязателен для заполнения"),
  client_email: yup.string().email("Некорректный email").required("Email обязателен для заполнения"),
  delivery_method: yup.string().required("Выберите способ доставки"),
  payment_method: yup.string().required("Выберите способ оплаты"),
  delivery_city: yup.string().default(""),
  delivery_street: yup.string().default(""),
  delivery_house: yup.string().default(""),
  delivery_notes: yup.string().default(""),
  postal_code: yup.string().default(""),
  address_notes: yup.string().default("")
}).required();

// Map delivery/payment method string to UUID
const DELIVERY_METHODS: Record<string, string> = {
  store_pickup: "fad12742-f0f9-4873-952e-3bd25cfdc562",
  courier: "7cd59a83-1d98-450b-abef-b55a9838d3e3"
};
const PAYMENT_METHODS: Record<string, string> = {
  cash_on_delivery: "7ed3c963-8440-4b57-9ca5-f80e8b150b74",
  online_apple_google: "d9dceffc-29d6-41e8-b861-2f5daf5a498b",
  bank_transfer: "2cba9518-21a4-4e4d-9dbb-b395cc10a40c"
};

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { cartItems, setCartItems } = useCartContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch
  } = useForm<FormData>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      client_name: "",
      client_surname: "",
      client_phone: "",
      client_email: "",
      delivery_method: "store_pickup",
      payment_method: "cash_on_delivery",
      delivery_city: "",
      delivery_street: "",
      delivery_house: "",
      delivery_notes: ""
    }
  });

  const deliveryType = watch("delivery_method");

  const onSubmit = async (data: FormData) => {
    if (cartItems.length === 0) {
      alert("Корзина пуста! Добавьте товары для оформления заказа.");
      return;
    }
    setIsSubmitting(true);
    try {
      // Prepare order items for backend
      const orderItems = cartItems.map(item => ({
        product_id: item.id,
        product_snapshot_name: item.name,
        product_snapshot_price: item.price,
        quantity: item.quantity
      }));
      // Prepare shipping address object or undefined
      let shippingAddress = undefined;  
      if (data.delivery_method === "courier") {
        shippingAddress = {
          city: data.delivery_city,
          street_address: data.delivery_street,
          apartment: data.delivery_house,
          postal_code: data.postal_code,
          address_notes: data.address_notes,
        };
      }
      // Create order request for backend
      const orderRequest : CreateOrderRequest = {
        customer_name: `${data.client_name} ${data.client_surname}`.trim(),
        customer_email: data.client_email,
        customer_phone: data.client_phone,
        delivery_method_id: DELIVERY_METHODS[data.delivery_method],
        payment_method_id: PAYMENT_METHODS[data.payment_method],
        customer_notes: data.delivery_notes || undefined,
        order_items: orderItems,
        shipping_address: shippingAddress

      };
      // Submit order to API
      const createdOrder = await apiService.createOrder(orderRequest);
      setCartItems([]);
      localStorage.removeItem('shoppingCart');
      localStorage.setItem('orderData', JSON.stringify(createdOrder));
      navigate('/order-confirmation');
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Ошибка при создании заказа. Пожалуйста, попробуйте еще раз.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box as="main" py={8} bg="gray.50">
      <Container maxW="6xl">
        <Fieldset.Root>

          <Fieldset.Content>
            <Card.Root variant="elevated" bg="white" mb={6}>
              <Card.Body p={6}>
                <Heading size="xl" color="gray.800" textAlign="center">
                  Оформление заказа
                </Heading>
                <Field.Root gridColumn={{ md: "span 2" }}>
                  <Field.Label>Примечание к заказу</Field.Label>
                  <Textarea
                    {...register("delivery_notes")}
                    placeholder="Дополнительные пожелания или инструкции"
                    rows={3}
                  />
                </Field.Root>
              </Card.Body>
            </Card.Root>            {/* <form onSubmit={handleSubmit}> */}
            <form onSubmit={handleSubmit(onSubmit)}>
            <VStack gap={6} align="stretch">
              {/* Client Information Section */}
              <Card.Root variant="elevated" bg="white">
                <Card.Body p={6}>
                  <Fieldset.Legend>
                    <HStack gap={3} mb={4}>
                      <Box color="red.500" fontSize="xl">
                        <LuHandshake />
                      </Box>
                      <Heading size="lg" color="gray.800">
                        Информация о клиенте
                      </Heading>
                    </HStack>
                  </Fieldset.Legend>                  <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                    <Field.Root required>
                      <Field.Label>Имя</Field.Label>
                      <Input
                        {...register("client_name")}
                        placeholder="Введите ваше имя"
                      />
                      {errors.client_name && (
                        <Text color="red.500" fontSize="sm">{errors.client_name.message}</Text>
                      )}
                    </Field.Root>

                    <Field.Root required>
                      <Field.Label>Фамилия</Field.Label>
                      <Input
                        {...register("client_surname")}
                        placeholder="Введите вашу фамилию"
                      />
                      {errors.client_surname && (
                        <Text color="red.500" fontSize="sm">{errors.client_surname.message}</Text>
                      )}
                    </Field.Root>

                    <Field.Root required>
                      <Field.Label>Телефон</Field.Label>
                      <Input
                        type="tel"
                        {...register("client_phone")}
                        placeholder="+7 (___) ___-__-__"
                      />
                      {errors.client_phone && (
                        <Text color="red.500" fontSize="sm">{errors.client_phone.message}</Text>
                      )}
                    </Field.Root>

                    <Field.Root required>
                      <Field.Label>E-mail</Field.Label>
                      <Input
                        type="email"
                        {...register("client_email")}
                        placeholder="example@mail.com"
                      />
                      {errors.client_email && (
                        <Text color="red.500" fontSize="sm">{errors.client_email.message}</Text>
                      )}
                    </Field.Root>
                  </SimpleGrid>
                </Card.Body>
              </Card.Root>

              {/* Delivery and Payment Methods */}
              <SimpleGrid columns={{ base: 1, lg: 2 }} gap={6}>
                {/* Delivery Method Section */}
                <Card.Root variant="elevated" bg="white">
                  <Card.Body p={6}>
                    <Fieldset.Legend>
                      <HStack gap={3} mb={4}>
                        <Box color="red.500" fontSize="xl">
                          <LuTruck />
                        </Box>
                        <Heading size="lg" color="gray.800">
                          Способ доставки
                        </Heading>
                      </HStack>
                    </Fieldset.Legend>
                    <Field.Root required>
                      <Controller
                        name="delivery_method"
                        control={control}
                        render={({ field }) => (
                          <RadioGroup.Root
                            value={field.value}
                            onValueChange={(details) => 
                            {
                              console.log(details.value) 
                              return field.onChange(details.value)}}
                          >
                            <VStack gap={3} align="stretch">
                              <RadioGroup.Item value="store_pickup">
                                <RadioGroup.ItemHiddenInput />
                              <RadioGroup.ItemIndicator colorPalette="red" />
                                <RadioGroup.ItemText>
                                  <HStack gap={3}>
                                    <Box color="blue.500">
                                      <FaArchway />
                                    </Box>
                                    <Text fontWeight="medium">
                                      Самовывоз из пункта выдачи
                                    </Text>
                                  </HStack>
                                </RadioGroup.ItemText>
                              </RadioGroup.Item>

                              <RadioGroup.Item value="courier">
                                <RadioGroup.ItemHiddenInput />
                              <RadioGroup.ItemIndicator colorPalette="red" />
                                <RadioGroup.ItemText>
                                  <HStack gap={3}>
                                    <Box color="green.500">
                                      <LuUser />
                                    </Box>
                                    <Text fontWeight="medium">
                                      Доставка курьером на дом
                                    </Text>
                                  </HStack>
                                </RadioGroup.ItemText>
                              </RadioGroup.Item>
                            </VStack>
                          </RadioGroup.Root>
                        )}
                      />
                      {errors.delivery_method && (
                        <Text color="red.500" fontSize="sm">{errors.delivery_method.message}</Text>
                      )}
                    </Field.Root>
                  </Card.Body>
                </Card.Root>

                {/* Payment Method Section */}
                <Card.Root variant="elevated" bg="white">
                  <Card.Body p={6}>
                    <Fieldset.Legend>
                      <HStack gap={3} mb={4}>
                        <Box color="red.500" fontSize="xl">
                          <LuDollarSign />
                        </Box>
                        <Heading size="lg" color="gray.800">
                          Способ оплаты
                        </Heading>
                      </HStack>
                    </Fieldset.Legend>                    <Controller
                      name="payment_method"
                      control={control}
                      render={({ field }) => (
                        <RadioGroup.Root 
                          value={field.value}
                          onValueChange={(details) => field.onChange(details.value)}
                        >
                          <VStack gap={3} align="stretch">
                            <RadioGroup.Item value="cash_on_delivery">
                              <RadioGroup.ItemHiddenInput />
                              <RadioGroup.ItemIndicator colorPalette="red" />
                              <RadioGroup.ItemText>
                                <HStack gap={3}>
                                  <Box color="orange.500">
                                    <MdOutlinePayments />
                                  </Box>
                                  <Text fontWeight="medium">
                                    Оплата при получении заказа
                                  </Text>
                                </HStack>
                              </RadioGroup.ItemText>
                            </RadioGroup.Item>

                            <RadioGroup.Item value="online_apple_google">
                              <RadioGroup.ItemHiddenInput />
                              <RadioGroup.ItemIndicator colorPalette="red" />
                              <RadioGroup.ItemText>
                                <HStack gap={3}>
                                  <Box color="purple.500">
                                    <LuCreditCard />
                                  </Box>
                                  <Text fontWeight="medium">
                                    Онлайн оплата / ApplePay / GooglePay
                                  </Text>
                                </HStack>
                              </RadioGroup.ItemText>
                            </RadioGroup.Item>

                            <RadioGroup.Item value="bank_transfer">
                              <RadioGroup.ItemHiddenInput />
                              <RadioGroup.ItemIndicator colorPalette="red" />
                              <RadioGroup.ItemText>
                                <HStack gap={3}>
                                  <Box color="blue.500">
                                    <LuBuilding />
                                  </Box>
                                  <Text fontWeight="medium">
                                    Безналичный расчет без НДС
                                  </Text>
                                </HStack>
                              </RadioGroup.ItemText>
                            </RadioGroup.Item>
                          </VStack>
                        </RadioGroup.Root>
                      )}
                    />
                    {errors.payment_method && (
                      <Text color="red.500" fontSize="sm">{errors.payment_method.message}</Text>
                    )}
                  </Card.Body>
                </Card.Root>
              </SimpleGrid>

              {deliveryType === "courier" && (                 
                <Card.Root variant="elevated" bg="white">
                  <Card.Body p={6}>
                    <Fieldset.Legend>
                      <HStack gap={3} mb={4}>
                        <Box color="red.500" fontSize="xl">
                          <LuMapPin />
                        </Box>
                        <Heading size="lg" color="gray.800">
                          Адрес доставки
                        </Heading>
                      </HStack>
                    </Fieldset.Legend>                  <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                      <Field.Root>
                        <Field.Label>Город</Field.Label>
                        <Input
                          {...register("delivery_city")}
                          placeholder="Введите город"
                        />
                      </Field.Root>

                      <Field.Root>
                        <Field.Label>Улица</Field.Label>
                        <Input
                          {...register("delivery_street")}
                          placeholder="Введите улицу"
                        />
                      </Field.Root>

                      <Field.Root>
                        <Field.Label>Дом, квартира</Field.Label>
                        <Input
                          {...register("delivery_house")}
                          placeholder="Дом, квартира"
                        />
                      </Field.Root>

                      <Field.Root>
                        <Field.Label>Почтовый индекс</Field.Label>
                        <Input
                          {...register("postal_code")}
                          placeholder="Введите почтовый индекс"
                        />
                      </Field.Root>

                      <Field.Root gridColumn={{ md: "span 2" }}>
                        <Field.Label>Примечание к адресу</Field.Label>
                        <Textarea
                          {...register("address_notes")}
                          placeholder="Комментарий к адресу (например, код домофона)"
                          rows={2}
                        />
                      </Field.Root>
                    </SimpleGrid>
                  </Card.Body>
                </Card.Root>
              )}

              {/* Submit Section */}
              <Card.Root variant="elevated" bg="white">
                <Card.Body p={6}>
                  <HStack justify="center" gap={4}>
                    <Link to="/cart">
                      <Button
                        variant="outline"
                        colorPalette="gray"
                        size="lg"
                        minW="200px"
                      >
                        Вернуться в корзину
                      </Button>
                    </Link>                    <Button
                      type="submit"
                      colorPalette="red"
                      size="lg"
                      minW="200px"
                      loading={isSubmitting}
                    >
                      Оформить заказ
                    </Button>
                  </HStack>                </Card.Body>
              </Card.Root>
            </VStack>
            </form>
          </Fieldset.Content>
        </Fieldset.Root>
      </Container>
    </Box>
  );
};

export default CheckoutPage;
