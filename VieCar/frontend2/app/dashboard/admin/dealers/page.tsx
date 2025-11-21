'use client';

import { ProtectedRoute } from "@/components/auth-guards";
import AdminLayout from "@/components/layout/admin-layout";
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import * as dealerApi from '@/lib/dealerApi';
import { getAvailableDealerManagers, UserRes } from '@/lib/user';
import { DealerRes, DealerReq, DealerStatus } from '@/types/dealer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  PlusCircle, 
  Pencil, 
  Trash2, 
  Search, 
  Eye,
  Store,
  MapPin,
  Phone,
  Mail,
  RefreshCw
} from 'lucide-react';

// Status colors (Backend only has ACTIVE, INACTIVE)
const statusColors: Record<DealerStatus, string> = {
  ACTIVE: 'bg-green-500',
  INACTIVE: 'bg-gray-500',
};

const statusLabels: Record<DealerStatus, string> = {
  ACTIVE: 'Hoạt động',
  INACTIVE: 'Ngừng hoạt động',
};

// Default Saigon addresses
const saigonDistricts = [
  'Quận 1, TP. Hồ Chí Minh',
  'Quận 2, TP. Hồ Chí Minh',
  'Quận 3, TP. Hồ Chí Minh',
  'Quận 4, TP. Hồ Chí Minh',
  'Quận 5, TP. Hồ Chí Minh',
  'Quận 6, TP. Hồ Chí Minh',
  'Quận 7, TP. Hồ Chí Minh',
  'Quận 8, TP. Hồ Chí Minh',
  'Quận 9, TP. Hồ Chí Minh',
  'Quận 10, TP. Hồ Chí Minh',
  'Quận 11, TP. Hồ Chí Minh',
  'Quận 12, TP. Hồ Chí Minh',
  'Bình Thạnh, TP. Hồ Chí Minh',
  'Gò Vấp, TP. Hồ Chí Minh',
  'Phú Nhuận, TP. Hồ Chí Minh',
  'Tân Bình, TP. Hồ Chí Minh',
  'Tân Phú, TP. Hồ Chí Minh',
  'Bình Tân, TP. Hồ Chí Minh',
  'Thủ Đức, TP. Hồ Chí Minh',
];

