import {
  Box,
  Button,
  Flex,
  Heading,
  Input,
  Textarea,
  VStack,
  HStack,
  Text,
  Icon,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  NumberInputField,
  NumberInputRoot,
} from "@/components/ui/number-input";
import { Field } from "@/components/ui/field";
import {
  FileUploadRoot,
  FileUploadDropzone,
  FileUploadList,
  FileUploadTrigger,
} from "@/components/ui/file-upload";
import {
  ProductService,
  type CreateProductRequest,
} from "../../services/ProductService";
import { toaster } from "@/components/ui/toaster";
import { LuUpload, LuX } from "react-icons/lu";

export default function AddProductPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("basic");
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState({
    name: "",
    sku: "",
    description: "",
    manufacturer_name: "",
    price: "",
    stock: "",
    imageUrl: "",
  });
  const [characteristics, setCharacteristics] = useState([
    { id: 1, name: "", value: "" },
    { id: 2, name: "", value: "" },
    { id: 3, name: "", value: "" },
  ]);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const validateForm = () => {
    if (!product.name.trim()) {
      setError("Название товара обязательно для заполнения");
      return false;
    }
    if (!product.description.trim()) {
      setError("Описание товара обязательно для заполнения");
      return false;
    }
    const price = parseFloat(product.price);
    if (isNaN(price) || price <= 0) {
      setError("Цена должна быть положительным числом");
      return false;
    }
    const stock = parseInt(product.stock);
    if (isNaN(stock) || stock < 0) {
      setError("Количество товара должно быть неотрицательным числом");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      // Prepare product data
      const productData: CreateProductRequest = {
        name: product.name.trim(),
        sku: product.sku.trim() || `LAMP-${Date.now()}`,
        description: product.description.trim(),
        manufacturer_name: product.manufacturer_name.trim() || 'ООО "Лампочка"',
        current_price: parseFloat(product.price),
        stock_quantity: parseInt(product.stock) || 0,
        image_url: product.imageUrl || "",
        attributes: {},
      };

      // Add characteristics to attributes
      const validCharacteristics = characteristics.filter(
        (char) => char.name.trim() && char.value.trim()
      );

      if (validCharacteristics.length > 0) {
        productData.attributes = validCharacteristics.reduce((acc, char) => {
          acc[char.name.trim()] = char.value.trim();
          return acc;
        }, {} as Record<string, string>);
      }

      await ProductService.create(productData);

      toaster.create({
        title: "Успешно",
        description: "Товар успешно создан",
        type: "success",
        duration: 3000,
      });

      navigate("/admin/products");
    } catch (err: any) {
      console.error("Error creating product:", err);
      setError(err.message || "Произошла ошибка при создании товара");

      toaster.create({
        title: "Ошибка",
        description: err.message || "Произошла ошибка при создании товара",
        type: "error",
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };
  const handleFileAccept = async (details: { files: File[] }) => {
    const file = details.files[0];
    if (file) {
      // Create preview URL immediately
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);

      try {
        setLoading(true);
        // Upload the actual file to the server
        const uploadResult = await ProductService.uploadImage(file);

        // Update product with the real uploaded image URL
        setProduct((prev) => ({ ...prev, imageUrl: uploadResult.image_url }));

        toaster.create({
          title: "Успешно",
          description: "Изображение загружено",
          type: "success",
          duration: 3000,
        });
      } catch (err: any) {
        console.error("Image upload failed:", err);
        setError(err.message || "Ошибка загрузки изображения");

        toaster.create({
          title: "Ошибка",
          description: err.message || "Ошибка загрузки изображения",
          type: "error",
          duration: 5000,
        });

        // Reset image on upload failure
        setImagePreview("");
        setProduct((prev) => ({ ...prev, imageUrl: "" }));
      } finally {
        setLoading(false);
      }
    }
  };

  const removeImage = () => {
    setImagePreview("");
    setProduct((prev) => ({ ...prev, imageUrl: "" }));
  };

  const addCharacteristic = () => {
    setCharacteristics((prev) => [
      ...prev,
      { id: Date.now(), name: "", value: "" },
    ]);
  };

  const removeCharacteristic = (id: number) => {
    setCharacteristics((prev) => prev.filter((char) => char.id !== id));
  };

  const updateCharacteristic = (
    id: number,
    field: "name" | "value",
    value: string
  ) => {
    setCharacteristics((prev) =>
      prev.map((char) => (char.id === id ? { ...char, [field]: value } : char))
    );
  };

  return (
    <Box>
      <Heading size="lg" mb="25px" fontWeight="600">
        Новый товар
      </Heading>

      {error && (
        <Box
          mb="20px"
          p="15px"
          bg="red.50"
          border="1px solid red"
          borderRadius="5px"
          color="red.600"
        >
          {error}
        </Box>
      )}

      {/* Tabs */}
      <Box mb="25px" borderBottom="1px solid #ccc">
        <HStack gap={0}>
          <Button
            variant="ghost"
            py="10px"
            px="20px"
            fontSize="16px"
            color={activeTab === "basic" ? "#79b74a" : "#555"}
            borderBottom={
              activeTab === "basic"
                ? "3px solid #79b74a"
                : "3px solid transparent"
            }
            fontWeight={activeTab === "basic" ? "600" : "normal"}
            borderRadius={0}
            mb="-1px"
            onClick={() => setActiveTab("basic")}
          >
            Основная информация
          </Button>
          <Button
            variant="ghost"
            py="10px"
            px="20px"
            fontSize="16px"
            color={activeTab === "characteristics" ? "#79b74a" : "#555"}
            borderBottom={
              activeTab === "characteristics"
                ? "3px solid #79b74a"
                : "3px solid transparent"
            }
            fontWeight={activeTab === "characteristics" ? "600" : "normal"}
            borderRadius={0}
            mb="-1px"
            onClick={() => setActiveTab("characteristics")}
          >
            Характеристики
          </Button>
        </HStack>
      </Box>

      <form onSubmit={handleSubmit}>
        {activeTab === "basic" && (
          <Flex gap="30px">
            <Box flex="1">
              <VStack gap="20px" align="stretch">
                <Field required label="Название товара" fontWeight={600}>
                  <Input
                    placeholder="Введите название товара"
                    value={product.name}
                    onChange={(e) =>
                      setProduct((prev) => ({ ...prev, name: e.target.value }))
                    }
                    border="1px solid #ccc"
                    borderRadius="5px"
                    required
                  />
                </Field>

                <Field label="SKU" fontWeight={600}>
                  <Input
                    placeholder="Введите SKU (оставьте пустым для автогенерации)"
                    value={product.sku}
                    onChange={(e) =>
                      setProduct((prev) => ({ ...prev, sku: e.target.value }))
                    }
                    border="1px solid #ccc"
                    borderRadius="5px"
                  />
                </Field>

                <Field required label="Описание товара" fontWeight={600}>
                  <Textarea
                    placeholder="Введите описание товара"
                    value={product.description}
                    onChange={(e) =>
                      setProduct((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    minH="120px"
                    resize="vertical"
                    border="1px solid #ccc"
                    borderRadius="5px"
                    required
                  />
                </Field>

                <Field label="Производитель" fontWeight={600}>
                  <Input
                    placeholder="Введите название производителя"
                    value={product.manufacturer_name}
                    onChange={(e) =>
                      setProduct((prev) => ({
                        ...prev,
                        manufacturer_name: e.target.value,
                      }))
                    }
                    border="1px solid #ccc"
                    borderRadius="5px"
                  />
                </Field>

                <Field required label="Цена" fontWeight="600">
                  <HStack>
                    <NumberInputRoot
                      flex="1"
                      value={product.price}
                      onValueChange={(e) =>
                        setProduct((prev) => ({ ...prev, price: e.value }))
                      }
                    >
                      <NumberInputField
                        placeholder="Введите цену"
                        border="1px solid #ccc"
                        borderRadius="5px"
                        required
                      />
                    </NumberInputRoot>
                    <Text>руб.</Text>
                  </HStack>
                </Field>

                <Field label="Количество товара в наличии" fontWeight="600">
                  <HStack>
                    <NumberInputRoot
                      flex="1"
                      value={product.stock}
                      onValueChange={(e) =>
                        setProduct((prev) => ({ ...prev, stock: e.value }))
                      }
                    >
                      <NumberInputField
                        placeholder="Введите количество товара в наличии"
                        border="1px solid #ccc"
                        borderRadius="5px"
                      />
                    </NumberInputRoot>
                    <Text>шт.</Text>
                  </HStack>
                </Field>
              </VStack>
            </Box>

            <Box w="250px">
              <Field label="Изображение" fontWeight="600">
                <VStack gap="10px" align="stretch">
                  {imagePreview ? (
                    <Box position="relative">
                      <Box
                        w="200px"
                        h="200px"
                        borderRadius="8px"
                        overflow="hidden"
                        border="1px solid #ccc"
                      >
                        <img
                          src={imagePreview}
                          alt="Preview"
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      </Box>
                      <Button
                        position="absolute"
                        top="5px"
                        right="5px"
                        size="sm"
                        bg="red.500"
                        color="white"
                        borderRadius="50%"
                        w="24px"
                        h="24px"
                        minW="24px"
                        p={0}
                        onClick={removeImage}
                        _hover={{ bg: "red.600" }}
                      >
                        <LuX />
                      </Button>
                    </Box>
                  ) : (
                    <FileUploadRoot
                      maxFiles={1}
                      accept={["image/*"]}
                      onFileAccept={handleFileAccept}
                    >
                      <FileUploadDropzone label="" bg="#f9f9f9">
                        <Box fontSize="50px" mb="10px">
                          ☁️
                        </Box>
                        <Text fontSize="sm" mb="10px">
                          Перетащите изображение сюда или
                        </Text>
                        <Icon fontSize="xl" color="fg.muted">
                          <LuUpload />
                        </Icon>
                        <FileUploadTrigger asChild>
                          <Button
                            color="#79b74a"
                            textDecoration="underline"
                            variant="ghost"
                            size="sm"
                          >
                            Выбрать изображение
                          </Button>
                        </FileUploadTrigger>
                      </FileUploadDropzone>
                      <FileUploadList />
                    </FileUploadRoot>
                  )}
                </VStack>
              </Field>
            </Box>
          </Flex>
        )}

        {activeTab === "characteristics" && (
          <Box>
            <VStack gap="10px" align="stretch">
              {characteristics.map((char) => (
                <HStack key={char.id} gap="10px">
                  <Text cursor="grab">☰</Text>
                  <Input
                    placeholder="Введите название характеристики"
                    value={char.name}
                    onChange={(e) =>
                      updateCharacteristic(char.id, "name", e.target.value)
                    }
                    flex="1"
                  />
                  <Input
                    placeholder="Введите значение"
                    value={char.value}
                    onChange={(e) =>
                      updateCharacteristic(char.id, "value", e.target.value)
                    }
                    flex="1"
                  />
                  <Button
                    w="30px"
                    h="30px"
                    borderRadius="50%"
                    bg="#dc3545"
                    color="white"
                    fontSize="12px"
                    fontWeight="bold"
                    onClick={() => removeCharacteristic(char.id)}
                  >
                    <LuX />
                  </Button>
                </HStack>
              ))}
            </VStack>

            <Button
              mt="15px"
              bg="#f0f0f0"
              color="#333"
              border="1px solid #ccc"
              css={{
                "&:hover": { bg: "#e0e0e0" },
              }}
              onClick={addCharacteristic}
            >
              + Добавить характеристику
            </Button>
          </Box>
        )}

        <HStack justify="flex-end" mt="30px" gap="10px">
          <Button
            bg="#f0f0f0"
            color="#333"
            border="1px solid #ccc"
            css={{
              "&:hover": { bg: "#e0e0e0" },
            }}
            onClick={() => navigate("/admin/products")}
            disabled={loading}
          >
            Отмена
          </Button>
          <Button
            type="submit"
            bg="#79b74a"
            color="white"
            css={{
              "&:hover": { bg: "#6aa23c" },
            }}
            loading={loading}
            loadingText="Создание..."
            disabled={loading}
          >
            Сохранить
          </Button>
        </HStack>
      </form>
    </Box>
  );
}
