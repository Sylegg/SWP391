"use client";

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api';

export default function DistributionPaymentReturnPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const [processing, setProcessing] = useState(true);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [distributionId, setDistributionId] = useState<string>('');
  const [transactionNo, setTransactionNo] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        // Lấy tất cả query parameters
        const params: Record<string, string> = {};
        searchParams.forEach((value, key) => {
          params[key] = value;
        });

        console.log('📨 Verifying distribution payment with params:', params);

        // Gọi backend để verify payment
        const response = await api.post('/vnpay/verify-distribution-payment', null, { params });
        const result = response.data;

        console.log('✅ Verification result:', result);

        if (result.status === 'success') {
          setPaymentSuccess(true);
          setDistributionId(result.distributionId || '');
          setTransactionNo(result.transactionNo || '');
          
          toast({
            title: '✅ Thanh toán thành công',
            description: `Đơn phân phối #${result.distributionId} đã được thanh toán`,
            duration: 3000,
          });

          // Redirect sau 3 giây
          setTimeout(() => {
            router.push('/dashboard/dealer-manager/distributions');
          }, 3000);
        } else {
          setPaymentSuccess(false);
          setErrorMessage(result.message || 'Thanh toán thất bại');
          setDistributionId(result.distributionId || '');
          
          toast({
            title: '❌ Thanh toán thất bại',
            description: result.message || 'Vui lòng thử lại',
            variant: 'destructive',
            duration: 5000,
          });
        }
      } catch (error: any) {
        console.error('❌ Error verifying payment:', error);
        setPaymentSuccess(false);
        setErrorMessage(error.message || 'Không thể xác thực thanh toán');
        
        toast({
          title: '❌ Lỗi',
          description: 'Không thể xác thực thanh toán. Vui lòng liên hệ hỗ trợ.',
          variant: 'destructive',
          duration: 5000,
        });
      } finally {
        setProcessing(false);
      }
    };

    verifyPayment();
  }, [searchParams, router, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {processing ? (
            <>
              <div className="flex justify-center mb-4">
                <Loader2 className="h-16 w-16 text-blue-600 animate-spin" />
              </div>
              <CardTitle className="text-2xl">Đang xử lý thanh toán...</CardTitle>
              <CardDescription>Vui lòng chờ trong giây lát</CardDescription>
            </>
          ) : paymentSuccess ? (
            <>
              <div className="flex justify-center mb-4">
                <CheckCircle className="h-16 w-16 text-green-600" />
              </div>
              <CardTitle className="text-2xl text-green-600">Thanh toán thành công!</CardTitle>
              <CardDescription>Đơn phân phối của bạn đã được thanh toán</CardDescription>
            </>
          ) : (
            <>
              <div className="flex justify-center mb-4">
                <XCircle className="h-16 w-16 text-red-600" />
              </div>
              <CardTitle className="text-2xl text-red-600">Thanh toán thất bại</CardTitle>
              <CardDescription>{errorMessage}</CardDescription>
            </>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {!processing && (
            <>
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Mã đơn:</span>
                  <span className="font-semibold">#{distributionId}</span>
                </div>
                {transactionNo && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Mã giao dịch:</span>
                    <span className="font-mono text-sm">{transactionNo}</span>
                  </div>
                )}
              </div>
              <Button 
                onClick={() => router.push('/dashboard/dealer-manager/distributions')}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {paymentSuccess ? 'Về trang phân phối' : 'Thử lại'}
              </Button>
              
              {paymentSuccess && (
                <p className="text-xs text-center text-gray-500">
                  EVM Staff sẽ lên kế hoạch giao hàng sau khi nhận được thanh toán
                </p>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
