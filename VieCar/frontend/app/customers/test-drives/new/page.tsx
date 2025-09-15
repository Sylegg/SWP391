"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Calendar, Save } from "lucide-react"
import Link from "next/link"
import { mockCustomers, mockVehicles } from "@/lib/mock-data"

export default function NewTestDrivePage() {
  const [selectedCustomer, setSelectedCustomer] = useState("")
  const [selectedVehicle, setSelectedVehicle] = useState("")
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedTime, setSelectedTime] = useState("")
  const [notes, setNotes] = useState("")

  const customer = mockCustomers.find((c) => c.id === selectedCustomer)
  const vehicle = mockVehicles.find((v) => v.id === selectedVehicle)

  const timeSlots = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00"]

  const handleSave = () => {
    // Here you would save the test drive appointment
    console.log("Saving test drive appointment:", {
      customerId: selectedCustomer,
      vehicleId: selectedVehicle,
      scheduledDate: `${selectedDate}T${selectedTime}:00Z`,
      notes,
    })
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/customers/test-drives">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Về danh sách
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <Calendar className="h-6 w-6 text-primary" />
              <div>
                <h1 className="text-xl font-bold">Đặt lịch lái thử</h1>
                <p className="text-sm text-muted-foreground">Tạo lịch hẹn lái thử cho khách hàng</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Chọn khách hàng</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="customer">Khách hàng</Label>
                  <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn khách hàng..." />
                    </SelectTrigger>
                    <SelectContent>
                      {mockCustomers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.name} - {customer.phone}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {customer && (
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">Thông tin khách hàng</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Email:</span>
                        <p className="font-medium">{customer.email}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Điện thoại:</span>
                        <p className="font-medium">{customer.phone}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Địa chỉ:</span>
                        <p className="font-medium">{customer.address}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Ngân sách:</span>
                        <p className="font-medium">
                          ${customer.preferences.budget.min.toLocaleString()} - $
                          {customer.preferences.budget.max.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Vehicle Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Chọn xe lái thử</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="vehicle">Mẫu xe</Label>
                  <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn xe..." />
                    </SelectTrigger>
                    <SelectContent>
                      {mockVehicles
                        .filter((v) => v.availability === "available")
                        .map((vehicle) => (
                          <SelectItem key={vehicle.id} value={vehicle.id}>
                            {vehicle.brand} {vehicle.model} {vehicle.year} - ${vehicle.price.toLocaleString()}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                {vehicle && (
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="flex gap-4">
                      <img
                        src={vehicle.images[0] || "/placeholder.svg"}
                        alt={`${vehicle.brand} ${vehicle.model}`}
                        className="w-24 h-16 rounded object-cover"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium">
                          {vehicle.brand} {vehicle.model}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {vehicle.year} • {vehicle.variant}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {vehicle.specifications.engine} • {vehicle.specifications.transmission}
                        </p>
                        <p className="text-lg font-bold text-primary mt-1">${vehicle.price.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Date and Time Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Chọn thời gian</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Ngày</Label>
                    <Input
                      id="date"
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="time">Giờ</Label>
                    <Select value={selectedTime} onValueChange={setSelectedTime}>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn giờ..." />
                      </SelectTrigger>
                      <SelectContent>
                        {timeSlots.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Ghi chú</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Ghi chú thêm cho cuộc hẹn lái thử..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                />
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Tóm tắt lịch hẹn</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {customer && vehicle && selectedDate && selectedTime ? (
                  <>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm text-muted-foreground">Khách hàng:</span>
                        <p className="font-medium">{customer.name}</p>
                        <p className="text-sm text-muted-foreground">{customer.phone}</p>
                      </div>

                      <div>
                        <span className="text-sm text-muted-foreground">Xe lái thử:</span>
                        <p className="font-medium">
                          {vehicle.brand} {vehicle.model}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {vehicle.year} • {vehicle.variant}
                        </p>
                      </div>

                      <div>
                        <span className="text-sm text-muted-foreground">Thời gian:</span>
                        <p className="font-medium">{new Date(selectedDate).toLocaleDateString("vi-VN")}</p>
                        <p className="text-sm text-muted-foreground">{selectedTime}</p>
                      </div>

                      {notes && (
                        <div>
                          <span className="text-sm text-muted-foreground">Ghi chú:</span>
                          <p className="text-sm">{notes}</p>
                        </div>
                      )}
                    </div>

                    <Button
                      className="w-full"
                      onClick={handleSave}
                      disabled={!selectedCustomer || !selectedVehicle || !selectedDate || !selectedTime}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Đặt lịch hẹn
                    </Button>
                  </>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    Điền đầy đủ thông tin để xem tóm tắt lịch hẹn
                  </p>
                )}
              </CardContent>
            </Card>

            {customer && vehicle && (
              <Card>
                <CardHeader>
                  <CardTitle>Phù hợp với khách hàng</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Ngân sách:</span>
                      <span
                        className={
                          vehicle.price >= customer.preferences.budget.min &&
                          vehicle.price <= customer.preferences.budget.max
                            ? "text-green-600 font-medium"
                            : "text-red-600 font-medium"
                        }
                      >
                        {vehicle.price >= customer.preferences.budget.min &&
                        vehicle.price <= customer.preferences.budget.max
                          ? "Phù hợp"
                          : "Vượt ngân sách"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Hãng xe ưa thích:</span>
                      <span
                        className={
                          customer.preferences.preferredBrands.includes(vehicle.brand)
                            ? "text-green-600 font-medium"
                            : "text-yellow-600 font-medium"
                        }
                      >
                        {customer.preferences.preferredBrands.includes(vehicle.brand) ? "Phù hợp" : "Khác sở thích"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Loại xe:</span>
                      <span
                        className={
                          customer.preferences.vehicleType.includes(vehicle.category)
                            ? "text-green-600 font-medium"
                            : "text-yellow-600 font-medium"
                        }
                      >
                        {customer.preferences.vehicleType.includes(vehicle.category) ? "Phù hợp" : "Khác sở thích"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Tips */}
            <Card>
              <CardHeader>
                <CardTitle>Lưu ý lái thử</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                    <span>Khách hàng cần mang theo bằng lái xe hợp lệ</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                    <span>Thời gian lái thử khoảng 30-45 phút</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                    <span>Nhân viên bán hàng sẽ đi cùng</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                    <span>Gọi điện xác nhận trước 1 ngày</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
