import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
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
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  const [isShippingDialogOpen, setIsShippingDialogOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [carrier, setCarrier] = useState('');
  const [cancelReason, setCancelReason] = useState('');
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

  useEffect(() => {
    if (!isShippingDialogOpen) {
      setCarrier('');
      setTrackingNumber('');
    }
    if (!isCancelDialogOpen) {
      setCancelReason('');
    }
  }, [isShippingDialogOpen, isCancelDialogOpen]);

  const handleShipOrder = async (orderId: string, trackingInfo?: { trackingNumber?: string; carrier?: string }) => {
    try {
      setIsLoading(true);
      await orderService.shipOrder(orderId, trackingInfo);
      toast({
        title: "Order Shipped",
        description: "The order has been successfully shipped.",
        // variant: "success"
      });
      fetchOrders(); // Refresh orders after shipping
    } catch (error) {
      console.error("Error shipping order:", error);
      toast({
        title: "Error",
        description: "Failed to ship the order. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeliverOrder = async (orderId: string) => {
    try {
      setIsLoading(true);
      await orderService.deliverOrder(orderId);
      toast({
        title: "Order Delivered",
        description: "The order has been marked as delivered.",
        // variant: "success"
      });
      fetchOrders(); // Refresh orders after delivery
    } catch (error) {
      console.error("Error delivering order:", error);
      toast({
        title: "Error",
        description: "Failed to deliver the order. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleCancelOrder = async (orderId: string, reason: string) => {
    try {
      setIsLoading(true);
      await orderService.cancelOrder(orderId, reason);
      toast({
        title: "Order Cancelled",
        description: "The order has been successfully cancelled.",
        // variant: "success"
      });
      fetchOrders(); // Refresh orders after cancellation
    } catch (error) {
      console.error("Error cancelling order:", error);
      toast({
        title: "Error",
        description: "Failed to cancel the order. Please try again.",
        variant: "destructive"
      });
    }
    finally {
      setIsLoading(false);
    }
  }

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
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
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
                  <h3 className="text-sm font-medium mr-2">Actions:</h3>
                  
                  {selectedOrder.orderStatus === 'PROCESSING' && (
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => {
                          setIsShippingDialogOpen(true);
                        }}
                        size="sm"
                        variant="outline"
                        className="border-amber-500 text-amber-500 hover:bg-amber-50"
                      >
                        Ship Order
                      </Button>
                      
                      <Button 
                        onClick={() => {
                          setCancelReason('');
                          setIsCancelDialogOpen(true);
                        }}
                        size="sm"
                        variant="outline"
                        className="border-red-500 text-red-500 hover:bg-red-50"
                      >
                        Cancel Order
                      </Button>
                    </div>
                  )}
                  
                  {selectedOrder.orderStatus === 'SHIPPED' && (
                    <Button 
                      onClick={() => handleDeliverOrder(selectedOrder.id)}
                      size="sm"
                      variant="outline"
                      className="border-green-500 text-green-500 hover:bg-green-50"
                    >
                      Mark as Delivered
                    </Button>
                  )}
                  
                  {(selectedOrder.orderStatus === 'DELIVERED' || selectedOrder.orderStatus === 'CANCELLED') && (
                    <p className="text-sm text-gray-500 italic">No actions available</p>
                  )}
                </div>
              </div>
              
              {/* Customer and Shipping Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Customer Information</h3>
                  <div className="text-sm">
                    <p><span className="font-medium">Name:</span> {selectedOrder.user 
                      ? `${selectedOrder.user.firstName} ${selectedOrder.user.lastName}`
                      : (selectedOrder.shippingAddress?.fullName || "N/A")}</p>
                    <p><span className="font-medium">Email:</span> {selectedOrder.user?.email || "N/A"}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Shipping Address</h3>
                  {selectedOrder.shippingAddress ? (
                    <div className="text-sm">
                      <p>{selectedOrder.shippingAddress.fullName}</p>
                      <p>{selectedOrder.shippingAddress.street}</p>
                      <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zipCode}</p>
                      <p>{selectedOrder.shippingAddress.country}</p>
                      <p>{selectedOrder.shippingAddress.phone}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No shipping address provided</p>
                  )}
                </div>
              </div>
              
              {/* Order Items */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Order Items</h3>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead className="text-right">Quantity</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedOrder.orderItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.product?.name || `Product ${item.productId.substring(0, 8)}`}</TableCell>
                          <TableCell className="text-right">GH₵{item.price.toFixed(2)}</TableCell>
                          <TableCell className="text-right">{item.quantity}</TableCell>
                          <TableCell className="text-right">GH₵{(item.price * item.quantity).toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
              
              {/* Order Summary */}
              <div className="border-t pt-4">
                <div className="flex justify-between">
                  <span className="font-medium">Total Amount:</span>
                  <span className="font-bold">GH₵{selectedOrder.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Shipping Dialog */}
      <Dialog open={isShippingDialogOpen} onOpenChange={setIsShippingDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ship Order</DialogTitle>
            <DialogDescription>
              Enter shipping details for order #{selectedOrder?.id.substring(0, 8)}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="carrier">Shipping Carrier</Label>
              <Input
                id="carrier"
                placeholder="e.g. DHL, UPS, Ghana Post"
                value={carrier}
                onChange={(e) => setCarrier(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="tracking">Tracking Number (Optional)</Label>
              <Input
                id="tracking"
                placeholder="Enter tracking number"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsShippingDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (selectedOrder) {
                  handleShipOrder(selectedOrder.id, {
                    carrier: carrier.trim() || undefined,
                    trackingNumber: trackingNumber.trim() || undefined
                  });
                  setIsShippingDialogOpen(false);
                }
              }}
            >
              Ship Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancellation Dialog */}
      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Order</DialogTitle>
            <DialogDescription>
              Please provide a reason for cancelling this order.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Cancellation Reason</Label>
              <Textarea
                id="reason"
                placeholder="e.g. Item out of stock, customer requested cancellation"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={3}
                required
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCancelDialogOpen(false)}
            >
              Back
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (selectedOrder && cancelReason.trim()) {
                  handleCancelOrder(selectedOrder.id, cancelReason.trim());
                  setIsCancelDialogOpen(false);
                }
              }}
              disabled={!cancelReason.trim()}
            >
              Cancel Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrdersTable;