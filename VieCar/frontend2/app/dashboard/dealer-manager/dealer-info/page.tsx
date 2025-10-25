"use client";

import { ProtectedRoute } from "@/components/auth-guards";
import { useAuth } from "@/contexts/AuthContext";
import DealerManagerLayout from "@/components/layout/dealer-manager-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Briefcase, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar,
  Edit,
  Building2,
  User,
  FileText,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { getMyDealer } from "@/lib/dealerApi";
import type { DealerRes } from "@/types/dealer";

export default function DealerInfoPage() {
  const { user } = useAuth();
  const [dealer, setDealer] = useState<DealerRes | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDealerInfo = async () => {
      if (!user?.email) {
        setError("Không tìm thấy thông tin user");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const dealerData = await getMyDealer(user.email);
        if (dealerData) {
          setDealer(dealerData);
        } else {
          setError("Bạn chưa có đại lý. Vui lòng liên hệ admin để tạo đại lý.");
        }
      } catch (err: any) {
        console.error("Error loading dealer:", err);
        setError(err.message || "Không thể tải thông tin đại lý");
      } finally {
        setLoading(false);
      }
    };

    loadDealerInfo();
  }, [user]);

  return (
    <ProtectedRoute allowedRoles={['Dealer Manager', 'Admin']}>
      <DealerManagerLayout>
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold flex items-center">
                <Briefcase className="mr-2 h-8 w-8" />
                Thông tin đại lý
              </h1>
              <p className="text-muted-foreground mt-2">
                Xem và cập nhật thông tin đại lý của bạn
              </p>
            </div>
            {dealer && (
              <Link href="/dashboard/dealer-manager/dealer-info/edit">
                <Button size="lg">
                  <Edit className="mr-2 h-4 w-4" />
                  Chỉnh sửa thông tin
                </Button>
              </Link>
            )}
          </div>

          {/* Loading State */}
          {loading && (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">Đang tải thông tin đại lý...</p>
              </CardContent>
            </Card>
          )}

          {/* Error State */}
          {error && !loading && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Dealer Info */}
          {dealer && !loading && !error && (
            <>
              {/* Status Badge */}
              <div className="flex items-center gap-2">
                <Badge 
                  className={dealer.status === "ACTIVE" 
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" 
                    : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                  }
                >
                  {dealer.status === "ACTIVE" ? "Đang hoạt động" : "Không hoạt động"}
                </Badge>
                <span className="text-muted-foreground text-sm">
                  Mã đại lý: <code className="bg-muted px-2 py-1 rounded">DEALER-{dealer.id}</code>
                </span>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Tổng nhân viên</CardTitle>
                    <User className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">-</div>
                    <p className="text-xs text-muted-foreground">Dealer Staff</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Đơn phân phối</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">-</div>
                    <p className="text-xs text-muted-foreground">Tổng đơn đã đặt</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Xe đã bán</CardTitle>
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">-</div>
                    <p className="text-xs text-muted-foreground">Tổng số xe bán được</p>
                  </CardContent>
                </Card>
              </div>

              {/* Dealer Details */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* General Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Building2 className="mr-2 h-5 w-5" />
                      Thông tin chung
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Tên đại lý</label>
                      <p className="text-lg font-semibold mt-1">{dealer.name}</p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Mã đại lý</label>
                      <p className="text-lg mt-1">
                        <code className="bg-muted px-2 py-1 rounded">
                          DEALER-{dealer.id}
                        </code>
                      </p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Ngày thành lập
                      </label>
                      <p className="text-lg mt-1">
                        {new Date(dealer.creationDate).toLocaleDateString('vi-VN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Mã số thuế</label>
                      <p className="text-lg mt-1 font-mono">{dealer.taxcode}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Contact Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <MapPin className="mr-2 h-5 w-5" />
                      Thông tin liên hệ
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Địa chỉ
                      </label>
                      <p className="text-lg mt-1">{dealer.address}</p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        Số điện thoại
                      </label>
                      <p className="text-lg mt-1">{dealer.phone}</p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Email
                      </label>
                      <p className="text-lg mt-1">{dealer.email}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Manager Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="mr-2 h-5 w-5" />
                    Thông tin Dealer Manager
                  </CardTitle>
                  <CardDescription>
                    Người quản lý đại lý hiện tại
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Họ tên</label>
                      <p className="text-lg font-semibold mt-1">{user?.username || "N/A"}</p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        Số điện thoại
                      </label>
                      <p className="text-lg mt-1">{user?.phone || "N/A"}</p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Email
                      </label>
                      <p className="text-lg mt-1">{user?.email || "N/A"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Hành động nhanh</CardTitle>
                  <CardDescription>
                    Quản lý các hoạt động của đại lý
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Link href="/dashboard/dealer-manager/staff">
                      <Button variant="outline" className="w-full">
                        <User className="mr-2 h-4 w-4" />
                        Quản lý nhân viên
                      </Button>
                    </Link>
                    <Link href="/dashboard/dealer-manager/categories">
                      <Button variant="outline" className="w-full">
                        <Building2 className="mr-2 h-4 w-4" />
                        Kho xe
                      </Button>
                    </Link>
                    <Link href="/dashboard/dealer-manager/test-drives">
                      <Button variant="outline" className="w-full">
                        <FileText className="mr-2 h-4 w-4" />
                        Lái thử
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </DealerManagerLayout>
    </ProtectedRoute>
  );
}
