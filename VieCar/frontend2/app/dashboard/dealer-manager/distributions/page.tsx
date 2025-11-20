"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  Car,
  TrendingUp,
  CheckCircle,
  CreditCard,
  DollarSign,
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
  const router = useRouter();
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
    { id: number; name?: string; color?: string; ordered: number; received: number; price?: number }[]
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
        duration: 3000,
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
      
      // Không hiển thị toast khi load data thành công - chỉ hiển thị khi có lỗi hoặc action quan trọng
    } catch (error: any) {
      toast({
        title: '❌ Lỗi',
        description: error.message || 'Không thể tải dữ liệu',
        variant: 'destructive',
        duration: 3000,
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
        duration: 3000,
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
        duration: 3000,
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
        duration: 3000,
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
          duration: 3000,
        });
        return;
      }
    }

    // Validate all items have required fields (category, color, quantity)
    const invalidItems = orderItems.filter((it, idx) => {
      if (!it.categoryId) return true;
      if (!it.color || it.color.trim() === '') return true;
      if (!it.quantity || it.quantity <= 0) return true;
      return false;
    });

    if (invalidItems.length > 0) {
      toast({
        title: '⚠️ Thiếu thông tin',
        description: 'Vui lòng chọn đầy đủ danh mục, màu sắc và số lượng cho tất cả các dòng',
        variant: 'destructive',
        duration: 3000,
      });
      return;
    }

    // Validate requested delivery date
    if (!orderRequestedDeliveryDate) {
      toast({
        title: '⚠️ Thiếu ngày giao hàng',
        description: 'Vui lòng chọn ngày giao hàng mong muốn',
        variant: 'destructive',
        duration: 3000,
      });
      return;
    }

    // Check if date is within 30 days
    const selectedDate = new Date(orderRequestedDeliveryDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const maxDate = new Date(today);
    maxDate.setDate(maxDate.getDate() + 30);

    if (selectedDate < today) {
      toast({
        title: '⚠️ Ngày không hợp lệ',
        description: 'Ngày giao hàng không thể là ngày trong quá khứ',
        variant: 'destructive',
        duration: 3000,
      });
      return;
    }

    if (selectedDate > maxDate) {
      toast({
        title: '⚠️ Ngày vượt quá giới hạn',
        description: 'Ngày giao hàng phải trong vòng 30 ngày kể từ hôm nay',
        variant: 'destructive',
        duration: 3000,
      });
      return;
    }

    // ✅ SIMPLIFIED: Gửi trực tiếp categoryId cho backend, không cần resolve productId
    const categoryItems = orderItems.filter((it) => (it.categoryId || 0) > 0 && (it.quantity || 0) > 0);

    if (categoryItems.length === 0) {
      toast({
        title: '⚠️ Thiếu thông tin',
        description: 'Vui lòng thêm ít nhất 1 dòng danh mục hợp lệ',
        variant: 'destructive',
        duration: 3000,
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
        duration: 3000,
      });
      setIsOrderDialogOpen(false);
      resetOrderForm();
      loadData();
    } catch (error: any) {
      toast({
        title: '❌ Lỗi',
        description: error.message || 'Không thể gửi đơn',
        variant: 'destructive',
        duration: 3000,
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
        duration: 3000,
      });
      return;
    }

    // Validate all items have required fields
    const invalidItems = newRequestItems.filter((it, idx) => {
      if (!it.categoryId) return true;
      if (!it.color || it.color.trim() === '') return true;
      if (!it.quantity || it.quantity <= 0) return true;
      return false;
    });

    if (invalidItems.length > 0) {
      toast({
        title: '⚠️ Thiếu thông tin',
        description: 'Vui lòng chọn đầy đủ danh mục, màu sắc và số lượng cho tất cả các dòng',
        variant: 'destructive',
        duration: 3000,
      });
      return;
    }

    const validItems = newRequestItems.filter((it) => (it.categoryId || 0) > 0 && (it.quantity || 0) > 0);

    if (validItems.length === 0) {
      toast({
        title: '⚠️ Thiếu thông tin',
        description: 'Vui lòng thêm ít nhất 1 dòng danh mục hợp lệ',
        variant: 'destructive',
        duration: 3000,
      });
      return;
    }

    // Validate requested delivery date
    if (!newRequestDeliveryDate) {
      toast({
        title: '⚠️ Thiếu ngày giao hàng',
        description: 'Vui lòng chọn ngày giao hàng mong muốn',
        variant: 'destructive',
        duration: 3000,
      });
      return;
    }

    // Check if date is within 30 days
    const selectedDate = new Date(newRequestDeliveryDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const maxDate = new Date(today);
    maxDate.setDate(maxDate.getDate() + 30);

    if (selectedDate < today) {
      toast({
        title: '⚠️ Ngày không hợp lệ',
        description: 'Ngày giao hàng không thể là ngày trong quá khứ',
        variant: 'destructive',
        duration: 3000,
      });
      return;
    }

    if (selectedDate > maxDate) {
      toast({
        title: '⚠️ Ngày vượt quá giới hạn',
        description: 'Ngày giao hàng phải trong vòng 30 ngày kể từ hôm nay',
        variant: 'destructive',
        duration: 3000,
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
        duration: 3000,
      });
      setIsNewRequestDialogOpen(false);
      resetNewRequestForm();
      loadData();
    } catch (error: any) {
      toast({
        title: '❌ Lỗi',
        description: error.message || 'Không thể tạo yêu cầu',
        variant: 'destructive',
        duration: 3000,
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
        duration: 3000,
      });
      return;
    }
    
    // Lấy số lượng thực tế giao tới (received) - đây là số xe hãng đã giao
    const totalReceived = receivedItems.length > 0
      ? receivedItems.reduce((s, it) => s + (Number(it.received) || 0), 0)
      : selectedDistribution.approvedQuantity || selectedDistribution.requestedQuantity || 0;
    
    // Số lượng EVM đã duyệt (đây là số tối đa có thể nhận)
    const totalOrdered = receivedItems.length > 0
      ? receivedItems.reduce((s, it) => s + (Number(it.ordered) || 0), 0)
      : selectedDistribution.approvedQuantity || selectedDistribution.requestedQuantity || 0;
    
    if (!totalReceived || totalReceived <= 0) {
      toast({ 
        title: '⚠️ Không có dữ liệu', 
        description: 'Không tìm thấy thông tin số lượng đã giao', 
        variant: 'destructive',
        duration: 3000,
      });
      return;
    }
    
    // VALIDATION: Số lượng nhận không được vượt quá số đã duyệt
    if (totalReceived > totalOrdered) {
      toast({ 
        title: '⚠️ Số lượng không hợp lệ', 
        description: `Số lượng nhận (${totalReceived}) không thể lớn hơn số lượng EVM đã duyệt (${totalOrdered})`, 
        variant: 'destructive',
        duration: 4000,
      });
      return;
    }
    
    // Kiểm tra chênh lệch
    const difference = totalReceived - totalOrdered;
    let confirmMessage = `Xác nhận nhận ${totalReceived} xe từ hãng`;
    if (difference < 0) {
      confirmMessage += `\n(Thiếu ${Math.abs(difference)} xe so với số đã duyệt)`;
    } else if (difference === 0) {
      confirmMessage += `\n(Khớp đúng số lượng đã duyệt)`;
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
        duration: 3000,
      });
    }
  };

  // Handler: Xác nhận nhận hàng (sau khi thanh toán thành công)
  const handleConfirmReceivedAfterPayment = async () => {
    if (!selectedDistribution) return;

    try {
      const totalReceived = receivedItems.reduce((sum, item) => sum + (item.received || 0), 0);
      const confirmMessage = `Xác nhận nhận ${totalReceived} xe cho phân phối ${selectedDistribution.code || selectedDistribution.id}`;

      const actualDeliveryDate =
        receiptDate ||
        (() => {
          const today = new Date();
          const yyyy = today.getFullYear();
          const mm = String(today.getMonth() + 1).padStart(2, '0');
          const dd = String(today.getDate()).padStart(2, '0');
          return `${yyyy}-${mm}-${dd}T00:00:00`;
        })();

      const requestData = {
        receivedQuantity: totalReceived,
        actualDeliveryDate,
        items: receivedItems.length > 0
          ? receivedItems
              .filter((it) => (Number(it.received) || 0) > 0)
              .map((it) => ({ 
                distributionItemId: it.id, 
                receivedQuantity: Number(it.received) || 0
              }))
          : undefined,
      };
      
      await confirmDistributionReceived(selectedDistribution.id, requestData);
      toast({
        title: '✅ Xác nhận thành công',
        description: confirmMessage,
        duration: 3000,
      });
      setIsCompleteDialogOpen(false);
      resetCompleteForm();
      loadData();
    } catch (error: any) {
      toast({
        title: '❌ Lỗi',
        description: error.message || 'Không thể xác nhận',
        variant: 'destructive',
        duration: 3000,
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
          duration: 3000,
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
          duration: 3000,
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
    console.log('📊 approvedQuantity (EVM đã duyệt - tổng):', distribution.approvedQuantity);
    
    // Build per-item list if available; default received = ordered
    if (distribution.items && distribution.items.length > 0) {
      // Check if backend provides per-item approvedQuantity
      const hasItemApprovedQty = distribution.items.some(it => it.approvedQuantity !== undefined && it.approvedQuantity !== null);
      
      // Calculate total requested quantity
      const totalRequested = distribution.items.reduce((sum, it) => sum + (it.quantity || 0), 0);
      
      // Calculate approval ratio if we have total approved but not per-item
      const approvalRatio = distribution.approvedQuantity && totalRequested > 0
        ? distribution.approvedQuantity / totalRequested
        : 1;
      
      console.log('🔢 Has item-level approvedQuantity:', hasItemApprovedQty);
      console.log('🔢 Total requested:', totalRequested);
      console.log('🔢 Total approved:', distribution.approvedQuantity);
      console.log('🔢 Approval ratio:', approvalRatio);
      
      const list = distribution.items.map((it) => {
        console.log(`   Item ${it.id}: quantity=${it.quantity}, approvedQuantity=${it.approvedQuantity}, dealerPrice=${it.dealerPrice}, product=${it.product?.name}, color=${it.color}`);
        
        // Get product or category name and remove numbering like (1), (2), etc.
        const rawName = it.product?.name || it.category?.name;
        const cleanName = rawName ? rawName.replace(/\s*\(\d+\)\s*$/, '') : undefined;
        
        // Determine approved quantity for this item
        let approvedQty: number;
        if (it.approvedQuantity !== undefined && it.approvedQuantity !== null) {
          // Backend provides per-item approved quantity - use it directly
          approvedQty = it.approvedQuantity;
          console.log(`   ✅ Using item.approvedQuantity: ${approvedQty}`);
        } else if (distribution.approvedQuantity !== undefined && distribution.approvedQuantity !== null) {
          // Backend only provides total approved - calculate proportionally
          approvedQty = Math.round((it.quantity || 0) * approvalRatio);
          console.log(`   ⚙️ Calculated from ratio: ${it.quantity} × ${approvalRatio.toFixed(2)} = ${approvedQty}`);
        } else {
          // No approval data - fallback to requested quantity
          approvedQty = it.quantity || 0;
          console.log(`   ⚠️ Fallback to quantity: ${approvedQty}`);
        }
        
        return {
          id: it.id,
          name: cleanName,
          color: it.color,
          ordered: approvedQty, // Số lượng EVM đã duyệt (calculated or from API)
          received: approvedQty, // Mặc định = số đã duyệt
          price: it.dealerPrice || 0, // Giá hãng bán cho dealer
        };
      });
      
      console.log('📋 Received items list:', list);
      console.log('✅ Total ordered:', list.reduce((s, it) => s + it.ordered, 0));
      
      setReceivedItems(list);
      const total = list.reduce((s, it) => s + (it.received || 0), 0);
      setCompleteForm({ receivedQuantity: total });
    } else {
      setReceivedItems([]);
      setCompleteForm({ receivedQuantity: distribution.approvedQuantity || distribution.requestedQuantity || (distribution.products?.length || 0) });
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
    
    if (!accepted) {
      // Từ chối giá - xử lý trực tiếp
      try {
        const notes = 'Từ chối do không đủ số lượng yêu cầu';
        await respondToManufacturerPrice(selectedDistribution.id, accepted, notes);
        
        toast({
          title: '❌ Đã từ chối',
          description: 'Đã từ chối do không đủ số lượng - Đơn hàng bị hủy',
          duration: 3000,
        });
        setIsPriceDialogOpen(false);
        loadData();
      } catch (error: any) {
        toast({
          title: '❌ Lỗi',
          description: error.message || 'Không thể phản hồi giá',
          variant: 'destructive',
          duration: 3000,
        });
      }
      return;
    }
    
    // Chấp nhận giá - tự động xác nhận thanh toán luôn
    setIsPriceDialogOpen(false);
    
    try {
      // Chấp nhận giá và chuyển trạng thái sang CONFIRMED (Xác nhận)
      const notes = 'Đồng ý với giá hãng và xác nhận';
      await respondToManufacturerPrice(selectedDistribution.id, true, notes);

      toast({
        title: '✅ Xác nhận thành công',
        description: 'Đã xác nhận và chuyển trạng thái thành "Xác nhận"',
        duration: 3000,
      });
      
      // Reload data để cập nhật trạng thái mới
      await loadData();
      
    } catch (error: any) {
      console.error('Payment confirmation error:', error);
      toast({
        title: '⚠️ Lỗi xác nhận',
        description: error.message || 'Không thể xác nhận thanh toán. Vui lòng thử lại.',
        variant: 'destructive',
        duration: 5000,
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
                    className={`backdrop-blur-md bg-gradient-to-br ${
                      dist.isSupplementary 
                        ? 'from-orange-400/20 to-amber-400/20 border-orange-400/50 ring-2 ring-orange-400/30' 
                        : statusColors[dist.status] || 'from-gray-400/20 to-gray-600/20 border-gray-400/40'
                    } p-6 rounded-2xl border shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300`}
                  >
                    <div className="flex justify-between items-start">
                      {/* Left: Compact Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3 flex-wrap">
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                            Mã phân phối: {dist.code || `PP${String(dist.id).padStart(4, '0')}`}
                          </h3>
                          
                          {/* Badge đơn bổ sung - gọn nhẹ */}
                          {dist.isSupplementary && (
                            <Badge className="bg-gradient-to-r from-orange-500 to-amber-600 text-white px-2.5 py-1 text-xs font-semibold border-0 flex items-center gap-1.5">
                              <Package className="h-3.5 w-3.5" />
                              Đơn bổ sung
                            </Badge>
                          )}
                          
                          <Badge className={`${getDistributionStatusColor(dist.status)} px-3 py-1`}>
                            {getDistributionStatusLabel(dist.status)}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300 mb-3">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {dist.createdAt ? new Date(dist.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                          </span>
                          
                          {/* Thông tin đơn gốc nếu là đơn bổ sung - inline */}
                          {dist.isSupplementary && dist.parentDistributionId && (
                            <span className="flex items-center gap-1.5 text-orange-600 font-medium">
                              <AlertCircle className="h-4 w-4" />
                              Bổ sung cho {(() => {
                                const parent = distributions.find(d => d.id === dist.parentDistributionId);
                                return parent?.code || `PP${String(dist.parentDistributionId).padStart(4, '0')}`;
                              })()}
                            </span>
                          )}
                          
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
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => openPriceDialog(dist)}
                            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 hover:scale-105 transition-all duration-300"
                          >
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            Xem giá & Chấp nhận
                          </Button>
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

          {/* Dialog: Submit Order (multi-item) - Enhanced Design */}
          <Dialog open={isOrderDialogOpen} onOpenChange={setIsOrderDialogOpen}>
            <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto backdrop-blur-xl bg-gradient-to-br from-green-50/95 to-emerald-50/95 dark:from-green-950/95 dark:to-emerald-950/95 border-2 border-green-200/50 dark:border-green-800/50 shadow-2xl">
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <DialogTitle className="text-3xl bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent font-bold">
                      🛒 Tạo đơn nhập hàng chi tiết
                    </DialogTitle>
                    <p className="text-sm text-gray-500 mt-1">
                      Mã phân phối: <span className="font-mono font-semibold text-green-600">{selectedDistribution?.code || `#${selectedDistribution?.id}`}</span>
                    </p>
                  </div>
                  <Badge className="bg-green-600 text-white px-4 py-2 text-base">
                    <ShoppingCart className="h-4 w-4 mr-1 inline" />
                    {orderItems.filter(it => it.categoryId).length} loại xe
                  </Badge>
                </div>
              </DialogHeader>
              <div className="space-y-6 py-4">
                {/* Items list - Enhanced Design */}
                <div className="backdrop-blur-md bg-gradient-to-br from-green-50/80 to-emerald-50/80 dark:from-green-950/80 dark:to-emerald-950/80 p-6 rounded-xl border-2 border-green-200/50 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Package className="h-6 w-6 text-green-600" />
                      <Label className="text-xl font-bold text-green-800 dark:text-green-200">
                        📋 Chi tiết đơn hàng
                      </Label>
                    </div>
                    <Badge variant="outline" className="text-green-700 border-green-400 text-base px-3 py-1">
                      Tổng: {totalOrderQty} xe
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-5 ml-8">
                    Chọn danh mục, màu sắc và số lượng cho từng dòng sản phẩm
                  </p>
                  <div className="space-y-3">
                    {orderItems.map((item, idx) => {
                      // Get colors already selected for this category
                      const selectedColorsForCategory = orderItems
                        .filter((it, i) => i !== idx && it.categoryId === item.categoryId && it.color)
                        .map(it => it.color);
                      
                      return (
                      <div key={idx} className="backdrop-blur-sm bg-white/70 dark:bg-gray-800/70 p-4 rounded-xl border border-green-200/40 hover:border-green-400/60 hover:shadow-lg transition-all duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start">
                        {/* Row Number */}
                        <div className="md:col-span-1 flex items-center justify-center">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
                            {idx + 1}
                          </div>
                        </div>
                        
                        <div className="md:col-span-4">
                          <Label className="text-xs font-semibold text-green-700 dark:text-green-300 mb-1.5 block">🚗 Danh mục</Label>
                          <Select
                            value={item.categoryId ? item.categoryId.toString() : undefined}
                            onValueChange={(value) => {
                              const next = [...orderItems];
                              next[idx].categoryId = parseInt(value);
                              // Reset color when category changes
                              next[idx].color = undefined;
                              setOrderItems(next);
                            }}
                          >
                            <SelectTrigger className="w-full bg-white/80 dark:bg-gray-900/80 border-green-200 focus:border-green-400">
                              <SelectValue placeholder="Chọn danh mục..." />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.length === 0 ? (
                                <div className="px-2 py-1 text-sm text-muted-foreground">Chưa có danh mục</div>
                              ) : (
                                categories.map((cat) => (
                                  <SelectItem key={cat.id} value={cat.id.toString()}>
                                    <span className="font-semibold">{cat.name}</span> <span className="text-gray-500">({cat.brand})</span>
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="md:col-span-3">
                          <Label className="text-xs font-semibold text-green-700 dark:text-green-300 mb-1.5 block">🎨 Màu sắc</Label>
                          <Select
                            value={item.color}
                            onValueChange={(value) => {
                              const next = [...orderItems];
                              next[idx].color = value;
                              setOrderItems(next);
                            }}
                            disabled={!item.categoryId}
                          >
                            <SelectTrigger className="w-full bg-white/80 dark:bg-gray-900/80 border-green-200 focus:border-green-400">
                              <SelectValue placeholder={item.categoryId ? "Chọn màu..." : "Chọn danh mục trước"} />
                            </SelectTrigger>
                            <SelectContent>
                              {COLOR_OPTIONS.map((c) => {
                                const isAlreadySelected = selectedColorsForCategory.includes(c);
                                return (
                                  <SelectItem 
                                    key={c} 
                                    value={c}
                                    disabled={isAlreadySelected}
                                    className={isAlreadySelected ? "opacity-50 cursor-not-allowed" : ""}
                                  >
                                    {c} {isAlreadySelected ? "✓" : ""}
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="md:col-span-3">
                          <Label className="text-xs font-semibold text-green-700 dark:text-green-300 mb-1.5 block">📦 Số lượng</Label>
                          <Input
                            type="number"
                            min={1}
                            placeholder="Nhập số lượng..."
                            className="w-full bg-white/80 dark:bg-gray-900/80 border-green-200 focus:border-green-400 font-bold text-center"
                            value={item.quantity}
                            onChange={(e) => {
                              const next = [...orderItems];
                              next[idx].quantity = parseInt(e.target.value) || 1;
                              setOrderItems(next);
                            }}
                          />
                        </div>
                        
                        <div className="md:col-span-1 flex items-end pb-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => setOrderItems((prev) => prev.filter((_, i) => i !== idx))}
                            disabled={orderItems.length === 1}
                            className="h-10 w-10 hover:bg-red-100 dark:hover:bg-red-950/30 hover:scale-110 transition-all duration-300"
                            title={orderItems.length === 1 ? "Cần ít nhất 1 dòng" : "Xóa dòng này"}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                        </div>
                      </div>
                    )})}
                  </div>
                  
                  <div className="flex justify-between items-center mt-4">
                    <Button
                      type="button"
                      variant="outline"
                      size="default"
                      onClick={() => setOrderItems((prev) => [...prev, { categoryId: undefined, color: undefined, quantity: 1 }])}
                      className="bg-white/60 hover:bg-white/80 border-green-300 hover:border-green-500 hover:scale-105 transition-all duration-300 shadow-sm"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Thêm dòng sản phẩm
                    </Button>
                    
                    <div className="backdrop-blur-sm bg-gradient-to-r from-blue-500/90 to-cyan-500/90 px-5 py-3 rounded-xl border border-white/30 shadow-lg">
                      <p className="text-white font-bold flex items-center gap-2">
                        <Car className="h-5 w-5" />
                        Tổng số lượng: <span className="text-2xl ml-2">{totalOrderQty}</span> 
                        <span className="text-sm font-normal opacity-90">xe</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Requested Delivery Date */}
                <div className="backdrop-blur-md bg-gradient-to-br from-blue-50/80 to-cyan-50/80 dark:from-blue-950/80 dark:to-cyan-950/80 p-5 rounded-xl border-2 border-blue-200/50 shadow-lg">
                  <Label htmlFor="requestedDate" className="text-lg font-bold text-blue-800 dark:text-blue-200 flex items-center gap-2 mb-3">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    📅 Ngày giao hàng mong muốn <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Input
                    id="requestedDate"
                    type="date"
                    value={orderRequestedDeliveryDate}
                    onChange={(e) => setOrderRequestedDeliveryDate(e.target.value)}
                    className="bg-white/80 dark:bg-gray-800/80 border-blue-200 focus:border-blue-400 text-base h-11"
                    min={new Date().toISOString().split('T')[0]}
                    max={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                    required
                  />
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-2 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Bắt buộc chọn ngày trong vòng 30 ngày kể từ hôm nay
                  </p>
                </div>

                {/* Notes */}
                <div className="backdrop-blur-md bg-gradient-to-br from-amber-50/80 to-yellow-50/80 dark:from-amber-950/80 dark:to-yellow-950/80 p-5 rounded-xl border-2 border-amber-200/50 shadow-lg">
                  <Label htmlFor="orderNotes" className="text-lg font-bold text-amber-800 dark:text-amber-200 flex items-center gap-2 mb-3">
                    <MessageSquare className="h-5 w-5 text-amber-600" />
                    💬 Ghi chú (không bắt buộc)
                  </Label>
                  <Textarea
                    id="orderNotes"
                    placeholder="VD: Cần giao hàng vào buổi sáng, liên hệ trước 1 ngày..."
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    rows={3}
                    className="bg-white/80 dark:bg-gray-800/80 border-amber-200 focus:border-amber-400 resize-none"
                  />
                </div>
              </div>
              <DialogFooter className="gap-3 pt-4 border-t border-green-200/30">
                <Button 
                  variant="outline" 
                  onClick={() => setIsOrderDialogOpen(false)}
                  className="bg-white/60 hover:bg-white/80 border-green-200 hover:border-green-400 hover:scale-105 transition-all duration-300 px-6"
                >
                  ❌ Hủy
                </Button>
                <Button 
                  type="button" 
                  onClick={handleSubmitOrder} 
                  disabled={isSubmittingOrder || !orderRequestedDeliveryDate || orderItems.filter(it => it.categoryId).length === 0}
                  className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 hover:from-green-600 hover:via-emerald-600 hover:to-teal-600 text-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 px-8 text-base font-bold"
                >
                  {isSubmittingOrder ? (
                    <>
                      <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Đang gửi đơn...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-5 w-5 mr-2" />
                      ✅ Gửi đơn nhập hàng
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Dialog: Confirm Received */}
          <Dialog open={isCompleteDialogOpen} onOpenChange={setIsCompleteDialogOpen}>
            <DialogContent className="max-w-6xl max-h-[92vh] flex flex-col overflow-hidden">
              <DialogHeader className="flex-shrink-0 pb-3">
                <DialogTitle className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  ✅ Xác nhận đã nhận hàng
                </DialogTitle>
                <DialogDescription className="text-sm">
                  Mã phân phối: <span className="font-mono font-semibold text-blue-600">{selectedDistribution?.code || `#${selectedDistribution?.id}`}</span>
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3 py-2 overflow-y-auto flex-1 pr-2">
                {/* Thông tin tổng quan */}
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <div className="p-1.5 bg-blue-500 rounded-lg flex-shrink-0">
                      <Package className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-blue-900 mb-2">
                        📦 Thông tin đơn hàng
                      </p>
                      <div className="grid grid-cols-3 gap-3 text-xs">
                        <div className="min-w-0">
                          <span className="text-blue-600 block mb-0.5">Yêu cầu:</span>
                          <span className="font-bold text-blue-900 block truncate">{selectedDistribution?.requestedQuantity || 0} xe</span>
                        </div>
                        <div className="min-w-0">
                          <span className="text-green-600 block mb-0.5">EVM duyệt:</span>
                          <span className="font-bold text-green-900 block truncate">
                            {selectedDistribution?.approvedQuantity || receivedItems.reduce((sum, item) => sum + item.ordered, 0) || selectedDistribution?.requestedQuantity || 0} xe
                          </span>
                        </div>
                        <div className="min-w-0">
                          <span className="text-purple-600 block mb-0.5">Giao tới:</span>
                          <span className="font-bold text-purple-900 block truncate">
                            {receivedItems.reduce((sum, item) => sum + item.received, 0) || selectedDistribution?.requestedQuantity || 0} xe
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Chi tiết từng dòng xe */}
                {receivedItems.length > 0 ? (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-sm font-semibold text-gray-700">Chi tiết xe đã nhận</Label>
                      <span className="text-xs text-gray-500">{receivedItems.length} dòng xe</span>
                    </div>
                    <div className="space-y-2">
                      {receivedItems.map((row, idx) => {
                        const isMatch = row.ordered === row.received;
                        const totalPrice = (row.price || 0) * row.received;
                        return (
                          <div key={row.id ?? idx} className={`p-3 border rounded-lg transition-all ${
                            isMatch 
                              ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300' 
                              : 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-300'
                          }`}>
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <Car className="h-4 w-4 text-gray-600 flex-shrink-0" />
                                  <div className="min-w-0 flex-1">
                                    <div className="font-bold text-sm text-gray-900 truncate">{row.name || 'Sản phẩm'}</div>
                                    {row.color && (
                                      <div className="flex items-center gap-1.5 mt-0.5">
                                        <div className="w-3 h-3 rounded-full border border-gray-300 flex-shrink-0" style={{ backgroundColor: row.color.toLowerCase() }}></div>
                                        <span className="text-xs text-gray-600 truncate">Màu: <strong>{row.color}</strong></span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                              {(row.price ?? 0) > 0 && (
                                <div className="text-right flex-shrink-0">
                                  <div className="text-xs text-gray-500">Giá hãng/xe</div>
                                  <div className="text-sm font-bold text-blue-600">
                                    {(row.price ?? 0).toLocaleString()} đ
                                  </div>
                                </div>
                              )}
                            </div>

                            <div className="mt-2 grid grid-cols-3 gap-2">
                              <div className="bg-white/60 p-2 rounded">
                                <div className="text-xs text-blue-600 font-medium mb-0.5">EVM duyệt</div>
                                <div className="text-lg font-bold text-blue-700">{row.ordered}</div>
                                <div className="text-xs text-gray-500">xe</div>
                              </div>
                              <div className="bg-white/60 p-2 rounded">
                                <div className="text-xs text-green-600 font-medium mb-0.5">Giao tới</div>
                                <div className="text-lg font-bold text-green-700">{row.received}</div>
                                <div className="text-xs text-gray-500">xe</div>
                              </div>
                              <div className="bg-white/60 p-2 rounded">
                                <div className="text-xs text-purple-600 font-medium mb-0.5 truncate">Dealer phải trả</div>
                                <div className="text-sm font-bold text-purple-700 truncate">
                                  {totalPrice.toLocaleString()}
                                </div>
                                <div className="text-xs text-gray-500">đồng</div>
                              </div>
                            </div>

                            {!isMatch ? (
                              <div className="mt-2 p-1.5 bg-yellow-100 border border-yellow-300 rounded flex items-center gap-1.5">
                                <AlertCircle className="h-3 w-3 text-yellow-700 flex-shrink-0" />
                                <span className="text-xs font-medium text-yellow-800">
                                  Chênh lệch: {row.received - row.ordered > 0 ? '+' : ''}{row.received - row.ordered} xe
                                </span>
                              </div>
                            ) : (
                              <div className="mt-2 p-1.5 bg-green-100 border border-green-300 rounded flex items-center gap-1.5">
                                <CheckCircle className="h-3 w-3 text-green-700 flex-shrink-0" />
                                <span className="text-xs font-medium text-green-800">Khớp đúng số lượng đã đặt</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Tổng kết */}
                    <div className="mt-2 p-3 bg-gradient-to-br from-blue-100 via-green-100 to-purple-100 border border-blue-300 rounded-lg">
                      <div className="flex items-center gap-1.5 mb-2">
                        <TrendingUp className="h-4 w-4 text-blue-600" />
                        <Label className="text-sm font-bold text-gray-800">Tổng kết đơn hàng</Label>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="bg-white/70 p-2 rounded text-center border border-blue-200">
                          <div className="text-xs text-blue-600 font-medium mb-0.5">Tổng EVM duyệt</div>
                          <div className="text-xl font-bold text-blue-700">
                            {receivedItems.reduce((sum, item) => sum + item.ordered, 0)}
                          </div>
                          <div className="text-xs text-gray-500">xe</div>
                        </div>
                        <div className="bg-white/70 p-2 rounded text-center border border-green-200">
                          <div className="text-xs text-green-600 font-medium mb-0.5">Tổng giao tới</div>
                          <div className="text-xl font-bold text-green-700">
                            {receivedItems.reduce((sum, item) => sum + item.received, 0)}
                          </div>
                          <div className="text-xs text-gray-500">xe</div>
                        </div>
                        <div className="bg-white/70 p-2 rounded text-center border border-purple-200">
                          <div className="text-xs text-purple-600 font-medium mb-0.5">Xác nhận</div>
                          <div className="text-base font-bold text-purple-700 truncate">
                            {receivedItems.reduce((sum, item) => sum + ((item.price || 0) * item.received), 0).toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-500">VNĐ</div>
                        </div>
                      </div>
                      {receivedItems.reduce((sum, item) => sum + item.ordered, 0) === receivedItems.reduce((sum, item) => sum + item.received, 0) ? (
                        <div className="mt-2 p-2 bg-green-500 rounded text-center">
                          <div className="flex items-center justify-center gap-1.5 text-white font-bold text-xs">
                            <CheckCircle className="h-4 w-4 flex-shrink-0" />
                            <span>Số lượng khớp chính xác - Sẵn sàng xác nhận</span>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-2 p-2 bg-yellow-500 rounded text-center">
                          <div className="flex items-center justify-center gap-1.5 text-white font-bold text-xs">
                            <AlertCircle className="h-4 w-4 flex-shrink-0" />
                            <span>
                              Chênh lệch: {receivedItems.reduce((sum, item) => sum + item.received, 0) - receivedItems.reduce((sum, item) => sum + item.ordered, 0) > 0 ? '+' : ''}
                              {receivedItems.reduce((sum, item) => sum + item.received, 0) - receivedItems.reduce((sum, item) => sum + item.ordered, 0)} xe
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
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
              <div className="space-y-1.5 border-t pt-3 flex-shrink-0">
                <Label htmlFor="receiptDate" className="text-xs">Ngày nhập kho của đại lý</Label>
                <Input
                  id="receiptDate"
                  type="date"
                  value={receiptDate}
                  onChange={(e) => setReceiptDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="text-sm"
                />
                <p className="text-xs text-muted-foreground">Dùng để ghi nhận ngày nhập kho. Mặc định là hôm nay.</p>
              </div>
              <DialogFooter className="border-t pt-3 flex-shrink-0 gap-2">
                <Button variant="outline" onClick={() => setIsCompleteDialogOpen(false)} className="text-sm">
                  Hủy
                </Button>
                <Button 
                  onClick={handleConfirmReceived}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold text-sm"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Xác nhận nhận hàng
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
            <DialogContent className="backdrop-blur-xl bg-gradient-to-br from-cyan-50/95 to-blue-50/95 dark:from-cyan-950/95 dark:to-blue-950/95 border-2 border-cyan-200/50 dark:border-cyan-800/50 shadow-2xl max-w-7xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <DialogTitle className="text-3xl bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent font-bold">
                      📋 Chi tiết phân phối
                    </DialogTitle>
                    <p className="text-sm text-gray-500 mt-1">
                      Mã: <span className="font-mono font-semibold text-cyan-600">{selectedDistribution?.code || `#${selectedDistribution?.id}`}</span>
                    </p>
                  </div>
                  <Badge className={`${getDistributionStatusColor(selectedDistribution?.status || DistributionStatus.INVITED)} px-4 py-2 text-base`}>
                    {getDistributionStatusLabel(selectedDistribution?.status || DistributionStatus.INVITED)}
                  </Badge>
                </div>
              </DialogHeader>
              {selectedDistribution && (
                <div className="space-y-6 py-4">
                  {/* Info Grid - 2 columns */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="backdrop-blur-md bg-gradient-to-br from-purple-400/10 to-pink-400/10 p-4 rounded-xl border border-purple-200/30">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="h-5 w-5 text-purple-600" />
                        <Label className="text-xs text-purple-700 dark:text-purple-300 font-semibold uppercase">Ngày tạo</Label>
                      </div>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">
                        {selectedDistribution.createdAt 
                          ? new Date(selectedDistribution.createdAt).toLocaleDateString('vi-VN')
                          : 'N/A'
                        }
                      </p>
                      <p className="text-xs text-purple-600 mt-1">
                        {selectedDistribution.createdAt 
                          ? new Date(selectedDistribution.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
                          : ''
                        }
                      </p>
                    </div>
                    
                    <div className="backdrop-blur-md bg-gradient-to-br from-green-400/10 to-emerald-400/10 p-4 rounded-xl border border-green-200/30">
                      <div className="flex items-center gap-2 mb-2">
                        <Package className="h-5 w-5 text-green-600" />
                        <Label className="text-xs text-green-700 dark:text-green-300 font-semibold uppercase">Số lượng</Label>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-baseline gap-2">
                          <span className="text-xs text-blue-600">Yêu cầu:</span>
                          <p className="text-xl font-bold text-blue-600">
                            {selectedDistribution.requestedQuantity || selectedDistribution.items?.reduce((s, it) => s + (it.quantity || 0), 0) || 0}
                          </p>
                          <span className="text-xs text-gray-600">xe</span>
                        </div>
                        {selectedDistribution.approvedQuantity !== undefined && selectedDistribution.approvedQuantity !== null && (
                          <div className="flex items-baseline gap-2">
                            <span className="text-xs text-green-600">EVM duyệt:</span>
                            <p className="text-xl font-bold text-green-600">
                              {selectedDistribution.approvedQuantity}
                            </p>
                            <span className="text-xs text-gray-600">xe</span>
                          </div>
                        )}
                        {selectedDistribution.receivedQuantity && (
                          <div className="flex items-baseline gap-2">
                            <span className="text-xs text-purple-600">Đã nhận:</span>
                            <p className="text-xl font-bold text-purple-600">
                              {selectedDistribution.receivedQuantity}
                            </p>
                            <span className="text-xs text-gray-600">xe</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Timeline - Horizontal */}
                  {(selectedDistribution.deadline || selectedDistribution.requestedDeliveryDate || selectedDistribution.estimatedDeliveryDate || selectedDistribution.actualDeliveryDate) && (
                    <div className="backdrop-blur-md bg-gradient-to-br from-indigo-50/80 to-purple-50/80 dark:from-indigo-950/80 dark:to-purple-950/80 p-5 rounded-xl border border-indigo-200/30">
                      <div className="flex items-center gap-2 mb-4">
                        <Clock className="h-5 w-5 text-indigo-600" />
                        <Label className="text-base font-bold text-indigo-800 dark:text-indigo-200">Timeline</Label>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {selectedDistribution.deadline && (
                          <div className="text-center p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                            <p className="text-xs text-gray-500 mb-1">⏰ Hạn phản hồi</p>
                            <p className="text-sm font-semibold text-orange-600">
                              {new Date(selectedDistribution.deadline).toLocaleDateString('vi-VN')}
                            </p>
                          </div>
                        )}
                        {selectedDistribution.requestedDeliveryDate && (
                          <div className="text-center p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                            <p className="text-xs text-gray-500 mb-1">📅 Bạn mong muốn</p>
                            <p className="text-sm font-semibold text-blue-600">
                              {new Date(selectedDistribution.requestedDeliveryDate).toLocaleDateString('vi-VN')}
                            </p>
                          </div>
                        )}
                        {selectedDistribution.estimatedDeliveryDate && (
                          <div className="text-center p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                            <p className="text-xs text-gray-500 mb-1">🚚 EVM dự kiến</p>
                            <p className="text-sm font-semibold text-purple-600">
                              {new Date(selectedDistribution.estimatedDeliveryDate).toLocaleDateString('vi-VN')}
                            </p>
                          </div>
                        )}
                        {selectedDistribution.actualDeliveryDate && (
                          <div className="text-center p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                            <p className="text-xs text-gray-500 mb-1">✅ Giao thực tế</p>
                            <p className="text-sm font-semibold text-green-600">
                              {new Date(selectedDistribution.actualDeliveryDate).toLocaleDateString('vi-VN')}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  
                  {/* Items Table - Enhanced */}
                  {selectedDistribution.items && selectedDistribution.items.length > 0 && (
                    <div className="backdrop-blur-md bg-gradient-to-br from-green-50/80 to-emerald-50/80 dark:from-green-950/80 dark:to-emerald-950/80 p-5 rounded-xl border border-green-200/30">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <Package className="h-5 w-5 text-green-600" />
                          <Label className="text-base font-bold text-green-800 dark:text-green-200">Danh sách sản phẩm</Label>
                        </div>
                        <Badge variant="outline" className="text-green-700 border-green-400">
                          {selectedDistribution.items.length} loại xe
                        </Badge>
                      </div>
                      <div>
                        <table className="w-full table-auto">
                          <thead>
                            <tr className="border-b-2 border-green-300/50">
                              <th className="text-left py-2 px-3 text-xs font-semibold text-green-800 dark:text-green-200">#</th>
                              <th className="text-left py-2 px-3 text-xs font-semibold text-green-800 dark:text-green-200">Sản phẩm</th>
                              <th className="text-left py-2 px-3 text-xs font-semibold text-green-800 dark:text-green-200">Màu sắc</th>
                              {selectedDistribution.items?.some(it => it.dealerPrice) && (
                                <th className="text-right py-2 px-3 text-xs font-semibold text-green-800 dark:text-green-200">Giá hãng</th>
                              )}
                              <th className="text-center py-2 px-3 text-xs font-semibold text-green-800 dark:text-green-200">Yêu cầu</th>
                              {selectedDistribution.items.some(it => it.approvedQuantity !== undefined && it.approvedQuantity !== null) && (
                                <th className="text-center py-2 px-3 text-xs font-semibold text-green-800 dark:text-green-200">Đã duyệt</th>
                              )}
                              {selectedDistribution.items.some(it => it.receivedQuantity !== undefined && it.receivedQuantity !== null) && (
                                <th className="text-center py-2 px-3 text-xs font-semibold text-green-800 dark:text-green-200">Đã nhận</th>
                              )}
                            </tr>
                          </thead>
                          <tbody>
                            {selectedDistribution.items.map((it, idx) => (
                              <tr key={idx} className="border-b border-green-200/30 hover:bg-green-100/30 dark:hover:bg-green-900/20 transition-colors">
                                <td className="py-3 px-3 text-sm text-gray-600 dark:text-gray-400">{idx + 1}</td>
                                <td className="py-3 px-3">
                                  <div className="font-semibold text-gray-900 dark:text-white">{it.product?.name || it.category?.name || 'Sản phẩm'}</div>
                                  {it.product?.vinNum && <div className="text-xs text-gray-500 mt-0.5">{it.product.vinNum}</div>}
                                </td>
                                <td className="py-3 px-3">
                                  {it.color && (
                                    <Badge variant="outline" className="text-xs">
                                      🎨 {it.color}
                                    </Badge>
                                  )}
                                </td>
                                {selectedDistribution.items?.some(item => item.dealerPrice) && (
                                  <td className="py-3 px-3 text-right">
                                    {it.dealerPrice ? (
                                      <div className="font-semibold text-amber-700 dark:text-amber-400">
                                        {Number(it.dealerPrice).toLocaleString('vi-VN')} ₫
                                      </div>
                                    ) : (
                                      <span className="text-gray-400">-</span>
                                    )}
                                  </td>
                                )}
                                <td className="py-3 px-3 text-center">
                                  <span className="font-bold text-blue-600">{it.quantity || 0}</span>
                                  <span className="text-xs text-gray-500 ml-1">xe</span>
                                </td>
                                {selectedDistribution.items?.some(item => item.approvedQuantity !== undefined && item.approvedQuantity !== null) && (
                                  <td className="py-3 px-3 text-center">
                                    {it.approvedQuantity !== undefined && it.approvedQuantity !== null ? (
                                      <>
                                        <span className="font-bold text-green-600">{it.approvedQuantity}</span>
                                        <span className="text-xs text-gray-500 ml-1">xe</span>
                                        {it.quantity && it.approvedQuantity < it.quantity && (
                                          <div className="text-xs text-orange-600 mt-0.5">
                                            Thiếu: {it.quantity - it.approvedQuantity}
                                          </div>
                                        )}
                                      </>
                                    ) : (
                                      <span className="text-gray-400">-</span>
                                    )}
                                  </td>
                                )}
                                {selectedDistribution.items?.some(item => item.receivedQuantity !== undefined && item.receivedQuantity !== null) && (
                                  <td className="py-3 px-3 text-center">
                                    {it.receivedQuantity !== undefined && it.receivedQuantity !== null ? (
                                      <>
                                        <span className="font-bold text-purple-600">{it.receivedQuantity}</span>
                                        <span className="text-xs text-gray-500 ml-1">xe</span>
                                      </>
                                    ) : (
                                      <span className="text-gray-400">-</span>
                                    )}
                                  </td>
                                )}
                              </tr>
                            ))}
                          </tbody>
                          <tfoot>
                            <tr className="border-t-2 border-green-300/50 bg-green-100/50 dark:bg-green-900/30">
                              <td colSpan={selectedDistribution.items?.some(it => it.dealerPrice) ? 4 : 3} className="py-3 px-3 text-sm font-bold text-green-800 dark:text-green-200">
                                Tổng cộng
                              </td>
                              <td className="py-3 px-3 text-center">
                                <span className="font-bold text-blue-600 text-base">
                                  {selectedDistribution.items.reduce((s, it) => s + (it.quantity || 0), 0)}
                                </span>
                                <span className="text-xs text-gray-500 ml-1">xe</span>
                              </td>
                              {selectedDistribution.items.some(it => it.approvedQuantity !== undefined && it.approvedQuantity !== null) && (
                                <td className="py-3 px-3 text-center">
                                  <span className="font-bold text-green-600 text-base">
                                    {selectedDistribution.items.reduce((s, it) => s + (it.approvedQuantity || 0), 0)}
                                  </span>
                                  <span className="text-xs text-gray-500 ml-1">xe</span>
                                </td>
                              )}
                              {selectedDistribution.items.some(it => it.receivedQuantity !== undefined && it.receivedQuantity !== null) && (
                                <td className="py-3 px-3 text-center">
                                  <span className="font-bold text-purple-600 text-base">
                                    {selectedDistribution.items.reduce((s, it) => s + (it.receivedQuantity || 0), 0)}
                                  </span>
                                  <span className="text-xs text-gray-500 ml-1">xe</span>
                                </td>
                              )}
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Payment Information */}
                  {selectedDistribution.paidAmount && selectedDistribution.paidAmount > 0 && (
                    <div className="backdrop-blur-md bg-gradient-to-br from-emerald-50/80 to-teal-50/80 dark:from-emerald-950/80 dark:to-teal-950/80 p-5 rounded-xl border-2 border-emerald-300/50">
                      <div className="flex items-center gap-2 mb-4">
                        <CheckCircle className="h-5 w-5 text-emerald-600" />
                        <Label className="text-base font-bold text-emerald-800 dark:text-emerald-200">Thông tin thanh toán</Label>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white/60 dark:bg-gray-800/60 p-4 rounded-lg">
                          <p className="text-xs text-gray-500 mb-1">💰 Số tiền đã chuyển</p>
                          <p className="text-lg font-bold text-emerald-600">
                            {selectedDistribution.paidAmount.toLocaleString('vi-VN')} VND
                          </p>
                        </div>
                        {selectedDistribution.transactionNo && (
                          <div className="bg-white/60 dark:bg-gray-800/60 p-4 rounded-lg">
                            <p className="text-xs text-gray-500 mb-1">🔖 Mã giao dịch</p>
                            <p className="text-sm font-mono font-semibold text-gray-800 dark:text-gray-200">
                              {selectedDistribution.transactionNo}
                            </p>
                          </div>
                        )}
                        {selectedDistribution.paidAt && (
                          <div className="bg-white/60 dark:bg-gray-800/60 p-4 rounded-lg">
                            <p className="text-xs text-gray-500 mb-1">⏰ Thời gian thanh toán</p>
                            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                              {new Date(selectedDistribution.paidAt).toLocaleDateString('vi-VN')}
                            </p>
                            <p className="text-xs text-gray-600 mt-1">
                              {new Date(selectedDistribution.paidAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Messages Section - Combined */}
                  {(selectedDistribution.invitationMessage || selectedDistribution.dealerNotes || selectedDistribution.evmNotes) && (
                    <div className="backdrop-blur-md bg-gradient-to-br from-amber-50/80 to-yellow-50/80 dark:from-amber-950/80 dark:to-yellow-950/80 p-5 rounded-xl border border-amber-200/30">
                      <div className="flex items-center gap-2 mb-4">
                        <MessageSquare className="h-5 w-5 text-amber-600" />
                        <Label className="text-base font-bold text-amber-800 dark:text-amber-200">Ghi chú & Tin nhắn</Label>
                      </div>
                      <div className="space-y-3">
                        {selectedDistribution.invitationMessage && (
                          <div className="bg-blue-50/50 dark:bg-blue-900/20 p-3 rounded-lg border-l-4 border-blue-400">
                            <Label className="text-xs text-blue-700 dark:text-blue-300 font-semibold">📨 Lời mời từ EVM</Label>
                            <p className="mt-1 text-sm text-gray-700 dark:text-gray-200">{selectedDistribution.invitationMessage}</p>
                          </div>
                        )}
                        {selectedDistribution.dealerNotes && (
                          <div className="bg-green-50/50 dark:bg-green-900/20 p-3 rounded-lg border-l-4 border-green-400">
                            <Label className="text-xs text-green-700 dark:text-green-300 font-semibold">💼 Ghi chú của bạn</Label>
                            <p className="mt-1 text-sm text-gray-700 dark:text-gray-200">{selectedDistribution.dealerNotes}</p>
                          </div>
                        )}
                        {selectedDistribution.evmNotes && (
                          <div className="bg-purple-50/50 dark:bg-purple-900/20 p-3 rounded-lg border-l-4 border-purple-400">
                            <Label className="text-xs text-purple-700 dark:text-purple-300 font-semibold">🏢 Ghi chú từ EVM</Label>
                            <p className="mt-1 text-sm text-gray-700 dark:text-gray-200 whitespace-pre-wrap font-mono text-xs">{selectedDistribution.evmNotes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Shortage Summary Section - Table Style */}
                  {selectedDistribution.items && selectedDistribution.items.some(it => it.approvedQuantity && it.quantity && it.approvedQuantity < it.quantity) && (
                    <div className="backdrop-blur-md bg-gradient-to-br from-green-50/90 to-emerald-50/90 dark:from-green-950/90 dark:to-emerald-950/90 p-5 rounded-xl border-2 border-green-300/50 shadow-lg">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <Package className="h-5 w-5 text-green-600" />
                          <Label className="text-lg font-bold text-green-800 dark:text-green-200">
                            📋 Danh sách sản phẩm
                          </Label>
                        </div>
                        <Badge className="bg-green-600 text-white px-3 py-1">
                          {selectedDistribution.items.filter(it => it.approvedQuantity && it.quantity && it.approvedQuantity < it.quantity).length} loại xe
                        </Badge>
                      </div>
                      
                      <div className="bg-white/60 dark:bg-gray-800/60 rounded-xl border border-green-200/50 overflow-hidden">
                        <table className="w-full">
                          <thead className="bg-green-100/80 dark:bg-green-900/40">
                            <tr className="border-b-2 border-green-300/50">
                              <th className="text-left py-3 px-4 text-sm font-bold text-green-900 dark:text-green-100">#</th>
                              <th className="text-left py-3 px-4 text-sm font-bold text-green-900 dark:text-green-100">Sản phẩm</th>
                              <th className="text-left py-3 px-4 text-sm font-bold text-green-900 dark:text-green-100">Màu sắc</th>
                              <th className="text-center py-3 px-4 text-sm font-bold text-green-900 dark:text-green-100">Yêu cầu</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedDistribution.items
                              .filter(it => it.approvedQuantity && it.quantity && it.approvedQuantity < it.quantity)
                              .map((it, idx) => {
                                const shortage = (it.quantity || 0) - (it.approvedQuantity || 0);
                                return (
                                  <tr 
                                    key={idx} 
                                    className="border-b border-green-200/30 hover:bg-green-50/50 dark:hover:bg-green-900/20 transition-colors"
                                  >
                                    <td className="py-4 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                                      {idx + 1}
                                    </td>
                                    <td className="py-4 px-4">
                                      <div className="font-semibold text-base text-gray-900 dark:text-white">
                                        {it.product?.name || it.category?.name || 'Sản phẩm'}
                                      </div>
                                    </td>
                                    <td className="py-4 px-4">
                                      {it.color && (
                                        <div className="flex items-center gap-2">
                                          <div 
                                            className="w-4 h-4 rounded-full border-2 border-gray-300"
                                            style={{ 
                                              backgroundColor: it.color === 'Đỏ' ? '#ef4444' : 
                                                             it.color === 'Xanh dương' || it.color === 'Xanh duong' ? '#3b82f6' :
                                                             it.color === 'Đen' ? '#000000' :
                                                             it.color === 'Trắng' ? '#ffffff' :
                                                             it.color === 'Xám' ? '#6b7280' : '#9ca3af'
                                            }}
                                          ></div>
                                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            {it.color}
                                          </span>
                                        </div>
                                      )}
                                    </td>
                                    <td className="py-4 px-4 text-center">
                                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/40 rounded-full">
                                        <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                          {shortage}
                                        </span>
                                        <span className="text-xs text-blue-600 dark:text-blue-400">xe</span>
                                      </span>
                                    </td>
                                  </tr>
                                );
                              })}
                          </tbody>
                          <tfoot className="bg-green-100/80 dark:bg-green-900/40">
                            <tr className="border-t-2 border-green-300/50">
                              <td colSpan={3} className="py-3 px-4 text-base font-bold text-green-900 dark:text-green-100">
                                Tổng cộng
                              </td>
                              <td className="py-3 px-4 text-center">
                                <span className="inline-flex items-center gap-1 px-4 py-1.5 bg-green-600 text-white rounded-full">
                                  <span className="text-xl font-bold">
                                    {selectedDistribution.items
                                      .filter(it => it.approvedQuantity && it.quantity && it.approvedQuantity < it.quantity)
                                      .reduce((sum, it) => sum + ((it.quantity || 0) - (it.approvedQuantity || 0)), 0)
                                    }
                                  </span>
                                  <span className="text-sm">xe</span>
                                </span>
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </div>
                  )}
                  
                  {/* Products List - Enhanced */}
                  {selectedDistribution.products && selectedDistribution.products.length > 0 && (
                    <div className="backdrop-blur-md bg-gradient-to-br from-pink-50/80 to-rose-50/80 dark:from-pink-950/80 dark:to-rose-950/80 p-5 rounded-xl border border-pink-200/30">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <Package className="h-5 w-5 text-pink-600" />
                          <Label className="text-base font-bold text-pink-800 dark:text-pink-200">Sản phẩm phân phối</Label>
                        </div>
                        <Badge variant="outline" className="text-pink-700 border-pink-400">
                          {selectedDistribution.products.length} xe
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {selectedDistribution.products.map((product, idx) => (
                          <div key={idx} className="bg-white/60 dark:bg-gray-800/60 p-4 rounded-lg border border-pink-200/40 hover:shadow-lg hover:border-pink-300 transition-all">
                            <div className="flex items-start justify-between mb-2">
                              <div className="font-bold text-gray-900 dark:text-white">{product.name}</div>
                              <Badge className="bg-pink-500 text-white text-xs">{idx + 1}</Badge>
                            </div>
                            <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                              {product.vinNum && (
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-semibold text-pink-600">VIN:</span>
                                  <span className="font-mono text-xs">{product.vinNum}</span>
                                </div>
                              )}
                              {product.engineNum && (
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-semibold text-pink-600">Engine:</span>
                                  <span className="font-mono text-xs">{product.engineNum}</span>
                                </div>
                              )}
                              {product.price && (
                                <div className="flex items-center gap-2 pt-1 border-t border-pink-100">
                                  <span className="text-xs font-semibold text-pink-600">Giá:</span>
                                  <span className="font-bold text-pink-600">{product.price.toLocaleString('vi-VN')} VND</span>
                                </div>
                              )}
                              {product.stockInDate && (
                                <div className="flex items-center gap-2 text-xs">
                                  <span className="text-pink-600">Nhập kho:</span>
                                  <span>{new Date(product.stockInDate as any).toLocaleDateString('vi-VN')}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Feedback */}
                  {selectedDistribution.feedback && (
                    <div className="backdrop-blur-md bg-gradient-to-br from-purple-50/80 to-violet-50/80 dark:from-purple-950/80 dark:to-violet-950/80 p-5 rounded-xl border border-purple-200/30">
                      <div className="flex items-center gap-2 mb-3">
                        <MessageSquare className="h-5 w-5 text-purple-600" />
                        <Label className="text-base font-bold text-purple-800 dark:text-purple-200">Đánh giá</Label>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-200">{selectedDistribution.feedback}</p>
                    </div>
                  )}
                  
                  {/* Supplementary Distribution Info */}
                  {selectedDistribution.isSupplementary && selectedDistribution.parentDistributionId && (
                    <div className="backdrop-blur-md bg-gradient-to-br from-orange-50/80 to-amber-50/80 dark:from-orange-950/80 dark:to-amber-950/80 p-5 rounded-xl border-2 border-orange-300/50">
                      <div className="flex items-center gap-2 mb-3">
                        <AlertCircle className="h-5 w-5 text-orange-600" />
                        <Label className="text-base font-bold text-orange-800 dark:text-orange-200">
                          ⚠️ Đơn hàng bổ sung
                        </Label>
                      </div>
                      <div className="bg-orange-100/50 dark:bg-orange-900/20 p-4 rounded-lg">
                        <p className="text-sm text-orange-800 dark:text-orange-200 mb-2">
                          Đây là đơn hàng bổ sung cho đơn phân phối gốc:
                        </p>
                        {selectedDistribution.parentDistributionId && (
                          <div className="flex items-center gap-3">
                            <Badge className="bg-orange-500 text-white text-sm">
                              Mã đơn gốc: #{selectedDistribution.parentDistributionId}
                            </Badge>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-orange-600 border-orange-400 hover:bg-orange-100"
                              onClick={async () => {
                                const parentDist = distributions.find(d => d.id === selectedDistribution.parentDistributionId);
                                if (parentDist) {
                                  setSelectedDistribution(parentDist);
                                } else {
                                  toast({
                                    title: "Không tìm thấy đơn gốc",
                                    description: "Đơn phân phối gốc không có trong danh sách hiện tại.",
                                    variant: "destructive",
                                  });
                                }
                              }}
                            >
                              Xem đơn gốc →
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Delivery Dates Grid - Moved to bottom */}
                  {(selectedDistribution.estimatedDeliveryDate || selectedDistribution.actualDeliveryDate) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedDistribution.estimatedDeliveryDate && (
                        <div className="backdrop-blur-md bg-gradient-to-br from-purple-50/80 to-violet-50/80 dark:from-purple-950/80 dark:to-violet-950/80 p-5 rounded-xl border border-purple-200/30">
                          <div className="flex items-center gap-2 mb-3">
                            <Calendar className="h-5 w-5 text-purple-600" />
                            <Label className="text-base font-bold text-purple-800 dark:text-purple-200">Ngày giao dự kiến</Label>
                          </div>
                          <p className="text-2xl font-bold text-purple-600">
                            {new Date(selectedDistribution.estimatedDeliveryDate).toLocaleDateString('vi-VN')}
                          </p>
                        </div>
                      )}
                      {selectedDistribution.actualDeliveryDate && (
                        <div className="backdrop-blur-md bg-gradient-to-br from-green-50/80 to-emerald-50/80 dark:from-green-950/80 dark:to-emerald-950/80 p-5 rounded-xl border border-green-200/30">
                          <div className="flex items-center gap-2 mb-3">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            <Label className="text-base font-bold text-green-800 dark:text-green-200">Ngày giao thực tế</Label>
                          </div>
                          <p className="text-2xl font-bold text-green-600">
                            {new Date(selectedDistribution.actualDeliveryDate).toLocaleDateString('vi-VN')}
                          </p>
                        </div>
                      )}
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
            <DialogContent className="max-h-[90vh] overflow-y-auto">
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
                        <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                          {selectedDistribution.items.map((item) => {
                            // Số lượng đã duyệt của EVM (đã được lưu trong approvedQuantity)
                            const approvedQty = item.approvedQuantity !== undefined && item.approvedQuantity !== null 
                              ? item.approvedQuantity 
                              : 0;
                            
                            // Số lượng yêu cầu ban đầu của dealer (lưu trong quantity)
                            const itemKey = `${item.product?.name || item.category?.name || 'Unknown'}${item.color ? ' ('+item.color+')' : ''}`;
                            const requestedQty = itemRequestedMap.get(itemKey) || item.quantity || 0;
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
                    Nếu bạn chấp nhận, EVM Staff sẽ tiếp tục lên kế hoạch giao hàng. Nếu từ chối do không đủ số lượng, đơn hàng sẽ bị hủy.
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
                  Từ chối do không đủ số lượng
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
            <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto backdrop-blur-xl bg-gradient-to-br from-purple-50/95 to-pink-50/95 dark:from-purple-950/95 dark:to-pink-950/95 border-2 border-purple-200/50 dark:border-purple-800/50 shadow-2xl">
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <DialogTitle className="text-3xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent font-bold">
                      🚀 Tạo yêu cầu phân phối mới
                    </DialogTitle>
                    <p className="text-sm text-gray-500 mt-1">
                      Yêu cầu nhập hàng trực tiếp từ hãng (không cần chờ lời mời)
                    </p>
                  </div>
                  {categories.length > 0 && (
                    <Badge className="bg-green-600 text-white px-4 py-2 text-base">
                      <CheckCircle2 className="h-4 w-4 mr-1 inline" />
                      {categories.length} danh mục
                    </Badge>
                  )}
                </div>
              </DialogHeader>
              
              <div className="space-y-6 py-4">
                {/* Categories loading check */}
                {categories.length === 0 && (
                  <div className="backdrop-blur-md bg-gradient-to-br from-amber-50/80 to-orange-50/80 dark:from-amber-950/80 dark:to-orange-950/80 p-5 rounded-xl border-2 border-amber-300/50 shadow-lg">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-6 w-6 text-amber-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-base text-amber-800 dark:text-amber-200 font-bold mb-2">
                          ⚠️ Chưa tải được danh mục xe
                        </p>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={loadData}
                          disabled={loading}
                          className="bg-white/60 hover:bg-white/80 border-amber-300 hover:scale-105 transition-all duration-300"
                        >
                          {loading ? 'Đang tải...' : '🔄 Tải lại'}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Items - Enhanced Design */}
                <div className="backdrop-blur-md bg-gradient-to-br from-green-50/80 to-emerald-50/80 dark:from-green-950/80 dark:to-emerald-950/80 p-6 rounded-xl border-2 border-green-200/50 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Package className="h-6 w-6 text-green-600" />
                      <Label className="text-xl font-bold text-green-800 dark:text-green-200">
                        📋 Danh sách sản phẩm yêu cầu
                      </Label>
                    </div>
                    <Badge variant="outline" className="text-green-700 border-green-400 text-base px-3 py-1">
                      {newRequestItems.filter(it => it.categoryId).length} loại xe
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-5 ml-8">
                    Chọn danh mục, màu sắc và số lượng cho từng dòng
                  </p>
                  
                  <div className="space-y-3">
                  {newRequestItems.map((item, idx) => {
                    // Get colors already selected for this category
                    const selectedColorsForCategory = newRequestItems
                      .filter((it, i) => i !== idx && it.categoryId === item.categoryId && it.color)
                      .map(it => it.color);
                    
                    return (
                    <div key={idx} className="backdrop-blur-sm bg-white/70 dark:bg-gray-800/70 p-4 rounded-xl border border-green-200/40 hover:border-green-400/60 hover:shadow-lg transition-all duration-300">
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start">
                        {/* Row Number */}
                        <div className="md:col-span-1 flex items-center justify-center">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
                            {idx + 1}
                          </div>
                        </div>
                        
                        {/* Category Select - takes more space */}
                        <div className="md:col-span-4">
                          <Label className="text-xs font-semibold text-green-700 dark:text-green-300 mb-1.5 block">🚗 Danh mục</Label>
                          <Select
                            value={item.categoryId?.toString() || ''}
                            onValueChange={(val) => {
                              const updated = [...newRequestItems];
                              updated[idx].categoryId = val ? parseInt(val) : undefined;
                              // Reset color when category changes
                              updated[idx].color = undefined;
                              setNewRequestItems(updated);
                            }}
                          >
                            <SelectTrigger className="w-full bg-white/80 dark:bg-gray-900/80 border-green-200 focus:border-green-400">
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
                                    <span className="font-semibold">{cat.name}</span> <span className="text-gray-500">({cat.brand})</span>
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        {/* Color Select */}
                        <div className="md:col-span-3">
                          <Label className="text-xs font-semibold text-green-700 dark:text-green-300 mb-1.5 block">🎨 Màu sắc</Label>
                          <Select
                            value={item.color || ''}
                            onValueChange={(val) => {
                              const updated = [...newRequestItems];
                              updated[idx].color = val || undefined;
                              setNewRequestItems(updated);
                            }}
                            disabled={!item.categoryId}
                          >
                            <SelectTrigger className="w-full bg-white/80 dark:bg-gray-900/80 border-green-200 focus:border-green-400">
                              <SelectValue placeholder={item.categoryId ? "Chọn màu..." : "Chọn danh mục trước"} />
                            </SelectTrigger>
                            <SelectContent>
                              {COLOR_OPTIONS.map((color) => {
                                const isAlreadySelected = selectedColorsForCategory.includes(color);
                                return (
                                  <SelectItem 
                                    key={color} 
                                    value={color}
                                    disabled={isAlreadySelected}
                                    className={isAlreadySelected ? "opacity-50 cursor-not-allowed" : ""}
                                  >
                                    {color} {isAlreadySelected ? "✓" : ""}
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        {/* Quantity Input */}
                        <div className="md:col-span-3">
                          <Label className="text-xs font-semibold text-green-700 dark:text-green-300 mb-1.5 block">📦 Số lượng</Label>
                          <Input
                            type="number"
                            placeholder="Nhập số lượng..."
                            className="w-full bg-white/80 dark:bg-gray-900/80 border-green-200 focus:border-green-400 font-bold text-center"
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
                        <div className="md:col-span-1 flex items-end pb-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              if (newRequestItems.length > 1) {
                                setNewRequestItems(newRequestItems.filter((_, i) => i !== idx));
                              }
                            }}
                            disabled={newRequestItems.length === 1}
                            className="h-10 w-10 hover:bg-red-100 dark:hover:bg-red-950/30 hover:scale-110 transition-all duration-300"
                            title={newRequestItems.length === 1 ? "Cần ít nhất 1 dòng" : "Xóa dòng này"}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )})}
                  </div>
                  
                  <div className="flex justify-between items-center mt-4">
                    <Button
                      variant="outline"
                      size="default"
                      onClick={() => {
                        setNewRequestItems([...newRequestItems, { categoryId: undefined, color: undefined, quantity: 1 }]);
                      }}
                      className="bg-white/60 hover:bg-white/80 border-green-300 hover:border-green-500 hover:scale-105 transition-all duration-300 shadow-sm"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Thêm dòng sản phẩm
                    </Button>
                    
                    <div className="backdrop-blur-sm bg-gradient-to-r from-blue-500/90 to-cyan-500/90 px-5 py-3 rounded-xl border border-white/30 shadow-lg">
                      <p className="text-white font-bold flex items-center gap-2">
                        <Car className="h-5 w-5" />
                        Tổng số lượng: <span className="text-2xl ml-2">{newRequestItems.reduce((s, it) => s + (Number(it.quantity) || 0), 0)}</span> 
                        <span className="text-sm font-normal opacity-90">xe</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Requested Delivery Date */}
                <div className="backdrop-blur-md bg-gradient-to-br from-blue-50/80 to-cyan-50/80 dark:from-blue-950/80 dark:to-cyan-950/80 p-5 rounded-xl border-2 border-blue-200/50 shadow-lg">
                  <Label htmlFor="newRequestDeliveryDate" className="text-lg font-bold text-blue-800 dark:text-blue-200 flex items-center gap-2 mb-3">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    📅 Ngày giao hàng mong muốn <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Input
                    id="newRequestDeliveryDate"
                    type="date"
                    value={newRequestDeliveryDate}
                    onChange={(e) => setNewRequestDeliveryDate(e.target.value)}
                    className="bg-white/80 dark:bg-gray-800/80 border-blue-200 focus:border-blue-400 text-base h-11"
                    min={new Date().toISOString().split('T')[0]}
                    max={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                    required
                  />
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-2 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Bắt buộc chọn ngày trong vòng 30 ngày kể từ hôm nay
                  </p>
                </div>

                {/* Notes */}
                <div className="backdrop-blur-md bg-gradient-to-br from-amber-50/80 to-yellow-50/80 dark:from-amber-950/80 dark:to-yellow-950/80 p-5 rounded-xl border-2 border-amber-200/50 shadow-lg">
                  <Label htmlFor="newRequestNotes" className="text-lg font-bold text-amber-800 dark:text-amber-200 flex items-center gap-2 mb-3">
                    <MessageSquare className="h-5 w-5 text-amber-600" />
                    💬 Ghi chú (không bắt buộc)
                  </Label>
                  <Textarea
                    id="newRequestNotes"
                    placeholder="VD: Cần xe gấp để phục vụ khách hàng đặt trước..."
                    value={newRequestNotes}
                    onChange={(e) => setNewRequestNotes(e.target.value)}
                    rows={3}
                    className="bg-white/80 dark:bg-gray-800/80 border-amber-200 focus:border-amber-400 resize-none"
                  />
                </div>

                <div className="backdrop-blur-md bg-gradient-to-br from-indigo-50/70 to-purple-50/70 dark:from-indigo-950/70 dark:to-purple-950/70 p-4 rounded-xl border-2 border-indigo-300/50">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center flex-shrink-0">
                      <AlertCircle className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-base text-indigo-800 dark:text-indigo-200 font-bold mb-1">
                        ℹ️ Quy trình xử lý yêu cầu
                      </p>
                      <p className="text-sm text-indigo-700 dark:text-indigo-300">
                        Yêu cầu sẽ được gửi trực tiếp đến <strong>EVM Staff</strong> để duyệt. 
                        Sau khi EVM duyệt và báo giá, bạn sẽ cần <strong>xác nhận giá</strong> trước khi tiếp tục quy trình giao hàng.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter className="gap-3 pt-4 border-t border-purple-200/30">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsNewRequestDialogOpen(false);
                    resetNewRequestForm();
                  }}
                  className="bg-white/60 hover:bg-white/80 border-purple-200 hover:border-purple-400 hover:scale-105 transition-all duration-300 px-6"
                >
                  ❌ Hủy
                </Button>
                <Button
                  onClick={handleCreateNewRequest}
                  disabled={isSubmittingOrder || newRequestItems.filter(it => (it.categoryId || 0) > 0).length === 0 || !newRequestDeliveryDate}
                  className="bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 hover:from-purple-600 hover:via-pink-600 hover:to-rose-600 text-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 px-8 text-base font-bold"
                >
                  {isSubmittingOrder ? (
                    <>
                      <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Đang gửi yêu cầu...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-5 w-5 mr-2" />
                      🚀 Gửi yêu cầu đến EVM
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
