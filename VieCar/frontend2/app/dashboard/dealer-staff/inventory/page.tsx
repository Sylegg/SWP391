"use client";

import { useState } from "react";
import { ProtectedRoute } from "@/components/auth-guards";
import DealerStaffLayout from "@/components/layout/dealer-staff-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Search, AlertCircle, CheckCircle, Car } from "lucide-react";

// Mock data - Kho xe tại đại lý
const inventory = [
  {
    id: 1,
    vehicleName: "VinFast VF 3",
    version: "Tiêu chuẩn",
    color: "Trắng",
    quantity: 5,
    status: "available",
    price: 235000000,
    location: "Kho A1"
  },
  {
    id: 2,
    vehicleName: "VinFast VF 3",
    version: "Tiêu chuẩn",
    color: "Đen",
    quantity: 3,
    status: "available",
    price: 235000000,
    location: "Kho A1"
  },
  {
    id: 3,
    vehicleName: "VinFast VF 5",
    version: "Base",
    color: "Trắng",
    quantity: 4,
    status: "available",
    price: 458000000,
    location: "Kho A2"
  },
  {
    id: 4,
    vehicleName: "VinFast VF 5",
    version: "Plus",
    color: "Xanh Dương",
    quantity: 2,
    status: "available",
    price: 468000000,
    location: "Kho A2"
  },
  {
    id: 5,
    vehicleName: "VinFast VF 5",
    version: "Base",
    color: "Đỏ",
    quantity: 1,
    status: "low",
    price: 458000000,
    location: "Kho A2"
  },
  {
    id: 6,
    vehicleName: "VinFast VF 6",
    version: "Eco",
    color: "Trắng",
    quantity: 3,
    status: "available",
    price: 665000000,
    location: "Kho B1"
  },
  {
    id: 7,
    vehicleName: "VinFast VF 6",
    version: "Plus",
    color: "Xám Bạc",
    quantity: 2,
    status: "available",
    price: 675000000,
    location: "Kho B1"
  },
  {
    id: 8,
    vehicleName: "VinFast VF 6",
    version: "Eco",
    color: "Đen",
    quantity: 1,
    status: "low",
    price: 665000000,
    location: "Kho B1"
  },
  {
    id: 9,
    vehicleName: "VinFast VF 7",
    version: "Base",
    color: "Trắng",
    quantity: 2,
    status: "available",
    price: 840000000,
    location: "Kho B2"
  },
  {
    id: 10,
    vehicleName: "VinFast VF 7",
    version: "Plus",
    color: "Xanh Dương",
    quantity: 1,
    status: "low",
    price: 850000000,
    location: "Kho B2"
  },
  {
    id: 11,
    vehicleName: "VinFast VF 7",
    version: "Eco",
    color: "Đỏ Burgundy",
    quantity: 1,
    status: "low",
    price: 840000000,
    location: "Kho B2"
  },
  {
    id: 12,
    vehicleName: "VinFast VF 8",
    version: "Eco",
    color: "Trắng",
    quantity: 2,
    status: "available",
    price: 1029000000,
    location: "Kho C1"
  },
  {
    id: 13,
    vehicleName: "VinFast VF 8",
    version: "Plus",
    color: "Đen",
    quantity: 1,
    status: "low",
    price: 1050000000,
    location: "Kho C1"
  },
  {
    id: 14,
    vehicleName: "VinFast VF 8",
    version: "Eco",
    color: "Xanh Mint",
    quantity: 0,
    status: "outofstock",
    price: 1029000000,
    location: "Kho C1"
  },
  {
    id: 15,
    vehicleName: "VinFast VF 9",
    version: "Eco",
    color: "Trắng",
    quantity: 1,
    status: "low",
    price: 1450000000,
    location: "Kho C2"
  },
  {
    id: 16,
    vehicleName: "VinFast VF 9",
    version: "Plus",
    color: "Xám Platinum",
    quantity: 1,
    status: "low",
    price: 1491000000,
    location: "Kho C2"
  },
  {
    id: 17,
    vehicleName: "VinFast VF e34",
    version: "Standard",
    color: "Trắng",
    quantity: 6,
    status: "available",
    price: 580000000,
    location: "Kho A3"
  },
  {
    id: 18,
    vehicleName: "VinFast VF e34",
    version: "Standard",
    color: "Bạc",
    quantity: 4,
    status: "available",
    price: 580000000,
    location: "Kho A3"
  }
];

