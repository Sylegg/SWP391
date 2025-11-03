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
import { ArrowLeft, Car, RefreshCw, Image as ImageIcon, Check } from "lucide-react";
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

export default function AddProductToShowroomPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [categories, setCategories] = useState<CategoryRes[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [categoryProducts, setCategoryProducts] = useState<ProductRes[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<ProductRes | null>(null);
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [formData, setFormData] = useState({
    dealerPrice: 0,
    image: "",
    description: "",
    status: "ACTIVE" as ProductStatus,
  });

  useEffect(() => {
    if (user?.dealerId) {
      loadCategories();
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

  const loadCategories = async () => {
    if (!user?.dealerId) return;
    
    try {
      setLoading(true);
      const dealerCategories = await getCategoriesByDealerId(user.dealerId);
      setCategories(dealerCategories);
      
      if (dealerCategories.length > 0) {
        const firstCategoryId = dealerCategories[0].id;
        setSelectedCategory(firstCategoryId);
        loadCategoryProducts(firstCategoryId);
      }
    } catch (error: any) {
      console.error("Error loading categories:", error);
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: error.response?.data?.message || "Không thể tải danh mục",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadCategoryProducts = async (categoryId: number) => {
    try {
      setLoading(true);
      const productList = await getProductsByCategory(categoryId);
      setCategoryProducts(productList);
      setSelectedProduct(null);
      setFormData({
        dealerPrice: 0,
        image: "",
        description: "",
        status: "ACTIVE" as ProductStatus,
      });
    } catch (error: any) {
      console.error("Error loading products:", error);
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể tải danh sách xe",
      });
      setCategoryProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (categoryId: number) => {
    setSelectedCategory(categoryId);
    loadCategoryProducts(categoryId);
  };

  const handleSelectProduct = (product: ProductRes) => {
    setSelectedProduct(product);
    setImageFile(null);
    setImagePreview(product.image || "");
    setFormData({
      dealerPrice: product.price || 0,
      image: product.image || "",
      description: product.description || "",
      status: (product.status as ProductStatus) || "ACTIVE",
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file type
      if (!file.type.startsWith('image/')) {
        toast({
          variant: "destructive",
          title: "Lỗi",
          description: "Vui lòng chọn file hình ảnh",
        });
        return;
      }

      // Check file size (max 5MB)
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
        setImagePreview(reader.result as string);
        setFormData({ ...formData, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview("");
    setFormData({ ...formData, image: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProduct) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Vui lòng chọn xe cần đăng lên showroom",
      });
      return;
    }

    if (!formData.dealerPrice || formData.dealerPrice <= 0) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Vui lòng nhập giá bán hợp lệ",
      });
      return;
    }

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
        color: selectedProduct.color || "",
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
        description: "Đã đăng xe lên showroom",
      });
      
      router.push("/dashboard/dealer-staff/showroom");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: error.response?.data?.message || "Không thể đăng xe lên showroom",
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
        <div className="p-6 max-w-7xl mx-auto">
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => router.push("/dashboard/dealer-staff/showroom")}
              className="mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại Showroom
            </Button>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Car className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Thêm xe vào Showroom</CardTitle>
                  <CardDescription>
                    Chọn danh mục và xe, sau đó cập nhật giá bán, hình ảnh, mô tả và trạng thái
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Category Selection */}
                <div className="space-y-2">
                  <Label htmlFor="category">
                    Chọn danh mục xe <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={selectedCategory?.toString() || ""}
                    onValueChange={(value) => handleCategoryChange(parseInt(value))}
                    disabled={loading || categories.length === 0}
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder={categories.length === 0 ? "Không có danh mục" : "Chọn danh mục"}>
                        {selectedCategory && categories.find(c => c.id === selectedCategory)?.name}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id.toString()}>
                          {String(cat.name)} - {String(cat.brand)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {categories.length === 0 && (
                    <p className="text-sm text-red-500">
                      Bạn chưa có danh mục nào. Vui lòng liên hệ Dealer Manager để tạo danh mục.
                    </p>
                  )}
                </div>

                {/* Products List */}
                {loading ? (
                  <div className="text-center py-12">
                    <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                    <p className="mt-4 text-muted-foreground">Đang tải danh sách xe...</p>
                  </div>
                ) : categoryProducts.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed rounded-lg bg-muted/20">
                    <Car className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">
                      {selectedCategory ? "Không có xe nào trong danh mục này" : "Vui lòng chọn danh mục"}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Label>Chọn xe cần đăng lên showroom ({categoryProducts.length} xe)</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[400px] overflow-y-auto border rounded-lg p-4 bg-muted/10">
                      {categoryProducts.map((product) => (
                        <Card
                          key={product.id}
                          className={`cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] ${
                            selectedProduct?.id === product.id
                              ? "ring-2 ring-primary bg-primary/5 shadow-lg"
                              : "hover:border-primary/50"
                          }`}
                          onClick={() => handleSelectProduct(product)}
                        >
                          <CardContent className="p-4">
                            <div className="space-y-3">
                              {/* Image */}
                              <div className="relative">
                                {product.image ? (
                                  <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-full h-32 object-cover rounded"
                                  />
                                ) : (
                                  <div className="w-full h-32 bg-gray-100 rounded flex items-center justify-center">
                                    <ImageIcon className="h-8 w-8 text-gray-400" />
                                  </div>
                                )}
                                {selectedProduct?.id === product.id && (
                                  <div className="absolute top-2 right-2 bg-primary text-white rounded-full p-1">
                                    <Check className="h-4 w-4" />
                                  </div>
                                )}
                              </div>
                              
                              {/* Info */}
                              <div>
                                <h4 className="font-semibold text-sm line-clamp-2">{String(product.name)}</h4>
                                <p className="text-xs text-muted-foreground mt-1">VIN: {String(product.vinNum)}</p>
                                <p className="text-xs text-muted-foreground">Màu: {product.color ? String(product.color) : "Chưa có"}</p>
                                <div className="mt-2">
                                  <Badge className={ProductStatusColors[product.status]} variant="secondary">
                                    {ProductStatusLabels[product.status]}
                                  </Badge>
                                </div>
                                {product.price > 0 && (
                                  <p className="text-sm font-semibold text-primary mt-2">
                                    {formatPrice(product.price)}
                                  </p>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Edit Form - Only show when a product is selected */}
                {selectedProduct && (
                  <div className="space-y-4 border-t pt-6">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <Check className="h-5 w-5 text-green-600" />
                      Cập nhật thông tin cho: <span className="text-primary">{String(selectedProduct.name)}</span>
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="dealerPrice">
                          Giá bán (VND) <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="dealerPrice"
                          type="number"
                          value={formData.dealerPrice || ""}
                          onChange={(e) => setFormData({ ...formData, dealerPrice: parseInt(e.target.value) || 0 })}
                          placeholder="Nhập giá bán"
                          required
                        />
                        {formData.dealerPrice > 0 && (
                          <p className="text-sm text-muted-foreground">
                            = {formatPrice(formData.dealerPrice)}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="status">Trạng thái</Label>
                        <Select
                          value={formData.status}
                          onValueChange={(value) => setFormData({ ...formData, status: value as ProductStatus })}
                        >
                          <SelectTrigger id="status">
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

                    <div className="space-y-2">
                      <Label htmlFor="image">Hình ảnh xe</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="image"
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="cursor-pointer"
                        />
                        {imagePreview && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleRemoveImage}
                          >
                            Xóa
                          </Button>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Kéo thả hoặc chọn file ảnh (JPG, PNG, GIF). Tối đa 5MB.
                      </p>
                      {imagePreview && (
                        <div className="mt-2 border rounded-lg p-2 bg-muted/20">
                          <p className="text-sm text-muted-foreground mb-2">Preview:</p>
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-full max-h-64 object-cover rounded"
                          />
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Mô tả chi tiết</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Nhập mô tả về xe..."
                        rows={4}
                      />
                    </div>
                  </div>
                )}

                {/* Buttons */}
                <div className="flex gap-4 justify-end pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/dashboard/dealer-staff/showroom")}
                    disabled={loading}
                  >
                    Hủy
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading || !selectedProduct || !formData.dealerPrice}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Đang đăng...
                      </>
                    ) : (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Đăng lên Showroom
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </DealerStaffLayout>
    </ProtectedRoute>
  );
}
