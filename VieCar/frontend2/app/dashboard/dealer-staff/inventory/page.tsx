"use client";

import { useEffect, useMemo, useState } from "react";
import { ProtectedRoute } from "@/components/auth-guards";
import DealerStaffLayout from "@/components/layout/dealer-staff-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Search, Car, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getAllProducts, createProduct } from "@/lib/productApi";
import { getAllCategories } from "@/lib/categoryApi";
import type { ProductRes, ProductStatus, ProductReq } from "@/types/product";
import type { CategoryRes } from "@/types/category";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function InventoryPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<ProductRes[]>([]);
  const [categories, setCategories] = useState<CategoryRes[]>([]);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | undefined>(undefined);

  // Create dialog state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    vinNum: "",
    engineNum: "",
    color: "",
    dealerPrice: 0,
    status: "ACTIVE" as ProductStatus,
    categoryId: 0,
    description: "",
  });

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [prod, cats] = await Promise.all([
          getAllProducts(),
          getAllCategories(),
        ]);
        setProducts(prod || []);
        setCategories(cats || []);
      } catch (e: any) {
        toast({ title: "❌ Lỗi", description: e.message || "Không thể tải dữ liệu", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    return (products || []).filter((p) => {
      const matchSearch =
        p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.vinNum?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.engineNum?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = selectedStatus === "all" || p.status === selectedStatus;
      const matchCat = selectedCategoryId ? p.categoryId === selectedCategoryId : true;
      return matchSearch && matchStatus && matchCat;
    });
  }, [products, searchTerm, selectedStatus, selectedCategoryId]);

  const counts = useMemo(() => {
    return {
      total: products.length,
      active: products.filter((p) => p.status === "ACTIVE").length,
      inactive: products.filter((p) => p.status === "INACTIVE").length,
      soldout: products.filter((p) => p.status === "SOLDOUT").length,
    };
  }, [products]);

  const handleCreate = async () => {
    if (!form.name || !form.vinNum || !form.engineNum || !form.color || !form.dealerPrice || !form.categoryId) {
      toast({ title: "⚠️ Thiếu thông tin", description: "Vui lòng nhập đủ Tên, VIN, Engine, Màu, Giá và Danh mục", variant: "destructive" });
      return;
    }
    try {
      setLoading(true);
      const req: ProductReq = {
        name: form.name,
        vinNum: form.vinNum,
        engineNum: form.engineNum,
        battery: 0,
        range: 0,
        hp: 0,
        torque: 0,
        color: form.color,
        manufacture_date: new Date().toISOString(),
        dealerPrice: Number(form.dealerPrice) || 0,
        description: form.description || "",
        status: form.status,
        categoryId: form.categoryId,
        dealerCategoryId: 0,
        image: "",
      };
      await createProduct(req as any);
      toast({ title: "✅ Thêm xe thành công", description: `${form.name} đã được thêm vào kho` });
      setIsCreateOpen(false);
      setForm({ name: "", vinNum: "", engineNum: "", color: "", dealerPrice: 0, status: "ACTIVE" as ProductStatus, categoryId: 0, description: "" });
      const prod = await getAllProducts();
      setProducts(prod || []);
    } catch (e: any) {
      toast({ title: "❌ Lỗi", description: e.message || "Không thể thêm xe", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={["Dealer Staff"]}>
      <DealerStaffLayout>
        <div className="p-6 space-y-6">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Package className="w-8 h-8" />
              Kho xe đại lý
            </h1>
            <p className="text-muted-foreground mt-2">
              Kiểm tra số lượng xe có sẵn, màu sắc và phiên bản trong kho
            </p>
            <div className="mt-4">
              <Button onClick={() => setIsCreateOpen(true)}>
                <Plus className="w-4 h-4 mr-2" /> Thêm xe vào kho
              </Button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Tổng số xe
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{counts.total}</div>
                <p className="text-xs text-muted-foreground mt-1">Tổng số sản phẩm</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Đang hoạt động
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{counts.active}</div>
                <p className="text-xs text-muted-foreground mt-1">Sẵn sàng bán</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Hết hàng
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">{counts.soldout}</div>
                <p className="text-xs text-muted-foreground mt-1">Đã bán hết</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Ngưng hoạt động
                </CardTitle>
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
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                Tìm kiếm & Lọc
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Tìm theo tên xe, màu sắc, phiên bản..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="w-[260px]">
                  <Label>Danh mục</Label>
                  <Select
                    value={selectedCategoryId ? selectedCategoryId.toString() : undefined}
                    onValueChange={(v) => setSelectedCategoryId(parseInt(v))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Tất cả danh mục" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={"" as any}>Tất cả</SelectItem>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Tabs value={selectedStatus} onValueChange={setSelectedStatus}>
                <TabsList>
                  <TabsTrigger value="all">Tất cả</TabsTrigger>
                  <TabsTrigger value="ACTIVE">Đang hoạt động</TabsTrigger>
                  <TabsTrigger value="SOLDOUT">Hết hàng</TabsTrigger>
                  <TabsTrigger value="INACTIVE">Ngưng hoạt động</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardContent>
          </Card>

          {/* Inventory Table */}
          <Card>
            <CardHeader>
              <CardTitle>Danh sách xe trong kho</CardTitle>
              <CardDescription>Hiển thị {filtered.length} trên {products.length} sản phẩm</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Tên xe</th>
                      <th className="text-left py-3 px-4">VIN</th>
                      <th className="text-left py-3 px-4">Engine</th>
                      <th className="text-left py-3 px-4">Màu</th>
                      <th className="text-left py-3 px-4">Danh mục</th>
                      <th className="text-left py-3 px-4">Trạng thái</th>
                      <th className="text-right py-3 px-4">Giá</th>
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
                        <td className="py-3 px-4"><Badge variant="outline">{(p as any).color || "-"}</Badge></td>
                        <td className="py-3 px-4">{categories.find(c => c.id === p.categoryId)?.name || "-"}</td>
                        <td className="py-3 px-4">
                          <Badge className={
                            p.status === "ACTIVE" ? "bg-green-500" : p.status === "SOLDOUT" ? "bg-red-500" : "bg-gray-400"
                          }>
                            {p.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right font-medium">{(p as any).price?.toLocaleString('vi-VN') || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filtered.length === 0 && (
                <div className="py-12 text-center">
                  <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Không tìm thấy xe trong kho</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Dialog: Thêm xe vào kho */}
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>➕ Thêm xe vào kho</DialogTitle>
                <DialogDescription>Nhập thông tin xe và chọn danh mục</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Tên xe *</Label>
                    <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                  </div>
                  <div>
                    <Label>Màu *</Label>
                    <Input value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} />
                  </div>
                  <div>
                    <Label>VIN *</Label>
                    <Input value={form.vinNum} onChange={(e) => setForm({ ...form, vinNum: e.target.value })} />
                  </div>
                  <div>
                    <Label>Engine *</Label>
                    <Input value={form.engineNum} onChange={(e) => setForm({ ...form, engineNum: e.target.value })} />
                  </div>
                  <div>
                    <Label>Giá đại lý (VND) *</Label>
                    <Input type="number" value={form.dealerPrice} onChange={(e) => setForm({ ...form, dealerPrice: Number(e.target.value) || 0 })} />
                  </div>
                  <div>
                    <Label>Danh mục *</Label>
                    <Select
                      value={form.categoryId > 0 ? form.categoryId.toString() : undefined}
                      onValueChange={(v) => setForm({ ...form, categoryId: parseInt(v) })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn danh mục" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((c) => (
                          <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Mô tả</Label>
                  <Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Hủy</Button>
                <Button onClick={handleCreate} disabled={loading}>Lưu</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </DealerStaffLayout>
    </ProtectedRoute>
  );
}
