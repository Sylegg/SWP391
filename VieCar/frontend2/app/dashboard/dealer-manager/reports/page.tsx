'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/auth-guards';
import DealerManagerLayout from '@/components/layout/dealer-manager-layout';
import { 
  getSalesReport, 
  getDistributionReport,
  getTopProducts,
  type SalesReportRes,
  type DistributionReportRes,
  type ProductSalesRes
} from '@/lib/reportApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  TrendingUp, 
  ShoppingCart, 
  Car, 
  DollarSign,
  Package,
  Activity,
  BarChart3,
  Award,
  Percent,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';


export default function ReportsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  
  // Report data
  const [salesReport, setSalesReport] = useState<SalesReportRes | null>(null);
  const [distributionReport, setDistributionReport] = useState<DistributionReportRes | null>(null);
  const [topProducts, setTopProducts] = useState<ProductSalesRes[]>([]);

  useEffect(() => {
    if (user?.dealerId) {
      loadData();
    }
  }, [user?.dealerId]);

  const loadData = async () => {
    if (!user?.dealerId) {
      toast({
        title: 'Lỗi',
        description: 'Không tìm thấy thông tin đại lý',
        variant: 'destructive',
        duration: 3000,
      });
      setLoading(false);
      return;
    }

    const dealerId = user.dealerId;
    
    try {
      setLoading(true);
      
      const [sales, distribution, products] = await Promise.all([
        getSalesReport(dealerId).catch(() => null),
        getDistributionReport(dealerId).catch(() => null),
        getTopProducts(dealerId, 5).catch(() => [])
      ]);

      setSalesReport(sales);
      setDistributionReport(distribution);
      setTopProducts(products);
      
    } catch (error: any) {
      toast({
        title: 'Lỗi',
        description: error.message || 'Không thể tải dữ liệu báo cáo',
        variant: 'destructive',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('vi-VN').format(num);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['Dealer Manager']}>
        <DealerManagerLayout>
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Đang tải báo cáo...</p>
            </div>
          </div>
        </DealerManagerLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['Dealer Manager']}>
      <DealerManagerLayout>
        <div className="space-y-6 p-6">
          {/* Header */}
          <div className="relative overflow-hidden rounded-2xl backdrop-blur-md bg-gradient-to-br from-orange-50/80 to-red-50/80 dark:from-orange-950/30 dark:to-red-950/30 border-2 border-orange-200/50 shadow-xl p-8">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-red-500/10 to-pink-500/10"></div>
            
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-4 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 shadow-lg">
                  <BarChart3 className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 bg-clip-text text-transparent">
                    📊 Báo cáo & Thống kê
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Tổng quan hoạt động kinh doanh của đại lý
                  </p>
                </div>
              </div>
              <Button
                onClick={loadData}
                variant="outline"
                className="gap-2 backdrop-blur-sm bg-white/60"
              >
                <RefreshCw className="h-4 w-4" />
                Làm mới
              </Button>
            </div>
          </div>

          {/* Sales Report - Báo cáo Doanh thu */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                Báo cáo Doanh thu
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Total Revenue */}
              <Card className="backdrop-blur-md bg-gradient-to-br from-green-50/80 to-emerald-50/80 dark:from-green-950/30 dark:to-emerald-950/30 border-green-200/50">
                <CardHeader className="pb-3">
                  <CardDescription className="flex items-center gap-2 text-green-700 dark:text-green-400">
                    <DollarSign className="h-4 w-4" />
                    Tổng Doanh thu
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-700 dark:text-green-300">
                    {formatPrice(salesReport?.totalRevenue || 0)}
                  </div>
                  <p className="text-xs text-green-600/70 dark:text-green-400/70 mt-2">
                    💰 Tổng tiền bán hàng
                  </p>
                </CardContent>
              </Card>

              {/* Total Profit */}
              <Card className="backdrop-blur-md bg-gradient-to-br from-blue-50/80 to-indigo-50/80 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200/50">
                <CardHeader className="pb-3">
                  <CardDescription className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
                    <TrendingUp className="h-4 w-4" />
                    Tổng Lợi nhuận
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-700 dark:text-blue-300">
                    {formatPrice(salesReport?.totalProfit || 0)}
                  </div>
                  <p className="text-xs text-blue-600/70 dark:text-blue-400/70 mt-2">
                    📈 Lãi từ bán hàng
                  </p>
                </CardContent>
              </Card>

              {/* Total Orders */}
              <Card className="backdrop-blur-md bg-gradient-to-br from-purple-50/80 to-pink-50/80 dark:from-purple-950/30 dark:to-pink-950/30 border-purple-200/50">
                <CardHeader className="pb-3">
                  <CardDescription className="flex items-center gap-2 text-purple-700 dark:text-purple-400">
                    <ShoppingCart className="h-4 w-4" />
                    Tổng Đơn hàng
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-700 dark:text-purple-300">
                    {formatNumber(salesReport?.totalOrders || 0)}
                  </div>
                  <p className="text-xs text-purple-600/70 dark:text-purple-400/70 mt-2">
                    🛒 Số đơn đã bán
                  </p>
                </CardContent>
              </Card>

              {/* Average Order Value */}
              <Card className="backdrop-blur-md bg-gradient-to-br from-orange-50/80 to-amber-50/80 dark:from-orange-950/30 dark:to-amber-950/30 border-orange-200/50">
                <CardHeader className="pb-3">
                  <CardDescription className="flex items-center gap-2 text-orange-700 dark:text-orange-400">
                    <Activity className="h-4 w-4" />
                    Giá trị TB/Đơn
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-orange-700 dark:text-orange-300">
                    {formatPrice(salesReport?.averageOrderValue || 0)}
                  </div>
                  <p className="text-xs text-orange-600/70 dark:text-orange-400/70 mt-2">
                    📊 Trung bình mỗi đơn
                  </p>
                </CardContent>
              </Card>

              {/* Profit Margin */}
              <Card className="backdrop-blur-md bg-gradient-to-br from-teal-50/80 to-cyan-50/80 dark:from-teal-950/30 dark:to-cyan-950/30 border-teal-200/50">
                <CardHeader className="pb-3">
                  <CardDescription className="flex items-center gap-2 text-teal-700 dark:text-teal-400">
                    <Percent className="h-4 w-4" />
                    Tỷ suất Lợi nhuận
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-teal-700 dark:text-teal-300">
                    {formatPercentage(salesReport?.profitMargin || 0)}
                  </div>
                  <p className="text-xs text-teal-600/70 dark:text-teal-400/70 mt-2">
                    💹 % Lãi trên doanh thu
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Distribution Report - Báo cáo Phân phối */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                Báo cáo Kho & Phân phối
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Total Distributed */}
              <Card className="backdrop-blur-md bg-gradient-to-br from-indigo-50/80 to-blue-50/80 dark:from-indigo-950/30 dark:to-blue-950/30 border-indigo-200/50">
                <CardHeader className="pb-3">
                  <CardDescription className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400">
                    <Package className="h-4 w-4" />
                    Tổng Phân phối
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-indigo-700 dark:text-indigo-300">
                    {formatNumber(distributionReport?.totalDistributed || 0)}
                  </div>
                  <p className="text-xs text-indigo-600/70 dark:text-indigo-400/70 mt-2">
                    📦 Xe đã nhận
                  </p>
                </CardContent>
              </Card>

              {/* Total In Stock */}
              <Card className="backdrop-blur-md bg-gradient-to-br from-cyan-50/80 to-teal-50/80 dark:from-cyan-950/30 dark:to-teal-950/30 border-cyan-200/50">
                <CardHeader className="pb-3">
                  <CardDescription className="flex items-center gap-2 text-cyan-700 dark:text-cyan-400">
                    <Car className="h-4 w-4" />
                    Còn trong Kho
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-cyan-700 dark:text-cyan-300">
                    {formatNumber(distributionReport?.totalInStock || 0)}
                  </div>
                  <p className="text-xs text-cyan-600/70 dark:text-cyan-400/70 mt-2">
                    🏪 Xe chưa bán
                  </p>
                </CardContent>
              </Card>

              {/* Total Sold */}
              <Card className="backdrop-blur-md bg-gradient-to-br from-green-50/80 to-emerald-50/80 dark:from-green-950/30 dark:to-emerald-950/30 border-green-200/50">
                <CardHeader className="pb-3">
                  <CardDescription className="flex items-center gap-2 text-green-700 dark:text-green-400">
                    <Award className="h-4 w-4" />
                    Đã Bán
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-700 dark:text-green-300">
                    {formatNumber(distributionReport?.totalSold || 0)}
                  </div>
                  <p className="text-xs text-green-600/70 dark:text-green-400/70 mt-2">
                    ✅ Xe đã giao
                  </p>
                </CardContent>
              </Card>

              {/* Distribution Rate */}
              <Card className="backdrop-blur-md bg-gradient-to-br from-purple-50/80 to-pink-50/80 dark:from-purple-950/30 dark:to-pink-950/30 border-purple-200/50">
                <CardHeader className="pb-3">
                  <CardDescription className="flex items-center gap-2 text-purple-700 dark:text-purple-400">
                    <Sparkles className="h-4 w-4" />
                    Tỷ lệ Bán
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-700 dark:text-purple-300">
                    {formatPercentage(distributionReport?.distributionRate || 0)}
                  </div>
                  <p className="text-xs text-purple-600/70 dark:text-purple-400/70 mt-2">
                    📊 % Xe đã bán/Tổng
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Top Products */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-600" />
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                Top 5 Sản phẩm Bán chạy
              </h2>
            </div>
            
            <Card className="backdrop-blur-md bg-white/70 dark:bg-gray-900/70 border border-white/30">
              <CardContent className="p-6">
                {topProducts.length > 0 ? (
                  <div className="space-y-4">
                    {topProducts.map((product, index) => (
                      <div 
                        key={index}
                        className="flex items-center justify-between p-4 rounded-xl backdrop-blur-sm bg-gradient-to-r from-white/60 to-gray-50/60 dark:from-gray-800/60 dark:to-gray-900/60 border border-white/20 hover:scale-[1.02] transition-all"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`
                            flex items-center justify-center w-10 h-10 rounded-full font-bold text-white
                            ${index === 0 ? 'bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg shadow-yellow-500/50' : ''}
                            ${index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400 shadow-lg shadow-gray-400/50' : ''}
                            ${index === 2 ? 'bg-gradient-to-br from-orange-400 to-amber-600 shadow-lg shadow-orange-500/50' : ''}
                            ${index > 2 ? 'bg-gradient-to-br from-blue-400 to-indigo-500' : ''}
                          `}>
                            #{index + 1}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-800 dark:text-gray-200">
                              {product.productName}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {product.categoryName}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-green-700 dark:text-green-400">
                            {formatPrice(product.totalRevenue)}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {formatNumber(product.totalSold)} xe • TB: {formatPrice(product.averagePrice)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Car className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">
                      Chưa có dữ liệu sản phẩm bán chạy
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

        </div>
      </DealerManagerLayout>
    </ProtectedRoute>
  );
}
