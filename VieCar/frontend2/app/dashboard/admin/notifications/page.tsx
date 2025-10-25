"use client";

import { useState } from "react";
import { ProtectedRoute } from "@/components/auth-guards";
import AdminLayout from "@/components/layout/admin-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Plus, Send, Bell, Users, Mail, MessageSquare, Eye, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const mockNotifications = [
  { id: 1, title: "Cập nhật chính sách hoa hồng Q4", content: "Chính sách hoa hồng mới áp dụng từ 1/10/2025...", target: "Tất cả đại lý", sentAt: "2025-10-15 09:00", sentBy: "Admin", status: "sent" },
  { id: 2, title: "Thông báo bảo trì hệ thống", content: "Hệ thống sẽ bảo trì vào 00:00 ngày 25/10/2025", target: "Toàn hệ thống", sentAt: "2025-10-18 14:30", sentBy: "Admin", status: "sent" },
  { id: 3, title: "Ra mắt sản phẩm VF Wild", content: "Sản phẩm mới VF Wild sẽ có mặt tại showroom...", target: "Dealer Manager", sentAt: "2025-10-20 10:00", sentBy: "EVM Manager", status: "scheduled" }
];

export default function NotificationCenterPage() {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState(mockNotifications);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    target: "all",
    sendEmail: true,
    sendSMS: false,
    scheduleTime: ""
  });

  const handleSend = () => {
    if (!formData.title || !formData.content) {
      toast({ variant: "destructive", title: "Thiếu thông tin", description: "Vui lòng nhập tiêu đề và nội dung" });
      return;
    }

    const newNotification = {
      id: notifications.length + 1,
      title: formData.title,
      content: formData.content,
      target: getTargetLabel(formData.target),
      sentAt: formData.scheduleTime || new Date().toLocaleString('vi-VN'),
      sentBy: "Admin",
      status: formData.scheduleTime ? "scheduled" : "sent"
    };

    setNotifications([newNotification, ...notifications]);
    setShowCreateDialog(false);
    resetForm();
    toast({ 
      title: formData.scheduleTime ? "Đã lên lịch" : "Đã gửi thông báo", 
      description: `Thông báo đã được ${formData.scheduleTime ? 'lên lịch' : 'gửi'} đến ${getTargetLabel(formData.target)}` 
    });
  };

  const resetForm = () => {
    setFormData({ title: "", content: "", target: "all", sendEmail: true, sendSMS: false, scheduleTime: "" });
  };

  const getTargetLabel = (target: string) => {
    const targets: any = {
      all: "Toàn hệ thống",
      dealers: "Tất cả đại lý",
      dealer_managers: "Dealer Manager",
      dealer_staff: "Dealer Staff",
      evm: "EVM",
      customers: "Khách hàng"
    };
    return targets[target] || target;
  };

  const handleDelete = (id: number) => {
    if (confirm("Xóa thông báo này?")) {
      setNotifications(notifications.filter(n => n.id !== id));
      toast({ title: "Đã xóa thông báo" });
    }
  };

  return (
    <ProtectedRoute allowedRoles={["Admin"]}>
      <AdminLayout>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Trung tâm thông báo</h1>
              <p className="text-muted-foreground mt-2">Gửi thông báo đến tất cả đại lý và người dùng</p>
            </div>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Tạo thông báo
            </Button>
          </div>

          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Đã gửi</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{notifications.filter(n => n.status === "sent").length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Đã lên lịch</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{notifications.filter(n => n.status === "scheduled").length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Người nhận</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">256</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Tỷ lệ đọc</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">87%</div>
              </CardContent>
            </Card>
          </div>

          {/* Notifications List */}
          <Card>
            <CardHeader>
              <CardTitle>Lịch sử thông báo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {notifications.map(notif => (
                  <div key={notif.id} className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <Bell className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{notif.title}</h3>
                          {notif.status === "sent" 
                            ? <Badge variant="default" className="bg-green-500">Đã gửi</Badge>
                            : <Badge variant="secondary" className="bg-blue-500 text-white">Đã lên lịch</Badge>
                          }
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{notif.content}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {notif.target}
                          </span>
                          <span>{notif.sentAt}</span>
                          <span>Gửi bởi: {notif.sentBy}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(notif.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Create Dialog */}
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Tạo thông báo mới</DialogTitle>
                <DialogDescription>Gửi tin tức, cập nhật chính sách cho các đại lý</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Tiêu đề <span className="text-red-500">*</span></Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="Tiêu đề thông báo"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Nội dung <span className="text-red-500">*</span></Label>
                  <Textarea
                    value={formData.content}
                    onChange={(e) => setFormData({...formData, content: e.target.value})}
                    placeholder="Nội dung chi tiết thông báo..."
                    rows={6}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Đối tượng nhận</Label>
                  <Select value={formData.target} onValueChange={(value) => setFormData({...formData, target: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toàn hệ thống</SelectItem>
                      <SelectItem value="dealers">Tất cả đại lý</SelectItem>
                      <SelectItem value="dealer_managers">Chỉ Dealer Manager</SelectItem>
                      <SelectItem value="dealer_staff">Chỉ Dealer Staff</SelectItem>
                      <SelectItem value="evm">Nhân viên EVM</SelectItem>
                      <SelectItem value="customers">Khách hàng</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3 p-4 border rounded-lg">
                  <Label>Phương thức gửi</Label>
                  <div className="flex items-center gap-2">
                    <Checkbox 
                      checked={formData.sendEmail} 
                      onCheckedChange={(checked) => setFormData({...formData, sendEmail: !!checked})}
                      id="email"
                    />
                    <label htmlFor="email" className="text-sm flex items-center gap-2 cursor-pointer">
                      <Mail className="w-4 h-4" />
                      Gửi qua Email
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox 
                      checked={formData.sendSMS} 
                      onCheckedChange={(checked) => setFormData({...formData, sendSMS: !!checked})}
                      id="sms"
                    />
                    <label htmlFor="sms" className="text-sm flex items-center gap-2 cursor-pointer">
                      <MessageSquare className="w-4 h-4" />
                      Gửi qua SMS
                    </label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Lên lịch gửi (tùy chọn)</Label>
                  <Input
                    type="datetime-local"
                    value={formData.scheduleTime}
                    onChange={(e) => setFormData({...formData, scheduleTime: e.target.value})}
                  />
                  <p className="text-xs text-muted-foreground">Để trống để gửi ngay</p>
                </div>

                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => { setShowCreateDialog(false); resetForm(); }}>
                    Hủy
                  </Button>
                  <Button onClick={handleSend}>
                    <Send className="w-4 h-4 mr-2" />
                    {formData.scheduleTime ? "Lên lịch" : "Gửi ngay"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}