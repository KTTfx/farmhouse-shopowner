import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ShopOwnerDashboard from "./pages/ShopOwnerDashboard";
import ShopAuth from "./pages/ShopAuth";
import NotFound from "./pages/NotFound";
import LandingPage from "./pages/LandingPage";
import { ShopAuthProvider } from "./context/ShopAuthContext";
import { ThemeProvider } from "next-themes";
import { ProtectedRoute } from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router>
          <ShopAuthProvider>
            <Toaster />
            <Sonner />
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/auth" element={<ShopAuth />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <ShopOwnerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </ShopAuthProvider>
        </Router>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
