import React, { createContext, useContext, ReactNode, useState, useEffect } from "react";
import apiClient from "@/lib/api";
import axios from "axios";

interface Shop {
  id: string;
  name: string;
  ownerName: string;
  email: string;
  role: string;
  location: string;
  phoneNumber: string;
  description: string;
  isVerified: boolean;
  isBanned: boolean;
  isApproved: boolean;
  type: string;
}

interface ShopLoginCredentials {
  email: string;
  password: string;
}

interface AuthContextType {
  shop: Shop | null;
  login: (credentials: ShopLoginCredentials) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
  isAuthenticated: boolean;
}

const ShopAuthContext = createContext<AuthContextType | undefined>(undefined);

export const ShopAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [shop, setShop] = useState<Shop | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // check for existing token on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('shopToken');
      
      if (token) {
        setIsLoading(true);
        try {
          // Set the token in axios defaults to ensure it's used for this request
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Fetch the shop profile
          const response = await apiClient.get('/shops/profile');
          
          // If we got here, the token is valid
          setShop(response.data.data);
          setIsAuthenticated(true);
        } catch (err) {
          // console.error("Failed to validate shop token:", err);
          
          // Check if the error is specifically an authentication error (401)
          if (axios.isAxiosError(err) && err.response?.status === 401) {
            localStorage.removeItem('shopToken');
            setIsAuthenticated(false);
            setShop(null);
          } else {
            // For other errors (like network errors), maintain the authenticated state
            // This prevents logout on temporary API issues
            // console.log("Non-401 error, maintaining authenticated state");
            setIsAuthenticated(true);
          }
        } finally {
          setIsLoading(false);
        }
      } else {
        // No token found
        setIsAuthenticated(false);
        setShop(null);
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  const login = async (credentials: ShopLoginCredentials) => {
    setIsLoading(true);
    setError(null);
      try {
        // console.log("Attempting to login with credentials:", credentials);
        const response = await apiClient.post('/shop/auth/login', credentials);
                
        // console.log("Login response:", response);
        // Store token in local storage
        const token = response.data.data;
        if (token) {
          // console.log("Storing token in local storage");
          localStorage.setItem('shopToken', token);
          
          // after successful login, fetch user profile
          const shopResponse = await apiClient.get('/shops/profile', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setShop(shopResponse.data.data);
          setIsAuthenticated(true);
        } else {
          throw new Error("No token received from login response");
        }
      } catch (err: any) {
        // console.error('Login failed:', error);
        setError(err.response?.data?.message || "Login failed");
        setIsAuthenticated(false);
        throw err;
      } finally {
        setIsLoading(false);
      }
  };

  const logout = () => {
    localStorage.removeItem('shopToken');
    setShop(null);
    setIsAuthenticated(false);
  };


  return (
    <ShopAuthContext.Provider value={{
        shop,
        isAuthenticated,
        login,
        logout,
        isLoading,
        error,
        clearError: () => setError(null),
      }}
    >
      {children}
    </ShopAuthContext.Provider>
  );
};

export const useShopAuth = () => {
  const context = useContext(ShopAuthContext);
  if (context === undefined) {
    throw new Error("useShopAuth must be used within a ShopAuthProvider");
  }
  return context;
};
