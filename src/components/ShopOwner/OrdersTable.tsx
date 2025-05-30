import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  RefreshCw,
  Info,
  ShoppingBag,
  Package,
  Truck,
  CheckCircle,
  XCircle,
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
  shopId: string;
  quantity: number;
  price: number;
  fulfillmentStatus: 'PENDING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  statusUpdatedAt?: string;
  trackingNumber?: string;
  carrierName?: string;
  product: {
    id: string;
    name: string;
    description?: string;
    price: number;
    productImages?: string[];
  };
}

// Define interface for ShopOrder (grouped items by order)
interface ShopOrder {
  orderId: string;
  orderDate: string;
  order: {
    orderStatus: 'PROCESSING' | 'COMPLETED';
    totalAmount: number;
    shippingAddress?: {
      fullName: string;
      street: string;
      city: string;
      state: string;
      zipCode?: string;
      country: string;
      phone: string;
    };
  };
  customer: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  items: OrderItem[];
}

export const OrdersTable: React.FC = () => {
  const [orders, setOrders] = useState<ShopOrder[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<ShopOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<ShopOrder | null>(null);
  const [selectedOrderItem, setSelectedOrderItem] = useState<OrderItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStatusUpdateDialogOpen, setIsStatusUpdateDialogOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [trackingNumber, setTrackingNumber] = useState('');
  const [carrier, setCarrier] = useState('');
  const [notes, setNotes] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState("");
  const { toast } = useToast();

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const data = await orderService.getOrders();
      setOrders(data);
      setFilteredOrders(data);
    } catch (error) {
      // console.error("Error fetching orders:", error);
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

  // Filter orders based on status and search term
  useEffect(() => {
    let result = orders;
    
    // Filter by status if not "all"
    if (statusFilter !== "all") {
      result = orders.filter(order => 
        order.items.some(item => item.fulfillmentStatus === statusFilter)
      );
    }
    
    // Filter by search term if provided
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(order => 
        order.customer.firstName.toLowerCase().includes(term) ||
        order.customer.lastName.toLowerCase().includes(term) ||
        order.customer.email.toLowerCase().includes(term) ||
        order.orderId.toLowerCase().includes(term) ||
        order.items.some(item => 
          item.product.name.toLowerCase().includes(term)
        )
      );
    }
    
    setFilteredOrders(result);
  }, [statusFilter, searchTerm, orders]);

  useEffect(() => {
    if (!isStatusUpdateDialogOpen) {
      setTrackingNumber('');
      setCarrier('');
      setNotes('');
      setSelectedOrderItem(null);
      setUpdatingStatus('');
    }
  }, [isStatusUpdateDialogOpen]);

  const handleUpdateStatus = async (orderItemId: string, newStatus: string, additionalData = {}) => {
    try {
      setIsLoading(true);
      const data = {
        status: newStatus as 'PENDING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED',
        ...additionalData
      };
      
      await orderService.updateOrderItemStatus(orderItemId, data);
      
      toast({
        title: "Status Updated",
        description: `Item status has been updated to ${newStatus.toLowerCase()}.`,
      });
      
      fetchOrders(); // Refresh orders after update
    } catch (error) {
      // console.error("Error updating status:", error);
      toast({
        title: "Error",
        description: "Failed to update the status. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setIsStatusUpdateDialogOpen(false);
    }
  };

  const openStatusUpdateDialog = (item: OrderItem, status: string) => {
    setSelectedOrderItem(item);
    setUpdatingStatus(status);
    
    // Pre-fill tracking info if available
    if (item.trackingNumber) {
      setTrackingNumber(item.trackingNumber);
    }
    
    if (item.carrierName) {
      setCarrier(item.carrierName);
    }
    
    setIsStatusUpdateDialogOpen(true);
  };

  const handleViewDetails = (order: ShopOrder) => {
    setSelectedOrder(order);
    setIsDetailsOpen(true);
  };

  const getStatusBadge = (status: string) => {
    type StatusType = 'PENDING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
    
    const statusConfig = {
      'PENDING': { color: "bg-yellow-100 text-yellow-800", icon: <Package className="h-3 w-3 mr-1" /> },
      'SHIPPED': { color: "bg-purple-100 text-purple-800", icon: <Truck className="h-3 w-3 mr-1" /> },
      'DELIVERED': { color: "bg-green-100 text-green-800", icon: <CheckCircle className="h-3 w-3 mr-1" /> },
      'CANCELLED': { color: "bg-red-100 text-red-800", icon: <XCircle className="h-3 w-3 mr-1" /> },
    };
    
    const config = statusConfig[status as StatusType] || { color: "bg-gray-100 text-gray-800", icon: <Package className="h-3 w-3 mr-1" /> };
    
    return (
      <Badge variant="outline" className={`${config.color} hover:${config.color} flex items-center`}>
        {config.icon}
        {status.charAt(0) + status.slice(1).toLowerCase()}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'PPP');
    } catch (error) {
      return "Invalid date";
    }
  };

  const formatTime = (dateString: string) => {
    try {
      return format(new Date(dateString), 'p');
    } catch (error) {
      return "";
    }
  };

  // Calculate total for an order
  const calculateOrderTotal = (items: OrderItem[]) => {
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2);
  };
  
  // Get a shortened version of ID for display
  const getShortenedId = (id?: string) => {
    if (!id) return 'N/A';
    return id.length > 8 ? id.substring(0, 8) : id;
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
          <Input
            placeholder="Search orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-[200px]"
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Orders</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
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
              {statusFilter === "all" && !searchTerm
                ? "You haven't received any orders yet." 
                : "No orders match your current filters."}
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
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Item Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.orderId}>
                    <TableCell className="font-medium">#{getShortenedId(order.orderId)}</TableCell>
                    <TableCell>{formatDate(order.orderDate)}</TableCell>
                    <TableCell>
                      {order.customer 
                        ? `${order.customer.firstName} ${order.customer.lastName}`
                        : "Customer"}
                    </TableCell>
                    <TableCell>{order.items.length} item(s)</TableCell>
                    <TableCell>GH₵{calculateOrderTotal(order.items)}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex items-center">
                            {getStatusBadge(item.fulfillmentStatus)}
                          </div>
                        ))}
                      </div>
                    </TableCell>
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
              Order #{getShortenedId(selectedOrder?.orderId)} placed on {selectedOrder && formatDate(selectedOrder.orderDate)}
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              {/* Customer and Shipping Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Customer Information</h3>
                  <div className="text-sm">
                    <p><span className="font-medium">Name:</span> {selectedOrder.customer 
                      ? `${selectedOrder.customer.firstName} ${selectedOrder.customer.lastName}`
                      : "N/A"}</p>
                    <p><span className="font-medium">Email:</span> {selectedOrder.customer?.email || "N/A"}</p>
                    {selectedOrder.customer?.phone && (
                      <p><span className="font-medium">Phone:</span> {selectedOrder.customer.phone}</p>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Shipping Address</h3>
                  {selectedOrder.order.shippingAddress ? (
                    <div className="text-sm">
                      <p>{selectedOrder.order.shippingAddress.fullName}</p>
                      <p>{selectedOrder.order.shippingAddress.street}</p>
                      <p>{selectedOrder.order.shippingAddress.city}, {selectedOrder.order.shippingAddress.state} {selectedOrder.order.shippingAddress.zipCode}</p>
                      <p>{selectedOrder.order.shippingAddress.country}</p>
                      <p>{selectedOrder.order.shippingAddress.phone}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No shipping address provided</p>
                  )}
                </div>
              </div>
              
              {/* Order Items */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Order Items</h3>
                <div className="space-y-4">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="border rounded-md p-4">
                      <div className="flex flex-col sm:flex-row justify-between gap-4">
                        <div className="flex items-start gap-3">
                          {item.product.productImages && item.product.productImages.length > 0 ? (
                            <div className="h-16 w-16 rounded bg-gray-100 overflow-hidden flex-shrink-0">
                              <img 
                                src={item.product.productImages[0]} 
                                alt={item.product.name} 
                                className="h-full w-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="h-16 w-16 rounded bg-gray-100 flex items-center justify-center flex-shrink-0">
                              <Package className="h-8 w-8 text-gray-400" />
                            </div>
                          )}
                          
                          <div>
                            <h4 className="font-medium">{item.product.name}</h4>
                            <div className="text-sm text-gray-500 mt-1">
                              <p>Price: GH₵{item.price.toFixed(2)} × {item.quantity}</p>
                              <p>Total: GH₵{(item.price * item.quantity).toFixed(2)}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col gap-2 items-end">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">Status:</span>
                            {getStatusBadge(item.fulfillmentStatus)}
                          </div>
                          
                          {item.statusUpdatedAt && (
                            <div className="text-xs text-gray-500">
                              Updated: {formatDate(item.statusUpdatedAt)} at {formatTime(item.statusUpdatedAt)}
                            </div>
                          )}
                          
                          {(item.trackingNumber || item.carrierName) && (
                            <div className="text-xs border-t pt-2 mt-1 text-gray-600">
                              {item.carrierName && <p>Carrier: {item.carrierName}</p>}
                              {item.trackingNumber && <p>Tracking: {item.trackingNumber}</p>}
                            </div>
                          )}
                          
                          <div className="mt-2">
                            <Select 
                              onValueChange={(value) => openStatusUpdateDialog(item, value)}
                              value=""
                            >
                              <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Update Status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="SHIPPED">Shipped</SelectItem>
                                <SelectItem value="DELIVERED">Delivered</SelectItem>
                                <SelectItem value="CANCELLED">Cancelled</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Order Summary */}
              <div className="border-t pt-4">
                <div className="flex justify-between">
                  <span className="font-medium">Total Amount:</span>
                  <span className="font-bold">GH₵{calculateOrderTotal(selectedOrder.items)}</span>
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

      {/* Status Update Dialog */}
      <Dialog open={isStatusUpdateDialogOpen} onOpenChange={setIsStatusUpdateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Item Status</DialogTitle>
            <DialogDescription>
              Update status to {updatingStatus.toLowerCase()} for {selectedOrderItem?.product?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {updatingStatus === 'SHIPPED' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="carrier">Shipping Carrier</Label>
                  <Input
                    id="carrier"
                    placeholder="e.g. DHL, UPS, Ghana Post, Dispatch rider number plate"
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
              </>
            )}
            
            {updatingStatus === 'CANCELLED' && (
              <div className="space-y-2">
                <Label htmlFor="notes">Cancellation Reason</Label>
                <Textarea
                  id="notes"
                  placeholder="Please provide a reason for cancellation"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  required
                />
              </div>
            )}
            
            {(updatingStatus !== 'SHIPPED' && updatingStatus !== 'CANCELLED') && (
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Add any additional notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsStatusUpdateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (selectedOrderItem) {
                  const additionalData: Record<string, string> = {};
                  
                  if (updatingStatus === 'SHIPPED') {
                    if (carrier.trim()) additionalData.carrierName = carrier.trim();
                    if (trackingNumber.trim()) additionalData.trackingNumber = trackingNumber.trim();
                  }
                  
                  if (notes.trim()) {
                    additionalData.notes = notes.trim();
                  }
                  
                  handleUpdateStatus(selectedOrderItem.id, updatingStatus, additionalData);
                }
              }}
              disabled={updatingStatus === 'CANCELLED' && !notes.trim()}
              variant={updatingStatus === 'CANCELLED' ? "destructive" : "default"}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrdersTable;