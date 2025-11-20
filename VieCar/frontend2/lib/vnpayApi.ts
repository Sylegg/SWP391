import api from './api';

<<<<<<< HEAD
const VNPAY_BASE_URL = '/api/vnpay';
=======
import { API_BASE_URL } from './config';

const VNPAY_BASE_URL = '/vnpay';
>>>>>>> f80fcac20c192e521fe159a9f41c5d8b008885b9

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
<<<<<<< HEAD
  orderId: string;
  transactionNo: string;
  bankCode: string;
  amount: number;
  responseCode: string;
  success: boolean;
  message: string;
=======
  status: string;
  message: string;
  orderId?: string;
  transactionNo?: string;
  responseCode?: string;
  amount?: number;
>>>>>>> f80fcac20c192e521fe159a9f41c5d8b008885b9
}

/**
 * VNPay API Service
 */
export const vnpayApi = {
  /**
<<<<<<< HEAD
   * Tạo URL thanh toán VNPay
   * @param orderId - ID của đơn hàng
   * @param bankCode - Mã ngân hàng (optional)
   * @returns Promise<VnpayResponse>
   */
  createPayment: async (orderId: string, bankCode?: string): Promise<VnpayResponse> => {
    try {
      const params: any = { orderId };
      if (bankCode) {
        params.bankCode = bankCode;
      }
=======
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
>>>>>>> f80fcac20c192e521fe159a9f41c5d8b008885b9

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
<<<<<<< HEAD
=======
   * Tạo URL thanh toán VNPay cho phân phối
   * @param distributionId - ID của phân phối
   * @param totalAmount - Tổng tiền cần thanh toán (VNĐ)
   * @param bankCode - Mã ngân hàng (optional)
   * @returns Promise<VnpayResponse>
   */
  createDistributionPayment: async (
    distributionId: number, 
    totalAmount: number, 
    bankCode?: string
  ): Promise<VnpayResponse> => {
    try {
      const params: any = { 
        distributionId,
        totalAmount 
      };
      if (bankCode) {
        params.bankCode = bankCode;
      }

      const response = await api.post<VnpayResponse>(
        `${VNPAY_BASE_URL}/create-distribution-payment`,
        null,
        { params }
      );
      return response.data;
    } catch (error) {
      console.error('Error creating VNPay distribution payment:', error);
      throw error;
    }
  },

  /**
>>>>>>> f80fcac20c192e521fe159a9f41c5d8b008885b9
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
