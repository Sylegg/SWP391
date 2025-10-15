"use client";

import { ProtectedRoute, RoleBasedComponent, PermissionGate } from "@/components/auth-guards";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Car, ShoppingCart, Settings, BarChart, Shield } from "lucide-react";
import Link from "next/link";

export default function AdminPage() {
  const { user } = useAuth();

  return (
  <ProtectedRoute allowedRoles={['Admin', 'EVM Staff', 'Dealer Manager']}>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Bảng điều khiển quản trị</h1>
            <p className="text-muted-foreground mt-2">
              Chào mừng, {user?.username}! Bạn đang đăng nhập với quyền {user?.role?.name}.
            </p>
          </div>

          {/* Admin Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <PermissionGate permission="manage_users">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tổng người dùng</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">1,234</div>
                  <p className="text-xs text-muted-foreground">+12% so với tháng trước</p>
                </CardContent>
              </Card>
            </PermissionGate>

            <PermissionGate permission="manage_vehicles">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Xe điện</CardTitle>
                  <Car className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">89</div>
                  <p className="text-xs text-muted-foreground">+5 xe mới tuần này</p>
                </CardContent>
              </Card>
            </PermissionGate>

            <PermissionGate permission="manage_orders">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Đơn hàng</CardTitle>
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">567</div>
                  <p className="text-xs text-muted-foreground">+23 đơn hôm nay</p>
                </CardContent>
              </Card>
            </PermissionGate>

            <PermissionGate permission="view_analytics">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Doanh thu</CardTitle>
                  <BarChart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₫2.4B</div>
                  <p className="text-xs text-muted-foreground">+18% so với tháng trước</p>
                </CardContent>
              </Card>
            </PermissionGate>
          </div>

          {/* Role-specific sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Admin-only section */}
            <RoleBasedComponent allowedRoles={['Admin']}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="mr-2 h-5 w-5" />
                    Quản lý hệ thống
                  </CardTitle>
                  <CardDescription>
                    Chức năng dành riêng cho quản trị viên
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Button variant="outline" className="h-20 flex-col">
                      <Users className="h-6 w-6 mb-2" />
                      Quản lý người dùng
                    </Button>
                    <Button variant="outline" className="h-20 flex-col">
                      <Settings className="h-6 w-6 mb-2" />
                      Cài đặt hệ thống
                    </Button>
                  </div>
                  <Badge variant="destructive" className="w-full justify-center">
                    Quyền Admin
                  </Badge>
                </CardContent>
              </Card>
            </RoleBasedComponent>

            {/* Staff sections */}
            <RoleBasedComponent allowedRoles={['EVM Staff', 'Admin']}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Car className="mr-2 h-5 w-5" />
                    Quản lý xe điện
                  </CardTitle>
                  <CardDescription>
                    Quản lý danh mục và thông tin xe điện
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Button variant="outline" className="h-20 flex-col">
                      <Car className="h-6 w-6 mb-2" />
                      Thêm xe mới
                    </Button>
                    <Button variant="outline" className="h-20 flex-col">
                      <BarChart className="h-6 w-6 mb-2" />
                      Thống kê
                    </Button>
                  </div>
                  <Badge variant="secondary" className="w-full justify-center">
                    Quyền EVM Staff
                  </Badge>
                </CardContent>
              </Card>
            </RoleBasedComponent>

            {/* Dealer Manager section */}
            <RoleBasedComponent allowedRoles={['Dealer Manager', 'Admin']}>
              <Card>
                <CardHeader>
                  <CardTitle>Quản lý đại lý</CardTitle>
                  <CardDescription>
                    Quản lý hoạt động và nhân viên đại lý
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Button variant="outline" className="h-20 flex-col">
                      <Users className="h-6 w-6 mb-2" />
                      Nhân viên
                    </Button>
                    <Button variant="outline" className="h-20 flex-col">
                      <BarChart className="h-6 w-6 mb-2" />
                      Doanh số
                    </Button>
                  </div>
                  <Badge variant="outline" className="w-full justify-center">
                    Quyền Dealer Manager
                  </Badge>
                </CardContent>
              </Card>
            </RoleBasedComponent>

            {/* Quick actions */}
            <Card>
              <CardHeader>
                <CardTitle>Thao tác nhanh</CardTitle>
                <CardDescription>
                  Các chức năng thường dùng
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button asChild variant="ghost" className="w-full justify-start">
                  <Link href="/admin/vehicles">
                    <Car className="mr-2 h-4 w-4" />
                    Danh sách xe điện
                  </Link>
                </Button>
                <Button asChild variant="ghost" className="w-full justify-start">
                  <Link href="/admin/orders">
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Quản lý đơn hàng
                  </Link>
                </Button>
                <PermissionGate permission="manage_users">
                  <Button asChild variant="ghost" className="w-full justify-start">
                    <Link href="/admin/users">
                      <Users className="mr-2 h-4 w-4" />
                      Quản lý người dùng
                    </Link>
                  </Button>
                </PermissionGate>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}