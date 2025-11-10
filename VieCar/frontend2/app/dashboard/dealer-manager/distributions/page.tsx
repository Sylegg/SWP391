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
  Plus,
  Eye,
} from 'lucide-react';
import {
  getDistributionsByDealer,
  respondToInvitation,
  submitDistributionOrder,
  confirmDistributionReceived,
  respondToManufacturerPrice,
  createDealerRequest,
} from '@/lib/distributionApi';
import { getProductsByCategory } from '@/lib/productApi';
import { getCategoriesByDealerId } from '@/lib/categoryApi';
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
  const [isNewRequestDialogOpen, setIsNewRequestDialogOpen] = useState(false);
  
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

  // New request form state (for dealer-initiated requests)
  const [newRequestItems, setNewRequestItems] = useState<{ categoryId?: number; color?: string; quantity: number; }[]>([
    { categoryId: undefined, color: undefined, quantity: 1 },
  ]);
  const [newRequestNotes, setNewRequestNotes] = useState('');
  const [newRequestDeliveryDate, setNewRequestDeliveryDate] = useState('');

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
      const [distData, categoryData] = await Promise.all([
        getDistributionsByDealer(user.dealerId),
        getCategoriesByDealerId(user.dealerId), // ✅ CHỈ LẤY CATEGORIES CỦA DEALER NÀY
      ]);
      
      setDistributions(distData);
      setProducts([]); // Products sẽ được load khi chọn category
      setCategories(categoryData || []);
      
      console.log('📊 Dealer Categories loaded:', categoryData?.length, categoryData);
      console.log('� Chỉ hiển thị categories của dealer:', user.dealerId);
      
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
        description: `Đã tải ${distData.length} phân phối của dealer, ${categoryData?.length || 0} danh mục`,
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

  // NEW: Handle create dealer request (Dealer-initiated flow)
  const handleCreateNewRequest = async () => {
    if (!user?.dealerId) {
      toast({
        title: '⚠️ Thiếu thông tin',
        description: 'Không tìm thấy thông tin đại lý',
        variant: 'destructive',
      });
      return;
    }

    const validItems = newRequestItems.filter((it) => (it.categoryId || 0) > 0 && (it.quantity || 0) > 0);

    if (validItems.length === 0) {
      toast({
        title: '⚠️ Thiếu thông tin',
        description: 'Vui lòng thêm ít nhất 1 dòng danh mục hợp lệ',
        variant: 'destructive',
      });
      return;
    }

    const items = validItems.map((it) => ({
      categoryId: it.categoryId!,
      color: it.color || undefined,
      quantity: it.quantity,
    }));

    try {
      setIsSubmittingOrder(true);
      const requestData = {
        dealerId: user.dealerId,
        items,
        dealerNotes: newRequestNotes || undefined,
        requestedDeliveryDate: newRequestDeliveryDate 
          ? `${newRequestDeliveryDate}T00:00:00`
          : undefined,
      };

      await createDealerRequest(requestData);
      toast({
        title: '✅ Tạo yêu cầu thành công',
        description: 'Yêu cầu phân phối đã được gửi đến EVM để duyệt',
      });
      setIsNewRequestDialogOpen(false);
      resetNewRequestForm();
      loadData();
    } catch (error: any) {
      toast({
        title: '❌ Lỗi',
        description: error.message || 'Không thể tạo yêu cầu',
        variant: 'destructive',
      });
    } finally {
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

  const resetNewRequestForm = () => {
    setNewRequestItems([{ categoryId: undefined, color: undefined, quantity: 1 }]);
    setNewRequestNotes('');
    setNewRequestDeliveryDate('');
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
    console.log('🔍 Opening complete dialog. Distribution:', distribution);
    console.log('📦 Items:', distribution.items);
    console.log('📊 requestedQuantity (dealer đặt ban đầu):', distribution.requestedQuantity);
    
    // Build per-item list if available; default received = ordered
    if (distribution.items && distribution.items.length > 0) {
      const list = distribution.items.map((it) => {
        console.log(`   Item ${it.id}: quantity=${it.quantity}, product=${it.product?.name}, color=${it.color}`);
        return {
          id: it.id,
          name: it.product?.name,
          color: it.color,
          ordered: it.quantity || 0, // Số lượng EVM đã duyệt (đã được cập nhật trong approveOrder)
          received: it.quantity || 0, // Mặc định = số đã duyệt
        };
      });
      console.log('📋 Received items list:', list);
      console.log('⚠️ Nếu ordered khác với số EVM duyệt → Backend chưa cập nhật quantity!');
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
        <div className="relative min-h-screen overflow-hidden">
          {/* Animated Water Droplets Background */}
          <div className="fixed inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-[10%] left-[15%] w-32 h-32 bg-purple-400/20 rounded-full blur-3xl animate-float-slow"></div>
            <div className="absolute top-[60%] right-[20%] w-40 h-40 bg-pink-400/20 rounded-full blur-3xl animate-float-medium"></div>
            <div className="absolute bottom-[20%] left-[25%] w-36 h-36 bg-indigo-400/20 rounded-full blur-3xl animate-float-fast"></div>
            <div className="absolute top-[30%] right-[10%] w-28 h-28 bg-rose-300/20 rounded-full blur-2xl animate-float-slow-reverse"></div>
          </div>

          <div className="relative z-10 p-6 space-y-6">
          {/* Liquid Glass Header */}
          <div className="backdrop-blur-md bg-white/70 dark:bg-gray-900/70 p-6 rounded-2xl border border-white/20 shadow-xl">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 bg-clip-text text-transparent flex items-center gap-2">
                  <Package className="h-8 w-8 text-purple-600 drop-shadow-lg" />
                  Phân phối Sản phẩm
                </h1>
                <p className="text-muted-foreground mt-2">
                  Quản lý lời mời nhập hàng và xác nhận nhận hàng từ hãng
                </p>
              </div>
              <Button 
                onClick={() => {
                  console.log('🚀 Opening new request dialog. Categories:', categories.length, categories);
                  setIsNewRequestDialogOpen(true);
                }}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <Plus className="h-4 w-4 mr-2" />
                Tạo yêu cầu mới
              </Button>
            </div>
          </div>

          {/* Stats Cards with Glass Effect */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="backdrop-blur-md bg-gradient-to-br from-yellow-500/20 to-amber-500/20 border border-white/30 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 font-medium">Chờ xử lý</p>
                  <p className="text-3xl font-bold mt-2 text-yellow-600">{stats.pending}</p>
                  <p className="text-xs text-muted-foreground mt-1">Cần phản hồi/gửi đơn</p>
                </div>
                <Clock className="h-10 w-10 text-yellow-500 opacity-70" />
              </div>
              <div className="mt-2 h-1 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            </div>

            <div className="backdrop-blur-md bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-white/30 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">Đang giao</p>
                  <p className="text-3xl font-bold mt-2 text-blue-600">{stats.planned}</p>
                  <p className="text-xs text-muted-foreground mt-1">Chờ nhận hàng</p>
                </div>
                <Truck className="h-10 w-10 text-blue-500 opacity-70" />
              </div>
              <div className="mt-2 h-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            </div>

            <div className="backdrop-blur-md bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-white/30 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-green-700 dark:text-green-300 font-medium">Hoàn thành</p>
                  <p className="text-3xl font-bold mt-2 text-green-600">{stats.completed}</p>
                  <p className="text-xs text-muted-foreground mt-1">Đã nhận đủ hàng</p>
                </div>
                <CheckCircle2 className="h-10 w-10 text-green-500 opacity-70" />
              </div>
              <div className="mt-2 h-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            </div>

            <div className="backdrop-blur-md bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-white/30 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-purple-700 dark:text-purple-300 font-medium">Tổng sản phẩm</p>
                  <p className="text-3xl font-bold mt-2 text-purple-600">{stats.totalProducts}</p>
                  <p className="text-xs text-muted-foreground mt-1">Đã nhận tất cả</p>
                </div>
                <Package className="h-10 w-10 text-purple-500 opacity-70" />
              </div>
              <div className="mt-2 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            </div>
          </div>

          {/* Distribution List - Compact Glass Cards */}
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              <p className="mt-2 text-purple-600 font-medium">Đang tải...</p>
            </div>
          ) : distributions.length === 0 ? (
            <div className="backdrop-blur-md bg-white/60 dark:bg-gray-900/60 p-12 rounded-2xl border border-white/20 shadow-lg text-center">
              <Package className="h-12 w-12 mx-auto text-purple-600 mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Chưa có lời mời phân phối nào</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {distributions.map((dist) => {
                const statusColors: Record<DistributionStatus, string> = {
                  [DistributionStatus.INVITED]: 'from-blue-400/20 to-blue-600/20 border-blue-400/40',
                  [DistributionStatus.ACCEPTED]: 'from-cyan-400/20 to-cyan-600/20 border-cyan-400/40',
                  [DistributionStatus.DECLINED]: 'from-orange-400/20 to-orange-600/20 border-orange-400/40',
                  [DistributionStatus.PENDING]: 'from-yellow-400/20 to-amber-600/20 border-yellow-400/40',
                  [DistributionStatus.CONFIRMED]: 'from-green-400/20 to-emerald-600/20 border-green-400/40',
                  [DistributionStatus.CANCELED]: 'from-gray-400/20 to-gray-600/20 border-gray-400/40',
                  [DistributionStatus.PRICE_SENT]: 'from-indigo-400/20 to-indigo-600/20 border-indigo-400/40',
                  [DistributionStatus.PRICE_ACCEPTED]: 'from-lime-400/20 to-lime-600/20 border-lime-400/40',
                  [DistributionStatus.PRICE_REJECTED]: 'from-red-400/20 to-red-600/20 border-red-400/40',
                  [DistributionStatus.PLANNED]: 'from-purple-400/20 to-purple-600/20 border-purple-400/40',
                  [DistributionStatus.COMPLETED]: 'from-teal-400/20 to-teal-600/20 border-teal-400/40',
                };
                
                return (
                  <div 
                    key={dist.id} 
                    className={`backdrop-blur-md bg-gradient-to-br ${statusColors[dist.status] || 'from-gray-400/20 to-gray-600/20 border-gray-400/40'} p-6 rounded-2xl border shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300`}
                  >
                    <div className="flex justify-between items-start">
                      {/* Left: Compact Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-3">
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                            Mã phân phối: {dist.code || `#${dist.id}`}
                          </h3>
                          <Badge className={`${getDistributionStatusColor(dist.status)} px-4 py-1`}>
                            {getDistributionStatusLabel(dist.status)}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300 mb-3">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {dist.createdAt ? new Date(dist.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                          </span>
                          {dist.deadline && dist.status === DistributionStatus.INVITED && (
                            <span className="flex items-center gap-1 text-amber-600 font-medium">
                              <AlertCircle className="h-4 w-4" />
                              Hạn: {new Date(dist.deadline).toLocaleDateString('vi-VN')}
                            </span>
                          )}
                        </div>
                        
                        {/* Additional Info */}
                        {dist.invitationMessage && (
                          <div className="text-sm text-gray-700 dark:text-gray-300 mb-2 flex items-start gap-2">
                            <MessageSquare className="h-4 w-4 mt-0.5 flex-shrink-0 text-purple-600" />
                            <span>{dist.invitationMessage}</span>
                          </div>
                        )}
                        
                        {dist.products && dist.products.length > 0 && (
                          <div className="text-sm">
                            <span className="font-medium text-gray-900 dark:text-white">
                              Sản phẩm ({dist.products.length}):
                            </span>
                            <span className="ml-2 text-gray-600 dark:text-gray-300">
                              {dist.products.slice(0, 2).map(p => p.name).join(', ')}
                              {dist.products.length > 2 && ` và ${dist.products.length - 2} sản phẩm khác`}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {/* Right: Action Buttons */}
                      <div className="flex gap-2 flex-shrink-0 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openDetailDialog(dist)}
                          className="bg-white/50 dark:bg-gray-800/50 border-white/40 hover:bg-white/70 hover:scale-105 transition-all duration-300"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Chi tiết
                        </Button>
                      
                        {/* Step 2: Accept/Decline buttons for INVITED status */}
                        {dist.status === DistributionStatus.INVITED && (
                          <>
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => openRespondDialog(dist, true)}
                              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 hover:scale-105 transition-all duration-300"
                            >
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              Chấp nhận
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => openRespondDialog(dist, false)}
                              className="hover:scale-105 transition-all duration-300"
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
                            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 hover:scale-105 transition-all duration-300"
                          >
                            <ShoppingCart className="h-4 w-4 mr-1" />
                            Tạo đơn nhập hàng
                          </Button>
                        )}
                        
                        {/* Status PRICE_SENT: EVM gửi giá hãng, chờ dealer phản hồi */}
                        {dist.status === DistributionStatus.PRICE_SENT && (
                          <>
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => openPriceDialog(dist)}
                              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 hover:scale-105 transition-all duration-300"
                            >
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              Xem giá & Chấp nhận
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => openPriceDialog(dist)}
                              className="hover:scale-105 transition-all duration-300"
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Từ chối giá
                            </Button>
                          </>
                        )}
                        
                        {/* Step 6: Confirm received button for PLANNED status */}
                        {dist.status === DistributionStatus.PLANNED && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => openCompleteDialog(dist)}
                            className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 hover:scale-105 transition-all duration-300"
                          >
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            Xác nhận nhận hàng
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Dialog: Respond to Invitation (CHỈ hiện khi TỪ CHỐI) */}
          <Dialog open={isRespondDialogOpen} onOpenChange={setIsRespondDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>❌ Từ chối lời mời</DialogTitle>
                <DialogDescription>
                  Mã phân phối: {selectedDistribution?.code || `#${selectedDistribution?.id}`}
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
                  Mã phân phối: {selectedDistribution?.code || `#${selectedDistribution?.id}`}
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
                  Mã phân phối: {selectedDistribution?.code || `#${selectedDistribution?.id}`}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4 overflow-y-auto flex-1">
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
                  <p className="text-sm text-blue-800">
                    ℹ️ Số lượng xe đã giao tới từ hãng sẽ được ghi nhận tự động. Bạn chỉ cần xác nhận đã nhận hàng.
                  </p>
                  {selectedDistribution?.requestedQuantity && (
                    <p className="text-xs text-blue-600 mt-2">
                      📝 Bạn đã yêu cầu: <strong>{selectedDistribution.requestedQuantity}</strong> xe • 
                      EVM đã duyệt: <strong>
                        {selectedDistribution.approvedQuantity || receivedItems.reduce((sum, item) => sum + item.ordered, 0) || selectedDistribution.requestedQuantity}
                      </strong> xe
                    </p>
                  )}
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
                                <div className="text-xs text-muted-foreground">Số lượng đã duyệt (EVM)</div>
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
                          <div className="text-xs text-muted-foreground mb-1">Tổng đã duyệt (EVM)</div>
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
          {/* Dialog: Detail View with Glass Effect */}
          <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
            <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto backdrop-blur-xl bg-white/95 dark:bg-gray-900/95 border-white/30">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  📋 Chi tiết - Mã phân phối: {selectedDistribution?.code || `#${selectedDistribution?.id}`}
                </DialogTitle>
                <DialogDescription>
                  <Badge className={`${getDistributionStatusColor(selectedDistribution?.status || DistributionStatus.INVITED)} px-4 py-1`}>
                    {getDistributionStatusLabel(selectedDistribution?.status || DistributionStatus.INVITED)}
                  </Badge>
                </DialogDescription>
              </DialogHeader>
              {selectedDistribution && (
                <div className="space-y-4 py-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="backdrop-blur-md bg-gradient-to-br from-blue-50/70 to-cyan-50/70 dark:from-blue-950/70 dark:to-cyan-950/70 p-4 rounded-xl border border-white/30">
                      <Label className="text-sm text-blue-700 dark:text-blue-300 font-medium">📅 Ngày tạo</Label>
                      <p className="font-bold text-lg text-gray-900 dark:text-white mt-1">
                        {selectedDistribution.createdAt 
                          ? new Date(selectedDistribution.createdAt).toLocaleDateString('vi-VN')
                          : 'N/A'
                        }
                      </p>
                    </div>
                    {selectedDistribution.deadline && (
                      <div className="backdrop-blur-md bg-gradient-to-br from-amber-50/70 to-orange-50/70 dark:from-amber-950/70 dark:to-orange-950/70 p-4 rounded-xl border border-white/30">
                        <Label className="text-sm text-amber-700 dark:text-amber-300 font-medium">⏰ Hạn phản hồi</Label>
                        <p className="font-bold text-lg text-gray-900 dark:text-white mt-1">
                          {new Date(selectedDistribution.deadline).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {selectedDistribution.invitationMessage && (
                    <div className="backdrop-blur-md bg-gradient-to-br from-purple-50/70 to-pink-50/70 dark:from-purple-950/70 dark:to-pink-950/70 p-4 rounded-xl border border-white/30">
                      <Label className="text-sm text-purple-700 dark:text-purple-300 font-semibold flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Lời mời từ EVM
                      </Label>
                      <p className="mt-2 text-gray-800 dark:text-gray-200">{selectedDistribution.invitationMessage}</p>
                    </div>
                  )}
                  
                  {selectedDistribution.dealerNotes && (
                    <div className="backdrop-blur-md bg-gradient-to-br from-yellow-50/70 to-amber-50/70 dark:from-yellow-950/70 dark:to-amber-950/70 p-4 rounded-xl border border-white/30">
                      <Label className="text-sm text-yellow-700 dark:text-yellow-300 font-semibold flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Ghi chú của bạn
                      </Label>
                      <p className="mt-2 text-gray-800 dark:text-gray-200">{selectedDistribution.dealerNotes}</p>
                    </div>
                  )}
                  
                  {selectedDistribution.evmNotes && (
                    <div className="backdrop-blur-md bg-gradient-to-br from-green-50/70 to-emerald-50/70 dark:from-green-950/70 dark:to-emerald-950/70 p-4 rounded-xl border border-white/30">
                      <Label className="text-sm text-green-700 dark:text-green-300 font-semibold flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Ghi chú của EVM
                      </Label>
                      <p className="mt-2 text-gray-800 dark:text-gray-200">{selectedDistribution.evmNotes}</p>
                    </div>
                  )}
                  
                  {selectedDistribution.products && selectedDistribution.products.length > 0 && (
                    <div>
                      <Label className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-3">
                        <Package className="h-5 w-5 text-purple-600" />
                        Sản phẩm ({selectedDistribution.products.length})
                      </Label>
                      <div className="space-y-3">
                        {selectedDistribution.products.map((product, idx) => (
                          <div key={idx} className="backdrop-blur-md bg-gradient-to-br from-gray-50/70 to-white/70 dark:from-gray-800/70 dark:to-gray-900/70 p-4 rounded-xl border border-white/30 hover:shadow-lg transition-all duration-300">
                            <div className="font-bold text-lg text-gray-900 dark:text-white">{product.name}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              VIN: <span className="font-mono font-medium">{product.vinNum}</span> | Engine: <span className="font-mono font-medium">{product.engineNum}</span>
                            </div>
                            <div className="text-base font-bold text-green-600 dark:text-green-400 mt-2">
                              💰 {product.price?.toLocaleString('vi-VN')}đ
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
                    <div className="backdrop-blur-md bg-gradient-to-br from-cyan-50/70 to-blue-50/70 dark:from-cyan-950/70 dark:to-blue-950/70 p-4 rounded-xl border border-white/30">
                      <Label className="text-sm text-cyan-700 dark:text-cyan-300 font-semibold flex items-center gap-2">
                        <Truck className="h-4 w-4" />
                        Ngày giao dự kiến
                      </Label>
                      <p className="font-bold text-lg text-gray-900 dark:text-white mt-1">
                        {new Date(selectedDistribution.estimatedDeliveryDate).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  )}
                  
                  {selectedDistribution.actualDeliveryDate && (
                    <div className="backdrop-blur-md bg-gradient-to-br from-green-50/70 to-emerald-50/70 dark:from-green-950/70 dark:to-emerald-950/70 p-4 rounded-xl border border-white/30">
                      <Label className="text-sm text-green-700 dark:text-green-300 font-semibold flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4" />
                        Ngày giao thực tế
                      </Label>
                      <p className="font-bold text-lg text-gray-900 dark:text-white mt-1">
                        {new Date(selectedDistribution.actualDeliveryDate).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  )}
                  
                  {selectedDistribution.feedback && (
                    <div className="backdrop-blur-md bg-gradient-to-br from-pink-50/70 to-rose-50/70 dark:from-pink-950/70 dark:to-rose-950/70 p-4 rounded-xl border border-white/30">
                      <Label className="text-sm text-pink-700 dark:text-pink-300 font-semibold flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Đánh giá
                      </Label>
                      <p className="mt-2 text-gray-800 dark:text-gray-200">{selectedDistribution.feedback}</p>
                    </div>
                  )}
                </div>
              )}
              <DialogFooter className="gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setIsDetailDialogOpen(false)}
                  className="bg-white/50 hover:bg-white/70 border-white/40"
                >
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
                  Mã phân phối: {selectedDistribution?.code || `#${selectedDistribution?.id}`}
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
                    // Parse evmNotes để lấy requested quantity cho từng item
                    // Format: "Duyệt theo dòng: vf3 (Đen): 5/10 xe @ 10.000 VND; vf3 (Xanh): 3/5 xe @ 20.000 VND"
                    const itemRequestedMap = new Map<string, number>();
                    
                    if (selectedDistribution.evmNotes) {
                      const match = selectedDistribution.evmNotes.match(/Duyệt theo dòng:\s*(.+?)(\s*\|\s*Ghi chú:|$)/);
                      if (match) {
                        const itemsText = match[1];
                        const itemParts = itemsText.split(';').map(s => s.trim());
                        
                        for (const part of itemParts) {
                          // Parse: "vf3 (Đen): 5/10 xe @ 10.000 VND"
                          const itemMatch = part.match(/^(.+?):\s*(\d+)\/(\d+)\s*xe/);
                          if (itemMatch) {
                            const key = itemMatch[1].trim(); // "vf3 (Đen)"
                            const requestedQty = parseInt(itemMatch[3]); // 10
                            itemRequestedMap.set(key, requestedQty);
                          }
                        }
                      }
                    }
                    
                    return (
                      <div>
                        <Label className="text-sm font-medium mb-2 block">Chi tiết xe hãng nhập:</Label>
                        <div className="space-y-2">
                          {selectedDistribution.items.map((item) => {
                            // Backend đã update item.quantity = approved quantity
                            const approvedQty = item.quantity || 0;
                            
                            // Lấy requested quantity từ evmNotes, fallback về distribution total nếu không parse được
                            const itemKey = `${item.product?.name || item.category?.name || 'Unknown'}${item.color ? ' ('+item.color+')' : ''}`;
                            const requestedQty = itemRequestedMap.get(itemKey) || (selectedDistribution.requestedQuantity || 0);
                            const isMissing = approvedQty < requestedQty;
                            
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
                                        {item.product?.name || item.category?.name || 'Sản phẩm'} 
                                        {item.color && <span className="text-muted-foreground"> ({item.color})</span>}
                                      </p>
                                      {isMissing && (
                                        <Badge variant="destructive" className="text-xs">
                                          ⚠️ Thiếu hàng
                                        </Badge>
                                      )}
                                    </div>
                                    <p className="text-sm mt-1">
                                      <span className={isMissing ? 'text-red-700 font-semibold' : 'text-green-700 font-semibold'}>
                                        {approvedQty} xe được duyệt
                                      </span>
                                      <span className="text-muted-foreground"> / {requestedQty} xe yêu cầu</span>
                                      {isMissing && (
                                        <span className="text-red-600 font-semibold ml-2">
                                          (Thiếu {requestedQty - approvedQty} xe)
                                        </span>
                                      )}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-sm text-muted-foreground">Giá hãng</p>
                                    <p className={`text-lg font-bold ${isMissing ? 'text-red-600' : 'text-green-600'}`}>
                                      {item.dealerPrice 
                                        ? `${item.dealerPrice.toLocaleString('vi-VN')} VND` 
                                        : 'Chưa có giá'}
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

          {/* NEW REQUEST DIALOG - Dealer-initiated request with Glass Effect */}
          <Dialog open={isNewRequestDialogOpen} onOpenChange={setIsNewRequestDialogOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto backdrop-blur-xl bg-white/95 dark:bg-gray-900/95 border-white/30">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 bg-clip-text text-transparent flex items-center gap-2">
                  🚀 Tạo yêu cầu phân phối mới
                </DialogTitle>
                <DialogDescription className="text-base">
                  Tạo yêu cầu nhập hàng trực tiếp từ hãng (không cần chờ lời mời)
                  {categories.length > 0 && (
                    <span className="inline-flex items-center gap-1 ml-2 px-2 py-0.5 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full text-sm font-medium">
                      <CheckCircle2 className="h-3 w-3" />
                      {categories.length} danh mục có sẵn
                    </span>
                  )}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Categories loading check */}
                {categories.length === 0 && (
                  <div className="backdrop-blur-md bg-gradient-to-br from-amber-50/80 to-orange-50/80 dark:from-amber-950/80 dark:to-orange-950/80 p-4 rounded-xl border border-amber-300/50">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-amber-800 dark:text-amber-200 font-semibold mb-2">
                          ⚠️ Chưa tải được danh mục xe
                        </p>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={loadData}
                          disabled={loading}
                          className="bg-white/50 hover:bg-white/70"
                        >
                          {loading ? 'Đang tải...' : '🔄 Tải lại'}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Items */}
                <div className="backdrop-blur-md bg-gradient-to-br from-purple-50/60 to-pink-50/60 dark:from-purple-950/60 dark:to-pink-950/60 p-6 rounded-2xl border border-white/30">
                  <Label className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-1">
                    <Package className="h-5 w-5 text-purple-600" />
                    📋 Danh sách sản phẩm yêu cầu
                  </Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Chọn danh mục, màu sắc và số lượng cho từng dòng
                  </p>
                  
                  <div className="space-y-3">
                  {newRequestItems.map((item, idx) => (
                    <div key={idx} className="backdrop-blur-sm bg-white/60 dark:bg-gray-800/60 p-4 rounded-xl border border-white/30 hover:shadow-md transition-all duration-300">
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start">
                        {/* Category Select - takes more space */}
                        <div className="md:col-span-5">
                          <Label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">Danh mục</Label>
                          <Select
                            value={item.categoryId?.toString() || ''}
                            onValueChange={(val) => {
                              const updated = [...newRequestItems];
                              updated[idx].categoryId = val ? parseInt(val) : undefined;
                              setNewRequestItems(updated);
                            }}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Chọn danh mục..." />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.length === 0 ? (
                                <div className="p-2 text-sm text-muted-foreground text-center">
                                  Không có danh mục nào
                                </div>
                              ) : (
                                categories.map((cat) => (
                                  <SelectItem key={cat.id} value={cat.id.toString()}>
                                    {cat.name} ({cat.brand})
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        {/* Color Select */}
                        <div className="md:col-span-3">
                          <Label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">Màu sắc</Label>
                          <Select
                            value={item.color || ''}
                            onValueChange={(val) => {
                              const updated = [...newRequestItems];
                              updated[idx].color = val || undefined;
                              setNewRequestItems(updated);
                            }}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Màu..." />
                            </SelectTrigger>
                            <SelectContent>
                              {COLOR_OPTIONS.map((color) => (
                                <SelectItem key={color} value={color}>
                                  {color}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        {/* Quantity Input */}
                        <div className="md:col-span-3">
                          <Label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">Số lượng</Label>
                          <Input
                            type="number"
                            placeholder="SL"
                            className="w-full"
                            min={1}
                            value={item.quantity || ''}
                            onChange={(e) => {
                              const updated = [...newRequestItems];
                              updated[idx].quantity = parseInt(e.target.value) || 0;
                              setNewRequestItems(updated);
                            }}
                          />
                        </div>
                        
                        {/* Delete Button */}
                        <div className="md:col-span-1 flex items-end pb-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              if (newRequestItems.length > 1) {
                                setNewRequestItems(newRequestItems.filter((_, i) => i !== idx));
                              }
                            }}
                            disabled={newRequestItems.length === 1}
                            className="h-10 w-10 hover:bg-red-50 dark:hover:bg-red-950/20"
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setNewRequestItems([...newRequestItems, { categoryId: undefined, color: undefined, quantity: 1 }]);
                    }}
                    className="mt-3 bg-white/50 hover:bg-white/70 border-purple-200 hover:border-purple-400 hover:scale-105 transition-all duration-300"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Thêm dòng
                  </Button>
                  
                  <div className="mt-4 p-3 backdrop-blur-sm bg-blue-50/70 dark:bg-blue-950/70 rounded-lg border border-blue-200/50">
                    <p className="text-sm text-blue-800 dark:text-blue-200 font-semibold">
                      🚗 Tổng số lượng: <span className="text-lg">{newRequestItems.reduce((s, it) => s + (Number(it.quantity) || 0), 0)}</span> xe
                    </p>
                  </div>
                  </div>
                </div>

                {/* Requested Delivery Date */}
                <div className="backdrop-blur-md bg-gradient-to-br from-cyan-50/60 to-blue-50/60 dark:from-cyan-950/60 dark:to-blue-950/60 p-5 rounded-2xl border border-white/30">
                  <Label htmlFor="newRequestDeliveryDate" className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-3">
                    <Calendar className="h-5 w-5 text-cyan-600" />
                    📅 Ngày giao hàng mong muốn
                  </Label>
                  <Input
                    id="newRequestDeliveryDate"
                    type="date"
                    value={newRequestDeliveryDate}
                    onChange={(e) => setNewRequestDeliveryDate(e.target.value)}
                    className="bg-white/70 dark:bg-gray-800/70 border-white/40 focus:border-cyan-400"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                {/* Notes */}
                <div className="backdrop-blur-md bg-gradient-to-br from-green-50/60 to-emerald-50/60 dark:from-green-950/60 dark:to-emerald-950/60 p-5 rounded-2xl border border-white/30">
                  <Label htmlFor="newRequestNotes" className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-3">
                    <MessageSquare className="h-5 w-5 text-green-600" />
                    💬 Ghi chú
                  </Label>
                  <Textarea
                    id="newRequestNotes"
                    placeholder="Thêm ghi chú về yêu cầu này..."
                    value={newRequestNotes}
                    onChange={(e) => setNewRequestNotes(e.target.value)}
                    rows={3}
                    className="bg-white/70 dark:bg-gray-800/70 border-white/40 focus:border-green-400"
                  />
                </div>

                <div className="backdrop-blur-md bg-gradient-to-br from-blue-50/70 to-cyan-50/70 dark:from-blue-950/70 dark:to-cyan-950/70 p-4 rounded-xl border border-blue-300/50">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      <strong>ℹ️ Lưu ý:</strong> Yêu cầu sẽ được gửi trực tiếp đến EVM để duyệt. 
                      Sau khi EVM duyệt và báo giá, bạn sẽ cần xác nhận giá trước khi tiếp tục quy trình giao hàng.
                    </p>
                  </div>
                </div>
              </div>

              <DialogFooter className="gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsNewRequestDialogOpen(false);
                    resetNewRequestForm();
                  }}
                  className="bg-white/50 hover:bg-white/70 border-white/40"
                >
                  Hủy
                </Button>
                <Button
                  onClick={handleCreateNewRequest}
                  disabled={isSubmittingOrder || newRequestItems.filter(it => (it.categoryId || 0) > 0).length === 0}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  {isSubmittingOrder ? (
                    <>
                      <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Đang gửi...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      ✅ Gửi yêu cầu
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          </div>
        </div>
      </DealerManagerLayout>
    </ProtectedRoute>
  );
}
