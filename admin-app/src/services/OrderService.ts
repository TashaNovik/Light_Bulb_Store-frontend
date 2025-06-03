import { AuthService } from './AuthService'

// Use the correct API URL for orders - might need to be different from admin API
const ADMIN_API_BASE_URL = import.meta.env.VITE_ADMIN_API_URL || "http://localhost:8002"

export interface OrderStatus {
  id: string
  code: string
  name: string
  description?: string
}

export interface OrderStatusHistory {
  id: string
  order_id: string
  status_id: string
  status_name: string
  status_code: string
  changed_at: string
  actor_details?: string
  notes?: string
  status_ref: {
    code: string
    name: string
  }
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  product_snapshot_name: string
  product_snapshot_price: number
  quantity: number
  subtotal_amount: number
}

export interface ShippingAddress {
  city: string
  street_address: string
  apartment?: string
  postal_code?: string
  address_notes?: string
}

export interface OrderDetails {
  id: string
  order_number: string
  customer_name: string
  customer_phone: string
  customer_email: string
  customer_notes?: string
  status_id: string
  status_name: string
  status_code: string
  total_amount: number
  currency: string
  delivery_method_id: string
  delivery_method_name?: string
  payment_method_name?: string
  shipping_address?: ShippingAddress
  created_at: string
  updated_at: string
  items: OrderItem[]
  payment_detail: {
    payment_method_ref: {
      code: string
      name: string
    }
  }
  delivery_method_ref: {
    code: string
    name: string
  }
  status_ref: {
    code: string
    name: string
  }
}

export interface OrderStatusUpdateRequest {
  status_id: string
  actor_details?: string
  notes?: string
}

export class OrderService {
  private static async request<T>(
    endpoint: string,
    options: RequestInit = {},
    baseUrl: string = ADMIN_API_BASE_URL
  ): Promise<T> {
    const tokens = AuthService.getTokens()
    if (!tokens) {
      throw new Error('Not authenticated')
    }

    const url = `${baseUrl}${endpoint}`

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokens.accessToken}`,
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)

      if (!response.ok) {
        if (response.status === 401) {
          AuthService.clearTokens()
          throw new Error('Unauthorized - please login again')
        }
        
        const errorText = await response.text()
        let errorMessage = `HTTP error! status: ${response.status}`
        
        try {
          const errorJson = JSON.parse(errorText)
          errorMessage = errorJson.detail || errorJson.message || errorMessage
        } catch {
          errorMessage = errorText || errorMessage
        }
        
        throw new Error(errorMessage)
      }

      // Handle 204 No Content responses
      if (response.status === 204) {
        return null as T
      }

      return await response.json()
    } catch (error) {
      console.error(`Order API request failed: ${endpoint}`, error)
      throw error
    }
  }

  static async getOrderDetails(orderId: string): Promise<OrderDetails> {
    return this.request<OrderDetails>(`/admin/orders/${orderId}`)
  }

  static async getOrderStatuses(): Promise<OrderStatus[]> {
    return this.request<OrderStatus[]>('/admin/order-statuses')
  }

  static async getOrderStatusHistory(orderId: string): Promise<OrderStatusHistory[]> {
    return this.request<OrderStatusHistory[]>(`/admin/orders/${orderId}/status-history`)
  }

  static async updateOrderStatus(orderId: string, updateRequest: OrderStatusUpdateRequest): Promise<OrderDetails> {
    return this.request<OrderDetails>(`/admin/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify(updateRequest),
    })
  }
  
  static async getOrders(params?: {
    skip?: number
    limit?: number
    search?: string
    status?: string
  }): Promise<{ data: any[]; total: number; skip: number; limit: number }> {
    const queryParams = new URLSearchParams()
    if (params?.skip) queryParams.append('skip', params.skip.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.search) queryParams.append('search', params.search)
    if (params?.status && params.status !== 'all') queryParams.append('status', params.status)

    const response = await this.request<any>(`/admin/orders?${queryParams.toString()}`)
    
    // Handle different response formats
    if (Array.isArray(response)) {
      return {
        data: response,
        total: response.length,
        skip: params?.skip || 0,
        limit: params?.limit || 10
      }
    }
    
    // Handle object response with data/items array
    const orders = Array.isArray(response.data) ? response.data : 
                  Array.isArray(response.items) ? response.items : []
    const total = response.total || response.count || orders.length
    
    return {
      data: orders,
      total: total,
      skip: params?.skip || 0,
      limit: params?.limit || 10
    }
  }
}