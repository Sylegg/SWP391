'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { getAllProducts, ProductRes } from '@/lib/productApi';
import { createOrder, OrderReq } from '@/lib/orderApi';
import { getUsersByRole, UserRes, createUser, UserReq } from '@/lib/userApi';
import { getDealerCategoriesByDealerId, DealerCategoryRes } from '@/lib/categoryApi';
import { ShoppingCart, Loader2, UserPlus, ArrowRight, ArrowLeft } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CustomerInfo {
  customerId?: number;
  isExisting: boolean;
  name: string;
  email: string;
  phone: string;
  address: string;
}

type Step = 'customer' | 'product';

interface CreateOfflineOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CreateOfflineOrderDialog({ open, onOpenChange, onSuccess }: CreateOfflineOrderDialogProps) {
  const { toast } = useToast();
  const { user } = useAuth();

  // State
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState<Step>('customer');
  const [createdUserId, setCreatedUserId] = useState<number | null>(null); // Track created user ID
  
  // Customer state
  const [customers, setCustomers] = useState<UserRes[]>([]);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    isExisting: false,
    name: '',
    email: '',
    phone: '',
    address: ''
  });

  // Product state
  const [products, setProducts] = useState<ProductRes[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<ProductRes | null>(null);
  const [notes, setNotes] = useState<string>('');

  // Color variants (filtered from products)
  const [availableColors, setAvailableColors] = useState<string[]>([]);
  const [selectedColor, setSelectedColor] = useState<string>('');

  // Load data when dialog opens
  useEffect(() => {
    if (open) {
      loadInitialData();
    } else {
      // Reset form when dialog closes
      resetForm();
    }
  }, [open]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      // Load customers (role = "Customer")
      const customersData = await getUsersByRole('Customer');
      setCustomers(customersData);

      // Load products - filter by dealer's categories
      if (!user?.dealerId) {
        console.error('❌ User dealerId not found');
        toast({
          title: 'Lỗi',
          description: 'Không tìm thấy thông tin đại lý. Vui lòng đăng nhập lại.',
          variant: 'destructive',
        });
        setProducts([]);
        setLoading(false);
        return;
      }

      // 1. Load categories created by this dealer (Categories, not DealerCategories)
      const { getCategoriesByDealerId } = await import('@/lib/categoryApi');
      const dealerCategories = await getCategoriesByDealerId(user.dealerId);
      const categoryIds = dealerCategories.map(c => c.id);
      
      console.log('🏪 Dealer ID:', user.dealerId);
      console.log('🏪 Categories:', categoryIds);

      // 2. Load all products and filter by categoryId
      const productsData = await getAllProducts();
      console.log('📦 All products:', productsData.length);
      
      const dealerProducts = productsData.filter(p => 
        p.status === 'ACTIVE' && 
        categoryIds.includes(p.categoryId)
      );
      
      console.log('✅ Filtered products:', dealerProducts.length);
      
      setProducts(dealerProducts);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể tải dữ liệu. Vui lòng thử lại.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setCurrentStep('customer');
    setCreatedUserId(null);
    setCustomerInfo({
      isExisting: false,
      name: '',
      email: '',
      phone: '',
      address: ''
    });
    setSelectedProduct(null);
    setNotes('');
    setAvailableColors([]);
    setSelectedColor('');
  };

  // Handle customer selection
  const handleCustomerChange = (customerId: string) => {
    if (customerId === 'new') {
      setCustomerInfo({
        isExisting: false,
        name: '',
        email: '',
        phone: '',
        address: ''
      });
    } else {
      const customer = customers.find(c => c.id === parseInt(customerId));
      if (customer) {
        console.log('📝 Selected existing customer:', customer);
        setCustomerInfo({
          customerId: customer.id,
          isExisting: true,
          name: customer.username || '',
          email: customer.email || '',
          phone: customer.phone || '',
          address: customer.address || ''
        });
        setCreatedUserId(customer.id); // Save to createdUserId as well
        console.log('📝 Customer ID set to:', customer.id);
      }
    }
  };

  // Handle product selection (by model/name)
  const handleProductChange = (productId: string) => {
    const product = products.find(p => p.id === parseInt(productId));
    if (product) {
      setSelectedProduct(product);
      
      // Get available colors for this model
      const modelProducts = products.filter(p => p.name === product.name);
      const colors = [...new Set(modelProducts.map(p => p.color).filter(Boolean))] as string[];
      setAvailableColors(colors);
      
      // Auto-select first color and update selectedProduct to match that color
      if (colors.length > 0) {
        const firstColor = colors[0];
        setSelectedColor(firstColor);
        
        // Update selectedProduct to the one with the first color
        const productWithColor = modelProducts.find(p => p.color === firstColor);
        if (productWithColor) {
          setSelectedProduct(productWithColor);
        }
      }
    }
  };

  // Handle color selection - update selectedProduct to match the selected color
  const handleColorChange = (color: string) => {
    setSelectedColor(color);
    
    if (selectedProduct) {
      // Find product with the same name but different color
      const productWithColor = products.find(
        p => p.name === selectedProduct.name && p.color === color
      );
      
      if (productWithColor) {
        console.log('🎨 Color changed, updating product:', productWithColor);
        setSelectedProduct(productWithColor);
      }
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log('🔍 Submit - customerInfo:', customerInfo);
    console.log('🔍 Submit - selectedProduct:', selectedProduct);
    console.log('🔍 Submit - selectedColor:', selectedColor);

    // Validate customer info - bắt buộc điền đủ thông tin bao gồm cả địa chỉ
    if (!customerInfo.name || !customerInfo.email || !customerInfo.phone || !customerInfo.address) {
      toast({
        title: 'Thiếu thông tin',
        description: 'Vui lòng điền đầy đủ thông tin khách hàng .',
        variant: 'destructive',
      });
      return;
    }

    if (!selectedProduct) {
      toast({
        title: 'Thiếu thông tin',
        description: 'Vui lòng chọn sản phẩm.',
        variant: 'destructive',
      });
      return;
    }

    if (!selectedColor) {
      toast({
        title: 'Thiếu thông tin',
        description: 'Vui lòng chọn màu sắc.',
        variant: 'destructive',
      });
      return;
    }

    // Validate customerId (phải đã tạo tài khoản ở bước 1)
    const finalUserId = createdUserId || customerInfo.customerId;
    
    if (!finalUserId || finalUserId === 0) {
      console.error('❌ No user ID found!');
      console.error('❌ createdUserId:', createdUserId);
      console.error('❌ customerInfo.customerId:', customerInfo.customerId);
      toast({
        title: 'Lỗi',
        description: 'Không tìm thấy thông tin khách hàng. Vui lòng quay lại bước 1.',
        variant: 'destructive',
      });
      return;
    }

    console.log('✅ Final User ID:', finalUserId);

    setSubmitting(true);

    try {
      // Get dealer ID from localStorage
      const userStr = localStorage.getItem('user');
      if (!userStr) throw new Error('User not found');
      
      const user = JSON.parse(userStr);
      const dealerId = user.dealerId;
      
      if (!dealerId) throw new Error('Dealer ID not found');

      // Tài khoản đã được tạo ở bước 1, chỉ cần tạo đơn hàng
      const userId = finalUserId;

      console.log('✅ UserId:', userId);
      console.log('✅ DealerId:', dealerId);

      // Find product with selected color
      const productWithColor = products.find(
        p => p.name === selectedProduct.name && p.color === selectedColor
      );

      const orderData: OrderReq = {
        userId: userId,
        dealerId: dealerId,
        productId: productWithColor?.id || selectedProduct.id,
        quantity: 1,
        notes: notes || undefined
      };

      console.log('📦 Creating order with data:', orderData);
      await createOrder(orderData);

      toast({
        title: 'Thành công',
        description: 'Đơn hàng đã được tạo thành công.',
      });

      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error('Failed to create order:', error);
      const errorMessage = error instanceof Error ? error.message : 'Không thể tạo đơn hàng. Vui lòng thử lại.';
      toast({
        title: 'Lỗi',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Calculate total price (always 1 car)
  const totalPrice = selectedProduct ? (selectedProduct.retailPrice || 0) : 0;

  // Get unique product models
  const productModels = products.reduce((acc, product) => {
    if (!acc.find(p => p.name === product.name)) {
      acc.push(product);
    }
    return acc;
  }, [] as ProductRes[]);

  // Handle create new customer account
  const handleCreateAccount = async () => {
    // Validate customer info - bắt buộc điền đủ thông tin bao gồm cả địa chỉ
    if (!customerInfo.name || !customerInfo.email || !customerInfo.phone || !customerInfo.address) {
      toast({
        title: 'Thiếu thông tin',
        description: 'Vui lòng điền đầy đủ thông tin khách hàng .',
        variant: 'destructive',
      });
      return;
    }

    // Validate name (chỉ chữ cái, khoảng trắng, không số và ký tự đặc biệt)
    const nameRegex = /^[a-zA-ZÀ-ỹ\s]+$/;
    if (!nameRegex.test(customerInfo.name)) {
      toast({
        title: 'Họ và tên không hợp lệ',
        description: 'Họ và tên chỉ được chứa chữ cái, không được chứa số hoặc ký tự đặc biệt.',
        variant: 'destructive',
      });
      return;
    }

    // Validate email format (phải có @gmail.com)
    const emailRegex = /^[^\s@]+@gmail\.com$/;
    if (!emailRegex.test(customerInfo.email)) {
      toast({
        title: 'Email không hợp lệ',
        description: 'Email phải có định dạng @gmail.com',
        variant: 'destructive',
      });
      return;
    }

    // Check for duplicate email - KHÔNG CHO PHÉP TRÙNG EMAIL
    const emailExists = customers.some(
      customer => customer.email?.toLowerCase() === customerInfo.email.toLowerCase()
    );
    if (emailExists) {
      toast({
        title: 'Email đã tồn tại',
        description: 'Email này đã được sử dụng. Vui lòng chọn khách hàng có sẵn hoặc dùng email khác.',
        variant: 'destructive',
      });
      return;
    }

    // Validate phone format (chỉ số, bắt đầu bằng 0, đúng 10 số)
    const phoneRegex = /^0[0-9]{9}$/;
    if (!phoneRegex.test(customerInfo.phone)) {
      toast({
        title: 'Số điện thoại không hợp lệ',
        description: 'Số điện thoại phải bắt đầu bằng số 0 và có đúng 10 chữ số.',
        variant: 'destructive',
      });
      return;
    }

    // Tạo tài khoản mới
    setSubmitting(true);
    try {
      // Get dealer ID from localStorage
      const userStr = localStorage.getItem('user');
      if (!userStr) throw new Error('User not found');
      
      const user = JSON.parse(userStr);
      const dealerId = user.dealerId;
      
      if (!dealerId) throw new Error('Dealer ID not found');

      console.log('👤 Creating new customer account...');
      
      const newUserData: UserReq = {
        username: customerInfo.name, // Use name as username for display
        email: customerInfo.email,
        phone: customerInfo.phone,
        address: customerInfo.address,
        password: customerInfo.phone, // Use phone as password
        roleName: 'Customer',
        dealerId: dealerId,
        status: 'ACTIVE'
      };

      const newUser = await createUser(newUserData);
      
      console.log('✅ New user created:', newUser);
      console.log('✅ New user ID:', newUser.id);
      
      // Lưu vào createdUserId
      setCreatedUserId(newUser.id);
      
      // Lưu customerId vào state
      const updatedCustomerInfo = { 
        ...customerInfo, 
        customerId: newUser.id,
        isExisting: true // Đánh dấu là đã tồn tại sau khi tạo
      };
      
      setCustomerInfo(updatedCustomerInfo);
      
      console.log('✅ Updated customerInfo:', updatedCustomerInfo);
      console.log('✅ createdUserId set to:', newUser.id);

      // Cập nhật danh sách customers để hiển thị khách hàng mới
      setCustomers(prevCustomers => [...prevCustomers, newUser]);
      
      toast({
        title: 'Tạo tài khoản thành công',
        description: `Đã tạo tài khoản cho khách hàng ${customerInfo.name}. Mật khẩu là số điện thoại.`,
      });

      // Đóng dialog và reload danh sách đơn hàng
      onOpenChange(false);
      if (onSuccess) {
        onSuccess(); // Reload orders list
      }
    } catch (error) {
      console.error('Failed to create customer account:', error);
      toast({
        title: 'Lỗi tạo tài khoản',
        description: 'Không thể tạo tài khoản khách hàng. ' + (error instanceof Error ? error.message : ''),
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle next step for existing customer (customer -> product)
  const handleNextStep = () => {
    // Chỉ cần kiểm tra đã chọn khách hàng chưa
    if (!customerInfo.customerId) {
      toast({
        title: 'Chưa chọn khách hàng',
        description: 'Vui lòng chọn khách hàng từ danh sách.',
        variant: 'destructive',
      });
      return;
    }

    // Chuyển sang bước 2
    setCurrentStep('product');
  };

  // Handle back to customer step
  const handleBackStep = () => {
    // Không reset customerInfo để giữ customerId đã tạo
    setCurrentStep('customer');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>
            {currentStep === 'customer' ? 'Thông tin khách hàng' : 'Chọn sản phẩm'}
          </DialogTitle>
          <DialogDescription>
            {currentStep === 'customer' 
              ? 'Bước 1/2: Tạo tài khoản hoặc chọn khách hàng hiện có' 
              : 'Bước 2/2: Chọn mẫu xe và hoàn tất đơn hàng'
            }
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <ScrollArea className="max-h-[calc(90vh-200px)] pr-4">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Step 1: Customer Information */}
              {currentStep === 'customer' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="customer">Khách hàng</Label>
                    <Select onValueChange={handleCustomerChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn khách hàng hoặc thêm mới" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">
                          <div className="flex items-center">
                            <UserPlus className="h-4 w-4 mr-2" />
                            Tạo tài khoản khách hàng mới
                          </div>
                        </SelectItem>
                        {customers.filter(c => c.id).map((customer) => (
                          <SelectItem key={customer.id} value={customer.id!.toString()}>
                            {customer.username} - {customer.phone || customer.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {!customerInfo.isExisting && (
                    <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                      <p className="text-sm text-blue-900 dark:text-blue-100 flex items-center gap-2">
                        <UserPlus className="h-4 w-4" />
                        <strong>Tạo tài khoản mới:</strong> Số điện thoại sẽ được dùng làm mật khẩu đăng nhập
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Họ và tên *</Label>
                      <Input
                        id="name"
                        value={customerInfo.name}
                        onChange={(e) => {
                          // Chỉ cho phép chữ cái và khoảng trắng
                          const value = e.target.value;
                          if (value === '' || /^[a-zA-ZÀ-ỹ\s]*$/.test(value)) {
                            setCustomerInfo({ ...customerInfo, name: value });
                          }
                        }}
                        disabled={customerInfo.isExisting}
                        placeholder="Nguyễn Văn A"
                        required
                      />
                      {!customerInfo.isExisting && (
                        <p className="text-xs text-muted-foreground">
                          Chỉ được nhập chữ cái, không được nhập số hoặc ký tự đặc biệt
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={customerInfo.email}
                        onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                        disabled={customerInfo.isExisting}
                        placeholder="example@gmail.com"
                        required
                      />
                      {!customerInfo.isExisting && (
                        <p className="text-xs text-muted-foreground">
                          Email phải có định dạng @gmail.com
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Số điện thoại *</Label>
                      <Input
                        id="phone"
                        value={customerInfo.phone}
                        onChange={(e) => {
                          // Chỉ cho phép nhập số, tối đa 10 số
                          const value = e.target.value;
                          if (value === '' || (/^[0-9]*$/.test(value) && value.length <= 10)) {
                            setCustomerInfo({ ...customerInfo, phone: value });
                          }
                        }}
                        disabled={customerInfo.isExisting}
                        placeholder="0901234567"
                        maxLength={10}
                        required
                      />
                      {!customerInfo.isExisting && (
                        <p className="text-xs text-muted-foreground">
                          Bắt đầu bằng số 0, đúng 10 số. Dùng làm tên đăng nhập và mật khẩu
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">Địa chỉ *</Label>
                      <Input
                        id="address"
                        value={customerInfo.address}
                        onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
                        disabled={customerInfo.isExisting}
                        placeholder="123 Đường ABC, Quận 1, TP.HCM"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Product Selection */}
              {currentStep === 'product' && (
                <div className="space-y-4">
                  {/* Show customer summary */}
                  <div className="bg-muted rounded-lg p-4 space-y-2">
                    <h4 className="font-semibold text-sm">Thông tin khách hàng</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Tên:</span> {customerInfo.name}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Email:</span> {customerInfo.email}
                      </div>
                      <div>
                        <span className="text-muted-foreground">SĐT:</span> {customerInfo.phone}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Địa chỉ:</span> {customerInfo.address || 'Chưa có'}
                      </div>
                    </div>
                    {!customerInfo.isExisting && (
                      <div className="pt-2 border-t border-border">
                        <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                          ✓ Tài khoản mới sẽ được tạo với mật khẩu: {customerInfo.phone}
                        </p>
                      </div>
                    )}
                  </div>

                  <h3 className="font-semibold text-lg pt-4">Chọn sản phẩm</h3>
                  
                  {productModels.length === 0 ? (
                    <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                      <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        ⚠️ Đại lý của bạn chưa có sản phẩm nào sẵn sàng bán.
                      </p>
                      <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">
                        Vui lòng liên hệ Dealer Manager để nhập xe vào danh mục của đại lý.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label htmlFor="product">Mẫu xe *</Label>
                      <Select onValueChange={handleProductChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn mẫu xe" />
                        </SelectTrigger>
                        <SelectContent>
                          {productModels.map((product) => (
                            <SelectItem key={product.id} value={product.id.toString()}>
                              {product.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {selectedProduct && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="color">Màu sắc *</Label>
                        <Select 
                          value={selectedColor}
                          onValueChange={handleColorChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn màu sắc" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableColors.map((color) => (
                              <SelectItem key={color} value={color}>
                                {color}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Product Details */}
                      <div className="bg-muted p-4 rounded-lg space-y-3">
                        <h4 className="font-semibold text-lg">Thông số kỹ thuật</h4>
                        
                        {/* Hình ảnh sản phẩm */}
                        {selectedProduct.image && (
                          <div className="w-full h-48 rounded-lg overflow-hidden bg-white dark:bg-gray-800">
                            <img 
                              src={selectedProduct.image} 
                              alt={selectedProduct.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}

                        {/* Thông tin cơ bản */}
                        <div className="space-y-2">
                          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                            <div className="font-medium text-muted-foreground">Tên xe:</div>
                            <div className="font-semibold">{selectedProduct.name}</div>
                            
                            <div className="font-medium text-muted-foreground">Màu sắc:</div>
                            <div className="font-semibold">{selectedColor}</div>
                            
                            <div className="font-medium text-muted-foreground">Số VIN:</div>
                            <div className="font-mono text-xs">{selectedProduct.vinNum}</div>
                            
                            <div className="font-medium text-muted-foreground">Số động cơ:</div>
                            <div className="font-mono text-xs">{selectedProduct.engineNum}</div>
                            
                            <div className="font-medium text-muted-foreground">Ngày sản xuất:</div>
                            <div>{selectedProduct.manufacture_date 
                              ? new Date(selectedProduct.manufacture_date).toLocaleDateString('vi-VN')
                              : 'Chưa có thông tin'}
                            </div>
                            
                            {selectedProduct.stockInDate && (
                              <>
                                <div className="font-medium text-muted-foreground">Ngày nhập kho:</div>
                                <div>{new Date(selectedProduct.stockInDate).toLocaleDateString('vi-VN')}</div>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Thông số kỹ thuật động cơ */}
                        <div className="pt-2 border-t border-border">
                          <h5 className="font-semibold text-sm mb-2">Động cơ & Hiệu suất</h5>
                          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                            <div>
                              <span className="text-muted-foreground">Pin:</span>
                              <span className="ml-2 font-semibold">{selectedProduct.battery} kWh</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Quãng đường:</span>
                              <span className="ml-2 font-semibold">{selectedProduct.range} km</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Công suất:</span>
                              <span className="ml-2 font-semibold">{selectedProduct.hp} HP</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Mô-men xoắn:</span>
                              <span className="ml-2 font-semibold">{selectedProduct.torque} Nm</span>
                            </div>
                          </div>
                        </div>

                        {/* Mô tả */}
                        {selectedProduct.description && (
                          <div className="pt-2 border-t border-border">
                            <h5 className="font-semibold text-sm mb-1">Mô tả:</h5>
                            <p className="text-sm text-muted-foreground">{selectedProduct.description}</p>
                          </div>
                        )}

                        {/* Giá bán */}
                        <div className="pt-2 border-t border-border">
                          <div className="text-2xl font-bold text-primary">
                            {totalPrice.toLocaleString('vi-VN')} VNĐ
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            💡 Mỗi đơn hàng chỉ được mua 1 xe
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </form>
          </ScrollArea>
        )}

        <DialogFooter>
          <div className="flex justify-between w-full">
            <div>
              {currentStep === 'product' && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBackStep}
                  disabled={submitting}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Quay lại
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={submitting}
              >
                Hủy
              </Button>
              {currentStep === 'customer' ? (
                // Nếu chưa chọn khách hàng hoặc chọn "Tạo mới" → Nút "Tạo tài khoản"
                // Nếu đã chọn khách hàng có sẵn → Nút "Tiếp theo"
                !customerInfo.isExisting ? (
                  <Button
                    type="button"
                    onClick={handleCreateAccount}
                    disabled={loading || submitting}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Đang tạo tài khoản...
                      </>
                    ) : (
                      <>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Tạo tài khoản
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={handleNextStep}
                    disabled={loading || submitting}
                  >
                    Tiếp theo
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                )
              ) : (
                <Button
                  type="submit"
                  onClick={handleSubmit}
                  disabled={submitting || !selectedProduct || loading}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang tạo...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Tạo đơn hàng
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
