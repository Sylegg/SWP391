"use client";

import { useEffect, useState, useMemo } from 'react';
import { ProtectedRoute } from "@/components/auth-guards";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
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
import { Car, Calendar, MapPin, MapPinned, Navigation, AlertCircle, CheckCircle } from "lucide-react";
import Link from "next/link";
import CustomerLayout from "@/components/layout/customer-layout";
import { getAllDealers, Dealer } from '@/lib/dealerApi';
import { getAllProducts, Product } from '@/lib/productApi';
import { getAllDistributions } from '@/lib/distributionApi';
import { DistributionRes } from '@/types/distribution';
import { getTestDrivesByUserId, TestDriveRes } from '@/lib/testDriveApi';
import { useToast } from '@/hooks/use-toast';

export default function CustomerDashboard() {
  const { user, updatePreferredDealer } = useAuth();
  const { toast } = useToast();
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [distributions, setDistributions] = useState<DistributionRes[]>([]);
  const [myTestDrives, setMyTestDrives] = useState<TestDriveRes[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [locationRequested, setLocationRequested] = useState(false);
  const [selectedDealer, setSelectedDealer] = useState<string>('');
  const [confirmedDealer, setConfirmedDealer] = useState<string>(''); // Dealer đã xác nhận
  const [showMap, setShowMap] = useState(false); // Hiển thị bản đồ (mặc định ẩn)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false); // Dialog xác nhận
  const [pendingDealer, setPendingDealer] = useState<Dealer | null>(null); // Dealer đang chờ xác nhận

  // ⭐ Sync confirmedDealer với user.dealerId từ AuthContext
  useEffect(() => {
    console.log('🔄 Sync effect - user.dealerId changed:', user?.dealerId);
    if (user?.dealerId) {
      setConfirmedDealer(user.dealerId.toString());
      setShowMap(false);
      console.log('✅ Set confirmedDealer:', user.dealerId.toString());
    }
  }, [user?.dealerId]);

  useEffect(() => {
    console.log('🔍 Customer Page - User state:', {
      hasUser: !!user,
      userId: user?.id,
      userIdType: typeof user?.id,
      username: user?.username,
      dealerId: user?.dealerId
    });
    loadData();
    requestUserLocation();
  }, [user]);

  const requestUserLocation = () => {
    if ('geolocation' in navigator) {
      setLocationRequested(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          toast({
            title: 'Đã xác định vị trí',
            description: 'Đại lý đã được sắp xếp theo khoảng cách từ bạn',
          });
        },
        (error) => {
          console.log('Could not get user location:', error);
          setLocationRequested(false);
        }
      );
    }
  };

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [dealersData, productsData, distributionsData] = await Promise.all([
        getAllDealers(),
        getAllProducts(),
        getAllDistributions(),
      ]);
      
      console.log('📦 Load Data Results:', {
        dealers: dealersData.length,
        allProducts: productsData.length,
        distributions: distributionsData.length
      });
      
      setDealers(dealersData);
      // ⚠️ KHÔNG filter - lưu TẤT CẢ products
      setProducts(productsData);
      setDistributions(distributionsData);
      
      console.log('📊 Distributions sample:', distributionsData.slice(0, 2));

      if (user?.id) {
        console.log('🔍 Loading test drives for user ID:', user.id, 'parsed:', parseInt(user.id));
        const userTestDrives = await getTestDrivesByUserId(parseInt(user.id));
        setMyTestDrives(userTestDrives);
      } else {
        console.warn('⚠️ No user.id available, cannot load test drives');
      }
    } catch (error) {
      console.error('❌ Load data error:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể tải dữ liệu',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const dealersWithDistance = useMemo(() => {
    let allDealers = [...dealers];
    if (userLocation && allDealers.length > 0) {
      allDealers = allDealers
        .map(dealer => {
          let distance: number | undefined = undefined;
          if (dealer.latitude && dealer.longitude) {
            distance = calculateDistance(
              userLocation.lat,
              userLocation.lng,
              dealer.latitude,
              dealer.longitude
            );
          }
          return { ...dealer, distance };
        })
        .sort((a, b) => {
          if (a.distance !== undefined && b.distance !== undefined) {
            return a.distance - b.distance;
          }
          if (a.distance !== undefined) return -1;
          if (b.distance !== undefined) return 1;
          return 0;
        });
    }
    return allDealers;
  }, [dealers, userLocation]);

  const dealerProducts = useMemo(() => {
    if (!confirmedDealer) return [];
    const dealerId = parseInt(confirmedDealer);
    
    console.log('🔍 Calculating dealerProducts for dealer:', dealerId);
    
    // Lấy tất cả distributions của dealer này
    const dealerDistributions = distributions.filter(d => d.dealerId === dealerId);
    console.log('📦 Dealer distributions:', dealerDistributions.length, dealerDistributions);
    
    // Lấy product IDs từ distributions.products
    const productIds = new Set(
      distributions
        .filter(d => d.dealerId === dealerId)
        .flatMap(d => d.products?.map(p => p.id) || [])
    );
    
    console.log('🔢 Product IDs from distributions:', Array.from(productIds));
    console.log('📦 Total products available:', products.length);
    
    // ⚠️ CHỈ LẤY XE ĐÃ ĐĂNG LÊN SHOWROOM (status ACTIVE hoặc TEST_DRIVE)
    const result = products.filter(p => 
      productIds.has(p.id) && 
      (p.status === 'ACTIVE' || p.status === 'TEST_DRIVE')
    );
    
    console.log('✅ Dealer products result (only ACTIVE/TEST_DRIVE):', result.length, result);
    
    return result;
  }, [confirmedDealer, products, distributions]);

  const dealerTestDrives = useMemo(() => {
    if (!confirmedDealer) return [];
    const dealerId = parseInt(confirmedDealer);
    return myTestDrives.filter(td => td.dealer.id === dealerId);
  }, [confirmedDealer, myTestDrives]);

  const handleDealerChange = (dealerId: string) => {
    setSelectedDealer(dealerId);
    const dealer = dealers.find(d => d.id === parseInt(dealerId));
    if (dealer) {
      setPendingDealer(dealer);
      setShowConfirmDialog(true);
    }
  };

  const handleConfirmDealer = async () => {
    if (pendingDealer && user?.id) {
      try {
        const dealerId = pendingDealer.id;
        console.log('🔵 handleConfirmDealer called:', { dealerId, userId: user.id, pendingDealer });
        
        // ⭐ GỌI API QUA AuthContext (đã có userId trong context)
        await updatePreferredDealer(dealerId);
        
        console.log('✅ updatePreferredDealer completed');
        
        setConfirmedDealer(dealerId.toString());
        setShowMap(false); // Ẩn map sau khi xác nhận
        setShowConfirmDialog(false);
        
        toast({
          title: '✅ Đã chọn đại lý',
          description: `Bạn đang xem thông tin tại ${pendingDealer.name}`,
        });
      } catch (error) {
        console.error('❌ Error updating preferred dealer:', error);
        toast({
          title: '❌ Lỗi',
          description: 'Không thể lưu đại lý đã chọn',
          variant: 'destructive',
        });
      }
    } else {
      console.warn('⚠️ handleConfirmDealer: Missing data:', { 
        hasPendingDealer: !!pendingDealer, 
        hasUserId: !!user?.id,
        userId: user?.id 
      });
    }
  };

  const handleCancelConfirm = () => {
    setSelectedDealer('');
    setPendingDealer(null);
    setShowConfirmDialog(false);
  };

  const handleChangeDealer = async () => {
    try {
      // ⭐ XÓA KHỎI DATABASE QUA AuthContext
      await updatePreferredDealer(null);
      
      setConfirmedDealer('');
      setSelectedDealer('');
      setShowMap(false); // Giữ map ẩn
      
      toast({
        title: 'Chọn lại đại lý',
        description: 'Vui lòng chọn đại lý khác từ danh sách',
      });
    } catch (error) {
      console.error('Error removing preferred dealer:', error);
      toast({
        title: '❌ Lỗi',
        description: 'Không thể xóa đại lý đã chọn',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      PENDING: { label: 'Chờ xác nhận', color: 'bg-yellow-100 text-yellow-800' },
      CONFIRMED: { label: 'Đã xác nhận', color: 'bg-blue-100 text-blue-800' },
      COMPLETED: { label: 'Hoàn thành', color: 'bg-green-100 text-green-800' },
      CANCELED: { label: 'Đã hủy', color: 'bg-red-100 text-red-800' },
    };
    const badge = badges[status as keyof typeof badges] || { label: status, color: 'bg-gray-100 text-gray-800' };
    return <Badge className={badge.color}>{badge.label}</Badge>;
  };

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['Customer']}>
        <CustomerLayout>
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-4 text-gray-600">Đang tải...</p>
            </div>
          </div>
        </CustomerLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['Customer']}> 
      <CustomerLayout>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Tổng quan</h1>
              <p className="text-muted-foreground mt-2">
                Chào mừng, {user?.username}! 
                {confirmedDealer ? (
                  <span className="text-primary font-semibold ml-1">
                    🏢 Đang xem: {dealers.find(d => d.id === parseInt(confirmedDealer))?.name}
                  </span>
                ) : (
                  ' Chọn đại lý gần bạn để xem xe và lịch hẹn.'
                )}
              </p>
            </div>
          </div>

          {/* Step 1: Chọn đại lý - NEW UX */}
          {!confirmedDealer && (
            <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPinned className="h-5 w-5" />
                Chọn đại lý
              </CardTitle>
              <CardDescription>
                Vui lòng chọn đại lý để xem xe và lịch hẹn của bạn
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Location Info */}
              <div className="flex items-center justify-between">
                <div>
                  {userLocation && (
                    <p className="text-xs text-green-600 flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Đã sắp xếp đại lý theo khoảng cách từ vị trí của bạn
                    </p>
                  )}
                  {!userLocation && (
                    <p className="text-xs text-muted-foreground">
                      Cho phép truy cập vị trí để sắp xếp đại lý gần bạn
                    </p>
                  )}
                </div>
                {!userLocation && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={requestUserLocation}
                    disabled={locationRequested}
                  >
                    <Navigation className="h-3 w-3 mr-1" />
                    {locationRequested ? 'Đang lấy vị trí...' : 'Lấy vị trí của tôi'}
                  </Button>
                )}
              </div>

              {/* Dealer List - Clickable Cards */}
              <div className="space-y-3">
                <label className="text-sm font-medium">
                  Danh sách đại lý ({dealersWithDistance.length})
                </label>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-2">
                  {dealersWithDistance.map((dealer) => (
                    <div
                      key={dealer.id}
                      onClick={() => setSelectedDealer(dealer.id.toString())}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                        selectedDealer === dealer.id.toString()
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <MapPin className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
                          selectedDealer === dealer.id.toString() ? 'text-green-600' : 'text-gray-400'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <h3 className={`font-semibold text-sm mb-1 ${
                            selectedDealer === dealer.id.toString() ? 'text-green-700' : 'text-gray-900'
                          }`}>
                            {dealer.name}
                          </h3>
                          <p className="text-xs text-gray-600 mb-1">{dealer.address}</p>
                          <div className="flex items-center gap-2 text-xs">
                            {dealer.phone && (
                              <span className="text-gray-500">📞 {dealer.phone}</span>
                            )}
                          </div>
                          {dealer.distance && (
                            <div className="mt-2">
                              <Badge variant="outline" className="text-xs">
                                <Navigation className="h-3 w-3 mr-1" />
                                {dealer.distance.toFixed(1)} km
                              </Badge>
                            </div>
                          )}
                        </div>
                        {selectedDealer === dealer.id.toString() && (
                          <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Confirm Button */}
                {selectedDealer && (
                  <div className="pt-4 border-t">
                    <Button
                      onClick={() => {
                        const dealer = dealers.find(d => d.id === parseInt(selectedDealer));
                        if (dealer) {
                          setPendingDealer(dealer);
                          setShowConfirmDialog(true);
                        }
                      }}
                      className="w-full bg-green-600 hover:bg-green-700"
                      size="lg"
                    >
                      <CheckCircle className="mr-2 h-5 w-5" />
                      Xác nhận đại lý
                    </Button>
                  </div>
                )}

                {!selectedDealer && (
                  <p className="text-xs text-amber-600 flex items-center gap-1 justify-center pt-2">
                    <AlertCircle className="h-3 w-3" />
                    Vui lòng chọn một đại lý từ danh sách
                  </p>
                )}
              </div>

              {/* Toggle Map Button */}
              <div className="pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setShowMap(!showMap)}
                  className="w-full"
                >
                  <MapPinned className="mr-2 h-4 w-4" />
                  {showMap ? 'Ẩn bản đồ' : 'Hiện bản đồ'}
                </Button>
              </div>

              {/* Google Maps - Collapsible */}
              {showMap && (
                <div className="space-y-2 pt-4">
                  <label className="text-sm font-medium">Bản đồ</label>
                  <div className="border rounded-lg overflow-hidden relative" style={{ height: '400px' }}>
                    <iframe
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      loading="lazy"
                      allowFullScreen
                      referrerPolicy="no-referrer-when-downgrade"
                      src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${
                        selectedDealer && dealers.find(d => d.id === parseInt(selectedDealer))?.latitude
                          ? `${dealers.find(d => d.id === parseInt(selectedDealer))?.latitude},${dealers.find(d => d.id === parseInt(selectedDealer))?.longitude}`
                          : userLocation 
                            ? `${userLocation.lat},${userLocation.lng}`
                            : 'Ho+Chi+Minh+City,Vietnam'
                      }&zoom=${selectedDealer ? 15 : 12}`}
                    />
                    {selectedDealer && dealers.find(d => d.id === parseInt(selectedDealer)) && (
                      <div className="absolute top-2 left-2 bg-white/95 backdrop-blur-sm px-3 py-2 rounded-lg shadow-lg border">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-red-500" />
                          <div>
                            <div className="text-sm font-semibold">
                              {dealers.find(d => d.id === parseInt(selectedDealer))?.name}
                            </div>
                            {dealers.find(d => d.id === parseInt(selectedDealer))?.distance && (
                              <div className="text-xs text-muted-foreground">
                                {dealers.find(d => d.id === parseInt(selectedDealer))?.distance?.toFixed(1)} km từ bạn
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          )}

          {/* Welcome Message - After Confirmation */}
          {confirmedDealer && confirmedDealer.trim() !== '' && (
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700">
                  <CheckCircle className="h-6 w-6" />
                  Xin chào khách hàng của {dealers.find(d => d.id === parseInt(confirmedDealer))?.name}
                </CardTitle>
                <CardDescription className="text-green-600">
                  Bạn đang xem thông tin xe và lịch hẹn tại đại lý này
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-green-600" />
                    <span className="font-medium">
                      {dealers.find(d => d.id === parseInt(confirmedDealer))?.address}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleChangeDealer}
                    className="border-green-600 text-green-700 hover:bg-green-100"
                  >
                    <MapPinned className="mr-2 h-4 w-4" />
                    Chọn lại đại lý
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Danh sách xe điện có sẵn - After Dealer Confirmation */}
          {confirmedDealer && confirmedDealer.trim() !== '' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Car className="h-5 w-5 text-blue-600" />
                  Danh mục xe điện có sẵn
                </CardTitle>
                <CardDescription>
                  Các mẫu xe có sẵn tại {dealers.find(d => d.id === parseInt(confirmedDealer))?.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {dealerProducts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Car className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                    <p>Hiện chưa có xe nào tại đại lý này</p>
                    <p className="text-xs mt-2">
                      Vui lòng liên hệ đại lý để biết thêm thông tin
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Debug Info */}
                    {dealerProducts.length > 0 && (
                      <div className="col-span-full bg-gray-100 p-2 rounded text-xs">
                        <strong>Debug:</strong> confirmedDealer = "{confirmedDealer}", selectedDealer = "{selectedDealer}", user.dealerId = {user?.dealerId}
                      </div>
                    )}
                    
                    {dealerProducts.map((product) => {
                      const dealerIdForLink = confirmedDealer || selectedDealer || user?.dealerId?.toString() || '';
                      return (
                      <Card key={product.id} className="overflow-hidden">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base flex items-center justify-between">
                            <span className="truncate">{product.name}</span>
                            <Badge variant={product.status === 'TEST_DRIVE' ? 'default' : 'secondary'}>
                              {product.status === 'TEST_DRIVE' ? 'Lái thử' : product.status}
                            </Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="text-sm">
                            <span className="text-muted-foreground">Màu sắc:</span>
                            <span className="ml-2 font-medium">{product.color || 'N/A'}</span>
                          </div>
                          <div className="text-sm">
                            <span className="text-muted-foreground">Pin:</span>
                            <span className="ml-2 font-medium">{product.battery} kWh</span>
                          </div>
                          <div className="text-sm">
                            <span className="text-muted-foreground">Quãng đường:</span>
                            <span className="ml-2 font-medium">{product.range} km</span>
                          </div>
                          
                          {/* Buttons */}
                          <div className="pt-2 flex gap-2">
                            {product.status === 'TEST_DRIVE' && (
                              <Link 
                                href={`/dashboard/customer/test-drive?productId=${product.id}&dealerId=${dealerIdForLink}`} 
                                className="flex-1"
                                onClick={(e) => {
                                  if (!dealerIdForLink) {
                                    e.preventDefault();
                                    toast({
                                      title: 'Chưa chọn đại lý',
                                      description: 'Vui lòng chọn đại lý trước',
                                      variant: 'destructive',
                                    });
                                  }
                                  console.log('🔗 Test Drive Link:', {
                                    productId: product.id,
                                    confirmedDealer,
                                    selectedDealer,
                                    userDealerId: user?.dealerId,
                                    dealerIdForLink
                                  });
                                }}
                              >
                                <Button variant="outline" size="sm" className="w-full">
                                  <Calendar className="mr-2 h-3 w-3" />
                                  Đặt lịch lái thử
                                </Button>
                              </Link>
                            )}
                            {product.status === 'ACTIVE' && (
                              <>
                                <Link 
                                  href={`/dashboard/customer/test-drive?productId=${product.id}&dealerId=${dealerIdForLink}`} 
                                  className="flex-1"
                                  onClick={(e) => {
                                    if (!dealerIdForLink) {
                                      e.preventDefault();
                                      toast({
                                        title: 'Chưa chọn đại lý',
                                        description: 'Vui lòng chọn đại lý trước',
                                        variant: 'destructive',
                                      });
                                    }
                                    console.log('🔗 Test Drive Link:', {
                                      productId: product.id,
                                      confirmedDealer,
                                      selectedDealer,
                                      userDealerId: user?.dealerId,
                                      dealerIdForLink
                                    });
                                  }}
                                >
                                  <Button variant="outline" size="sm" className="w-full">
                                    <Calendar className="mr-2 h-3 w-3" />
                                    Lái thử
                                  </Button>
                                </Link>
                                <Link href={`/dashboard/customer/order?productId=${product.id}`} className="flex-1">
                                  <Button size="sm" className="w-full bg-green-600 hover:bg-green-700">
                                    <CheckCircle className="mr-2 h-3 w-3" />
                                    Đặt mua
                                  </Button>
                                </Link>
                              </>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Dialog xác nhận chọn đại lý */}
        <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Xác nhận chọn đại lý
              </AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div className="space-y-3 pt-2">
                  <div>
                    Bạn có chắc chắn muốn chọn đại lý:
                  </div>
                  {pendingDealer && (
                    <div className="bg-primary/5 p-4 rounded-lg border-l-4 border-primary">
                      <div className="font-semibold text-lg text-foreground">
                        {pendingDealer.name}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        📍 {pendingDealer.address}
                      </div>
                      {pendingDealer.distance && (
                        <div className="text-sm text-blue-600 mt-1">
                          📏 Cách bạn: {pendingDealer.distance.toFixed(1)} km
                        </div>
                      )}
                    </div>
                  )}
                  <div className="text-sm">
                    Sau khi xác nhận, bạn sẽ thấy danh sách xe và lịch hẹn tại đại lý này.
                  </div>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={handleCancelConfirm}>
                Hủy
              </AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmDealer}>
                Xác nhận
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CustomerLayout>
    </ProtectedRoute>
  );
}
