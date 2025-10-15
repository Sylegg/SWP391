"use client";

import { ProtectedRoute } from "@/components/auth-guards";
import { useAuth } from "@/contexts/AuthContext";
import { RoleBadge } from "@/components/role-display";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Car, ShoppingCart, Calendar, Clock, History, Star } from "lucide-react";
import Link from "next/link";
import CustomerLayout from "@/components/layout/customer-layout";

export default function CustomerDashboard() {
  const { user } = useAuth();

  return (
    <ProtectedRoute allowedRoles={['Customer']}> 
      <CustomerLayout>
        <div className="p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Tổng quan</h1>
            <p className="text-muted-foreground mt-2">
              Chào mừng, {user?.username}! Rất vui được gặp lại bạn.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Car className="mr-2 h-5 w-5" />
                  Khám phá xe điện
                </CardTitle>
                <CardDescription>Tìm kiếm và xem chi tiết các mẫu xe</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link href="/#vehicles">Xem danh sách xe</Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Đơn hàng của tôi
                </CardTitle>
                <CardDescription>Theo dõi trạng thái đơn hàng</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" disabled>
                  Sắp ra mắt
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="mr-2 h-5 w-5" />
                  Đăng ký lái thử
                </CardTitle>
                <CardDescription>Đặt lịch lái thử xe yêu thích</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" disabled>
                  Sắp ra mắt
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Hoạt động gần đây</CardTitle>
                <CardDescription>Lịch sử tương tác gần nhất của bạn</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center text-sm">
                  <Clock className="w-4 h-4 mr-2 text-muted-foreground" />
                  Bạn đã xem mẫu xe VF3
                </div>
                <div className="flex items-center text-sm">
                  <History className="w-4 h-4 mr-2 text-muted-foreground" />
                  Bạn đã đăng ký nhận thông tin khuyến mãi
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Gợi ý cho bạn</CardTitle>
                <CardDescription>Các mẫu xe được quan tâm nhiều</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center text-sm">
                  <Star className="w-4 h-4 mr-2 text-yellow-500" /> VinFast VF3
                </div>
                <div className="flex items-center text-sm">
                  <Star className="w-4 h-4 mr-2 text-yellow-500" /> VinFast Evo 200
                </div>
                <div className="flex items-center text-sm">
                  <Star className="w-4 h-4 mr-2 text-yellow-500" /> VinFast VF5
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </CustomerLayout>
    </ProtectedRoute>
  );
}