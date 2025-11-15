"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { ProtectedRoute } from "@/components/auth-guards";
import CustomerLayout from "@/components/layout/customer-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Eye, Truck, Package, CheckCircle, CreditCard, Loader2, AlertCircle, MapPin, Calendar, Car, Battery, Zap, FileText, Clock, Wallet, Store } from "lucide-react";
import { getOrdersByUserId, getOrderById, OrderRes } from "@/lib/orderApi";
import { vnpayApi } from "@/lib/vnpayApi";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { getAllDealers, Dealer } from "@/lib/dealerApi";

export default function CustomerOrdersPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [orders, setOrders] = useState<OrderRes[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<OrderRes | null>(null);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [orderDetail, setOrderDetail] = useState<OrderRes | null>(null);
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'vnpay' | null>(null);

  // Fetch orders on mount and when refresh param changes
  useEffect(() => {
    if (user?.id) {
      fetchOrders();
    }
  }, [user, searchParams]);

  // Kiểm tra xem order có thể thanh toán không
  const canPay = (status: string) => {
    if (!status) return false;
    
    const normalizedStatus = status.trim();
    
    // Không cho phép thanh toán nếu đơn hàng đã giao hoặc đã thanh toán
    if (normalizedStatus === 'Đã giao' || 
        normalizedStatus === 'DELIVERED' ||
        normalizedStatus === 'Đã đặt cọc' ||
        normalizedStatus === 'DEPOSIT_PAID' ||
        normalizedStatus === 'Đã yêu cầu đại lý' ||
        normalizedStatus === 'Đang chuẩn bị xe' ||
        normalizedStatus === 'Sẵn sàng giao xe') {
      return false;
    }
    
    const isAwaitingDeposit = (
      normalizedStatus === 'Chưa đặt cọc' || 
      normalizedStatus === 'AWAITING_DEPOSIT' ||
      (normalizedStatus.includes('đặt cọc') && !normalizedStatus.includes('xử lý')) ||
      /Chưa.*đặt.*cọc/i.test(normalizedStatus)
    );
    
    return isAwaitingDeposit;
  };

  const fetchOrders = async () => {
    if (!user?.id) return;
    
    try {
      setIsLoading(true);
      const [fetchedOrders, fetchedDealers] = await Promise.all([
        getOrdersByUserId(parseInt(user.id)),
        getAllDealers()
      ]);
      console.log('📦 Fetched orders:', fetchedOrders);
      console.log('📅 Sample order date:', fetchedOrders[0]?.orderDate);
      setOrders(fetchedOrders);
      setDealers(fetchedDealers);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách đơn hàng",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Lấy button text dựa trên status
  const getPaymentButtonText = (status: string) => {
    if (status === 'Chưa đặt cọc' || status === 'AWAITING_DEPOSIT') {
      return 'Đặt cọc 30%';
    }
    return 'Thanh toán';
  };

  // Xử lý click nút thanh toán
  const handlePayment = (order: OrderRes) => {
    console.log('💳 Opening payment dialog for order:', order);
    setSelectedOrder(order);
    setPaymentMethod(null); // Reset payment method
    setIsPaymentDialogOpen(true);
    
    toast({
      title: "Chuẩn bị thanh toán",
      description: `Đang chuẩn bị thanh toán đặt cọc cho đơn hàng #${order.orderId}`,
    });
  };

  // Xem chi tiết đơn hàng
  const handleViewDetail = async (orderId: number) => {
    try {
      const detail = await getOrderById(orderId);
      setOrderDetail(detail);
      setIsDetailDialogOpen(true);
    } catch (error) {
      console.error('Error fetching order detail:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải chi tiết đơn hàng",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  // Get dealer name by ID
  const getDealerName = (dealerId: number) => {
    const dealer = dealers.find(d => d.id === dealerId);
    return dealer?.name || `Đại lý #${dealerId}`;
  };

  // Format date to Vietnamese format with time
  const formatDate = (dateString: string | undefined, showTime: boolean = false) => {
    if (!dateString) return 'Chưa xác định';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Chưa xác định';
      
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      };
      
      if (showTime) {
        options.hour = '2-digit';
        options.minute = '2-digit';
      }
      
      return date.toLocaleDateString('vi-VN', options);
    } catch (error) {
      return 'Chưa xác định';
    }
  };

  // Format date short (for table)
  const formatDateShort = (dateString: string | undefined, fallbackText: string = 'Mới đặt') => {
    if (!dateString) return fallbackText;
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return fallbackText;
      
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }) + ' ' + date.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', dateString, error);
      return fallbackText;
    }
  };

  // Xác nhận thanh toán tiền mặt tại cửa hàng
  const confirmCashPayment = async () => {
    if (!selectedOrder) return;

    try {
      setIsProcessingPayment(true);
      
      toast({
        title: "Đặt cọc tiền mặt thành công!",
        description: "Vui lòng đến đại lý trong vòng 24 giờ để hoàn tất đặt cọc.",
      });
      
      // Close dialog after success
      setTimeout(() => {
        setIsPaymentDialogOpen(false);
        setIsProcessingPayment(false);
        setPaymentMethod(null);
      }, 2000);
      
    } catch (error: any) {
      console.error('❌ Error processing cash payment:', error);
      toast({
        title: "Lỗi",
        description: "Không thể xác nhận thanh toán tiền mặt. Vui lòng thử lại.",
        variant: "destructive",
      });
      setIsProcessingPayment(false);
    }
  };

  // Xác nhận thanh toán và chuyển đến VNPay
  const confirmPayment = async () => {
    if (!selectedOrder) return;

    try {
      setIsProcessingPayment(true);
      
      console.log('🏦 Creating VNPay payment for order:', selectedOrder.orderId);
      
      // Gọi API tạo payment URL
      const response = await vnpayApi.createPayment(selectedOrder.orderId.toString());
      
      console.log('✅ VNPay URL created:', response.url);
      console.log('💰 Deposit amount (30%):', response.amount, 'VND');
      
      toast({
        title: "Chuyển đến VNPay",
        description: "Đang chuyển hướng đến cổng thanh toán VNPay...",
      });
      
      // Redirect đến VNPay sau 1 giây để user thấy toast
      setTimeout(() => {
        window.location.href = response.url;
      }, 1000);
      
    } catch (error: any) {
      console.error('❌ Error creating payment:', error);
      toast({
        title: "Lỗi thanh toán",
        description: error.response?.data?.message || "Không thể tạo thanh toán. Vui lòng thử lại.",
        variant: "destructive",
      });
      setIsProcessingPayment(false);
      setIsPaymentDialogOpen(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Đã xác nhận':
        return <CheckCircle className="h-4 w-4" />;
      case 'Đang vận chuyển':
        return <Truck className="h-4 w-4" />;
      case 'Đã giao hàng':
        return <Package className="h-4 w-4" />;
      default:
        return <CheckCircle className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", className?: string, label: string, icon?: JSX.Element }> = {
      // Tiếng Việt status
      'Chờ xử lý': { variant: 'outline', className: 'bg-gradient-to-r from-yellow-50 to-yellow-100 text-yellow-700 border-yellow-300 shadow-sm', label: 'Chờ xử lý', icon: <AlertCircle className="h-3 w-3" /> },
      'Chưa đặt cọc': { variant: 'default', className: 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-md', label: 'Chưa đặt cọc 30%', icon: <CreditCard className="h-3 w-3" /> },
      'Đã đặt cọc': { variant: 'default', className: 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-md', label: 'Đã đặt cọc 30%', icon: <CheckCircle className="h-3 w-3" /> },
      'Đang chuẩn bị xe': { variant: 'default', className: 'bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 shadow-md', label: 'Đang chuẩn bị xe', icon: <Truck className="h-3 w-3" /> },
      'Đã yêu cầu đại lý': { variant: 'default', className: 'bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 shadow-md', label: 'Đang chuẩn bị xe', icon: <Truck className="h-3 w-3" /> },
      'Sẵn sàng giao xe': { variant: 'default', className: 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 shadow-md animate-pulse', label: 'Sẵn sàng giao xe', icon: <Car className="h-3 w-3" /> },
      'Đã duyệt': { variant: 'default', className: 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-md', label: 'Đã duyệt', icon: <CheckCircle className="h-3 w-3" /> },
      'Đã từ chối': { variant: 'destructive', className: 'shadow-md', label: 'Đã từ chối', icon: <AlertCircle className="h-3 w-3" /> },
      'Đã giao': { variant: 'default', className: 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-md', label: 'Đã giao', icon: <Package className="h-3 w-3" /> },
      'Đã hủy': { variant: 'outline', className: 'shadow-sm', label: 'Đã hủy' },
      // English status (backward compatibility)
      'PENDING_APPROVAL': { variant: 'outline', className: 'bg-gradient-to-r from-yellow-50 to-yellow-100 text-yellow-700 border-yellow-300 shadow-sm', label: 'Chờ xử lý' },
      'AWAITING_DEPOSIT': { variant: 'default', className: 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-md', label: 'Chưa đặt cọc 30%' },
      'DEPOSIT_PAID': { variant: 'default', className: 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-md', label: 'Đã đặt cọc 30%' },
      'APPROVED': { variant: 'default', className: 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-md', label: 'Đã duyệt' },
      'REJECTED': { variant: 'destructive', className: 'shadow-md', label: 'Đã từ chối' },
      'DELIVERED': { variant: 'default', className: 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-md', label: 'Đã giao' },
      'CANCELLED': { variant: 'outline', className: 'shadow-sm', label: 'Đã hủy' },
      'Processing': { variant: 'outline', className: 'bg-gradient-to-r from-yellow-50 to-yellow-100 text-yellow-700 border-yellow-300 shadow-sm', label: 'Đang xử lý' },
    };

    const statusInfo = statusMap[status] || { variant: 'outline' as const, label: status };

    return (
      <Badge variant={statusInfo.variant} className={`${statusInfo.className} transition-all duration-300`}>
        <div className="flex items-center gap-1">
          {statusInfo.icon}
          <span>{statusInfo.label}</span>
        </div>
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <ProtectedRoute allowedRoles={['Customer']}>
        <CustomerLayout>
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </CustomerLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['Customer']}>
      <CustomerLayout>
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Đơn hàng của tôi</h1>
            <p className="text-muted-foreground mt-2">
              Theo dõi trạng thái và lịch sử đơn hàng của bạn từ tất cả các đại lý
            </p>
          </div>

          {/* Order Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card className="hover:shadow-lg transition-shadow duration-300 border-l-4 border-l-blue-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tổng đơn hàng</CardTitle>
                <Package className="h-5 w-5 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">{orders.length}</div>
                <p className="text-xs text-muted-foreground mt-1">Tất cả thời gian</p>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-shadow duration-300 border-l-4 border-l-orange-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Chờ xử lý</CardTitle>
                <AlertCircle className="h-5 w-5 text-orange-500 animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-orange-400 bg-clip-text text-transparent">
                  {orders.filter(o => 
                    o.status === "Chờ xử lý" || 
                    o.status === "Chưa đặt cọc" || 
                    o.status === "PENDING_APPROVAL" || 
                    o.status === "AWAITING_DEPOSIT"
                  ).length}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Đơn hàng</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-300 border-l-4 border-l-green-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Đã hoàn thành</CardTitle>
                <CheckCircle className="h-5 w-5 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-400 bg-clip-text text-transparent">
                  {orders.filter(o => 
                    o.status === "Đã giao" || 
                    o.status === "Đã duyệt" || 
                    o.status === "DELIVERED" || 
                    o.status === "APPROVED"
                  ).length}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Đơn hàng</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-300 border-l-4 border-l-purple-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sẵn sàng nhận</CardTitle>
                <Car className="h-5 w-5 text-purple-500 animate-bounce" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent">
                  {orders.filter(o => o.status === "Sẵn sàng giao xe").length}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Xe sẵn sàng</p>
              </CardContent>
            </Card>
          </div>

              {/* Orders Table */}
              <Card>
            <CardHeader>
              <CardTitle>Lịch sử đơn hàng</CardTitle>
              <CardDescription>
                Danh sách tất cả đơn hàng của bạn
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Mã đơn hàng</TableHead>
                    <TableHead className="font-semibold">Đại lý</TableHead>
                    <TableHead className="font-semibold">Sản phẩm</TableHead>
                    <TableHead className="font-semibold text-right">Tổng tiền</TableHead>
                    <TableHead className="font-semibold">Trạng thái</TableHead>
                    <TableHead className="font-semibold">Ngày đặt</TableHead>
                    <TableHead className="font-semibold">Ngày giao dự kiến</TableHead>
                    <TableHead className="font-semibold text-center">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order, index) => (
                    <TableRow 
                      key={order.orderId}
                      className="hover:bg-muted/50 transition-colors duration-200"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <TableCell className="font-bold text-primary">#{order.orderId}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-blue-100 dark:bg-blue-900 rounded-full">
                            <MapPin className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <span className="text-sm font-medium">{getDealerName(order.dealerId)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Car className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{order.productName}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="font-bold text-lg bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                          {new Intl.NumberFormat('vi-VN', {
                            style: 'currency',
                            currency: 'VND'
                          }).format(order.totalPrice)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(order.status)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className={!order.orderDate ? 'text-orange-600 font-medium' : 'font-medium'}>
                            {formatDateShort(order.orderDate)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {order.deliveryDate ? (
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-green-100 dark:bg-green-900 rounded-full">
                              <Truck className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                            </div>
                            <div className="text-sm">
                              <div className="font-semibold text-green-700 dark:text-green-400">
                                {formatDateShort(order.deliveryDate, 'Chưa xác định')}
                              </div>
                              {order.status === 'Sẵn sàng giao xe' && (
                                <div className="text-xs text-green-600 dark:text-green-500 font-medium animate-pulse">
                                  Sẵn sàng nhận!
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span className="text-sm italic">Chưa xác định</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2 justify-center">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            title="Xem chi tiết"
                            onClick={() => handleViewDetail(order.orderId)}
                            className="hover:bg-primary hover:text-primary-foreground transition-colors"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {canPay(order.status) && (
                            <Button 
                              variant="default" 
                              size="sm"
                              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 animate-pulse"
                              onClick={() => handlePayment(order)}
                              title={`Thanh toán đặt cọc 30% (${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.totalPrice * 0.3)})`}
                            >
                              <CreditCard className="h-4 w-4 mr-1" />
                              {getPaymentButtonText(order.status)}
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {isLoading && (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              )}

              {!isLoading && orders.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  Bạn chưa có đơn hàng nào
                </div>
              )}
            </CardContent>
              </Card>

              {/* Payment Confirmation Dialog */}
              <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <div className="rounded-full bg-orange-100 dark:bg-orange-900 p-2">
                  <CreditCard className="h-5 w-5 text-orange-600" />
                </div>
                Xác nhận đặt cọc 30%
              </DialogTitle>
              <DialogDescription className="text-base">
                Chọn phương thức thanh toán để đặt cọc cho đơn hàng của bạn
              </DialogDescription>
            </DialogHeader>
            
            {selectedOrder && (
              <div className="space-y-5">
                {/* Order Summary */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-xl p-5 space-y-3 border border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Mã đơn hàng:</span>
                    <span className="font-semibold text-base">#{selectedOrder.orderId}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Sản phẩm:</span>
                    <span className="font-medium">{selectedOrder.productName}</span>
                  </div>
                  <div className="border-t border-gray-300 dark:border-gray-600 pt-3 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Giá xe:</span>
                      <span className="font-medium">
                        {new Intl.NumberFormat('vi-VN', {
                          style: 'currency',
                          currency: 'VND'
                        }).format(selectedOrder.totalPrice)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center bg-orange-50 dark:bg-orange-950 p-3 rounded-lg border border-orange-200 dark:border-orange-800">
                      <span className="text-sm font-semibold text-orange-700 dark:text-orange-300">Số tiền cọc (30%):</span>
                      <span className="font-bold text-xl text-orange-600 dark:text-orange-400">
                        {new Intl.NumberFormat('vi-VN', {
                          style: 'currency',
                          currency: 'VND'
                        }).format(selectedOrder.totalPrice * 0.3)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Payment Method Selection */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <Wallet className="h-4 w-4" />
                    Chọn phương thức thanh toán
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Cash Payment Option */}
                    <button
                      onClick={() => setPaymentMethod('cash')}
                      className={`relative overflow-hidden rounded-xl p-5 border-2 transition-all duration-300 text-left group hover:shadow-lg ${
                        paymentMethod === 'cash'
                          ? 'border-green-500 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 shadow-lg scale-105'
                          : 'border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-700 bg-white dark:bg-gray-900'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                          paymentMethod === 'cash'
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 group-hover:bg-green-100 group-hover:text-green-600'
                        }`}>
                          <Store className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                          <h4 className={`font-bold mb-1 transition-colors ${
                            paymentMethod === 'cash' ? 'text-green-700 dark:text-green-300' : 'text-gray-900 dark:text-white'
                          }`}>
                            Tiền mặt tại cửa hàng
                          </h4>
                          <p className="text-sm text-muted-foreground mb-3">
                            Đến đại lý để đặt cọc trực tiếp
                          </p>
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2 text-xs">
                              <span className="text-green-600 dark:text-green-400">✓</span>
                              <span className="text-gray-600 dark:text-gray-400">Thanh toán trực tiếp tại cửa hàng</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                              <span className="text-green-600 dark:text-green-400">✓</span>
                              <span className="text-gray-600 dark:text-gray-400">Xem xe và tư vấn chi tiết</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                              <span className="text-green-600 dark:text-green-400">✓</span>
                              <span className="text-gray-600 dark:text-gray-400">Nhận hóa đơn ngay lập tức</span>
                            </div>
                          </div>
                        </div>
                        {paymentMethod === 'cash' && (
                          <div className="absolute top-3 right-3">
                            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                              <CheckCircle className="h-4 w-4 text-white" />
                            </div>
                          </div>
                        )}
                      </div>
                    </button>

                    {/* VNPay Payment Option */}
                    <button
                      onClick={() => setPaymentMethod('vnpay')}
                      className={`relative overflow-hidden rounded-xl p-5 border-2 transition-all duration-300 text-left group hover:shadow-lg ${
                        paymentMethod === 'vnpay'
                          ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 shadow-lg scale-105'
                          : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 bg-white dark:bg-gray-900'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                          paymentMethod === 'vnpay'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 group-hover:bg-blue-100 group-hover:text-blue-600'
                        }`}>
                          <CreditCard className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                          <h4 className={`font-bold mb-1 transition-colors ${
                            paymentMethod === 'vnpay' ? 'text-blue-700 dark:text-blue-300' : 'text-gray-900 dark:text-white'
                          }`}>
                            Thanh toán VNPay
                          </h4>
                          <p className="text-sm text-muted-foreground mb-3">
                            Thanh toán online an toàn & nhanh chóng
                          </p>
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2 text-xs">
                              <span className="text-blue-600 dark:text-blue-400">✓</span>
                              <span className="text-gray-600 dark:text-gray-400">Thanh toán qua ATM/Visa/Master</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                              <span className="text-blue-600 dark:text-blue-400">✓</span>
                              <span className="text-gray-600 dark:text-gray-400">Bảo mật 3D Secure</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                              <span className="text-blue-600 dark:text-blue-400">✓</span>
                              <span className="text-gray-600 dark:text-gray-400">Xác nhận tức thì, không cần đến cửa hàng</span>
                            </div>
                          </div>
                        </div>
                        {paymentMethod === 'vnpay' && (
                          <div className="absolute top-3 right-3">
                            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                              <CheckCircle className="h-4 w-4 text-white" />
                            </div>
                          </div>
                        )}
                      </div>
                    </button>
                  </div>
                </div>

                {/* Payment Instructions */}
                {paymentMethod === 'cash' && (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 rounded-xl p-4 border border-green-200 dark:border-green-800">
                    <p className="text-sm text-green-900 dark:text-green-100 font-semibold mb-2 flex items-center gap-2">
                      <Store className="h-4 w-4" />
                      Hướng dẫn thanh toán tiền mặt
                    </p>
                    <ul className="text-sm text-green-800 dark:text-green-200 space-y-2">
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 dark:text-green-400 flex-shrink-0">1.</span>
                        <span>Đến đại lý <strong>{getDealerName(selectedOrder.dealerId)}</strong> trong vòng 24 giờ</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 dark:text-green-400 flex-shrink-0">2.</span>
                        <span>Xuất trình mã đơn hàng <strong>#{selectedOrder.orderId}</strong></span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 dark:text-green-400 flex-shrink-0">3.</span>
                        <span>Thanh toán <strong>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedOrder.totalPrice * 0.3)}</strong> và nhận biên lai</span>
                      </li>
                    </ul>
                  </div>
                )}

                {paymentMethod === 'vnpay' && (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                    <p className="text-sm text-blue-900 dark:text-blue-100 font-semibold mb-2 flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Thông tin thanh toán VNPay
                    </p>
                    <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 dark:text-blue-400">✓</span>
                        <span>Thanh toán an toàn qua cổng VNPay</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 dark:text-blue-400">✓</span>
                        <span>Đặt cọc 30%, thanh toán phần còn lại khi nhận xe</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 dark:text-blue-400">✓</span>
                        <span>Số tiền còn lại: <strong>{new Intl.NumberFormat('vi-VN', {
                            style: 'currency',
                            currency: 'VND'
                          }).format(selectedOrder.totalPrice * 0.7)}</strong></span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 dark:text-blue-400">✓</span>
                        <span>Hỗ trợ thanh toán qua thẻ ATM/Visa/Master</span>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            )}

            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsPaymentDialogOpen(false);
                  setPaymentMethod(null);
                }}
                disabled={isProcessingPayment}
                className="w-full sm:w-auto"
              >
                Hủy
              </Button>
              <Button
                onClick={paymentMethod === 'cash' ? confirmCashPayment : confirmPayment}
                disabled={isProcessingPayment || !paymentMethod}
                className={`w-full sm:w-auto ${
                  paymentMethod === 'cash' 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isProcessingPayment ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    {paymentMethod === 'cash' ? (
                      <>
                        <Store className="mr-2 h-4 w-4" />
                        Xác nhận đặt cọc tại cửa hàng
                      </>
                    ) : paymentMethod === 'vnpay' ? (
                      <>
                        <CreditCard className="mr-2 h-4 w-4" />
                        Thanh toán VNPay
                      </>
                    ) : (
                      'Chọn phương thức thanh toán'
                    )}
                  </>
                )}
              </Button>
            </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Order Detail Dialog */}
            <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-3 text-2xl">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-xl">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                    Chi tiết đơn hàng #{orderDetail?.orderId}
                  </DialogTitle>
                  <DialogDescription>
                    Thông tin đầy đủ về đơn hàng của bạn
                  </DialogDescription>
                </DialogHeader>

                {orderDetail && (
                  <div className="space-y-6">
                    {/* Order Status */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 rounded-xl p-6 border-2 border-blue-200 dark:border-blue-800">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Trạng thái đơn hàng</p>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(orderDetail.status)}
                            {getStatusBadge(orderDetail.status)}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground mb-1">Mã đơn hàng</p>
                          <p className="text-xl font-bold text-blue-600">#{orderDetail.orderId}</p>
                        </div>
                      </div>
                    </div>

                    {/* Customer & Dealer Info */}
                    <div className="grid grid-cols-2 gap-4">
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm text-muted-foreground">Thông tin khách hàng</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="font-semibold text-lg">{orderDetail.customerName}</p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm text-muted-foreground">Đại lý</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-blue-600" />
                            <p className="font-semibold text-lg">{getDealerName(orderDetail.dealerId)}</p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Product Info */}
                    <Card className="border-2">
                      <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
                        <CardTitle className="flex items-center gap-2">
                          <Car className="h-5 w-5 text-blue-600" />
                          Thông tin sản phẩm
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-6">
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Tên xe</p>
                            <p className="text-xl font-bold text-blue-600">{orderDetail.productName}</p>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                            <div>
                              <p className="text-sm text-muted-foreground mb-1">Số lượng</p>
                              <p className="text-lg font-semibold">1 xe</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground mb-1">Tổng giá trị</p>
                              <p className="text-lg font-bold text-green-600">
                                {new Intl.NumberFormat('vi-VN', {
                                  style: 'currency',
                                  currency: 'VND'
                                }).format(orderDetail.totalPrice)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-4">
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Ngày đặt hàng
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="font-semibold text-base leading-relaxed">
                            {formatDate(orderDetail.orderDate, true)}
                          </p>
                          {orderDetail.orderDate && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(orderDetail.orderDate).toLocaleTimeString('vi-VN', {
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit'
                              })}
                            </p>
                          )}
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                            <Truck className="h-4 w-4" />
                            Ngày giao dự kiến
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="font-semibold text-base leading-relaxed">
                            {orderDetail.deliveryDate ? formatDate(orderDetail.deliveryDate, false) : 'Chưa xác định'}
                          </p>
                          {orderDetail.deliveryDate && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Dự kiến giao trong giờ hành chính
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    </div>

                    {/* Payment Info */}
                    <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-950 dark:to-yellow-950">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
                          <CreditCard className="h-5 w-5" />
                          Thông tin thanh toán
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between items-center pb-3 border-b border-orange-200">
                          <span className="text-sm font-medium">Tổng giá trị xe:</span>
                          <span className="font-bold text-lg">
                            {new Intl.NumberFormat('vi-VN', {
                              style: 'currency',
                              currency: 'VND'
                            }).format(orderDetail.totalPrice)}
                          </span>
                        </div>
                        
                        {/* Đặt cọc 30% */}
                        <div className="flex justify-between items-center pb-3 border-b border-orange-200">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">Đặt cọc (30%):</span>
                            {(orderDetail.status === 'DEPOSIT_PAID' || 
                              orderDetail.status === 'VEHICLE_READY' || 
                              orderDetail.status === 'DELIVERED' ||
                              orderDetail.status === 'Đã đặt cọc' ||
                              orderDetail.status === 'Đang chuẩn bị xe' ||
                              orderDetail.status === 'Đã yêu cầu đại lý' ||
                              orderDetail.status === 'Sẵn sàng giao xe' ||
                              orderDetail.status === 'Đã giao') && (
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300 text-xs">
                                ✓ Đã thanh toán
                              </Badge>
                            )}
                          </div>
                          <span className={`font-bold text-lg ${
                            (orderDetail.status === 'DEPOSIT_PAID' || 
                             orderDetail.status === 'VEHICLE_READY' || 
                             orderDetail.status === 'DELIVERED' ||
                             orderDetail.status === 'Đã đặt cọc' ||
                             orderDetail.status === 'Đang chuẩn bị xe' ||
                             orderDetail.status === 'Đã yêu cầu đại lý' ||
                             orderDetail.status === 'Sẵn sàng giao xe' ||
                             orderDetail.status === 'Đã giao')
                              ? 'text-green-600'
                              : 'text-orange-600'
                          }`}>
                            {new Intl.NumberFormat('vi-VN', {
                              style: 'currency',
                              currency: 'VND'
                            }).format(orderDetail.totalPrice * 0.3)}
                          </span>
                        </div>
                        
                        {/* Thanh toán còn lại 70% */}
                        <div className="flex justify-between items-center pb-3 border-b border-orange-200">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">Còn lại (70%):</span>
                            {(orderDetail.status === 'DELIVERED' || orderDetail.status === 'Đã giao') && (
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300 text-xs">
                                ✓ Đã thanh toán
                              </Badge>
                            )}
                          </div>
                          <span className={`font-bold text-lg ${
                            (orderDetail.status === 'DELIVERED' || orderDetail.status === 'Đã giao')
                              ? 'text-green-600'
                              : 'text-orange-600'
                          }`}>
                            {new Intl.NumberFormat('vi-VN', {
                              style: 'currency',
                              currency: 'VND'
                            }).format(orderDetail.totalPrice * 0.7)}
                          </span>
                        </div>
                        
                        {/* Tổng đã thanh toán */}
                        <div className="flex justify-between items-center bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 rounded-lg p-3">
                          <span className="font-bold text-gray-900 dark:text-gray-100">Đã thanh toán:</span>
                          <span className="font-bold text-xl text-blue-600 dark:text-blue-400">
                            {new Intl.NumberFormat('vi-VN', {
                              style: 'currency',
                              currency: 'VND'
                            }).format(
                              (orderDetail.status === 'DELIVERED' || orderDetail.status === 'Đã giao')
                                ? orderDetail.totalPrice
                                : (orderDetail.status === 'DEPOSIT_PAID' || 
                                   orderDetail.status === 'VEHICLE_READY' ||
                                   orderDetail.status === 'Đã đặt cọc' ||
                                   orderDetail.status === 'Đang chuẩn bị xe' ||
                                   orderDetail.status === 'Đã yêu cầu đại lý' ||
                                   orderDetail.status === 'Sẵn sàng giao xe')
                                  ? orderDetail.totalPrice * 0.3
                                  : 0
                            )}
                          </span>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Contracts */}
                    {orderDetail.contracts && orderDetail.contracts.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-blue-600" />
                            Hợp đồng ({orderDetail.contracts.length})
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {orderDetail.contracts.map((contract: any, index: number) => (
                              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                <div className="flex items-center gap-3">
                                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded">
                                    <FileText className="h-4 w-4 text-blue-600" />
                                  </div>
                                  <div>
                                    <p className="font-medium">Hợp đồng #{contract.id || index + 1}</p>
                                    <p className="text-xs text-muted-foreground">{contract.type || 'Hợp đồng mua bán xe'}</p>
                                  </div>
                                </div>
                                <Badge variant="secondary">Đã ký</Badge>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}

                <DialogFooter className="mt-6">
                  <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
                    Đóng
                  </Button>
                  {orderDetail && canPay(orderDetail.status) && (
                    <Button 
                      className="bg-orange-600 hover:bg-orange-700"
                      onClick={() => {
                        setIsDetailDialogOpen(false);
                        handlePayment(orderDetail);
                      }}
                    >
                      <CreditCard className="mr-2 h-4 w-4" />
                      Đặt cọc 30%
                    </Button>
                  )}
                </DialogFooter>
              </DialogContent>
            </Dialog>
        </div>
      </CustomerLayout>
    </ProtectedRoute>
  );
}