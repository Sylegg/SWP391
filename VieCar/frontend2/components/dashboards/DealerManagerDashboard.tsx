'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Users, Car, ShoppingCart, TrendingUp, UserPlus, Package, Home } from 'lucide-react';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';

export default function DealerManagerDashboard() {
  const { user } = useAuth();

  const stats = [
    {
      title: 'Nhân viên',
      value: '12',
      description: 'Đang hoạt động',
      icon: Users,
      color: 'text-blue-600',
    },
    {
      title: 'Xe trong kho',
      value: '89',
      description: '+5 xe mới nhập',
      icon: Car,
      color: 'text-green-600',
    },
    {
      title: 'Đơn hàng tháng',
      value: '156',
      description: '+23% so với tháng trước',
      icon: ShoppingCart,
      color: 'text-purple-600',
    },
    {
      title: 'Doanh thu',
      value: '2.8B',
      description: 'Tháng hiện tại',
      icon: TrendingUp,
      color: 'text-orange-600',
    },
  ];

  const teamMembers = [
    { name: 'Nguyễn Văn A', role: 'Nhân viên bán hàng', sales: '15 xe', status: 'active' },
    { name: 'Trần Thị B', role: 'Nhân viên bán hàng', sales: '12 xe', status: 'active' },
    { name: 'Lê Văn C', role: 'Nhân viên kỹ thuật', sales: '8 xe', status: 'active' },
    { name: 'Phạm Thị D', role: 'Nhân viên bán hàng', sales: '20 xe', status: 'active' },
  ];

  const recentOrders = [
    { id: 'DH001', customer: 'Nguyễn Minh Tuấn', vehicle: 'VinFast VF3', amount: '240M', status: 'processing' },
    { id: 'DH002', customer: 'Trần Văn Hải', vehicle: 'Pega Newface', amount: '45M', status: 'completed' },
    { id: 'DH003', customer: 'Lê Thị Mai', vehicle: 'Datbike Quantum', amount: '35M', status: 'pending' },
    { id: 'DH004', customer: 'Phạm Văn Nam', vehicle: 'VinFast VF5', amount: '450M', status: 'processing' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50';
      case 'processing': return 'text-blue-600 bg-blue-50';
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Hoàn thành';
      case 'processing': return 'Đang xử lý';
      case 'pending': return 'Chờ xử lý';
      default: return 'Không xác định';
    }
  };

  return (
    <DashboardLayout currentPage="overview">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard Dealer Manager</h1>
            <p className="text-muted-foreground">
              Chào mừng trở lại, {user?.fullName} - Đại lý {user?.dealerId || 'VinFast Hà Nội'}
            </p>
          </div>
          <div className="flex items-center space-x-2">
          <Link href="/">
            <Button variant="outline">
              <Home className="h-4 w-4 mr-2" />
              Trang chủ
            </Button>
          </Link>
          <button className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
            <UserPlus className="h-4 w-4" />
            <span>Thêm nhân viên</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Team Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Hiệu suất nhóm</CardTitle>
            <CardDescription>
              Doanh số nhân viên tháng này
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {teamMembers.map((member, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">{member.name}</div>
                  <div className="text-sm text-muted-foreground">{member.role}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-green-600">{member.sales}</div>
                  <div className="text-xs text-muted-foreground">Đã bán</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Đơn hàng gần đây</CardTitle>
            <CardDescription>
              Các đơn hàng mới nhất
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentOrders.map((order, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="space-y-1">
                  <div className="font-medium">{order.id}</div>
                  <div className="text-sm text-muted-foreground">{order.customer}</div>
                  <div className="text-xs text-muted-foreground">{order.vehicle}</div>
                </div>
                <div className="text-right space-y-1">
                  <div className="font-bold">{order.amount}</div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                    {getStatusText(order.status)}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Thao tác nhanh</CardTitle>
          <CardDescription>Các chức năng quản lý thường dùng</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <button className="p-4 text-left rounded-lg border hover:bg-accent transition-colors">
              <UserPlus className="h-6 w-6 mb-2 text-blue-600" />
              <div className="font-medium">Quản lý nhân viên</div>
              <div className="text-sm text-muted-foreground">Thêm, sửa nhân viên</div>
            </button>
            <button className="p-4 text-left rounded-lg border hover:bg-accent transition-colors">
              <Package className="h-6 w-6 mb-2 text-green-600" />
              <div className="font-medium">Quản lý kho</div>
              <div className="text-sm text-muted-foreground">Nhập xuất xe</div>
            </button>
            <button className="p-4 text-left rounded-lg border hover:bg-accent transition-colors">
              <ShoppingCart className="h-6 w-6 mb-2 text-purple-600" />
              <div className="font-medium">Đơn hàng</div>
              <div className="text-sm text-muted-foreground">Xem tất cả đơn</div>
            </button>
            <button className="p-4 text-left rounded-lg border hover:bg-accent transition-colors">
              <TrendingUp className="h-6 w-6 mb-2 text-orange-600" />
              <div className="font-medium">Báo cáo</div>
              <div className="text-sm text-muted-foreground">Thống kê doanh thu</div>
            </button>
          </div>
        </CardContent>
      </Card>
      </div>
    </DashboardLayout>
  );
}