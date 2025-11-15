'use client';

import { useState, useEffect, useCallback } from 'react';
import { ProtectedRoute } from '@/components/auth-guards';
import DealerStaffLayout from '@/components/layout/dealer-staff-layout';
import { useAuth } from '@/contexts/AuthContext';
import { Calendar, momentLocalizer, View } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { getTestDrivesByDealerId, TestDriveRes } from '@/lib/testDriveApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Calendar as CalendarIcon, Clock, User, Car, Phone, Mail, MapPin, FileText, Star, Settings, Activity } from 'lucide-react';

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
    setIsDetailOpen(true);
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
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Lịch Lái Thử
              </h1>
              <p className="text-muted-foreground mt-2">
                Xem lịch lái thử dạng calendar với màu sắc trực quan
              </p>
            </div>
            <Button onClick={loadTestDrives} disabled={loading} className="gap-2">
              <Activity className="h-4 w-4" />
              Làm mới
            </Button>
          </div>

          {/* Legend */}
          <Card className="shadow-lg border-2">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
              <CardTitle className="text-sm flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Chú thích màu sắc
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                {Object.entries(statusLabels).map(([key, label]) => (
                  <div 
                    key={key} 
                    className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-default"
                  >
                    <div
                      className="w-5 h-5 rounded-md shadow-sm animate-pulse"
                      style={{ 
                        backgroundColor: statusColors[key],
                        animationDuration: '2s'
                      }}
                    />
                    <span className="text-xs font-medium">{label}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Calendar */}
          <Card className="shadow-xl border-2 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-950 dark:via-purple-950 dark:to-pink-950 border-b-2">
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                Lịch trình lái thử
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <style jsx global>{`
                .rbc-calendar {
                  font-family: inherit;
                }
                .rbc-header {
                  padding: 12px 6px;
                  font-weight: 600;
                  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                  color: white;
                  border: none !important;
                  text-transform: uppercase;
                  font-size: 0.75rem;
                  letter-spacing: 0.5px;
                }
                .rbc-today {
                  background-color: #fef3c7 !important;
                }
                .rbc-off-range-bg {
                  background: #f9fafb;
                }
                .rbc-event {
                  border-radius: 6px !important;
                  padding: 4px 8px !important;
                  border: none !important;
                  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                  transition: all 0.2s ease;
                  cursor: pointer;
                  font-size: 0.75rem;
                  font-weight: 500;
                }
                .rbc-event:hover {
                  transform: translateY(-2px);
                  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
                  opacity: 1 !important;
                }
                .rbc-event-label {
                  display: none;
                }
                .rbc-toolbar {
                  padding: 16px;
                  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                  border-radius: 8px;
                  margin-bottom: 16px;
                  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                }
                .rbc-toolbar button {
                  color: white;
                  border: 1px solid rgba(255,255,255,0.3);
                  background: rgba(255,255,255,0.1);
                  padding: 8px 16px;
                  border-radius: 6px;
                  font-weight: 500;
                  transition: all 0.2s ease;
                }
                .rbc-toolbar button:hover {
                  background: rgba(255,255,255,0.2);
                  border-color: rgba(255,255,255,0.5);
                  transform: translateY(-1px);
                }
                .rbc-toolbar button.rbc-active {
                  background: white;
                  color: #667eea;
                  border-color: white;
                  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                .rbc-toolbar-label {
                  font-weight: 700;
                  font-size: 1.1rem;
                }
                .rbc-month-view {
                  border: 2px solid #e5e7eb;
                  border-radius: 8px;
                  overflow: hidden;
                }
                .rbc-day-bg {
                  border-color: #e5e7eb !important;
                }
                .rbc-date-cell {
                  padding: 6px;
                  font-weight: 600;
                  color: #374151;
                }
                .rbc-date-cell.rbc-now {
                  font-weight: 700;
                  color: #7c3aed;
                }
                .rbc-show-more {
                  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                  color: white;
                  border-radius: 4px;
                  padding: 2px 6px;
                  font-size: 0.7rem;
                  font-weight: 600;
                  margin: 2px;
                }
                
                /* Agenda View Styles */
                .rbc-agenda-view {
                  border: 2px solid #e5e7eb;
                  border-radius: 8px;
                  overflow: hidden;
                  background: white;
                }
                .rbc-agenda-view table.rbc-agenda-table {
                  width: 100%;
                  border-collapse: collapse;
                  table-layout: fixed;
                }
                .rbc-agenda-view table.rbc-agenda-table thead > tr > th {
                  padding: 16px 20px;
                  font-weight: 700;
                  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                  color: white;
                  border: none !important;
                  text-align: left;
                  font-size: 0.8rem;
                  text-transform: uppercase;
                  letter-spacing: 1px;
                  vertical-align: middle;
                }
                /* Hide DATE column header and show TIME */
                .rbc-agenda-view table.rbc-agenda-table thead > tr > th:nth-child(1) {
                  width: 0;
                  padding: 0;
                  border: 0;
                  overflow: hidden;
                  display: none;
                }
                .rbc-agenda-view table.rbc-agenda-table thead > tr > th:nth-child(2) {
                  width: 30%;
                }
                .rbc-agenda-view table.rbc-agenda-table thead > tr > th:nth-child(3) {
                  width: 70%;
                }
                .rbc-agenda-view table.rbc-agenda-table tbody > tr {
                  transition: all 0.2s ease;
                }
                .rbc-agenda-view table.rbc-agenda-table tbody > tr:hover {
                  background: #f8f9ff;
                  transform: scale(1.01);
                  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.15);
                }
                .rbc-agenda-view table.rbc-agenda-table tbody > tr > td {
                  padding: 16px 20px;
                  vertical-align: middle;
                  border-bottom: 1px solid #e5e7eb;
                }
                /* Hide DATE column cells */
                .rbc-agenda-view table.rbc-agenda-table tbody > tr > td:nth-child(1) {
                  width: 0;
                  padding: 0;
                  border: 0;
                  overflow: hidden;
                  display: none;
                }
                /* TIME column */
                .rbc-agenda-view table.rbc-agenda-table tbody > tr > td:nth-child(2) {
                  width: 30%;
                  white-space: nowrap;
                  background: linear-gradient(135deg, #f0f4ff 0%, #e8eeff 100%);
                  font-weight: 700;
                  color: #4338ca;
                  font-size: 1rem;
                  border-right: 3px solid #667eea;
                }
                /* EVENT column */
                .rbc-agenda-view table.rbc-agenda-table tbody > tr > td:nth-child(3) {
                  width: 70%;
                  word-wrap: break-word;
                  overflow-wrap: break-word;
                  font-size: 1rem;
                  font-weight: 500;
                  color: #1f2937;
                  padding-left: 24px;
                }
                .rbc-agenda-view table.rbc-agenda-table tbody > tr:last-child > td {
                  border-bottom: none;
                }
                .rbc-agenda-empty {
                  padding: 60px 20px;
                  text-align: center;
                  color: #6b7280;
                  font-style: italic;
                  background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
                  font-size: 1.1rem;
                }
              `}</style>
              <div style={{ height: '650px' }} className="calendar-container">
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
                  views={['month', 'week', 'day']}
                  messages={{
                    next: 'Tiếp',
                    previous: 'Trước',
                    today: 'Hôm nay',
                    month: 'Tháng',
                    week: 'Tuần',
                    day: 'Ngày',
                    date: 'Ngày',
                    time: 'Thời gian',
                    event: 'Sự kiện',
                    noEventsInRange: 'Không có lịch hẹn nào trong khoảng thời gian này',
                  }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Detail Dialog - Read Only */}
          <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  Chi tiết Lịch Lái Thử
                </DialogTitle>
                <DialogDescription>
                  Thông tin chi tiết về lịch hẹn lái thử
                </DialogDescription>
              </DialogHeader>

              {selectedEvent && (
                <div className="space-y-4 py-2">
                  {/* Status Badge */}
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="text-sm font-medium">Trạng thái hiện tại:</span>
                    <Badge 
                      style={{ 
                        backgroundColor: statusColors[selectedEvent.resource.status],
                        color: 'white'
                      }}
                    >
                      {statusLabels[selectedEvent.resource.status]}
                    </Badge>
                  </div>

                  {/* Customer Info */}
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm flex items-center gap-2 text-orange-700 dark:text-orange-400">
                      <User className="h-4 w-4" />
                      Thông tin khách hàng
                    </h4>
                    <div className="p-3 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/50 dark:to-red-950/50 border border-orange-200 dark:border-orange-800 rounded-lg space-y-2">
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <span className="text-muted-foreground">Họ tên:</span>
                        <span className="col-span-2 font-medium">{selectedEvent.resource.user.name}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <span className="text-muted-foreground">SĐT:</span>
                        <span className="col-span-2 font-medium">{selectedEvent.resource.user.phone}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <span className="text-muted-foreground">Email:</span>
                        <span className="col-span-2 font-medium truncate">{selectedEvent.resource.user.email}</span>
                      </div>
                    </div>
                  </div>

                  {/* Vehicle Info */}
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm flex items-center gap-2 text-purple-700 dark:text-purple-400">
                      <Car className="h-4 w-4" />
                      Thông tin xe
                    </h4>
                    <div className="p-3 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/50 dark:to-pink-950/50 border border-purple-200 dark:border-purple-800 rounded-lg space-y-2">
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <span className="text-muted-foreground">Danh mục:</span>
                        <span className="col-span-2 font-medium">
                          {selectedEvent.resource.categoryName || 'Chưa có thông tin'}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <span className="text-muted-foreground">Xe:</span>
                        <span className="col-span-2 font-medium">
                          {selectedEvent.resource.productName || <span className="italic text-muted-foreground">Chưa phân công</span>}
                        </span>
                      </div>
                      {selectedEvent.resource.specificVIN && (
                        <div className="grid grid-cols-3 gap-2 text-sm">
                          <span className="text-muted-foreground">Số VIN:</span>
                          <span className="col-span-2 font-mono text-xs font-medium">{selectedEvent.resource.specificVIN}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Schedule Info */}
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm flex items-center gap-2 text-blue-700 dark:text-blue-400">
                      <CalendarIcon className="h-4 w-4" />
                      Thời gian lái thử
                    </h4>
                    <div className="p-3 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/50 dark:to-cyan-950/50 border border-blue-200 dark:border-blue-800 rounded-lg space-y-2">
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <span className="text-muted-foreground">Bắt đầu:</span>
                        <span className="col-span-2 font-medium">
                          {selectedEvent.start.toLocaleString('vi-VN')}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <span className="text-muted-foreground">Kết thúc (dự kiến):</span>
                        <span className="col-span-2 font-medium">
                          {selectedEvent.end.toLocaleString('vi-VN')}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <span className="text-muted-foreground">Thời lượng:</span>
                        <span className="col-span-2 font-medium text-blue-600 dark:text-blue-400">
                          2 giờ
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Staff Info */}
                  {selectedEvent.resource.escortStaff && (
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm flex items-center gap-2 text-green-700 dark:text-green-400">
                        <User className="h-4 w-4" />
                        Nhân viên hộ tống
                      </h4>
                      <div className="p-3 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50 border border-green-200 dark:border-green-800 rounded-lg space-y-2">
                        <div className="grid grid-cols-3 gap-2 text-sm">
                          <span className="text-muted-foreground">Họ tên:</span>
                          <span className="col-span-2 font-medium">{selectedEvent.resource.escortStaff.name}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-sm">
                          <span className="text-muted-foreground">SĐT:</span>
                          <span className="col-span-2 font-medium">{selectedEvent.resource.escortStaff.phone}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Dealer Info */}
                  {selectedEvent.resource.dealer && (
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm flex items-center gap-2 text-indigo-700 dark:text-indigo-400">
                        <MapPin className="h-4 w-4" />
                        Thông tin đại lý
                      </h4>
                      <div className="p-3 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/50 dark:to-blue-950/50 border border-indigo-200 dark:border-indigo-800 rounded-lg space-y-2">
                        <div className="grid grid-cols-3 gap-2 text-sm">
                          <span className="text-muted-foreground">Tên:</span>
                          <span className="col-span-2 font-medium">{selectedEvent.resource.dealer.name}</span>
                        </div>
                        {selectedEvent.resource.dealer.address && (
                          <div className="grid grid-cols-3 gap-2 text-sm">
                            <span className="text-muted-foreground">Địa chỉ:</span>
                            <span className="col-span-2 font-medium">{selectedEvent.resource.dealer.address}</span>
                          </div>
                        )}
                        {selectedEvent.resource.dealer.phone && (
                          <div className="grid grid-cols-3 gap-2 text-sm">
                            <span className="text-muted-foreground">SĐT:</span>
                            <span className="col-span-2 font-medium">{selectedEvent.resource.dealer.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  {selectedEvent.resource.notes && (
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm flex items-center gap-2 text-amber-700 dark:text-amber-400">
                        <FileText className="h-4 w-4" />
                        Ghi chú
                      </h4>
                      <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
                        <p className="text-sm text-amber-900 dark:text-amber-100">{selectedEvent.resource.notes}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <DialogFooter>
                <Button 
                  onClick={() => setIsDetailOpen(false)}
                  className="w-full"
                >
                  Đóng
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </DealerStaffLayout>
    </ProtectedRoute>
  );
}
