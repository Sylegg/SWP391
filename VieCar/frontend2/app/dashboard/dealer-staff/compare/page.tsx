"use client";

import { useState } from "react";
import { ProtectedRoute } from "@/components/auth-guards";
import DealerStaffLayout from "@/components/layout/dealer-staff-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Car, X, GitCompare, Check, Minus, AlertCircle } from "lucide-react";

// Mock data - Sử dụng lại data từ vehicles page
const vehicles = [
  {
    id: 1,
    name: "VinFast VF 3",
    category: "SUV",
    type: "EV",
    price: 240000000,
    pricePromo: 235000000,
    specs: {
      range: "210 km",
      battery: "18.64 kWh",
      power: "43.8 HP",
      torque: "110 Nm",
      seats: 5,
      charging: "3-7 giờ",
      topSpeed: "110 km/h",
      acceleration: "15.5 giây (0-100km/h)"
    },
    features: ["Hệ thống giải trí cơ bản", "Camera lùi", "Cảm biến lùi", "Điều hòa tự động"],
    safety: ["2 túi khí", "ABS", "EBD", "ESC"],
  },
  {
    id: 2,
    name: "VinFast VF 5",
    category: "SUV",
    type: "EV",
    price: 468000000,
    pricePromo: 458000000,
    specs: {
      range: "326 km",
      battery: "37.23 kWh",
      power: "134 HP",
      torque: "135 Nm",
      seats: 5,
      charging: "7-9 giờ",
      topSpeed: "140 km/h",
      acceleration: "11.5 giây (0-100km/h)"
    },
    features: ["Màn hình 10 inch", "Kết nối Apple CarPlay", "Camera 360", "Cảm biến 4 góc", "Phanh tay điện tử"],
    safety: ["4 túi khí", "ABS", "EBD", "ESC", "Hill Assist"],
  },
  {
    id: 3,
    name: "VinFast VF 6",
    category: "SUV",
    type: "EV",
    price: 675000000,
    pricePromo: 665000000,
    specs: {
      range: "388 km",
      battery: "59.6 kWh",
      power: "174 HP",
      torque: "250 Nm",
      seats: 5,
      charging: "6-8 giờ",
      topSpeed: "160 km/h",
      acceleration: "8.9 giây (0-100km/h)"
    },
    features: ["Màn hình 12.9 inch", "Apple CarPlay/Android Auto", "Camera 360", "Cửa sổ trời Panorama", "Sạc không dây", "Ghế chỉnh điện"],
    safety: ["6 túi khí", "ABS", "EBD", "ESC", "Cruise Control", "Cảnh báo điểm mù"],
  },
  {
    id: 4,
    name: "VinFast VF 7",
    category: "SUV",
    type: "EV",
    price: 850000000,
    pricePromo: 840000000,
    specs: {
      range: "450 km",
      battery: "75.3 kWh",
      power: "201 HP",
      torque: "310 Nm",
      seats: 7,
      charging: "8-10 giờ",
      topSpeed: "180 km/h",
      acceleration: "7.5 giây (0-100km/h)"
    },
    features: ["Màn hình 15.6 inch", "Hệ thống âm thanh cao cấp", "Camera 360", "Cửa sổ trời", "Ghế da cao cấp", "Điều hòa 3 vùng"],
    safety: ["8 túi khí", "ABS", "EBD", "ESC", "ADAS cấp độ 2", "Cảnh báo va chạm"],
  },
  {
    id: 5,
    name: "VinFast VF 8",
    category: "SUV",
    type: "EV",
    price: 1050000000,
    pricePromo: 1029000000,
    specs: {
      range: "471 km",
      battery: "87.7 kWh",
      power: "349 HP",
      torque: "500 Nm",
      seats: 5,
      charging: "9-11 giờ",
      topSpeed: "200 km/h",
      acceleration: "5.5 giây (0-100km/h)"
    },
    features: ["Màn hình 15.6 inch", "Hệ thống âm thanh 11 loa", "Camera 360", "Cửa sổ trời Panorama", "Ghế massage", "HUD", "Đèn LED matrix"],
    safety: ["11 túi khí", "ABS", "EBD", "ESC", "ADAS cấp độ 2+", "Hỗ trợ đỗ xe tự động"],
  },
  {
    id: 6,
    name: "VinFast VF 9",
    category: "SUV",
    type: "EV",
    price: 1491000000,
    pricePromo: 1450000000,
    specs: {
      range: "594 km",
      battery: "123 kWh",
      power: "402 HP",
      torque: "640 Nm",
      seats: 7,
      charging: "11-13 giờ",
      topSpeed: "210 km/h",
      acceleration: "6.5 giây (0-100km/h)"
    },
    features: ["Màn hình 15.6 inch", "Hệ thống âm thanh 13 loa", "Camera 360", "Cửa sổ trời Panorama", "Ghế massage 3 hàng", "HUD", "Cửa điện", "Đèn LED matrix thông minh"],
    safety: ["11 túi khí", "ABS", "EBD", "ESC", "ADAS cấp độ 2+", "Hỗ trợ đỗ xe tự động", "Giám sát 360 độ"],
  }
];

