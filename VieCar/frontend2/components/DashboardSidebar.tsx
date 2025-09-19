'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Home, 
  BarChart3, 
  Users, 
  Settings, 
  Car, 
  Building2, 
  ShoppingCart, 
  Package, 
  FileText, 
  UserPlus,
  Phone,
  MapPin,
  LogOut
} from 'lucide-react';
import Link from 'next/link';

interface SidebarProps {
  currentPage?: string;
}

export default function DashboardSidebar({ currentPage }: SidebarProps) {
  const { user, logout } = useAuth();

  if (!user) return null;

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

  // Menu items based on role
  const getMenuItems = () => {
    const baseItems = [
      { href: '/', icon: Home, label: 'Trang chủ', key: 'home' }
    ];

    switch (user.role) {
      case 'ADMIN':
        return [
          ...baseItems,
          { href: '/admin/dashboard', icon: BarChart3, label: 'Dashboard', key: 'dashboard' },
          { href: '/admin/users', icon: Users, label: 'Quản lý người dùng', key: 'users' },
          { href: '/admin/dealers', icon: Building2, label: 'Quản lý đại lý', key: 'dealers' },
          { href: '/admin/vehicles', icon: Car, label: 'Quản lý xe', key: 'vehicles' },
          { href: '/admin/orders', icon: ShoppingCart, label: 'Quản lý đơn hàng', key: 'orders' },
          { href: '/admin/reports', icon: FileText, label: 'Báo cáo', key: 'reports' },
          { href: '/admin/settings', icon: Settings, label: 'Cài đặt hệ thống', key: 'settings' },
        ];

      case 'EVM_STAFF':
        return [
          ...baseItems,
          { href: '/evm/dashboard', icon: BarChart3, label: 'Dashboard', key: 'dashboard' },
          { href: '/evm/vehicles', icon: Car, label: 'Quản lý xe', key: 'vehicles' },
          { href: '/evm/dealers', icon: Building2, label: 'Quản lý đại lý', key: 'dealers' },
          { href: '/evm/inventory', icon: Package, label: 'Quản lý tồn kho', key: 'inventory' },
          { href: '/evm/orders', icon: ShoppingCart, label: 'Đơn hàng', key: 'orders' },
          { href: '/evm/reports', icon: FileText, label: 'Báo cáo', key: 'reports' },
        ];

      case 'DEALER_MANAGER':
        return [
          ...baseItems,
          { href: '/dealer/manager/dashboard', icon: BarChart3, label: 'Dashboard', key: 'dashboard' },
          { href: '/dealer/manager/staff', icon: Users, label: 'Quản lý nhân viên', key: 'staff' },
          { href: '/dealer/manager/inventory', icon: Package, label: 'Quản lý kho', key: 'inventory' },
          { href: '/dealer/manager/orders', icon: ShoppingCart, label: 'Đơn hàng', key: 'orders' },
          { href: '/dealer/manager/customers', icon: UserPlus, label: 'Khách hàng', key: 'customers' },
          { href: '/dealer/manager/reports', icon: FileText, label: 'Báo cáo', key: 'reports' },
        ];

      case 'DEALER_STAFF':
        return [
          ...baseItems,
          { href: '/dealer/staff/dashboard', icon: BarChart3, label: 'Dashboard', key: 'dashboard' },
          { href: '/dealer/staff/customers', icon: Users, label: 'Khách hàng', key: 'customers' },
          { href: '/dealer/staff/orders', icon: ShoppingCart, label: 'Đơn hàng', key: 'orders' },
          { href: '/dealer/staff/inventory', icon: Car, label: 'Xe trong kho', key: 'inventory' },
          { href: '/dealer/staff/sales', icon: FileText, label: 'Doanh số', key: 'sales' },
        ];

      case 'CUSTOMER':
        return [
          ...baseItems,
          { href: '/customer/dashboard', icon: BarChart3, label: 'Dashboard', key: 'dashboard' },
          { href: '/customer/vehicles', icon: Car, label: 'Xe của tôi', key: 'vehicles' },
          { href: '/customer/orders', icon: ShoppingCart, label: 'Đơn hàng', key: 'orders' },
          { href: '/customer/wishlist', icon: Package, label: 'Yêu thích', key: 'wishlist' },
          { href: '/customer/support', icon: Phone, label: 'Hỗ trợ', key: 'support' },
        ];

      default:
        return baseItems;
    }
  };

  const menuItems = getMenuItems();

  return (
    <div className="w-80 bg-white border-l border-gray-200 h-full overflow-y-auto">
      {/* User Profile Section */}
      <Card className="m-4 border-0 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
              <Users className="h-5 w-5 text-gray-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-sm">{user.fullName}</h3>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <Badge className={`mt-2 w-fit ${getRoleBadgeColor(user.role)}`}>
            {getRoleDisplayName(user.role)}
          </Badge>
          {user.dealerId && (
            <div className="flex items-center mt-2 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3 mr-1" />
              <span>Đại lý: {user.dealerId}</span>
            </div>
          )}
        </CardHeader>
      </Card>

      {/* Navigation Menu */}
      <div className="px-4">
        <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
          Menu
        </h4>
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const isActive = currentPage === item.key;
            return (
              <Link key={item.key} href={item.href}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className={`w-full justify-start h-9 ${
                    isActive 
                      ? "bg-primary text-primary-foreground" 
                      : "hover:bg-gray-100"
                  }`}
                >
                  <item.icon className="h-4 w-4 mr-3" />
                  <span className="text-sm">{item.label}</span>
                </Button>
              </Link>
            );
          })}
        </nav>
      </div>

      <Separator className="my-4 mx-4" />

      {/* Quick Actions */}
      <div className="px-4 pb-4">
        <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
          Thao tác nhanh
        </h4>
        <div className="space-y-2">
          {user.role === 'ADMIN' && (
            <Button variant="outline" size="sm" className="w-full justify-start">
              <Settings className="h-4 w-4 mr-2" />
              Cài đặt
            </Button>
          )}
          <Button variant="outline" size="sm" className="w-full justify-start">
            <Phone className="h-4 w-4 mr-2" />
            Hỗ trợ
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-start text-red-600 hover:text-red-600 hover:bg-red-50"
            onClick={logout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Đăng xuất
          </Button>
        </div>
      </div>
    </div>
  );
}