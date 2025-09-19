'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Car, Building2, Package, TrendingUp, Plus, FileText, Home } from 'lucide-react';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';

export default function EVMStaffDashboard() {
  const { user } = useAuth();

  const stats = [
    {
      title: 'Tổng xe EVM',
      value: '2,847',
      description: '+180 xe mới tháng này',
      icon: Car,
      color: 'text-blue-600',
    },
    {
      title: 'Đại lý đang hoạt động',
      value: '56',
      description: 'Trên 5 tỉnh thành',
      icon: Building2,
      color: 'text-green-600',
    },
    {
      title: 'Đơn hàng chờ xử lý',
      value: '23',
      description: 'Cần xử lý trong hôm nay',
      icon: Package,
      color: 'text-orange-600',
    },
    {
      title: 'Doanh thu tháng',
      value: '45.2B',
      description: '+12% so với tháng trước',
      icon: TrendingUp,
      color: 'text-purple-600',
    },
  ];

  const pendingTasks = [
    { task: 'Phê duyệt xe VinFast VF3 mới từ đại lý Hà Nội', priority: 'high', time: '2 phút trước' },
    { task: 'Cập nhật giá xe Pega Newface 2024', priority: 'medium', time: '15 phút trước' },
    { task: 'Kiểm tra tồn kho xe Datbike tại đại lý TP.HCM', priority: 'medium', time: '1 giờ trước' },
    { task: 'Phê duyệt yêu cầu giảm giá từ đại lý Đà Nẵng', priority: 'high', time: '2 giờ trước' },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-green-600 bg-green-50';
    }
  };

  return (
    <DashboardLayout currentPage="overview">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard EVM Staff</h1>
            <p className="text-muted-foreground">
              Chào mừng trở lại, {user?.fullName}
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
            <Plus className="h-4 w-4" />
            <span>Thêm xe mới</span>
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Pending Tasks */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Công việc cần xử lý</CardTitle>
            <CardDescription>
              Các yêu cầu đang chờ phê duyệt
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingTasks.map((task, index) => (
              <div key={index} className="flex items-start justify-between space-x-4 p-3 border rounded-lg">
                <div className="space-y-1 flex-1">
                  <p className="text-sm font-medium leading-none">{task.task}</p>
                  <p className="text-xs text-muted-foreground">{task.time}</p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(task.priority)}`}>
                  {task.priority === 'high' ? 'Cao' : task.priority === 'medium' ? 'Trung bình' : 'Thấp'}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Vehicle Management */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Quản lý xe</CardTitle>
            <CardDescription>
              Các thao tác quản lý xe
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <button className="w-full p-3 text-left rounded-lg border hover:bg-accent transition-colors">
              <div className="font-medium">Thêm xe mới</div>
              <div className="text-sm text-muted-foreground">Thêm xe vào hệ thống</div>
            </button>
            <button className="w-full p-3 text-left rounded-lg border hover:bg-accent transition-colors">
              <div className="font-medium">Cập nhật giá xe</div>
              <div className="text-sm text-muted-foreground">Điều chỉnh giá bán</div>
            </button>
            <button className="w-full p-3 text-left rounded-lg border hover:bg-accent transition-colors">
              <div className="font-medium">Quản lý tồn kho</div>
              <div className="text-sm text-muted-foreground">Kiểm tra số lượng xe</div>
            </button>
            <button className="w-full p-3 text-left rounded-lg border hover:bg-accent transition-colors">
              <div className="font-medium">Báo cáo bán hàng</div>
              <div className="text-sm text-muted-foreground">Xem thống kê doanh số</div>
            </button>
          </CardContent>
        </Card>
      </div>
      </div>
    </DashboardLayout>
  );
}