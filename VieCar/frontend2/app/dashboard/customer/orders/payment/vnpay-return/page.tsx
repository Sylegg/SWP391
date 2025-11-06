"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2, ArrowLeft } from "lucide-react";
import { vnpayApi, VnpayPaymentResult } from "@/lib/vnpayApi";

export default function VnpayReturnPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [paymentResult, setPaymentResult] = useState<VnpayPaymentResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Lấy tất cả params từ URL
        const params: Record<string, string> = {};
        for (const [key, value] of searchParams) {
          params[key] = value;
        }

        console.log("VNPay callback params:", params);

        // Gửi params lên backend để verify
        const result = await vnpayApi.verifyPayment(params);
        setPaymentResult(result);

      } catch (err: any) {
        console.error("Error verifying payment:", err);
        setError(err.response?.data?.message || "Không thể xác minh giao dịch");
      } finally {
        setIsLoading(false);
      }
    };

    verifyPayment();
  }, [searchParams]);

  const handleBackToOrders = () => {
    // Thêm timestamp để force refresh trang orders
    router.push(`/dashboard/customer/orders?refresh=${Date.now()}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-16 w-16 animate-spin text-blue-500 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Đang xử lý thanh toán...</h3>
              <p className="text-muted-foreground text-center">
                Vui lòng chờ trong giây lát
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-100 dark:from-gray-900 dark:to-gray-800">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <XCircle className="h-16 w-16 text-red-500" />
            </div>
            <CardTitle className="text-center text-2xl">Lỗi xử lý thanh toán</CardTitle>
            <CardDescription className="text-center">{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleBackToOrders} className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại đơn hàng
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isSuccess = paymentResult?.status === 'success';

  return (
    <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${
      isSuccess ? 'from-green-50 to-blue-100' : 'from-red-50 to-pink-100'
    } dark:from-gray-900 dark:to-gray-800 p-4`}>
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex justify-center mb-4">
            {isSuccess ? (
              <CheckCircle className="h-16 w-16 text-green-500" />
            ) : (
              <XCircle className="h-16 w-16 text-red-500" />
            )}
          </div>
          <CardTitle className="text-center text-2xl">
            {isSuccess ? "Thanh toán thành công!" : "Thanh toán thất bại"}
          </CardTitle>
          <CardDescription className="text-center">
            {paymentResult?.message}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Mã đơn hàng:</span>
              <span className="font-semibold">#{paymentResult?.orderId}</span>
            </div>
            {paymentResult?.transactionNo && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Mã giao dịch:</span>
                <span className="font-mono text-sm">{paymentResult?.transactionNo}</span>
              </div>
            )}
            {paymentResult?.responseCode && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Mã phản hồi:</span>
                <span className="font-mono text-sm">{paymentResult?.responseCode}</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Button onClick={handleBackToOrders} className="w-full" size="lg">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại đơn hàng
            </Button>
            {isSuccess && (
              <Button 
                variant="outline" 
                onClick={() => router.push("/dashboard/customer")} 
                className="w-full"
              >
                Về trang chủ
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
