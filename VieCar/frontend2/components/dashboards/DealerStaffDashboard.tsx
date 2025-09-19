'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Car, Users, ShoppingCart, Clock, CheckCircle, AlertCircle, Home } from 'lucide-react';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';

export default function DealerStaffDashboard() {
  const { user } = useAuth();

  const stats = [
    {
      title: 'Xe đã bán',
      value: '15',
      description: 'Tháng này',
      icon: Car,
      color: 'text-green-600',
    },
    {
      title: 'Khách hàng',
      value: '32',
      description: 'Đang theo dõi',
      icon: Users,
      color: 'text-blue-600',
    },
    {
      title: 'Đơn hàng',
      value: '8',
      description: 'Đang xử lý',
      icon: ShoppingCart,
      color: 'text-purple-600',
    },
    {
      title: 'Hoa hồng',
      value: '45M',
      description: 'Tháng này',
      icon: CheckCircle,
      color: 'text-orange-600',
    },
  ];

  const myCustomers = [
    { name: 'Nguyễn Minh Tuấn', phone: '0901234567', interested: 'VinFast VF3', status: 'hot', lastContact: '2 giờ trước' },
    { name: 'Trần Văn Hải', phone: '0901234568', interested: 'Pega Newface', status: 'warm', lastContact: '1 ngày trước' },
    { name: 'Lê Thị Mai', phone: '0901234569', interested: 'Datbike Quantum', status: 'cold', lastContact: '3 ngày trước' },
    { name: 'Phạm Văn Nam', phone: '0901234570', interested: 'VinFast VF5', status: 'hot', lastContact: '4 giờ trước' },
  ];

  const myTasks = [
    { task: 'Gọi điện cho khách hàng Nguyễn Minh Tuấn', priority: 'high', deadline: '15:00 hôm nay', type: 'call' },
    { task: 'Chuẩn bị hồ sơ cho đơn hàng DH001', priority: 'high', deadline: '17:00 hôm nay', type: 'document' },
    { task: 'Hẹn lịch test drive cho khách Trần Văn Hải', priority: 'medium', deadline: 'Mai', type: 'meeting' },
    { task: 'Báo cáo doanh số tuần', priority: 'medium', deadline: 'Thứ 6', type: 'report' },
  ];

  const getCustomerStatusColor = (status: string) => {
    switch (status) {
      case 'hot': return 'text-red-600 bg-red-50';
      case 'warm': return 'text-yellow-600 bg-yellow-50';
      case 'cold': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getCustomerStatusText = (status: string) => {
    switch (status) {
      case 'hot': return 'Nóng';
      case 'warm': return 'Ấm';
      case 'cold': return 'Lạnh';
      default: return 'Chưa xác định';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <DashboardLayout currentPage="overview">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard Dealer Staff</h1>
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
            <Users className="h-4 w-4" />
            <span>Thêm khách hàng</span>
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
        {/* My Customers */}
        <Card>
          <CardHeader>
            <CardTitle>Khách hàng của tôi</CardTitle>
            <CardDescription>
              Danh sách khách hàng đang theo dõi
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {myCustomers.map((customer, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="space-y-1">
                  <div className="font-medium">{customer.name}</div>
                  <div className="text-sm text-muted-foreground">{customer.phone}</div>
                  <div className="text-xs text-muted-foreground">Quan tâm: {customer.interested}</div>
                  <div className="text-xs text-muted-foreground">Liên hệ: {customer.lastContact}</div>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCustomerStatusColor(customer.status)}`}>
                  {getCustomerStatusText(customer.status)}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* My Tasks */}
        <Card>
          <CardHeader>
            <CardTitle>Công việc hôm nay</CardTitle>
            <CardDescription>
              Các nhiệm vụ cần hoàn thành
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {myTasks.map((task, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg">
                <div className="mt-1">
                  {task.type === 'call' && <Clock className="h-4 w-4 text-blue-600" />}
                  {task.type === 'document' && <AlertCircle className="h-4 w-4 text-orange-600" />}
                  {task.type === 'meeting' && <Users className="h-4 w-4 text-green-600" />}
                  {task.type === 'report' && <CheckCircle className="h-4 w-4 text-purple-600" />}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="font-medium">{task.task}</div>
                  <div className={`text-xs ${getPriorityColor(task.priority)}`}>
                    {task.priority === 'high' ? 'Ưu tiên cao' : task.priority === 'medium' ? 'Ưu tiên trung bình' : 'Ưu tiên thấp'}
                  </div>
                  <div className="text-xs text-muted-foreground">Hạn: {task.deadline}</div>
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
          <CardDescription>Các chức năng bán hàng thường dùng</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <button className="p-4 text-left rounded-lg border hover:bg-accent transition-colors">
              <Users className="h-6 w-6 mb-2 text-blue-600" />
              <div className="font-medium">Quản lý khách hàng</div>
              <div className="text-sm text-muted-foreground">Thêm, cập nhật khách</div>
            </button>
            <button className="p-4 text-left rounded-lg border hover:bg-accent transition-colors">
              <Car className="h-6 w-6 mb-2 text-green-600" />
              <div className="font-medium">Xe trong kho</div>
              <div className="text-sm text-muted-foreground">Xem tồn kho hiện tại</div>
            </button>
            <button className="p-4 text-left rounded-lg border hover:bg-accent transition-colors">
              <ShoppingCart className="h-6 w-6 mb-2 text-purple-600" />
              <div className="font-medium">Tạo đơn hàng</div>
              <div className="text-sm text-muted-foreground">Đơn hàng mới</div>
            </button>
            <button className="p-4 text-left rounded-lg border hover:bg-accent transition-colors">
              <CheckCircle className="h-6 w-6 mb-2 text-orange-600" />
              <div className="font-medium">Doanh số</div>
              <div className="text-sm text-muted-foreground">Xem báo cáo cá nhân</div>
            </button>
          </div>
        </CardContent>
      </Card>
      </div>
    </DashboardLayout>
  );
}