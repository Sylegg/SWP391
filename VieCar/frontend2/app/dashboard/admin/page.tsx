"use client";

import { ProtectedRoute } from "@/components/auth-guards";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Car, ShoppingCart, Settings, BarChart, Shield, Calendar, CreditCard, FileText, Building, UserPlus, UserCheck, UserCog, Briefcase, Store, HeadphonesIcon, Search, Edit, Trash2, Lock, Unlock, X, Check, AlertCircle, ArrowLeft, LogOut, TrendingUp, DollarSign, Package, Activity, Bell, ChevronRight, Plus, Download, Filter, Eye, RefreshCw, Zap, Target, Award, MapPin, Phone, Mail, Globe } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { motion, AnimatePresence } from "framer-motion";
import { Progress } from "@/components/ui/progress";

interface AccountData {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  role: string;
  status: string;
  created?: string;
  dealerCode?: string;
  dealer?: string;
  orders?: number;
  position?: string;
  department?: string;
}

export default function AdminPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [activeRoleFilter, setActiveRoleFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAccount, setSelectedAccount] = useState<AccountData | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
    phone: '',
    address: '',
    role: '',
    dealerCode: '',
    department: ''
  });
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});

  // Validate form
  const validateForm = () => {
    const errors: {[key: string]: string} = {};
    
    if (!formData.role) errors.role = 'Vui lòng chọn vai trò';
    if (!formData.fullName.trim()) errors.fullName = 'Vui lòng nhập họ tên';
    
    // Email validation (phải match backend pattern)
    if (!formData.email.trim()) {
      errors.email = 'Vui lòng nhập email';
    } else if (!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,6}$/i.test(formData.email)) {
      errors.email = 'Email không hợp lệ (ví dụ: user@example.com)';
    }
    
    // Password validation
    if (!formData.password) {
      errors.password = 'Vui lòng nhập mật khẩu';
    } else if (formData.password.length < 6) {
      errors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }
    
    // Phone validation (optional nhưng nếu có phải đúng format VN)
    if (formData.phone && formData.phone.trim()) {
      const phonePattern = /^(?:(?:03|05|07|08|09)\d{8}|01(?:2|6|8|9)\d{8})$/;
      if (!phonePattern.test(formData.phone.trim())) {
        errors.phone = 'SĐT không hợp lệ (VD: 0912345678 hoặc 0123456789)';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle create account
  const handleCreateAccount = async () => {
    if (!validateForm()) {
      toast({
        title: "Lỗi xác thực",
        description: "Vui lòng kiểm tra lại thông tin đã nhập",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Call REAL API - POST /api/user/addUser
      const requestBody: any = {
        username: formData.fullName,
        email: formData.email,
        password: formData.password,
        roleName: formData.role, // Admin, DealerManager, DealerStaff, EVMStaff, Customer
        dealerId: 0, // Default dealer ID, có thể thay đổi nếu cần
      };

      // Chỉ gửi phone nếu có giá trị (backend validate pattern SĐT Việt Nam)
      if (formData.phone && formData.phone.trim()) {
        requestBody.phone = formData.phone.trim();
      }

      console.log('📤 Sending request to /api/user/addUser:', requestBody);

      const response = await fetch('http://localhost:6969/api/user/addUser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('📥 Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error response:', errorText);
        
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText };
        }
        
        // Xử lý lỗi email trùng lặp
        if (errorData.message === 'EMAIL_DUPLICATE' || response.status === 409) {
          throw new Error('Email đã tồn tại trong hệ thống');
        }
        
        throw new Error(errorData.message || errorText || 'Đăng ký thất bại');
      }

      const result = await response.json();
      console.log('✅ Success response:', result);
      
      toast({
        title: "✅ Tạo tài khoản thành công!",
        description: `Tài khoản "${formData.fullName}" với vai trò ${formData.role} đã được thêm vào hệ thống.`,
      });
      
      // Reset form
      setFormData({
        username: '',
        email: '',
        password: '',
        fullName: '',
        phone: '',
        address: '',
        role: '',
        dealerCode: '',
        department: ''
      });
      setFormErrors({});
      setShowRegisterForm(false);
    } catch (error: any) {
      console.error('Registration error:', error);
      toast({
        title: "❌ Lỗi tạo tài khoản!",
        description: error.message === 'Email đã tồn tại trong hệ thống' 
          ? '📧 Email này đã được sử dụng. Vui lòng chọn email khác.'
          : `Không thể tạo tài khoản: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle view account details
  const handleViewDetails = (account: AccountData) => {
    setSelectedAccount(account);
    setShowDetailDialog(true);
  };

  // Handle edit account
  const handleEditAccount = (account: AccountData) => {
    setSelectedAccount(account);
    setFormData({
      username: '',
      email: account.email,
      password: '',
      fullName: account.name,
      phone: account.phone || '',
      address: account.address || '',
      role: account.role,
      dealerCode: account.dealerCode || '',
      department: account.department || ''
    });
    setShowEditDialog(true);
  };

  // Handle save edit
  const handleSaveEdit = async () => {
    if (!selectedAccount) return;

    setIsLoading(true);
    
    try {
      // Call REAL API to update user
      const response = await fetch(`http://localhost:6969/api/user/profile/${selectedAccount.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.fullName,
          email: formData.email,
          phone: formData.phone || '',
          address: '',
          roleName: selectedAccount.role,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Cập nhật thất bại');
      }

      const result = await response.json();
      
      toast({
        title: "✅ Cập nhật thành công!",
        description: `Thông tin tài khoản "${formData.fullName}" đã được lưu vào hệ thống.`,
      });
      
      setShowEditDialog(false);
      setSelectedAccount(null);
    } catch (error: any) {
      console.error('Update error:', error);
      toast({
        title: "❌ Lỗi cập nhật!",
        description: `Không thể cập nhật tài khoản: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle lock/block account (thay thế delete)
  const handleLockAccount = (account: AccountData) => {
    setSelectedAccount(account);
    setShowDeleteDialog(true); // Sử dụng lại dialog này cho lock
  };

  // Confirm lock account (thay thế delete)
  const confirmLock = async () => {
    if (!selectedAccount) return;

    setIsLoading(true);
    
    try {
      // Call REAL API to lock/blacklist user
      const response = await fetch(`http://localhost:6969/api/user/addBlackList/${selectedAccount.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Khóa tài khoản thất bại');
      }

      const isCurrentlyLocked = selectedAccount.status === 'Tạm khóa';
      
      toast({
        title: isCurrentlyLocked ? "✅ Mở khóa thành công!" : "✅ Khóa thành công!",
        description: isCurrentlyLocked 
          ? `Tài khoản "${selectedAccount.name}" đã được mở khóa và có thể đăng nhập.`
          : `Tài khoản "${selectedAccount.name}" đã bị khóa và không thể đăng nhập.`,
      });
      
      setShowDeleteDialog(false);
      setSelectedAccount(null);
    } catch (error: any) {
      console.error('Lock error:', error);
      toast({
        title: "❌ Lỗi khóa tài khoản!",
        description: `Không thể khóa tài khoản: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle lock/unlock account
  const handleToggleLock = async (account: AccountData) => {
    const isLocked = account.status === 'Tạm khóa';
    
    try {
      // Call REAL API to add/remove from blacklist
      const response = await fetch(`http://localhost:6969/api/user/addBlackList/${account.id}`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Thao tác thất bại');
      }

      toast({
        title: isLocked ? "Đã mở khóa!" : "Đã khóa!",
        description: `Tài khoản ${account.name} đã được ${isLocked ? 'mở khóa' : 'khóa'}.`,
      });
    } catch (error: any) {
      console.error('Lock/Unlock error:', error);
      toast({
        title: "Lỗi!",
        description: `Không thể ${isLocked ? 'mở khóa' : 'khóa'} tài khoản: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <ProtectedRoute allowedRoles={['Admin']}>
      <div className="dashboard-shell relative min-h-screen overflow-hidden bg-gradient-to-br from-white via-slate-50 to-slate-100 text-slate-900">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(79,70,229,0.12),_transparent_65%)]" />
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.12),_transparent_55%)]" />

        <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-xl">
          <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 text-sm font-medium text-slate-700">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button
                  variant="ghost"
                  size="sm"
                  className="border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Trang chủ
                </Button>
              </Link>
              <div>
                <h2 className="text-base font-semibold uppercase tracking-wide text-indigo-600">VieCar</h2>
                <p className="text-xs text-slate-500">Bảng điều khiển doanh nghiệp</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="border-slate-200 bg-gradient-to-r from-indigo-500/10 to-sky-500/10 text-indigo-600 shadow-[0_12px_30px_-18px_rgba(79,70,229,0.45)] transition hover:border-indigo-200 hover:from-indigo-500/20 hover:to-sky-500/20"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Đăng xuất
            </Button>
          </div>
        </header>

        <main className="relative z-10 w-full px-4 py-10">
          <div className="mx-auto w-full max-w-7xl space-y-10">
            <div className="space-y-3 rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_25px_45px_-30px_rgba(15,23,42,0.2)]">
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs uppercase tracking-[0.3em] text-indigo-600">
                <Shield className="h-3.5 w-3.5 text-indigo-500" />
                Trung tâm điều hành
              </div>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-900 lg:text-4xl">Bảng điều khiển Admin</h1>
              <p className="max-w-2xl text-sm text-slate-600">Chào mừng, {user?.username ?? 'Admin'}! Quản trị toàn bộ hệ thống.</p>
            </div>

            <div className="space-y-10">

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full gap-2 rounded-2xl border border-slate-200 bg-white p-1 shadow-sm grid-cols-6">
            <TabsTrigger value="overview" className="rounded-xl border border-transparent px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500 transition data-[state=active]:border-indigo-200 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-600">Tổng quan</TabsTrigger>
            <TabsTrigger value="accounts" className="rounded-xl border border-transparent px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500 transition data-[state=active]:border-indigo-200 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-600">Tài khoản</TabsTrigger>
            <TabsTrigger value="vehicles" className="rounded-xl border border-transparent px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500 transition data-[state=active]:border-indigo-200 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-600">Quản lý xe</TabsTrigger>
            <TabsTrigger value="dealers" className="rounded-xl border border-transparent px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500 transition data-[state=active]:border-indigo-200 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-600">Đại lý</TabsTrigger>
            <TabsTrigger value="sales" className="rounded-xl border border-transparent px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500 transition data-[state=active]:border-indigo-200 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-600">Bán hàng</TabsTrigger>
            <TabsTrigger value="reports" className="rounded-xl border border-transparent px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500 transition data-[state=active]:border-indigo-200 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-600">Báo cáo</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <Card className="border border-slate-200 bg-white shadow-[0_20px_45px_-30px_rgba(15,23,42,0.18)]">
                  <CardHeader>
                    <CardTitle className="flex items-center text-slate-900">
                      <Shield className="mr-2 h-5 w-5 text-indigo-500" />
                      Quản lý hệ thống
                    </CardTitle>
                    <CardDescription className="text-slate-500">
                      Toàn quyền quản trị hệ thống
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button variant="outline" className="justify-start border border-slate-200 bg-white text-slate-700 transition hover:border-slate-300 hover:bg-slate-50">
                      <Users className="mr-2 h-4 w-4 text-indigo-500" />
                      Quản lý tài khoản
                    </Button>
                    <Button variant="outline" className="justify-start border border-slate-200 bg-white text-slate-700 transition hover:border-slate-300 hover:bg-slate-50">
                      <Settings className="mr-2 h-4 w-4 text-purple-500" />
                      Cấu hình hệ thống
                    </Button>
                    <Button variant="outline" className="justify-start border border-slate-200 bg-white text-slate-700 transition hover:border-slate-300 hover:bg-slate-50">
                      <BarChart className="mr-2 h-4 w-4 text-emerald-500" />
                      Dashboard AI
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border border-slate-200 bg-white shadow-[0_20px_45px_-30px_rgba(15,23,42,0.18)]">
                  <CardHeader>
                    <CardTitle className="text-slate-900">Hoạt động gần đây</CardTitle>
                    <CardDescription className="text-slate-500">Các hành động quan trọng</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm text-slate-600">
                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">🔄 Phê duyệt 5 đơn hàng mới</div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">📦 Phân phối 89 xe cho đại lý</div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">👥 Tạo 3 tài khoản mới</div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">📊 Xuất báo cáo doanh thu</div>
                  </CardContent>
                </Card>

                <Card className="border border-slate-200 bg-white shadow-[0_20px_45px_-30px_rgba(15,23,42,0.18)]">
                  <CardHeader>
                    <CardTitle className="text-slate-900">Thông báo</CardTitle>
                    <CardDescription className="text-slate-500">Cần xử lý</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                      <Badge variant="outline" className="border-indigo-200 bg-indigo-50 text-indigo-600">Khẩn</Badge>
                      <span>8 khiếu nại chờ xử lý</span>
                    </div>
                    <div className="text-sm flex items-center gap-2 text-slate-600">
                      <Badge variant="secondary" className="border border-slate-200 bg-slate-100 text-slate-700">Mới</Badge>
                      <span>12 đơn hàng chờ duyệt</span>
                    </div>
                    <div className="text-sm flex items-center gap-2 text-slate-600">
                      <Badge variant="outline" className="border border-slate-200 text-slate-700">Cập nhật</Badge>
                      <span>Báo cáo tuần sẵn sàng</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

          {/* Account Management Tab */}
          <TabsContent value="accounts" className="space-y-6">
            <Card className="border border-slate-200 bg-white shadow-[0_20px_45px_-30px_rgba(15,23,42,0.18)]">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-slate-900">
                  <span className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-indigo-500" />
                    Quản lý tài khoản hệ thống
                  </span>
                  <Button
                    size="sm"
                    onClick={() => setShowRegisterForm(!showRegisterForm)}
                    className="border border-indigo-200 bg-indigo-50 text-indigo-600 transition hover:border-indigo-300 hover:bg-indigo-100"
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    {showRegisterForm ? 'Ẩn form' : 'Đăng ký tài khoản mới'}
                  </Button>
                </CardTitle>
                <CardDescription className="text-slate-500">
                  Quản lý tất cả tài khoản theo vai trò và phân quyền hệ thống
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Statistics Overview */}
                <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
                  <div className="space-y-1 rounded-2xl border border-indigo-200/70 bg-gradient-to-br from-indigo-500/10 via-indigo-50 to-white p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-500">Tổng tài khoản</p>
                    <p className="text-2xl font-semibold text-indigo-600">156</p>
                  </div>
                  <div className="space-y-1 rounded-2xl border border-indigo-200/70 bg-gradient-to-br from-indigo-500/10 via-indigo-50 to-white p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-500">Admin</p>
                    <p className="text-2xl font-semibold text-indigo-600">3</p>
                  </div>
                  <div className="space-y-1 rounded-2xl border border-blue-200/70 bg-gradient-to-br from-blue-500/10 via-blue-50 to-white p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-500">Dealer Manager</p>
                    <p className="text-2xl font-semibold text-blue-600">24</p>
                  </div>
                  <div className="space-y-1 rounded-2xl border border-purple-200/70 bg-gradient-to-br from-purple-500/10 via-purple-50 to-white p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-500">Dealer Staff</p>
                    <p className="text-2xl font-semibold text-purple-600">24</p>
                  </div>
                  <div className="space-y-1 rounded-2xl border border-amber-200/70 bg-gradient-to-br from-amber-500/10 via-amber-50 to-white p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-500">EVM Staff</p>
                    <p className="text-2xl font-semibold text-amber-600">65</p>
                  </div>
                  <div className="space-y-1 rounded-2xl border border-emerald-200/70 bg-gradient-to-br from-emerald-500/10 via-emerald-50 to-white p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-500">Customer</p>
                    <p className="text-2xl font-semibold text-emerald-600">16</p>
                  </div>
                </div>

                {/* Registration Form */}
                {showRegisterForm && (
                  <div className="mb-6 rounded-2xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6">
                    <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
                      <UserPlus className="h-5 w-5 text-indigo-500" />
                      Đăng ký tài khoản mới
                    </h3>

                    {Object.keys(formErrors).length > 0 && (
                      <Alert variant="destructive" className="mb-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          Vui lòng kiểm tra lại thông tin đã nhập
                        </AlertDescription>
                      </Alert>
                    )}

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Vai trò *</label>
                        <select 
                          className={`w-full rounded-xl border ${formErrors.role ? 'border-red-500' : 'border-slate-300'} bg-white px-4 py-2.5 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200`}
                          value={formData.role}
                          onChange={(e) => {
                            setFormData({...formData, role: e.target.value});
                            setSelectedRole(e.target.value);
                            setFormErrors({...formErrors, role: ''});
                          }}
                        >
                          <option value="">-- Chọn vai trò --</option>
                          <option value="Admin">Admin - Quản trị viên</option>
                          <option value="DealerManager">Dealer Manager - Quản lý đại lý</option>
                          <option value="DealerStaff">Dealer Staff - Nhân viên đại lý</option>
                          <option value="EVMStaff">EVM Staff - Nhân viên Vinfast</option>
                          <option value="Customer">Customer - Khách hàng</option>
                        </select>
                        {formErrors.role && <p className="text-xs text-red-500">{formErrors.role}</p>}
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Họ và tên *</label>
                        <input
                          type="text"
                          className={`w-full rounded-xl border ${formErrors.fullName ? 'border-red-500' : 'border-slate-300'} bg-white px-4 py-2.5 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200`}
                          placeholder="Nguyễn Văn A"
                          value={formData.fullName}
                          onChange={(e) => {
                            setFormData({...formData, fullName: e.target.value});
                            setFormErrors({...formErrors, fullName: ''});
                          }}
                        />
                        {formErrors.fullName && <p className="text-xs text-red-500">{formErrors.fullName}</p>}
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Email *</label>
                        <input
                          type="email"
                          className={`w-full rounded-xl border ${formErrors.email ? 'border-red-500' : 'border-slate-300'} bg-white px-4 py-2.5 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200`}
                          placeholder="email@example.com"
                          value={formData.email}
                          onChange={(e) => {
                            setFormData({...formData, email: e.target.value});
                            setFormErrors({...formErrors, email: ''});
                          }}
                        />
                        {formErrors.email && <p className="text-xs text-red-500">{formErrors.email}</p>}
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Mật khẩu *</label>
                        <input
                          type="password"
                          className={`w-full rounded-xl border ${formErrors.password ? 'border-red-500' : 'border-slate-300'} bg-white px-4 py-2.5 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200`}
                          placeholder="••••••••"
                          value={formData.password}
                          onChange={(e) => {
                            setFormData({...formData, password: e.target.value});
                            setFormErrors({...formErrors, password: ''});
                          }}
                        />
                        {formErrors.password && <p className="text-xs text-red-500">{formErrors.password}</p>}
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Số điện thoại</label>
                        <input
                          type="tel"
                          className={`w-full rounded-xl border ${formErrors.phone ? 'border-red-500' : 'border-slate-300'} bg-white px-4 py-2.5 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200`}
                          placeholder="0912345678 hoặc 0123456789"
                          value={formData.phone}
                          onChange={(e) => {
                            setFormData({...formData, phone: e.target.value});
                            setFormErrors({...formErrors, phone: ''});
                          }}
                        />
                        {formErrors.phone && <p className="text-xs text-red-500">{formErrors.phone}</p>}
                      </div>
                    </div>

                    <div className="mt-6 flex gap-3">
                      <Button 
                        onClick={handleCreateAccount}
                        disabled={isLoading}
                        className="bg-indigo-600 text-white hover:bg-indigo-700"
                      >
                        {isLoading ? (
                          <>
                            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            Đang tạo...
                          </>
                        ) : (
                          <>
                            <UserPlus className="mr-2 h-4 w-4" />
                            Tạo tài khoản
                          </>
                        )}
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setShowRegisterForm(false);
                          setFormErrors({});
                        }}
                        disabled={isLoading}
                        className="border-slate-300 text-slate-700 hover:bg-slate-50"
                      >
                        Hủy
                      </Button>
                    </div>
                  </div>
                )}

                {/* Account List by Role */}
                <div className="space-y-4">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <h4 className="font-semibold text-slate-900">Danh sách tài khoản theo vai trò</h4>
                    
                    {/* Search Bar */}
                    <div className="relative w-full md:w-80">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <Input
                        type="text"
                        placeholder="Tìm kiếm theo tên, email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {/* Role Filter Buttons */}
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={activeRoleFilter === 'all' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setActiveRoleFilter('all')}
                      className={activeRoleFilter === 'all' 
                        ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                        : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                      }
                    >
                      <Users className="mr-2 h-4 w-4" />
                      Tất cả (156)
                    </Button>
                    <Button
                      variant={activeRoleFilter === 'admin' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setActiveRoleFilter('admin')}
                      className={activeRoleFilter === 'admin' 
                        ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                        : 'border-indigo-200 text-indigo-700 hover:bg-indigo-50'
                      }
                    >
                      <Shield className="mr-2 h-4 w-4" />
                      Admin (3)
                    </Button>
                    <Button
                      variant={activeRoleFilter === 'dealerManager' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setActiveRoleFilter('dealerManager')}
                      className={activeRoleFilter === 'dealerManager' 
                        ? 'bg-blue-600 text-white hover:bg-blue-700' 
                        : 'border-blue-200 text-blue-700 hover:bg-blue-50'
                      }
                    >
                      <Briefcase className="mr-2 h-4 w-4" />
                      Dealer Manager (24)
                    </Button>
                    <Button
                      variant={activeRoleFilter === 'dealerStaff' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setActiveRoleFilter('dealerStaff')}
                      className={activeRoleFilter === 'dealerStaff' 
                        ? 'bg-purple-600 text-white hover:bg-purple-700' 
                        : 'border-purple-200 text-purple-700 hover:bg-purple-50'
                      }
                    >
                      <Store className="mr-2 h-4 w-4" />
                      Dealer Staff (24)
                    </Button>
                    <Button
                      variant={activeRoleFilter === 'evmStaff' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setActiveRoleFilter('evmStaff')}
                      className={activeRoleFilter === 'evmStaff' 
                        ? 'bg-amber-600 text-white hover:bg-amber-700' 
                        : 'border-amber-200 text-amber-700 hover:bg-amber-50'
                      }
                    >
                      <HeadphonesIcon className="mr-2 h-4 w-4" />
                      EVM Staff (65)
                    </Button>
                    <Button
                      variant={activeRoleFilter === 'customer' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setActiveRoleFilter('customer')}
                      className={activeRoleFilter === 'customer' 
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700' 
                        : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                      }
                    >
                      <UserCheck className="mr-2 h-4 w-4" />
                      Customer (16)
                    </Button>
                  </div>
                  
                  {/* Admin Accounts */}
                  {(activeRoleFilter === 'all' || activeRoleFilter === 'admin') && (
                  <div className="rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <h5 className="flex items-center gap-2 font-semibold text-slate-900">
                        <Shield className="h-5 w-5 text-indigo-600" />
                        Admin - Quản trị viên (3)
                      </h5>
                      <Badge className="bg-indigo-600 text-white">Quyền cao nhất</Badge>
                    </div>
                    <div className="space-y-2">
                      {[
                        { name: 'Nguyễn Văn Admin', email: 'admin@vinfast.vn', status: 'Hoạt động', created: '01/2024' },
                        { name: 'Trần Thị Quản', email: 'admin2@vinfast.vn', status: 'Hoạt động', created: '03/2024' },
                        { name: 'Lê Văn Trị', email: 'admin3@vinfast.vn', status: 'Hoạt động', created: '05/2024' }
                      ].map((account, i) => (
                        <div key={i} className="flex items-center justify-between rounded-xl border border-white bg-white p-3 shadow-sm">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                              <Shield className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="font-medium text-slate-900">{account.name}</p>
                              <p className="text-sm text-slate-500">{account.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">
                              {account.status}
                            </Badge>
                            <span className="text-sm text-slate-500">Tạo: {account.created}</span>
                            <div className="flex gap-1">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-indigo-600 hover:bg-indigo-50"
                                onClick={() => handleViewDetails({id: i, ...account, role: 'Admin'})}
                              >
                                Chi tiết
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-blue-600 hover:bg-blue-50"
                                onClick={() => handleEditAccount({id: i, ...account, role: 'Admin'})}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-orange-600 hover:bg-orange-50"
                                onClick={() => handleLockAccount({id: i, ...account, role: 'Admin'})}
                              >
                                <Lock className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  )}

                  {/* Dealer Manager Accounts */}
                  {(activeRoleFilter === 'all' || activeRoleFilter === 'dealerManager') && (
                  <div className="rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 to-sky-50 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <h5 className="flex items-center gap-2 font-semibold text-slate-900">
                        <Briefcase className="h-5 w-5 text-blue-600" />
                        Dealer Manager - Quản lý đại lý (24)
                      </h5>
                    </div>
                    <div className="space-y-2">
                      {[
                        { name: 'Phạm Văn Hùng', email: 'hung.pham@vf-hn.vn', dealerCode: 'DL-HN-001', dealer: 'VinFast Hà Nội', status: 'Hoạt động', orders: 45 },
                        { name: 'Võ Thị Mai', email: 'mai.vo@vf-hcm.vn', dealerCode: 'DL-HCM-003', dealer: 'VinFast TP.HCM', status: 'Hoạt động', orders: 89 },
                        { name: 'Đặng Minh Tuấn', email: 'tuan.dang@vf-dn.vn', dealerCode: 'DL-DN-002', dealer: 'VinFast Đà Nẵng', status: 'Hoạt động', orders: 32 }
                      ].map((account, i) => (
                        <div key={i} className="flex items-center justify-between rounded-xl border border-white bg-white p-3 shadow-sm">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                              <Briefcase className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="font-medium text-slate-900">{account.name}</p>
                              <p className="text-sm text-slate-500">{account.dealer} ({account.dealerCode})</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <p className="text-sm font-medium text-slate-900">{account.orders} đơn hàng</p>
                              <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">
                                {account.status}
                              </Badge>
                            </div>
                            <div className="flex gap-1">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-blue-600 hover:bg-blue-50"
                                onClick={() => handleViewDetails({id: i, ...account, role: 'DealerManager'})}
                              >
                                Chi tiết
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-amber-600 hover:bg-amber-50"
                                onClick={() => handleEditAccount({id: i, ...account, role: 'DealerManager'})}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-orange-600 hover:bg-orange-50"
                                onClick={() => handleLockAccount({id: i, ...account, role: 'DealerManager'})}
                              >
                                <Lock className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  )}

                  {/* Dealer Staff Accounts */}
                  {(activeRoleFilter === 'all' || activeRoleFilter === 'dealerStaff') && (
                  <div className="rounded-2xl border border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <h5 className="flex items-center gap-2 font-semibold text-slate-900">
                        <Store className="h-5 w-5 text-purple-600" />
                        Dealer Staff - Nhân viên đại lý (24)
                      </h5>
                    </div>
                    <div className="space-y-2">
                      {[
                        { name: 'Nguyễn Thị Hoa', email: 'hoa.nguyen@vf-hn.vn', dealer: 'VinFast Hà Nội', position: 'Tư vấn bán hàng', status: 'Hoạt động' },
                        { name: 'Trần Văn Bình', email: 'binh.tran@vf-hcm.vn', dealer: 'VinFast TP.HCM', position: 'Chăm sóc khách hàng', status: 'Hoạt động' },
                        { name: 'Lê Thị Thu', email: 'thu.le@vf-dn.vn', dealer: 'VinFast Đà Nẵng', position: 'Tư vấn bán hàng', status: 'Tạm khóa' }
                      ].map((account, i) => (
                        <div key={i} className="flex items-center justify-between rounded-xl border border-white bg-white p-3 shadow-sm">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-purple-600">
                              <UserCog className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="font-medium text-slate-900">{account.name}</p>
                              <p className="text-sm text-slate-500">{account.position} - {account.dealer}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge 
                              variant="outline" 
                              className={account.status === 'Hoạt động' 
                                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                : "border-orange-200 bg-orange-50 text-orange-700"
                              }
                            >
                              {account.status}
                            </Badge>
                            <div className="flex gap-1">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-purple-600 hover:bg-purple-50"
                                onClick={() => handleViewDetails({id: i, ...account, role: 'DealerStaff'})}
                              >
                                Chi tiết
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-amber-600 hover:bg-amber-50"
                                onClick={() => handleEditAccount({id: i, ...account, role: 'DealerStaff'})}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              {account.status === 'Hoạt động' ? (
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="text-orange-600 hover:bg-orange-50"
                                  onClick={() => handleToggleLock({id: i, ...account, role: 'DealerStaff'})}
                                >
                                  <Lock className="h-4 w-4" />
                                </Button>
                              ) : (
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="text-green-600 hover:bg-green-50"
                                  onClick={() => handleToggleLock({id: i, ...account, role: 'DealerStaff'})}
                                >
                                  <Unlock className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  )}

                  {/* EVM Staff Accounts */}
                  {(activeRoleFilter === 'all' || activeRoleFilter === 'evmStaff') && (
                  <div className="rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <h5 className="flex items-center gap-2 font-semibold text-slate-900">
                        <HeadphonesIcon className="h-5 w-5 text-amber-600" />
                        EVM Staff - Nhân viên VinFast (65)
                      </h5>
                    </div>
                    <div className="space-y-2">
                      {[
                        { name: 'Hoàng Văn Kiên', email: 'kien.hoang@vinfast.vn', department: 'Kinh doanh', position: 'Chuyên viên', status: 'Hoạt động' },
                        { name: 'Bùi Thị Lan', email: 'lan.bui@vinfast.vn', department: 'Hỗ trợ khách hàng', position: 'Trưởng phòng', status: 'Hoạt động' },
                        { name: 'Đỗ Văn Nam', email: 'nam.do@vinfast.vn', department: 'Vận hành & Logistics', position: 'Điều phối viên', status: 'Hoạt động' }
                      ].map((account, i) => (
                        <div key={i} className="flex items-center justify-between rounded-xl border border-white bg-white p-3 shadow-sm">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                              <HeadphonesIcon className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="font-medium text-slate-900">{account.name}</p>
                              <p className="text-sm text-slate-500">{account.position} - {account.department}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">
                              {account.status}
                            </Badge>
                            <div className="flex gap-1">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-amber-600 hover:bg-amber-50"
                                onClick={() => handleViewDetails({id: i, ...account, role: 'EVMStaff'})}
                              >
                                Chi tiết
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-blue-600 hover:bg-blue-50"
                                onClick={() => handleEditAccount({id: i, ...account, role: 'EVMStaff'})}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-orange-600 hover:bg-orange-50"
                                onClick={() => handleLockAccount({id: i, ...account, role: 'EVMStaff'})}
                              >
                                <Lock className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  )}

                  {/* Customer Accounts */}
                  {(activeRoleFilter === 'all' || activeRoleFilter === 'customer') && (
                  <div className="rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <h5 className="flex items-center gap-2 font-semibold text-slate-900">
                        <UserCheck className="h-5 w-5 text-emerald-600" />
                        Customer - Khách hàng (16)
                      </h5>
                    </div>
                    <div className="space-y-2">
                      {[
                        { name: 'Nguyễn Minh Tâm', email: 'tam.nguyen@gmail.com', orders: 2, status: 'VIP' },
                        { name: 'Lê Thị Hương', email: 'huong.le@yahoo.com', orders: 1, status: 'Thường' },
                        { name: 'Trần Đức Anh', email: 'anh.tran@outlook.com', orders: 3, status: 'VIP' }
                      ].map((account, i) => (
                        <div key={i} className="flex items-center justify-between rounded-xl border border-white bg-white p-3 shadow-sm">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                              <UserCheck className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="font-medium text-slate-900">{account.name}</p>
                              <p className="text-sm text-slate-500">{account.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <p className="text-sm font-medium text-slate-900">{account.orders} đơn hàng</p>
                              <Badge 
                                variant="outline" 
                                className={account.status === 'VIP'
                                  ? "border-amber-200 bg-amber-50 text-amber-700"
                                  : "border-slate-200 bg-slate-50 text-slate-700"
                                }
                              >
                                {account.status}
                              </Badge>
                            </div>
                            <div className="flex gap-1">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-emerald-600 hover:bg-emerald-50"
                                onClick={() => handleViewDetails({id: i, ...account, role: 'Customer'})}
                              >
                                Chi tiết
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-blue-600 hover:bg-blue-50"
                                onClick={() => handleEditAccount({id: i, ...account, role: 'Customer'})}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-orange-600 hover:bg-orange-50"
                                onClick={() => handleLockAccount({id: i, ...account, role: 'Customer'})}
                              >
                                <Lock className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Detail Dialog */}
            <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Chi tiết tài khoản</DialogTitle>
                  <DialogDescription>Thông tin chi tiết về tài khoản người dùng</DialogDescription>
                </DialogHeader>
                {selectedAccount && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs text-slate-500">Họ tên</Label>
                        <p className="font-medium">{selectedAccount.name}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-slate-500">Email</Label>
                        <p className="font-medium">{selectedAccount.email}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-slate-500">Vai trò</Label>
                        <Badge variant="outline">{selectedAccount.role}</Badge>
                      </div>
                      <div>
                        <Label className="text-xs text-slate-500">Trạng thái</Label>
                        <Badge variant={selectedAccount.status === 'Hoạt động' ? 'default' : 'destructive'}>
                          {selectedAccount.status}
                        </Badge>
                      </div>
                      {selectedAccount.dealerCode && (
                        <div>
                          <Label className="text-xs text-slate-500">Mã đại lý</Label>
                          <p className="font-medium">{selectedAccount.dealerCode}</p>
                        </div>
                      )}
                      {selectedAccount.dealer && (
                        <div>
                          <Label className="text-xs text-slate-500">Đại lý</Label>
                          <p className="font-medium">{selectedAccount.dealer}</p>
                        </div>
                      )}
                      {selectedAccount.position && (
                        <div>
                          <Label className="text-xs text-slate-500">Vị trí</Label>
                          <p className="font-medium">{selectedAccount.position}</p>
                        </div>
                      )}
                      {selectedAccount.department && (
                        <div>
                          <Label className="text-xs text-slate-500">Phòng ban</Label>
                          <p className="font-medium">{selectedAccount.department}</p>
                        </div>
                      )}
                      {selectedAccount.orders !== undefined && (
                        <div>
                          <Label className="text-xs text-slate-500">Số đơn hàng</Label>
                          <p className="font-medium">{selectedAccount.orders}</p>
                        </div>
                      )}
                      {selectedAccount.created && (
                        <div>
                          <Label className="text-xs text-slate-500">Ngày tạo</Label>
                          <p className="font-medium">{selectedAccount.created}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                <DialogFooter>
                  <Button onClick={() => setShowDetailDialog(false)}>Đóng</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Chỉnh sửa tài khoản</DialogTitle>
                  <DialogDescription>Cập nhật thông tin tài khoản</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Họ và tên</Label>
                    <Input
                      value={formData.fullName}
                      onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Số điện thoại</Label>
                    <Input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowEditDialog(false)} disabled={isLoading}>
                    Hủy
                  </Button>
                  <Button onClick={handleSaveEdit} disabled={isLoading}>
                    {isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Lock/Unlock Confirmation Dialog (thay thế Delete Dialog) */}
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {selectedAccount?.status === 'Tạm khóa' ? '🔓 Xác nhận mở khóa' : '🔒 Xác nhận khóa tài khoản'}
                  </DialogTitle>
                  <DialogDescription>
                    {selectedAccount?.status === 'Tạm khóa' ? (
                      <>
                        Bạn có chắc chắn muốn <strong className="text-green-600">mở khóa</strong> tài khoản <strong>{selectedAccount?.name}</strong>?
                        <br />
                        Tài khoản sẽ có thể đăng nhập và sử dụng hệ thống trở lại.
                      </>
                    ) : (
                      <>
                        Bạn có chắc chắn muốn <strong className="text-orange-600">khóa</strong> tài khoản <strong>{selectedAccount?.name}</strong>?
                        <br />
                        Tài khoản sẽ không thể đăng nhập cho đến khi được mở khóa.
                      </>
                    )}
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowDeleteDialog(false)} disabled={isLoading}>
                    Hủy
                  </Button>
                  <Button 
                    variant={selectedAccount?.status === 'Tạm khóa' ? 'default' : 'destructive'} 
                    onClick={confirmLock} 
                    disabled={isLoading}
                    className={selectedAccount?.status === 'Tạm khóa' ? 'bg-green-600 hover:bg-green-700' : ''}
                  >
                    {isLoading ? (
                      selectedAccount?.status === 'Tạm khóa' ? 'Đang mở khóa...' : 'Đang khóa...'
                    ) : (
                      selectedAccount?.status === 'Tạm khóa' ? '🔓 Mở khóa' : '🔒 Khóa tài khoản'
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* Vehicles Management Tab */}
            <TabsContent value="vehicles" className="space-y-6">
              <Card className="border border-slate-200 bg-white shadow-[0_20px_45px_-30px_rgba(15,23,42,0.18)]">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-slate-900">
                    <span className="flex items-center gap-2">
                      <Car className="h-5 w-5 text-indigo-500" />
                      Quản lý danh mục xe
                    </span>
                    <Button
                      size="sm"
                      className="border border-indigo-200 bg-indigo-50 text-indigo-600 transition hover:border-indigo-300 hover:bg-indigo-100"
                    >
                      Thêm mẫu xe mới
                    </Button>
                  </CardTitle>
                  <CardDescription className="text-slate-500">
                    Quản lý mẫu xe, phiên bản, màu sắc, cấu hình và giá bán
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
                    <div className="space-y-1 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-xs uppercase tracking-wide text-slate-500">Tổng mẫu xe</p>
                      <p className="text-2xl font-semibold text-slate-900">12</p>
                    </div>
                    <div className="space-y-1 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-xs uppercase tracking-wide text-slate-500">Tồn kho tổng</p>
                      <p className="text-2xl font-semibold text-slate-900">1,234</p>
                    </div>
                    <div className="space-y-1 rounded-2xl border border-emerald-200/70 bg-gradient-to-br from-emerald-500/10 via-emerald-50 to-white p-4">
                      <p className="text-xs uppercase tracking-wide text-slate-500">Đã phân phối</p>
                      <p className="text-2xl font-semibold text-emerald-600">856</p>
                    </div>
                    <div className="space-y-1 rounded-2xl border border-sky-200/70 bg-gradient-to-br from-sky-500/10 via-sky-50 to-white p-4">
                      <p className="text-xs uppercase tracking-wide text-slate-500">Sẵn sàng</p>
                      <p className="text-2xl font-semibold text-sky-600">378</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold">Danh mục xe</h4>
                    {['VF3', 'VF5', 'VF6', 'VF7', 'VF8', 'VF9'].map((model, i) => (
                      <div key={i} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                        <div className="flex-1">
                          <p className="font-medium text-slate-900">VinFast {model}</p>
                          <p className="text-sm text-slate-500">
                            {3 + i} phiên bản - {(15 + i * 20)}% xe còn trong kho
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="border-slate-200 text-slate-700 hover:border-slate-300">Cấu hình</Button>
                          <Button variant="outline" size="sm" className="border-slate-200 text-slate-700 hover:border-slate-300">Giá & KM</Button>
                          <Button variant="ghost" size="sm" className="text-indigo-600 hover:bg-indigo-50">Phân phối</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

          {/* Dealers Management Tab */}
            <TabsContent value="dealers" className="space-y-6">
              <Card className="border border-slate-200 bg-white shadow-[0_20px_45px_-30px_rgba(15,23,42,0.18)]">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center">
                      <Building className="mr-2 h-5 w-5" />
                      Quản lý đại lý
                    </span>
                    <Button size="sm">Thêm đại lý mới</Button>
                  </CardTitle>
                  <CardDescription>
                    Quản lý hợp đồng, chỉ tiêu, công nợ và tài khoản đại lý
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Tổng đại lý</p>
                      <p className="text-2xl font-bold">24</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Hoạt động</p>
                      <p className="text-2xl font-bold text-green-600">22</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Công nợ</p>
                      <p className="text-2xl font-bold text-yellow-600">₫450M</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Chỉ tiêu tháng</p>
                      <p className="text-2xl font-bold">₫12B</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold">Đại lý theo khu vực</h4>
                    {[
                      { region: 'Hà Nội', dealers: 8, revenue: '₫3.2B', target: 85 },
                      { region: 'TP.HCM', dealers: 10, revenue: '₫5.8B', target: 92 },
                      { region: 'Đà Nẵng', dealers: 4, revenue: '₫1.5B', target: 78 },
                      { region: 'Cần Thơ', dealers: 2, revenue: '₫800M', target: 65 }
                    ].map((region, i) => (
                      <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium">{region.region}</p>
                          <p className="text-sm text-muted-foreground">
                            {region.dealers} đại lý - Doanh thu: {region.revenue}
                          </p>
                        </div>
                        <div className="flex gap-2 items-center">
                          <Badge variant={region.target >= 80 ? "default" : "secondary"}>
                            {region.target}% chỉ tiêu
                          </Badge>
                          <Button variant="outline" size="sm">Chi tiết</Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 p-4 border rounded-lg bg-blue-50">
                    <h4 className="font-semibold mb-3">Tạo tài khoản đại lý</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Chỉ Admin có quyền tạo và quản lý tài khoản đại lý
                    </p>
                    <Button>
                      <Users className="mr-2 h-4 w-4" />
                      Quản lý tài khoản
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

          {/* Sales Management Tab */}
            <TabsContent value="sales" className="space-y-6">
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <Card className="border border-slate-200 bg-white shadow-[0_20px_45px_-30px_rgba(15,23,42,0.18)]">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <ShoppingCart className="mr-2 h-5 w-5" />
                      Quản lý bán hàng
                    </CardTitle>
                    <CardDescription>
                      Báo giá, đơn hàng, hợp đồng và thanh toán
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Đơn hàng mới</p>
                        <p className="text-2xl font-bold">45</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Chờ duyệt</p>
                        <p className="text-2xl font-bold text-yellow-600">12</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Button variant="outline" className="justify-start border border-slate-200 bg-white text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 w-full">
                        📋 Quản lý báo giá
                      </Button>
                      <Button variant="outline" className="justify-start border border-slate-200 bg-white text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 w-full">
                        📝 Quản lý hợp đồng
                      </Button>
                      <Button variant="outline" className="justify-start border border-slate-200 bg-white text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 w-full">
                        🎁 Quản lý khuyến mãi
                      </Button>
                      <Button variant="outline" className="justify-start border border-slate-200 bg-white text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 w-full">
                        💳 Quản lý thanh toán
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-slate-200 bg-white shadow-[0_20px_45px_-30px_rgba(15,23,42,0.18)]">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Calendar className="mr-2 h-5 w-5" />
                      Dịch vụ khách hàng
                    </CardTitle>
                    <CardDescription>
                      Lái thử, phản hồi và khiếu nại
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Lịch lái thử</p>
                        <p className="text-2xl font-bold">234</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Khiếu nại</p>
                        <p className="text-2xl font-bold text-red-600">8</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Button variant="outline" className="justify-start border border-slate-200 bg-white text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 w-full">
                        🚗 Quản lý lịch lái thử
                      </Button>
                      <Button variant="outline" className="justify-start border border-slate-200 bg-white text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 w-full">
                        💬 Phản hồi khách hàng
                      </Button>
                      <Button variant="outline" className="justify-start border border-slate-200 bg-white text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 w-full">
                        ⚠️ Xử lý khiếu nại
                      </Button>
                      <Button variant="outline" className="justify-start border border-slate-200 bg-white text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 w-full">
                        👥 Quản lý khách hàng
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

          {/* Reports Tab */}
            <TabsContent value="reports" className="space-y-6">
              <Card className="border border-slate-200 bg-white shadow-[0_20px_45px_-30px_rgba(15,23,42,0.18)]">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center">
                      <BarChart className="mr-2 h-5 w-5" />
                      Báo cáo & phân tích
                    </span>
                    <Button size="sm">
                      <FileText className="mr-2 h-4 w-4" />
                      Xuất báo cáo
                    </Button>
                  </CardTitle>
                  <CardDescription>
                    Dashboard AI, doanh số, công nợ và dự báo
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3 mb-6">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Doanh thu tháng</p>
                      <p className="text-2xl font-bold">₫24.5B</p>
                      <p className="text-xs text-green-600">↑ +18% vs tháng trước</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Công nợ</p>
                      <p className="text-2xl font-bold">₫1.2B</p>
                      <p className="text-xs text-yellow-600">↓ -5% vs tháng trước</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Tốc độ tiêu thụ</p>
                      <p className="text-2xl font-bold">85%</p>
                      <p className="text-xs text-blue-600">Tốt</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold">Báo cáo chi tiết</h4>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      <Button variant="outline" className="justify-start border border-slate-200 bg-white text-slate-700 transition hover:border-slate-300 hover:bg-slate-50">
                        📊 Doanh số theo khu vực/đại lý
                      </Button>
                      <Button variant="outline" className="justify-start border border-slate-200 bg-white text-slate-700 transition hover:border-slate-300 hover:bg-slate-50">
                        📦 Tồn kho & tốc độ tiêu thụ
                      </Button>
                      <Button variant="outline" className="justify-start border border-slate-200 bg-white text-slate-700 transition hover:border-slate-300 hover:bg-slate-50">
                        💰 Báo cáo công nợ
                      </Button>
                      <Button variant="outline" className="justify-start border border-slate-200 bg-white text-slate-700 transition hover:border-slate-300 hover:bg-slate-50">
                        👥 Hiệu suất nhân viên
                      </Button>
                      <Button variant="outline" className="justify-start border border-slate-200 bg-white text-slate-700 transition hover:border-slate-300 hover:bg-slate-50">
                        🎯 Đạt chỉ tiêu
                      </Button>
                      <Button variant="outline" className="justify-start border border-slate-200 bg-white text-slate-700 transition hover:border-slate-300 hover:bg-slate-50">
                        🤖 Dashboard AI & dự báo
                      </Button>
                    </div>
                  </div>

                  <div className="mt-6 rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50 p-4">
                    <h4 className="mb-2 flex items-center gap-2 font-semibold">🤖 AI Insights</h4>
                    <p className="mb-3 text-sm">
                      Dự báo: Nhu cầu VF8 tăng 25% trong Q4. Đề xuất tăng phân phối cho TP.HCM.
                    </p>
                    <Button size="sm">Xem chi tiết AI Dashboard</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

        </Tabs>

            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}