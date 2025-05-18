import { useState } from "react";
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
import { Upload, Loader2, CheckCircle, X } from "lucide-react";
import productsService from "@/services/product.service";

interface ProductFormProps {
  shopId: string;
  productToEdit?: any; // For editing existing products
  onSuccess: () => void;
}

export const ProductForm = ({ shopId, productToEdit, onSuccess }: ProductFormProps) => {
  const isEditMode = !!productToEdit;
  
  const [formData, setFormData] = useState({
    name: productToEdit?.name || '',
    price: productToEdit?.price || '',
    inventory: productToEdit?.inventory || '',
    category: productToEdit?.category || '',
    description: productToEdit?.description || '',
    status: productToEdit?.status || 'draft'
  });
  
  const [productImages, setProductImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>(
    productToEdit?.images?.map((img: any) => img.url) || []
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Categories (should ideally come from an API)
  const categories = [
    "Fruits", 
    "Vegetables", 
    "Cereals", 
    "Herbs & Spices", 
    "Dairy", 
    "Meat", 
    "Poultry", 
    "Processed Foods", 
    "Other"
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Create FormData to handle file uploads
      const formDataToSubmit = new FormData();
      
      // Add shop ID
      formDataToSubmit.append('shopId', shopId);
      
      // Add all form fields
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSubmit.append(key, String(value));
      });
      
      // Add product images
      productImages.forEach(image => {
        formDataToSubmit.append('productImages', image);
      });
      
      // Submit to API
      if (isEditMode) {
        await productsService.updateProduct(productToEdit.id, formDataToSubmit);
        toast({
          title: "Product updated",
          description: "Your product has been updated successfully.",
        });
      } else {
        await productsService.addProduct(formDataToSubmit);
        toast({
          title: "Product added",
          description: "Your product has been added successfully.",
        });
      }
      
      // Call the success callback
      onSuccess();
    } catch (error) {
      console.error("Failed to save product:", error);
      toast({
        title: isEditMode ? "Update failed" : "Failed to add product",
        description: "There was a problem saving your product.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Product Images */}
        <div className="md:col-span-2">
          <Label className="block mb-2">Product Images</Label>
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
        </div>
        
        {/* Product Name */}
        <div className="space-y-2">
          <Label htmlFor="name">Product Name</Label>
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
          <Label htmlFor="category">Category</Label>
          <Select 
            value={formData.category} 
            onValueChange={(value: any) => handleSelectChange('category', value)}
          >
            <SelectTrigger id="category">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Price */}
        <div className="space-y-2">
          <Label htmlFor="price">Price (GH₵)</Label>
          <Input 
            id="price"
            name="price"
            type="number"
            step="0.01"
            min="0"
            value={formData.price}
            onChange={handleInputChange}
            placeholder="0.00"
            required
          />
        </div>
        
        {/* Inventory */}
        <div className="space-y-2">
          <Label htmlFor="inventory">Inventory</Label>
          <Input 
            id="inventory"
            name="inventory"
            type="number"
            min="0"
            value={formData.inventory}
            onChange={handleInputChange}
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
        
        {/* Product Status */}
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select 
            value={formData.status} 
            onValueChange={(value: any) => handleSelectChange('status', value)}
          >
            <SelectTrigger id="status">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="active">Active</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="flex justify-end mt-6">
        <Button type="submit" disabled={isSubmitting}>
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