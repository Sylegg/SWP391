"use client";

import { ProtectedRoute } from "@/components/auth-guards";
import { useAuth } from "@/contexts/AuthContext";
import { RoleBadge } from "@/components/role-display";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { User, Mail, Phone, MapPin, Shield, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deleteUser as deleteUserApi } from "@/lib/user";
import { useState } from "react";

export default function ProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, logout } = useAuth();
  const [deleting, setDeleting] = useState(false);

  // Debug: Log user data
  console.log("Profile page - User data:", user);

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Đang tải...</h1>
          <p className="text-muted-foreground">Hoặc bạn chưa đăng nhập</p>
          <Link href="/login" className="mt-4 inline-block">
            <Button>Đăng nhập</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleDelete = async () => {
    if (!user?.id) {
      toast({
        title: "Không thể xóa tài khoản",
        description: "Thiếu ID người dùng. Vui lòng đăng nhập lại và thử lại.",
        variant: "destructive",
      });
      return;
    }
    try {
      setDeleting(true);
      await deleteUserApi(Number(user.id));
      toast({ title: "Đã xóa tài khoản", description: "Tài khoản của bạn đã bị xóa vĩnh viễn." });
      // Clear session and redirect
      logout();
      router.push("/");
    } catch (e: any) {
      const msg = e?.response?.data || e?.message || "Đã xảy ra lỗi không xác định.";
      toast({ title: "Xóa tài khoản thất bại", description: String(msg), variant: "destructive" });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-6 max-w-4xl">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Thông tin cá nhân</h1>
              <p className="text-muted-foreground mt-2">
                Quản lý thông tin tài khoản và cài đặt của bạn
              </p>
            </div>
            <Link href="/dashboard">
              <Button variant="outline">
                ← Về Dashboard
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Summary */}
            <Card className="lg:col-span-1">
              <CardHeader className="text-center">
                <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <User className="w-10 h-10 text-primary" />
                </div>
                <CardTitle>{user.username || "Người dùng"}</CardTitle>
                <CardDescription className="flex items-center justify-center">
                  <RoleBadge role={user.role?.name} />
                </CardDescription>
                {/* Debug info */}
                <div className="mt-2 p-2 bg-muted rounded text-left text-xs">
                  <strong>Debug:</strong><br/>
                  ID: {user.id || 'N/A'}<br/>
                  Role: {user.role?.name}<br/>
                  Email: {user.email || 'N/A'}
                </div>
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
                      <Input id="username" value={user.username || ""} disabled className="bg-muted" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" value={user.email || "Chưa cập nhật"} disabled className="bg-muted" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Số điện thoại</Label>
                      <Input id="phone" value={user.phone || "Chưa cập nhật"} disabled className="bg-muted" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">Vai trò</Label>
                      <div className="p-3 border rounded-md bg-muted">
                        <RoleBadge />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Địa chỉ</Label>
                    <Input id="address" value={user.address || "Chưa cập nhật"} disabled className="bg-muted" />
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
                        <Link href="/dashboard/admin" className="h-16 flex-col">
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

              {/* Danger Zone - Delete Account */}
              <Card className="border-destructive/30">
                <CardHeader>
                  <CardTitle className="text-destructive">Xóa tài khoản</CardTitle>
                  <CardDescription>
                    Hành động này không thể hoàn tác. Tất cả dữ liệu liên quan đến tài khoản của bạn sẽ bị xóa.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="gap-2">
                        <Trash2 className="h-4 w-4" /> Xóa tài khoản
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Bạn có chắc chắn muốn xóa tài khoản?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Hành động này không thể hoàn tác. Tài khoản và dữ liệu liên quan của bạn sẽ bị xóa vĩnh viễn.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleting}>Hủy</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} disabled={deleting} className="bg-destructive text-white hover:bg-destructive/90">
                          {deleting ? "Đang xóa..." : "Xác nhận xóa"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}