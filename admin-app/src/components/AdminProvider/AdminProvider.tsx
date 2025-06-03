import React, { createContext, useContext, useState, useEffect } from "react";
import type { AdminUser, AuthTokens } from "../../contexts/AdminContext";
import { AuthService } from "../../services/AuthService";

interface AdminContextType {
  adminUser: AdminUser | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAdminUser: (user: AdminUser | null) => void;
  setTokens: (tokens: AuthTokens | null) => void;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [tokens, setTokens] = useState<AuthTokens | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on app load
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedTokens = AuthService.getTokens();
        const storedUser = AuthService.getCurrentUser();

        if (storedTokens && storedUser) {
          setTokens(storedTokens);
          setAdminUser(storedUser);
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        // Clear invalid data
        AuthService.logout("");
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const { tokens: newTokens, user } = await AuthService.login(username, password);
      setTokens(newTokens);
      setAdminUser(user);
      return true;
    } catch (error) {
      console.error("Login failed:", error);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      if (tokens?.accessToken) {
        await AuthService.logout(tokens.accessToken);
      }
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setAdminUser(null);
      setTokens(null);
    }
  };

  const isAuthenticated = !!(tokens && adminUser);

  return (
    <AdminContext.Provider
      value={{
        adminUser,
        tokens,
        isAuthenticated,
        isLoading,
        setAdminUser,
        setTokens,
        login,
        logout,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdminContext = () => {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdminContext must be used within AdminProvider");
  return ctx;
};