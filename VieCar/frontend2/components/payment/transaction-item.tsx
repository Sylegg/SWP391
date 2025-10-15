import { Clock3 } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDateTime, formatVND } from '@/lib/payment-utils'
import type { Payment } from '@/types/payment'

interface TransactionItemProps {
  payment: Payment
  highlight?: boolean
}

const STATUS_MAP: Record<Payment['status'], { label: string; variant?: 'default' | 'secondary' | 'destructive' }> = {
  pending: { label: 'Chờ xử lý', variant: 'secondary' },
  processing: { label: 'Đang xử lý', variant: 'secondary' },
  approved: { label: 'Đã duyệt', variant: 'default' },
  completed: { label: 'Hoàn tất', variant: 'default' },
  failed: { label: 'Thất bại', variant: 'destructive' },
  refunded: { label: 'Hoàn tiền', variant: 'secondary' },
  cancelled: { label: 'Đã hủy', variant: 'destructive' },
}

export function TransactionItem({ payment, highlight = false }: TransactionItemProps) {
  const statusMeta = STATUS_MAP[payment.status]

  return (
    <Card className={highlight ? 'border-primary/60 shadow-md' : undefined}>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 gap-3">
        <div className="flex flex-col">
          <CardTitle className="text-base font-semibold">
            {payment.notes || `Đơn hàng ${payment.orderId}`}
          </CardTitle>
          <span className="text-sm text-muted-foreground">{payment.dealerName}</span>
        </div>
        <Badge variant={statusMeta.variant}>{statusMeta.label}</Badge>
      </CardHeader>
      <CardContent className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Clock3 className="size-4" />
          {formatDateTime(payment.createdAt)}
        </div>
        <div className="text-base font-semibold text-foreground">
          {formatVND(payment.amount)}
        </div>
      </CardContent>
    </Card>
  )
}
