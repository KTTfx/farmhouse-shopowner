import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { 
  Tag, 
  Plus, 
  Pencil, 
  Trash2, 
  Loader2, 
  AlertCircle,
  RefreshCw,
  Search,
  CheckCircle
} from "lucide-react";
// import productsService from "@/services/product.service";
import categoryService from "@/services/category.service";

// Define Category interface based on the schema
interface Category {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  products: {
    id: string;
    name: string;
    description?: string;
    price: number;
    stockQuantity: number;
    inStock: boolean;
    createdAt: string;
    updatedAt: string;
  }[],
  shop: {
    id: string;
    name: string;
  }
}

interface CategoryManagerProps {
  shopId: string;
}

export const CategoryManager = ({ shopId }: CategoryManagerProps) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    description: ""
  });
  const { toast } = useToast();

  // Fetch categories
  const fetchCategories = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await categoryService.getCategories()
      setCategories(response);
    } catch (err) {
      // console.error("Failed to fetch categories:", err);
      setError("Failed to load categories. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [shopId]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const canModifyCategory = (category: Category) => {
    return category.shop && category.shop.id === shopId;
  };

  // Reset form data
  const resetFormData = () => {
    setFormData({ name: "", description: "" });
  };

  // Open edit dialog
  const handleEditCategory = (category: Category) => {
    if (!canModifyCategory(category)) {
      toast({
        title: "Permission Denied",
        description: "You can only edit categories created by your shop.",
        variant: "destructive"
      });
      return;
    }
    
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      description: category.description || ""
    });
    setIsEditDialogOpen(true);
  };

  // Update the handleDeletePrompt function
  const handleDeletePrompt = (category: Category) => {
    if (!canModifyCategory(category)) {
      toast({
        title: "Permission Denied",
        description: "You can only delete categories created by your shop.",
        variant: "destructive"
      });
      return;
    }
    
    setSelectedCategory(category);
    setIsDeleteDialogOpen(true);
  };

  // Create new category
  const handleCreateCategory = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Category name is required",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const newCategory = await categoryService.addCategory(
        formData.name,
        formData.description
      );
      // Explicitly update the categories list with the new item
      setCategories(prev => [...prev, newCategory]);
      
      // Reset form and close dialog
      setIsAddDialogOpen(false);
      resetFormData();

      toast({
        title: "Category created",
        description: "Category has been created successfully."
      });
    } catch (err) {
      // console.error("Failed to create category:", err);
      toast({
        title: "Error",
        description: "Failed to create category. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update category
  const handleUpdateCategory = async () => {
    if (!selectedCategory || !formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Category name is required",
        variant: "destructive"
      });
      return;
    }

    // Double-check permissions
    if (!canModifyCategory(selectedCategory)) {
      toast({
        title: "Permission Denied",
        description: "You can only edit categories created by your shop.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const updatedCategory = await categoryService.updateCategory(
        selectedCategory.id, 
        formData.name, 
        formData.description
      );
      
      // Update the categories list with the returned data
      setCategories(prev => 
        prev.map(cat => cat.id === selectedCategory.id ? updatedCategory : cat)
      );
      
      setIsEditDialogOpen(false);
      resetFormData();
      toast({
        title: "Category updated",
        description: "Category has been updated successfully."
      });
    } catch (err: any) {
      // Handle specific error cases
      let errorMessage = "Failed to update category. Please try again.";
      
      if (err.response?.status === 403) {
        errorMessage = "You don't have permission to update this category.";
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
};

  // Delete category
  const handleDeleteCategory = async () => {
    if (!selectedCategory) return;

    // Double-check permissions
    if (!canModifyCategory(selectedCategory)) {
      toast({
        title: "Permission Denied",
        description: "You can only delete categories created by your shop.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await categoryService.deleteCategory(selectedCategory.id);
      
      // Update the categories list after successful deletion
      setCategories(prev => prev.filter(cat => cat.id !== selectedCategory.id));
      setIsDeleteDialogOpen(false);
      setSelectedCategory(null);
      
      toast({
        title: "Category deleted",
        description: "Category has been deleted successfully."
      });
    } catch (err: any) {
      // Handle specific error cases
      let errorMessage = "Failed to delete category. Please try again.";
      
      if (err.response?.status === 403) {
        errorMessage = "You don't have permission to delete this category.";
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter categories based on search term
  const filteredCategories = categories.filter(category => 
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
              <Skeleton className="h-12 w-full" />
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
          onClick={fetchCategories}
          className="ml-auto"
        >
          <RefreshCw className="h-4 w-4 mr-1" />
          Retry
        </Button>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search categories..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button 
          onClick={() => {
            resetFormData();
            setIsAddDialogOpen(true);
          }}
          className="sm:w-auto w-full flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Category
        </Button>
      </div>

      {filteredCategories.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <Tag className="h-12 w-12 mx-auto text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No categories found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm ? "Try a different search term or" : "Start by"} adding a new category.
          </p>
          <Button 
            className="mt-4"
            onClick={() => {
              resetFormData();
              setIsAddDialogOpen(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Button>
        </div>
      ) : (
        <div className="border rounded-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Products</TableHead>
                <TableHead>Created By</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCategories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {category.description || "No description"}
                  </TableCell>
                  <TableCell>
                    {category.products ? category.products.length : 0}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      {category.shop?.name || "Unknown shop"}
                      {canModifyCategory(category) && (
                        <span className="ml-2 text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded-full">
                          You
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {canModifyCategory(category) ? (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditCategory(category)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeletePrompt(category)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <div className="text-xs text-muted-foreground italic px-2">
                          Not editable
                        </div>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Add Category Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
        if (!isSubmitting) {
          setIsAddDialogOpen(open) 
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Category</DialogTitle>
            <DialogDescription>
              Create a new category for your products.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Category Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="Enter category name"
                value={formData.name}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Enter category description"
                value={formData.description}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsAddDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateCategory}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Category
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
        if (!isSubmitting) {
          setIsEditDialogOpen(open)
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>
              Update your category details.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Category Name</Label>
              <Input
                id="edit-name"
                name="name"
                placeholder="Enter category name"
                value={formData.name}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description (Optional)</Label>
              <Textarea
                id="edit-description"
                name="description"
                placeholder="Enter category description"
                value={formData.description}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsEditDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateCategory}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Category Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={(open) => {
        if (!isSubmitting) {
          setIsDeleteDialogOpen(open);
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this category? Products assigned to this category will need to be reassigned.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteCategory}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Category
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};