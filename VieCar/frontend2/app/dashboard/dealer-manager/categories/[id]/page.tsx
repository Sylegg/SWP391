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
import { Package, Search, Car, Plus, ArrowLeft, Trash2, RefreshCw, Eye, Pencil, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
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
      console.log('📦 Products loaded:', prods);
      if (prods && prods.length > 0) {
        console.log('🔍 First product prices:', {
          manufacturerPrice: prods[0].manufacturerPrice,
          retailPrice: prods[0].retailPrice,
          price: prods[0].price
        });
      }
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
    
    // ⚠️ CRITICAL: Remove manufacturerPrice from update payload
    // Manufacturer price CANNOT be changed, only set during creation
    delete payload.manufacturerPrice;
    
    // ✅ Map dealerPrice to retailPrice (new structure)
    if (payload.dealerPrice) {
      payload.retailPrice = payload.dealerPrice;
    }
    
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
      dealerPrice: product.retailPrice ?? product.price ?? 0,
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
      console.log('🔍 Update payload:', payload);
      console.log('📊 Giá hãng hiện tại (không đổi):', selectedProduct.manufacturerPrice);
      console.log('💰 Giá đại lý mới:', payload.dealerPrice);
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

  const handleDeactivateConfirm = (product: ProductRes) => {
    setSelectedProduct(product);
    setIsDeleteDialogOpen(true);
  };

  const handleDeactivate = async () => {
    if (!selectedProduct) return;
    try {
      // Chuyển trạng thái sang INACTIVE thay vì xóa
      const payload: Partial<ProductReq> = {
        name: selectedProduct.name,
        vinNum: selectedProduct.vinNum,
        engineNum: selectedProduct.engineNum,
        battery: selectedProduct.battery,
        range: selectedProduct.range,
        hp: selectedProduct.hp,
        torque: selectedProduct.torque,
        color: selectedProduct.color || '',
        manufacture_date: selectedProduct.manufacture_date,
        stockInDate: selectedProduct.stockInDate,
        dealerPrice: selectedProduct.retailPrice ?? selectedProduct.price ?? 0,
        description: selectedProduct.description,
        status: ProductStatus.INACTIVE,
      };
      
      const updated = await updateProduct(selectedProduct.id, payload as ProductReq);
      setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      toast({ 
        title: "✅ Đã vô hiệu hóa", 
        description: `Sản phẩm "${selectedProduct.name}" đã chuyển sang trạng thái không hoạt động` 
      });
      setIsDeleteDialogOpen(false);
      setSelectedProduct(null);
      load();
    } catch (e: any) {
      toast({ title: "❌ Lỗi", description: e.message || "Không thể thay đổi trạng thái", variant: "destructive" });
    }
  };

  return (
    <ProtectedRoute allowedRoles={["Dealer Manager"]}>
      <DealerManagerLayout>
        <div className="p-6 space-y-6">
          {/* Liquid Glass Header */}
          <div className="backdrop-blur-md bg-white/70 dark:bg-gray-900/70 p-6 rounded-2xl border border-white/20 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-2">
                  <Package className="w-8 h-8 text-blue-600" />
                  Sản phẩm theo danh mục
                </h1>
                <p className="text-muted-foreground mt-2">
                  {category ? (
                    <>
                      Danh mục: <span className="font-semibold">{category.name}</span>{" "}
                      {category.brand && <Badge variant="outline" className="ml-2 backdrop-blur-sm bg-white/50 dark:bg-gray-800/50">{category.brand}</Badge>}
                    </>
                  ) : (
                    "Đang tải danh mục..."
                  )}
                </p>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => router.push("/dashboard/dealer-manager/categories")}
                  className="backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 hover:bg-white/80 dark:hover:bg-gray-800/80 hover:scale-105 transition-all duration-300"
                >
                  <ArrowLeft className="w-4 h-4 mr-2"/> Quay lại
                </Button>
                <Button 
                  onClick={() => { resetForm(); setIsCreateDialogOpen(true); }}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <Plus className="w-4 h-4 mr-2" /> Thêm sản phẩm
                </Button>
              </div>
            </div>
          </div>

          {/* Stats Cards with Glass Effect */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="backdrop-blur-md bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-white/30 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">Tổng số xe</p>
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{counts.total}</div>
                  <p className="text-xs text-muted-foreground mt-1">Trong danh mục này</p>
                </div>
                <Package className="w-12 h-12 text-blue-500 opacity-20 group-hover:opacity-40 transition-opacity" />
              </div>
              <div className="mt-2 h-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            </div>
            
            <div className="backdrop-blur-md bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-white/30 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700 dark:text-green-300 mb-1">Đang hoạt động</p>
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400">{counts.active}</div>
                  <p className="text-xs text-muted-foreground mt-1">Sẵn sàng bán</p>
                </div>
                <CheckCircle2 className="w-12 h-12 text-green-500 opacity-20 group-hover:opacity-40 transition-opacity" />
              </div>
              <div className="mt-2 h-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            </div>
            
            <div className="backdrop-blur-md bg-gradient-to-br from-red-500/20 to-rose-500/20 border border-white/30 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-700 dark:text-red-300 mb-1">Hết hàng</p>
                  <div className="text-3xl font-bold text-red-600 dark:text-red-400">{counts.soldout}</div>
                  <p className="text-xs text-muted-foreground mt-1">Đã bán hết</p>
                </div>
                <XCircle className="w-12 h-12 text-red-500 opacity-20 group-hover:opacity-40 transition-opacity" />
              </div>
              <div className="mt-2 h-1 bg-gradient-to-r from-red-500 to-rose-500 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            </div>
            
            <div className="backdrop-blur-md bg-gradient-to-br from-gray-500/20 to-slate-500/20 border border-white/30 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ngưng hoạt động</p>
                  <div className="text-3xl font-bold text-gray-600 dark:text-gray-400">{counts.inactive}</div>
                  <p className="text-xs text-muted-foreground mt-1">Ẩn khỏi bán hàng</p>
                </div>
                <AlertCircle className="w-12 h-12 text-gray-500 opacity-20 group-hover:opacity-40 transition-opacity" />
              </div>
              <div className="mt-2 h-1 bg-gradient-to-r from-gray-500 to-slate-500 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            </div>
          </div>

          {/* Search & Filter with Glass Effect */}
          <div className="backdrop-blur-md bg-white/60 dark:bg-gray-900/60 rounded-2xl border border-white/20 shadow-lg p-6">
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
              <Search className="w-5 h-5 text-primary" />
              Tìm kiếm & Lọc
            </h3>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Input 
                    placeholder="Tìm theo tên xe, VIN, Engine..." 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-white/30"
                  />
                </div>
              </div>
              <Tabs value={selectedStatus} onValueChange={setSelectedStatus}>
                <TabsList className="backdrop-blur-sm bg-white/50 dark:bg-gray-800/50">
                  <TabsTrigger value="all">Tất cả</TabsTrigger>
                  <TabsTrigger value={ProductStatus.ACTIVE}>Đang hoạt động</TabsTrigger>
                  <TabsTrigger value={ProductStatus.SOLDOUT}>Hết hàng</TabsTrigger>
                  <TabsTrigger value={ProductStatus.INACTIVE}>Ngưng hoạt động</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>

          {/* Products Grid */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold">Danh sách sản phẩm</h2>
                <p className="text-sm text-muted-foreground">Hiển thị {filtered.length} trên {products.length} sản phẩm</p>
              </div>
            </div>

            {filtered.length === 0 ? (
              <Card>
                <CardContent className="py-16">
                  <div className="text-center">
                    <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <p className="text-lg font-medium text-muted-foreground">Chưa có sản phẩm trong danh mục này</p>
                    <p className="text-sm text-muted-foreground mt-2">Thêm sản phẩm đầu tiên để bắt đầu</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((p) => {
                  const manufacturerPrice = p.manufacturerPrice ?? p.price ?? 0;
                  const retailPrice = p.retailPrice ?? p.price ?? 0;
                  const profit = retailPrice - manufacturerPrice;
                  const profitPercent = manufacturerPrice > 0 ? ((profit / manufacturerPrice) * 100).toFixed(1) : '0';

                  return (
                    <Card 
                      key={p.id} 
                      className="overflow-hidden hover:shadow-2xl hover:shadow-primary/20 transition-all duration-500 group relative backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border border-white/20 dark:border-gray-700/30 hover:border-primary/50 hover:scale-[1.02] hover:-translate-y-1"
                      style={{
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                      }}
                    >
                      {/* Liquid Glass Shine Effect */}
                      <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                      
                      {/* Animated Border Gradient */}
                      <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                        <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary/20 via-blue-500/20 to-purple-500/20 blur-sm" />
                      </div>
                      
                      <CardHeader className="pb-3 bg-gradient-to-br from-primary/10 via-blue-500/5 to-purple-500/10 dark:from-primary/20 dark:via-blue-500/10 dark:to-purple-500/20 backdrop-blur-sm relative z-10">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="p-2 rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm shadow-sm">
                                <Car className="w-5 h-5 text-primary" />
                              </div>
                              <CardTitle className="text-lg line-clamp-1 drop-shadow-sm">{p.name}</CardTitle>
                            </div>
                            <Badge className={`${ProductStatusColors[p.status]} shadow-sm backdrop-blur-sm`}>
                              {ProductStatusLabels[p.status] || p.status}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="pt-4 space-y-4 relative z-10">
                        {/* Thông số kỹ thuật */}
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="flex items-center gap-2 p-2 rounded-lg bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm hover:bg-white/60 dark:hover:bg-gray-800/60 transition-colors">
                            <div className="w-2 h-2 rounded-full bg-primary shadow-lg shadow-primary/50"></div>
                            <span className="text-muted-foreground">VIN:</span>
                            <span className="font-medium truncate">{p.vinNum}</span>
                          </div>
                          <div className="flex items-center gap-2 p-2 rounded-lg bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm hover:bg-white/60 dark:hover:bg-gray-800/60 transition-colors">
                            <div className="w-2 h-2 rounded-full bg-primary shadow-lg shadow-primary/50"></div>
                            <span className="text-muted-foreground">Màu:</span>
                            <span className="font-medium">{p.color || '-'}</span>
                          </div>
                          <div className="flex items-center gap-2 p-2 rounded-lg bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm hover:bg-white/60 dark:hover:bg-gray-800/60 transition-colors">
                            <div className="w-2 h-2 rounded-full bg-orange-500 shadow-lg shadow-orange-500/50"></div>
                            <span className="text-muted-foreground">Pin:</span>
                            <span className="font-medium">{p.battery} kWh</span>
                          </div>
                          <div className="flex items-center gap-2 p-2 rounded-lg bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm hover:bg-white/60 dark:hover:bg-gray-800/60 transition-colors">
                            <div className="w-2 h-2 rounded-full bg-green-500 shadow-lg shadow-green-500/50"></div>
                            <span className="text-muted-foreground">Range:</span>
                            <span className="font-medium">{p.range} km</span>
                          </div>
                          <div className="flex items-center gap-2 p-2 rounded-lg bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm hover:bg-white/60 dark:hover:bg-gray-800/60 transition-colors">
                            <div className="w-2 h-2 rounded-full bg-red-500 shadow-lg shadow-red-500/50"></div>
                            <span className="text-muted-foreground">HP:</span>
                            <span className="font-medium">{p.hp}</span>
                          </div>
                          <div className="flex items-center gap-2 p-2 rounded-lg bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm hover:bg-white/60 dark:hover:bg-gray-800/60 transition-colors">
                            <div className="w-2 h-2 rounded-full bg-purple-500 shadow-lg shadow-purple-500/50"></div>
                            <span className="text-muted-foreground">Torque:</span>
                            <span className="font-medium">{p.torque} Nm</span>
                          </div>
                        </div>

                        {/* Separator với glass effect */}
                        <div className="relative h-[1px] bg-gradient-to-r from-transparent via-gray-300/50 dark:via-gray-600/50 to-transparent">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent blur-sm"></div>
                        </div>

                        {/* Pricing Info với glass cards */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 rounded-lg bg-blue-500/10 dark:bg-blue-500/20 backdrop-blur-sm border border-blue-500/20 hover:border-blue-500/40 transition-all hover:shadow-lg hover:shadow-blue-500/20">
                            <span className="text-sm text-muted-foreground">Giá hãng:</span>
                            <span className="text-base font-bold text-blue-600 dark:text-blue-400 drop-shadow-sm">
                              {manufacturerPrice.toLocaleString('vi-VN')} ₫
                            </span>
                          </div>
                          <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10 dark:bg-green-500/20 backdrop-blur-sm border border-green-500/20 hover:border-green-500/40 transition-all hover:shadow-lg hover:shadow-green-500/20">
                            <span className="text-sm text-muted-foreground">Giá đại lý:</span>
                            <span className="text-base font-bold text-green-600 dark:text-green-400 drop-shadow-sm">
                              {retailPrice.toLocaleString('vi-VN')} ₫
                            </span>
                          </div>
                          <div className="relative overflow-hidden p-3 rounded-lg bg-gradient-to-br from-emerald-500/20 via-green-500/20 to-teal-500/20 dark:from-emerald-500/30 dark:via-green-500/30 dark:to-teal-500/30 backdrop-blur-md border border-emerald-500/30 shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/30 transition-all">
                            {/* Animated shimmer effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                            
                            <div className="flex items-center justify-between relative z-10">
                              <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">Lợi nhuận:</span>
                              <div className="text-right">
                                <div className="text-sm font-bold text-emerald-700 dark:text-emerald-400 drop-shadow-sm">
                                  {profit.toLocaleString('vi-VN')} ₫
                                </div>
                                <div className="text-xs text-emerald-600 dark:text-emerald-500">
                                  (+{profitPercent}%)
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons với glass effect */}
                        <div className="flex gap-2 pt-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm hover:bg-white/80 dark:hover:bg-gray-800/80 hover:border-primary hover:text-primary hover:shadow-lg hover:shadow-primary/20 transition-all duration-300"
                            onClick={() => openDetailDialog(p)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Xem
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm hover:bg-white/80 dark:hover:bg-gray-800/80 hover:border-orange-500 hover:text-orange-600 hover:shadow-lg hover:shadow-orange-500/20 transition-all duration-300"
                            onClick={() => handleDeactivateConfirm(p)}
                            disabled={p.status === ProductStatus.INACTIVE}
                          >
                            <AlertCircle className="w-4 h-4 mr-2" />
                            {p.status === ProductStatus.INACTIVE ? 'Đã vô hiệu' : 'Vô hiệu hóa'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* Create Dialog */}
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto backdrop-blur-xl bg-white/95 dark:bg-gray-900/95 border-white/20">
              <DialogHeader className="space-y-3 pb-4 border-b border-gradient-to-r from-transparent via-gray-200/50 dark:via-gray-700/50 to-transparent">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-sm">
                    <Plus className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <DialogTitle className="text-2xl">Thêm sản phẩm vào danh mục</DialogTitle>
                    <DialogDescription className="text-base">
                      Danh mục: <span className="font-semibold">#{categoryId} - {category?.name}</span>
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {/* Basic Info Section */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent"></div>
                    <span>Thông tin cơ bản</span>
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent"></div>
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2 p-4 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-white/20">
                      <Label htmlFor="create-name" className="text-xs uppercase tracking-wider text-muted-foreground">Tên sản phẩm *</Label>
                      <Input 
                        id="create-name" 
                        value={formData.name} 
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-white/20"
                        placeholder="Nhập tên sản phẩm"
                      />
                    </div>
                    <div className="space-y-2 p-4 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-white/20">
                      <Label htmlFor="create-color" className="text-xs uppercase tracking-wider text-muted-foreground">Màu sắc</Label>
                      <Input 
                        id="create-color" 
                        value={formData.color} 
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                        className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-white/20"
                        placeholder="Nhập màu sắc"
                      />
                    </div>
                  </div>
                </div>

                {/* VIN & Engine Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent"></div>
                      <span>Số VIN & Engine</span>
                      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent"></div>
                    </h4>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={handleAutoFillVinEngine}
                      className="backdrop-blur-sm bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 hover:scale-105 transition-all"
                    >
                      🎲 Tạo mã tự động
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2 p-4 rounded-xl bg-gradient-to-br from-blue-50/80 to-cyan-50/80 dark:from-blue-950/30 dark:to-cyan-950/30 backdrop-blur-sm border border-blue-200/30">
                      <Label htmlFor="create-vin" className="text-xs uppercase tracking-wider text-blue-700 dark:text-blue-400">Số VIN *</Label>
                      <Input 
                        id="create-vin" 
                        value={formData.vinNum} 
                        onChange={(e) => setFormData({ ...formData, vinNum: e.target.value })}
                        className="font-mono bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-white/20"
                        placeholder="VIN-XXXXXX"
                      />
                    </div>
                    <div className="space-y-2 p-4 rounded-xl bg-gradient-to-br from-blue-50/80 to-cyan-50/80 dark:from-blue-950/30 dark:to-cyan-950/30 backdrop-blur-sm border border-blue-200/30">
                      <Label htmlFor="create-engine" className="text-xs uppercase tracking-wider text-blue-700 dark:text-blue-400">Số máy *</Label>
                      <Input 
                        id="create-engine" 
                        value={formData.engineNum} 
                        onChange={(e) => setFormData({ ...formData, engineNum: e.target.value })}
                        className="font-mono bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-white/20"
                        placeholder="ENG-XXXXXX"
                      />
                    </div>
                  </div>
                </div>

                {/* Technical Specs Section */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent"></div>
                    <span>Thông số kỹ thuật</span>
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent"></div>
                  </h4>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="space-y-2 p-4 rounded-xl bg-gradient-to-br from-orange-50/80 to-amber-50/80 dark:from-orange-950/30 dark:to-amber-950/30 backdrop-blur-sm border border-orange-200/30">
                      <Label htmlFor="create-battery" className="text-xs uppercase tracking-wider text-orange-700 dark:text-orange-400">Pin (kWh)</Label>
                      <Input 
                        id="create-battery" 
                        type="number" 
                        step="0.1" 
                        value={formData.battery} 
                        onChange={(e) => setFormData({ ...formData, battery: parseFloat(e.target.value) || 0 })}
                        className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-white/20"
                      />
                    </div>
                    <div className="space-y-2 p-4 rounded-xl bg-gradient-to-br from-green-50/80 to-emerald-50/80 dark:from-green-950/30 dark:to-emerald-950/30 backdrop-blur-sm border border-green-200/30">
                      <Label htmlFor="create-range" className="text-xs uppercase tracking-wider text-green-700 dark:text-green-400">Range (km)</Label>
                      <Input 
                        id="create-range" 
                        type="number" 
                        value={formData.range} 
                        onChange={(e) => setFormData({ ...formData, range: parseInt(e.target.value) || 0 })}
                        className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-white/20"
                      />
                    </div>
                    <div className="space-y-2 p-4 rounded-xl bg-gradient-to-br from-red-50/80 to-rose-50/80 dark:from-red-950/30 dark:to-rose-950/30 backdrop-blur-sm border border-red-200/30">
                      <Label htmlFor="create-hp" className="text-xs uppercase tracking-wider text-red-700 dark:text-red-400">HP</Label>
                      <Input 
                        id="create-hp" 
                        type="number" 
                        value={formData.hp} 
                        onChange={(e) => setFormData({ ...formData, hp: parseInt(e.target.value) || 0 })}
                        className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-white/20"
                      />
                    </div>
                    <div className="space-y-2 p-4 rounded-xl bg-gradient-to-br from-purple-50/80 to-pink-50/80 dark:from-purple-950/30 dark:to-pink-950/30 backdrop-blur-sm border border-purple-200/30">
                      <Label htmlFor="create-torque" className="text-xs uppercase tracking-wider text-purple-700 dark:text-purple-400">Torque (Nm)</Label>
                      <Input 
                        id="create-torque" 
                        type="number" 
                        value={formData.torque} 
                        onChange={(e) => setFormData({ ...formData, torque: parseInt(e.target.value) || 0 })}
                        className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-white/20"
                      />
                    </div>
                  </div>
                </div>

                {/* Dates & Pricing Section */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent"></div>
                    <span>Ngày tháng & Giá cả</span>
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent"></div>
                  </h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2 p-4 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-white/20">
                      <Label htmlFor="create-date" className="text-xs uppercase tracking-wider text-muted-foreground">Ngày sản xuất</Label>
                      <Input 
                        id="create-date" 
                        type="date" 
                        value={typeof formData.manufacture_date === 'string' ? formData.manufacture_date : (formData.manufacture_date instanceof Date ? formData.manufacture_date.toISOString().split('T')[0] : '')} 
                        onChange={(e) => setFormData({ ...formData, manufacture_date: e.target.value })}
                        className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-white/20"
                      />
                    </div>
                    <div className="space-y-2 p-4 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-white/20">
                      <Label htmlFor="create-stock-in" className="text-xs uppercase tracking-wider text-muted-foreground">Ngày nhập kho</Label>
                      <Input 
                        id="create-stock-in" 
                        type="date" 
                        value={typeof formData.stockInDate === 'string' ? formData.stockInDate : (formData.stockInDate instanceof Date ? formData.stockInDate.toISOString().split('T')[0] : '')} 
                        onChange={(e) => setFormData({ ...formData, stockInDate: e.target.value })}
                        className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-white/20"
                      />
                    </div>
                    <div className="space-y-2 p-4 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-md border border-green-500/30">
                      <Label htmlFor="create-price" className="text-xs uppercase tracking-wider text-green-700 dark:text-green-300">Giá đại lý (VNĐ) *</Label>
                      <Input 
                        id="create-price" 
                        type="number" 
                        value={formData.dealerPrice} 
                        onChange={(e) => setFormData({ ...formData, dealerPrice: parseFloat(e.target.value) || 0 })} 
                        placeholder="Nhập giá bán"
                        className="font-semibold bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-green-500/30"
                      />
                    </div>
                  </div>
                </div>

                {/* Category & Status Section */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent"></div>
                    <span>Phân loại & Trạng thái</span>
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent"></div>
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2 p-4 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-white/20">
                      <Label className="text-xs uppercase tracking-wider text-muted-foreground">Danh mục</Label>
                      <Input 
                        value={`#${categoryId} - ${category?.name || ''}`} 
                        disabled
                        className="bg-gray-50 dark:bg-gray-900/50 cursor-not-allowed"
                      />
                    </div>
                    <div className="space-y-2 p-4 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-white/20">
                      <Label htmlFor="create-status" className="text-xs uppercase tracking-wider text-muted-foreground">Trạng thái</Label>
                      <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v as ProductStatus })}>
                        <SelectTrigger id="create-status" className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-white/20">
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
                </div>

                {/* Description Section */}
                <div className="space-y-3 p-5 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-gray-800/50 dark:to-gray-900/50 backdrop-blur-sm border border-white/20">
                  <Label htmlFor="create-desc" className="text-xs uppercase tracking-wider text-muted-foreground">Mô tả</Label>
                  <Textarea 
                    id="create-desc" 
                    rows={4} 
                    value={formData.description} 
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-white/20 resize-none"
                    placeholder="Nhập mô tả sản phẩm..."
                  />
                </div>
              </div>

              <DialogFooter className="gap-2 border-t border-gradient-to-r from-transparent via-gray-200/50 dark:via-gray-700/50 to-transparent pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setIsCreateDialogOpen(false)}
                  className="backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 hover:bg-white/80 dark:hover:bg-gray-800/80"
                >
                  Hủy
                </Button>
                <Button 
                  onClick={handleCreate} 
                  disabled={loading}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg shadow-blue-500/30"
                >
                  {loading ? "Đang lưu..." : "Tạo sản phẩm"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Edit Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto backdrop-blur-xl bg-white/95 dark:bg-gray-900/95 border-white/20">
              <DialogHeader className="space-y-3 pb-4 border-b border-gradient-to-r from-transparent via-gray-200/50 dark:via-gray-700/50 to-transparent">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-blue-500/20 backdrop-blur-sm">
                    <Pencil className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <DialogTitle className="text-2xl">Chỉnh sửa sản phẩm</DialogTitle>
                    <DialogDescription className="text-base">
                      Danh mục: <span className="font-semibold">#{categoryId} - {category?.name}</span>
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {/* Basic Info Section */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent"></div>
                    <span>Thông tin cơ bản</span>
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent"></div>
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2 p-4 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-white/20">
                      <Label className="text-xs uppercase tracking-wider text-muted-foreground">Tên sản phẩm *</Label>
                      <Input 
                        value={formData.name} 
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-white/20 focus:border-primary/50 transition-all"
                        placeholder="Nhập tên sản phẩm"
                      />
                    </div>
                    <div className="space-y-2 p-4 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-white/20">
                      <Label className="text-xs uppercase tracking-wider text-muted-foreground">Màu sắc</Label>
                      <Input 
                        value={formData.color} 
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                        className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-white/20 focus:border-primary/50 transition-all"
                        placeholder="Nhập màu sắc"
                      />
                    </div>
                  </div>
                </div>

                {/* VIN & Engine Section */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent"></div>
                    <span>Số VIN & Engine</span>
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent"></div>
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2 p-4 rounded-xl bg-gradient-to-br from-blue-50/80 to-primary-50/80 dark:from-blue-950/30 dark:to-primary-950/30 backdrop-blur-sm border border-blue-200/30 dark:border-blue-700/30">
                      <Label className="text-xs uppercase tracking-wider text-blue-700 dark:text-blue-400 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500 shadow-lg shadow-blue-500/50"></div>
                        Số VIN *
                      </Label>
                      <Input 
                        value={formData.vinNum} 
                        onChange={(e) => setFormData({ ...formData, vinNum: e.target.value })}
                        className="font-mono bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-white/20 focus:border-blue-500/50 transition-all"
                        placeholder="Nhập số VIN"
                      />
                    </div>
                    <div className="space-y-2 p-4 rounded-xl bg-gradient-to-br from-blue-50/80 to-primary-50/80 dark:from-blue-950/30 dark:to-primary-950/30 backdrop-blur-sm border border-blue-200/30 dark:border-blue-700/30">
                      <Label className="text-xs uppercase tracking-wider text-blue-700 dark:text-blue-400 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500 shadow-lg shadow-blue-500/50"></div>
                        Số máy *
                      </Label>
                      <Input 
                        value={formData.engineNum} 
                        onChange={(e) => setFormData({ ...formData, engineNum: e.target.value })}
                        className="font-mono bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-white/20 focus:border-blue-500/50 transition-all"
                        placeholder="Nhập số máy"
                      />
                    </div>
                  </div>
                </div>

                {/* Technical Specs Section */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent"></div>
                    <span>Thông số kỹ thuật</span>
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent"></div>
                  </h4>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="space-y-2 p-4 rounded-xl bg-gradient-to-br from-orange-50/80 to-orange-100/50 dark:from-orange-950/30 dark:to-orange-900/20 backdrop-blur-sm border border-orange-200/30 dark:border-orange-700/30">
                      <Label className="text-xs uppercase tracking-wider text-orange-700 dark:text-orange-400 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-orange-500 shadow-lg shadow-orange-500/50"></div>
                        Pin (kWh)
                      </Label>
                      <Input 
                        type="number" 
                        step="0.1" 
                        value={formData.battery} 
                        onChange={(e) => setFormData({ ...formData, battery: parseFloat(e.target.value) || 0 })}
                        className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-white/20 focus:border-orange-500/50 transition-all"
                      />
                    </div>
                    <div className="space-y-2 p-4 rounded-xl bg-gradient-to-br from-green-50/80 to-green-100/50 dark:from-green-950/30 dark:to-green-900/20 backdrop-blur-sm border border-green-200/30 dark:border-green-700/30">
                      <Label className="text-xs uppercase tracking-wider text-green-700 dark:text-green-400 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 shadow-lg shadow-green-500/50"></div>
                        Range (km)
                      </Label>
                      <Input 
                        type="number" 
                        value={formData.range} 
                        onChange={(e) => setFormData({ ...formData, range: parseInt(e.target.value) || 0 })}
                        className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-white/20 focus:border-green-500/50 transition-all"
                      />
                    </div>
                    <div className="space-y-2 p-4 rounded-xl bg-gradient-to-br from-red-50/80 to-red-100/50 dark:from-red-950/30 dark:to-red-900/20 backdrop-blur-sm border border-red-200/30 dark:border-red-700/30">
                      <Label className="text-xs uppercase tracking-wider text-red-700 dark:text-red-400 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500 shadow-lg shadow-red-500/50"></div>
                        HP
                      </Label>
                      <Input 
                        type="number" 
                        value={formData.hp} 
                        onChange={(e) => setFormData({ ...formData, hp: parseInt(e.target.value) || 0 })}
                        className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-white/20 focus:border-red-500/50 transition-all"
                      />
                    </div>
                    <div className="space-y-2 p-4 rounded-xl bg-gradient-to-br from-purple-50/80 to-purple-100/50 dark:from-purple-950/30 dark:to-purple-900/20 backdrop-blur-sm border border-purple-200/30 dark:border-purple-700/30">
                      <Label className="text-xs uppercase tracking-wider text-purple-700 dark:text-purple-400 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-purple-500 shadow-lg shadow-purple-500/50"></div>
                        Torque (Nm)
                      </Label>
                      <Input 
                        type="number" 
                        value={formData.torque} 
                        onChange={(e) => setFormData({ ...formData, torque: parseInt(e.target.value) || 0 })}
                        className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-white/20 focus:border-purple-500/50 transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Dates & Pricing Section */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent"></div>
                    <span>Ngày tháng & Giá cả</span>
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent"></div>
                  </h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2 p-4 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-white/20">
                      <Label className="text-xs uppercase tracking-wider text-muted-foreground">Ngày sản xuất</Label>
                      <Input 
                        type="date" 
                        value={typeof formData.manufacture_date === 'string' ? formData.manufacture_date : (formData.manufacture_date instanceof Date ? formData.manufacture_date.toISOString().split('T')[0] : '')} 
                        onChange={(e) => setFormData({ ...formData, manufacture_date: e.target.value })}
                        className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-white/20 focus:border-primary/50 transition-all"
                      />
                    </div>
                    <div className="space-y-2 p-4 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-white/20">
                      <Label className="text-xs uppercase tracking-wider text-muted-foreground">Ngày nhập kho</Label>
                      <Input 
                        type="date" 
                        value={typeof formData.stockInDate === 'string' ? formData.stockInDate : (formData.stockInDate instanceof Date ? formData.stockInDate.toISOString().split('T')[0] : '')} 
                        onChange={(e) => setFormData({ ...formData, stockInDate: e.target.value })}
                        className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-white/20 focus:border-primary/50 transition-all"
                      />
                    </div>
                    <div className="space-y-2 p-4 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 dark:from-blue-500/30 dark:to-blue-600/20 backdrop-blur-md border border-blue-500/30">
                      <Label className="text-xs uppercase tracking-wider text-blue-700 dark:text-blue-300 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500 shadow-lg shadow-blue-500/50"></div>
                        Giá hãng (VNĐ) 🔒
                      </Label>
                      <Input 
                        type="number" 
                        value={selectedProduct?.manufacturerPrice ?? selectedProduct?.price ?? 0} 
                        disabled
                        className="bg-blue-50/50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300 font-bold cursor-not-allowed backdrop-blur-sm"
                        title="Giá hãng không thể thay đổi"
                      />
                    </div>
                  </div>
                </div>

                {/* Dealer Price - Highlighted */}
                <div className="relative overflow-hidden p-5 rounded-xl bg-gradient-to-br from-green-500/20 via-emerald-500/15 to-teal-500/20 dark:from-green-500/30 dark:via-emerald-500/25 dark:to-teal-500/30 backdrop-blur-md border border-green-500/30 shadow-lg shadow-green-500/20">
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-transparent to-transparent"></div>
                  <div className="relative z-10 space-y-3">
                    <Label className="text-sm font-semibold text-green-700 dark:text-green-300 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500 shadow-lg shadow-green-500/50"></div>
                      Giá đại lý (VNĐ) * ✏️
                    </Label>
                    <Input 
                      type="number" 
                      value={formData.dealerPrice} 
                      onChange={(e) => setFormData({ ...formData, dealerPrice: parseFloat(e.target.value) || 0 })} 
                      placeholder="Nhập giá bán của đại lý"
                      className="text-lg font-bold bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-green-500/30 focus:border-green-500 transition-all"
                    />
                    <p className="text-xs text-green-700/80 dark:text-green-300/80 flex items-center gap-2">
                      💡 Bạn có thể điều chỉnh giá bán ra của đại lý. Giá hãng sẽ không thay đổi.
                    </p>
                  </div>
                </div>

                {/* Category & Status Section */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent"></div>
                    <span>Phân loại & Trạng thái</span>
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent"></div>
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2 p-4 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-white/20">
                      <Label className="text-xs uppercase tracking-wider text-muted-foreground">Danh mục</Label>
                      <Input 
                        value={`#${categoryId} - ${category?.name || ''}`} 
                        disabled
                        className="bg-gray-50 dark:bg-gray-900/50 cursor-not-allowed"
                      />
                    </div>
                    <div className="space-y-2 p-4 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-white/20">
                      <Label className="text-xs uppercase tracking-wider text-muted-foreground">Trạng thái</Label>
                      <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v as ProductStatus })}>
                        <SelectTrigger className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-white/20">
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
                </div>

                {/* Description Section */}
                <div className="space-y-3 p-5 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-gray-800/50 dark:to-gray-900/50 backdrop-blur-sm border border-white/20">
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground">Mô tả</Label>
                  <Textarea 
                    rows={4} 
                    value={formData.description} 
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-white/20 focus:border-primary/50 transition-all resize-none"
                    placeholder="Nhập mô tả sản phẩm..."
                  />
                </div>
              </div>

              <DialogFooter className="gap-2 border-t border-gradient-to-r from-transparent via-gray-200/50 dark:via-gray-700/50 to-transparent pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditDialogOpen(false)}
                  className="backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 hover:bg-white/80 dark:hover:bg-gray-800/80"
                >
                  Hủy
                </Button>
                <Button 
                  onClick={handleUpdate} 
                  disabled={loading}
                  className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 shadow-lg shadow-primary/30"
                >
                  {loading ? "Đang lưu..." : "Lưu thay đổi"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Deactivate Confirm Dialog */}
          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogContent className="backdrop-blur-xl bg-white/95 dark:bg-gray-900/95 border-white/30">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
                  <AlertCircle className="w-6 h-6" />
                  Xác nhận vô hiệu hóa
                </DialogTitle>
                <DialogDescription>
                  Bạn có chắc muốn chuyển sản phẩm này sang trạng thái không hoạt động?
                  <br />
                  Sản phẩm sẽ không hiển thị cho khách hàng nhưng vẫn được lưu trong hệ thống.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4 px-4 rounded-lg bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800">
                <p className="font-semibold text-orange-900 dark:text-orange-100">
                  #{selectedProduct?.id} - {selectedProduct?.name}
                </p>
                {selectedProduct && (
                  <Badge className={`${ProductStatusColors[selectedProduct.status]} mt-2`}>
                    Trạng thái hiện tại: {ProductStatusLabels[selectedProduct.status]}
                  </Badge>
                )}
              </div>
              <DialogFooter className="gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setIsDeleteDialogOpen(false)}
                  className="backdrop-blur-sm bg-white/50 dark:bg-gray-800/50"
                >
                  Hủy
                </Button>
                <Button 
                  onClick={handleDeactivate}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                >
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Vô hiệu hóa
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Detail Dialog */}
          <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto backdrop-blur-xl bg-white/95 dark:bg-gray-900/95 border-white/20">
              <DialogHeader className="space-y-3 pb-4 border-b border-gradient-to-r from-transparent via-gray-200/50 dark:via-gray-700/50 to-transparent">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-blue-500/20 backdrop-blur-sm">
                    <Package className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <DialogTitle className="text-2xl">Thông tin sản phẩm</DialogTitle>
                    <DialogDescription className="text-base">
                      <span className="font-mono text-muted-foreground">#{selectedProduct?.id}</span> • <span className="font-semibold">{selectedProduct?.name}</span>
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {/* Product Name - Hero Section */}
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/10 via-blue-500/5 to-purple-500/10 dark:from-primary/20 dark:via-blue-500/10 dark:to-purple-500/20 p-6 backdrop-blur-sm border border-white/20">
                  <div className="absolute inset-0 bg-gradient-to-r from-white/40 via-transparent to-transparent"></div>
                  <div className="relative z-10">
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">Tên sản phẩm</Label>
                    <div className="flex items-center gap-3">
                      <Car className="w-6 h-6 text-primary" />
                      <h3 className="text-2xl font-bold">{selectedProduct?.name || '-'}</h3>
                    </div>
                  </div>
                </div>

                {/* Technical Specs Grid */}
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent"></div>
                    <span>Thông số kỹ thuật</span>
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent"></div>
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-white/20 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10 transition-all">
                      <Label className="text-xs text-muted-foreground mb-1 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary shadow-lg shadow-primary/50"></div>
                        VIN
                      </Label>
                      <div className="text-sm font-mono font-semibold mt-1">{selectedProduct?.vinNum}</div>
                    </div>
                    <div className="p-4 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-white/20 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10 transition-all">
                      <Label className="text-xs text-muted-foreground mb-1 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary shadow-lg shadow-primary/50"></div>
                        Engine
                      </Label>
                      <div className="text-sm font-mono font-semibold mt-1">{selectedProduct?.engineNum}</div>
                    </div>
                    <div className="p-4 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-white/20 hover:border-orange-500/30 hover:shadow-lg hover:shadow-orange-500/10 transition-all">
                      <Label className="text-xs text-muted-foreground mb-1 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-orange-500 shadow-lg shadow-orange-500/50"></div>
                        Pin (kWh)
                      </Label>
                      <div className="text-sm font-semibold mt-1">{selectedProduct?.battery}</div>
                    </div>
                    <div className="p-4 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-white/20 hover:border-green-500/30 hover:shadow-lg hover:shadow-green-500/10 transition-all">
                      <Label className="text-xs text-muted-foreground mb-1 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 shadow-lg shadow-green-500/50"></div>
                        Quãng đường (km)
                      </Label>
                      <div className="text-sm font-semibold mt-1">{selectedProduct?.range}</div>
                    </div>
                    <div className="p-4 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-white/20 hover:border-red-500/30 hover:shadow-lg hover:shadow-red-500/10 transition-all">
                      <Label className="text-xs text-muted-foreground mb-1 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500 shadow-lg shadow-red-500/50"></div>
                        Công suất (HP)
                      </Label>
                      <div className="text-sm font-semibold mt-1">{selectedProduct?.hp}</div>
                    </div>
                    <div className="p-4 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-white/20 hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/10 transition-all">
                      <Label className="text-xs text-muted-foreground mb-1 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-purple-500 shadow-lg shadow-purple-500/50"></div>
                        Mô-men (Nm)
                      </Label>
                      <div className="text-sm font-semibold mt-1">{selectedProduct?.torque}</div>
                    </div>
                    <div className="p-4 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-white/20 hover:border-pink-500/30 hover:shadow-lg hover:shadow-pink-500/10 transition-all">
                      <Label className="text-xs text-muted-foreground mb-1 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-pink-500 shadow-lg shadow-pink-500/50"></div>
                        Màu sắc
                      </Label>
                      <div className="text-sm font-semibold mt-1">{selectedProduct?.color || '-'}</div>
                    </div>
                    <div className="p-4 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-white/20 transition-all">
                      <Label className="text-xs text-muted-foreground mb-1">Trạng thái</Label>
                      <div className="mt-2">
                        {selectedProduct && (
                          <Badge className={`${ProductStatusColors[selectedProduct.status]} shadow-sm`}>
                            {ProductStatusLabels[selectedProduct.status]}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pricing Section */}
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent"></div>
                    <span>Thông tin giá</span>
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent"></div>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative overflow-hidden p-5 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 dark:from-blue-500/30 dark:to-blue-600/20 backdrop-blur-md border border-blue-500/30 shadow-lg shadow-blue-500/20">
                      <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-transparent to-transparent"></div>
                      <div className="relative z-10">
                        <Label className="text-xs text-blue-700 dark:text-blue-300 mb-2 block flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-blue-500 shadow-lg shadow-blue-500/50"></div>
                          Giá hãng
                        </Label>
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {selectedProduct ? (selectedProduct.manufacturerPrice ?? selectedProduct.price ?? 0).toLocaleString('vi-VN') : '-'} ₫
                        </div>
                      </div>
                    </div>
                    <div className="relative overflow-hidden p-5 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-600/10 dark:from-green-500/30 dark:to-emerald-600/20 backdrop-blur-md border border-green-500/30 shadow-lg shadow-green-500/20">
                      <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-transparent to-transparent"></div>
                      <div className="relative z-10">
                        <Label className="text-xs text-green-700 dark:text-green-300 mb-2 block flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-500 shadow-lg shadow-green-500/50"></div>
                          Giá đại lý
                        </Label>
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                          {selectedProduct ? (selectedProduct.retailPrice ?? selectedProduct.price ?? 0).toLocaleString('vi-VN') : '-'} ₫
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Profit Display */}
                  {selectedProduct && (() => {
                    const manufacturerPrice = selectedProduct.manufacturerPrice ?? selectedProduct.price ?? 0;
                    const retailPrice = selectedProduct.retailPrice ?? selectedProduct.price ?? 0;
                    const profit = retailPrice - manufacturerPrice;
                    const profitPercent = manufacturerPrice > 0 ? ((profit / manufacturerPrice) * 100).toFixed(1) : '0';
                    
                    return profit !== 0 && (
                      <div className="mt-4 relative overflow-hidden p-5 rounded-xl bg-gradient-to-br from-emerald-500/20 via-green-500/20 to-teal-500/20 dark:from-emerald-500/30 dark:via-green-500/30 dark:to-teal-500/30 backdrop-blur-md border border-emerald-500/30 shadow-xl shadow-emerald-500/20">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.3),transparent_50%)]"></div>
                        <div className="relative z-10 flex items-center justify-between">
                          <div>
                            <Label className="text-xs text-emerald-700 dark:text-emerald-300 mb-1 block">Lợi nhuận ước tính</Label>
                            <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                              {profit.toLocaleString('vi-VN')} ₫
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/20 backdrop-blur-sm border border-emerald-500/30">
                              <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">+{profitPercent}%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Dates Section */}
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent"></div>
                    <span>Thông tin ngày tháng</span>
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent"></div>
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-white/20">
                      <Label className="text-xs text-muted-foreground mb-1 block">Ngày sản xuất</Label>
                      <div className="text-sm font-semibold mt-1">{selectedProduct ? fmtDate(selectedProduct.manufacture_date) : '-'}</div>
                    </div>
                    <div className="p-4 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-white/20">
                      <Label className="text-xs text-muted-foreground mb-1 block">Ngày nhập kho</Label>
                      <div className="text-sm font-semibold mt-1">{selectedProduct ? fmtDate(selectedProduct.stockInDate as any) : '-'}</div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                {selectedProduct?.description && (
                  <div className="p-5 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-gray-800/50 dark:to-gray-900/50 backdrop-blur-sm border border-white/20">
                    <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-3 block">Mô tả</Label>
                    <div className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{selectedProduct.description}</div>
                  </div>
                )}
              </div>

              <DialogFooter className="gap-2 border-t border-gradient-to-r from-transparent via-gray-200/50 dark:via-gray-700/50 to-transparent pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setIsDetailDialogOpen(false)}
                  className="backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 hover:bg-white/80 dark:hover:bg-gray-800/80"
                >
                  Đóng
                </Button>
                {selectedProduct && (
                  <Button 
                    onClick={() => { openEditDialog(selectedProduct); setIsDetailDialogOpen(false); }}
                    className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 shadow-lg shadow-primary/30"
                  >
                    <Pencil className="w-4 h-4 mr-2" /> Sửa thông tin
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
