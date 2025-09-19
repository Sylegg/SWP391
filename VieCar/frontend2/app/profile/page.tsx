'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { User, Mail, Phone, Calendar, MapPin, Edit2, Save, X } from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, isAuthenticated } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
  });

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <p>Vui lòng đăng nhập để xem thông tin cá nhân.</p>
            <Link href="/login">
              <Button className="mt-4">Đăng nhập</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSave = () => {
    // Here you would typically update user data via API
    console.log('Saving user data:', editData);
    setIsEditing(false);
    // In a real app, you would update the user context here
  };

  const handleCancel = () => {
    setEditData({
      fullName: user.fullName,
      phone: user.phone || '',
    });
    setIsEditing(false);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-red-100 text-red-800';
      case 'EVM_STAFF': return 'bg-blue-100 text-blue-800';
      case 'DEALER_MANAGER': return 'bg-green-100 text-green-800';
      case 'DEALER_STAFF': return 'bg-yellow-100 text-yellow-800';
      case 'CUSTOMER': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'Quản trị viên';
      case 'EVM_STAFF': return 'Nhân viên EVM';
      case 'DEALER_MANAGER': return 'Quản lý đại lý';
      case 'DEALER_STAFF': return 'Nhân viên đại lý';
      case 'CUSTOMER': return 'Khách hàng';
      default: return role;
    }
  };

  const getDashboardPath = () => {
    switch (user.role) {
      case 'ADMIN': return '/admin/dashboard';
      case 'EVM_STAFF': return '/evm/dashboard';
      case 'DEALER_MANAGER': return '/dealer/manager/dashboard';
      case 'DEALER_STAFF': return '/dealer/staff/dashboard';
      case 'CUSTOMER': return '/customer/dashboard';
      default: return '/';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Thông tin cá nhân</h1>
            <p className="text-muted-foreground">Quản lý thông tin tài khoản của bạn</p>
          </div>
          <div className="flex items-center space-x-2">
            <Link href="/">
              <Button variant="outline">← Trang chủ</Button>
            </Link>
            <Link href={getDashboardPath()}>
              <Button>Dashboard</Button>
            </Link>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Profile Card */}
          <Card className="md:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="h-5 w-5" />
                    <span>Thông tin cá nhân</span>
                  </CardTitle>
                  <CardDescription>
                    Cập nhật thông tin cá nhân của bạn
                  </CardDescription>
                </div>
                {!isEditing ? (
                  <Button size="sm" onClick={() => setIsEditing(true)}>
                    <Edit2 className="h-4 w-4 mr-2" />
                    Chỉnh sửa
                  </Button>
                ) : (
                  <div className="flex space-x-2">
                    <Button size="sm" onClick={handleSave}>
                      <Save className="h-4 w-4 mr-2" />
                      Lưu
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleCancel}>
                      <X className="h-4 w-4 mr-2" />
                      Hủy
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Họ và tên</Label>
                  {isEditing ? (
                    <Input
                      id="fullName"
                      value={editData.fullName}
                      onChange={(e) => setEditData({ ...editData, fullName: e.target.value })}
                    />
                  ) : (
                    <div className="p-2 bg-muted rounded-md">
                      {user.fullName}
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="p-2 bg-muted rounded-md text-muted-foreground">
                    {user.email}
                    <span className="text-xs block">Không thể thay đổi</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Số điện thoại</Label>
                  {isEditing ? (
                    <Input
                      id="phone"
                      value={editData.phone}
                      onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                      placeholder="Nhập số điện thoại"
                    />
                  ) : (
                    <div className="p-2 bg-muted rounded-md">
                      {user.phone || 'Chưa cập nhật'}
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label>Vai trò</Label>
                  <div className="p-2">
                    <Badge className={getRoleBadgeColor(user.role)}>
                      {getRoleDisplayName(user.role)}
                    </Badge>
                  </div>
                </div>
              </div>

              {user.dealerId && (
                <div className="space-y-2">
                  <Label>Đại lý</Label>
                  <div className="p-2 bg-muted rounded-md flex items-center space-x-2">
                    <MapPin className="h-4 w-4" />
                    <span>{user.dealerId}</span>
                  </div>
                </div>
              )}

              <Separator />

              <div className="grid gap-4 md:grid-cols-2 text-sm text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>Tạo: {new Date(user.createdAt).toLocaleDateString('vi-VN')}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>Cập nhật: {new Date(user.updatedAt).toLocaleDateString('vi-VN')}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Thao tác nhanh</CardTitle>
              <CardDescription>
                Các chức năng thường dùng
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link href={getDashboardPath()}>
                <Button className="w-full justify-start">
                  <User className="h-4 w-4 mr-2" />
                  {getRoleDisplayName(user.role)} Dashboard
                </Button>
              </Link>
              
              {user.role === 'CUSTOMER' && (
                <>
                  <Link href="/customer/orders">
                    <Button variant="outline" className="w-full justify-start">
                      <Mail className="h-4 w-4 mr-2" />
                      Đơn hàng của tôi
                    </Button>
                  </Link>
                  <Link href="/customer/vehicles">
                    <Button variant="outline" className="w-full justify-start">
                      <Phone className="h-4 w-4 mr-2" />
                      Xe của tôi
                    </Button>
                  </Link>
                </>
              )}
              
              {user.role === 'ADMIN' && (
                <Link href="/admin/users">
                  <Button variant="outline" className="w-full justify-start">
                    <User className="h-4 w-4 mr-2" />
                    Quản lý người dùng
                  </Button>
                </Link>
              )}
              
              <Button variant="outline" className="w-full justify-start">
                <Mail className="h-4 w-4 mr-2" />
                Thay đổi mật khẩu
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}