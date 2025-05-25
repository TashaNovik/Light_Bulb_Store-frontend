// API configuration - use Vite's import.meta.env for browser compatibility
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
const ORDER_API_BASE_URL =
  import.meta.env.VITE_ORDER_API_URL || "http://localhost:8001";

// API Product type (matches the backend schema)
export interface ApiProduct {
  id: string;
  name: string;
  sku: string;
  description: string;
  manufacturer_name: string;
  current_price: number;
  stock_quantity: number;
  image_url: string;
  attributes: {
    material: string;
    color: string;
    height: string;
    base_diameter: string;
    cable_length: string;
    lamp_type: string;
    mounting_type: string;
    style: string;
    power?: string;
    voltage?: string;
  };
  created_at: string;
  updated_at: string;
}

export interface CreateProductRequest {
  name: string;
  sku: string;
  description?: string;
  manufacturer_name?: string;
  current_price: number;
  stock_quantity?: number;
  image_url?: string;
  attributes?: any;
}

export interface UpdateProductRequest {
  name?: string;
  sku?: string;
  description?: string;
  manufacturer_name?: string;
  current_price?: number;
  stock_quantity?: number;
  image_url?: string;
  attributes?: any;
}

// Order API types
export interface OrderItem {
  product_id: string;
  product_snapshot_name: string;
  product_snapshot_price: number;
  quantity: number;
}

export interface ShippingAddress {
  city: string;
  street_address: string;
  apartment: string;
  postal_code?: string;
  address_notes?: string;
}

export interface CreateOrderRequest {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  delivery_method_id: string;
  payment_method_id: string;
  customer_notes?: string;
  order_items: OrderItem[];
  shipping_address?: ShippingAddress;
}

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: ShippingAddress;
  billing_address?: ShippingAddress;
  total_amount: number;
  tax_amount: number;
  shipping_cost: number;
  status:
    | "pending"
    | "confirmed"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled";
  payment_status: "pending" | "paid" | "failed" | "refunded";
  payment_method?: string;
  notes?: string;
  created_at: string;
  updated_at?: string;
  items: OrderItemResponse[];
  payment_details: {
    payment_status: "pending" | "paid" | "failed" | "refunded";
    payment_method: string;
    transaction_id?: string;
    payment_url?: string;
  };
}

export interface OrderItemResponse {
  id: string;
  order_id: number;
  product_id: number;
  product_snapshot_name: string;
  product_snapshot_price: number;
  quantity: number;
  subtotal_amount: number;
}

export interface OrderSummary {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  total_amount: number;
  status: string;
  payment_status: string;
  created_at: string;
}

// Product data with embedded characteristics following the database spec
export interface ProductAttributes {
  material: string;
  color: string;
  height: string;
  base_diameter: string;
  cable_length: string;
  lamp_type: string;
  mounting_type: string;
  style: string;
  power?: string;
  voltage?: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  description: string;
  manufacturer_name: string;
  current_price: number;
  stock_quantity: number;
  image_url: string;
  alt: string;
  attributes: ProductAttributes;
  created_at: string;
  updated_at: string;
}

class ApiService {
  private baseUrl: string;
  private orderBaseUrl: string;

  constructor(
    baseUrl: string = API_BASE_URL,
    orderBaseUrl: string = ORDER_API_BASE_URL
  ) {
    this.baseUrl = baseUrl;
    this.orderBaseUrl = orderBaseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    baseUrl: string = this.baseUrl
  ): Promise<T> {
    const url = `${baseUrl}${endpoint}`;

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...options.headers,
      },
      mode: "cors", // Explicitly set CORS mode
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP error! status: ${response.status}, message: ${errorText}`
        );
      }

      // Handle 204 No Content responses
      if (response.status === 204) {
        return null as T;
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      // Re-throw with more context
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error(
          `Network error: Unable to connect to API at ${url}. Make sure the backend is running.`
        );
      }
      throw error;
    }
  }

  // Health check endpoint with better error handling
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.request<{ status: string }>("/health");
      return response?.status === "healthy";
    } catch (error) {
      console.warn("Health check failed:", error);
      return false;
    }
  }

  async getProducts(
    skip: number = 0,
    limit: number = 100
  ): Promise<ApiProduct[]> {
    return this.request<ApiProduct[]>(
      `/api/v1/products/?skip=${skip}&limit=${limit}`
    );
  }

  async getProduct(id: string): Promise<ApiProduct> {
    return this.request<ApiProduct>(`/api/v1/products/${id}`);
  }

  async createOrder(order: CreateOrderRequest): Promise<Order> {
    console.log("Creating order:", order);
    return this.request<Order>(
      "/api/v1/orders/",
      {
        method: "POST",
        body: JSON.stringify(order),
      },
      this.orderBaseUrl
    );
  }

  async getOrder(id: number): Promise<Order> {
    return this.request<Order>(`/api/v1/orders/${id}`, {}, this.orderBaseUrl);
  }
}

export const apiService = new ApiService();
