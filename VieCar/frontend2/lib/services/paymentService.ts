import type { AxiosError } from 'axios'

import api from '@/lib/api'
import {
  type CreatePaymentRequest,
  type Payment,
  type PaymentListResponse,
  type PaymentType,
} from '@/types/payment'

const MOCK_JWT =
  process.env.NEXT_PUBLIC_PAYMENT_MOCK_TOKEN ??
  'mock-jwt-token.for-frontend-testing-only.do-not-use-in-production'

const MOCK_PAYMENTS_SEED: Payment[] = [
  {
    id: 'pay_mock_1',
    orderId: 'order_2301',
    customerId: 'customer_001',
    customerName: 'Nguyễn Văn A',
    dealerId: 'dealer_01',
    dealerName: 'VieCar Hà Nội',
    amount: 150_000_000,
    paymentMethod: 'cash',
    status: 'completed',
    transactionId: 'TXN-2310001',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    approvedBy: 'dealer_manager_01',
    approvedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    notes: 'Thanh toán đặt cọc cho VF 8',
    paymentType: 'preorder',
    currency: 'VND',
  },
  {
    id: 'pay_mock_2',
    orderId: 'order_2305',
    customerId: 'customer_002',
    customerName: 'Trần Thị B',
    dealerId: 'dealer_02',
    dealerName: 'VieCar Đà Nẵng',
    amount: 820_000_000,
    paymentMethod: 'bank_transfer',
    status: 'pending',
    transactionId: 'TXN-2310002',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    notes: 'Thanh toán hợp đồng mua xe VF 9',
    paymentType: 'order',
    currency: 'VND',
  },
  {
    id: 'pay_mock_3',
    orderId: 'order_2309',
    customerId: 'customer_001',
    customerName: 'Nguyễn Văn A',
    dealerId: 'dealer_01',
    dealerName: 'VieCar Hà Nội',
    amount: 670_000_000,
    paymentMethod: 'credit_card',
    status: 'processing',
    transactionId: 'TXN-2310003',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    notes: 'Thanh toán hợp đồng mua xe VF 7',
    paymentType: 'order',
    currency: 'VND',
  },
]

let mockPayments: Payment[] = [...MOCK_PAYMENTS_SEED]

const NETWORK_ERROR_CODES = ['ECONNABORTED', 'ECONNREFUSED', 'ERR_NETWORK']
const FALLBACK_STATUS = [404, 500, 503]

type WithMockFallbackOptions<T> = {
  onSuccess?: (data: T) => void
  onFallback?: (error: Error) => void
}

const isAxiosError = (error: unknown): error is AxiosError => {
  if (!error || typeof error !== 'object') {
    return false
  }
  return Boolean((error as Partial<AxiosError>).isAxiosError)
}

const normalizeError = (error: unknown): Error => {
  if (!error) {
    return new Error('Đã xảy ra lỗi không xác định')
  }

  if (isAxiosError(error)) {
    const apiMessage =
      (error.response?.data as { message?: string })?.message ?? error.message
    return new Error(apiMessage || 'Không thể kết nối đến máy chủ thanh toán')
  }

  if (error instanceof Error) {
    return error
  }

  return new Error('Đã xảy ra lỗi không xác định')
}

const shouldFallbackToMock = (error: unknown): boolean => {
  if (!isAxiosError(error)) {
    return false
  }

  if (error.code && NETWORK_ERROR_CODES.includes(error.code)) {
    return true
  }

  const status = error.response?.status
  if (!status) {
    return false
  }

  return FALLBACK_STATUS.includes(status)
}

const withMockFallback = async <T>(
  fn: () => Promise<T>,
  fallback: () => T,
  options: WithMockFallbackOptions<T> = {},
): Promise<T> => {
  try {
    const data = await fn()
    options.onSuccess?.(data)
    return data
  } catch (err) {
    if (shouldFallbackToMock(err)) {
      const normalizedError = normalizeError(err)
      console.warn('[paymentService] Falling back to mock data:', normalizedError.message)
      const mocked = fallback()
      options.onFallback?.(normalizedError)
      return mocked
    }
    throw normalizeError(err)
  }
}

