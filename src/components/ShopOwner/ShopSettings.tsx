import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Card, 
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, CheckCircle, Camera } from "lucide-react";
import shopsService from "@/services/shop.service";

interface ShopSettingsProps {
  shopProfile: any; // Replace with proper type
}

export const ShopSettings = ({ shopProfile }: ShopSettingsProps) => {
  const [formData, setFormData] = useState({
    name: shopProfile.name || '',
    ownerName: shopProfile.ownerName || '',
    email: shopProfile.email || '',
    phoneNumber: shopProfile.phoneNumber || '',
    location: shopProfile.location || '',
    description: shopProfile.description || '',
  });
  
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(shopProfile.imageUrl || null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfileImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target) {
          setProfileImagePreview(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      
      // Create FormData object for multipart form submission
      const formDataObj = new FormData();
      formDataObj.append('name', formData.name);
      formDataObj.append('ownerName', formData.ownerName);
      formDataObj.append('email', formData.email);
      formDataObj.append('phoneNumber', formData.phoneNumber);
      formDataObj.append('location', formData.location);
      formDataObj.append('description', formData.description || '');
      
      // Only append the file if it exists
      if (profileImage) {
        formDataObj.append('profileImage', profileImage);
      }
      
      await shopsService.updateShopProfile(formDataObj);
      
      toast({
        title: 'Profile Updated',
        description: 'Your shop profile has been updated successfully.',
      });
      
      // Shop data will refresh on component re-render or page reload
    } catch (error) {
      toast({
        title: 'Update Failed',
        description: 'Failed to update shop profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Shop Profile</CardTitle>
          <CardDescription>
            Update your shop details and improve your shop's visibility.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Profile Image Upload */}
              <div className="flex flex-col items-center">
                <div className="relative h-32 w-32 rounded-full overflow-hidden bg-gray-100 mb-4">
                  {profileImagePreview ? (
                    <img 
                      src={profileImagePreview} 
                      alt="Shop profile" 
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full w-full bg-gray-200">
                      <Camera className="h-10 w-10 text-gray-400" />
                    </div>
                  )}
                  <label 
                    htmlFor="profileImage" 
                    className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    <Upload className="h-6 w-6 text-white" />
                  </label>
                  <input 
                    type="file" 
                    id="profileImage" 
                    accept="image/*" 
                    onChange={handleFileChange} 
                    className="sr-only"
                  />
                </div>
                <p className="text-sm text-gray-500">Upload shop logo</p>
              </div>
              
              {/* Form Fields */}
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Shop Name</Label>
                  <Input 
                    id="name" 
                    name="name" 
                    value={formData.name} 
                    onChange={handleInputChange} 
                    placeholder="Your shop name"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="ownerName">Owner Name</Label>
                  <Input 
                    id="ownerName" 
                    name="ownerName" 
                    value={formData.ownerName} 
                    onChange={handleInputChange} 
                    placeholder="Shop owner name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input 
                    id="email" 
                    name="email" 
                    type="email"
                    value={formData.email} 
                    onChange={handleInputChange} 
                    placeholder="contact@yourshop.com"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input 
                    id="phoneNumber" 
                    name="phoneNumber" 
                    value={formData.phoneNumber} 
                    onChange={handleInputChange} 
                    placeholder="Your contact number"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input 
                    id="location" 
                    name="location" 
                    value={formData.location} 
                    onChange={handleInputChange} 
                    placeholder="Shop location"
                  />
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="description">Shop Description</Label>
                  <Textarea 
                    id="description" 
                    name="description" 
                    value={formData.description} 
                    onChange={handleInputChange} 
                    placeholder="Describe your shop and what you sell..."
                    rows={4}
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end mt-6">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Shop Password</CardTitle>
          <CardDescription>
            Update your shop login credentials.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input 
                  id="currentPassword" 
                  type="password" 
                  placeholder="Enter your current password"
                  required
                />
              </div>
              
              <div></div>
              
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input 
                  id="newPassword" 
                  type="password" 
                  placeholder="Enter a new password"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input 
                  id="confirmPassword" 
                  type="password" 
                  placeholder="Confirm your new password"
                  required
                />
              </div>
            </div>
            
            <div className="flex justify-end mt-6">
              <Button type="submit">
                Update Password
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};