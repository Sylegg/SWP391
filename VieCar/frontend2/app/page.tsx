"use client";

import { useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from '@/hooks/use-toast';
import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { VehicleShowcase } from "@/components/vehicle-showcase"
import { ServicesSection } from "@/components/services-section"
import { Footer } from "@/components/footer"

export default function HomePage() {
  const { loadUserFromToken } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  // Flags để tránh hiển thị toast nhiều lần
  const hasShownOAuthToast = useRef(false);
  const hasShownLoginInfoToast = useRef(false);

  // Google OAuth callback handler cho user cũ
  useEffect(() => {
    const googleLogin = searchParams.get('google_login');
    const token = searchParams.get('token');
    const refreshToken = searchParams.get('refreshToken');
    const role = searchParams.get('role');
    const userId = searchParams.get('userId');
    const isNewUser = searchParams.get('isNewUser');

    if (googleLogin === 'success' && token && refreshToken && role && userId && isNewUser === 'false' && !hasShownOAuthToast.current) {
      hasShownOAuthToast.current = true; // Đánh dấu đã hiển thị
      
      // User cũ đã có đầy đủ thông tin
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('role', role);
      localStorage.setItem('userId', userId);

      // Load user info từ token và lấy username từ user profile
      loadUserFromToken().then(() => {
        // Lấy username từ localStorage sau khi load user profile
        const userString = localStorage.getItem('user');
        let displayName = 'bạn';
        if (userString) {
          try {
            const userData = JSON.parse(userString);
            displayName = userData.username || 'bạn';
          } catch (e) {
            console.error('Error parsing user data:', e);
          }
        }

        toast({
          title: '✅ Đăng nhập thành công!',
          description: `Chào mừng bạn trở lại, ${displayName}`,
          duration: 3000,
        });
      });

      // Clean URL params
      router.replace('/');
    }
  }, [searchParams, loadUserFromToken, router, toast]);

  // Hiển thị thông tin đăng nhập cho Google user mới vừa hoàn tất profile
  useEffect(() => {
    if (hasShownLoginInfoToast.current) return; // Đã hiển thị rồi thì bỏ qua
    
    const showLoginInfo = localStorage.getItem('showLoginInfo');
    const loginEmail = localStorage.getItem('loginEmail');
    const loginPassword = localStorage.getItem('loginPassword');

    if (showLoginInfo === 'true' && loginEmail && loginPassword) {
      hasShownLoginInfoToast.current = true; // Đánh dấu đã hiển thị
      
      // Hiển thị thông báo với email và password
      toast({
        title: '🎉 Đăng ký thành công!',
        description: (
          <div className="space-y-2 mt-2">
            <p className="font-semibold text-green-600">Thông tin đăng nhập của bạn:</p>
            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg space-y-1">
              <p className="text-sm"><span className="font-medium">Email:</span> {loginEmail}</p>
              <p className="text-sm"><span className="font-medium">Mật khẩu:</span> {loginPassword}</p>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Bạn có thể dùng email và mật khẩu này để đăng nhập lần sau
            </p>
          </div>
        ),
        duration: 10000, // Hiển thị 10 giây để user có thời gian đọc
      });

      // Xóa các flag để không hiển thị lại
      localStorage.removeItem('showLoginInfo');
      localStorage.removeItem('loginEmail');
      localStorage.removeItem('loginPassword');
    }
  }, [toast]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <VehicleShowcase />
        <ServicesSection />
      </main>
      <Footer />
    </div>
  )
}
