"use client";

import { ProtectedRoute } from "@/components/auth-guards";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Car, Users, ClipboardList } from "lucide-react";
import DealerStaffLayout from "@/components/layout/dealer-staff-layout";

export default function DealerStaffDashboard() {
  const { user } = useAuth();

  return (
    <ProtectedRoute allowedRoles={['Dealer_Staff', 'Dealer_Manager', 'Admin']}>
      <DealerStaffLayout>
        <div className="p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Tổng quan</h1>
            <p className="text-muted-foreground mt-2">
              Xin chào, {user?.username}. Hỗ trợ khách hàng và xử lý đơn hàng.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Car className="mr-2 h-5 w-5" />
                  Danh mục xe
                </CardTitle>
                <CardDescription>Xem thông tin sản phẩm</CardDescription>
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
                  <ClipboardList className="mr-2 h-5 w-5" />
                  Xử lý đơn hàng
                </CardTitle>
                <CardDescription>Quản lý đơn hàng của khách</CardDescription>
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
                  <Users className="mr-2 h-5 w-5" />
                  Hỗ trợ khách hàng
                </CardTitle>
                <CardDescription>Tương tác với khách hàng</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" disabled>
                  Sắp ra mắt
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </DealerStaffLayout>
    </ProtectedRoute>
  );
}