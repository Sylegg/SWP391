"use client";

import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/auth-guards';
import DealerManagerLayout from '@/components/layout/dealer-manager-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import {
  Package,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  MessageSquare,
  Truck,
  FileText,
  AlertCircle,
  ShoppingCart,
  Trash2,
} from 'lucide-react';
import {
  getDistributionsByDealer,
  respondToInvitation,
  submitDistributionOrder,
  confirmDistributionReceived,
  respondToManufacturerPrice,
} from '@/lib/distributionApi';
import { getAllProducts, getProductsByCategory } from '@/lib/productApi';
import { getAllCategories } from '@/lib/categoryApi';
import type { ProductRes } from '@/types/product';
import type { CategoryRes } from '@/types/category';
import {
  DistributionRes,
  DistributionStatus,
  getDistributionStatusLabel,
  getDistributionStatusColor,
} from '@/types/distribution';

export default function DealerDistributionsPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [distributions, setDistributions] = useState<DistributionRes[]>([]);
  const [products, setProducts] = useState<ProductRes[]>([]);
  const [categories, setCategories] = useState<CategoryRes[]>([]);
  const [selectedDistribution, setSelectedDistribution] = useState<DistributionRes | null>(null);
  
  
  // Dialog states
  const [isRespondDialogOpen, setIsRespondDialogOpen] = useState(false);
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [isCompleteDialogOpen, setIsCompleteDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isPriceDialogOpen, setIsPriceDialogOpen] = useState(false);
  
  // Form states
  const [respondForm, setRespondForm] = useState({
    accepted: true,
    notes: '',
  });
  
  // Multi-item order form state (loại bỏ sản phẩm, dùng theo danh mục)
  const [orderItems, setOrderItems] = useState<{ categoryId?: number; color?: string; quantity: number; }[]>([
    { categoryId: undefined, color: undefined, quantity: 1 },
  ]);
  const [orderNotes, setOrderNotes] = useState('');
  const [orderRequestedDeliveryDate, setOrderRequestedDeliveryDate] = useState('');
  const totalOrderQty = orderItems.reduce((s, it) => s + (Number(it.quantity) || 0), 0);

  const [completeForm, setCompleteForm] = useState({
    receivedQuantity: 0,
  });
  const [receivedItems, setReceivedItems] = useState<
    { id: number; name?: string; color?: string; ordered: number; received: number }[]
  >([]);
  // Ngày nhập kho của đại lý (chọn khi xác nhận nhận hàng)
  const [receiptDate, setReceiptDate] = useState<string>('');
  
  // Vietnamese color options
  const COLOR_OPTIONS = ['Đỏ','Xanh dương','Trắng','Đen','Xám','Bạc','Xanh lá'];
  
  // Stats
  const [stats, setStats] = useState({
    pending: 0,
    planned: 0,
    completed: 0,
    totalProducts: 0,
  });

  useEffect(() => {
    if (user?.dealerId) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user?.dealerId) {
      toast({
        title: '⚠️ Lỗi',
        description: 'Không tìm thấy thông tin đại lý',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      const [distData, productData, categoryData] = await Promise.all([
        getDistributionsByDealer(user.dealerId),
        getAllProducts(),
        getAllCategories(),
      ]);
      
      setDistributions(distData);
      setProducts(productData || []);
      setCategories(categoryData || []);
      
      // Calculate stats
      const statsData = {
        pending: distData.filter(d => 
          d.status === DistributionStatus.INVITED || 
          d.status === DistributionStatus.ACCEPTED
        ).length,
        planned: distData.filter(d => d.status === DistributionStatus.PLANNED).length,
        completed: distData.filter(d => d.status === DistributionStatus.COMPLETED).length,
        totalProducts: distData.reduce((sum, d) => {
          const itemQty = d.items?.reduce((s, it) => s + (it.quantity || 0), 0) || 0;
          const productCount = d.products?.length || 0;
          return sum + (itemQty || productCount);
        }, 0),
      };
      setStats(statsData);
      
      toast({
        title: '✅ Tải thành công',
        description: `Đã tải ${distData.length} phân phối, ${productData?.length || 0} sản phẩm, ${categoryData?.length || 0} danh mục`,
      });
    } catch (error: any) {
      toast({
        title: '❌ Lỗi',
        description: error.message || 'Không thể tải dữ liệu',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Respond to invitation
  const handleRespond = async () => {
    if (!selectedDistribution) return;

    try {
      await respondToInvitation(
        selectedDistribution.id,
        respondForm.accepted,
        respondForm.notes
      );
      
      // Close respond dialog first
      setIsRespondDialogOpen(false);
      
      toast({
        title: respondForm.accepted ? '✅ Đã chấp nhận' : '❌ Đã từ chối',
        description: respondForm.accepted 
          ? 'Tạo đơn nhập hàng ngay'
          : 'Đã từ chối lời mời phân phối',
      });
      
      // If accepted, open order dialog immediately
      if (respondForm.accepted) {
        // Update local selection status to allow submit guard to pass
        setSelectedDistribution((prev) => prev ? { ...prev, status: DistributionStatus.ACCEPTED } : prev);
        setIsOrderDialogOpen(true);
      }
      
      resetRespondForm();
      loadData();
    } catch (error: any) {
      toast({
        title: '❌ Lỗi',
        description: error.message || 'Không thể phản hồi',
        variant: 'destructive',
      });
    }
  };

  // Step 3: Submit detailed order
  const handleSubmitOrder = async () => {
    if (!selectedDistribution) {
      toast({
        title: '⚠️ Thiếu thông tin',
        description: 'Không xác định được phân phối',
        variant: 'destructive',
      });
      return;
    }

    // If not ACCEPTED, auto-accept before submit to streamline flow
    if (selectedDistribution.status !== DistributionStatus.ACCEPTED) {
      try {
        await respondToInvitation(selectedDistribution.id, true, undefined);
        setSelectedDistribution((prev) => prev ? { ...prev, status: DistributionStatus.ACCEPTED } : prev);
      } catch (err: any) {
        toast({
          title: '❌ Lỗi',
          description: err?.message || 'Không thể chấp nhận lời mời',
          variant: 'destructive',
        });
        return;
      }
    }

    // ✅ SIMPLIFIED: Gửi trực tiếp categoryId cho backend, không cần resolve productId
    const categoryItems = orderItems.filter((it) => (it.categoryId || 0) > 0 && (it.quantity || 0) > 0);

    if (categoryItems.length === 0) {
      toast({
        title: '⚠️ Thiếu thông tin',
        description: 'Vui lòng thêm ít nhất 1 dòng danh mục hợp lệ',
        variant: 'destructive',
      });
      return;
    }

    // Build items với categoryId - Backend sẽ tự xử lý
    const validItems = categoryItems.map((it) => ({
      categoryId: it.categoryId!, // ✅ Gửi categoryId trực tiếp
      color: it.color || undefined,
      quantity: it.quantity,
    }));

    try {
      setIsSubmittingOrder(true);
      const requestData = {
        items: validItems,
        dealerNotes: orderNotes || undefined,
        requestedDeliveryDate: orderRequestedDeliveryDate 
          ? `${orderRequestedDeliveryDate}T00:00:00`
          : undefined,
      };

  await submitDistributionOrder(selectedDistribution.id, requestData);
      toast({
        title: '✅ Gửi đơn thành công',
        description: 'Đơn nhập hàng đã được gửi đến EVM để duyệt',
      });
      setIsOrderDialogOpen(false);
      resetOrderForm();
      loadData();
    } catch (error: any) {
      toast({
        title: '❌ Lỗi',
        description: error.message || 'Không thể gửi đơn',
        variant: 'destructive',
      });
    }
    finally {
      setIsSubmittingOrder(false);
    }
  };

  // Step 6: Confirm received - So sánh số lượng đã đặt vs số lượng giao tới
  const handleConfirmReceived = async () => {
    if (!selectedDistribution) {
      toast({
        title: '⚠️ Thiếu thông tin',
        description: 'Không xác định được phân phối',
        variant: 'destructive',
      });
      return;
    }
    
    // Lấy số lượng thực tế giao tới (received) - đây là số xe hãng đã giao
    const totalReceived = receivedItems.length > 0
      ? receivedItems.reduce((s, it) => s + (Number(it.received) || 0), 0)
      : selectedDistribution.requestedQuantity || 0;
    
    // Số lượng đã đặt để so sánh
    const totalOrdered = receivedItems.length > 0
      ? receivedItems.reduce((s, it) => s + (Number(it.ordered) || 0), 0)
      : selectedDistribution.requestedQuantity || 0;
    
    if (!totalReceived || totalReceived <= 0) {
      toast({ 
        title: '⚠️ Không có dữ liệu', 
        description: 'Không tìm thấy thông tin số lượng đã giao', 
        variant: 'destructive' 
      });
      return;
    }
    
    // Kiểm tra chênh lệch
    const difference = totalReceived - totalOrdered;
    let confirmMessage = `Xác nhận nhận ${totalReceived} xe từ hãng`;
    if (difference !== 0) {
      confirmMessage += `\n(${difference > 0 ? 'Thừa' : 'Thiếu'} ${Math.abs(difference)} xe so với đơn đặt)`;
    }
    
    try {
      // Sử dụng ngày nhập kho do đại lý chọn (receiptDate)
      const actualDeliveryDate = receiptDate
        ? `${receiptDate}T00:00:00`
        : (() => {
            const today = new Date();
            const yyyy = today.getFullYear();
            const mm = String(today.getMonth() + 1).padStart(2, '0');
            const dd = String(today.getDate()).padStart(2, '0');
            return `${yyyy}-${mm}-${dd}T00:00:00`;
          })();

      const requestData = {
        receivedQuantity: totalReceived, // Số lượng thực tế nhận được
        actualDeliveryDate,
        items: receivedItems.length > 0
          ? receivedItems
              .filter((it) => (Number(it.received) || 0) > 0)
              .map((it) => ({ 
                distributionItemId: it.id, 
                receivedQuantity: Number(it.received) || 0 // Số lượng thực tế giao tới
              }))
          : undefined,
      };
      
      await confirmDistributionReceived(selectedDistribution.id, requestData);
      toast({
        title: '✅ Xác nhận thành công',
        description: confirmMessage,
      });
      setIsCompleteDialogOpen(false);
      resetCompleteForm();
      loadData();
    } catch (error: any) {
      toast({
        title: '❌ Lỗi',
        description: error.message || 'Không thể xác nhận',
        variant: 'destructive',
      });
    }
  };

  const resetRespondForm = () => {
    setRespondForm({ accepted: true, notes: '' });
  };

  const resetOrderForm = () => {
    setOrderItems([{ categoryId: undefined, color: undefined, quantity: 1 }]);
    setOrderNotes('');
    setOrderRequestedDeliveryDate('');
  };

  const resetCompleteForm = () => {
    setCompleteForm({ receivedQuantity: 0 });
    setReceivedItems([]);
  };

  const openRespondDialog = async (distribution: DistributionRes, accepted: boolean) => {
    setSelectedDistribution(distribution);
    
    if (accepted) {
      // Nếu chấp nhận → gọi API ngay và mở dialog tạo đơn
      try {
        await respondToInvitation(distribution.id, true, undefined);
        toast({
          title: '✅ Đã chấp nhận',
          description: 'Tạo đơn nhập hàng ngay',
        });
        // Update selected distribution to ACCEPTED locally
        setSelectedDistribution({ ...distribution, status: DistributionStatus.ACCEPTED });
        setIsOrderDialogOpen(true);  // Mở dialog tạo đơn luôn
        loadData();
      } catch (error: any) {
        toast({
          title: '❌ Lỗi',
          description: error.message || 'Không thể chấp nhận',
          variant: 'destructive',
        });
      }
    } else {
      // Nếu từ chối → mở dialog xác nhận từ chối
      setRespondForm({ accepted: false, notes: '' });
      setIsRespondDialogOpen(true);
    }
  };

  const openOrderDialog = (distribution: DistributionRes) => {
    setSelectedDistribution(distribution);
    setIsOrderDialogOpen(true);
  };

  const openCompleteDialog = (distribution: DistributionRes) => {
    setSelectedDistribution(distribution);
    // Build per-item list if available; default received = ordered
    if (distribution.items && distribution.items.length > 0) {
      const list = distribution.items.map((it) => ({
        id: it.id,
        name: it.product?.name,
        color: it.color,
        ordered: it.quantity || 0,
        received: it.quantity || 0,
      }));
      setReceivedItems(list);
      const total = list.reduce((s, it) => s + (it.received || 0), 0);
      setCompleteForm({ receivedQuantity: total });
    } else {
      setReceivedItems([]);
      setCompleteForm({ receivedQuantity: (distribution.products?.length || 0) });
    }
    // Đặt mặc định ngày nhập kho là hôm nay
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    setReceiptDate(`${yyyy}-${mm}-${dd}`);
    setIsCompleteDialogOpen(true);
  };

  const openDetailDialog = (distribution: DistributionRes) => {
    setSelectedDistribution(distribution);
    setIsDetailDialogOpen(true);
  };

  const openPriceDialog = (distribution: DistributionRes) => {
    setSelectedDistribution(distribution);
    setIsPriceDialogOpen(true);
  };

  const handleRespondToPrice = async (accepted: boolean) => {
    if (!selectedDistribution) return;
    try {
      const notes = accepted ? 'Đồng ý với giá hãng và số lượng đã duyệt' : 'Không đồng ý với giá hãng';
      await respondToManufacturerPrice(selectedDistribution.id, accepted, notes);
      toast({
        title: accepted ? '✅ Đã chấp nhận giá' : '❌ Đã từ chối giá',
        description: accepted ? 'EVM Staff sẽ lên kế hoạch giao hàng' : 'Đơn hàng đã bị hủy',
      });
      setIsPriceDialogOpen(false);
      loadData();
    } catch (error: any) {
      toast({
        title: '❌ Lỗi',
        description: error.message || 'Không thể phản hồi giá',
        variant: 'destructive',
      });
    }
  };

  return (
  <ProtectedRoute allowedRoles={['Dealer Manager']}>
      <DealerManagerLayout>
        <div className="p-6 space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold">📦 Phân phối Sản phẩm</h1>
            <p className="text-muted-foreground mt-1">
              Quản lý lời mời nhập hàng và xác nhận nhận hàng từ hãng
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Chờ xử lý</CardTitle>
                <Clock className="h-4 w-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pending}</div>
                <p className="text-xs text-muted-foreground">Cần phản hồi/gửi đơn</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Đang giao</CardTitle>
                <Truck className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.planned}</div>
                <p className="text-xs text-muted-foreground">Chờ nhận hàng</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Hoàn thành</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.completed}</div>
                <p className="text-xs text-muted-foreground">Đã nhận đủ hàng</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tổng sản phẩm</CardTitle>
                <Package className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalProducts}</div>
                <p className="text-xs text-muted-foreground">Đã nhận tất cả</p>
              </CardContent>
            </Card>
          </div>

          {/* Distribution List */}
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="mt-2 text-muted-foreground">Đang tải...</p>
            </div>
          ) : distributions.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Chưa có lời mời phân phối nào</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {distributions.map((dist) => (
                <Card key={dist.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <CardTitle>Phân phối #{dist.id}</CardTitle>
                          <Badge className={getDistributionStatusColor(dist.status)}>
                            {getDistributionStatusLabel(dist.status)}
                          </Badge>
                        </div>
                        <CardDescription>
                          <div className="flex items-center gap-4 mt-2">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {dist.createdAt ? new Date(dist.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                            </span>
                            {dist.deadline && dist.status === DistributionStatus.INVITED && (
                              <span className="flex items-center gap-1 text-amber-600">
                                <AlertCircle className="h-4 w-4" />
                                Hạn: {new Date(dist.deadline).toLocaleDateString('vi-VN')}
                              </span>
                            )}
                          </div>
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openDetailDialog(dist)}
                        >
                          Chi tiết
                        </Button>
                        
                        {/* Step 2: Accept/Decline buttons for INVITED status */}
                        {dist.status === DistributionStatus.INVITED && (
                          <>
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => openRespondDialog(dist, true)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              Chấp nhận
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => openRespondDialog(dist, false)}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Từ chối
                            </Button>
                          </>
                        )}
                        
                        {/* Step 3: Submit Order button for ACCEPTED status */}
                        {dist.status === DistributionStatus.ACCEPTED && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => openOrderDialog(dist)}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <ShoppingCart className="h-4 w-4 mr-1" />
                            Tạo đơn nhập hàng
                          </Button>
                        )}
                        
                        {/* Status PENDING: Đã gửi đơn, chờ EVM duyệt - no action needed */}
                        {dist.status === DistributionStatus.PENDING && (
                          <Badge className="bg-yellow-100 text-yellow-800">
                            <Clock className="h-3 w-3 mr-1" />
                            Đang chờ EVM duyệt
                          </Badge>
                        )}
                        
                        {/* Status CONFIRMED: EVM đã duyệt, chờ lên kế hoạch - no action needed */}
                        {dist.status === DistributionStatus.CONFIRMED && (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            EVM đã duyệt, chờ lên kế hoạch
                          </Badge>
                        )}
                        
                        {/* Status CANCELED: EVM đã từ chối đơn */}
                        {dist.status === DistributionStatus.CANCELED && (
                          <Badge className="bg-red-100 text-red-800">
                            <XCircle className="h-3 w-3 mr-1" />
                            EVM đã từ chối đơn
                          </Badge>
                        )}
                        
                        {/* Status PRICE_SENT: EVM gửi giá hãng, chờ dealer phản hồi */}
                        {dist.status === DistributionStatus.PRICE_SENT && (
                          <>
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => openPriceDialog(dist)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              Xem giá & Chấp nhận
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => openPriceDialog(dist)}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Từ chối giá
                            </Button>
                          </>
                        )}
                        
                        {/* Status PRICE_REJECTED: Dealer đã từ chối giá */}
                        {dist.status === DistributionStatus.PRICE_REJECTED && (
                          <Badge className="bg-red-100 text-red-800">
                            <XCircle className="h-3 w-3 mr-1" />
                            Đã từ chối giá hãng
                          </Badge>
                        )}
                        
                        {/* Step 6: Confirm received button for PLANNED status */}
                        {dist.status === DistributionStatus.PLANNED && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => openCompleteDialog(dist)}
                            className="bg-purple-600 hover:bg-purple-700"
                          >
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            Xác nhận nhận hàng
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      {dist.invitationMessage && (
                        <div className="flex items-start gap-2">
                          <MessageSquare className="h-4 w-4 mt-0.5 text-muted-foreground" />
                          <span className="text-muted-foreground">{dist.invitationMessage}</span>
                        </div>
                      )}
                      {dist.products && dist.products.length > 0 && (
                        <div>
                          <span className="font-medium">Sản phẩm ({dist.products.length}):</span>
                          <ul className="ml-6 mt-1 space-y-1">
                            {dist.products.slice(0, 3).map((product, idx) => (
                              <li key={idx} className="text-muted-foreground">
                                • {product.name}
                              </li>
                            ))}
                            {dist.products.length > 3 && (
                              <li className="text-muted-foreground">
                                ... và {dist.products.length - 3} sản phẩm khác
                              </li>
                            )}
                          </ul>
                        </div>
                      )}
                      {dist.estimatedDeliveryDate && (
                        <div className="text-blue-600">
                          🚚 Dự kiến giao: {new Date(dist.estimatedDeliveryDate).toLocaleDateString('vi-VN')}
                        </div>
                      )}
                      {dist.evmNotes && (
                        <div className="p-2 bg-green-50 rounded text-green-800">
                          💬 EVM: {dist.evmNotes}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Dialog: Respond to Invitation (CHỈ hiện khi TỪ CHỐI) */}
          <Dialog open={isRespondDialogOpen} onOpenChange={setIsRespondDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>❌ Từ chối lời mời</DialogTitle>
                <DialogDescription>
                  Phân phối #{selectedDistribution?.id}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {selectedDistribution?.invitationMessage && (
                  <div className="p-3 bg-blue-50 rounded">
                    <Label className="text-sm font-medium">Lời mời từ EVM:</Label>
                    <p className="text-sm mt-1">{selectedDistribution.invitationMessage}</p>
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="notes">Lý do từ chối (không bắt buộc)</Label>
                  <Textarea
                    id="notes"
                    placeholder="VD: Hiện tại chúng tôi không có nhu cầu nhập hàng"
                    value={respondForm.notes}
                    onChange={(e) => setRespondForm({ ...respondForm, notes: e.target.value })}
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsRespondDialogOpen(false)}>
                  Hủy
                </Button>
                <Button 
                  onClick={handleRespond}
                  variant="destructive"
                >
                  Từ chối
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Dialog: Submit Order (multi-item) */}
          <Dialog open={isOrderDialogOpen} onOpenChange={setIsOrderDialogOpen}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>🛒 Tạo đơn nhập hàng chi tiết</DialogTitle>
                <DialogDescription>
                  Phân phối #{selectedDistribution?.id}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {/* Items list */}
                <div className="space-y-2">
                  <Label>Chi tiết đơn hàng</Label>
                  <div className="space-y-3">
                    {orderItems.map((item, idx) => (
                      <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end border rounded-md p-3">
                        <div className="md:col-span-6">
                          <Label className="text-sm">Danh mục</Label>
                          <Select
                            value={item.categoryId ? item.categoryId.toString() : undefined}
                            onValueChange={(value) => {
                              const next = [...orderItems];
                              next[idx].categoryId = parseInt(value);
                              setOrderItems(next);
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Danh mục" />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.length === 0 ? (
                                <div className="px-2 py-1 text-sm text-muted-foreground">Chưa có danh mục</div>
                              ) : (
                                categories.map((cat) => (
                                  <SelectItem key={cat.id} value={cat.id.toString()}>
                                    {cat.name}
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                        {/* Đã loại bỏ phần chọn Sản phẩm */}
                        <div className="md:col-span-3">
                          <Label className="text-sm">Màu</Label>
                          <Select
                            value={item.color}
                            onValueChange={(value) => {
                              const next = [...orderItems];
                              next[idx].color = value;
                              setOrderItems(next);
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Màu" />
                            </SelectTrigger>
                            <SelectContent>
                              {COLOR_OPTIONS.map((c) => (
                                <SelectItem key={c} value={c}>{c}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="md:col-span-3">
                          <Label className="text-sm">Số lượng</Label>
                          <Input
                            type="number"
                            min={1}
                            value={item.quantity}
                            onChange={(e) => {
                              const next = [...orderItems];
                              next[idx].quantity = parseInt(e.target.value) || 1;
                              setOrderItems(next);
                            }}
                          />
                        </div>
                        <div className="md:col-span-2 flex md:justify-end">
                          <Button
                            type="button"
                            variant="ghost"
                            className="text-red-600"
                            onClick={() => setOrderItems((prev) => prev.filter((_, i) => i !== idx))}
                            disabled={orderItems.length === 1}
                          >
                            Xóa
                          </Button>
                        </div>
                      </div>
                    ))}
                    <div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setOrderItems((prev) => [...prev, { categoryId: undefined, color: undefined, quantity: 1 }])}
                      >
                        + Thêm dòng
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="requestedDate">Ngày mong muốn nhận hàng</Label>
                  <Input
                    id="requestedDate"
                    type="date"
                    value={orderRequestedDeliveryDate}
                    onChange={(e) => setOrderRequestedDeliveryDate(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="orderNotes">Ghi chú</Label>
                  <Textarea
                    id="orderNotes"
                    placeholder="VD: Cần giao hàng vào buổi sáng, liên hệ trước 1 ngày"
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsOrderDialogOpen(false)}>
                  Hủy
                </Button>
                <Button type="button" onClick={handleSubmitOrder} disabled={isSubmittingOrder}>
                  Gửi đơn nhập hàng
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Dialog: Confirm Received */}
          <Dialog open={isCompleteDialogOpen} onOpenChange={setIsCompleteDialogOpen}>
            <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
              <DialogHeader>
                <DialogTitle>✅ Xác nhận đã nhận hàng</DialogTitle>
                <DialogDescription>
                  Phân phối #{selectedDistribution?.id}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4 overflow-y-auto flex-1">
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
                  <p className="text-sm text-blue-800">
                    ℹ️ Số lượng xe đã giao tới từ hãng sẽ được ghi nhận tự động. Bạn chỉ cần xác nhận đã nhận hàng.
                  </p>
                </div>

                {receivedItems.length > 0 && (
                  <div>
                    <Label className="text-muted-foreground font-semibold">Các xe đã giao tới</Label>
                    <div className="mt-2 space-y-2">
                      {receivedItems.map((row, idx) => {
                        const isMatch = row.ordered === row.received;
                        return (
                          <div key={row.id ?? idx} className={`p-3 border rounded-md ${isMatch ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
                            <div className="font-medium text-lg">{row.name || 'Sản phẩm'}</div>
                            <div className="text-sm text-muted-foreground mt-1">
                              {row.color && <span>Màu sắc: <strong>{row.color}</strong></span>}
                            </div>
                            <div className="mt-3 grid grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <div className="text-xs text-muted-foreground">Số lượng đã đặt</div>
                                <div className="text-2xl font-bold text-blue-600">{row.ordered} xe</div>
                              </div>
                              <div className="space-y-1">
                                <div className="text-xs text-muted-foreground">Số lượng giao tới</div>
                                <div className="text-2xl font-bold text-green-600">{row.received} xe</div>
                              </div>
                            </div>
                            {!isMatch && (
                              <div className="mt-2 p-2 bg-yellow-100 rounded text-sm text-yellow-800 flex items-center gap-2">
                                <span>⚠️</span>
                                <span>Chênh lệch: {row.received - row.ordered > 0 ? '+' : ''}{row.received - row.ordered} xe</span>
                              </div>
                            )}
                            {isMatch && (
                              <div className="mt-2 p-2 bg-green-100 rounded text-sm text-green-800 flex items-center gap-2">
                                <span>✅</span>
                                <span>Khớp đúng số lượng đã đặt</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-3 p-4 bg-gradient-to-r from-blue-50 to-green-50 border border-gray-200 rounded-md">
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">Tổng đã đặt</div>
                          <div className="text-2xl font-bold text-blue-600">
                            {receivedItems.reduce((sum, item) => sum + item.ordered, 0)} xe
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">Tổng giao tới</div>
                          <div className="text-2xl font-bold text-green-600">
                            {receivedItems.reduce((sum, item) => sum + item.received, 0)} xe
                          </div>
                        </div>
                      </div>
                      {receivedItems.reduce((sum, item) => sum + item.ordered, 0) === receivedItems.reduce((sum, item) => sum + item.received, 0) ? (
                        <div className="mt-3 text-center text-sm font-semibold text-green-700">
                          ✅ Số lượng khớp chính xác
                        </div>
                      ) : (
                        <div className="mt-3 text-center text-sm font-semibold text-yellow-700">
                          ⚠️ Chênh lệch: {receivedItems.reduce((sum, item) => sum + item.received, 0) - receivedItems.reduce((sum, item) => sum + item.ordered, 0) > 0 ? '+' : ''}{receivedItems.reduce((sum, item) => sum + item.received, 0) - receivedItems.reduce((sum, item) => sum + item.ordered, 0)} xe
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {receivedItems.length === 0 && (
                  <div className="p-4 border rounded-md bg-gradient-to-r from-blue-50 to-green-50">
                    <div className="grid grid-cols-2 gap-6 text-center">
                      <div>
                        <Label className="text-xs text-muted-foreground">Số lượng đã đặt</Label>
                        <div className="mt-2 text-3xl font-bold text-blue-600">
                          {selectedDistribution?.requestedQuantity || 0}
                        </div>
                        <div className="text-sm text-muted-foreground">xe</div>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Số lượng giao tới</Label>
                        <div className="mt-2 text-3xl font-bold text-green-600">
                          {selectedDistribution?.requestedQuantity || 0}
                        </div>
                        <div className="text-sm text-muted-foreground">xe</div>
                      </div>
                    </div>
                    <div className="mt-4 text-center p-2 bg-green-100 rounded text-sm font-semibold text-green-700">
                      ✅ Số lượng khớp chính xác
                    </div>
                  </div>
                )}
              </div>
              {/* Receipt date selector - Fixed at bottom */}
              <div className="space-y-2 border-t pt-4">
                <Label htmlFor="receiptDate">Ngày nhập kho của đại lý</Label>
                <Input
                  id="receiptDate"
                  type="date"
                  value={receiptDate}
                  onChange={(e) => setReceiptDate(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">Dùng để ghi nhận ngày nhập kho. Mặc định là hôm nay.</p>
              </div>
              <DialogFooter className="border-t pt-4">
                <Button variant="outline" onClick={() => setIsCompleteDialogOpen(false)}>
                  Hủy
                </Button>
                <Button onClick={handleConfirmReceived}>
                  Xác nhận
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Dialog: Distribution Detail */}
          <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Chi tiết Phân phối #{selectedDistribution?.id}</DialogTitle>
                <DialogDescription>
                  <Badge className={getDistributionStatusColor(selectedDistribution?.status || DistributionStatus.INVITED)}>
                    {getDistributionStatusLabel(selectedDistribution?.status || DistributionStatus.INVITED)}
                  </Badge>
                </DialogDescription>
              </DialogHeader>
              {selectedDistribution && (
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">Ngày tạo</Label>
                      <p className="font-medium">
                        {selectedDistribution.createdAt 
                          ? new Date(selectedDistribution.createdAt).toLocaleDateString('vi-VN')
                          : 'N/A'
                        }
                      </p>
                    </div>
                    {selectedDistribution.deadline && (
                      <div>
                        <Label className="text-muted-foreground">Hạn phản hồi</Label>
                        <p className="font-medium">
                          {new Date(selectedDistribution.deadline).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {selectedDistribution.invitationMessage && (
                    <div>
                      <Label className="text-muted-foreground">Lời mời từ EVM</Label>
                      <p className="mt-1 p-3 bg-blue-50 rounded-md">{selectedDistribution.invitationMessage}</p>
                    </div>
                  )}
                  
                  {selectedDistribution.dealerNotes && (
                    <div>
                      <Label className="text-muted-foreground">Ghi chú của bạn</Label>
                      <p className="mt-1 p-3 bg-amber-50 rounded-md">{selectedDistribution.dealerNotes}</p>
                    </div>
                  )}
                  
                  {selectedDistribution.evmNotes && (
                    <div>
                      <Label className="text-muted-foreground">Ghi chú của EVM</Label>
                      <p className="mt-1 p-3 bg-green-50 rounded-md">{selectedDistribution.evmNotes}</p>
                    </div>
                  )}
                  
                  {selectedDistribution.products && selectedDistribution.products.length > 0 && (
                    <div>
                      <Label className="text-muted-foreground">Sản phẩm ({selectedDistribution.products.length})</Label>
                      <div className="mt-2 space-y-2">
                        {selectedDistribution.products.map((product, idx) => (
                          <div key={idx} className="p-3 border rounded-md">
                            <div className="font-medium">{product.name}</div>
                            <div className="text-sm text-muted-foreground">
                              VIN: {product.vinNum} | Engine: {product.engineNum}
                            </div>
                            <div className="text-sm font-medium text-green-600">
                              {product.price?.toLocaleString('vi-VN')}đ
                            </div>
                            {product.stockInDate && (
                              <div className="text-sm text-muted-foreground mt-1">
                                Ngày nhập kho: {new Date(product.stockInDate as any).toLocaleDateString('vi-VN')}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {selectedDistribution.items && selectedDistribution.items.length > 0 && (
                    <div>
                      <Label className="text-muted-foreground">Chi tiết đơn ({selectedDistribution.items.reduce((s, it) => s + (it.quantity || 0), 0)} xe)</Label>
                      <div className="mt-2 space-y-2">
                        {selectedDistribution.items.map((it, idx) => (
                          <div key={idx} className="p-3 border rounded-md">
                            <div className="font-medium">{it.product?.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {it.color ? `Màu: ${it.color} • ` : ''}Số lượng: {it.quantity}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {selectedDistribution.estimatedDeliveryDate && (
                    <div>
                      <Label className="text-muted-foreground">Ngày giao dự kiến</Label>
                      <p className="font-medium">
                        {new Date(selectedDistribution.estimatedDeliveryDate).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  )}
                  
                  {selectedDistribution.actualDeliveryDate && (
                    <div>
                      <Label className="text-muted-foreground">Ngày giao thực tế</Label>
                      <p className="font-medium">
                        {new Date(selectedDistribution.actualDeliveryDate).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  )}
                  
                  {selectedDistribution.feedback && (
                    <div>
                      <Label className="text-muted-foreground">Đánh giá</Label>
                      <p className="mt-1 p-3 bg-purple-50 rounded-md">{selectedDistribution.feedback}</p>
                    </div>
                  )}
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
                  Đóng
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Dialog: Price Negotiation (chấp nhận hoặc từ chối giá hãng) */}
          <Dialog open={isPriceDialogOpen} onOpenChange={setIsPriceDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>💰 Xác nhận Giá Hãng</DialogTitle>
                <DialogDescription>
                  Phân phối #{selectedDistribution?.id}
                </DialogDescription>
              </DialogHeader>
              {selectedDistribution && (
                <div className="space-y-4 py-4">
                  <div className="p-4 bg-amber-50 rounded-md border border-amber-200">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="h-5 w-5 text-amber-600" />
                      <span className="font-semibold text-amber-900">
                        EVM Staff đã duyệt đơn với số lượng khác với yêu cầu
                      </span>
                    </div>
                    <div className="mt-3">
                      <Label className="text-sm text-muted-foreground">Số lượng yêu cầu</Label>
                      <p className="text-lg font-bold">{selectedDistribution.requestedQuantity || 0} xe</p>
                    </div>
                  </div>

                  {/* Chi tiết từng dòng xe mà EVM đã duyệt */}
                  {selectedDistribution.items && selectedDistribution.items.length > 0 && (() => {
                    // Parse evmNotes để lấy thông tin approved/requested cho mỗi item
                    const itemInfoMap = new Map<string, { approved: number; requested: number; price?: number }>();
                    
                    if (selectedDistribution.evmNotes) {
                      // Format: "Duyệt theo dòng: egg (Trắng): 3/3 xe @ 50.000.000.000 VND; vf3 (Xám): 3/4 xe"
                      const match = selectedDistribution.evmNotes.match(/Duyệt theo dòng:\s*(.+?)(\s*\|\s*Ghi chú:|$)/);
                      if (match) {
                        const itemsText = match[1];
                        const itemParts = itemsText.split(';').map(s => s.trim());
                        
                        for (const part of itemParts) {
                          // Parse: "egg (Trắng): 3/3 xe @ 50.000.000.000 VND"
                          const itemMatch = part.match(/^(.+?):\s*(\d+)\/(\d+)\s*xe(?:\s*@\s*([\d.,]+)\s*VND)?/);
                          if (itemMatch) {
                            const key = itemMatch[1].trim(); // "egg (Trắng)"
                            const approved = parseInt(itemMatch[2]);
                            const requested = parseInt(itemMatch[3]);
                            const priceStr = itemMatch[4];
                            const price = priceStr ? parseFloat(priceStr.replace(/,/g, '')) : undefined;
                            itemInfoMap.set(key, { approved, requested, price });
                          }
                        }
                      }
                    }
                    
                    return (
                      <div>
                        <Label className="text-sm font-medium mb-2 block">Chi tiết xe hãng nhập:</Label>
                        <div className="space-y-2">
                          {selectedDistribution.items.map((item) => {
                            const itemKey = `${item.product.name}${item.color ? ' ('+item.color+')' : ''}`;
                            const itemInfo = itemInfoMap.get(itemKey);
                            const isMissing = itemInfo && itemInfo.approved < itemInfo.requested;
                            
                            return (
                              <div 
                                key={item.id} 
                                className={`p-3 rounded-md border ${
                                  isMissing 
                                    ? 'bg-red-50 border-red-300' 
                                    : 'bg-green-50 border-green-200'
                                }`}
                              >
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <p className="font-medium">
                                        {item.product.name} 
                                        {item.color && <span className="text-muted-foreground"> ({item.color})</span>}
                                      </p>
                                      {isMissing && (
                                        <Badge variant="destructive" className="text-xs">
                                          ⚠️ Thiếu hàng
                                        </Badge>
                                      )}
                                    </div>
                                    {itemInfo ? (
                                      <p className="text-sm mt-1">
                                        <span className={isMissing ? 'text-red-700 font-semibold' : 'text-green-700 font-semibold'}>
                                          {itemInfo.approved} xe
                                        </span>
                                        <span className="text-muted-foreground"> / {itemInfo.requested} xe yêu cầu</span>
                                        {isMissing && (
                                          <span className="text-red-600 font-semibold ml-2">
                                            (Thiếu {itemInfo.requested - itemInfo.approved} xe)
                                          </span>
                                        )}
                                      </p>
                                    ) : (
                                      <p className="text-sm text-muted-foreground">
                                        Số lượng: <span className="font-semibold text-green-700">{item.quantity} xe</span>
                                      </p>
                                    )}
                                  </div>
                                  <div className="text-right">
                                    <p className="text-sm text-muted-foreground">Giá hãng</p>
                                    <p className={`text-lg font-bold ${isMissing ? 'text-red-600' : 'text-green-600'}`}>
                                      {item.dealerPrice ? `${item.dealerPrice.toLocaleString('vi-VN')} VND` : 'Chưa có giá'}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}
                  
                  {selectedDistribution.evmNotes && (
                    <div>
                      <Label className="text-sm text-muted-foreground">Ghi chú từ EVM Staff</Label>
                      <p className="mt-1 p-3 bg-green-50 rounded-md text-sm">{selectedDistribution.evmNotes}</p>
                    </div>
                  )}
                  
                  <div className="text-sm text-muted-foreground">
                    Nếu bạn chấp nhận, EVM Staff sẽ tiếp tục lên kế hoạch giao hàng. Nếu từ chối, đơn hàng sẽ bị hủy.
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsPriceDialogOpen(false)}>
                  Đóng
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleRespondToPrice(false)}
                >
                  Từ chối
                </Button>
                <Button
                  variant="default"
                  onClick={() => handleRespondToPrice(true)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Chấp nhận
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </DealerManagerLayout>
    </ProtectedRoute>
  );
}
