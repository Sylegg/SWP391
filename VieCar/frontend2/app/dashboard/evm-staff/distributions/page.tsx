"use client";

import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/auth-guards';
import EvmStaffLayout from '@/components/layout/evm-staff-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import {
  Plus,
  Package,
  Building2,
  CheckCircle2,
  XCircle,
  Clock,
  Truck,
  Calendar,
  MessageSquare,
  AlertCircle,
  TrendingUp,
  Filter,
  Search,
  Eye,
  Car,
} from 'lucide-react';
import {
  getAllDistributions,
  sendDistributionInvitation,
  approveDistributionOrder,
  planDistributionDelivery,
  getDistributionStats,
} from '@/lib/distributionApi';
import { getAllDealers } from '@/lib/dealerApi';
import {
  DistributionRes,
  DistributionStatus,
  getDistributionStatusLabel,
  getDistributionStatusColor,
} from '@/types/distribution';
import { DealerRes } from '@/types/dealer';

export default function EvmDistributionsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [distributions, setDistributions] = useState<DistributionRes[]>([]);
  const [dealers, setDealers] = useState<DealerRes[]>([]);
  const [filteredDistributions, setFilteredDistributions] = useState<DistributionRes[]>([]);
  const [selectedDistribution, setSelectedDistribution] = useState<DistributionRes | null>(null);
  
  // Filter state
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Dialog states
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isPlanDialogOpen, setIsPlanDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  
  // Form states
  const [inviteForm, setInviteForm] = useState({
    dealerId: 0,
    message: '',
    deadline: '',
  });
  
  const [approveForm, setApproveForm] = useState({
    approved: true,
    evmNotes: '',
    approvedQuantity: 0,
    manufacturerPrice: 0,
  });
  
  const [planForm, setPlanForm] = useState({
    estimatedDeliveryDate: '',
    planningNotes: '',
  });

  // Review state (per-item approval)
  const [reviewItems, setReviewItems] = useState<{
    id: number;
    name: string;
    color?: string;
    requested: number;
    approved: boolean;
    approvedQuantity: number;
    manufacturerPrice: number;
  }[]>([]);
  
  const [reviewNote, setReviewNote] = useState<string>('');
  
  // Stats
  const [stats, setStats] = useState({
    totalInvitations: 0,
    pendingApproval: 0,
    confirmed: 0,
    completed: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterDistributions();
  }, [distributions, filterStatus, searchQuery]);

  // Helper function to get dealer name - check distribution object first, then lookup
  const getDealerName = (distribution: DistributionRes | number | undefined): string => {
    // If it's a distribution object with dealerName, use it directly
    if (typeof distribution === 'object' && distribution?.dealerName) {
      return distribution.dealerName;
    }
    
    // If it's a number (dealerId) or distribution object without dealerName, lookup
    const dealerId = typeof distribution === 'number' ? distribution : distribution?.dealerId;
    if (!dealerId) return 'Chưa xác định';
    
    const dealer = dealers.find(d => d.id === dealerId);
    return dealer?.name || `Dealer #${dealerId}`;
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [distData, dealerData] = await Promise.all([
        getAllDistributions(),
        getAllDealers(),
      ]);
      
      console.log('📊 Distribution Data:', distData);
      console.log('👥 Dealer Data:', dealerData);
      
      // Debug: Check each distribution's dealerId
      distData.forEach((dist, index) => {
        console.log(`Distribution ${index + 1}:`, {
          id: dist.id,
          dealerId: dist.dealerId,
          dealerIdType: typeof dist.dealerId,
          status: dist.status,
          fullObject: dist
        });
      });
      
      setDistributions(distData);
      setDealers(dealerData);
      
      // Calculate stats
      const statsData = {
        totalInvitations: distData.filter(d => d.status === DistributionStatus.INVITED).length,
        pendingApproval: distData.filter(d => d.status === DistributionStatus.PENDING).length,
        confirmed: distData.filter(d => d.status === DistributionStatus.CONFIRMED).length,
        completed: distData.filter(d => d.status === DistributionStatus.COMPLETED).length,
      };
      setStats(statsData);
      
      toast({
        title: '✅ Tải thành công',
        description: `Đã tải ${distData.length} phân phối`,
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

  const filterDistributions = () => {
    let filtered = distributions;
    
    if (filterStatus !== 'all') {
      filtered = filtered.filter(d => d.status === filterStatus);
    }
    
    if (searchQuery) {
      filtered = filtered.filter(d => {
        const dealerName = getDealerName(d); // Pass the entire distribution object
        return dealerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          d.id.toString().includes(searchQuery);
      });
    }
    
    setFilteredDistributions(filtered);
  };

  // Step 1: Send invitation
  const handleSendInvitation = async () => {
    console.log('🚀 Sending invitation...', inviteForm);
    
    if (!inviteForm.dealerId) {
      toast({
        title: '⚠️ Thiếu thông tin',
        description: 'Vui lòng chọn đại lý',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Convert date to datetime format (add time component)
      const requestData = {
        dealerId: inviteForm.dealerId,
        invitationMessage: inviteForm.message,  // Map message -> invitationMessage
        deadline: inviteForm.deadline 
          ? `${inviteForm.deadline}T23:59:59` 
          : undefined,
      };
      
      console.log('📤 Calling API with data:', requestData);
      await sendDistributionInvitation(requestData);
      
      console.log('✅ API Success!');
      toast({
        title: '✅ Gửi lời mời thành công',
        description: 'Đại lý sẽ nhận được thông báo',
      });
      setIsInviteDialogOpen(false);
      resetInviteForm();
      loadData();
    } catch (error: any) {
      console.error('❌ API Error:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      
      toast({
        title: '❌ Lỗi API',
        description: error.response?.data?.message || error.message || 'Backend chưa có endpoint này. Kiểm tra console để biết thêm chi tiết.',
        variant: 'destructive',
      });
    }
  };

  // Step 4: Approve/Reject order
  const handleApproveOrder = async () => {
    if (!selectedDistribution) return;

    if (approveForm.approved) {
      if (!approveForm.approvedQuantity || approveForm.approvedQuantity <= 0) {
        toast({ title: '⚠️ Thiếu thông tin', description: 'Vui lòng nhập số lượng duyệt', variant: 'destructive' });
        return;
      }
      if (!approveForm.manufacturerPrice || approveForm.manufacturerPrice <= 0) {
        toast({ title: '⚠️ Thiếu thông tin', description: 'Vui lòng nhập giá hãng', variant: 'destructive' });
        return;
      }
    }

    try {
      const requestData = {
        decision: approveForm.approved ? 'CONFIRMED' : 'CANCELED',
        evmNotes: approveForm.evmNotes || undefined,
        approvedQuantity: approveForm.approved ? approveForm.approvedQuantity : undefined,
        manufacturerPrice: approveForm.approved ? approveForm.manufacturerPrice : undefined,
      };
      
      await approveDistributionOrder(selectedDistribution.id, requestData);
      
      setIsApproveDialogOpen(false);
      
      const qtyMismatch = approveForm.approved && approveForm.approvedQuantity !== selectedDistribution.requestedQuantity;
      
      toast({
        title: approveForm.approved ? '✅ Đã duyệt đơn' : '❌ Đã từ chối đơn',
        description: approveForm.approved 
          ? (qtyMismatch ? 'Đã gửi giá hãng cho dealer. Chờ dealer xác nhận.' : 'Lên kế hoạch giao hàng ngay')
          : 'Đơn nhập hàng đã bị từ chối',
      });
      
      // If approved and no quantity mismatch, open planning dialog immediately
      if (approveForm.approved && !qtyMismatch) {
        setIsPlanDialogOpen(true);
      }
      
      resetApproveForm();
      loadData();
    } catch (error: any) {
      toast({
        title: '❌ Lỗi',
        description: error.message || 'Không thể xử lý đơn',
        variant: 'destructive',
      });
    }
  };

  // Step 5: Plan delivery
  const handlePlanDelivery = async () => {
    if (!selectedDistribution || !planForm.estimatedDeliveryDate) {
      toast({
        title: '⚠️ Thiếu thông tin',
        description: 'Vui lòng nhập ngày giao hàng dự kiến',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Convert date to datetime format (add time component)
      const requestData = {
        ...planForm,
        estimatedDeliveryDate: `${planForm.estimatedDeliveryDate}T00:00:00`,
      };
      
      await planDistributionDelivery(selectedDistribution.id, requestData);
      toast({
        title: '✅ Lên kế hoạch thành công',
        description: 'Đã cập nhật kế hoạch giao hàng',
      });
      setIsPlanDialogOpen(false);
      resetPlanForm();
      loadData();
    } catch (error: any) {
      toast({
        title: '❌ Lỗi',
        description: error.message || 'Không thể lên kế hoạch',
        variant: 'destructive',
      });
    }
  };

  const resetInviteForm = () => {
    setInviteForm({ dealerId: 0, message: '', deadline: '' });
  };

  const resetApproveForm = () => {
    setApproveForm({ 
      approved: true, 
      evmNotes: '',
      approvedQuantity: 0,
      manufacturerPrice: 0,
    });
  };

  const resetPlanForm = () => {
    setPlanForm({ estimatedDeliveryDate: '', planningNotes: '' });
  };

  const openApproveDialog = async (distribution: DistributionRes, approved: boolean) => {
    setSelectedDistribution(distribution);
    setApproveForm({ 
      approved, 
      evmNotes: '',
      approvedQuantity: approved ? (distribution.requestedQuantity || 0) : 0,
      manufacturerPrice: 0,
    });
    setIsApproveDialogOpen(true);
  };

  const openPlanDialog = (distribution: DistributionRes) => {
    setSelectedDistribution(distribution);
    setIsPlanDialogOpen(true);
  };

  const openDetailDialog = (distribution: DistributionRes) => {
    setSelectedDistribution(distribution);
    setIsDetailDialogOpen(true);
  };

  const openReviewDialog = (distribution: DistributionRes) => {
    setSelectedDistribution(distribution);
    console.log('🔍 Opening review dialog for distribution:', distribution);
    console.log('📝 Dealer notes:', distribution.dealerNotes);
    console.log('📦 Items:', distribution.items);
    console.log('📅 Requested delivery date:', distribution.requestedDeliveryDate);
    
    // Initialize review items from dealer's submitted items
    const items = (distribution.items || []).map((it) => ({
      id: it.id,
      name: it.product?.name || 'Sản phẩm',
      color: it.color,
      requested: it.quantity || 0,
      approved: true,
      approvedQuantity: it.quantity || 0,
      manufacturerPrice: 0, // Initialize with 0
    }));
    setReviewItems(items);
    setReviewNote(''); // Reset note
    setIsReviewDialogOpen(true);
  };

  const totalRequested = reviewItems.reduce((sum, it) => sum + (it.requested || 0), 0);
  const totalApproved = reviewItems.reduce((sum, it) => sum + (it.approved ? (it.approvedQuantity || 0) : 0), 0);

  const handleSubmitReview = async () => {
    if (!selectedDistribution) return;
    if (!reviewItems.length) {
      toast({ title: '⚠️ Không có dòng nào', description: 'Đơn không có dòng sản phẩm để duyệt', variant: 'destructive' });
      return;
    }
    
    // Validate quantities and prices for approved items
    const missingPriceItems: string[] = [];
    const invalidQuantityItems: string[] = [];
    
    for (const it of reviewItems) {
      if (it.approved) {
        if (it.approvedQuantity <= 0 || it.approvedQuantity > it.requested) {
          invalidQuantityItems.push(it.name);
        }
        if (!it.manufacturerPrice || it.manufacturerPrice <= 0) {
          missingPriceItems.push(it.name);
        }
      }
    }
    
    if (invalidQuantityItems.length > 0) {
      toast({ 
        title: '⚠️ Số lượng không hợp lệ', 
        description: `Các dòng sau có số lượng không hợp lệ: ${invalidQuantityItems.join(', ')}`, 
        variant: 'destructive' 
      });
      return;
    }
    
    if (missingPriceItems.length > 0) {
      toast({ 
        title: '⚠️ Thiếu giá hãng', 
        description: `Vui lòng nhập giá hãng cho: ${missingPriceItems.join(', ')}`, 
        variant: 'destructive' 
      });
      return;
    }
    
    const approvedQty = reviewItems.filter(i => i.approved).reduce((s, i) => s + (i.approvedQuantity || 0), 0);
    if (approvedQty <= 0) {
      toast({ title: '⚠️ Chưa chọn dòng nào', description: 'Chọn ít nhất 1 dòng để duyệt', variant: 'destructive' });
      return;
    }

    const requestedQty = selectedDistribution.requestedQuantity || 0;
    const isInsufficientQty = approvedQty < requestedQty;

    // Calculate average manufacturer price from approved items
    const approvedItems = reviewItems.filter(i => i.approved);
    const avgManufacturerPrice = approvedItems.reduce((sum, it) => sum + it.manufacturerPrice, 0) / approvedItems.length;

    try {
      const requestData: any = {
        decision: 'CONFIRMED',
        approvedQuantity: approvedQty,
        manufacturerPrice: Math.round(avgManufacturerPrice), // Use average price
        evmNotes: `Duyệt theo dòng: ${reviewItems.map(it => 
          `${it.name}${it.color ? ' ('+it.color+')' : ''}: ${it.approved ? `${it.approvedQuantity}/${it.requested} xe @ ${it.manufacturerPrice.toLocaleString()} VND` : '0/'+it.requested}`
        ).join('; ')}${reviewNote ? ` | Ghi chú: ${reviewNote}` : ''}`,
        // 🔥 GỬI ITEMS VỚI GIÁ HÃNG VÀ SỐ LƯỢNG RIÊNG CHO TỪNG DÒNG
        items: reviewItems
          .filter(it => it.approved)
          .map(it => ({
            distributionItemId: it.id,
            manufacturerPrice: it.manufacturerPrice, // Giá hãng bán cho dealer
            quantity: it.approvedQuantity, // Số lượng EVM duyệt
          })),
      };

      console.log('🔥 Sending approval with items (manufacturerPrice + quantity):', requestData);
      await approveDistributionOrder(selectedDistribution.id, requestData);
      
      // Always send price to dealer for confirmation
      toast({ 
        title: '📤 Đã gửi báo giá', 
        description: 'Đã gửi giá hãng cho dealer. Chờ dealer xác nhận giá trước khi lên kế hoạch giao hàng.'
      });
      
      setIsReviewDialogOpen(false);
      
      // Note: Do not open plan dialog - must wait for dealer to accept price first
      
      loadData();
    } catch (error: any) {
      toast({ title: '❌ Lỗi', description: error.message || 'Không thể duyệt đơn', variant: 'destructive' });
    }
  };

  return (
  <ProtectedRoute allowedRoles={['EVM Staff']}>
      <EvmStaffLayout>
        <div className="relative min-h-screen overflow-hidden">
          {/* Animated Water Droplets Background */}
          <div className="fixed inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-[10%] left-[15%] w-32 h-32 bg-cyan-400/20 rounded-full blur-3xl animate-float-slow"></div>
            <div className="absolute top-[60%] right-[20%] w-40 h-40 bg-blue-400/20 rounded-full blur-3xl animate-float-medium"></div>
            <div className="absolute bottom-[20%] left-[25%] w-36 h-36 bg-teal-400/20 rounded-full blur-3xl animate-float-fast"></div>
            <div className="absolute top-[30%] right-[10%] w-28 h-28 bg-sky-300/20 rounded-full blur-2xl animate-float-slow-reverse"></div>
          </div>

          <div className="relative z-10 p-6 space-y-6">
          {/* Header with Glass Effect */}
          <div className="backdrop-blur-md bg-white/70 dark:bg-gray-900/70 p-6 rounded-2xl border border-white/20 shadow-xl">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 via-blue-600 to-teal-600 bg-clip-text text-transparent flex items-center gap-2">
                  <Package className="h-8 w-8 text-cyan-600 drop-shadow-lg" />
                  Quản lý Phân phối
                </h1>
                <p className="text-muted-foreground mt-2">
                  Gửi lời mời, duyệt đơn và lên kế hoạch giao hàng cho đại lý
                </p>
              </div>
              <Button 
                onClick={() => setIsInviteDialogOpen(true)}
                className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <Plus className="h-4 w-4 mr-2" />
                Gửi lời mời mới
              </Button>
            </div>
          </div>

          {/* Stats Cards with Glass Effect */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="backdrop-blur-md bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-white/30 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">Lời mời đang chờ</p>
                  <p className="text-3xl font-bold mt-2 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">{stats.totalInvitations}</p>
                  <p className="text-xs text-muted-foreground mt-1">Chờ dealer phản hồi</p>
                </div>
                <Clock className="h-10 w-10 text-blue-500 opacity-70" />
              </div>
              <div className="mt-2 h-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            </div>

            <div className="backdrop-blur-md bg-gradient-to-br from-yellow-500/20 to-amber-500/20 border border-white/30 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 font-medium">Chờ duyệt</p>
                  <p className="text-3xl font-bold mt-2 text-yellow-600">{stats.pendingApproval}</p>
                  <p className="text-xs text-muted-foreground mt-1">Đơn cần xem xét</p>
                </div>
                <AlertCircle className="h-10 w-10 text-yellow-500 opacity-70" />
              </div>
              <div className="mt-2 h-1 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            </div>

            <div className="backdrop-blur-md bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-white/30 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-green-700 dark:text-green-300 font-medium">Đã duyệt</p>
                  <p className="text-3xl font-bold mt-2 text-green-600">{stats.confirmed}</p>
                  <p className="text-xs text-muted-foreground mt-1">Chờ lên kế hoạch</p>
                </div>
                <CheckCircle2 className="h-10 w-10 text-green-500 opacity-70" />
              </div>
              <div className="mt-2 h-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            </div>

            <div className="backdrop-blur-md bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-white/30 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-purple-700 dark:text-purple-300 font-medium">Hoàn thành</p>
                  <p className="text-3xl font-bold mt-2 text-purple-600">{stats.completed}</p>
                  <p className="text-xs text-muted-foreground mt-1">Đã giao thành công</p>
                </div>
                <TrendingUp className="h-10 w-10 text-purple-500 opacity-70" />
              </div>
              <div className="mt-2 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            </div>
          </div>

          {/* Filters with Glass Effect */}
          <div className="backdrop-blur-md bg-white/60 dark:bg-gray-900/60 p-4 rounded-2xl border border-white/20 shadow-lg">
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-cyan-600" />
                  <Input
                    placeholder="Tìm theo tên đại lý hoặc mã phân phối..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-white/50 dark:bg-gray-800/50 border-white/30 focus:border-cyan-400 transition-all duration-300"
                  />
                </div>
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[200px] bg-white/50 dark:bg-gray-800/50 border-white/30 focus:border-cyan-400 transition-all duration-300">
                  <Filter className="h-4 w-4 mr-2 text-cyan-600" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="backdrop-blur-md bg-white/90 dark:bg-gray-900/90 border-white/30">
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value={DistributionStatus.INVITED}>Đã gửi lời mời</SelectItem>
                  <SelectItem value={DistributionStatus.ACCEPTED}>Đã chấp nhận</SelectItem>
                  <SelectItem value={DistributionStatus.PENDING}>Chờ duyệt</SelectItem>
                  <SelectItem value={DistributionStatus.CONFIRMED}>Đã duyệt</SelectItem>
                  <SelectItem value={DistributionStatus.PLANNED}>Đã lên kế hoạch</SelectItem>
                  <SelectItem value={DistributionStatus.COMPLETED}>Hoàn thành</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Distribution List - Compact Glass Cards */}
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div>
              <p className="mt-2 text-cyan-600 font-medium">Đang tải...</p>
            </div>
          ) : filteredDistributions.length === 0 ? (
            <div className="backdrop-blur-md bg-white/60 dark:bg-gray-900/60 p-12 rounded-2xl border border-white/20 shadow-lg text-center">
              <Package className="h-12 w-12 mx-auto text-cyan-600 mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Chưa có phân phối nào</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredDistributions.map((dist) => {
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
                    <div className="flex justify-between items-center">
                      {/* Left: Compact Info */}
                      <div className="flex items-center gap-6">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                            Phân phối #{dist.id}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
                            <span className="flex items-center gap-1 font-medium">
                              <Building2 className="h-4 w-4" />
                              {getDealerName(dist)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {dist.createdAt ? new Date(dist.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                            </span>
                          </div>
                        </div>
                        
                        <Badge className={`${getDistributionStatusColor(dist.status)} px-4 py-1`}>
                          {getDistributionStatusLabel(dist.status)}
                        </Badge>
                      </div>
                      
                      {/* Right: Action Buttons */}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openDetailDialog(dist)}
                          className="bg-white/50 dark:bg-gray-800/50 border-white/40 hover:bg-white/70 hover:scale-105 transition-all duration-300"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Chi tiết
                        </Button>
                        
                        {/* Step 4: Approve/Reject buttons for PENDING status */}
                        {dist.status === DistributionStatus.PENDING && (
                          <>
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => openReviewDialog(dist)}
                              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 hover:scale-105 transition-all duration-300"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Duyệt đơn
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => openApproveDialog(dist, false)}
                              className="hover:scale-105 transition-all duration-300"
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Từ chối
                            </Button>
                          </>
                        )}
                        
                        {/* Step 4a: If dealer rejected price, allow EVM to revise */}
                        {dist.status === DistributionStatus.PRICE_REJECTED && (
                          <>
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => openReviewDialog(dist)}
                              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 hover:scale-105 transition-all duration-300"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Sửa giá
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => openApproveDialog(dist, false)}
                              className="hover:scale-105 transition-all duration-300"
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Hủy đơn
                            </Button>
                          </>
                        )}
                        
                        {/* Step 5: Plan button for CONFIRMED status */}
                        {dist.status === DistributionStatus.CONFIRMED && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => openPlanDialog(dist)}
                            className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 hover:scale-105 transition-all duration-300"
                          >
                            <Truck className="h-4 w-4 mr-1" />
                            Lên kế hoạch
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Dialog: Send Invitation - Glass Effect */}
          <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
            <DialogContent className="backdrop-blur-xl bg-gradient-to-br from-blue-50/95 to-cyan-50/95 dark:from-blue-950/95 dark:to-cyan-950/95 border-2 border-blue-200/50 dark:border-blue-800/50 shadow-2xl max-w-md">
              <DialogHeader>
                <DialogTitle className="text-2xl bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  📨 Gửi lời mời nhập hàng
                </DialogTitle>
                <DialogDescription className="text-gray-600 dark:text-gray-300">
                  Mời đại lý tham gia đợt phân phối sản phẩm
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="dealer">Đại lý *</Label>
                  <Select
                    value={inviteForm.dealerId > 0 ? inviteForm.dealerId.toString() : undefined}
                    onValueChange={(value) => setInviteForm({ ...inviteForm, dealerId: parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn đại lý" />
                    </SelectTrigger>
                    <SelectContent>
                      {dealers.map((dealer) => (
                        <SelectItem key={dealer.id} value={dealer.id.toString()}>
                          {dealer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Lời nhắn</Label>
                  <Textarea
                    id="message"
                    placeholder="VD: Hãng đang mở đợt phân phối tháng 11, quý đại lý có muốn nhập không?"
                    value={inviteForm.message}
                    onChange={(e) => setInviteForm({ ...inviteForm, message: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deadline">Hạn phản hồi</Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={inviteForm.deadline}
                    onChange={(e) => setInviteForm({ ...inviteForm, deadline: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setIsInviteDialogOpen(false)}
                  className="bg-white/50 dark:bg-gray-800/50 border-white/40 hover:bg-white/70 hover:scale-105 transition-all duration-300"
                >
                  Hủy
                </Button>
                <Button 
                  onClick={handleSendInvitation}
                  className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 hover:scale-105 transition-all duration-300"
                >
                  Gửi lời mời
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Dialog: Approve/Reject Order - Glass Effect */}
          <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
            <DialogContent className={`backdrop-blur-xl ${approveForm.approved ? 'bg-gradient-to-br from-green-50/95 to-emerald-50/95 dark:from-green-950/95 dark:to-emerald-950/95 border-2 border-green-200/50 dark:border-green-800/50' : 'bg-gradient-to-br from-red-50/95 to-rose-50/95 dark:from-red-950/95 dark:to-rose-950/95 border-2 border-red-200/50 dark:border-red-800/50'} shadow-2xl`}>
              <DialogHeader>
                <DialogTitle className={`text-2xl ${approveForm.approved ? 'bg-gradient-to-r from-green-600 to-emerald-600' : 'bg-gradient-to-r from-red-600 to-rose-600'} bg-clip-text text-transparent`}>
                  {approveForm.approved ? '✅ Duyệt đơn nhập hàng' : '❌ Từ chối đơn nhập hàng'}
                </DialogTitle>
                <DialogDescription className="text-gray-600 dark:text-gray-300">
                  Phân phối #{selectedDistribution?.id} - {selectedDistribution ? getDealerName(selectedDistribution) : ''}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {approveForm.approved ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="approvedQuantity">Số lượng duyệt *</Label>
                      <Input
                        id="approvedQuantity"
                        type="number"
                        min={0}
                        placeholder="Nhập số lượng duyệt"
                        value={approveForm.approvedQuantity || ''}
                        onChange={(e) => setApproveForm({ ...approveForm, approvedQuantity: Number(e.target.value) })}
                      />
                      <p className="text-xs text-muted-foreground">
                        Yêu cầu: {selectedDistribution?.requestedQuantity || 0} xe
                        {approveForm.approvedQuantity !== selectedDistribution?.requestedQuantity && 
                          ' • Khác yêu cầu → cần dealer xác nhận'}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="manufacturerPrice">Giá hãng (VND) *</Label>
                      <Input
                        id="manufacturerPrice"
                        type="number"
                        min={0}
                        placeholder="VD: 500000000"
                        value={approveForm.manufacturerPrice || ''}
                        onChange={(e) => setApproveForm({ ...approveForm, manufacturerPrice: Number(e.target.value) })}
                      />
                      <p className="text-xs text-muted-foreground">
                        Giá này sẽ được gửi cho dealer để xác nhận
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="evmNotes">Ghi chú cho dealer</Label>
                      <Textarea
                        id="evmNotes"
                        placeholder="VD: Giá đã bao gồm VAT, giao hàng trong 2 tuần"
                        value={approveForm.evmNotes}
                        onChange={(e) => setApproveForm({ ...approveForm, evmNotes: e.target.value })}
                        rows={3}
                      />
                    </div>
                  </>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="evmNotes">Lý do từ chối (không bắt buộc)</Label>
                    <Textarea
                      id="evmNotes"
                      placeholder="VD: Kho không đủ hàng, vui lòng điều chỉnh số lượng"
                      value={approveForm.evmNotes}
                      onChange={(e) => setApproveForm({ ...approveForm, evmNotes: e.target.value })}
                      rows={3}
                    />
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setIsApproveDialogOpen(false)}
                  className="bg-white/50 dark:bg-gray-800/50 border-white/40 hover:bg-white/70 hover:scale-105 transition-all duration-300"
                >
                  Hủy
                </Button>
                <Button 
                  onClick={handleApproveOrder}
                  className={approveForm.approved ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 hover:scale-105 transition-all duration-300' : 'bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 hover:scale-105 transition-all duration-300'}
                >
                  {approveForm.approved ? 'Duyệt' : 'Từ chối'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Dialog: Review & per-item approval - Glass Effect */}
          <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
            <DialogContent className="backdrop-blur-xl bg-gradient-to-br from-purple-50/95 to-pink-50/95 dark:from-purple-950/95 dark:to-pink-950/95 border-2 border-purple-200/50 dark:border-purple-800/50 shadow-2xl max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  👀 Xem đơn & duyệt theo dòng
                </DialogTitle>
                <DialogDescription className="text-gray-600 dark:text-gray-300">
                  Phân phối #{selectedDistribution?.id} - {selectedDistribution ? getDealerName(selectedDistribution) : ''}
                </DialogDescription>
              </DialogHeader>
              {selectedDistribution && (
                <div className="space-y-4 py-2">
                  {/* Dealer Notes */}
                  {selectedDistribution.dealerNotes && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
                      <Label className="text-sm font-medium text-amber-900">💬 Lời nhắn từ Dealer Manager</Label>
                      <p className="mt-1 text-sm text-amber-800">{selectedDistribution.dealerNotes}</p>
                    </div>
                  )}
                  
                  {/* Requested Delivery Date */}
                  {selectedDistribution.requestedDeliveryDate && (
                    <div className="text-sm text-muted-foreground">
                      📅 Ngày giao hàng mong muốn: <span className="font-medium">
                        {new Date(selectedDistribution.requestedDeliveryDate).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  )}
                  
                  {reviewItems.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Đơn này chưa có dòng sản phẩm.</p>
                  ) : (
                    <div className="space-y-3">
                      {reviewItems.map((it, idx) => (
                        <div key={it.id ?? idx} className="p-3 border rounded-md">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <div className="font-medium">{it.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {it.color ? `Màu: ${it.color} • ` : ''}Yêu cầu: {it.requested}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Checkbox
                                checked={it.approved}
                                onCheckedChange={(checked) => {
                                  const val = Boolean(checked);
                                  setReviewItems((prev) => prev.map((x) => x.id === it.id ? { ...x, approved: val, approvedQuantity: val ? (x.approvedQuantity || x.requested) : 0 } : x));
                                }}
                              />
                              <span className="text-sm">Duyệt</span>
                            </div>
                          </div>
                          <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <Label className="text-xs text-muted-foreground">Số lượng duyệt</Label>
                              <Input
                                type="number"
                                min={0}
                                max={it.requested}
                                value={it.approvedQuantity}
                                disabled={!it.approved}
                                onChange={(e) => {
                                  const v = Math.max(0, Math.min(it.requested, Number(e.target.value)));
                                  setReviewItems((prev) => prev.map((x) => x.id === it.id ? { ...x, approvedQuantity: v } : x));
                                }}
                              />
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground">Giá hãng (VND/xe) *</Label>
                              <Input
                                type="number"
                                min={0}
                                placeholder="VD: 500000000"
                                value={it.manufacturerPrice || ''}
                                disabled={!it.approved}
                                onChange={(e) => {
                                  const price = Number(e.target.value);
                                  setReviewItems((prev) => prev.map((x) => x.id === it.id ? { ...x, manufacturerPrice: price } : x));
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                      <div className="flex items-center justify-between text-sm">
                        <div className="text-muted-foreground">Tổng yêu cầu: <span className="font-medium">{totalRequested}</span></div>
                        <div> Tổng duyệt: <span className="font-medium">{totalApproved}</span></div>
                      </div>
                      
                      {/* Info box - always show when approving */}
                      {totalApproved > 0 && (
                        <div className={`p-3 rounded-md ${
                          totalApproved < totalRequested 
                            ? 'bg-amber-50 border border-amber-200'
                            : 'bg-blue-50 border border-blue-200'
                        }`}>
                          <div className="flex items-start gap-2">
                            <span className={totalApproved < totalRequested ? 'text-amber-600' : 'text-blue-600'}>
                              {totalApproved < totalRequested ? '⚠️' : 'ℹ️'}
                            </span>
                            <div className="flex-1">
                              <p className={`text-sm font-medium ${
                                totalApproved < totalRequested ? 'text-amber-800' : 'text-blue-800'
                              }`}>
                                {totalApproved < totalRequested ? 'Số lượng không đủ yêu cầu' : 'Số lượng đủ yêu cầu'}
                              </p>
                              <p className={`text-xs mt-1 ${
                                totalApproved < totalRequested ? 'text-amber-700' : 'text-blue-700'
                              }`}>
                                Dealer sẽ nhận báo giá và phải xác nhận trước khi lên kế hoạch giao hàng.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* General note for the entire order */}
                      {totalApproved > 0 && (
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Ghi chú chung (không bắt buộc)</Label>
                          <Textarea
                            placeholder="VD: Tổng số lượng xe được duyệt là 7/10 xe do kho không đủ hàng..."
                            value={reviewNote}
                            onChange={(e) => setReviewNote(e.target.value)}
                            rows={3}
                            className="resize-none"
                          />
                          <p className="text-xs text-muted-foreground">
                            Ghi chú này sẽ được gửi kèm đơn cho dealer
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setIsReviewDialogOpen(false)}
                  className="bg-white/50 dark:bg-gray-800/50 border-white/40 hover:bg-white/70 hover:scale-105 transition-all duration-300"
                >
                  Hủy
                </Button>
                <Button 
                  onClick={handleSubmitReview} 
                  disabled={!reviewItems.length || totalApproved === 0}
                  className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  📤 Gửi báo giá cho dealer
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Dialog: Plan Delivery - Glass Effect */}
          <Dialog open={isPlanDialogOpen} onOpenChange={setIsPlanDialogOpen}>
            <DialogContent className="backdrop-blur-xl bg-gradient-to-br from-indigo-50/95 to-purple-50/95 dark:from-indigo-950/95 dark:to-purple-950/95 border-2 border-indigo-200/50 dark:border-indigo-800/50 shadow-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  🚚 Lên kế hoạch giao hàng
                </DialogTitle>
                <DialogDescription className="text-gray-600 dark:text-gray-300">
                  Phân phối #{selectedDistribution?.id} - {selectedDistribution ? getDealerName(selectedDistribution) : ''}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="deliveryDate">Ngày giao hàng dự kiến *</Label>
                  <Input
                    id="deliveryDate"
                    type="date"
                    value={planForm.estimatedDeliveryDate}
                    onChange={(e) => setPlanForm({ ...planForm, estimatedDeliveryDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="planningNotes">Ghi chú kế hoạch</Label>
                  <Textarea
                    id="planningNotes"
                    placeholder="VD: Xe sẽ được giao bằng xe tải, liên hệ trước 1 ngày"
                    value={planForm.planningNotes}
                    onChange={(e) => setPlanForm({ ...planForm, planningNotes: e.target.value })}
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setIsPlanDialogOpen(false)}
                  className="bg-white/50 dark:bg-gray-800/50 border-white/40 hover:bg-white/70 hover:scale-105 transition-all duration-300"
                >
                  Hủy
                </Button>
                <Button 
                  onClick={handlePlanDelivery}
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 hover:scale-105 transition-all duration-300"
                >
                  Lưu kế hoạch
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Dialog: Distribution Detail - Glass Effect */}
          <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
            <DialogContent className="backdrop-blur-xl bg-gradient-to-br from-cyan-50/95 to-blue-50/95 dark:from-cyan-950/95 dark:to-blue-950/95 border-2 border-cyan-200/50 dark:border-cyan-800/50 shadow-2xl max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                  Chi tiết Phân phối #{selectedDistribution?.id}
                </DialogTitle>
                <DialogDescription className="text-gray-600 dark:text-gray-300">
                  <Badge className={getDistributionStatusColor(selectedDistribution?.status || DistributionStatus.INVITED)}>
                    {getDistributionStatusLabel(selectedDistribution?.status || DistributionStatus.INVITED)}
                  </Badge>
                </DialogDescription>
              </DialogHeader>
              {selectedDistribution && (
                <div className="space-y-6 py-4">
                  {/* Header Info Cards */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="backdrop-blur-md bg-gradient-to-br from-blue-400/10 to-cyan-400/10 p-4 rounded-xl border border-blue-200/30">
                      <Label className="text-xs text-blue-700 dark:text-blue-300 font-semibold uppercase">Đại lý</Label>
                      <p className="mt-2 text-lg font-bold text-gray-900 dark:text-white">{getDealerName(selectedDistribution)}</p>
                      {selectedDistribution.dealerId && (
                        <p className="text-xs text-blue-600 mt-1">ID: {selectedDistribution.dealerId}</p>
                      )}
                    </div>
                    <div className="backdrop-blur-md bg-gradient-to-br from-purple-400/10 to-pink-400/10 p-4 rounded-xl border border-purple-200/30">
                      <Label className="text-xs text-purple-700 dark:text-purple-300 font-semibold uppercase">Ngày tạo</Label>
                      <p className="mt-2 text-lg font-bold text-gray-900 dark:text-white">
                        {selectedDistribution.createdAt 
                          ? new Date(selectedDistribution.createdAt).toLocaleDateString('vi-VN')
                          : 'N/A'
                        }
                      </p>
                      <p className="text-xs text-purple-600 mt-1">
                        {selectedDistribution.createdAt 
                          ? new Date(selectedDistribution.createdAt).toLocaleTimeString('vi-VN')
                          : ''
                        }
                      </p>
                    </div>
                  </div>
                  
                  {/* Messages Section */}
                  {selectedDistribution.invitationMessage && (
                    <div className="backdrop-blur-md bg-gradient-to-br from-blue-400/10 to-indigo-400/10 p-4 rounded-xl border border-blue-200/30">
                      <div className="flex items-center gap-2 mb-2">
                        <MessageSquare className="h-4 w-4 text-blue-600" />
                        <Label className="text-sm font-semibold text-blue-700 dark:text-blue-300">Lời mời từ EVM</Label>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{selectedDistribution.invitationMessage}</p>
                    </div>
                  )}
                  
                  {selectedDistribution.dealerNotes && (
                    <div className="backdrop-blur-md bg-gradient-to-br from-amber-400/10 to-orange-400/10 p-4 rounded-xl border border-amber-200/30">
                      <div className="flex items-center gap-2 mb-2">
                        <MessageSquare className="h-4 w-4 text-amber-600" />
                        <Label className="text-sm font-semibold text-amber-700 dark:text-amber-300">Ghi chú của Dealer</Label>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{selectedDistribution.dealerNotes}</p>
                    </div>
                  )}

                  {/* Price Section */}
                  {selectedDistribution.manufacturerPrice && (
                    <div className="backdrop-blur-md bg-gradient-to-br from-indigo-400/10 to-purple-400/10 p-4 rounded-xl border border-indigo-200/30">
                      <Label className="text-xs text-indigo-700 dark:text-indigo-300 font-semibold uppercase">Giá hãng</Label>
                      <p className="mt-2 text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                        {selectedDistribution.manufacturerPrice.toLocaleString('vi-VN')} VND / xe
                      </p>
                      {selectedDistribution.requestedQuantity && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Tổng: <span className="font-semibold">{(selectedDistribution.manufacturerPrice * selectedDistribution.requestedQuantity).toLocaleString('vi-VN')} VND</span>
                        </p>
                      )}
                    </div>
                  )}

                  {/* Dealer Order Items */}
                  {selectedDistribution.items && selectedDistribution.items.length > 0 && (
                    <div className="backdrop-blur-md bg-gradient-to-br from-green-400/10 to-emerald-400/10 p-4 rounded-xl border border-green-200/30">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-green-600" />
                          <Label className="text-sm font-semibold text-green-700 dark:text-green-300">Yêu cầu từ Dealer</Label>
                        </div>
                        {selectedDistribution.requestedDeliveryDate && (
                          <div className="flex items-center gap-1 text-xs text-green-600">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(selectedDistribution.requestedDeliveryDate).toLocaleDateString('vi-VN')}</span>
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        {selectedDistribution.items.map((it, idx) => (
                          <div key={idx} className="backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 p-3 rounded-lg border border-green-200/30">
                            <div className="font-medium text-gray-900 dark:text-white">{it.product?.name || 'Sản phẩm'}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {it.color && <span className="mr-2">🎨 Màu: {it.color}</span>}
                              <span className="font-semibold">📦 Số lượng: {it.quantity}</span>
                            </div>
                          </div>
                        ))}
                        <div className="pt-2 border-t border-green-200/30">
                          <p className="text-sm font-semibold text-green-700 dark:text-green-300">
                            Tổng số lượng yêu cầu: {selectedDistribution.items.reduce((s, it) => s + (it.quantity || 0), 0)} xe
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* EVM Notes */}
                  {selectedDistribution.evmNotes && (
                    <div className="backdrop-blur-md bg-gradient-to-br from-teal-400/10 to-cyan-400/10 p-4 rounded-xl border border-teal-200/30">
                      <div className="flex items-center gap-2 mb-2">
                        <MessageSquare className="h-4 w-4 text-teal-600" />
                        <Label className="text-sm font-semibold text-teal-700 dark:text-teal-300">Ghi chú của EVM</Label>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{selectedDistribution.evmNotes}</p>
                    </div>
                  )}
                  
                  {/* Products List */}
                  {selectedDistribution.products && selectedDistribution.products.length > 0 && (
                    <div className="backdrop-blur-md bg-gradient-to-br from-pink-400/10 to-rose-400/10 p-4 rounded-xl border border-pink-200/30">
                      <div className="flex items-center gap-2 mb-3">
                        <Car className="h-4 w-4 text-pink-600" />
                        <Label className="text-sm font-semibold text-pink-700 dark:text-pink-300">
                          Sản phẩm phân phối ({selectedDistribution.products.length})
                        </Label>
                      </div>
                      <div className="space-y-2">
                        {selectedDistribution.products.map((product, idx) => (
                          <div key={idx} className="backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 p-3 rounded-lg border border-pink-200/30 hover:shadow-md transition-shadow">
                            <div className="font-medium text-gray-900 dark:text-white">{product.name}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              <span>🔢 VIN: {product.vinNum}</span> • <span>⚙️ Engine: {product.engineNum}</span>
                            </div>
                            <div className="text-sm font-semibold text-pink-600 mt-1">
                              💰 {product.price?.toLocaleString('vi-VN')}đ
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {selectedDistribution.estimatedDeliveryDate && (
                    <div className="backdrop-blur-md bg-gradient-to-br from-purple-400/10 to-violet-400/10 p-4 rounded-xl border border-purple-200/30">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="h-4 w-4 text-purple-600" />
                        <Label className="text-xs text-purple-700 dark:text-purple-300 font-semibold uppercase">Ngày giao dự kiến</Label>
                      </div>
                      <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {new Date(selectedDistribution.estimatedDeliveryDate).toLocaleDateString('vi-VN')}
                      </p>
                      <p className="text-xs text-purple-600 mt-1">
                        {new Date(selectedDistribution.estimatedDeliveryDate).toLocaleDateString('vi-VN', { weekday: 'long' })}
                      </p>
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
        </div>
      </EvmStaffLayout>
    </ProtectedRoute>
  );
}
