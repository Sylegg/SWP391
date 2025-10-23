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
} from '@/lib/distributionApi';
import { getAllProducts } from '@/lib/productApi';
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
  const [isCompleteDialogOpen, setIsCompleteDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  
  // Form states
  const [respondForm, setRespondForm] = useState({
    accepted: true,
    notes: '',
  });
  
  // Multi-item order form state
  const [orderItems, setOrderItems] = useState<{ categoryId?: number; productId: number; color?: string; quantity: number; }[]>([
    { categoryId: undefined, productId: 0, color: undefined, quantity: 1 },
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

    const validItems = orderItems
      .filter((it) => it.productId > 0 && (it.quantity || 0) > 0)
      .map((it) => ({ productId: it.productId, color: it.color || undefined, quantity: it.quantity }));

    if (validItems.length === 0) {
      toast({
        title: '⚠️ Thiếu thông tin',
        description: 'Vui lòng thêm ít nhất 1 dòng sản phẩm hợp lệ',
        variant: 'destructive',
      });
      return;
    }

    try {
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
  };

  // Step 6: Confirm received
  const handleConfirmReceived = async () => {
    if (!selectedDistribution) {
      toast({
        title: '⚠️ Thiếu thông tin',
        description: 'Không xác định được phân phối',
        variant: 'destructive',
      });
      return;
    }
    const totalReceived = receivedItems.length > 0
      ? receivedItems.reduce((s, it) => s + (Number(it.received) || 0), 0)
      : completeForm.receivedQuantity;
    if (!totalReceived || totalReceived < 0) {
      toast({ title: '⚠️ Thiếu thông tin', description: 'Vui lòng nhập số lượng đã nhận', variant: 'destructive' });
      return;
    }
    if (receivedItems.length > 0) {
      const over = receivedItems.find(it => (Number(it.received) || 0) > (Number(it.ordered) || 0));
      if (over) {
        toast({ title: '⚠️ Không hợp lệ', description: 'Số lượng nhận từng dòng không được vượt quá số đã đặt', variant: 'destructive' });
        return;
      }
    }
    try {
      // Convert date to datetime format (add time component)
      // Tự động gán ngày hiện tại
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      const requestData = {
        receivedQuantity: totalReceived,
        actualDeliveryDate: `${yyyy}-${mm}-${dd}T00:00:00`,
        items: receivedItems.length > 0
          ? receivedItems
              .filter((it) => (Number(it.received) || 0) > 0)
              .map((it) => ({ distributionItemId: it.id, receivedQuantity: Number(it.received) || 0 }))
          : undefined,
      };
      
      await confirmDistributionReceived(selectedDistribution.id, requestData);
      toast({
        title: '✅ Xác nhận thành công',
        description: 'Đã xác nhận nhận hàng',
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
    setOrderItems([{ categoryId: undefined, productId: 0, color: undefined, quantity: 1 }]);
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
    setIsCompleteDialogOpen(true);
  };

  const openDetailDialog = (distribution: DistributionRes) => {
    setSelectedDistribution(distribution);
    setIsDetailDialogOpen(true);
  };

  return (
    <ProtectedRoute allowedRoles={['Dealer Manager', 'Admin']}>
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
                        <div className="md:col-span-4">
                          <Label className="text-sm">Danh mục</Label>
                          <Select
                            value={item.categoryId ? item.categoryId.toString() : undefined}
                            onValueChange={(value) => {
                              const next = [...orderItems];
                              next[idx].categoryId = parseInt(value);
                              // reset product when category changes
                              next[idx].productId = 0;
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
                        <div className="md:col-span-4">
                          <Label className="text-sm">Sản phẩm</Label>
                          <Select
                            value={item.productId > 0 ? item.productId.toString() : undefined}
                            onValueChange={(value) => {
                              const next = [...orderItems];
                              next[idx].productId = parseInt(value);
                              setOrderItems(next);
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Sản phẩm" />
                            </SelectTrigger>
                            <SelectContent>
                              {products.length === 0 ? (
                                <div className="px-2 py-1 text-sm text-muted-foreground">
                                  Chưa có sản phẩm khả dụng
                                </div>
                              ) : (
                                (item.categoryId
                                  ? products.filter((p) => p.categoryId === item.categoryId)
                                  : products
                                ).map((product) => (
                                  <SelectItem key={product.id} value={product.id.toString()}>
                                    {product.name}
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="md:col-span-2">
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
                              {['Red','Blue','White','Black','Grey','Silver','Green'].map((c) => (
                                <SelectItem key={c} value={c}>{c}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="md:col-span-2">
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
                        onClick={() => setOrderItems((prev) => [...prev, { productId: 0, color: undefined, quantity: 1 }])}
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
                <Button onClick={handleSubmitOrder}>
                  Gửi đơn nhập hàng
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Dialog: Confirm Received */}
          <Dialog open={isCompleteDialogOpen} onOpenChange={setIsCompleteDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>✅ Xác nhận đã nhận hàng</DialogTitle>
                <DialogDescription>
                  Phân phối #{selectedDistribution?.id}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {receivedItems.length > 0 && (
                  <div>
                    <Label className="text-muted-foreground">Các xe trong đơn (đã gửi trước đó)</Label>
                    <div className="mt-2 space-y-2">
                      {receivedItems.map((row, idx) => (
                        <div key={row.id ?? idx} className="p-3 border rounded-md">
                          <div className="font-medium">{row.name || 'Sản phẩm'}</div>
                          <div className="text-sm text-muted-foreground mb-2">
                            {row.color ? `Màu: ${row.color} • ` : ''}Số lượng đã đặt: {row.ordered}
                          </div>
                          <div className="grid grid-cols-2 gap-3 items-center">
                            <Label className="text-sm">Số lượng nhận</Label>
                            <Input
                              type="number"
                              min={0}
                              max={row.ordered}
                              value={row.received}
                              onChange={(e) => {
                                const val = parseInt(e.target.value || '0');
                                setReceivedItems((prev) => {
                                  const next = [...prev];
                                  next[idx] = { ...next[idx], received: isNaN(val) ? 0 : val };
                                  return next;
                                });
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {receivedItems.length === 0 && (
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Số lượng đã nhận *</Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={completeForm.receivedQuantity}
                      onChange={(e) => setCompleteForm({ ...completeForm, receivedQuantity: parseInt(e.target.value) })}
                    />
                  </div>
                )}
              </div>
              <DialogFooter>
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
        </div>
      </DealerManagerLayout>
    </ProtectedRoute>
  );
}
