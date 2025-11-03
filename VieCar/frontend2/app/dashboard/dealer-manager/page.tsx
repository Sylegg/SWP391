"use client";

import { ProtectedRoute } from "@/components/auth-guards";
import { useAuth } from "@/contexts/AuthContext";
import DealerManagerLayout from "@/components/layout/dealer-manager-layout";
import { useEffect, useState } from "react";

export default function DealerManagerDashboard() {
  const { user } = useAuth();
  const [dealerInfo, setDealerInfo] = useState<{
    dealerName?: string;
    dealerAddress?: string;
  }>({});
  const [loading, setLoading] = useState(true);

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

  return (
    <ProtectedRoute allowedRoles={['Dealer Manager', 'Admin']}>
      <DealerManagerLayout>
        <div className="p-6 space-y-8">
          {/* Welcome Header */}
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg p-8 shadow-lg">
            {loading ? (
              <p className="text-xl">Đang tải...</p>
            ) : (
              <>
                <h1 className="text-3xl font-bold mb-2">
                  Chào mừng quản lý đại lý {user?.dealerName || 'VieCar'}
                </h1>
                <p className="text-purple-100 text-lg mb-4">
                  Địa chỉ: {user?.dealerAddress || 'Đang cập nhật'}
                </p>
                <div className="border-t border-purple-400 pt-4 mt-4">
                  <p className="text-xl">
                    Xin chào, <span className="font-semibold">{user?.username}</span> - Quản lý đại lý
                  </p>
                  <p className="text-purple-100 mt-2">
                    Vui lòng chọn chức năng từ menu bên trái để bắt đầu làm việc và tiếp tục công việc
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </DealerManagerLayout>
    </ProtectedRoute>
  );
}
