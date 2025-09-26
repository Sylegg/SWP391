"use client";

import { ProtectedRoute, PermissionGate } from "@/components/auth-guards";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Car, ClipboardList, Users, BarChart, PlusCircle } from "lucide-react";
import Link from "next/link";
import EvmStaffLayout from "@/components/layout/evm-staff-layout";

export default function EvmStaffDashboard() {
  const { user } = useAuth();

  return (
    <ProtectedRoute allowedRoles={['EVM_Staff', 'Admin']}>
      <EvmStaffLayout>
        <div className="p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Bảng điều khiển EVM Staff</h1>
            <p className="text-muted-foreground mt-2">
              Xin chào, {user?.username}. Quản lý nội dung xe và hỗ trợ khách hàng.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Car className="mr-2 h-5 w-5" />
                  Quản lý xe điện
                </CardTitle>
                <CardDescription>Thêm, chỉnh sửa, quản lý xe</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" className="w-full" disabled>
                    <PlusCircle className="w-4 h-4 mr-2" /> Thêm xe
                  </Button>
                  <Button variant="outline" className="w-full" disabled>
                    <ClipboardList className="w-4 h-4 mr-2" /> Danh sách
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="mr-2 h-5 w-5" />
                  Hỗ trợ khách hàng
                </CardTitle>
                <CardDescription>Quản lý yêu cầu và phản hồi</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" disabled>
                  Sắp ra mắt
                </Button>
              </CardContent>
            </Card>

            <PermissionGate permission="view_analytics">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart className="mr-2 h-5 w-5" />
                    Thống kê
                  </CardTitle>
                  <CardDescription>Xem số liệu liên quan</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">Sắp ra mắt</div>
                </CardContent>
              </Card>
            </PermissionGate>
          </div>
        </div>
      </EvmStaffLayout>
    </ProtectedRoute>
  );
}