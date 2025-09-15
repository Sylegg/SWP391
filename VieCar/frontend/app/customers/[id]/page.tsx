"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, User, Phone, Mail, MapPin, Calendar, Car, FileText, Star } from "lucide-react"
import Link from "next/link"
import { mockCustomers, mockVehicles } from "@/lib/mock-data"
import { notFound } from "next/navigation"

interface CustomerDetailPageProps {
  params: {
    id: string
  }
}

export default function CustomerDetailPage({ params }: CustomerDetailPageProps) {
  const customer = mockCustomers.find((c) => c.id === params.id)

  if (!customer) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/customers">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Về danh sách
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <User className="h-6 w-6 text-primary" />
              <div>
                <h1 className="text-xl font-bold">{customer.name}</h1>
                <p className="text-sm text-muted-foreground">Thông tin chi tiết khách hàng</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Customer Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Thông tin cơ bản</CardTitle>
                  <Link href={`/customers/${customer.id}/edit`}>
                    <Button variant="outline" size="sm">
                      Chỉnh sửa
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{customer.name}</p>
                        <p className="text-sm text-muted-foreground">Họ và tên</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{customer.email}</p>
                        <p className="text-sm text-muted-foreground">Email</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{customer.phone}</p>
                        <p className="text-sm text-muted-foreground">Số điện thoại</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-muted-foreground mt-1" />
                      <div>
                        <p className="font-medium">{customer.address}</p>
                        <p className="text-sm text-muted-foreground">Địa chỉ</p>
                      </div>
                    </div>

                    {customer.dateOfBirth && (
                      <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{new Date(customer.dateOfBirth).toLocaleDateString("vi-VN")}</p>
                          <p className="text-sm text-muted-foreground">Ngày sinh</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{new Date(customer.createdAt).toLocaleDateString("vi-VN")}</p>
                        <p className="text-sm text-muted-foreground">Ngày tham gia</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Preferences */}
            <Card>
              <CardHeader>
                <CardTitle>Sở thích và ngân sách</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Ngân sách</h4>
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-2xl font-bold text-primary">
                        ${customer.preferences.budget.min.toLocaleString()} - $
                        {customer.preferences.budget.max.toLocaleString()}
                      </p>
                      <p className="text-sm text-muted-foreground">Khoảng giá mong muốn</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Hãng xe ưa thích</h4>
                    <div className="flex flex-wrap gap-2">
                      {customer.preferences.preferredBrands.map((brand) => (
                        <Badge key={brand} variant="secondary">
                          {brand}
                        </Badge>
                      ))}
                    </div>

                    <h4 className="font-medium mb-3 mt-4">Loại xe quan tâm</h4>
                    <div className="flex flex-wrap gap-2">
                      {customer.preferences.vehicleType.map((type) => (
                        <Badge key={type} variant="outline">
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Activity Tabs */}
            <Tabs defaultValue="history" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="history">Lịch sử mua hàng</TabsTrigger>
                <TabsTrigger value="testdrives">Lái thử</TabsTrigger>
                <TabsTrigger value="quotes">Báo giá</TabsTrigger>
              </TabsList>

              <TabsContent value="history" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Lịch sử mua hàng</CardTitle>
                    <CardDescription>{customer.purchaseHistory.length} giao dịch</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {customer.purchaseHistory.length === 0 ? (
                      <div className="text-center py-8">
                        <Car className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">Chưa có giao dịch mua hàng nào</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {customer.purchaseHistory.map((purchase) => {
                          const vehicle = mockVehicles.find((v) => v.id === purchase.vehicleId)
                          return (
                            <div key={purchase.id} className="flex items-center gap-4 p-4 border rounded-lg">
                              <img
                                src={vehicle?.images[0] || "/placeholder.svg"}
                                alt={`${vehicle?.brand} ${vehicle?.model}`}
                                className="w-16 h-12 rounded object-cover"
                              />
                              <div className="flex-1">
                                <p className="font-medium">
                                  {vehicle?.brand} {vehicle?.model}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(purchase.purchaseDate).toLocaleDateString("vi-VN")}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold">${purchase.totalAmount.toLocaleString()}</p>
                                <Badge variant="secondary">{purchase.paymentMethod}</Badge>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="testdrives" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Lịch sử lái thử</CardTitle>
                    <CardDescription>{customer.testDrives.length} lần lái thử</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {customer.testDrives.length === 0 ? (
                      <div className="text-center py-8">
                        <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">Chưa có lịch lái thử nào</p>
                        <Link href={`/customers/test-drives/new?customerId=${customer.id}`}>
                          <Button className="mt-4">Đặt lịch lái thử</Button>
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {customer.testDrives.map((testDrive) => {
                          const vehicle = mockVehicles.find((v) => v.id === testDrive.vehicleId)
                          return (
                            <div key={testDrive.id} className="flex items-center gap-4 p-4 border rounded-lg">
                              <img
                                src={vehicle?.images[0] || "/placeholder.svg"}
                                alt={`${vehicle?.brand} ${vehicle?.model}`}
                                className="w-16 h-12 rounded object-cover"
                              />
                              <div className="flex-1">
                                <p className="font-medium">
                                  {vehicle?.brand} {vehicle?.model}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(testDrive.scheduledDate).toLocaleDateString("vi-VN")}
                                </p>
                                {testDrive.feedback && (
                                  <p className="text-sm text-muted-foreground mt-1">{testDrive.feedback}</p>
                                )}
                              </div>
                              <div className="text-right">
                                <Badge
                                  variant={
                                    testDrive.status === "completed"
                                      ? "default"
                                      : testDrive.status === "scheduled"
                                        ? "secondary"
                                        : "destructive"
                                  }
                                >
                                  {testDrive.status === "completed"
                                    ? "Hoàn thành"
                                    : testDrive.status === "scheduled"
                                      ? "Đã lên lịch"
                                      : "Đã hủy"}
                                </Badge>
                                {testDrive.rating && (
                                  <div className="flex items-center gap-1 mt-1">
                                    {[...Array(5)].map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`h-3 w-3 ${
                                          i < testDrive.rating! ? "text-yellow-400 fill-current" : "text-gray-300"
                                        }`}
                                      />
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="quotes" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Báo giá đã gửi</CardTitle>
                    <CardDescription>Các báo giá cho khách hàng này</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Chưa có báo giá nào</p>
                      <Link href={`/sales/quotes/new?customerId=${customer.id}`}>
                        <Button className="mt-4">Tạo báo giá</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Quick Actions */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Thao tác nhanh</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href={`/sales/quotes/new?customerId=${customer.id}`}>
                  <Button className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Tạo báo giá
                  </Button>
                </Link>

                <Link href={`/customers/test-drives/new?customerId=${customer.id}`}>
                  <Button className="w-full justify-start bg-transparent" variant="outline">
                    <Calendar className="h-4 w-4 mr-2" />
                    Đặt lịch lái thử
                  </Button>
                </Link>

                <Button className="w-full justify-start bg-transparent" variant="outline">
                  <Phone className="h-4 w-4 mr-2" />
                  Gọi điện
                </Button>

                <Button className="w-full justify-start bg-transparent" variant="outline">
                  <Mail className="h-4 w-4 mr-2" />
                  Gửi email
                </Button>
              </CardContent>
            </Card>

            {/* Customer Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Thống kê khách hàng</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Tổng chi tiêu:</span>
                  <span className="font-bold">
                    $
                    {customer.purchaseHistory
                      .reduce((total, purchase) => total + purchase.totalAmount, 0)
                      .toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Số xe đã mua:</span>
                  <span className="font-bold">{customer.purchaseHistory.length}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Lần lái thử:</span>
                  <span className="font-bold">{customer.testDrives.length}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Khách hàng từ:</span>
                  <span className="font-bold">{new Date(customer.createdAt).toLocaleDateString("vi-VN")}</span>
                </div>
              </CardContent>
            </Card>

            {/* Recommended Vehicles */}
            <Card>
              <CardHeader>
                <CardTitle>Xe phù hợp</CardTitle>
                <CardDescription>Dựa trên sở thích và ngân sách</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockVehicles
                    .filter(
                      (vehicle) =>
                        vehicle.price >= customer.preferences.budget.min &&
                        vehicle.price <= customer.preferences.budget.max &&
                        (customer.preferences.preferredBrands.includes(vehicle.brand) ||
                          customer.preferences.vehicleType.includes(vehicle.category)),
                    )
                    .slice(0, 2)
                    .map((vehicle) => (
                      <Link key={vehicle.id} href={`/vehicles/${vehicle.id}`}>
                        <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors">
                          <img
                            src={vehicle.images[0] || "/placeholder.svg"}
                            alt={`${vehicle.brand} ${vehicle.model}`}
                            className="w-12 h-8 rounded object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">
                              {vehicle.brand} {vehicle.model}
                            </p>
                            <p className="text-xs text-muted-foreground">${vehicle.price.toLocaleString()}</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
