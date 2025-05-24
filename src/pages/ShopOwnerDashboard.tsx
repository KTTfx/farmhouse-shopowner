import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  AlertCircle,
  Eye, 
  Package, 
  ShoppingBag, 
  Store, 
  Settings, 
  LogOut,
  Loader2,
  Tag,
  TrendingUp
} from "lucide-react";
import { ProductForm } from "@/components/ShopOwner/ProductForm";
import { useShopAuth } from "@/context/ShopAuthContext";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import shopsService from "@/services/shop.service";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductsList } from "@/components/ShopOwner/ProductsList";
import { ShopSettings } from "@/components/ShopOwner/ShopSettings";
import { CategoryManager } from "@/components/ShopOwner/CategoryManager";
import { OrdersTable } from "@/components/ShopOwner/OrdersTable";

// Define types for shop profile data
interface ShopProfile {
  id: string;
  name: string;
  status: string;
  productsCount: number;
  ordersCount: number;
  viewsToday: number;
  revenue: {
    month: number;
    total: number;
  };
  // Add other properties as needed
}

const ShopOwnerDashboard = () => {
  const { shop, logout } = useShopAuth();
  const [shopProfile, setShopProfile] = useState<ShopProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("products");

  useEffect(() => { 
    const fetchShopData = async () => {
      if (!shop) return;

      try {
        setLoading(true);
        setError(null);
        const shopData = await shopsService.getShopProfile();
        setShopProfile(shopData);
      } catch (err) {
        console.error("Error fetching shop data:", err);
        setError("Failed to fetch shop profile. Please try refreshing the page.");
      } finally {
        setLoading(false);
      }
    };

    fetchShopData();
  }, [shop]);

  // Loading state
  if (loading) {
    return (
        <div className="py-8 px-4 md:py-12">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <Skeleton className="h-8 w-64 mb-2" />
                <Skeleton className="h-6 w-40" />
              </div>
              <Skeleton className="h-10 w-28" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i}>
                  <CardContent className="p-4 md:p-6">
                    <Skeleton className="h-16 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <Skeleton className="h-12 w-full mb-4" />
            <Skeleton className="h-[400px] w-full" />
          </div>
        </div>
    );
  }

  // Error state
  if (error) {
    return (
        <div className="py-8 px-4 md:py-12">
          <div className="max-w-7xl mx-auto">
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <Button onClick={() => window.location.reload()}>
              Refresh Page
            </Button>
          </div>
        </div>
    );
  }

  // If shop profile is not loaded yet
  if (!shopProfile) {
    return (
        <div className="flex items-center justify-center h-[80vh]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-ghana-green" />
            <p>Loading shop profile...</p>
          </div>
        </div>
    );
  }

  return (
      <div className="py-8 px-4 md:py-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Shop Dashboard</h1>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-lg text-gray-600">{shopProfile.name}</p>
                <Badge variant={shopProfile.status === 'active' ? 'default' : 'secondary'} className="bg-ghana-green">
                  {shopProfile.status === 'active' ? 'Active' : 'Hidden'}
                </Badge>
              </div>
            </div>
            <Button 
              variant="outline" 
              className="flex gap-2 items-center"
              onClick={logout}
            >
              <LogOut size={16} />
              Logout
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4 md:p-6 flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">Products</p>
                  <p className="text-xl md:text-2xl font-bold">{shopProfile.productsCount || 0}</p>
                </div>
                <Store className="h-6 md:h-8 w-6 md:w-8 text-ghana-green opacity-80" />
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 md:p-6 flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">Total Orders</p>
                  <p className="text-xl md:text-2xl font-bold">{shopProfile.ordersCount || 0}</p>
                </div>
                <ShoppingBag className="h-6 md:h-8 w-6 md:w-8 text-ghana-green opacity-80" />
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 md:p-6 flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">Today's Views</p>
                  <p className="text-xl md:text-2xl font-bold">{shopProfile.viewsToday || 0}</p>
                </div>
                <Eye className="h-6 md:h-8 w-6 md:w-8 text-ghana-green opacity-80" />
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 md:p-6 flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">Monthly Revenue</p>
                  <p className="text-xl md:text-2xl font-bold">GH₵{shopProfile.revenue?.month || 0}</p>
                </div>
                <TrendingUp className="h-6 md:h-8 w-6 md:w-8 text-ghana-green opacity-80" />
              </CardContent>
            </Card>
          </div>
          
          <Tabs 
            defaultValue="products" 
            className="w-full"
            value={activeTab}
            onValueChange={setActiveTab}
          >
            <TabsList className="h-auto py-2 px-2 bg-muted justify-center w-full">
              <TabsTrigger value="products" className="px-4 py-2 text-xs mx-1">
                <Store className="h-5 w-5" />
                <span className="hidden md:inline ml-1.5">Products</span>
              </TabsTrigger>
              <TabsTrigger value="add-product" className="px-4 py-2 text-xs mx-1">
                <Package className="h-5 w-5" />
                <span className="hidden md:inline ml-1.5">Add Product</span>
              </TabsTrigger>
              <TabsTrigger value="categories" className="px-4 py-2 text-xs mx-1">
                <Tag className="h-5 w-5" />
                <span className="hidden md:inline ml-1.5">Categories</span>
              </TabsTrigger>
              <TabsTrigger value="orders" className="px-4 py-2 text-xs mx-1">
                <ShoppingBag className="h-5 w-5" />
                <span className="hidden md:inline ml-1.5">Orders</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="px-4 py-2 text-xs mx-1">
                <Settings className="h-5 w-5" />
                <span className="hidden md:inline ml-1.5">Settings</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="products">
              <Card>
                <CardHeader>
                  <CardTitle>Manage Products</CardTitle>
                  <CardDescription>List, edit, and add new products to your shop.</CardDescription>
                </CardHeader>
                <CardContent>
                  <ProductsList shopId={shopProfile.id} />
                  {/* {shopProfile.productsCount > 0 ? (
                    <ProductsList shopId={shopProfile.id} />
                  ) : (
                    <div className="text-center py-8 md:py-12">
                      <Store className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-lg text-gray-500">You don't have any products yet</p>
                      <Button 
                        onClick={() => setActiveTab("add-product")}
                        className="mt-4"
                      >
                        Add Your First Product
                      </Button>
                    </div>
                  )} */}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="add-product">
              <Card>
                <CardHeader>
                  <CardTitle>Add New Product</CardTitle>
                  <CardDescription>Enter details to list a new product in your shop.</CardDescription>
                </CardHeader>
                <CardContent>
                  <ProductForm shopId={shopProfile.id} onSuccess={() => setActiveTab("products")} />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="categories">
              <Card>
                <CardHeader>
                  <CardTitle>Manage Categories</CardTitle>
                  <CardDescription>Create and manage product categories for your shop.</CardDescription>
                </CardHeader>
                <CardContent>
                  <CategoryManager shopId={shopProfile.id} />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="orders">
              <Card>
                <CardHeader>
                  <CardTitle>Manage Orders</CardTitle>
                  <CardDescription>View and process customer orders.</CardDescription>
                </CardHeader>                <CardContent>
                  <OrdersTable />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle>Shop Settings</CardTitle>
                  <CardDescription>Manage your shop details and preferences.</CardDescription>
                </CardHeader>
                <CardContent>
                  <ShopSettings shopProfile={shopProfile} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
  );
};

export default ShopOwnerDashboard;