"use client";

import { ProtectedRoute } from "@/components/auth-guards";
import AdminLayout from "@/components/layout/admin-layout";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  PlusCircle, 
  Pencil, 
  Trash2, 
  Search,
  RefreshCw,
  Car
} from "lucide-react";
import {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  searchProductsByName,
  type ProductRes,
  type ProductReq,
} from "@/lib/productApi";
import { getAllCategories, type CategoryRes } from "@/lib/categoryApi";
import { ProductStatus, ProductStatusLabels, ProductStatusColors } from "@/types/product";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";

export default function ProductsPage() {
  const { toast } = useToast();
  const [products, setProducts] = useState<ProductRes[]>([]);
  const [categories, setCategories] = useState<CategoryRes[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductRes | null>(null);
  
  // Form state with all required fields
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
    dealerPrice: 0,
    description: "",
    status: ProductStatus.ACTIVE,
    categoryId: 0,
    dealerCategoryId: 0,
    image: "",
  });

  // Load products and categories
  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await getAllProducts();
      setProducts(data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể tải danh sách sản phẩm",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await getAllCategories();
      setCategories(data);
    } catch (error) {
      console.error("Failed to load categories:", error);
    }
  };

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  // Search handler
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      loadProducts();
      return;
    }
    setLoading(true);
    try {
      const data = await searchProductsByName(searchTerm);
      setProducts(data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể tìm kiếm sản phẩm",
      });
    } finally {
      setLoading(false);
    }
  };

  // Create product
  const handleCreate = async () => {
    // Validation
    if (!formData.name.trim()) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Tên sản phẩm không được để trống",
      });
      return;
    }
    if (!formData.vinNum.trim()) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Số VIN không được để trống và phải là duy nhất",
      });
      return;
    }
    if (!formData.engineNum.trim()) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Số máy không được để trống và phải là duy nhất",
      });
      return;
    }
    if (formData.categoryId === 0) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Vui lòng chọn danh mục",
      });
      return;
    }

    try {
      await createProduct(formData);
      toast({
        title: "Thành công",
        description: "Tạo sản phẩm thành công",
      });
      setIsCreateDialogOpen(false);
      resetForm();
      loadProducts();
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || error?.message || "";
      let displayMsg = "Không thể tạo sản phẩm.";
      
      // Check for duplicate VIN/Engine in error message
      if (errorMsg.includes("UQ__product__DDB00C66964BE8B3") || 
          errorMsg.includes("UNIQUE KEY constraint") ||
          errorMsg.includes("duplicate key")) {
        displayMsg = `❌ Số VIN "${formData.vinNum}" hoặc Engine "${formData.engineNum}" đã tồn tại trong hệ thống.\n\n💡 Vui lòng nhập mã khác (VD: ${formData.vinNum}-NEW)`;
      } else {
        displayMsg = errorMsg || "Lỗi không xác định. Vui lòng kiểm tra console.";
      }
      
      toast({
        variant: "destructive",
        title: "❌ Lỗi tạo sản phẩm",
        description: displayMsg,
      });
      console.error("Create product error:", error);
    }
  };

  // Update product
  const handleUpdate = async () => {
    if (!selectedProduct) return;
    try {
      await updateProduct(selectedProduct.id, formData);
      toast({
        title: "Thành công",
        description: "Cập nhật sản phẩm thành công",
      });
      setIsEditDialogOpen(false);
      setSelectedProduct(null);
      resetForm();
      loadProducts();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể cập nhật sản phẩm",
      });
    }
  };

  // Delete product
  const handleDelete = async () => {
    if (!selectedProduct) return;
    try {
      await deleteProduct(selectedProduct.id);
      toast({
        title: "Thành công",
        description: "Xóa sản phẩm thành công",
      });
      setIsDeleteDialogOpen(false);
      setSelectedProduct(null);
      loadProducts();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể xóa sản phẩm",
      });
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
      color: "",
      manufacture_date: product.manufacture_date 
        ? (typeof product.manufacture_date === 'string' 
            ? product.manufacture_date.split('T')[0] 
            : new Date(product.manufacture_date).toISOString().split('T')[0])
        : "",
      dealerPrice: product.price,
      description: product.description || "",
      status: product.status,
      categoryId: product.categoryId,
      dealerCategoryId: product.dealerCategoryId,
      image: product.image || "",
    });
    setIsEditDialogOpen(true);
  };

  // Generate unique VIN/Engine number
  const generateUniqueCode = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `${timestamp}${random}`;
  };

  // Auto-fill unique VIN/Engine
  const handleAutoFillVinEngine = () => {
    const uniqueCode = generateUniqueCode();
    setFormData({
      ...formData,
      vinNum: `VIN-${uniqueCode}`,
      engineNum: `ENG-${uniqueCode}`,
    });
    toast({
      title: "✅ Đã tạo mã tự động",
      description: `VIN và Engine đã được tạo với mã unique: ${uniqueCode}`,
    });
  };

  // Reset form
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
      dealerPrice: 0,
      description: "",
      status: ProductStatus.ACTIVE,
      categoryId: 0,
      dealerCategoryId: 0,
      image: "",
    });
  };

  return (
    <ProtectedRoute allowedRoles={['Admin', 'EVM Staff']}>
      <AdminLayout>
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold flex items-center">
                <Car className="mr-3 h-8 w-8" />
                Quản lý Sản phẩm
              </h1>
              <p className="text-muted-foreground mt-2">
                Quản lý tất cả sản phẩm xe điện trong hệ thống
              </p>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Tạo sản phẩm
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Tạo sản phẩm mới</DialogTitle>
                  <DialogDescription>
                    Nhập thông tin sản phẩm mới
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  {/* Basic Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="create-name">Tên sản phẩm *</Label>
                      <Input
                        id="create-name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="VD: VinFast VF8 Plus"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="create-color">Màu sắc</Label>
                      <Input
                        id="create-color"
                        value={formData.color}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                        placeholder="VD: Đỏ, Xanh"
                      />
                    </div>
                  </div>

                  {/* VIN & Engine */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Số VIN & Engine *</Label>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={handleAutoFillVinEngine}
                      >
                        🎲 Tạo mã tự động
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="create-vin">Số VIN *</Label>
                        <Input
                          id="create-vin"
                          value={formData.vinNum}
                          onChange={(e) => setFormData({ ...formData, vinNum: e.target.value })}
                          placeholder="VD: VIN-1729105901234"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="create-engine">Số máy *</Label>
                        <Input
                          id="create-engine"
                          value={formData.engineNum}
                          onChange={(e) => setFormData({ ...formData, engineNum: e.target.value })}
                          placeholder="VD: ENG-1729105901234"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Technical Specs */}
                  <div className="grid grid-cols-4 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="create-battery">Pin (kWh)</Label>
                      <Input
                        id="create-battery"
                        type="number"
                        step="0.1"
                        value={formData.battery}
                        onChange={(e) => setFormData({ ...formData, battery: parseFloat(e.target.value) || 0 })}
                        placeholder="87.7"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="create-range">Quãng đường (km)</Label>
                      <Input
                        id="create-range"
                        type="number"
                        value={formData.range}
                        onChange={(e) => setFormData({ ...formData, range: parseInt(e.target.value) || 0 })}
                        placeholder="447"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="create-hp">Công suất (HP)</Label>
                      <Input
                        id="create-hp"
                        type="number"
                        value={formData.hp}
                        onChange={(e) => setFormData({ ...formData, hp: parseInt(e.target.value) || 0 })}
                        placeholder="402"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="create-torque">Mô-men (Nm)</Label>
                      <Input
                        id="create-torque"
                        type="number"
                        value={formData.torque}
                        onChange={(e) => setFormData({ ...formData, torque: parseInt(e.target.value) || 0 })}
                        placeholder="640"
                      />
                    </div>
                  </div>

                  {/* Date & Price */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="create-date">Ngày sản xuất</Label>
                      <Input
                        id="create-date"
                        type="date"
                        value={typeof formData.manufacture_date === 'string' 
                          ? formData.manufacture_date 
                          : formData.manufacture_date instanceof Date 
                            ? formData.manufacture_date.toISOString().split('T')[0]
                            : ''
                        }
                        onChange={(e) => setFormData({ ...formData, manufacture_date: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="create-price">Giá đại lý (VNĐ) *</Label>
                      <Input
                        id="create-price"
                        type="number"
                        value={formData.dealerPrice}
                        onChange={(e) => setFormData({ ...formData, dealerPrice: parseFloat(e.target.value) || 0 })}
                        placeholder="1200000000"
                      />
                    </div>
                  </div>

                  {/* Categories */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="create-category">Danh mục *</Label>
                      <Select 
                        value={formData.categoryId.toString()} 
                        onValueChange={(value) => setFormData({ ...formData, categoryId: parseInt(value) })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn danh mục" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id.toString()}>
                              {cat.name} - {cat.brand}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="create-dealer-category">Dealer Category ID</Label>
                      <Input
                        id="create-dealer-category"
                        type="number"
                        value={formData.dealerCategoryId}
                        onChange={(e) => setFormData({ ...formData, dealerCategoryId: parseInt(e.target.value) || 0 })}
                        placeholder="0"
                      />
                    </div>
                  </div>

                  {/* Status */}
                  <div className="grid gap-2">
                    <Label htmlFor="create-status">Trạng thái</Label>
                    <Select 
                      value={formData.status} 
                      onValueChange={(value: ProductStatus) => setFormData({ ...formData, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn trạng thái" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(ProductStatus).map((status) => (
                          <SelectItem key={status} value={status}>
                            {ProductStatusLabels[status]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Image URL */}
                  <div className="grid gap-2">
                    <Label htmlFor="create-image">URL Hình ảnh</Label>
                    <Input
                      id="create-image"
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>

                  {/* Description */}
                  <div className="grid gap-2">
                    <Label htmlFor="create-description">Mô tả</Label>
                    <Textarea
                      id="create-description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Nhập mô tả sản phẩm..."
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Hủy
                  </Button>
                  <Button onClick={handleCreate}>Tạo</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Search */}
          <div className="bg-card rounded-lg border p-4 mb-6">
            <div className="flex gap-2">
              <Input
                placeholder="Tìm theo tên sản phẩm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="max-w-sm"
              />
              <Button size="icon" variant="outline" onClick={handleSearch}>
                <Search className="h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={loadProducts}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Làm mới
              </Button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-card rounded-lg border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Tên</TableHead>
                  <TableHead>VIN</TableHead>
                  <TableHead>Số máy</TableHead>
                  <TableHead>Pin</TableHead>
                  <TableHead>Quãng đường</TableHead>
                  <TableHead>Giá</TableHead>
                  <TableHead>Trạng thái</TableHead>
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
                ) : products.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      Không có sản phẩm nào
                    </TableCell>
                  </TableRow>
                ) : (
                  products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.id}</TableCell>
                      <TableCell className="font-semibold">
                        {product.name}
                        {product.isSpecial && <span className="ml-2">⭐</span>}
                      </TableCell>
                      <TableCell className="font-mono text-xs">{product.vinNum}</TableCell>
                      <TableCell className="font-mono text-xs">{product.engineNum}</TableCell>
                      <TableCell>{product.battery} kWh</TableCell>
                      <TableCell>{product.range} km</TableCell>
                      <TableCell className="font-medium">
                        {product.price.toLocaleString('vi-VN')} ₫
                      </TableCell>
                      <TableCell>
                        <Badge className={ProductStatusColors[product.status]}>
                          {ProductStatusLabels[product.status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(product)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedProduct(product);
                              setIsDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Edit Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Chỉnh sửa sản phẩm</DialogTitle>
                <DialogDescription>
                  Cập nhật thông tin sản phẩm
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="edit-name">Tên sản phẩm *</Label>
                      <Input
                        id="edit-name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-color">Màu sắc</Label>
                      <Input
                        id="edit-color"
                        value={formData.color}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="edit-vin">Số VIN *</Label>
                      <Input
                        id="edit-vin"
                        value={formData.vinNum}
                        onChange={(e) => setFormData({ ...formData, vinNum: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-engine">Số máy *</Label>
                      <Input
                        id="edit-engine"
                        value={formData.engineNum}
                        onChange={(e) => setFormData({ ...formData, engineNum: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="edit-battery">Pin (kWh)</Label>
                      <Input
                        id="edit-battery"
                        type="number"
                        step="0.1"
                        value={formData.battery}
                        onChange={(e) => setFormData({ ...formData, battery: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-range">Quãng đường (km)</Label>
                      <Input
                        id="edit-range"
                        type="number"
                        value={formData.range}
                        onChange={(e) => setFormData({ ...formData, range: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-hp">Công suất (HP)</Label>
                      <Input
                        id="edit-hp"
                        type="number"
                        value={formData.hp}
                        onChange={(e) => setFormData({ ...formData, hp: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-torque">Mô-men (Nm)</Label>
                      <Input
                        id="edit-torque"
                        type="number"
                        value={formData.torque}
                        onChange={(e) => setFormData({ ...formData, torque: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="edit-date">Ngày sản xuất</Label>
                      <Input
                        id="edit-date"
                        type="date"
                        value={typeof formData.manufacture_date === 'string' 
                          ? formData.manufacture_date 
                          : formData.manufacture_date instanceof Date 
                            ? formData.manufacture_date.toISOString().split('T')[0]
                            : ''
                        }
                        onChange={(e) => setFormData({ ...formData, manufacture_date: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-price">Giá đại lý (VNĐ) *</Label>
                      <Input
                        id="edit-price"
                        type="number"
                        value={formData.dealerPrice}
                        onChange={(e) => setFormData({ ...formData, dealerPrice: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="edit-category">Danh mục *</Label>
                      <Select 
                        value={formData.categoryId.toString()} 
                        onValueChange={(value) => setFormData({ ...formData, categoryId: parseInt(value) })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn danh mục" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id.toString()}>
                              {cat.name} - {cat.brand}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-dealer-category">Dealer Category ID</Label>
                      <Input
                        id="edit-dealer-category"
                        type="number"
                        value={formData.dealerCategoryId}
                        onChange={(e) => setFormData({ ...formData, dealerCategoryId: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="edit-status">Trạng thái</Label>
                    <Select 
                      value={formData.status} 
                      onValueChange={(value: ProductStatus) => setFormData({ ...formData, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn trạng thái" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(ProductStatus).map((status) => (
                          <SelectItem key={status} value={status}>
                            {ProductStatusLabels[status]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="edit-image">URL Hình ảnh</Label>
                    <Input
                      id="edit-image"
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="edit-description">Mô tả</Label>
                    <Textarea
                      id="edit-description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                    />
                  </div>
                </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Hủy
                </Button>
                <Button onClick={handleUpdate}>Cập nhật</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Delete Dialog */}
          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Xác nhận xóa</DialogTitle>
                <DialogDescription>
                  Bạn có chắc chắn muốn xóa sản phẩm "{selectedProduct?.name}"?
                  Hành động này sẽ set trạng thái thành INACTIVE.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                  Hủy
                </Button>
                <Button variant="destructive" onClick={handleDelete}>
                  Xóa
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}