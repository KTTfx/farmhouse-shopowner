
import { useState, useEffect } from "react";
import { ShopLayout } from "@/components/Layout/ShopLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, Package, ShoppingBag, Store, TrendingUp, Users, Settings, LogOut } from "lucide-react";
import { ProductForm } from "@/components/ShopOwner/ProductForm";
import { useShopAuth } from "@/context/ShopAuthContext";
import { Button } from "@/components/ui/button";

const ShopOwnerDashboard = () => {
  // Mock data
  const [shopData, setShopData] = useState({
    name: "Accra Fashion Hub",
    status: "active",
    productsCount: 12,
    ordersCount: 28,
    pendingOrders: 3,
    viewsToday: 45,
    revenue: {
      today: 350,
      week: 1250,
      month: 5200
    }
  });

  const { shopUser, logout } = useShopAuth();

  // Add useEffect to fetch shop data in a real implementation
  useEffect(() => {
    // This would be an API call in a real implementation
    console.log("Dashboard mounted");
  }, []);

  return (
    <ShopLayout>
      <div className="py-8 px-4 md:py-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Shop Dashboard</h1>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-lg text-gray-600">{shopData.name}</p>
                <Badge variant={shopData.status === 'active' ? 'default' : 'secondary'} className="bg-ghana-green">
                  {shopData.status === 'active' ? 'Active' : 'Hidden'}
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
                  <p className="text-xl md:text-2xl font-bold">{shopData.productsCount}</p>
                </div>
                <Store className="h-6 md:h-8 w-6 md:w-8 text-ghana-green opacity-80" />
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 md:p-6 flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">Total Orders</p>
                  <p className="text-xl md:text-2xl font-bold">{shopData.ordersCount}</p>
                </div>
                <ShoppingBag className="h-6 md:h-8 w-6 md:w-8 text-ghana-green opacity-80" />
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 md:p-6 flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">Today's Views</p>
                  <p className="text-xl md:text-2xl font-bold">{shopData.viewsToday}</p>
                </div>
                <Eye className="h-6 md:h-8 w-6 md:w-8 text-ghana-green opacity-80" />
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 md:p-6 flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">Monthly Revenue</p>
                  <p className="text-xl md:text-2xl font-bold">GH₵{shopData.revenue.month}</p>
                </div>
                <TrendingUp className="h-6 md:h-8 w-6 md:w-8 text-ghana-green opacity-80" />
              </CardContent>
            </Card>
          </div>
          
          <Tabs defaultValue="products" className="w-full">
            <TabsList className="h-auto py-2 px-2 bg-muted justify-center w-full">
              <TabsTrigger value="products" className="px-4 py-2 text-xs mx-1">
                <Store className="h-5 w-5" />
                <span className="hidden md:inline ml-1.5">Products</span>
              </TabsTrigger>
              <TabsTrigger value="add-product" className="px-4 py-2 text-xs mx-1">
                <Package className="h-5 w-5" />
                <span className="hidden md:inline ml-1.5">Add</span>
              </TabsTrigger>
              <TabsTrigger value="orders" className="px-4 py-2 text-xs mx-1">
                <ShoppingBag className="h-5 w-5" />
                <span className="hidden md:inline ml-1.5">Orders</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="px-4 py-2 text-xs mx-1">
                <TrendingUp className="h-5 w-5" />
                <span className="hidden md:inline ml-1.5">Analytics</span>
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
                  <div className="text-center py-8 md:py-12">
                    <Store className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg text-gray-500">Products management coming soon</p>
                  </div>
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
                  <ProductForm />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="orders">
              <Card>
                <CardHeader>
                  <CardTitle>Manage Orders</CardTitle>
                  <CardDescription>View and process customer orders.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 md:py-12">
                    <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg text-gray-500">Order management coming soon</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="analytics">
              <Card>
                <CardHeader>
                  <CardTitle>Sales Analytics</CardTitle>
                  <CardDescription>Track your shop's performance over time.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 md:py-12">
                    <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg text-gray-500">Analytics dashboards coming soon</p>
                  </div>
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
                  <div className="text-center py-8 md:py-12">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg text-gray-500">Shop settings coming soon</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ShopLayout>
  );
};

export default ShopOwnerDashboard;
