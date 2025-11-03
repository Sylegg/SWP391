"use client";

import { ProtectedRoute } from "@/components/auth-guards";
import DealerStaffLayout from "@/components/layout/dealer-staff-layout";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Car, Edit, RefreshCw, Image as ImageIcon, DollarSign, Plus } from "lucide-react";
import { getCategoriesByDealerId } from "@/lib/categoryApi";
import { getProductsByCategory, updateProduct } from "@/lib/productApi";
import type { CategoryRes } from "@/types/category";
import type { ProductRes, ProductStatus } from "@/types/product";

const ProductStatusLabels: Record<ProductStatus, string> = {
  ACTIVE: "Sẵn sàng bán",
  INACTIVE: "Không hoạt động",
  SOLDOUT: "Đã bán",
  RESERVED: "Đã đặt cọc",
  TEST_DRIVE: "Xe lái thử",
};

const ProductStatusColors: Record<ProductStatus, string> = {
  ACTIVE: "bg-green-100 text-green-800",
  INACTIVE: "bg-gray-100 text-gray-800",
  SOLDOUT: "bg-red-100 text-red-800",
  RESERVED: "bg-yellow-100 text-yellow-800",
  TEST_DRIVE: "bg-blue-100 text-blue-800",
};

export default function DealerStaffShowroomPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [categories, setCategories] = useState<CategoryRes[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [products, setProducts] = useState<ProductRes[]>([]);
  const [loading, setLoading] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductRes | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [formData, setFormData] = useState({
    dealerPrice: 0,
    image: "",
    description: "",
    status: "ACTIVE" as ProductStatus,
    color: "",
  });

  useEffect(() => {
    if (user?.dealerId) {
      loadAllProducts();
    }
    
    // Suppress third-party errors from browser extensions
    const handleError = (event: ErrorEvent) => {
      const isThirdPartyError = 
        event.filename?.includes('onboarding.js') || 
        event.filename?.includes('extension') ||
        event.filename?.includes('chrome-extension') ||
        event.message?.includes('SOURCE_LANG_VI') ||
        event.message?.includes('listener indicated an asynchronous response') ||
        event.message?.includes('message channel closed');
      
      if (isThirdPartyError) {
        event.preventDefault();
        event.stopPropagation();
        return true;
      }
    };
    
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const errorMessage = event.reason?.message || String(event.reason);
      const isThirdPartyError = 
        errorMessage.includes('listener indicated an asynchronous response') ||
        errorMessage.includes('message channel closed') ||
        errorMessage.includes('extension');
      
      if (isThirdPartyError) {
        event.preventDefault();
        return true;
      }
    };

    // Suppress console errors from extensions
    const originalConsoleError = console.error;
    console.error = (...args: any[]) => {
      const message = String(args[0]);
      const fullMessage = args.map(arg => {
        if (arg instanceof Error) {
          return arg.message + (arg.stack || '');
        }
        return String(arg);
      }).join(' ');
      
      if (
        message.includes('listener indicated an asynchronous response') ||
        message.includes('message channel closed') ||
        message.includes('extension') ||
        message.includes('onboarding.js') ||
        fullMessage.includes('listener indicated an asynchronous response') ||
        fullMessage.includes('message channel closed') ||
        fullMessage.includes('onboarding.js')
      ) {
        return;
      }
      originalConsoleError.apply(console, args);
    };
    
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      console.error = originalConsoleError;
    };
  }, [user?.dealerId]);

  const loadAllProducts = async () => {
    if (!user?.dealerId) {
      console.log("No dealerId found");
      return;
    }
    setLoading(true);
    try {
      console.log("Loading categories for dealer:", user.dealerId);
      const dealerCategories = await getCategoriesByDealerId(user.dealerId);
      console.log("Categories loaded:", dealerCategories);
      setCategories(dealerCategories);
      
      if (dealerCategories.length === 0) {
        console.log("No categories found");
        setProducts([]);
        setLoading(false);
        return;
      }
      
      // Load products from all categories
      let allProducts: ProductRes[] = [];
      for (const cat of dealerCategories) {
        try {
          console.log("Loading products for category:", cat.id);
          const productList = await getProductsByCategory(cat.id);
          allProducts = [...allProducts, ...productList];
        } catch (catError) {
          console.error(`Error loading products for category ${cat.id}:`, catError);
          // Continue with other categories
        }
      }
      console.log("Total products loaded:", allProducts.length);
      setProducts(allProducts);
      
      // Set first category as selected for adding new products
      if (categories.length > 0) {
        setSelectedCategory(categories[0].id);
        console.log("Selected category:", categories[0].id);
      }
    } catch (error: any) {
      console.error("Error loading products:", error);
      console.error("Error details:", error.response?.data || error.message);
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: error.response?.data?.message || error.message || "Không thể tải danh sách xe",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (product: ProductRes) => {
    setSelectedProduct(product);
    setImagePreview(product.image || "");
    setImageFile(null);
    setFormData({
      dealerPrice: product.price,
      image: product.image || "",
      description: product.description || "",
      status: product.status,
      color: product.color || "",
    });
    setIsEditDialogOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          variant: "destructive",
          title: "Lỗi",
          description: "Vui lòng chọn file hình ảnh",
        });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          variant: "destructive",
          title: "Lỗi",
          description: "Kích thước file không được vượt quá 5MB",
        });
        return;
      }

      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImagePreview(base64String);
        setFormData({ ...formData, image: base64String });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview("");
    setFormData({ ...formData, image: "" });
  };

  const handleSaveProduct = async () => {
    if (!selectedProduct) return;

    try {
      setLoading(true);
      await updateProduct(selectedProduct.id, {
        name: selectedProduct.name,
        vinNum: selectedProduct.vinNum,
        engineNum: selectedProduct.engineNum,
        battery: selectedProduct.battery,
        range: selectedProduct.range,
        hp: selectedProduct.hp,
        torque: selectedProduct.torque,
        color: formData.color || selectedProduct.color || "",
        manufacture_date: selectedProduct.manufacture_date,
        dealerPrice: formData.dealerPrice,
        image: formData.image,
        description: formData.description,
        status: formData.status,
        categoryId: selectedProduct.categoryId,
        dealerCategoryId: selectedProduct.dealerCategoryId,
      });

      toast({
        title: "Thành công",
        description: "Cập nhật thông tin xe thành công",
      });
      setIsEditDialogOpen(false);
      loadAllProducts();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể cập nhật thông tin xe",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  return (
    <ProtectedRoute allowedRoles={["Dealer Staff", "Admin"]}>
      <DealerStaffLayout>
        <div className="p-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <Car className="h-8 w-8 text-primary" />
                  <div>
                    <CardTitle>Quản lý Showroom</CardTitle>
                    <CardDescription>
                      Đăng xe lên bán cho khách hàng - Cập nhật giá, hình ảnh và trạng thái
                    </CardDescription>
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Button
                    onClick={() => router.push("/dashboard/dealer-staff/showroom/add")}
                    className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Thêm xe vào Showroom
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadAllProducts()}
                    disabled={loading}
                  >
                    <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    Làm mới
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Product Grid */}
              {loading ? (
                <div className="text-center py-12">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                  <p className="mt-4 text-muted-foreground">Đang tải...</p>
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-12">
                  <Car className="h-12 w-12 mx-auto text-muted-foreground" />
                  <p className="mt-4 text-muted-foreground">
                    Chưa có xe nào trong danh mục này
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="aspect-video bg-gray-100 relative">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="h-12 w-12 text-gray-400" />
                          </div>
                        )}
                        <div className="absolute top-2 right-2">
                          <Badge className={ProductStatusColors[product.status]}>
                            {ProductStatusLabels[product.status]}
                          </Badge>
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                        <div className="space-y-1 text-sm text-muted-foreground mb-3">
                          <p>VIN: {product.vinNum}</p>
                          <p>Màu: {product.color || "Chưa cập nhật"}</p>
                        </div>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-1 text-lg font-bold text-primary">
                            <DollarSign className="h-5 w-5" />
                            {formatPrice(product.price)}
                          </div>
                        </div>
                        <Button
                          className="w-full"
                          variant="outline"
                          onClick={() => handleEditClick(product)}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Cập nhật
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Edit Product Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Cập nhật thông tin xe</DialogTitle>
                <DialogDescription>
                  {selectedProduct?.name} - VIN: {selectedProduct?.vinNum}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Giá bán cho khách (VND) *</Label>
                  <Input
                    type="number"
                    value={formData.dealerPrice}
                    onChange={(e) =>
                      setFormData({ ...formData, dealerPrice: parseInt(e.target.value) || 0 })
                    }
                    placeholder="Nhập giá bán"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Màu sắc</Label>
                  <Input
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    placeholder="Vd: Đỏ, Trắng, Xanh..."
                  />
                </div>

                <div className="space-y-2">
                  <Label>Hình ảnh xe</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="cursor-pointer"
                  />
                  <p className="text-xs text-muted-foreground">
                    Chấp nhận các định dạng: JPG, PNG, GIF (tối đa 5MB)
                  </p>
                  {imagePreview && (
                    <div className="mt-2 border rounded-lg p-2 relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-4 right-4"
                        onClick={handleRemoveImage}
                      >
                        Xóa hình
                      </Button>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Mô tả chi tiết</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Nhập mô tả về xe..."
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Trạng thái</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      setFormData({ ...formData, status: value as ProductStatus })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Sẵn sàng bán</SelectItem>
                      <SelectItem value="TEST_DRIVE">Xe lái thử</SelectItem>
                      <SelectItem value="RESERVED">Đã đặt cọc</SelectItem>
                      <SelectItem value="SOLDOUT">Đã bán</SelectItem>
                      <SelectItem value="INACTIVE">Không hoạt động</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Hủy
                </Button>
                <Button onClick={handleSaveProduct} disabled={loading}>
                  {loading ? "Đang lưu..." : "Lưu thay đổi"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </DealerStaffLayout>
    </ProtectedRoute>
  );
}
