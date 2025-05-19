import apiClient from '../lib/api';

const categoryService = {
    addCategory: async (name: string, description: string) => {
        const response = await apiClient.post('/categories', {
            name, 
            description,
        });
        return response.data.data;
    },

    getCategories: async () => {
        const response = await apiClient.get('/categories');
        return response.data.data;
    },

    updateCategory: async (categoryId: string, name: string, description: string) => {
        const response = await apiClient.patch(`/categories/${categoryId}`, {
            name, 
            description,
        });
        return response.data.data;
    },

    deleteCategory: async (categoryId: string) => {
        await apiClient.delete(`/categories/${categoryId}`);
        return true;
    },
};

export default categoryService;
