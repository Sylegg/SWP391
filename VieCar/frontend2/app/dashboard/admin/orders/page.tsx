"use client";

import { ProtectedRoute } from "@/components/auth-guards";
import AdminLayout from "@/components/layout/admin-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Edit, Eye, Truck, CheckCircle, XCircle } from "lucide-react";

export default function OrdersPage() {
  // Mock data - replace with actual API calls
  const orders = [
    {
      id: "ORD001",
      customerName: "Nguyễn Văn A",
      product: "VinFast VF e34",
      quantity: 1,
      totalAmount: "65,900,000",
      status: "Đã xác nhận",
      orderDate: "2024-03-15",
      deliveryDate: "2024-03-20"
    },
    {
      id: "ORD002",
      customerName: "Trần Thị B",
      product: "VinFast VF 8",
      quantity: 1,
      totalAmount: "1,200,000,000",
      status: "Đang xử lý",
      orderDate: "2024-03-14",
      deliveryDate: "2024-03-25"
    },
    {
      id: "ORD003",
      customerName: "Lê Văn C",
      product: "VinFast VF 9",
      quantity: 1,
      totalAmount: "1,500,000,000",
      status: "Đã giao hàng",
      orderDate: "2024-03-10",
      deliveryDate: "2024-03-18"
    },
    {
      id: "ORD004",
      customerName: "Phạm Thị D",
      product: "VinFast VF e34",
      quantity: 2,
      totalAmount: "131,800,000",
      status: "Đã hủy",
      orderDate: "2024-03-12",
      deliveryDate: "-"
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Đã xác nhận':
        return <Badge variant="default">{status}</Badge>;
      case 'Đang xử lý':
        return <Badge variant="secondary">{status}</Badge>;
      case 'Đã giao hàng':
        return <Badge className="bg-green-500 hover:bg-green-600">{status}</Badge>;
      case 'Đã hủy':
        return <Badge variant="destructive">{status}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <ProtectedRoute allowedRoles={['Admin', 'EVM_Staff']}>
      <AdminLayout>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold">Quản lý đơn hàng</h1>
              <p className="text-muted-foreground mt-2">
                Theo dõi và quản lý tất cả đơn hàng trong hệ thống
              </p>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tổng đơn hàng</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{orders.length}</div>
                <p className="text-xs text-muted-foreground">+12% so với tháng trước</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Đang xử lý</CardTitle>
                <Truck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {orders.filter(o => o.status === "Đang xử lý").length}
                </div>
                <p className="text-xs text-muted-foreground">Cần xử lý</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Đã giao hàng</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {orders.filter(o => o.status === "Đã giao hàng").length}
                </div>
                <p className="text-xs text-muted-foreground">Hoàn thành</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Đã hủy</CardTitle>
                <XCircle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {orders.filter(o => o.status === "Đã hủy").length}
                </div>
                <p className="text-xs text-muted-foreground">Tháng này</p>
              </CardContent>
            </Card>
          </div>

          {/* Search and filters */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Tìm kiếm và lọc</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Tìm kiếm theo mã đơn hàng, tên khách hàng..."
                      className="pl-10"
                    />
                  </div>
                </div>
                <Button variant="outline">Lọc theo trạng thái</Button>
                <Button variant="outline">Lọc theo ngày</Button>
                <Button variant="outline">Xuất báo cáo</Button>
              </div>
            </CardContent>
          </Card>

          {/* Orders table */}
          <Card>
            <CardHeader>
              <CardTitle>Danh sách đơn hàng</CardTitle>
              <CardDescription>
                Tổng cộng {orders.length} đơn hàng
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mã đơn hàng</TableHead>
                    <TableHead>Khách hàng</TableHead>
                    <TableHead>Sản phẩm</TableHead>
                    <TableHead>Số lượng</TableHead>
                    <TableHead>Tổng tiền</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Ngày đặt</TableHead>
                    <TableHead>Ngày giao</TableHead>
                    <TableHead>Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.id}</TableCell>
                      <TableCell>{order.customerName}</TableCell>
                      <TableCell>{order.product}</TableCell>
                      <TableCell>{order.quantity}</TableCell>
                      <TableCell>{order.totalAmount} ₫</TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell>{order.orderDate}</TableCell>
                      <TableCell>{order.deliveryDate}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
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
      </AdminLayout>
    </ProtectedRoute>
  );
}