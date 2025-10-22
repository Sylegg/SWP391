"use client";

import { ProtectedRoute } from "@/components/auth-guards";
import CustomerLayout from "@/components/layout/customer-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Heart, Eye, Calendar } from "lucide-react";
import Image from "next/image";

export default function CustomerVehiclesPage() {
  // Mock data - replace with actual API calls
  const vehicles = [
    {
      id: 1,
      name: "VinFast Evo 200",
      category: "Xe máy điện",
      price: "22,900,000",
      image: "/xe dien vinfast/Evo200.jpg",
      description: "Xe máy điện thông minh, hiện đại",
      range: "120 km",
      topSpeed: "55 km/h"
    },
    {
      id: 2,
      name: "VinFast VF 8",
      category: "Ô tô điện",
      price: "1,200,000,000",
      image: "/xe oto vinfast/VF8.jpg",
      description: "SUV điện cao cấp, thông minh",
      range: "400 km",
      topSpeed: "180 km/h"
    },
    {
      id: 3,
      name: "VinFast VF 9",
      category: "Ô tô điện",
      price: "1,500,000,000",
      image: "/xe oto vinfast/VF9.jpg",
      description: "SUV điện hạng sang, không gian rộng rãi",
      range: "450 km",
      topSpeed: "200 km/h"
    }
  ];

  return (
    <ProtectedRoute allowedRoles={['Customer']}>
      <CustomerLayout>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold">Danh mục xe điện</h1>
              <p className="text-muted-foreground mt-2">
                Khám phá các mẫu xe điện hiện đại và thân thiện với môi trường
              </p>
            </div>
          </div>

          {/* Search */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Tìm kiếm xe phù hợp</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Tìm kiếm theo tên xe, loại xe..."
                      className="pl-10"
                    />
                  </div>
                </div>
                <Button variant="outline">Lọc theo giá</Button>
                <Button variant="outline">Lọc theo loại</Button>
              </div>
            </CardContent>
          </Card>

          {/* Vehicles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.map((vehicle) => (
              <Card key={vehicle.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative h-48 w-full">
                  <Image
                    src={vehicle.image}
                    alt={vehicle.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
                      <Heart className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{vehicle.name}</CardTitle>
                      <Badge variant="secondary" className="mt-1">
                        {vehicle.category}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">
                        {vehicle.price} ₫
                      </p>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <p className="text-muted-foreground mb-4">{vehicle.description}</p>
                  
                  <div className="flex justify-between text-sm text-muted-foreground mb-4">
                    <span>Quãng đường: {vehicle.range}</span>
                    <span>Tốc độ tối đa: {vehicle.topSpeed}</span>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button className="flex-1">
                      <Eye className="mr-2 h-4 w-4" />
                      Xem chi tiết
                    </Button>
                    <Button variant="outline">
                      <Calendar className="mr-2 h-4 w-4" />
                      Đặt lái thử
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </CustomerLayout>
    </ProtectedRoute>
  );
}