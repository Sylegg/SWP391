"use client";

import { ProtectedRoute } from "@/components/auth-guards";
import { useAuth } from "@/contexts/AuthContext";
import DealerStaffLayout from "@/components/layout/dealer-staff-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Car,
  Calendar,
  ShoppingCart,
  Users,
  ArrowRight,
  Store,
  TrendingUp,
  Clock,
  CheckCircle
} from "lucide-react";
import Link from "next/link";

export default function DealerStaffDashboard() {
  const { user } = useAuth();

  const quickActions = [
    {
      title: "Quản lý Showroom",
      description: "Xem và quản lý xe trong showroom",
      icon: Car,
      href: "/dashboard/dealer-staff/showroom",
      color: "from-amber-500 to-orange-600",
      iconBg: "bg-amber-100 dark:bg-amber-900/30",
      iconColor: "text-amber-600 dark:text-amber-400"
    },
    {
      title: "Lịch lái thử",
      description: "Quản lý lịch hẹn lái thử xe",
      icon: Calendar,
      href: "/dashboard/dealer-staff/test-drives",
      color: "from-blue-500 to-cyan-600",
      iconBg: "bg-blue-100 dark:bg-blue-900/30",
      iconColor: "text-blue-600 dark:text-blue-400"
    },
    {
      title: "Đơn đặt xe",
      description: "Xử lý đơn hàng và thanh toán",
      icon: ShoppingCart,
      href: "/dashboard/dealer-staff/orders",
      color: "from-emerald-500 to-green-600",
      iconBg: "bg-emerald-100 dark:bg-emerald-900/30",
      iconColor: "text-emerald-600 dark:text-emerald-400"
    },
    {
      title: "Quản lý khách hàng",
      description: "Theo dõi và chăm sóc khách hàng",
      icon: Users,
      href: "/dashboard/dealer-staff/customers",
      color: "from-purple-500 to-pink-600",
      iconBg: "bg-purple-100 dark:bg-purple-900/30",
      iconColor: "text-purple-600 dark:text-purple-400"
    }
  ];

  const stats = [
    {
      label: "Xe trong showroom",
      value: "---",
      icon: Car,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-900/20"
    },
    {
      label: "Lịch hẹn hôm nay",
      value: "---",
      icon: Calendar,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-900/20"
    },
    {
      label: "Đơn chờ xử lý",
      value: "---",
      icon: Clock,
      color: "text-orange-600 dark:text-orange-400",
      bg: "bg-orange-50 dark:bg-orange-900/20"
    },
    {
      label: "Đơn hoàn thành",
      value: "---",
      icon: CheckCircle,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-900/20"
    }
  ];

  return (
    <ProtectedRoute allowedRoles={['Dealer Staff', 'Admin']}>
      <DealerStaffLayout>
        {/* Welcome Header with Liquid Glass */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-orange-600 p-8 shadow-2xl mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent animate-gradient-shift"></div>
          <div className="relative z-10">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                <Store className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white drop-shadow-lg">
                  Showroom {user?.dealerName || 'VieCar'}
                </h1>
                <p className="text-amber-100 text-lg">
                  {user?.dealerAddress || 'Đang cập nhật địa chỉ'}
                </p>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xl text-white font-semibold">
                    Xin chào, {user?.username}
                  </p>
                  <p className="text-amber-100 mt-1">
                    Chúc bạn một ngày làm việc hiệu quả!
                  </p>
                </div>
                <div className="hidden md:flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                  <Users className="h-5 w-5 text-white" />
                  <span className="text-white font-medium">Dealer Staff</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="border-none shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-medium mb-1">
                      {stat.label}
                    </p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`p-4 rounded-xl ${stat.bg}`}>
                    <stat.icon className={`h-8 w-8 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {quickActions.map((action, index) => (
            <Link key={index} href={action.href} className="block">
              <Card className="border-none shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] cursor-pointer bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 overflow-hidden group h-full">
                <div className={`absolute inset-0 bg-gradient-to-r ${action.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none`}></div>
                <CardHeader className="relative">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`p-4 rounded-xl ${action.iconBg} group-hover:scale-110 transition-transform duration-300`}>
                        <action.icon className={`h-8 w-8 ${action.iconColor}`} />
                      </div>
                      <div>
                        <CardTitle className="text-xl group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                          {action.title}
                        </CardTitle>
                        <CardDescription className="text-base mt-1">
                          {action.description}
                        </CardDescription>
                      </div>
                    </div>
                    <ArrowRight className="h-6 w-6 text-gray-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 group-hover:translate-x-2 transition-all duration-300" />
                  </div>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-none shadow-lg bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-amber-600" />
                <span>Nhiệm vụ hôm nay</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start space-x-2">
                  <div className="w-2 h-2 rounded-full bg-amber-500 mt-2"></div>
                  <span className="text-gray-700 dark:text-gray-300">Kiểm tra lịch hẹn lái thử</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-2 h-2 rounded-full bg-orange-500 mt-2"></div>
                  <span className="text-gray-700 dark:text-gray-300">Xử lý đơn đặt xe mới</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-2 h-2 rounded-full bg-yellow-500 mt-2"></div>
                  <span className="text-gray-700 dark:text-gray-300">Cập nhật tồn kho showroom</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <span>Tips & Tricks</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start space-x-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                  <span className="text-gray-700 dark:text-gray-300">Sử dụng calendar view để xem lịch tổng quan</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-2 h-2 rounded-full bg-cyan-500 mt-2"></div>
                  <span className="text-gray-700 dark:text-gray-300">Cập nhật trạng thái đơn hàng kịp thời</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-2 h-2 rounded-full bg-teal-500 mt-2"></div>
                  <span className="text-gray-700 dark:text-gray-300">Ghi chú thông tin khách hàng để chăm sóc tốt hơn</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </DealerStaffLayout>
    </ProtectedRoute>
  );
}
