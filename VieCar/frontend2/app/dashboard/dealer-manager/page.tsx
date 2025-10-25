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
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center space-y-4">
            {loading ? (
              <p className="text-xl">Đang tải...</p>
            ) : dealerInfo.dealerName ? (
              <>
                <h1 className="text-4xl font-bold">
                  Chào mừng Quản lý đại lý {dealerInfo.dealerName}
                </h1>
                {dealerInfo.dealerAddress && (
                  <p className="text-xl text-muted-foreground">
                    Địa chỉ: {dealerInfo.dealerAddress}
                  </p>
                )}
                <p className="text-lg text-muted-foreground mt-4">
                  Xin chào, {user?.username}
                </p>
              </>
            ) : (
              <>
                <h1 className="text-4xl font-bold">
                  Chào mừng, {user?.username}
                </h1>
                <p className="text-xl text-muted-foreground">
                  Bạn chưa được gán đại lý. Vui lòng liên hệ Admin.
                </p>
              </>
            )}
            <p className="text-lg text-muted-foreground mt-6">
              Vui lòng chọn chức năng từ menu bên trái để bắt đầu làm việc
            </p>
          </div>
        </div>
      </DealerManagerLayout>
    </ProtectedRoute>
  );
}
