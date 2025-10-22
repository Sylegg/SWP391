"use client";

import { useState } from "react";
import { ProtectedRoute } from "@/components/auth-guards";
import AdminLayout from "@/components/layout/admin-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Lock, Unlock, Key, Shield, Search, Mail, Phone, UserCircle, Eye } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";

// Mock data
const mockUsers = [
  { id: 1, name: "Nguyễn Văn A", email: "admin@vinfast.vn", phone: "0901234567", role: "Admin", status: "active", createdAt: "2025-01-15", lastLogin: "2025-10-20" },
  { id: 2, name: "Trần Thị B", email: "evm.manager@vinfast.vn", phone: "0907654321", role: "EVM Manager", status: "active", createdAt: "2025-02-10", lastLogin: "2025-10-19" },
  { id: 3, name: "Lê Văn C", email: "evm.staff@vinfast.vn", phone: "0909876543", role: "EVM Staff", status: "active", createdAt: "2025-03-05", lastLogin: "2025-10-18" },
  { id: 4, name: "Phạm Thị D", email: "dealer.manager@vinfast.vn", phone: "0903456789", role: "Dealer Manager", status: "active", createdAt: "2025-04-12", lastLogin: "2025-10-20" },
  { id: 5, name: "Hoàng Văn E", email: "dealer.staff@vinfast.vn", phone: "0905432109", role: "Dealer Staff", status: "active", createdAt: "2025-05-20", lastLogin: "2025-10-17" },
  { id: 6, name: "Võ Thị F", email: "customer@gmail.com", phone: "0908765432", role: "Customer", status: "locked", createdAt: "2025-06-01", lastLogin: "2025-09-15" }
];

const roles = [
  { value: "Admin", label: "Admin", description: "Toàn quyền quản trị hệ thống" },
  { value: "EVM Manager", label: "EVM Manager", description: "Quản lý vận hành hãng xe" },
  { value: "EVM Staff", label: "EVM Staff", description: "Nhân viên vận hành hãng" },
  { value: "Dealer Manager", label: "Dealer Manager", description: "Quản lý đại lý" },
  { value: "Dealer Staff", label: "Dealer Staff", description: "Nhân viên đại lý" },
  { value: "Customer", label: "Customer", description: "Khách hàng" }
];

