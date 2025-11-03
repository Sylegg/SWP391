'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getOrdersByDealerId } from '@/lib/orderApi';
import { getTestDrivesByDealerId } from '@/lib/testDriveApi';
import { getProductsByDealerCategory } from '@/lib/productApi';
import { getDealerCategoriesByDealerId } from '@/lib/categoryApi';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  TrendingUp, 
  ShoppingCart, 
  Car, 
  Calendar, 
  DollarSign,
  Package,
  Users,
  Activity
} from 'lucide-react';

interface OrderRes {
  orderId: number;
  dealerId: number;
  customerName: string;
  productName: string;
  totalPrice: number;
  status: string;
}

interface TestDriveRes {
  id: number;
  scheduleDate: string;
  status: string;
  productName: string;
}

interface ProductRes {
  id: number;
  name: string;
  price: number;
  status: string;
}

export default function ReportsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<OrderRes[]>([]);
  const [testDrives, setTestDrives] = useState<TestDriveRes[]>([]);
  const [products, setProducts] = useState<ProductRes[]>([]);
  const [timeRange, setTimeRange] = useState<string>('ALL');

  useEffect(() => {
    if (user?.dealerId) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user?.dealerId) return;

    try {
      setLoading(true);
      
      // Load orders - note: backend might not have dealer filter yet
      const ordersData = await getOrdersByDealerId(user.dealerId).catch(() => [] as OrderRes[]);
      setOrders(ordersData);

      // Load test drives
      const testDrivesData = await getTestDrivesByDealerId(user.dealerId);
      setTestDrives(testDrivesData);

      // Load products
      const categories = await getDealerCategoriesByDealerId(user.dealerId);
      let allProducts: ProductRes[] = [];
      for (const cat of categories) {
        const catProducts = await getProductsByDealerCategory(cat.id);
        allProducts = [...allProducts, ...catProducts];
      }
      setProducts(allProducts);
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể tải dữ liệu báo cáo',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const stats = {
    totalOrders: orders.length,
    totalRevenue: orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0),
    totalProducts: products.length,
    activeProducts: products.filter(p => p.status === 'ACTIVE').length,
    soldProducts: products.filter(p => p.status === 'SOLDOUT').length,
    testDriveTotal: testDrives.length,
    testDrivePending: testDrives.filter(td => td.status === 'PENDING').length,
    testDriveConfirmed: testDrives.filter(td => td.status === 'CONFIRMED').length,
    testDriveCompleted: testDrives.filter(td => td.status === 'COMPLETED').length,
  };

  // Best selling products
  const productSales = orders.reduce((acc, order) => {
    acc[order.productName] = (acc[order.productName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const bestSellers = Object.entries(productSales)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const formatPercentage = (value: number, total: number) => {
    if (total === 0) return '0%';
    return `${((value / total) * 100).toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải báo cáo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Báo cáo & Thống kê</h1>
          <p className="text-muted-foreground mt-2">
            Tổng quan về hoạt động kinh doanh của đại lý
          </p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Thời gian" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tất cả thời gian</SelectItem>
            <SelectItem value="TODAY">Hôm nay</SelectItem>
            <SelectItem value="WEEK">Tuần này</SelectItem>
            <SelectItem value="MONTH">Tháng này</SelectItem>
            <SelectItem value="YEAR">Năm nay</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Revenue */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng doanh thu</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatPrice(stats.totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Từ {stats.totalOrders} đơn hàng
            </p>
          </CardContent>
        </Card>

        {/* Total Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đơn hàng</CardTitle>
            <ShoppingCart className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Tổng số đơn đặt hàng
            </p>
          </CardContent>
        </Card>

        {/* Products */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sản phẩm</CardTitle>
            <Car className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.activeProducts} còn hàng • {stats.soldProducts} đã bán
            </p>
          </CardContent>
        </Card>

        {/* Test Drives */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lịch lái thử</CardTitle>
            <Calendar className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.testDriveTotal}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.testDrivePending} chờ • {stats.testDriveConfirmed} đã xác nhận
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Details */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Best Sellers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Top xe bán chạy
            </CardTitle>
            <CardDescription>
              5 sản phẩm có số đơn hàng nhiều nhất
            </CardDescription>
          </CardHeader>
          <CardContent>
            {bestSellers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                <p>Chưa có dữ liệu</p>
              </div>
            ) : (
              <div className="space-y-4">
                {bestSellers.map(([productName, count], index) => (
                  <div key={productName} className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{productName}</p>
                      <p className="text-sm text-muted-foreground">
                        {count} đơn hàng • {formatPercentage(count, stats.totalOrders)}
                      </p>
                    </div>
                    <div className="w-32 h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${(count / stats.totalOrders) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Test Drive Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Thống kê lái thử
            </CardTitle>
            <CardDescription>
              Tình trạng các lịch hẹn lái thử
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Pending */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <span className="text-sm">Chờ xác nhận</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold">{stats.testDrivePending}</span>
                  <span className="text-sm text-muted-foreground">
                    ({formatPercentage(stats.testDrivePending, stats.testDriveTotal)})
                  </span>
                </div>
              </div>

              {/* Confirmed */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span className="text-sm">Đã xác nhận</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold">{stats.testDriveConfirmed}</span>
                  <span className="text-sm text-muted-foreground">
                    ({formatPercentage(stats.testDriveConfirmed, stats.testDriveTotal)})
                  </span>
                </div>
              </div>

              {/* Completed */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-sm">Hoàn thành</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold">{stats.testDriveCompleted}</span>
                  <span className="text-sm text-muted-foreground">
                    ({formatPercentage(stats.testDriveCompleted, stats.testDriveTotal)})
                  </span>
                </div>
              </div>

              {/* Conversion Rate */}
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Tỷ lệ chuyển đổi</span>
                  <span className="font-bold text-lg text-primary">
                    {formatPercentage(stats.totalOrders, stats.testDriveCompleted)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Từ lái thử hoàn thành → Đơn hàng
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Product Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Tình trạng kho
            </CardTitle>
            <CardDescription>
              Thống kê theo trạng thái sản phẩm
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Còn hàng</span>
                <span className="font-bold text-green-600">{stats.activeProducts}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Đã bán</span>
                <span className="font-bold text-red-600">{stats.soldProducts}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Tổng cộng</span>
                <span className="font-bold">{stats.totalProducts}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Revenue Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Chi tiết doanh thu
            </CardTitle>
            <CardDescription>
              Phân tích nguồn doanh thu
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Trung bình/đơn</span>
                <span className="font-bold">
                  {formatPrice(stats.totalOrders > 0 ? stats.totalRevenue / stats.totalOrders : 0)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Doanh thu cao nhất</span>
                <span className="font-bold text-green-600">
                  {formatPrice(Math.max(...orders.map(o => o.totalPrice || 0), 0))}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Doanh thu thấp nhất</span>
                <span className="font-bold">
                  {formatPrice(orders.length > 0 ? Math.min(...orders.map(o => o.totalPrice || 0)) : 0)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
