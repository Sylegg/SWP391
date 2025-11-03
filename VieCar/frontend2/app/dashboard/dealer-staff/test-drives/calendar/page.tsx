'use client';

import { useState, useEffect, useCallback } from 'react';
import { ProtectedRoute } from '@/components/auth-guards';
import DealerStaffLayout from '@/components/layout/dealer-staff-layout';
import { useAuth } from '@/contexts/AuthContext';
import { Calendar, momentLocalizer, View } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { getTestDrivesByDealerId, updateTestDrive, TestDriveRes } from '@/lib/testDriveApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Calendar as CalendarIcon, Clock, User, Car, Phone, Mail } from 'lucide-react';

const localizer = momentLocalizer(moment);

const statusColors: Record<string, string> = {
  PENDING: '#FFA500',      // Orange - Chờ xác nhận
  ASSIGNING: '#FF8C00',    // Dark Orange - Đang chờ phân công
  APPROVED: '#4169E1',     // Blue - Đã phê duyệt
  IN_PROGRESS: '#9333EA',  // Purple - Đang thực hiện
  DONE: '#32CD32',         // Green - Hoàn thành
  REJECTED: '#DC143C',     // Red - Đã từ chối
  CANCELLED: '#6B7280',    // Gray - Đã hủy
};

const statusLabels: Record<string, string> = {
  PENDING: 'Chờ xác nhận',
  ASSIGNING: 'Đang chờ phân công',
  APPROVED: 'Đã phê duyệt',
  IN_PROGRESS: 'Đang thực hiện',
  DONE: 'Hoàn thành',
  REJECTED: 'Đã từ chối',
  CANCELLED: 'Đã hủy',
};

interface CalendarEvent {
  id: number;
  title: string;
  start: Date;
  end: Date;
  resource: TestDriveRes;
}

