'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { CreditCard, ShieldCheck, Wallet } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { ProtectedRoute } from '@/components/auth-guards'
import { PaymentMethodCard, PaymentStatCard } from '@/components/payment'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import {
  useCreatePayment,
  useEnsurePaymentToken,
  useUserPayments,
} from '@/hooks/use-payments'
import { formatVND, validatePaymentAmount } from '@/lib/payment-utils'
import { useAuth } from '@/contexts/AuthContext'
import type { CreatePaymentRequest, PaymentMethod, PaymentType } from '@/types/payment'

const PAYMENT_METHODS = ['cash', 'bank_transfer'] as const
type SupportedPaymentMethod = (typeof PAYMENT_METHODS)[number]
const PAYMENT_TYPES = ['preorder', 'order'] as const satisfies PaymentType[]

const paymentSchema = z.object({
  orderId: z.string().min(1, 'Vui lòng nhập mã đơn hàng/ hợp đồng'),
  amount: z
    .coerce
    .number()
    .min(100000, 'Số tiền tối thiểu là 100.000 VND'),
  notes: z
    .string()
    .max(200, 'Ghi chú tối đa 200 ký tự')
    .optional()
    .or(z.literal('')),
  paymentMethod: z.enum(PAYMENT_METHODS, {
    required_error: 'Vui lòng chọn phương thức thanh toán',
  }),
  paymentType: z.enum(PAYMENT_TYPES),
})

const methodMeta: Record<SupportedPaymentMethod, { title: string; description: string }> = {
  cash: {
    title: 'Thanh toán tiền mặt',
    description: 'Thanh toán trực tiếp tại đại lý hoặc khi nhận xe.',
  },
  bank_transfer: {
    title: 'Thanh toán qua cổng',
    description:
      'Sử dụng chuyển khoản ngân hàng hoặc ví điện tử đã được hệ thống liên kết.',
  },
}

type PaymentFormValues = z.infer<typeof paymentSchema>

