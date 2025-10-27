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

  const loadData = async () => {
    try {
      setLoading(true);
      const [distData, dealerData] = await Promise.all([
        getAllDistributions(),
        getAllDealers(),
      ]);
      
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
      filtered = filtered.filter(d => 
        d.dealerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.id.toString().includes(searchQuery)
      );
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
      };

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
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">📦 Quản lý Phân phối</h1>
              <p className="text-muted-foreground mt-1">
                Gửi lời mời, duyệt đơn và lên kế hoạch giao hàng cho đại lý
              </p>
            </div>
            <Button onClick={() => setIsInviteDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Gửi lời mời mới
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Lời mời đang chờ</CardTitle>
                <Clock className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalInvitations}</div>
                <p className="text-xs text-muted-foreground">Chờ dealer phản hồi</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Chờ duyệt</CardTitle>
                <AlertCircle className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pendingApproval}</div>
                <p className="text-xs text-muted-foreground">Đơn cần xem xét</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Đã duyệt</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.confirmed}</div>
                <p className="text-xs text-muted-foreground">Chờ lên kế hoạch</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Hoàn thành</CardTitle>
                <TrendingUp className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.completed}</div>
                <p className="text-xs text-muted-foreground">Đã giao thành công</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Tìm theo tên đại lý hoặc mã phân phối..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[200px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
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
            </CardContent>
          </Card>

          {/* Distribution List */}
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="mt-2 text-muted-foreground">Đang tải...</p>
            </div>
          ) : filteredDistributions.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Chưa có phân phối nào</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredDistributions.map((dist) => (
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
                              <Building2 className="h-4 w-4" />
                              {dist.dealerName || `Dealer #${dist.dealerId}`}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {dist.createdAt ? new Date(dist.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                            </span>
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
                        
                        {/* Step 4: Approve/Reject buttons for PENDING status */}
                        {dist.status === DistributionStatus.PENDING && (
                          <>
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => openReviewDialog(dist)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Xem đơn
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => openApproveDialog(dist, false)}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Từ chối
                            </Button>
                          </>
                        )}
                        
                        {/* Step 5: Plan button for CONFIRMED status */}
                        {dist.status === DistributionStatus.CONFIRMED && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => openPlanDialog(dist)}
                            className="bg-purple-600 hover:bg-purple-700"
                          >
                            <Truck className="h-4 w-4 mr-1" />
                            Lên kế hoạch
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
                                • {product.name} - VIN: {product.vinNum}
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
                      {dist.deadline && dist.status === DistributionStatus.INVITED && (
                        <div className="text-amber-600">
                          ⏰ Hạn phản hồi: {new Date(dist.deadline).toLocaleDateString('vi-VN')}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Dialog: Send Invitation */}
          <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>📨 Gửi lời mời nhập hàng</DialogTitle>
                <DialogDescription>
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
                <Button variant="outline" onClick={() => setIsInviteDialogOpen(false)}>
                  Hủy
                </Button>
                <Button onClick={handleSendInvitation}>
                  Gửi lời mời
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Dialog: Approve/Reject Order */}
          <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {approveForm.approved ? '✅ Duyệt đơn nhập hàng' : '❌ Từ chối đơn nhập hàng'}
                </DialogTitle>
                <DialogDescription>
                  Phân phối #{selectedDistribution?.id} - {selectedDistribution?.dealerName}
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
                <Button variant="outline" onClick={() => setIsApproveDialogOpen(false)}>
                  Hủy
                </Button>
                <Button 
                  onClick={handleApproveOrder}
                  variant={approveForm.approved ? 'default' : 'destructive'}
                >
                  {approveForm.approved ? 'Duyệt' : 'Từ chối'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Dialog: Review & per-item approval */}
          <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>👀 Xem đơn & duyệt theo dòng</DialogTitle>
                <DialogDescription>
                  Phân phối #{selectedDistribution?.id} - {selectedDistribution?.dealerName}
                </DialogDescription>
              </DialogHeader>
              {selectedDistribution && (
                <div className="space-y-4 py-2">
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
                <Button variant="outline" onClick={() => setIsReviewDialogOpen(false)}>
                  Hủy
                </Button>
                <Button onClick={handleSubmitReview} disabled={!reviewItems.length || totalApproved === 0}>
                  📤 Gửi báo giá cho dealer
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Dialog: Plan Delivery */}
          <Dialog open={isPlanDialogOpen} onOpenChange={setIsPlanDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>🚚 Lên kế hoạch giao hàng</DialogTitle>
                <DialogDescription>
                  Phân phối #{selectedDistribution?.id} - {selectedDistribution?.dealerName}
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
                <Button variant="outline" onClick={() => setIsPlanDialogOpen(false)}>
                  Hủy
                </Button>
                <Button onClick={handlePlanDelivery}>
                  Lưu kế hoạch
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
                      <Label className="text-muted-foreground">Đại lý</Label>
                      <p className="font-medium">{selectedDistribution.dealerName || `Dealer #${selectedDistribution.dealerId}`}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Ngày tạo</Label>
                      <p className="font-medium">
                        {selectedDistribution.createdAt 
                          ? new Date(selectedDistribution.createdAt).toLocaleDateString('vi-VN')
                          : 'N/A'
                        }
                      </p>
                    </div>
                  </div>
                  
                  {selectedDistribution.invitationMessage && (
                    <div>
                      <Label className="text-muted-foreground">Lời mời</Label>
                      <p className="mt-1 p-3 bg-blue-50 rounded-md">{selectedDistribution.invitationMessage}</p>
                    </div>
                  )}
                  
                  {selectedDistribution.dealerNotes && (
                    <div>
                      <Label className="text-muted-foreground">Ghi chú của Dealer</Label>
                      <p className="mt-1 p-3 bg-amber-50 rounded-md">{selectedDistribution.dealerNotes}</p>
                    </div>
                  )}

                  {selectedDistribution.manufacturerPrice && (
                    <div>
                      <Label className="text-muted-foreground">Giá hãng</Label>
                      <p className="mt-1 p-3 bg-indigo-50 rounded-md font-medium">
                        {selectedDistribution.manufacturerPrice.toLocaleString('vi-VN')} VND / xe
                        {selectedDistribution.requestedQuantity && (
                          <span className="text-sm text-muted-foreground ml-2">
                            (Tổng: {(selectedDistribution.manufacturerPrice * selectedDistribution.requestedQuantity).toLocaleString('vi-VN')} VND)
                          </span>
                        )}
                      </p>
                    </div>
                  )}

                  {/* Dealer submitted order details */}
                  {selectedDistribution.items && selectedDistribution.items.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-muted-foreground">Yêu cầu từ Dealer</Label>
                        <div className="text-sm text-muted-foreground">
                          {selectedDistribution.requestedDeliveryDate && (
                            <>Ngày mong muốn: <span className="font-medium">
                              {new Date(selectedDistribution.requestedDeliveryDate).toLocaleDateString('vi-VN')}
                            </span></>
                          )}
                        </div>
                      </div>
                      <div className="mt-1 space-y-2">
                        {selectedDistribution.items.map((it, idx) => (
                          <div key={idx} className="p-3 border rounded-md">
                            <div className="font-medium">{it.product?.name || 'Sản phẩm'}</div>
                            <div className="text-sm text-muted-foreground">
                              {it.color ? `Màu: ${it.color} • ` : ''}Số lượng: {it.quantity}
                            </div>
                          </div>
                        ))}
                        <div className="text-sm text-muted-foreground">
                          Tổng số lượng yêu cầu: <span className="font-medium">{selectedDistribution.items.reduce((s, it) => s + (it.quantity || 0), 0)}</span>
                        </div>
                      </div>
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
                            <div className="text-sm text-muted-foreground">
                              Giá: {product.price?.toLocaleString('vi-VN')}đ
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
      </EvmStaffLayout>
    </ProtectedRoute>
  );
}
