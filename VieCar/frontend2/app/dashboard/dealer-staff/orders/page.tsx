"use client";

import { useState, useEffect } from "react";
import { ProtectedRoute } from "@/components/auth-guards";
import DealerStaffLayout from "@/components/layout/dealer-staff-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Eye, Package, Truck, CheckCircle, Filter, Search, Check, X, AlertCircle, Clock } from "lucide-react";
import { getOrdersByDealerId, OrderRes, approveOrder, rejectOrder, confirmDepositAndRequestVehicle } from "@/lib/orderApi";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

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
  
  // Approve/Reject/Confirm dialogs
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [isConfirmDepositDialogOpen, setIsConfirmDepositDialogOpen] = useState(false);
  const [orderToProcess, setOrderToProcess] = useState<OrderRes | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [confirmNotes, setConfirmNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch orders on mount
  useEffect(() => {
    fetchOrders();
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
        confirmNotes || 'Đã xác nhận đặt cọc thành công. Yêu cầu đã được gửi đến đại lý để chuẩn bị xe.'
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

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", color: string, label: string }> = {
      // Tiếng Việt status
      'Chờ xử lý': { variant: 'outline', color: 'text-yellow-600 bg-yellow-50', label: 'Chờ xử lý' },
      'Chưa đặt cọc': { variant: 'outline', color: 'text-orange-600 bg-orange-50', label: 'Chưa đặt cọc' },
      'Đã đặt cọc': { variant: 'default', color: 'text-blue-600 bg-blue-50', label: 'Đã đặt cọc' },
      'Đã yêu cầu đại lý': { variant: 'default', color: 'text-indigo-600 bg-indigo-50', label: 'Đã yêu cầu đại lý' },
      'Đã duyệt': { variant: 'default', color: 'text-green-600 bg-green-50', label: 'Đã duyệt' },
      'Đã từ chối': { variant: 'destructive', color: 'text-red-600 bg-red-50', label: 'Đã từ chối' },
      'Đã giao': { variant: 'default', color: 'text-purple-600 bg-purple-50', label: 'Đã giao' },
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
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quản lý đơn hàng</h1>
            <p className="text-gray-500 mt-2">
              Xem và quản lý tất cả đơn hàng của đại lý {user?.dealerName || 'VieCar'}
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
                          <TableCell>Chưa xác định</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
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
                                <div className="flex items-center gap-2 text-orange-600">
                                  <Clock className="h-4 w-4" />
                                  <span className="text-sm font-medium">Chờ KH đặt cọc</span>
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
                                  Xác nhận & Gửi đại lý
                                </Button>
                              )}
                              {order.status === 'Đã yêu cầu đại lý' && (
                                <div className="flex items-center gap-2 text-indigo-600">
                                  <Truck className="h-4 w-4" />
                                  <span className="text-sm font-medium">Đang chuẩn bị xe</span>
                                </div>
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
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Chi tiết đơn hàng #{selectedOrder?.orderId}</DialogTitle>
                <DialogDescription>
                  Thông tin chi tiết về đơn hàng
                </DialogDescription>
              </DialogHeader>

              {selectedOrder && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Khách hàng</p>
                      <p className="font-medium">{selectedOrder.customerName || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Trạng thái</p>
                      <div className="mt-1">{getStatusBadge(selectedOrder.status)}</div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Sản phẩm</p>
                      <p className="font-medium">{selectedOrder.productName || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Số lượng</p>
                      <p className="font-medium">1</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Ngày đặt hàng</p>
                      <p className="font-medium">Chưa xác định</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Địa chỉ giao hàng</p>
                      <p className="font-medium">Chưa xác định</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm text-gray-500">Hợp đồng</p>
                      <p className="font-medium">{selectedOrder.contracts?.length || 0} hợp đồng</p>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center text-lg font-semibold">
                      <span>Tổng tiền:</span>
                      <span className="text-blue-600">{formatCurrency(selectedOrder.totalPrice)}</span>
                    </div>
                  </div>
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
                <AlertDialogDescription className="space-y-3">
                  <p>
                    Bạn có chắc chắn muốn duyệt đơn hàng <strong>#{orderToProcess?.orderId}</strong> không?
                  </p>
                  <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                    <p className="text-sm text-blue-900 dark:text-blue-100 font-medium mb-2">
                      📋 Sau khi duyệt:
                    </p>
                    <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 ml-4">
                      <li>• Khách hàng sẽ nhận được thông báo</li>
                      <li>• Yêu cầu đặt cọc <strong>30%</strong> giá trị xe ({orderToProcess && formatCurrency(orderToProcess.totalPrice * 0.3)})</li>
                      <li>• Đơn hàng chuyển sang trạng thái <strong>"Chưa đặt cọc"</strong></li>
                    </ul>
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

                <div className="space-y-2">
                  <label className="text-sm font-medium">Ghi chú cho đại lý (tùy chọn)</label>
                  <Textarea
                    placeholder="Ví dụ: Khách hàng cần xe màu trắng, Giao trước ngày 15/11..."
                    value={confirmNotes}
                    onChange={(e) => setConfirmNotes(e.target.value)}
                    rows={3}
                    className="resize-none"
                  />
                </div>

                <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-900 dark:text-blue-100 font-semibold mb-2">
                    📋 Sau khi xác nhận:
                  </p>
                  <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
                    <li>✓ Đại lý sẽ nhận được yêu cầu chuẩn bị xe</li>
                    <li>✓ Trạng thái đơn hàng: "Đã yêu cầu đại lý"</li>
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
        </div>
      </DealerStaffLayout>
    </ProtectedRoute>
  );
}
