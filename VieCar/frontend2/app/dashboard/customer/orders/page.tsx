"use client";

// ============================================================================
// IMPORTS
// ============================================================================
import { ProtectedRoute } from "@/components/auth-guards";
import { useAuth } from "@/contexts/AuthContext";
import CustomerLayout from "@/components/layout/customer-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, Truck, Package, CheckCircle, AlertCircle, CreditCard } from "lucide-react";
import { useEffect, useState } from "react";
import { orderApi } from "@/lib/orderApi";
import { OrderRes } from "@/types/order";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { vnpayApi } from "@/lib/vnpayApi";
import { useToast } from "@/hooks/use-toast";
import { useSearchParams } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// ============================================================================
// MAIN COMPONENT: Customer Orders Page
// ============================================================================
/**
 * Trang quản lý đơn hàng của khách hàng
 * 
 * Chức năng chính:
 * - Hiển thị danh sách đơn hàng của user đang đăng nhập
 * - Cho phép thanh toán online qua VNPay
 * - Tự động refresh khi user quay lại từ trang thanh toán
 * - Hiển thị trạng thái đơn hàng với badge màu sắc phù hợp
 * 
 * @returns React Component
 */
export default function CustomerOrdersPage() {
  // ============================================================================
  // HOOKS & CONTEXT
  // ============================================================================
  const { user } = useAuth(); // Thông tin user đang đăng nhập
  const { toast } = useToast(); // Toast notification
  const searchParams = useSearchParams(); // URL search params để detect refresh

  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  const [orders, setOrders] = useState<OrderRes[]>([]); // Danh sách đơn hàng
  const [isLoading, setIsLoading] = useState(true); // Loading state khi fetch data
  const [error, setError] = useState<string | null>(null); // Error message nếu có lỗi
  const [selectedOrder, setSelectedOrder] = useState<OrderRes | null>(null); // Order được chọn để thanh toán
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false); // Dialog xác nhận thanh toán
  const [isProcessingPayment, setIsProcessingPayment] = useState(false); // Loading state khi tạo payment URL

  // ============================================================================
  // API FUNCTIONS
  // ============================================================================
  
  /**
   * Fetch danh sách đơn hàng từ backend
   * 
   * Flow:
   * 1. Kiểm tra user.id có tồn tại không
   * 2. Convert user.id sang number nếu cần (vì có thể là string từ localStorage)
   * 3. Gọi API: GET /api/orders/user/{userId}
   * 4. Update state với data nhận được
   * 5. Xử lý error nếu có
   */
  const fetchOrders = async () => {
    // Validate: User phải đã đăng nhập
    if (!user?.id) {
      setError("Không tìm thấy thông tin người dùng");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      // Convert userId sang number (user.id có thể là string hoặc number)
      const userId = typeof user.id === 'string' ? Number.parseInt(user.id) : user.id;
      
      // Call API
      const data = await orderApi.getOrdersByUser(userId);
      
      // Update state
      setOrders(data);
    } catch (err: any) {
      console.error("Error fetching orders:", err);
      setError(err.response?.data?.message || "Không thể tải danh sách đơn hàng");
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================================================
  // EFFECTS
  // ============================================================================
  
  /**
   * Effect 1: Fetch orders khi component mount hoặc URL thay đổi
   * 
   * Dependency array: [user?.id, searchParams]
   * - user?.id: Fetch lại khi user thay đổi (login/logout)
   * - searchParams: Fetch lại khi URL có query params mới (VD: ?refresh=timestamp)
   * 
   * Use case: Khi user thanh toán xong và click "Quay lại đơn hàng",
   * URL sẽ có thêm ?refresh=timestamp → Trigger effect này → Fetch data mới
   */
  useEffect(() => {
    // Fetch orders từ backend
    fetchOrders();
    
    // Kiểm tra nếu có param "refresh" trong URL
    const refreshParam = searchParams.get('refresh');
    if (refreshParam) {
      // Hiển thị toast thông báo đã refresh
      toast({
        title: "Đã cập nhật",
        description: "Danh sách đơn hàng đã được làm mới",
      });
    }
  }, [user?.id, searchParams]);

  /**
   * Effect 2: Auto-refresh khi user quay lại tab
   * 
   * Use case: 
   * - User click thanh toán → VNPay mở trong tab mới
   * - User thanh toán xong → Đóng tab VNPay
   * - User quay lại tab orders cũ → Auto fetch data mới
   * 
   * Sử dụng Page Visibility API để detect khi tab được focus lại
   */
  useEffect(() => {
    /**
     * Handler cho sự kiện visibilitychange
     * Được gọi mỗi khi user switch tab hoặc minimize/restore browser
     */
    const handleVisibilityChange = () => {
      // document.hidden = false nghĩa là tab đang được hiển thị
      if (!document.hidden) {
        console.log('Tab is visible again, refreshing orders...');
        fetchOrders(); // Fetch data mới
      }
    };

    // Đăng ký event listener
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Cleanup function: Remove event listener khi component unmount
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user?.id]); // Re-attach listener khi user thay đổi

  // ============================================================================
  // PAYMENT HANDLERS
  // ============================================================================
  
  /**
   * Handler khi user click nút "Thanh toán"
   * 
   * @param order - Order cần thanh toán
   * 
   * Flow:
   * 1. Lưu order vào state selectedOrder
   * 2. Mở dialog xác nhận thanh toán
   */
  const handlePayment = async (order: OrderRes) => {
    setSelectedOrder(order);
    setIsPaymentDialogOpen(true);
  };

  /**
   * Handler khi user xác nhận thanh toán trong dialog
   * 
   * Flow:
   * 1. Gọi API tạo VNPay payment URL: POST /api/vnpay/create-payment?orderId=xxx
   * 2. Mở VNPay trong tab mới (không redirect tab hiện tại)
   * 3. Đóng dialog
   * 4. Hiển thị hướng dẫn cho user
   * 5. Tab hiện tại sẽ tự động refresh khi user quay lại (nhờ visibilitychange effect)
   * 
   * Security:
   * - Sử dụng window.open với 'noopener,noreferrer' để:
   *   + noopener: Tránh tab mới access window.opener (bảo mật)
   *   + noreferrer: Không gửi referrer header (privacy)
   */
  const handleConfirmPayment = async () => {
    // Guard clause: Không làm gì nếu chưa chọn order
    if (!selectedOrder) return;

    try {
      setIsProcessingPayment(true);
      
      // Step 1: Call API tạo payment URL
      // API sẽ tạo record Payment trong DB với status PENDING
      // và return VNPay payment URL
      const paymentResponse = await vnpayApi.createPayment(
        selectedOrder.orderId.toString()
      );
      
      // Step 2: Hiển thị toast loading
      toast({
        title: "Đang mở cổng thanh toán...",
        description: "Vui lòng hoàn tất thanh toán trong tab mới",
      });

      // Step 3: Mở VNPay trong tab mới
      // '_blank': Mở tab mới
      // 'noopener,noreferrer': Security flags
      window.open(paymentResponse.url, '_blank', 'noopener,noreferrer');
      
      // Step 4: Đóng dialog và reset state
      setIsPaymentDialogOpen(false);
      setIsProcessingPayment(false);
      
      // Step 5: Hiển thị hướng dẫn cho user
      toast({
        title: "Đã mở cổng thanh toán",
        description: "Vui lòng hoàn tất thanh toán trong tab mới. Trang này sẽ tự động cập nhật sau khi thanh toán.",
        duration: 8000, // Hiển thị 8 giây
      });
      
    } catch (err: any) {
      // Xử lý lỗi
      console.error("Error creating payment:", err);
      toast({
        variant: "destructive",
        title: "Lỗi thanh toán",
        description: err.response?.data?.message || "Không thể tạo thanh toán. Vui lòng thử lại.",
      });
      setIsProcessingPayment(false);
    }
  };

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================
  
  /**
   * Format giá tiền theo định dạng Việt Nam
   * 
   * @param price - Số tiền cần format (VND)
   * @returns String đã format: "100.000 ₫"
   * 
   * Example: 100000 → "100.000 ₫"
   */
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  /**
   * Lấy icon phù hợp với status của order
   * 
   * @param status - Trạng thái đơn hàng (từ database)
   * @returns React component icon
   * 
   * Logic:
   * - Hoàn thành/Giao hàng: Truck icon 🚚
   * - Đang xử lý: Package icon 📦
   * - Thất bại/Hủy: AlertCircle icon ⚠️
   * - Mặc định: CheckCircle icon ✅
   */
  const getStatusIcon = (status: string) => {
    const statusLower = status.toLowerCase();
    
    if (statusLower.includes('complet') || statusLower.includes('deliver')) {
      return <Truck className="h-4 w-4" />;
    } else if (statusLower.includes('process') || statusLower.includes('pending')) {
      return <Package className="h-4 w-4" />;
    } else if (statusLower.includes('reject') || statusLower.includes('cancel') || statusLower.includes('fail')) {
      return <AlertCircle className="h-4 w-4" />;
    } else {
      return <CheckCircle className="h-4 w-4" />;
    }
  };

  /**
   * Tạo Badge component với màu sắc phù hợp
   * 
   * @param status - Trạng thái đơn hàng (từ database)
   * @returns Badge component với màu tương ứng
   * 
   * Màu sắc:
   * - 🟢 default (xanh lá): completed, delivered, paid - Đơn hàng đã xong
   * - 🟡 secondary (vàng): processing, pending, approved - Đang xử lý
   * - 🔴 destructive (đỏ): rejected, cancelled, failed - Thất bại/Hủy
   * - ⚪ outline (xám): Các trạng thái khác
   * 
   * Note: Giữ nguyên text từ database, chỉ thay đổi màu sắc
   */
  const getStatusBadge = (status: string) => {
    let variant: "default" | "secondary" | "destructive" | "outline" = "outline";
    const statusLower = status.toLowerCase();
    
    // Xác định màu badge dựa trên từ khóa trong status
    if (statusLower.includes('complet') || statusLower.includes('deliver') || statusLower.includes('paid')) {
      variant = 'default'; // 🟢 Xanh lá - Hoàn thành
    } else if (statusLower.includes('process') || statusLower.includes('pending') || statusLower.includes('approv')) {
      variant = 'secondary'; // 🟡 Vàng - Đang xử lý
    } else if (statusLower.includes('reject') || statusLower.includes('cancel') || statusLower.includes('fail')) {
      variant = 'destructive'; // 🔴 Đỏ - Thất bại/Hủy
    }
    
    return <Badge variant={variant}>{status}</Badge>;
  };

  /**
   * Kiểm tra xem order có thể thanh toán không
   * 
   * @param status - Trạng thái đơn hàng
   * @returns true nếu có thể thanh toán, false nếu không
   * 
   * Logic đơn giản:
   * - CHỈ KHÔNG cho thanh toán nếu status = "Paid" (đã thanh toán thành công)
   * - TẤT CẢ các trạng thái khác đều CHO PHÉP thanh toán/thanh toán lại
   * 
   * Lý do cho phép thanh toán lại:
   * 1. Processing/Pending: Chưa thanh toán
   * 2. Payment Failed: Thanh toán thất bại, cho phép thử lại
   * 3. Timeout: Thanh toán hết thời gian
   * 4. Network Error: Lỗi mạng khi thanh toán
   * 5. User Cancelled: User hủy giữa chừng tại VNPay
   * 6. Completed/Delivered: Order đã xử lý nhưng chưa thanh toán (COD → Online)
   * 
   * Use case: User có thể gặp nhiều vấn đề khi thanh toán (mất mạng, timeout, 
   * đóng tab nhầm...), vì vậy nên cho phép thanh toán lại tối đa
   */
  const canPay = (status: string) => {
    const statusLower = status.toLowerCase();
    const isPaid = statusLower.includes('paid');
    
    // Chỉ block thanh toán nếu đã Paid
    return !isPaid;
  };

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
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Lỗi</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isLoading ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i}>
                    <CardHeader>
                      <Skeleton className="h-12 w-full" />
                    </CardHeader>
                  </Card>
                ))}
              </div>
              <Card>
                <CardContent className="pt-6">
                  <Skeleton className="h-64 w-full" />
                </CardContent>
              </Card>
            </div>
          ) : (
            <>
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
                    <CardTitle className="text-sm font-medium">Đang xử lý</CardTitle>
                    <Truck className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {orders.filter(o => {
                        const statusLower = o.status.toLowerCase();
                        return (statusLower.includes('process') || 
                                statusLower.includes('pending') || 
                                statusLower.includes('approv')) &&
                               !statusLower.includes('complet') &&
                               !statusLower.includes('deliver');
                      }).length}
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
                      {orders.filter(o => {
                        const statusLower = o.status.toLowerCase();
                        return statusLower.includes('complet') || 
                               statusLower.includes('deliver') ||
                               statusLower.includes('paid');
                      }).length}
                    </div>
                    <p className="text-xs text-muted-foreground">Đơn hàng</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Tổng chi tiêu</CardTitle>
                    <Badge className="h-4 w-4 text-muted-foreground">₫</Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {(orders.reduce((sum, order) => sum + order.totalPrice, 0) / 1000000).toFixed(1)}M
                    </div>
                    <p className="text-xs text-muted-foreground">VNĐ</p>
                  </CardContent>
                </Card>
              </div>

              {/* Orders Table */}
              {orders.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-16">
                    <Package className="h-16 w-16 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Chưa có đơn hàng nào</h3>
                    <p className="text-muted-foreground text-center mb-4">
                      Bạn chưa có đơn hàng nào. Hãy khám phá các sản phẩm và đặt hàng ngay!
                    </p>
                    <Button asChild>
                      <a href="/#vehicles">Khám phá sản phẩm</a>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
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
                          <TableHead>Khách hàng</TableHead>
                          <TableHead>Sản phẩm</TableHead>
                          <TableHead>Tổng tiền</TableHead>
                          <TableHead>Trạng thái</TableHead>
                          <TableHead>Ghi chú</TableHead>
                          <TableHead>Thao tác</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orders.map((order) => (
                          <TableRow key={order.orderId}>
                            <TableCell className="font-medium">#{order.orderId}</TableCell>
                            <TableCell>{order.customerName}</TableCell>
                            <TableCell>{order.productName}</TableCell>
                            <TableCell>{formatPrice(order.totalPrice)}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {getStatusIcon(order.status)}
                                {getStatusBadge(order.status)}
                              </div>
                            </TableCell>
                            <TableCell className="max-w-[200px] truncate">
                              {order.notes || "-"}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button variant="ghost" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                                {canPay(order.status) && (
                                  <Button 
                                    variant="default" 
                                    size="sm"
                                    onClick={() => handlePayment(order)}
                                  >
                                    <CreditCard className="h-4 w-4 mr-1" />
                                    Thanh toán
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {/* Payment Dialog */}
          <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Xác nhận thanh toán</DialogTitle>
                <DialogDescription>
                  Bạn sẽ được chuyển đến cổng thanh toán VNPay để hoàn tất giao dịch
                </DialogDescription>
              </DialogHeader>
              
              {selectedOrder && (
                <div className="space-y-4 py-4">
                  <div className="bg-muted rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Mã đơn hàng:</span>
                      <span className="font-semibold">#{selectedOrder.orderId}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Sản phẩm:</span>
                      <span className="font-medium">{selectedOrder.productName}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Tổng tiền:</span>
                      <span className="font-bold text-green-600 text-lg">
                        {formatPrice(selectedOrder.totalPrice)}
                      </span>
                    </div>
                  </div>
                  
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Bạn sẽ được chuyển đến trang thanh toán VNPay. Sau khi thanh toán xong, 
                      bạn sẽ được chuyển về trang đơn hàng với trạng thái đã cập nhật.
                    </AlertDescription>
                  </Alert>
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
                  onClick={handleConfirmPayment}
                  disabled={isProcessingPayment}
                >
                  {isProcessingPayment ? (
                    <>
                      <Package className="mr-2 h-4 w-4 animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Thanh toán ngay
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CustomerLayout>
    </ProtectedRoute>
  );
}