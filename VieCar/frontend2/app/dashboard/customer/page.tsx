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
          <div className="flex items-center justify-center min-h-[70vh]">
            <div className="text-center relative">
              {/* Liquid Glass Background */}
              <div className="absolute inset-0 -z-10">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/20 via-teal-300/20 to-cyan-400/20 rounded-3xl blur-3xl animate-pulse"></div>
              </div>
              
              {/* Animated Spinner with Liquid Effect */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full blur-xl opacity-50 animate-ping"></div>
                <div className="relative animate-spin rounded-full h-16 w-16 border-4 border-transparent bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 p-1 mx-auto">
                  <div className="h-full w-full bg-white rounded-full"></div>
                </div>
              </div>
              
              <p className="mt-6 text-lg font-medium bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent animate-pulse">
                Đang tải dữ liệu...
              </p>
              
              {/* Progress Bar */}
              <div className="mt-4 w-48 mx-auto h-1 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 animate-[gradient-shift_2s_ease-in-out_infinite]"></div>
              </div>
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
          {/* 🎨 Liquid Glass Hero Header */}
          <div className="relative overflow-hidden rounded-2xl">
            {/* Animated Background Gradients */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 animate-[gradient-shift_8s_ease-in-out_infinite]"></div>
            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-400/20 via-transparent to-cyan-400/20 animate-[liquid-shimmer_3s_ease-in-out_infinite]"></div>
            
            {/* Glass Card */}
            <div className="relative backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl">
              <div className="p-8">
                <div className="flex items-start justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm shadow-lg">
                        <Car className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <h1 className="text-4xl font-bold text-white">
                          Chào mừng khách hàng
                        </h1>
                        <p className="text-white/90 text-base mt-1">
                          Electric Vehicle Management System
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-4 space-y-2">
                      <p className="text-white/95 text-lg">
                        Xin chào, <span className="font-bold">{user?.username}</span>
                      </p>
                      {confirmedDealer ? (
                        <p className="text-white/80 text-sm flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          Đang xem tại: <span className="font-semibold">{dealers.find(d => d.id === parseInt(confirmedDealer))?.name}</span>
                        </p>
                      ) : (
                        <p className="text-amber-200 text-sm flex items-center gap-2">
                          <AlertCircle className="h-4 w-4" />
                          Vui lòng chọn đại lý để bắt đầu mua sắm
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {/* Role Badge - Right Side */}
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/30">
                    <div className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse"></div>
                    <span className="text-white font-semibold text-sm">Khách hàng</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 📍 Step 1: Chọn đại lý - Liquid Glass Design */}
          {!confirmedDealer && (
            <div className="relative">
              {/* Gradient Background Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-100/50 via-teal-50/30 to-cyan-100/50 rounded-2xl blur-2xl -z-10"></div>
              
              <Card className="border-emerald-200/60 shadow-xl backdrop-blur-sm bg-white/80 overflow-hidden">
                {/* Header with Gradient */}
                <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 border-b border-emerald-200/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2.5 text-xl">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 shadow-md">
                        <MapPinned className="h-5 w-5 text-white" />
                      </div>
                      <span className="bg-gradient-to-r from-emerald-700 to-teal-700 bg-clip-text text-transparent font-bold">
                        Chọn đại lý
                      </span>
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Vui lòng chọn đại lý để xem xe và đặt lịch hẹn
                    </CardDescription>
                  </CardHeader>
                </div>
                
                <CardContent className="space-y-4 pt-6">
                  {/* Location Info */}
                  <div className="flex items-center justify-between p-4 rounded-xl border border-emerald-100 bg-gradient-to-r from-emerald-50/50 to-teal-50/50">
                    <div className="flex-1">
                      {userLocation && (
                        <p className="text-sm text-emerald-700 flex items-center gap-2 font-medium">
                          <CheckCircle className="h-4 w-4 fill-emerald-500 text-white" />
                          Đã sắp xếp đại lý theo khoảng cách từ vị trí của bạn
                        </p>
                      )}
                      {!userLocation && (
                        <p className="text-sm text-gray-600 flex items-center gap-2">
                          <Navigation className="h-4 w-4 text-gray-400" />
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
                        className="ml-4 border-emerald-300 hover:bg-emerald-50 hover:border-emerald-400 transition-all"
                      >
                        <Navigation className="h-3.5 w-3.5 mr-1.5" />
                        {locationRequested ? 'Đang lấy...' : 'Lấy vị trí'}
                      </Button>
                    )}
                  </div>

                  {/* Dealer List - Clickable Cards */}
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <div className="w-1 h-5 bg-gradient-to-b from-emerald-500 to-teal-600 rounded-full"></div>
                      Danh sách đại lý ({dealersWithDistance.length})
                    </label>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin">
                      {dealersWithDistance.map((dealer) => (
                        <div
                          key={dealer.id}
                          onClick={() => setSelectedDealer(dealer.id.toString())}
                          className={`group relative p-5 border-2 rounded-xl cursor-pointer transition-all duration-300 ${
                            selectedDealer === dealer.id.toString()
                              ? 'border-emerald-500 bg-gradient-to-br from-emerald-50 to-teal-50 shadow-lg scale-[1.02]'
                              : 'border-gray-200 hover:border-emerald-300 hover:shadow-md hover:scale-[1.01] bg-white'
                          }`}
                        >
                          {/* Selected Indicator Ring */}
                          {selectedDealer === dealer.id.toString() && (
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl opacity-20 blur-sm"></div>
                          )}
                          
                          <div className="relative flex items-start gap-3.5">
                            <MapPin className={`h-5 w-5 mt-0.5 flex-shrink-0 transition-all ${
                              selectedDealer === dealer.id.toString() ? 'text-emerald-600 scale-110' : 'text-gray-400 group-hover:text-emerald-500'
                            }`} />
                            
                            <div className="flex-1 min-w-0">
                              <h3 className={`font-semibold text-base mb-1.5 transition-colors ${
                                selectedDealer === dealer.id.toString() ? 'text-emerald-700' : 'text-gray-900'
                              }`}>
                                {dealer.name}
                              </h3>
                              <p className="text-xs text-gray-600 mb-2 line-clamp-2">{dealer.address}</p>
                              <div className="flex items-center gap-2 text-xs">
                                {dealer.phone && (
                                  <span className="text-gray-500 flex items-center gap-1">
                                    <span className="text-emerald-600">📞</span> {dealer.phone}
                                  </span>
                                )}
                              </div>
                              {dealer.distance && (
                                <div className="mt-3">
                                  <Badge variant="outline" className="text-xs border-emerald-300 text-emerald-700 bg-emerald-50">
                                    <Navigation className="h-3 w-3 mr-1" />
                                    {dealer.distance.toFixed(1)} km
                                  </Badge>
                                </div>
                              )}
                            </div>
                            
                            {selectedDealer === dealer.id.toString() && (
                              <CheckCircle className="h-6 w-6 text-emerald-600 fill-emerald-100 flex-shrink-0 animate-[scale-in_0.2s_ease-out]" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Confirm Button */}
                    {selectedDealer && (
                      <div className="pt-4 border-t border-emerald-100 animate-[scale-in_0.2s_ease-out]">
                        <Button
                          onClick={() => {
                            const dealer = dealers.find(d => d.id === parseInt(selectedDealer));
                            if (dealer) {
                              setPendingDealer(dealer);
                              setShowConfirmDialog(true);
                            }
                          }}
                          className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                          size="lg"
                        >
                          <CheckCircle className="mr-2 h-5 w-5" />
                          Xác nhận đại lý
                        </Button>
                      </div>
                    )}

                    {!selectedDealer && (
                      <p className="text-xs text-amber-600 flex items-center gap-1.5 justify-center pt-2 bg-amber-50 py-3 rounded-lg border border-amber-200">
                        <AlertCircle className="h-4 w-4" />
                        Vui lòng chọn một đại lý từ danh sách
                      </p>
                    )}
                  </div>

                  {/* Toggle Map Button */}
                  <div className="pt-4 border-t border-emerald-100">
                    <Button
                      variant="outline"
                      onClick={() => setShowMap(!showMap)}
                      className="w-full border-emerald-300 hover:bg-emerald-50 transition-all"
                    >
                      <MapPinned className="mr-2 h-4 w-4 text-emerald-600" />
                      {showMap ? 'Ẩn bản đồ' : 'Hiện bản đồ'}
                    </Button>
                  </div>

                  {/* Google Maps - Collapsible with Liquid Glass */}
                  {showMap && (
                    <div className="space-y-3 pt-4 animate-[scale-in_0.3s_ease-out]">
                      <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <div className="w-1 h-5 bg-gradient-to-b from-emerald-500 to-teal-600 rounded-full"></div>
                        Bản đồ
                      </label>
                      <div className="border-2 border-emerald-200 rounded-xl overflow-hidden relative shadow-lg" style={{ height: '400px' }}>
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
                          <div className="absolute top-3 left-3 backdrop-blur-xl bg-white/90 px-4 py-3 rounded-xl shadow-xl border border-emerald-200">
                            <div className="flex items-center gap-2.5">
                              <MapPin className="h-4 w-4 text-red-500" />
                              <div>
                                <div className="text-sm font-semibold text-gray-900">
                                  {dealers.find(d => d.id === parseInt(selectedDealer))?.name}
                                </div>
                                {dealers.find(d => d.id === parseInt(selectedDealer))?.distance && (
                                  <div className="text-xs text-emerald-600 font-medium">
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
            </div>
          )}

          {/* ✅ Welcome Message - After Confirmation */}
          {confirmedDealer && confirmedDealer.trim() !== '' && (
            <div className="relative">
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-teal-400/20 rounded-2xl blur-xl"></div>
              
              <Card className="relative border-emerald-300 bg-gradient-to-br from-emerald-50 to-teal-50 shadow-lg overflow-hidden">
                {/* Animated Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-400 animate-[gradient-shift_8s_ease-in-out_infinite]"></div>
                </div>
                
                <CardHeader className="relative">
                  <CardTitle className="flex items-center gap-3 text-emerald-800">
                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-md">
                      <CheckCircle className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-lg font-bold">
                      Xin chào khách hàng của {dealers.find(d => d.id === parseInt(confirmedDealer))?.name}
                    </span>
                  </CardTitle>
                  <CardDescription className="text-emerald-700 font-medium">
                    Bạn đang xem thông tin xe và lịch hẹn tại đại lý này
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white/60 backdrop-blur-sm p-4 rounded-xl border border-emerald-200">
                    <div className="flex items-center gap-2.5 text-sm">
                      <MapPin className="h-4 w-4 text-emerald-600" />
                      <span className="font-medium text-gray-900">
                        {dealers.find(d => d.id === parseInt(confirmedDealer))?.address}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleChangeDealer}
                      className="border-emerald-400 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-500 transition-all"
                    >
                      <MapPinned className="mr-2 h-4 w-4" />
                      Chọn lại đại lý
                    </Button>
                  </div>
                </CardContent>
                
                {/* Bottom Accent Line */}
                <div className="h-1 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
              </Card>
            </div>
          )}

          {/* 🚗 Danh sách xe điện có sẵn - After Dealer Confirmation */}
          {confirmedDealer && confirmedDealer.trim() !== '' && (
            <Card className="border-gray-200 shadow-lg overflow-hidden">
              {/* Header with Car Icon */}
              <div className="bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-teal-500/10 border-b border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2.5 text-xl">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-600 shadow-md">
                      <Car className="h-5 w-5 text-white" />
                    </div>
                    <span className="bg-gradient-to-r from-blue-700 to-cyan-700 bg-clip-text text-transparent font-bold">
                      Danh mục xe điện có sẵn
                    </span>
                  </CardTitle>
                  <CardDescription>
                    Các mẫu xe có sẵn tại {dealers.find(d => d.id === parseInt(confirmedDealer))?.name}
                  </CardDescription>
                </CardHeader>
              </div>
              
              <CardContent className="pt-6">
                {dealerProducts.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="relative inline-block">
                      <div className="absolute inset-0 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full blur-2xl opacity-30"></div>
                      <Car className="relative h-16 w-16 mx-auto mb-4 text-gray-300" />
                    </div>
                    <p className="text-lg font-medium text-gray-500 mb-2">Hiện chưa có xe nào tại đại lý này</p>
                    <p className="text-sm text-gray-400">
                      Vui lòng liên hệ đại lý để biết thêm thông tin
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Stats Summary */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-xl border border-blue-200">
                        <div className="text-2xl font-bold text-blue-700">{dealerProducts.length}</div>
                        <div className="text-xs text-blue-600 font-medium">Tổng số xe</div>
                      </div>
                      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-4 rounded-xl border border-emerald-200">
                        <div className="text-2xl font-bold text-emerald-700">
                          {dealerProducts.filter(p => p.status === 'TEST_DRIVE').length}
                        </div>
                        <div className="text-xs text-emerald-600 font-medium">Sẵn sàng lái thử</div>
                      </div>
                      <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-200">
                        <div className="text-2xl font-bold text-purple-700">
                          {dealerProducts.filter(p => p.status === 'ACTIVE').length}
                        </div>
                        <div className="text-xs text-purple-600 font-medium">Sẵn sàng bán</div>
                      </div>
                      <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-4 rounded-xl border border-amber-200">
                        <div className="text-2xl font-bold text-amber-700">
                          {new Set(dealerProducts.map(p => p.color)).size}
                        </div>
                        <div className="text-xs text-amber-600 font-medium">Màu sắc khác nhau</div>
                      </div>
                    </div>
                    
                    {/* Product Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      {dealerProducts.map((product) => {
                        const dealerIdForLink = confirmedDealer || selectedDealer || user?.dealerId?.toString() || '';
                        return (
                        <div key={product.id} className="group relative">
                          {/* Hover Glow Effect */}
                          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl opacity-0 group-hover:opacity-20 blur transition-all duration-300"></div>
                          
                          <Card className="relative overflow-hidden border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300">
                            {/* Status Badge - Top Right */}
                            <div className="absolute top-3 right-3 z-10">
                              <Badge 
                                variant={product.status === 'TEST_DRIVE' ? 'default' : 'secondary'}
                                className={`${
                                  product.status === 'TEST_DRIVE' 
                                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-0' 
                                    : 'bg-blue-100 text-blue-700 border-blue-300'
                                } shadow-md`}
                              >
                                {product.status === 'TEST_DRIVE' ? '🚗 Lái thử' : '✅ Sẵn có'}
                              </Badge>
                            </div>
                            
                            <CardHeader className="pb-3">
                              <CardTitle className="text-base font-bold flex items-start justify-between pr-20">
                                <span className="line-clamp-2 text-gray-900">{product.name}</span>
                              </CardTitle>
                            </CardHeader>
                            
                            <CardContent className="space-y-3">
                              {/* Product Details */}
                              <div className="space-y-2.5">
                                <div className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded-lg">
                                  <span className="text-gray-600 flex items-center gap-1.5">
                                    <div className="w-3 h-3 rounded-full border-2 border-gray-400" style={{backgroundColor: product.color || '#666'}}></div>
                                    Màu sắc:
                                  </span>
                                  <span className="font-semibold text-gray-900">{product.color || 'N/A'}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm p-2 bg-blue-50 rounded-lg">
                                  <span className="text-blue-600">⚡ Pin:</span>
                                  <span className="font-semibold text-blue-900">{product.battery} kWh</span>
                                </div>
                                <div className="flex items-center justify-between text-sm p-2 bg-emerald-50 rounded-lg">
                                  <span className="text-emerald-600">🔋 Quãng đường:</span>
                                  <span className="font-semibold text-emerald-900">{product.range} km</span>
                                </div>
                              </div>
                              
                              {/* Action Buttons */}
                              <div className="pt-3 flex gap-2 border-t border-gray-100">
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
                                    }}
                                  >
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      className="w-full border-emerald-300 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-400 transition-all"
                                    >
                                      <Calendar className="mr-2 h-3.5 w-3.5" />
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
                                      }}
                                    >
                                      <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="w-full border-blue-300 text-blue-700 hover:bg-blue-50 transition-all"
                                      >
                                        <Calendar className="mr-2 h-3.5 w-3.5" />
                                        Lái thử
                                      </Button>
                                    </Link>
                                    <Link href={`/dashboard/customer/order?productId=${product.id}`} className="flex-1">
                                      <Button 
                                        size="sm" 
                                        className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md hover:shadow-lg transition-all"
                                      >
                                        <CheckCircle className="mr-2 h-3.5 w-3.5" />
                                        Đặt mua
                                      </Button>
                                    </Link>
                                  </>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* 💬 Dialog xác nhận chọn đại lý - Enhanced */}
        <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <AlertDialogContent className="max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-3 text-xl">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-md">
                  <MapPin className="h-5 w-5 text-white" />
                </div>
                <span className="bg-gradient-to-r from-emerald-700 to-teal-700 bg-clip-text text-transparent font-bold">
                  Xác nhận chọn đại lý
                </span>
              </AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div className="space-y-4 pt-3">
                  <div className="text-gray-700">
                    Bạn có chắc chắn muốn chọn đại lý:
                  </div>
                  {pendingDealer && (
                    <div className="relative overflow-hidden rounded-xl border-2 border-emerald-300 bg-gradient-to-br from-emerald-50 to-teal-50 p-5">
                      {/* Background Pattern */}
                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/10 to-teal-400/10"></div>
                      
                      <div className="relative space-y-2.5">
                        <div className="font-bold text-xl text-emerald-900">
                          {pendingDealer.name}
                        </div>
                        <div className="text-sm text-gray-700 flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                          <span>{pendingDealer.address}</span>
                        </div>
                        {pendingDealer.distance && (
                          <div className="pt-2">
                            <Badge className="bg-emerald-100 text-emerald-700 border-emerald-300">
                              <Navigation className="h-3 w-3 mr-1.5" />
                              Cách bạn: {pendingDealer.distance.toFixed(1)} km
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg border border-blue-200">
                    💡 Sau khi xác nhận, bạn sẽ thấy danh sách xe và lịch hẹn tại đại lý này.
                  </div>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-2 sm:gap-2">
              <AlertDialogCancel 
                onClick={handleCancelConfirm}
                className="border-gray-300 hover:bg-gray-100"
              >
                Hủy
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleConfirmDealer}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Xác nhận
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CustomerLayout>
    </ProtectedRoute>
  );
}
