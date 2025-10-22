"use client";

import { useState, useEffect } from "react";
import { ProtectedRoute } from "@/components/auth-guards";
import AdminLayout from "@/components/layout/admin-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Pencil, Trash2, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DealerCategoryRes, DealerCategoryReq, CategoryRes } from "@/types/category";
import {
  getAllDealerCategories,
  createDealerCategory,
  updateDealerCategory,
  deleteDealerCategory,
} from "@/lib/categoryApi";
import { getAllCategories } from "@/lib/categoryApi";

export default function DealerCategoriesPage() {
  const { toast } = useToast();
  const [dealerCategories, setDealerCategories] = useState<DealerCategoryRes[]>([]);
  const [categories, setCategories] = useState<CategoryRes[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedDealerCategory, setSelectedDealerCategory] = useState<DealerCategoryRes | null>(null);
  
  // Form state
  const [formData, setFormData] = useState<DealerCategoryReq>({
    name: "",
    quantity: 0,
    description: "",
    status: "AVAILABLE",
    categoryId: 0,
    dealerId: 1, // Default dealer ID - adjust based on your auth context
  });

  // Load dealer categories and base categories
  const loadData = async () => {
    try {
      setLoading(true);
      const [dealerCats, baseCats] = await Promise.all([
        getAllDealerCategories(),
        getAllCategories(),
      ]);
      setDealerCategories(dealerCats);
      setCategories(baseCats);
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể tải dữ liệu",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      quantity: 0,
      description: "",
      status: "AVAILABLE",
      categoryId: 0,
      dealerId: 1,
    });
  };

  // Handle create
  const handleCreate = async () => {
    if (!formData.name || formData.categoryId === 0) {
      toast({
        title: "Lỗi",
        description: "Vui lòng điền đầy đủ thông tin bắt buộc",
        variant: "destructive",
      });
      return;
    }

    try {
      await createDealerCategory(formData);
      toast({
        title: "Thành công",
        description: "Tạo danh mục đại lý mới thành công",
      });
      setIsCreateDialogOpen(false);
      resetForm();
      loadData();
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error?.response?.data?.message || "Không thể tạo danh mục đại lý",
        variant: "destructive",
      });
    }
  };

  // Handle edit
  const handleEdit = (dealerCategory: DealerCategoryRes) => {
    setSelectedDealerCategory(dealerCategory);
    setFormData({
      name: dealerCategory.name,
      quantity: dealerCategory.quantity,
      description: dealerCategory.description,
      status: dealerCategory.status,
      categoryId: dealerCategory.categoryId,
      dealerId: dealerCategory.dealerId,
    });
    setIsEditDialogOpen(true);
  };

  // Handle update
  const handleUpdate = async () => {
    if (!selectedDealerCategory) return;
    
    if (!formData.name || formData.categoryId === 0) {
      toast({
        title: "Lỗi",
        description: "Vui lòng điền đầy đủ thông tin bắt buộc",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateDealerCategory(selectedDealerCategory.id, formData);
      toast({
        title: "Thành công",
        description: "Cập nhật danh mục đại lý thành công",
      });
      setIsEditDialogOpen(false);
      resetForm();
      setSelectedDealerCategory(null);
      loadData();
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error?.response?.data?.message || "Không thể cập nhật danh mục đại lý",
        variant: "destructive",
      });
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!selectedDealerCategory) return;
    try {
      await deleteDealerCategory(selectedDealerCategory.id);
      toast({
        title: "Thành công",
        description: "Xóa danh mục đại lý thành công",
      });
      setIsDeleteDialogOpen(false);
      setSelectedDealerCategory(null);
      loadData();
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error?.response?.data?.message || "Không thể xóa danh mục đại lý",
        variant: "destructive",
      });
    }
  };

  // Get category name by ID
  const getCategoryName = (categoryId: number) => {
    const category = categories.find((c) => c.id === categoryId);
    return category ? category.name : `Category #${categoryId}`;
  };

  return (
    <ProtectedRoute allowedRoles={["Admin", "Dealer Manager", "EVM Staff"]}>
      <AdminLayout>
        <div className="p-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Quản lý Danh mục Đại lý</h1>
            <p className="text-muted-foreground mt-2">
              Quản lý kho xe và tồn kho của các đại lý
            </p>
          </div>

          {/* Actions */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Thao tác</CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Thêm danh mục đại lý mới
              </Button>
            </CardContent>
          </Card>

          {/* Dealer Categories Table */}
          <Card>
            <CardHeader>
              <CardTitle>Danh sách Danh mục Đại lý ({dealerCategories.length})</CardTitle>
              <CardDescription>
                Quản lý kho xe tại các đại lý
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Đang tải...</div>
              ) : dealerCategories.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Chưa có danh mục đại lý nào
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Tên</TableHead>
                      <TableHead>Danh mục gốc</TableHead>
                      <TableHead>Số lượng</TableHead>
                      <TableHead>Đại lý</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Mô tả</TableHead>
                      <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dealerCategories.map((dealerCat) => (
                      <TableRow key={dealerCat.id}>
                        <TableCell className="font-medium">{dealerCat.id}</TableCell>
                        <TableCell>{dealerCat.name}</TableCell>
                        <TableCell>{getCategoryName(dealerCat.categoryId)}</TableCell>
                        <TableCell>
                          <Badge variant={dealerCat.quantity > 0 ? "default" : "secondary"}>
                            <Package className="h-3 w-3 mr-1" />
                            {dealerCat.quantity}
                          </Badge>
                        </TableCell>
                        <TableCell>Đại lý #{dealerCat.dealerId}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              dealerCat.status === "AVAILABLE" ? "default" : "secondary"
                            }
                          >
                            {dealerCat.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {dealerCat.description}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(dealerCat)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedDealerCategory(dealerCat);
                                setIsDeleteDialogOpen(true);
                              }}
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
                <DialogTitle>Tạo Danh mục Đại lý Mới</DialogTitle>
                <DialogDescription>
                  Thêm danh mục kho xe cho đại lý
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Tên danh mục *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="VF e34 Kho HN"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="categoryId">Danh mục gốc *</Label>
                  <Select
                    value={formData.categoryId.toString()}
                    onValueChange={(value) =>
                      setFormData({ ...formData, categoryId: parseInt(value) })
                    }
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
                <div className="space-y-2">
                  <Label htmlFor="quantity">Số lượng</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={formData.quantity}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        quantity: parseInt(e.target.value) || 0,
                      })
                    }
                    placeholder="10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Trạng thái</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      setFormData({ ...formData, status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AVAILABLE">Sẵn có</SelectItem>
                      <SelectItem value="OUT_OF_STOCK">Hết hàng</SelectItem>
                      <SelectItem value="INACTIVE">Không hoạt động</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="description">Mô tả</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Mô tả về kho xe tại đại lý..."
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsCreateDialogOpen(false);
                    resetForm();
                  }}
                >
                  Hủy
                </Button>
                <Button onClick={handleCreate}>Tạo mới</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Edit Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Chỉnh sửa Danh mục Đại lý</DialogTitle>
                <DialogDescription>
                  Cập nhật thông tin danh mục #{selectedDealerCategory?.id}
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Tên danh mục *</Label>
                  <Input
                    id="edit-name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-categoryId">Danh mục gốc *</Label>
                  <Select
                    value={formData.categoryId.toString()}
                    onValueChange={(value) =>
                      setFormData({ ...formData, categoryId: parseInt(value) })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
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
                <div className="space-y-2">
                  <Label htmlFor="edit-quantity">Số lượng</Label>
                  <Input
                    id="edit-quantity"
                    type="number"
                    value={formData.quantity}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        quantity: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-status">Trạng thái</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      setFormData({ ...formData, status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AVAILABLE">Sẵn có</SelectItem>
                      <SelectItem value="OUT_OF_STOCK">Hết hàng</SelectItem>
                      <SelectItem value="INACTIVE">Không hoạt động</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="edit-description">Mô tả</Label>
                  <Textarea
                    id="edit-description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditDialogOpen(false);
                    resetForm();
                    setSelectedDealerCategory(null);
                  }}
                >
                  Hủy
                </Button>
                <Button onClick={handleUpdate}>Cập nhật</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Delete Confirmation Dialog */}
          <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                <AlertDialogDescription>
                  Bạn có chắc chắn muốn xóa danh mục đại lý "{selectedDealerCategory?.name}"?
                  Hành động này không thể hoàn tác.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel
                  onClick={() => {
                    setIsDeleteDialogOpen(false);
                    setSelectedDealerCategory(null);
                  }}
                >
                  Hủy
                </AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive">
                  Xóa
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}