export default function TestDriveCalendarPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [view, setView] = useState<View>('month');
  const [date, setDate] = useState(new Date());
  
  // Edit state
  const [editStatus, setEditStatus] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editVIN, setEditVIN] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (user?.dealerId) {
      loadTestDrives();
    }
  }, [user?.dealerId]);

  const loadTestDrives = async () => {
    if (!user?.dealerId) return;
    
    try {
      setLoading(true);
      const testDrives = await getTestDrivesByDealerId(user.dealerId);
      
      const calendarEvents: CalendarEvent[] = testDrives.map(td => {
        const startDate = new Date(td.scheduleDate);
        const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // 2 hours
        
        // Use category name if product not assigned yet
        const vehicleInfo = td.productName || td.categoryName || 'Xe điện';
        
        return {
          id: td.id,
          title: `${vehicleInfo} - ${td.user.name}`,
          start: startDate,
          end: endDate,
          resource: td,
        };
      });
      
      setEvents(calendarEvents);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: 'Không thể tải lịch lái thử',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setEditStatus(event.resource.status);
    setEditNotes(event.resource.notes || '');
    setEditVIN(event.resource.specificVIN || '');
    setIsDetailOpen(true);
  };

  const handleUpdateTestDrive = async () => {
    if (!selectedEvent) return;
    
    try {
      setUpdating(true);
      await updateTestDrive(selectedEvent.id, {
        status: editStatus,
        notes: editNotes,
        specificVIN: editVIN,
      });
      
      toast({
        title: 'Thành công',
        description: 'Đã cập nhật lịch lái thử',
      });
      
      setIsDetailOpen(false);
      loadTestDrives();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: 'Không thể cập nhật lịch lái thử',
      });
    } finally {
      setUpdating(false);
    }
  };

  const eventStyleGetter = (event: CalendarEvent) => {
    const backgroundColor = statusColors[event.resource.status] || '#6B7280';
    return {
      style: {
        backgroundColor,
        borderRadius: '5px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block',
      },
    };
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['Dealer Staff', 'Admin']}>
        <DealerStaffLayout>
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-4 text-gray-600">Đang tải...</p>
            </div>
          </div>
        </DealerStaffLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['Dealer Staff', 'Admin']}>
      <DealerStaffLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Lịch Lái Thử</h1>
              <p className="text-muted-foreground mt-2">
                Xem lịch lái thử dạng calendar
              </p>
            </div>
            <Button onClick={loadTestDrives} disabled={loading}>
              Làm mới
            </Button>
          </div>

          {/* Legend */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Chú thích màu sắc</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                {Object.entries(statusLabels).map(([key, label]) => (
                  <div key={key} className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: statusColors[key] }}
                    />
                    <span className="text-sm">{label}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Calendar */}
          <Card>
            <CardContent className="p-6">
              <div style={{ height: '600px' }}>
                <Calendar
                  localizer={localizer}
                  events={events}
                  startAccessor="start"
                  endAccessor="end"
                  style={{ height: '100%' }}
                  onSelectEvent={handleSelectEvent}
                  eventPropGetter={eventStyleGetter}
                  view={view}
                  onView={setView}
                  date={date}
                  onNavigate={setDate}
                  messages={{
                    next: 'Tiếp',
                    previous: 'Trước',
                    today: 'Hôm nay',
                    month: 'Tháng',
                    week: 'Tuần',
                    day: 'Ngày',
                    agenda: 'Lịch trình',
                    date: 'Ngày',
                    time: 'Thời gian',
                    event: 'Sự kiện',
                    noEventsInRange: 'Không có lịch hẹn nào trong khoảng thời gian này',
                  }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Detail Dialog */}
          <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Chi tiết Lịch Lái Thử</DialogTitle>
                <DialogDescription>
                  Xem và cập nhật thông tin lịch hẹn
                </DialogDescription>
              </DialogHeader>

              {selectedEvent && (
                <div className="space-y-4">
                  {/* Customer Info */}
                  <div className="space-y-2">
                    <h4 className="font-semibold flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Thông tin khách hàng
                    </h4>
                    <div className="text-sm space-y-1 p-3 bg-muted rounded-md">
                      <p className="font-medium">{selectedEvent.resource.user.name}</p>
                      <p className="text-muted-foreground flex items-center gap-2">
                        <Phone className="h-3 w-3" />
                        {selectedEvent.resource.user.phone}
                      </p>
                      <p className="text-muted-foreground flex items-center gap-2">
                        <Mail className="h-3 w-3" />
                        {selectedEvent.resource.user.email}
                      </p>
                    </div>
                  </div>

                  {/* Vehicle Info */}
                  <div className="space-y-2">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Car className="h-4 w-4" />
                      Thông tin xe
                    </h4>
                    <div className="text-sm p-3 bg-muted rounded-md">
                      <p className="font-medium">
                        {selectedEvent.resource.productName || selectedEvent.resource.categoryName || 'Chưa chọn xe'}
                      </p>
                    </div>
                  </div>

                  {/* Schedule Info */}
                  <div className="space-y-2">
                    <h4 className="font-semibold flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4" />
                      Thời gian
                    </h4>
                    <div className="text-sm p-3 bg-muted rounded-md">
                      <p className="flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        {selectedEvent.start.toLocaleString('vi-VN')}
                      </p>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Trạng thái</label>
                    <Select value={editStatus} onValueChange={setEditStatus}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PENDING">Chờ xác nhận</SelectItem>
                        <SelectItem value="ASSIGNING">Đang chờ phân công</SelectItem>
                        <SelectItem value="APPROVED">Đã phê duyệt</SelectItem>
                        <SelectItem value="IN_PROGRESS">Đang thực hiện</SelectItem>
                        <SelectItem value="DONE">Hoàn thành</SelectItem>
                        <SelectItem value="REJECTED">Đã từ chối</SelectItem>
                        <SelectItem value="CANCELLED">Đã hủy</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* VIN Number */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Số VIN</label>
                    <Input
                      value={editVIN}
                      onChange={(e) => setEditVIN(e.target.value)}
                      placeholder="Nhập số VIN..."
                    />
                  </div>

                  {/* Notes */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Ghi chú</label>
                    <Textarea
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                      placeholder="Nhập ghi chú..."
                      rows={3}
                    />
                  </div>
                </div>
              )}

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsDetailOpen(false)}
                  disabled={updating}
                >
                  Đóng
                </Button>
                <Button onClick={handleUpdateTestDrive} disabled={updating}>
                  {updating ? 'Đang cập nhật...' : 'Cập nhật'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </DealerStaffLayout>
    </ProtectedRoute>
  );
}
