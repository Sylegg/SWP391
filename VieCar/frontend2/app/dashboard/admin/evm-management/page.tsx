"use client";

import { useState } from "react";
import { ProtectedRoute } from "@/components/auth-guards";
import AdminLayout from "@/components/layout/admin-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Building2, Shield, Users, MapPin, Phone, Mail } from "lucide-react";

// Mock data
const mockEVMs = [
  {
    id: 1,
    name: "VinFast",
    code: "VF",
    country: "Vietnam",
    address: "Khu Công nghiệp Đình Vũ, Hải Phòng",
    phone: "1900123456",
    email: "contact@vinfast.vn",
    website: "www.vinfast.vn",
    status: "active",
    managers: ["Nguyễn Văn A", "Trần Thị B"],
    staff: ["Lê Văn C", "Phạm Thị D", "Hoàng Văn E"],
    totalDealers: 45,
    totalProducts: 12,
    createdAt: "2024-01-15"
  },
  {
    id: 2,
    name: "Toyota Vietnam",
    code: "TYT",
    country: "Japan/Vietnam",
    address: "Vĩnh Phúc",
    phone: "1900234567",
    email: "info@toyota.com.vn",
    website: "www.toyota.com.vn",
    status: "active",
    managers: ["Yamada Taro"],
    staff: ["Nguyễn Văn F"],
    totalDealers: 60,
    totalProducts: 20,
    createdAt: "2024-02-10"
  }
];

