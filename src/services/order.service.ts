import apiClient from '../lib/api';

const orderService = {
  getOrders: async () => {
    const response = await apiClient.get('/orders');
    return response.data.data;
  },

  updateOrderStatus: async (orderId: string, status: string) => {
    const response = await apiClient.put(`/orders/${orderId}`, { status });
    return response.data.data;
  },

  deleteOrder: async (orderId: string) => {
    const response = await apiClient.delete(`/orders/${orderId}`);
    return response.data.data;
  },
};

export default orderService;
