"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Search, Plus, Eye, Edit, ToggleLeft, ToggleRight } from "lucide-react"
import Link from "next/link"
import { mockPromotions } from "@/lib/mock-data"

export default function PromotionsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const filteredPromotions = mockPromotions.filter((promotion) => {
    const matchesSearch =
      promotion.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      promotion.description.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && promotion.isActive) ||
      (statusFilter === "inactive" && !promotion.isActive)

    return matchesSearch && matchesStatus
  })

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "discount":
        return <Badge variant="default">Giảm giá</Badge>
      case "cashback":
        return <Badge variant="secondary">Hoàn tiền</Badge>
      case "trade-in":
        return <Badge variant="outline">Đổi xe cũ</Badge>
      case "financing":
        return (
          <Badge variant="default" className="bg-blue-600">
            Hỗ trợ vay
          </Badge>
        )
      default:
        return <Badge variant="outline">{type}</Badge>
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
                <h1 className="text-xl font-bold">Quản lý khuyến mãi</h1>
                <p className="text-sm text-muted-foreground">Tạo và quản lý chương trình khuyến mãi</p>
              </div>
            </div>
            <Link href="/sales/promotions/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Tạo khuyến mãi mới
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
                    placeholder="Tìm theo tên, mô tả khuyến mãi..."
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
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="active">Đang hoạt động</SelectItem>
                    <SelectItem value="inactive">Không hoạt động</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Promotions Table */}
        <Card>
          <CardHeader>
            <CardTitle>Danh sách khuyến mãi</CardTitle>
            <CardDescription>Tìm thấy {filteredPromotions.length} chương trình khuyến mãi</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên chương trình</TableHead>
                  <TableHead>Loại</TableHead>
                  <TableHead>Giá trị</TableHead>
                  <TableHead>Thời gian</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPromotions.map((promotion) => (
                  <TableRow key={promotion.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{promotion.title}</p>
                        <p className="text-sm text-muted-foreground">{promotion.description}</p>
                      </div>
                    </TableCell>
                    <TableCell>{getTypeBadge(promotion.type)}</TableCell>
                    <TableCell className="font-bold">
                      {promotion.type === "discount" ? `${promotion.value}%` : `$${promotion.value.toLocaleString()}`}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">
                          {new Date(promotion.startDate).toLocaleDateString("vi-VN")} -{" "}
                          {new Date(promotion.endDate).toLocaleDateString("vi-VN")}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(promotion.endDate) > new Date() ? "Còn hiệu lực" : "Đã hết hạn"}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {promotion.isActive ? (
                          <>
                            <ToggleRight className="h-5 w-5 text-green-600" />
                            <Badge variant="default" className="bg-green-600">
                              Hoạt động
                            </Badge>
                          </>
                        ) : (
                          <>
                            <ToggleLeft className="h-5 w-5 text-gray-400" />
                            <Badge variant="outline">Tạm dừng</Badge>
                          </>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Link href={`/sales/promotions/${promotion.id}`}>
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/sales/promotions/${promotion.id}/edit`}>
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button size="sm" variant={promotion.isActive ? "destructive" : "default"}>
                          {promotion.isActive ? "Tạm dừng" : "Kích hoạt"}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {filteredPromotions.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Không tìm thấy chương trình khuyến mãi nào phù hợp</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
