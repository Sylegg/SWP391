"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Car, Search, Filter, Eye, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { mockVehicles } from "@/lib/mock-data"
import type { Vehicle } from "@/lib/types"

export default function VehiclesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedBrand, setSelectedBrand] = useState<string>("all")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [priceRange, setPriceRange] = useState<string>("all")

  const filteredVehicles = useMemo(() => {
    return mockVehicles.filter((vehicle) => {
      const matchesSearch =
        vehicle.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.model.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesBrand = selectedBrand === "all" || vehicle.brand === selectedBrand
      const matchesCategory = selectedCategory === "all" || vehicle.category === selectedCategory

      let matchesPrice = true
      if (priceRange !== "all") {
        const [min, max] = priceRange.split("-").map(Number)
        matchesPrice = vehicle.price >= min && (max ? vehicle.price <= max : true)
      }

      return matchesSearch && matchesBrand && matchesCategory && matchesPrice
    })
  }, [searchTerm, selectedBrand, selectedCategory, priceRange])

  const brands = Array.from(new Set(mockVehicles.map((v) => v.brand)))
  const categories = Array.from(new Set(mockVehicles.map((v) => v.category)))

  const getAvailabilityColor = (availability: Vehicle["availability"]) => {
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

  const getAvailabilityText = (availability: Vehicle["availability"]) => {
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
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Về trang chủ
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <Car className="h-6 w-6 text-primary" />
              <div>
                <h1 className="text-xl font-bold">Danh mục xe</h1>
                <p className="text-sm text-muted-foreground">Xem thông tin chi tiết và so sánh các mẫu xe</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Bộ lọc tìm kiếm
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Tìm kiếm</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Tìm theo hãng, mẫu xe..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Hãng xe</label>
                <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn hãng xe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả hãng</SelectItem>
                    {brands.map((brand) => (
                      <SelectItem key={brand} value={brand}>
                        {brand}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Loại xe</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn loại xe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả loại</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category === "sedan"
                          ? "Sedan"
                          : category === "suv"
                            ? "SUV"
                            : category === "hatchback"
                              ? "Hatchback"
                              : category === "luxury"
                                ? "Xe sang"
                                : category === "electric"
                                  ? "Xe điện"
                                  : category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Khoảng giá</label>
                <Select value={priceRange} onValueChange={setPriceRange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn khoảng giá" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả giá</SelectItem>
                    <SelectItem value="0-30000">Dưới $30,000</SelectItem>
                    <SelectItem value="30000-50000">$30,000 - $50,000</SelectItem>
                    <SelectItem value="50000-100000">$50,000 - $100,000</SelectItem>
                    <SelectItem value="100000">Trên $100,000</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground">Tìm thấy {filteredVehicles.length} xe phù hợp</p>
          <Link href="/vehicles/compare">
            <Button variant="outline">So sánh xe</Button>
          </Link>
        </div>

        {/* Vehicle Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVehicles.map((vehicle) => (
            <Card key={vehicle.id} className="hover:shadow-lg transition-shadow">
              <div className="aspect-video bg-muted rounded-t-lg overflow-hidden">
                <img
                  src={vehicle.images[0] || "/placeholder.svg"}
                  alt={`${vehicle.brand} ${vehicle.model}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      {vehicle.brand} {vehicle.model}
                    </CardTitle>
                    <CardDescription>
                      {vehicle.year} • {vehicle.variant}
                    </CardDescription>
                  </div>
                  <Badge className={getAvailabilityColor(vehicle.availability)}>
                    {getAvailabilityText(vehicle.availability)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-2xl font-bold text-primary">${vehicle.price.toLocaleString()}</div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Động cơ:</span>
                      <p className="font-medium">{vehicle.specifications.engine}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Hộp số:</span>
                      <p className="font-medium">{vehicle.specifications.transmission}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Nhiên liệu:</span>
                      <p className="font-medium">{vehicle.specifications.fuelType}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Tiêu thụ:</span>
                      <p className="font-medium">{vehicle.specifications.mileage}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {vehicle.specifications.features.slice(0, 3).map((feature, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                    {vehicle.specifications.features.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{vehicle.specifications.features.length - 3} khác
                      </Badge>
                    )}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Link href={`/vehicles/${vehicle.id}`} className="flex-1">
                      <Button className="w-full" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        Xem chi tiết
                      </Button>
                    </Link>
                    <Link href={`/sales/quotes/new?vehicleId=${vehicle.id}`}>
                      <Button variant="outline" size="sm">
                        Báo giá
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredVehicles.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Car className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Không tìm thấy xe phù hợp</h3>
              <p className="text-muted-foreground mb-4">
                Thử điều chỉnh bộ lọc để tìm thấy xe phù hợp với nhu cầu của bạn
              </p>
              <Button
                onClick={() => {
                  setSearchTerm("")
                  setSelectedBrand("all")
                  setSelectedCategory("all")
                  setPriceRange("all")
                }}
              >
                Xóa bộ lọc
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
