"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Calculator, Save, Send } from "lucide-react"
import Link from "next/link"
import { mockCustomers, mockVehicles, mockPromotions } from "@/lib/mock-data"

export default function NewQuotePage() {
  const [selectedCustomer, setSelectedCustomer] = useState("")
  const [selectedVehicle, setSelectedVehicle] = useState("")
  const [selectedPromotions, setSelectedPromotions] = useState<string[]>([])
  const [customDiscount, setCustomDiscount] = useState(0)
  const [notes, setNotes] = useState("")

  const vehicle = mockVehicles.find((v) => v.id === selectedVehicle)
  const customer = mockCustomers.find((c) => c.id === selectedCustomer)

  const basePrice = vehicle?.price || 0
  const promotionDiscount = selectedPromotions.reduce((total, promoId) => {
    const promo = mockPromotions.find((p) => p.id === promoId)
    if (promo && promo.type === "discount") {
      return total + (basePrice * promo.value) / 100
    }
    return total
  }, 0)

  const totalDiscount = promotionDiscount + customDiscount
  const subtotal = basePrice - totalDiscount
  const tax = subtotal * 0.1 // 10% tax
  const totalPrice = subtotal + tax

  const handleSave = (status: "draft" | "sent") => {
    // Here you would save the quote to your database
    console.log("Saving quote with status:", status)
    console.log({
      customerId: selectedCustomer,
      vehicleId: selectedVehicle,
      basePrice,
      totalDiscount,
      tax,
      totalPrice,
      status,
      notes,
    })
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/sales/quotes">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Về danh sách
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <Calculator className="h-6 w-6 text-primary" />
              <div>
                <h1 className="text-xl font-bold">Tạo báo giá mới</h1>
                <p className="text-sm text-muted-foreground">Tạo báo giá cho khách hàng</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Quote Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Thông tin khách hàng</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="customer">Chọn khách hàng</Label>
                  <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn khách hàng..." />
                    </SelectTrigger>
                    <SelectContent>
                      {mockCustomers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.name} - {customer.email}
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
                        <span className="text-muted-foreground">Tên:</span>
                        <p className="font-medium">{customer.name}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Email:</span>
                        <p className="font-medium">{customer.email}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Điện thoại:</span>
                        <p className="font-medium">{customer.phone}</p>
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
                <CardTitle>Chọn xe</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="vehicle">Chọn mẫu xe</Label>
                  <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn xe..." />
                    </SelectTrigger>
                    <SelectContent>
                      {mockVehicles.map((vehicle) => (
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
                        <p className="text-lg font-bold text-primary">${vehicle.price.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Promotions and Discounts */}
            <Card>
              <CardHeader>
                <CardTitle>Khuyến mãi và giảm giá</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Chương trình khuyến mãi</Label>
                  {mockPromotions
                    .filter((p) => p.isActive)
                    .map((promotion) => (
                      <div key={promotion.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={promotion.id}
                          checked={selectedPromotions.includes(promotion.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedPromotions([...selectedPromotions, promotion.id])
                            } else {
                              setSelectedPromotions(selectedPromotions.filter((id) => id !== promotion.id))
                            }
                          }}
                          className="rounded"
                        />
                        <label htmlFor={promotion.id} className="text-sm">
                          {promotion.title} - {promotion.value}% giảm giá
                        </label>
                      </div>
                    ))}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customDiscount">Giảm giá thêm ($)</Label>
                  <Input
                    id="customDiscount"
                    type="number"
                    value={customDiscount}
                    onChange={(e) => setCustomDiscount(Number(e.target.value))}
                    placeholder="0"
                  />
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
                  placeholder="Ghi chú thêm cho báo giá..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                />
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Quote Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Tóm tắt báo giá</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {vehicle ? (
                  <>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Giá niêm yết:</span>
                        <span className="font-medium">${basePrice.toLocaleString()}</span>
                      </div>

                      {totalDiscount > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>Tổng giảm giá:</span>
                          <span className="font-medium">-${totalDiscount.toLocaleString()}</span>
                        </div>
                      )}

                      <div className="flex justify-between">
                        <span>Tiền trước thuế:</span>
                        <span className="font-medium">${subtotal.toLocaleString()}</span>
                      </div>

                      <div className="flex justify-between">
                        <span>Thuế (10%):</span>
                        <span className="font-medium">${tax.toLocaleString()}</span>
                      </div>

                      <hr />

                      <div className="flex justify-between text-lg font-bold">
                        <span>Tổng cộng:</span>
                        <span className="text-primary">${totalPrice.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="space-y-3 pt-4">
                      <Button
                        className="w-full"
                        onClick={() => handleSave("sent")}
                        disabled={!selectedCustomer || !selectedVehicle}
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Gửi báo giá
                      </Button>

                      <Button
                        variant="outline"
                        className="w-full bg-transparent"
                        onClick={() => handleSave("draft")}
                        disabled={!selectedCustomer || !selectedVehicle}
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Lưu nháp
                      </Button>
                    </div>
                  </>
                ) : (
                  <p className="text-muted-foreground text-center py-8">Chọn xe để xem tóm tắt báo giá</p>
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
                          totalPrice >= customer.preferences.budget.min && totalPrice <= customer.preferences.budget.max
                            ? "text-green-600 font-medium"
                            : "text-red-600 font-medium"
                        }
                      >
                        {totalPrice >= customer.preferences.budget.min && totalPrice <= customer.preferences.budget.max
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
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
