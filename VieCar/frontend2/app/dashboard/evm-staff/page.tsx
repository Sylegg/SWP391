"use client";

import { ProtectedRoute } from "@/components/auth-guards";
import { useAuth } from "@/contexts/AuthContext";
import EvmStaffLayout from "@/components/layout/evm-staff-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Truck, 
  Package, 
  Building2, 
  TrendingUp, 
  ArrowRight,
  Zap,
  Users,
  ShoppingBag
} from "lucide-react";
import Link from "next/link";

export default function EvmStaffDashboard() {
  const { user } = useAuth();

  const quickActions = [
    {
      title: "Phân phối sản phẩm",
      description: "Quản lý phân phối xe đến các đại lý",
      icon: Truck,
      href: "/dashboard/evm-staff/distributions",
      color: "from-cyan-500 to-blue-600",
      iconBg: "bg-cyan-100 dark:bg-cyan-900/30",
      iconColor: "text-cyan-600 dark:text-cyan-400"
    }
  ];

  const stats = [
    {
      label: "Tổng đại lý",
      value: "---",
      icon: Building2,
      color: "text-cyan-600 dark:text-cyan-400",
      bg: "bg-cyan-50 dark:bg-cyan-900/20"
    },
    {
      label: "Phân phối tháng này",
      value: "---",
      icon: Package,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-900/20"
    },
    {
      label: "Sản phẩm hoạt động",
      value: "---",
      icon: Zap,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-900/20"
    },
    {
      label: "Tăng trưởng",
      value: "---",
      icon: TrendingUp,
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-50 dark:bg-purple-900/20"
    }
  ];

  return (
    <ProtectedRoute allowedRoles={['EVM Staff', 'Admin']}>
      <EvmStaffLayout>
        {/* Welcome Header with Liquid Glass */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-500 via-blue-500 to-blue-600 p-8 shadow-2xl mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent animate-gradient-shift"></div>
          <div className="relative z-10">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white drop-shadow-lg">
                  Chào mừng nhân viên EVM
                </h1>
                <p className="text-cyan-100 text-lg">
                  Electric Vehicle Management System
                </p>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xl text-white font-semibold">
                    Xin chào, {user?.username}
                  </p>
                  <p className="text-cyan-100 mt-1">
                    Quản lý phân phối xe điện đến các đại lý
                  </p>
                </div>
                <div className="hidden md:flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                  <Users className="h-5 w-5 text-white" />
                  <span className="text-white font-medium">EVM Staff</span>
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

        {/* Quick Actions */}
        <div className="grid grid-cols-1 gap-6 mb-8">
          {quickActions.map((action, index) => (
            <Link key={index} href={action.href} className="block">
              <Card className="border-none shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] cursor-pointer bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 overflow-hidden group">
                <div className={`absolute inset-0 bg-gradient-to-r ${action.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none`}></div>
                <CardHeader className="relative">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`p-4 rounded-xl ${action.iconBg} group-hover:scale-110 transition-transform duration-300`}>
                        <action.icon className={`h-8 w-8 ${action.iconColor}`} />
                      </div>
                      <div>
                        <CardTitle className="text-xl group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                          {action.title}
                        </CardTitle>
                        <CardDescription className="text-base mt-1">
                          {action.description}
                        </CardDescription>
                      </div>
                    </div>
                    <ArrowRight className="h-6 w-6 text-gray-400 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 group-hover:translate-x-2 transition-all duration-300" />
                  </div>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-none shadow-lg bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950/30 dark:to-blue-950/30">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Package className="h-5 w-5 text-cyan-600" />
                <span>Nhiệm vụ chính</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start space-x-2">
                  <div className="w-2 h-2 rounded-full bg-cyan-500 mt-2"></div>
                  <span className="text-gray-700 dark:text-gray-300">Quản lý phân phối sản phẩm tới các đại lý</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                  <span className="text-gray-700 dark:text-gray-300">Theo dõi tồn kho tại các điểm phân phối</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2"></div>
                  <span className="text-gray-700 dark:text-gray-300">Cập nhật trạng thái sản phẩm</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ShoppingBag className="h-5 w-5 text-blue-600" />
                <span>Hướng dẫn nhanh</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start space-x-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                  <span className="text-gray-700 dark:text-gray-300">Click vào "Phân phối sản phẩm" để quản lý</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-2 h-2 rounded-full bg-purple-500 mt-2"></div>
                  <span className="text-gray-700 dark:text-gray-300">Sử dụng bộ lọc để tìm kiếm nhanh</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-2 h-2 rounded-full bg-pink-500 mt-2"></div>
                  <span className="text-gray-700 dark:text-gray-300">Cập nhật thường xuyên để đồng bộ dữ liệu</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </EvmStaffLayout>
    </ProtectedRoute>
  );
}
