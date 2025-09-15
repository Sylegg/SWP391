"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, BarChart3, TrendingUp, DollarSign, Users, FileText, AlertTriangle } from "lucide-react"
import Link from "next/link"

export default function ReportsPage() {
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
              <BarChart3 className="h-6 w-6 text-primary" />
              <div>
                <h1 className="text-xl font-bold">Báo cáo & Phân tích</h1>
                <p className="text-sm text-muted-foreground">Doanh số, công nợ và phân tích kinh doanh</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Doanh thu tháng này</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$360,000</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+15%</span> so với tháng trước
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Xe đã bán</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+8</span> xe so với tháng trước
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Khách hàng mới</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">Tháng này</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Công nợ cần thu</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$45,000</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-red-600">3</span> khách hàng quá hạn
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Report Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-blue-600" />
                <div>
                  <CardTitle>Báo cáo doanh số</CardTitle>
                  <CardDescription>Doanh thu theo nhân viên và thời gian</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Link href="/reports/sales">
                  <Button className="w-full justify-start">Xem báo cáo doanh số</Button>
                </Link>
                <Link href="/reports/sales/staff">
                  <Button className="w-full justify-start bg-transparent" variant="outline">
                    Doanh số theo nhân viên
                  </Button>
                </Link>
                <Link href="/reports/sales/monthly">
                  <Button className="w-full justify-start bg-transparent" variant="outline">
                    Báo cáo theo tháng
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-center gap-3">
                <DollarSign className="h-8 w-8 text-green-600" />
                <div>
                  <CardTitle>Báo cáo công nợ</CardTitle>
                  <CardDescription>Công nợ khách hàng và hãng xe</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Link href="/reports/debts">
                  <Button className="w-full justify-start">Tổng quan công nợ</Button>
                </Link>
                <Link href="/reports/debts/customers">
                  <Button className="w-full justify-start bg-transparent" variant="outline">
                    Công nợ khách hàng
                  </Button>
                </Link>
                <Link href="/reports/debts/manufacturers">
                  <Button className="w-full justify-start bg-transparent" variant="outline">
                    Công nợ hãng xe
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-center gap-3">
                <BarChart3 className="h-8 w-8 text-purple-600" />
                <div>
                  <CardTitle>Phân tích kinh doanh</CardTitle>
                  <CardDescription>Xu hướng và hiệu suất bán hàng</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Link href="/reports/analytics">
                  <Button className="w-full justify-start">Phân tích tổng quan</Button>
                </Link>
                <Link href="/reports/analytics/trends">
                  <Button className="w-full justify-start bg-transparent" variant="outline">
                    Xu hướng bán hàng
                  </Button>
                </Link>
                <Link href="/reports/analytics/performance">
                  <Button className="w-full justify-start bg-transparent" variant="outline">
                    Hiệu suất nhân viên
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-orange-600" />
                <div>
                  <CardTitle>Báo cáo khách hàng</CardTitle>
                  <CardDescription>Phân tích hành vi khách hàng</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Link href="/reports/customers">
                  <Button className="w-full justify-start">Phân tích khách hàng</Button>
                </Link>
                <Link href="/reports/customers/acquisition">
                  <Button className="w-full justify-start bg-transparent" variant="outline">
                    Khách hàng mới
                  </Button>
                </Link>
                <Link href="/reports/customers/retention">
                  <Button className="w-full justify-start bg-transparent" variant="outline">
                    Khách hàng quay lại
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-red-600" />
                <div>
                  <CardTitle>Báo cáo tồn kho</CardTitle>
                  <CardDescription>Quản lý và phân tích tồn kho</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Link href="/reports/inventory">
                  <Button className="w-full justify-start">Tình trạng tồn kho</Button>
                </Link>
                <Link href="/reports/inventory/turnover">
                  <Button className="w-full justify-start bg-transparent" variant="outline">
                    Vòng quay hàng tồn
                  </Button>
                </Link>
                <Link href="/reports/inventory/aging">
                  <Button className="w-full justify-start bg-transparent" variant="outline">
                    Xe tồn kho lâu
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-8 w-8 text-yellow-600" />
                <div>
                  <CardTitle>Báo cáo tài chính</CardTitle>
                  <CardDescription>Lợi nhuận và chi phí</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Link href="/reports/financial">
                  <Button className="w-full justify-start">Báo cáo tài chính</Button>
                </Link>
                <Link href="/reports/financial/profit">
                  <Button className="w-full justify-start bg-transparent" variant="outline">
                    Lợi nhuận theo xe
                  </Button>
                </Link>
                <Link href="/reports/financial/expenses">
                  <Button className="w-full justify-start bg-transparent" variant="outline">
                    Chi phí vận hành
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Reports */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Báo cáo gần đây</CardTitle>
              <CardDescription>Các báo cáo đã tạo trong tuần qua</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Báo cáo doanh số tháng 12</p>
                      <p className="text-sm text-muted-foreground">Tạo ngày 15/12/2024</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">PDF</Badge>
                    <Button size="sm" variant="outline">
                      Tải xuống
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">Báo cáo công nợ khách hàng</p>
                      <p className="text-sm text-muted-foreground">Tạo ngày 14/12/2024</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Excel</Badge>
                    <Button size="sm" variant="outline">
                      Tải xuống
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium">Phân tích khách hàng Q4</p>
                      <p className="text-sm text-muted-foreground">Tạo ngày 13/12/2024</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">PDF</Badge>
                    <Button size="sm" variant="outline">
                      Tải xuống
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
