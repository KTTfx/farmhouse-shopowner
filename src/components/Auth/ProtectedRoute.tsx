
import { Navigate, Outlet } from "react-router-dom";
import { useShopAuth } from "@/context/ShopAuthContext";

export const ProtectedRoute = () => {
  const { isAuthenticated } = useShopAuth();

  return isAuthenticated ? <Outlet /> : <Navigate to="/auth" />;
};
