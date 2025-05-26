import apiClient from '../lib/api';

const productsService = {
    // Alias for createProduct to maintain compatibility
    addProduct: async (productData: FormData) => {
        const response = await apiClient.post('/products', productData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data.data;
    },

    createProduct: async (productData: FormData) => {
        const response = await apiClient.post('/products', productData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data.data;
    },

    updateProduct: async (productId: string, productData: FormData) => {
        const response = await apiClient.patch(`/products/${productId}`, productData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                Authorization: `Bearer ${localStorage.getItem('shopToken')}`,
            },
        });
        return response.data.data;
    },

    deleteProduct: async (productId: string) => {
        try {
            const response = await apiClient.delete(`/products/${productId}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('shopToken')}`,
                },
            });
            return response.data.data;
        } catch (error) {
            console.error('Error deleting product:', error);
            throw error;
        }
    },

    restoreProduct: async (productId: string) => {
        try {
            const response = await apiClient.post(`/products/${productId}/restore`, {}, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('shopToken')}`,
                },
            });
            return response.data.data;
        } catch (error) {
            console.error('Error restoring product:', error);
            throw error;
        }
    },
    
    getShopProducts: async (shopId: string, includeDeleted = false) => {
        console.log(`Calling API with includeDeleted=${includeDeleted}`); // Debug log
        const response = await apiClient.get(`/shops/${shopId}/products`, {
            params: { includeDeleted: includeDeleted.toString() }, // Convert boolean to string
            headers: {
            Authorization: `Bearer ${localStorage.getItem('shopToken')}`,
            },
        });
        return response.data.data;
    },

    getProduct: async (productId: string) => {
        const response = await apiClient.get(`/products/${productId}`);
        return response.data.data;
    },
};

export default productsService;