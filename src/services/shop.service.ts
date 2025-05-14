
import apiClient from '../lib/api';

export interface Shop {
  id: string;
  name: string;
  ownerName: string;
  email: string;
  location: string;
  phoneNumber: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  description?: string;
  image?: string;
  productCount?: number;
}

const shopsService = {
  getShopProfile: async () => {
    const response = await apiClient.get('/shops/profile');
    return response.data.data;
  },
  
  updateShopProfile: async (shopData: FormData) => {
    const response = await apiClient.put('/shops/update', shopData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },
  
  addProduct: async (productData: FormData) => {
    const response = await apiClient.post('/shops/products', productData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },
  
  getProducts: async () => {
    const response = await apiClient.get('/shops/products');
    return response.data.data;
  },
  
  getOrders: async () => {
    const response = await apiClient.get('/shops/orders');
    return response.data.data;
  },
};

export default shopsService;
