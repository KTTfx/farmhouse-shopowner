import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  Truck, 
//   Package, 
  Clock, 
  CheckCircle, 
  XCircle, 
//   Filter, 
  RefreshCw,
  Info,
  ShoppingBag
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import orderService from "@/services/order.service";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
//   CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

// Define interface for OrderItem
interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    name: string;
    description?: string;
    price: number;
  };
}

// Define interface for Order
interface Order {
  id: string;
  userId: string;
  totalAmount: number;
  orderStatus: 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
  orderItems: OrderItem[];
  user?: {
    firstName: string;
    lastName: string;
    email: string;
  };
  shippingAddress?: {
    fullName: string;
    street: string;
    city: string;
    state: string;
    zipCode?: string;
    country: string;
    phone: string;
  };
}

export const OrdersTable: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { toast } = useToast();

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const data = await orderService.getOrders();
      setOrders(data);
      setFilteredOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast({
        title: "Error",
        description: "Failed to fetch orders. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Filter orders based on status
  useEffect(() => {
    if (statusFilter === "all") {
      setFilteredOrders(orders);
    } else {
      setFilteredOrders(
        orders.filter((order) => order.orderStatus === statusFilter)
      );
    }
  }, [statusFilter, orders]);

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    setIsUpdatingStatus(true);
    try {
      await orderService.updateOrderStatus(orderId, newStatus);
      
      // Update the order in the state
      const updatedOrders = orders.map((order) =>
        order.id === orderId
          ? { ...order, orderStatus: newStatus as 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' }
          : order
      );
      
      setOrders(updatedOrders);
      
      // Update selected order if it's open
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({
          ...selectedOrder,
          orderStatus: newStatus as 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
        });
      }
      
      toast({
        title: "Status Updated",
        description: `Order status has been updated to ${newStatus}.`,
        variant: "default"
      });
    } catch (error) {
      console.error("Error updating order status:", error);
      toast({
        title: "Error",
        description: "Failed to update order status. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailsOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PROCESSING':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">Processing</Badge>;
      case 'SHIPPED':
        return <Badge variant="outline" className="bg-amber-100 text-amber-800 hover:bg-amber-100">Shipped</Badge>;
      case 'DELIVERED':
        return <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">Delivered</Badge>;
      case 'CANCELLED':
        return <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'PPP');
    } catch (error) {
      return "Invalid date";
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Orders Management</h2>
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="border rounded-lg">
          <Skeleton className="h-80 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold">Orders Management</h2>
        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Orders</SelectItem>
              <SelectItem value="PROCESSING">Processing</SelectItem>
              <SelectItem value="SHIPPED">Shipped</SelectItem>
              <SelectItem value="DELIVERED">Delivered</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={fetchOrders} variant="outline" size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {filteredOrders.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <ShoppingBag className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <CardTitle className="text-xl mb-2">No orders found</CardTitle>
            <CardDescription>
              {statusFilter === "all" 
                ? "You haven't received any orders yet." 
                : `You don't have any orders with status: ${statusFilter.toLowerCase()}.`}
            </CardDescription>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id.substring(0, 8)}...</TableCell>
                    <TableCell>{formatDate(order.createdAt)}</TableCell>
                    <TableCell>
                      {order.user 
                        ? `${order.user.firstName} ${order.user.lastName}`
                        : (order.shippingAddress?.fullName || "Customer")}
                    </TableCell>
                    <TableCell>GH₵{order.totalAmount.toFixed(2)}</TableCell>
                    <TableCell>{getStatusBadge(order.orderStatus)}</TableCell>
                    <TableCell className="text-right">
                      <Button onClick={() => handleViewDetails(order)} variant="ghost" size="sm">
                        <Info className="h-4 w-4 mr-2" />
                        Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Order Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>
              Order #{selectedOrder?.id.substring(0, 8)} placed on {selectedOrder && formatDate(selectedOrder.createdAt)}
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              {/* Status and Actions */}
              <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center border-b pb-4">
                <div>
                  <h3 className="text-sm font-medium">Current Status</h3>
                  <div className="mt-1">
                    {getStatusBadge(selectedOrder.orderStatus)}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-medium mr-2">Update Status:</h3>
                  <Select 
                    disabled={isUpdatingStatus} 
                    value={selectedOrder.orderStatus}
                    onValueChange={(value) => handleUpdateStatus(selectedOrder.id, value)}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PROCESSING">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-blue-500" />
                          Processing
                        </div>
                      </SelectItem>
                      <SelectItem value="SHIPPED">
                        <div className="flex items-center">
                          <Truck className="h-4 w-4 mr-2 text-amber-500" />
                          Shipped
                        </div>
                      </SelectItem>
                      <SelectItem value="DELIVERED">
                        <div className="flex items-center">
                          <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                          Delivered
                        </div>
                      </SelectItem>
                      <SelectItem value="CANCELLED">
                        <div className="flex items-center">
                          <XCircle className="h-4 w-4 mr-2 text-red-500" />
                          Cancelled
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Customer Information */}
              <div>
                <h3 className="text-base font-medium mb-2">Customer Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {selectedOrder.user ? (
                    <>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Name</h4>
                        <p>{selectedOrder.user.firstName} {selectedOrder.user.lastName}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Email</h4>
                        <p>{selectedOrder.user.email}</p>
                      </div>
                    </>
                  ) : selectedOrder.shippingAddress ? (
                    <>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Name</h4>
                        <p>{selectedOrder.shippingAddress.fullName}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Phone</h4>
                        <p>{selectedOrder.shippingAddress.phone}</p>
                      </div>
                    </>
                  ) : (
                    <div>
                      <p className="text-gray-500">Customer information not available</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Shipping Information */}
              {selectedOrder.shippingAddress && (
                <div>
                  <h3 className="text-base font-medium mb-2">Shipping Information</h3>
                  <div className="grid grid-cols-1 gap-2">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Address</h4>
                      <p>
                        {selectedOrder.shippingAddress.street}, {selectedOrder.shippingAddress.city}, {" "}
                        {selectedOrder.shippingAddress.state}, {selectedOrder.shippingAddress.country}{" "}
                        {selectedOrder.shippingAddress.zipCode}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Phone</h4>
                      <p>{selectedOrder.shippingAddress.phone}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Order Items */}
              <div>
                <h3 className="text-base font-medium mb-2">Order Items</h3>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead className="text-right">Quantity</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {/* Only show products from this shop */}
                      {selectedOrder.orderItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.product?.name || "Product"}</TableCell>
                          <TableCell className="text-right">{item.quantity}</TableCell>
                          <TableCell className="text-right">GH₵{item.price.toFixed(2)}</TableCell>
                          <TableCell className="text-right">GH₵{(item.price * item.quantity).toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Order Summary */}
              <div className="border-t pt-4">
                <h3 className="text-base font-medium mb-2">Order Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Subtotal</span>
                    <span>GH₵{selectedOrder.totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Platform Fee (5%)</span>
                    <span>GH₵{(selectedOrder.totalAmount * 0.05).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>Total</span>
                    <span>GH₵{(selectedOrder.totalAmount * 1.05).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setIsDetailsOpen(false)} variant="outline">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrdersTable;