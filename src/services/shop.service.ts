import apiClient from '../lib/api';

const shopsService = {
  loginShop: async (email: string, password: string) => {
    const response = await apiClient.post('/shop/auth/login', { email, password });
    return response.data.data;
  },

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
};

export default shopsService;
