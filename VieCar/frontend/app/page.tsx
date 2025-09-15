import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { UserNav } from "@/components/user-nav"
import { Car, Users, FileText, TrendingUp, Calendar, DollarSign } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Car className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">AutoDealer Pro</h1>
                <p className="text-sm text-muted-foreground">Hệ thống quản lý đại lý xe hơi</p>
              </div>
            </div>
            <UserNav />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tổng xe có sẵn</CardTitle>
              <Car className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-muted-foreground">+2 từ tuần trước</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Khách hàng</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">156</div>
              <p className="text-xs text-muted-foreground">+12 khách hàng mới</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Đơn hàng tháng này</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">+3 từ tháng trước</p>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Car className="h-8 w-8 text-blue-600" />
                <div>
                  <CardTitle>Danh mục xe</CardTitle>
                  <CardDescription>Xem thông tin xe, so sánh mẫu xe</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Link href="/vehicles">
                  <Button className="w-full justify-start bg-transparent" variant="outline">
                    Xem danh mục xe
                  </Button>
                </Link>
                <Link href="/vehicles/compare">
                  <Button className="w-full justify-start bg-transparent" variant="outline">
                    So sánh xe
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-green-600" />
                <div>
                  <CardTitle>Quản lý bán hàng</CardTitle>
                  <CardDescription>Báo giá, đơn hàng, khuyến mãi</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Link href="/sales/quotes">
                  <Button className="w-full justify-start bg-transparent" variant="outline">
                    Tạo báo giá
                  </Button>
                </Link>
                <Link href="/sales/orders">
                  <Button className="w-full justify-start bg-transparent" variant="outline">
                    Quản lý đơn hàng
                  </Button>
                </Link>
                <Link href="/sales/promotions">
                  <Button className="w-full justify-start bg-transparent" variant="outline">
                    Khuyến mãi
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-purple-600" />
                <div>
                  <CardTitle>Quản lý khách hàng</CardTitle>
                  <CardDescription>Hồ sơ khách hàng, lịch hẹn</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Link href="/customers">
                  <Button className="w-full justify-start bg-transparent" variant="outline">
                    Danh sách khách hàng
                  </Button>
                </Link>
                <Link href="/customers/test-drives">
                  <Button className="w-full justify-start bg-transparent" variant="outline">
                    Lịch lái thử
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-orange-600" />
                <div>
                  <CardTitle>Báo cáo</CardTitle>
                  <CardDescription>Doanh số, công nợ, phân tích</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Link href="/reports/sales">
                  <Button className="w-full justify-start bg-transparent" variant="outline">
                    Báo cáo doanh số
                  </Button>
                </Link>
                <Link href="/reports/debts">
                  <Button className="w-full justify-start bg-transparent" variant="outline">
                    Báo cáo công nợ
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Calendar className="h-8 w-8 text-red-600" />
                <div>
                  <CardTitle>Lịch hẹn hôm nay</CardTitle>
                  <CardDescription>3 cuộc hẹn lái thử</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-sm">
                  <p className="font-medium">10:00 - Nguyễn Văn An</p>
                  <p className="text-muted-foreground">Toyota Camry</p>
                </div>
                <div className="text-sm">
                  <p className="font-medium">14:00 - Trần Thị Bình</p>
                  <p className="text-muted-foreground">BMW 3 Series</p>
                </div>
                <Link href="/customers/test-drives">
                  <Button className="w-full mt-3 bg-transparent" variant="outline" size="sm">
                    Xem tất cả
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-indigo-600" />
                <div>
                  <CardTitle>Hoạt động gần đây</CardTitle>
                  <CardDescription>Cập nhật mới nhất</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div>
                  <p className="font-medium">Báo giá mới được tạo</p>
                  <p className="text-muted-foreground">Toyota Camry - Nguyễn Văn An</p>
                </div>
                <div>
                  <p className="font-medium">Đơn hàng được xác nhận</p>
                  <p className="text-muted-foreground">BMW 3 Series - Trần Thị Bình</p>
                </div>
                <Button className="w-full mt-3 bg-transparent" variant="outline" size="sm">
                  Xem chi tiết
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
