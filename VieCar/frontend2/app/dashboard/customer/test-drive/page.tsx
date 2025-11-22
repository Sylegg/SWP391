'use client';

import { useEffect, useState } from 'react';
import { ProtectedRoute } from '@/components/auth-guards';
import CustomerLayout from '@/components/layout/customer-layout';
import { useAuth } from '@/contexts/AuthContext';
import { getAllCategories, Category, getCategoriesByDealerId } from '@/lib/categoryApi';
import {
  createTestDrive,
  getTestDrivesByUserId,
  cancelTestDrive,
  startTestDrive,
  TestDriveRes,
  TestDriveStatus,
} from '@/lib/testDriveApi';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
  CalendarIcon,
  Car,
  MapPin,
  Clock,
  Plus,
  X,
  CheckCircle2,
  XCircle,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

function TestDrivePage() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [testDrives, setTestDrives] = useState<TestDriveRes[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showNewRequestDialog, setShowNewRequestDialog] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedTestDriveId, setSelectedTestDriveId] = useState<number | null>(null);
  const [selectedTestDriveForDetail, setSelectedTestDriveForDetail] = useState<TestDriveRes | null>(null);
  const [hasActiveTestDrive, setHasActiveTestDrive] = useState(false);
  const [completedCategoryIds, setCompletedCategoryIds] = useState<Set<number>>(new Set());

  // Form state
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [scheduleDate, setScheduleDate] = useState<Date>();
  const [scheduleTime, setScheduleTime] = useState<string>('09:00');
  const [notes, setNotes] = useState<string>('');

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Chỉ lấy danh mục của đại lý mà customer đang thuộc về
        const categoriesPromise = user?.dealerId 
          ? getCategoriesByDealerId(typeof user.dealerId === 'string' ? parseInt(user.dealerId) : user.dealerId)
          : Promise.resolve([]);
        
        const [categoriesData, testDrivesData] = await Promise.all([
          categoriesPromise,
          user?.id && user.id !== 'guest' ? getTestDrivesByUserId(parseInt(user.id)) : Promise.resolve([]),
        ]);
        
        setCategories(categoriesData);
        setTestDrives(testDrivesData);
        
        // Check if user has any active test drive
        const activeTestDrive = testDrivesData.find(td => 
          td.status !== TestDriveStatus.DONE && 
          td.status !== TestDriveStatus.REJECTED && 
          td.status !== TestDriveStatus.CANCELLED
        );
        setHasActiveTestDrive(!!activeTestDrive);
        
        // Get list of completed category IDs
        const completedIds = new Set(
          testDrivesData
            .filter((td) => td.status === TestDriveStatus.DONE && td.categoryId)
            .map((td) => td.categoryId as number)
        );
        setCompletedCategoryIds(completedIds);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: 'Lỗi',
          description: 'Không thể tải dữ liệu. Vui lòng thử lại.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    // Auto-refresh every 10 seconds to get latest status updates
    const intervalId = setInterval(() => {
      if (user?.id && user.id !== 'guest') {
        getTestDrivesByUserId(parseInt(user.id))
          .then(testDrivesData => {
            setTestDrives(testDrivesData);
            const activeTestDrive = testDrivesData.find(td => 
              td.status !== TestDriveStatus.DONE && 
              td.status !== TestDriveStatus.REJECTED && 
              td.status !== TestDriveStatus.CANCELLED
            );
            setHasActiveTestDrive(!!activeTestDrive);
          })
          .catch(error => {
            console.error('Error refreshing test drives:', error);
          });
      }
    }, 10000); // Refresh every 10 seconds

    return () => clearInterval(intervalId);
  }, [user]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.id || user.id === 'guest') {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng đăng nhập để tiếp tục.',
        variant: 'destructive',
      });
      return;
    }

    if (!user?.dealerId) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng chọn đại lý trước khi yêu cầu lái thử.',
        variant: 'destructive',
      });
      return;
    }

    console.log('Current user object:', user);
    console.log('User dealerId:', user.dealerId, 'Type:', typeof user.dealerId);

    if (!selectedCategory || !scheduleDate) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng điền đầy đủ thông tin bắt buộc.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSubmitting(true);
      
      // Combine date and time
      const scheduleDateTimeString = `${format(scheduleDate, 'yyyy-MM-dd')}T${scheduleTime}:00`;

      // Ensure dealerId is a valid number
      let dealerId: number;
      
      if (typeof user.dealerId === 'string') {
        dealerId = parseInt(user.dealerId, 10);
      } else if (typeof user.dealerId === 'number') {
        dealerId = user.dealerId;
      } else {
        toast({
          title: 'Lỗi',
          description: 'Thông tin đại lý không hợp lệ. Vui lòng chọn lại đại lý ở trang tổng quan.',
          variant: 'destructive',
        });
        setSubmitting(false);
        return;
      }

      if (isNaN(dealerId) || dealerId <= 0) {
        toast({
          title: 'Lỗi',
          description: 'Thông tin đại lý không hợp lệ. Vui lòng chọn lại đại lý ở trang tổng quan.',
          variant: 'destructive',
        });
        setSubmitting(false);
        return;
      }

      const testDriveData = {
        userId: parseInt(user.id),
        categoryId: parseInt(selectedCategory),
        dealerId: dealerId,
        scheduleDate: scheduleDateTimeString,
        notes: notes || undefined,
      };

      console.log('=== TEST DRIVE SUBMISSION ===');
      console.log('User object:', user);
      console.log('Parsed dealerId:', dealerId, 'Type:', typeof dealerId);
      console.log('Full request data:', JSON.stringify(testDriveData, null, 2));
      console.log('===========================');

      await createTestDrive(testDriveData);

      toast({
        title: 'Thành công',
        description: 'Yêu cầu lái thử đã được gửi thành công!',
      });

      // Reset form
      setSelectedCategory('');
      setScheduleDate(undefined);
      setScheduleTime('09:00');
      setNotes('');
      setShowNewRequestDialog(false);

      // Refresh test drives list
      if (user?.id && user.id !== 'guest') {
        const updatedTestDrives = await getTestDrivesByUserId(parseInt(user.id));
        setTestDrives(updatedTestDrives);
        
        // Update active test drive status
        const activeTestDrive = updatedTestDrives.find(td => 
          td.status !== TestDriveStatus.DONE && 
          td.status !== TestDriveStatus.REJECTED && 
          td.status !== TestDriveStatus.CANCELLED
        );
        setHasActiveTestDrive(!!activeTestDrive);
        
        // Update completed categories
        const completedIds = new Set(
          updatedTestDrives
            .filter((td) => td.status === TestDriveStatus.DONE && td.categoryId)
            .map((td) => td.categoryId as number)
        );
        setCompletedCategoryIds(completedIds);
      }
    } catch (error: any) {
      console.error('Error creating test drive:', error);
      
      // Extract error message from backend response
      let errorMessage = 'Không thể tạo yêu cầu lái thử. Vui lòng thử lại.';
      
      // Try to parse error message as JSON
      if (error.message) {
        try {
          const errorData = JSON.parse(error.message);
          if (errorData.message) {
            errorMessage = errorData.message;
          }
        } catch {
          // If not JSON, use the error message as is
          errorMessage = error.message;
        }
      }
      
      toast({
        title: 'Lỗi',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle cancel test drive
  const handleCancelTestDrive = async () => {
    if (!selectedTestDriveId) return;

    try {
      await cancelTestDrive(selectedTestDriveId);
      
      toast({
        title: 'Thành công',
        description: 'Yêu cầu lái thử đã được hủy.',
      });

      // Refresh test drives list
      if (user?.id && user.id !== 'guest') {
        const updatedTestDrives = await getTestDrivesByUserId(parseInt(user.id));
        setTestDrives(updatedTestDrives);
        
        // Update active test drive status
        const activeTestDrive = updatedTestDrives.find(td => 
          td.status !== TestDriveStatus.DONE && 
          td.status !== TestDriveStatus.REJECTED && 
          td.status !== TestDriveStatus.CANCELLED
        );
        setHasActiveTestDrive(!!activeTestDrive);
      }
    } catch (error: any) {
      console.error('Error canceling test drive:', error);
      
      // Extract error message from backend response
      let errorMessage = 'Không thể hủy yêu cầu. Vui lòng thử lại.';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: 'Lỗi',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setCancelDialogOpen(false);
      setSelectedTestDriveId(null);
    }
  };

  // Get status badge
  const getStatusBadge = (status: TestDriveStatus) => {
    switch (status) {
      case TestDriveStatus.PENDING:
        return <Badge variant="secondary">Chờ xác nhận</Badge>;
      case TestDriveStatus.ASSIGNING:
        return <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">Chờ phân công</Badge>;
      case TestDriveStatus.APPROVED:
        return <Badge variant="default" className="bg-green-500">Đã xác nhận</Badge>;
      case TestDriveStatus.IN_PROGRESS:
        return <Badge variant="default" className="bg-blue-500">Đang lái thử</Badge>;
      case TestDriveStatus.DONE:
        return <Badge variant="default" className="bg-purple-500">Hoàn thành</Badge>;
      case TestDriveStatus.REJECTED:
        return <Badge variant="destructive">Đã từ chối</Badge>;
      case TestDriveStatus.CANCELLED:
        return <Badge variant="outline">Đã hủy</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['Customer']}>
        <CustomerLayout>
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </CustomerLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['Customer']}>
      <CustomerLayout>
        <div className="container mx-auto p-6 max-w-7xl">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Lái thử xe</h1>
              <p className="text-muted-foreground mt-2">
                Đặt lịch lái thử các dòng xe điện VinFast
              </p>
            </div>

            {user?.dealerId && (
              <Button
                onClick={() => {
                  if (hasActiveTestDrive) {
                    toast({
                      title: 'Thông báo',
                      description: 'Bạn đã có yêu cầu lái thử đang chờ xử lý. Vui lòng hoàn thành hoặc hủy yêu cầu hiện tại trước khi tạo yêu cầu mới.',
                      variant: 'destructive',
                      duration: 3000,
                    });
                  } else {
                    setShowNewRequestDialog(true);
                  }
                }}
                size="lg"
                className="gap-2"
                disabled={hasActiveTestDrive}
              >
                <Plus className="h-5 w-5" />
                {hasActiveTestDrive ? 'Đã có yêu cầu đang xử lý' : 'Yêu cầu lái thử mới'}
              </Button>
            )}
          </div>

          {/* ⭐ Thông báo chưa chọn đại lý */}
          {!user?.dealerId && (
            <Card className="border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50 mb-6">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-amber-500/20">
                    <Car className="h-6 w-6 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-amber-900 mb-2">
                      Vui lòng chọn đại lý trước
                    </h3>
                    <p className="text-amber-700 mb-4">
                      Bạn cần chọn đại lý để đặt lịch lái thử xe tại đại lý đó
                    </p>
                    <Button 
                      onClick={() => window.location.href = '/dashboard/customer'}
                      className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
                    >
                      <MapPin className="mr-2 h-4 w-4" />
                      Chọn đại lý ngay
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {user?.dealerId && (
            <>

          {/* Test Drives List */}
          <div className="space-y-4">
            {testDrives.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Car className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Chưa có yêu cầu lái thử</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Bạn chưa có yêu cầu lái thử nào. Hãy tạo yêu cầu mới để trải nghiệm xe!
                  </p>
                  <Button onClick={() => setShowNewRequestDialog(true)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Tạo yêu cầu đầu tiên
                  </Button>
                </CardContent>
              </Card>
            ) : (
              testDrives.map((testDrive) => (
                <Card key={testDrive.id} className="hover:shadow-lg transition-all border-2">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <CardTitle className="flex items-center gap-2 text-xl">
                          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                            <Car className="h-5 w-5 text-blue-600" />
                          </div>
                          {testDrive.status === TestDriveStatus.PENDING 
                            ? testDrive.categoryName 
                            : (testDrive.productName || testDrive.categoryName)
                          }
                        </CardTitle>
                      </div>
                      {getStatusBadge(testDrive.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-6">
                    {/* Info Grid - More detailed */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Dealer Info */}
                      <div className="flex items-start gap-3 p-3 bg-orange-50 dark:bg-orange-950 rounded-lg border border-orange-200 dark:border-orange-800">
                        <MapPin className="h-5 w-5 mt-0.5 text-orange-600" />
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-orange-900 dark:text-orange-100">Đại lý</p>
                          <p className="text-sm text-orange-700 dark:text-orange-300 font-medium">
                            {testDrive.dealer.name}
                          </p>
                          {testDrive.dealer.address && (
                            <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                              📍 {testDrive.dealer.address}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Schedule Info */}
                      <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                        <Clock className="h-5 w-5 mt-0.5 text-blue-600" />
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">Thời gian</p>
                          <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                            {format(new Date(testDrive.scheduleDate), 'EEEE, dd/MM/yyyy', {
                              locale: vi,
                            })}
                          </p>
                          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                            🕐 {format(new Date(testDrive.scheduleDate), 'HH:mm', {
                              locale: vi,
                            })}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Product Info - Show if assigned */}
                    {testDrive.productName && testDrive.status !== TestDriveStatus.PENDING && (
                      <div className="flex items-start gap-3 p-3 bg-purple-50 dark:bg-purple-950 rounded-lg border border-purple-200 dark:border-purple-800">
                        <Car className="h-5 w-5 mt-0.5 text-purple-600" />
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-purple-900 dark:text-purple-100">Xe được phân công</p>
                          <p className="text-sm text-purple-700 dark:text-purple-300 font-medium">
                            {testDrive.productName}
                          </p>
                          {testDrive.specificVIN && (
                            <p className="text-xs text-purple-600 dark:text-purple-400 mt-1 font-mono">
                              VIN: {testDrive.specificVIN}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {testDrive.notes && (
                      <div className="pt-2 border-t">
                        <p className="text-sm font-medium mb-1">Ghi chú của bạn</p>
                        <p className="text-sm text-muted-foreground bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                          {testDrive.notes}
                        </p>
                      </div>
                    )}

                    {/* Action Buttons Based on Status */}
                    <div className="pt-4 border-t space-y-2">
                      {/* APPROVED Status - Show detail button only */}
                      {testDrive.status === TestDriveStatus.APPROVED && (
                        <Button
                          onClick={() => {
                            setSelectedTestDriveForDetail(testDrive);
                            setDetailDialogOpen(true);
                          }}
                          variant="default"
                          className="w-full"
                        >
                          <Car className="h-4 w-4 mr-2" />
                          Xem chi tiết lịch hẹn
                        </Button>
                      )}

                      {/* IN_PROGRESS or DONE Status - Show detail button only */}
                      {(testDrive.status === TestDriveStatus.IN_PROGRESS || 
                        testDrive.status === TestDriveStatus.DONE) && (
                        <Button
                          onClick={() => {
                            setSelectedTestDriveForDetail(testDrive);
                            setDetailDialogOpen(true);
                          }}
                          variant="default"
                          className="w-full"
                        >
                          <Car className="h-4 w-4 mr-2" />
                          Xem chi tiết lịch hẹn
                        </Button>
                      )}

                      {/* PENDING or ASSIGNING Status - Show cancel button */}
                      {(testDrive.status === TestDriveStatus.PENDING || testDrive.status === TestDriveStatus.ASSIGNING) && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            setSelectedTestDriveId(testDrive.id);
                            setCancelDialogOpen(true);
                          }}
                          className="w-full"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Hủy yêu cầu
                        </Button>
                      )}

                      {/* APPROVED Status - Show cancel if past schedule time */}
                      {testDrive.status === TestDriveStatus.APPROVED && 
                       new Date(testDrive.scheduleDate) < new Date() && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            setSelectedTestDriveId(testDrive.id);
                            setCancelDialogOpen(true);
                          }}
                          className="w-full"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Hủy lịch (Quá giờ hẹn)
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* New Request Dialog */}
          <Dialog open={showNewRequestDialog} onOpenChange={setShowNewRequestDialog}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Yêu cầu lái thử xe mới</DialogTitle>
                <DialogDescription>
                  Điền thông tin để đặt lịch lái thử xe. Đại lý sẽ xác nhận yêu cầu của bạn.
                </DialogDescription>
              </DialogHeader>

              {/* Dealer Information Display */}
              {user?.dealerName && (
                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div className="text-sm">
                    <span className="text-muted-foreground">Đại lý: </span>
                    <span className="font-medium">{user.dealerName}</span>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6 py-4">
                {/* Category Selection */}
                <div className="space-y-2">
                  <Label htmlFor="category">
                    Chọn loại xe <span className="text-destructive">*</span>
                  </Label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Chọn loại xe bạn muốn lái thử" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.length === 0 ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                          Hiện tại không có loại xe nào
                        </div>
                      ) : (
                        categories.map((category) => {
                          const isCompleted = completedCategoryIds.has(category.id);
                          return (
                            <SelectItem 
                              key={category.id} 
                              value={category.id.toString()}
                            >
                              <div className="flex items-center justify-between w-full">
                                <span>
                                  {category.name}
                                </span>
                                {isCompleted && (
                                  <Badge variant="outline" className="ml-2 text-xs bg-green-50 text-green-700 border-green-300">
                                    ✓ Đã lái thử
                                  </Badge>
                                )}
                              </div>
                            </SelectItem>
                          );
                        })
                      )}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Chọn loại xe, nhân viên sẽ chọn xe cụ thể và người đi cùng cho bạn.
                    {completedCategoryIds.size > 0 && (
                      <span className="text-green-600 font-medium">
                        {' '}Bạn có thể đăng ký lái thử lại các loại xe đã lái.
                      </span>
                    )}
                  </p>
                </div>

                {/* Date Selection */}
                <div className="space-y-2">
                  <Label>
                    Ngày lái thử <span className="text-destructive">*</span>
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          !scheduleDate && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {scheduleDate ? (
                          format(scheduleDate, 'dd/MM/yyyy', { locale: vi })
                        ) : (
                          <span>Chọn ngày</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={scheduleDate}
                        onSelect={setScheduleDate}
                        disabled={(date) =>
                          date < new Date() || date < new Date('1900-01-01')
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Time Selection */}
                <div className="space-y-2">
                  <Label htmlFor="time">
                    Giờ lái thử <span className="text-destructive">*</span>
                  </Label>
                  <Select value={scheduleTime} onValueChange={setScheduleTime}>
                    <SelectTrigger id="time">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 10 }, (_, i) => i + 8).map((hour) => (
                        <SelectItem key={hour} value={`${hour.toString().padStart(2, '0')}:00`}>
                          {hour.toString().padStart(2, '0')}:00
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes">Ghi chú</Label>
                  <Textarea
                    id="notes"
                    placeholder="Thêm ghi chú hoặc yêu cầu đặc biệt..."
                    rows={4}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowNewRequestDialog(false)}
                    disabled={submitting}
                  >
                    Hủy
                  </Button>
                  <Button type="submit" disabled={submitting} className="gap-2">
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Đang gửi...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        Gửi yêu cầu
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* Detail Dialog - Show vehicle, staff, dealer info */}
          <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  Chi tiết lịch hẹn lái thử
                </DialogTitle>
                <DialogDescription>
                  Thông tin chi tiết về xe, nhân viên hỗ trợ và địa điểm lái thử
                </DialogDescription>
              </DialogHeader>

              {selectedTestDriveForDetail && (
                <div className="space-y-4">
                  {/* Attempt Number Badge - Show if this is 2nd+ attempt */}
                  {selectedTestDriveForDetail.attemptNumber && selectedTestDriveForDetail.attemptNumber > 1 && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <div className="bg-blue-100 dark:bg-blue-800 rounded-full p-1">
                          <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <p className="text-sm font-semibold text-blue-800 dark:text-blue-200">
                          Lần lái thử thứ {selectedTestDriveForDetail.attemptNumber} cho danh mục này
                        </p>
                      </div>
                    </div>
                  )}
                  {/* Vehicle & Staff Info Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Assigned Vehicle Card */}
                    <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                          <Car className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                          Xe được phân công
                        </p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-base font-bold text-gray-900 dark:text-gray-100">
                          {selectedTestDriveForDetail.productName}
                        </p>
                        {selectedTestDriveForDetail.specificVIN && (
                          <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                            <span className="font-medium">VIN:</span>
                            <span className="font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                              {selectedTestDriveForDetail.specificVIN}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Escort Staff Card */}
                    {selectedTestDriveForDetail.escortStaff && (
                      <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                            <Car className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                          </div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                            Nhân viên hộ tống
                          </p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-base font-bold text-gray-900 dark:text-gray-100">
                            {selectedTestDriveForDetail.escortStaff.name}
                          </p>
                          {selectedTestDriveForDetail.escortStaff.phone && (
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                              <span>📞</span>
                              <a 
                                href={`tel:${selectedTestDriveForDetail.escortStaff.phone}`}
                                className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                              >
                                {selectedTestDriveForDetail.escortStaff.phone}
                              </a>
                            </div>
                          )}
                          {selectedTestDriveForDetail.escortStaff.email && (
                            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-500">
                              <span>✉️</span>
                              <span className="truncate">{selectedTestDriveForDetail.escortStaff.email}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Dealer Info Card */}
                  <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                        <MapPin className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                      </div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        Địa điểm lái thử
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-base font-bold text-gray-900 dark:text-gray-100">
                        {selectedTestDriveForDetail.dealer.name}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {selectedTestDriveForDetail.dealer.address || 'Đang cập nhật địa chỉ'}
                      </p>
                      {selectedTestDriveForDetail.dealer.phone && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <span>📞</span>
                          <a 
                            href={`tel:${selectedTestDriveForDetail.dealer.phone}`}
                            className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                          >
                            {selectedTestDriveForDetail.dealer.phone}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Important Notes */}
                  <div className="bg-yellow-50 dark:bg-yellow-950 border-l-4 border-yellow-500 p-4 rounded-r-lg">
                    <div className="flex items-start gap-2">
                      <span className="text-yellow-600 dark:text-yellow-400 text-xl">⚠️</span>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                          Lưu ý quan trọng
                        </p>
                        <ul className="text-xs text-yellow-700 dark:text-yellow-300 space-y-1.5 list-disc list-inside">
                          <li>Vui lòng đến <strong>đúng giờ hẹn</strong> để được phục vụ tốt nhất</li>
                          <li>Mang theo <strong>CCCD/CMND</strong> và <strong>Giấy phép lái xe</strong> hợp lệ</li>
                          <li>Nếu cần thay đổi, vui lòng liên hệ trước <strong>24 giờ</strong></li>
                          <li>Thời gian lái thử dự kiến: <strong>15-20 phút</strong></li>
                          <li>Nhân viên sẽ hỗ trợ bạn trong suốt quá trình trải nghiệm</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <DialogFooter>
                <Button onClick={() => setDetailDialogOpen(false)}>
                  Đóng
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Cancel Confirmation Dialog */}
          <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Xác nhận hủy yêu cầu</AlertDialogTitle>
                <AlertDialogDescription>
                  Bạn có chắc chắn muốn hủy yêu cầu lái thử này? Hành động này không thể hoàn tác.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Không</AlertDialogCancel>
                <AlertDialogAction onClick={handleCancelTestDrive} className="bg-destructive hover:bg-destructive/90">
                  Có, hủy yêu cầu
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          </>
          )}
        </div>
      </CustomerLayout>
    </ProtectedRoute>
  );
}

export default TestDrivePage;
