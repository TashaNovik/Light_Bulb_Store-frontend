import axios from 'axios'; 
import type { AuditLog } from '../contexts/AdminContext';

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

export class AuditLogService {
  static async list(
    page = 1, 
    limit = 10, 
    filters: {
      userId?: string;
      action?: string;
      targetResourceType?: string;
      targetResourceId?: string;
      dateFrom?: string;
      dateTo?: string;
    } = {}
  ): Promise<{ data: AuditLog[]; pagination: { currentPage: number; totalPages: number; totalItems: number; itemsPerPage: number } }> {
    const skip = (page - 1) * limit;
    const params: any = { skip, limit };
    
    // Add filters to params
    if (filters.userId) params.user_id = filters.userId;
    if (filters.action) params.action = filters.action;
    if (filters.targetResourceType) params.target_resource_type = filters.targetResourceType;
    if (filters.targetResourceId) params.target_resource_id = filters.targetResourceId;
    if (filters.dateFrom) params.dateFrom = filters.dateFrom;
    if (filters.dateTo) params.dateTo = filters.dateTo;
    
    const res = await api.get('/admin/audit/logs', { params });
    
    // Check if response has the expected structure
    const responseData = res.data || {};
    const items = responseData.items || [];
    const total = responseData.total || 0;
    
    // Transform the response to match expected format
    return {
      data: items.map((log: any) => ({
        id: log.id,
        userId: log.user_id,
        username: log.username || 'Unknown',
        action: log.action,
        targetResourceType: log.target_resource_type,
        targetResourceId: log.target_resource_id,
        timestamp: log.timestamp,
        details: log.details,
        ipAddress: log.ip_address,
        userAgent: log.user_agent
      })),
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit
      }
    };
  }

  static async getActions(): Promise<string[]> {
    try {
      const res = await api.get('/admin/audit/logs/actions');
      return res.data || [];
    } catch (error) {
      console.error('Error fetching actions:', error);
      return [];
    }
  }

  static async getResourceTypes(): Promise<string[]> {
    try {
      const res = await api.get('/admin/audit/logs/resource-types');
      return res.data || [];
    } catch (error) {
      console.error('Error fetching resource types:', error);
      return [];
    }
  }
}