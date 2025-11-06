'use client';

import { useEffect, useState } from 'react';
import { ProtectedRoute } from '@/components/auth-guards';
import DealerStaffLayout from '@/components/layout/dealer-staff-layout';
import { useAuth } from '@/contexts/AuthContext';
import { 
  getTestDrivesByDealerId, 
  updateTestDrive, 
  assignVehicleAndStaff,
  TestDriveRes,
  TestDriveStatus
} from '@/lib/testDriveApi';
import { ProductRes } from '@/lib/productApi';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { getFeedbackByTestDriveId, TestDriveFeedbackRes } from '@/lib/feedbackApi';
import { Calendar, Clock, User, Car, Phone, Mail, CheckCircle, XCircle, AlertCircle, Search, Download, Filter, X, Star } from 'lucide-react';

export default function TestDrivesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [testDrives, setTestDrives] = useState<TestDriveRes[]>([]);
  const [products, setProducts] = useState<ProductRes[]>([]);
  const [categories, setCategories] = useState<any[]>([]); // Store categories for name mapping
  const [loading, setLoading] = useState(true);
  const [selectedTestDrive, setSelectedTestDrive] = useState<TestDriveRes | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false); // Confirmation dialog
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [newVIN, setNewVIN] = useState('');
  const [selectedProductId, setSelectedProductId] = useState<number>(0);
  const [feedbackMap, setFeedbackMap] = useState<Record<number, TestDriveFeedbackRes>>({});
  
  // Filter states
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterProduct, setFilterProduct] = useState<string>('ALL');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    console.log('🔍 [TestDrivesPage] useEffect triggered');
    console.log('👤 [TestDrivesPage] User:', user);
    console.log('🏢 [TestDrivesPage] Dealer ID:', user?.dealerId);
    
    if (user?.dealerId) {
      console.log('✅ [TestDrivesPage] Dealer ID found, loading data...');
      loadTestDrives();
      loadProducts();
      // Không cần load staff list nữa - tự động dùng user hiện tại
    } else {
      console.log('❌ [TestDrivesPage] No dealer ID found!');
    }
    
    // Suppress third-party errors from browser extensions
    const handleError = (event: ErrorEvent) => {
      const isThirdPartyError = 
        event.filename?.includes('onboarding.js') || 
        event.filename?.includes('extension') ||
        event.filename?.includes('chrome-extension') ||
        event.message?.includes('SOURCE_LANG_VI') ||
        event.message?.includes('listener indicated an asynchronous response') ||
        event.message?.includes('message channel closed');
      
      if (isThirdPartyError) {
        event.preventDefault();
        event.stopPropagation();
        return true;
      }
    };
    
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const errorMessage = event.reason?.message || String(event.reason);
      const isThirdPartyError = 
        errorMessage.includes('listener indicated an asynchronous response') ||
        errorMessage.includes('message channel closed') ||
        errorMessage.includes('SOURCE_LANG_VI') ||
        errorMessage.includes('extension');
      
      if (isThirdPartyError) {
        event.preventDefault();
        return true;
      }
    };

    // Suppress console errors from extensions
    const originalConsoleError = console.error;
    console.error = (...args: any[]) => {
      const message = String(args[0]);
      const fullMessage = args.map(arg => {
        if (arg instanceof Error) {
          return arg.message + (arg.stack || '');
        }
        return String(arg);
      }).join(' ');
      
      if (
        message.includes('SOURCE_LANG_VI') ||
        message.includes('listener indicated an asynchronous response') ||
        message.includes('message channel closed') ||
        message.includes('extension') ||
        message.includes('onboarding.js') ||
        fullMessage.includes('SOURCE_LANG_VI') ||
        fullMessage.includes('listener indicated an asynchronous response') ||
        fullMessage.includes('message channel closed') ||
        fullMessage.includes('onboarding.js')
      ) {
        return;
      }
      originalConsoleError.apply(console, args);
    };
    
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      console.error = originalConsoleError;
    };
  }, [user]);

  const loadTestDrives = async () => {
    if (!user?.dealerId) {
      console.log('❌ [loadTestDrives] No dealerId, skipping...');
      return;
    }
    
    console.log('🔄 [loadTestDrives] Loading test drives for dealer:', user.dealerId);
    
    try {
      setLoading(true);
      const data = await getTestDrivesByDealerId(user.dealerId);
      console.log('📦 [loadTestDrives] Raw data from API:', data);
      console.log('📊 [loadTestDrives] Total test drives:', data.length);
      
      // Sort by date desc (newest first)
      const sorted = data.sort((a, b) => 
        new Date(b.scheduleDate).getTime() - new Date(a.scheduleDate).getTime()
      );
      setTestDrives(sorted);
      console.log('✅ [loadTestDrives] Test drives loaded and sorted:', sorted.length);
      
      // Load feedback for each test drive
      const feedbackPromises = sorted.map(td => 
        getFeedbackByTestDriveId(td.id).catch(() => [])
      );
      const feedbackResults = await Promise.all(feedbackPromises);
      
      const newFeedbackMap: Record<number, TestDriveFeedbackRes> = {};
      feedbackResults.forEach((feedbacks, index) => {
        if (feedbacks.length > 0) {
          newFeedbackMap[sorted[index].id] = feedbacks[0];
        }
      });
      setFeedbackMap(newFeedbackMap);
      console.log('💬 [loadTestDrives] Feedbacks loaded:', Object.keys(newFeedbackMap).length);
    } catch (error) {
      console.error('❌ [loadTestDrives] Error loading test drives:', error);
      console.error('❌ [loadTestDrives] Error details:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể tải danh sách lịch lái thử',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    if (!user?.dealerId) {
      console.log('❌ No dealerId found, cannot load products');
      return;
    }

    try {
      console.log('🔄 Loading products for dealer:', user.dealerId);
      
      // First, get all categories for this dealer
      const { getCategoriesByDealerId } = await import('@/lib/categoryApi');
      const dealerCategories = await getCategoriesByDealerId(user.dealerId);
      console.log('📋 Dealer categories:', dealerCategories);
      
      // Store categories for later use (for name matching)
      setCategories(dealerCategories);
      
      if (dealerCategories.length === 0) {
        console.log('⚠️ No categories found for this dealer');
        setProducts([]);
        return;
      }
      
      // Then load products from all dealer's categories
      const { getProductsByCategory } = await import('@/lib/productApi');
      let allProducts: ProductRes[] = [];
      
      for (const cat of dealerCategories) {
        try {
          console.log(`🔍 Loading products for category ${cat.id} (${cat.name})`);
          const productList = await getProductsByCategory(cat.id);
          allProducts = [...allProducts, ...productList];
          console.log(`✓ Found ${productList.length} products in category ${cat.name}`);
        } catch (catError) {
          console.error(`❌ Error loading products for category ${cat.id}:`, catError);
          // Continue with other categories
        }
      }
      
      console.log('📦 Total products loaded for dealer:', allProducts.length);
      console.log('🚗 Products with TEST_DRIVE status:', 
        allProducts.filter(p => p.status === 'TEST_DRIVE').length
      );
      
      setProducts(allProducts);
    } catch (error) {
      console.error('❌ Failed to load products', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể tải danh sách xe',
        variant: 'destructive',
      });
    }
  };

  const handleOpenDialog = (testDrive: TestDriveRes) => {
    setSelectedTestDrive(testDrive);
    setNewStatus(testDrive.status);
    setNewNotes(testDrive.notes || '');
    setNewVIN(testDrive.specificVIN || '');
    setIsDialogOpen(true);
  };

  const handleUpdateTestDrive = async () => {
    if (!selectedTestDrive) return;

    try {
      setUpdating(true);
      await updateTestDrive(selectedTestDrive.id, {
        status: newStatus,
        notes: newNotes,
        specificVIN: newVIN,
      });

      toast({
        title: 'Thành công',
        description: 'Đã cập nhật lịch lái thử',
      });

      setIsDialogOpen(false);
      loadTestDrives();
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể cập nhật lịch lái thử',
        variant: 'destructive',
      });
    } finally {
      setUpdating(false);
    }
  };

  // Handler for opening assignment dialog
  const handleOpenAssignDialog = (testDrive: TestDriveRes) => {
    console.log('🚗 Opening assign dialog for:', testDrive);
    console.log('📋 Category ID:', testDrive.categoryId);
    console.log('📋 Category Name:', testDrive.categoryName);
    console.log('🚗 Total products loaded:', products.length);
    
    const availableVehicles = products.filter(p => 
      p.status === 'TEST_DRIVE' && 
      testDrive.categoryId && 
      p.categoryId === testDrive.categoryId
    );
    
    console.log('🔍 Vehicles with TEST_DRIVE status:', 
      products.filter(p => p.status === 'TEST_DRIVE').length
    );
    console.log('🚗 Vehicles matching category:', availableVehicles.length);
    console.log('🚙 Available vehicles for assignment:', availableVehicles);
    
    if (availableVehicles.length === 0) {
      toast({
        title: 'Cảnh báo',
        description: `Không có xe nào sẵn sàng trong danh mục "${testDrive.categoryName}". Vui lòng kiểm tra kho xe.`,
        variant: 'default',
      });
    }
    
    console.log('👤 Current user (auto escort):', user?.username, 'ID:', user?.id);
    
    setSelectedTestDrive(testDrive);
    setSelectedProductId(0);
    // Không cần set selectedStaffId nữa - tự động dùng user hiện tại
    setIsAssignDialogOpen(true);
  };

  // Handler for assigning vehicle and staff
  const handleAssignVehicle = async () => {
    if (!selectedTestDrive || !selectedProductId) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng chọn xe để phân công',
        variant: 'destructive',
      });
      return;
    }

    // Show confirmation dialog first
    setIsAssignDialogOpen(false);
    setIsConfirmDialogOpen(true);
  };

  // Handler for confirming the assignment
  const handleConfirmAssignment = async () => {
    if (!selectedTestDrive || !selectedProductId) return;

    // Send productId and escortStaffId (current user)
    const assignData = {
      productId: selectedProductId,
      escortStaffId: user?.id ? parseInt(user.id) : 0,
    };

    const selectedProduct = products.find(p => p.id === selectedProductId);

    console.log('📤 Assigning vehicle with data:', {
      testDriveId: selectedTestDrive.id,
      assignData,
      selectedProduct,
    });

    try {
      setUpdating(true);
      const result = await assignVehicleAndStaff(selectedTestDrive.id, assignData);
      console.log('✅ Assignment successful:', result);

      // Hiển thị toast xác nhận thành công
      toast({
        title: '✅ Đã xác nhận lịch lái thử thành công!',
        description: (
          <div className="mt-2 space-y-1">
            <p className="font-semibold">Khách hàng: {selectedTestDrive.user.name}</p>
            <p>Xe: {selectedProduct?.name}</p>
            <p>Thời gian: {new Date(selectedTestDrive.scheduleDate).toLocaleString('vi-VN')}</p>
            <p className="text-green-600 font-semibold mt-2">✅ Đại lý đã xác nhận lịch</p>
          </div>
        ),
        duration: 8000,
      });

      setIsConfirmDialogOpen(false);
      loadTestDrives();
    } catch (error: any) {
      console.error('❌ Assignment failed:', error);
      console.error('❌ Error details:', error.response?.data);
      
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.error
        || error.message 
        || 'Không thể phân công xe';
      
      toast({
        title: '❌ Không thể xác nhận lịch lái thử',
        description: (
          <div className="mt-2 space-y-2">
            <p className="font-medium text-base">{errorMessage}</p>
            {error.response?.data?.message && (
              <p className="text-sm opacity-90">💡 Vui lòng kiểm tra lại xe và thời gian đã chọn.</p>
            )}
          </div>
        ),
        variant: 'destructive',
        duration: 8000,
      });
    } finally {
      setUpdating(false);
    }
  };

  // Handler for starting test drive (APPROVED -> IN_PROGRESS)
  const handleStartTestDrive = async (testDrive: TestDriveRes) => {
    try {
      setUpdating(true);
      await updateTestDrive(testDrive.id, {
        status: TestDriveStatus.IN_PROGRESS,
      });

      toast({
        title: 'Thành công',
        description: 'Đã bắt đầu lái thử',
      });

      loadTestDrives();
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể bắt đầu lái thử',
        variant: 'destructive',
      });
    } finally {
      setUpdating(false);
    }
  };

  // Handler for completing test drive (IN_PROGRESS -> DONE)
  const handleCompleteTestDrive = async (testDrive: TestDriveRes) => {
    try {
      setUpdating(true);
      await updateTestDrive(testDrive.id, {
        status: TestDriveStatus.DONE,
      });

      toast({
        title: 'Thành công',
        description: 'Đã hoàn tất lái thử',
      });

      loadTestDrives();
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể hoàn tất lái thử',
        variant: 'destructive',
      });
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      PENDING: { label: 'Chờ xác nhận', variant: 'default' as const, icon: AlertCircle, color: 'text-yellow-600' },
      ASSIGNING: { label: 'Đang chờ phân công', variant: 'default' as const, icon: AlertCircle, color: 'text-orange-600' },
      APPROVED: { label: 'Đã phân công', variant: 'default' as const, icon: CheckCircle, color: 'text-green-600' },
      IN_PROGRESS: { label: 'Đang lái thử', variant: 'default' as const, icon: Car, color: 'text-blue-600' },
      DONE: { label: 'Hoàn thành', variant: 'default' as const, icon: CheckCircle, color: 'text-gray-600' },
      REJECTED: { label: 'Đã từ chối', variant: 'destructive' as const, icon: XCircle, color: 'text-red-600' },
      CANCELLED: { label: 'Đã hủy', variant: 'destructive' as const, icon: XCircle, color: 'text-red-600' },
    };
    const config = badges[status as keyof typeof badges] || badges.PENDING;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className={`h-3 w-3 ${config.color}`} />
        {config.label}
      </Badge>
    );
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('vi-VN', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      }),
      time: date.toLocaleTimeString('vi-VN', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
    };
  };

  const clearFilters = () => {
    setSearchQuery('');
    setFilterStatus('ALL');
    setFilterProduct('ALL');
    setDateFrom('');
    setDateTo('');
  };

  const hasActiveFilters = searchQuery || filterStatus !== 'ALL' || filterProduct !== 'ALL' || dateFrom || dateTo;

  // Apply all filters
  const filteredTestDrives = testDrives.filter(td => {
    // Status filter
    if (filterStatus !== 'ALL' && td.status !== filterStatus) return false;
    
    // Search filter (customer name or product name or category name)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesCustomer = td.user.name.toLowerCase().includes(query);
      const matchesProduct = td.productName?.toLowerCase().includes(query) || false;
      const matchesCategory = td.categoryName?.toLowerCase().includes(query) || false;
      const matchesPhone = td.user.phone.toLowerCase().includes(query);
      if (!matchesCustomer && !matchesProduct && !matchesCategory && !matchesPhone) return false;
    }
    
    // Product filter
    if (filterProduct !== 'ALL' && td.productName !== filterProduct) return false;
    
    // Date range filter
    const testDriveDate = new Date(td.scheduleDate);
    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      fromDate.setHours(0, 0, 0, 0);
      if (testDriveDate < fromDate) return false;
    }
    if (dateTo) {
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59, 999);
      if (testDriveDate > toDate) return false;
    }
    
    return true;
  });

  const exportToCSV = () => {
    try {
      // Create CSV header
      const headers = ['Mã lịch hẹn', 'Tên khách hàng', 'Số điện thoại', 'Email', 'Tên xe', 'Ngày hẹn', 'Giờ hẹn', 'Trạng thái', 'Ghi chú'];
      
      // Create CSV rows
      const rows = filteredTestDrives.map(td => {
        const dateTime = formatDateTime(td.scheduleDate);
        const statusLabels: Record<string, string> = {
          PENDING: 'Chờ xác nhận',
          ASSIGNING: 'Đang chờ phân công',
          APPROVED: 'Đã phân công',
          IN_PROGRESS: 'Đang lái thử',
          DONE: 'Hoàn thành',
          REJECTED: 'Đã từ chối',
          CANCELLED: 'Đã hủy',
        };
        return [
          td.id,
          td.user.name,
          td.user.phone,
          td.user.email,
          td.productName,
          dateTime.date,
          dateTime.time,
          statusLabels[td.status] || td.status,
          td.notes || '',
        ];
      });
      
      // Combine headers and rows
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');
      
      // Add BOM for UTF-8 encoding (helps Excel read Vietnamese characters)
      const BOM = '\uFEFF';
      const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
      
      // Create download link
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `lich-lai-thu-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: 'Thành công',
        description: `Đã xuất ${filteredTestDrives.length} lịch hẹn ra file CSV`,
      });
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể xuất file CSV',
        variant: 'destructive',
      });
    }
  };

  const stats = {
    total: testDrives.length,
    pending: testDrives.filter(td => td.status === TestDriveStatus.PENDING).length,
    approved: testDrives.filter(td => td.status === TestDriveStatus.APPROVED).length,
    inProgress: testDrives.filter(td => td.status === TestDriveStatus.IN_PROGRESS).length,
    done: testDrives.filter(td => td.status === TestDriveStatus.DONE).length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['Dealer Staff', 'Admin']}>
      <DealerStaffLayout>
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold">Quản lý Lịch Lái Thử</h1>
            <p className="text-muted-foreground mt-2">
              Xem và quản lý các yêu cầu lái thử xe từ khách hàng
            </p>
          </div>

      {/* Filter Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              <CardTitle className="text-lg">Bộ lọc thông minh</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4 mr-2" />
                  Xóa bộ lọc
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={exportToCSV}
                disabled={filteredTestDrives.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Xuất CSV
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                {showFilters ? 'Ẩn bộ lọc' : 'Hiện bộ lọc'}
              </Button>
            </div>
          </div>
        </CardHeader>
        
        {showFilters && (
          <CardContent className="space-y-4">
            {/* Search Box */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm theo tên khách hàng, tên xe, số điện thoại..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filters Row */}
            <div className="grid gap-4 md:grid-cols-4">
              {/* Status Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Trạng thái</label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tất cả trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Tất cả</SelectItem>
                    <SelectItem value="PENDING">Chờ xác nhận</SelectItem>
                    <SelectItem value="ASSIGNING">Đang chờ phân công</SelectItem>
                    <SelectItem value="APPROVED">Đã phân công</SelectItem>
                    <SelectItem value="IN_PROGRESS">Đang lái thử</SelectItem>
                    <SelectItem value="DONE">Hoàn thành</SelectItem>
                    <SelectItem value="CANCELLED">Đã hủy</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Product Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Xe</label>
                <Select value={filterProduct} onValueChange={setFilterProduct}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tất cả xe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Tất cả xe</SelectItem>
                    {Array.from(new Set(testDrives.map(td => td.productName).filter(Boolean))).map(productName => (
                      <SelectItem key={productName} value={productName!}>
                        {productName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date From */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Từ ngày</label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>

              {/* Date To */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Đến ngày</label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>
            </div>

            {/* Active Filters Summary */}
            {hasActiveFilters && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Đang hiển thị:</span>
                <span className="font-semibold text-foreground">
                  {filteredTestDrives.length} / {testDrives.length} lịch hẹn
                </span>
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Test Drives List */}
      {filteredTestDrives.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Chưa có lịch lái thử nào</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredTestDrives.map((testDrive) => {
            const dateTime = formatDateTime(testDrive.scheduleDate);
            return (
              <Card key={testDrive.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="flex items-center gap-2">
                        <Car className="h-5 w-5" />
                        {testDrive.productName || testDrive.categoryName || 'Chưa chọn xe'}
                      </CardTitle>
                      <CardDescription>
                        Mã lịch hẹn: #{testDrive.id}
                      </CardDescription>
                    </div>
                    {getStatusBadge(testDrive.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    {/* Customer Info */}
                    <div className="space-y-2">
                      <h4 className="font-semibold flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Thông tin khách hàng
                      </h4>
                      <div className="text-sm space-y-1 pl-6">
                        <p className="font-medium">{testDrive.user.name}</p>
                        <p className="text-muted-foreground flex items-center gap-2">
                          <Phone className="h-3 w-3" />
                          {testDrive.user.phone}
                        </p>
                        <p className="text-muted-foreground flex items-center gap-2">
                          <Mail className="h-3 w-3" />
                          {testDrive.user.email}
                        </p>
                      </div>
                    </div>

                    {/* Schedule Info */}
                    <div className="space-y-2">
                      <h4 className="font-semibold flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Thời gian hẹn
                      </h4>
                      <div className="text-sm space-y-1 pl-6">
                        <p className="font-medium">{dateTime.date}</p>
                        <p className="text-muted-foreground flex items-center gap-2">
                          <Clock className="h-3 w-3" />
                          {dateTime.time}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* VIN Number */}
                  {testDrive.specificVIN && (
                    <div className="pt-2 border-t">
                      <p className="text-sm font-semibold mb-1">Số VIN:</p>
                      <p className="text-sm text-muted-foreground font-mono">{testDrive.specificVIN}</p>
                    </div>
                  )}

                  {/* Notes */}
                  {testDrive.notes && (
                    <div className="pt-2 border-t">
                      <p className="text-sm font-semibold mb-1">Ghi chú:</p>
                      <p className="text-sm text-muted-foreground">{testDrive.notes}</p>
                    </div>
                  )}

                  {/* Customer Feedback */}
                  {feedbackMap[testDrive.id] && (
                    <div className="pt-2 border-t bg-blue-50 dark:bg-blue-950 -mx-4 -mb-4 p-4 rounded-b-lg">
                      <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        Đánh giá từ khách hàng:
                      </p>
                      <div className="flex items-center gap-2 mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              star <= feedbackMap[testDrive.id].rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                        <span className="text-sm font-medium">
                          {feedbackMap[testDrive.id].rating}/5 sao
                        </span>
                      </div>
                      {feedbackMap[testDrive.id].comment && (
                        <p className="text-sm text-muted-foreground italic">
                          "{feedbackMap[testDrive.id].comment}"
                        </p>
                      )}
                    </div>
                  )}

                  {/* Actions - Status-based buttons */}
                  <div className="flex gap-2 pt-2">
                    {testDrive.status === TestDriveStatus.PENDING && (
                      <Button 
                        onClick={() => handleOpenAssignDialog(testDrive)}
                        variant="default"
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Car className="h-4 w-4 mr-2" />
                        Phân công xe
                      </Button>
                    )}
                    
                    {testDrive.status === TestDriveStatus.ASSIGNING && (
                      <Button 
                        onClick={() => handleOpenAssignDialog(testDrive)}
                        variant="default"
                        size="sm"
                        className="bg-orange-600 hover:bg-orange-700"
                      >
                        <Car className="h-4 w-4 mr-2" />
                        Phân công xe
                      </Button>
                    )}
                    
                    {testDrive.status === TestDriveStatus.APPROVED && (
                      <Button 
                        onClick={() => handleStartTestDrive(testDrive)}
                        variant="default"
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        disabled={updating}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Bắt đầu lái thử
                      </Button>
                    )}
                    
                    {testDrive.status === TestDriveStatus.IN_PROGRESS && (
                      <Button 
                        onClick={() => handleCompleteTestDrive(testDrive)}
                        variant="default"
                        size="sm"
                        className="bg-purple-600 hover:bg-purple-700"
                        disabled={updating}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Hoàn tất
                      </Button>
                    )}
                    
                    {(testDrive.status === TestDriveStatus.DONE || 
                      testDrive.status === TestDriveStatus.REJECTED || 
                      testDrive.status === TestDriveStatus.CANCELLED) && (
                      <div className="text-sm text-muted-foreground italic">
                        Không có hành động khả dụng
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Update Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Cập nhật Lịch Lái Thử</DialogTitle>
            <DialogDescription>
              Cập nhật trạng thái và ghi chú cho lịch hẹn lái thử
            </DialogDescription>
          </DialogHeader>

          {selectedTestDrive && (
            <div className="space-y-4">
              {/* Customer Info */}
              <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg space-y-1">
                <p className="text-sm font-semibold">
                  {selectedTestDrive.productName || selectedTestDrive.categoryName || 'Chưa chọn xe'}
                </p>
                <p className="text-sm text-muted-foreground">{selectedTestDrive.user.name}</p>
                <p className="text-sm text-muted-foreground">
                  {formatDateTime(selectedTestDrive.scheduleDate).date} - {formatDateTime(selectedTestDrive.scheduleDate).time}
                </p>
                {selectedTestDrive.escortStaff && (
                  <div className="pt-2 mt-2 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Nhân viên hộ tống:</p>
                    <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                      {selectedTestDrive.escortStaff.fullName}
                    </p>
                    <p className="text-xs text-muted-foreground">{selectedTestDrive.escortStaff.phone}</p>
                  </div>
                )}
              </div>

              {/* Status */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Trạng thái</label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={TestDriveStatus.PENDING}>Chờ xác nhận</SelectItem>
                    <SelectItem value={TestDriveStatus.ASSIGNING}>Đang chờ phân công</SelectItem>
                    <SelectItem value={TestDriveStatus.APPROVED}>Đã phân công</SelectItem>
                    <SelectItem value={TestDriveStatus.IN_PROGRESS}>Đang lái thử</SelectItem>
                    <SelectItem value={TestDriveStatus.DONE}>Hoàn thành</SelectItem>
                    <SelectItem value={TestDriveStatus.REJECTED}>Đã từ chối</SelectItem>
                    <SelectItem value={TestDriveStatus.CANCELLED}>Đã hủy</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* VIN Number */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Số VIN cụ thể
                  <span className="text-xs text-muted-foreground ml-2">(Tùy chọn)</span>
                </label>
                <Input
                  value={newVIN}
                  onChange={(e) => setNewVIN(e.target.value)}
                  placeholder="Nhập số VIN của xe sẽ dùng cho lịch lái thử..."
                  maxLength={50}
                />
                <p className="text-xs text-muted-foreground">
                  Nhập số VIN cụ thể nếu bạn muốn chỉ định xe cụ thể cho lịch lái thử này
                </p>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Ghi chú</label>
                <Textarea
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Nhập ghi chú cho lịch hẹn..."
                  rows={4}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDialogOpen(false)}
              disabled={updating}
            >
              Hủy
            </Button>
            <Button 
              onClick={handleUpdateTestDrive}
              disabled={updating}
            >
              {updating ? 'Đang cập nhật...' : 'Cập nhật'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Vehicle Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Phân công xe và nhân viên</DialogTitle>
            <DialogDescription>
              Chọn xe và nhân viên hộ tống cho yêu cầu lái thử
            </DialogDescription>
          </DialogHeader>

          {selectedTestDrive && (
            <div className="space-y-4 py-4">
              {/* Customer Info */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Khách hàng</label>
                <div className="text-sm space-y-1 p-3 bg-muted rounded-md">
                  <p className="font-medium">{selectedTestDrive.user.name}</p>
                  <p className="text-muted-foreground">{selectedTestDrive.user.phone}</p>
                  <p className="text-muted-foreground">{selectedTestDrive.user.email}</p>
                </div>
              </div>

              {/* Category Info */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Danh mục xe yêu cầu</label>
                <div className="text-sm p-3 bg-blue-50 dark:bg-blue-950 rounded-md font-medium">
                  {selectedTestDrive.categoryName || 'Không có thông tin'}
                </div>
              </div>

              {/* Schedule Info */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Thời gian hẹn</label>
                <div className="text-sm p-3 bg-muted rounded-md">
                  {new Date(selectedTestDrive.scheduleDate).toLocaleString('vi-VN')}
                </div>
              </div>

              {/* Vehicle Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Chọn xe <span className="text-red-500">*</span></label>
                
                <Select 
                  value={selectedProductId.toString()} 
                  onValueChange={(value) => {
                    console.log('Selected product ID:', value);
                    setSelectedProductId(parseInt(value));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn xe để phân công" />
                  </SelectTrigger>
                  <SelectContent>
                    {(() => {
                      // Match by category NAME - KHÔNG filter theo status nữa
                      const availableVehicles = products.filter(p => {
                        if (!selectedTestDrive.categoryName) return false;
                        
                        // Get category name from categories list
                        const category = categories.find(c => c.id === p.categoryId);
                        const productCategoryName = category?.name || '';
                        
                        return productCategoryName === selectedTestDrive.categoryName;
                      });
                      
                      console.log('📋 Available vehicles for assignment (by NAME):', availableVehicles);
                      
                      if (availableVehicles.length === 0) {
                        return (
                          <SelectItem value="0" disabled>
                            Không có xe nào trong danh mục này
                          </SelectItem>
                        );
                      }
                      
                      return availableVehicles.map(product => (
                        <SelectItem key={product.id} value={product.id.toString()}>
                          {product.name} - VIN: {product.vinNum}
                          {product.status === 'TEST_DRIVE' ? ' ✅' : ` (${product.status})`}
                        </SelectItem>
                      ));
                    })()}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  ✓ Chỉ hiển thị xe có trạng thái "Lái thử" trong danh mục "{selectedTestDrive.categoryName}"
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold">
                  Tìm thấy {products.filter(p => {
                    if (p.status !== 'TEST_DRIVE') return false;
                    if (!selectedTestDrive.categoryName) return false;
                    const category = categories.find(c => c.id === p.categoryId);
                    const productCategoryName = category?.name || '';
                    return productCategoryName === selectedTestDrive.categoryName;
                  }).length} xe sẵn sàng (match by category NAME)
                </p>
              </div>

              {/* Auto-assigned Staff Info */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Nhân viên hộ tống</label>
                <div className="text-sm p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-md">
                  <div className="flex items-center gap-2 mb-1">
                    <User className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-green-800 dark:text-green-200">
                      {user?.username || 'Nhân viên hiện tại'}
                    </span>
                  </div>
                  <p className="text-xs text-green-700 dark:text-green-300">
                    ✓ Tự động gán nhân viên đang xử lý đơn làm người hộ tống
                  </p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsAssignDialogOpen(false)}
              disabled={updating}
            >
              Hủy
            </Button>
            <Button 
              onClick={handleAssignVehicle}
              disabled={updating || !selectedProductId}
            >
              {updating ? 'Đang xử lý...' : 'Tiếp tục'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-xl">📋 Xác nhận phân công lịch lái thử</DialogTitle>
            <DialogDescription>
              Vui lòng kiểm tra kỹ thông tin trước khi xác nhận
            </DialogDescription>
          </DialogHeader>

          {selectedTestDrive && (
            <div className="space-y-4 py-4">
              {/* Confirmation Notice */}
              <div className="p-4 bg-green-50 dark:bg-green-950 border-2 border-green-200 dark:border-green-800 rounded-lg">
                <p className="text-sm font-semibold text-green-800 dark:text-green-200 mb-2">
                  ✅ Đại lý sẽ xác nhận lịch lái thử
                </p>
                <p className="text-xs text-green-700 dark:text-green-300">
                  Khách hàng sẽ nhận được thông báo xác nhận trên hệ thống
                </p>
              </div>

              {/* Customer Info */}
              <div className="space-y-2">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Thông tin khách hàng
                </h4>
                <div className="text-sm p-3 bg-muted rounded-md space-y-1">
                  <p><span className="font-medium">Tên:</span> {selectedTestDrive.user.name}</p>
                  <p><span className="font-medium">SĐT:</span> {selectedTestDrive.user.phone}</p>
                  <p><span className="font-medium">Email:</span> {selectedTestDrive.user.email}</p>
                </div>
              </div>

              {/* Vehicle Info */}
              <div className="space-y-2">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <Car className="h-4 w-4" />
                  Thông tin xe
                </h4>
                <div className="text-sm p-3 bg-muted rounded-md space-y-1">
                  {(() => {
                    const selectedProduct = products.find(p => p.id === selectedProductId);
                    return (
                      <>
                        <p><span className="font-medium">Tên xe:</span> {selectedProduct?.name || 'N/A'}</p>
                        <p><span className="font-medium">Số VIN:</span> {selectedProduct?.vinNum || 'N/A'}</p>
                        <p><span className="font-medium">Danh mục:</span> {selectedTestDrive.categoryName}</p>
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* Schedule Info */}
              <div className="space-y-2">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Thời gian lái thử
                </h4>
                <div className="text-sm p-3 bg-muted rounded-md">
                  <p className="font-medium text-blue-600 dark:text-blue-400">
                    {new Date(selectedTestDrive.scheduleDate).toLocaleString('vi-VN', {
                      dateStyle: 'full',
                      timeStyle: 'short'
                    })}
                  </p>
                </div>
              </div>

              {/* Auto-assigned Staff Info */}
              <div className="space-y-2">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Nhân viên hộ tống
                </h4>
                <div className="text-sm p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-md">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-green-800 dark:text-green-200">
                      {user?.username || 'Nhân viên hiện tại'}
                    </span>
                  </div>
                  <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                    ✓ Tự động phân công
                  </p>
                </div>
              </div>

              {/* Warning */}
              <div className="p-3 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-md">
                <p className="text-xs text-yellow-800 dark:text-yellow-200">
                  ⚠️ Sau khi xác nhận, trạng thái sẽ chuyển thành "Đã phân công" và khách hàng sẽ được thông báo.
                </p>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => {
                setIsConfirmDialogOpen(false);
                setIsAssignDialogOpen(true); // Back to assign dialog
              }}
              disabled={updating}
            >
              Quay lại
            </Button>
            <Button 
              onClick={handleConfirmAssignment}
              disabled={updating}
              className="bg-green-600 hover:bg-green-700"
            >
              {updating ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Đang xác nhận...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Xác nhận phân công
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
