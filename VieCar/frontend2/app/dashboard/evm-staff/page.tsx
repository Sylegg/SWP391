"use client";

import { ProtectedRoute } from "@/components/auth-guards";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Tag,
  Car,
  Package,
  DollarSign,
  Building2,
  BarChart,
  Settings,
  Calendar,
  FileText,
  CheckCircle2,
  Users,
  TrendingUp,
  Truck,
  ClipboardList,
  CreditCard,
  Bell,
  ShieldCheck,
  PieChart,
  Activity
} from "lucide-react";
import Link from "next/link";
import EvmStaffLayout from "@/components/layout/evm-staff-layout";
import { useEffect, useState } from "react";

export default function EvmStaffDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    pendingRequests: 0,
    totalDealers: 0,
    totalProducts: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    // TODO: Fetch real statistics from API
    setStats({
      pendingRequests: 8,
      totalDealers: 15,
      totalProducts: 45,
      totalRevenue: 15000000000,
    });
  }, []);

  return (
    <ProtectedRoute allowedRoles={['EVM Staff', 'Admin']}>
      <EvmStaffLayout>
        <div className="p-6 space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold">Dashboard EVM Staff</h1>
            <p className="text-muted-foreground mt-2">
              Xin chào, {user?.username}. Quản lý toàn bộ hệ thống phân phối xe điện.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Yêu cầu chờ duyệt</CardTitle>
                <ClipboardList className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pendingRequests}</div>
                <p className="text-xs text-muted-foreground">Từ các đại lý</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tổng đại lý</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalDealers}</div>
                <p className="text-xs text-muted-foreground">Đang hoạt động</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sản phẩm</CardTitle>
                <Car className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalProducts}</div>
                <p className="text-xs text-muted-foreground">Mẫu xe</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Doanh thu</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {new Intl.NumberFormat('vi-VN', { 
                    notation: 'compact', 
                    compactDisplay: 'short' 
                  }).format(stats.totalRevenue)}₫
                </div>
                <p className="text-xs text-muted-foreground">Tháng này</p>
              </CardContent>
            </Card>
          </div>

          {/* Module 1: Danh mục & Sản phẩm */}
          <div>
            <h2 className="text-2xl font-semibold mb-4 flex items-center">
              <Tag className="mr-2 h-6 w-6" />
              Module 1: Danh mục & Sản phẩm
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center text-base">
                    <Tag className="mr-2 h-5 w-5 text-blue-600" />
                    Quản lý danh mục
                  </CardTitle>
                  <CardDescription>Tạo & quản lý danh mục xe</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/dashboard/evm-staff/categories">
                    <Button variant="outline" className="w-full">
                      <Tag className="mr-2 h-4 w-4" />
                      Xem danh mục
                    </Button>
                  </Link>
                  <p className="text-xs text-muted-foreground mt-2">✅ Create, View</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center text-base">
                    <Car className="mr-2 h-5 w-5 text-green-600" />
                    Quản lý mẫu xe
                  </CardTitle>
                  <CardDescription>CRUD sản phẩm xe điện</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/dashboard/evm-staff/products">
                    <Button className="w-full">
                      <Car className="mr-2 h-4 w-4" />
                      Quản lý xe
                    </Button>
                  </Link>
                  <p className="text-xs text-muted-foreground mt-2">✅ Full CRUD</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center text-base">
                    <Activity className="mr-2 h-5 w-5 text-purple-600" />
                    Kích hoạt xe
                  </CardTitle>
                  <CardDescription>Quản lý trạng thái hiển thị</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/dashboard/evm-staff/products?filter=status">
                    <Button variant="outline" className="w-full">
                      <Activity className="mr-2 h-4 w-4" />
                      Quản lý trạng thái
                    </Button>
                  </Link>
                  <p className="text-xs text-muted-foreground mt-2">✅ Update</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center text-base">
                    <Settings className="mr-2 h-5 w-5 text-orange-600" />
                    Chính sách phân phối
                  </CardTitle>
                  <CardDescription>Hạn mức & thời gian giao</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full" disabled>
                    <Settings className="mr-2 h-4 w-4" />
                    Cấu hình (Sắp ra mắt)
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">⏳ Coming soon</p>
                </CardContent>
              </Card>
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center text-base">
                    <Settings className="mr-2 h-5 w-5 text-orange-600" />
                    Cấu hình hệ thống
                  </CardTitle>
                  <CardDescription>Cài đặt & cấu hình</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full" disabled>
                    <Settings className="mr-2 h-4 w-4" />
                    Cấu hình
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">⏳ Coming soon</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Module 2: Thanh toán & Công nợ */}
          <div>
            <h2 className="text-2xl font-semibold mb-4 flex items-center">
              <DollarSign className="mr-2 h-6 w-6" />
              Module 2: Thanh toán & Công nợ
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center text-base">
                    <CreditCard className="mr-2 h-5 w-5 text-blue-600" />
                    Thanh toán đại lý
                  </CardTitle>
                  <CardDescription>Xem danh sách thanh toán</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/dashboard/evm-staff/payments">
                    <Button variant="outline" className="w-full">
                      <CreditCard className="mr-2 h-4 w-4" />
                      Xem thanh toán
                    </Button>
                  </Link>
                  <p className="text-xs text-muted-foreground mt-2">✅ View</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center text-base">
                    <CheckCircle2 className="mr-2 h-5 w-5 text-green-600" />
                    Xác nhận thanh toán
                  </CardTitle>
                  <CardDescription>Confirm giao dịch</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/dashboard/evm-staff/payments?filter=pending">
                    <Button className="w-full">
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Xác nhận
                    </Button>
                  </Link>
                  <p className="text-xs text-muted-foreground mt-2">✅ Confirm</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center text-base">
                    <FileText className="mr-2 h-5 w-5 text-purple-600" />
                    Xuất hóa đơn
                  </CardTitle>
                  <CardDescription>Chứng từ điện tử</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/dashboard/evm-staff/payments/invoices">
                    <Button variant="outline" className="w-full">
                      <FileText className="mr-2 h-4 w-4" />
                      Xuất hóa đơn
                    </Button>
                  </Link>
                  <p className="text-xs text-muted-foreground mt-2">✅ Generate</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center text-base">
                    <DollarSign className="mr-2 h-5 w-5 text-orange-600" />
                    Quản lý công nợ
                  </CardTitle>
                  <CardDescription>Hạn mức tín dụng</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/dashboard/evm-staff/debt-management">
                    <Button variant="outline" className="w-full">
                      <DollarSign className="mr-2 h-4 w-4" />
                      Quản lý
                    </Button>
                  </Link>
                  <p className="text-xs text-muted-foreground mt-2">✅ Manage</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Module 4: Đại lý */}
          <div>
            <h2 className="text-2xl font-semibold mb-4 flex items-center">
              <Building2 className="mr-2 h-6 w-6" />
              Module 4: Quản lý đại lý
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center text-base">
                    <Building2 className="mr-2 h-5 w-5 text-blue-600" />
                    Danh sách đại lý
                  </CardTitle>
                  <CardDescription>Xem tất cả đại lý</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/dashboard/evm-staff/dealers">
                    <Button variant="outline" className="w-full">
                      <Building2 className="mr-2 h-4 w-4" />
                      Xem đại lý
                    </Button>
                  </Link>
                  <p className="text-xs text-muted-foreground mt-2">✅ View</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center text-base">
                    <Users className="mr-2 h-5 w-5 text-green-600" />
                    Tạo đại lý mới
                  </CardTitle>
                  <CardDescription>Mở chi nhánh mới</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/dashboard/evm-staff/dealers/create">
                    <Button className="w-full">
                      <Users className="mr-2 h-4 w-4" />
                      Tạo mới
                    </Button>
                  </Link>
                  <p className="text-xs text-muted-foreground mt-2">✅ Create</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center text-base">
                    <Settings className="mr-2 h-5 w-5 text-purple-600" />
                    Cập nhật đại lý
                  </CardTitle>
                  <CardDescription>Thông tin & hợp đồng</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/dashboard/evm-staff/dealers">
                    <Button variant="outline" className="w-full">
                      <Settings className="mr-2 h-4 w-4" />
                      Cập nhật
                    </Button>
                  </Link>
                  <p className="text-xs text-muted-foreground mt-2">✅ Update</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center text-base">
                    <ShieldCheck className="mr-2 h-5 w-5 text-orange-600" />
                    Phân quyền Manager
                  </CardTitle>
                  <CardDescription>Gán tài khoản quản lý</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/dashboard/evm-staff/dealers/assign-manager">
                    <Button variant="outline" className="w-full">
                      <ShieldCheck className="mr-2 h-4 w-4" />
                      Phân quyền
                    </Button>
                  </Link>
                  <p className="text-xs text-muted-foreground mt-2">✅ Assign</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Module 5: Báo cáo & Phân tích */}
          <div>
            <h2 className="text-2xl font-semibold mb-4 flex items-center">
              <BarChart className="mr-2 h-6 w-6" />
              Module 5: Báo cáo & Phân tích
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center text-base">
                    <PieChart className="mr-2 h-5 w-5 text-blue-600" />
                    Tổng quan hệ thống
                  </CardTitle>
                  <CardDescription>Dashboard tổng hợp</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/dashboard/evm-staff/reports/overview">
                    <Button variant="outline" className="w-full">
                      <PieChart className="mr-2 h-4 w-4" />
                      Xem tổng quan
                    </Button>
                  </Link>
                  <p className="text-xs text-muted-foreground mt-2">✅ View</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center text-base">
                    <BarChart className="mr-2 h-5 w-5 text-green-600" />
                    Thống kê theo vùng
                  </CardTitle>
                  <CardDescription>Dự đoán sản xuất</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/dashboard/evm-staff/reports/regional">
                    <Button variant="outline" className="w-full">
                      <BarChart className="mr-2 h-4 w-4" />
                      Theo vùng
                    </Button>
                  </Link>
                  <p className="text-xs text-muted-foreground mt-2">✅ View</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center text-base">
                    <TrendingUp className="mr-2 h-5 w-5 text-purple-600" />
                    Hiệu suất đại lý
                  </CardTitle>
                  <CardDescription>KPI tháng/quý</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/dashboard/evm-staff/reports/dealer-performance">
                    <Button variant="outline" className="w-full">
                      <TrendingUp className="mr-2 h-4 w-4" />
                      Xem KPI
                    </Button>
                  </Link>
                  <p className="text-xs text-muted-foreground mt-2">✅ View</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Module 6: Khác */}
          <div>
            <h2 className="text-2xl font-semibold mb-4 flex items-center">
              <Settings className="mr-2 h-6 w-6" />
              Module 6: Quản trị hệ thống
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center text-base">
                    <Users className="mr-2 h-5 w-5 text-blue-600" />
                    Quản lý người dùng EVM
                  </CardTitle>
                  <CardDescription>Nhân viên nội bộ hãng</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/dashboard/evm-staff/internal-users">
                    <Button variant="outline" className="w-full">
                      <Users className="mr-2 h-4 w-4" />
                      Quản lý nhân viên
                    </Button>
                  </Link>
                  <p className="text-xs text-muted-foreground mt-2">✅ Manage</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center text-base">
                    <Bell className="mr-2 h-5 w-5 text-green-600" />
                    Thông báo hệ thống
                  </CardTitle>
                  <CardDescription>Gửi thông báo cho đại lý</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/dashboard/evm-staff/notifications">
                    <Button className="w-full">
                      <Bell className="mr-2 h-4 w-4" />
                      Quản lý thông báo
                    </Button>
                  </Link>
                  <p className="text-xs text-muted-foreground mt-2">✅ Create/Update</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </EvmStaffLayout>
    </ProtectedRoute>
  );
}
