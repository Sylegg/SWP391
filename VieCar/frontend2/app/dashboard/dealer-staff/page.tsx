"use client";

import { ProtectedRoute } from "@/components/auth-guards";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ShoppingCart,
  Car,
  Users,
  Calendar,
  Tag,
  FileText,
  CheckCircle2,
  TrendingUp,
  ClipboardList,
  UserPlus,
  Settings
} from "lucide-react";
import Link from "next/link";
import DealerStaffLayout from "@/components/layout/dealer-staff-layout";
import { useEffect, useState } from "react";

export default function DealerStaffDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    pendingOrders: 0,
    totalCustomers: 0,
    todayTestDrives: 0,
    availableVehicles: 0,
  });

  useEffect(() => {
    // TODO: Fetch real statistics from API
    setStats({
      pendingOrders: 12,
      totalCustomers: 45,
      todayTestDrives: 3,
      availableVehicles: 28,
    });
  }, []);

  return (
    <ProtectedRoute allowedRoles={['Dealer Staff', 'Admin']}>
      <DealerStaffLayout>
        <div className="p-6 space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold">Dashboard Nhân viên Đại lý</h1>
            <p className="text-muted-foreground mt-2">
              Xin chào, {user?.username}. Quản lý bán hàng và chăm sóc khách hàng.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Đơn chờ xử lý</CardTitle>
                <ClipboardList className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pendingOrders}</div>
                <p className="text-xs text-muted-foreground">Cần xác nhận</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Khách hàng</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalCustomers}</div>
                <p className="text-xs text-muted-foreground">Tổng số</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Lịch lái thử hôm nay</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.todayTestDrives}</div>
                <p className="text-xs text-muted-foreground">Buổi</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Xe có sẵn</CardTitle>
                <Car className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.availableVehicles}</div>
                <p className="text-xs text-muted-foreground">Chiếc</p>
              </CardContent>
            </Card>
          </div>

          {/* Module 1: Bán hàng */}
          <div>
            <h2 className="text-2xl font-semibold mb-4 flex items-center">
              <ShoppingCart className="mr-2 h-6 w-6" />
              Module 1: Bán hàng
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center text-base">
                    <ShoppingCart className="mr-2 h-5 w-5 text-blue-600" />
                    Đơn đặt xe
                  </CardTitle>
                  <CardDescription>Quản lý đơn hàng</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/dashboard/dealer-staff/orders">
                    <Button className="w-full">
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Xem đơn hàng
                    </Button>
                  </Link>
                  <p className="text-xs text-muted-foreground mt-2">✅ View, Create</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center text-base">
                    <CheckCircle2 className="mr-2 h-5 w-5 text-green-600" />
                    Xử lý đơn hàng
                  </CardTitle>
                  <CardDescription>Xác nhận & cập nhật</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/dashboard/dealer-staff/orders?filter=pending">
                    <Button variant="outline" className="w-full">
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Xử lý
                    </Button>
                  </Link>
                  <p className="text-xs text-muted-foreground mt-2">✅ Update</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center text-base">
                    <Car className="mr-2 h-5 w-5 text-purple-600" />
                    Danh mục xe
                  </CardTitle>
                  <CardDescription>Xem xe có sẵn</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/dashboard/dealer-staff/dealer-category">
                    <Button variant="outline" className="w-full">
                      <Car className="mr-2 h-4 w-4" />
                      Xem danh mục
                    </Button>
                  </Link>
                  <p className="text-xs text-muted-foreground mt-2">✅ View</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center text-base">
                    <Tag className="mr-2 h-5 w-5 text-orange-600" />
                    Danh mục Category
                  </CardTitle>
                  <CardDescription>Phân loại sản phẩm</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/dashboard/dealer-staff/categories">
                    <Button variant="outline" className="w-full">
                      <Tag className="mr-2 h-4 w-4" />
                      Xem phân loại
                    </Button>
                  </Link>
                  <p className="text-xs text-muted-foreground mt-2">✅ View</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Module 2: Khách hàng */}
          <div>
            <h2 className="text-2xl font-semibold mb-4 flex items-center">
              <Users className="mr-2 h-6 w-6" />
              Module 2: Quản lý khách hàng
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center text-base">
                    <Users className="mr-2 h-5 w-5 text-blue-600" />
                    Danh sách khách hàng
                  </CardTitle>
                  <CardDescription>Xem thông tin KH</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/dashboard/dealer-staff/customers">
                    <Button variant="outline" className="w-full">
                      <Users className="mr-2 h-4 w-4" />
                      Xem khách hàng
                    </Button>
                  </Link>
                  <p className="text-xs text-muted-foreground mt-2">✅ View</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center text-base">
                    <UserPlus className="mr-2 h-5 w-5 text-green-600" />
                    Thêm khách hàng
                  </CardTitle>
                  <CardDescription>Tạo hồ sơ mới</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/dashboard/dealer-staff/customers/create">
                    <Button className="w-full">
                      <UserPlus className="mr-2 h-4 w-4" />
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
                    Cập nhật thông tin
                  </CardTitle>
                  <CardDescription>Chỉnh sửa hồ sơ</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/dashboard/dealer-staff/customers">
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
                    <FileText className="mr-2 h-5 w-5 text-teal-600" />
                    Lịch sử mua hàng
                  </CardTitle>
                  <CardDescription>Theo dõi đơn hàng</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/dashboard/dealer-staff/customers?view=history">
                    <Button variant="outline" className="w-full">
                      <FileText className="mr-2 h-4 w-4" />
                      Xem lịch sử
                    </Button>
                  </Link>
                  <p className="text-xs text-muted-foreground mt-2">✅ View</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Module 3: Lịch lái thử */}
          <div>
            <h2 className="text-2xl font-semibold mb-4 flex items-center">
              <Calendar className="mr-2 h-6 w-6" />
              Module 3: Lịch lái thử
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center text-base">
                    <Calendar className="mr-2 h-5 w-5 text-blue-600" />
                    Quản lý lịch hẹn
                  </CardTitle>
                  <CardDescription>Xem & sắp xếp lịch</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/dashboard/dealer-staff/test-drives">
                    <Button className="w-full">
                      <Calendar className="mr-2 h-4 w-4" />
                      Xem lịch
                    </Button>
                  </Link>
                  <p className="text-xs text-muted-foreground mt-2">✅ View, Create</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center text-base">
                    <CheckCircle2 className="mr-2 h-5 w-5 text-green-600" />
                    Xác nhận lịch
                  </CardTitle>
                  <CardDescription>Phê duyệt yêu cầu</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/dashboard/dealer-staff/test-drives?filter=pending">
                    <Button variant="outline" className="w-full">
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Xác nhận
                    </Button>
                  </Link>
                  <p className="text-xs text-muted-foreground mt-2">✅ Update</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center text-base">
                    <TrendingUp className="mr-2 h-5 w-5 text-purple-600" />
                    Thống kê lái thử
                  </CardTitle>
                  <CardDescription>Báo cáo hiệu quả</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/dashboard/dealer-staff/test-drives/reports">
                    <Button variant="outline" className="w-full">
                      <TrendingUp className="mr-2 h-4 w-4" />
                      Xem báo cáo
                    </Button>
                  </Link>
                  <p className="text-xs text-muted-foreground mt-2">✅ View</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </DealerStaffLayout>
    </ProtectedRoute>
  );
}
