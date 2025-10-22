"use client";

import { useState } from "react";
import { ProtectedRoute } from "@/components/auth-guards";
import AdminLayout from "@/components/layout/admin-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Download, TrendingUp, DollarSign, Package, ShoppingCart, Users } from "lucide-react";

export default function ReportsAnalyticsPage() {
  const { toast } = useToast();

  const handleExport = (type: string) => {
    toast({ title: `Đang xuất ${type}`, description: "File sẽ được tải xuống..." });
  };

  return (
    <ProtectedRoute allowedRoles={["Admin"]}>
      <AdminLayout>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Báo cáo & Phân tích</h1>
              <p className="text-muted-foreground mt-2">Tổng hợp doanh số, công nợ, hiệu suất, tồn kho</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => handleExport("Excel")}>
                <Download className="w-4 h-4 mr-2" />
                Excel
              </Button>
              <Button variant="outline" onClick={() => handleExport("PDF")}>
                <Download className="w-4 h-4 mr-2" />
                PDF
              </Button>
            </div>
          </div>

          {/* Overview Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Tổng doanh thu
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12.5 tỷ</div>
                <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3" />
                  +25% so với tháng trước
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4" />
                  Đơn hàng
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">342</div>
                <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3" />
                  +18% so với tháng trước
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Tồn kho
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,250</div>
                <p className="text-xs text-muted-foreground mt-1">Xe trong kho</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Khách hàng mới
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">89</div>
                <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3" />
                  +12% so với tháng trước
                </p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="sales" className="space-y-4">
            <TabsList>
              <TabsTrigger value="sales">Doanh số</TabsTrigger>
              <TabsTrigger value="inventory">Tồn kho</TabsTrigger>
              <TabsTrigger value="dealers">Hiệu suất đại lý</TabsTrigger>
              <TabsTrigger value="debt">Công nợ</TabsTrigger>
            </TabsList>

            <TabsContent value="sales">
              <Card>
                <CardHeader>
                  <CardTitle>Báo cáo doanh số</CardTitle>
                  <CardDescription>Phân tích doanh thu theo thời gian và khu vực</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Sales by Region */}
                    <div>
                      <h3 className="font-semibold mb-3">Doanh số theo khu vực</h3>
                      <div className="space-y-2">
                        {[
                          { region: "Miền Bắc", sales: "5.2 tỷ", percent: 42, color: "bg-blue-500" },
                          { region: "Miền Nam", sales: "4.8 tỷ", percent: 38, color: "bg-green-500" },
                          { region: "Miền Trung", sales: "2.5 tỷ", percent: 20, color: "bg-orange-500" }
                        ].map((item, i) => (
                          <div key={i} className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span>{item.region}</span>
                              <span className="font-semibold">{item.sales}</span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div className={`h-full ${item.color}`} style={{ width: `${item.percent}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Top Products */}
                    <div className="pt-4 border-t">
                      <h3 className="font-semibold mb-3">Top xe bán chạy</h3>
                      <div className="space-y-2">
                        {[
                          { name: "VinFast VF8", sold: 120, revenue: "4.2 tỷ" },
                          { name: "VinFast VF6", sold: 95, revenue: "3.1 tỷ" },
                          { name: "VinFast VF5", sold: 87, revenue: "2.8 tỷ" }
                        ].map((p, i) => (
                          <div key={i} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                            <div>
                              <p className="font-medium">{p.name}</p>
                              <p className="text-sm text-muted-foreground">{p.sold} xe</p>
                            </div>
                            <p className="font-bold text-green-600">{p.revenue}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="inventory">
              <Card>
                <CardHeader>
                  <CardTitle>Báo cáo tồn kho</CardTitle>
                  <CardDescription>Tình trạng xe tồn kho tại các đại lý</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { model: "VF8 Plus", stock: 45, status: "Ổn định", color: "green" },
                      { model: "VF6 Eco", stock: 32, status: "Ổn định", color: "green" },
                      { model: "VF5 Plus", stock: 8, status: "Sắp hết", color: "orange" },
                      { model: "VF9 Eco", stock: 2, status: "Cần nhập", color: "red" }
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <p className="font-semibold">{item.model}</p>
                          <p className="text-sm text-muted-foreground">{item.stock} xe trong kho</p>
                        </div>
                        <Badge variant={item.color === "green" ? "default" : "destructive"} className={item.color === "orange" ? "bg-orange-500" : ""}>
                          {item.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="dealers">
              <Card>
                <CardHeader>
                  <CardTitle>Hiệu suất đại lý</CardTitle>
                  <CardDescription>Đánh giá doanh số và hiệu quả bán hàng</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { name: "VinFast Hà Nội", sales: "2.1 tỷ", orders: 58, rate: 95 },
                      { name: "VinFast TP.HCM", sales: "1.8 tỷ", orders: 52, rate: 92 },
                      { name: "VinFast Đà Nẵng", sales: "1.2 tỷ", orders: 35, rate: 88 }
                    ].map((dealer, i) => (
                      <div key={i} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold">{dealer.name}</h3>
                            <p className="text-sm text-muted-foreground">{dealer.orders} đơn hàng</p>
                          </div>
                          <Badge variant="default">Top {i + 1}</Badge>
                        </div>
                        <div className="grid gap-3 md:grid-cols-2">
                          <div className="p-3 bg-green-50 rounded-lg">
                            <p className="text-xs text-muted-foreground">Doanh số</p>
                            <p className="text-lg font-bold text-green-600">{dealer.sales}</p>
                          </div>
                          <div className="p-3 bg-blue-50 rounded-lg">
                            <p className="text-xs text-muted-foreground">Hiệu suất</p>
                            <p className="text-lg font-bold text-blue-600">{dealer.rate}%</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="debt">
              <Card>
                <CardHeader>
                  <CardTitle>Công nợ</CardTitle>
                  <CardDescription>Theo dõi công nợ đại lý</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { dealer: "VinFast Cần Thơ", debt: 350000000, due: "2025-11-01", status: "normal" },
                      { dealer: "VinFast Hải Phòng", debt: 280000000, due: "2025-10-28", status: "warning" },
                      { dealer: "VinFast Nha Trang", debt: 150000000, due: "2025-10-22", status: "overdue" }
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <p className="font-semibold">{item.dealer}</p>
                          <p className="text-sm text-muted-foreground">Hạn: {item.due}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-red-600">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.debt)}</p>
                          {item.status === "overdue" && <Badge variant="destructive" className="mt-1">Quá hạn</Badge>}
                          {item.status === "warning" && <Badge variant="secondary" className="mt-1 bg-orange-500 text-white">Sắp đến hạn</Badge>}
                          {item.status === "normal" && <Badge variant="outline" className="mt-1">Bình thường</Badge>}
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