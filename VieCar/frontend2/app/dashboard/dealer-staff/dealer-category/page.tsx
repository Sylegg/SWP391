"use client";

import { useState } from "react";
import { ProtectedRoute } from "@/components/auth-guards";
import DealerStaffLayout from "@/components/layout/dealer-staff-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Car, Search, Eye, ShoppingCart, Package, TrendingUp, Award } from "lucide-react";

// Mock data
const mockVehicles = [
  {
    id: 1,
    name: "VinFast VF3",
    category: "Mini SUV",
    type: "EV",
    basePrice: 240000000,
    promotionPrice: 235000000,
    stock: 15,
    colors: ["Đỏ", "Trắng", "Xanh", "Đen"],
    versions: ["Eco", "Plus"],
    specs: { range: "210km", battery: "18.64 kWh", power: "43 HP", seats: 5 }
  },
  {
    id: 2,
    name: "VinFast VF5",
    category: "SUV Cỡ A",
    type: "EV",
    basePrice: 468000000,
    promotionPrice: 458000000,
    stock: 8,
    colors: ["Đỏ", "Trắng", "Xanh", "Xám"],
    versions: ["Eco", "Plus"],
    specs: { range: "326km", battery: "37.23 kWh", power: "134 HP", seats: 5 }
  },
  {
    id: 3,
    name: "VinFast VF6",
    category: "SUV Cỡ B",
    type: "EV",
    basePrice: 675000000,
    promotionPrice: 665000000,
    stock: 12,
    colors: ["Đỏ", "Trắng", "Xanh", "Đen", "Xám"],
    versions: ["Eco", "Plus"],
    specs: { range: "410km", battery: "59.6 kWh", power: "174 HP", seats: 5 }
  },
  {
    id: 4,
    name: "VinFast VF7",
    category: "SUV Cỡ C",
    type: "EV",
    basePrice: 850000000,
    promotionPrice: 839000000,
    stock: 6,
    colors: ["Đỏ", "Trắng", "Xanh", "Đen", "Xám", "Bạc"],
    versions: ["Eco", "Plus"],
    specs: { range: "450km", battery: "75.3 kWh", power: "201 HP", seats: 7 }
  },
  {
    id: 5,
    name: "VinFast VF8",
    category: "SUV Cỡ D",
    type: "EV",
    basePrice: 1050000000,
    promotionPrice: 1029000000,
    stock: 4,
    colors: ["Đỏ", "Trắng", "Xanh", "Đen", "Xám", "Bạc"],
    versions: ["Eco", "Plus"],
    specs: { range: "471km", battery: "87.7 kWh", power: "349 HP", seats: 7 }
  },
  {
    id: 6,
    name: "VinFast VF9",
    category: "SUV Cỡ E",
    type: "EV",
    basePrice: 1491000000,
    promotionPrice: 1469000000,
    stock: 2,
    colors: ["Đỏ", "Trắng", "Xanh", "Đen", "Xám", "Bạc"],
    versions: ["Eco", "Plus"],
    specs: { range: "594km", battery: "123 kWh", power: "402 HP", seats: 7 }
  }
];

const mockPromotions = [
  { id: 1, name: "Giảm giá mùa hè", discount: "2-5%", validUntil: "2025-12-31" },
  { id: 2, name: "Tặng bảo hiểm 1 năm", discount: "Tặng kèm", validUntil: "2025-11-30" },
  { id: 3, name: "Hỗ trợ lãi suất 0%", discount: "12 tháng", validUntil: "2025-10-31" }
];

