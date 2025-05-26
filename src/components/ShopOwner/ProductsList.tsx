import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  Pencil, 
  Trash2, 
  Eye, 
  Search,
  AlertCircle,
  RefreshCw,
  ArrowUpDown,
  Package,
  Loader2
} from "lucide-react";
import { X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import categoryService from "@/services/category.service";
import { Input } from "@/components/ui/input";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import productsService from "@/services/product.service";

interface Product {
  id: string;
  name: string;
  price: number;
  stockQuantity: number;
  categoryId: string;
  status: 'active' | 'draft' | 'out_of_stock';
  productImage: string;
  description: string;
  createdAt: string;
  category: {
    id: string;
    name: string;
  }
}

interface ProductsListProps {
  shopId: string;
}

export const ProductsList = ({ shopId }: ProductsListProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    price: '',
    stockQuantity: '',
    categoryId: '',
    description: '',
  });
  const [editImages, setEditImages] = useState<File[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [sortField, setSortField] = useState<'name' | 'price' | 'inventory' | 'createdAt'>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const { toast } = useToast();

  // Fetch products
  const fetchProducts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await productsService.getShopProducts(shopId);
      setProducts(response);
    } catch (err) {
      console.error("Failed to fetch products:", err);
      setError("Failed to load products. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize products
  useEffect(() => {
    fetchProducts();
  }, [shopId]);

  // Handle product deletion
  const handleDeleteProduct = async () => {
    if (!selectedProduct) return;
    
    setIsActionLoading(true);
    try {
      await productsService.deleteProduct(selectedProduct.id);
      toast({
        title: "Product deleted",
        description: `The product "${selectedProduct.name}" has been successfully deleted.`,
        // variant: "success",
      })
      setProducts(products.filter(p => p.id !== selectedProduct.id));
      setIsDeleteDialogOpen(false);
      setSelectedProduct(null);
    } catch (err) {
      console.error("Failed to delete product:", err);
      toast({
        title: "Error",
        description: "Failed to delete product. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      // Assuming you have a categoryService
      const response = await categoryService.getCategories();
      setCategories(response);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
      setCategories([]);
    }
  };

  // Add a function to load product data into the edit form
  const handleEditClick = (product: Product) => {
    setSelectedProduct(product);
    setEditFormData({
      name: product.name,
      price: product.price.toString(),
      stockQuantity: product.stockQuantity.toString(),
      categoryId: product.categoryId,
      description: product.description || '',
    });
    setPreviewImages(product.productImage ? [product.productImage] : []);
    setIsEditDialogOpen(true);
    fetchCategories();
  };

  // Add a function to handle image upload in the edit form
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const files = Array.from(e.target.files);
    setEditImages(files);
    
    // Create preview URLs
    const fileUrls = files.map(file => URL.createObjectURL(file));
    setPreviewImages(fileUrls);
  };

  // Add a function to submit the edit form
  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', editFormData.name);
      formData.append('price', editFormData.price);
      formData.append('stockQuantity', editFormData.stockQuantity);
      formData.append('categoryId', editFormData.categoryId);
      formData.append('description', editFormData.description);
      
      // Append any new images
      editImages.forEach(image => {
        formData.append('productImages', image);
      });
      
      const updatedProduct = await productsService.updateProduct(selectedProduct.id, formData);
      
      // Update the products list with the updated product
      setProducts(products.map(p => p.id === selectedProduct.id ? updatedProduct : p));
      
      toast({
        title: "Product Updated",
        description: "Product has been successfully updated.",
      });
      
      setIsEditDialogOpen(false);
    } catch (err: any) {
      console.error("Failed to update product:", err);
      toast({
        title: "Failed to Update Product",
        description: err.response?.data?.message || "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get unique categories for filtering
  // const categories = ['all', ...new Set(products.map(product => product.category.name))];

  // Filter and sort products
  const filteredProducts = products
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || product.categoryId === categoryFilter;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortField === 'name') {
        return sortDirection === 'asc' 
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      } else if (sortField === 'price') {
        return sortDirection === 'asc' ? a.price - b.price : b.price - a.price;
      } else {
        return sortDirection === 'asc' 
          ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

  // Toggle sort direction and field
  const handleSort = (field: 'name' | 'price' | 'inventory' | 'createdAt') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="border rounded-md">
          <div className="p-4 border-b">
            <Skeleton className="h-8 w-full" />
          </div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 border-b">
              <Skeleton className="h-16 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={fetchProducts}
          className="ml-auto"
        >
          <RefreshCw className="h-4 w-4 mr-1" />
          Retry
        </Button>
      </Alert>
    );
  }

  // Empty state
  if (products.length === 0) {
    return (
      <div className="text-center py-8 border rounded-lg">
        <Package className="h-12 w-12 mx-auto text-gray-400" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">No products yet</h3>
        <p className="mt-1 text-sm text-gray-500">Get started by adding your first product.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search products..."
            className="pl-9 w-full sm:w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="border rounded-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">
                <Button 
                  variant="ghost" 
                  onClick={() => handleSort('name')}
                  className="flex items-center p-0 font-medium"
                >
                  Product
                  <ArrowUpDown className="ml-1 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button 
                  variant="ghost" 
                  onClick={() => handleSort('price')}
                  className="flex items-center p-0 font-medium"
                >
                  Price
                  <ArrowUpDown className="ml-1 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button 
                  variant="ghost" 
                  onClick={() => handleSort('inventory')}
                  className="flex items-center p-0 font-medium"
                >
                  Stock Quantity
                  <ArrowUpDown className="ml-1 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>Category</TableHead>
              {/* <TableHead>Status</TableHead> */}
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    {product.productImage && (
                      <div className="h-10 w-10 rounded bg-gray-100 overflow-hidden flex-shrink-0">
                        <img 
                          src={product.productImage} 
                          alt={product.name} 
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}
                    <div>
                      <p className="font-medium truncate max-w-[200px]">{product.name}</p>
                      <p className="text-xs text-gray-500 truncate max-w-[200px]" title={product.description}>
                        {product.description?.slice(0, 50)}{product.description?.length > 50 ? '...' : ''}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>GH₵ {product.price.toFixed(2)}</TableCell>
                <TableCell>{product.stockQuantity}</TableCell>
                <TableCell>{product.category.name}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setSelectedProduct(product);
                        setIsViewDialogOpen(true);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditClick(product)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setSelectedProduct(product);
                        setIsDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedProduct?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isActionLoading}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteProduct}
              disabled={isActionLoading}
            >
              {isActionLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>Delete</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Product Details</DialogTitle>
          </DialogHeader>
          
          {selectedProduct && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Product Images */}
              <div className="space-y-4">
                {selectedProduct.productImage ? (
                  <div className="border rounded-md overflow-hidden">
                    <img 
                      src={selectedProduct.productImage} 
                      alt={selectedProduct.name} 
                      className="w-full h-48 md:h-64 object-cover"
                    />
                  </div>
                ) : (
                  <div className="border rounded-md bg-gray-100 h-48 md:h-64 flex items-center justify-center">
                    <Package className="h-10 w-10 text-gray-400" />
                  </div>
                )}
              </div>
              
              {/* Product Details */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold">{selectedProduct.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Added on {new Date(selectedProduct.createdAt).toLocaleDateString()}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Price:</span>
                    <span className="text-sm">GH₵ {selectedProduct.price.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Stock Quantity:</span>
                    <span className="text-sm">{selectedProduct.stockQuantity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Category:</span>
                    <span className="text-sm">{selectedProduct.category.name}</span>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-1">Description</h4>
                  <p className="text-sm text-gray-600">{selectedProduct.description || "No description provided."}</p>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsViewDialogOpen(false)}
            >
              Close
            </Button>
            <Button 
              onClick={() => {
                setIsViewDialogOpen(false);
                setIsEditDialogOpen(true);
              }}
            >
              Edit Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>
              Update your product information below.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleUpdateProduct} className="space-y-6">
            {/* Product Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Product Name</Label>
              <Input 
                id="name" 
                value={editFormData.name} 
                onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                required
              />
            </div>
            
            {/* Price and Stock */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price (GH₵)</Label>
                <Input 
                  id="price" 
                  type="number" 
                  min="0" 
                  step="0.01" 
                  value={editFormData.price} 
                  onChange={(e) => setEditFormData({...editFormData, price: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stockQuantity">Stock Quantity</Label>
                <Input 
                  id="stockQuantity" 
                  type="number" 
                  min="0" 
                  value={editFormData.stockQuantity} 
                  onChange={(e) => setEditFormData({...editFormData, stockQuantity: e.target.value})}
                  required
                />
              </div>
            </div>
            
            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select 
                value={editFormData.categoryId} 
                onValueChange={(value) => setEditFormData({...editFormData, categoryId: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                rows={4} 
                value={editFormData.description} 
                onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
              />
            </div>
            
            {/* Images */}
            <div className="space-y-2">
              <Label htmlFor="images">Product Images</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {previewImages.map((url, index) => (
                  <div key={index} className="relative w-20 h-20 border rounded-md overflow-hidden">
                    <img src={url} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                    <button 
                      type="button"
                      className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                      onClick={() => {
                        setPreviewImages(previewImages.filter((_, i) => i !== index));
                        setEditImages(editImages.filter((_, i) => i !== index));
                      }}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
              <div>
                <Label htmlFor="new-images" className="block mb-2">Add New Images</Label>
                <Input 
                  id="new-images" 
                  type="file" 
                  accept="image/*" 
                  multiple 
                  onChange={handleImageChange}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Upload new images to replace current ones. Maximum 10 images.
                </p>
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsEditDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>Update Product</>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};