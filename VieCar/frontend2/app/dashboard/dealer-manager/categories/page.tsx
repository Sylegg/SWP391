"use client";

import { ProtectedRoute } from "@/components/auth-guards";
import DealerManagerLayout from "@/components/layout/dealer-manager-layout";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  Search,
  RefreshCw,
  Tag,
  Eye,
  Info,
  Package,
  PlusCircle
} from "lucide-react";
import {
  getCategoriesByDealerId,
  createCategory,
  type CategoryRes,
  type CategoryReq,
} from "@/lib/categoryApi";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

export default function DealerManagerCategoriesPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [categories, setCategories] = useState<CategoryRes[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<CategoryRes | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [formData, setFormData] = useState<CategoryReq>({
    name: "",
    brand: "",
    basePrice: 0,
    warranty: 0,
    isSpecial: false,
    description: "",
    status: "ACTIVE",
  });

  // Load categories for this dealer only
  const loadCategories = async () => {
    if (!user?.dealerId) return;
    setLoading(true);
    try {
      const data = await getCategoriesByDealerId(user.dealerId);
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
  }, [user]);

  // Search handler - local filtering
  const handleSearch = () => {
    if (!searchTerm.trim()) {
      loadCategories();
      return;
    }
    // Filter locally since we already have dealer's categories
    const filtered = categories.filter(cat => 
      cat.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setCategories(filtered);
  };

  // View category detail
  const handleViewDetail = (category: CategoryRes) => {
    setSelectedCategory(category);
    setIsViewDialogOpen(true);
  };

  const goToInventory = (category: CategoryRes) => {
    // Navigate to the category inventory management page
    window.location.href = `/dashboard/dealer-manager/categories/${category.id}`;
  };

  const handleCreate = async () => {
    // Basic validations
    if (!formData.name.trim()) {
      toast({ variant: "destructive", title: "Thiếu tên danh mục", description: "Vui lòng nhập tên danh mục" });
      return;
    }
    if (!formData.brand.trim()) {
      toast({ variant: "destructive", title: "Thiếu thương hiệu", description: "Vui lòng nhập thương hiệu" });
      return;
    }
    try {
      setLoading(true);
      // Set dealerId for Dealer Manager categories
      const categoryReq = {
        ...formData,
        dealerId: user?.dealerId, // Mark this category as belonging to this dealer
      };
      await createCategory(categoryReq);
      toast({ title: "Thành công", description: "Tạo danh mục thành công" });
      setIsCreateDialogOpen(false);
      setFormData({
        name: "",
        brand: "",
        basePrice: 0,
        warranty: 0,
        isSpecial: false,
        description: "",
        status: "ACTIVE",
      });
      loadCategories();
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.message || "Không thể tạo danh mục";
      toast({ variant: "destructive", title: "Lỗi", description: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['Dealer Manager', 'Dealer Staff', 'Admin']}>
      <DealerManagerLayout>
        <div className="p-6">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold flex items-center">
                  <Tag className="mr-3 h-8 w-8" />
                  Danh mục sản phẩm
                </h1>
                <p className="text-muted-foreground mt-2">
                  Xem danh mục gốc và tạo danh mục cho riêng đại lý
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-sm">
                  <Info className="w-4 h-4 mr-1" />
                  Dành cho Dealer Manager
                </Badge>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => setIsCreateDialogOpen(true)}>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Tạo danh mục
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Tạo danh mục mới</DialogTitle>
                      <DialogDescription>Nhập thông tin danh mục mới</DialogDescription>
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
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Hủy</Button>
                      <Button onClick={handleCreate} disabled={loading}>Tạo</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="bg-card rounded-lg border p-4 mb-6">
            <div className="flex gap-2">
              <Input
                placeholder="Tìm theo tên danh mục..."
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
                  <TableHead>Tên danh mục</TableHead>
                  <TableHead>Thương hiệu</TableHead>
                  {/* Removed columns: Phiên bản, Loại xe */}
                  <TableHead>Giá cơ bản</TableHead>
                  <TableHead>Bảo hành</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
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
                      <TableCell className="font-medium">
                        {category.basePrice ? category.basePrice.toLocaleString('vi-VN') : '0'} ₫
                      </TableCell>
                      <TableCell>{category.warranty || 0} năm</TableCell>
                      <TableCell>
                        <Badge
                          variant={category.status === "ACTIVE" ? "default" : "secondary"}
                          className={
                            category.status === "ACTIVE"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                          }
                        >
                          {category.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetail(category)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Xem
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => goToInventory(category)}
                        >
                          <Package className="h-4 w-4 mr-2" />
                          Kho
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>


          {/* View Detail Dialog */}
          <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center">
                  <Tag className="mr-2 h-5 w-5" />
                  Chi tiết danh mục
                </DialogTitle>
                <DialogDescription>
                  Thông tin chi tiết về danh mục xe điện
                </DialogDescription>
              </DialogHeader>
              
              {selectedCategory && (
                <div className="grid gap-4 py-4">
                  {/* ID and Name */}
                  <div className="grid grid-cols-4 items-center gap-4">
                    <div className="font-medium text-right">ID:</div>
                    <div className="col-span-3 font-semibold">
                      #{selectedCategory.id}
                    </div>
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <div className="font-medium text-right">Tên danh mục:</div>
                    <div className="col-span-3 font-semibold text-lg">
                      {selectedCategory.name}
                      {selectedCategory.isSpecial && (
                        <Badge variant="secondary" className="ml-2">
                          ⭐ Đặc biệt
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Brand and Version */}
                  <div className="grid grid-cols-4 items-center gap-4">
                    <div className="font-medium text-right">Thương hiệu:</div>
                    <div className="col-span-3">{selectedCategory.brand}</div>
                  </div>

                  {/* Removed fields: Version, Type */}

                  {/* Price and Warranty */}
                  <div className="grid grid-cols-4 items-center gap-4">
                    <div className="font-medium text-right">Giá cơ bản:</div>
                    <div className="col-span-3 text-lg font-semibold text-primary">
                      {selectedCategory.basePrice ? selectedCategory.basePrice.toLocaleString('vi-VN') : '0'} ₫
                    </div>
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <div className="font-medium text-right">Bảo hành:</div>
                    <div className="col-span-3">
                      <Badge variant="outline">{selectedCategory.warranty} năm</Badge>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="grid grid-cols-4 items-start gap-4">
                    <div className="font-medium text-right">Mô tả:</div>
                    <div className="col-span-3 text-muted-foreground">
                      {selectedCategory.description || "Không có mô tả"}
                    </div>
                  </div>

                  {/* Status */}
                  <div className="grid grid-cols-4 items-center gap-4">
                    <div className="font-medium text-right">Trạng thái:</div>
                    <div className="col-span-3">
                      <Badge
                        variant={selectedCategory.status === "ACTIVE" ? "default" : "secondary"}
                        className={
                          selectedCategory.status === "ACTIVE"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                        }
                      >
                        {selectedCategory.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                  Đóng
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </DealerManagerLayout>
    </ProtectedRoute>
  );
}
