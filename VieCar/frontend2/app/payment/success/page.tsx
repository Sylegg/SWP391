'use client'

import { useRouter } from 'next/navigation'
import { CheckCircle2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export default function PaymentSuccessPage() {
  const router = useRouter()

  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 px-4">
      <Card className="max-w-xl text-center shadow-lg">
        <CardHeader className="space-y-4">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <CheckCircle2 className="size-8" />
          </div>
          <CardTitle className="text-3xl font-semibold">Thanh toán thành công</CardTitle>
          <CardDescription className="text-base">
            Cảm ơn bạn đã hoàn tất thanh toán. Hệ thống sẽ xác nhận và gửi thông báo khi giao dịch được xử lý.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <p>
            Bạn có thể kiểm tra tình trạng giao dịch trong mục lịch sử thanh toán hoặc liên hệ trực tiếp với đại lý để nhận hỗ trợ.
          </p>
          <p>
            Nếu có bất kỳ thay đổi nào, hãy chuẩn bị mã giao dịch tại trang lịch sử để tiện trao đổi với nhân viên VieCar.
          </p>
        </CardContent>
        <CardFooter className="flex flex-wrap items-center justify-center gap-3">
          <Button onClick={() => router.push('/customer/payment/history')}>
            Xem lịch sử thanh toán
          </Button>
          <Button variant="outline" onClick={() => router.push('/customer/payment')}>
            Thực hiện giao dịch mới
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
