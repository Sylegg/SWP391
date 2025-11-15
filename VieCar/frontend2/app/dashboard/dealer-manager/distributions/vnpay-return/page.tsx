"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth-guards';
import DealerManagerLayout from '@/components/layout/dealer-manager-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { confirmDistributionReceived } from '@/lib/distributionApi';
import { vnpayApi } from '@/lib/vnpayApi';
import { useToast } from '@/hooks/use-toast';

export default function VNPayReturnPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  const [status, setStatus] = useState<'processing' | 'success' | 'failed'>('processing');
  const [message, setMessage] = useState('Đang xử lý kết quả thanh toán...');
  const [distributionId, setDistributionId] = useState<number | null>(null);

  useEffect(() => {
    const processPayment = async () => {
      try {
        // Lấy tất cả params từ VNPay
        const params: Record<string, string> = {};
        searchParams.forEach((value, key) => {
          params[key] = value;
        });

        console.log('📨 VNPay callback params:', params);

        const vnpResponseCode = params.vnp_ResponseCode;
        const vnpTxnRef = params.vnp_TxnRef; // Format: DIST_26_1234567890

        // Parse distribution ID từ vnp_TxnRef
        const match = vnpTxnRef?.match(/^DIST_(\d+)_/);
        if (match) {
          setDistributionId(parseInt(match[1]));
        }

        if (vnpResponseCode === '00') {
          // Thanh toán thành công
          setStatus('success');
          setMessage('Thanh toán thành công! Đơn hàng của bạn đã được xác nhận.');

          // TODO: Gọi API xác nhận nhận hàng sau khi thanh toán thành công
          // await confirmDistributionReceived(distributionId, {...});

          toast({
            title: '✅ Thanh toán thành công',
            description: 'Đơn phân phối đã được thanh toán và xác nhận.',
          });
        } else {
          // Thanh toán thất bại
          setStatus('failed');
          const errorMessages: Record<string, string> = {
            '24': 'Khách hàng hủy giao dịch',
            '51': 'Tài khoản không đủ số dư',
            '65': 'Vượt quá hạn mức giao dịch',
            '75': 'Ngân hàng đang bảo trì',
          };
          setMessage(errorMessages[vnpResponseCode] || 'Thanh toán thất bại');

          toast({
            title: '❌ Thanh toán thất bại',
            description: message,
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error('Error processing VNPay callback:', error);
        setStatus('failed');
        setMessage('Có lỗi xảy ra khi xử lý kết quả thanh toán');
      }
    };

    processPayment();
  }, [searchParams]);

  const handleBackToDistributions = () => {
    router.push('/dashboard/dealer-manager/distributions');
  };

  return (
    <ProtectedRoute allowedRoles={['Dealer Manager']}>
      <DealerManagerLayout>
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle className="text-center text-2xl">
                Kết quả thanh toán
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Status Icon */}
              <div className="flex justify-center">
                {status === 'processing' && (
                  <div className="p-6 bg-blue-100 rounded-full">
                    <Loader2 className="h-16 w-16 text-blue-600 animate-spin" />
                  </div>
                )}
                {status === 'success' && (
                  <div className="p-6 bg-green-100 rounded-full">
                    <CheckCircle className="h-16 w-16 text-green-600" />
                  </div>
                )}
                {status === 'failed' && (
                  <div className="p-6 bg-red-100 rounded-full">
                    <XCircle className="h-16 w-16 text-red-600" />
                  </div>
                )}
              </div>

              {/* Message */}
              <div className="text-center">
                <h3 className={`text-xl font-semibold mb-2 ${
                  status === 'success' ? 'text-green-700' :
                  status === 'failed' ? 'text-red-700' :
                  'text-blue-700'
                }`}>
                  {status === 'success' && '✅ Thành công'}
                  {status === 'failed' && '❌ Thất bại'}
                  {status === 'processing' && '⏳ Đang xử lý'}
                </h3>
                <p className="text-gray-600">{message}</p>
                {distributionId && (
                  <p className="text-sm text-gray-500 mt-2">
                    Mã phân phối: <span className="font-semibold">#{distributionId}</span>
                  </p>
                )}
              </div>

              {/* Actions */}
              {status !== 'processing' && (
                <div className="flex gap-3">
                  <Button
                    onClick={handleBackToDistributions}
                    className="flex-1"
                    variant={status === 'success' ? 'default' : 'outline'}
                  >
                    Quay lại danh sách
                  </Button>
                  {status === 'failed' && (
                    <Button
                      onClick={handleBackToDistributions}
                      className="flex-1"
                      variant="default"
                    >
                      Thử lại
                    </Button>
                  )}
                </div>
              )}

              {/* Transaction Details */}
              {status !== 'processing' && (
                <div className="pt-4 border-t">
                  <div className="text-sm space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Mã giao dịch:</span>
                      <span className="font-mono text-xs">
                        {searchParams.get('vnp_TxnRef')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Thời gian:</span>
                      <span>{new Date().toLocaleString('vi-VN')}</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DealerManagerLayout>
    </ProtectedRoute>
  );
}
