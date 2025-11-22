'use client';

import { useEffect, useState } from 'react';
import { ProtectedRoute } from '@/components/auth-guards';
import CustomerLayout from '@/components/layout/customer-layout';
import { useAuth } from '@/contexts/AuthContext';
import { getAllProducts, Product } from '@/lib/productApi';
import { getAllCategories, Category } from '@/lib/categoryApi';
import { getAllDistributions } from '@/lib/distributionApi';
import { DistributionRes } from '@/types/distribution';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Car, ShoppingCart, MapPin, Battery, Zap, AlertCircle, Calendar } from 'lucide-react';
import Link from 'next/link';

export default function CatalogPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [distributions, setDistributions] = useState<DistributionRes[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters - Simplified
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('ALL');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [productsData, categoriesData, distributionsData] = await Promise.all([
        getAllProducts(),
        getAllCategories(),
        getAllDistributions(),
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
      setDistributions(distributionsData);
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể tải dữ liệu sản phẩm',
        variant: 'destructive',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const getFilteredProducts = () => {
    // ⭐ CHỈ HIỂN THỊ XE CỦA DEALER ĐÃ CHỌN
    if (!user?.dealerId) {
      return [];
    }

    // Lấy product IDs từ distributions của dealer đã chọn
    const productIds = new Set(
      distributions
        .filter(d => d.dealerId === user.dealerId)
        .flatMap(d => d.products?.map(p => p.id) || [])
    );

    return products.filter(product => {
      // ⭐ Phải thuộc dealer đã chọn
      if (!productIds.has(product.id)) {
        return false;
      }

      // ⭐ CHỈ HIỂN THỊ XE ĐANG BÁN (ACTIVE)
      if (product.status !== 'ACTIVE') {
        return false;
      }

      // Category filter - nếu đã chọn danh mục
      if (selectedCategoryId !== 'ALL' && product.categoryId.toString() !== selectedCategoryId) {
        return false;
      }

      return true;
    });
  };

  // ⭐ Lọc danh mục theo dealer đã chọn
  const getFilteredCategories = () => {
    if (!user?.dealerId) {
      return [];
    }

    // Lấy product IDs từ distributions của dealer đã chọn
    const productIds = new Set(
      distributions
        .filter(d => d.dealerId === user.dealerId)
        .flatMap(d => d.products?.map(p => p.id) || [])
    );

    // Lấy category IDs từ các products của dealer
    const categoryIds = new Set(
      products
        .filter(p => productIds.has(p.id) && p.status === 'ACTIVE')
        .map(p => p.categoryId)
    );

    // Trả về các categories có sản phẩm
    return categories.filter(cat => categoryIds.has(cat.id));
  };

  const formatPrice = (price: number | undefined) => {
    if (!price) return 'Liên hệ';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const getStatusBadge = (status: string | undefined) => {
    if (status === 'ACTIVE') {
      return <Badge className="bg-green-500">Còn hàng</Badge>;
    }
    if (status === 'TEST_DRIVE') {
      return <Badge className="bg-blue-500">Có lái thử</Badge>;
    }
    return <Badge variant="secondary">Hết hàng</Badge>;
  };

  const filteredProducts = getFilteredProducts();
  const filteredCategories = getFilteredCategories();

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['Customer', 'Admin']}>
        <CustomerLayout>
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-4 text-gray-600">Đang tải sản phẩm...</p>
            </div>
          </div>
        </CustomerLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['Customer', 'Admin']}>
      <CustomerLayout>
        <div className="space-y-6 p-6">
          {/* Header với gradient và icon */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-purple-800 p-8 text-white">
            <div className="absolute top-0 right-0 opacity-10">
              <Car className="h-64 w-64" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Car className="h-8 w-8" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold">Danh mục xe điện VinFast</h1>
                  <p className="text-blue-100 mt-1 text-lg">
                    Khám phá dòng xe điện thông minh, hiện đại
                  </p>
                </div>
              </div>
              {user?.dealerId && (
                <div className="flex items-center gap-2 mt-4 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 w-fit">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm font-medium">Đại lý đã chọn: #{user.dealerId}</span>
                </div>
              )}
            </div>
          </div>

          {/* ⭐ Thông báo chưa chọn đại lý */}
          {!user?.dealerId && (
            <Card className="border-2 border-amber-400 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 shadow-lg">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-md">
                    <AlertCircle className="h-7 w-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-2xl text-amber-900 mb-2 flex items-center gap-2">
                      Vui lòng chọn đại lý trước
                    </h3>
                    <p className="text-amber-800 mb-4 text-base leading-relaxed">
                      Để xem danh mục xe có sẵn, vui lòng chọn đại lý gần bạn nhất. 
                      Mỗi đại lý có các mẫu xe và ưu đãi khác nhau.
                    </p>
                    <Link href="/dashboard/customer">
                      <Button size="lg" className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 shadow-md hover:shadow-lg transition-all">
                        <MapPin className="mr-2 h-5 w-5" />
                        Chọn đại lý ngay
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Chỉ hiển thị filters và products khi đã chọn dealer */}
          {user?.dealerId && (
            <>
              {/* Category Filter - Simple Dropdown */}
              <Card className="shadow-md border-2">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Car className="h-5 w-5 text-blue-600" />
                    </div>
                    Chọn loại xe
                  </CardTitle>
                  <CardDescription>Chọn danh mục xe bạn quan tâm</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="max-w-md">
                    <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
                      <SelectTrigger className="h-12 text-base">
                        <SelectValue placeholder="Chọn loại xe" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">
                          <div className="flex items-center gap-2 py-1">
                            <Car className="h-4 w-4" />
                            <span className="font-medium">Tất cả loại xe</span>
                          </div>
                        </SelectItem>
                        {filteredCategories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id.toString()}>
                            <div className="py-1">
                              <div className="font-medium">{cat.name}</div>
                              {cat.brand && (
                                <div className="text-xs text-muted-foreground">{cat.brand}</div>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

      {/* Results Count với badge */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="text-base px-4 py-2 shadow-md">
            <Car className="h-4 w-4 mr-2" />
            {filteredProducts.length} xe có sẵn
          </Badge>
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="py-16 text-center">
            <div className="mx-auto w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-full flex items-center justify-center mb-6">
              <Car className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-700">Không tìm thấy xe phù hợp</h3>
            <p className="text-gray-500">
              Vui lòng thử chọn danh mục khác hoặc liên hệ đại lý để biết thêm thông tin
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product) => {
            return (
              <Card key={product.id} className="group overflow-hidden hover:shadow-2xl transition-all duration-300 border-2 hover:border-blue-300">
                {/* Product Image */}
                <div className="relative h-56 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 overflow-hidden">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder-car.png';
                      }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Car className="h-20 w-20 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    {getStatusBadge(product.status)}
                  </div>
                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>

                <CardHeader className="pb-3">
                  <CardTitle className="text-xl group-hover:text-blue-600 transition-colors">
                    {product.name}
                  </CardTitle>
                  <div className="flex items-center gap-3 mt-2">
                    {product.color && (
                      <div className="flex items-center gap-1.5">
                        <div 
                          className="h-4 w-4 rounded-full border-2 border-gray-300 shadow-sm" 
                          style={{ backgroundColor: product.color.toLowerCase() }}
                        ></div>
                        <span className="text-sm font-medium text-muted-foreground">{product.color}</span>
                      </div>
                    )}
                    {product.vinNum && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-muted-foreground">VIN:</span>
                        <span className="text-xs font-mono font-semibold">{product.vinNum}</span>
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Technical Specs Grid - Enhanced */}
                  <div className="grid grid-cols-2 gap-2">
                    {product.battery && (
                      <div className="flex items-center gap-2 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 rounded-lg p-2.5 border border-orange-200/30">
                        <div className="p-1.5 bg-orange-100 dark:bg-orange-900 rounded">
                          <Battery className="h-4 w-4 text-orange-600" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Pin</p>
                          <p className="text-sm font-bold text-orange-700 dark:text-orange-400">{product.battery} kWh</p>
                        </div>
                      </div>
                    )}
                    {product.range && (
                      <div className="flex items-center gap-2 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-lg p-2.5 border border-green-200/30">
                        <div className="p-1.5 bg-green-100 dark:bg-green-900 rounded">
                          <Zap className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Phạm vi</p>
                          <p className="text-sm font-bold text-green-700 dark:text-green-400">{product.range} km</p>
                        </div>
                      </div>
                    )}
                    {product.hp && (
                      <div className="flex items-center gap-2 bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/30 rounded-lg p-2.5 border border-red-200/30">
                        <div className="p-1.5 bg-red-100 dark:bg-red-900 rounded">
                          <Zap className="h-4 w-4 text-red-600" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Công suất</p>
                          <p className="text-sm font-bold text-red-700 dark:text-red-400">{product.hp} HP</p>
                        </div>
                      </div>
                    )}
                    {product.torque && (
                      <div className="flex items-center gap-2 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 rounded-lg p-2.5 border border-purple-200/30">
                        <div className="p-1.5 bg-purple-100 dark:bg-purple-900 rounded">
                          <Zap className="h-4 w-4 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Mô-men</p>
                          <p className="text-sm font-bold text-purple-700 dark:text-purple-400">{product.torque} Nm</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Engine Number if available */}
                  {product.engineNum && (
                    <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-3 border border-blue-200/30">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Số máy:</span>
                        <span className="text-sm font-mono font-semibold text-blue-700 dark:text-blue-400">{product.engineNum}</span>
                      </div>
                    </div>
                  )}

                  {/* Manufacturing Date */}
                  {product.manufacture_date && (
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Ngày sản xuất:</span>
                        <span className="text-sm font-semibold">
                          {new Date(product.manufacture_date).toLocaleDateString('vi-VN', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  {product.description && (
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-gray-800/50 dark:to-gray-900/50 rounded-lg p-3 border border-gray-200/50">
                      <p className="text-xs text-muted-foreground mb-1.5">📝 Mô tả:</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2 leading-relaxed">
                        {product.description}
                      </p>
                    </div>
                  )}

                  {/* Price Section - Enhanced */}
                  <div className="pt-3 border-t-2 border-dashed space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">💰 Giá bán</p>
                      {product.status === 'ACTIVE' && (
                        <Badge className="bg-green-500 text-white">Còn hàng</Badge>
                      )}
                    </div>
                    <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                      {formatPrice(product.price)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      ⚡ Giá đã bao gồm VAT
                    </p>
                  </div>
                </CardContent>

                <CardFooter className="gap-2 pt-4 bg-gray-50 dark:bg-gray-900">
                  {product.status === 'TEST_DRIVE' ? (
                    <Link href="/dashboard/customer/test-drive" className="flex-1">
                      <Button className="w-full bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg transition-all" size="lg">
                        <Calendar className="h-4 w-4 mr-2" />
                        Đặt lịch lái thử
                      </Button>
                    </Link>
                  ) : product.status === 'ACTIVE' ? (
                    <Link href={`/dashboard/customer/order?productId=${product.id}`} className="flex-1">
                      <Button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-md hover:shadow-lg transition-all" size="lg">
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Đặt xe ngay
                      </Button>
                    </Link>
                  ) : (
                    <Button className="w-full" size="lg" disabled variant="secondary">
                      Không khả dụng
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
            </>
          )}
        </div>
      </CustomerLayout>
    </ProtectedRoute>
  );
}