export default function VehiclesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  const [compareList, setCompareList] = useState<number[]>([]);

  const filteredVehicles = mockVehicles.filter(v => {
    const matchSearch = v.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = categoryFilter === "all" || v.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  const categories = Array.from(new Set(mockVehicles.map(v => v.category)));

  const toggleCompare = (id: number) => {
    if (compareList.includes(id)) {
      setCompareList(compareList.filter(vid => vid !== id));
    } else if (compareList.length < 3) {
      setCompareList([...compareList, id]);
    }
  };

  const getCompareVehicles = () => {
    return mockVehicles.filter(v => compareList.includes(v.id));
  };

  return (
    <ProtectedRoute allowedRoles={["Dealer Staff"]}>
      <DealerStaffLayout>
        <div className="p-6 space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Danh mục xe</h1>
            <p className="text-muted-foreground mt-2">Xem thông tin xe, cấu hình, giá bán và tồn kho</p>
          </div>

          {/* Filters */}
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
                    placeholder="Tìm kiếm xe..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Danh mục" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {compareList.length > 0 && (
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{compareList.length} xe được chọn để so sánh</Badge>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" disabled={compareList.length < 2}>
                        So sánh ({compareList.length})
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>So sánh xe</DialogTitle>
                        <DialogDescription>So sánh thông số kỹ thuật và giá bán</DialogDescription>
                      </DialogHeader>
                      <CompareTable vehicles={getCompareVehicles()} />
                    </DialogContent>
                  </Dialog>
                  <Button size="sm" variant="outline" onClick={() => setCompareList([])}>
                    Xóa chọn
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Promotions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                Chương trình khuyến mãi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                {mockPromotions.map(promo => (
                  <div key={promo.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{promo.name}</p>
                      <p className="text-sm text-muted-foreground">Hết hạn: {promo.validUntil}</p>
                    </div>
                    <Badge>{promo.discount}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Vehicle Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredVehicles.map(vehicle => (
              <Card key={vehicle.id} className="overflow-hidden">
                <CardHeader className="bg-muted/50">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{vehicle.name}</CardTitle>
                      <CardDescription>{vehicle.category}</CardDescription>
                    </div>
                    <Badge variant="secondary">{vehicle.type}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Giá niêm yết:</span>
                      <span className="line-through">{vehicle.basePrice.toLocaleString('vi-VN')} VNĐ</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Giá khuyến mãi:</span>
                      <span className="text-lg font-bold text-primary">
                        {vehicle.promotionPrice.toLocaleString('vi-VN')} VNĐ
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">
                      Tồn kho: <strong>{vehicle.stock} xe</strong>
                    </span>
                    {vehicle.stock < 5 && (
                      <Badge variant="destructive" className="text-xs">Sắp hết</Badge>
                    )}
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Phiên bản:</p>
                    <div className="flex gap-1">
                      {vehicle.versions.map(v => (
                        <Badge key={v} variant="outline">{v}</Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Màu sắc:</p>
                    <div className="flex gap-1 flex-wrap">
                      {vehicle.colors.map(c => (
                        <Badge key={c} variant="secondary" className="text-xs">{c}</Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="flex-1" onClick={() => setSelectedVehicle(vehicle)}>
                          <Eye className="w-4 h-4 mr-2" />
                          Chi tiết
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>{vehicle.name}</DialogTitle>
                          <DialogDescription>{vehicle.category} - {vehicle.type}</DialogDescription>
                        </DialogHeader>
                        <VehicleDetails vehicle={vehicle} />
                      </DialogContent>
                    </Dialog>
                    <Button
                      size="sm"
                      variant={compareList.includes(vehicle.id) ? "default" : "outline"}
                      onClick={() => toggleCompare(vehicle.id)}
                      disabled={!compareList.includes(vehicle.id) && compareList.length >= 3}
                    >
                      <TrendingUp className="w-4 h-4 mr-2" />
                      {compareList.includes(vehicle.id) ? "✓" : "So sánh"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredVehicles.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <Car className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Không tìm thấy xe nào</p>
              </CardContent>
            </Card>
          )}
        </div>
      </DealerStaffLayout>
    </ProtectedRoute>
  );
}

function VehicleDetails({ vehicle }: { vehicle: any }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <h4 className="font-medium mb-2">Giá bán</h4>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Giá niêm yết: <span className="line-through">{vehicle.basePrice.toLocaleString('vi-VN')} VNĐ</span></p>
            <p className="text-lg font-bold text-primary">Giá KM: {vehicle.promotionPrice.toLocaleString('vi-VN')} VNĐ</p>
          </div>
        </div>
        <div>
          <h4 className="font-medium mb-2">Tồn kho</h4>
          <p className="text-2xl font-bold">{vehicle.stock} xe</p>
          <p className="text-sm text-muted-foreground">Sẵn có tại đại lý</p>
        </div>
      </div>

      <div>
        <h4 className="font-medium mb-2">Thông số kỹ thuật</h4>
        <div className="grid gap-2 grid-cols-2">
          <div className="p-3 border rounded-lg">
            <p className="text-sm text-muted-foreground">Quãng đường</p>
            <p className="font-medium">{vehicle.specs.range}</p>
          </div>
          <div className="p-3 border rounded-lg">
            <p className="text-sm text-muted-foreground">Pin</p>
            <p className="font-medium">{vehicle.specs.battery}</p>
          </div>
          <div className="p-3 border rounded-lg">
            <p className="text-sm text-muted-foreground">Công suất</p>
            <p className="font-medium">{vehicle.specs.power}</p>
          </div>
          <div className="p-3 border rounded-lg">
            <p className="text-sm text-muted-foreground">Số chỗ</p>
            <p className="font-medium">{vehicle.specs.seats} chỗ</p>
          </div>
        </div>
      </div>

      <div>
        <h4 className="font-medium mb-2">Phiên bản</h4>
        <div className="flex gap-2">
          {vehicle.versions.map((v: string) => (
            <Badge key={v} variant="outline">{v}</Badge>
          ))}
        </div>
      </div>

      <div>
        <h4 className="font-medium mb-2">Màu sắc</h4>
        <div className="flex gap-2 flex-wrap">
          {vehicle.colors.map((c: string) => (
            <Badge key={c} variant="secondary">{c}</Badge>
          ))}
        </div>
      </div>
    </div>
  );
}

function CompareTable({ vehicles }: { vehicles: any[] }) {
  if (vehicles.length === 0) return null;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="text-left p-2 font-medium">Thông số</th>
            {vehicles.map(v => (
              <th key={v.id} className="text-left p-2">
                <div className="font-bold">{v.name}</div>
                <div className="text-xs text-muted-foreground font-normal">{v.category}</div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr className="border-b">
            <td className="p-2 font-medium">Giá khuyến mãi</td>
            {vehicles.map(v => (
              <td key={v.id} className="p-2 text-primary font-bold">{v.promotionPrice.toLocaleString('vi-VN')} VNĐ</td>
            ))}
          </tr>
          <tr className="border-b">
            <td className="p-2 font-medium">Tồn kho</td>
            {vehicles.map(v => (
              <td key={v.id} className="p-2">{v.stock} xe</td>
            ))}
          </tr>
          <tr className="border-b">
            <td className="p-2 font-medium">Quãng đường</td>
            {vehicles.map(v => (
              <td key={v.id} className="p-2">{v.specs.range}</td>
            ))}
          </tr>
          <tr className="border-b">
            <td className="p-2 font-medium">Pin</td>
            {vehicles.map(v => (
              <td key={v.id} className="p-2">{v.specs.battery}</td>
            ))}
          </tr>
          <tr className="border-b">
            <td className="p-2 font-medium">Công suất</td>
            {vehicles.map(v => (
              <td key={v.id} className="p-2">{v.specs.power}</td>
            ))}
          </tr>
          <tr className="border-b">
            <td className="p-2 font-medium">Số chỗ</td>
            {vehicles.map(v => (
              <td key={v.id} className="p-2">{v.specs.seats} chỗ</td>
            ))}
          </tr>
          <tr className="border-b">
            <td className="p-2 font-medium">Phiên bản</td>
            {vehicles.map(v => (
              <td key={v.id} className="p-2">{v.versions.join(", ")}</td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
