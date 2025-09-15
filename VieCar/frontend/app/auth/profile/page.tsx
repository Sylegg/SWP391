"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { User, Mail, Building, Shield, Edit, Save, X } from "lucide-react"
import Link from "next/link"

interface UserProfile {
  id: string
  name: string
  email: string
  role: string
  dealership: string
  phone?: string
  department?: string
  joinDate?: string
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState<UserProfile | null>(null)

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      const parsedUser = JSON.parse(userData)
      const fullUser = {
        ...parsedUser,
        phone: "+84 901 234 567",
        department: parsedUser.role === "dealer_manager" ? "Quản lý" : "Bán hàng",
        joinDate: "2023-01-15",
      }
      setUser(fullUser)
      setEditForm(fullUser)
    }
  }, [])

  const handleSave = () => {
    if (editForm) {
      setUser(editForm)
      localStorage.setItem("user", JSON.stringify(editForm))
      setIsEditing(false)
    }
  }

  const handleCancel = () => {
    setEditForm(user)
    setIsEditing(false)
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "dealer_staff":
        return "Nhân viên bán hàng"
      case "dealer_manager":
        return "Quản lý đại lý"
      case "admin":
        return "Quản trị viên"
      default:
        return role
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "dealer_staff":
        return "bg-blue-100 text-blue-800"
      case "dealer_manager":
        return "bg-green-100 text-green-800"
      case "admin":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card>
          <CardContent className="p-6">
            <p>Vui lòng đăng nhập để xem thông tin cá nhân</p>
            <Link href="/auth/login">
              <Button className="mt-4">Đăng nhập</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-foreground">Thông tin cá nhân</h1>
            <p className="text-muted-foreground">Quản lý thông tin tài khoản của bạn</p>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <User className="h-8 w-8 text-primary" />
                  <div>
                    <CardTitle>Hồ sơ người dùng</CardTitle>
                    <CardDescription>Thông tin chi tiết về tài khoản</CardDescription>
                  </div>
                </div>
                <div className="flex gap-2">
                  {isEditing ? (
                    <>
                      <Button size="sm" onClick={handleSave}>
                        <Save className="h-4 w-4 mr-2" />
                        Lưu
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleCancel}>
                        <X className="h-4 w-4 mr-2" />
                        Hủy
                      </Button>
                    </>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Chỉnh sửa
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Họ và tên</Label>
                  {isEditing ? (
                    <Input
                      id="name"
                      value={editForm?.name || ""}
                      onChange={(e) => setEditForm((prev) => (prev ? { ...prev, name: e.target.value } : null))}
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{user.name}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  {isEditing ? (
                    <Input
                      id="email"
                      type="email"
                      value={editForm?.email || ""}
                      onChange={(e) => setEditForm((prev) => (prev ? { ...prev, email: e.target.value } : null))}
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{user.email}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Số điện thoại</Label>
                  {isEditing ? (
                    <Input
                      id="phone"
                      value={editForm?.phone || ""}
                      onChange={(e) => setEditForm((prev) => (prev ? { ...prev, phone: e.target.value } : null))}
                    />
                  ) : (
                    <span>{user.phone}</span>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Đại lý</Label>
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span>{user.dealership}</span>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Vai trò</Label>
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <Badge className={getRoleColor(user.role)}>{getRoleLabel(user.role)}</Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Phòng ban</Label>
                  <span>{user.department}</span>
                </div>

                <div className="space-y-2">
                  <Label>Ngày gia nhập</Label>
                  <span>{user.joinDate}</span>
                </div>

                <div className="space-y-2">
                  <Label>ID nhân viên</Label>
                  <span>#{user.id.padStart(6, "0")}</span>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Quyền truy cập</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {user.role === "dealer_manager" || user.role === "admin" ? (
                    <>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm">Quản lý báo cáo</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm">Quản lý nhân viên</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm">Xem tất cả đơn hàng</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm">Quản lý khuyến mãi</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm">Tạo báo giá</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm">Quản lý khách hàng</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm">Xem danh mục xe</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm">Lập lịch lái thử</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="mt-6 flex justify-center">
            <Link href="/">
              <Button variant="outline">Quay lại trang chủ</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