export default function EVMManagementPage() {
  const { toast } = useToast();
  const [evms, setEvms] = useState(mockEVMs);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showStaffDialog, setShowStaffDialog] = useState(false);
  const [selectedEVM, setSelectedEVM] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    country: "",
    address: "",
    phone: "",
    email: "",
    website: ""
  });

  const handleCreate = () => {
    if (!formData.name || !formData.code) {
      toast({ variant: "destructive", title: "Thiếu thông tin", description: "Vui lòng nhập tên và mã hãng" });
      return;
    }

    const newEVM = {
      id: evms.length + 1,
      ...formData,
      status: "active",
      managers: [],
      staff: [],
      totalDealers: 0,
      totalProducts: 0,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setEvms([...evms, newEVM]);
    setShowCreateDialog(false);
    resetForm();
    toast({ title: "Tạo hãng thành công", description: `Đã thêm hãng ${formData.name}` });
  };

  const handleEdit = () => {
    setEvms(evms.map(e => e.id === selectedEVM.id ? { ...e, ...formData } : e));
    setShowEditDialog(false);
    resetForm();
    toast({ title: "Cập nhật thành công" });
  };

  const handleDelete = (id: number, name: string) => {
    if (confirm(`Xóa hãng "${name}"? Hành động này không thể hoàn tác!`)) {
      setEvms(evms.filter(e => e.id !== id));
      toast({ title: "Đã xóa hãng", description: `Hãng ${name} đã bị xóa` });
    }
  };

  const resetForm = () => {
    setFormData({ name: "", code: "", country: "", address: "", phone: "", email: "", website: "" });
    setSelectedEVM(null);
  };

  const openEditDialog = (evm: any) => {
    setSelectedEVM(evm);
    setFormData({
      name: evm.name,
      code: evm.code,
      country: evm.country,
      address: evm.address,
      phone: evm.phone,
      email: evm.email,
      website: evm.website
    });
    setShowEditDialog(true);
  };

  return (
    <ProtectedRoute allowedRoles={["Admin"]}>
      <AdminLayout>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Quản lý hãng xe (EVM)</h1>
              <p className="text-muted-foreground mt-2">Quản lý các hãng xe và phân quyền vận hành</p>
            </div>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Thêm hãng xe
            </Button>
          </div>

          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Tổng hãng xe</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{evms.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Tổng đại lý</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{evms.reduce((sum, e) => sum + e.totalDealers, 0)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Tổng sản phẩm</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{evms.reduce((sum, e) => sum + e.totalProducts, 0)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Hãng hoạt động</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{evms.filter(e => e.status === "active").length}</div>
              </CardContent>
            </Card>
          </div>

          {/* EVM List */}
          <div className="grid gap-4">
            {evms.map(evm => (
              <Card key={evm.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Building2 className="w-8 h-8 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <CardTitle className="text-xl">{evm.name}</CardTitle>
                          <Badge variant="outline">{evm.code}</Badge>
                          <Badge variant="default" className="bg-green-500">Hoạt động</Badge>
                        </div>
                        <CardDescription>{evm.country}</CardDescription>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => openEditDialog(evm)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => { setSelectedEVM(evm); setShowStaffDialog(true); }}>
                        <Users className="w-4 h-4 mr-2" />
                        Nhân sự
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(evm.id, evm.name)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span>{evm.address}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span>{evm.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span>{evm.email}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <span className="text-sm font-medium">Đại lý</span>
                        <span className="text-lg font-bold">{evm.totalDealers}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <span className="text-sm font-medium">Sản phẩm</span>
                        <span className="text-lg font-bold">{evm.totalProducts}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2 pt-2 border-t">
                    <div>
                      <p className="text-sm font-medium mb-2">Managers ({evm.managers.length})</p>
                      <div className="flex flex-wrap gap-2">
                        {evm.managers.map((m, i) => (
                          <Badge key={i} variant="secondary" className="bg-blue-100 text-blue-700">
                            <Shield className="w-3 h-3 mr-1" />
                            {m}
                          </Badge>
                        ))}
                        {evm.managers.length === 0 && <span className="text-sm text-muted-foreground">Chưa có</span>}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-2">Staff ({evm.staff.length})</p>
                      <div className="flex flex-wrap gap-2">
                        {evm.staff.map((s, i) => (
                          <Badge key={i} variant="outline">
                            {s}
                          </Badge>
                        ))}
                        {evm.staff.length === 0 && <span className="text-sm text-muted-foreground">Chưa có</span>}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Create Dialog */}
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Thêm hãng xe mới</DialogTitle>
                <DialogDescription>Nhập thông tin hãng xe để thêm vào hệ thống</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Tên hãng <span className="text-red-500">*</span></Label>
                    <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="VinFast" />
                  </div>
                  <div className="space-y-2">
                    <Label>Mã hãng <span className="text-red-500">*</span></Label>
                    <Input value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value})} placeholder="VF" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Quốc gia</Label>
                  <Input value={formData.country} onChange={(e) => setFormData({...formData, country: e.target.value})} placeholder="Vietnam" />
                </div>
                <div className="space-y-2">
                  <Label>Địa chỉ</Label>
                  <Textarea value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} placeholder="Địa chỉ trụ sở" rows={2} />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Số điện thoại</Label>
                    <Input value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} placeholder="1900123456" />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="contact@example.com" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Website</Label>
                  <Input value={formData.website} onChange={(e) => setFormData({...formData, website: e.target.value})} placeholder="www.example.com" />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => { setShowCreateDialog(false); resetForm(); }}>Hủy</Button>
                  <Button onClick={handleCreate}><Plus className="w-4 h-4 mr-2" />Thêm hãng</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Edit Dialog */}
          <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Chỉnh sửa thông tin hãng</DialogTitle>
                <DialogDescription>Cập nhật thông tin {selectedEVM?.name}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Tên hãng <span className="text-red-500">*</span></Label>
                    <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Mã hãng <span className="text-red-500">*</span></Label>
                    <Input value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Quốc gia</Label>
                  <Input value={formData.country} onChange={(e) => setFormData({...formData, country: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Địa chỉ</Label>
                  <Textarea value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} rows={2} />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Số điện thoại</Label>
                    <Input value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Website</Label>
                  <Input value={formData.website} onChange={(e) => setFormData({...formData, website: e.target.value})} />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => { setShowEditDialog(false); resetForm(); }}>Hủy</Button>
                  <Button onClick={handleEdit}><Edit className="w-4 h-4 mr-2" />Cập nhật</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Staff Management Dialog */}
          <Dialog open={showStaffDialog} onOpenChange={setShowStaffDialog}>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Quản lý nhân sự - {selectedEVM?.name}</DialogTitle>
                <DialogDescription>Phân quyền EVM Manager và Staff</DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold">EVM Managers</h3>
                    <Button size="sm" variant="outline"><Plus className="w-4 h-4 mr-2" />Thêm Manager</Button>
                  </div>
                  <div className="space-y-2">
                    {selectedEVM?.managers.map((m: string, i: number) => (
                      <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-blue-500" />
                          <span>{m}</span>
                        </div>
                        <Button size="sm" variant="ghost"><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    ))}
                    {selectedEVM?.managers.length === 0 && <p className="text-sm text-muted-foreground py-4 text-center">Chưa có manager</p>}
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold">EVM Staff</h3>
                    <Button size="sm" variant="outline"><Plus className="w-4 h-4 mr-2" />Thêm Staff</Button>
                  </div>
                  <div className="space-y-2">
                    {selectedEVM?.staff.map((s: string, i: number) => (
                      <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-gray-500" />
                          <span>{s}</span>
                        </div>
                        <Button size="sm" variant="ghost"><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    ))}
                    {selectedEVM?.staff.length === 0 && <p className="text-sm text-muted-foreground py-4 text-center">Chưa có staff</p>}
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}