export default function ComparePage() {
  const [selectedVehicles, setSelectedVehicles] = useState<number[]>([]);

  const handleSelectVehicle = (vehicleId: string, slot: number) => {
    const newSelection = [...selectedVehicles];
    newSelection[slot] = parseInt(vehicleId);
    setSelectedVehicles(newSelection);
  };

  const handleRemoveVehicle = (slot: number) => {
    const newSelection = [...selectedVehicles];
    newSelection[slot] = 0;
    setSelectedVehicles(newSelection);
  };

  const compareVehicles = selectedVehicles
    .filter(id => id > 0)
    .map(id => vehicles.find(v => v.id === id))
    .filter(Boolean) as typeof vehicles;

  const availableVehicles = vehicles.filter(v => !selectedVehicles.includes(v.id));

  return (
    <ProtectedRoute allowedRoles={["Dealer Staff"]}>
      <DealerStaffLayout>
        <div className="p-6 space-y-6">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <GitCompare className="w-8 h-8" />
              So sánh xe
            </h1>
            <p className="text-muted-foreground mt-2">
              So sánh tối đa 3 mẫu xe để tìm lựa chọn phù hợp nhất
            </p>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Chọn 2-3 mẫu xe để so sánh thông số kỹ thuật, tính năng và giá cả
            </AlertDescription>
          </Alert>

          {/* Vehicle Selectors */}
          <Card>
            <CardHeader>
              <CardTitle>Chọn xe để so sánh</CardTitle>
              <CardDescription>Chọn tối đa 3 mẫu xe</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[0, 1, 2].map(slot => (
                  <div key={slot} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Xe {slot + 1}</span>
                      {selectedVehicles[slot] > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveVehicle(slot)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    <Select
                      value={selectedVehicles[slot]?.toString() || ""}
                      onValueChange={(value) => handleSelectVehicle(value, slot)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn xe" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableVehicles.map(vehicle => (
                          <SelectItem key={vehicle.id} value={vehicle.id.toString()}>
                            {vehicle.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Comparison Table */}
          {compareVehicles.length >= 2 && (
            <div className="space-y-4">
              {/* Basic Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Thông tin cơ bản</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {compareVehicles.map(vehicle => (
                      <div key={vehicle.id} className="text-center space-y-2">
                        <div className="bg-muted h-32 rounded-lg flex items-center justify-center">
                          <Car className="w-16 h-16 text-muted-foreground" />
                        </div>
                        <h3 className="font-bold text-lg">{vehicle.name}</h3>
                        <Badge>{vehicle.type}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Price Comparison */}
              <Card>
                <CardHeader>
                  <CardTitle>Giá bán</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {compareVehicles.map(vehicle => (
                        <div key={vehicle.id} className="space-y-2">
                          <div className="text-center">
                            <p className="text-sm text-muted-foreground line-through">
                              {vehicle.price.toLocaleString('vi-VN')} VNĐ
                            </p>
                            <p className="text-xl font-bold text-primary">
                              {vehicle.pricePromo.toLocaleString('vi-VN')} VNĐ
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Specs Comparison */}
              <Card>
                <CardHeader>
                  <CardTitle>Thông số kỹ thuật</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { label: "Phạm vi hoạt động", key: "range" },
                      { label: "Dung lượng pin", key: "battery" },
                      { label: "Công suất", key: "power" },
                      { label: "Mô-men xoắn", key: "torque" },
                      { label: "Tốc độ tối đa", key: "topSpeed" },
                      { label: "Tăng tốc 0-100km/h", key: "acceleration" },
                      { label: "Số chỗ ngồi", key: "seats" },
                      { label: "Thời gian sạc", key: "charging" }
                    ].map(spec => (
                      <div key={spec.key} className="grid grid-cols-4 gap-4 py-2 border-b">
                        <div className="font-medium">{spec.label}</div>
                        {compareVehicles.map(vehicle => (
                          <div key={vehicle.id} className="text-center">
                            {spec.key === "seats" 
                              ? `${vehicle.specs.seats} chỗ`
                              : vehicle.specs[spec.key as keyof typeof vehicle.specs]
                            }
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Features Comparison */}
              <Card>
                <CardHeader>
                  <CardTitle>Tính năng nổi bật</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {compareVehicles.map(vehicle => (
                      <div key={vehicle.id} className="space-y-2">
                        <ul className="space-y-2">
                          {vehicle.features.map((feature, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm">
                              <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Safety Comparison */}
              <Card>
                <CardHeader>
                  <CardTitle>An toàn</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {compareVehicles.map(vehicle => (
                      <div key={vehicle.id} className="space-y-2">
                        <ul className="space-y-2">
                          {vehicle.safety.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm">
                              <Check className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {compareVehicles.length < 2 && (
            <Card>
              <CardContent className="py-12 text-center">
                <GitCompare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Vui lòng chọn ít nhất 2 mẫu xe để bắt đầu so sánh
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </DealerStaffLayout>
    </ProtectedRoute>
  );
}
