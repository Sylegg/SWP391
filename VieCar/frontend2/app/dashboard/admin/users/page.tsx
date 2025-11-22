'use client';

import { ProtectedRoute } from "@/components/auth-guards";
import AdminLayout from "@/components/layout/admin-layout";
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { getAllUsers, updateUser, deleteUser, UserRes } from '@/lib/userApi';
import { getAllRoles, RoleDto } from '@/lib/roleApi';
import { getAllDealers, DealerRes } from '@/lib/dealerApi';
import api from '@/lib/api';
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
  User,
  Mail,
  Phone,
  Shield,
  RefreshCw,
  UserCheck,
  UserX
} from 'lucide-react';

// Role types
type RoleName = 'ADMIN' | 'DEALER_MANAGER' | 'DEALER_STAFF' | 'EVM_STAFF' | 'CUSTOMER' | 'Dealer Manager' | 'Dealer Staff' | 'Admin' | 'EVM Staff' | 'Customer';

interface CreateUserReq {
  username: string;
  password: string;
  email: string;
  phone?: string;
  roleName: RoleName;
  address?: string;
}

interface UpdateUserReq {
  username?: string;
  email?: string;
  phone?: string;
  roleName?: RoleName;
  status?: 'ACTIVE' | 'INACTIVE';
  emailVerified?: boolean;
  address?: string;
  dealerId?: number;
}

// Role labels in Vietnamese
const roleLabels: Record<string, string> = {
  ADMIN: 'Quản trị viên',
  Admin: 'Quản trị viên',
  'Manage the entire system': 'Quản trị viên',
  DEALER_MANAGER: 'Nhân viên đại lý',
  'Dealer Manager': 'Nhân viên đại lý',
  'Manage the dealer': 'Nhân viên đại lý',
  DEALER_STAFF: 'Nhân viên đại lý',
  'Dealer Staff': 'Nhân viên đại lý',
  EVM_STAFF: 'Nhân viên hãng',
  'EVM Staff': 'Nhân viên hãng',
  'Nhân viên hãng': 'Nhân viên hãng',
  CUSTOMER: 'Khách hàng',
  Customer: 'Khách hàng',
  'Customer is king': 'Khách hàng',
};

// Role colors
const roleColors: Record<string, string> = {
  ADMIN: 'bg-gradient-to-r from-purple-600 to-pink-600',
  Admin: 'bg-gradient-to-r from-purple-600 to-pink-600',
  'Manage the entire system': 'bg-gradient-to-r from-purple-600 to-pink-600',
  DEALER_MANAGER: 'bg-gradient-to-r from-blue-600 to-cyan-600',
  'Dealer Manager': 'bg-gradient-to-r from-blue-600 to-cyan-600',
  'Manage the dealer': 'bg-gradient-to-r from-blue-600 to-cyan-600',
  DEALER_STAFF: 'bg-gradient-to-r from-green-600 to-teal-600',
  'Dealer Staff': 'bg-gradient-to-r from-green-600 to-teal-600',
  EVM_STAFF: 'bg-gradient-to-r from-amber-600 to-orange-600',
  'EVM Staff': 'bg-gradient-to-r from-amber-600 to-orange-600',
  'Nhân viên hãng': 'bg-gradient-to-r from-amber-600 to-orange-600',
  CUSTOMER: 'bg-gradient-to-r from-gray-600 to-slate-600',
  Customer: 'bg-gradient-to-r from-gray-600 to-slate-600',
  'Customer is king': 'bg-gradient-to-r from-gray-600 to-slate-600',
};

// Status colors
const statusColors = {
  ACTIVE: 'bg-green-500',
  INACTIVE: 'bg-gray-500',
};

const statusLabels = {
  ACTIVE: 'Hoạt động',
  INACTIVE: 'Ngừng hoạt động',
};

