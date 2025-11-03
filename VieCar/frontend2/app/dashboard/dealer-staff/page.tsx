"use client";

import { ProtectedRoute } from "@/components/auth-guards";
import { useAuth } from "@/contexts/AuthContext";
import DealerStaffLayout from "@/components/layout/dealer-staff-layout";

export default function DealerStaffDashboard() {
  const { user } = useAuth();

  return (
    <ProtectedRoute allowedRoles={['Dealer Staff', 'Admin']}>
      <DealerStaffLayout>
        <div className="p-6 space-y-8">
          {/* Welcome Header */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-8 shadow-lg">
            <h1 className="text-3xl font-bold mb-2">
              Chào mừng nhân viên đại lý {user?.dealerName || 'VieCar'}
            </h1>
            <p className="text-blue-100 text-lg mb-4">
              Địa chỉ: {user?.dealerAddress || 'Đang cập nhật'}
            </p>
            <div className="border-t border-blue-400 pt-4 mt-4">
              <p className="text-xl">
                Xin chào, <span className="font-semibold">{user?.username}</span> - Nhân viên đại lý
              </p>
              <p className="text-blue-100 mt-2">
                Vui lòng chọn chức năng từ menu bên trái để bắt đầu làm việc và tiếp tục công việc
              </p>
            </div>
          </div>
        </div>
      </DealerStaffLayout>
    </ProtectedRoute>
  );
}
