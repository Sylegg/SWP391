"use client";

import { ProtectedRoute } from "@/components/auth-guards";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, BarChart, Briefcase } from "lucide-react";
import DealerManagerLayout from "@/components/layout/dealer-manager-layout";

export default function DealerManagerDashboard() {
  const { user } = useAuth();

  return (
    <ProtectedRoute allowedRoles={['Dealer_Manager', 'Admin']}>
      <DealerManagerLayout>
        <div className="p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Tổng quan</h1>
            <p className="text-muted-foreground mt-2">
              Xin chào, {user?.username}. Quản lý hoạt động và nhân sự đại lý.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="mr-2 h-5 w-5" />
                  Quản lý nhân viên
                </CardTitle>
                <CardDescription>Thêm/sửa/xóa nhân viên đại lý</CardDescription>
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
                  <BarChart className="mr-2 h-5 w-5" />
                  Doanh số & phân tích
                </CardTitle>
                <CardDescription>Theo dõi hiệu suất bán hàng</CardDescription>
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
                  <Briefcase className="mr-2 h-5 w-5" />
                  Quản lý đại lý
                </CardTitle>
                <CardDescription>Thông tin và cài đặt đại lý</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" disabled>
                  Sắp ra mắt
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </DealerManagerLayout>
    </ProtectedRoute>
  );
}