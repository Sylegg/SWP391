"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, FileText, ShoppingCart, Gift, Truck, DollarSign, TrendingUp } from "lucide-react"
import Link from "next/link"
import { mockQuotes, mockOrders, mockPromotions } from "@/lib/mock-data"

export default function SalesPage() {
  const pendingQuotes = mockQuotes.filter((q) => q.status === "sent").length
  const activeOrders = mockOrders.filter((o) => o.status !== "delivered" && o.status !== "cancelled").length
  const activePromotions = mockPromotions.filter((p) => p.isActive).length

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Về trang chủ
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <TrendingUp className="h-6 w-6 text-primary" />
              <div>
                <h1 className="text-xl font-bold">Quản lý bán hàng</h1>
                <p className="text-sm text-muted-foreground">Báo giá, đơn hàng, khuyến mãi và theo dõi giao hàng</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Báo giá chờ phản hồi</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingQuotes}</div>
              <p className="text-xs text-muted-foreground">Cần theo dõi</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Đơn hàng đang xử lý</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeOrders}</div>
              <p className="text-xs text-muted-foreground">Đang sản xuất/giao hàng</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Khuyến mãi đang chạy</CardTitle>
              <Gift className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activePromotions}</div>
              <p className="text-xs text-muted-foreground">Chương trình hiện tại</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Doanh thu tháng</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$360K</div>
              <p className="text-xs text-muted-foreground">+15% từ tháng trước</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-blue-600" />
                <div>
                  <CardTitle>Báo giá</CardTitle>
                  <CardDescription>Tạo và quản lý báo giá cho khách hàng</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Link href="/sales/quotes/new">
                  <Button className="w-full justify-start">Tạo báo giá mới</Button>
                </Link>
                <Link href="/sales/quotes">
                  <Button className="w-full justify-start bg-transparent" variant="outline">
                    Quản lý báo giá
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-center gap-3">
                <ShoppingCart className="h-8 w-8 text-green-600" />
                <div>
                  <CardTitle>Đơn hàng</CardTitle>
                  <CardDescription>Quản lý đơn hàng và hợp đồng</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Link href="/sales/orders/new">
                  <Button className="w-full justify-start">Tạo đơn hàng</Button>
                </Link>
                <Link href="/sales/orders">
                  <Button className="w-full justify-start bg-transparent" variant="outline">
                    Quản lý đơn hàng
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Gift className="h-8 w-8 text-purple-600" />
                <div>
                  <CardTitle>Khuyến mãi</CardTitle>
                  <CardDescription>Quản lý chương trình khuyến mãi</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Link href="/sales/promotions/new">
                  <Button className="w-full justify-start">Tạo khuyến mãi</Button>
                </Link>
                <Link href="/sales/promotions">
                  <Button className="w-full justify-start bg-transparent" variant="outline">
                    Quản lý khuyến mãi
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Truck className="h-8 w-8 text-orange-600" />
                <div>
                  <CardTitle>Theo dõi giao hàng</CardTitle>
                  <CardDescription>Trạng thái giao xe cho khách hàng</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Link href="/sales/delivery">
                  <Button className="w-full justify-start">Theo dõi giao hàng</Button>
                </Link>
                <Link href="/sales/inventory">
                  <Button className="w-full justify-start bg-transparent" variant="outline">
                    Đặt xe từ hãng
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-center gap-3">
                <DollarSign className="h-8 w-8 text-red-600" />
                <div>
                  <CardTitle>Thanh toán</CardTitle>
                  <CardDescription>Quản lý thanh toán và tài chính</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Link href="/sales/payments">
                  <Button className="w-full justify-start">Quản lý thanh toán</Button>
                </Link>
                <Link href="/sales/financing">
                  <Button className="w-full justify-start bg-transparent" variant="outline">
                    Hỗ trợ vay vốn
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Báo giá gần đây</CardTitle>
              <CardDescription>Các báo giá được tạo trong tuần qua</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockQuotes.slice(0, 3).map((quote) => (
                  <div key={quote.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">Báo giá #{quote.id}</p>
                      <p className="text-sm text-muted-foreground">
                        Khách hàng: {quote.customerId} • ${quote.totalPrice.toLocaleString()}
                      </p>
                    </div>
                    <Badge variant={quote.status === "sent" ? "default" : "secondary"}>
                      {quote.status === "sent"
                        ? "Đã gửi"
                        : quote.status === "accepted"
                          ? "Đã chấp nhận"
                          : quote.status === "expired"
                            ? "Hết hạn"
                            : "Nháp"}
                    </Badge>
                  </div>
                ))}
                <Link href="/sales/quotes">
                  <Button variant="outline" className="w-full bg-transparent">
                    Xem tất cả báo giá
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Đơn hàng cần xử lý</CardTitle>
              <CardDescription>Đơn hàng đang chờ xử lý hoặc giao hàng</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockOrders.slice(0, 3).map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">Đơn hàng #{order.id}</p>
                      <p className="text-sm text-muted-foreground">
                        Khách hàng: {order.customerId} • ${order.totalAmount.toLocaleString()}
                      </p>
                    </div>
                    <Badge
                      variant={
                        order.status === "confirmed"
                          ? "default"
                          : order.status === "in-production"
                            ? "secondary"
                            : order.status === "ready"
                              ? "default"
                              : "outline"
                      }
                    >
                      {order.status === "confirmed"
                        ? "Đã xác nhận"
                        : order.status === "in-production"
                          ? "Đang sản xuất"
                          : order.status === "ready"
                            ? "Sẵn sàng giao"
                            : order.status === "delivered"
                              ? "Đã giao"
                              : "Chờ xử lý"}
                    </Badge>
                  </div>
                ))}
                <Link href="/sales/orders">
                  <Button variant="outline" className="w-full bg-transparent">
                    Xem tất cả đơn hàng
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
