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
  const [selectedCategory, setSelectedCategory] = useState<CategoryRes | null>(null);
  const [products, setProducts] = useState<ProductRes[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductRes | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [formData, setFormData] = useState({
    retailPrice: 0,  // ✅ NEW: Giá bán lẻ (có thể update)
    dealerPrice: 0,  // @Deprecated - backward compatibility
    image: "",
    description: "",
    status: "ACTIVE" as ProductStatus,
    color: "",
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
    } catch (error: any) {
      console.error("Error loading categories:", error);
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: error.response?.data?.message || error.message || "Không thể tải danh sách danh mục",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadProductsByCategory = async (category: CategoryRes) => {
    setLoadingProducts(true);
    setSelectedCategory(category);
    try {
      console.log("Loading products for category:", category.id);
      const productList = await getProductsByCategory(category.id);
      console.log("Products loaded:", productList.length);
      setProducts(productList);
    } catch (error: any) {
      console.error("Error loading products:", error);
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: error.response?.data?.message || error.message || "Không thể tải danh sách xe",
      });
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
    setProducts([]);
  };

  const handleEditClick = (product: ProductRes) => {
    // Không cho phép chỉnh sửa xe đã bán
    if (product.status === 'SOLDOUT') {
      toast({
        variant: "destructive",
        title: "Không thể chỉnh sửa",
        description: "Xe đã bán không thể cập nhật thông tin",
      });
      return;
    }
    
    setSelectedProduct(product);
    setImagePreview(product.image || "");
    setImageFile(null);
    setFormData({
      // ✅ Ưu tiên retailPrice (field mới), fallback về price (field cũ)
      retailPrice: product.retailPrice || product.price,
      dealerPrice: product.retailPrice || product.price, // Legacy compatibility
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
      
      // ⚠️ IMPORTANT: Do NOT send manufacturerPrice in update
      // It's read-only and cannot be changed after creation
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
        
        // ✅ ONLY send retailPrice (dealer can change this)
        retailPrice: formData.retailPrice,
        // Keep dealerPrice for backward compatibility
        dealerPrice: formData.dealerPrice,
        
        image: formData.image,
        description: formData.description,
        status: formData.status,
        categoryId: selectedProduct.categoryId,
        dealerCategoryId: selectedProduct.dealerCategoryId,
        
        // ❌ manufacturerPrice is NOT included (read-only)
      });

      toast({
        title: "Thành công",
        description: "Cập nhật thông tin xe thành công",
      });
      setIsEditDialogOpen(false);
      loadProductsByCategory(selectedCategory!);
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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-950 dark:via-blue-950 dark:to-purple-950">
          <div className="p-6 space-y-6">
            {/* Liquid Glass Header */}
            <div className="backdrop-blur-md bg-white/70 dark:bg-gray-900/70 p-8 rounded-2xl border border-white/20 shadow-xl">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
                      <Car className="h-8 w-8 text-blue-600" />
                    </div>
                    {selectedCategory ? `${selectedCategory.name}` : 'Quản lý Showroom'}
                  </h1>
                  <p className="text-muted-foreground mb-3">
                    {selectedCategory 
                      ? `${selectedCategory.brand || ''} - Quản lý xe trong danh mục này`
                      : 'Chọn danh mục để xem và quản lý xe trong showroom'
                    }
                  </p>
                  {selectedCategory && (
                    <div className="flex gap-4 text-sm flex-wrap">
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 backdrop-blur-sm border border-green-500/20">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50"></div>
                        <span className="font-medium">{products.filter(p => p.status === 'ACTIVE').length} xe sẵn bán</span>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-500/10 backdrop-blur-sm border border-yellow-500/20">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse shadow-lg shadow-yellow-500/50"></div>
                        <span className="font-medium">{products.filter(p => p.status === 'RESERVED').length} đã đặt cọc</span>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 backdrop-blur-sm border border-red-500/20">
                        <div className="w-2 h-2 bg-red-500 rounded-full shadow-lg shadow-red-500/50"></div>
                        <span className="font-medium">{products.filter(p => p.status === 'SOLDOUT').length} đã bán</span>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 flex-wrap">
                  {selectedCategory && (
                    <Button
                      variant="outline"
                      onClick={handleBackToCategories}
                      className="backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 hover:bg-white/80 dark:hover:bg-gray-800/80 hover:scale-105 transition-all duration-300"
                    >
                      <Car className="mr-2 h-4 w-4" />
                      Quay lại danh mục
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => selectedCategory ? loadProductsByCategory(selectedCategory) : loadCategories()}
                    disabled={loading || loadingProducts}
                    className="backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 hover:bg-white/80 dark:hover:bg-gray-800/80 hover:scale-105 transition-all duration-300"
                  >
                    <RefreshCw className={`mr-2 h-4 w-4 ${(loading || loadingProducts) ? 'animate-spin' : ''}`} />
                    Làm mới
                  </Button>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div>
              {/* Show Categories when no category is selected */}
              {!selectedCategory && (
                <>
                  {loading ? (
                    <div className="text-center py-16">
                      <div className="relative inline-block">
                        <RefreshCw className="h-12 w-12 animate-spin text-purple-600" />
                        <div className="absolute inset-0 h-12 w-12 animate-ping text-purple-400 opacity-20">
                          <RefreshCw className="h-12 w-12" />
                        </div>
                      </div>
                      <p className="mt-6 text-lg font-medium text-muted-foreground">Đang tải danh mục...</p>
                    </div>
                  ) : categories.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="mx-auto w-24 h-24 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 rounded-full flex items-center justify-center mb-6">
                        <Car className="h-12 w-12 text-purple-600 dark:text-purple-400" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">Chưa có danh mục nào</h3>
                      <p className="text-muted-foreground mb-6">
                        Liên hệ quản lý để thêm danh mục xe vào showroom
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="mb-6">
                        <h2 className="text-2xl font-bold mb-2">Danh mục xe</h2>
                        <p className="text-muted-foreground">Chọn một danh mục để xem và quản lý xe</p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {categories.map((category, index) => (
                          <Card
                            key={category.id}
                            className="overflow-hidden hover:shadow-2xl hover:shadow-primary/20 transition-all duration-500 group relative backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border border-white/20 dark:border-gray-700/30 hover:border-primary/50 hover:scale-[1.02] hover:-translate-y-1 cursor-pointer"
                            onClick={() => loadProductsByCategory(category)}
                            style={{
                              background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
                              backdropFilter: 'blur(20px)',
                              WebkitBackdropFilter: 'blur(20px)',
                              animationDelay: `${index * 50}ms`,
                              animation: 'fadeInUp 0.5s ease-out forwards',
                            }}
                          >
                            {/* Liquid Glass Shine Effect */}
                            <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                            
                            {/* Animated Border Gradient */}
                            <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                              <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary/20 via-blue-500/20 to-purple-500/20 blur-sm" />
                            </div>

                            <CardHeader className="pb-3 bg-gradient-to-br from-primary/10 via-blue-500/5 to-purple-500/10 dark:from-primary/20 dark:via-blue-500/10 dark:to-purple-500/20 backdrop-blur-sm relative z-10">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-sm">
                                    <Car className="w-8 h-8 text-blue-600" />
                                  </div>
                                  <div>
                                    <CardTitle className="text-xl">{category.name}</CardTitle>
                                    {category.brand && (
                                      <CardDescription className="text-sm mt-1">{category.brand}</CardDescription>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </CardHeader>

                            <CardContent className="pt-4 relative z-10">
                              <div className="space-y-3">
                                <div className="text-center py-4">
                                  <div className="text-sm text-muted-foreground mb-2">Nhấn để xem xe</div>
                                  <Button
                                    variant="ghost"
                                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                                  >
                                    <Car className="mr-2 h-4 w-4" />
                                    Xem xe trong danh mục
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </>
                  )}
                </>
              )}

              {/* Show Products when a category is selected */}
              {selectedCategory && (
                <>
                  {loadingProducts ? (
                    <div className="text-center py-16">
                      <div className="relative inline-block">
                        <RefreshCw className="h-12 w-12 animate-spin text-purple-600" />
                        <div className="absolute inset-0 h-12 w-12 animate-ping text-purple-400 opacity-20">
                          <RefreshCw className="h-12 w-12" />
                        </div>
                      </div>
                      <p className="mt-6 text-lg font-medium text-muted-foreground">Đang tải xe...</p>
                    </div>
                  ) : products.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="mx-auto w-24 h-24 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 rounded-full flex items-center justify-center mb-6">
                        <Car className="h-12 w-12 text-purple-600 dark:text-purple-400" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">Chưa có xe trong danh mục này</h3>
                      <p className="text-muted-foreground">
                        Liên hệ Dealer Manager để thêm xe vào danh mục này
                      </p>
                    </div>
                  ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product, index) => (
                    <Card 
                      key={product.id} 
                      className="overflow-hidden hover:shadow-2xl hover:shadow-primary/20 transition-all duration-500 group relative backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border border-white/20 dark:border-gray-700/30 hover:border-primary/50 hover:scale-[1.02] hover:-translate-y-1"
                      style={{
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                        animationDelay: `${index * 50}ms`,
                        animation: 'fadeInUp 0.5s ease-out forwards',
                      }}
                    >
                      {/* Liquid Glass Shine Effect */}
                      <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                      
                      {/* Animated Border Gradient */}
                      <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                        <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary/20 via-blue-500/20 to-purple-500/20 blur-sm" />
                      </div>
                      {/* Image Container */}
                      <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 relative overflow-hidden">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="h-16 w-16 text-gray-400 group-hover:scale-110 transition-transform duration-300" />
                          </div>
                        )}
                        {/* Gradient overlay on hover */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        
                        {/* Status Badge */}
                        <div className="absolute top-3 right-3">
                          <Badge className={`${ProductStatusColors[product.status]} shadow-lg backdrop-blur-sm`}>
                            {ProductStatusLabels[product.status]}
                          </Badge>
                        </div>
                        
                        {/* Quick View Button - REMOVED */}
                      </div>
                      
                      {/* Card Content */}
                      <CardContent className="p-5 relative z-10">
                        <h3 className="font-bold text-lg mb-3 line-clamp-1 group-hover:text-purple-600 transition-colors drop-shadow-sm">
                          {product.name}
                        </h3>
                        
                        {/* Info Grid with liquid glass */}
                        <div className="space-y-2 text-sm mb-4">
                          <div className="flex items-center gap-2 p-2 rounded-lg bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm hover:bg-white/60 dark:hover:bg-gray-800/60 transition-colors">
                            <div className="w-2 h-2 rounded-full bg-primary shadow-lg shadow-primary/50"></div>
                            <span className="text-muted-foreground">VIN:</span>
                            <span className="font-mono font-semibold truncate">{product.vinNum}</span>
                          </div>
                          <div className="flex items-center gap-2 p-2 rounded-lg bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm hover:bg-white/60 dark:hover:bg-gray-800/60 transition-colors">
                            <div className="w-2 h-2 rounded-full bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500 shadow-lg"></div>
                            <span className="text-muted-foreground">Màu:</span>
                            <span className="font-semibold">{product.color || "Chưa cập nhật"}</span>
                          </div>
                        </div>

                        {/* Separator với glass effect */}
                        <div className="relative h-[1px] bg-gradient-to-r from-transparent via-gray-300/50 dark:via-gray-600/50 to-transparent mb-4">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent blur-sm"></div>
                        </div>

                        {/* Pricing Section với glass cards */}
                        <div className="space-y-2 mb-4">
                          {product.manufacturerPrice && (
                            <div className="flex items-center justify-between p-2 rounded-lg bg-blue-500/10 dark:bg-blue-500/20 backdrop-blur-sm border border-blue-500/20 hover:border-blue-500/40 transition-all">
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <DollarSign className="h-3 w-3" />
                                Giá hãng:
                              </span>
                              <span className="font-semibold text-blue-600 dark:text-blue-400 drop-shadow-sm">
                                {formatPrice(product.manufacturerPrice)}
                              </span>
                            </div>
                          )}
                          <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10 dark:bg-green-500/20 backdrop-blur-sm border border-green-500/20 hover:border-green-500/40 transition-all">
                            <span className="text-sm font-medium">🏷️ Giá bán:</span>
                            <div className="text-lg font-bold text-green-600 dark:text-green-400 drop-shadow-sm">
                              {formatPrice(product.retailPrice || product.price)}
                            </div>
                          </div>
                          {product.manufacturerPrice && product.retailPrice && (
                            <div className="relative overflow-hidden p-2 rounded-lg bg-gradient-to-br from-emerald-500/20 via-green-500/20 to-teal-500/20 dark:from-emerald-500/30 dark:via-green-500/30 dark:to-teal-500/30 backdrop-blur-md border border-emerald-500/30">
                              {/* Animated shimmer effect */}
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                              
                              <div className="flex items-center justify-between text-xs relative z-10">
                                <span className="text-orange-600 dark:text-orange-400 font-medium">💰 Lợi nhuận:</span>
                                <div className="text-right">
                                  <span className="font-bold text-orange-600 dark:text-orange-400">
                                    {formatPrice(product.retailPrice - product.manufacturerPrice)}
                                  </span>
                                  <div className="text-[10px] text-muted-foreground">
                                    ({(((product.retailPrice - product.manufacturerPrice) / product.manufacturerPrice) * 100).toFixed(1)}%)
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Action Button */}
                        {product.status === 'SOLDOUT' ? (
                          <Badge variant="default" className="w-full justify-center py-3 bg-red-600 hover:bg-red-700 cursor-not-allowed">
                            <Car className="mr-2 h-4 w-4" />
                            Đã bán - Không thể chỉnh sửa
                          </Badge>
                        ) : (
                          <Button
                            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg backdrop-blur-sm hover:shadow-xl transition-all duration-300"
                            onClick={() => handleEditClick(product)}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Cập nhật thông tin
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
                </>
              )}
            </div>

            {/* Edit Product Dialog - Enhanced */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogContent className="max-w-3xl max-h-[95vh] overflow-hidden p-0 gap-0 bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 dark:from-slate-900 dark:via-blue-950/30 dark:to-purple-950/30">
                {/* Header with Gradient */}
                <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-6 pb-8">
                  <div className="absolute inset-0 bg-black/10"></div>
                  <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                  <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                  
                  <DialogHeader className="relative z-10 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                        <Car className="h-6 w-6 text-white" />
                      </div>
                      <DialogTitle className="text-2xl font-bold text-white">
                        Cập nhật thông tin xe
                      </DialogTitle>
                    </div>
                    <div className="text-white/90 text-base flex items-center gap-2">
                      <span className="font-semibold">{selectedProduct?.name}</span>
                      <span className="text-white/60">•</span>
                      <span className="font-mono text-sm">VIN: {selectedProduct?.vinNum}</span>
                    </div>
                  </DialogHeader>
                </div>

                {/* Scrollable Content */}
                <div className="overflow-y-auto max-h-[calc(95vh-240px)] px-6 py-6">
                  <div className="space-y-6">
                    {/* Manufacturer Price Card */}
                    {selectedProduct?.manufacturerPrice && (
                      <div className="relative overflow-hidden bg-gradient-to-br from-blue-500 to-blue-700 p-5 rounded-2xl shadow-xl">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                        <div className="relative z-10">
                          <div className="flex items-center gap-2 mb-3">
                            <DollarSign className="h-5 w-5 text-white" />
                            <Label className="text-white font-semibold text-base">Giá hãng nhập vào</Label>
                          </div>
                          <div className="text-3xl font-bold text-white mb-2">
                            {formatPrice(selectedProduct.manufacturerPrice)}
                          </div>
                          <div className="flex items-center gap-2 text-white/80 text-sm">
                            <div className="w-1.5 h-1.5 bg-white/60 rounded-full"></div>
                            <p>Giá gốc từ EVM - Không thể thay đổi</p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Retail Price Input */}
                    <div className="space-y-3 bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
                          <DollarSign className="h-4 w-4 text-white" />
                        </div>
                        <Label className="text-lg font-semibold">Giá bán cho khách hàng *</Label>
                      </div>
                      <div className="relative">
                        <Input
                          type="number"
                          value={formData.retailPrice}
                          onChange={(e) => {
                            const newRetailPrice = parseInt(e.target.value) || 0;
                            setFormData({ 
                              ...formData, 
                              retailPrice: newRetailPrice,
                              dealerPrice: newRetailPrice
                            });
                          }}
                          placeholder="Nhập giá bán cho khách hàng"
                          className="text-2xl font-bold h-14 pl-4 pr-16 border-2 focus:border-green-500 transition-colors"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">
                          VNĐ
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                        Bạn có thể điều chỉnh giá này bất kỳ lúc nào để tạo lợi nhuận
                      </p>
                      
                      {/* Profit Calculator */}
                      {selectedProduct?.manufacturerPrice && formData.retailPrice > 0 && (
                        <div className="mt-4 p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-xl border-2 border-green-200 dark:border-green-800">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-green-700 dark:text-green-400">💰 Lợi nhuận dự kiến</span>
                            <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                              {formatPrice(formData.retailPrice - selectedProduct.manufacturerPrice)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Tỷ suất lợi nhuận (Margin)</span>
                            <span className="font-semibold text-green-600 dark:text-green-400">
                              {(((formData.retailPrice - selectedProduct.manufacturerPrice) / selectedProduct.manufacturerPrice) * 100).toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Color Input */}
                    <div className="space-y-3 bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500"></div>
                        <Label className="text-base font-semibold">Màu sắc xe</Label>
                      </div>
                      <Select
                        value={formData.color}
                        onValueChange={(value) => setFormData({ ...formData, color: value })}
                      >
                        <SelectTrigger className="h-12 border-2 focus:border-purple-500 transition-colors">
                          <SelectValue placeholder="Chọn màu sắc xe" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Đỏ">Đỏ</SelectItem>
                          <SelectItem value="Xanh dương">Xanh dương</SelectItem>
                          <SelectItem value="Trắng">Trắng</SelectItem>
                          <SelectItem value="Đen">Đen</SelectItem>
                          <SelectItem value="Xám">Xám</SelectItem>
                          <SelectItem value="Bạc">Bạc</SelectItem>
                          <SelectItem value="Xanh lá">Xanh lá</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Image Upload */}
                    <div className="space-y-3 bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800">
                      <div className="flex items-center gap-2">
                        <ImageIcon className="h-5 w-5 text-purple-600" />
                        <Label className="text-base font-semibold">Hình ảnh xe</Label>
                      </div>
                      <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-4 hover:border-purple-500 transition-colors">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="cursor-pointer h-12"
                        />
                        <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1.5">
                          <div className="w-1 h-1 bg-purple-500 rounded-full"></div>
                          Chấp nhận: JPG, PNG, GIF (tối đa 5MB)
                        </p>
                      </div>
                      
                      {imagePreview && (
                        <div className="mt-4 relative group rounded-xl overflow-hidden shadow-2xl">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-full h-64 object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-4 right-4 shadow-xl opacity-0 group-hover:opacity-100 transition-all"
                            onClick={handleRemoveImage}
                          >
                            <ImageIcon className="mr-2 h-4 w-4" />
                            Xóa hình
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    <div className="space-y-3 bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800">
                      <Label className="text-base font-semibold">📝 Mô tả chi tiết</Label>
                      <Textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Nhập mô tả về xe: tính năng nổi bật, tình trạng, ưu điểm..."
                        rows={5}
                        className="resize-none border-2 focus:border-purple-500 transition-colors"
                      />
                    </div>

                    {/* Status Selection */}
                    <div className="space-y-3 bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800">
                      <Label className="text-base font-semibold">🏷️ Trạng thái xe</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value) =>
                          setFormData({ ...formData, status: value as ProductStatus })
                        }
                      >
                        <SelectTrigger className="h-12 border-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ACTIVE">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              Sẵn sàng bán
                            </div>
                          </SelectItem>
                          <SelectItem value="TEST_DRIVE">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              Xe lái thử
                            </div>
                          </SelectItem>
                          <SelectItem value="RESERVED">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                              Đã đặt cọc
                            </div>
                          </SelectItem>
                          <SelectItem value="SOLDOUT">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                              Đã bán
                            </div>
                          </SelectItem>
                          <SelectItem value="INACTIVE">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                              Không hoạt động
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Footer with Actions */}
                <div className="border-t border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm p-6">
                  <DialogFooter className="gap-3">
                    <Button 
                      variant="outline" 
                      onClick={() => setIsEditDialogOpen(false)}
                      className="h-11 px-6 border-2"
                    >
                      Hủy bỏ
                    </Button>
                    <Button 
                      onClick={handleSaveProduct} 
                      disabled={loading}
                      className="h-11 px-8 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg"
                    >
                      {loading ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Đang lưu...
                        </>
                      ) : (
                        <>
                          <Car className="mr-2 h-4 w-4" />
                          Lưu thay đổi
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </DealerStaffLayout>
    </ProtectedRoute>
  );
}
