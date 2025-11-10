'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/auth-guards';
import DealerManagerLayout from '@/components/layout/dealer-manager-layout';
import { 
  getSalesReport, 
  getDistributionReport, 
  getDealerPerformance,
  getTopProducts,
  type SalesReportRes,
  type DistributionReportRes,
  type DealerPerformanceRes,
  type ProductSalesRes
} from '@/lib/reportApi';
import { getDealerCategoriesByDealerId } from '@/lib/categoryApi';
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
  DollarSign,
  Package,
  Activity,
  BarChart3,
  TrendingDown,
  Award,
  Zap
} from 'lucide-react';

export default function ReportsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  
  // Report data
  const [salesReport, setSalesReport] = useState<SalesReportRes | null>(null);
  const [distributionReport, setDistributionReport] = useState<DistributionReportRes | null>(null);
  const [dealerPerformance, setDealerPerformance] = useState<DealerPerformanceRes[]>([]);
  const [topProducts, setTopProducts] = useState<ProductSalesRes[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  
  // Filters
  const [timeRange, setTimeRange] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  useEffect(() => {
    // ⭐ Chỉ load khi đã có user và dealerId
    if (user?.dealerId) {
      loadData();
    } else if (user && !user.dealerId) {
      console.error('❌ User logged in but missing dealerId:', user);
      toast({
        title: 'Lỗi cấu hình',
        description: 'Tài khoản chưa được gán đại lý. Vui lòng liên hệ quản trị viên.',
        variant: 'destructive',
      });
    }
  }, [user?.dealerId, timeRange]); // ⭐ Dependency: dealerId và timeRange

  const loadData = async () => {
    console.log('📊 Loading reports data...', { userId: user?.id, dealerId: user?.dealerId, role: user?.role?.name });
    
    // ⭐ BẮT BUỘC phải có dealerId để đảm bảo chỉ hiển thị dữ liệu của dealer hiện tại
    if (!user?.dealerId) {
      console.warn('⚠️ No dealerId found - Cannot load dealer-specific reports');
      toast({
        title: 'Lỗi',
        description: 'Không tìm thấy thông tin đại lý. Vui lòng đăng nhập lại.',
        variant: 'destructive',
      });
      setLoading(false);
      return;
    }

    const dealerId = user.dealerId;
    
    try {
      setLoading(true);
      
      console.log('🔄 Fetching data ONLY for dealerId:', dealerId);
      
      // Load all reports in parallel - ⭐ LUÔN LUÔN truyền dealerId
      const [sales, distribution, dealers, products, cats] = await Promise.all([
        getSalesReport(dealerId).catch((err) => {
          console.error('❌ Sales report error:', err);
          return null;
        }),
        getDistributionReport(dealerId).catch((err) => {
          console.error('❌ Distribution report error:', err);
          return null;
        }),
        getDealerPerformance().catch((err) => {
          console.error('❌ Dealer performance error:', err);
          return [];
        }),
        getTopProducts(dealerId, 5).catch((err) => {
          console.error('❌ Top products error:', err);
          return [];
        }),
        getDealerCategoriesByDealerId(dealerId).catch((err) => {
          console.error('❌ Categories error:', err);
          return [];
        })
      ]);

      console.log('✅ Data loaded for dealer', dealerId, ':', { 
        sales, 
        distribution, 
        dealers: dealers.length, 
        products: products.length, 
        categories: cats.length 
      });

      setSalesReport(sales);
      setDistributionReport(distribution);
      setDealerPerformance(dealers);
      setTopProducts(products);
      setCategories(cats);
      
      if (!sales && !distribution) {
        toast({
          title: 'Thông báo',
          description: 'Chưa có dữ liệu báo cáo cho đại lý này. Vui lòng kiểm tra lại sau.',
          variant: 'default',
        });
      }
    } catch (error: any) {
      console.error('💥 Fatal error loading reports:', error);
      toast({
        title: 'Lỗi',
        description: error.message || 'Không thể tải dữ liệu báo cáo',
        variant: 'destructive',
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

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['Dealer Manager', 'Admin']}>
        <DealerManagerLayout>
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Đang tải báo cáo...</p>
            </div>
          </div>
        </DealerManagerLayout>
      </ProtectedRoute>
    );
  }


  return (
    <ProtectedRoute allowedRoles={['Dealer Manager', 'Admin']}>
      <DealerManagerLayout>
        <div className="space-y-6">
          {/* Header with Liquid Glass */}
          <div className="relative overflow-hidden rounded-2xl backdrop-blur-md bg-white/70 dark:bg-gray-900/70 border border-white/30 shadow-xl p-8">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-red-500/10 to-pink-500/10 animate-gradient-shift"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.3),transparent_50%)]"></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-4 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 shadow-lg shadow-orange-500/30">
                    <BarChart3 className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 bg-clip-text text-transparent">
                      📊 Báo cáo & Thống kê
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                      Tổng quan về hoạt động kinh doanh của đại lý
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-[180px] backdrop-blur-sm bg-white/60 dark:bg-gray-800/60">
                      <SelectValue placeholder="Danh mục" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">Tất cả danh mục</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id.toString()}>
                          {cat.categoryName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={timeRange} onValueChange={setTimeRange}>
                    <SelectTrigger className="w-[180px] backdrop-blur-sm bg-white/60 dark:bg-gray-800/60">
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
              </div>
            </div>
          </div>

          {/* Key Metrics - Doanh thu & Lợi nhuận */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {/* Total Revenue */}
            <div className="backdrop-blur-md bg-white/60 dark:bg-gray-900/60 rounded-2xl border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 p-6 group">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">💰 Tổng doanh thu</h3>
                <div className="p-2 rounded-lg bg-green-500/20 backdrop-blur-sm group-hover:scale-110 transition-transform">
                  <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {salesReport ? formatPrice(salesReport.totalRevenue) : '---'}
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                Từ {salesReport?.totalOrders || 0} đơn hàng
              </p>
              <div className="mt-2 h-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            </div>

            {/* Total Profit */}
            <div className="backdrop-blur-md bg-white/60 dark:bg-gray-900/60 rounded-2xl border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 p-6 group">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">📈 Lợi nhuận</h3>
                <div className="p-2 rounded-lg bg-blue-500/20 backdrop-blur-sm group-hover:scale-110 transition-transform">
                  <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {salesReport ? formatPrice(salesReport.totalProfit) : '---'}
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                Tỷ suất: {salesReport ? formatPercentage(salesReport.profitMargin) : '0%'}
              </p>
              <div className="mt-2 h-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            </div>

            {/* Distributed Products */}
            <div className="backdrop-blur-md bg-white/60 dark:bg-gray-900/60 rounded-2xl border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 p-6 group">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">🚗 Xe đã phân phối</h3>
                <div className="p-2 rounded-lg bg-purple-500/20 backdrop-blur-sm group-hover:scale-110 transition-transform">
                  <Car className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {distributionReport?.totalDistributed || 0}
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                {distributionReport?.totalSold || 0} đã bán • {distributionReport?.totalInStock || 0} tồn kho
              </p>
              <div className="mt-2 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            </div>

            {/* Average Order Value */}
            <div className="backdrop-blur-md bg-white/60 dark:bg-gray-900/60 rounded-2xl border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 p-6 group">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">💵 Giá trị TB/đơn</h3>
                <div className="p-2 rounded-lg bg-orange-500/20 backdrop-blur-sm group-hover:scale-110 transition-transform">
                  <ShoppingCart className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {salesReport ? formatPrice(salesReport.averageOrderValue) : '---'}
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                Tỷ lệ phân phối: {distributionReport ? formatPercentage(distributionReport.distributionRate) : '0%'}
              </p>
              <div className="mt-2 h-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            </div>
          </div>

          {/* Charts and Details */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Top Products */}
            <div className="backdrop-blur-md bg-white/60 dark:bg-gray-900/60 rounded-2xl border border-white/30 shadow-lg p-6">
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 rounded-lg bg-blue-500/20 backdrop-blur-sm">
                    <Award className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">🏆 Top xe bán chạy</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  5 sản phẩm có doanh thu cao nhất
                </p>
              </div>
              {topProducts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                  <p>Chưa có dữ liệu</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {topProducts.map((product, index) => (
                    <div key={index} className="flex items-center gap-4 p-3 rounded-lg bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm hover:bg-white/60 dark:hover:bg-gray-800/60 transition-colors">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold shadow-lg">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate text-gray-900 dark:text-gray-100">{product.productName}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {product.categoryName} • {product.totalSold} xe • {formatPrice(product.totalRevenue)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-green-600 dark:text-green-400">
                          {formatPrice(product.averagePrice)}
                        </p>
                        <p className="text-xs text-gray-500">TB/xe</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Distribution Status */}
            <div className="backdrop-blur-md bg-white/60 dark:bg-gray-900/60 rounded-2xl border border-white/30 shadow-lg p-6">
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 rounded-lg bg-purple-500/20 backdrop-blur-sm">
                    <Package className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">📦 Tình trạng kho</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Thống kê phân phối và tồn kho
                </p>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-br from-blue-50/80 to-cyan-50/80 dark:from-blue-950/40 dark:to-cyan-950/40 backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500 shadow-lg shadow-blue-500/50" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Đã phân phối</span>
                  </div>
                  <span className="font-bold text-blue-600 dark:text-blue-400">
                    {distributionReport?.totalDistributed || 0}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-br from-green-50/80 to-emerald-50/80 dark:from-green-950/40 dark:to-emerald-950/40 backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500 shadow-lg shadow-green-500/50" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Còn hàng</span>
                  </div>
                  <span className="font-bold text-green-600 dark:text-green-400">
                    {distributionReport?.totalInStock || 0}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-br from-orange-50/80 to-red-50/80 dark:from-orange-950/40 dark:to-red-950/40 backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-orange-500 shadow-lg shadow-orange-500/50" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Đã bán</span>
                  </div>
                  <span className="font-bold text-orange-600 dark:text-orange-400">
                    {distributionReport?.totalSold || 0}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-gray-500 shadow-lg shadow-gray-500/50" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Không hoạt động</span>
                  </div>
                  <span className="font-bold text-gray-600 dark:text-gray-400">
                    {distributionReport?.totalInactive || 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Dealer Performance (Admin only) */}
            {user?.role?.name === 'Admin' && dealerPerformance.length > 0 && (
              <div className="backdrop-blur-md bg-white/60 dark:bg-gray-900/60 rounded-2xl border border-white/30 shadow-lg p-6 lg:col-span-2">
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 rounded-lg bg-green-500/20 backdrop-blur-sm">
                      <Zap className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">⚡ Top đại lý theo doanh số</h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Hiệu suất kinh doanh của các đại lý
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {dealerPerformance.slice(0, 6).map((dealer, index) => (
                    <div key={dealer.dealerId} className="p-4 rounded-lg bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm hover:bg-white/60 dark:hover:bg-gray-800/60 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-900 dark:text-gray-100">{dealer.dealerName}</h4>
                          <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{dealer.dealerAddress}</p>
                        </div>
                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 text-white text-xs font-bold">
                          {index + 1}
                        </div>
                      </div>
                      <div className="space-y-1 mt-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Doanh thu:</span>
                          <span className="font-bold text-green-600 dark:text-green-400">{formatPrice(dealer.totalRevenue)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Lợi nhuận:</span>
                          <span className="font-bold text-blue-600 dark:text-blue-400">{formatPrice(dealer.totalProfit)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Sản phẩm:</span>
                          <span className="font-bold text-gray-900 dark:text-gray-100">{dealer.totalProducts}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Price Analysis */}
            <div className="backdrop-blur-md bg-white/60 dark:bg-gray-900/60 rounded-2xl border border-white/30 shadow-lg p-6 lg:col-span-2">
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 rounded-lg bg-orange-500/20 backdrop-blur-sm">
                    <Activity className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">💸 Phân tích chênh lệch giá</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  So sánh giá nhập - giá bán và lợi nhuận
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-gradient-to-br from-green-50/80 to-emerald-50/80 dark:from-green-950/40 dark:to-emerald-950/40 backdrop-blur-sm">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Tổng lợi nhuận</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {salesReport ? formatPrice(salesReport.totalProfit) : '---'}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-gradient-to-br from-blue-50/80 to-cyan-50/80 dark:from-blue-950/40 dark:to-cyan-950/40 backdrop-blur-sm">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Tỷ suất lợi nhuận</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {salesReport ? formatPercentage(salesReport.profitMargin) : '0%'}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-gradient-to-br from-purple-50/80 to-pink-50/80 dark:from-purple-950/40 dark:to-pink-950/40 backdrop-blur-sm">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Giá trị TB/đơn</p>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {salesReport ? formatPrice(salesReport.averageOrderValue) : '---'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DealerManagerLayout>
    </ProtectedRoute>
  );
}
