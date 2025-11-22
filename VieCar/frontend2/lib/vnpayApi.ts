import api from './api';

import { API_BASE_URL } from './config';

const VNPAY_BASE_URL = '/vnpay';

/**
 * VNPay Response từ backend
 */
export interface VnpayResponse {
  orderId: string;
  amount: number;
  bank?: string;
  url: string;
}

/**
 * VNPay Payment Result (từ callback)
 */
export interface VnpayPaymentResult {
  status: string;
  message: string;
  orderId?: string;
  transactionNo?: string;
  responseCode?: string;
  amount?: number;
}

/**
 * VNPay API Service
 */
export const vnpayApi = {
  /**
   * Tạo URL thanh toán VNPay cho đơn hàng
   * @param orderId - ID của đơn hàng
   * @param paymentType - Loại thanh toán: "deposit" (30%) hoặc "final" (70%)
   * @param bankCode - Mã ngân hàng (optional)
   * @param userType - Loại người dùng: "customer" hoặc "dealer-staff" (optional, default: "customer")
   * @returns Promise<VnpayResponse>
   */
  createPayment: async (orderId: string, paymentType: 'deposit' | 'final' = 'deposit', bankCode?: string, userType?: 'customer' | 'dealer-staff'): Promise<VnpayResponse> => {
    try {
      const params: any = { orderId, paymentType };
      if (bankCode) {
        params.bankCode = bankCode;
      }
      if (userType) {
        params.userType = userType;
      }

      const response = await api.post<VnpayResponse>(
        `${VNPAY_BASE_URL}/create-payment`,
        null,
        { params }
      );
      return response.data;
    } catch (error) {
      console.error('Error creating VNPay payment:', error);
      throw error;
    }
  },

  /**
   * Xác thực kết quả thanh toán từ VNPay (khi có Frontend)
   * @param params - Query parameters từ VNPay
   * @returns Promise<VnpayPaymentResult>
   */
  verifyPayment: async (params: Record<string, string>): Promise<VnpayPaymentResult> => {
    try {
      const response = await api.post<VnpayPaymentResult>(
        `${VNPAY_BASE_URL}/verify-payment`,
        null,
        { params }
      );
      return response.data;
    } catch (error) {
      console.error('Error verifying VNPay payment:', error);
      throw error;
    }
  },
};

export default vnpayApi;