export default function UserManagementPage() {
  const { toast } = useToast();
  const [users, setUsers] = useState(mockUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    password: ""
  });

  const handleCreateUser = () => {
    if (!formData.name || !formData.email || !formData.role || !formData.password) {
      toast({ variant: "destructive", title: "Thiếu thông tin", description: "Vui lòng điền đầy đủ thông tin bắt buộc" });
      return;
    }

    const newUser = {
      id: users.length + 1,
      ...formData,
      status: "active",
      createdAt: new Date().toISOString().split('T')[0],
      lastLogin: "-"
    };

    setUsers([...users, newUser]);
    setShowCreateDialog(false);
    resetForm();
    toast({ title: "Tạo tài khoản thành công", description: `Đã tạo tài khoản cho ${formData.name}` });
  };

  const handleEditUser = () => {
    if (!formData.name || !formData.email || !formData.role) {
      toast({ variant: "destructive", title: "Thiếu thông tin", description: "Vui lòng điền đầy đủ thông tin bắt buộc" });
      return;
    }

    setUsers(users.map(u => u.id === selectedUser.id ? { ...u, ...formData } : u));
    setShowEditDialog(false);
    resetForm();
    toast({ title: "Cập nhật thành công", description: "Thông tin tài khoản đã được cập nhật" });
  };

  const handleDeleteUser = (userId: number, userName: string) => {
    if (confirm(`Bạn có chắc muốn xóa tài khoản "${userName}"?`)) {
      setUsers(users.filter(u => u.id !== userId));
      toast({ title: "Đã xóa tài khoản", description: `Tài khoản ${userName} đã bị xóa` });
    }
  };

  const handleToggleLock = (userId: number, currentStatus: string, userName: string) => {
    const newStatus = currentStatus === "active" ? "locked" : "active";
    setUsers(users.map(u => u.id === userId ? { ...u, status: newStatus } : u));
    toast({
      title: newStatus === "locked" ? "Đã khóa tài khoản" : "Đã mở khóa tài khoản",
      description: `Tài khoản ${userName} đã ${newStatus === "locked" ? "bị khóa" : "được mở khóa"}`
    });
  };

  const handleResetPassword = (userName: string) => {
    toast({
      title: "Đã gửi email reset mật khẩu",
      description: `Link đặt lại mật khẩu đã được gửi đến email của ${userName}`
    });
  };

  const resetForm = () => {
    setFormData({ name: "", email: "", phone: "", role: "", password: "" });
    setSelectedUser(null);
  };

  const openEditDialog = (user: any) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      password: ""
    });
    setShowEditDialog(true);
  };

  const getStatusBadge = (status: string) => {
    return status === "active" 
      ? <Badge variant="default" className="bg-green-500">Hoạt động</Badge>
      : <Badge variant="destructive">Đã khóa</Badge>;
  };

  const getRoleBadge = (role: string) => {
    const colors: any = {
      Admin: "bg-purple-500 text-white",
      "EVM Manager": "bg-blue-500 text-white",
      "EVM Staff": "bg-blue-300 text-white",
      "Dealer Manager": "bg-orange-500 text-white",
      "Dealer Staff": "bg-orange-300 text-white",
      Customer: "bg-gray-500 text-white"
    };
    return <Badge className={colors[role] || ""}>{roles.find(r => r.value === role)?.label}</Badge>;
  };

  const filteredUsers = users.filter(user => {
    const matchSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       user.phone.includes(searchQuery);
    const matchRole = selectedRole === "all" || user.role === selectedRole;
    return matchSearch && matchRole;
  });

  return (
    <ProtectedRoute allowedRoles={["Admin"]}>
      <AdminLayout>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Quản lý người dùng & Phân quyền</h1>
              <p className="text-muted-foreground mt-2">Quản lý tài khoản và vai trò trong hệ thống</p>
            </div>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Tạo tài khoản
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Tổng người dùng</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{users.length}</div>
                <p className="text-xs text-muted-foreground">Tất cả tài khoản</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Đang hoạt động</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{users.filter(u => u.status === "active").length}</div>
                <p className="text-xs text-muted-foreground">Tài khoản active</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Đã khóa</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{users.filter(u => u.status === "locked").length}</div>
                <p className="text-xs text-muted-foreground">Tài khoản bị khóa</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Admin</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">{users.filter(u => u.role === "Admin").length}</div>
                <p className="text-xs text-muted-foreground">Quản trị viên</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Tìm theo tên, email, SĐT..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Lọc theo vai trò" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả vai trò</SelectItem>
                    {roles.map(r => (
                      <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Users Table */}
          <Card>
            <CardHeader>
              <CardTitle>Danh sách người dùng ({filteredUsers.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredUsers.map(user => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <UserCircle className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{user.name}</h3>
                          {getRoleBadge(user.role)}
                          {getStatusBadge(user.status)}
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <div className="flex items-center gap-2">
                            <Mail className="w-3 h-3" />
                            {user.email}
                            <span>•</span>
                            <Phone className="w-3 h-3" />
                            {user.phone}
                          </div>
                          <div>
                            Tạo: {user.createdAt} • Đăng nhập gần nhất: {user.lastLogin}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => openEditDialog(user)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleToggleLock(user.id, user.status, user.name)}
                      >
                        {user.status === "active" ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleResetPassword(user.name)}
                      >
                        <Key className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleDeleteUser(user.id, user.name)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                {filteredUsers.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    Không tìm thấy người dùng nào
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Create User Dialog */}
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Tạo tài khoản mới</DialogTitle>
                <DialogDescription>Nhập thông tin để tạo tài khoản người dùng</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Họ tên <span className="text-red-500">*</span></Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Nguyễn Văn A"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email <span className="text-red-500">*</span></Label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      placeholder="user@example.com"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Số điện thoại</Label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      placeholder="0901234567"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Vai trò <span className="text-red-500">*</span></Label>
                    <Select value={formData.role} onValueChange={(value) => setFormData({...formData, role: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn vai trò" />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map(r => (
                          <SelectItem key={r.value} value={r.value}>
                            <div>
                              <div className="font-medium">{r.label}</div>
                              <div className="text-xs text-muted-foreground">{r.description}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Mật khẩu <span className="text-red-500">*</span></Label>
                  <Input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    placeholder="Nhập mật khẩu"
                  />
                </div>

                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => { setShowCreateDialog(false); resetForm(); }}>
                    Hủy
                  </Button>
                  <Button onClick={handleCreateUser}>
                    <Plus className="w-4 h-4 mr-2" />
                    Tạo tài khoản
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Edit User Dialog */}
          <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Chỉnh sửa tài khoản</DialogTitle>
                <DialogDescription>Cập nhật thông tin tài khoản {selectedUser?.name}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Họ tên <span className="text-red-500">*</span></Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email <span className="text-red-500">*</span></Label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Số điện thoại</Label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Vai trò <span className="text-red-500">*</span></Label>
                    <Select value={formData.role} onValueChange={(value) => setFormData({...formData, role: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map(r => (
                          <SelectItem key={r.value} value={r.value}>
                            {r.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    Để đổi mật khẩu, vui lòng sử dụng chức năng "Reset mật khẩu"
                  </AlertDescription>
                </Alert>

                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => { setShowEditDialog(false); resetForm(); }}>
                    Hủy
                  </Button>
                  <Button onClick={handleEditUser}>
                    <Edit className="w-4 h-4 mr-2" />
                    Cập nhật
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}