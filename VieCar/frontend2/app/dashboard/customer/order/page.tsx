'use client';

import { useEffect, useState } from 'react';
import { ProtectedRoute } from '@/components/auth-guards';
import CustomerLayout from '@/components/layout/customer-layout';
import { useAuth } from '@/contexts/AuthContext';
import { useSearchParams, useRouter } from 'next/navigation';
import { getAllProducts, Product, getProductById } from '@/lib/productApi';
import { getAllDealers, Dealer } from '@/lib/dealerApi';
import { createOrder } from '@/lib/orderApi';
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Car, MapPin, ShoppingCart, Check } from 'lucide-react';
import Link from 'next/link';

export default function OrderPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const productIdParam = searchParams.get('productId');

  const [products, setProducts] = useState<Product[]>([]);
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  
  // Form state
  const [selectedProduct, setSelectedProduct] = useState<string>(productIdParam || '');
  const [selectedDealer, setSelectedDealer] = useState<string>('');
  const [notes, setNotes] = useState('');

  // Selected product details
  const [productDetails, setProductDetails] = useState<Product | null>(null);

  useEffect(() => {
    loadData();
    // Tự động set dealerId từ user nếu user có dealerId
    if (user?.dealerId) {
      setSelectedDealer(user.dealerId.toString());
    }
  }, [user]);

  useEffect(() => {
    if (selectedProduct) {
      loadProductDetails(parseInt(selectedProduct));
    } else {
      setProductDetails(null);
    }
  }, [selectedProduct]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [productsData, dealersData] = await Promise.all([
        getAllProducts(),
        getAllDealers(),
      ]);
      
      // Filter only active products
      const activeProducts = productsData.filter(p => p.status === 'ACTIVE');
      setProducts(activeProducts);
      setDealers(dealersData);
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể tải dữ liệu',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadProductDetails = async (productId: number) => {
    try {
      const product = await getProductById(productId);
      setProductDetails(product);
    } catch (error) {
      console.error('Failed to load product details', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.id) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng đăng nhập để đặt hàng',
        variant: 'destructive',
      });
      return;
    }

    if (!selectedProduct || !selectedDealer) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng chọn xe và đại lý',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSubmitting(true);

      await createOrder({
        userId: parseInt(user.id),
        productId: parseInt(selectedProduct),
        dealerId: parseInt(selectedDealer),
        quantity: 1, // Mỗi đơn hàng chỉ 1 xe
        notes,
      });

      setOrderSuccess(true);
      toast({
        title: 'Đặt hàng thành công! 🎉',
        description: 'Đơn hàng đã được gửi đến đại lý. Vui lòng chờ duyệt.',
      });
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể tạo đơn hàng',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formatPrice = (price: number | undefined) => {
    if (!price) return 'Liên hệ';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const getTotalPrice = () => {
    if (!productDetails?.price) return 0;
    return productDetails.price; // Mỗi đơn chỉ 1 xe nên không cần nhân
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['Customer', 'Admin']}>
        <CustomerLayout>
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-4 text-gray-600">Đang tải...</p>
            </div>
          </div>
        </CustomerLayout>
      </ProtectedRoute>
    );
  }

  if (orderSuccess) {
    return (
      <ProtectedRoute allowedRoles={['Customer', 'Admin']}>
        <CustomerLayout>
          <div className="flex items-center justify-center min-h-[80vh] p-6">
            <Card className="max-w-2xl w-full shadow-2xl border-0 overflow-hidden">
              {/* Success Header */}
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-8 text-center">
                <div className="relative inline-block">
                  <div className="absolute inset-0 bg-white/30 blur-xl animate-pulse"></div>
                  <div className="relative mx-auto w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-2xl">
                    <Check className="h-10 w-10 text-green-600 animate-bounce" />
                  </div>
                </div>
                <h2 className="text-3xl font-bold text-white mt-4">
                  🎉 Đặt hàng thành công!
                </h2>
                <p className="text-green-50 mt-2 text-lg">
                  Mã đơn hàng: #{Math.floor(Math.random() * 1000000)}
                </p>
              </div>

              <CardContent className="p-8 space-y-6">
                {/* Order Info - Quy trình mới */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                  <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <span className="text-2xl">✅</span>
                    Đơn hàng đã được gửi đến đại lý
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-white text-xs font-bold">1</span>
                      <p className="text-muted-foreground">
                        <strong className="text-yellow-600">Chờ đại lý duyệt đơn</strong> (trong vòng 24 giờ)
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">2</span>
                      <p className="text-muted-foreground">
                        Sau khi duyệt, bạn cần <strong className="text-blue-600">đặt cọc 30%</strong> giá trị xe
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">3</span>
                      <p className="text-muted-foreground">Thanh toán phần còn lại và nhận xe</p>
                    </div>
                  </div>
                  
                  {/* Deposit info */}
                  <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950 rounded-lg border border-amber-200 dark:border-amber-800">
                    <p className="text-xs text-amber-900 dark:text-amber-100 flex items-center gap-2">
                      <span className="text-base">💰</span>
                      <span>Số tiền cọc dự kiến: <strong>{productDetails ? formatPrice(getTotalPrice() * 0.3) : 'Đang tính...'}</strong> (30% giá xe)</span>
                    </p>
                  </div>
                </div>

                {/* Next Steps */}
                <div className="space-y-3">
                  <h3 className="font-semibold">Bạn có thể:</h3>
                  
                  {/* Xem đơn hàng - Primary action */}
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-xl p-4 cursor-pointer transition-all shadow-lg hover:shadow-xl"
                       onClick={() => router.push('/dashboard/customer/orders')}>
                    <div className="flex items-center justify-between text-white">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                          <ShoppingCart className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-semibold">Theo dõi trạng thái đơn hàng</p>
                          <p className="text-sm text-blue-100">Xem tiến độ duyệt & thanh toán</p>
                        </div>
                      </div>
                      <span className="text-2xl">→</span>
                    </div>
                  </div>



                  {/* Tiếp tục mua */}
                  <div className="border-2 border-gray-200 dark:border-gray-800 hover:border-blue-400 dark:hover:border-blue-600 rounded-xl p-4 cursor-pointer transition-all"
                       onClick={() => router.push('/dashboard/customer/catalog')}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                          <Car className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                        </div>
                        <div>
                          <p className="font-semibold">Tiếp tục xem xe khác</p>
                          <p className="text-sm text-muted-foreground">Khám phá thêm sản phẩm</p>
                        </div>
                      </div>
                      <span className="text-2xl text-gray-400">→</span>
                    </div>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="bg-amber-50 dark:bg-amber-950 rounded-xl p-4 border border-amber-200 dark:border-amber-800">
                  <p className="text-sm text-amber-900 dark:text-amber-100 flex items-center gap-2">
                    <span className="text-xl">📞</span>
                    <span>Cần hỗ trợ? Liên hệ: <strong>1900-xxxx</strong> hoặc <strong>support@viecar.com</strong></span>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </CustomerLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['Customer', 'Admin']}>
      <CustomerLayout>
        <div className="max-w-7xl mx-auto p-6 space-y-8">
          {/* Header với gradient background */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-8 text-white shadow-xl">
            <div className="absolute top-0 right-0 -mr-20 -mt-20 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <ShoppingCart className="h-8 w-8" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold">Đặt mua xe điện</h1>
                  <p className="text-blue-100 mt-1 text-lg">
                    Sở hữu xe điện trong tầm tay - Nhanh chóng & An toàn
                  </p>
                </div>
              </div>
              
              {/* Progress steps */}
              <div className="flex items-center gap-4 mt-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-white text-blue-600 flex items-center justify-center font-semibold">1</div>
                  <span className="text-sm font-medium">Chọn xe</span>
                </div>
                <div className="h-px flex-1 bg-white/30"></div>
                <div className="flex items-center gap-2 opacity-50">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-semibold">2</div>
                  <span className="text-sm font-medium">Xác nhận</span>
                </div>
                <div className="h-px flex-1 bg-white/30"></div>
                <div className="flex items-center gap-2 opacity-50">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-semibold">3</div>
                  <span className="text-sm font-medium">Thanh toán</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Order Form */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="shadow-lg border-0">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
                  <CardTitle className="flex items-center gap-2">
                    <Car className="h-5 w-5 text-blue-600" />
                    Thông tin đơn hàng
                  </CardTitle>
                  <CardDescription>
                    Hoàn tất thông tin để đặt mua xe điện của bạn
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <form onSubmit={handleSubmit} className="space-y-6">
                {/* Product Selection */}
                <div className="space-y-3">
                  <label className="text-sm font-semibold flex items-center gap-2">
                    <Car className="h-4 w-4 text-blue-600" />
                    Xe đã chọn *
                  </label>
                  {productIdParam && productDetails ? (
                    // Hiển thị xe đã chọn từ catalog với design đẹp hơn
                    <div className="relative group overflow-hidden rounded-xl border-2 border-blue-100 dark:border-blue-900 bg-gradient-to-br from-blue-50 to-white dark:from-blue-950 dark:to-gray-900 p-4 transition-all hover:shadow-lg hover:border-blue-300">
                      <div className="flex items-center gap-4">
                        {productDetails.image ? (
                          <div className="relative">
                            <img 
                              src={productDetails.image} 
                              alt={productDetails.name}
                              className="w-24 h-24 object-cover rounded-lg shadow-md"
                            />
                            <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                              ✓ Đã chọn
                            </div>
                          </div>
                        ) : (
                          <div className="w-24 h-24 flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-lg shadow-md">
                            <Car className="h-12 w-12 text-gray-400" />
                          </div>
                        )}
                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-gray-900 dark:text-white">{productDetails.name}</h3>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-md text-xs font-medium">
                              🎨 {productDetails.color || 'N/A'}
                            </span>
                            <span className="text-sm text-muted-foreground">|</span>
                            <span className="font-semibold text-blue-600 dark:text-blue-400">
                              {formatPrice(productDetails.price)}
                            </span>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="hover:bg-blue-50 dark:hover:bg-blue-900"
                          onClick={() => router.push('/dashboard/customer/catalog')}
                        >
                          Đổi xe khác
                        </Button>
                      </div>
                    </div>
                  ) : (
                    // Chọn xe thủ công (khi truy cập trực tiếp trang order)
                    <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn xe muốn mua" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.length === 0 ? (
                          <div className="p-2 text-sm text-muted-foreground">
                            Không có xe nào khả dụng
                          </div>
                        ) : (
                          products.map((product) => (
                            <SelectItem key={product.id} value={product.id.toString()}>
                              {product.name} - {product.color || 'N/A'} - {formatPrice(product.price)}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                {/* Dealer Selection */}
                <div className="space-y-3">
                  <label className="text-sm font-semibold flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-blue-600" />
                    Đại lý phụ trách *
                  </label>
                  {user?.dealerId && selectedDealer ? (
                    // Hiển thị dealer từ customer profile với design đẹp
                    <div className="relative overflow-hidden rounded-xl border-2 border-green-100 dark:border-green-900 bg-gradient-to-br from-green-50 to-white dark:from-green-950 dark:to-gray-900 p-4">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-green-400 to-green-600 rounded-xl shadow-lg">
                          <MapPin className="h-7 w-7 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-gray-900 dark:text-white">
                              {dealers.find(d => d.id.toString() === selectedDealer)?.name || 'Đang tải...'}
                            </h3>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full text-xs font-medium">
                              ✓ Đại lý của bạn
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            📍 {dealers.find(d => d.id.toString() === selectedDealer)?.address || ''}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Chọn dealer thủ công (nếu customer chưa có dealerId)
                    <Select value={selectedDealer} onValueChange={setSelectedDealer}>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn đại lý gần bạn" />
                      </SelectTrigger>
                      <SelectContent>
                        {dealers.map((dealer) => (
                          <SelectItem key={dealer.id} value={dealer.id.toString()}>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-3 w-3" />
                              {dealer.name} - {dealer.address}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                {/* Notes */}
                <div className="space-y-3">
                  <label className="text-sm font-semibold flex items-center gap-2">
                    📝 Ghi chú (Tùy chọn)
                  </label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="💬 Nhập yêu cầu đặc biệt, thời gian liên hệ mong muốn, hoặc câu hỏi cho đại lý..."
                    rows={4}
                    className="resize-none border-2 focus:border-blue-400 transition-colors"
                  />
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    💡 <span>Đại lý sẽ liên hệ với bạn trong vòng 24 giờ</span>
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-6 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    className="flex-1 h-12 text-base font-medium hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    ← Quay lại
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1 h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all" 
                    disabled={submitting || products.length === 0 || !selectedProduct}
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                        Đang xử lý...
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="h-5 w-5 mr-2" />
                        Xác nhận đặt hàng
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="space-y-6">
          <Card className="sticky top-6 shadow-xl border-0 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4">
              <CardTitle className="text-white flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Tóm tắt đơn hàng
              </CardTitle>
            </div>
            <CardContent className="p-6 space-y-6">
              {productDetails ? (
                <>
                  {/* Product Image */}
                  <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-xl overflow-hidden shadow-lg group">
                    {productDetails.image ? (
                      <img
                        src={productDetails.image}
                        alt={productDetails.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Car className="h-16 w-16 text-gray-400" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute bottom-3 left-3 right-3">
                      <h3 className="font-bold text-white text-lg drop-shadow-lg">{productDetails.name}</h3>
                    </div>
                  </div>

                  {/* Product Specs */}
                  <div className="space-y-3">
                    {productDetails.color && (
                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <span className="text-sm text-muted-foreground flex items-center gap-2">
                          🎨 Màu sắc
                        </span>
                        <span className="font-semibold">{productDetails.color}</span>
                      </div>
                    )}
                    {productDetails.battery && (
                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <span className="text-sm text-muted-foreground flex items-center gap-2">
                          🔋 Pin
                        </span>
                        <span className="font-semibold">{productDetails.battery} kWh</span>
                      </div>
                    )}
                    {productDetails.range && (
                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <span className="text-sm text-muted-foreground flex items-center gap-2">
                          ⚡ Quãng đường
                        </span>
                        <span className="font-semibold">{productDetails.range} km</span>
                      </div>
                    )}
                  </div>

                  {/* Price Breakdown */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 rounded-xl p-5 border-2 border-blue-200 dark:border-blue-800">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-muted-foreground">Giá niêm yết</span>
                      <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                        {formatPrice(productDetails.price)}
                      </span>
                    </div>
                    <div className="h-px bg-gradient-to-r from-transparent via-blue-300 to-transparent mb-3"></div>
                    <div className="flex items-center justify-between">
                      <span className="text-base font-semibold">Tổng thanh toán</span>
                      <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        {formatPrice(productDetails.price)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
                      <span className="inline-block w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                      Mỗi đơn hàng chỉ đặt 1 chiếc xe
                    </p>
                  </div>

                  {/* Info Cards */}
                  <div className="space-y-3">
                    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                          <span className="text-white text-lg">💡</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                            Lưu ý quan trọng
                          </p>
                          <p className="text-xs text-blue-700 dark:text-blue-300">
                            Giá cuối cùng sẽ được xác nhận khi đại lý liên hệ với bạn
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 p-4 rounded-xl border border-green-200 dark:border-green-800">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                          <span className="text-white text-lg">✓</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-green-900 dark:text-green-100 mb-1">
                            Cam kết hỗ trợ
                          </p>
                          <p className="text-xs text-green-700 dark:text-green-300">
                            Đại lý sẽ liên hệ trong 24h và hỗ trợ toàn bộ thủ tục
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <div className="relative inline-block mb-6">
                    <div className="absolute inset-0 bg-blue-400 blur-2xl opacity-20 animate-pulse"></div>
                    <div className="relative w-24 h-24 mx-auto bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 rounded-full flex items-center justify-center">
                      <Car className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Chưa chọn xe
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Vui lòng chọn xe để xem tóm tắt đơn hàng
                  </p>
                  <Link href="/dashboard/customer/catalog">
                    <Button variant="outline" size="sm">
                      <Car className="h-4 w-4 mr-2" />
                      Xem danh mục xe
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
        </div>
      </CustomerLayout>
    </ProtectedRoute>
  );
}
