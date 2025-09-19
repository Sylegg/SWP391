"use client";

import { ProtectedRoute } from "@/components/auth-guards";
import { useAuth } from "@/contexts/AuthContext";
import { RoleBadge } from "@/components/role-display";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { User, Mail, Phone, MapPin, Shield, Edit } from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-6 max-w-4xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Thông tin cá nhân</h1>
            <p className="text-muted-foreground mt-2">
              Quản lý thông tin tài khoản và cài đặt của bạn
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Summary */}
            <Card className="lg:col-span-1">
              <CardHeader className="text-center">
                <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <User className="w-10 h-10 text-primary" />
                </div>
                <CardTitle>{user.username}</CardTitle>
                <CardDescription className="flex items-center justify-center">
                  <RoleBadge />
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Thành viên từ</p>
                    <p className="font-medium">Tháng 12, 2024</p>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <Mail className="w-4 h-4 mr-2 text-muted-foreground" />
                      <span>{user.email || "Chưa cập nhật"}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Phone className="w-4 h-4 mr-2 text-muted-foreground" />
                      <span>{user.phone || "Chưa cập nhật"}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <MapPin className="w-4 h-4 mr-2 text-muted-foreground" />
                      <span>{user.address || "Chưa cập nhật"}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Profile Details */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Thông tin cá nhân
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4 mr-2" />
                      Chỉnh sửa
                    </Button>
                  </CardTitle>
                  <CardDescription>
                    Cập nhật thông tin cá nhân của bạn
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">Tên người dùng</Label>
                      <Input id="username" value={user.username} disabled />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" value={user.email || ""} disabled />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Số điện thoại</Label>
                      <Input id="phone" value={user.phone || ""} disabled />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">Vai trò</Label>
                      <div className="p-2">
                        <RoleBadge />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Địa chỉ</Label>
                    <Input id="address" value={user.address || ""} disabled />
                  </div>
                </CardContent>
              </Card>

              {/* Role Permissions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="w-5 h-5 mr-2" />
                    Quyền hạn
                  </CardTitle>
                  <CardDescription>
                    Những gì bạn có thể làm với vai trò hiện tại
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(() => {
                      const rolePermissions = {
                        Customer: [
                          { label: "Xem danh sách xe", permission: "view_vehicles" },
                          { label: "Mua xe", permission: "purchase" },
                          { label: "Xem đơn hàng", permission: "view_orders" }
                        ],
                        Admin: [
                          { label: "Quản lý người dùng", permission: "manage_users" },
                          { label: "Quản lý xe", permission: "manage_vehicles" },
                          { label: "Quản lý đơn hàng", permission: "manage_orders" },
                          { label: "Xem phân tích", permission: "view_analytics" },
                          { label: "Quản lý vai trò", permission: "manage_roles" }
                        ],
                        EVM_Staff: [
                          { label: "Quản lý xe", permission: "manage_vehicles" },
                          { label: "Xem đơn hàng", permission: "view_orders" },
                          { label: "Hỗ trợ khách hàng", permission: "customer_support" }
                        ],
                        Dealer_Manager: [
                          { label: "Quản lý đại lý", permission: "manage_dealer" },
                          { label: "Xem phân tích đại lý", permission: "view_dealer_analytics" },
                          { label: "Quản lý nhân viên đại lý", permission: "manage_dealer_staff" }
                        ],
                        Dealer_Staff: [
                          { label: "Xem xe", permission: "view_vehicles" },
                          { label: "Hỗ trợ khách hàng", permission: "assist_customers" },
                          { label: "Xử lý đơn hàng", permission: "process_orders" }
                        ]
                      };

                      const permissions = rolePermissions[user.role.name as keyof typeof rolePermissions] || [];
                      
                      return permissions.map((perm, index) => (
                        <div key={index} className="flex items-center p-3 border rounded-lg">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                          <span className="text-sm">{perm.label}</span>
                        </div>
                      ));
                    })()}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Thao tác nhanh</CardTitle>
                  <CardDescription>
                    Các tính năng phổ biến
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button asChild variant="outline">
                      <Link href="/" className="h-16 flex-col">
                        <User className="h-6 w-6 mb-2" />
                        Trang chủ
                      </Link>
                    </Button>
                    {(user.role.name === 'Admin' || user.role.name === 'EVM_Staff' || user.role.name === 'Dealer_Manager') && (
                      <Button asChild variant="outline">
                        <Link href="/admin" className="h-16 flex-col">
                          <Shield className="h-6 w-6 mb-2" />
                          Quản trị
                        </Link>
                      </Button>
                    )}
                    <Button variant="outline" className="h-16 flex-col">
                      <Edit className="h-6 w-6 mb-2" />
                      Cài đặt
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}