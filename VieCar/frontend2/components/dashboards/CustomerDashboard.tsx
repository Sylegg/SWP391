'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Car, ShoppingCart, Heart, Star, MapPin, Phone, Calendar, Home } from 'lucide-react';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';

export default function CustomerDashboard() {
  const { user } = useAuth();

  const stats = [
    {
      title: 'Xe đã mua',
      value: '2',
      description: 'Tổng số xe đã sở hữu',
      icon: Car,
      color: 'text-green-600',
    },
    {
      title: 'Đơn hàng',
      value: '3',
      description: 'Tổng số đơn đã đặt',
      icon: ShoppingCart,
      color: 'text-blue-600',
    },
    {
      title: 'Xe yêu thích',
      value: '5',
      description: 'Đã lưu vào wishlist',
      icon: Heart,
      color: 'text-red-600',
    },
    {
      title: 'Điểm tích lũy',
      value: '2,450',
      description: 'Có thể sử dụng',
      icon: Star,
      color: 'text-yellow-600',
    },
  ];

  const myVehicles = [
    {
      name: 'VinFast VF3',
      year: '2024',
      color: 'Trắng',
      plate: '29A-12345',
      status: 'Đang sử dụng',
      purchaseDate: '15/03/2024',
      warranty: 'Còn 2 năm 8 tháng'
    },
    {
      name: 'Pega Newface',
      year: '2023',
      color: 'Đỏ',
      plate: '29B-67890',
      status: 'Đang sử dụng',
      purchaseDate: '10/01/2023',
      warranty: 'Còn 1 năm 4 tháng'
    },
  ];

  const recentOrders = [
    { id: 'DH001', vehicle: 'VinFast VF5', amount: '450M', status: 'processing', date: '20/09/2024' },
    { id: 'DH002', vehicle: 'VinFast VF3', amount: '240M', status: 'completed', date: '15/03/2024' },
    { id: 'DH003', vehicle: 'Pega Newface', amount: '45M', status: 'completed', date: '10/01/2023' },
  ];

  const wishlistItems = [
    { name: 'VinFast VF8', price: '1.2B', image: '/xe oto vinfast/VF8.jpg' },
    { name: 'Datbike Quantum S', price: '35M', image: '/xe datbike/quantums1.jpg' },
    { name: 'VinFast Evo 200', price: '55M', image: '/xe dien vinfast/Evo200.jpg' },
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
            <h1 className="text-3xl font-bold tracking-tight">Dashboard Khách hàng</h1>
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
            <Car className="h-4 w-4" />
            <span>Xem xe mới</span>
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
        {/* My Vehicles */}
        <Card>
          <CardHeader>
            <CardTitle>Xe của tôi</CardTitle>
            <CardDescription>
              Danh sách xe đang sở hữu
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {myVehicles.map((vehicle, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-medium text-lg">{vehicle.name} {vehicle.year}</div>
                  <span className="text-sm text-green-600 bg-green-50 px-2 py-1 rounded-full">
                    {vehicle.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                  <div>Màu: {vehicle.color}</div>
                  <div>Biển số: {vehicle.plate}</div>
                  <div>Mua: {vehicle.purchaseDate}</div>
                  <div>Bảo hành: {vehicle.warranty}</div>
                </div>
                <div className="flex space-x-2 pt-2">
                  <button className="flex items-center space-x-1 px-3 py-1 text-xs bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
                    <Calendar className="h-3 w-3" />
                    <span>Đặt lịch bảo dưỡng</span>
                  </button>
                  <button className="flex items-center space-x-1 px-3 py-1 text-xs bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors">
                    <Phone className="h-3 w-3" />
                    <span>Hỗ trợ</span>
                  </button>
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
              Lịch sử mua hàng
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentOrders.map((order, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="space-y-1">
                  <div className="font-medium">{order.id}</div>
                  <div className="text-sm text-muted-foreground">{order.vehicle}</div>
                  <div className="text-xs text-muted-foreground">{order.date}</div>
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

      {/* Wishlist */}
      <Card>
        <CardHeader>
          <CardTitle>Xe yêu thích</CardTitle>
          <CardDescription>Những chiếc xe bạn quan tâm</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {wishlistItems.map((item, index) => (
              <div key={index} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                <div className="aspect-video bg-gray-100 flex items-center justify-center">
                  <Car className="h-12 w-12 text-gray-400" />
                </div>
                <div className="p-4 space-y-2">
                  <div className="font-medium">{item.name}</div>
                  <div className="text-sm text-muted-foreground">Giá: {item.price}</div>
                  <div className="flex space-x-2">
                    <button className="flex-1 px-3 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                      Xem chi tiết
                    </button>
                    <button className="px-3 py-2 text-sm border rounded-lg hover:bg-accent transition-colors">
                      <Heart className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Dịch vụ</CardTitle>
          <CardDescription>Các dịch vụ dành cho khách hàng</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <button className="p-4 text-left rounded-lg border hover:bg-accent transition-colors">
              <Car className="h-6 w-6 mb-2 text-blue-600" />
              <div className="font-medium">Xem xe mới</div>
              <div className="text-sm text-muted-foreground">Khám phá sản phẩm</div>
            </button>
            <button className="p-4 text-left rounded-lg border hover:bg-accent transition-colors">
              <Calendar className="h-6 w-6 mb-2 text-green-600" />
              <div className="font-medium">Đặt lịch test drive</div>
              <div className="text-sm text-muted-foreground">Trải nghiệm xe</div>
            </button>
            <button className="p-4 text-left rounded-lg border hover:bg-accent transition-colors">
              <MapPin className="h-6 w-6 mb-2 text-purple-600" />
              <div className="font-medium">Tìm đại lý</div>
              <div className="text-sm text-muted-foreground">Gần vị trí của bạn</div>
            </button>
            <button className="p-4 text-left rounded-lg border hover:bg-accent transition-colors">
              <Phone className="h-6 w-6 mb-2 text-orange-600" />
              <div className="font-medium">Hỗ trợ</div>
              <div className="text-sm text-muted-foreground">Liên hệ tư vấn</div>
            </button>
          </div>
        </CardContent>
      </Card>
      </div>
    </DashboardLayout>
  );
}