export default function AdminDealersPage() {
  const { toast } = useToast();
  
  // State
  const [dealers, setDealers] = useState<DealerRes[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [availableManagers, setAvailableManagers] = useState<UserRes[]>([]);
  const [loadingManagers, setLoadingManagers] = useState(false);
  
  // Dialog states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedDealer, setSelectedDealer] = useState<DealerRes | null>(null);
  
  // Form state - Default: Sài Gòn
  const [formData, setFormData] = useState<DealerReq>({
    name: '',
    address: 'Quận 1, TP. Hồ Chí Minh', // Mặc định Sài Gòn
    phone: '',
    email: '',
    taxcode: '',
    userId: undefined, // ID của dealer manager
  });

  // Load dealers
  useEffect(() => {
    loadDealers();
  }, []);

  // Load available dealer managers when create dialog opens
  useEffect(() => {
    if (isCreateOpen) {
      loadAvailableManagers();
    }
  }, [isCreateOpen]);

  const loadDealers = async () => {
    try {
      setLoading(true);
      const data = await dealerApi.getAllDealers();
      setDealers(data);
      toast({
        title: '✅ Tải thành công',
        description: `Đã tải ${data.length} đại lý`,
      });
    } catch (error: any) {
      toast({
        title: '❌ Lỗi tải dữ liệu',
        description: error.response?.data?.message || 'Không thể tải danh sách đại lý',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableManagers = async () => {
    try {
      setLoadingManagers(true);
      const managers = await getAvailableDealerManagers();
      setAvailableManagers(managers);
      console.log('Available managers:', managers);
    } catch (error: any) {
      console.error('Error loading managers:', error);
      toast({
        title: '⚠️ Không thể tải danh sách Dealer Manager',
        description: 'Bạn vẫn có thể tạo đại lý mà không chọn manager',
        variant: 'default',
      });
    } finally {
      setLoadingManagers(false);
    }
  };

  // Search
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      loadDealers();
      return;
    }
    try {
      setLoading(true);
      const data = await dealerApi.searchDealersByName(searchTerm);
      setDealers(data);
      toast({
        title: '🔍 Tìm kiếm',
        description: `Tìm thấy ${data.length} kết quả`,
      });
    } catch (error: any) {
      toast({
        title: '❌ Lỗi tìm kiếm',
        description: error.response?.data?.message || 'Không thể tìm kiếm',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Reset form với địa chỉ mặc định Sài Gòn
  const resetForm = () => {
    setFormData({
      name: '',
      address: 'Quận 1, TP. Hồ Chí Minh', // Reset về mặc định Sài Gòn
      phone: '',
      email: '',
      taxcode: '',
      userId: undefined,
    });
  };

  // Create dealer
  const handleCreate = async () => {
    // Validation
    if (!formData.name || !formData.address || !formData.phone || !formData.email || !formData.taxcode) {
      toast({
        title: '⚠️ Thiếu thông tin',
        description: 'Vui lòng điền đầy đủ thông tin',
        variant: 'destructive',
        duration: 3000,
      });
      return;
    }

    // Validate email must contain @gmail.com
    if (!formData.email.includes('@gmail.com')) {
      toast({
        title: '⚠️ Email không hợp lệ',
        description: 'Email phải có định dạng @gmail.com',
        variant: 'destructive',
        duration: 3000,
      });
      return;
    }

    // Validate phone number: must be digits only, start with 0, and exactly 10 digits
    const phoneRegex = /^0\d{9}$/;
    if (!phoneRegex.test(formData.phone)) {
      toast({
        title: '⚠️ Số điện thoại không hợp lệ',
        description: 'Số điện thoại phải bắt đầu bằng số 0 và có đúng 10 chữ số',
        variant: 'destructive',
        duration: 3000,
      });
      return;
    }

    // Check duplicate email
    const emailExists = dealers.some(dealer => dealer.email?.toLowerCase() === formData.email.toLowerCase());
    if (emailExists) {
      toast({
        title: '⚠️ Email đã tồn tại',
        description: 'Email này đã được sử dụng bởi đại lý khác',
        variant: 'destructive',
        duration: 3000,
      });
      return;
    }

    try {
      const dealerData = { ...formData };
      console.log('Creating dealer with data:', dealerData);
      
      await dealerApi.createDealer(dealerData);
      
      const managerInfo = formData.userId 
        ? ` và đã gán Dealer Manager`
        : '';
      
      toast({
        title: '✅ Tạo thành công',
        description: `Đã tạo đại lý ${formData.name}${managerInfo}`,
        duration: 3000,
      });
      setIsCreateOpen(false);
      resetForm();
      loadDealers();
      // Reload managers vì user đã chọn sẽ không còn available
      if (formData.userId) {
        loadAvailableManagers();
      }
    } catch (error: any) {
      // Log để debug
      console.error('❌ Error creating dealer:', error);
      console.error('Error response:', error.response);
      console.error('Error data:', error.response?.data);
      
      // Backend trả về error message dạng plain text trong response.data
      const errorMessage = typeof error.response?.data === 'string' 
        ? error.response.data 
        : error.response?.data?.message || error.message || 'Không thể tạo đại lý';
      
      console.log('📢 Displaying toast with message:', errorMessage);
      
      toast({
        title: '❌ Lỗi tạo đại lý',
        description: errorMessage,
        variant: 'destructive',
        duration: 3000,
      });
    }
  };

  // Edit dealer
  const openEditDialog = (dealer: DealerRes) => {
    setSelectedDealer(dealer);
    setFormData({
      name: dealer.name,
      address: dealer.address,
      phone: dealer.phone,
      email: dealer.email,
      taxcode: dealer.taxcode,
    });
    setIsEditOpen(true);
  };

  const handleEdit = async () => {
    if (!selectedDealer) return;

    if (!formData.name || !formData.address || !formData.phone || !formData.email || !formData.taxcode) {
      toast({
        title: '⚠️ Thiếu thông tin',
        description: 'Vui lòng điền đầy đủ thông tin',
        variant: 'destructive',
      });
      return;
    }

    try {
      await dealerApi.updateDealer(selectedDealer.id, formData);
      toast({
        title: '✅ Cập nhật thành công',
        description: `Đã cập nhật đại lý ${formData.name}`,
      });
      setIsEditOpen(false);
      setSelectedDealer(null);
      resetForm();
      loadDealers();
    } catch (error: any) {
      // Log để debug
      console.error('❌ Error updating dealer:', error);
      console.error('Error response:', error.response);
      console.error('Error data:', error.response?.data);
      
      // Backend trả về error message dạng plain text trong response.data
      const errorMessage = typeof error.response?.data === 'string' 
        ? error.response.data 
        : error.response?.data?.message || error.message || 'Không thể cập nhật đại lý';
      
      console.log('📢 Displaying toast with message:', errorMessage);
      
      toast({
        title: '❌ Lỗi cập nhật',
        description: errorMessage,
        variant: 'destructive',
        duration: 5000, // Hiển thị 5 giây
      });
    }
  };

  // Delete dealer
  const openDeleteDialog = (dealer: DealerRes) => {
    setSelectedDealer(dealer);
    setIsDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedDealer) return;

    try {
      // Thay vì xóa hẳn, chuyển trạng thái sang INACTIVE
      const updateData: DealerReq = {
        name: selectedDealer.name,
        address: selectedDealer.address,
        phone: selectedDealer.phone,
        email: selectedDealer.email,
        managerId: selectedDealer.managerId,
        status: DealerStatus.INACTIVE
      };

      await dealerApi.updateDealer(selectedDealer.id, updateData);
      
      toast({
        title: '✅ Đã vô hiệu hóa',
        description: `Đại lý ${selectedDealer.name} đã chuyển sang trạng thái không hoạt động`,
      });
      setIsDeleteOpen(false);
      setSelectedDealer(null);
      loadDealers();
    } catch (error: any) {
      toast({
        title: '❌ Lỗi vô hiệu hóa đại lý',
        description: error.response?.data?.message || 'Không thể vô hiệu hóa đại lý',
        variant: 'destructive',
      });
    }
  };

  // View details
  const openViewDialog = (dealer: DealerRes) => {
    setSelectedDealer(dealer);
    setIsViewOpen(true);
  };

  // Filtered dealers for search
  const filteredDealers = searchTerm
    ? dealers.filter(d => 
        d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.address.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : dealers;

  return (
    <ProtectedRoute allowedRoles={['Admin']}>
      <AdminLayout>
        <div className="relative min-h-screen overflow-hidden">
          {/* Animated Water Droplets Background */}
          <div className="fixed inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-[10%] left-[15%] w-32 h-32 bg-blue-400/20 rounded-full blur-3xl animate-float-slow"></div>
            <div className="absolute top-[60%] right-[20%] w-40 h-40 bg-cyan-400/20 rounded-full blur-3xl animate-float-medium"></div>
            <div className="absolute bottom-[20%] left-[25%] w-36 h-36 bg-teal-400/20 rounded-full blur-3xl animate-float-fast"></div>
            <div className="absolute top-[30%] right-[10%] w-28 h-28 bg-blue-300/20 rounded-full blur-2xl animate-float-slow-reverse"></div>
            <div className="absolute bottom-[40%] right-[35%] w-24 h-24 bg-cyan-300/20 rounded-full blur-2xl animate-float-medium-reverse"></div>
            <div className="absolute top-[70%] left-[40%] w-20 h-20 bg-blue-200/20 rounded-full blur-xl animate-droplet-1"></div>
            <div className="absolute top-[20%] left-[60%] w-16 h-16 bg-cyan-200/20 rounded-full blur-xl animate-droplet-2"></div>
            <div className="absolute bottom-[30%] right-[50%] w-14 h-14 bg-teal-200/20 rounded-full blur-xl animate-droplet-3"></div>
          </div>

          <div className="relative z-10 p-6 space-y-6">
            {/* Header with Glass Effect */}
            <div className="flex justify-between items-center backdrop-blur-md bg-white/70 dark:bg-gray-900/70 p-6 rounded-2xl border border-white/20 shadow-xl">
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-2 bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 bg-clip-text text-transparent">
                  <Store className="h-8 w-8 text-blue-600 drop-shadow-lg" />
                  Quản lý Đại lý
                </h1>
                <p className="text-muted-foreground mt-2">
                  Quản lý đại lý tại TP. Hồ Chí Minh 🏙️
                </p>
              </div>
              <Button 
                onClick={() => { resetForm(); setIsCreateOpen(true); }}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Tạo đại lý mới
              </Button>
            </div>

          {/* Search with Glass Effect */}
          <div className="flex gap-2 backdrop-blur-md bg-white/60 dark:bg-gray-900/60 p-4 rounded-2xl border border-white/20 shadow-lg">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-cyan-600" />
              <Input
                placeholder="Tìm kiếm theo tên hoặc địa chỉ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10 bg-white/50 dark:bg-gray-800/50 border-white/30 focus:border-cyan-400 transition-all duration-300"
              />
            </div>
            <Button 
              onClick={handleSearch} 
              variant="outline"
              className="border-cyan-400/50 hover:bg-cyan-50 dark:hover:bg-cyan-950 transition-all duration-300"
            >
              <Search className="h-4 w-4 mr-2" />
              Tìm kiếm
            </Button>
            <Button 
              onClick={loadDealers} 
              variant="outline"
              className="border-blue-400/50 hover:bg-blue-50 dark:hover:bg-blue-950 transition-all duration-300"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Làm mới
            </Button>
          </div>

          {/* Stats with Glass Effect */}
          <div className="grid grid-cols-3 gap-4">
            <div className="backdrop-blur-md bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-white/30 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group">
              <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">Tổng đại lý</p>
              <p className="text-3xl font-bold mt-2 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                {dealers.length}
              </p>
              <div className="mt-2 h-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            </div>
            <div className="backdrop-blur-md bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-white/30 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group">
              <p className="text-sm text-green-700 dark:text-green-300 font-medium">Hoạt động</p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {dealers.filter(d => d.status === DealerStatus.ACTIVE).length}
              </p>
              <div className="mt-2 h-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            </div>
            <div className="backdrop-blur-md bg-gradient-to-br from-gray-500/20 to-slate-500/20 border border-white/30 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group">
              <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">Ngừng hoạt động</p>
              <p className="text-3xl font-bold text-gray-600 mt-2">
                {dealers.filter(d => d.status === DealerStatus.INACTIVE).length}
              </p>
              <div className="mt-2 h-1 bg-gradient-to-r from-gray-500 to-slate-500 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            </div>
          </div>

          {/* Table with Glass Effect */}
          <div className="backdrop-blur-md bg-white/60 dark:bg-gray-900/60 border border-white/20 rounded-2xl overflow-hidden shadow-xl">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-b border-white/20">
                  <TableHead className="w-[60px] font-semibold">ID</TableHead>
                  <TableHead className="font-semibold">Tên đại lý</TableHead>
                  <TableHead className="font-semibold">Địa chỉ</TableHead>
                  <TableHead className="font-semibold">Điện thoại</TableHead>
                  <TableHead className="font-semibold">Email</TableHead>
                  <TableHead className="font-semibold">Mã số thuế</TableHead>
                  <TableHead className="font-semibold">Trạng thái</TableHead>
                  <TableHead className="font-semibold">Ngày tạo</TableHead>
                  <TableHead className="text-right font-semibold">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce"></div>
                        <div className="w-4 h-4 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-4 h-4 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredDealers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      Chưa có đại lý nào. Click "Tạo đại lý mới" để bắt đầu!
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDealers.map((dealer) => (
                    <TableRow 
                      key={dealer.id} 
                      className="hover:bg-gradient-to-r hover:from-blue-500/10 hover:to-cyan-500/10 transition-all duration-300 border-b border-white/10"
                    >
                      <TableCell className="font-medium">{dealer.id}</TableCell>
                      <TableCell className="font-semibold">{dealer.name}</TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-cyan-600" />
                          {dealer.address}
                        </div>
                      </TableCell>
                      <TableCell>{dealer.phone}</TableCell>
                      <TableCell>{dealer.email}</TableCell>
                      <TableCell>
                        <code className="text-xs bg-gradient-to-r from-blue-500/20 to-cyan-500/20 px-2 py-1 rounded border border-blue-300/30">
                          {dealer.taxcode}
                        </code>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${statusColors[dealer.status]} shadow-lg`}>
                          {statusLabels[dealer.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(dealer.creationDate).toLocaleDateString('vi-VN')}
                      </TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openViewDialog(dealer)}
                          title="Xem chi tiết"
                          className="hover:bg-blue-100 dark:hover:bg-blue-900 transition-all duration-300"
                        >
                          <Eye className="h-4 w-4 text-blue-600" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openEditDialog(dealer)}
                          title="Chỉnh sửa"
                          className="hover:bg-amber-100 dark:hover:bg-amber-900 transition-all duration-300"
                        >
                          <Pencil className="h-4 w-4 text-amber-600" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Create Dialog */}
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto backdrop-blur-xl bg-white/95 dark:bg-gray-900/95 border-2 border-white/30 shadow-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  Tạo đại lý mới tại TP. Hồ Chí Minh
                </DialogTitle>
                <DialogDescription>
                  Điền đầy đủ thông tin đại lý (Mặc định: Sài Gòn)
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label className="text-sm font-semibold text-blue-700 dark:text-blue-300 flex items-center gap-2">
                    <Store className="h-4 w-4" />
                    Tên đại lý *
                  </Label>
                  <Input
                    placeholder="VD: Đại lý VinFast Quận 1"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-2 bg-gradient-to-r from-blue-50/50 to-cyan-50/50 dark:from-blue-950/50 dark:to-cyan-950/50 border-blue-200 dark:border-blue-800 focus:border-blue-400 dark:focus:border-blue-600 transition-all duration-300"
                  />
                </div>
                
                <div className="col-span-2 backdrop-blur-sm bg-cyan-500/5 p-4 rounded-xl border border-cyan-300/30">
                  <Label className="text-sm font-semibold text-cyan-700 dark:text-cyan-300 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Địa chỉ (TP. Hồ Chí Minh) *
                  </Label>
                  <Select
                    value={formData.address}
                    onValueChange={(value) => setFormData({ ...formData, address: value })}
                  >
                    <SelectTrigger className="mt-2 bg-white/70 dark:bg-gray-900/70 border-cyan-200 dark:border-cyan-800">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="backdrop-blur-xl bg-white/95 dark:bg-gray-900/95">
                      {saigonDistricts.map((district) => (
                        <SelectItem key={district} value={district} className="hover:bg-cyan-100 dark:hover:bg-cyan-900">
                          {district}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-cyan-600 dark:text-cyan-400 mt-2 flex items-center gap-1">
                    💡 Hoặc nhập địa chỉ chi tiết (số nhà, đường):
                  </p>
                  <Input
                    placeholder="VD: 123 Nguyễn Huệ"
                    value={formData.address.includes(',') ? formData.address.split(',')[0] : ''}
                    onChange={(e) => {
                      const district = formData.address.includes(',') 
                        ? formData.address.split(',').slice(1).join(',')
                        : 'Quận 1, TP. Hồ Chí Minh';
                      setFormData({ ...formData, address: `${e.target.value}, ${district}` });
                    }}
                    className="mt-2 bg-white/70 dark:bg-gray-900/70 border-cyan-200 dark:border-cyan-800"
                  />
                </div>

                <div className="backdrop-blur-sm bg-teal-500/5 p-3 rounded-xl border border-teal-300/30">
                  <Label className="text-sm font-semibold text-teal-700 dark:text-teal-300 flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Điện thoại *
                  </Label>
                  <Input
                    placeholder="VD: 0912345678"
                    value={formData.phone}
                    onChange={(e) => {
                      let value = e.target.value.replace(/\D/g, ''); // Chỉ giữ số
                      
                      // Ngăn chặn nhiều số 0 liên tiếp ở đầu (chỉ cho phép 1 số 0)
                      if (value.startsWith('00')) {
                        value = value.replace(/^0+/, '0'); // Thay thế nhiều số 0 thành 1 số 0
                      }
                      
                      // Nếu chưa có số 0 ở đầu và có số khác, tự động thêm
                      if (value.length > 0 && !value.startsWith('0')) {
                        value = '0' + value;
                      }
                      
                      // Giới hạn tối đa 10 số
                      if (value.length > 10) {
                        value = value.slice(0, 10);
                      }
                      
                      setFormData({ ...formData, phone: value });
                    }}
                    onFocus={(e) => {
                      // Khi focus vào ô input, nếu rỗng thì tự động thêm số 0
                      if (!e.target.value) {
                        setFormData({ ...formData, phone: '0' });
                      }
                    }}
                    onKeyPress={(e) => {
                      if (!/[0-9]/.test(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    maxLength={10}
                    className="mt-2 bg-white/70 dark:bg-gray-900/70 border-teal-200 dark:border-teal-800 focus:border-teal-400"
                  />
                  <p className="text-xs text-teal-600 dark:text-teal-400 mt-1">
                    💡 Bắt đầu bằng 1 số 0, tối đa 10 chữ số
                  </p>
                </div>
                
                <div className="backdrop-blur-sm bg-blue-500/5 p-3 rounded-xl border border-blue-300/30">
                  <Label className="text-sm font-semibold text-blue-700 dark:text-blue-300 flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email *
                  </Label>
                  <Input
                    type="email"
                    placeholder="VD: saigon@vinfast.vn"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="mt-2 bg-white/70 dark:bg-gray-900/70 border-blue-200 dark:border-blue-800 focus:border-blue-400"
                  />
                </div>

                <div className="backdrop-blur-sm bg-purple-500/5 p-3 rounded-xl border border-purple-300/30">
                  <Label className="text-sm font-semibold text-purple-700 dark:text-purple-300 flex items-center gap-2">
                    <span className="text-lg">🏢</span>
                    Mã số thuế *
                  </Label>
                  <Input
                    placeholder="VD: 0123456789"
                    value={formData.taxcode}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      setFormData({ ...formData, taxcode: value });
                    }}
                    onKeyPress={(e) => {
                      if (!/[0-9]/.test(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    className="mt-2 bg-white/70 dark:bg-gray-900/70 border-purple-200 dark:border-purple-800 focus:border-purple-400"
                  />
                </div>

                <div className="col-span-2 backdrop-blur-sm bg-gradient-to-r from-indigo-500/10 to-purple-500/10 p-4 rounded-xl border border-indigo-300/30">
                  <Label className="text-sm font-semibold text-indigo-700 dark:text-indigo-300 flex items-center gap-2">
                    <span className="text-lg">👤</span>
                    Chọn Dealer Manager (Tùy chọn)
                  </Label>
                  <Select
                    value={formData.userId?.toString()}
                    onValueChange={(value) => setFormData({ 
                      ...formData, 
                      userId: value ? Number(value) : undefined 
                    })}
                    disabled={loadingManagers || availableManagers.length === 0}
                  >
                    <SelectTrigger className="flex-1 mt-2 bg-white/70 dark:bg-gray-900/70 border-indigo-200 dark:border-indigo-800">
                      <SelectValue placeholder={
                        loadingManagers 
                          ? "Đang tải..." 
                          : availableManagers.length > 0 
                            ? "-- Chọn Dealer Manager --" 
                            : "Không có Dealer Manager khả dụng"
                      } />
                    </SelectTrigger>
                    <SelectContent className="backdrop-blur-xl bg-white/95 dark:bg-gray-900/95">
                      {availableManagers.map((manager) => (
                        <SelectItem key={manager.id} value={manager.id.toString()} className="hover:bg-indigo-100 dark:hover:bg-indigo-900">
                          {manager.name} ({manager.email}) - {manager.phone}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter className="gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setIsCreateOpen(false)}
                  className="border-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300"
                >
                  Hủy
                </Button>
                <Button 
                  onClick={handleCreate}
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  ✨ Tạo đại lý
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Edit Dialog */}
          <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto backdrop-blur-xl bg-white/95 dark:bg-gray-900/95 border-2 border-white/30 shadow-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                  Chỉnh sửa đại lý
                </DialogTitle>
                <DialogDescription>
                  Cập nhật thông tin đại lý {selectedDealer?.name}
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label className="text-sm font-semibold text-amber-700 dark:text-amber-300 flex items-center gap-2">
                    <Store className="h-4 w-4" />
                    Tên đại lý *
                  </Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-2 bg-gradient-to-r from-amber-50/50 to-orange-50/50 dark:from-amber-950/50 dark:to-orange-950/50 border-amber-200 dark:border-amber-800 focus:border-amber-400 dark:focus:border-amber-600 transition-all duration-300"
                  />
                </div>
                
                <div className="col-span-2 backdrop-blur-sm bg-orange-500/5 p-4 rounded-xl border border-orange-300/30">
                  <Label className="text-sm font-semibold text-orange-700 dark:text-orange-300 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Địa chỉ (TP. Hồ Chí Minh) *
                  </Label>
                  <Input
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="mt-2 bg-white/70 dark:bg-gray-900/70 border-orange-200 dark:border-orange-800 focus:border-orange-400"
                  />
                </div>

                <div className="backdrop-blur-sm bg-teal-500/5 p-3 rounded-xl border border-teal-300/30">
                  <Label className="text-sm font-semibold text-teal-700 dark:text-teal-300 flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Điện thoại *
                  </Label>
                  <Input
                    placeholder="VD: 0912345678"
                    value={formData.phone}
                    onChange={(e) => {
                      let value = e.target.value.replace(/\D/g, ''); // Chỉ giữ số
                      
                      // Ngăn chặn nhiều số 0 liên tiếp ở đầu (chỉ cho phép 1 số 0)
                      if (value.startsWith('00')) {
                        value = value.replace(/^0+/, '0'); // Thay thế nhiều số 0 thành 1 số 0
                      }
                      
                      // Nếu chưa có số 0 ở đầu và có số khác, tự động thêm
                      if (value.length > 0 && !value.startsWith('0')) {
                        value = '0' + value;
                      }
                      
                      // Giới hạn tối đa 10 số
                      if (value.length > 10) {
                        value = value.slice(0, 10);
                      }
                      
                      setFormData({ ...formData, phone: value });
                    }}
                    onFocus={(e) => {
                      // Khi focus vào ô input, nếu rỗng thì tự động thêm số 0
                      if (!e.target.value) {
                        setFormData({ ...formData, phone: '0' });
                      }
                    }}
                    onKeyPress={(e) => {
                      if (!/[0-9]/.test(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    maxLength={10}
                    className="mt-2 bg-white/70 dark:bg-gray-900/70 border-teal-200 dark:border-teal-800 focus:border-teal-400"
                  />
                  <p className="text-xs text-teal-600 dark:text-teal-400 mt-1">
                    💡 Bắt đầu bằng 1 số 0, tối đa 10 chữ số
                  </p>
                </div>
                
                <div className="backdrop-blur-sm bg-blue-500/5 p-3 rounded-xl border border-blue-300/30">
                  <Label className="text-sm font-semibold text-blue-700 dark:text-blue-300 flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email *
                  </Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="mt-2 bg-white/70 dark:bg-gray-900/70 border-blue-200 dark:border-blue-800 focus:border-blue-400"
                  />
                </div>

                <div className="backdrop-blur-sm bg-purple-500/5 p-3 rounded-xl border border-purple-300/30">
                  <Label className="text-sm font-semibold text-purple-700 dark:text-purple-300 flex items-center gap-2">
                    <span className="text-lg">🏢</span>
                    Mã số thuế *
                  </Label>
                  <Input
                    value={formData.taxcode}
                    onChange={(e) => setFormData({ ...formData, taxcode: e.target.value })}
                    className="mt-2 bg-white/70 dark:bg-gray-900/70 border-purple-200 dark:border-purple-800 focus:border-purple-400"
                  />
                </div>
              </div>
              <DialogFooter className="gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditOpen(false)}
                  className="border-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300"
                >
                  Hủy
                </Button>
                <Button 
                  onClick={handleEdit}
                  className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  ✏️ Cập nhật
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Delete Dialog */}
          <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
            <DialogContent className="backdrop-blur-xl bg-white/95 dark:bg-gray-900/95 border-2 border-red-300/30 shadow-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">
                  Xác nhận vô hiệu hóa
                </DialogTitle>
                <DialogDescription>
                  Bạn có chắc muốn vô hiệu hóa đại lý <strong>{selectedDealer?.name}</strong>?
                  <br />
                  <span className="text-amber-600">Đại lý sẽ chuyển sang trạng thái không hoạt động và có thể kích hoạt lại sau.</span>
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
                  Hủy
                </Button>
                <Button variant="destructive" onClick={handleDelete}>
                  Vô hiệu hóa
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* View Dialog */}
          <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
            <DialogContent className="max-w-2xl backdrop-blur-xl bg-white/95 dark:bg-gray-900/95 border-2 border-white/30 shadow-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  Chi tiết đại lý
                </DialogTitle>
              </DialogHeader>
              {selectedDealer && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="backdrop-blur-sm bg-blue-500/10 p-4 rounded-xl border border-blue-300/30">
                      <Label className="text-muted-foreground">ID</Label>
                      <p className="font-semibold text-lg">{selectedDealer.id}</p>
                    </div>
                    <div className="backdrop-blur-sm bg-green-500/10 p-4 rounded-xl border border-green-300/30">
                      <Label className="text-muted-foreground">Trạng thái</Label>
                      <div className="mt-1">
                        <Badge className={`${statusColors[selectedDealer.status]} shadow-lg`}>
                          {statusLabels[selectedDealer.status]}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="backdrop-blur-sm bg-gradient-to-r from-blue-500/10 to-cyan-500/10 p-4 rounded-xl border border-blue-300/30">
                    <Label className="text-muted-foreground flex items-center gap-2">
                      <Store className="h-4 w-4" />
                      Tên đại lý
                    </Label>
                    <p className="font-semibold text-lg">{selectedDealer.name}</p>
                  </div>

                  <div className="backdrop-blur-sm bg-cyan-500/10 p-4 rounded-xl border border-cyan-300/30">
                    <Label className="text-muted-foreground flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Địa chỉ
                    </Label>
                    <p className="font-medium">{selectedDealer.address}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="backdrop-blur-sm bg-teal-500/10 p-4 rounded-xl border border-teal-300/30">
                      <Label className="text-muted-foreground flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        Điện thoại
                      </Label>
                      <p className="font-medium">{selectedDealer.phone}</p>
                    </div>
                    <div className="backdrop-blur-sm bg-blue-500/10 p-4 rounded-xl border border-blue-300/30">
                      <Label className="text-muted-foreground flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Email
                      </Label>
                      <p className="font-medium">{selectedDealer.email}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="backdrop-blur-sm bg-purple-500/10 p-4 rounded-xl border border-purple-300/30">
                      <Label className="text-muted-foreground">Mã số thuế</Label>
                      <p className="font-mono font-medium">{selectedDealer.taxcode}</p>
                    </div>
                    <div className="backdrop-blur-sm bg-indigo-500/10 p-4 rounded-xl border border-indigo-300/30">
                      <Label className="text-muted-foreground">Ngày tạo</Label>
                      <p className="font-medium">
                        {new Date(selectedDealer.creationDate).toLocaleDateString('vi-VN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button onClick={() => setIsViewOpen(false)} className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700">
                  Đóng
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}