const ensureMockToken = (): string | null => {
  if (typeof window === 'undefined') {
    return null
  }
  const existing = localStorage.getItem('token')
  if (existing) {
    return existing
  }
  localStorage.setItem('token', MOCK_JWT)
  return MOCK_JWT
}

const generateMockId = (prefix: string): string => {
  const random = Math.random().toString(36).slice(2, 10)
  const timestamp = Date.now().toString(36)
  return `${prefix}_${timestamp}_${random}`
}

const createMockPayment = (
  payload: CreatePaymentRequest,
  paymentType: PaymentType,
): Payment => {
  const now = new Date().toISOString()
  return {
    id: generateMockId('pay_mock'),
    orderId: payload.orderId,
    customerId: payload.customerId ?? 'customer_mock',
    customerName: payload.metadata?.customerName?.toString() ?? 'Khách thử nghiệm',
    dealerId: payload.dealerId ?? 'dealer_mock',
    dealerName: payload.metadata?.dealerName?.toString() ?? 'VieCar Demo Dealer',
    amount: payload.amount,
    paymentMethod: payload.paymentMethod,
    status: paymentType === 'preorder' ? 'pending' : 'processing',
    transactionId: generateMockId('txn_mock'),
    createdAt: now,
    updatedAt: now,
    notes: payload.notes,
    paymentType,
    currency: 'VND',
    metadata: payload.metadata,
  }
}

const createPreorderPayment = async (
  payload: CreatePaymentRequest,
): Promise<Payment> => {
  ensureMockToken()
  return withMockFallback(
    async () => {
      const { data } = await api.post<Payment>('/api/payments/preorder', payload)
      return data
    },
    () => {
      const mock = createMockPayment(payload, 'preorder')
      mockPayments = [mock, ...mockPayments]
      return mock
    },
  )
}

const createOrderPayment = async (
  payload: CreatePaymentRequest,
): Promise<Payment> => {
  ensureMockToken()
  return withMockFallback(
    async () => {
      const { data } = await api.post<Payment>('/api/payments/order', payload)
      return data
    },
    () => {
      const mock = createMockPayment(payload, 'order')
      mockPayments = [mock, ...mockPayments]
      return mock
    },
  )
}

const getPaymentsByUser = async (userId: string): Promise<Payment[]> => {
  ensureMockToken()
  return withMockFallback(
    async () => {
      const { data } = await api.get<Payment[]>(`/api/payments/user/${userId}`)
      return data
    },
    () => mockPayments.filter((payment) => payment.customerId === userId),
  )
}

const getAllPayments = async (): Promise<PaymentListResponse> => {
  ensureMockToken()
  return withMockFallback(
    async () => {
      const { data } = await api.get<PaymentListResponse | Payment[]>(
        '/api/payments',
      )

      if (Array.isArray(data)) {
        return { items: data, total: data.length }
      }

      return data
    },
    () => ({ items: mockPayments, total: mockPayments.length }),
  )
}

const getPaymentById = async (paymentId: string): Promise<Payment> => {
  ensureMockToken()
  return withMockFallback(
    async () => {
      const { data } = await api.get<Payment>(`/api/payments/${paymentId}`)
      return data
    },
    () => {
      const existing = mockPayments.find((payment) => payment.id === paymentId)
      if (!existing) {
        throw new Error('Không tìm thấy giao dịch trong dữ liệu mô phỏng')
      }
      return existing
    },
  )
}

