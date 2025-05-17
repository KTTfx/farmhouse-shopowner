import apiClient from '../lib/api';

const productService = {
    addProduct: async (productData: FormData) => {
        const response = await apiClient.post('/products', productData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data.data;
    },

    updateProduct: async (productId: string, productData: FormData) => {
        const response = await apiClient.put(`/products/${productId}`, productData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data.data;
    },

    deleteProduct: async (productId: string) => {
        const response = await apiClient.delete(`/products/${productId}`);
        return response.data.data;
    },
    
    getShopProducts: async (shopId: string) => {
        const response = await apiClient.get(`/${shopId}/products`);
        return response.data.data;
    },
};

export default productService;
