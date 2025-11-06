'use client';

import { useEffect, useState } from 'react';
import { ProtectedRoute } from '@/components/auth-guards';
import CustomerLayout from '@/components/layout/customer-layout';
import { useAuth } from '@/contexts/AuthContext';
import { getAllCategories, Category } from '@/lib/categoryApi';
import {
  createTestDrive,
  getTestDrivesByUserId,
  cancelTestDrive,
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
        const [categoriesData, testDrivesData] = await Promise.all([
          getAllCategories(),
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
        return <Badge variant="secondary">Chờ phân công</Badge>;
      case TestDriveStatus.ASSIGNING:
        return <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">Đang phân công</Badge>;
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
            <Button
              onClick={() => {
                if (hasActiveTestDrive) {
                  toast({
                    title: 'Thông báo',
                    description: 'Bạn đã có yêu cầu lái thử đang chờ xử lý. Vui lòng hoàn thành hoặc hủy yêu cầu hiện tại trước khi tạo yêu cầu mới.',
                    variant: 'destructive',
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
          </div>

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
                <Card key={testDrive.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <CardTitle className="flex items-center gap-2">
                          <Car className="h-5 w-5" />
                          {testDrive.status === TestDriveStatus.PENDING 
                            ? testDrive.categoryName 
                            : (testDrive.productName || testDrive.categoryName)
                          }
                        </CardTitle>
                        <CardDescription>
                          Mã yêu cầu: #{testDrive.id}
                        </CardDescription>
                      </div>
                      {getStatusBadge(testDrive.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 mt-1 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Đại lý</p>
                          <p className="text-sm text-muted-foreground">
                            {testDrive.dealer.name}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Clock className="h-4 w-4 mt-1 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Thời gian</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(testDrive.scheduleDate), 'dd/MM/yyyy HH:mm', {
                              locale: vi,
                            })}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Vehicle Assignment Info - Shown when APPROVED or later */}
                    {(testDrive.status === TestDriveStatus.APPROVED || 
                      testDrive.status === TestDriveStatus.IN_PROGRESS || 
                      testDrive.status === TestDriveStatus.DONE) && testDrive.productName && (
                      <div className="pt-4 border-t bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 -mx-6 px-6 py-5">
                        {/* Success Header */}
                        <div className="flex items-start gap-3 p-4 bg-white dark:bg-gray-900 rounded-lg border-2 border-green-500 shadow-sm">
                          <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-base font-bold text-green-800 dark:text-green-200">
                              🎉 Đơn đã được duyệt - Yêu cầu đến đại lý để lái thử!
                            </p>
                            <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                              Lịch hẹn của bạn đã được xác nhận. Vui lòng đến đại lý đúng giờ để trải nghiệm xe.
                            </p>
                          </div>
                        </div>
                        
                        {/* Detail Button */}
                        <div className="mt-4">
                          <Button
                            onClick={() => {
                              console.log('🔍 Test Drive Detail Data:', testDrive);
                              console.log('👤 Escort Staff:', testDrive.escortStaff);
                              setSelectedTestDriveForDetail(testDrive);
                              setDetailDialogOpen(true);
                            }}
                            className="w-full bg-green-600 hover:bg-green-700"
                          >
                            <Car className="h-4 w-4 mr-2" />
                            Xem chi tiết lịch hẹn
                          </Button>
                        </div>
                      </div>
                    )}

                    {testDrive.notes && (
                      <div className="pt-2 border-t">
                        <p className="text-sm font-medium">Ghi chú</p>
                        <p className="text-sm text-muted-foreground">{testDrive.notes}</p>
                      </div>
                    )}

                    {testDrive.status === TestDriveStatus.PENDING && (
                      <div className="pt-2 border-t">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            setSelectedTestDriveId(testDrive.id);
                            setCancelDialogOpen(true);
                          }}
                          className="gap-2"
                        >
                          <X className="h-4 w-4" />
                          Hủy yêu cầu
                        </Button>
                      </div>
                    )}
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
                        categories.map((category) => (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            {category.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Chọn loại xe, nhân viên sẽ chọn xe cụ thể và người đi cùng cho bạn
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
                            {selectedTestDriveForDetail.escortStaff.fullName}
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
                          <li>Thời gian lái thử dự kiến: <strong>30-60 phút</strong></li>
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
        </div>
      </CustomerLayout>
    </ProtectedRoute>
  );
}

export default TestDrivePage;
