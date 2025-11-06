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
import { Eye, Truck, Package, CheckCircle, CreditCard, Loader2 } from "lucide-react";
import { getOrdersByUserId, OrderRes } from "@/lib/orderApi";
import { vnpayApi } from "@/lib/vnpayApi";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export default function CustomerOrdersPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [orders, setOrders] = useState<OrderRes[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<OrderRes | null>(null);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Fetch orders on mount and when refresh param changes
  useEffect(() => {
    if (user?.id) {
      fetchOrders();
    }
  }, [user, searchParams]);

  const fetchOrders = async () => {
    if (!user?.id) return;
    
    try {
      setIsLoading(true);
      const fetchedOrders = await getOrdersByUserId(parseInt(user.id));
      setOrders(fetchedOrders);
      
      // Debug log - Chi tiết từng order
      console.log('📦 Fetched orders:', fetchedOrders);
      
      fetchedOrders.forEach((order, index) => {
        console.log(`Order #${index + 1}:`, {
          id: order.orderId,
          status: order.status,
          statusBytes: Array.from(order.status).map(c => c.charCodeAt(0)),
          canPay: canPay(order.status),
          productName: order.productName,
          totalPrice: order.totalPrice
        });
      });
      
      const pendingPayment = fetchedOrders.filter(o => canPay(o.status));
      if (pendingPayment.length > 0) {
        console.log('💰 Orders waiting for deposit:', pendingPayment);
      } else {
        console.log('⚠️ No orders found with status that allows payment');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách đơn hàng",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Kiểm tra xem order có thể thanh toán không
  const canPay = (status: string) => {
    if (!status) return false;
    
    // Log chi tiết để debug encoding issues
    console.log('🔍 Checking canPay for status:', {
      original: status,
      charCodes: Array.from(status).map(c => c.charCodeAt(0)),
      length: status.length
    });
    
    // Chỉ cho phép thanh toán khi đơn hàng ở trạng thái Chưa đặt cọc
    const normalizedStatus = status.trim();
    
    // CHỈ cho phép thanh toán khi ở trạng thái "Chưa đặt cọc"
    // KHÔNG cho phép với "Chờ xử lý"
    // Xử lý cả encoding issues (Ch? d?t c?c)
    const isAwaitingDeposit = (
      normalizedStatus === 'Chưa đặt cọc' || 
      normalizedStatus === 'AWAITING_DEPOSIT' ||
      normalizedStatus === 'Ch? d?t c?c' ||  // Encoding issue pattern
      (normalizedStatus.includes('đặt cọc') && !normalizedStatus.includes('xử lý')) ||  // Có "đặt cọc" nhưng KHÔNG có "xử lý"
      /Ch.*d.*t.*c.*c/i.test(normalizedStatus)  // Pattern với wildcard
    );
    
    console.log('   → Result:', {
      normalizedStatus,
      isAwaitingDeposit,
      exactMatch: normalizedStatus === 'Chưa đặt cọc',
      encodingMatch: normalizedStatus === 'Ch? d?t c?c',
      includesCheck: normalizedStatus.includes('đặt cọc'),
      patternMatch: /Ch.*d.*t.*c.*c/i.test(normalizedStatus)
    });
    
    return isAwaitingDeposit;
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
    setIsPaymentDialogOpen(true);
    
    toast({
      title: "Chuẩn bị thanh toán",
      description: `Đang chuẩn bị thanh toán đặt cọc cho đơn hàng #${order.orderId}`,
    });
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
    const statusMap: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", className?: string, label: string }> = {
      // Tiếng Việt status
      'Chờ xử lý': { variant: 'outline', className: 'bg-yellow-50 text-yellow-700 border-yellow-300', label: 'Chờ xử lý' },
      'Chưa đặt cọc': { variant: 'default', className: 'bg-orange-500 hover:bg-orange-600', label: 'Chưa đặt cọc 30%' },
      'Đã đặt cọc': { variant: 'default', className: 'bg-blue-500 hover:bg-blue-600', label: 'Đã đặt cọc 30%' },
      'Đã duyệt': { variant: 'default', className: 'bg-green-500 hover:bg-green-600', label: 'Đã duyệt' },
      'Đã từ chối': { variant: 'destructive', label: 'Đã từ chối' },
      'Đã giao': { variant: 'default', className: 'bg-purple-500 hover:bg-purple-600', label: 'Đã giao' },
      'Đã hủy': { variant: 'outline', label: 'Đã hủy' },
      // English status (backward compatibility)
      'PENDING_APPROVAL': { variant: 'outline', className: 'bg-yellow-50 text-yellow-700 border-yellow-300', label: 'Chờ xử lý' },
      'AWAITING_DEPOSIT': { variant: 'default', className: 'bg-orange-500 hover:bg-orange-600', label: 'Chưa đặt cọc 30%' },
      'DEPOSIT_PAID': { variant: 'default', className: 'bg-blue-500 hover:bg-blue-600', label: 'Đã đặt cọc 30%' },
      'APPROVED': { variant: 'default', className: 'bg-green-500 hover:bg-green-600', label: 'Đã duyệt' },
      'REJECTED': { variant: 'destructive', label: 'Đã từ chối' },
      'DELIVERED': { variant: 'default', className: 'bg-purple-500 hover:bg-purple-600', label: 'Đã giao' },
      'CANCELLED': { variant: 'outline', label: 'Đã hủy' },
      'Processing': { variant: 'outline', className: 'bg-yellow-50 text-yellow-700 border-yellow-300', label: 'Đang xử lý' },
    };

    const statusInfo = statusMap[status] || { variant: 'outline' as const, label: status };

    return (
      <Badge variant={statusInfo.variant} className={statusInfo.className}>
        {statusInfo.label}
      </Badge>
    );
  };

  // Đếm số đơn hàng cần đặt cọc
  const pendingPaymentOrders = orders.filter(o => canPay(o.status));

  return (
    <ProtectedRoute allowedRoles={['Customer']}>
      <CustomerLayout>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold">Đơn hàng của tôi</h1>
              <p className="text-muted-foreground mt-2">
                Theo dõi trạng thái và lịch sử đơn hàng của bạn
              </p>
            </div>
            <Button 
              onClick={() => {
                console.log('🔄 Manual refresh clicked');
                fetchOrders();
              }}
              variant="outline"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang tải...
                </>
              ) : (
                <>
                  🔄 Refresh
                </>
              )}
            </Button>
          </div>

          {/* Order Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tổng đơn hàng</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{orders.length}</div>
                <p className="text-xs text-muted-foreground">Tất cả thời gian</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Chờ xử lý</CardTitle>
                <Truck className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {orders.filter(o => 
                    o.status === "Chờ xử lý" || 
                    o.status === "Chưa đặt cọc" || 
                    o.status === "PENDING_APPROVAL" || 
                    o.status === "AWAITING_DEPOSIT"
                  ).length}
                </div>
                <p className="text-xs text-muted-foreground">Đơn hàng</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Đã hoàn thành</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {orders.filter(o => 
                    o.status === "Đã giao" || 
                    o.status === "Đã duyệt" || 
                    o.status === "DELIVERED" || 
                    o.status === "APPROVED"
                  ).length}
                </div>
                <p className="text-xs text-muted-foreground">Đơn hàng</p>
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
                  <TableRow>
                    <TableHead>Mã đơn hàng</TableHead>
                    <TableHead>Sản phẩm</TableHead>
                    <TableHead>Số lượng</TableHead>
                    <TableHead>Tổng tiền</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Ngày đặt</TableHead>
                    <TableHead>Ngày giao dự kiến</TableHead>
                    <TableHead>Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.orderId}>
                      <TableCell className="font-medium">#{order.orderId}</TableCell>
                      <TableCell>{order.productName}</TableCell>
                      <TableCell>1</TableCell>
                      <TableCell>
                        {new Intl.NumberFormat('vi-VN', {
                          style: 'currency',
                          currency: 'VND'
                        }).format(order.totalPrice)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {getStatusIcon(order.status)}
                          <span className="ml-2">{getStatusBadge(order.status)}</span>
                        </div>
                      </TableCell>
                      <TableCell>-</TableCell>
                      <TableCell>
                        Chưa xác định
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" title="Xem chi tiết">
                            <Eye className="h-4 w-4" />
                          </Button>
                          {canPay(order.status) && (
                            <Button 
                              variant="default" 
                              size="sm"
                              className="bg-orange-600 hover:bg-orange-700 text-white font-semibold shadow-md hover:shadow-lg transition-all animate-pulse"
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
        </div>

        {/* Payment Confirmation Dialog */}
        <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <div className="rounded-full bg-orange-100 dark:bg-orange-900 p-2">
                  <CreditCard className="h-5 w-5 text-orange-600" />
                </div>
                Xác nhận đặt cọc 30%
              </DialogTitle>
              <DialogDescription className="text-base">
                Bạn sẽ được chuyển đến cổng thanh toán <strong className="text-blue-600">VNPay</strong> an toàn để đặt cọc
              </DialogDescription>
            </DialogHeader>
            
            {selectedOrder && (
              <div className="space-y-4">
                <div className="bg-muted rounded-lg p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Mã đơn hàng:</span>
                    <span className="font-semibold">#{selectedOrder.orderId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Sản phẩm:</span>
                    <span className="font-medium">{selectedOrder.productName}</span>
                  </div>
                  <div className="border-t pt-3 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Giá xe:</span>
                      <span className="font-medium">
                        {new Intl.NumberFormat('vi-VN', {
                          style: 'currency',
                          currency: 'VND'
                        }).format(selectedOrder.totalPrice)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold text-orange-700">Số tiền cọc (30%):</span>
                      <span className="font-bold text-lg text-orange-600">
                        {new Intl.NumberFormat('vi-VN', {
                          style: 'currency',
                          currency: 'VND'
                        }).format(selectedOrder.totalPrice * 0.3)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-900 dark:text-blue-100 font-semibold mb-2">
                    📝 Thông tin thanh toán
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

                {/* VNPay Logo/Info */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-3 text-white text-center">
                  <p className="text-sm font-medium">Thanh toán qua VNPay</p>
                  <p className="text-xs opacity-90 mt-1">Cổng thanh toán hàng đầu Việt Nam</p>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsPaymentDialogOpen(false)}
                disabled={isProcessingPayment}
              >
                Hủy
              </Button>
              <Button
                onClick={confirmPayment}
                disabled={isProcessingPayment}
                className="bg-orange-600 hover:bg-orange-700"
              >
                {isProcessingPayment ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Đặt cọc ngay
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CustomerLayout>
    </ProtectedRoute>
  );
}