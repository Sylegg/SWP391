"use client";

import { ProtectedRoute } from "@/components/auth-guards";
import { useAuth } from "@/contexts/AuthContext";
import EvmStaffLayout from "@/components/layout/evm-staff-layout";

export default function EvmStaffDashboard() {
  const { user } = useAuth();

  return (
    <ProtectedRoute allowedRoles={['EVM Staff', 'Admin']}>
      <EvmStaffLayout>
        <div className="p-6 space-y-8">
          {/* Welcome Header */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg p-8 shadow-lg">
            <h1 className="text-3xl font-bold mb-2">
              Chào mừng nhân viên EVM
            </h1>
            <p className="text-green-100 text-lg mb-4">
              Electric Vehicle Management System
            </p>
            <div className="border-t border-green-400 pt-4 mt-4">
              <p className="text-xl">
                Xin chào, <span className="font-semibold">{user?.username}</span> - Nhân viên EVM
              </p>
              <p className="text-green-100 mt-2">
                Vui lòng chọn chức năng từ menu bên trái để bắt đầu làm việc và tiếp tục công việc
              </p>
            </div>
          </div>
        </div>
      </EvmStaffLayout>
    </ProtectedRoute>
  );
}
