"use client";

import { ProtectedRoute } from "@/components/auth-guards";
import DealerManagerLayout from "@/components/layout/dealer-manager-layout";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Users, UserPlus, Edit, Trash2, RefreshCw } from "lucide-react";
import { getDealerStaffByDealerId, createUser, updateUser, deleteUser, type UserRes, type UserReq } from "@/lib/userApi";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function StaffManagementPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [staff, setStaff] = useState<UserRes[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<UserRes | null>(null);
  const [formData, setFormData] = useState({ username: "", email: "", phone: "", address: "", password: "", status: "ACTIVE" });

  useEffect(() => { 
    if (user?.dealerId) {
      loadStaff(); 
    }
  }, [user?.dealerId]);

  const loadStaff = async () => {
    if (!user?.dealerId) {
      toast({ variant: "destructive", title: "Lỗi", description: "Không tìm thấy thông tin đại lý" });
      return;
    }
    
    setLoading(true);
    try {
      // Chỉ lấy nhân viên có role "Dealer Staff" của dealer này
      const data = await getDealerStaffByDealerId(user.dealerId);
      console.log('🔍 Dealer Staff for dealer', user.dealerId, ':', data);
      setStaff(data);
    } catch (error) {
      console.error('❌ Load staff error:', error);
      toast({ variant: "destructive", title: "Lỗi", description: "Không thể tải danh sách nhân viên" });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.username.trim()) {
      toast({ variant: "destructive", title: "Lỗi", description: "Vui lòng nhập tên đăng nhập" });
      return;
    }
    if (!formData.password.trim()) {
      toast({ variant: "destructive", title: "Lỗi", description: "Vui lòng nhập mật khẩu" });
      return;
    }
    try {
      setLoading(true);
      console.log('🚀 Creating user with dealerId:', user?.dealerId);
      const newUserData = { ...formData, roleName: "Dealer Staff", dealerId: user?.dealerId };
      console.log('📋 User data:', newUserData);
      
      const result = await createUser(newUserData);
      console.log('✅ User created:', result);
      
      toast({ title: "Thành công", description: "Tạo tài khoản nhân viên thành công" });
      setIsCreateDialogOpen(false);
      setFormData({ username: "", email: "", phone: "", address: "", password: "", status: "ACTIVE" });
      loadStaff();
    } catch (error: any) {
      console.error('❌ Create user error:', error);
      toast({ variant: "destructive", title: "Lỗi", description: error.message || "Không thể tạo tài khoản" });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedStaff) return;
    try {
      setLoading(true);
      const updates: any = { 
        username: formData.username,
        email: formData.email || "", 
        phone: formData.phone || "", 
        address: formData.address || "",
        status: formData.status || "ACTIVE"
      };
      // Chỉ gửi password nếu người dùng nhập mật khẩu mới
      if (formData.password && formData.password.trim() !== "") {
        updates.password = formData.password;
      }
      
      console.log('📤 Sending update request for user ID:', selectedStaff.id);
      console.log('📤 Update data:', updates);
      
      await updateUser(selectedStaff.id, updates);
      toast({ title: "Thành công", description: "Cập nhật thông tin nhân viên thành công" });
      setIsEditDialogOpen(false);
      setSelectedStaff(null);
      setFormData({ username: "", email: "", phone: "", address: "", password: "", status: "ACTIVE" });
      loadStaff();
    } catch (error: any) {
      console.error('❌ Update error:', error);
      toast({ variant: "destructive", title: "Lỗi", description: error.message || "Không thể cập nhật thông tin" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (staffId: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa nhân viên này?")) return;
    try {
      setLoading(true);
      await deleteUser(staffId);
      toast({ title: "Thành công", description: "Xóa nhân viên thành công" });
      loadStaff();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Lỗi", description: error.message || "Không thể xóa nhân viên" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={["Dealer Manager", "Admin"]}>
      <DealerManagerLayout>
        <div className="p-6 space-y-6">
          {/* Header with Liquid Glass */}
          <div className="relative overflow-hidden rounded-2xl backdrop-blur-md bg-white/70 dark:bg-gray-900/70 border border-white/30 shadow-xl p-8">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 animate-gradient-shift"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.3),transparent_50%)]"></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-blue-500/30">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                      Quản lý Nhân viên
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                      Tạo và quản lý tài khoản nhân viên cho đại lý <span className="font-semibold text-blue-600 dark:text-blue-400">{user?.dealerName}</span>
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button 
                    onClick={() => setIsCreateDialogOpen(true)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300"
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    Thêm nhân viên
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="backdrop-blur-md bg-white/60 dark:bg-gray-900/60 rounded-2xl border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 p-6 group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium mb-1">Tổng nhân viên</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{staff.length}</p>
                </div>
                <div className="p-4 rounded-xl bg-blue-500/20 backdrop-blur-sm shadow-md group-hover:scale-110 transition-transform duration-300">
                  <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <div className="mt-2 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            </div>

            <div className="backdrop-blur-md bg-white/60 dark:bg-gray-900/60 rounded-2xl border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 p-6 group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium mb-1">Đang hoạt động</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{staff.filter(s => s.status === "ACTIVE").length}</p>
                </div>
                <div className="p-4 rounded-xl bg-green-500/20 backdrop-blur-sm shadow-md group-hover:scale-110 transition-transform duration-300">
                  <Users className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <div className="mt-2 h-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            </div>

            <div className="backdrop-blur-md bg-white/60 dark:bg-gray-900/60 rounded-2xl border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 p-6 group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium mb-1">Không hoạt động</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{staff.filter(s => s.status === "INACTIVE").length}</p>
                </div>
                <div className="p-4 rounded-xl bg-red-500/20 backdrop-blur-sm shadow-md group-hover:scale-110 transition-transform duration-300">
                  <Users className="h-8 w-8 text-red-600 dark:text-red-400" />
                </div>
              </div>
              <div className="mt-2 h-1 bg-gradient-to-r from-red-500 to-orange-500 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            </div>
          </div>

          {/* Table with Liquid Glass */}
          <div className="backdrop-blur-md bg-white/60 dark:bg-gray-900/60 rounded-2xl border border-white/30 shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tên đăng nhập</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Số điện thoại</TableHead>
                    <TableHead>Địa chỉ</TableHead>
                    <TableHead>Đại lý</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">Đang tải...</TableCell>
                    </TableRow>
                  ) : staff.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        Chưa có nhân viên nào. Nhấn "Thêm nhân viên" để tạo tài khoản mới.
                      </TableCell>
                    </TableRow>
                  ) : (
                    staff.map(s => (
                      <TableRow key={s.id}>
                        <TableCell className="font-semibold">{s.username}</TableCell>
                        <TableCell>{s.email || "-"}</TableCell>
                        <TableCell>{s.phone || "-"}</TableCell>
                        <TableCell>{s.address || "-"}</TableCell>
                        <TableCell>{s.dealerName || "Chưa gán"}</TableCell>
                        <TableCell>
                          <Badge variant={s.status === "ACTIVE" ? "default" : "secondary"}>
                            {s.status === "ACTIVE" ? "Hoạt động" : "Không hoạt động"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => {
                                setSelectedStaff(s);
                                console.log('🔍 Staff status:', s.status, 'Type:', typeof s.status);
                                const statusValue = typeof s.status === 'string' ? s.status : (s.status || "ACTIVE");
                                setFormData({
                                  username: s.username,
                                  email: s.email || "",
                                  phone: s.phone || "",
                                  address: s.address || "",
                                  password: "",
                                  status: statusValue,
                                });
                                setIsEditDialogOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm" 
                              onClick={() => handleDelete(s.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Create Dialog with Liquid Glass */}
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogContent className="max-w-2xl backdrop-blur-xl bg-white/95 dark:bg-gray-900/95 border-white/30">
              <DialogHeader>
                <DialogTitle className="text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Tạo tài khoản nhân viên mới
                </DialogTitle>
                <DialogDescription>Nhập thông tin để tạo tài khoản Dealer Staff</DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Account Info Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-gradient-to-r from-blue-500 to-purple-500">
                    <div className="w-1 h-5 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">Thông tin đăng nhập</h3>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-blue-600 dark:text-blue-400 font-medium">Tên đăng nhập *</Label>
                      <Input 
                        placeholder="Nhập tên đăng nhập" 
                        value={formData.username} 
                        onChange={e => setFormData({ ...formData, username: e.target.value })}
                        className="backdrop-blur-sm bg-white/60 dark:bg-gray-800/60 border-blue-200 dark:border-blue-800 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-purple-600 dark:text-purple-400 font-medium">Mật khẩu *</Label>
                      <Input 
                        type="password" 
                        placeholder="Nhập mật khẩu" 
                        value={formData.password} 
                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                        className="backdrop-blur-sm bg-white/60 dark:bg-gray-800/60 border-purple-200 dark:border-purple-800 focus:border-purple-500 focus:ring-purple-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Contact Info Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-gradient-to-r from-green-500 to-emerald-500">
                    <div className="w-1 h-5 bg-gradient-to-b from-green-500 to-emerald-500 rounded-full"></div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">Thông tin liên hệ</h3>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-green-600 dark:text-green-400 font-medium">Email</Label>
                      <Input 
                        type="email" 
                        placeholder="Nhập email" 
                        value={formData.email} 
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        className="backdrop-blur-sm bg-white/60 dark:bg-gray-800/60 border-green-200 dark:border-green-800 focus:border-green-500 focus:ring-green-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-emerald-600 dark:text-emerald-400 font-medium">Số điện thoại</Label>
                      <Input 
                        placeholder="Nhập số điện thoại" 
                        value={formData.phone} 
                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        className="backdrop-blur-sm bg-white/60 dark:bg-gray-800/60 border-emerald-200 dark:border-emerald-800 focus:border-emerald-500 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-teal-600 dark:text-teal-400 font-medium">Địa chỉ</Label>
                    <Input 
                      placeholder="Nhập địa chỉ" 
                      value={formData.address} 
                      onChange={e => setFormData({ ...formData, address: e.target.value })}
                      className="backdrop-blur-sm bg-white/60 dark:bg-gray-800/60 border-teal-200 dark:border-teal-800 focus:border-teal-500 focus:ring-teal-500"
                    />
                  </div>
                </div>
              </div>

              <DialogFooter className="gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => { 
                    setIsCreateDialogOpen(false); 
                    setFormData({ username: "", email: "", phone: "", address: "", password: "", status: "ACTIVE" }); 
                  }}
                  className="backdrop-blur-sm"
                >
                  Hủy
                </Button>
                <Button 
                  onClick={handleCreate} 
                  disabled={loading}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg shadow-blue-500/30"
                >
                  Tạo tài khoản
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Edit Dialog with Liquid Glass */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="max-w-2xl backdrop-blur-xl bg-white/95 dark:bg-gray-900/95 border-white/30">
              <DialogHeader>
                <DialogTitle className="text-2xl bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
                  Chỉnh sửa thông tin nhân viên
                </DialogTitle>
                <DialogDescription>Cập nhật thông tin cho <span className="font-semibold text-orange-600">{selectedStaff?.username}</span></DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Account Info Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-gradient-to-r from-orange-500 to-pink-500">
                    <div className="w-1 h-5 bg-gradient-to-b from-orange-500 to-pink-500 rounded-full"></div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">Thông tin đăng nhập</h3>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-gray-600 dark:text-gray-400 font-medium">Tên đăng nhập</Label>
                      <Input 
                        value={formData.username} 
                        disabled 
                        className="backdrop-blur-sm bg-gray-100/80 dark:bg-gray-800/80"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-orange-600 dark:text-orange-400 font-medium">Mật khẩu mới (để trống nếu không đổi)</Label>
                      <Input 
                        type="password" 
                        placeholder="Nhập mật khẩu mới" 
                        value={formData.password} 
                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                        className="backdrop-blur-sm bg-white/60 dark:bg-gray-800/60 border-orange-200 dark:border-orange-800 focus:border-orange-500 focus:ring-orange-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Contact Info Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-gradient-to-r from-blue-500 to-cyan-500">
                    <div className="w-1 h-5 bg-gradient-to-b from-blue-500 to-cyan-500 rounded-full"></div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">Thông tin liên hệ</h3>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-blue-600 dark:text-blue-400 font-medium">Email</Label>
                      <Input 
                        type="email" 
                        placeholder="Nhập email" 
                        value={formData.email} 
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        className="backdrop-blur-sm bg-white/60 dark:bg-gray-800/60 border-blue-200 dark:border-blue-800 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-cyan-600 dark:text-cyan-400 font-medium">Số điện thoại</Label>
                      <Input 
                        placeholder="Nhập số điện thoại" 
                        value={formData.phone} 
                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        className="backdrop-blur-sm bg-white/60 dark:bg-gray-800/60 border-cyan-200 dark:border-cyan-800 focus:border-cyan-500 focus:ring-cyan-500"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-teal-600 dark:text-teal-400 font-medium">Địa chỉ</Label>
                    <Input 
                      placeholder="Nhập địa chỉ" 
                      value={formData.address} 
                      onChange={e => setFormData({ ...formData, address: e.target.value })}
                      className="backdrop-blur-sm bg-white/60 dark:bg-gray-800/60 border-teal-200 dark:border-teal-800 focus:border-teal-500 focus:ring-teal-500"
                    />
                  </div>
                </div>

                {/* Status Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-gradient-to-r from-green-500 to-red-500">
                    <div className="w-1 h-5 bg-gradient-to-b from-green-500 to-red-500 rounded-full"></div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">Trạng thái</h3>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-purple-600 dark:text-purple-400 font-medium">Trạng thái hoạt động</Label>
                    <Select 
                      value={formData.status || "ACTIVE"} 
                      onValueChange={(v) => {
                        console.log('📝 Status changed to:', v);
                        setFormData({ ...formData, status: v });
                      }}
                    >
                      <SelectTrigger className="w-full backdrop-blur-sm bg-white/60 dark:bg-gray-800/60 border-purple-200 dark:border-purple-800 focus:border-purple-500 focus:ring-purple-500">
                        <SelectValue placeholder="Chọn trạng thái" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ACTIVE">Hoạt động</SelectItem>
                        <SelectItem value="INACTIVE">Không hoạt động</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <DialogFooter className="gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => { 
                    setIsEditDialogOpen(false); 
                    setSelectedStaff(null); 
                    setFormData({ username: "", email: "", phone: "", address: "", password: "", status: "ACTIVE" }); 
                  }}
                  className="backdrop-blur-sm"
                >
                  Hủy
                </Button>
                <Button 
                  onClick={handleEdit} 
                  disabled={loading}
                  className="bg-gradient-to-r from-orange-600 to-pink-600 hover:from-orange-700 hover:to-pink-700 shadow-lg shadow-orange-500/30"
                >
                  Cập nhật
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </DealerManagerLayout>
    </ProtectedRoute>
  );
}
