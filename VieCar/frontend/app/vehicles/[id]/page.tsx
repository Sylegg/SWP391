"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Car, Calendar, FileText, Heart } from "lucide-react"
import Link from "next/link"
import { mockVehicles } from "@/lib/mock-data"
import { notFound } from "next/navigation"

interface VehicleDetailPageProps {
  params: {
    id: string
  }
}

export default function VehicleDetailPage({ params }: VehicleDetailPageProps) {
  const vehicle = mockVehicles.find((v) => v.id === params.id)
  const [selectedImage, setSelectedImage] = useState(0)

  if (!vehicle) {
    notFound()
  }

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case "available":
        return "bg-green-100 text-green-800"
      case "limited":
        return "bg-yellow-100 text-yellow-800"
      case "out-of-stock":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getAvailabilityText = (availability: string) => {
    switch (availability) {
      case "available":
        return "Có sẵn"
      case "limited":
        return "Số lượng hạn chế"
      case "out-of-stock":
        return "Hết hàng"
      default:
        return "Không xác định"
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/vehicles">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Về danh mục
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <Car className="h-6 w-6 text-primary" />
              <div>
                <h1 className="text-xl font-bold">
                  {vehicle.brand} {vehicle.model}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {vehicle.year} • {vehicle.variant}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Images and Basic Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <Card>
              <CardContent className="p-0">
                <div className="aspect-video bg-muted rounded-t-lg overflow-hidden">
                  <img
                    src={vehicle.images[selectedImage] || "/placeholder.svg"}
                    alt={`${vehicle.brand} ${vehicle.model}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                {vehicle.images.length > 1 && (
                  <div className="p-4 flex gap-2 overflow-x-auto">
                    {vehicle.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 ${
                          selectedImage === index ? "border-primary" : "border-transparent"
                        }`}
                      >
                        <img
                          src={image || "/placeholder.svg"}
                          alt={`View ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Detailed Specifications */}
            <Tabs defaultValue="specs" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="specs">Thông số kỹ thuật</TabsTrigger>
                <TabsTrigger value="features">Tính năng</TabsTrigger>
                <TabsTrigger value="description">Mô tả</TabsTrigger>
              </TabsList>

              <TabsContent value="specs" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Thông số kỹ thuật</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div>
                          <span className="text-sm text-muted-foreground">Động cơ</span>
                          <p className="font-medium">{vehicle.specifications.engine}</p>
                        </div>
                        <div>
                          <span className="text-sm text-muted-foreground">Hộp số</span>
                          <p className="font-medium">{vehicle.specifications.transmission}</p>
                        </div>
                        <div>
                          <span className="text-sm text-muted-foreground">Loại nhiên liệu</span>
                          <p className="font-medium">{vehicle.specifications.fuelType}</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <span className="text-sm text-muted-foreground">Số chỗ ngồi</span>
                          <p className="font-medium">{vehicle.specifications.seatingCapacity} chỗ</p>
                        </div>
                        <div>
                          <span className="text-sm text-muted-foreground">Tiêu thụ nhiên liệu</span>
                          <p className="font-medium">{vehicle.specifications.mileage}</p>
                        </div>
                        <div>
                          <span className="text-sm text-muted-foreground">Loại xe</span>
                          <p className="font-medium capitalize">{vehicle.category}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="features" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Tính năng nổi bật</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {vehicle.specifications.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-primary rounded-full"></div>
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="description" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Mô tả chi tiết</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">
                      {vehicle.brand} {vehicle.model} {vehicle.year} là một chiếc xe {vehicle.category}
                      cao cấp với thiết kế hiện đại và công nghệ tiên tiến. Xe được trang bị động cơ{" "}
                      {vehicle.specifications.engine}
                      mạnh mẽ, kết hợp với hộp số {vehicle.specifications.transmission} mang lại trải nghiệm lái xe mượt
                      mà và tiết kiệm nhiên liệu.
                    </p>
                    <p className="text-muted-foreground leading-relaxed mt-4">
                      Với không gian nội thất rộng rãi cho {vehicle.specifications.seatingCapacity} người và nhiều tính
                      năng an toàn, tiện nghi hiện đại, đây là lựa chọn hoàn hảo cho những ai tìm kiếm sự kết hợp giữa
                      hiệu suất, tiện nghi và phong cách.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Price and Actions */}
          <div className="space-y-6">
            {/* Price and Status */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl font-bold text-primary">${vehicle.price.toLocaleString()}</CardTitle>
                  <Badge className={getAvailabilityColor(vehicle.availability)}>
                    {getAvailabilityText(vehicle.availability)}
                  </Badge>
                </div>
                <CardDescription>Giá niêm yết chưa bao gồm thuế và phí</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Link href={`/sales/quotes/new?vehicleId=${vehicle.id}`}>
                    <Button className="w-full">
                      <FileText className="h-4 w-4 mr-2" />
                      Tạo báo giá
                    </Button>
                  </Link>
                  <Link href={`/customers/test-drives/new?vehicleId=${vehicle.id}`}>
                    <Button variant="outline" className="w-full bg-transparent">
                      <Calendar className="h-4 w-4 mr-2" />
                      Đặt lái thử
                    </Button>
                  </Link>
                </div>
                <Button variant="outline" className="w-full bg-transparent">
                  <Heart className="h-4 w-4 mr-2" />
                  Thêm vào yêu thích
                </Button>
              </CardContent>
            </Card>

            {/* Quick Contact */}
            <Card>
              <CardHeader>
                <CardTitle>Liên hệ tư vấn</CardTitle>
                <CardDescription>Nhận tư vấn chi tiết từ chuyên viên</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm">
                  <p className="font-medium">Phạm Thị Lan</p>
                  <p className="text-muted-foreground">Chuyên viên bán hàng</p>
                  <p className="text-muted-foreground">pham.thi.lan@dealer.com</p>
                  <p className="text-muted-foreground">+84 901 234 567</p>
                </div>
                <Button variant="outline" className="w-full bg-transparent">
                  Gọi ngay
                </Button>
              </CardContent>
            </Card>

            {/* Similar Vehicles */}
            <Card>
              <CardHeader>
                <CardTitle>Xe tương tự</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockVehicles
                    .filter((v) => v.id !== vehicle.id && v.category === vehicle.category)
                    .slice(0, 2)
                    .map((similarVehicle) => (
                      <Link key={similarVehicle.id} href={`/vehicles/${similarVehicle.id}`}>
                        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors">
                          <img
                            src={similarVehicle.images[0] || "/placeholder.svg"}
                            alt={`${similarVehicle.brand} ${similarVehicle.model}`}
                            className="w-12 h-12 rounded object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">
                              {similarVehicle.brand} {similarVehicle.model}
                            </p>
                            <p className="text-xs text-muted-foreground">${similarVehicle.price.toLocaleString()}</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                </div>
                <Link href="/vehicles">
                  <Button variant="outline" className="w-full mt-3 bg-transparent" size="sm">
                    Xem tất cả
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
