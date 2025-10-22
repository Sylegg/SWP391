"use client";

import { useState } from "react";
import { ProtectedRoute } from "@/components/auth-guards";
import AdminLayout from "@/components/layout/admin-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { DollarSign, TrendingUp, Download, Calendar, Eye, Filter } from "lucide-react";

// Mock data
const mockTransactions = [
  { id: 1, date: "2025-10-15", customer: "Nguyễn Văn A", dealer: "VinFast Hà Nội", vehicle: "VF8 Plus", amount: 1200000000, commission: 60000000, status: "completed" },
  { id: 2, date: "2025-10-18", customer: "Trần Thị B", dealer: "VinFast TP.HCM", vehicle: "VF6 Eco", amount: 675000000, commission: 33750000, status: "completed" },
  { id: 3, date: "2025-10-20", customer: "Lê Văn C", dealer: "VinFast Đà Nẵng", vehicle: "VF5 Plus", amount: 550000000, commission: 27500000, status: "pending" }
];

const mockCommissionPolicies = [
  { id: 1, name: "Chính sách mặc định", dealerType: "Tất cả", rate: 5, minSales: 0, maxSales: 999999999999, status: "active" },
  { id: 2, name: "Đại lý VIP", dealerType: "Cấp 1", rate: 7, minSales: 100000000, maxSales: 999999999999, status: "active" },
  { id: 3, name: "Khuyến mãi Q4", dealerType: "Tất cả", rate: 6, minSales: 50000000, maxSales: 999999999999, status: "active" }
];

export default function PaymentCommissionPage() {
  const { toast } = useToast();
  const [transactions] = useState(mockTransactions);
  const [policies, setPolicies] = useState(mockCommissionPolicies);

  const totalRevenue = transactions.reduce((sum, t) => sum + t.amount, 0);
  const totalCommission = transactions.reduce((sum, t) => sum + t.commission, 0);
  const completedTransactions = transactions.filter(t => t.status === "completed").length;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const handleExportExcel = () => {
    toast({ title: "Đang xuất dữ liệu", description: "File Excel sẽ được tải xuống..." });
  };

  return (
    <ProtectedRoute allowedRoles={["Admin"]}>
      <AdminLayout>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Thanh toán & Hoa hồng</h1>
              <p className="text-muted-foreground mt-2">Quản lý giao dịch và chính sách hoa hồng đại lý</p>
            </div>
            <Button onClick={handleExportExcel}>
              <Download className="w-4 h-4 mr-2" />
              Xuất Excel
            </Button>
          </div>

          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Tổng doanh thu</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{formatCurrency(totalRevenue)}</div>
                <p className="text-xs text-muted-foreground mt-1">Tất cả giao dịch</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Tổng hoa hồng</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{formatCurrency(totalCommission)}</div>
                <p className="text-xs text-muted-foreground mt-1">Đã chi trả</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Giao dịch hoàn thành</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{completedTransactions}</div>
                <p className="text-xs text-muted-foreground mt-1">Đơn đã thanh toán</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Tỷ lệ HH trung bình</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">5.2%</div>
                <p className="text-xs text-muted-foreground mt-1">Theo chính sách</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="transactions" className="space-y-4">
            <TabsList>
              <TabsTrigger value="transactions">Giao dịch</TabsTrigger>
              <TabsTrigger value="policies">Chính sách hoa hồng</TabsTrigger>
            </TabsList>

            <TabsContent value="transactions" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Danh sách giao dịch</CardTitle>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Filter className="w-4 h-4 mr-2" />
                        Lọc
                      </Button>
                      <Button variant="outline" size="sm">
                        <Calendar className="w-4 h-4 mr-2" />
                        Theo ngày
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {transactions.map(t => (
                      <div key={t.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">#{t.id} - {t.customer}</h3>
                            {t.status === "completed" 
                              ? <Badge variant="default" className="bg-green-500">Hoàn thành</Badge>
                              : <Badge variant="secondary">Chờ xử lý</Badge>
                            }
                          </div>
                          <div className="grid gap-2 md:grid-cols-2 text-sm text-muted-foreground">
                            <div>
                              <p><strong>Đại lý:</strong> {t.dealer}</p>
                              <p><strong>Xe:</strong> {t.vehicle}</p>
                            </div>
                            <div>
                              <p><strong>Ngày GD:</strong> {t.date}</p>
                              <p><strong>Giá trị:</strong> {formatCurrency(t.amount)}</p>
                            </div>
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <p className="text-sm text-muted-foreground">Hoa hồng</p>
                          <p className="text-lg font-bold text-blue-600">{formatCurrency(t.commission)}</p>
                          <Button variant="ghost" size="sm" className="mt-2">
                            <Eye className="w-4 h-4 mr-1" />
                            Chi tiết
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="policies" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Chính sách hoa hồng</CardTitle>
                    <Button size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Thêm chính sách
                    </Button>
                  </div>
                  <CardDescription>Cấu hình tỷ lệ hoa hồng cho từng loại đại lý</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {policies.map(p => (
                      <div key={p.id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold">{p.name}</h3>
                            <p className="text-sm text-muted-foreground">Áp dụng: {p.dealerType}</p>
                          </div>
                          <Badge variant="default" className="bg-green-500">Đang áp dụng</Badge>
                        </div>
                        <div className="grid gap-4 md:grid-cols-3">
                          <div className="p-3 bg-blue-50 rounded-lg">
                            <p className="text-xs text-muted-foreground mb-1">Tỷ lệ hoa hồng</p>
                            <p className="text-2xl font-bold text-blue-600">{p.rate}%</p>
                          </div>
                          <div className="p-3 bg-muted rounded-lg">
                            <p className="text-xs text-muted-foreground mb-1">Doanh số tối thiểu</p>
                            <p className="text-lg font-semibold">{formatCurrency(p.minSales)}</p>
                          </div>
                          <div className="p-3 bg-muted rounded-lg">
                            <p className="text-xs text-muted-foreground mb-1">Doanh số tối đa</p>
                            <p className="text-lg font-semibold">{p.maxSales >= 999999999999 ? "Không giới hạn" : formatCurrency(p.maxSales)}</p>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-3">
                          <Button variant="outline" size="sm">Chỉnh sửa</Button>
                          <Button variant="outline" size="sm">Tạm dừng</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}

function Plus({ className }: { className?: string }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>;
}