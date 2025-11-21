"use client";

import { useState, useEffect } from "react";
import { ProtectedRoute } from "@/components/auth-guards";
import DealerStaffLayout from "@/components/layout/dealer-staff-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Eye, Package, Truck, CheckCircle, Filter, Search, Check, X, AlertCircle, Clock, Plus } from "lucide-react";
import { getOrdersByDealerId, OrderRes, approveOrder, rejectOrder, confirmDepositAndRequestVehicle, confirmVehicleReady, confirmVehiclePickedUp } from "@/lib/orderApi";
import { vnpayApi } from "@/lib/vnpayApi";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { CreateOfflineOrderDialog } from "@/components/create-offline-order-dialog";

export default function DealerStaffOrdersPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<OrderRes[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<OrderRes[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<OrderRes | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  // Create offline order dialog
  const [isCreateOrderDialogOpen, setIsCreateOrderDialogOpen] = useState(false);
  
  // Approve/Reject/Confirm dialogs
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [isConfirmDepositDialogOpen, setIsConfirmDepositDialogOpen] = useState(false);
  const [isOfflineDepositDialogOpen, setIsOfflineDepositDialogOpen] = useState(false);
  const [isVehicleReadyDialogOpen, setIsVehicleReadyDialogOpen] = useState(false);
  const [isVehiclePickedUpDialogOpen, setIsVehiclePickedUpDialogOpen] = useState(false);
  const [orderToProcess, setOrderToProcess] = useState<OrderRes | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [confirmNotes, setConfirmNotes] = useState("");
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState("");
  const [finalPaymentMethod, setFinalPaymentMethod] = useState<'offline' | 'online'>('offline');
  const [depositPaymentMethod, setDepositPaymentMethod] = useState<'offline' | 'online'>('offline');
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch orders on mount
  useEffect(() => {
    let isMounted = true;
    
    const loadOrders = async () => {
      if (!user?.dealerId) {
        if (isMounted) {
          toast({
            title: "Lỗi",
            description: "Không tìm thấy thông tin đại lý",
            variant: "destructive",
          });
        }
        return;
      }

      try {
        setIsLoading(true);
        const fetchedOrders = await getOrdersByDealerId(user.dealerId);
        
        // Chỉ update state nếu component vẫn còn mounted
        if (isMounted) {
          setOrders(fetchedOrders);
        }
      } catch (error) {
        // Chỉ hiển thị toast nếu component vẫn còn mounted
        if (isMounted) {
          console.error('Error fetching orders:', error);
          toast({
            title: "Lỗi",
            description: "Không thể tải danh sách đơn hàng",
            variant: "destructive",
          });
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    loadOrders();
    
    // Cleanup function để đánh dấu component đã unmount
    return () => {
      isMounted = false;
    };
  }, [user]);

  // Filter orders when search term or status filter changes
  useEffect(() => {
    filterOrders();
  }, [orders, searchTerm, statusFilter]);

  const fetchOrders = async () => {
    if (!user?.dealerId) {
      toast({
        title: "Lỗi",
        description: "Không tìm thấy thông tin đại lý",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const fetchedOrders = await getOrdersByDealerId(user.dealerId);
      setOrders(fetchedOrders);
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

  const filterOrders = () => {
    let filtered = [...orders];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.orderId.toString().includes(searchTerm) ||
        order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.productName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    setFilteredOrders(filtered);
  };

  const handleViewDetails = (order: OrderRes) => {
    setSelectedOrder(order);
    setIsDetailDialogOpen(true);
  };

  const handleApprove = async () => {
    if (!orderToProcess) return;
    
    try {
      setIsProcessing(true);
      await approveOrder(orderToProcess.orderId);
      
      toast({
        title: "Duyệt đơn thành công",
        description: "Khách hàng sẽ nhận được yêu cầu đặt cọc 30%",
      });
      
      // Refresh orders
      await fetchOrders();
      setIsApproveDialogOpen(false);
      setOrderToProcess(null);
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể duyệt đơn hàng",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!orderToProcess || !rejectReason.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập lý do từ chối",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsProcessing(true);
      await rejectOrder(orderToProcess.orderId, rejectReason);
      
      toast({
        title: "Đã từ chối đơn hàng",
        description: "Khách hàng sẽ được thông báo",
      });
      
      // Refresh orders
      await fetchOrders();
      setIsRejectDialogOpen(false);
      setOrderToProcess(null);
      setRejectReason("");
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể từ chối đơn hàng",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Xác nhận đặt cọc và gửi yêu cầu đến đại lý
  const handleConfirmDeposit = async () => {
    if (!orderToProcess) return;
    
    try {
      setIsProcessing(true);
      await confirmDepositAndRequestVehicle(
        orderToProcess.orderId, 
        confirmNotes || 'Đã xác nhận đặt cọc thành công. Đại lý đang chuẩn bị xe.'
      );
      
      toast({
        title: "Xác nhận thành công",
        description: "Yêu cầu đã được gửi đến đại lý để chuẩn bị xe",
      });
      
      // Refresh orders
      await fetchOrders();
      setIsConfirmDepositDialogOpen(false);
      setOrderToProcess(null);
      setConfirmNotes("");
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể xác nhận đặt cọc",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Xử lý đặt cọc (offline tại cửa hàng hoặc online qua VNPay)
  const handleOfflineDeposit = async () => {
    if (!orderToProcess) return;
    
    try {
      setIsProcessing(true);
      
      if (depositPaymentMethod === 'online') {
        // Thanh toán online qua VNPay cho đặt cọc 30%
        const paymentUrl = await vnpayApi.createPayment(orderToProcess.orderId.toString(), 'deposit', undefined, 'dealer-staff');
        
        toast({
          title: "Chuyển đến VNPay",
          description: "Đang chuyển khách hàng đến trang thanh toán đặt cọc...",
        });
        
        // Đóng dialog trước
        setIsOfflineDepositDialogOpen(false);
        setOrderToProcess(null);
        setDepositPaymentMethod('offline');
        setIsProcessing(false);
        
        // Chuyển hướng đến VNPay trong cùng tab
        setTimeout(() => {
          window.location.href = paymentUrl.url;
        }, 1000);
        
      } else {
        // Thanh toán offline tại cửa hàng
        await confirmDepositAndRequestVehicle(
          orderToProcess.orderId, 
          'Khách hàng đã đặt cọc 30% tại cửa hàng. Đại lý đang chuẩn bị xe.'
        );
        
        toast({
          title: "Đặt cọc thành công",
          description: "Đã xác nhận khách hàng đặt cọc tại cửa hàng. Đơn hàng chuyển sang trạng thái đang chuẩn bị xe.",
        });
        
        // Refresh orders
        await fetchOrders();
        setIsOfflineDepositDialogOpen(false);
        setOrderToProcess(null);
        setDepositPaymentMethod('offline');
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể xác nhận đặt cọc",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Xác nhận xe đã sẵn sàng để giao
  const handleVehicleReady = async () => {
    if (!orderToProcess) return;
    
    if (!expectedDeliveryDate) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn ngày giao dự kiến",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsProcessing(true);
      // Send deliveryDate as a separate parameter instead of in notes
      await confirmVehicleReady(
        orderToProcess.orderId,
        expectedDeliveryDate, // Send as YYYY-MM-DD format
        `Xe đã được chuẩn bị xong. Vui lòng thông báo khách hàng đến đại lý để nhận xe và thanh toán 70% còn lại.`
      );
      
      toast({
        title: "Xác nhận thành công",
        description: `Đã xác nhận xe sẵn sàng. Khách hàng sẽ được thông báo đến nhận xe vào ${expectedDeliveryDate}.`,
      });
      
      // Refresh orders
      await fetchOrders();
      setIsVehicleReadyDialogOpen(false);
      setOrderToProcess(null);
      setExpectedDeliveryDate("");
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể xác nhận xe sẵn sàng",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Xác nhận khách hàng đã lấy xe
  const handleVehiclePickedUp = async () => {
    if (!orderToProcess) return;
    
    try {
      setIsProcessing(true);
      
      if (finalPaymentMethod === 'online') {
        // Thanh toán online qua VNPay cho 70% còn lại
        const paymentUrl = await vnpayApi.createPayment(orderToProcess.orderId.toString(), 'final', undefined, 'dealer-staff');
        
        toast({
          title: "Chuyển đến VNPay",
          description: "Đang chuyển khách hàng đến trang thanh toán...",
        });
        
        // Đóng dialog trước
        setIsVehiclePickedUpDialogOpen(false);
        setOrderToProcess(null);
        setFinalPaymentMethod('offline');
        setIsProcessing(false);
        
        // Chuyển hướng đến VNPay trong cùng tab
        setTimeout(() => {
          window.location.href = paymentUrl.url;
        }, 1000);
        
      } else {
        // Thanh toán offline tại cửa hàng
        await confirmVehiclePickedUp(
          orderToProcess.orderId, 
          'Khách hàng đã nhận xe và thanh toán 70% còn lại tại cửa hàng. Đơn hàng hoàn tất.'
        );
        
        toast({
          title: "Giao xe thành công",
          description: "Đã xác nhận khách hàng nhận xe và hoàn tất thanh toán tại cửa hàng.",
        });
        
        // Refresh orders
        await fetchOrders();
        setIsVehiclePickedUpDialogOpen(false);
        setOrderToProcess(null);
        setFinalPaymentMethod('offline');
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể xử lý giao xe",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", color: string, label: string }> = {
      // Tiếng Việt status
      'Chờ xử lý': { variant: 'outline', color: 'text-yellow-600 bg-yellow-50', label: 'Chờ xử lý' },
      'Chưa đặt cọc': { variant: 'outline', color: 'text-orange-600 bg-orange-50', label: 'Chưa đặt cọc' },
      'Đã đặt cọc': { variant: 'default', color: 'text-blue-600 bg-blue-50', label: 'Đã đặt cọc' },
      'Đang chuẩn bị xe': { variant: 'default', color: 'text-cyan-600 bg-cyan-50', label: 'Đang chuẩn bị xe' },
      'Đã yêu cầu đại lý': { variant: 'default', color: 'text-indigo-600 bg-indigo-50', label: 'Đang chuẩn bị xe' },
      'Sẵn sàng giao xe': { variant: 'default', color: 'text-purple-600 bg-purple-50', label: 'Sẵn sàng giao xe' },
      'Đã duyệt': { variant: 'default', color: 'text-green-600 bg-green-50', label: 'Đã duyệt' },
      'Đã từ chối': { variant: 'destructive', color: 'text-red-600 bg-red-50', label: 'Đã từ chối' },
      'Đã giao': { variant: 'default', color: 'text-green-600 bg-green-50', label: 'Đã giao' },
      'Đã hủy': { variant: 'outline', color: 'text-gray-600 bg-gray-50', label: 'Đã hủy' },
      // English status (backward compatibility)
      'PENDING_APPROVAL': { variant: 'outline', color: 'text-yellow-600 bg-yellow-50', label: 'Chờ xử lý' },
      'AWAITING_DEPOSIT': { variant: 'outline', color: 'text-orange-600 bg-orange-50', label: 'Chưa đặt cọc' },
      'DEPOSIT_PAID': { variant: 'default', color: 'text-blue-600 bg-blue-50', label: 'Đã đặt cọc' },
      'APPROVED': { variant: 'default', color: 'text-green-600 bg-green-50', label: 'Đã duyệt' },
      'REJECTED': { variant: 'destructive', color: 'text-red-600 bg-red-50', label: 'Đã từ chối' },
      'DELIVERED': { variant: 'default', color: 'text-purple-600 bg-purple-50', label: 'Đã giao' },
      'CANCELLED': { variant: 'outline', color: 'text-gray-600 bg-gray-50', label: 'Đã hủy' },
      'Pending': { variant: 'outline', color: 'text-yellow-600 bg-yellow-50', label: 'Chờ xử lý' },
      'Confirmed': { variant: 'default', color: 'text-blue-600 bg-blue-50', label: 'Đã xác nhận' },
      'Processing': { variant: 'outline', color: 'text-yellow-600 bg-yellow-50', label: 'Đang xử lý' },
    };

    const statusInfo = statusMap[status] || { variant: 'outline' as const, color: 'text-gray-600', label: status };

    return (
      <Badge variant={statusInfo.variant} className={statusInfo.color}>
        {statusInfo.label}
      </Badge>
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Confirmed':
        return <CheckCircle className="h-4 w-4" />;
      case 'Shipping':
        return <Truck className="h-4 w-4" />;
      case 'Delivered':
        return <Package className="h-4 w-4" />;
      default:
        return <CheckCircle className="h-4 w-4" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <ProtectedRoute allowedRoles={['Dealer Staff', 'Admin']}>
      <DealerStaffLayout>
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Quản lý đơn hàng</h1>
              <p className="text-gray-500 mt-2">
                Xem và quản lý tất cả đơn hàng của đại lý {user?.dealerName || 'VieCar'}
              </p>
            </div>
            <Button 
              onClick={() => setIsCreateOrderDialogOpen(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="mr-2 h-4 w-4" />
              Tạo đơn offline
            </Button>
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
              <div className="flex gap-4 flex-wrap">
                <div className="flex-1 min-w-[300px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Tìm kiếm theo mã đơn, tên khách hàng, sản phẩm..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="w-[200px]">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Lọc theo trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả trạng thái</SelectItem>
                      <SelectItem value="Chờ xử lý">Chờ xử lý</SelectItem>
                      <SelectItem value="Chưa đặt cọc">Chưa đặt cọc</SelectItem>
                      <SelectItem value="Đã đặt cọc">Đã đặt cọc</SelectItem>
                      <SelectItem value="Đã yêu cầu đại lý">Đã yêu cầu đại lý</SelectItem>
                      <SelectItem value="Sẵn sàng giao xe">Sẵn sàng giao xe</SelectItem>
                      <SelectItem value="Đã duyệt">Đã duyệt</SelectItem>
                      <SelectItem value="Đã từ chối">Đã từ chối</SelectItem>
                      <SelectItem value="Đã giao">Đã giao</SelectItem>
                      <SelectItem value="Đã hủy">Đã hủy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Orders Table */}
          <Card>
            <CardHeader>
              <CardTitle>Danh sách đơn hàng</CardTitle>
              <CardDescription>
                Tổng số: {filteredOrders.length} đơn hàng
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Đang tải đơn hàng...</p>
                  </div>
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Không tìm thấy đơn hàng nào</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Mã ĐH</TableHead>
                        <TableHead>Khách hàng</TableHead>
                        <TableHead>Sản phẩm</TableHead>
                        <TableHead>Số lượng</TableHead>
                        <TableHead>Tổng tiền</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead>Ngày đặt</TableHead>
                        <TableHead>Ngày giao dự kiến</TableHead>
                        <TableHead className="text-right">Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOrders.map((order) => (
                        <TableRow key={order.orderId}>
                          <TableCell className="font-medium">#{order.orderId}</TableCell>
                          <TableCell>{order.customerName || 'N/A'}</TableCell>
                          <TableCell className="max-w-[200px] truncate">
                            {order.productName || 'N/A'}
                          </TableCell>
                          <TableCell>1</TableCell>
                          <TableCell className="font-semibold text-blue-600">
                            {formatCurrency(order.totalPrice)}
                          </TableCell>
                          <TableCell>{getStatusBadge(order.status)}</TableCell>
                          <TableCell>
                            {order.orderDate ? new Date(order.orderDate).toLocaleDateString('vi-VN') : 'Chưa xác định'}
                          </TableCell>
                          <TableCell>
                            {order.deliveryDate ? (
                              <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-green-100 dark:bg-green-900 rounded-full">
                                  <Truck className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                                </div>
                                <span className="font-semibold text-green-700 dark:text-green-400">
                                  {new Date(order.deliveryDate).toLocaleDateString('vi-VN')}
                                </span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                <span className="text-sm italic">Chưa xác định</span>
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              {/* Hiển thị badge "Đã hoàn tất" nếu đơn hàng đã giao */}
                              {order.status === 'Đã giao' && (
                                <Badge variant="default" className="bg-emerald-600 hover:bg-emerald-700">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Đã hoàn tất
                                </Badge>
                              )}
                              
                              {/* Các nút action chỉ hiển thị khi đơn hàng chưa giao */}
                              {order.status !== 'Đã giao' && (
                                <>
                                  {(order.status === 'Chờ xử lý' || order.status === 'PENDING_APPROVAL' || order.status === 'Processing') && (
                                    <>
                                      <Button
                                        variant="default"
                                        size="sm"
                                        className="bg-green-600 hover:bg-green-700"
                                        onClick={() => {
                                          setOrderToProcess(order);
                                          setIsApproveDialogOpen(true);
                                        }}
                                      >
                                        <Check className="h-4 w-4 mr-1" />
                                        Duyệt
                                      </Button>
                                      <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => {
                                          setOrderToProcess(order);
                                          setIsRejectDialogOpen(true);
                                        }}
                                      >
                                        <X className="h-4 w-4 mr-1" />
                                        Từ chối
                                      </Button>
                                    </>
                                  )}
                                  {order.status === 'Chưa đặt cọc' && (
                                    <div className="flex items-center gap-2">
                                      <Button
                                        variant="default"
                                        size="sm"
                                        className="bg-orange-600 hover:bg-orange-700"
                                        onClick={() => {
                                          setOrderToProcess(order);
                                          setIsOfflineDepositDialogOpen(true);
                                        }}
                                      >
                                        <Check className="h-4 w-4 mr-1" />
                                        Đặt cọc tại cửa hàng
                                      </Button>
                                    </div>
                                  )}
                                  {order.status === 'Đã đặt cọc' && (
                                    <Button
                                      variant="default"
                                      size="sm"
                                      className="bg-indigo-600 hover:bg-indigo-700"
                                      onClick={() => {
                                        setOrderToProcess(order);
                                        setIsConfirmDepositDialogOpen(true);
                                      }}
                                    >
                                      <CheckCircle className="h-4 w-4 mr-1" />
                                      Xác nhận cọc
                                    </Button>
                                  )}
                                  {(order.status === 'Đã yêu cầu đại lý' || order.status === 'Đang chuẩn bị xe') && (
                                    <Button
                                      variant="default"
                                      size="sm"
                                      className="bg-purple-600 hover:bg-purple-700"
                                      onClick={() => {
                                        setOrderToProcess(order);
                                        setIsVehicleReadyDialogOpen(true);
                                      }}
                                    >
                                      <Truck className="h-4 w-4 mr-1" />
                                      Xác nhận xe sẵn sàng
                                    </Button>
                                  )}
                                  {order.status === 'Sẵn sàng giao xe' && (
                                    <Button
                                      variant="default"
                                      size="sm"
                                      className="bg-green-600 hover:bg-green-700"
                                      onClick={() => {
                                        setOrderToProcess(order);
                                        setIsVehiclePickedUpDialogOpen(true);
                                      }}
                                    >
                                      <CheckCircle className="h-4 w-4 mr-1" />
                                      Xác nhận khách lấy xe
                                    </Button>
                                  )}
                                </>
                              )}
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewDetails(order)}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                Chi tiết
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Detail Dialog */}
          <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 -m-6 p-4 mb-4 rounded-t-lg border-b border-blue-200 dark:border-blue-800">
                <DialogTitle className="text-xl flex items-center gap-2">
                  <Package className="h-5 w-5 text-blue-600" />
                  Chi tiết đơn hàng #{selectedOrder?.orderId}
                </DialogTitle>
                <DialogDescription className="text-sm mt-1">
                  Thông tin chi tiết về đơn hàng và khách hàng
                </DialogDescription>
              </DialogHeader>

              {selectedOrder && (
                <div className="space-y-4 pt-2">
                  {/* Order Status */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Trạng thái đơn hàng</p>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(selectedOrder.status)}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-muted-foreground mb-1">Mã đơn hàng</p>
                        <p className="text-base font-bold text-blue-600">#{selectedOrder.orderId}</p>
                      </div>
                    </div>
                  </div>

                  {/* Customer Info */}
                  <Card className="border border-blue-200">
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 py-3">
                      <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300 text-base">
                        <div className="p-1.5 bg-blue-100 dark:bg-blue-900 rounded-lg">
                          <Eye className="h-4 w-4 text-blue-600" />
                        </div>
                        Thông tin khách hàng
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-white dark:bg-gray-800 p-2.5 rounded-lg border border-blue-200 dark:border-blue-700">
                            <p className="text-[10px] text-muted-foreground mb-1">Họ và tên</p>
                            <p className="font-semibold text-sm">{selectedOrder.customerName || 'N/A'}</p>
                          </div>
                          <div className="bg-white dark:bg-gray-800 p-2.5 rounded-lg border border-blue-200 dark:border-blue-700">
                            <p className="text-[10px] text-muted-foreground mb-1">Email</p>
                            <p className="font-semibold text-sm text-blue-600 dark:text-blue-400">{selectedOrder.customerEmail || 'Chưa cập nhật'}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-white dark:bg-gray-800 p-2.5 rounded-lg border border-blue-200 dark:border-blue-700">
                            <p className="text-[10px] text-muted-foreground mb-1">Số điện thoại</p>
                            <p className="font-semibold text-sm">{selectedOrder.customerPhone || 'Chưa cập nhật'}</p>
                          </div>
                          <div className="bg-white dark:bg-gray-800 p-2.5 rounded-lg border border-blue-200 dark:border-blue-700">
                            <p className="text-[10px] text-muted-foreground mb-1">Số lượng</p>
                            <p className="font-semibold text-sm">1 xe</p>
                          </div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-2.5 rounded-lg border border-blue-200 dark:border-blue-700">
                          <p className="text-[10px] text-muted-foreground mb-1 flex items-center gap-1">
                            <Package className="h-3 w-3" />
                            Địa chỉ
                          </p>
                          <p className="font-semibold text-sm">{selectedOrder.customerAddress || 'Chưa cập nhật'}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Product Info */}
                  <Card className="border border-green-200">
                    <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 py-3">
                      <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300 text-base">
                        <div className="p-1.5 bg-green-100 dark:bg-green-900 rounded-lg">
                          <Package className="h-4 w-4 text-green-600" />
                        </div>
                        Thông tin sản phẩm
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="space-y-3">
                        {/* Hình ảnh và Tên xe */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                          {selectedOrder.productImage ? (
                            <div className="lg:col-span-1">
                              <div className="relative w-full h-32 rounded-lg overflow-hidden border-2 border-blue-200 dark:border-blue-800 shadow-md">
                                <img 
                                  src={selectedOrder.productImage} 
                                  alt={selectedOrder.productName}
                                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                                />
                              </div>
                            </div>
                          ) : (
                            <div className="lg:col-span-1">
                              <div className="w-full h-32 rounded-lg flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 border-2 border-blue-200 dark:border-blue-800">
                                <Package className="h-12 w-12 text-blue-400 dark:text-blue-300" />
                              </div>
                            </div>
                          )}
                          <div className="lg:col-span-2 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 p-3 rounded-lg border border-blue-200 dark:border-blue-800 flex flex-col justify-center">
                            <p className="text-[10px] text-muted-foreground mb-1 flex items-center gap-1">
                              <Package className="h-3 w-3" />
                              Tên sản phẩm
                            </p>
                            <p className="text-base font-bold text-blue-600 dark:text-blue-400">{selectedOrder.productName || 'N/A'}</p>
                          </div>
                        </div>

                        {/* Số VIN và Số máy */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 p-2.5 rounded-lg border border-purple-200 dark:border-purple-800">
                            <p className="text-[10px] text-muted-foreground mb-1">Số VIN</p>
                            <p className="text-xs font-bold text-purple-600 dark:text-purple-400 font-mono">{selectedOrder.productVin || 'Chưa có'}</p>
                          </div>
                          <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 p-2.5 rounded-lg border border-purple-200 dark:border-purple-800">
                            <p className="text-[10px] text-muted-foreground mb-1">Số máy</p>
                            <p className="text-xs font-bold text-purple-600 dark:text-purple-400 font-mono">{selectedOrder.productEngine || 'Chưa có'}</p>
                          </div>
                        </div>

                        {/* Thông số kỹ thuật */}
                        <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                          <p className="text-[10px] font-semibold text-muted-foreground mb-2">THÔNG SỐ KỸ THUẬT</p>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            <div className="bg-white dark:bg-gray-800 p-2 rounded-lg border border-gray-200 dark:border-gray-700">
                              <p className="text-[10px] text-muted-foreground mb-0.5">Pin</p>
                              <p className="text-xs font-bold text-green-600">{selectedOrder.productBattery ? `${selectedOrder.productBattery} kWh` : 'N/A'}</p>
                            </div>
                            <div className="bg-white dark:bg-gray-800 p-2 rounded-lg border border-gray-200 dark:border-gray-700">
                              <p className="text-[10px] text-muted-foreground mb-0.5">Tầm xa</p>
                              <p className="text-xs font-bold text-blue-600">{selectedOrder.productRange ? `${selectedOrder.productRange} km` : 'N/A'}</p>
                            </div>
                            <div className="bg-white dark:bg-gray-800 p-2 rounded-lg border border-gray-200 dark:border-gray-700">
                              <p className="text-[10px] text-muted-foreground mb-0.5">Công suất</p>
                              <p className="text-xs font-bold text-orange-600">{selectedOrder.productHP ? `${selectedOrder.productHP} HP` : 'N/A'}</p>
                            </div>
                            <div className="bg-white dark:bg-gray-800 p-2 rounded-lg border border-gray-200 dark:border-gray-700">
                              <p className="text-[10px] text-muted-foreground mb-0.5">Mô-men xoắn</p>
                              <p className="text-xs font-bold text-red-600">{selectedOrder.productTorque ? `${selectedOrder.productTorque} Nm` : 'N/A'}</p>
                            </div>
                          </div>
                        </div>

                        {/* Màu sắc */}
                        {selectedOrder.productColor && (
                          <div className="bg-white dark:bg-gray-800 p-2.5 rounded-lg border border-gray-200 dark:border-gray-700">
                            <p className="text-[10px] text-muted-foreground mb-1">Màu sắc</p>
                            <p className="text-sm font-semibold">{selectedOrder.productColor}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Payment Info */}
                  <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-950 dark:to-yellow-950">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-300 text-lg">
                        <CheckCircle className="h-5 w-5" />
                        Thông tin thanh toán
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between items-center pb-3 border-b border-orange-200">
                        <span className="text-sm font-medium">Tổng giá trị xe:</span>
                        <span className="font-bold text-lg">
                          {formatCurrency(selectedOrder.totalPrice)}
                        </span>
                      </div>
                      
                      {/* Đặt cọc 30% */}
                      <div className="flex justify-between items-center pb-3 border-b border-orange-200">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">Đặt cọc (30%):</span>
                          {(selectedOrder.status === 'DEPOSIT_PAID' || 
                            selectedOrder.status === 'VEHICLE_READY' || 
                            selectedOrder.status === 'DELIVERED' ||
                            selectedOrder.status === 'Đã đặt cọc' ||
                            selectedOrder.status === 'Đang chuẩn bị xe' ||
                            selectedOrder.status === 'Sẵn sàng giao xe' ||
                            selectedOrder.status === 'Đã giao') && (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300 text-xs">
                              ✓ Đã thanh toán
                            </Badge>
                          )}
                        </div>
                        <span className={`font-bold text-lg ${
                          (selectedOrder.status === 'DEPOSIT_PAID' || 
                           selectedOrder.status === 'VEHICLE_READY' || 
                           selectedOrder.status === 'DELIVERED' ||
                           selectedOrder.status === 'Đã đặt cọc' ||
                           selectedOrder.status === 'Đang chuẩn bị xe' ||
                           selectedOrder.status === 'Sẵn sàng giao xe' ||
                           selectedOrder.status === 'Đã giao')
                            ? 'text-green-600'
                            : 'text-orange-600'
                        }`}>
                          {formatCurrency(selectedOrder.totalPrice * 0.3)}
                        </span>
                      </div>
                      
                      {/* Thanh toán còn lại 70% */}
                      <div className="flex justify-between items-center pb-3 border-b border-orange-200">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">Còn lại (70%):</span>
                          {(selectedOrder.status === 'DELIVERED' || selectedOrder.status === 'Đã giao') && (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300 text-xs">
                              ✓ Đã thanh toán
                            </Badge>
                          )}
                        </div>
                        <span className={`font-bold text-lg ${
                          (selectedOrder.status === 'DELIVERED' || selectedOrder.status === 'Đã giao')
                            ? 'text-green-600'
                            : 'text-orange-600'
                        }`}>
                          {formatCurrency(selectedOrder.totalPrice * 0.7)}
                        </span>
                      </div>
                      
                      {/* Tổng đã thanh toán */}
                      <div className="flex justify-between items-center bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 rounded-lg p-3">
                        <span className="font-bold text-gray-900 dark:text-gray-100">Đã thanh toán:</span>
                        <span className="font-bold text-xl text-blue-600 dark:text-blue-400">
                          {formatCurrency(
                            (selectedOrder.status === 'DELIVERED' || selectedOrder.status === 'Đã giao')
                              ? selectedOrder.totalPrice
                              : (selectedOrder.status === 'DEPOSIT_PAID' || 
                                 selectedOrder.status === 'VEHICLE_READY' ||
                                 selectedOrder.status === 'Đã đặt cọc' ||
                                 selectedOrder.status === 'Đang chuẩn bị xe' ||
                                 selectedOrder.status === 'Sẵn sàng giao xe')
                                ? selectedOrder.totalPrice * 0.3
                                : 0
                          )}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
                  Đóng
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Approve Dialog */}
          <AlertDialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-600" />
                  Xác nhận duyệt đơn hàng
                </AlertDialogTitle>
                <AlertDialogDescription asChild>
                  <div className="space-y-3">
                    <p>
                      Bạn có chắc chắn muốn duyệt đơn hàng <strong>#{orderToProcess?.orderId}</strong> không?
                    </p>
                    <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                      <div className="text-sm text-blue-900 dark:text-blue-100 font-medium mb-2">
                        📋 Sau khi duyệt:
                      </div>
                      <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 ml-4">
                        <li>• Khách hàng sẽ nhận được thông báo</li>
                        <li>• Yêu cầu đặt cọc <strong>30%</strong> giá trị xe ({orderToProcess && formatCurrency(orderToProcess.totalPrice * 0.3)})</li>
                        <li>• Đơn hàng chuyển sang trạng thái <strong>"Chưa đặt cọc"</strong></li>
                      </ul>
                    </div>
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isProcessing}>Hủy</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleApprove}
                  disabled={isProcessing}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Xác nhận duyệt
                    </>
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Reject Dialog */}
          <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="h-5 w-5" />
                  Từ chối đơn hàng
                </DialogTitle>
                <DialogDescription>
                  Vui lòng cho biết lý do từ chối đơn hàng #{orderToProcess?.orderId}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Lý do từ chối *</label>
                  <Textarea
                    placeholder="Ví dụ: Sản phẩm tạm hết hàng, Thông tin khách hàng không hợp lệ..."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    rows={4}
                    className="resize-none"
                  />
                </div>

                <div className="bg-amber-50 dark:bg-amber-950 rounded-lg p-3 border border-amber-200 dark:border-amber-800">
                  <p className="text-xs text-amber-900 dark:text-amber-100">
                    ⚠️ Lý do từ chối sẽ được gửi đến khách hàng. Vui lòng viết rõ ràng và lịch sự.
                  </p>
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsRejectDialogOpen(false);
                    setRejectReason("");
                    setOrderToProcess(null);
                  }}
                  disabled={isProcessing}
                >
                  Hủy
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleReject}
                  disabled={isProcessing || !rejectReason.trim()}
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <X className="h-4 w-4 mr-2" />
                      Xác nhận từ chối
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Confirm Deposit Dialog */}
          <Dialog open={isConfirmDepositDialogOpen} onOpenChange={setIsConfirmDepositDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-indigo-600">
                  <CheckCircle className="h-5 w-5" />
                  Xác nhận đặt cọc và gửi yêu cầu đến đại lý
                </DialogTitle>
                <DialogDescription>
                  Xác nhận rằng khách hàng đã thanh toán đặt cọc 30% và gửi yêu cầu chuẩn bị xe đến đại lý
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                {orderToProcess && (
                  <div className="bg-muted rounded-lg p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Đơn hàng:</span>
                      <span className="font-semibold">#{orderToProcess.orderId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Khách hàng:</span>
                      <span className="font-medium">{orderToProcess.customerName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Sản phẩm:</span>
                      <span className="font-medium">{orderToProcess.productName}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2 mt-2">
                      <span className="text-sm text-muted-foreground">Tổng giá trị:</span>
                      <span className="font-bold">
                        {new Intl.NumberFormat('vi-VN', {
                          style: 'currency',
                          currency: 'VND'
                        }).format(orderToProcess.totalPrice)}
                      </span>
                    </div>
                    <div className="flex justify-between text-green-600">
                      <span className="text-sm font-semibold">Đã đặt cọc (30%):</span>
                      <span className="font-bold">
                        {new Intl.NumberFormat('vi-VN', {
                          style: 'currency',
                          currency: 'VND'
                        }).format(orderToProcess.totalPrice * 0.3)}
                      </span>
                    </div>
                  </div>
                )}

                <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
                  <div className="text-sm text-blue-900 dark:text-blue-100 font-semibold mb-2">
                    📋 Sau khi xác nhận:
                  </div>
                  <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
                    <li>✓ Đại lý sẽ nhận được yêu cầu chuẩn bị xe</li>
                    <li>✓ Trạng thái đơn hàng: "Đang chuẩn bị xe"</li>
                    <li>✓ Khách hàng sẽ thanh toán 70% còn lại khi nhận xe</li>
                  </ul>
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsConfirmDepositDialogOpen(false);
                    setConfirmNotes("");
                    setOrderToProcess(null);
                  }}
                  disabled={isProcessing}
                >
                  Hủy
                </Button>
                <Button
                  className="bg-indigo-600 hover:bg-indigo-700"
                  onClick={handleConfirmDeposit}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Xác nhận & Gửi yêu cầu
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Offline Deposit Dialog - Đặt cọc tại cửa hàng */}
          <AlertDialog open={isOfflineDepositDialogOpen} onOpenChange={setIsOfflineDepositDialogOpen}>
            <AlertDialogContent className="max-w-2xl">
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2 text-orange-600">
                  <Check className="h-5 w-5" />
                  Xác nhận đặt cọc tại cửa hàng
                </AlertDialogTitle>
                <AlertDialogDescription asChild>
                  <div className="space-y-4">
                    <p className="text-base">
                      Xác nhận khách hàng đã thanh toán <strong>đặt cọc 30%</strong> cho đơn hàng <strong>#{orderToProcess?.orderId}</strong>
                    </p>
                    {orderToProcess && (
                      <div className="bg-orange-50 dark:bg-orange-950 rounded-lg p-4 border border-orange-200 dark:border-orange-800">
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-orange-900 dark:text-orange-100">Khách hàng:</span>
                            <span className="font-semibold text-orange-900 dark:text-orange-100">{orderToProcess.customerName}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-orange-900 dark:text-orange-100">Sản phẩm:</span>
                            <span className="font-semibold text-orange-900 dark:text-orange-100">{orderToProcess.productName}</span>
                          </div>
                          <div className="flex justify-between border-t border-orange-300 dark:border-orange-700 pt-2">
                            <span className="text-orange-900 dark:text-orange-100">Tổng giá trị:</span>
                            <span className="font-bold text-orange-900 dark:text-orange-100">
                              {new Intl.NumberFormat('vi-VN', {
                                style: 'currency',
                                currency: 'VND'
                              }).format(orderToProcess.totalPrice)}
                            </span>
                          </div>
                          <div className="flex justify-between text-green-600 dark:text-green-400">
                            <span className="font-semibold">Số tiền đặt cọc (30%):</span>
                            <span className="font-bold text-lg">
                              {new Intl.NumberFormat('vi-VN', {
                                style: 'currency',
                                currency: 'VND'
                              }).format(orderToProcess.totalPrice * 0.3)}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Payment Method Selection for Deposit */}
                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-foreground">Phương thức thanh toán đặt cọc 30%:</label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setDepositPaymentMethod('offline')}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            depositPaymentMethod === 'offline'
                              ? 'border-green-500 bg-green-50 dark:bg-green-950'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex flex-col items-center gap-2">
                            <div className={`p-2 rounded-full ${depositPaymentMethod === 'offline' ? 'bg-green-100 dark:bg-green-900' : 'bg-gray-100 dark:bg-gray-800'}`}>
                              <CheckCircle className={`h-5 w-5 ${depositPaymentMethod === 'offline' ? 'text-green-600' : 'text-gray-500'}`} />
                            </div>
                            <span className={`font-semibold text-sm ${depositPaymentMethod === 'offline' ? 'text-green-700 dark:text-green-400' : 'text-gray-700 dark:text-gray-300'}`}>
                              Tiền mặt tại cửa hàng
                            </span>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setDepositPaymentMethod('online')}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            depositPaymentMethod === 'online'
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex flex-col items-center gap-2">
                            <div className={`p-2 rounded-full ${depositPaymentMethod === 'online' ? 'bg-blue-100 dark:bg-blue-900' : 'bg-gray-100 dark:bg-gray-800'}`}>
                              <svg className={`h-5 w-5 ${depositPaymentMethod === 'online' ? 'text-blue-600' : 'text-gray-500'}`} fill="currentColor" viewBox="0 0 24 24">
                                <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
                              </svg>
                            </div>
                            <span className={`font-semibold text-sm ${depositPaymentMethod === 'online' ? 'text-blue-700 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}>
                              VNPay (Online)
                            </span>
                          </div>
                        </button>
                      </div>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                      <div className="text-sm text-blue-900 dark:text-blue-100 font-medium mb-2">
                        📋 Sau khi xác nhận:
                      </div>
                      <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 ml-4">
                        {depositPaymentMethod === 'offline' ? (
                          <>
                            <li>✓ Khách hàng đã thanh toán tiền mặt tại cửa hàng</li>
                            <li>✓ Đại lý sẽ nhận được yêu cầu chuẩn bị xe</li>
                          </>
                        ) : (
                          <>
                            <li>✓ Khách hàng sẽ được chuyển đến trang VNPay để thanh toán</li>
                            <li>✓ Sau khi thanh toán thành công, đơn hàng tự động chuyển trạng thái</li>
                          </>
                        )}
                        <li>✓ Trạng thái đơn hàng: "Đã yêu cầu đại lý"</li>
                        <li>✓ Khách hàng sẽ thanh toán 70% còn lại khi nhận xe</li>
                      </ul>
                    </div>
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel
                  onClick={() => {
                    setIsOfflineDepositDialogOpen(false);
                    setOrderToProcess(null);
                    setDepositPaymentMethod('offline');
                  }}
                  disabled={isProcessing}
                >
                  Hủy
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleOfflineDeposit}
                  disabled={isProcessing}
                  className={depositPaymentMethod === 'offline' ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      {depositPaymentMethod === 'offline' ? 'Xác nhận đã nhận tiền' : 'Chuyển đến VNPay'}
                    </>
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Create Offline Order Dialog */}
          <CreateOfflineOrderDialog 
            open={isCreateOrderDialogOpen}
            onOpenChange={setIsCreateOrderDialogOpen}
            onSuccess={fetchOrders}
          />

          {/* Vehicle Ready Confirmation Dialog */}
          <AlertDialog open={isVehicleReadyDialogOpen} onOpenChange={setIsVehicleReadyDialogOpen}>
            <AlertDialogContent className="max-w-2xl">
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-400">
                  <Truck className="h-5 w-5" />
                  Xác nhận xe đã sẵn sàng
                </AlertDialogTitle>
                <AlertDialogDescription asChild>
                  <div className="space-y-4">
                    <p className="text-base">
                      Xác nhận rằng xe đã được <strong>chuẩn bị xong</strong> cho đơn hàng <strong>#{orderToProcess?.orderId}</strong>?
                    </p>
                    
                    {/* Expected Delivery Date Input */}
                    <div className="bg-yellow-50 dark:bg-yellow-950 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
                      <label className="block text-sm font-medium text-yellow-900 dark:text-yellow-100 mb-2">
                        📅 Ngày giao dự kiến <span className="text-red-600">*</span>
                      </label>
                      <Input
                        type="date"
                        value={expectedDeliveryDate}
                        onChange={(e) => setExpectedDeliveryDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="bg-white dark:bg-gray-800"
                        required
                      />
                      <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-2">
                        Khách hàng sẽ nhận được thông báo về ngày này qua email
                      </p>
                    </div>
                    
                    {orderToProcess && (
                    <div className="bg-purple-50 dark:bg-purple-950 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-purple-900 dark:text-purple-100">Khách hàng:</span>
                          <span className="font-semibold text-purple-900 dark:text-purple-100">{orderToProcess.customerName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-purple-900 dark:text-purple-100">Sản phẩm:</span>
                          <span className="font-semibold text-purple-900 dark:text-purple-100">{orderToProcess.productName}</span>
                        </div>
                        <div className="flex justify-between border-t border-purple-300 dark:border-purple-700 pt-2">
                          <span className="text-purple-900 dark:text-purple-100">Tổng giá trị:</span>
                          <span className="font-bold text-purple-900 dark:text-purple-100">
                            {new Intl.NumberFormat('vi-VN', {
                              style: 'currency',
                              currency: 'VND'
                            }).format(orderToProcess.totalPrice)}
                          </span>
                        </div>
                        <div className="flex justify-between text-orange-600 dark:text-orange-400 border-t border-purple-300 dark:border-purple-700 pt-2">
                          <span className="font-semibold">Đã đặt cọc (30%):</span>
                          <span className="font-bold">
                            {new Intl.NumberFormat('vi-VN', {
                              style: 'currency',
                              currency: 'VND'
                            }).format(orderToProcess.totalPrice * 0.3)}
                          </span>
                        </div>
                        <div className="flex justify-between text-red-600 dark:text-red-400">
                          <span className="font-semibold">Còn lại phải thanh toán (70%):</span>
                          <span className="font-bold">
                            {new Intl.NumberFormat('vi-VN', {
                              style: 'currency',
                              currency: 'VND'
                            }).format(orderToProcess.totalPrice * 0.7)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="bg-green-50 dark:bg-green-950 rounded-lg p-4 border border-green-200 dark:border-green-800">
                    <div className="text-sm text-green-900 dark:text-green-100 font-medium mb-2">
                      📋 Sau khi xác nhận:
                    </div>
                    <ul className="text-sm text-green-800 dark:text-green-200 space-y-1 ml-4">
                      <li>✓ Khách hàng sẽ nhận email thông báo với ngày giao dự kiến</li>
                      <li>✓ Trạng thái đơn hàng: "Sẵn sàng giao xe"</li>
                      <li>✓ Khách hàng cần thanh toán 70% còn lại khi nhận xe</li>
                    </ul>
                  </div>
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isProcessing}>Hủy</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleVehicleReady}
                  disabled={isProcessing}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <Truck className="h-4 w-4 mr-2" />
                      Xác nhận xe sẵn sàng
                    </>
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Vehicle Picked Up Confirmation Dialog */}
          <AlertDialog open={isVehiclePickedUpDialogOpen} onOpenChange={setIsVehiclePickedUpDialogOpen}>
            <AlertDialogContent className="max-w-2xl">
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
                  <CheckCircle className="h-5 w-5" />
                  Xác nhận khách hàng đã lấy xe
                </AlertDialogTitle>
                <AlertDialogDescription asChild>
                  <div className="space-y-4">
                    <p className="text-base">
                      Xác nhận rằng khách hàng đã <strong>nhận xe</strong> cho đơn hàng <strong>#{orderToProcess?.orderId}</strong>
                    </p>
                    {orderToProcess && (
                      <div className="bg-green-50 dark:bg-green-950 rounded-lg p-4 border border-green-200 dark:border-green-800">
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-green-900 dark:text-green-100">Khách hàng:</span>
                            <span className="font-semibold text-green-900 dark:text-green-100">{orderToProcess.customerName}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-green-900 dark:text-green-100">Sản phẩm:</span>
                            <span className="font-semibold text-green-900 dark:text-green-100">{orderToProcess.productName}</span>
                          </div>
                          <div className="flex justify-between border-t border-green-300 dark:border-green-700 pt-2">
                            <span className="text-green-900 dark:text-green-100">Tổng giá trị:</span>
                            <span className="font-bold text-green-900 dark:text-green-100">
                              {new Intl.NumberFormat('vi-VN', {
                                style: 'currency',
                                currency: 'VND'
                              }).format(orderToProcess.totalPrice)}
                            </span>
                          </div>
                          <div className="flex justify-between text-blue-600 dark:text-blue-400 border-t border-green-300 dark:border-green-700 pt-2">
                            <span className="font-semibold">Đã đặt cọc (30%):</span>
                            <span className="font-bold">
                              {new Intl.NumberFormat('vi-VN', {
                                style: 'currency',
                                currency: 'VND'
                              }).format(orderToProcess.totalPrice * 0.3)}
                            </span>
                          </div>
                          <div className="flex justify-between text-orange-600 dark:text-orange-400">
                            <span className="font-semibold">Còn phải thanh toán (70%):</span>
                            <span className="font-bold text-lg">
                              {new Intl.NumberFormat('vi-VN', {
                                style: 'currency',
                                currency: 'VND'
                              }).format(orderToProcess.totalPrice * 0.7)}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Payment Method Selection */}
                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-foreground">Phương thức thanh toán 70% còn lại:</label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setFinalPaymentMethod('offline')}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            finalPaymentMethod === 'offline'
                              ? 'border-green-500 bg-green-50 dark:bg-green-950'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex flex-col items-center gap-2">
                            <div className={`p-2 rounded-full ${finalPaymentMethod === 'offline' ? 'bg-green-100 dark:bg-green-900' : 'bg-gray-100 dark:bg-gray-800'}`}>
                              <CheckCircle className={`h-5 w-5 ${finalPaymentMethod === 'offline' ? 'text-green-600' : 'text-gray-500'}`} />
                            </div>
                            <span className={`font-semibold ${finalPaymentMethod === 'offline' ? 'text-green-700 dark:text-green-400' : 'text-gray-700 dark:text-gray-300'}`}>
                              Tiền mặt tại cửa hàng
                            </span>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setFinalPaymentMethod('online')}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            finalPaymentMethod === 'online'
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex flex-col items-center gap-2">
                            <div className={`p-2 rounded-full ${finalPaymentMethod === 'online' ? 'bg-blue-100 dark:bg-blue-900' : 'bg-gray-100 dark:bg-gray-800'}`}>
                              <svg className={`h-5 w-5 ${finalPaymentMethod === 'online' ? 'text-blue-600' : 'text-gray-500'}`} fill="currentColor" viewBox="0 0 24 24">
                                <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
                              </svg>
                            </div>
                            <span className={`font-semibold ${finalPaymentMethod === 'online' ? 'text-blue-700 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}>
                              VNPay (Online)
                            </span>
                          </div>
                        </button>
                      </div>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                      <div className="text-sm text-blue-900 dark:text-blue-100 font-medium mb-2">
                        📋 Sau khi xác nhận:
                      </div>
                      <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 ml-4">
                        {finalPaymentMethod === 'offline' ? (
                          <>
                            <li>✓ Khách hàng thanh toán tiền mặt tại cửa hàng</li>
                            <li>✓ Đơn hàng chuyển sang trạng thái "Đã giao"</li>
                          </>
                        ) : (
                          <>
                            <li>✓ Khách hàng sẽ được chuyển đến trang VNPay</li>
                            <li>✓ Sau khi thanh toán thành công, trạng thái tự động cập nhật</li>
                          </>
                        )}
                        <li>✓ Hoàn tất đơn hàng</li>
                      </ul>
                    </div>
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel
                  onClick={() => {
                    setIsVehiclePickedUpDialogOpen(false);
                    setOrderToProcess(null);
                    setFinalPaymentMethod('offline');
                  }}
                  disabled={isProcessing}
                >
                  Hủy
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleVehiclePickedUp}
                  disabled={isProcessing}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {finalPaymentMethod === 'offline' ? 'Xác nhận đã nhận tiền' : 'Chuyển đến VNPay'}
                    </>
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </DealerStaffLayout>
    </ProtectedRoute>
  );
}
