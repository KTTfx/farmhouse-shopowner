import { createContext, useContext, ReactNode, useState, useEffect } from "react";
import apiClient from "@/lib/api";
import { useNavigate } from "react-router-dom";
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
  isAuthenticated: boolean;
  login: (credentials: ShopLoginCredentials) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

const ShopAuthContext = createContext<AuthContextType | undefined>(undefined);

export const ShopAuthProvider = ({ children }: { children: ReactNode }) => {
  const [shop, setShopUser] = useState<Shop | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // check for existing token on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('shopToken');
      if (token) {
        try {
          setIsLoading(true);
          // check token validity by making a request to the backend
          const response = await apiClient.get('/shops/profile');
          setShopUser(response.data.data);
          setIsAuthenticated(true);
        } catch (err) {
          console.error("Failed to validate token:", err);
          setError("Token validation failed");
        } finally {
          setIsLoading(false);
        }
      }
    }
    checkAuth();
  }, []);

  const login = async (credentials: ShopLoginCredentials) => {
    setIsLoading(true);
    setError(null);
      try {
        console.log("Attempting to login with credentials:", credentials);
        const response = await apiClient.post('/shop/auth/login', credentials);
                
        console.log("Login response:", response);
        // Store token in local storage
        const token = response.data.data;
        if (token) {
          console.log("Storing token in local storage");
          localStorage.setItem('shopToken', token);
          
          // after successful login, fetch user profile
          const shopUserResponse = await apiClient.get('/shops/profile', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setShopUser(shopUserResponse.data.data);
          setIsAuthenticated(true);
        } else {
          throw new Error("No token received from login response");
        }
      } catch (err: any) {
        console.error('Login failed:', error);
        setError(err.response?.data?.message || "Login failed");
        setIsAuthenticated(false);
        throw err;
      } finally {
        setIsLoading(false);
      }
  };

  const logout = () => {
    localStorage.removeItem('shopToken');
    setShopUser(null);
    setIsAuthenticated(false);
    navigate('/auth');
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
