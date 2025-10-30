import api from './api';
import { OrderRes, OrderReq, UpdateOrderReq, DeliveryReq } from '@/types/order';

const ORDER_BASE_URL = '/api/orders';

/**
 * Order API Service
 */
export const orderApi = {
  /**
   * Lấy danh sách đơn hàng của user
   * @param userId - ID của user
   * @returns Promise<OrderRes[]>
   */
  getOrdersByUser: async (userId: number): Promise<OrderRes[]> => {
    try {
      const response = await api.get<OrderRes[]>(`${ORDER_BASE_URL}/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user orders:', error);
      throw error;
    }
  },

  /**
   * Lấy tất cả đơn hàng (admin)
   * @returns Promise<OrderRes[]>
   */
  getAllOrders: async (): Promise<OrderRes[]> => {
    try {
      const response = await api.get<OrderRes[]>(ORDER_BASE_URL);
      return response.data;
    } catch (error) {
      console.error('Error fetching all orders:', error);
      throw error;
    }
  },

  /**
   * Tạo đơn hàng mới
   * @param userId - ID của user
   * @param orderData - Dữ liệu đơn hàng
   * @returns Promise<OrderRes>
   */
  createOrder: async (userId: number, orderData: OrderReq): Promise<OrderRes> => {
    try {
      const response = await api.post<OrderRes>(`${ORDER_BASE_URL}/user/${userId}`, orderData);
      return response.data;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  },

  /**
   * Cập nhật đơn hàng
   * @param orderId - ID của đơn hàng
   * @param orderData - Dữ liệu cập nhật
   * @returns Promise<string>
   */
  updateOrder: async (orderId: number, orderData: UpdateOrderReq): Promise<string> => {
    try {
      const response = await api.put<string>(`${ORDER_BASE_URL}/${orderId}`, orderData);
      return response.data;
    } catch (error) {
      console.error('Error updating order:', error);
      throw error;
    }
  },

  /**
   * Xóa đơn hàng
   * @param orderId - ID của đơn hàng
   * @returns Promise<string>
   */
  deleteOrder: async (orderId: number): Promise<string> => {
    try {
      const response = await api.delete<string>(`${ORDER_BASE_URL}/${orderId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting order:', error);
      throw error;
    }
  },

  /**
   * Tạo thông tin giao hàng
   * @param orderId - ID của đơn hàng
   * @param deliveryData - Dữ liệu giao hàng
   * @returns Promise<string>
   */
  createDelivery: async (orderId: number, deliveryData: DeliveryReq): Promise<string> => {
    try {
      const response = await api.post<string>(`${ORDER_BASE_URL}/${orderId}/delivery`, deliveryData);
      return response.data;
    } catch (error) {
      console.error('Error creating delivery:', error);
      throw error;
    }
  },

  /**
   * Cập nhật thông tin giao hàng
   * @param orderId - ID của đơn hàng
   * @param deliveryData - Dữ liệu giao hàng
   * @returns Promise<string>
   */
  updateDelivery: async (orderId: number, deliveryData: DeliveryReq): Promise<string> => {
    try {
      const response = await api.put<string>(`${ORDER_BASE_URL}/${orderId}/delivery`, deliveryData);
      return response.data;
    } catch (error) {
      console.error('Error updating delivery:', error);
      throw error;
    }
  },

  /**
   * Xóa thông tin giao hàng
   * @param orderId - ID của đơn hàng
   * @returns Promise<string>
   */
  deleteDelivery: async (orderId: number): Promise<string> => {
    try {
      const response = await api.delete<string>(`${ORDER_BASE_URL}/${orderId}/delivery`);
      return response.data;
    } catch (error) {
      console.error('Error deleting delivery:', error);
      throw error;
    }
  },
};

export default orderApi;
