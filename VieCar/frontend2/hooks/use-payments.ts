'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import { paymentService } from '@/lib/services/paymentService'
import {
  type CreatePaymentRequest,
  type Payment,
  type PaymentListResponse,
  type PaymentType,
} from '@/types/payment'

interface AsyncState {
  loading: boolean
  error: Error | null
}

const useAsyncState = () => {
  const [state, setState] = useState<AsyncState>({ loading: false, error: null })

  const start = useCallback(() => {
    setState({ loading: true, error: null })
  }, [])

  const success = useCallback(() => {
    setState({ loading: false, error: null })
  }, [])

  const fail = useCallback((error: Error) => {
    setState({ loading: false, error })
  }, [])

  return { state, start, success, fail }
}

export const useEnsurePaymentToken = () => {
  useEffect(() => {
    paymentService.ensureMockToken()
  }, [])
}

export const useUserPayments = (userId?: string) => {
  const [payments, setPayments] = useState<Payment[]>([])
  const { state, start, success, fail } = useAsyncState()

  const fetchPayments = useCallback(async () => {
    if (!userId) {
      setPayments([])
      return
    }
    start()
    try {
      const data = await paymentService.getPaymentsByUser(userId)
      setPayments(data)
      success()
    } catch (error) {
      fail(error instanceof Error ? error : new Error('Không thể tải danh sách thanh toán'))
    }
  }, [userId, start, success, fail])

  useEffect(() => {
    paymentService.ensureMockToken()
    fetchPayments()
  }, [fetchPayments])

  const pendingCount = useMemo(
    () => payments.filter((payment) => payment.status === 'pending').length,
    [payments],
  )

  const completedCount = useMemo(
    () => payments.filter((payment) => payment.status === 'completed').length,
    [payments],
  )

  const totalAmount = useMemo(
    () => payments.reduce((sum, payment) => sum + payment.amount, 0),
    [payments],
  )

  return {
    payments,
    loading: state.loading,
    error: state.error,
    refresh: fetchPayments,
    stats: {
      totalPayments: payments.length,
      pendingCount,
      completedCount,
      totalAmount,
    },
  }
}

export const useDealerPayments = () => {
  const [payload, setPayload] = useState<PaymentListResponse>({ items: [], total: 0 })
  const { state, start, success, fail } = useAsyncState()

  const fetchAll = useCallback(async () => {
    start()
    try {
      const result = await paymentService.getAllPayments()
      setPayload(result)
      success()
    } catch (error) {
      fail(error instanceof Error ? error : new Error('Không thể tải dữ liệu thanh toán'))
    }
  }, [start, success, fail])

  useEffect(() => {
    paymentService.ensureMockToken()
    fetchAll()
  }, [fetchAll])

  const summary = useMemo(() => {
    const totalRevenue = payload.items.reduce((sum, item) => sum + item.amount, 0)
    const pending = payload.items.filter((item) => item.status === 'pending').length
    const completed = payload.items.filter((item) => item.status === 'completed').length
    const processing = payload.items.filter((item) => item.status === 'processing').length

    return {
      totalRevenue,
      pending,
      completed,
      processing,
    }
  }, [payload])

  return {
    payments: payload.items,
    total: payload.total,
    loading: state.loading,
    error: state.error,
    refresh: fetchAll,
    summary,
  }
}

export const usePaymentDetail = (paymentId?: string) => {
  const [payment, setPayment] = useState<Payment | null>(null)
  const { state, start, success, fail } = useAsyncState()

  const fetchDetail = useCallback(async () => {
    if (!paymentId) {
      setPayment(null)
      return
    }
    start()
    try {
      const data = await paymentService.getPaymentById(paymentId)
      setPayment(data)
      success()
    } catch (error) {
      fail(error instanceof Error ? error : new Error('Không thể tải thông tin thanh toán'))
    }
  }, [paymentId, start, success, fail])

  useEffect(() => {
    paymentService.ensureMockToken()
    fetchDetail()
  }, [fetchDetail])

  return {
    payment,
    loading: state.loading,
    error: state.error,
    refresh: fetchDetail,
  }
}

export const useCreatePayment = (defaultType: PaymentType = 'order') => {
  const { state, start, success, fail } = useAsyncState()

  const createPayment = useCallback(
    async (payload: CreatePaymentRequest, typeOverride?: PaymentType) => {
      const type = typeOverride ?? payload.paymentType ?? defaultType
      start()
      try {
        const result =
          type === 'preorder'
            ? await paymentService.createPreorderPayment({ ...payload, paymentType: type })
            : await paymentService.createOrderPayment({ ...payload, paymentType: type })
        success()
        return result
      } catch (error) {
        const normalized =
          error instanceof Error ? error : new Error('Không thể tạo thanh toán mới')
        fail(normalized)
        throw normalized
      }
    },
    [defaultType, start, success, fail],
  )

  return {
    createPayment,
    loading: state.loading,
    error: state.error,
  }
}

export const useMarkPaymentAsPaid = () => {
  const { state, start, success, fail } = useAsyncState()

  const markAsPaid = useCallback(async (paymentId: string) => {
    start()
    try {
      const result = await paymentService.markPaymentAsPaid(paymentId)
      success()
      return result
    } catch (error) {
      const normalized =
        error instanceof Error ? error : new Error('Không thể cập nhật trạng thái thanh toán')
      fail(normalized)
      throw normalized
    }
  }, [start, success, fail])

  return {
    markAsPaid,
    loading: state.loading,
    error: state.error,
  }
}

export const useDeletePayment = () => {
  const { state, start, success, fail } = useAsyncState()

  const deletePayment = useCallback(async (paymentId: string) => {
    start()
    try {
      await paymentService.deletePayment(paymentId)
      success()
    } catch (error) {
      const normalized =
        error instanceof Error ? error : new Error('Không thể xoá thanh toán này')
      fail(normalized)
      throw normalized
    }
  }, [start, success, fail])

  return {
    deletePayment,
    loading: state.loading,
    error: state.error,
  }
}

export const useMockPayments = () => {
  const [data, setData] = useState<PaymentListResponse>(() => {
    return paymentService.getMockPaymentResponse()
  })

  const refresh = useCallback(() => {
    setData(paymentService.getMockPaymentResponse())
  }, [])

  const reset = useCallback(() => {
    paymentService.resetMockPayments()
    refresh()
  }, [refresh])

  return {
    ...data,
    refresh,
    reset,
  }
}
