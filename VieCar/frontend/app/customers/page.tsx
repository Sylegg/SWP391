"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Search, Plus, Eye, Edit, Phone, Mail, Calendar, Users } from "lucide-react"
import Link from "next/link"
import { mockCustomers } from "@/lib/mock-data"

export default function CustomersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [budgetFilter, setBudgetFilter] = useState<string>("all")

  const filteredCustomers = mockCustomers.filter((customer) => {
    const matchesSearch =
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm)

    let matchesBudget = true
    if (budgetFilter !== "all") {
      const [min, max] = budgetFilter.split("-").map(Number)
      matchesBudget = customer.preferences.budget.max >= min && (max ? customer.preferences.budget.min <= max : true)
    }

    return matchesSearch && matchesBudget
  })

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Về trang chủ
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <Users className="h-6 w-6 text-primary" />
                <div>
                  <h1 className="text-xl font-bold">Quản lý khách hàng</h1>
                  <p className="text-sm text-muted-foreground">Hồ sơ khách hàng và lịch hẹn</p>
                </div>
              </div>
            </div>
            <Link href="/customers/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Thêm khách hàng
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
              <CardTitle className="text-sm font-medium">Tổng khách hàng</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockCustomers.length}</div>
              <p className="text-xs text-muted-foreground">+12 khách hàng mới tháng này</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Lịch hẹn hôm nay</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">Cuộc hẹn lái thử</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Khách hàng tiềm năng</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">Đang quan tâm mua xe</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Phản hồi chờ xử lý</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2</div>
              <p className="text-xs text-muted-foreground">Khiếu nại cần xử lý</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Calendar className="h-8 w-8 text-blue-600" />
                <div>
                  <CardTitle>Lịch lái thử</CardTitle>
                  <CardDescription>Quản lý lịch hẹn lái thử xe</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Link href="/customers/test-drives/new">
                  <Button className="w-full justify-start">Đặt lịch lái thử</Button>
                </Link>
                <Link href="/customers/test-drives">
                  <Button className="w-full justify-start bg-transparent" variant="outline">
                    Xem lịch hẹn
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Mail className="h-8 w-8 text-green-600" />
                <div>
                  <CardTitle>Phản hồi & Khiếu nại</CardTitle>
                  <CardDescription>Xử lý phản hồi khách hàng</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Link href="/customers/feedback">
                  <Button className="w-full justify-start">Xem phản hồi</Button>
                </Link>
                <Link href="/customers/complaints">
                  <Button className="w-full justify-start bg-transparent" variant="outline">
                    Xử lý khiếu nại
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Phone className="h-8 w-8 text-purple-600" />
                <div>
                  <CardTitle>Liên hệ khách hàng</CardTitle>
                  <CardDescription>Gọi điện và gửi email</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button className="w-full justify-start">Gọi khách hàng</Button>
                <Button className="w-full justify-start bg-transparent" variant="outline">
                  Gửi email
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Bộ lọc tìm kiếm</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Tìm kiếm</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Tìm theo tên, email, số điện thoại..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Ngân sách</label>
                <Select value={budgetFilter} onValueChange={setBudgetFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn khoảng ngân sách" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả ngân sách</SelectItem>
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

        {/* Customers Table */}
        <Card>
          <CardHeader>
            <CardTitle>Danh sách khách hàng</CardTitle>
            <CardDescription>Tìm thấy {filteredCustomers.length} khách hàng</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Khách hàng</TableHead>
                  <TableHead>Liên hệ</TableHead>
                  <TableHead>Ngân sách</TableHead>
                  <TableHead>Sở thích</TableHead>
                  <TableHead>Lịch sử mua hàng</TableHead>
                  <TableHead>Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{customer.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Tham gia: {new Date(customer.createdAt).toLocaleDateString("vi-VN")}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-3 w-3" />
                          <span>{customer.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-3 w-3" />
                          <span>{customer.phone}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          ${customer.preferences.budget.min.toLocaleString()} - $
                          {customer.preferences.budget.max.toLocaleString()}
                        </p>
                        <p className="text-sm text-muted-foreground">Ngân sách mong muốn</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex flex-wrap gap-1">
                          {customer.preferences.preferredBrands.slice(0, 2).map((brand) => (
                            <Badge key={brand} variant="secondary" className="text-xs">
                              {brand}
                            </Badge>
                          ))}
                          {customer.preferences.preferredBrands.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{customer.preferences.preferredBrands.length - 2}
                            </Badge>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {customer.preferences.vehicleType.slice(0, 2).map((type) => (
                            <Badge key={type} variant="outline" className="text-xs">
                              {type}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{customer.purchaseHistory.length} xe</p>
                        <p className="text-sm text-muted-foreground">{customer.testDrives.length} lần lái thử</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Link href={`/customers/${customer.id}`}>
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/customers/${customer.id}/edit`}>
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button size="sm" variant="outline">
                          <Phone className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Mail className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {filteredCustomers.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Không tìm thấy khách hàng nào phù hợp</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