export default function AdminUsersPage() {
  const { toast } = useToast();
  
  // State
  const [users, setUsers] = useState<UserRes[]>([]);
  const [roles, setRoles] = useState<RoleDto[]>([]);
  const [dealers, setDealers] = useState<DealerRes[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [loadingDealers, setLoadingDealers] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  
  // Dialog states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserRes | null>(null);
  
  // Form state
  const [createFormData, setCreateFormData] = useState<CreateUserReq>({
    username: '',
    password: '',
    email: '',
    phone: '',
    roleName: 'DEALER_MANAGER',
    address: '',
  });

  const [editFormData, setEditFormData] = useState<UpdateUserReq>({
    username: '',
    email: '',
    phone: '',
    roleName: 'DEALER_MANAGER',
    status: 'ACTIVE',
  });

  // Load users
  useEffect(() => {
    loadUsers();
    loadRoles();
    loadDealers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await getAllUsers();
      setUsers(data);
      toast({
        title: '✅ Tải thành công',
        description: `Đã tải ${data.length} người dùng`,
        duration: 3000,
      });
    } catch (error: any) {
      toast({
        title: '❌ Lỗi tải dữ liệu',
        description: error.response?.data?.message || 'Không thể tải danh sách người dùng',
        variant: 'destructive',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const loadRoles = async () => {
    try {
      setLoadingRoles(true);
      const data = await getAllRoles();
      setRoles(data);
      console.log('✅ Loaded roles:', data);
    } catch (error: any) {
      console.error('❌ Error loading roles:', error);
      toast({
        title: '⚠️ Không thể tải danh sách vai trò',
        description: 'Sử dụng danh sách vai trò mặc định',
        variant: 'default',
      });
    } finally {
      setLoadingRoles(false);
    }
  };

  const loadDealers = async () => {
    try {
      setLoadingDealers(true);
      const data = await getAllDealers();
      setDealers(data);
      console.log('✅ Loaded dealers:', data);
    } catch (error: any) {
      console.error('❌ Error loading dealers:', error);
      toast({
        title: '⚠️ Không thể tải danh sách đại lý',
        description: 'Vui lòng thử lại sau',
        variant: 'default',
      });
    } finally {
      setLoadingDealers(false);
    }
  };

  // Filter and search
  const filteredUsers = users.filter(user => {
    const userRole = typeof user.role === 'string' ? user.role : user.role?.name || user.roleName || '';
    const matchRole = filterRole === 'all' || userRole === filterRole;
    const matchSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       (user.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchRole && matchSearch;
  });

  // Helper function to get role name
  const getUserRoleName = (user: UserRes): string => {
    if (typeof user.role === 'string') {
      return user.role;
    } else if (user.role?.name) {
      return user.role.name;
    } else if (user.roleName) {
      return user.roleName;
    }
    return 'CUSTOMER';
  };

  // Helper function to get role label
  const getRoleLabel = (roleName: string): string => {
    return roleLabels[roleName] || roleName;
  };

  // Reset create form
  const resetCreateForm = () => {
    setCreateFormData({
      username: '',
      password: '',
      email: '',
      phone: '',
      roleName: 'DEALER_MANAGER',
      address: '',
    });
  };

  // Create user - Sử dụng API register
  const handleCreate = async () => {
    // Validation
    if (!createFormData.username || !createFormData.password || !createFormData.email || !createFormData.phone) {
      toast({
        title: '⚠️ Thiếu thông tin',
        description: 'Vui lòng điền đầy đủ username, password, email và số điện thoại',
        variant: 'destructive',
        duration: 3000,
      });
      return;
    }

    // Validate email must contain @gmail.com
    if (!createFormData.email.includes('@gmail.com')) {
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
    if (!phoneRegex.test(createFormData.phone)) {
      toast({
        title: '⚠️ Số điện thoại không hợp lệ',
        description: 'Số điện thoại phải bắt đầu bằng số 0 và có đúng 10 chữ số',
        variant: 'destructive',
        duration: 3000,
      });
      return;
    }

    try {
      // Gọi API register giống trang đăng ký
      await api.post('/auth/register', {
        username: createFormData.username,
        password: createFormData.password,
        confirmPassword: createFormData.password, // Thêm confirmPassword
        email: createFormData.email,
        phone: createFormData.phone || '',
        address: createFormData.address || '',
        roleName: createFormData.roleName,
        emailVerified: true, // Admin tạo user thì tự động verify email
      });
      
      toast({
        title: '✅ Tạo thành công',
        description: `Đã tạo tài khoản ${createFormData.username} với vai trò ${roleLabels[createFormData.roleName]}`,
        duration: 3000,
      });
      setIsCreateOpen(false);
      resetCreateForm();
      loadUsers();
    } catch (error: any) {
      const errorMessage = typeof error.response?.data === 'string' 
        ? error.response.data 
        : error.response?.data?.message || error.message || 'Không thể tạo người dùng';
      
      toast({
        title: '❌ Lỗi tạo người dùng',
        description: errorMessage,
        variant: 'destructive',
        duration: 3000,
      });
    }
  };

  // Edit user
  const openEditDialog = (user: UserRes) => {
    setSelectedUser(user);
    const userRole = typeof user.role === 'string' ? user.role : user.role?.name || user.roleName || 'CUSTOMER';
    
    console.log('🔍 Opening edit dialog for user:', {
      username: user.username,
      role: userRole,
      dealerId: user.dealerId,
      dealerName: user.dealerName
    });
    
    setEditFormData({
      username: user.username,
      email: user.email || '',
      phone: user.phone || '',
      roleName: userRole as RoleName,
      status: user.status as 'ACTIVE' | 'INACTIVE',
      address: user.address || '',
      dealerId: user.dealerId || undefined, // Ensure undefined instead of null
      emailVerified: user.emailVerified || false,
    });
    setIsEditOpen(true);
  };

  const handleEdit = async () => {
    if (!selectedUser) return;

    if (!editFormData.username || !editFormData.email || !editFormData.phone) {
      toast({
        title: '⚠️ Thiếu thông tin',
        description: 'Vui lòng điền đầy đủ username, email và số điện thoại',
        variant: 'destructive',
        duration: 3000,
      });
      return;
    }

    // Validate email must contain @gmail.com
    if (!editFormData.email.includes('@gmail.com')) {
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
    if (editFormData.phone && !phoneRegex.test(editFormData.phone)) {
      toast({
        title: '⚠️ Số điện thoại không hợp lệ',
        description: 'Số điện thoại phải bắt đầu bằng số 0 và có đúng 10 chữ số',
        variant: 'destructive',
        duration: 3000,
      });
      return;
    }

    // Validate dealerId for DEALER_STAFF role (required)
    // DEALER_MANAGER can optionally have no dealer
    if (editFormData.roleName === 'DEALER_STAFF' || editFormData.roleName === 'Dealer Staff') {
      if (!editFormData.dealerId) {
        toast({
          title: '⚠️ Thiếu thông tin',
          description: 'Nhân viên đại lý phải thuộc về một đại lý cụ thể',
          variant: 'destructive',
          duration: 3000,
        });
        return;
      }
    }

    try {
      console.log('📤 Updating user with data:', editFormData);
      await updateUser(selectedUser.id, editFormData);
      toast({
        title: '✅ Cập nhật thành công',
        description: `Đã cập nhật người dùng ${editFormData.username}`,
        duration: 3000,
      });
      setIsEditOpen(false);
      setSelectedUser(null);
      loadUsers();
    } catch (error: any) {
      const errorMessage = typeof error.response?.data === 'string' 
        ? error.response.data 
        : error.response?.data?.message || error.message || 'Không thể cập nhật người dùng';
      
      toast({
        title: '❌ Lỗi cập nhật',
        description: errorMessage,
        variant: 'destructive',
        duration: 3000,
      });
    }
  };

  // Delete user
  const openDeleteDialog = (user: UserRes) => {
    setSelectedUser(user);
    setIsDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedUser) return;

    try {
      await deleteUser(selectedUser.id);
      toast({
        title: '✅ Xóa thành công',
        description: `Đã xóa người dùng ${selectedUser.username}`,
        duration: 3000,
      });
      setIsDeleteOpen(false);
      setSelectedUser(null);
      loadUsers();
    } catch (error: any) {
      const errorMessage = typeof error.response?.data === 'string' 
        ? error.response.data 
        : error.response?.data?.message || error.message || 'Không thể xóa người dùng';
      
      toast({
        title: '❌ Lỗi xóa',
        description: errorMessage,
        variant: 'destructive',
        duration: 3000,
      });
    }
  };

  // View user
  const openViewDialog = (user: UserRes) => {
    setSelectedUser(user);
    setIsViewOpen(true);
  };

  return (
    <ProtectedRoute allowedRoles={['Admin']}>
      <AdminLayout>
        <div className="p-8 space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Quản lý người dùng
              </h1>
              <p className="text-muted-foreground mt-1">
                Quản lý tài khoản Dealer Manager, EVM Staff và các vai trò khác
              </p>
            </div>
            <Button 
              onClick={() => setIsCreateOpen(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Tạo người dùng
            </Button>
          </div>

          {/* Search and Filter */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm theo username hoặc email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Lọc theo vai trò" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả vai trò</SelectItem>
                {roles.length > 0 ? (
                  roles.map((role) => (
                    <SelectItem key={role.id} value={role.name}>
                      {role.description || roleLabels[role.name as RoleName] || role.name}
                    </SelectItem>
                  ))
                ) : (
                  <>
                    <SelectItem key="DEALER_MANAGER" value="DEALER_MANAGER">Quản lý đại lý</SelectItem>
                    <SelectItem key="EVM_STAFF" value="EVM_STAFF">Nhân viên hãng</SelectItem>
                    <SelectItem key="DEALER_STAFF" value="DEALER_STAFF">Nhân viên đại lý</SelectItem>
                    <SelectItem key="CUSTOMER" value="CUSTOMER">Khách hàng</SelectItem>
                    <SelectItem key="ADMIN" value="ADMIN">Quản trị viên</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              onClick={loadUsers}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>

          {/* Table */}
          <div className="backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 rounded-xl shadow-2xl border border-white/20 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-purple-500/10 to-pink-500/10">
                  <TableHead>ID</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Số điện thoại</TableHead>
                  <TableHead>Vai trò</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Email Verified</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                      <p className="mt-2 text-muted-foreground">Đang tải...</p>
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      Không tìm thấy người dùng
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow 
                      key={user.id} 
                      className="hover:bg-gradient-to-r hover:from-purple-500/5 hover:to-pink-500/5 transition-all duration-200"
                    >
                      <TableCell className="font-mono text-sm">{user.id}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{user.username}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{user.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{user.phone || '-'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {(() => {
                          const userRole = getUserRoleName(user);
                          const roleLabel = getRoleLabel(userRole);
                          const roleColor = roleColors[userRole] || 'bg-gradient-to-r from-gray-600 to-slate-600';
                          
                          return (
                            <Badge className={`${roleColor} text-white shadow-lg`}>
                              {roleLabel}
                            </Badge>
                          );
                        })()}
                      </TableCell>
                      <TableCell>
                        <Badge className={`${statusColors[user.status as 'ACTIVE' | 'INACTIVE']} text-white shadow-md`}>
                          {user.status === 'ACTIVE' ? (
                            <><UserCheck className="h-3 w-3 mr-1" /> {statusLabels.ACTIVE}</>
                          ) : (
                            <><UserX className="h-3 w-3 mr-1" /> {statusLabels.INACTIVE}</>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={user.emailVerified ? 'bg-green-500 text-white' : 'bg-gray-400 text-white'}>
                          {user.emailVerified ? '✓ Đã xác thực' : '✗ Chưa xác thực'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openViewDialog(user)}
                            className="hover:bg-blue-500/10 hover:text-blue-600"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(user)}
                            className="hover:bg-amber-500/10 hover:text-amber-600"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Create Dialog */}
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogContent className="max-w-2xl backdrop-blur-xl bg-white/95 dark:bg-gray-900/95 border-2 border-white/30 shadow-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Tạo người dùng mới
                </DialogTitle>
                <DialogDescription>
                  Tạo tài khoản cho Dealer Manager, EVM Staff hoặc vai trò khác
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username *</Label>
                    <Input
                      id="username"
                      placeholder="Nhập username"
                      value={createFormData.username}
                      onChange={(e) => setCreateFormData({ ...createFormData, username: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password *</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Nhập password"
                      value={createFormData.password}
                      onChange={(e) => setCreateFormData({ ...createFormData, password: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Nhập email"
                      value={createFormData.email}
                      onChange={(e) => setCreateFormData({ ...createFormData, email: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground">Email phải có định dạng @gmail.com</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Số điện thoại *</Label>
                    <Input
                      id="phone"
                      placeholder="Nhập số điện thoại"
                      value={createFormData.phone}
                      onChange={(e) => {
                        const value = e.target.value;
                        // Only allow digits
                        if (/^\d*$/.test(value)) {
                          setCreateFormData({ ...createFormData, phone: value });
                        }
                      }}
                      maxLength={10}
                    />
                    <p className="text-xs text-muted-foreground">VD: 0912345678 (Bắt đầu bằng 0, đúng 10 số)</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Vai trò *</Label>
                  <Select 
                    value={createFormData.roleName} 
                    onValueChange={(value) => setCreateFormData({ ...createFormData, roleName: value as RoleName })}
                    disabled={loadingRoles}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={loadingRoles ? "Đang tải..." : "Chọn vai trò"} />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.length > 0 ? (
                        roles.map((role) => (
                          <SelectItem key={role.id} value={role.name}>
                            {role.name}
                          </SelectItem>
                        ))
                      ) : (
                        <>
                          <SelectItem key="ADMIN" value="ADMIN">ADMIN</SelectItem>
                          <SelectItem key="DEALER_MANAGER" value="DEALER_MANAGER">DEALER_MANAGER</SelectItem>
                          <SelectItem key="EVM_STAFF" value="EVM_STAFF">EVM_STAFF</SelectItem>
                          <SelectItem key="DEALER_STAFF" value="DEALER_STAFF">DEALER_STAFF</SelectItem>
                          <SelectItem key="CUSTOMER" value="CUSTOMER">CUSTOMER</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Địa chỉ</Label>
                  <Input
                    id="address"
                    placeholder="Nhập địa chỉ (tùy chọn)"
                    value={createFormData.address}
                    onChange={(e) => setCreateFormData({ ...createFormData, address: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Hủy
                </Button>
                <Button 
                  onClick={handleCreate}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  ✨ Tạo tài khoản
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Edit Dialog */}
          <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
            <DialogContent className="max-w-2xl backdrop-blur-xl bg-white/95 dark:bg-gray-900/95 border-2 border-white/30 shadow-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                  Cập nhật người dùng
                </DialogTitle>
                <DialogDescription>
                  Chỉnh sửa thông tin người dùng {selectedUser?.username}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-username">Username *</Label>
                    <Input
                      id="edit-username"
                      value={editFormData.username}
                      onChange={(e) => setEditFormData({ ...editFormData, username: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-email">Email *</Label>
                    <Input
                      id="edit-email"
                      type="email"
                      value={editFormData.email}
                      onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground">Email phải có định dạng @gmail.com</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-phone">Số điện thoại *</Label>
                  <Input
                    id="edit-phone"
                    placeholder="Nhập số điện thoại"
                    value={editFormData.phone}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Only allow digits
                      if (/^\d*$/.test(value)) {
                        setEditFormData({ ...editFormData, phone: value });
                      }
                    }}
                    maxLength={10}
                  />
                  <p className="text-xs text-muted-foreground">VD: 0912345678 (Bắt đầu bằng 0, đúng 10 số)</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-address">Địa chỉ</Label>
                  <Input
                    id="edit-address"
                    placeholder="Nhập địa chỉ"
                    value={editFormData.address}
                    onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-role">Vai trò *</Label>
                    <Select 
                      value={editFormData.roleName} 
                      onValueChange={(value) => {
                        const newRole = value as RoleName;
                        // Reset dealerId if not dealer-related role
                        if (newRole !== 'DEALER_MANAGER' && newRole !== 'DEALER_STAFF' && 
                            newRole !== 'Dealer Manager' && newRole !== 'Dealer Staff') {
                          setEditFormData({ ...editFormData, roleName: newRole, dealerId: undefined });
                        } else {
                          setEditFormData({ ...editFormData, roleName: newRole });
                        }
                      }}
                      disabled={loadingRoles}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={loadingRoles ? "Đang tải..." : "Chọn vai trò"} />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.length > 0 ? (
                          roles.map((role) => (
                            <SelectItem key={role.id} value={role.name}>
                              {role.name}
                            </SelectItem>
                          ))
                        ) : (
                          <>
                            <SelectItem key="ADMIN" value="ADMIN">ADMIN</SelectItem>
                            <SelectItem key="DEALER_MANAGER" value="DEALER_MANAGER">DEALER_MANAGER</SelectItem>
                            <SelectItem key="EVM_STAFF" value="EVM_STAFF">EVM_STAFF</SelectItem>
                            <SelectItem key="DEALER_STAFF" value="DEALER_STAFF">DEALER_STAFF</SelectItem>
                            <SelectItem key="CUSTOMER" value="CUSTOMER">CUSTOMER</SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-status">Trạng thái *</Label>
                    <Select 
                      value={editFormData.status} 
                      onValueChange={(value) => setEditFormData({ ...editFormData, status: value as 'ACTIVE' | 'INACTIVE' })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ACTIVE">Hoạt động</SelectItem>
                        <SelectItem value="INACTIVE">Ngừng hoạt động</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-email-verified">Xác thực email</Label>
                    <Select 
                      value={String(editFormData.emailVerified ?? false)}
                      onValueChange={(value) => setEditFormData({ ...editFormData, emailVerified: value === 'true' })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem key="verified-true" value="true">✓ Đã xác thực</SelectItem>
                        <SelectItem key="verified-false" value="false">✗ Chưa xác thực</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Dealer selection - only show for DEALER_MANAGER and DEALER_STAFF */}
                {(editFormData.roleName === 'DEALER_MANAGER' || 
                  editFormData.roleName === 'DEALER_STAFF' ||
                  editFormData.roleName === 'Dealer Manager' ||
                  editFormData.roleName === 'Dealer Staff') && (
                  <div className="space-y-2">
                    <Label htmlFor="edit-dealer">Đại lý *</Label>
                    <Select 
                      value={editFormData.dealerId?.toString() || 'none'} 
                      onValueChange={(value) => setEditFormData({ ...editFormData, dealerId: value === 'none' ? undefined : parseInt(value) })}
                      disabled={loadingDealers}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={loadingDealers ? "Đang tải..." : "Chọn đại lý"} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">-- Chọn đại lý --</SelectItem>
                        {dealers.length > 0 ? (
                          dealers.map((dealer) => (
                            <SelectItem key={dealer.id} value={dealer.id.toString()}>
                              {dealer.name} - {dealer.address}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="empty" disabled>
                            Không có đại lý nào
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditOpen(false)}>
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
                  Xác nhận xóa
                </DialogTitle>
                <DialogDescription>
                  Bạn có chắc muốn xóa người dùng <strong>{selectedUser?.username}</strong>?
                  <br />
                  <span className="text-red-500">Hành động này không thể hoàn tác.</span>
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
                  Hủy
                </Button>
                <Button variant="destructive" onClick={handleDelete}>
                  Xóa người dùng
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* View Dialog */}
          <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
            <DialogContent className="max-w-2xl backdrop-blur-xl bg-white/95 dark:bg-gray-900/95 border-2 border-white/30 shadow-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  Chi tiết người dùng
                </DialogTitle>
              </DialogHeader>
              {selectedUser && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="backdrop-blur-sm bg-blue-500/10 p-4 rounded-xl border border-blue-300/30">
                      <Label className="text-muted-foreground">ID</Label>
                      <p className="font-semibold text-lg">{selectedUser.id}</p>
                    </div>
                    <div className="backdrop-blur-sm bg-green-500/10 p-4 rounded-xl border border-green-300/30">
                      <Label className="text-muted-foreground">Trạng thái</Label>
                      <div className="mt-1">
                        <Badge className={`${statusColors[selectedUser.status as 'ACTIVE' | 'INACTIVE']} shadow-lg`}>
                          {selectedUser.status === 'ACTIVE' ? statusLabels.ACTIVE : statusLabels.INACTIVE}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="backdrop-blur-sm bg-gradient-to-r from-purple-500/10 to-pink-500/10 p-4 rounded-xl border border-purple-300/30">
                    <Label className="text-muted-foreground flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Username
                    </Label>
                    <p className="font-semibold text-lg">{selectedUser.username}</p>
                  </div>

                  <div className="backdrop-blur-sm bg-blue-500/10 p-4 rounded-xl border border-blue-300/30">
                    <Label className="text-muted-foreground flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                    </Label>
                    <p className="font-medium">{selectedUser.email}</p>
                    <div className="mt-2">
                      <Badge className={selectedUser.emailVerified ? 'bg-green-500 text-white' : 'bg-gray-400 text-white'}>
                        {selectedUser.emailVerified ? '✓ Email đã xác thực' : '✗ Email chưa xác thực'}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="backdrop-blur-sm bg-teal-500/10 p-4 rounded-xl border border-teal-300/30">
                      <Label className="text-muted-foreground flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        Số điện thoại
                      </Label>
                      <p className="font-medium">{selectedUser.phone || '-'}</p>
                    </div>
                    <div className="backdrop-blur-sm bg-purple-500/10 p-4 rounded-xl border border-purple-300/30">
                      <Label className="text-muted-foreground flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Vai trò
                      </Label>
                      <div className="mt-1">
                        {(() => {
                          const userRole = getUserRoleName(selectedUser);
                          const roleLabel = getRoleLabel(userRole);
                          const roleColor = roleColors[userRole] || 'bg-gradient-to-r from-gray-600 to-slate-600';
                          
                          return (
                            <Badge className={`${roleColor} text-white shadow-lg`}>
                              {roleLabel}
                            </Badge>
                          );
                        })()}
                      </div>
                    </div>
                  </div>

                  {selectedUser.dealerName && (
                    <div className="backdrop-blur-sm bg-indigo-500/10 p-4 rounded-xl border border-indigo-300/30">
                      <Label className="text-muted-foreground">Đại lý</Label>
                      <p className="font-medium">{selectedUser.dealerName}</p>
                      <p className="text-sm text-muted-foreground">{selectedUser.dealerAddress}</p>
                    </div>
                  )}
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
      </AdminLayout>
    </ProtectedRoute>
  );
}
