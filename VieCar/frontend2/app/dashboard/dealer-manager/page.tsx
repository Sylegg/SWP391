"use client";

import { ProtectedRoute } from "@/components/auth-guards";
import { useAuth } from "@/contexts/AuthContext";
import DealerManagerLayout from "@/components/layout/dealer-manager-layout";
import { useEffect, useState } from "react";
import { Store, Users, Package, TrendingUp, ArrowRight, CheckCircle, Calendar, ShoppingCart, BarChart3 } from "lucide-react";
import Link from "next/link";

export default function DealerManagerDashboard() {
  const { user } = useAuth();
  const [dealerInfo, setDealerInfo] = useState<{
    dealerName?: string;
    dealerAddress?: string;
  }>({});
  const [loading, setLoading] = useState(true);
  const [activeTestDrives, setActiveTestDrives] = useState<any[]>([]);

  useEffect(() => {
    // Lấy thông tin dealer từ user context
    if (user?.dealerId && user?.dealerName) {
      setDealerInfo({
        dealerName: user.dealerName,
        dealerAddress: user.dealerAddress
      });
      setLoading(false);
    } else {
      // Nếu không có trong context, có thể do vừa login, check localStorage
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          if (parsedUser.dealerId && parsedUser.dealerName) {
            setDealerInfo({
              dealerName: parsedUser.dealerName,
              dealerAddress: parsedUser.dealerAddress
            });
          }
        } catch (error) {
          console.error('Error parsing stored user:', error);
        }
      }
      setLoading(false);
    }
  }, [user]);
  
  // Poll active test drives every 30 seconds
  useEffect(() => {
    const loadActiveTestDrives = async () => {
      if (!user?.dealerId) return;
      
      try {
        const { getTestDrivesByDealerId } = await import('@/lib/testDriveApi');
        const testDrives = await getTestDrivesByDealerId(user.dealerId);
        const active = testDrives.filter(td => td.status === 'IN_PROGRESS');
        setActiveTestDrives(active);
      } catch (error) {
        console.error('Failed to load active test drives:', error);
      }
    };
    
    loadActiveTestDrives();
    const interval = setInterval(loadActiveTestDrives, 30000); // Poll every 30s
    
    return () => clearInterval(interval);
  }, [user?.dealerId]);

  return (
    <ProtectedRoute allowedRoles={['Dealer Manager', 'Admin']}>
      <DealerManagerLayout>
        <div className="space-y-6">
          {/* Welcome Header with Enhanced Liquid Glass */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-600 p-8 shadow-2xl backdrop-blur-md border border-white/20">
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent animate-gradient-shift"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.3),transparent_50%)]"></div>
            
            <div className="relative z-10">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-3 rounded-xl bg-white/30 backdrop-blur-md shadow-lg">
                  <Store className="h-8 w-8 text-white drop-shadow-lg" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white drop-shadow-lg">
                    Đại lý {user?.dealerName || 'VieCar'}
                  </h1>
                  <p className="text-purple-100 text-lg drop-shadow-sm">
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
                    <p className="text-purple-100 mt-1 drop-shadow-sm">
                      Chúc bạn một ngày làm việc hiệu quả!
                    </p>
                  </div>
                  <div className="hidden md:flex items-center space-x-2 bg-white/20 backdrop-blur-md rounded-full px-4 py-2 shadow-lg border border-white/30">
                    <Users className="h-5 w-5 text-white" />
                    <span className="text-white font-medium">Dealer Manager</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Active Test Drives Alert */}
          {activeTestDrives.length > 0 && (
            <div className="backdrop-blur-md bg-gradient-to-br from-orange-50/90 to-amber-50/90 dark:from-orange-950/50 dark:to-amber-950/50 rounded-2xl border-2 border-orange-300/50 dark:border-orange-700/50 shadow-lg p-6 animate-pulse-subtle">
              <div className="flex items-start space-x-3">
                <div className="p-2 rounded-lg bg-orange-500/20 backdrop-blur-sm">
                  <Users className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-orange-900 dark:text-orange-100 mb-2">
                    🚗 Nhân viên đang lái thử cùng khách ({activeTestDrives.length})
                  </h3>
                  <div className="space-y-2">
                    {activeTestDrives.map(td => (
                      <div key={td.id} className="flex items-center justify-between p-3 rounded-lg bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm">
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-gray-100">
                              {td.escortStaff?.name || 'Nhân viên'} → {td.user.name}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {td.productName || td.categoryName} • Đơn #{td.id}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs font-medium text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30 px-2 py-1 rounded">
                          Đang lái
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Info Cards with Liquid Glass */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="backdrop-blur-md bg-gradient-to-br from-purple-50/80 to-indigo-50/80 dark:from-purple-950/40 dark:to-indigo-950/40 rounded-2xl border border-white/30 shadow-lg p-6">
              <div className="flex items-center space-x-2 mb-4">
                <div className="p-2 rounded-lg bg-purple-500/20 backdrop-blur-sm">
                  <CheckCircle className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Nhiệm vụ hôm nay</h3>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start space-x-3 p-3 rounded-lg bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm hover:bg-white/60 dark:hover:bg-gray-800/60 transition-colors">
                  <div className="w-2 h-2 rounded-full bg-purple-500 mt-2 shadow-lg shadow-purple-500/50"></div>
                  <span className="text-gray-700 dark:text-gray-300">Kiểm tra đơn phân phối mới</span>
                </li>
                <li className="flex items-start space-x-3 p-3 rounded-lg bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm hover:bg-white/60 dark:hover:bg-gray-800/60 transition-colors">
                  <div className="w-2 h-2 rounded-full bg-indigo-500 mt-2 shadow-lg shadow-indigo-500/50"></div>
                  <span className="text-gray-700 dark:text-gray-300">Xem báo cáo tồn kho</span>
                </li>
                <li className="flex items-start space-x-3 p-3 rounded-lg bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm hover:bg-white/60 dark:hover:bg-gray-800/60 transition-colors">
                  <div className="w-2 h-2 rounded-full bg-violet-500 mt-2 shadow-lg shadow-violet-500/50"></div>
                  <span className="text-gray-700 dark:text-gray-300">Quản lý nhân viên và phân công</span>
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
                  <span className="text-gray-700 dark:text-gray-300">Sử dụng bộ lọc để tìm sản phẩm nhanh hơn</span>
                </li>
                <li className="flex items-start space-x-3 p-3 rounded-lg bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm hover:bg-white/60 dark:hover:bg-gray-800/60 transition-colors">
                  <div className="w-2 h-2 rounded-full bg-cyan-500 mt-2 shadow-lg shadow-cyan-500/50"></div>
                  <span className="text-gray-700 dark:text-gray-300">Theo dõi xu hướng để đặt hàng hiệu quả</span>
                </li>
                <li className="flex items-start space-x-3 p-3 rounded-lg bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm hover:bg-white/60 dark:hover:bg-gray-800/60 transition-colors">
                  <div className="w-2 h-2 rounded-full bg-teal-500 mt-2 shadow-lg shadow-teal-500/50"></div>
                  <span className="text-gray-700 dark:text-gray-300">Cập nhật giá bán lẻ dựa trên thị trường</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </DealerManagerLayout>
    </ProtectedRoute>
  );
}
