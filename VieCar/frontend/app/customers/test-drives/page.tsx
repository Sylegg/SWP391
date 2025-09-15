"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Search, Plus, Calendar, Car, Clock, CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"
import { mockTestDrives, mockCustomers, mockVehicles } from "@/lib/mock-data"

export default function TestDrivesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [dateFilter, setDateFilter] = useState<string>("all")

  const filteredTestDrives = mockTestDrives.filter((testDrive) => {
    const customer = mockCustomers.find((c) => c.id === testDrive.customerId)
    const vehicle = mockVehicles.find((v) => v.id === testDrive.vehicleId)

    const matchesSearch =
      customer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle?.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle?.model.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || testDrive.status === statusFilter

    let matchesDate = true
    if (dateFilter !== "all") {
      const testDriveDate = new Date(testDrive.scheduledDate)
      const today = new Date()
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      const nextWeek = new Date(today)
      nextWeek.setDate(nextWeek.getDate() + 7)

      switch (dateFilter) {
        case "today":
          matchesDate = testDriveDate.toDateString() === today.toDateString()
          break
        case "tomorrow":
          matchesDate = testDriveDate.toDateString() === tomorrow.toDateString()
          break
        case "week":
          matchesDate = testDriveDate >= today && testDriveDate <= nextWeek
          break
      }
    }

    return matchesSearch && matchesStatus && matchesDate
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "scheduled":
        return (
          <Badge variant="default" className="bg-blue-600">
            <Clock className="h-3 w-3 mr-1" />
            Đã lên lịch
          </Badge>
        )
      case "completed":
        return (
          <Badge variant="default" className="bg-green-600">
            <CheckCircle className="h-3 w-3 mr-1" />
            Hoàn thành
          </Badge>
        )
      case "cancelled":
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Đã hủy
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/customers">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Về khách hàng
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <Calendar className="h-6 w-6 text-primary" />
                <div>
                  <h1 className="text-xl font-bold">Quản lý lịch lái thử</h1>
                  <p className="text-sm text-muted-foreground">Đặt lịch và theo dõi lái thử xe</p>
                </div>
              </div>
            </div>
            <Link href="/customers/test-drives/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Đặt lịch lái thử
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Hôm nay</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">Cuộc hẹn lái thử</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tuần này</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">Lịch hẹn đã đặt</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Hoàn thành</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">Lái thử thành công</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tỷ lệ chuyển đổi</CardTitle>
              <Car className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">65%</div>
              <p className="text-xs text-muted-foreground">Từ lái thử thành mua xe</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Bộ lọc</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Tìm kiếm</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Tìm theo khách hàng, xe..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Trạng thái</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả trạng thái</SelectItem>
                    <SelectItem value="scheduled">Đã lên lịch</SelectItem>
                    <SelectItem value="completed">Hoàn thành</SelectItem>
                    <SelectItem value="cancelled">Đã hủy</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Thời gian</label>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn thời gian" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả thời gian</SelectItem>
                    <SelectItem value="today">Hôm nay</SelectItem>
                    <SelectItem value="tomorrow">Ngày mai</SelectItem>
                    <SelectItem value="week">Tuần này</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Test Drives Table */}
        <Card>
          <CardHeader>
            <CardTitle>Danh sách lịch lái thử</CardTitle>
            <CardDescription>Tìm thấy {filteredTestDrives.length} lịch hẹn</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Khách hàng</TableHead>
                  <TableHead>Xe</TableHead>
                  <TableHead>Thời gian</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Đánh giá</TableHead>
                  <TableHead>Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTestDrives.map((testDrive) => {
                  const customer = mockCustomers.find((c) => c.id === testDrive.customerId)
                  const vehicle = mockVehicles.find((v) => v.id === testDrive.vehicleId)

                  return (
                    <TableRow key={testDrive.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{customer?.name || "N/A"}</p>
                          <p className="text-sm text-muted-foreground">{customer?.phone}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <img
                            src={vehicle?.images[0] || "/placeholder.svg"}
                            alt={`${vehicle?.brand} ${vehicle?.model}`}
                            className="w-12 h-8 rounded object-cover"
                          />
                          <div>
                            <p className="font-medium">
                              {vehicle?.brand} {vehicle?.model}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {vehicle?.year} • {vehicle?.variant}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{new Date(testDrive.scheduledDate).toLocaleDateString("vi-VN")}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(testDrive.scheduledDate).toLocaleTimeString("vi-VN", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(testDrive.status)}</TableCell>
                      <TableCell>
                        {testDrive.rating ? (
                          <div>
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <span
                                  key={i}
                                  className={`text-sm ${i < testDrive.rating! ? "text-yellow-400" : "text-gray-300"}`}
                                >
                                  ★
                                </span>
                              ))}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {testDrive.feedback?.substring(0, 30)}...
                            </p>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">Chưa đánh giá</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Link href={`/customers/test-drives/${testDrive.id}`}>
                            <Button size="sm" variant="outline">
                              Chi tiết
                            </Button>
                          </Link>
                          {testDrive.status === "scheduled" && (
                            <>
                              <Button size="sm" variant="outline">
                                Hoàn thành
                              </Button>
                              <Button size="sm" variant="destructive">
                                Hủy
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>

            {filteredTestDrives.length === 0 && (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Không có lịch hẹn nào</h3>
                <p className="text-muted-foreground mb-4">Chưa có lịch lái thử nào phù hợp với bộ lọc</p>
                <Link href="/customers/test-drives/new">
                  <Button>Đặt lịch lái thử mới</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
