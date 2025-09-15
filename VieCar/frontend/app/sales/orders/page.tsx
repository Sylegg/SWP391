"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Search, Plus, Eye, Edit, Truck } from "lucide-react"
import Link from "next/link"
import { mockOrders, mockCustomers, mockVehicles } from "@/lib/mock-data"

export default function OrdersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const filteredOrders = mockOrders.filter((order) => {
    const customer = mockCustomers.find((c) => c.id === order.customerId)
    const vehicle = mockVehicles.find((v) => v.id === order.vehicleId)

    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle?.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle?.model.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || order.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline">Chờ xử lý</Badge>
      case "confirmed":
        return <Badge variant="default">Đã xác nhận</Badge>
      case "in-production":
        return <Badge variant="secondary">Đang sản xuất</Badge>
      case "ready":
        return (
          <Badge variant="default" className="bg-blue-600">
            Sẵn sàng giao
          </Badge>
        )
      case "delivered":
        return (
          <Badge variant="default" className="bg-green-600">
            Đã giao
          </Badge>
        )
      case "cancelled":
        return <Badge variant="destructive">Đã hủy</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline">Chờ thanh toán</Badge>
      case "partial":
        return <Badge variant="secondary">Thanh toán một phần</Badge>
      case "completed":
        return (
          <Badge variant="default" className="bg-green-600">
            Đã thanh toán
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/sales">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Về bán hàng
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold">Quản lý đơn hàng</h1>
                <p className="text-sm text-muted-foreground">Theo dõi và quản lý đơn hàng khách hàng</p>
              </div>
            </div>
            <Link href="/sales/orders/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Tạo đơn hàng mới
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Bộ lọc</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Tìm kiếm</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Tìm theo mã đơn hàng, khách hàng, xe..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Trạng thái</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả trạng thái</SelectItem>
                    <SelectItem value="pending">Chờ xử lý</SelectItem>
                    <SelectItem value="confirmed">Đã xác nhận</SelectItem>
                    <SelectItem value="in-production">Đang sản xuất</SelectItem>
                    <SelectItem value="ready">Sẵn sàng giao</SelectItem>
                    <SelectItem value="delivered">Đã giao</SelectItem>
                    <SelectItem value="cancelled">Đã hủy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Orders Table */}
        <Card>
          <CardHeader>
            <CardTitle>Danh sách đơn hàng</CardTitle>
            <CardDescription>Tìm thấy {filteredOrders.length} đơn hàng</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã đơn hàng</TableHead>
                  <TableHead>Khách hàng</TableHead>
                  <TableHead>Xe</TableHead>
                  <TableHead>Tổng tiền</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Thanh toán</TableHead>
                  <TableHead>Ngày giao dự kiến</TableHead>
                  <TableHead>Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => {
                  const customer = mockCustomers.find((c) => c.id === order.customerId)
                  const vehicle = mockVehicles.find((v) => v.id === order.vehicleId)

                  return (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">#{order.id}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{customer?.name || "N/A"}</p>
                          <p className="text-sm text-muted-foreground">{customer?.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {vehicle?.brand} {vehicle?.model}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {vehicle?.year} • {vehicle?.variant}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-bold">${order.totalAmount.toLocaleString()}</p>
                          <p className="text-sm text-muted-foreground">Đã trả: ${order.paidAmount.toLocaleString()}</p>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell>{getPaymentStatusBadge(order.paymentStatus)}</TableCell>
                      <TableCell>
                        <div>
                          <p>{new Date(order.expectedDelivery).toLocaleDateString("vi-VN")}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(order.expectedDelivery) > new Date() ? "Còn thời gian" : "Quá hạn"}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Link href={`/sales/orders/${order.id}`}>
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link href={`/sales/orders/${order.id}/edit`}>
                            <Button size="sm" variant="outline">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          {order.status === "ready" && (
                            <Button size="sm">
                              <Truck className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>

            {filteredOrders.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Không tìm thấy đơn hàng nào phù hợp</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
