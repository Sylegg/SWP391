"use client";

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Phone, MapPin, User, CheckCircle } from "lucide-react";
import Image from "next/image";
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api';

export default function CompleteProfilePage() {
  const { user, loadUserFromToken } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [profileData, setProfileData] = useState({
    phone: "",
    address: ""
  });

  // Google OAuth callback handler
  useEffect(() => {
    const googleLogin = searchParams.get('google_login');
    const token = searchParams.get('token');
    const refreshToken = searchParams.get('refreshToken');
    const role = searchParams.get('role');
    const userId = searchParams.get('userId');
    const isNewUser = searchParams.get('isNewUser');

    if (googleLogin === 'success' && token && refreshToken && role && userId && isNewUser === 'true') {
      // Lưu tokens vào localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('role', role);
      localStorage.setItem('userId', userId);

      // Load user info từ token
      loadUserFromToken();

      // Clean URL params
      router.replace('/complete-profile');
    }
  }, [searchParams, loadUserFromToken, router]);

  // Nếu không phải user mới hoặc đã có đủ thông tin thì redirect về home
  useEffect(() => {
    if (user && user.id !== 'guest' && user.phone && user.address) {
      router.push('/');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Validate phone number (Vietnam format)
    const phoneRegex = /^(?:(?:03|05|07|08|09)\d{8}|01(?:2|6|8|9)\d{8})$/;
    if (!phoneRegex.test(profileData.phone)) {
      setError("Số điện thoại không hợp lệ. Vui lòng nhập số điện thoại Việt Nam (10-11 số).");
      setIsLoading(false);
      return;
    }

    if (!profileData.address || profileData.address.trim().length < 10) {
      setError("Địa chỉ phải có ít nhất 10 ký tự.");
      setIsLoading(false);
      return;
    }

    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        throw new Error('User ID not found');
      }

      // Gọi API update profile
      const response = await api.put(`/user/profile/${userId}`, {
        phone: profileData.phone,
        address: profileData.address
      });

      // Reload user data để lấy username
      await loadUserFromToken();

      // Backend trả về temporaryPassword nếu là Google user
      const returnedPassword = response.data.temporaryPassword || profileData.phone;
      const loginEmail = response.data.email || user?.email || '';

      // Lưu thông tin để hiển thị thông báo trên home page
      localStorage.setItem('showLoginInfo', 'true');
      localStorage.setItem('loginEmail', loginEmail);
      localStorage.setItem('loginPassword', returnedPassword);

      toast({
        title: 'Hoàn tất thông tin thành công!',
        description: 'Chào mừng bạn đến với VieCar',
        duration: 3000,
      });

      // Redirect về home page
      router.push('/');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      setError(error?.response?.data?.message || 'Đã xảy ra lỗi khi cập nhật thông tin. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 dark:from-gray-900 dark:via-blue-950 dark:to-cyan-950">
      </div>

      <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-blue-400/30 to-cyan-500/30 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-teal-400/30 to-emerald-500/30 rounded-full blur-3xl animate-float-delayed"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="flex flex-col items-center justify-center mb-8 animate-scale-in">
          <div className="relative">
            <Image 
              src="/logo.png" 
              alt="VieCar Logo" 
              width={200} 
              height={200}
              className="object-contain"
              priority
            />
          </div>
        </div>

        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-500 animate-gradient-shift"></div>
          
          <Card className="relative border-none shadow-2xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl overflow-hidden">
            <CardHeader className="text-center pb-4 pt-8">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mb-4">
                <User className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 bg-clip-text text-transparent">
                Hoàn tất thông tin
              </CardTitle>
              <CardDescription className="text-base mt-2">
                Vui lòng điền thêm thông tin để hoàn tất đăng ký
              </CardDescription>
            </CardHeader>
            
            <CardContent className="px-8 pb-8">
              {error && (
                <Alert className="mb-4 border-red-200 bg-red-50/50 dark:bg-red-950/50 backdrop-blur-sm">
                  <AlertDescription className="text-red-700 dark:text-red-400">{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Email (Đã xác thực)
                  </Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={user?.email || searchParams.get('email') || ''}
                    disabled
                    className="w-full h-12 bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl cursor-not-allowed"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium flex items-center gap-2">
                    <Phone className="w-4 h-4 text-blue-600" />
                    Số điện thoại <span className="text-red-500">*</span>
                  </Label>
                  <Input 
                    id="phone" 
                    type="tel" 
                    placeholder="Nhập số điện thoại (VD: 0912345678)" 
                    className="w-full h-12 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 rounded-xl"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                    required
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Số điện thoại Việt Nam (10-11 số)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address" className="text-sm font-medium flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    Địa chỉ <span className="text-red-500">*</span>
                  </Label>
                  <Input 
                    id="address" 
                    type="text" 
                    placeholder="Nhập địa chỉ đầy đủ" 
                    className="w-full h-12 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 rounded-xl"
                    value={profileData.address}
                    onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                    required
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    VD: 123 Nguyễn Văn Linh, Phường 1, Quận 7, TP. HCM
                  </p>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12 bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 hover:from-blue-700 hover:via-cyan-700 hover:to-teal-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Đang xử lý...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      Hoàn tất đăng ký
                    </div>
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Thông tin của bạn được bảo mật và chỉ dùng để liên hệ khi cần thiết
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
