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
  FileText,
  Check,
  DollarSign,
  TruckIcon,
  CheckCircle,
} from 'lucide-react';
import {
  getAllDistributions,
  sendDistributionInvitation,
  approveDistributionOrder,
  resendPrice,
  planDistributionDelivery,
  getDistributionStats,
  createSupplementaryDistribution,
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
  const [selectedDealerId, setSelectedDealerId] = useState<number | null>(null); // Thêm filter theo dealer
  const [viewMode, setViewMode] = useState<'all' | 'byDealer'>('all'); // Chế độ xem
  
  // Dialog states
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isPlanDialogOpen, setIsPlanDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [isSupplementaryConfirmOpen, setIsSupplementaryConfirmOpen] = useState(false);
  
  // Supplementary confirm data
  const [supplementaryConfirmData, setSupplementaryConfirmData] = useState<{
    parentDist: DistributionRes | null;
    shortage: number;
    requested: number;
    approved: number;
    parentCode: string;
    shortageItems?: {
      id: number;
      name: string;
      color?: string;
      requested: number;
      approved: number;
      shortage: number;
      manufacturerPrice?: number;
    }[];
  }>({
    parentDist: null,
    shortage: 0,
    requested: 0,
    approved: 0,
    parentCode: '',
    shortageItems: [],
  });
  
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
    approvedQuantity: number;
    manufacturerPrice: number;
  }[]>([]);
  
  const [reviewNote, setReviewNote] = useState<string>('');
  
  // State để track đơn nào đang tạo bổ sung (tránh spam click)
  const [creatingSupplementaryId, setCreatingSupplementaryId] = useState<number | null>(null);
  
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
  }, [distributions, filterStatus, searchQuery, selectedDealerId]);

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

  const filterDistributions = () => {
    let filtered = distributions;
    
    if (filterStatus !== 'all') {
      filtered = filtered.filter(d => d.status === filterStatus);
    }
    
    if (selectedDealerId) {
      filtered = filtered.filter(d => d.dealerId === selectedDealerId);
    }
    
    if (searchQuery) {
      filtered = filtered.filter(d => {
        const dealerName = getDealerName(d); // Pass the entire distribution object
        const code = d.code || '';
        return dealerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          code.toLowerCase().includes(searchQuery.toLowerCase()) ||
          d.id.toString().includes(searchQuery);
      });
    }
    
    setFilteredDistributions(filtered);
  };
  
  // Get distributions grouped by dealer
  const getDistributionsByDealer = () => {
    // Get distributions filtered by status and search, but NOT by dealer
    let distsToGroup = distributions;
    
    if (filterStatus !== 'all') {
      distsToGroup = distsToGroup.filter(d => d.status === filterStatus);
    }
    
    if (searchQuery) {
      distsToGroup = distsToGroup.filter(d => {
        const dealerName = getDealerName(d);
        const code = d.code || '';
        return dealerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          code.toLowerCase().includes(searchQuery.toLowerCase()) ||
          d.id.toString().includes(searchQuery);
      });
    }
    
    const grouped = new Map<number, DistributionRes[]>();
    
    distsToGroup.forEach(dist => {
      if (!grouped.has(dist.dealerId)) {
        grouped.set(dist.dealerId, []);
      }
      grouped.get(dist.dealerId)!.push(dist);
    });
    
    return Array.from(grouped.entries()).map(([dealerId, dists]) => ({
      dealerId,
      dealerName: getDealerName(dists[0]),
      distributions: dists,
      count: dists.length,
      stats: {
        invited: dists.filter(d => d.status === DistributionStatus.INVITED).length,
        pending: dists.filter(d => d.status === DistributionStatus.PENDING).length,
        confirmed: dists.filter(d => d.status === DistributionStatus.CONFIRMED).length,
        completed: dists.filter(d => d.status === DistributionStatus.COMPLETED).length,
      }
    }));
  };

  // Step 1: Send invitation
  const handleSendInvitation = async () => {
    console.log('🚀 Sending invitation...', inviteForm);
    
    if (!inviteForm.dealerId) {
      toast({
        title: '⚠️ Thiếu thông tin',
        description: 'Vui lòng chọn đại lý',
        variant: 'destructive',
        duration: 3000,
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
        duration: 3000,
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
        duration: 3000,
      });
    }
  };

  // Step 4: Approve/Reject order
  const handleApproveOrder = async () => {
    if (!selectedDistribution) return;

    if (approveForm.approved) {
      if (!approveForm.approvedQuantity || approveForm.approvedQuantity <= 0) {
        toast({ title: '⚠️ Thiếu thông tin', description: 'Vui lòng nhập số lượng duyệt', variant: 'destructive', duration: 3000 });
        return;
      }
      if (!approveForm.manufacturerPrice || approveForm.manufacturerPrice <= 0) {
        toast({ title: '⚠️ Thiếu thông tin', description: 'Vui lòng nhập giá hãng', variant: 'destructive', duration: 3000 });
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
        duration: 3000,
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
        duration: 3000,
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
        duration: 3000,
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
        duration: 3000,
      });
      setIsPlanDialogOpen(false);
      resetPlanForm();
      loadData();
    } catch (error: any) {
      toast({
        title: '❌ Lỗi',
        description: error.message || 'Không thể lên kế hoạch',
        variant: 'destructive',
        duration: 3000,
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
      name: it.product?.name || it.category?.name || 'Sản phẩm',
      color: it.color,
      requested: it.quantity || 0,
      approvedQuantity: it.quantity || 0,
      manufacturerPrice: 0, // Initialize with 0
    }));
    setReviewItems(items);
    setReviewNote(''); // Reset note
    setIsReviewDialogOpen(true);
  };

  const totalRequested = reviewItems.reduce((sum, it) => sum + (it.requested || 0), 0);
  const totalApproved = reviewItems.reduce((sum, it) => sum + (it.approvedQuantity || 0), 0);

  const handleSubmitReview = async () => {
    if (!selectedDistribution) return;
    if (!reviewItems.length) {
      toast({ title: '⚠️ Không có dòng nào', description: 'Đơn không có dòng sản phẩm để duyệt', variant: 'destructive', duration: 3000 });
      return;
    }
    
    // Validate quantities and prices for items with quantity > 0
    const missingPriceItems: string[] = [];
    const invalidQuantityItems: string[] = [];
    
    for (const it of reviewItems) {
      // Only validate items with approvedQuantity > 0
      if (it.approvedQuantity > 0) {
        if (it.approvedQuantity > it.requested) {
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
        description: `Các dòng sau có số lượng vượt yêu cầu: ${invalidQuantityItems.join(', ')}`, 
        variant: 'destructive',
        duration: 3000,
      });
      return;
    }
    
    if (missingPriceItems.length > 0) {
      toast({ 
        title: '⚠️ Thiếu giá hãng', 
        description: `Vui lòng nhập giá hãng cho các dòng có số lượng: ${missingPriceItems.join(', ')}`, 
        variant: 'destructive',
        duration: 3000,
      });
      return;
    }
    
    // Calculate total approved quantity (items with quantity > 0)
    const approvedQty = reviewItems.reduce((s, i) => s + (i.approvedQuantity || 0), 0);
    if (approvedQty <= 0) {
      toast({ title: '⚠️ Chưa nhập số lượng', description: 'Vui lòng nhập số lượng duyệt cho ít nhất 1 dòng', variant: 'destructive', duration: 3000 });
      return;
    }

    const requestedQty = selectedDistribution.requestedQuantity || 0;
    const isInsufficientQty = approvedQty < requestedQty;

    // Calculate average manufacturer price from items with quantity > 0
    const itemsWithQty = reviewItems.filter(i => i.approvedQuantity > 0);
    const avgManufacturerPrice = itemsWithQty.length > 0 
      ? itemsWithQty.reduce((sum, it) => sum + it.manufacturerPrice, 0) / itemsWithQty.length 
      : 0;

    // Validate average price
    if (!avgManufacturerPrice || avgManufacturerPrice <= 0) {
      toast({ 
        title: '⚠️ Giá hãng không hợp lệ', 
        description: 'Vui lòng kiểm tra lại giá hãng của các dòng xe có số lượng', 
        variant: 'destructive',
        duration: 3000,
      });
      return;
    }

    try {
      const requestData: any = {
        decision: 'CONFIRMED',
        approvedQuantity: approvedQty,
        manufacturerPrice: Math.round(avgManufacturerPrice), // Use average price
        evmNotes: `Duyệt theo dòng: ${reviewItems.map(it => 
          `${it.name}${it.color ? ' ('+it.color+')' : ''}: ${it.approvedQuantity > 0 ? `${it.approvedQuantity}/${it.requested} xe @ ${it.manufacturerPrice.toLocaleString()} VND` : '0/'+it.requested}`
        ).join('; ')}${reviewNote ? ` | Ghi chú: ${reviewNote}` : ''}`,
        // 🔥 GỬI TẤT CẢ ITEMS (kể cả items có số lượng 0)
        items: reviewItems.map(it => ({
          distributionItemId: it.id,
          dealerPrice: it.approvedQuantity > 0 ? it.manufacturerPrice : 0, // Giá hãng (0 nếu số lượng = 0)
          approvedQuantity: it.approvedQuantity || 0, // Số lượng duyệt (có thể là 0)
        })),
      };

      console.log('🔥 Sending approval with items (manufacturerPrice + quantity):', requestData);
      console.log('📊 Request breakdown:', {
        approvedQty,
        avgManufacturerPrice,
        roundedPrice: Math.round(avgManufacturerPrice),
        itemsCount: requestData.items.length,
        firstItem: requestData.items[0],
        currentStatus: selectedDistribution.status
      });
      
      // Kiểm tra status để dùng đúng endpoint
      const isResendingPrice = selectedDistribution.status === DistributionStatus.PRICE_REJECTED;
      
      if (isResendingPrice) {
        // Gửi lại báo giá (dealer đã từ chối giá trước đó)
        await resendPrice(selectedDistribution.id, requestData);
        toast({ 
          title: '🔄 Đã gửi lại báo giá', 
          description: 'Đã cập nhật và gửi lại báo giá cho dealer. Chờ dealer xác nhận giá mới.',
          duration: 3000,
        });
      } else {
        // Lần đầu gửi báo giá (status = PENDING)
        await approveDistributionOrder(selectedDistribution.id, requestData);
        toast({ 
          title: '📤 Đã gửi báo giá', 
          description: 'Đã gửi giá hãng cho dealer. Chờ dealer xác nhận giá trước khi lên kế hoạch giao hàng.',
          duration: 3000,
        });
      }
      
      setIsReviewDialogOpen(false);
      
      // Note: Do not open plan dialog - must wait for dealer to accept price first
      
      loadData();
    } catch (error: any) {
      console.error('❌ Approval error:', error);
      console.error('Error response:', error.response?.data);
      
      const errorMsg = error.response?.data?.message || error.message || 'Không thể duyệt đơn';
      toast({ 
        title: '❌ Lỗi gửi báo giá', 
        description: errorMsg, 
        variant: 'destructive',
        duration: 3000,
      });
    }
  };
  
  // Handler: Tạo đơn bổ sung cho số lượng thiếu
  const handleCreateSupplementary = async (parentDistribution: DistributionRes) => {
    // Prevent spam clicking
    if (creatingSupplementaryId === parentDistribution.id) return;
    
    try {
      // Tính số lượng thiếu chi tiết theo từng item
      const shortageItems: {
        id: number;
        name: string;
        color?: string;
        requested: number;
        approved: number;
        shortage: number;
        manufacturerPrice?: number;
      }[] = [];
      
      let totalRequested = 0;
      let totalApproved = 0;
      
      // Parse evmNotes để lấy thông tin chi tiết
      if (parentDistribution.evmNotes && parentDistribution.items) {
        // Format evmNotes: "Duyệt theo dòng: vf3 (Đen): 5/10 xe @ 10.000 VND; vf3 (Xanh): 3/5 xe @ 20.000 VND"
        // Lấy phần trước "| Ghi chú:" hoặc "| Dealer:" hoặc hết chuỗi
        const match = parentDistribution.evmNotes.match(/Duyệt theo dòng:\s*(.+?)(?:\s*\|\s*(?:Ghi chú|Dealer):|$)/);
        
        if (match) {
          const itemsText = match[1].trim();
          const itemParts = itemsText.split(';').map(s => s.trim()).filter(s => s.length > 0);
          
          for (const part of itemParts) {
            // Parse: "vf3 (Đen): 5/10 xe @ 10.000 VND"
            const itemMatch = part.match(/^(.+?):\s*(\d+)\/(\d+)\s*xe(?:\s*@\s*([\d,.]+)\s*VND)?/);
            if (itemMatch) {
              const itemKey = itemMatch[1].trim(); // "vf3 (Đen)"
              const approvedQty = parseInt(itemMatch[2]); // 5
              const requestedQty = parseInt(itemMatch[3]); // 10
              const priceStr = itemMatch[4]?.replace(/[,.\s]/g, '') || '0';
              const price = parseInt(priceStr) || 0;
              
              totalRequested += requestedQty;
              totalApproved += approvedQty;
              
              if (approvedQty < requestedQty) {
                // Tìm item tương ứng trong distribution.items
                const matchedItem = parentDistribution.items.find(item => {
                  const itemName = item.product?.name || item.category?.name || 'Unknown';
                  const fullName = `${itemName}${item.color ? ' ('+item.color+')' : ''}`;
                  return fullName === itemKey;
                });
                
                shortageItems.push({
                  id: matchedItem?.id || 0,
                  name: itemKey.split('(')[0].trim(),
                  color: itemKey.includes('(') ? itemKey.match(/\((.+?)\)/)?.[1] : undefined,
                  requested: requestedQty,
                  approved: approvedQty,
                  shortage: requestedQty - approvedQty,
                  manufacturerPrice: price > 0 ? price : matchedItem?.dealerPrice,
                });
              }
            }
          }
        }
      }
      
      // Fallback: nếu không parse được từ evmNotes, dùng requestedQuantity
      if (shortageItems.length === 0) {
        totalRequested = parentDistribution.requestedQuantity || 0;
        totalApproved = parentDistribution.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
      }
      
      const totalShortage = totalRequested - totalApproved;
      
      if (totalShortage <= 0) {
        toast({ 
          title: (
            <div className="flex items-center gap-2">
              <span className="text-xl">ℹ️</span>
              <span className="font-bold">Không cần tạo đơn bổ sung</span>
            </div>
          ) as any,
          description: (
            <div className="mt-2 space-y-1 text-sm">
              <p>Số lượng đã duyệt đã đủ hoặc vượt yêu cầu ban đầu:</p>
              <div className="flex gap-4 mt-2">
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">Yêu cầu:</span>
                  <span className="font-bold text-blue-600">{totalRequested} xe</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">Đã duyệt:</span>
                  <span className="font-bold text-green-600">{totalApproved} xe</span>
                </div>
              </div>
            </div>
          ) as any,
          variant: 'default',
          duration: 5000,
        });
        return;
      }
      
      // Generate code từ ID hoặc sử dụng code có sẵn
      const parentCode = parentDistribution.code || `PP${String(parentDistribution.id).padStart(4, '0')}`;
      
      // Mở dialog xác nhận với thông tin chi tiết
      setSupplementaryConfirmData({
        parentDist: parentDistribution,
        shortage: totalShortage,
        requested: totalRequested,
        approved: totalApproved,
        parentCode,
        shortageItems, // Thêm chi tiết các xe thiếu
      });
      setIsSupplementaryConfirmOpen(true);
      
    } catch (error: any) {
      toast({ 
        title: (
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-white/20">
              <XCircle className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-white text-lg">Không thể kiểm tra đơn bổ sung</span>
          </div>
        ) as any,
        description: (
          <div className="mt-3">
            <div className="backdrop-blur-md bg-white/10 p-4 rounded-lg border border-white/20">
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  <AlertCircle className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-white font-semibold text-sm leading-relaxed">
                    {error.message || 'Đã xảy ra lỗi không xác định'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) as any,
        variant: 'destructive',
        duration: 6000,
      });
    }
  };
  
  // Xác nhận tạo đơn bổ sung
  const confirmCreateSupplementary = async () => {
    const { parentDist, shortage } = supplementaryConfirmData;
    if (!parentDist) return;
    
    try {
      setCreatingSupplementaryId(parentDist.id);
      setLoading(true);
      setIsSupplementaryConfirmOpen(false);
      
      console.log('🔄 Creating supplementary distribution for parent ID:', parentDist.id);
      console.log('📝 Parent evmNotes:', parentDist.evmNotes);
      
      const supplementary = await createSupplementaryDistribution(parentDist.id);
      
      const suppCode = supplementary.code || `PP${String(supplementary.id).padStart(4, '0')}`;
      const dealerName = getDealerName(parentDist);
      
      // Reload data trước khi hiển thị toast
      await loadData();
      
      // Toast đẹp với nhiều thông tin hơn
      toast({ 
        title: (
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎉</span>
            <span className="font-bold">Đã tạo đơn bổ sung thành công!</span>
          </div>
        ) as any,
        description: (
          <div className="mt-2 space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-semibold text-green-600">Mã đơn mới:</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded font-mono font-bold">{suppCode}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="font-semibold">Số lượng:</span>
              <span className="text-orange-600 font-bold">{shortage} xe</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="font-semibold">Dealer:</span>
              <span>{dealerName}</span>
            </div>
          </div>
        ) as any,
        duration: 8000, // Hiển thị lâu hơn để đọc được thông tin
      });
    } catch (error: any) {
      console.error('❌ Error creating supplementary:', error);
      
      toast({ 
        title: (
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-white/20">
              <XCircle className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-white text-lg">Không thể tạo đơn bổ sung</span>
          </div>
        ) as any,
        description: (
          <div className="mt-3 space-y-3">
            <div className="backdrop-blur-md bg-white/10 p-4 rounded-lg border border-white/20">
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  <AlertCircle className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-white font-semibold text-sm leading-relaxed">
                    {error.message || 'Đã xảy ra lỗi không xác định'}
                  </p>
                  <p className="text-white/80 text-xs mt-2">
                    Vui lòng kiểm tra console để xem chi tiết lỗi
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) as any,
        variant: 'destructive',
        duration: 10000, // Hiển thị lâu hơn để đọc được lỗi
      });
    } finally {
      setLoading(false);
      setCreatingSupplementaryId(null);
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
          {/* Liquid Glass Header */}
          <div className="backdrop-blur-xl bg-gradient-to-br from-cyan-50/80 to-blue-50/80 dark:from-cyan-950/80 dark:to-blue-950/80 p-6 rounded-3xl border border-white/30 shadow-2xl">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent flex items-center gap-3">
                  <Package className="h-10 w-10 text-cyan-600 drop-shadow-lg" />
                  📦 Quản lý Phân phối
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mt-2 text-lg">
                  Gửi lời mời, duyệt đơn và lên kế hoạch giao hàng cho đại lý
                </p>
              </div>
              <Button 
                onClick={() => setIsInviteDialogOpen(true)}
                className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-6 text-lg"
              >
                <Plus className="h-5 w-5 mr-2" />
                Gửi lời mời mới
              </Button>
            </div>
          </div>

          {/* Liquid Glass Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="backdrop-blur-xl bg-gradient-to-br from-blue-50/80 to-cyan-50/80 dark:from-blue-950/80 dark:to-cyan-950/80 p-6 rounded-2xl border border-white/30 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-200">Lời mời đang chờ</h3>
                <Clock className="h-8 w-8 text-blue-500" />
              </div>
              <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">{stats.totalInvitations}</div>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">Chờ dealer phản hồi</p>
            </div>

            <div className="backdrop-blur-xl bg-gradient-to-br from-amber-50/80 to-yellow-50/80 dark:from-amber-950/80 dark:to-yellow-950/80 p-6 rounded-2xl border border-white/30 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-200">Chờ duyệt</h3>
                <AlertCircle className="h-8 w-8 text-amber-500" />
              </div>
              <div className="text-4xl font-bold bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">{stats.pendingApproval}</div>
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">Đơn cần xem xét</p>
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
            <div className="flex gap-4 mb-4">
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
            
            {/* View Mode Toggle */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Chế độ xem:</span>
              <div className="flex gap-2">
                <Button
                  variant={viewMode === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setViewMode('all');
                    setSelectedDealerId(null);
                  }}
                  className={viewMode === 'all' ? 'bg-gradient-to-r from-cyan-600 to-blue-600' : ''}
                >
                  Tất cả phân phối
                </Button>
                <Button
                  variant={viewMode === 'byDealer' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setViewMode('byDealer');
                    setSelectedDealerId(null);
                  }}
                  className={viewMode === 'byDealer' ? 'bg-gradient-to-r from-cyan-600 to-blue-600' : ''}
                >
                  <Building2 className="h-4 w-4 mr-2" />
                  Theo đại lý
                </Button>
              </div>
              {selectedDealerId && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedDealerId(null)}
                  className="text-cyan-600 hover:text-cyan-700"
                >
                  ✕ Bỏ lọc đại lý
                </Button>
              )}
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
          ) : viewMode === 'byDealer' && !selectedDealerId ? (
            /* Dealer Groups View */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getDistributionsByDealer().map((group) => (
                <div
                  key={group.dealerId}
                  onClick={() => {
                    setSelectedDealerId(group.dealerId);
                    setViewMode('all');
                  }}
                  className="backdrop-blur-xl bg-gradient-to-br from-white/80 to-cyan-50/80 dark:from-gray-900/80 dark:to-cyan-950/80 p-6 rounded-3xl border border-white/40 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer hover:scale-105"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl shadow-lg">
                        <Building2 className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white">{group.dealerName}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Mã: {group.dealerId}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                        {group.count}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Phân phối</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <div className="bg-blue-50 dark:bg-blue-950/50 p-3 rounded-xl border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Lời mời</span>
                      </div>
                      <div className="text-2xl font-bold text-blue-600 mt-1">{group.stats.invited}</div>
                    </div>
                    <div className="bg-amber-50 dark:bg-amber-950/50 p-3 rounded-xl border border-amber-200 dark:border-amber-800">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-amber-600" />
                        <span className="text-sm font-medium text-amber-700 dark:text-amber-300">Chờ duyệt</span>
                      </div>
                      <div className="text-2xl font-bold text-amber-600 mt-1">{group.stats.pending}</div>
                    </div>
                    <div className="bg-green-50 dark:bg-green-950/50 p-3 rounded-xl border border-green-200 dark:border-green-800">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-green-700 dark:text-green-300">Đã duyệt</span>
                      </div>
                      <div className="text-2xl font-bold text-green-600 mt-1">{group.stats.confirmed}</div>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-950/50 p-3 rounded-xl border border-purple-200 dark:border-purple-800">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-purple-600" />
                        <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Hoàn thành</span>
                      </div>
                      <div className="text-2xl font-bold text-purple-600 mt-1">{group.stats.completed}</div>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Nhấn để xem chi tiết</span>
                      <span className="text-cyan-600 font-medium">→</span>
                    </div>
                  </div>
                </div>
              ))}
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
                            Mã phân phối: {dist.code || `#${dist.id}`}
                            {dist.isSupplementary && (
                              <Badge className="ml-2 bg-orange-100 text-orange-700 border-orange-300">
                                📦 Đơn bổ sung
                              </Badge>
                            )}
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
                            {dist.parentDistributionId && (
                              <span className="flex items-center gap-1 text-orange-600 font-medium">
                                🔗 Bổ sung cho {(() => {
                                  const parentDist = distributions.find(d => d.id === dist.parentDistributionId);
                                  if (parentDist?.code) return parentDist.code;
                                  // Generate code từ ID nếu không có code
                                  return `PP${String(dist.parentDistributionId).padStart(4, '0')}`;
                                })()}
                              </span>
                            )}
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
                        
                        {/* Step 4a: Removed "Sửa giá" button - when dealer rejects due to insufficient quantity, no need to revise price */}
                        
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
                        
                        {/* Button: Tạo đơn bổ sung nếu số lượng duyệt < yêu cầu */}
                        {!dist.isSupplementary && (dist.status === DistributionStatus.PRICE_SENT || 
                          dist.status === DistributionStatus.PRICE_REJECTED ||
                          dist.status === DistributionStatus.CONFIRMED ||
                          dist.status === DistributionStatus.PRICE_ACCEPTED ||
                          dist.status === DistributionStatus.PLANNED ||
                          dist.status === DistributionStatus.COMPLETED) && (() => {
                          // Parse evmNotes để lấy số lượng yêu cầu THẬT (không bị thay đổi)
                          let requested = 0;
                          let approved = 0;
                          
                          if (dist.evmNotes && dist.items) {
                            // Format: "Duyệt theo dòng: vf3 (Đen): 5/10 xe @ 10.000 VND; vf3 (Xanh): 3/5 xe | Ghi chú: ..."
                            // Lấy phần trước "| Ghi chú:" hoặc "| Dealer:" hoặc hết chuỗi
                            const match = dist.evmNotes.match(/Duyệt theo dòng:\s*(.+?)(?:\s*\|\s*(?:Ghi chú|Dealer):|$)/);
                            if (match) {
                              const itemsText = match[1].trim();
                              const itemParts = itemsText.split(';').map(s => s.trim()).filter(s => s.length > 0);
                              
                              for (const part of itemParts) {
                                // Parse: "vf3 (Đen): 5/10 xe @ 10.000 VND" hoặc "vf3 (Đen): 5/10 xe"
                                const itemMatch = part.match(/^(.+?):\s*(\d+)\/(\d+)\s*xe/);
                                if (itemMatch) {
                                  approved += parseInt(itemMatch[2]);
                                  requested += parseInt(itemMatch[3]);
                                }
                              }
                            }
                          }
                          
                          // Fallback nếu không parse được evmNotes
                          if (requested === 0) {
                            requested = dist.requestedQuantity || 0;
                            approved = dist.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
                          }
                          
                          const isCreating = creatingSupplementaryId === dist.id;
                          
                          // Tính tổng số lượng đã nhận từ đơn gốc + TẤT CẢ đơn bổ sung
                          let totalReceived = dist.receivedQuantity || 0; // Số lượng đơn gốc đã nhận
                          
                          // Cộng thêm số lượng từ các đơn bổ sung đã hoàn thành
                          const supplementaryDists = distributions.filter(d => 
                            d.parentDistributionId === dist.id && 
                            d.isSupplementary === true &&
                            d.status !== DistributionStatus.CANCELED
                          );
                          
                          supplementaryDists.forEach(suppDist => {
                            totalReceived += (suppDist.receivedQuantity || 0);
                          });
                          
                          // Tính số lượng còn thiếu: So sánh số lượng YÊU CẦU với số lượng ĐÃ DUYỆT (không phải đã nhận)
                          // Chỉ hiển thị nút bổ sung khi số lượng đã duyệt < số lượng yêu cầu
                          const shortage = requested - approved;
                          const hasShortage = shortage > 0;
                          
                          // Kiểm tra có đơn bổ sung đang chờ xử lý không (PENDING, PRICE_SENT, CONFIRMED, PLANNED)
                          const hasPendingSupplementary = supplementaryDists.some(d => 
                            d.status === DistributionStatus.PENDING ||
                            d.status === DistributionStatus.PRICE_SENT ||
                            d.status === DistributionStatus.PRICE_ACCEPTED ||
                            d.status === DistributionStatus.CONFIRMED ||
                            d.status === DistributionStatus.PLANNED
                          );
                          
                          // Kiểm tra có đơn bổ sung đã hoàn thành không
                          const hasCompletedSupplementary = supplementaryDists.some(d => 
                            d.status === DistributionStatus.COMPLETED
                          );
                          
                          // Debug log
                          if (hasShortage || supplementaryDists.length > 0) {
                            console.log(`📊 Dist ${dist.id} - Shortage Check:`, {
                              requested,
                              approved,
                              shortage: requested - approved,
                              receivedOriginal: dist.receivedQuantity || 0,
                              receivedFromSupp: totalReceived - (dist.receivedQuantity || 0),
                              totalReceived,
                              hasShortage,
                              hasPendingSupp: hasPendingSupplementary,
                              hasCompletedSupp: hasCompletedSupplementary,
                              suppCount: supplementaryDists.length,
                              evmNotesPresent: !!dist.evmNotes
                            });
                          }
                          
                          // Chỉ hiển thị nếu: còn thiếu hàng VÀ không có đơn bổ sung đang chờ VÀ không có đơn bổ sung đã hoàn thành
                          return hasShortage && !hasPendingSupplementary && !hasCompletedSupplementary && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCreateSupplementary(dist)}
                              disabled={isCreating || loading}
                              className="border-orange-500 text-orange-600 hover:bg-orange-50 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isCreating ? (
                                <>
                                  <span className="animate-spin mr-1">⏳</span>
                                  Đang tạo...
                                </>
                              ) : (
                                <>
                                  <Plus className="h-4 w-4 mr-1" />
                                  Đơn bổ sung
                                </>
                              )}
                            </Button>
                          );
                        })()}
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
                  <Label htmlFor="message">Lời nhắn cho đại lý</Label>
                  <Textarea
                    id="message"
                    placeholder="Hãy nhập lời nhắn của bạn tại đây..."
                    value={inviteForm.message}
                    onChange={(e) => setInviteForm({ ...inviteForm, message: e.target.value })}
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground">
                    Lời nhắn này sẽ được gửi đến đại lý cùng với lời mời nhập hàng
                  </p>
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
                  Mã phân phối: {selectedDistribution?.code || `#${selectedDistribution?.id}`} - {selectedDistribution ? getDealerName(selectedDistribution) : ''}
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
                        type="text"
                        placeholder="VD: 50000000 hoặc 50.000.000"
                        value={approveForm.manufacturerPrice ? approveForm.manufacturerPrice.toLocaleString('vi-VN') : ''}
                        onChange={(e) => {
                          // Remove all non-digit characters to get pure number
                          const numericValue = e.target.value.replace(/[^\d]/g, '');
                          const price = numericValue ? Number(numericValue) : 0;
                          setApproveForm({ ...approveForm, manufacturerPrice: price });
                        }}
                      />
                      <p className="text-xs text-muted-foreground">
                        Giá này sẽ được gửi cho dealer để xác nhận. Có thể nhập 50.000.000 hoặc 50000000
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
                  Mã phân phối: {selectedDistribution?.code || `#${selectedDistribution?.id}`} - {selectedDistribution ? getDealerName(selectedDistribution) : ''}
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
                          </div>
                          <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <Label className="text-xs text-muted-foreground">Số lượng duyệt</Label>
                              <Input
                                type="number"
                                min={0}
                                max={it.requested}
                                value={it.approvedQuantity}
                                disabled={selectedDistribution?.isSupplementary}
                                onChange={(e) => {
                                  const v = Math.max(0, Math.min(it.requested, Number(e.target.value)));
                                  setReviewItems((prev) => prev.map((x) => x.id === it.id ? { ...x, approvedQuantity: v } : x));
                                }}
                              />
                              {selectedDistribution?.isSupplementary && (
                                <p className="text-xs text-amber-600 mt-1">
                                  ⚠️ Đơn bổ sung: Số lượng cố định (phải có đủ hàng)
                                </p>
                              )}
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground">Giá hãng (VND/xe) *</Label>
                              <Input
                                type="text"
                                placeholder="VD: 50000000 hoặc 50.000.000"
                                value={it.manufacturerPrice ? it.manufacturerPrice.toLocaleString('vi-VN') : ''}
                                onChange={(e) => {
                                  // Remove all non-digit characters (dots, commas, spaces)
                                  const numericValue = e.target.value.replace(/[^\d]/g, '');
                                  const price = numericValue ? Number(numericValue) : 0;
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
                      
                      {/* Warning when no items approved */}
                      {totalApproved === 0 && reviewItems.length > 0 && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                          <div className="flex items-start gap-2">
                            <span className="text-red-600">🚫</span>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-red-800">
                                Không có dòng nào được duyệt
                              </p>
                              <p className="text-xs mt-1 text-red-700">
                                Bạn cần duyệt ít nhất 1 dòng sản phẩm để gửi báo giá cho dealer. Các dòng không được duyệt sẽ được gửi với số lượng 0.
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
                  Mã phân phối: {selectedDistribution?.code || `#${selectedDistribution?.id}`} - {selectedDistribution ? getDealerName(selectedDistribution) : ''}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="deliveryDate">Ngày giao hàng dự kiến *</Label>
                  <Input
                    id="deliveryDate"
                    type="date"
                    min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
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
                  {/* Info Grid - 3 columns */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="backdrop-blur-md bg-gradient-to-br from-blue-400/10 to-cyan-400/10 p-4 rounded-xl border border-blue-200/30">
                      <div className="flex items-center gap-2 mb-2">
                        <Building2 className="h-5 w-5 text-blue-600" />
                        <Label className="text-xs text-blue-700 dark:text-blue-300 font-semibold uppercase">Đại lý</Label>
                      </div>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">{getDealerName(selectedDistribution)}</p>
                      {selectedDistribution.dealerId && (
                        <p className="text-xs text-blue-600 mt-1">ID: {selectedDistribution.dealerId}</p>
                      )}
                    </div>
                    
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
                          <span className="text-sm text-gray-600">Yêu cầu:</span>
                          <p className="text-xl font-bold text-blue-600">
                            {selectedDistribution.requestedQuantity || selectedDistribution.items?.reduce((s, it) => s + (it.quantity || 0), 0) || 0}
                          </p>
                          <span className="text-xs text-gray-600">xe</span>
                        </div>
                        {selectedDistribution.items?.some(it => it.approvedQuantity !== undefined) && (
                          <div className="flex items-baseline gap-2">
                            <span className="text-sm text-gray-600">Duyệt:</span>
                            <p className="text-xl font-bold text-green-600">
                              {selectedDistribution.items?.reduce((s, it) => s + (it.approvedQuantity || 0), 0) || 0}
                            </p>
                            <span className="text-xs text-gray-600">xe</span>
                          </div>
                        )}
                        {selectedDistribution.receivedQuantity && (
                          <div className="flex items-baseline gap-2">
                            <span className="text-sm text-gray-600">Đã nhận:</span>
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
                            <p className="text-xs text-gray-500 mb-1">📅 Dealer mong muốn</p>
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

                  {/* Dealer Order Items - Enhanced Table */}
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
                        <table className="w-full table-fixed">
                          <thead>
                            <tr className="border-b-2 border-green-300/50">
                              <th className="text-left py-2 px-2 text-xs font-semibold text-green-800 dark:text-green-200 w-10">#</th>
                              <th className="text-left py-2 px-2 text-xs font-semibold text-green-800 dark:text-green-200 whitespace-nowrap">Sản phẩm</th>
                              <th className="text-left py-2 px-2 text-xs font-semibold text-green-800 dark:text-green-200 w-20 whitespace-nowrap">Màu</th>
                              {selectedDistribution.items?.some(it => it.dealerPrice) && (
                                <th className="text-right py-2 px-2 text-xs font-semibold text-green-800 dark:text-green-200 w-24 whitespace-nowrap">Giá</th>
                              )}
                              <th className="text-center py-2 px-2 text-xs font-semibold text-green-800 dark:text-green-200 w-16">YC</th>
                              {selectedDistribution.items?.some(it => it.approvedQuantity !== undefined && it.approvedQuantity !== null) && (
                                <th className="text-center py-2 px-2 text-xs font-semibold text-green-800 dark:text-green-200 w-16">Duyệt</th>
                              )}
                              {selectedDistribution.items?.some(it => it.receivedQuantity) && (
                                <th className="text-center py-2 px-2 text-xs font-semibold text-green-800 dark:text-green-200 w-16">Nhận</th>
                              )}
                            </tr>
                          </thead>
                          <tbody>
                            {selectedDistribution.items.map((it, idx) => (
                              <tr key={idx} className="border-b border-green-200/30 hover:bg-green-100/30 dark:hover:bg-green-900/20 transition-colors">
                                <td className="py-2 px-2 text-xs text-gray-600 dark:text-gray-400">{idx + 1}</td>
                                <td className="py-2 px-2 overflow-hidden">
                                  <div className="font-semibold text-xs text-gray-900 dark:text-white truncate" title={it.product?.name || it.category?.name}>{it.product?.name || it.category?.name || 'Sản phẩm'}</div>
                                </td>
                                <td className="py-2 px-2 overflow-hidden">
                                  {it.color ? (
                                    <span className="text-xs text-gray-700 dark:text-gray-300 truncate block" title={it.color}>
                                      🎨 {it.color}
                                    </span>
                                  ) : (
                                    <span className="text-gray-400 text-xs">-</span>
                                  )}
                                </td>
                                {selectedDistribution.items?.some(item => item.dealerPrice) && (
                                  <td className="py-2 px-2 text-right">
                                    {it.dealerPrice ? (
                                      <div className="font-semibold text-xs text-amber-700 dark:text-amber-400 truncate" title={Number(it.dealerPrice).toLocaleString('vi-VN') + ' ₫'}>
                                        {(Number(it.dealerPrice) / 1000000).toFixed(0)}tr
                                      </div>
                                    ) : (
                                      <span className="text-gray-400">-</span>
                                    )}
                                  </td>
                                )}
                                <td className="py-2 px-2 text-center">
                                  <span className="font-bold text-sm text-blue-600">{it.quantity || 0}</span>
                                </td>
                                {selectedDistribution.items?.some(item => item.approvedQuantity !== undefined && item.approvedQuantity !== null) && (
                                  <td className="py-2 px-2 text-center">
                                    {it.approvedQuantity !== undefined && it.approvedQuantity !== null ? (
                                      <>
                                        <span className={`font-bold text-sm ${it.approvedQuantity > 0 ? 'text-green-600' : 'text-gray-500'}`}>
                                          {it.approvedQuantity}
                                        </span>
                                        {it.quantity && it.approvedQuantity < it.quantity && it.approvedQuantity > 0 && (
                                          <div className="text-xs text-orange-600">-{it.quantity - it.approvedQuantity}</div>
                                        )}
                                      </>
                                    ) : (
                                      <span className="text-gray-400">-</span>
                                    )}
                                  </td>
                                )}
                                {selectedDistribution.items?.some(item => item.receivedQuantity) && (
                                  <td className="py-2 px-2 text-center">
                                    {it.receivedQuantity ? (
                                      <span className="font-bold text-sm text-purple-600">{it.receivedQuantity}</span>
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
                              <td colSpan={selectedDistribution.items?.some(it => it.dealerPrice) ? 4 : 3} className="py-2 px-2 text-xs font-bold text-green-800 dark:text-green-200">
                                Tổng
                              </td>
                              <td className="py-2 px-2 text-center">
                                <span className="font-bold text-blue-600 text-sm">
                                  {selectedDistribution.items.reduce((s, it) => s + (it.quantity || 0), 0)}
                                </span>
                              </td>
                              {selectedDistribution.items?.some(it => it.approvedQuantity !== undefined && it.approvedQuantity !== null) && (
                                <td className="py-2 px-2 text-center">
                                  <span className="font-bold text-green-600 text-sm">
                                    {selectedDistribution.items.reduce((s, it) => s + (it.approvedQuantity || 0), 0)}
                                  </span>
                                </td>
                              )}
                              {selectedDistribution.items?.some(it => it.receivedQuantity) && (
                                <td className="py-2 px-2 text-center">
                                  <span className="font-bold text-purple-600 text-sm">
                                    {selectedDistribution.items.reduce((s, it) => s + (it.receivedQuantity || 0), 0)}
                                  </span>
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
                        <DollarSign className="h-5 w-5 text-emerald-600" />
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
                            <Label className="text-xs text-green-700 dark:text-green-300 font-semibold">💼 Ghi chú từ Dealer</Label>
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
                          {selectedDistribution.items?.filter(it => it.approvedQuantity && it.quantity && it.approvedQuantity < it.quantity).length} loại xe
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
                              ?.filter(it => it.approvedQuantity && it.quantity && it.approvedQuantity < it.quantity)
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
                                      ?.filter(it => it.approvedQuantity && it.quantity && it.approvedQuantity < it.quantity)
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
                          <Car className="h-5 w-5 text-pink-600" />
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
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Supplementary/Parent Relationship */}
                  {(selectedDistribution.isSupplementary || selectedDistribution.parentDistributionId) && (
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
                  
                  {selectedDistribution.estimatedDeliveryDate && !selectedDistribution.actualDeliveryDate && (
                    <div className="backdrop-blur-md bg-gradient-to-br from-purple-400/10 to-violet-400/10 p-4 rounded-xl border border-purple-200/30">
                      <div className="flex items-center gap-2 mb-2">
                        <TruckIcon className="h-4 w-4 text-purple-600" />
                        <Label className="text-xs text-purple-700 dark:text-purple-300 font-semibold uppercase">Ngày giao dự kiến</Label>
                      </div>
                      <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {new Date(selectedDistribution.estimatedDeliveryDate).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  )}
                  
                  {selectedDistribution.actualDeliveryDate && (
                    <div className="backdrop-blur-md bg-gradient-to-br from-green-400/10 to-emerald-400/10 p-4 rounded-xl border border-green-200/30">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <Label className="text-xs text-green-700 dark:text-green-300 font-semibold uppercase">Đã giao thành công</Label>
                      </div>
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {new Date(selectedDistribution.actualDeliveryDate).toLocaleDateString('vi-VN')}
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
          
          {/* Dialog xác nhận tạo đơn bổ sung */}
          <Dialog open={isSupplementaryConfirmOpen} onOpenChange={setIsSupplementaryConfirmOpen}>
            <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto backdrop-blur-xl bg-gradient-to-br from-white/95 via-orange-50/90 to-amber-50/95 dark:from-gray-900/95 dark:via-orange-900/30 dark:to-amber-900/30 border-2 border-orange-200/50 shadow-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3 text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                  <div className="p-2 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 shadow-lg">
                    <Package className="h-6 w-6 text-white" />
                  </div>
                  Xác nhận tạo đơn bổ sung
                </DialogTitle>
                <DialogDescription className="text-gray-600 dark:text-gray-300">
                  Tạo đơn phân phối bổ sung cho số lượng xe còn thiếu
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                {/* Header Info */}
                <div className="backdrop-blur-md bg-gradient-to-br from-blue-400/10 to-blue-500/10 p-4 rounded-xl border border-blue-200/30">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-4 w-4 text-blue-600" />
                    <span className="text-xs font-semibold text-blue-700 uppercase">Đơn gốc</span>
                  </div>
                  <div className="text-xl font-mono font-bold text-blue-600">
                    {supplementaryConfirmData.parentCode}
                  </div>
                  <div className="text-sm text-blue-600 mt-1">
                    Dealer: {supplementaryConfirmData.parentDist ? getDealerName(supplementaryConfirmData.parentDist) : 'N/A'}
                  </div>
                </div>
                
                {/* Summary Stats */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="backdrop-blur-md bg-gradient-to-br from-blue-400/10 to-cyan-400/10 p-3 rounded-xl border border-blue-200/30">
                    <div className="text-xs font-semibold text-blue-700 mb-1">Yêu cầu ban đầu</div>
                    <div className="text-2xl font-bold text-blue-600">
                      {supplementaryConfirmData.requested} <span className="text-sm">xe</span>
                    </div>
                  </div>
                  
                  <div className="backdrop-blur-md bg-gradient-to-br from-green-400/10 to-emerald-400/10 p-3 rounded-xl border border-green-200/30">
                    <div className="text-xs font-semibold text-green-700 mb-1">Đã duyệt lần 1</div>
                    <div className="text-2xl font-bold text-green-600">
                      {supplementaryConfirmData.approved} <span className="text-sm">xe</span>
                    </div>
                  </div>
                  
                  <div className="backdrop-blur-md bg-gradient-to-br from-orange-400/20 to-amber-400/20 p-3 rounded-xl border-2 border-orange-300/50 shadow-lg">
                    <div className="text-xs font-semibold text-orange-800 mb-1">Số lượng bổ sung</div>
                    <div className="text-2xl font-bold text-orange-600">
                      {supplementaryConfirmData.shortage} <span className="text-sm">xe</span>
                    </div>
                  </div>
                </div>

                {/* Detailed Shortage Items - Table Style */}
                {supplementaryConfirmData.shortageItems && supplementaryConfirmData.shortageItems.length > 0 && (
                  <div className="backdrop-blur-md bg-gradient-to-br from-green-50/90 to-emerald-50/90 dark:from-green-950/90 dark:to-emerald-950/90 p-5 rounded-xl border-2 border-green-300/50 shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Package className="h-5 w-5 text-green-600" />
                        <Label className="text-lg font-bold text-green-800 dark:text-green-200">
                          📋 Danh sách sản phẩm
                        </Label>
                      </div>
                      <Badge className="bg-green-600 text-white px-3 py-1">
                        {supplementaryConfirmData.shortageItems.length} loại xe
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
                          {supplementaryConfirmData.shortageItems.map((item, idx) => (
                            <tr 
                              key={idx} 
                              className="border-b border-green-200/30 hover:bg-green-50/50 dark:hover:bg-green-900/20 transition-colors"
                            >
                              <td className="py-4 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                                {idx + 1}
                              </td>
                              <td className="py-4 px-4">
                                <div className="font-semibold text-base text-gray-900 dark:text-white">
                                  {item.name}
                                </div>
                              </td>
                              <td className="py-4 px-4">
                                {item.color && (
                                  <div className="flex items-center gap-2">
                                    <div 
                                      className="w-4 h-4 rounded-full border-2 border-gray-300"
                                      style={{ 
                                        backgroundColor: item.color === 'Đỏ' ? '#ef4444' : 
                                                       item.color === 'Xanh dương' || item.color === 'Xanh duong' ? '#3b82f6' :
                                                       item.color === 'Đen' ? '#000000' :
                                                       item.color === 'Trắng' ? '#ffffff' :
                                                       item.color === 'Xám' ? '#6b7280' : '#9ca3af'
                                      }}
                                    ></div>
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                      {item.color}
                                    </span>
                                  </div>
                                )}
                              </td>
                              <td className="py-4 px-4 text-center">
                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/40 rounded-full">
                                  <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                    {item.shortage}
                                  </span>
                                  <span className="text-xs text-blue-600 dark:text-blue-400">xe</span>
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="bg-green-100/80 dark:bg-green-900/40">
                          <tr className="border-t-2 border-green-300/50">
                            <td colSpan={3} className="py-3 px-4 text-base font-bold text-green-900 dark:text-green-100">
                              Tổng cộng
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className="inline-flex items-center gap-1 px-4 py-1.5 bg-green-600 text-white rounded-full">
                                <span className="text-xl font-bold">
                                  {supplementaryConfirmData.shortageItems.reduce((sum, item) => sum + item.shortage, 0)}
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

                {/* Info Notice */}
                <div className="backdrop-blur-md bg-gradient-to-br from-blue-50/70 to-cyan-50/70 dark:from-blue-950/70 dark:to-cyan-950/70 p-4 rounded-xl border border-blue-300/50">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-800 dark:text-blue-200">
                      <p className="font-semibold mb-1">ℹ️ Lưu ý:</p>
                      <ul className="list-disc list-inside space-y-1 text-xs">
                        <li>Đơn bổ sung sẽ được tạo với số lượng còn thiếu từ đơn gốc</li>
                        <li>Dealer sẽ nhận được thông báo về đơn bổ sung</li>
                        <li>Đơn bổ sung sẽ tham chiếu đến đơn gốc <span className="font-mono font-semibold">{supplementaryConfirmData.parentCode}</span></li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              
              <DialogFooter className="gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setIsSupplementaryConfirmOpen(false)}
                  className="hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Hủy
                </Button>
                <Button 
                  onClick={confirmCreateSupplementary}
                  className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Xác nhận tạo đơn bổ sung
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
