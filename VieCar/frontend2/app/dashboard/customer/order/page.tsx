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
  const [quantity, setQuantity] = useState<number>(1);
  const [notes, setNotes] = useState('');

  // Selected product details
  const [productDetails, setProductDetails] = useState<Product | null>(null);

  useEffect(() => {
    loadData();
  }, []);

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
        quantity,
        notes,
      });

      setOrderSuccess(true);
      toast({
        title: 'Thành công',
        description: 'Đơn hàng đã được tạo thành công!',
      });

      // Reset form after 2 seconds and redirect
      setTimeout(() => {
        router.push('/dashboard/customer/orders');
      }, 2000);
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
    return productDetails.price * quantity;
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
          <div className="flex items-center justify-center h-96">
            <Card className="max-w-md">
              <CardContent className="pt-6 text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold">Đặt hàng thành công!</h2>
                <p className="text-muted-foreground">
                  Đơn hàng của bạn đã được ghi nhận. Chúng tôi sẽ liên hệ với bạn sớm.
                </p>
                <p className="text-sm text-muted-foreground">
                  Đang chuyển hướng đến trang đơn hàng...
                </p>
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
        <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Đặt hàng</h1>
        <p className="text-muted-foreground mt-2">
          Hoàn tất thông tin để đặt mua xe điện
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Order Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin đơn hàng</CardTitle>
              <CardDescription>
                Điền đầy đủ thông tin để hoàn tất đơn hàng
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Product Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Chọn xe *</label>
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
                </div>

                {/* Dealer Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Chọn đại lý *</label>
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
                </div>

                {/* Quantity */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Số lượng *</label>
                  <Input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    required
                  />
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Ghi chú</label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Thêm ghi chú hoặc yêu cầu đặc biệt..."
                    rows={4}
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    className="flex-1"
                  >
                    Quay lại
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1" 
                    disabled={submitting || products.length === 0 || !selectedProduct}
                  >
                    {submitting ? 'Đang xử lý...' : 'Đặt hàng'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div>
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Tóm tắt đơn hàng</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {productDetails ? (
                <>
                  {/* Product Image */}
                  <div className="relative h-40 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                    {productDetails.image ? (
                      <img
                        src={productDetails.image}
                        alt={productDetails.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Car className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="space-y-2">
                    <h3 className="font-semibold">{productDetails.name}</h3>
                    {productDetails.color && (
                      <p className="text-sm text-muted-foreground">Màu: {productDetails.color}</p>
                    )}
                  </div>

                  {/* Price Breakdown */}
                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Đơn giá:</span>
                      <span>{formatPrice(productDetails.price)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Số lượng:</span>
                      <span>{quantity}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg pt-2 border-t">
                      <span>Tổng cộng:</span>
                      <span className="text-primary">{formatPrice(getTotalPrice())}</span>
                    </div>
                  </div>

                  {/* Note */}
                  <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg text-sm">
                    <p className="text-blue-900 dark:text-blue-100">
                      💡 Giá cuối cùng sẽ được xác nhận lại khi đại lý liên hệ với bạn
                    </p>
                  </div>
                </>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <Car className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                  <p>Chọn xe để xem chi tiết</p>
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
