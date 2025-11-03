'use client';

import { useEffect, useState } from 'react';
import { ProtectedRoute } from '@/components/auth-guards';
import CustomerLayout from '@/components/layout/customer-layout';
import { getAllProducts, Product } from '@/lib/productApi';
import { getAllCategories, Category } from '@/lib/categoryApi';
import { getAllDealers, Dealer } from '@/lib/dealerApi';
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
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Search, Car, Filter, Calendar, ShoppingCart, MapPin, Battery, Zap } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function CatalogPage() {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedDealer, setSelectedDealer] = useState<string>('ALL');
  const [priceRange, setPriceRange] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ACTIVE');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [productsData, categoriesData, dealersData] = await Promise.all([
        getAllProducts(),
        getAllCategories(),
        getAllDealers(),
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
      setDealers(dealersData);
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể tải dữ liệu sản phẩm',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getFilteredProducts = () => {
    return products.filter(product => {
      // Search query
      if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      // Category filter
      if (selectedCategory !== 'ALL' && product.categoryId.toString() !== selectedCategory) {
        return false;
      }

      // Dealer filter - skip for now (dealerId not in ProductRes)
      // if (selectedDealer !== 'ALL' && product.dealerId?.toString() !== selectedDealer) {
      //   return false;
      // }

      // Status filter - only show ACTIVE or TEST_DRIVE
      if (statusFilter === 'ACTIVE' && product.status !== 'ACTIVE') {
        return false;
      }
      if (statusFilter === 'TEST_DRIVE' && product.status !== 'TEST_DRIVE') {
        return false;
      }
      if (statusFilter === 'ALL' && !['ACTIVE', 'TEST_DRIVE'].includes(product.status || '')) {
        return false;
      }

      // Price range
      if (priceRange !== 'ALL') {
        const price = product.price || 0;
        switch (priceRange) {
          case 'UNDER_500':
            if (price >= 500000000) return false;
            break;
          case '500_1000':
            if (price < 500000000 || price >= 1000000000) return false;
            break;
          case 'OVER_1000':
            if (price < 1000000000) return false;
            break;
        }
      }

      return true;
    });
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải sản phẩm...</p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['Customer', 'Admin']}>
      <CustomerLayout>
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold">Danh mục xe điện</h1>
            <p className="text-muted-foreground mt-2">
              Khám phá và tìm kiếm xe điện phù hợp với nhu cầu của bạn
            </p>
          </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Bộ lọc
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm xe..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            {/* Category */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Loại xe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tất cả loại</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id.toString()}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Price Range */}
            <Select value={priceRange} onValueChange={setPriceRange}>
              <SelectTrigger>
                <SelectValue placeholder="Giá" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tất cả giá</SelectItem>
                <SelectItem value="UNDER_500">Dưới 500 triệu</SelectItem>
                <SelectItem value="500_1000">500 triệu - 1 tỷ</SelectItem>
                <SelectItem value="OVER_1000">Trên 1 tỷ</SelectItem>
              </SelectContent>
            </Select>

            {/* Dealer */}
            <Select value={selectedDealer} onValueChange={setSelectedDealer}>
              <SelectTrigger>
                <SelectValue placeholder="Đại lý" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tất cả đại lý</SelectItem>
                {dealers.map((dealer) => (
                  <SelectItem key={dealer.id} value={dealer.id.toString()}>
                    {dealer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status Filter */}
          <div className="flex gap-2 mt-4">
            <Button
              variant={statusFilter === 'ALL' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('ALL')}
            >
              Tất cả
            </Button>
            <Button
              variant={statusFilter === 'ACTIVE' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('ACTIVE')}
            >
              Còn hàng
            </Button>
            <Button
              variant={statusFilter === 'TEST_DRIVE' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('TEST_DRIVE')}
            >
              Có lái thử
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        Tìm thấy {filteredProducts.length} sản phẩm
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Không tìm thấy sản phẩm phù hợp</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product) => {
            // const dealer = dealers.find(d => d.id === product.dealerId);
            
            return (
              <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                {/* Product Image */}
                <div className="relative h-48 bg-gray-100 dark:bg-gray-800">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder-car.png';
                      }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Car className="h-16 w-16 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    {getStatusBadge(product.status)}
                  </div>
                </div>

                <CardHeader>
                  <CardTitle className="text-lg">{product.name}</CardTitle>
                  <CardDescription className="flex items-center gap-1">
                    {product.color && <span>Màu: {product.color}</span>}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-3">
                  {/* Specs */}
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {product.battery && (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Battery className="h-3 w-3" />
                        <span>{product.battery}</span>
                      </div>
                    )}
                    {product.range && (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Zap className="h-3 w-3" />
                        <span>{product.range} km</span>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  {product.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {product.description}
                    </p>
                  )}

                  {/* Price */}
                  <div className="pt-2 border-t">
                    <p className="text-2xl font-bold text-primary">
                      {formatPrice(product.price)}
                    </p>
                  </div>
                </CardContent>

                <CardFooter className="gap-2">
                  {product.status === 'TEST_DRIVE' && (
                    <Link href="/dashboard/customer/test-drive" className="flex-1">
                      <Button variant="outline" className="w-full" size="sm">
                        <Calendar className="h-4 w-4 mr-1" />
                        Lái thử
                      </Button>
                    </Link>
                  )}
                  <Link href={`/dashboard/customer/order?productId=${product.id}`} className="flex-1">
                    <Button className="w-full" size="sm">
                      <ShoppingCart className="h-4 w-4 mr-1" />
                      Đặt xe
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            );
          })}
        </div>
        )}
        </div>
      </CustomerLayout>
    </ProtectedRoute>
  );
}