export default function InventoryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const getStatusBadge = (status: string, quantity: number) => {
    if (status === "outofstock") {
      return <Badge variant="destructive">Hết hàng</Badge>;
    }
    if (status === "low") {
      return <Badge className="bg-yellow-500">Sắp hết ({quantity})</Badge>;
    }
    return <Badge className="bg-green-500">Còn hàng ({quantity})</Badge>;
  };

  const filteredInventory = inventory.filter(item => {
    const matchSearch = 
      item.vehicleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.color.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.version.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchStatus = 
      selectedStatus === "all" || item.status === selectedStatus;

    return matchSearch && matchStatus;
  });

  const totalVehicles = inventory.reduce((sum, item) => sum + item.quantity, 0);
  const availableCount = inventory.filter(i => i.status === "available").length;
  const lowStockCount = inventory.filter(i => i.status === "low").length;
  const outOfStockCount = inventory.filter(i => i.status === "outofstock").length;

  return (
    <ProtectedRoute allowedRoles={["Dealer Staff"]}>
      <DealerStaffLayout>
        <div className="p-6 space-y-6">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Package className="w-8 h-8" />
              Kho xe đại lý
            </h1>
            <p className="text-muted-foreground mt-2">
              Kiểm tra số lượng xe có sẵn, màu sắc và phiên bản trong kho
            </p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Tổng số xe
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{totalVehicles}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {inventory.length} mẫu xe khác nhau
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Còn hàng
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{availableCount}</div>
                <p className="text-xs text-muted-foreground mt-1">Sẵn sàng bán</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Sắp hết
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-600">{lowStockCount}</div>
                <p className="text-xs text-muted-foreground mt-1">Cần đặt thêm</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Hết hàng
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">{outOfStockCount}</div>
                <p className="text-xs text-muted-foreground mt-1">Không có trong kho</p>
              </CardContent>
            </Card>
          </div>

          {/* Search & Filter */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                Tìm kiếm & Lọc
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Tìm theo tên xe, màu sắc, phiên bản..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <Tabs value={selectedStatus} onValueChange={setSelectedStatus}>
                <TabsList>
                  <TabsTrigger value="all">Tất cả</TabsTrigger>
                  <TabsTrigger value="available">Còn hàng</TabsTrigger>
                  <TabsTrigger value="low">Sắp hết</TabsTrigger>
                  <TabsTrigger value="outofstock">Hết hàng</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardContent>
          </Card>

          {/* Inventory Table */}
          <Card>
            <CardHeader>
              <CardTitle>Danh sách xe trong kho</CardTitle>
              <CardDescription>
                Hiển thị {filteredInventory.length} trên {inventory.length} mẫu xe
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Tên xe</th>
                      <th className="text-left py-3 px-4">Phiên bản</th>
                      <th className="text-left py-3 px-4">Màu sắc</th>
                      <th className="text-left py-3 px-4">Số lượng</th>
                      <th className="text-left py-3 px-4">Trạng thái</th>
                      <th className="text-left py-3 px-4">Vị trí</th>
                      <th className="text-right py-3 px-4">Giá</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInventory.map(item => (
                      <tr key={item.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Car className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium">{item.vehicleName}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">{item.version}</td>
                        <td className="py-3 px-4">
                          <Badge variant="outline">{item.color}</Badge>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-bold">{item.quantity}</span> chiếc
                        </td>
                        <td className="py-3 px-4">
                          {getStatusBadge(item.status, item.quantity)}
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">
                          {item.location}
                        </td>
                        <td className="py-3 px-4 text-right font-medium">
                          {item.price.toLocaleString('vi-VN')} VNĐ
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredInventory.length === 0 && (
                <div className="py-12 text-center">
                  <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Không tìm thấy xe trong kho</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DealerStaffLayout>
    </ProtectedRoute>
  );
}
