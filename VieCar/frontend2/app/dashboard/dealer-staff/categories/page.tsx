"use client";

import { ProtectedRoute } from "@/components/auth-guards";
import DealerStaffLayout from "@/components/layout/dealer-staff-layout";
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
  AlertCircle
} from "lucide-react";
import {
  getAllCategories,
  getCategoriesByDealerId,
  searchCategoriesByName,
  type CategoryRes,
} from "@/lib/categoryApi";
import { Badge } from "@/components/ui/badge";

export default function DealerStaffCategoriesPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [categories, setCategories] = useState<CategoryRes[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<CategoryRes | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  // Load categories - CHỈ CỦA DEALER NÀY
  const loadCategories = async () => {
    if (!user?.dealerId) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không tìm thấy thông tin đại lý",
      });
      return;
    }

    setLoading(true);
    try {
      // Lấy categories của dealer này + các categories chung (dealerId = null)
      const dealerCats = await getCategoriesByDealerId(user.dealerId);
      const allCats = await getAllCategories();
      const sharedCats = allCats.filter(c => !c.dealerId); // Categories chung
      
      // Merge và loại bỏ duplicates
      const merged = [...dealerCats, ...sharedCats];
      const unique = Array.from(new Map(merged.map(c => [c.id, c])).values());
      
      setCategories(unique);
      console.log('🔍 Loaded categories for dealer:', user.dealerId, '- Total:', unique.length);
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
    if (user?.dealerId) {
      loadCategories();
    }
  }, [user?.dealerId]);

  // Search handler - CHỈ TRONG CATEGORIES CỦA DEALER NÀY
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      loadCategories();
      return;
    }

    if (!user?.dealerId) return;

    setLoading(true);
    try {
      // Search trong tất cả categories, sau đó filter theo dealerId
      const allResults = await searchCategoriesByName(searchTerm);
      const filteredResults = allResults.filter(c => 
        !c.dealerId || c.dealerId === user.dealerId
      );
      setCategories(filteredResults);
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

  // View category detail
  const handleViewDetail = (category: CategoryRes) => {
    setSelectedCategory(category);
    setIsViewDialogOpen(true);
  };

  return (
    <ProtectedRoute allowedRoles={['Dealer Staff']}>
      <DealerStaffLayout>
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
                  Xem thông tin danh mục xe điện (Chỉ xem)
                </p>
              </div>
              <Badge variant="secondary" className="text-sm">
                <Info className="w-4 h-4 mr-1" />
                Chế độ xem
              </Badge>
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
                  <TableHead>Loại xe</TableHead>
                  <TableHead>Giá cơ bản</TableHead>
                  <TableHead>Bảo hành</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Chi tiết</TableHead>
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
                      <TableCell>-</TableCell>
                      <TableCell>
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
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetail(category)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Xem
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
      </DealerStaffLayout>
    </ProtectedRoute>
  );
}
