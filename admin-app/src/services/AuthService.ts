import axios from 'axios'; 
import type { AuthTokens, AdminUser  } from '../contexts/AdminContext';

const ADMIN_API_URL = import.meta.env.VITE_ADMIN_API_URL || "http://localhost:8002";

export class AuthService {
  static async login(username: string, password: string): Promise<{ tokens: AuthTokens; user: AdminUser }> {
    const res = await axios.post(`${ADMIN_API_URL}/auth/login-json`, { username, password });
    
    const tokens: AuthTokens = {
      accessToken: res.data.access_token,
      refreshToken: res.data.refresh_token || res.data.access_token
    };
    
    const user: AdminUser = {
      id: res.data.user.id,
      username: res.data.user.username,
      email: res.data.user.email,
      firstName: res.data.user.first_name || '',
      lastName: res.data.user.last_name || '',
      isActive: res.data.user.is_active
    };

    // Store tokens and user in localStorage
    localStorage.setItem('admin_tokens', JSON.stringify(tokens));
    localStorage.setItem('admin_user', JSON.stringify(user));

    // Set default authorization header for future requests
    this.setAuthHeader(tokens.accessToken);

    return { tokens, user };
  }

  static async logout(accessToken: string): Promise<void> {
    try {
      if (accessToken) {
        await axios.post(
          `${ADMIN_API_URL}/auth/logout`,
          {},
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
      }
    } catch (error) {
      // Continue with logout even if API call fails
      console.warn('Logout API call failed:', error);
    } finally {
      // Always clear local storage
      this.clearTokens();
    }
  }

  static async refreshToken(refreshToken: string): Promise<AuthTokens> {
    const res = await axios.post(`${ADMIN_API_URL}/auth/refresh-token`, { refreshToken });
    
    const tokens: AuthTokens = {
      accessToken: res.data.access_token,
      refreshToken: refreshToken
    };

    // Update stored tokens
    localStorage.setItem('admin_tokens', JSON.stringify(tokens));
    this.setAuthHeader(tokens.accessToken);

    return tokens;
  }

  static getTokens(): AuthTokens | null {
    try {
      const tokensJson = localStorage.getItem('admin_tokens');
      return tokensJson ? JSON.parse(tokensJson) : null;
    } catch {
      return null;
    }
  }

  static getCurrentUser(): AdminUser | null {
    try {
      const userJson = localStorage.getItem('admin_user');
      return userJson ? JSON.parse(userJson) : null;
    } catch {
      return null;
    }
  }

  static setAuthHeader(accessToken: string): void {
    axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
  }

  static clearTokens(): void {
    localStorage.removeItem('admin_tokens');
    localStorage.removeItem('admin_user');
    this.clearAuthHeader();
  }

  static clearAuthHeader(): void {
    delete axios.defaults.headers.common['Authorization'];
  }
}