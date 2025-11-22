"use client";

import { ProtectedRoute } from "@/components/auth-guards";
import EvmStaffLayout from "@/components/layout/evm-staff-layout";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
  Tag
} from "lucide-react";
import {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  searchCategoriesByName,
  type CategoryRes,
  type CategoryReq,
} from "@/lib/categoryApi";

export default function EvmStaffCategoriesPage() {
  const { toast } = useToast();
  const [categories, setCategories] = useState<CategoryRes[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryRes | null>(null);
  
  // Form state with all required fields
  const [formData, setFormData] = useState<CategoryReq>({
    name: "",
    brand: "VinFast", // ✅ Default to VinFast
    basePrice: 0,
    warranty: 0,
    isSpecial: false,
    description: "",
    status: "ACTIVE",
  });

  // Load categories
  const loadCategories = async () => {
    setLoading(true);
    try {
      const data = await getAllCategories();
      setCategories(data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể tải danh sách danh mục",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  // Search handler
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      loadCategories();
      return;
    }
    setLoading(true);
    try {
      const data = await searchCategoriesByName(searchTerm);
      setCategories(data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể tìm kiếm danh mục",
      });
    } finally {
      setLoading(false);
    }
  };

  // Create category
  const handleCreate = async () => {
    try {
      await createCategory(formData);
      toast({
        title: "Thành công",
        description: "Tạo danh mục thành công",
      });
      setIsCreateDialogOpen(false);
      resetForm();
      loadCategories();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể tạo danh mục",
      });
    }
  };

  // Update category
  const handleUpdate = async () => {
    if (!selectedCategory) return;
    try {
      await updateCategory(selectedCategory.id, formData);
      toast({
        title: "Thành công",
        description: "Cập nhật danh mục thành công",
      });
      setIsEditDialogOpen(false);
      setSelectedCategory(null);
      resetForm();
      loadCategories();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể cập nhật danh mục",
      });
    }
  };

  // Delete category
  const handleDelete = async () => {
    if (!selectedCategory) return;
    try {
      await deleteCategory(selectedCategory.id);
      toast({
        title: "Thành công",
        description: "Xóa danh mục thành công",
      });
      setIsDeleteDialogOpen(false);
      setSelectedCategory(null);
      loadCategories();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể xóa danh mục",
      });
    }
  };

  // Open edit dialog
  const openEditDialog = (category: CategoryRes) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      brand: category.brand,
      basePrice: category.basePrice,
      warranty: category.warranty,
      isSpecial: category.isSpecial ?? false,
      description: category.description || "",
      status: category.status,
    });
    setIsEditDialogOpen(true);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      brand: "VinFast", // ✅ Reset to default VinFast
      basePrice: 0,
      warranty: 0,
      isSpecial: false,
      description: "",
      status: "ACTIVE",
    });
  };

  return (
    <ProtectedRoute allowedRoles={['EVM Staff', 'Admin']}>
      <EvmStaffLayout>
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold flex items-center">
                <Tag className="mr-3 h-8 w-8" />
                Quản lý Danh mục
              </h1>
              <p className="text-muted-foreground mt-2">
                Quản lý danh mục sản phẩm xe điện
              </p>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Tạo danh mục
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Tạo danh mục mới</DialogTitle>
                  <DialogDescription>
                    Nhập thông tin danh mục mới
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="create-name">Tên danh mục</Label>
                      <Input
                        id="create-name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Nhập tên danh mục"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="create-brand">Thương hiệu</Label>
                      <Input
                        id="create-brand"
                        value={formData.brand}
                        onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                        placeholder="VD: VinFast, Tesla"
                      />
                    </div>
                  </div>
                  
                  {/* Removed fields: version, type */}
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="create-basePrice">Giá cơ bản (VNĐ)</Label>
                      <Input
                        id="create-basePrice"
                        type="number"
                        value={formData.basePrice}
                        onChange={(e) => setFormData({ ...formData, basePrice: parseFloat(e.target.value) || 0 })}
                        placeholder="VD: 500000000"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="create-warranty">Bảo hành (năm)</Label>
                      <Input
                        id="create-warranty"
                        type="number"
                        value={formData.warranty}
                        onChange={(e) => setFormData({ ...formData, warranty: parseInt(e.target.value) || 0 })}
                        placeholder="VD: 5"
                      />
                    </div>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="create-description">Mô tả</Label>
                    <Input
                      id="create-description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Nhập mô tả"
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="create-status">Trạng thái</Label>
                    <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn trạng thái" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                        <SelectItem value="INACTIVE">INACTIVE</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="create-special">Danh mục đặc biệt</Label>
                    <Switch
                      id="create-special"
                      checked={formData.isSpecial}
                      onCheckedChange={(checked) => setFormData({ ...formData, isSpecial: checked })}
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
                placeholder="Tìm theo tên..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="max-w-sm"
              />
              <Button size="icon" variant="outline" onClick={handleSearch}>
                <Search className="h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={loadCategories}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Làm mới
              </Button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-card rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Tên</TableHead>
                  <TableHead>Thương hiệu</TableHead>
                  {/* Removed columns: Phiên bản, Loại */}
                  <TableHead>Giá cơ bản</TableHead>
                  <TableHead>Bảo hành</TableHead>
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
                ) : categories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      Không có danh mục nào
                    </TableCell>
                  </TableRow>
                ) : (
                  categories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell className="font-medium">{category.id}</TableCell>
                      <TableCell className="font-semibold">
                        {category.name}
                        {category.isSpecial && <span className="ml-2">⭐</span>}
                      </TableCell>
                      <TableCell>{category.brand}</TableCell>
                      {/* Removed cells: version, type */}
                      <TableCell>{category.basePrice ? category.basePrice.toLocaleString('vi-VN') : '0'} ₫</TableCell>
                      <TableCell>{category.warranty || 0} năm</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            category.status === "ACTIVE"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                          }`}
                        >
                          {category.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(category)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedCategory(category);
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
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Chỉnh sửa danh mục</DialogTitle>
                <DialogDescription>
                  Cập nhật thông tin danh mục
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-name">Tên danh mục</Label>
                    <Input
                      id="edit-name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-brand">Thương hiệu</Label>
                    <Input
                      id="edit-brand"
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    />
                  </div>
                </div>
                
                {/* Removed fields: version, type */}
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-basePrice">Giá cơ bản (VNĐ)</Label>
                    <Input
                      id="edit-basePrice"
                      type="number"
                      value={formData.basePrice}
                      onChange={(e) => setFormData({ ...formData, basePrice: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-warranty">Bảo hành (năm)</Label>
                    <Input
                      id="edit-warranty"
                      type="number"
                      value={formData.warranty}
                      onChange={(e) => setFormData({ ...formData, warranty: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="edit-description">Mô tả</Label>
                  <Input
                    id="edit-description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="edit-status">Trạng thái</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                      <SelectItem value="INACTIVE">INACTIVE</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="edit-special">Danh mục đặc biệt</Label>
                  <Switch
                    id="edit-special"
                    checked={formData.isSpecial}
                    onCheckedChange={(checked) => setFormData({ ...formData, isSpecial: checked })}
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
                  Bạn có chắc chắn muốn xóa danh mục "{selectedCategory?.name}"?
                  Hành động này không thể hoàn tác.
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
      </EvmStaffLayout>
    </ProtectedRoute>
  );
}
