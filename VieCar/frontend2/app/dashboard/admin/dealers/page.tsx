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
      });
      setIsCreateOpen(false);
      resetForm();
      loadDealers();
      // Reload managers vì user đã chọn sẽ không còn available
      if (formData.userId) {
        loadAvailableManagers();
      }
    } catch (error: any) {
      toast({
        title: '❌ Lỗi tạo đại lý',
        description: error.response?.data?.message || 'Không thể tạo đại lý',
        variant: 'destructive',
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
      toast({
        title: '❌ Lỗi cập nhật',
        description: error.response?.data?.message || 'Không thể cập nhật đại lý',
        variant: 'destructive',
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
      await dealerApi.deleteDealer(selectedDealer.id);
      toast({
        title: '✅ Xóa thành công',
        description: `Đã xóa đại lý ${selectedDealer.name}`,
      });
      setIsDeleteOpen(false);
      setSelectedDealer(null);
      loadDealers();
    } catch (error: any) {
      toast({
        title: '❌ Lỗi xóa đại lý',
        description: error.response?.data?.message || 'Không thể xóa đại lý',
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
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Store className="h-8 w-8" />
                Quản lý Đại lý
              </h1>
              <p className="text-muted-foreground">
                Quản lý đại lý tại TP. Hồ Chí Minh 🏙️
              </p>
            </div>
            <Button onClick={() => { resetForm(); setIsCreateOpen(true); }}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Tạo đại lý mới
            </Button>
          </div>

          {/* Search */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm theo tên hoặc địa chỉ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10"
              />
            </div>
            <Button onClick={handleSearch} variant="outline">
              <Search className="h-4 w-4 mr-2" />
              Tìm kiếm
            </Button>
            <Button onClick={loadDealers} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Làm mới
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="border rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Tổng đại lý</p>
              <p className="text-2xl font-bold">{dealers.length}</p>
            </div>
            <div className="border rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Hoạt động</p>
              <p className="text-2xl font-bold text-green-600">
                {dealers.filter(d => d.status === DealerStatus.ACTIVE).length}
              </p>
            </div>
            <div className="border rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Ngừng hoạt động</p>
              <p className="text-2xl font-bold text-gray-600">
                {dealers.filter(d => d.status === DealerStatus.INACTIVE).length}
              </p>
            </div>
          </div>

          {/* Table */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px]">ID</TableHead>
                  <TableHead>Tên đại lý</TableHead>
                  <TableHead>Địa chỉ</TableHead>
                  <TableHead>Điện thoại</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Mã số thuế</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      Đang tải...
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
                    <TableRow key={dealer.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{dealer.id}</TableCell>
                      <TableCell className="font-semibold">{dealer.name}</TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          {dealer.address}
                        </div>
                      </TableCell>
                      <TableCell>{dealer.phone}</TableCell>
                      <TableCell>{dealer.email}</TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {dealer.taxcode}
                        </code>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[dealer.status]}>
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
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openEditDialog(dealer)}
                          title="Chỉnh sửa"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openDeleteDialog(dealer)}
                          title="Xóa"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
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
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Tạo đại lý mới tại TP. Hồ Chí Minh</DialogTitle>
                <DialogDescription>
                  Điền đầy đủ thông tin đại lý (Mặc định: Sài Gòn)
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label>Tên đại lý *</Label>
                  <Input
                    placeholder="VD: Đại lý VinFast Quận 1"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                
                <div className="col-span-2">
                  <Label>Địa chỉ (TP. Hồ Chí Minh) *</Label>
                  <Select
                    value={formData.address}
                    onValueChange={(value) => setFormData({ ...formData, address: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {saigonDistricts.map((district) => (
                        <SelectItem key={district} value={district}>
                          {district}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Hoặc nhập địa chỉ chi tiết (số nhà, đường):
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
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Điện thoại *</Label>
                  <Input
                    placeholder="VD: 0912345678"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                
                <div>
                  <Label>Email *</Label>
                  <Input
                    type="email"
                    placeholder="VD: saigon@vinfast.vn"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div>
                  <Label>Mã số thuế *</Label>
                  <Input
                    placeholder="VD: 0123456789"
                    value={formData.taxcode}
                    onChange={(e) => setFormData({ ...formData, taxcode: e.target.value })}
                  />
                </div>

                <div className="col-span-2">
                  <Label>Chọn Dealer Manager (Tùy chọn)</Label>
                  <div className="flex gap-2">
                    <Select
                      value={formData.userId?.toString()}
                      onValueChange={(value) => setFormData({ 
                        ...formData, 
                        userId: value ? Number(value) : undefined 
                      })}
                      disabled={loadingManagers || availableManagers.length === 0}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder={
                          loadingManagers 
                            ? "Đang tải..." 
                            : availableManagers.length > 0 
                              ? "-- Chọn Dealer Manager --" 
                              : "Không có Dealer Manager khả dụng"
                        } />
                      </SelectTrigger>
                      <SelectContent>
                        {availableManagers.map((manager) => (
                          <SelectItem key={manager.id} value={manager.id.toString()}>
                            {manager.name} ({manager.email}) - {manager.phone}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {formData.userId && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => setFormData({ ...formData, userId: undefined })}
                        title="Bỏ chọn"
                      >
                        ✕
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    💡 Chọn user có role "Dealer Manager" để gán cho đại lý này
                  </p>
                  {availableManagers.length === 0 && !loadingManagers && (
                    <p className="text-xs text-amber-600 mt-1">
                      ⚠️ Tất cả Dealer Manager đã được gán hoặc chưa có user nào với role này
                    </p>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Hủy
                </Button>
                <Button onClick={handleCreate}>Tạo đại lý</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Edit Dialog */}
          <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Chỉnh sửa đại lý</DialogTitle>
                <DialogDescription>
                  Cập nhật thông tin đại lý {selectedDealer?.name}
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label>Tên đại lý *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                
                <div className="col-span-2">
                  <Label>Địa chỉ (TP. Hồ Chí Minh) *</Label>
                  <Input
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>

                <div>
                  <Label>Điện thoại *</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                
                <div>
                  <Label>Email *</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div>
                  <Label>Mã số thuế *</Label>
                  <Input
                    value={formData.taxcode}
                    onChange={(e) => setFormData({ ...formData, taxcode: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditOpen(false)}>
                  Hủy
                </Button>
                <Button onClick={handleEdit}>Cập nhật</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Delete Dialog */}
          <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Xác nhận xóa</DialogTitle>
                <DialogDescription>
                  Bạn có chắc muốn xóa đại lý <strong>{selectedDealer?.name}</strong>?
                  <br />
                  <span className="text-red-500">Hành động này không thể hoàn tác.</span>
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
                  Hủy
                </Button>
                <Button variant="destructive" onClick={handleDelete}>
                  Xóa đại lý
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* View Dialog */}
          <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Chi tiết đại lý</DialogTitle>
              </DialogHeader>
              {selectedDealer && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">ID</Label>
                      <p className="font-semibold">{selectedDealer.id}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Trạng thái</Label>
                      <div className="mt-1">
                        <Badge className={statusColors[selectedDealer.status]}>
                          {statusLabels[selectedDealer.status]}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label className="text-muted-foreground flex items-center gap-2">
                      <Store className="h-4 w-4" />
                      Tên đại lý
                    </Label>
                    <p className="font-semibold text-lg">{selectedDealer.name}</p>
                  </div>

                  <div>
                    <Label className="text-muted-foreground flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Địa chỉ
                    </Label>
                    <p className="font-medium">{selectedDealer.address}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        Điện thoại
                      </Label>
                      <p className="font-medium">{selectedDealer.phone}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Email
                      </Label>
                      <p className="font-medium">{selectedDealer.email}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">Mã số thuế</Label>
                      <p className="font-mono font-medium">{selectedDealer.taxcode}</p>
                    </div>
                    <div>
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
                <Button onClick={() => setIsViewOpen(false)}>Đóng</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}