function PaymentForm() {
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  const [paymentType, setPaymentType] = useState<PaymentType>('order')
  const [selectedMethod, setSelectedMethod] = useState<SupportedPaymentMethod>('cash')

  useEnsurePaymentToken()

  const {
    payments,
    stats,
    loading: historyLoading,
    error: historyError,
    refresh,
  } = useUserPayments(user?.id)
  const { createPayment, loading } = useCreatePayment()

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      orderId: '',
      amount: 0,
      notes: '',
      paymentMethod: selectedMethod,
      paymentType,
    },
  })

  const amountError = form.formState.errors.amount?.message

  const handleMethodSelect = (method: PaymentMethod) => {
    if (!PAYMENT_METHODS.includes(method as SupportedPaymentMethod)) {
      return
    }
    const nextMethod = method as SupportedPaymentMethod
    setSelectedMethod(nextMethod)
    form.setValue('paymentMethod', nextMethod)
  }

  const handlePaymentTypeChange = (type: PaymentType) => {
    setPaymentType(type)
    form.setValue('paymentType', type)
  }

  const onSubmit = form.handleSubmit(async (values) => {
    const validation = validatePaymentAmount(values.amount)
    if (!validation.valid) {
      toast({
        title: 'Số tiền không hợp lệ',
        description: validation.error,
      })
      return
    }

    try {
      const payload = {
        orderId: values.orderId,
        amount: values.amount,
        paymentMethod: values.paymentMethod,
        notes: values.notes ? values.notes : undefined,
        customerId: user?.id,
        paymentType,
        metadata: {
          customerName: user?.username,
          dealerName: values.notes
            ? `Ghi chú: ${values.notes}`
            : 'Dealer mặc định',
        },
      } satisfies CreatePaymentRequest
      const result = await createPayment(payload, paymentType)
      toast({
        title: 'Tạo thanh toán thành công',
        description: `Mã giao dịch ${result.transactionId ?? result.id}`,
      })
      form.reset({
        orderId: '',
        amount: 0,
        notes: '',
        paymentMethod: selectedMethod,
        paymentType,
      })
      refresh()
      router.push('/payment/success')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Không thể tạo thanh toán'
      toast({
        title: 'Tạo thanh toán thất bại',
        description: message,
      })
    }
  })

  const summaryCards = useMemo(
    () => [
      {
        title: 'Tổng giao dịch',
        value: stats.totalPayments.toString(),
        description: historyLoading
          ? 'Đang tải lịch sử thanh toán'
          : `${stats.completedCount} giao dịch hoàn tất`,
        trendLabel: stats.pendingCount ? `${stats.pendingCount} đang chờ` : undefined,
      },
      {
        title: 'Tổng số tiền',
        value: formatVND(stats.totalAmount),
        description: 'Bao gồm cả đặt cọc và thanh toán hợp đồng',
        trendLabel: stats.completedCount
          ? `${stats.completedCount} giao dịch thành công`
          : undefined,
      },
    ],
    [stats, historyLoading],
  )

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 py-10">
      <section className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-semibold">Thanh toán đơn hàng</h1>
          <p className="mt-2 text-muted-foreground">
            Chọn phương thức thanh toán phù hợp để hoàn tất đặt cọc hoặc thanh toán
            hợp đồng mua xe.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {summaryCards.map((card, index) => (
            <PaymentStatCard
              key={card.title}
              title={card.title}
              value={card.value}
              description={card.description}
              trendLabel={card.trendLabel}
              trendDirection={index === 0 ? 'up' : 'up'}
              icon={index === 0 ? <ShieldCheck className="size-6" /> : <CreditCard className="size-6" />}
            />
          ))}
        </div>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Thông tin thanh toán</CardTitle>
          <CardDescription>
            {paymentType === 'preorder'
              ? 'Khách hàng thanh toán tiền đặt cọc trước khi ký hợp đồng chính thức.'
              : 'Thanh toán toàn bộ giá trị hợp đồng đã ký với đại lý.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <span className="font-medium">Loại thanh toán:</span>
              <div className="flex gap-3">
                {PAYMENT_TYPES.map((type) => (
                  <Button
                    key={type}
                    type="button"
                    variant={paymentType === type ? 'default' : 'outline'}
                    onClick={() => handlePaymentTypeChange(type)}
                  >
                    {type === 'preorder' ? 'Đặt cọc' : 'Thanh toán hợp đồng'}
                  </Button>
                ))}
              </div>
            </div>

            <form onSubmit={onSubmit} className="grid gap-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="orderId">Mã đơn hàng / hợp đồng</Label>
                  <Input id="orderId" placeholder="VD: HD-2309" {...form.register('orderId')} />
                  {form.formState.errors.orderId ? (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.orderId.message}
                    </p>
                  ) : null}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="amount">Số tiền (VND)</Label>
                  <Input
                    id="amount"
                    type="number"
                    min={100000}
                    step={50000}
                    placeholder="Nhập số tiền"
                    {...form.register('amount', { valueAsNumber: true })}
                  />
                  {amountError ? <p className="text-sm text-destructive">{amountError}</p> : null}
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="notes">Ghi chú</Label>
                <Textarea
                  id="notes"
                  rows={4}
                  placeholder="Thông tin bổ sung cho đại lý (không bắt buộc)"
                  {...form.register('notes')}
                />
              </div>

              <div className="space-y-3">
                <Label>Phương thức thanh toán</Label>
                <div className="grid gap-4 md:grid-cols-2">
                  {PAYMENT_METHODS.map((method) => (
                    <PaymentMethodCard
                      key={method}
                      method={method}
                      title={methodMeta[method].title}
                      description={methodMeta[method].description}
                      icon={method === 'cash' ? <Wallet className="size-6" /> : <CreditCard className="size-6" />}
                      badge={method === 'bank_transfer' ? 'Khuyến nghị' : undefined}
                      selected={selectedMethod === method}
                      onSelect={handleMethodSelect}
                    />
                  ))}
                </div>
              </div>

              {form.formState.errors.paymentMethod ? (
                <p className="text-sm text-destructive">
                  {form.formState.errors.paymentMethod.message}
                </p>
              ) : null}

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="text-sm text-muted-foreground">
                  * Bằng cách tiếp tục, bạn đồng ý với điều khoản thanh toán của VieCar.
                </div>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Đang xử lý...' : 'Xác nhận thanh toán'}
                </Button>
              </div>
            </form>
          </div>
        </CardContent>
      </Card>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Hoạt động gần đây</h2>
            <p className="text-sm text-muted-foreground">
              Danh sách các thanh toán gần nhất của bạn.
            </p>
          </div>
          <Button variant="outline" onClick={refresh}>
            Làm mới
          </Button>
        </div>
        {historyError ? (
          <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
            {historyError.message}
          </div>
        ) : null}
        <div className="grid gap-3 md:grid-cols-2">
          {payments.length === 0 && !historyLoading ? (
            <p className="text-sm text-muted-foreground">
              Bạn chưa có giao dịch nào. Hãy tạo giao dịch đầu tiên ngay!
            </p>
          ) : null}
          {payments.slice(0, 4).map((payment) => (
            <Card key={payment.id}>
              <CardHeader className="space-y-1">
                <CardTitle className="text-base font-semibold">
                  {payment.notes || `Đơn hàng ${payment.orderId}`}
                </CardTitle>
                <CardDescription>
                  {payment.paymentType === 'preorder' ? 'Đặt cọc' : 'Thanh toán hợp đồng'}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Số tiền</span>
                  <span className="font-semibold text-foreground">{formatVND(payment.amount)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Trạng thái</span>
                  <span className="font-medium capitalize">{payment.status}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Ngày tạo</span>
                  <span>{new Date(payment.createdAt).toLocaleString('vi-VN')}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}

export default function CustomerPaymentPage() {
  return (
    <ProtectedRoute allowedRoles={['Customer']}>
      <PaymentForm />
    </ProtectedRoute>
  )
}
