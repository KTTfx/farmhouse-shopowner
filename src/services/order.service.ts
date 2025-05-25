import apiClient from '../lib/api';

const orderService = {
  getOrders: async () => {
    const response = await apiClient.get('/orders', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('shopToken')}`,
      },
    });
    return response.data.data;
  },

  getOrderDetails: async (orderId: string) => {
    const response = await apiClient.get(`/orders/${orderId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('shopToken')}`,
      },
    });
    return response.data.data;
  },

  shipOrder: async (orderId: string, trackingInfo?: { trackingNumber?: string, carrier?: string }) => {
        const response = await apiClient.post(
            `/orders/${orderId}/ship`, 
            trackingInfo || {},
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('shopToken')}`,
                },
            }
        );
        return response.data.data;
    },

    deliverOrder: async (orderId: string) => {
        const response = await apiClient.post(
            `/orders/${orderId}/deliver`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('shopToken')}`,
                },
            }
        );
        return response.data.data;
    },

    cancelOrder: async (orderId: string, reason: string) => {
        const response = await apiClient.post(
            `/orders/${orderId}/cancel`,
            { reason },
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('shopToken')}`,
                },
            }
        );
        return response.data.data;
    }
};

export default orderService;
