"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Search, Plus, Eye, Edit, Send } from "lucide-react"
import Link from "next/link"
import { mockQuotes, mockCustomers, mockVehicles } from "@/lib/mock-data"

export default function QuotesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const filteredQuotes = mockQuotes.filter((quote) => {
    const customer = mockCustomers.find((c) => c.id === quote.customerId)
    const vehicle = mockVehicles.find((v) => v.id === quote.vehicleId)

    const matchesSearch =
      quote.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle?.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle?.model.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || quote.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return <Badge variant="outline">Nháp</Badge>
      case "sent":
        return <Badge variant="default">Đã gửi</Badge>
      case "accepted":
        return (
          <Badge variant="default" className="bg-green-600">
            Đã chấp nhận
          </Badge>
        )
      case "expired":
        return <Badge variant="destructive">Hết hạn</Badge>
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
              <Link href="/sales">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Về bán hàng
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold">Quản lý báo giá</h1>
                <p className="text-sm text-muted-foreground">Tạo và theo dõi báo giá cho khách hàng</p>
              </div>
            </div>
            <Link href="/sales/quotes/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Tạo báo giá mới
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Bộ lọc</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Tìm kiếm</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Tìm theo mã báo giá, khách hàng, xe..."
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
                    <SelectItem value="draft">Nháp</SelectItem>
                    <SelectItem value="sent">Đã gửi</SelectItem>
                    <SelectItem value="accepted">Đã chấp nhận</SelectItem>
                    <SelectItem value="expired">Hết hạn</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quotes Table */}
        <Card>
          <CardHeader>
            <CardTitle>Danh sách báo giá</CardTitle>
            <CardDescription>Tìm thấy {filteredQuotes.length} báo giá</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã báo giá</TableHead>
                  <TableHead>Khách hàng</TableHead>
                  <TableHead>Xe</TableHead>
                  <TableHead>Tổng tiền</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Hạn báo giá</TableHead>
                  <TableHead>Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredQuotes.map((quote) => {
                  const customer = mockCustomers.find((c) => c.id === quote.customerId)
                  const vehicle = mockVehicles.find((v) => v.id === quote.vehicleId)

                  return (
                    <TableRow key={quote.id}>
                      <TableCell className="font-medium">#{quote.id}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{customer?.name || "N/A"}</p>
                          <p className="text-sm text-muted-foreground">{customer?.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {vehicle?.brand} {vehicle?.model}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {vehicle?.year} • {vehicle?.variant}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="font-bold">${quote.totalPrice.toLocaleString()}</TableCell>
                      <TableCell>{getStatusBadge(quote.status)}</TableCell>
                      <TableCell>
                        <div>
                          <p>{new Date(quote.validUntil).toLocaleDateString("vi-VN")}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(quote.validUntil) > new Date() ? "Còn hiệu lực" : "Đã hết hạn"}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Link href={`/sales/quotes/${quote.id}`}>
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link href={`/sales/quotes/${quote.id}/edit`}>
                            <Button size="sm" variant="outline">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          {quote.status === "draft" && (
                            <Button size="sm">
                              <Send className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>

            {filteredQuotes.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Không tìm thấy báo giá nào phù hợp</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
