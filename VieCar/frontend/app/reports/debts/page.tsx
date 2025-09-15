"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Search, Download, AlertTriangle, DollarSign, Clock, TrendingDown } from "lucide-react"
import Link from "next/link"

export default function DebtsReportPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  // Mock customer debt data
  const customerDebts = [
    {
      id: "1",
      customerName: "Nguyễn Văn An",
      totalDebt: 15000,
      overdueAmount: 5000,
      lastPaymentDate: "2024-11-15",
      nextDueDate: "2024-12-20",
      status: "overdue" as const,
      phone: "+84 901 234 567",
    },
    {
      id: "2",
      customerName: "Trần Thị Bình",
      totalDebt: 25000,
      overdueAmount: 0,
      lastPaymentDate: "2024-12-10",
      nextDueDate: "2025-01-10",
      status: "current" as const,
      phone: "+84 902 345 678",
    },
    {
      id: "3",
      customerName: "Lê Văn Cường",
      totalDebt: 8000,
      overdueAmount: 8000,
      lastPaymentDate: "2024-10-20",
      nextDueDate: "2024-11-20",
      status: "critical" as const,
      phone: "+84 903 456 789",
    },
  ]

  // Mock manufacturer debt data
  const manufacturerDebts = [
    {
      id: "1",
      manufacturerName: "Toyota Vietnam",
      totalOwed: 150000,
      pendingOrders: 8,
      lastPaymentDate: "2024-12-01",
      creditLimit: 200000,
      status: "good" as const,
    },
    {
      id: "2",
      manufacturerName: "Honda Vietnam",
      totalOwed: 180000,
      pendingOrders: 12,
      lastPaymentDate: "2024-11-25",
      creditLimit: 200000,
      status: "warning" as const,
    },
    {
      id: "3",
      manufacturerName: "BMW Vietnam",
      totalOwed: 95000,
      pendingOrders: 3,
      lastPaymentDate: "2024-12-05",
      creditLimit: 150000,
      status: "good" as const,
    },
  ]

  const filteredCustomerDebts = customerDebts.filter((debt) => {
    const matchesSearch =
      debt.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || debt.phone.includes(searchTerm)

    const matchesStatus = statusFilter === "all" || debt.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "current":
        return (
          <Badge variant="default" className="bg-green-600">
            Hiện tại
          </Badge>
        )
      case "overdue":
        return <Badge variant="destructive">Quá hạn</Badge>
      case "critical":
        return (
          <Badge variant="destructive" className="bg-red-700">
            Nghiêm trọng
          </Badge>
        )
      case "good":
        return (
          <Badge variant="default" className="bg-green-600">
            Tốt
          </Badge>
        )
      case "warning":
        return <Badge variant="secondary">Cảnh báo</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const totalCustomerDebt = customerDebts.reduce((sum, debt) => sum + debt.totalDebt, 0)
  const totalOverdue = customerDebts.reduce((sum, debt) => sum + debt.overdueAmount, 0)
  const totalManufacturerDebt = manufacturerDebts.reduce((sum, debt) => sum + debt.totalOwed, 0)

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
                <DollarSign className="h-6 w-6 text-primary" />
                <div>
                  <h1 className="text-xl font-bold">Báo cáo công nợ</h1>
                  <p className="text-sm text-muted-foreground">Quản lý công nợ khách hàng và hãng xe</p>
                </div>
              </div>
            </div>
            <Button>
              <Download className="h-4 w-4 mr-2" />
              Xuất báo cáo
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tổng công nợ KH</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalCustomerDebt.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Từ {customerDebts.length} khách hàng</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Quá hạn thanh toán</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">${totalOverdue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {customerDebts.filter((d) => d.overdueAmount > 0).length} khách hàng
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Nợ hãng xe</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalManufacturerDebt.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Từ {manufacturerDebts.length} hãng xe</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tỷ lệ thu hồi</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">85%</div>
              <p className="text-xs text-muted-foreground">Trong 30 ngày</p>
            </CardContent>
          </Card>
        </div>

        {/* Customer Debts */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Công nợ khách hàng</CardTitle>
                <CardDescription>Danh sách khách hàng có công nợ</CardDescription>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Tìm khách hàng..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="current">Hiện tại</SelectItem>
                    <SelectItem value="overdue">Quá hạn</SelectItem>
                    <SelectItem value="critical">Nghiêm trọng</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Khách hàng</TableHead>
                  <TableHead>Tổng nợ</TableHead>
                  <TableHead>Quá hạn</TableHead>
                  <TableHead>Thanh toán cuối</TableHead>
                  <TableHead>Hạn tiếp theo</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomerDebts.map((debt) => (
                  <TableRow key={debt.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{debt.customerName}</p>
                        <p className="text-sm text-muted-foreground">{debt.phone}</p>
                      </div>
                    </TableCell>
                    <TableCell className="font-bold">${debt.totalDebt.toLocaleString()}</TableCell>
                    <TableCell>
                      {debt.overdueAmount > 0 ? (
                        <span className="font-bold text-red-600">${debt.overdueAmount.toLocaleString()}</span>
                      ) : (
                        <span className="text-muted-foreground">$0</span>
                      )}
                    </TableCell>
                    <TableCell>{new Date(debt.lastPaymentDate).toLocaleDateString("vi-VN")}</TableCell>
                    <TableCell>
                      <div>
                        <p>{new Date(debt.nextDueDate).toLocaleDateString("vi-VN")}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(debt.nextDueDate) < new Date() ? "Đã quá hạn" : "Còn thời gian"}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(debt.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          Liên hệ
                        </Button>
                        <Button size="sm" variant="outline">
                          Chi tiết
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Manufacturer Debts */}
        <Card>
          <CardHeader>
            <CardTitle>Công nợ hãng xe</CardTitle>
            <CardDescription>Số tiền nợ các hãng xe</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Hãng xe</TableHead>
                  <TableHead>Tổng nợ</TableHead>
                  <TableHead>Đơn hàng chờ</TableHead>
                  <TableHead>Thanh toán cuối</TableHead>
                  <TableHead>Hạn mức tín dụng</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {manufacturerDebts.map((debt) => (
                  <TableRow key={debt.id}>
                    <TableCell className="font-medium">{debt.manufacturerName}</TableCell>
                    <TableCell className="font-bold">${debt.totalOwed.toLocaleString()}</TableCell>
                    <TableCell>{debt.pendingOrders} đơn hàng</TableCell>
                    <TableCell>{new Date(debt.lastPaymentDate).toLocaleDateString("vi-VN")}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">${debt.creditLimit.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">
                          Còn lại: ${(debt.creditLimit - debt.totalOwed).toLocaleString()}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(debt.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          Thanh toán
                        </Button>
                        <Button size="sm" variant="outline">
                          Chi tiết
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
