"use client";

import { ProtectedRoute } from "@/components/auth-guards";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Car, Users, Calendar, ShoppingCart, Truck, PlusCircle, Edit, FileText, MessageSquare, ArrowLeft, LogOut, UserCog } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function DealerStaffDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <ProtectedRoute allowedRoles={['Dealer Staff', 'Dealer Manager', 'Admin']}>
      <div className="dashboard-shell relative min-h-screen overflow-hidden bg-gradient-to-br from-white via-slate-50 to-slate-100 text-slate-900">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(79,70,229,0.12),_transparent_65%)]" />
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.12),_transparent_55%)]" />

        <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-xl">
          <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 text-sm font-medium text-slate-700">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button
                  variant="ghost"
                  size="sm"
                  className="border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Trang chủ
                </Button>
              </Link>
              <div>
                <h2 className="text-base font-semibold uppercase tracking-wide text-indigo-600">VieCar</h2>
                <p className="text-xs text-slate-500">Bảng điều khiển Nhân viên đại lý</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="border-slate-200 bg-gradient-to-r from-indigo-500/10 to-sky-500/10 text-indigo-600 shadow-[0_12px_30px_-18px_rgba(79,70,229,0.45)] transition hover:border-indigo-200 hover:from-indigo-500/20 hover:to-sky-500/20"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Đăng xuất
            </Button>
          </div>
        </header>

        <main className="relative z-10 w-full px-4 py-10">
          <div className="mx-auto w-full max-w-7xl space-y-10">
            <div className="space-y-3 rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_25px_45px_-30px_rgba(15,23,42,0.2)]">
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs uppercase tracking-[0.3em] text-indigo-600">
                <UserCog className="h-3.5 w-3.5 text-indigo-500" />
                Nhân viên đại lý
              </div>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-900 lg:text-4xl">Bảng điều khiển Nhân viên đại lý</h1>
              <p className="max-w-2xl text-sm text-slate-600">Xin chào, {user?.username}. Tạo yêu cầu và hỗ trợ khách hàng.</p>
            </div>

            <div className="space-y-10">

          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_25px_45px_-30px_rgba(15,23,42,0.2)] transition-all duration-300 hover:border-indigo-200 hover:shadow-[0_35px_60px_-15px_rgba(79,70,229,0.3)]">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-700">Khách hàng</CardTitle>
                <div className="rounded-full bg-gradient-to-br from-indigo-100 to-sky-100 p-2 text-indigo-600 group-hover:from-indigo-200 group-hover:to-sky-200">
                  <Users className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">24</div>
                <p className="text-xs text-slate-500 mt-1">Đang chăm sóc</p>
              </CardContent>
            </Card>

            <Card className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_25px_45px_-30px_rgba(15,23,42,0.2)] transition-all duration-300 hover:border-indigo-200 hover:shadow-[0_35px_60px_-15px_rgba(79,70,229,0.3)]">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-700">Doanh số</CardTitle>
                <div className="rounded-full bg-gradient-to-br from-indigo-100 to-sky-100 p-2 text-indigo-600 group-hover:from-indigo-200 group-hover:to-sky-200">
                  <ShoppingCart className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">₫280M</div>
                <p className="text-xs text-slate-500 mt-1">Tháng này</p>
              </CardContent>
            </Card>

            <Card className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_25px_45px_-30px_rgba(15,23,42,0.2)] transition-all duration-300 hover:border-indigo-200 hover:shadow-[0_35px_60px_-15px_rgba(79,70,229,0.3)]">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-700">Lái thử</CardTitle>
                <div className="rounded-full bg-gradient-to-br from-indigo-100 to-sky-100 p-2 text-indigo-600 group-hover:from-indigo-200 group-hover:to-sky-200">
                  <Calendar className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">15</div>
                <p className="text-xs text-slate-500 mt-1">Đã tạo tháng này</p>
              </CardContent>
            </Card>

            <Card className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_25px_45px_-30px_rgba(15,23,42,0.2)] transition-all duration-300 hover:border-indigo-200 hover:shadow-[0_35px_60px_-15px_rgba(79,70,229,0.3)]">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-700">Giao xe</CardTitle>
                <div className="rounded-full bg-gradient-to-br from-indigo-100 to-sky-100 p-2 text-indigo-600 group-hover:from-indigo-200 group-hover:to-sky-200">
                  <Truck className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">6</div>
                <p className="text-xs text-slate-500 mt-1">Đang theo dõi</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Tabs */}
          <Tabs defaultValue="vehicles" className="space-y-6">
            <TabsList className="grid w-full gap-2 rounded-2xl border border-slate-200 bg-white p-1 shadow-sm grid-cols-5">
              <TabsTrigger value="vehicles" className="rounded-xl border border-transparent px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500 transition data-[state=active]:border-indigo-200 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-600">Xe</TabsTrigger>
              <TabsTrigger value="customers" className="rounded-xl border border-transparent px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500 transition data-[state=active]:border-indigo-200 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-600">Khách hàng</TabsTrigger>
              <TabsTrigger value="sales" className="rounded-xl border border-transparent px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500 transition data-[state=active]:border-indigo-200 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-600">Bán hàng</TabsTrigger>
              <TabsTrigger value="test-drives" className="rounded-xl border border-transparent px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500 transition data-[state=active]:border-indigo-200 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-600">Lái thử</TabsTrigger>
              <TabsTrigger value="deliveries" className="rounded-xl border border-transparent px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500 transition data-[state=active]:border-indigo-200 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-600">Giao xe</TabsTrigger>
            </TabsList>

            {/* Vehicles Tab - Browse available vehicles */}
            <TabsContent value="vehicles" className="space-y-6">
              <Card className="rounded-3xl border border-slate-200 bg-white shadow-[0_25px_45px_-30px_rgba(15,23,42,0.2)]">
                <CardHeader>
                  <CardTitle className="flex items-center text-xl font-semibold text-slate-900">
                    <Car className="mr-2 h-5 w-5 text-indigo-600" />
                    Danh sách xe (Read-only)
                  </CardTitle>
                  <CardDescription className="text-slate-600">
                    Xem thông tin xe để tư vấn khách hàng
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {['VF3', 'VF5', 'VF8', 'VF9'].map((model, i) => (
                      <div key={i} className="p-3 border border-slate-200 rounded-2xl hover:border-indigo-200 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium text-slate-900">VinFast {model}</p>
                          <Badge variant="outline" className="border-indigo-200 bg-indigo-50 text-indigo-700">{(i + 1) * 5} xe sẵn sàng</Badge>
                        </div>
                        <p className="text-sm text-slate-600 mb-2">
                          Giá: ₫{(250 + i * 200)}M - {(i + 1) * 2} phiên bản
                        </p>
                        <Button size="sm" variant="outline" className="w-full border-slate-200 hover:border-indigo-300 hover:bg-indigo-50">
                          Xem chi tiết
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Customers Tab - Customer records */}
            <TabsContent value="customers" className="space-y-6">
              <Card className="rounded-3xl border border-slate-200 bg-white shadow-[0_25px_45px_-30px_rgba(15,23,42,0.2)]">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-xl font-semibold text-slate-900">
                    <span className="flex items-center">
                      <Users className="mr-2 h-5 w-5 text-indigo-600" />
                      Quản lý khách hàng
                    </span>
                    <Button size="sm" className="bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-700 hover:to-sky-700">
                      <PlusCircle className="w-4 h-4 mr-2" />
                      Thêm khách hàng
                    </Button>
                  </CardTitle>
                  <CardDescription className="text-slate-600">
                    Tạo, chỉnh sửa hồ sơ khách hàng, ghi nhận khiếu nại
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="space-y-2">
                      <p className="text-sm text-slate-600">Tổng khách hàng</p>
                      <p className="text-2xl font-bold text-slate-900">24</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-slate-600">Khách tiềm năng</p>
                      <p className="text-2xl font-bold text-blue-600">12</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-slate-600">Đã mua</p>
                      <p className="text-2xl font-bold text-green-600">8</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-slate-900">Khách hàng của tôi</h4>
                    {[
                      { name: 'Nguyễn Văn A', phone: '0912345678', status: 'Tiềm năng' },
                      { name: 'Trần Thị B', phone: '0923456789', status: 'Đã mua' },
                      { name: 'Lê Văn C', phone: '0934567890', status: 'Đang tư vấn' },
                      { name: 'Phạm Thị D', phone: '0945678901', status: 'Tiềm năng' }
                    ].map((customer, i) => (
                      <div key={i} className="flex items-center justify-between p-3 border border-slate-200 rounded-2xl hover:border-indigo-200 transition-colors">
                        <div className="flex-1">
                          <p className="font-medium text-slate-900">{customer.name}</p>
                          <p className="text-sm text-slate-600">{customer.phone}</p>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant="outline" className="border-indigo-200 bg-indigo-50 text-indigo-700">{customer.status}</Badge>
                          <Button variant="outline" size="sm" className="border-slate-200 hover:border-indigo-300 hover:bg-indigo-50">
                            <Edit className="w-4 h-4 mr-1" />
                            Sửa
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 p-4 border rounded-lg bg-yellow-50">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      Khiếu nại cần xử lý
                    </h4>
                    <p className="text-sm text-slate-600 mb-2">
                      2 khiếu nại chưa ghi nhận
                    </p>
                    <Button size="sm" variant="outline">Ghi nhận khiếu nại</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Sales Tab - Create quotes & orders */}
            <TabsContent value="sales" className="space-y-6">
              <Card className="rounded-3xl border border-slate-200 bg-white shadow-[0_25px_45px_-30px_rgba(15,23,42,0.2)]">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-xl font-semibold text-slate-900">
                    <span className="flex items-center">
                      <ShoppingCart className="mr-2 h-5 w-5 text-indigo-600" />
                      Bán hàng
                    </span>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="border-slate-200 hover:border-indigo-300 hover:bg-indigo-50">
                        <PlusCircle className="w-4 h-4 mr-2" />
                        Tạo báo giá
                      </Button>
                      <Button size="sm" className="bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-700 hover:to-sky-700">
                        <PlusCircle className="w-4 h-4 mr-2" />
                        Tạo đơn hàng
                      </Button>
                    </div>
                  </CardTitle>
                  <CardDescription className="text-slate-600">
                    Tạo báo giá, đơn hàng, tạo giao dịch thanh toán cho khách
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="space-y-2">
                      <p className="text-sm text-slate-600">Doanh số tháng</p>
                      <p className="text-2xl font-bold">₫280M</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-slate-600">Báo giá</p>
                      <p className="text-2xl font-bold text-blue-600">15</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-slate-600">Đơn hàng</p>
                      <p className="text-2xl font-bold text-green-600">8</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-slate-600">Thanh toán</p>
                      <p className="text-2xl font-bold">₫240M</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-3">📋 Báo giá của tôi</h4>
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center justify-between p-3 border rounded-lg mb-2">
                          <div className="flex-1">
                            <p className="font-medium text-slate-900">Báo giá #QT{2025000 + i}</p>
                            <p className="text-sm text-slate-600">
                              VF{i + 5} - Nguyễn Văn {String.fromCharCode(65 + i)} - ₫{(250 + i * 50)}M
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Badge variant="secondary">Chờ duyệt</Badge>
                            <Button variant="outline" size="sm">Chi tiết</Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3">🛒 Đơn hàng của tôi</h4>
                      {[1, 2].map((i) => (
                        <div key={i} className="flex items-center justify-between p-3 border rounded-lg mb-2">
                          <div className="flex-1">
                            <p className="font-medium text-slate-900">Đơn hàng #ORD{2025000 + i}</p>
                            <p className="text-sm text-slate-600">
                              VF{i + 6} - Trần Thị {String.fromCharCode(65 + i)} - ₫{(300 + i * 100)}M
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Badge variant="default">Đã xác nhận</Badge>
                            <Button variant="outline" size="sm">Chi tiết</Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3">💳 Giao dịch thanh toán</h4>
                      {[1, 2].map((i) => (
                        <div key={i} className="flex items-center justify-between p-3 border rounded-lg mb-2">
                          <div className="flex-1">
                            <p className="font-medium text-slate-900">Giao dịch #PAY{2025000 + i}</p>
                            <p className="text-sm text-slate-600">
                              Lê Văn {String.fromCharCode(65 + i)} - ₫{(80 + i * 40)}M
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Badge variant="secondary">Chờ duyệt</Badge>
                            <Button variant="outline" size="sm">Chi tiết</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 p-4 border rounded-lg bg-blue-50">
                    <p className="text-sm font-medium mb-2">💡 Lưu ý</p>
                    <p className="text-sm text-slate-600">
                      Tất cả báo giá, đơn hàng, thanh toán do Dealer Staff tạo đều cần Dealer Manager duyệt.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Test Drives Tab */}
            <TabsContent value="test-drives" className="space-y-6">
              <Card className="rounded-3xl border border-slate-200 bg-white shadow-[0_25px_45px_-30px_rgba(15,23,42,0.2)]">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center">
                      <Calendar className="mr-2 h-5 w-5" />
                      Quản lý lịch lái thử
                    </span>
                    <Button size="sm">
                      <PlusCircle className="w-4 h-4 mr-2" />
                      Tạo lịch mới
                    </Button>
                  </CardTitle>
                  <CardDescription>
                    Tạo, chỉnh sửa, xác nhận lịch lái thử cho khách hàng
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="space-y-2">
                      <p className="text-sm text-slate-600">Lịch tháng này</p>
                      <p className="text-2xl font-bold">15</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-slate-600">Hôm nay</p>
                      <p className="text-2xl font-bold text-blue-600">5</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-slate-600">Tuần tới</p>
                      <p className="text-2xl font-bold text-green-600">8</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold text-slate-900">Lịch hẹn hôm nay</h4>
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="border-l-4 border-l-blue-500 p-3 bg-blue-50 rounded-r-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-slate-900">Khách: Nguyễn Văn {String.fromCharCode(65 + i)}</p>
                            <p className="text-sm text-slate-600">
                              VF{i + 5} - {9 + i * 2}:00 AM - {['Chờ duyệt', 'Đã duyệt', 'Đã xác nhận'][i % 3]}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <Edit className="w-4 h-4 mr-1" />
                              Sửa
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6">
                    <h4 className="font-semibold mb-3">Lịch sắp tới</h4>
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center justify-between p-3 border rounded-lg mb-2">
                        <div className="flex-1">
                          <p className="font-medium text-slate-900">Trần Thị {String.fromCharCode(65 + i)}</p>
                          <p className="text-sm text-slate-600">
                            VF{i + 6} - {15 + i}/11/2025 - {10 + i}:00 AM
                          </p>
                        </div>
                        <Badge variant="outline">Đã xác nhận</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Deliveries Tab */}
            <TabsContent value="deliveries" className="space-y-6">
              <Card className="rounded-3xl border border-slate-200 bg-white shadow-[0_25px_45px_-30px_rgba(15,23,42,0.2)]">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Truck className="mr-2 h-5 w-5" />
                    Quản lý giao xe
                  </CardTitle>
                  <CardDescription>
                    Nhận xe, cập nhật trạng thái giao xe cho khách hàng
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="space-y-2">
                      <p className="text-sm text-slate-600">Chờ giao</p>
                      <p className="text-2xl font-bold">6</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-slate-600">Đang giao</p>
                      <p className="text-2xl font-bold text-blue-600">3</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-slate-600">Đã giao</p>
                      <p className="text-2xl font-bold text-green-600">12</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-slate-900">Xe cần giao</h4>
                    {[
                      { customer: 'Nguyễn Văn A', vehicle: 'VF8 Plus', date: '15/11/2025', status: 'ready' },
                      { customer: 'Trần Thị B', vehicle: 'VF5', date: '18/11/2025', status: 'in_transit' },
                      { customer: 'Lê Văn C', vehicle: 'VF9', date: '20/11/2025', status: 'ready' }
                    ].map((delivery, i) => (
                      <div key={i} className={`border-l-4 p-3 rounded-r-lg ${
                        delivery.status === 'in_transit' ? 'border-l-blue-500 bg-blue-50' : 'border-l-green-500 bg-green-50'
                      }`}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-slate-900">{delivery.customer}</p>
                            <p className="text-sm text-slate-600">
                              VinFast {delivery.vehicle} - Giao: {delivery.date}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Badge variant={delivery.status === 'in_transit' ? 'secondary' : 'default'}>
                              {delivery.status === 'in_transit' ? 'Đang giao' : 'Sẵn sàng'}
                            </Badge>
                            <Button variant="outline" size="sm">Cập nhật</Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">📊 Hiệu suất cá nhân</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-slate-600">Doanh số</p>
                        <p className="font-medium text-slate-900">₫280M</p>
                      </div>
                      <div>
                        <p className="text-slate-600">Xe đã giao</p>
                        <p className="font-medium text-slate-900">12 xe</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
