"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/auth-guards";
import DealerStaffLayout from "@/components/layout/dealer-staff-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2, ArrowLeft, Package } from "lucide-react";
import { vnpayApi, VnpayPaymentResult } from "@/lib/vnpayApi";

function VnpayReturnContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [paymentResult, setPaymentResult] = useState<VnpayPaymentResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        setIsLoading(true);
        
        // Lấy tất cả query parameters từ VNPay
        const params: Record<string, string> = {};
        searchParams.forEach((value, key) => {
          params[key] = value;
        });

        console.log("VNPay callback params:", params);

        // Gửi đến backend để verify
        const result = await vnpayApi.verifyPayment(params);
        setPaymentResult(result);
      } catch (err: any) {
        console.error("Error verifying payment:", err);
        setError(err.response?.data?.message || "Không thể xác thực thanh toán");
      } finally {
        setIsLoading(false);
      }
    };

    verifyPayment();
  }, [searchParams]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
          <div>
            <h3 className="text-xl font-semibold mb-2">Đang xử lý thanh toán...</h3>
            <p className="text-muted-foreground">Vui lòng chờ trong giây lát</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="max-w-2xl mx-auto mt-8">
        <CardHeader className="bg-red-50 dark:bg-red-950">
          <CardTitle className="text-center text-2xl flex items-center justify-center gap-2 text-red-600">
            <XCircle className="h-8 w-8" />
            Lỗi xử lý thanh toán
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 text-center space-y-4">
          <p className="text-lg text-muted-foreground">{error}</p>
          <Button
            onClick={() => router.push("/dashboard/dealer-staff/orders")}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại danh sách đơn hàng
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!paymentResult) {
    return null;
  }

  const isSuccess = paymentResult.status === "success" || paymentResult.responseCode === "00";

  return (
    <Card className="max-w-3xl mx-auto mt-8 shadow-2xl border-0 overflow-hidden">
      <CardHeader className={`p-8 text-center ${isSuccess ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-gradient-to-r from-red-500 to-rose-600'}`}>
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-white/30 blur-xl animate-pulse"></div>
            <div className="relative mx-auto w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-2xl">
              {isSuccess ? (
                <CheckCircle className="h-12 w-12 text-green-600 animate-bounce" />
              ) : (
                <XCircle className="h-12 w-12 text-red-600" />
              )}
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-white">
            {isSuccess ? "Thanh toán thành công!" : "Thanh toán thất bại"}
          </CardTitle>
          {paymentResult.orderId && (
            <p className="text-white/90 text-lg">
              Mã đơn hàng: <strong>#{paymentResult.orderId}</strong>
            </p>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-8 space-y-6">
        {isSuccess ? (
          <>
            {/* Success Content */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 rounded-xl p-6 border border-green-200 dark:border-green-800">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 text-green-700 dark:text-green-300">
                <CheckCircle className="h-5 w-5" />
                Thông tin thanh toán
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-green-900 dark:text-green-100">Trạng thái:</span>
                  <span className="font-semibold text-green-700 dark:text-green-300">Thành công</span>
                </div>
                {paymentResult.transactionNo && (
                  <div className="flex justify-between items-center">
                    <span className="text-green-900 dark:text-green-100">Mã giao dịch:</span>
                    <span className="font-mono font-semibold text-green-700 dark:text-green-300">{paymentResult.transactionNo}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-green-900 dark:text-green-100">Thời gian:</span>
                  <span className="font-semibold text-green-700 dark:text-green-300">
                    {new Date().toLocaleString('vi-VN')}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
              <h3 className="font-semibold text-lg mb-3 text-blue-900 dark:text-blue-100">
                📋 Bước tiếp theo
              </h3>
              <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400">✓</span>
                  <span>Đơn hàng đã được cập nhật trạng thái tự động</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400">✓</span>
                  <span>Khách hàng sẽ nhận được email xác nhận thanh toán</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400">✓</span>
                  <span>Bạn có thể kiểm tra chi tiết đơn hàng trong danh sách</span>
                </li>
              </ul>
            </div>
          </>
        ) : (
          <>
            {/* Failure Content */}
            <div className="bg-red-50 dark:bg-red-950 rounded-xl p-6 border border-red-200 dark:border-red-800">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 text-red-700 dark:text-red-300">
                <XCircle className="h-5 w-5" />
                Lý do thất bại
              </h3>
              <p className="text-red-800 dark:text-red-200">
                {paymentResult.message || "Giao dịch bị hủy hoặc thất bại"}
              </p>
              {paymentResult.responseCode && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                  Mã lỗi: {paymentResult.responseCode}
                </p>
              )}
            </div>

            <div className="bg-amber-50 dark:bg-amber-950 rounded-xl p-6 border border-amber-200 dark:border-amber-800">
              <h3 className="font-semibold text-lg mb-3 text-amber-900 dark:text-amber-100">
                💡 Bạn có thể
              </h3>
              <ul className="space-y-2 text-sm text-amber-800 dark:text-amber-200">
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>Thử lại thanh toán với phương thức khác</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>Thanh toán trực tiếp tại cửa hàng</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>Liên hệ bộ phận hỗ trợ nếu cần giúp đỡ</span>
                </li>
              </ul>
            </div>
          </>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button
            onClick={() => router.push("/dashboard/dealer-staff/orders")}
            className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
          >
            <Package className="h-5 w-5 mr-2" />
            Quản lý đơn hàng
          </Button>
          {!isSuccess && (
            <Button
              onClick={() => router.push("/dashboard/dealer-staff/orders")}
              variant="outline"
              className="flex-1 h-12"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Thử lại
            </Button>
          )}
        </div>

        {/* Support Info */}
        <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
          <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
            <span className="text-xl">📞</span>
            <span>Cần hỗ trợ? Liên hệ: <strong>1900-xxxx</strong> hoặc <strong>support@viecar.com</strong></span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DealerStaffVnpayReturnPage() {
  return (
    <ProtectedRoute allowedRoles={['Dealer Staff', 'Dealer Manager']}>
      <DealerStaffLayout>
        <div className="container mx-auto p-6 min-h-screen">
          <Suspense fallback={
            <div className="flex items-center justify-center min-h-[60vh]">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
            </div>
          }>
            <VnpayReturnContent />
          </Suspense>
        </div>
      </DealerStaffLayout>
    </ProtectedRoute>
  );
}
