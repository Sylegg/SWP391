'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Users, Building2, Car, ShoppingCart, TrendingUp, AlertTriangle, Home } from 'lucide-react';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';

export default function AdminDashboard() {
  const { user } = useAuth();

  const stats = [
    {
      title: 'Tổng số người dùng',
      value: '1,234',
      description: '+20.1% từ tháng trước',
      icon: Users,
      color: 'text-blue-600',
    },
    {
      title: 'Đại lý',
      value: '56',
      description: '+2 đại lý mới',
      icon: Building2,
      color: 'text-green-600',
    },
    {
      title: 'Xe trong hệ thống',
      value: '2,847',
      description: '+180 xe mới',
      icon: Car,
      color: 'text-purple-600',
    },
    {
      title: 'Đơn hàng',
      value: '892',
      description: '+45 đơn hôm nay',
      icon: ShoppingCart,
      color: 'text-orange-600',
    },
  ];

  const recentActivities = [
    { action: 'Đại lý VinFast Hà Nội được thêm vào hệ thống', time: '2 phút trước', type: 'success' },
    { action: 'Cảnh báo: Tồn kho thấp tại đại lý Đà Nẵng', time: '15 phút trước', type: 'warning' },
    { action: 'Nhân viên EVM mới được tạo tài khoản', time: '1 giờ trước', type: 'info' },
    { action: 'Báo cáo doanh thu tháng được tạo', time: '2 giờ trước', type: 'success' },
  ];

  return (
    <DashboardLayout currentPage="overview">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard Admin</h1>
            <p className="text-muted-foreground">
              Chào mừng trở lại, {user?.fullName}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="outline">
                <Home className="h-4 w-4 mr-2" />
                Trang chủ
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-green-600">Hệ thống hoạt động tốt</span>
            </div>
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Recent Activities */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Hoạt động gần đây</CardTitle>
            <CardDescription>
              Các hoạt động mới nhất trong hệ thống
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-start space-x-4">
                <div className={`mt-1 h-2 w-2 rounded-full ${
                  activity.type === 'success' ? 'bg-green-500' :
                  activity.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                }`} />
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">{activity.action}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Thao tác nhanh</CardTitle>
            <CardDescription>
              Các chức năng quản trị thường dùng
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <button className="w-full p-3 text-left rounded-lg border hover:bg-accent transition-colors">
              <div className="font-medium">Quản lý người dùng</div>
              <div className="text-sm text-muted-foreground">Tạo, sửa, xóa tài khoản</div>
            </button>
            <button className="w-full p-3 text-left rounded-lg border hover:bg-accent transition-colors">
              <div className="font-medium">Quản lý đại lý</div>
              <div className="text-sm text-muted-foreground">Thêm đại lý mới</div>
            </button>
            <button className="w-full p-3 text-left rounded-lg border hover:bg-accent transition-colors">
              <div className="font-medium">Báo cáo hệ thống</div>
              <div className="text-sm text-muted-foreground">Xem thống kê tổng quan</div>
            </button>
          </CardContent>
        </Card>
      </div>
      </div>
    </DashboardLayout>
  );
}