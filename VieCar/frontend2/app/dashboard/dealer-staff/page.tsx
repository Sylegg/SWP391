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

  return (
    <ProtectedRoute allowedRoles={['Dealer Staff', 'Admin']}>
      <DealerStaffLayout>
        <div className="space-y-6">
          {/* Welcome Header with Enhanced Liquid Glass */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-orange-600 p-8 shadow-2xl backdrop-blur-md border border-white/20">
          <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent animate-gradient-shift"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.3),transparent_50%)]"></div>
          
          <div className="relative z-10">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 rounded-xl bg-white/30 backdrop-blur-md shadow-lg">
                <Store className="h-8 w-8 text-white drop-shadow-lg" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white drop-shadow-lg">
                  Showroom {user?.dealerName || 'VieCar'}
                </h1>
                <p className="text-amber-100 text-lg drop-shadow-sm">
                  {user?.dealerAddress || 'Đang cập nhật địa chỉ'}
                </p>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-white/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xl text-white font-semibold drop-shadow-sm">
                    Xin chào, {user?.username}
                  </p>
                  <p className="text-amber-100 mt-1 drop-shadow-sm">
                    Chúc bạn một ngày làm việc hiệu quả!
                  </p>
                </div>
                <div className="hidden md:flex items-center space-x-2 bg-white/20 backdrop-blur-md rounded-full px-4 py-2 shadow-lg border border-white/30">
                  <Users className="h-5 w-5 text-white" />
                  <span className="text-white font-medium">Dealer Staff</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Info Cards with Liquid Glass */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="backdrop-blur-md bg-gradient-to-br from-amber-50/80 to-orange-50/80 dark:from-amber-950/40 dark:to-orange-950/40 rounded-2xl border border-white/30 shadow-lg p-6">
            <div className="flex items-center space-x-2 mb-4">
              <div className="p-2 rounded-lg bg-amber-500/20 backdrop-blur-sm">
                <CheckCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Nhiệm vụ hôm nay</h3>
            </div>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3 p-3 rounded-lg bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm hover:bg-white/60 dark:hover:bg-gray-800/60 transition-colors">
                <div className="w-2 h-2 rounded-full bg-amber-500 mt-2 shadow-lg shadow-amber-500/50"></div>
                <span className="text-gray-700 dark:text-gray-300">Kiểm tra lịch hẹn lái thử</span>
              </li>
              <li className="flex items-start space-x-3 p-3 rounded-lg bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm hover:bg-white/60 dark:hover:bg-gray-800/60 transition-colors">
                <div className="w-2 h-2 rounded-full bg-orange-500 mt-2 shadow-lg shadow-orange-500/50"></div>
                <span className="text-gray-700 dark:text-gray-300">Xử lý đơn đặt xe mới</span>
              </li>
              <li className="flex items-start space-x-3 p-3 rounded-lg bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm hover:bg-white/60 dark:hover:bg-gray-800/60 transition-colors">
                <div className="w-2 h-2 rounded-full bg-yellow-500 mt-2 shadow-lg shadow-yellow-500/50"></div>
                <span className="text-gray-700 dark:text-gray-300">Cập nhật tồn kho showroom</span>
              </li>
            </ul>
          </div>

          <div className="backdrop-blur-md bg-gradient-to-br from-blue-50/80 to-cyan-50/80 dark:from-blue-950/40 dark:to-cyan-950/40 rounded-2xl border border-white/30 shadow-lg p-6">
            <div className="flex items-center space-x-2 mb-4">
              <div className="p-2 rounded-lg bg-blue-500/20 backdrop-blur-sm">
                <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Tips & Tricks</h3>
            </div>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3 p-3 rounded-lg bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm hover:bg-white/60 dark:hover:bg-gray-800/60 transition-colors">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 shadow-lg shadow-blue-500/50"></div>
                <span className="text-gray-700 dark:text-gray-300">Sử dụng calendar view để xem lịch tổng quan</span>
              </li>
              <li className="flex items-start space-x-3 p-3 rounded-lg bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm hover:bg-white/60 dark:hover:bg-gray-800/60 transition-colors">
                <div className="w-2 h-2 rounded-full bg-cyan-500 mt-2 shadow-lg shadow-cyan-500/50"></div>
                <span className="text-gray-700 dark:text-gray-300">Cập nhật trạng thái đơn hàng kịp thời</span>
              </li>
              <li className="flex items-start space-x-3 p-3 rounded-lg bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm hover:bg-white/60 dark:hover:bg-gray-800/60 transition-colors">
                <div className="w-2 h-2 rounded-full bg-teal-500 mt-2 shadow-lg shadow-teal-500/50"></div>
                <span className="text-gray-700 dark:text-gray-300">Ghi chú thông tin khách hàng để chăm sóc tốt hơn</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
      </DealerStaffLayout>
    </ProtectedRoute>
  );
}
