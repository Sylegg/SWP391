'use client'

import { useMemo, useState } from 'react'
import { RefreshCcw } from 'lucide-react'

import { ProtectedRoute } from '@/components/auth-guards'
import { TransactionItem } from '@/components/payment'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useToast } from '@/hooks/use-toast'
import { useEnsurePaymentToken, useUserPayments } from '@/hooks/use-payments'
import { formatDateTime, formatVND } from '@/lib/payment-utils'
import { useAuth } from '@/contexts/AuthContext'
import type { PaymentStatus } from '@/types/payment'

const STATUS_FILTERS: Array<{ label: string; value: PaymentStatus | 'all' }> = [
  { label: 'Tất cả', value: 'all' },
  { label: 'Chờ xử lý', value: 'pending' },
  { label: 'Đang xử lý', value: 'processing' },
  { label: 'Hoàn tất', value: 'completed' },
  { label: 'Đã hủy', value: 'cancelled' },
]

const STATUS_BADGE: Record<PaymentStatus, 'default' | 'secondary' | 'destructive'> = {
  pending: 'secondary',
  processing: 'secondary',
  approved: 'default',
  completed: 'default',
  failed: 'destructive',
  refunded: 'secondary',
  cancelled: 'destructive',
}

function PaymentHistoryContent() {
  const { toast } = useToast()
  const { user } = useAuth()
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | 'all'>('all')
  const [search, setSearch] = useState('')

  useEnsurePaymentToken()

  const {
    payments,
    loading,
    error,
    refresh,
  } = useUserPayments(user?.id)

  const filteredPayments = useMemo(() => {
    return payments.filter((payment) => {
      const matchStatus =
        statusFilter === 'all' ? true : payment.status === statusFilter
      const normalizedSearch = search.trim().toLowerCase()
      if (!normalizedSearch) {
        return matchStatus
      }
      return (
        matchStatus &&
        [
          payment.orderId,
          payment.transactionId,
          payment.paymentMethod,
          payment.notes,
        ]
          .filter(Boolean)
          .some((value) =>
            value?.toString().toLowerCase().includes(normalizedSearch),
          )
      )
    })
  }, [payments, statusFilter, search])

  const handleViewDetail = () => {
    toast({
      title: 'Xem chi tiết thanh toán',
      description: 'Tính năng chi tiết dành cho nhân viên đại lý sẽ sớm được mở.',
    })
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 py-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold">Lịch sử thanh toán</h1>
        <p className="text-muted-foreground">
          Theo dõi toàn bộ giao dịch thanh toán đã thực hiện với đại lý VieCar.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="text-xl">Bộ lọc</CardTitle>
            <CardDescription>
              Sử dụng bộ lọc để tìm kiếm giao dịch nhanh chóng.
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            {STATUS_FILTERS.map((filter) => (
              <Button
                key={filter.value}
                variant={statusFilter === filter.value ? 'default' : 'outline'}
                onClick={() => setStatusFilter(filter.value)}
              >
                {filter.label}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="Tìm theo mã đơn hàng, giao dịch hoặc ghi chú"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
            <Button
              type="button"
              variant="outline"
              className="gap-2"
              onClick={() => refresh()}
            >
              <RefreshCcw className="size-4" />
              Làm mới
            </Button>
          </div>
        </CardContent>
      </Card>

      {error ? (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          {error.message}
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Lịch sử giao dịch</CardTitle>
          <CardDescription>
            {filteredPayments.length} giao dịch phù hợp với bộ lọc.
            {loading ? ' Đang tải dữ liệu...' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã đơn hàng</TableHead>
                <TableHead>Loại</TableHead>
                <TableHead>Số tiền</TableHead>
                <TableHead>Phương thức</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Ngày tạo</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    Không tìm thấy giao dịch phù hợp.
                  </TableCell>
                </TableRow>
              ) : (
                filteredPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      <div className="font-semibold">{payment.orderId}</div>
                      <div className="text-xs text-muted-foreground">
                        {payment.transactionId}
                      </div>
                    </TableCell>
                    <TableCell className="capitalize">
                      {payment.paymentType === 'preorder'
                        ? 'Đặt cọc'
                        : 'Thanh toán hợp đồng'}
                    </TableCell>
                    <TableCell className="font-medium text-foreground">
                      {formatVND(payment.amount)}
                    </TableCell>
                    <TableCell className="capitalize">
                      {payment.paymentMethod.replace('_', ' ')}
                    </TableCell>
                    <TableCell>
                      <Badge variant={STATUS_BADGE[payment.status]}>
                        {payment.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDateTime(payment.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetail()}
                      >
                        Chi tiết
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
            <TableCaption>
              Dữ liệu hiển thị dựa trên thông tin thanh toán theo tài khoản của bạn.
            </TableCaption>
          </Table>
        </CardContent>
      </Card>

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Giao dịch mới nhất</h2>
          <p className="text-sm text-muted-foreground">
            Tóm tắt nhanh 3 giao dịch gần nhất để kiểm tra trạng thái.
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {filteredPayments.slice(0, 3).map((payment) => (
            <TransactionItem key={payment.id} payment={payment} />
          ))}
        </div>
      </section>
    </div>
  )
}

export default function PaymentHistoryPage() {
  return (
    <ProtectedRoute allowedRoles={['Customer']}>
      <PaymentHistoryContent />
    </ProtectedRoute>
  )
}
