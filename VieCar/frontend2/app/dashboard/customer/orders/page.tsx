"use client";

import { ProtectedRoute } from "@/components/auth-guards";
import CustomerLayout from "@/components/layout/customer-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, Truck, Package, CheckCircle } from "lucide-react";

export default function CustomerOrdersPage() {
  // Mock data - replace with actual API calls
  const orders = [
    {
      id: "ORD001",
      product: "VinFast VF e34",
      quantity: 1,
      totalAmount: "65,900,000",
      status: "Đã xác nhận",
      orderDate: "2024-03-15",
      deliveryDate: "2024-03-25",
      statusColor: "default"
    },
    {
      id: "ORD002", 
      product: "VinFast VF 8",
      quantity: 1,
      totalAmount: "1,200,000,000",
      status: "Đang vận chuyển",
      orderDate: "2024-02-20",
      deliveryDate: "2024-03-20",
      statusColor: "secondary"
    },
    {
      id: "ORD003",
      product: "Phụ kiện sạc",
      quantity: 2,
      totalAmount: "5,000,000",
      status: "Đã giao hàng",
      orderDate: "2024-01-10",
      deliveryDate: "2024-01-15",
      statusColor: "success"
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Đã xác nhận':
        return <CheckCircle className="h-4 w-4" />;
      case 'Đang vận chuyển':
        return <Truck className="h-4 w-4" />;
      case 'Đã giao hàng':
        return <Package className="h-4 w-4" />;
      default:
        return <CheckCircle className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Đã xác nhận':
        return <Badge variant="default">{status}</Badge>;
      case 'Đang vận chuyển':
        return <Badge variant="secondary">{status}</Badge>;
      case 'Đã giao hàng':
        return <Badge className="bg-green-500 hover:bg-green-600">{status}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <ProtectedRoute allowedRoles={['Customer']}>
      <CustomerLayout>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold">Đơn hàng của tôi</h1>
              <p className="text-muted-foreground mt-2">
                Theo dõi trạng thái và lịch sử đơn hàng của bạn
              </p>
            </div>
          </div>

          {/* Order Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tổng đơn hàng</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{orders.length}</div>
                <p className="text-xs text-muted-foreground">Tất cả thời gian</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Đang xử lý</CardTitle>
                <Truck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {orders.filter(o => o.status === "Đang vận chuyển" || o.status === "Đã xác nhận").length}
                </div>
                <p className="text-xs text-muted-foreground">Đơn hàng</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Đã hoàn thành</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {orders.filter(o => o.status === "Đã giao hàng").length}
                </div>
                <p className="text-xs text-muted-foreground">Đơn hàng</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tổng chi tiêu</CardTitle>
                <Badge className="h-4 w-4 text-muted-foreground">₫</Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(orders.reduce((sum, order) => sum + parseInt(order.totalAmount.replace(/,/g, '')), 0) / 1000000).toFixed(1)}M
                </div>
                <p className="text-xs text-muted-foreground">VNĐ</p>
              </CardContent>
            </Card>
          </div>

          {/* Orders Table */}
          <Card>
            <CardHeader>
              <CardTitle>Lịch sử đơn hàng</CardTitle>
              <CardDescription>
                Danh sách tất cả đơn hàng của bạn
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mã đơn hàng</TableHead>
                    <TableHead>Sản phẩm</TableHead>
                    <TableHead>Số lượng</TableHead>
                    <TableHead>Tổng tiền</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Ngày đặt</TableHead>
                    <TableHead>Ngày giao dự kiến</TableHead>
                    <TableHead>Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.id}</TableCell>
                      <TableCell>{order.product}</TableCell>
                      <TableCell>{order.quantity}</TableCell>
                      <TableCell>{order.totalAmount} ₫</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {getStatusIcon(order.status)}
                          <span className="ml-2">{getStatusBadge(order.status)}</span>
                        </div>
                      </TableCell>
                      <TableCell>{order.orderDate}</TableCell>
                      <TableCell>{order.deliveryDate}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </CustomerLayout>
    </ProtectedRoute>
  );
}