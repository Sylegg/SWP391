"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Car, X, Plus } from "lucide-react"
import Link from "next/link"
import { mockVehicles } from "@/lib/mock-data"
import type { Vehicle } from "@/lib/types"

export default function VehicleComparePage() {
  const [selectedVehicles, setSelectedVehicles] = useState<Vehicle[]>([])

  const addVehicle = (vehicleId: string) => {
    const vehicle = mockVehicles.find((v) => v.id === vehicleId)
    if (vehicle && selectedVehicles.length < 3 && !selectedVehicles.find((v) => v.id === vehicleId)) {
      setSelectedVehicles([...selectedVehicles, vehicle])
    }
  }

  const removeVehicle = (vehicleId: string) => {
    setSelectedVehicles(selectedVehicles.filter((v) => v.id !== vehicleId))
  }

  const availableVehicles = mockVehicles.filter((v) => !selectedVehicles.find((sv) => sv.id === v.id))

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
                <h1 className="text-xl font-bold">So sánh xe</h1>
                <p className="text-sm text-muted-foreground">So sánh thông số và tính năng các mẫu xe</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Vehicle Selection */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Chọn xe để so sánh</CardTitle>
            <CardDescription>Chọn tối đa 3 mẫu xe để so sánh chi tiết</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Select onValueChange={addVehicle}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn xe để thêm vào so sánh..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableVehicles.map((vehicle) => (
                      <SelectItem key={vehicle.id} value={vehicle.id}>
                        {vehicle.brand} {vehicle.model} {vehicle.year} - ${vehicle.price.toLocaleString()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Badge variant="secondary">{selectedVehicles.length}/3 xe đã chọn</Badge>
            </div>
          </CardContent>
        </Card>

        {selectedVehicles.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Car className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Chưa chọn xe nào để so sánh</h3>
              <p className="text-muted-foreground mb-4">
                Chọn ít nhất 2 mẫu xe để bắt đầu so sánh thông số và tính năng
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Vehicle Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {selectedVehicles.map((vehicle) => (
                <Card key={vehicle.id} className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 z-10"
                    onClick={() => removeVehicle(vehicle.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <div className="aspect-video bg-muted rounded-t-lg overflow-hidden">
                    <img
                      src={vehicle.images[0] || "/placeholder.svg"}
                      alt={`${vehicle.brand} ${vehicle.model}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {vehicle.brand} {vehicle.model}
                    </CardTitle>
                    <CardDescription>
                      {vehicle.year} • {vehicle.variant}
                    </CardDescription>
                    <div className="text-xl font-bold text-primary">${vehicle.price.toLocaleString()}</div>
                  </CardHeader>
                </Card>
              ))}

              {selectedVehicles.length < 3 && (
                <Card className="border-dashed border-2 flex items-center justify-center min-h-[300px]">
                  <div className="text-center">
                    <Plus className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">Thêm xe để so sánh</p>
                  </div>
                </Card>
              )}
            </div>

            {/* Comparison Table */}
            {selectedVehicles.length >= 2 && (
              <Card>
                <CardHeader>
                  <CardTitle>Bảng so sánh chi tiết</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-medium">Thông số</th>
                          {selectedVehicles.map((vehicle) => (
                            <th key={vehicle.id} className="text-left py-3 px-4 font-medium">
                              {vehicle.brand} {vehicle.model}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        <tr>
                          <td className="py-3 px-4 font-medium text-muted-foreground">Giá bán</td>
                          {selectedVehicles.map((vehicle) => (
                            <td key={vehicle.id} className="py-3 px-4 font-bold text-primary">
                              ${vehicle.price.toLocaleString()}
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-medium text-muted-foreground">Động cơ</td>
                          {selectedVehicles.map((vehicle) => (
                            <td key={vehicle.id} className="py-3 px-4">
                              {vehicle.specifications.engine}
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-medium text-muted-foreground">Hộp số</td>
                          {selectedVehicles.map((vehicle) => (
                            <td key={vehicle.id} className="py-3 px-4">
                              {vehicle.specifications.transmission}
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-medium text-muted-foreground">Nhiên liệu</td>
                          {selectedVehicles.map((vehicle) => (
                            <td key={vehicle.id} className="py-3 px-4">
                              {vehicle.specifications.fuelType}
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-medium text-muted-foreground">Số chỗ ngồi</td>
                          {selectedVehicles.map((vehicle) => (
                            <td key={vehicle.id} className="py-3 px-4">
                              {vehicle.specifications.seatingCapacity} chỗ
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-medium text-muted-foreground">Tiêu thụ nhiên liệu</td>
                          {selectedVehicles.map((vehicle) => (
                            <td key={vehicle.id} className="py-3 px-4">
                              {vehicle.specifications.mileage}
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-medium text-muted-foreground">Tình trạng</td>
                          {selectedVehicles.map((vehicle) => (
                            <td key={vehicle.id} className="py-3 px-4">
                              <Badge
                                className={
                                  vehicle.availability === "available"
                                    ? "bg-green-100 text-green-800"
                                    : vehicle.availability === "limited"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-red-100 text-red-800"
                                }
                              >
                                {vehicle.availability === "available"
                                  ? "Có sẵn"
                                  : vehicle.availability === "limited"
                                    ? "Hạn chế"
                                    : "Hết hàng"}
                              </Badge>
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Features Comparison */}
            {selectedVehicles.length >= 2 && (
              <Card>
                <CardHeader>
                  <CardTitle>So sánh tính năng</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {selectedVehicles.map((vehicle) => (
                      <div key={vehicle.id} className="space-y-3">
                        <h4 className="font-semibold">
                          {vehicle.brand} {vehicle.model}
                        </h4>
                        <div className="space-y-2">
                          {vehicle.specifications.features.map((feature, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm">
                              <div className="w-2 h-2 bg-primary rounded-full"></div>
                              <span>{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 justify-center">
              {selectedVehicles.map((vehicle) => (
                <Link key={vehicle.id} href={`/vehicles/${vehicle.id}`}>
                  <Button variant="outline">
                    Xem chi tiết {vehicle.brand} {vehicle.model}
                  </Button>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
