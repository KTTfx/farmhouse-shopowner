import apiClient from '../lib/api';

const categoryService = {
    addCategory: async (categoryData: FormData) => {
        const response = await apiClient.post('/categories', categoryData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data.data;
    },

    getCategories: async () => {
        const response = await apiClient.get('/categories');
        return response.data.data;
    },

    updateCategory: async (categoryId: string, categoryData: FormData) => {
        const response = await apiClient.put(`/categories/${categoryId}`, categoryData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data.data;
    },

    deleteCategory: async (categoryId: string) => {
        const response = await apiClient.delete(`/categories/${categoryId}`);
        return response.data.data;
    },
};

export default categoryService;
