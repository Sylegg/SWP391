'use client'

import { useMemo, useState } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { ProtectedRoute } from '@/components/auth-guards'
import { PaymentStatCard } from '@/components/payment'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
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
import {
  useDealerPayments,
  useDeletePayment,
  useMarkPaymentAsPaid,
} from '@/hooks/use-payments'
import { formatDateTime, formatVND } from '@/lib/payment-utils'
import type { Payment, PaymentStatus } from '@/types/payment'
import { CheckCircle2, Clock, HandCoins, Trash2 } from 'lucide-react'

const FILTERS: Array<{ label: string; value: PaymentStatus | 'pending_only' | 'all' }> = [
  { label: 'Tất cả', value: 'all' },
  { label: 'Chờ xử lý', value: 'pending_only' },
  { label: 'Đang xử lý', value: 'processing' },
  { label: 'Hoàn tất', value: 'completed' },
  { label: 'Đã duyệt', value: 'approved' },
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

function DealerPaymentsContent() {
  const { toast } = useToast()
  const { payments, summary, refresh, loading, error } = useDealerPayments()
  const { markAsPaid, loading: marking } = useMarkPaymentAsPaid()
  const { deletePayment, loading: deleting } = useDeletePayment()
  const [filter, setFilter] = useState<PaymentStatus | 'pending_only' | 'all'>('all')

  const filteredPayments = useMemo(() => {
    switch (filter) {
      case 'all':
        return payments
      case 'pending_only':
        return payments.filter((payment) => payment.status === 'pending')
      default:
        return payments.filter((payment) => payment.status === filter)
    }
  }, [filter, payments])

  const handleMarkPaid = async (payment: Payment) => {
    try {
      await markAsPaid(payment.id)
      toast({
        title: 'Đã cập nhật trạng thái',
        description: `Thanh toán ${payment.orderId} đã được đánh dấu hoàn tất.`,
      })
      refresh()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Không thể cập nhật thanh toán'
      toast({
        title: 'Cập nhật thất bại',
        description: message,
      })
    }
  }

  const handleDelete = async (payment: Payment) => {
    try {
      await deletePayment(payment.id)
      toast({
        title: 'Đã xoá giao dịch',
        description: `Giao dịch ${payment.orderId} đã được loại bỏ khỏi danh sách.`,
      })
      refresh()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Không thể xoá giao dịch'
      toast({
        title: 'Xoá thất bại',
        description: message,
      })
    }
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8 py-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold">Quản lý thanh toán</h1>
        <p className="text-muted-foreground">
          Theo dõi các giao dịch thanh toán từ khách hàng và xử lý theo trạng thái thực tế.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <PaymentStatCard
          title="Tổng doanh thu"
          value={formatVND(summary.totalRevenue)}
          description="Giá trị thanh toán đã ghi nhận"
          trendLabel={`${summary.completed} hoàn tất`}
          icon={<HandCoins className="size-6" />}
        />
        <PaymentStatCard
          title="Đang chờ xử lý"
          value={`${summary.pending}`}
          description="Giao dịch cần xác nhận thanh toán"
          trendLabel="Ưu tiên xử lý"
          icon={<Clock className="size-6" />}
        />
        <PaymentStatCard
          title="Đã hoàn tất"
          value={`${summary.completed}`}
          description="Đã giao xe hoặc thanh toán thành công"
          trendLabel={`${summary.processing} đang kiểm tra`}
          icon={<CheckCircle2 className="size-6" />}
        />
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="text-xl">Danh sách thanh toán</CardTitle>
            <CardDescription>
              {filteredPayments.length} giao dịch hiển thị theo bộ lọc.
              {loading ? ' Đang cập nhật dữ liệu...' : ''}
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((item) => (
              <Button
                key={item.value}
                variant={filter === item.value ? 'default' : 'outline'}
                onClick={() => setFilter(item.value)}
              >
                {item.label}
              </Button>
            ))}
            <Button variant="outline" onClick={() => refresh()}>
              Làm mới
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="mb-4 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
              {error.message}
            </div>
          ) : null}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Đơn hàng</TableHead>
                <TableHead>Khách hàng</TableHead>
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
                    Không có giao dịch nào.
                  </TableCell>
                </TableRow>
              ) : (
                filteredPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      <div className="font-semibold">{payment.orderId}</div>
                      <div className="text-xs text-muted-foreground">
                        {payment.paymentType === 'preorder' ? 'Đặt cọc' : 'Hợp đồng'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{payment.customerName}</div>
                      <div className="text-xs text-muted-foreground">{payment.customerId}</div>
                    </TableCell>
                    <TableCell className="font-semibold text-foreground">
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
                      <div className="flex justify-end gap-2">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="sm"
                              disabled={marking || payment.status === 'completed'}
                            >
                              Đánh dấu đã thanh toán
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Xác nhận hoàn tất</AlertDialogTitle>
                              <AlertDialogDescription>
                                Bạn có chắc chắn muốn đánh dấu giao dịch {payment.orderId} đã được thanh toán?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Huỷ</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={async () => {
                                  await handleMarkPaid(payment)
                                }}
                              >
                                Đồng ý
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" disabled={deleting}>
                              <Trash2 className="mr-1 size-4" /> Xoá
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Xoá giao dịch?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Thao tác này sẽ xoá vĩnh viễn giao dịch khỏi hệ thống.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Huỷ</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(payment)}>
                                Xoá
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
            <TableCaption>
              Dữ liệu bao gồm mọi giao dịch của đại lý. Cập nhật thời gian thực khi đồng bộ với hệ thống backend.
            </TableCaption>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

export default function DealerPaymentsPage() {
  return (
    <ProtectedRoute allowedRoles={['Dealer Staff', 'Dealer Manager']}>
      <DealerPaymentsContent />
    </ProtectedRoute>
  )
}
