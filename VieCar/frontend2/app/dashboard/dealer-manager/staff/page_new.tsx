"use client";

import { ProtectedRoute } from "@/components/auth-guards";
import DealerManagerLayout from "@/components/layout/dealer-manager-layout";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Users, UserPlus, Edit, Trash2, RefreshCw } from "lucide-react";
import { getUsersByRole, createUser, updateUser, deleteUser, type UserRes, type UserReq } from "@/lib/userApi";

export default function StaffManagementPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [staff, setStaff] = useState<UserRes[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<UserRes | null>(null);
  const [formData, setFormData] = useState({ 
    username: "", 
    email: "", 
    phone: "", 
    address: "", 
    password: "", 
    status: "ACTIVE" 
  });

  useEffect(() => { loadStaff(); }, []);

  const loadStaff = async () => {
    setLoading(true);
    try {
      const data = await getUsersByRole("Dealer Staff");
      setStaff(data);
    } catch (error) {
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
      const newUserData = { 
        ...formData, 
        roleName: "Dealer Staff", 
        dealerId: user?.dealerId 
      };
      
      await createUser(newUserData);
      toast({ title: "Thành công", description: "Tạo tài khoản nhân viên thành công" });
      setIsCreateDialogOpen(false);
      setFormData({ username: "", email: "", phone: "", address: "", password: "", status: "ACTIVE" });
      loadStaff();
    } catch (error: any) {
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
        email: formData.email, 
        phone: formData.phone, 
        address: formData.address,
        status: formData.status
      };
      if (formData.password) updates.password = formData.password;
      
      await updateUser(selectedStaff.id, updates);
      toast({ title: "Thành công", description: "Cập nhật thông tin nhân viên thành công" });
      setIsEditDialogOpen(false);
      setSelectedStaff(null);
      setFormData({ username: "", email: "", phone: "", address: "", password: "", status: "ACTIVE" });
      loadStaff();
    } catch (error: any) {
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

  const getStatusBadge = (status?: string) => {
    const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      "ACTIVE": { label: "Hoạt động", variant: "default" },
      "INACTIVE": { label: "Ngừng hoạt động", variant: "secondary" },
      "SUSPENDED": { label: "Tạm ngưng", variant: "destructive" },
    };
    
    const statusInfo = statusMap[status || "ACTIVE"] || { label: status || "N/A", variant: "outline" as const };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  return (
    <ProtectedRoute allowedRoles={["Dealer Manager", "Admin"]}>
      <DealerManagerLayout>
        <div className="p-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Users className="h-8 w-8 text-primary" />
                  <div>
                    <CardTitle>Quản lý Nhân viên Dealer Staff</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Quản lý toàn bộ nhân viên Dealer Staff trong hệ thống
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={loadStaff}>
                    <RefreshCw className="mr-2 h-4 w-4" />Làm mới
                  </Button>
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <UserPlus className="mr-2 h-4 w-4" />Thêm nhân viên
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Tên đăng nhập</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Số điện thoại</TableHead>
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
                        <TableCell className="font-medium">{s.id}</TableCell>
                        <TableCell className="font-semibold">{s.username}</TableCell>
                        <TableCell>{s.email || "-"}</TableCell>
                        <TableCell>{s.phone || "-"}</TableCell>
                        <TableCell>
                          {s.dealerName ? (
                            <div className="text-sm">
                              <div className="font-medium">{s.dealerName}</div>
                              <div className="text-muted-foreground text-xs">{s.dealerAddress}</div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">Chưa gán</span>
                          )}
                        </TableCell>
                        <TableCell>{getStatusBadge(s.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => {
                                setSelectedStaff(s);
                                setFormData({
                                  username: s.username,
                                  email: s.email || "",
                                  phone: s.phone || "",
                                  address: s.address || "",
                                  password: "",
                                  status: s.status || "ACTIVE"
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
            </CardContent>
          </Card>

          {/* Create Dialog */}
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Tạo tài khoản nhân viên mới</DialogTitle>
                <DialogDescription>Nhập thông tin để tạo tài khoản Dealer Staff</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Tên đăng nhập *</Label>
                  <Input 
                    placeholder="Nhập tên đăng nhập" 
                    value={formData.username} 
                    onChange={e => setFormData({ ...formData, username: e.target.value })} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Mật khẩu *</Label>
                  <Input 
                    type="password" 
                    placeholder="Nhập mật khẩu" 
                    value={formData.password} 
                    onChange={e => setFormData({ ...formData, password: e.target.value })} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input 
                    type="email" 
                    placeholder="Nhập email" 
                    value={formData.email} 
                    onChange={e => setFormData({ ...formData, email: e.target.value })} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Số điện thoại</Label>
                  <Input 
                    placeholder="Nhập số điện thoại" 
                    value={formData.phone} 
                    onChange={e => setFormData({ ...formData, phone: e.target.value })} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Địa chỉ</Label>
                  <Input 
                    placeholder="Nhập địa chỉ" 
                    value={formData.address} 
                    onChange={e => setFormData({ ...formData, address: e.target.value })} 
                  />
                </div>
              </div>
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => { 
                    setIsCreateDialogOpen(false); 
                    setFormData({ username: "", email: "", phone: "", address: "", password: "", status: "ACTIVE" }); 
                  }}
                >
                  Hủy
                </Button>
                <Button onClick={handleCreate} disabled={loading}>Tạo tài khoản</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Edit Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Chỉnh sửa thông tin nhân viên</DialogTitle>
                <DialogDescription>Cập nhật thông tin cho {selectedStaff?.username}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Tên đăng nhập</Label>
                  <Input value={formData.username} disabled />
                </div>
                <div className="space-y-2">
                  <Label>Trạng thái</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Hoạt động</SelectItem>
                      <SelectItem value="INACTIVE">Ngừng hoạt động</SelectItem>
                      <SelectItem value="SUSPENDED">Tạm ngưng</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Mật khẩu mới (để trống nếu không đổi)</Label>
                  <Input 
                    type="password" 
                    placeholder="Nhập mật khẩu mới" 
                    value={formData.password} 
                    onChange={e => setFormData({ ...formData, password: e.target.value })} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input 
                    type="email" 
                    placeholder="Nhập email" 
                    value={formData.email} 
                    onChange={e => setFormData({ ...formData, email: e.target.value })} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Số điện thoại</Label>
                  <Input 
                    placeholder="Nhập số điện thoại" 
                    value={formData.phone} 
                    onChange={e => setFormData({ ...formData, phone: e.target.value })} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Địa chỉ</Label>
                  <Input 
                    placeholder="Nhập địa chỉ" 
                    value={formData.address} 
                    onChange={e => setFormData({ ...formData, address: e.target.value })} 
                  />
                </div>
              </div>
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => { 
                    setIsEditDialogOpen(false); 
                    setSelectedStaff(null); 
                    setFormData({ username: "", email: "", phone: "", address: "", password: "", status: "ACTIVE" }); 
                  }}
                >
                  Hủy
                </Button>
                <Button onClick={handleEdit} disabled={loading}>Cập nhật</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </DealerManagerLayout>
    </ProtectedRoute>
  );
}
