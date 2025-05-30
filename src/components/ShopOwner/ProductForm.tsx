import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Upload, Loader2, CheckCircle, X, RefreshCw } from "lucide-react";
import productsService from "@/services/product.service";
import categoryService from "@/services/category.service";

// Interfaces
interface Category {
  id: string;
  name: string;
}

interface ProductFormProps {
  shopId: string;
  productToEdit?: {
    id: string;
    name: string;
    price: number;
    description?: string;
    stockQuantity: number;
    categoryId: string;
    inStock: boolean;
    productImages: string[];
  } | null;
  onSuccess: () => void;
}

export const ProductForm = ({ shopId, productToEdit, onSuccess }: ProductFormProps) => {
  const isEditMode = !!productToEdit;
  const { toast } = useToast();
  
  // Form state
  const [formData, setFormData] = useState({
    name: productToEdit?.name || '',
    price: productToEdit?.price || '',
    description: productToEdit?.description || '',
    stockQuantity: productToEdit?.stockQuantity || '',
    categoryId: productToEdit?.categoryId || '',
    inStock: productToEdit?.inStock !== false
  });
  
  // Images state
  const [productImages, setProductImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>(
    productToEdit?.productImages || []
  );
  
  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  
  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Category fetching function
  const fetchCategories = async () => {
    setIsLoadingCategories(true);
    try {
      const response = await categoryService.getCategories();
      // console.log("Categories API response:", response);
      
      let categoriesData = [];
      if (Array.isArray(response)) {
        categoriesData = response;
      } else if (response && typeof response === 'object') {
        categoriesData = response.categories || response.data || [];
      }
      
      // console.log("Processed categories data:", categoriesData);
      setCategories(categoriesData);
    } catch (error) {
      // console.error("Failed to fetch categories:", error);
      toast({
        title: "Error",
        description: "Failed to load categories. Please refresh and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingCategories(false);
    }
  };

  // Form input handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Ensure empty string is preserved for controlled inputs
    const numValue = value === '' ? '' : Number(value);
    setFormData(prev => ({ ...prev, [name]: numValue }));
  };

  const handleSelectChange = (name: string, value: string) => {
    // console.log(`Setting ${name} to:`, value);
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleToggleChange = (name: string, value: boolean) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Image handling
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      setProductImages(prev => [...prev, ...filesArray]);
      
      // Create previews
      const newPreviewUrls = filesArray.map(file => URL.createObjectURL(file));
      setImagePreviewUrls(prev => [...prev, ...newPreviewUrls]);
    }
  };

  const removeImage = (index: number) => {
    setProductImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  // Validation functions
  const validateForm = () => {
    // Check required fields
    if (!formData.name || !formData.name.trim()) {
      showError("Product name is required");
      return false;
    }
    
    if (!formData.price) {
      showError("Price is required");
      return false;
    }
    
    if (!formData.stockQuantity) {
      showError("Stock quantity is required");
      return false;
    }
    
    if (!formData.categoryId) {
      showError("Please select a category");
      return false;
    }
    
    // In edit mode, we might not have new images, so only check for new products
    if (!isEditMode && productImages.length === 0) {
      showError("Please add at least one product image");
      return false;
    }
    
    return true;
  };

  const showError = (message: string) => {
    toast({
      title: "Validation Error",
      description: message,
      variant: "destructive",
    });
  };

  // Form data preparation
  const prepareFormData = () => {
    const productData = new FormData();
    
    // Add text fields - convert everything to string explicitly
    productData.append('name', String(formData.name).trim());
    productData.append('price', String(formData.price));
    productData.append('description', String(formData.description || ''));
    productData.append('stockQuantity', String(formData.stockQuantity));
    productData.append('categoryId', String(formData.categoryId));
    productData.append('inStock', formData.inStock ? 'true' : 'false');
    
    // Add shop ID if needed (backend might extract from auth token)
    productData.append('shopId', shopId);
    
    // Add product images if any
    productImages.forEach(image => {
      productData.append('productImages', image);
    });

    // Debug logging
    // console.log("Form data prepared:");
    for (const [key, value] of productData.entries()) {
      if (key === 'productImages') {
        // console.log(`${key}: [File]`);
      } else {
        // console.log(`${key}: ${value}`);
      }
    }
    
    return productData;
  };

  // Debug function to add to your component
const debugFormData = (formData: FormData) => {
  // console.log("===== FORM DATA DEBUG =====");
  for (const [key, value] of formData.entries()) {
    if (key === 'productImages') {
      const file = value as File;
      // console.log(`${key}: ${file.name} (${file.type}, ${file.size} bytes)`);
    } else {
      // console.log(`${key}: ${value}`);
    }
  }
  // console.log("===========================");
};

  // API calls
  const createProduct = async () => {
  // Run validation
  if (!validateForm()) {
    return;
  }
  
  setIsSubmitting(true);
  
  try {
    // Prepare form data with special attention to validation-prone fields
    const productData = new FormData();
    
    // Format numbers properly - make sure they're not empty strings
    const price = Number(formData.price);
    const stockQuantity = Number(formData.stockQuantity);
    
    // 1. Required text fields
    productData.append('name', String(formData.name).trim());
    
    // 2. Required numeric fields - ensure they're numbers
    productData.append('price', isNaN(price) ? '0' : String(price));
    productData.append('stockQuantity', isNaN(stockQuantity) ? '0' : String(stockQuantity));
    
    // 3. Category ID - critical field, ensure it's a valid string
    if (!formData.categoryId) {
      showError("Category selection is required");
      setIsSubmitting(false);
      return;
    }
    productData.append('categoryId', String(formData.categoryId).trim());
    
    // 4. Optional fields
    if (formData.description) {
      productData.append('description', String(formData.description).trim());
    }
    
    // 5. Boolean fields
    productData.append('inStock', formData.inStock ? 'true' : 'false');
    
    // 6. Images - ensure we have at least one
    if (productImages.length === 0) {
      showError("At least one product image is required");
      setIsSubmitting(false);
      return;
    }
    
    // Add product images
    productImages.forEach(image => {
      productData.append('productImages', image);
    });
    
    // Debug what we're sending
    debugFormData(productData);
    
    // Make API request
    // console.log("Sending product creation request...");
    const result = await productsService.createProduct(productData);
    // console.log("Product created successfully:", result);
    
    toast({
      title: "Success!",
      description: "Your product has been added successfully.",
    });
    
    onSuccess();
  } catch (error: any) {
    // console.error("Product creation failed:", error);
    
    // Extract specific validation error messages
    let errorMessage = "Failed to add product";
    
    if (error.response?.data) {
      const responseData = error.response.data;
      // console.error("API error response:", responseData);
      
      if (responseData.message) {
        errorMessage = responseData.message;
      } else if (responseData.error) {
        errorMessage = responseData.error;
      } else if (responseData.errors) {
        const errors = Array.isArray(responseData.errors) 
          ? responseData.errors 
          : [responseData.errors];
        
        errorMessage = errors
          .map((e: any) => e.msg || e.message || JSON.stringify(e))
          .join(', ');
      }
    }
    
    toast({
      title: "Validation Error",
      description: errorMessage,
      variant: "destructive",
    });
  } finally {
    setIsSubmitting(false);
  }
};

  const updateProduct = async () => {
    if (!productToEdit || !validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // console.log("Updating product:", productToEdit.id);
      const productData = prepareFormData();
      
      const result = await productsService.updateProduct(productToEdit.id, productData);
      // console.log("Product updated successfully:", result);
      
      toast({
        title: "Success!",
        description: "Product has been updated successfully.",
      });
      
      onSuccess();
    } catch (error: any) {
      handleApiError(error, "Failed to update product");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApiError = (error: any, defaultMessage: string) => {
    console.error(defaultMessage, error);
    
    // Extract detailed error message from API response
    let errorMessage = defaultMessage;
    
    if (error.response) {
      // console.error("API Error Response:", error.response);
      
      const { data, status } = error.response;
      // console.error(`Status: ${status}, Data:`, data);
      
      if (typeof data === 'object' && data !== null) {
        errorMessage = data.message || data.error || 
                      (Array.isArray(data.errors) ? data.errors.join(', ') : defaultMessage);
      }
    } else if (error.request) {
      // console.error("No response received:", error.request);
      errorMessage = "Network error. Please check your connection.";
    } else {
      // console.error("Error:", error.message);
      errorMessage = error.message || defaultMessage;
    }
    
    toast({
      title: "Error",
      description: errorMessage,
      variant: "destructive",
    });
  };

  // Form submission handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isEditMode) {
      updateProduct();
    } else {
      createProduct();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Product Images */}
        <div className="md:col-span-2">
          <Label htmlFor="productImages" className="block mb-2">
            Product Images{!isEditMode && <span className="text-red-500 ml-1">*</span>}
          </Label>
          <div className="flex flex-wrap gap-4">
            {imagePreviewUrls.map((url, index) => (
              <div key={index} className="relative h-24 w-24 border rounded overflow-hidden">
                <img src={url} alt={`Preview ${index}`} className="h-full w-full object-cover" />
                <button
                  type="button"
                  className="absolute top-1 right-1 bg-white rounded-full p-1 shadow"
                  onClick={() => removeImage(index)}
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            
            <div className="h-24 w-24 border border-dashed rounded flex items-center justify-center bg-gray-50 relative">
              <input
                type="file"
                id="productImages"
                name="productImages"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center text-gray-500">
                <Upload className="h-5 w-5 mb-1" />
                <span className="text-xs">Add Image</span>
              </div>
            </div>
          </div>
          {!isEditMode && productImages.length === 0 && (
            <p className="text-xs text-red-500 mt-2">At least one product image is required</p>
          )}
        </div>
        
        {/* Product Name */}
        <div className="space-y-2">
          <Label htmlFor="name">
            Product Name<span className="text-red-500 ml-1">*</span>
          </Label>
          <Input 
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Enter product name"
            required
          />
        </div>
        
        {/* Category */}
        <div className="space-y-2">
          <Label htmlFor="category">
            Category<span className="text-red-500 ml-1">*</span>
          </Label>
          
          {isLoadingCategories ? (
            <div className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 flex items-center">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              <span className="ml-2 text-sm text-muted-foreground">Loading categories...</span>
            </div>
          ) : categories && categories.length > 0 ? (
            <Select 
              value={formData.categoryId} 
              onValueChange={(value) => handleSelectChange('categoryId', value)}
            >
              <SelectTrigger id="category">
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
          ) : (
            <div className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">No categories available</span>
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                className="h-6 text-xs"
                onClick={fetchCategories}
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Refresh
              </Button>
            </div>
          )}
        </div>
        
        {/* Price */}
        <div className="space-y-2">
          <Label htmlFor="price">
            Price (GH₵)<span className="text-red-500 ml-1">*</span>
          </Label>
          <Input 
            id="price"
            name="price"
            type="number"
            step="0.01"
            min="0"
            value={formData.price}
            onChange={handleNumberInputChange}
            placeholder="0.00"
            required
          />
        </div>
        
        {/* Stock Quantity */}
        <div className="space-y-2">
          <Label htmlFor="stockQuantity">
            Stock Quantity<span className="text-red-500 ml-1">*</span>
          </Label>
          <Input 
            id="stockQuantity"
            name="stockQuantity"
            type="number"
            min="0"
            value={formData.stockQuantity}
            onChange={handleNumberInputChange}
            placeholder="0"
            required
          />
        </div>
        
        {/* Description */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="description">Description</Label>
          <Textarea 
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Describe your product..."
            rows={4}
          />
        </div>
        
        {/* In Stock Status */}
        <div className="space-y-2">
          <Label htmlFor="inStock">Availability</Label>
          <Select 
            value={formData.inStock ? "true" : "false"} 
            onValueChange={(value) => handleToggleChange('inStock', value === "true")}
          >
            <SelectTrigger id="inStock">
              <SelectValue placeholder="Select availability" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">In Stock</SelectItem>
              <SelectItem value="false">Out of Stock</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="flex justify-end mt-6">
        <Button type="submit" disabled={isSubmitting || isLoadingCategories}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isEditMode ? 'Updating...' : 'Adding...'}
            </>
          ) : (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              {isEditMode ? 'Update Product' : 'Add Product'}
            </>
          )}
        </Button>
      </div>
    </form>
  );
};