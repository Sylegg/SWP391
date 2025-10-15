"use client";

import { ProtectedRoute } from "@/components/auth-guards";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Car, PlusCircle, Calendar, CreditCard, Truck, FileText, Building, BarChart, ArrowLeft, LogOut, Settings } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function EvmStaffDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <ProtectedRoute allowedRoles={['EVM Staff', 'Admin']}>
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
                <p className="text-xs text-slate-500">Bảng điều khiển EVM Staff</p>
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
                <Settings className="h-3.5 w-3.5 text-indigo-500" />
                EVM Staff
              </div>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-900 lg:text-4xl">Bảng điều khiển EVM Staff</h1>
              <p className="max-w-2xl text-sm text-slate-600">Xin chào, {user?.username}. Quản lý xe, phân bổ và hỗ trợ đại lý.</p>
            </div>

            <div className="space-y-10">

          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_25px_45px_-30px_rgba(15,23,42,0.2)] transition-all duration-300 hover:border-indigo-200 hover:shadow-[0_35px_60px_-15px_rgba(79,70,229,0.3)]">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-700">Tổng xe quản lý</CardTitle>
                <div className="rounded-full bg-gradient-to-br from-indigo-100 to-sky-100 p-2 text-indigo-600 group-hover:from-indigo-200 group-hover:to-sky-200">
                  <Car className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">89</div>
                <p className="text-xs text-slate-500 mt-1">Tất cả các dòng xe</p>
              </CardContent>
            </Card>

            <Card className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_25px_45px_-30px_rgba(15,23,42,0.2)] transition-all duration-300 hover:border-indigo-200 hover:shadow-[0_35px_60px_-15px_rgba(79,70,229,0.3)]">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-700">Đại lý</CardTitle>
                <div className="rounded-full bg-gradient-to-br from-indigo-100 to-sky-100 p-2 text-indigo-600 group-hover:from-indigo-200 group-hover:to-sky-200">
                  <Building className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">24</div>
                <p className="text-xs text-slate-500 mt-1">Trên toàn quốc</p>
              </CardContent>
            </Card>

            <Card className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_25px_45px_-30px_rgba(15,23,42,0.2)] transition-all duration-300 hover:border-indigo-200 hover:shadow-[0_35px_60px_-15px_rgba(79,70,229,0.3)]">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-700">Lịch lái thử</CardTitle>
                <div className="rounded-full bg-gradient-to-br from-indigo-100 to-sky-100 p-2 text-indigo-600 group-hover:from-indigo-200 group-hover:to-sky-200">
                  <Calendar className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">156</div>
                <p className="text-xs text-slate-500 mt-1">Tháng này</p>
              </CardContent>
            </Card>

            <Card className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_25px_45px_-30px_rgba(15,23,42,0.2)] transition-all duration-300 hover:border-indigo-200 hover:shadow-[0_35px_60px_-15px_rgba(79,70,229,0.3)]">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-700">Phân phối</CardTitle>
                <div className="rounded-full bg-gradient-to-br from-indigo-100 to-sky-100 p-2 text-indigo-600 group-hover:from-indigo-200 group-hover:to-sky-200">
                  <Truck className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">89</div>
                <p className="text-xs text-slate-500 mt-1">Đang vận chuyển</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Tabs */}
          <Tabs defaultValue="vehicles" className="space-y-6">
            <TabsList className="grid w-full gap-2 rounded-2xl border border-slate-200 bg-white p-1 shadow-sm grid-cols-6">
              <TabsTrigger value="vehicles" className="rounded-xl border border-transparent px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500 transition data-[state=active]:border-indigo-200 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-600">Quản lý xe</TabsTrigger>
              <TabsTrigger value="dealers" className="rounded-xl border border-transparent px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500 transition data-[state=active]:border-indigo-200 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-600">Đại lý</TabsTrigger>
              <TabsTrigger value="distribution" className="rounded-xl border border-transparent px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500 transition data-[state=active]:border-indigo-200 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-600">Phân phối</TabsTrigger>
              <TabsTrigger value="pricing" className="rounded-xl border border-transparent px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500 transition data-[state=active]:border-indigo-200 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-600">Giá & KM</TabsTrigger>
              <TabsTrigger value="reports" className="rounded-xl border border-transparent px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500 transition data-[state=active]:border-indigo-200 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-600">Báo cáo</TabsTrigger>
              <TabsTrigger value="ai" className="rounded-xl border border-transparent px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500 transition data-[state=active]:border-indigo-200 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-600">AI Dự báo</TabsTrigger>
            </TabsList>

            {/* Vehicles Tab */}
            <TabsContent value="vehicles" className="space-y-6">
              <Card className="rounded-3xl border border-slate-200 bg-white shadow-[0_25px_45px_-30px_rgba(15,23,42,0.2)]">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-xl font-semibold text-slate-900">
                    <span className="flex items-center">
                      <Car className="mr-2 h-5 w-5 text-indigo-600" />
                      Quản lý danh mục xe
                    </span>
                    <Button size="sm" className="bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-700 hover:to-sky-700">
                      <PlusCircle className="w-4 h-4 mr-2" />
                      Thêm xe mới
                    </Button>
                  </CardTitle>
                  <CardDescription className="text-slate-600">
                    Quản lý danh mục xe (mẫu, phiên bản, màu sắc) - EVM vận hành
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="space-y-2">
                      <p className="text-sm text-slate-600">Tổng mẫu xe</p>
                      <p className="text-2xl font-bold">12</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-slate-600">Tồn kho tổng</p>
                      <p className="text-2xl font-bold">1,234</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-slate-600">Đã phân phối</p>
                      <p className="text-2xl font-bold text-green-600">856</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-slate-600">Khả dụng</p>
                      <p className="text-2xl font-bold text-blue-600">378</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-slate-900">Danh mục xe</h4>
                    {['VF3', 'VF5', 'VF6', 'VF7', 'VF8', 'VF9'].map((model, i) => (
                      <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-slate-900">VinFast {model}</p>
                          <p className="text-sm text-slate-600">
                            {3 + i} phiên bản - {5 + i} màu sắc - {15 + i * 5}% tồn kho
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">Chỉnh sửa</Button>
                          <Button variant="outline" size="sm">Phiên bản</Button>
                          <Button variant="ghost" size="sm">Màu sắc</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Dealers Tab */}
            <TabsContent value="dealers" className="space-y-6">
              <Card className="rounded-3xl border border-slate-200 bg-white shadow-[0_25px_45px_-30px_rgba(15,23,42,0.2)]">
                <CardHeader>
                  <CardTitle className="flex items-center text-xl font-semibold text-slate-900">
                    <Building className="mr-2 h-5 w-5 text-indigo-600" />
                    Quản lý đại lý
                  </CardTitle>
                  <CardDescription className="text-slate-600">
                    Quản lý hợp đồng, chỉ tiêu doanh số, công nợ đại lý
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="space-y-2">
                      <p className="text-sm text-slate-600">Tổng đại lý</p>
                      <p className="text-2xl font-bold">24</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-slate-600">Hoạt động</p>
                      <p className="text-2xl font-bold text-green-600">22</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-slate-600">Công nợ</p>
                      <p className="text-2xl font-bold text-yellow-600">₫450M</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-slate-600">Chỉ tiêu tháng</p>
                      <p className="text-2xl font-bold">₫12B</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-slate-900">Hợp đồng & chỉ tiêu</h4>
                    {[
                      { name: 'Hà Nội', target: '₫3B', achieved: 85, debt: '₫120M' },
                      { name: 'TP.HCM', target: '₫5B', achieved: 92, debt: '₫80M' },
                      { name: 'Đà Nẵng', target: '₫1.5B', achieved: 78, debt: '₫150M' },
                      { name: 'Cần Thơ', target: '₫800M', achieved: 65, debt: '₫100M' }
                    ].map((dealer, i) => (
                      <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-slate-900">Đại lý {dealer.name}</p>
                          <p className="text-sm text-slate-600">
                            Chỉ tiêu: {dealer.target} - Công nợ: {dealer.debt}
                          </p>
                        </div>
                        <div className="flex gap-2 items-center">
                          <Badge variant={dealer.achieved >= 80 ? "default" : "secondary"}>
                            {dealer.achieved}%
                          </Badge>
                          <Button variant="outline" size="sm">Hợp đồng</Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 p-4 border rounded-lg bg-yellow-50">
                    <p className="text-sm font-medium mb-2">⚠️ Lưu ý</p>
                    <p className="text-sm text-slate-600">
                      EVM Staff không có quyền tạo tài khoản đại lý. Chỉ Admin mới có quyền này.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Distribution Tab */}
            <TabsContent value="distribution" className="space-y-6">
              <Card className="rounded-3xl border border-slate-200 bg-white shadow-[0_25px_45px_-30px_rgba(15,23,42,0.2)]">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-xl font-semibold text-slate-900">
                    <span className="flex items-center">
                      <Truck className="mr-2 h-5 w-5 text-indigo-600" />
                      Quản lý tồn kho & điều phối
                    </span>
                    <Button size="sm" className="bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-700 hover:to-sky-700">Tạo kế hoạch phân phối</Button>
                  </CardTitle>
                  <CardDescription className="text-slate-600">
                    Quản lý tồn kho tổng, điều phối xe cho đại lý
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="space-y-2">
                      <p className="text-sm text-slate-600">Tổng tồn kho</p>
                      <p className="text-2xl font-bold">1,234</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-slate-600">Đã phân bổ</p>
                      <p className="text-2xl font-bold text-blue-600">856</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-slate-600">Đang vận chuyển</p>
                      <p className="text-2xl font-bold text-yellow-600">89</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-slate-600">Sẵn sàng</p>
                      <p className="text-2xl font-bold text-green-600">289</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-slate-900">Điều phối theo đại lý</h4>
                    {['Hà Nội', 'TP.HCM', 'Đà Nẵng', 'Cần Thơ'].map((city, i) => (
                      <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-slate-900">Đại lý {city}</p>
                          <p className="text-sm text-slate-600">
                            Hiện có: {(i + 1) * 45} xe - Đang chuyển: {(i + 1) * 5} xe
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">Phân phối</Button>
                          <Button variant="ghost" size="sm">Lịch sử</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Pricing & Promotions Tab */}
            <TabsContent value="pricing" className="space-y-6">
              <Card className="rounded-3xl border border-slate-200 bg-white shadow-[0_25px_45px_-30px_rgba(15,23,42,0.2)]">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-xl font-semibold text-slate-900">
                    <span className="flex items-center">
                      <CreditCard className="mr-2 h-5 w-5" />
                      Quản lý giá sỉ & khuyến mãi
                    </span>
                    <Button size="sm" className="bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-700 hover:to-sky-700">Tạo chương trình KM</Button>
                  </CardTitle>
                  <CardDescription className="text-slate-600">
                    Quản lý giá sỉ, chiết khấu, khuyến mãi theo đại lý
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-3">Bảng giá sỉ</h4>
                      {['VF3', 'VF5', 'VF8'].map((model, i) => (
                        <div key={i} className="flex items-center justify-between p-3 border rounded-lg mb-2">
                          <div className="flex-1">
                            <p className="font-medium text-slate-900">VinFast {model}</p>
                            <p className="text-sm text-slate-600">
                              Giá sỉ: ₫{(250 + i * 200)}M
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Badge variant="outline">{5 + i}% chiết khấu</Badge>
                            <Button variant="outline" size="sm">Cập nhật</Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3">Chương trình khuyến mãi</h4>
                      {['Khuyến mãi Q4', 'Ưu đãi cuối năm', 'Flash Sale'].map((promo, i) => (
                        <div key={i} className="flex items-center justify-between p-3 border rounded-lg mb-2">
                          <div className="flex-1">
                            <p className="font-medium text-slate-900">{promo}</p>
                            <p className="text-sm text-slate-600">
                              Áp dụng cho {(i + 1) * 4} đại lý - Giảm {10 + i * 5}%
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Badge variant="default">Đang chạy</Badge>
                            <Button variant="outline" size="sm">Chi tiết</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Reports Tab */}
            <TabsContent value="reports" className="space-y-6">
              <Card className="rounded-3xl border border-slate-200 bg-white shadow-[0_25px_45px_-30px_rgba(15,23,42,0.2)]">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-xl font-semibold text-slate-900">
                    <span className="flex items-center">
                      <BarChart className="mr-2 h-5 w-5 text-indigo-600" />
                      Báo cáo & phân tích
                    </span>
                    <Button size="sm" className="bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-700 hover:to-sky-700">
                      <FileText className="mr-2 h-4 w-4" />
                      Xuất báo cáo
                    </Button>
                  </CardTitle>
                  <CardDescription className="text-slate-600">
                    Doanh số theo khu vực/đại lý, tồn kho & tốc độ tiêu thụ
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="space-y-2">
                      <p className="text-sm text-slate-600">Doanh thu tháng</p>
                      <p className="text-2xl font-bold">₫18.5B</p>
                      <p className="text-xs text-green-600">↑ +24% vs tháng trước</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-slate-600">Tốc độ tiêu thụ</p>
                      <p className="text-2xl font-bold">82%</p>
                      <p className="text-xs text-blue-600">Tốt</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-slate-600">Tồn kho trung bình</p>
                      <p className="text-2xl font-bold">28 ngày</p>
                      <p className="text-xs text-slate-600">Bình thường</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-slate-900">Báo cáo chi tiết</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Button variant="outline" className="justify-start">
                        📊 Doanh số theo khu vực
                      </Button>
                      <Button variant="outline" className="justify-start">
                        🏢 Doanh số theo đại lý
                      </Button>
                      <Button variant="outline" className="justify-start">
                        📦 Báo cáo tồn kho
                      </Button>
                      <Button variant="outline" className="justify-start">
                        📈 Tốc độ tiêu thụ
                      </Button>
                      <Button variant="outline" className="justify-start">
                        💰 Công nợ đại lý
                      </Button>
                      <Button variant="outline" className="justify-start">
                        🚗 Hiệu suất từng mẫu xe
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* AI Forecasting Tab */}
            <TabsContent value="ai" className="space-y-6">
              <Card className="rounded-3xl border border-slate-200 bg-white shadow-[0_25px_45px_-30px_rgba(15,23,42,0.2)]">
                <CardHeader>
                  <CardTitle className="flex items-center text-xl font-semibold text-slate-900">
                    <span className="mr-2">🤖</span>
                    Dashboard AI & Dự báo
                  </CardTitle>
                  <CardDescription className="text-slate-600">
                    Dự báo nhu cầu với AI - EVM Staff có quyền truy cập
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-purple-50">
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        🎯 Dự báo Q4/2025
                      </h4>
                      <div className="space-y-2 text-sm">
                        <p>• VF8: Nhu cầu dự kiến tăng <strong>25%</strong> trong Q4</p>
                        <p>• VF5: Tốc độ tiêu thụ tăng <strong>18%</strong> khu vực miền Nam</p>
                        <p>• VF9: Đề xuất tăng phân phối cho TP.HCM <strong>+15 xe/tháng</strong></p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3">Khuyến nghị từ AI</h4>
                      <div className="space-y-3">
                        {[
                          { title: 'Tăng tồn kho VF8', desc: 'Nhu cầu cao trong 2 tháng tới', priority: 'Cao' },
                          { title: 'Điều chỉnh giá VF5', desc: 'Tốc độ tiêu thụ chậm ở miền Bắc', priority: 'Trung bình' },
                          { title: 'Khuyến mãi VF3', desc: 'Tồn kho cao tại 3 đại lý', priority: 'Thấp' }
                        ].map((item, i) => (
                          <div key={i} className="flex items-start justify-between p-3 border rounded-lg">
                            <div className="flex-1">
                              <p className="font-medium text-slate-900">{item.title}</p>
                              <p className="text-sm text-slate-600">{item.desc}</p>
                            </div>
                            <Badge variant={
                              item.priority === 'Cao' ? 'destructive' :
                              item.priority === 'Trung bình' ? 'secondary' : 'outline'
                            }>
                              {item.priority}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Button className="w-full">
                      Xem Dashboard AI đầy đủ
                    </Button>
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


