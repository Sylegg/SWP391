"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Download, TrendingUp, DollarSign, Car, Target } from "lucide-react"
import Link from "next/link"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts"

export default function SalesReportPage() {
  const [timeRange, setTimeRange] = useState("month")

  // Mock data for charts
  const monthlyData = [
    { month: "T1", revenue: 280000, units: 18, target: 300000 },
    { month: "T2", revenue: 320000, units: 22, target: 300000 },
    { month: "T3", revenue: 290000, units: 19, target: 300000 },
    { month: "T4", revenue: 350000, units: 24, target: 300000 },
    { month: "T5", revenue: 380000, units: 26, target: 350000 },
    { month: "T6", revenue: 420000, units: 28, target: 350000 },
    { month: "T7", revenue: 390000, units: 25, target: 350000 },
    { month: "T8", revenue: 360000, units: 23, target: 350000 },
    { month: "T9", revenue: 410000, units: 27, target: 400000 },
    { month: "T10", revenue: 450000, units: 30, target: 400000 },
    { month: "T11", revenue: 380000, units: 25, target: 400000 },
    { month: "T12", revenue: 360000, units: 24, target: 400000 },
  ]

  const staffData = [
    { name: "Lê Minh Tuấn", revenue: 120000, units: 8, commission: 6000 },
    { name: "Phạm Thị Lan", revenue: 95000, units: 6, commission: 4750 },
    { name: "Nguyễn Văn Hùng", revenue: 85000, units: 5, commission: 4250 },
    { name: "Trần Thị Mai", revenue: 60000, units: 4, commission: 3000 },
  ]

  const vehicleTypeData = [
    { name: "Sedan", value: 35, color: "#0088FE" },
    { name: "SUV", value: 30, color: "#00C49F" },
    { name: "Hatchback", value: 20, color: "#FFBB28" },
    { name: "Luxury", value: 15, color: "#FF8042" },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/reports">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Về báo cáo
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <TrendingUp className="h-6 w-6 text-primary" />
                <div>
                  <h1 className="text-xl font-bold">Báo cáo doanh số</h1>
                  <p className="text-sm text-muted-foreground">Phân tích doanh thu và hiệu suất bán hàng</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Tuần này</SelectItem>
                  <SelectItem value="month">Tháng này</SelectItem>
                  <SelectItem value="quarter">Quý này</SelectItem>
                  <SelectItem value="year">Năm này</SelectItem>
                </SelectContent>
              </Select>
              <Button>
                <Download className="h-4 w-4 mr-2" />
                Xuất báo cáo
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tổng doanh thu</CardTitle>
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
              <Car className="h-4 w-4 text-muted-foreground" />
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
              <CardTitle className="text-sm font-medium">Giá trung bình</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$15,000</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+3%</span> so với tháng trước
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Đạt mục tiêu</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">90%</div>
              <p className="text-xs text-muted-foreground">Mục tiêu $400,000</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Revenue Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Xu hướng doanh thu</CardTitle>
              <CardDescription>Doanh thu theo tháng trong năm</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, "Doanh thu"]} />
                  <Line type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2} />
                  <Line type="monotone" dataKey="target" stroke="#dc2626" strokeWidth={2} strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Units Sold */}
          <Card>
            <CardHeader>
              <CardTitle>Số lượng xe bán</CardTitle>
              <CardDescription>Số xe bán theo tháng</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value} xe`, "Số lượng"]} />
                  <Bar dataKey="units" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Vehicle Type Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Phân bố theo loại xe</CardTitle>
              <CardDescription>Tỷ lệ bán theo từng loại xe</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={vehicleTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {vehicleTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top Performers */}
          <Card>
            <CardHeader>
              <CardTitle>Hiệu suất nhân viên</CardTitle>
              <CardDescription>Doanh số theo nhân viên bán hàng</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {staffData.map((staff, index) => (
                  <div key={staff.name} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{staff.name}</p>
                        <p className="text-sm text-muted-foreground">{staff.units} xe bán</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">${staff.revenue.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">Hoa hồng: ${staff.commission.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Tóm tắt hiệu suất</CardTitle>
            <CardDescription>Đánh giá tổng quan hiệu suất bán hàng</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 border rounded-lg">
                <div className="text-3xl font-bold text-green-600 mb-2">Tốt</div>
                <p className="text-sm text-muted-foreground">Doanh thu vượt mục tiêu</p>
                <Badge variant="default" className="mt-2 bg-green-600">
                  +15% so với kế hoạch
                </Badge>
              </div>

              <div className="text-center p-6 border rounded-lg">
                <div className="text-3xl font-bold text-blue-600 mb-2">Ổn định</div>
                <p className="text-sm text-muted-foreground">Số lượng xe bán ổn định</p>
                <Badge variant="secondary" className="mt-2">
                  24 xe/tháng
                </Badge>
              </div>

              <div className="text-center p-6 border rounded-lg">
                <div className="text-3xl font-bold text-orange-600 mb-2">Cần cải thiện</div>
                <p className="text-sm text-muted-foreground">Tỷ lệ chuyển đổi từ lái thử</p>
                <Badge variant="outline" className="mt-2">
                  65% tỷ lệ chuyển đổi
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