const markPaymentAsPaid = async (paymentId: string): Promise<Payment> => {
  ensureMockToken()
  return withMockFallback(
    async () => {
      const { data } = await api.put<Payment>(
        `/api/payments/${paymentId}/mark-paid`,
        {},
      )
      return data
    },
    () => {
      mockPayments = mockPayments.map((payment) => {
        if (payment.id !== paymentId) {
          return payment
        }
        return {
          ...payment,
          status: 'completed',
          approvedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      })

      const updated = mockPayments.find((payment) => payment.id === paymentId)
      if (!updated) {
        throw new Error('Không thể cập nhật dữ liệu mô phỏng')
      }
      return updated
    },
  )
}

const deletePayment = async (paymentId: string): Promise<void> => {
  ensureMockToken()
  await withMockFallback(
    async () => {
      await api.delete(`/api/payments/${paymentId}`)
    },
    () => {
      mockPayments = mockPayments.filter((payment) => payment.id !== paymentId)
    },
  )
}

const resetMockPayments = () => {
  mockPayments = [...MOCK_PAYMENTS_SEED]
}

const getMockPayments = (): Payment[] => [...mockPayments]

const getMockPaymentResponse = (): PaymentListResponse => ({
  items: getMockPayments(),
  total: mockPayments.length,
})

// Additional methods for customer dashboard
const getPaymentMethods = async (): Promise<any[]> => {
  ensureMockToken()
  // Return mock payment methods
  await new Promise(resolve => setTimeout(resolve, 300));
  return [];
}

const getTransactions = async (): Promise<any[]> => {
  ensureMockToken()
  // Return mock transactions
  await new Promise(resolve => setTimeout(resolve, 300));
  return [];
}

const getInstallmentPlans = async (): Promise<any[]> => {
  ensureMockToken()
  // Return mock installment plans
  await new Promise(resolve => setTimeout(resolve, 300));
  return [];
}

const addPaymentMethod = async (method: any): Promise<any> => {
  ensureMockToken()
  await new Promise(resolve => setTimeout(resolve, 300));
  return { id: `pm_${Date.now()}`, ...method };
}

const deletePaymentMethod = async (id: string): Promise<void> => {
  ensureMockToken()
  await new Promise(resolve => setTimeout(resolve, 300));
}

const setDefaultPaymentMethod = async (id: string): Promise<void> => {
  ensureMockToken()
  await new Promise(resolve => setTimeout(resolve, 300));
}

const createPayment = async (paymentData: any): Promise<any> => {
  ensureMockToken()
  await new Promise(resolve => setTimeout(resolve, 500));
  return {
    id: `txn_${Date.now()}`,
    ...paymentData,
    status: 'completed',
    date: new Date().toISOString()
  };
}

const payInstallment = async (planId: string, period: number, methodId: string): Promise<any> => {
  ensureMockToken()
  await new Promise(resolve => setTimeout(resolve, 500));
  return {
    id: `txn_${Date.now()}`,
    status: 'completed',
    amount: 50000000,
    date: new Date().toISOString()
  };
}

const downloadReceipt = async (transactionId: string): Promise<Blob> => {
  ensureMockToken()
  await new Promise(resolve => setTimeout(resolve, 500));
  const content = `BIÊN LAI THANH TOÁN\n\nMã giao dịch: ${transactionId}\nNgày: ${new Date().toLocaleDateString('vi-VN')}\n\nThông tin giao dịch...`;
  return new Blob([content], { type: 'text/plain' });
}

export const paymentService = {
  ensureMockToken,
  createPreorderPayment,
  createOrderPayment,
  getPaymentsByUser,
  getAllPayments,
  getPaymentById,
  markPaymentAsPaid,
  deletePayment,
  resetMockPayments,
  getMockPayments,
  getMockPaymentResponse,
  // Additional methods
  getPaymentMethods,
  getTransactions,
  getInstallmentPlans,
  addPaymentMethod,
  deletePaymentMethod,
  setDefaultPaymentMethod,
  createPayment,
  payInstallment,
  downloadReceipt,
  MOCK_JWT,
}

export type { Payment }
