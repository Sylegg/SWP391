"use client";

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function PaymentReturnPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const [processing, setProcessing] = useState(true);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    const vnpResponseCode = searchParams.get('vnp_ResponseCode');
    const vnpTxnRef = searchParams.get('vnp_TxnRef');
    const vnpAmount = searchParams.get('vnp_Amount');
    const vnpBankCode = searchParams.get('vnp_BankCode');
    const vnpTransactionNo = searchParams.get('vnp_TransactionNo');

    console.log('VNPay callback params:', {
      vnpResponseCode,
      vnpTxnRef,
      vnpAmount,
      vnpBankCode,
      vnpTransactionNo,
    });

    // VNPay response code 00 = success
    if (vnpResponseCode === '00') {
      setPaymentSuccess(true);
      
      const orderId = vnpTxnRef;
      
      toast({
        title: '✅ Thanh toán thành công',
        description: `Đơn hàng ${orderId} đã được thanh toán`,
      });

      // Redirect to orders page after 3 seconds
      setTimeout(() => {
        router.push('/dashboard/customer/orders');
      }, 3000);
    } else {
      setPaymentSuccess(false);
      
      toast({
        title: '❌ Thanh toán thất bại',
        description: getErrorMessage(vnpResponseCode),
        variant: 'destructive',
      });

      // Redirect back after 5 seconds
      setTimeout(() => {
        router.push('/dashboard/customer/orders');
      }, 5000);
    }

    setProcessing(false);
  }, [searchParams, router, toast]);

  const getErrorMessage = (code: string | null) => {
    const errorMessages: Record<string, string> = {
      '07': 'Giao dịch bị nghi ngờ gian lận',
      '09': 'Thẻ chưa đăng ký dịch vụ',
      '10': 'Xác thực thông tin thẻ không thành công',
      '11': 'Thẻ hết hạn',
      '12': 'Thẻ bị khóa',
      '13': 'Sai mật khẩu OTP',
      '24': 'Khách hàng hủy giao dịch',
      '51': 'Tài khoản không đủ số dư',
      '65': 'Vượt quá giới hạn giao dịch',
      '75': 'Ngân hàng thanh toán đang bảo trì',
      '79': 'Giao dịch vượt quá số lần nhập sai mật khẩu',
    };
    return errorMessages[code || ''] || 'Giao dịch không thành công';
  };

  const vnpAmount = searchParams.get('vnp_Amount');
  const amount = vnpAmount ? parseInt(vnpAmount) / 100 : 0;
  const vnpBankCode = searchParams.get('vnp_BankCode');
  const vnpTransactionNo = searchParams.get('vnp_TransactionNo');
  const vnpTxnRef = searchParams.get('vnp_TxnRef');

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
              <CardDescription>Đơn hàng của bạn đã được thanh toán</CardDescription>
            </>
          ) : (
            <>
              <div className="flex justify-center mb-4">
                <XCircle className="h-16 w-16 text-red-600" />
              </div>
              <CardTitle className="text-2xl text-red-600">Thanh toán thất bại</CardTitle>
              <CardDescription>{getErrorMessage(searchParams.get('vnp_ResponseCode'))}</CardDescription>
            </>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {!processing && (
            <>
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Mã đơn:</span>
                  <span className="font-semibold">{vnpTxnRef}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Số tiền:</span>
                  <span className="font-semibold">{amount.toLocaleString('vi-VN')} VND</span>
                </div>
                {vnpBankCode && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ngân hàng:</span>
                    <span className="font-semibold">{vnpBankCode}</span>
                  </div>
                )}
                {vnpTransactionNo && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Mã GD VNPay:</span>
                    <span className="font-mono text-xs">{vnpTransactionNo}</span>
                  </div>
                )}
              </div>
              <Button 
                onClick={() => router.push('/dashboard/customer/orders')}
                className="w-full"
              >
                Quay về đơn hàng
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
