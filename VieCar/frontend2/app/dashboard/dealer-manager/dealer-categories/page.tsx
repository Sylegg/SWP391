"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  getAllCategories, 
  getDealerCategoriesByDealerId,
  createDealerCategory,
  updateDealerCategory,
  deleteDealerCategory,
  type CategoryRes,
  type DealerCategoryRes,
  type DealerCategoryReq
} from "@/lib/categoryApi";
import { Plus, Pencil, Trash2, Package } from "lucide-react";

type DealerCategoryStatus = "ACTIVE" | "INACTIVE";

export default function DealerCategoriesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [dealerCategories, setDealerCategories] = useState<DealerCategoryRes[]>([]);
  const [allCategories, setAllCategories] = useState<CategoryRes[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const [selectedCategory, setSelectedCategory] = useState<DealerCategoryRes | null>(null);
  
  // Form data
  const [formData, setFormData] = useState<DealerCategoryReq>({
    name: "",
    quantity: 0,
    description: "",
    status: "ACTIVE",
    categoryId: 0,
    dealerId: 0,
  });

  useEffect(() => {
    if (user?.dealerId) {
      loadData();
    }
  }, [user?.dealerId]);

  const loadData = async () => {
    if (!user?.dealerId) return;
    
    try {
      setLoading(true);
      const [dealerCats, allCats] = await Promise.all([
        getDealerCategoriesByDealerId(user.dealerId),
        getAllCategories()
      ]);
      setDealerCategories(dealerCats);
      setAllCategories(allCats);
    } catch (error: any) {
      console.error("Error loading data:", error);
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể tải dữ liệu",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateDialog = () => {
    setFormData({
      name: "",
      quantity: 0,
      description: "",
      status: "ACTIVE",
      categoryId: 0,
      dealerId: user?.dealerId || 0,
    });
    setIsCreateDialogOpen(true);
  };

  const handleOpenEditDialog = (category: DealerCategoryRes) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      quantity: category.quantity,
      description: category.description,
      status: category.status as DealerCategoryStatus,
      categoryId: category.categoryId,
      dealerId: category.dealerId,
    });
    setIsEditDialogOpen(true);
  };

  const handleOpenDeleteDialog = (category: DealerCategoryRes) => {
    setSelectedCategory(category);
    setIsDeleteDialogOpen(true);
  };

  const handleCreate = async () => {
    if (!formData.name || !formData.categoryId || formData.quantity < 0) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Vui lòng điền đầy đủ thông tin",
      });
      return;
    }

    try {
      await createDealerCategory(formData);
      toast({
        title: "Thành công",
        description: "Đã tạo danh mục mới",
      });
      setIsCreateDialogOpen(false);
      loadData();
    } catch (error: any) {
      console.error("Error creating category:", error);
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: error.response?.data?.message || "Không thể tạo danh mục",
      });
    }
  };

  const handleUpdate = async () => {
    if (!selectedCategory) return;
    
    if (!formData.name || !formData.categoryId || formData.quantity < 0) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Vui lòng điền đầy đủ thông tin",
      });
      return;
    }

    try {
      await updateDealerCategory(selectedCategory.id, formData);
      toast({
        title: "Thành công",
        description: "Đã cập nhật danh mục",
      });
      setIsEditDialogOpen(false);
      loadData();
    } catch (error: any) {
      console.error("Error updating category:", error);
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: error.response?.data?.message || "Không thể cập nhật danh mục",
      });
    }
  };

  const handleDelete = async () => {
    if (!selectedCategory) return;

    try {
      await deleteDealerCategory(selectedCategory.id);
      toast({
        title: "Thành công",
        description: "Đã xóa danh mục",
      });
      setIsDeleteDialogOpen(false);
      loadData();
    } catch (error: any) {
      console.error("Error deleting category:", error);
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: error.response?.data?.message || "Không thể xóa danh mục",
      });
    }
  };

  const getCategoryName = (categoryId: number) => {
    const category = allCategories.find(c => c.id === categoryId);
    return category ? category.name : `Category ${categoryId}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Quản lý Danh mục Showroom</h1>
          <p className="text-muted-foreground mt-2">
            Tạo và quản lý các danh mục xe trong showroom của bạn
          </p>
        </div>
        <Button onClick={handleOpenCreateDialog} className="gap-2">
          <Plus className="h-4 w-4" />
          Thêm Danh mục
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng Danh mục</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dealerCategories.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đang hoạt động</CardTitle>
            <Package className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dealerCategories.filter(c => c.status === "ACTIVE").length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng số lượng xe</CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dealerCategories.reduce((sum, c) => sum + c.quantity, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Categories Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách Danh mục</CardTitle>
          <CardDescription>
            Quản lý các danh mục xe trong showroom
          </CardDescription>
        </CardHeader>
        <CardContent>
          {dealerCategories.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Chưa có danh mục nào</h3>
              <p className="text-muted-foreground mb-4">
                Bắt đầu bằng cách tạo danh mục đầu tiên cho showroom
              </p>
              <Button onClick={handleOpenCreateDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Thêm Danh mục
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên Danh mục</TableHead>
                  <TableHead>Loại xe gốc</TableHead>
                  <TableHead>Số lượng</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Mô tả</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dealerCategories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell>{getCategoryName(category.categoryId)}</TableCell>
                    <TableCell>{category.quantity}</TableCell>
                    <TableCell>
                      <Badge variant={category.status === "ACTIVE" ? "default" : "secondary"}>
                        {category.status === "ACTIVE" ? "Hoạt động" : "Không hoạt động"}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {category.description || "Không có mô tả"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenEditDialog(category)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDeleteDialog(category)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Thêm Danh mục Mới</DialogTitle>
            <DialogDescription>
              Tạo danh mục mới cho showroom của bạn
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="categoryId" className="font-medium">
                Loại xe gốc <span className="text-destructive">*</span>
              </label>
              <Select
                value={formData.categoryId.toString()}
                onValueChange={(value) => {
                  const selectedCat = allCategories.find(c => c.id === parseInt(value));
                  setFormData({ 
                    ...formData, 
                    categoryId: parseInt(value),
                    name: selectedCat ? selectedCat.name : formData.name
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn loại xe" />
                </SelectTrigger>
                <SelectContent>
                  {allCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>
                      {cat.name} - {cat.brand}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <label htmlFor="name" className="font-medium">
                Tên Danh mục <span className="text-destructive">*</span>
              </label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="VD: VinFast VF 5 Plus"
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="quantity" className="font-medium">
                Số lượng <span className="text-destructive">*</span>
              </label>
              <Input
                id="quantity"
                type="number"
                min="0"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="status" className="font-medium">
                Trạng thái
              </label>
              <Select
                value={formData.status}
                onValueChange={(value: DealerCategoryStatus) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Hoạt động</SelectItem>
                  <SelectItem value="INACTIVE">Không hoạt động</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <label htmlFor="description" className="font-medium">
                Mô tả
              </label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Nhập mô tả về danh mục này..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleCreate}>Tạo Danh mục</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa Danh mục</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin danh mục
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="edit-categoryId" className="font-medium">
                Loại xe gốc <span className="text-destructive">*</span>
              </label>
              <Select
                value={formData.categoryId.toString()}
                onValueChange={(value) => setFormData({ ...formData, categoryId: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn loại xe" />
                </SelectTrigger>
                <SelectContent>
                  {allCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>
                      {cat.name} - {cat.brand}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <label htmlFor="edit-name" className="font-medium">
                Tên Danh mục <span className="text-destructive">*</span>
              </label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="edit-quantity" className="font-medium">
                Số lượng <span className="text-destructive">*</span>
              </label>
              <Input
                id="edit-quantity"
                type="number"
                min="0"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="edit-status" className="font-medium">
                Trạng thái
              </label>
              <Select
                value={formData.status}
                onValueChange={(value: DealerCategoryStatus) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Hoạt động</SelectItem>
                  <SelectItem value="INACTIVE">Không hoạt động</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <label htmlFor="edit-description" className="font-medium">
                Mô tả
              </label>
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa danh mục &quot;{selectedCategory?.name}&quot;? 
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
  );
}
