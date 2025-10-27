"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/auth-guards";
import DealerManagerLayout from "@/components/layout/dealer-manager-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Search, Car, Plus, ArrowLeft, Trash2, RefreshCw, Eye, Pencil } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getProductsByCategory, createProduct, deleteProduct, updateProduct } from "@/lib/productApi";
import { getCategoryById } from "@/lib/categoryApi";
import type { ProductRes, ProductReq } from "@/types/product";
import type { CategoryRes } from "@/types/category";
import { ProductStatus, ProductStatusLabels, ProductStatusColors } from "@/types/product";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function CategoryInventoryPage() {
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const idParam = params?.id as string | undefined;
  const categoryId = idParam ? parseInt(idParam, 10) : NaN;

  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState<CategoryRes | null>(null);
  const [products, setProducts] = useState<ProductRes[]>([]);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductRes | null>(null);

  // Full form like Admin, but category fixed
  const [formData, setFormData] = useState<ProductReq>({
    name: "",
    vinNum: "",
    engineNum: "",
    battery: 0,
    range: 0,
    hp: 0,
    torque: 0,
    color: "",
    manufacture_date: "",
    stockInDate: "",
    dealerPrice: 0,
    description: "",
    status: ProductStatus.ACTIVE,
    categoryId: 0,
    dealerCategoryId: 0,
    image: "",
  });

  const load = async () => {
    if (!categoryId || Number.isNaN(categoryId)) {
      toast({ title: "❌ Lỗi", description: "Thiếu mã danh mục", variant: "destructive" });
      return;
    }
    try {
      setLoading(true);
      const [cat, prods] = await Promise.all([
        getCategoryById(categoryId),
        getProductsByCategory(categoryId),
      ]);
      setCategory(cat);
      setProducts(prods || []);
    } catch (e: any) {
      toast({ title: "❌ Lỗi", description: e.message || "Không thể tải dữ liệu", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idParam]);

  const filtered = useMemo(() => {
    return (products || []).filter((p) => {
      const q = searchTerm.toLowerCase();
      const matchSearch =
        p.name?.toLowerCase().includes(q) ||
        p.vinNum?.toLowerCase().includes(q) ||
        p.engineNum?.toLowerCase().includes(q);
      const matchStatus = selectedStatus === "all" || p.status === selectedStatus;
      return matchSearch && matchStatus;
    });
  }, [products, searchTerm, selectedStatus]);

  const counts = useMemo(() => {
    return {
      total: products.length,
      active: products.filter((p) => p.status === ProductStatus.ACTIVE).length,
      inactive: products.filter((p) => p.status === ProductStatus.INACTIVE).length,
      soldout: products.filter((p) => p.status === ProductStatus.SOLDOUT).length,
    };
  }, [products]);

  // Helpers like Admin page
  const generateUniqueCode = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `${timestamp}${random}`;
  };

  const handleAutoFillVinEngine = () => {
    const uniqueCode = generateUniqueCode();
    setFormData({
      ...formData,
      vinNum: `VIN-${uniqueCode}`,
      engineNum: `ENG-${uniqueCode}`,
    });
    toast({ title: "✅ Đã tạo mã tự động", description: `VIN/Engine: ${uniqueCode}` });
  };

  const resetForm = () => {
    setFormData({
      name: "",
      vinNum: "",
      engineNum: "",
      battery: 0,
      range: 0,
      hp: 0,
      torque: 0,
      color: "",
      manufacture_date: "",
      stockInDate: "",
      dealerPrice: 0,
      description: "",
      status: ProductStatus.ACTIVE,
      categoryId: categoryId || 0,
      dealerCategoryId: 0,
      image: "",
    });
  };

  // Open detail dialog
  const openDetailDialog = (product: ProductRes) => {
    setSelectedProduct(product);
    setIsDetailDialogOpen(true);
  };

  // Date formatter helper
  const fmtDate = (value?: string | Date) => {
    if (!value) return '-';
    const d = typeof value === 'string' ? new Date(value) : value;
    if (isNaN(d.getTime())) return '-';
    return d.toLocaleDateString('vi-VN');
  };

  // Normalize date for API: accepts 'yyyy-MM-dd' or Date and returns ISO or appends T00:00:00; returns undefined when blank
  const normalizeDateForApi = (value?: string | Date | null): string | undefined => {
    if (!value) return undefined;
    if (value instanceof Date) {
      if (isNaN(value.getTime())) return undefined;
      return value.toISOString();
    }
    const v = value.toString().trim();
    if (!v) return undefined;
    return v.includes('T') ? v : `${v}T00:00:00`;
  };

  // Build payload with normalized/omitted dates
  const buildProductPayload = (data: ProductReq, cid: number): ProductReq => {
    const payload: any = { ...data, categoryId: cid };
    const m = normalizeDateForApi(data.manufacture_date as any);
    const s = normalizeDateForApi(data.stockInDate as any);
    if (m === undefined) delete payload.manufacture_date; else payload.manufacture_date = m;
    if (s === undefined) delete payload.stockInDate; else payload.stockInDate = s;
    return payload as ProductReq;
  };

  // Create product (category fixed)
  const handleCreate = async () => {
    if (!formData.name.trim() || !formData.vinNum.trim() || !formData.engineNum.trim()) {
      toast({ variant: "destructive", title: "Lỗi", description: "Tên, VIN, Engine bắt buộc" });
      return;
    }
    try {
      const payload = buildProductPayload(formData, categoryId);
      await createProduct(payload);
      toast({ title: "Thành công", description: "Đã thêm sản phẩm vào danh mục" });
      setIsCreateDialogOpen(false);
      resetForm();
      load();
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.message || "Không thể tạo sản phẩm";
      toast({ variant: "destructive", title: "❌ Lỗi tạo sản phẩm", description: msg });
    }
  };

  // Open edit dialog
  const openEditDialog = (product: ProductRes) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      vinNum: product.vinNum,
      engineNum: product.engineNum,
      battery: product.battery,
      range: product.range,
      hp: product.hp,
      torque: product.torque,
      color: product.color || "",
      manufacture_date: product.manufacture_date
        ? (typeof product.manufacture_date === 'string' 
            ? product.manufacture_date.split('T')[0]
            : new Date(product.manufacture_date).toISOString().split('T')[0])
        : "",
      stockInDate: product.stockInDate
        ? (typeof product.stockInDate === 'string'
            ? (product.stockInDate.includes('T') ? product.stockInDate.split('T')[0] : product.stockInDate)
            : new Date(product.stockInDate).toISOString().split('T')[0])
        : "",
      dealerPrice: product.price,
      description: product.description || "",
      status: product.status,
      categoryId: categoryId,
      dealerCategoryId: product.dealerCategoryId,
      image: product.image || "",
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (!selectedProduct) return;
    try {
      const payload = buildProductPayload(formData, categoryId);
      const updated = await updateProduct(selectedProduct.id, payload);
      // Optimistically update local list and selected product
      setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      setSelectedProduct((prev) => (prev && prev.id === updated.id ? updated : prev));
      toast({ title: "Thành công", description: "Cập nhật sản phẩm thành công" });
      setIsEditDialogOpen(false);
      resetForm();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Lỗi", description: error?.message || "Không thể cập nhật" });
    }
  };

  const handleDeleteConfirm = (product: ProductRes) => {
    setSelectedProduct(product);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedProduct) return;
    try {
      await deleteProduct(selectedProduct.id);
      toast({ title: "🗑️ Đã xóa", description: `Đã xóa sản phẩm #${selectedProduct.id}` });
      setIsDeleteDialogOpen(false);
      setSelectedProduct(null);
      load();
    } catch (e: any) {
      toast({ title: "❌ Lỗi", description: e.message || "Không thể xóa", variant: "destructive" });
    }
  };

  return (
    <ProtectedRoute allowedRoles={["Dealer Manager"]}>
      <DealerManagerLayout>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Package className="w-8 h-8" />
                Sản phẩm theo danh mục
              </h1>
              <p className="text-muted-foreground mt-2">
                {category ? (
                  <>
                    Danh mục: <span className="font-semibold">{category.name}</span>{" "}
                    {category.brand && <Badge variant="outline" className="ml-2">{category.brand}</Badge>}
                  </>
                ) : (
                  "Đang tải danh mục..."
                )}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => router.push("/dashboard/dealer-manager/categories")}>
                <ArrowLeft className="w-4 h-4 mr-2"/> Quay lại
              </Button>
              <Button variant="outline" onClick={load}>
                <RefreshCw className="w-4 h-4 mr-2"/> Làm mới
              </Button>
              <Button onClick={() => { resetForm(); setIsCreateDialogOpen(true); }}>
                <Plus className="w-4 h-4 mr-2" /> Thêm sản phẩm
              </Button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Tổng số xe</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{counts.total}</div>
                <p className="text-xs text-muted-foreground mt-1">Trong danh mục này</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Đang hoạt động</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{counts.active}</div>
                <p className="text-xs text-muted-foreground mt-1">Sẵn sàng bán</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Hết hàng</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">{counts.soldout}</div>
                <p className="text-xs text-muted-foreground mt-1">Đã bán hết</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Ngưng hoạt động</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-600">{counts.inactive}</div>
                <p className="text-xs text-muted-foreground mt-1">Ẩn khỏi bán hàng</p>
              </CardContent>
            </Card>
          </div>

          {/* Search & Filter */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Search className="w-5 h-5" />Tìm kiếm & Lọc</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Input placeholder="Tìm theo tên xe, VIN, Engine..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
              </div>
              <Tabs value={selectedStatus} onValueChange={setSelectedStatus}>
                <TabsList>
                  <TabsTrigger value="all">Tất cả</TabsTrigger>
                  <TabsTrigger value={ProductStatus.ACTIVE}>Đang hoạt động</TabsTrigger>
                  <TabsTrigger value={ProductStatus.SOLDOUT}>Hết hàng</TabsTrigger>
                  <TabsTrigger value={ProductStatus.INACTIVE}>Ngưng hoạt động</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardContent>
          </Card>

          {/* Products Table */}
          <Card>
            <CardHeader>
              <CardTitle>Danh sách sản phẩm</CardTitle>
              <CardDescription>Hiển thị {filtered.length} trên {products.length} sản phẩm</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Tên</th>
                      <th className="text-left py-3 px-4">VIN</th>
                      <th className="text-left py-3 px-4">Engine</th>
                      <th className="text-left py-3 px-4">Màu</th>
                      <th className="text-left py-3 px-4">Pin</th>
                      <th className="text-left py-3 px-4">Quãng đường</th>
                      <th className="text-left py-3 px-4">HP</th>
                      <th className="text-left py-3 px-4">Mô-men</th>
                      <th className="text-left py-3 px-4">Trạng thái</th>
                      <th className="text-right py-3 px-4">Giá</th>
                      <th className="text-right py-3 px-4">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((p) => (
                      <tr key={p.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Car className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium">{p.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">{p.vinNum}</td>
                        <td className="py-3 px-4">{p.engineNum}</td>
                        <td className="py-3 px-4">{p.color || '-'}</td>
                        <td className="py-3 px-4">{p.battery}</td>
                        <td className="py-3 px-4">{p.range}</td>
                        <td className="py-3 px-4">{p.hp}</td>
                        <td className="py-3 px-4">{p.torque}</td>
                        <td className="py-3 px-4">
                          <Badge className={ProductStatusColors[p.status]}>{ProductStatusLabels[p.status] || p.status}</Badge>
                        </td>
                        <td className="py-3 px-4 text-right font-medium">{(p.price ?? 0).toLocaleString('vi-VN')}</td>
                        <td className="py-3 px-4 text-right space-x-1">
                          <Button variant="ghost" size="icon" onClick={() => openDetailDialog(p)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteConfirm(p)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filtered.length === 0 && (
                <div className="py-12 text-center">
                  <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Chưa có sản phẩm trong danh mục này</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Create Dialog */}
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Thêm sản phẩm vào danh mục</DialogTitle>
                <DialogDescription>Danh mục hiện tại: #{categoryId} - {category?.name}</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="create-name">Tên sản phẩm *</Label>
                    <Input id="create-name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="create-color">Màu sắc</Label>
                    <Input id="create-color" value={formData.color} onChange={(e) => setFormData({ ...formData, color: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Số VIN & Engine *</Label>
                    <Button type="button" variant="outline" size="sm" onClick={handleAutoFillVinEngine}>🎲 Tạo mã tự động</Button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="create-vin">Số VIN *</Label>
                      <Input id="create-vin" value={formData.vinNum} onChange={(e) => setFormData({ ...formData, vinNum: e.target.value })} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="create-engine">Số máy *</Label>
                      <Input id="create-engine" value={formData.engineNum} onChange={(e) => setFormData({ ...formData, engineNum: e.target.value })} />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="create-battery">Pin (kWh)</Label>
                    <Input id="create-battery" type="number" step="0.1" value={formData.battery} onChange={(e) => setFormData({ ...formData, battery: parseFloat(e.target.value) || 0 })} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="create-range">Quãng đường (km)</Label>
                    <Input id="create-range" type="number" value={formData.range} onChange={(e) => setFormData({ ...formData, range: parseInt(e.target.value) || 0 })} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="create-hp">Công suất (HP)</Label>
                    <Input id="create-hp" type="number" value={formData.hp} onChange={(e) => setFormData({ ...formData, hp: parseInt(e.target.value) || 0 })} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="create-torque">Mô-men (Nm)</Label>
                    <Input id="create-torque" type="number" value={formData.torque} onChange={(e) => setFormData({ ...formData, torque: parseInt(e.target.value) || 0 })} />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="create-date">Ngày sản xuất</Label>
                    <Input id="create-date" type="date" value={typeof formData.manufacture_date === 'string' ? formData.manufacture_date : (formData.manufacture_date instanceof Date ? formData.manufacture_date.toISOString().split('T')[0] : '')} onChange={(e) => setFormData({ ...formData, manufacture_date: e.target.value })} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="create-stock-in">Ngày nhập kho</Label>
                    <Input id="create-stock-in" type="date" value={typeof formData.stockInDate === 'string' ? formData.stockInDate : (formData.stockInDate instanceof Date ? formData.stockInDate.toISOString().split('T')[0] : '')} onChange={(e) => setFormData({ ...formData, stockInDate: e.target.value })} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="create-price">Giá đại lý (VNĐ) *</Label>
                    <Input id="create-price" type="number" value={formData.dealerPrice} onChange={(e) => setFormData({ ...formData, dealerPrice: parseFloat(e.target.value) || 0 })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Danh mục</Label>
                    <Input value={`#${categoryId} - ${category?.name || ''}`} disabled />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="create-status">Trạng thái</Label>
                    <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v as ProductStatus })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn trạng thái" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(ProductStatus).map((st) => (
                          <SelectItem key={st} value={st}>{ProductStatusLabels[st]}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="create-desc">Mô tả</Label>
                  <Textarea id="create-desc" rows={3} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Hủy</Button>
                <Button onClick={handleCreate} disabled={loading}>Lưu</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Edit Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Chỉnh sửa sản phẩm</DialogTitle>
                <DialogDescription>Danh mục hiện tại: #{categoryId} - {category?.name}</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                {/* Same form fields as create */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Tên sản phẩm *</Label>
                    <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Màu sắc</Label>
                    <Input value={formData.color} onChange={(e) => setFormData({ ...formData, color: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Số VIN & Engine *</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>Số VIN *</Label>
                      <Input value={formData.vinNum} onChange={(e) => setFormData({ ...formData, vinNum: e.target.value })} />
                    </div>
                    <div className="grid gap-2">
                      <Label>Số máy *</Label>
                      <Input value={formData.engineNum} onChange={(e) => setFormData({ ...formData, engineNum: e.target.value })} />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-4">
                  <div className="grid gap-2">
                    <Label>Pin (kWh)</Label>
                    <Input type="number" step="0.1" value={formData.battery} onChange={(e) => setFormData({ ...formData, battery: parseFloat(e.target.value) || 0 })} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Quãng đường (km)</Label>
                    <Input type="number" value={formData.range} onChange={(e) => setFormData({ ...formData, range: parseInt(e.target.value) || 0 })} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Công suất (HP)</Label>
                    <Input type="number" value={formData.hp} onChange={(e) => setFormData({ ...formData, hp: parseInt(e.target.value) || 0 })} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Mô-men (Nm)</Label>
                    <Input type="number" value={formData.torque} onChange={(e) => setFormData({ ...formData, torque: parseInt(e.target.value) || 0 })} />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="grid gap-2">
                    <Label>Ngày sản xuất</Label>
                    <Input type="date" value={typeof formData.manufacture_date === 'string' ? formData.manufacture_date : (formData.manufacture_date instanceof Date ? formData.manufacture_date.toISOString().split('T')[0] : '')} onChange={(e) => setFormData({ ...formData, manufacture_date: e.target.value })} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Ngày nhập kho</Label>
                    <Input type="date" value={typeof formData.stockInDate === 'string' ? formData.stockInDate : (formData.stockInDate instanceof Date ? formData.stockInDate.toISOString().split('T')[0] : '')} onChange={(e) => setFormData({ ...formData, stockInDate: e.target.value })} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Giá đại lý (VNĐ) *</Label>
                    <Input type="number" value={formData.dealerPrice} onChange={(e) => setFormData({ ...formData, dealerPrice: parseFloat(e.target.value) || 0 })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Danh mục</Label>
                    <Input value={`#${categoryId} - ${category?.name || ''}`} disabled />
                  </div>
                  <div className="grid gap-2">
                    <Label>Trạng thái</Label>
                    <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v as ProductStatus })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn trạng thái" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(ProductStatus).map((st) => (
                          <SelectItem key={st} value={st}>{ProductStatusLabels[st]}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Mô tả</Label>
                  <Textarea rows={3} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Hủy</Button>
                <Button onClick={handleUpdate} disabled={loading}>Lưu</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Delete Confirm Dialog */}
          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Xác nhận xóa</DialogTitle>
                <DialogDescription>Bạn có chắc muốn xóa sản phẩm này khỏi danh mục?</DialogDescription>
              </DialogHeader>
              <div className="py-2">#{selectedProduct?.id} - {selectedProduct?.name}</div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Hủy</Button>
                <Button variant="destructive" onClick={handleDelete}>Xóa</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Detail Dialog */}
          <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Thông tin sản phẩm</DialogTitle>
                <DialogDescription>#{selectedProduct?.id} - {selectedProduct?.name}</DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 py-2">
                <div className="col-span-2">
                  <Label>Tên sản phẩm</Label>
                  <div className="mt-1 text-sm font-medium">{selectedProduct?.name || '-'}</div>
                </div>
                <div>
                  <Label>VIN</Label>
                  <div className="mt-1 text-sm">{selectedProduct?.vinNum}</div>
                </div>
                <div>
                  <Label>Engine</Label>
                  <div className="mt-1 text-sm">{selectedProduct?.engineNum}</div>
                </div>
                <div>
                  <Label>Màu</Label>
                  <div className="mt-1 text-sm">{selectedProduct?.color || '-'}</div>
                </div>
                <div>
                  <Label>Trạng thái</Label>
                  <div className="mt-1">
                    {selectedProduct && (
                      <Badge className={ProductStatusColors[selectedProduct.status]}> 
                        {ProductStatusLabels[selectedProduct.status]}
                      </Badge>
                    )}
                  </div>
                </div>
                <div>
                  <Label>Pin (kWh)</Label>
                  <div className="mt-1 text-sm">{selectedProduct?.battery}</div>
                </div>
                <div>
                  <Label>Quãng đường (km)</Label>
                  <div className="mt-1 text-sm">{selectedProduct?.range}</div>
                </div>
                <div>
                  <Label>HP</Label>
                  <div className="mt-1 text-sm">{selectedProduct?.hp}</div>
                </div>
                <div>
                  <Label>Mô-men (Nm)</Label>
                  <div className="mt-1 text-sm">{selectedProduct?.torque}</div>
                </div>
                <div>
                  <Label>Giá đại lý (VNĐ)</Label>
                  <div className="mt-1 text-sm">{selectedProduct ? (selectedProduct.price ?? 0).toLocaleString('vi-VN') : '-'}</div>
                </div>
                <div>
                  <Label>Ngày sản xuất</Label>
                  <div className="mt-1 text-sm">{selectedProduct ? fmtDate(selectedProduct.manufacture_date) : '-'}</div>
                </div>
                <div>
                  <Label>Ngày nhập kho</Label>
                  <div className="mt-1 text-sm">{selectedProduct ? fmtDate(selectedProduct.stockInDate as any) : '-'}</div>
                </div>
                {/* Category fields removed as requested */}
              </div>
              <div className="grid gap-2">
                <Label>Mô tả</Label>
                <div className="text-sm text-muted-foreground whitespace-pre-wrap">{selectedProduct?.description || '-'}</div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>Đóng</Button>
                {selectedProduct && (
                  <Button onClick={() => { openEditDialog(selectedProduct); setIsDetailDialogOpen(false); }}>
                    <Pencil className="w-4 h-4 mr-2" /> Sửa
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </DealerManagerLayout>
    </ProtectedRoute>
  );
}
