"use client";

import { ProtectedRoute } from "@/components/auth-guards";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Car, Users, BarChart, CheckCircle, FileText, ShoppingCart, Calendar, CreditCard, MessageSquare, ArrowLeft, LogOut, Building } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { VehicleInventoryList } from "@/components/vehicle";

export default function DealerManagerDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <ProtectedRoute allowedRoles={['Dealer Manager', 'Admin']}>
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
                <p className="text-xs text-slate-500">Bảng điều khiển Quản lý đại lý</p>
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
                <Building className="h-3.5 w-3.5 text-indigo-500" />
                Quản lý đại lý
              </div>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-900 lg:text-4xl">Bảng điều khiển Quản lý đại lý</h1>
              <p className="max-w-2xl text-sm text-slate-600">Xin chào, {user?.username}. Duyệt yêu cầu và quản lý hoạt động đại lý.</p>
            </div>

            <div className="space-y-10">

          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_25px_45px_-30px_rgba(15,23,42,0.2)] transition-all duration-300 hover:border-indigo-200 hover:shadow-[0_35px_60px_-15px_rgba(79,70,229,0.3)]">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-700">Chờ duyệt</CardTitle>
                <div className="rounded-full bg-gradient-to-br from-yellow-100 to-amber-100 p-2 text-yellow-600 group-hover:from-yellow-200 group-hover:to-amber-200">
                  <CheckCircle className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">24</div>
                <p className="text-xs text-slate-500 mt-1">Yêu cầu cần xử lý</p>
              </CardContent>
            </Card>

            <Card className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_25px_45px_-30px_rgba(15,23,42,0.2)] transition-all duration-300 hover:border-indigo-200 hover:shadow-[0_35px_60px_-15px_rgba(79,70,229,0.3)]">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-700">Doanh số</CardTitle>
                <div className="rounded-full bg-gradient-to-br from-indigo-100 to-sky-100 p-2 text-indigo-600 group-hover:from-indigo-200 group-hover:to-sky-200">
                  <BarChart className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">₫5.2B</div>
                <p className="text-xs text-slate-500 mt-1">Tháng này</p>
              </CardContent>
            </Card>

            <Card className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_25px_45px_-30px_rgba(15,23,42,0.2)] transition-all duration-300 hover:border-indigo-200 hover:shadow-[0_35px_60px_-15px_rgba(79,70,229,0.3)]">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-700">Nhân viên</CardTitle>
                <div className="rounded-full bg-gradient-to-br from-indigo-100 to-sky-100 p-2 text-indigo-600 group-hover:from-indigo-200 group-hover:to-sky-200">
                  <Users className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">12</div>
                <p className="text-xs text-slate-500 mt-1">Dealer Staff</p>
              </CardContent>
            </Card>

            <Card className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_25px_45px_-30px_rgba(15,23,42,0.2)] transition-all duration-300 hover:border-indigo-200 hover:shadow-[0_35px_60px_-15px_rgba(79,70,229,0.3)]">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-700">Tồn kho</CardTitle>
                <div className="rounded-full bg-gradient-to-br from-indigo-100 to-sky-100 p-2 text-indigo-600 group-hover:from-indigo-200 group-hover:to-sky-200">
                  <Car className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">45</div>
                <p className="text-xs text-slate-500 mt-1">Xe sẵn sàng</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Tabs */}
          <Tabs defaultValue="vehicles" className="space-y-6">
            <TabsList className="grid w-full gap-2 rounded-2xl border border-slate-200 bg-white p-1 shadow-sm grid-cols-6">
              <TabsTrigger value="vehicles" className="rounded-xl border border-transparent px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500 transition data-[state=active]:border-indigo-200 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-600">Kho xe</TabsTrigger>
              <TabsTrigger value="sales" className="rounded-xl border border-transparent px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500 transition data-[state=active]:border-indigo-200 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-600">Bán hàng</TabsTrigger>
              <TabsTrigger value="approvals" className="rounded-xl border border-transparent px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500 transition data-[state=active]:border-indigo-200 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-600">Duyệt yêu cầu</TabsTrigger>
              <TabsTrigger value="staff" className="rounded-xl border border-transparent px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500 transition data-[state=active]:border-indigo-200 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-600">Nhân viên</TabsTrigger>
              <TabsTrigger value="reports" className="rounded-xl border border-transparent px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500 transition data-[state=active]:border-indigo-200 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-600">Báo cáo</TabsTrigger>
              <TabsTrigger value="customer-service" className="rounded-xl border border-transparent px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500 transition data-[state=active]:border-indigo-200 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-600">Dịch vụ KH</TabsTrigger>
            </TabsList>

            {/* Vehicles Tab - Inventory for dealer */}
            <TabsContent value="vehicles" className="space-y-6">
              <VehicleInventoryList dealerId={user?.id || 'dealer-1'} />
            </TabsContent>

            {/* Rest of tabs continue with same styling pattern... */}
            {/* Sales Tab - Quotes & Orders */}
            <TabsContent value="sales" className="space-y-6">
              <Card className="rounded-3xl border border-slate-200 bg-white shadow-[0_25px_45px_-30px_rgba(15,23,42,0.2)]">
                <CardHeader>
                  <CardTitle className="flex items-center text-xl font-semibold text-slate-900">
                    <ShoppingCart className="mr-2 h-5 w-5 text-indigo-600" />
                    Quản lý bán hàng
                  </CardTitle>
                  <CardDescription className="text-slate-600">
                    Báo giá, đơn hàng, thanh toán đại lý
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="space-y-2">
                      <p className="text-sm text-slate-600">Doanh thu tháng</p>
                      <p className="text-2xl font-bold text-slate-900">₫5.2B</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-slate-600">Đơn hàng</p>
                      <p className="text-2xl font-bold text-slate-900">89</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-slate-600">Báo giá</p>
                      <p className="text-2xl font-bold text-blue-600">45</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-slate-600">Tăng trưởng</p>
                      <p className="text-2xl font-bold text-green-600">+18%</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold text-slate-900">Đơn hàng gần đây</h4>
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="flex items-center justify-between p-3 border border-slate-200 rounded-2xl hover:border-indigo-200 transition-colors">
                        <div className="flex-1">
                          <p className="font-medium text-slate-900">Đơn hàng #ORD{2025000 + i}</p>
                          <p className="text-sm text-slate-600">
                            VF{i + 4} - Khách: Nguyễn Văn {String.fromCharCode(65 + i)} - ₫{(250 + i * 50)}M
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant="default" className="bg-gradient-to-r from-indigo-600 to-sky-600">Đã xác nhận</Badge>
                          <Button variant="outline" size="sm" className="border-slate-200 hover:border-indigo-300 hover:bg-indigo-50">Chi tiết</Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Button className="w-full mt-4 bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-700 hover:to-sky-700" variant="default">
                    <FileText className="w-4 h-4 mr-2" />
                    Xuất báo cáo bán hàng
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Approvals Tab - Main feature of Dealer Manager */}
            <TabsContent value="approvals" className="space-y-6">
              <Card className="rounded-3xl border border-slate-200 bg-white shadow-[0_25px_45px_-30px_rgba(15,23,42,0.2)]">
                <CardHeader>
                  <CardTitle className="flex items-center text-xl font-semibold text-slate-900">
                    <CheckCircle className="mr-2 h-5 w-5 text-yellow-500" />
                    Duyệt yêu cầu
                  </CardTitle>
                  <CardDescription className="text-slate-600">
                    Duyệt báo giá, thanh toán, lịch lái thử do nhân viên tạo
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="space-y-2">
                      <p className="text-sm text-slate-600">Chờ duyệt</p>
                      <p className="text-2xl font-bold text-yellow-600">24</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-slate-600">Đã duyệt hôm nay</p>
                      <p className="text-2xl font-bold text-green-600">12</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-slate-600">Từ chối</p>
                      <p className="text-2xl font-bold text-red-600">2</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-3 text-slate-900">📋 Báo giá chờ duyệt</h4>
                      {[1, 2].map((i) => (
                        <div key={i} className="border-l-4 border-l-yellow-500 p-3 bg-yellow-50/50 rounded-r-2xl mb-2 hover:bg-yellow-50 transition-colors">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="font-medium text-slate-900">Báo giá #QT{2025000 + i}</p>
                              <p className="text-sm text-slate-600">
                                VF{i + 5} - Khách: Nguyễn Văn {String.fromCharCode(65 + i)} - Nhân viên: Trần Thị {String.fromCharCode(65 + i)}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">Duyệt</Button>
                              <Button size="sm" variant="outline" className="border-slate-200 hover:border-red-300 hover:bg-red-50 hover:text-red-600">Từ chối</Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3 text-slate-900">💳 Thanh toán chờ duyệt</h4>
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="border-l-4 border-l-yellow-500 p-3 bg-yellow-50/50 rounded-r-2xl mb-2 hover:bg-yellow-50 transition-colors">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="font-medium text-slate-900">Giao dịch #PAY{2025000 + i}</p>
                              <p className="text-sm text-slate-600">
                                ₫{(50 + i * 30)}M - Khách: Lê Văn {String.fromCharCode(65 + i)}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">Duyệt</Button>
                              <Button size="sm" variant="outline" className="border-slate-200 hover:border-indigo-300 hover:bg-indigo-50">Chi tiết</Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3 text-slate-900">🚗 Lịch lái thử chờ duyệt</h4>
                      {[1, 2].map((i) => (
                        <div key={i} className="border-l-4 border-l-yellow-500 p-3 bg-yellow-50/50 rounded-r-2xl mb-2 hover:bg-yellow-50 transition-colors">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="font-medium text-slate-900">VF{i + 6} - {15 + i}/11/2025</p>
                              <p className="text-sm text-slate-600">
                                Khách: Phạm Văn {String.fromCharCode(65 + i)} - Nhân viên: Nguyễn Thị {String.fromCharCode(65 + i)}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">Duyệt</Button>
                              <Button size="sm" variant="outline" className="border-slate-200 hover:border-red-300 hover:bg-red-50 hover:text-red-600">Từ chối</Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Staff Tab */}
            <TabsContent value="staff" className="space-y-6">
              <Card className="rounded-3xl border border-slate-200 bg-white shadow-[0_25px_45px_-30px_rgba(15,23,42,0.2)]">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-xl font-semibold text-slate-900">
                    <span className="flex items-center">
                      <Users className="mr-2 h-5 w-5 text-indigo-600" />
                      Quản lý nhân viên
                    </span>
                    <Button size="sm" className="bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-700 hover:to-sky-700">Thêm nhân viên</Button>
                  </CardTitle>
                  <CardDescription className="text-slate-600">
                    Quản lý, theo dõi hiệu suất Dealer Staff
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { name: 'Nguyễn Văn A', sales: '₫1.2B', quotes: 45, testDrives: 15 },
                      { name: 'Trần Thị B', sales: '₫980M', quotes: 38, testDrives: 12 },
                      { name: 'Lê Văn C', sales: '₫850M', quotes: 32, testDrives: 10 },
                      { name: 'Phạm Thị D', sales: '₫720M', quotes: 28, testDrives: 8 }
                    ].map((staff, i) => (
                      <div key={i} className="p-3 border border-slate-200 rounded-2xl hover:border-indigo-200 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium text-slate-900">{staff.name}</p>
                          <Button variant="outline" size="sm" className="border-slate-200 hover:border-indigo-300 hover:bg-indigo-50">Chi tiết</Button>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-sm">
                          <div>
                            <p className="text-xs text-slate-600">Doanh số</p>
                            <p className="font-semibold text-slate-900">{staff.sales}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-600">Báo giá</p>
                            <p className="font-semibold text-slate-900">{staff.quotes}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-600">Lái thử</p>
                            <p className="font-semibold text-slate-900">{staff.testDrives}</p>
                          </div>
                        </div>
                      </div>
                    ))}
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
                      Báo cáo đại lý
                    </span>
                    <Button size="sm" className="bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-700 hover:to-sky-700">
                      <FileText className="mr-2 h-4 w-4" />
                      Xuất báo cáo
                    </Button>
                  </CardTitle>
                  <CardDescription className="text-slate-600">
                    Doanh số, hiệu suất nhân viên, tồn kho của đại lý
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="space-y-2">
                      <p className="text-sm text-slate-600">Doanh thu Q4</p>
                      <p className="text-2xl font-bold text-slate-900">₫15.8B</p>
                      <p className="text-xs text-green-600">↑ +24% vs Q3</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-slate-600">Hiệu suất trung bình</p>
                      <p className="text-2xl font-bold text-slate-900">85%</p>
                      <p className="text-xs text-blue-600">Tốt</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-slate-600">Tồn kho</p>
                      <p className="text-2xl font-bold text-slate-900">45 xe</p>
                      <p className="text-xs text-slate-600">Bình thường</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-slate-900">Báo cáo chi tiết</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Button variant="outline" className="justify-start border-slate-200 hover:border-indigo-300 hover:bg-indigo-50">
                        📊 Doanh số theo tháng
                      </Button>
                      <Button variant="outline" className="justify-start border-slate-200 hover:border-indigo-300 hover:bg-indigo-50">
                        👥 Hiệu suất nhân viên
                      </Button>
                      <Button variant="outline" className="justify-start border-slate-200 hover:border-indigo-300 hover:bg-indigo-50">
                        🚗 Tồn kho xe
                      </Button>
                      <Button variant="outline" className="justify-start border-slate-200 hover:border-indigo-300 hover:bg-indigo-50">
                        💰 Báo cáo thanh toán
                      </Button>
                      <Button variant="outline" className="justify-start border-slate-200 hover:border-indigo-300 hover:bg-indigo-50">
                        📈 Tỉ lệ chuyển đổi
                      </Button>
                      <Button variant="outline" className="justify-start border-slate-200 hover:border-indigo-300 hover:bg-indigo-50">
                        🎯 Tiến độ chỉ tiêu
                      </Button>
                    </div>
                  </div>

                  <div className="mt-6 p-4 border border-blue-200 rounded-2xl bg-blue-50">
                    <p className="text-sm font-medium mb-2 text-blue-900">ℹ️ Lưu ý</p>
                    <p className="text-sm text-blue-700">
                      Dealer Manager KHÔNG có quyền truy cập AI Dashboard. Chỉ Admin và EVM Staff có quyền này.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Customer Service Tab */}
            <TabsContent value="customer-service" className="space-y-6">
              <Card className="rounded-3xl border border-slate-200 bg-white shadow-[0_25px_45px_-30px_rgba(15,23,42,0.2)]">
                <CardHeader>
                  <CardTitle className="flex items-center text-xl font-semibold text-slate-900">
                    <MessageSquare className="mr-2 h-5 w-5 text-indigo-600" />
                    Dịch vụ khách hàng
                  </CardTitle>
                  <CardDescription className="text-slate-600">
                    Theo dõi, xử lý phản hồi & khiếu nại
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="space-y-2">
                      <p className="text-sm text-slate-600">Phản hồi mới</p>
                      <p className="text-2xl font-bold text-blue-600">12</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-slate-600">Khiếu nại chờ</p>
                      <p className="text-2xl font-bold text-yellow-600">5</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-slate-600">Đã xử lý</p>
                      <p className="text-2xl font-bold text-green-600">89</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-slate-900">Khiếu nại cần xử lý</h4>
                    {[
                      { customer: 'Nguyễn Văn A', issue: 'Chậm giao xe', priority: 'Cao' },
                      { customer: 'Trần Thị B', issue: 'Thiếu phụ kiện', priority: 'Trung bình' },
                      { customer: 'Lê Văn C', issue: 'Yêu cầu hỗ trợ', priority: 'Thấp' }
                    ].map((complaint, i) => (
                      <div key={i} className="flex items-center justify-between p-3 border border-slate-200 rounded-2xl hover:border-indigo-200 transition-colors">
                        <div className="flex-1">
                          <p className="font-medium text-slate-900">{complaint.customer}</p>
                          <p className="text-sm text-slate-600">{complaint.issue}</p>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant={
                            complaint.priority === 'Cao' ? 'destructive' :
                            complaint.priority === 'Trung bình' ? 'secondary' : 'outline'
                          }>
                            {complaint.priority}
                          </Badge>
                          <Button variant="outline" size="sm" className="border-slate-200 hover:border-indigo-300 hover:bg-indigo-50">Xử lý</Button>
                        </div>
                      </div>
                    ))}
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
