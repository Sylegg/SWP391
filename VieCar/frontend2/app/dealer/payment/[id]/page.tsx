'use client'

import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, CheckCircle2, Clock, Loader2, Trash2 } from 'lucide-react'

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
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import {
  useDeletePayment,
  useMarkPaymentAsPaid,
  usePaymentDetail,
} from '@/hooks/use-payments'
import { formatDateTime, formatVND } from '@/lib/payment-utils'
import { useAuth } from '@/contexts/AuthContext'

const STATUS_LABELS: Record<string, string> = {
  pending: 'Chờ xử lý',
  processing: 'Đang xử lý',
  approved: 'Đã duyệt',
  completed: 'Hoàn tất',
  failed: 'Thất bại',
  refunded: 'Đã hoàn tiền',
  cancelled: 'Đã huỷ',
}

function PaymentDetailContent() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { toast } = useToast()
  const paymentId = params?.id

  const {
    payment,
    loading,
    error,
    refresh,
  } = usePaymentDetail(paymentId)
  const { markAsPaid, loading: marking } = useMarkPaymentAsPaid()
  const { deletePayment, loading: deleting } = useDeletePayment()

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-4xl py-12">
        <Card>
          <CardHeader>
            <CardTitle>Lỗi tải dữ liệu</CardTitle>
            <CardDescription>{error.message}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={() => refresh()}>
              Thử lại
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!payment) {
    return (
      <div className="mx-auto max-w-4xl py-12">
        <Card>
          <CardHeader>
            <CardTitle>Không tìm thấy thanh toán</CardTitle>
            <CardDescription>
              Giao dịch có thể đã bị xoá hoặc bạn không có quyền truy cập.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={() => router.back()}>
              Quay lại
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const statusLabel = STATUS_LABELS[payment.status] ?? payment.status

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 py-10">
      <div className="flex flex-col gap-3">
        <Button variant="ghost" className="w-fit gap-2" onClick={() => router.back()}>
          <ArrowLeft className="size-4" /> Quay lại
        </Button>
        <div>
          <h1 className="text-3xl font-semibold">Chi tiết thanh toán</h1>
          <p className="text-muted-foreground">
            Theo dõi trạng thái giao dịch và cập nhật thông tin khi cần.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <PaymentStatCard
          title="Số tiền thanh toán"
          value={formatVND(payment.amount)}
          description={`Phương thức: ${payment.paymentMethod.replace('_', ' ')}`}
          icon={<CheckCircle2 className="size-6" />}
        />
        <PaymentStatCard
          title="Trạng thái hiện tại"
          value={statusLabel}
          description={`Mã giao dịch: ${payment.transactionId ?? 'Đang cập nhật'}`}
          icon={<Loader2 className="size-6" />}
        />
        <PaymentStatCard
          title="Ngày tạo"
          value={formatDateTime(payment.createdAt)}
          description={`Cập nhật: ${formatDateTime(payment.updatedAt)}`}
          icon={<Clock className="size-6" />}
        />
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Thông tin giao dịch</CardTitle>
              <CardDescription>
                Mã đơn hàng {payment.orderId} do {payment.dealerName} quản lý.
              </CardDescription>
            </div>
            <Badge variant="outline" className="capitalize">
              {statusLabel}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <section className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Khách hàng</p>
              <p className="text-base font-semibold">{payment.customerName}</p>
              <p className="text-sm text-muted-foreground">{payment.customerId}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Đại lý phụ trách</p>
              <p className="text-base font-semibold">{payment.dealerName}</p>
              <p className="text-sm text-muted-foreground">{payment.dealerId}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Loại thanh toán</p>
              <p className="text-base font-semibold capitalize">
                {payment.paymentType === 'preorder' ? 'Đặt cọc' : 'Thanh toán hợp đồng'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Người duyệt</p>
              <p className="text-base font-semibold">
                {payment.approvedBy ?? 'Chưa có'}
              </p>
              <p className="text-sm text-muted-foreground">
                {payment.approvedAt ? formatDateTime(payment.approvedAt) : ''}
              </p>
            </div>
          </section>

          <Separator />

          <section className="grid gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Ghi chú</p>
              <p className="text-base">
                {payment.notes || 'Không có ghi chú từ khách hàng hoặc đại lý.'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Thông tin thêm</p>
              <pre className="mt-2 max-h-60 overflow-auto rounded-lg bg-muted p-4 text-sm">
{JSON.stringify(payment.metadata ?? {}, null, 2)}
              </pre>
            </div>
          </section>

          <Separator />

          <div className="flex flex-wrap items-center gap-3">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  disabled={payment.status === 'completed' || marking}
                  className="gap-2"
                >
                  <CheckCircle2 className="size-4" /> Đánh dấu đã thanh toán
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Xác nhận cập nhật</AlertDialogTitle>
                  <AlertDialogDescription>
                    Hệ thống sẽ cập nhật trạng thái giao dịch sang hoàn tất.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Huỷ</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={async () => {
                      try {
                        await markAsPaid(payment.id)
                        toast({
                          title: 'Đã cập nhật trạng thái',
                          description: 'Giao dịch đã được đánh dấu hoàn tất.',
                        })
                        refresh()
                      } catch (error) {
                        const message =
                          error instanceof Error
                            ? error.message
                            : 'Không thể cập nhật thanh toán'
                        toast({
                          title: 'Cập nhật thất bại',
                          description: message,
                        })
                      }
                    }}
                  >
                    Xác nhận
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="gap-2" disabled={deleting}>
                  <Trash2 className="size-4" /> Xoá giao dịch
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Xác nhận xoá</AlertDialogTitle>
                  <AlertDialogDescription>
                    Thao tác này sẽ xoá vĩnh viễn giao dịch khỏi hệ thống. Không thể khôi phục.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Huỷ</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={async () => {
                      try {
                        await deletePayment(payment.id)
                        toast({
                          title: 'Đã xoá giao dịch',
                          description: 'Giao dịch đã bị xoá khỏi hệ thống.',
                        })
                        router.push('/dealer/payments')
                      } catch (error) {
                        const message =
                          error instanceof Error
                            ? error.message
                            : 'Không thể xoá giao dịch'
                        toast({
                          title: 'Xoá không thành công',
                          description: message,
                        })
                      }
                    }}
                  >
                    Xoá
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function DealerPaymentDetailPage() {
  const { user } = useAuth()
  return (
    <ProtectedRoute allowedRoles={['Dealer Staff', 'Dealer Manager']}>
      <PaymentDetailContent key={user?.id} />
    </ProtectedRoute>
  )
}
