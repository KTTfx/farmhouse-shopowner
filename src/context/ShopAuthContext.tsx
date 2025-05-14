
import { createContext, useContext, ReactNode, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface ShopUser {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  shopUser: ShopUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const ShopAuthContext = createContext<AuthContextType | undefined>(undefined);

export const ShopAuthProvider = ({ children }: { children: ReactNode }) => {
  const [shopUser, setShopUser] = useState<ShopUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if there's a stored shop token
    const token = localStorage.getItem('shopToken');
    if (token) {
      // For now, we'll set a mock user when token exists
      setShopUser({
        id: '1',
        name: 'Shop Owner',
        email: 'shop@example.com',
      });
      setIsAuthenticated(true);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // In a real implementation, this would call an API
      // For now, we'll simulate a successful login
      const mockUser = {
        id: '1',
        name: 'Shop Owner',
        email,
      };
      
      // Store token in local storage
      localStorage.setItem('shopToken', 'mock-token');
      setShopUser(mockUser);
      setIsAuthenticated(true);
      navigate('/');
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('shopToken');
    setShopUser(null);
    setIsAuthenticated(false);
    navigate('/auth');
  };

  return (
    <ShopAuthContext.Provider
      value={{
        shopUser,
        isAuthenticated,
        login,
        logout,
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
