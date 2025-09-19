'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';

export default function AccountManagement() {
  const { user, hasPermission, switchRole } = useAuth();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    phone: '',
    role: 'CUSTOMER' as UserRole,
    dealerId: '',
  });

  // Demo data for users list
  const mockUsers = [
    { id: '1', email: 'admin@viecar.com', fullName: 'Admin User', role: 'ADMIN', isActive: true, dealerId: null },
    { id: '2', email: 'evm@viecar.com', fullName: 'EVM Staff', role: 'EVM_STAFF', isActive: true, dealerId: null },
    { id: '3', email: 'dealer.manager@viecar.com', fullName: 'Dealer Manager', role: 'DEALER_MANAGER', isActive: true, dealerId: 'dealer1' },
    { id: '4', email: 'dealer.staff@viecar.com', fullName: 'Dealer Staff', role: 'DEALER_STAFF', isActive: true, dealerId: 'dealer1' },
    { id: '5', email: 'customer@viecar.com', fullName: 'Customer User', role: 'CUSTOMER', isActive: true, dealerId: null },
  ];

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle user creation
    console.log('Creating user:', formData);
    setShowCreateForm(false);
    setFormData({
      email: '',
      fullName: '',
      phone: '',
      role: 'CUSTOMER',
      dealerId: '',
    });
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'ADMIN': return 'bg-red-100 text-red-800';
      case 'EVM_STAFF': return 'bg-blue-100 text-blue-800';
      case 'DEALER_MANAGER': return 'bg-green-100 text-green-800';
      case 'DEALER_STAFF': return 'bg-yellow-100 text-yellow-800';
      case 'CUSTOMER': return 'bg-purple-100 text-purple-800';
      case 'GUEST': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleDisplayName = (role: UserRole) => {
    switch (role) {
      case 'ADMIN': return 'Admin';
      case 'EVM_STAFF': return 'EVM Staff';
      case 'DEALER_MANAGER': return 'Dealer Manager';
      case 'DEALER_STAFF': return 'Dealer Staff';
      case 'CUSTOMER': return 'Customer';
      case 'GUEST': return 'Guest';
      default: return role;
    }
  };

  if (!hasPermission('users', 'read')) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">
              Bạn không có quyền truy cập vào trang này.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quản lý tài khoản</h1>
          <p className="text-muted-foreground">
            Quản lý người dùng và phân quyền trong hệ thống
          </p>
        </div>
        {hasPermission('users', 'create') && (
          <Button onClick={() => setShowCreateForm(true)}>
            Tạo tài khoản mới
          </Button>
        )}
      </div>

      {/* Role Switching for Demo */}
      <Card>
        <CardHeader>
          <CardTitle>Demo Role Switching</CardTitle>
          <CardDescription>
            Chuyển đổi role để test các dashboard khác nhau (chỉ dành cho demo)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {(['ADMIN', 'EVM_STAFF', 'DEALER_MANAGER', 'DEALER_STAFF', 'CUSTOMER'] as UserRole[]).map((role) => (
              <Button
                key={role}
                variant={user?.role === role ? 'default' : 'outline'}
                size="sm"
                onClick={() => switchRole(role)}
              >
                {getRoleDisplayName(role)}
              </Button>
            ))}
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Role hiện tại: <Badge className={getRoleBadgeColor(user?.role || 'GUEST')}>
              {getRoleDisplayName(user?.role || 'GUEST')}
            </Badge>
          </p>
        </CardContent>
      </Card>

      {/* Create User Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Tạo tài khoản mới</CardTitle>
            <CardDescription>
              Điền thông tin để tạo tài khoản người dùng mới
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="user@example.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fullName">Họ và tên</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Nguyễn Văn A"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Số điện thoại</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="0901234567"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Vai trò</Label>
                  <Select value={formData.role} onValueChange={(value: UserRole) => setFormData({ ...formData, role: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn vai trò" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                      <SelectItem value="EVM_STAFF">EVM Staff</SelectItem>
                      <SelectItem value="DEALER_MANAGER">Dealer Manager</SelectItem>
                      <SelectItem value="DEALER_STAFF">Dealer Staff</SelectItem>
                      <SelectItem value="CUSTOMER">Customer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {(formData.role === 'DEALER_MANAGER' || formData.role === 'DEALER_STAFF') && (
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="dealerId">Mã đại lý</Label>
                    <Input
                      id="dealerId"
                      value={formData.dealerId}
                      onChange={(e) => setFormData({ ...formData, dealerId: e.target.value })}
                      placeholder="dealer1"
                      required
                    />
                  </div>
                )}
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                  Hủy
                </Button>
                <Button type="submit">Tạo tài khoản</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách người dùng</CardTitle>
          <CardDescription>
            Tất cả người dùng trong hệ thống
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <div className="font-medium">{user.fullName}</div>
                  <div className="text-sm text-muted-foreground">{user.email}</div>
                  {user.dealerId && (
                    <div className="text-xs text-muted-foreground">Đại lý: {user.dealerId}</div>
                  )}
                </div>
                <div className="flex items-center space-x-4">
                  <Badge className={getRoleBadgeColor(user.role as UserRole)}>
                    {getRoleDisplayName(user.role as UserRole)}
                  </Badge>
                  <div className="flex items-center space-x-2">
                    <Switch checked={user.isActive} />
                    <span className="text-sm text-muted-foreground">
                      {user.isActive ? 'Hoạt động' : 'Bị khóa'}
                    </span>
                  </div>
                  {hasPermission('users', 'update') && (
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">Sửa</Button>
                      {hasPermission('users', 'delete') && (
                        <Button size="sm" variant="outline">Xóa</Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}