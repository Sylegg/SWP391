'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Home, User } from 'lucide-react';
import Link from 'next/link';

export default function AccessDeniedPage() {
  const { user } = useAuth();

  const getDashboardPath = () => {
    if (!user) return '/';
    switch (user.role) {
      case 'ADMIN': return '/admin/dashboard';
      case 'EVM_STAFF': return '/evm/dashboard';
      case 'DEALER_MANAGER': return '/dealer/manager/dashboard';
      case 'DEALER_STAFF': return '/dealer/staff/dashboard';
      case 'CUSTOMER': return '/customer/dashboard';
      default: return '/';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-2xl">Truy cập bị từ chối</CardTitle>
          <CardDescription>
            Bạn không có quyền truy cập vào trang này
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center text-sm text-muted-foreground">
            {user ? (
              <>
                <p>Tài khoản: {user.fullName}</p>
                <p>Vai trò: {user.role}</p>
                <p className="mt-2">
                  Vui lòng liên hệ quản trị viên nếu bạn cho rằng đây là lỗi.
                </p>
              </>
            ) : (
              <p>Vui lòng đăng nhập để tiếp tục.</p>
            )}
          </div>
          
          <div className="flex flex-col space-y-2">
            <Link href="/">
              <Button className="w-full">
                <Home className="h-4 w-4 mr-2" />
                Về trang chủ
              </Button>
            </Link>
            
            {user && (
              <Link href={getDashboardPath()}>
                <Button variant="outline" className="w-full">
                  <User className="h-4 w-4 mr-2" />
                  Về Dashboard của tôi
                </Button>
              </Link>
            )}
            
            {!user && (
              <Link href="/login">
                <Button variant="outline" className="w-full">
                  <User className="h-4 w-4 mr-2" />
                  Đăng nhập
                </Button>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}