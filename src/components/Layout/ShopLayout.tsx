
import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useShopAuth } from "@/context/ShopAuthContext";

interface ShopLayoutProps {
  children: ReactNode;
}

export const ShopLayout = ({ children }: ShopLayoutProps) => {
  const { isAuthenticated, logout } = useShopAuth();

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-ghana-green text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link to="/" className="font-bold text-xl">Shop Owner Portal</Link>
            <nav>
              {isAuthenticated ? (
                <Button variant="ghost" className="text-white" onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" /> Logout
                </Button>
              ) : (
                <Link to="/auth" className="text-white hover:text-white/80">
                  Login
                </Link>
              )}
            </nav>
          </div>
        </div>
      </header>
      <main className="flex-grow">{children}</main>
      <footer className="bg-gray-100 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            © {new Date().getFullYear()} Shop Owner Portal. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};
