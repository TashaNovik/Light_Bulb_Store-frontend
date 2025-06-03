import axios from "axios";
import type { AdminUser } from '../contexts/AdminContext';

const ADMIN_API_URL = import.meta.env.VITE_ADMIN_API_URL || "http://localhost:8002";

// Create an axios instance with interceptor for authentication
const api = axios.create({
  baseURL: ADMIN_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add axios interceptor for authentication
api.interceptors.request.use((config) => {
  const tokens = localStorage.getItem('admin_tokens');
  if (tokens) {
    try {
      const parsedTokens = JSON.parse(tokens);
      config.headers.Authorization = `Bearer ${parsedTokens.accessToken}`;
    } catch (error) {
      console.error('Error parsing tokens:', error);
    }
  }
  return config;
});

export class AdminUserService {
  static async list(page = 1, limit = 10, search = "", isActive?: boolean): Promise<{ data: AdminUser[]; pagination: { currentPage: number; totalPages: number; totalItems: number; itemsPerPage: number } }> {
    const skip = (page - 1) * limit;
    const params: any = { skip, limit };
    if (search) params.search = search;
    if (typeof isActive === "boolean") params.isActive = isActive;
    
    const res = await api.get('/admin/users', { params });
    
    // Debug log to see the actual response structure
    console.log('API Response:', res.data);
    
    // Handle case where response is directly an array or has different structure
    const users = Array.isArray(res.data) ? res.data : (res.data.data || res.data.items || []);
    
    // Transform the response to match expected format
    return {
      data: users.map((user: any) => ({
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.first_name || '',
        lastName: user.last_name || '',
        isActive: user.is_active
      })),
      pagination: res.data.pagination || {
        currentPage: page,
        totalPages: Math.ceil((res.data.total || users.length) / limit),
        totalItems: res.data.total || users.length,
        itemsPerPage: limit
      }
    };
  }

  static async getById(id: string): Promise<AdminUser> {
    const res = await api.get(`/admin/users/${id}`);
    return {
      id: res.data.id,
      username: res.data.username,
      email: res.data.email,
      firstName: res.data.first_name || '',
      lastName: res.data.last_name || '',
      isActive: res.data.is_active
    };
  }

  static async create(user: Omit<AdminUser, "id"> & { password: string }): Promise<AdminUser> {
    const payload = {
      username: user.username,
      email: user.email,
      password: user.password,
      first_name: user.firstName,
      last_name: user.lastName,
      is_active: user.isActive
    };
    const res = await api.post('/admin/users', payload);
    return {
      id: res.data.id,
      username: res.data.username,
      email: res.data.email,
      firstName: res.data.first_name || '',
      lastName: res.data.last_name || '',
      isActive: res.data.is_active
    };
  }

  static async update(id: string, user: Partial<AdminUser & { password?: string }>): Promise<AdminUser> {
    const payload: any = {};
    if (user.username) payload.username = user.username;
    if (user.email) payload.email = user.email;
    if (user.firstName) payload.first_name = user.firstName;
    if (user.lastName) payload.last_name = user.lastName;
    if (typeof user.isActive === 'boolean') payload.is_active = user.isActive;
    if (user.password) payload.password = user.password;
    
    const res = await api.put(`/admin/users/${id}`, payload);
    return {
      id: res.data.id,
      username: res.data.username,
      email: res.data.email,
      firstName: res.data.first_name || '',
      lastName: res.data.last_name || '',
      isActive: res.data.is_active
    };
  }

  static async updateStatus(id: string, isActive: boolean): Promise<AdminUser> {
    const res = await api.patch(`/admin/users/${id}/status`, { is_active: isActive });
    return {
      id: res.data.id,
      username: res.data.username,
      email: res.data.email,
      firstName: res.data.first_name || '',
      lastName: res.data.last_name || '',
      isActive: res.data.is_active
    };
  }

  static async delete(id: string): Promise<void> {
    await api.delete(`/admin/users/${id}`);
  }
}