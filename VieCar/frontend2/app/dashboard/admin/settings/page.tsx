"use client";

import { useState } from "react";
import { ProtectedRoute } from "@/components/auth-guards";
import AdminLayout from "@/components/layout/admin-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Save, Database, Mail, Key, Server, Shield, Bell, Download, Upload } from "lucide-react";

export default function SystemSettingsPage() {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    siteName: "VinFast CRM",
    siteEmail: "admin@vinfast.vn",
    supportPhone: "1900123456",
    smtpHost: "smtp.gmail.com",
    smtpPort: "587",
    smtpUser: "noreply@vinfast.vn",
    apiKey: "vf_live_***********************",
    backupEnabled: true,
    backupTime: "02:00",
    auditLogEnabled: true,
    notificationEmail: true,
    notificationSMS: false
  });

  const handleSave = () => {
    toast({ title: "Đã lưu cấu hình", description: "Cài đặt hệ thống đã được cập nhật" });
  };

  const handleBackup = () => {
    toast({ title: "Đang sao lưu...", description: "Database đang được backup" });
  };

  const handleRestore = () => {
    if (confirm("Khôi phục database sẽ ghi đè dữ liệu hiện tại. Bạn có chắc chắn?")) {
      toast({ title: "Đang khôi phục...", description: "Database đang được restore" });
    }
  };

  return (
    <ProtectedRoute allowedRoles={["Admin"]}>
      <AdminLayout>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Cài đặt hệ thống</h1>
              <p className="text-muted-foreground mt-2">Cấu hình hệ thống, backup và audit log</p>
            </div>
            <Button onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              Lưu tất cả
            </Button>
          </div>

          <Tabs defaultValue="general" className="space-y-4">
            <TabsList>
              <TabsTrigger value="general">Chung</TabsTrigger>
              <TabsTrigger value="email">Email & SMS</TabsTrigger>
              <TabsTrigger value="api">API</TabsTrigger>
              <TabsTrigger value="backup">Backup & Restore</TabsTrigger>
              <TabsTrigger value="audit">Audit Log</TabsTrigger>
            </TabsList>

            <TabsContent value="general">
              <Card>
                <CardHeader>
                  <CardTitle>Cài đặt chung</CardTitle>
                  <CardDescription>Logo, tên hệ thống, thông tin liên hệ</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Tên hệ thống</Label>
                    <Input value={settings.siteName} onChange={(e) => setSettings({...settings, siteName: e.target.value})} />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Email hệ thống</Label>
                      <Input type="email" value={settings.siteEmail} onChange={(e) => setSettings({...settings, siteEmail: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label>Hotline</Label>
                      <Input value={settings.supportPhone} onChange={(e) => setSettings({...settings, supportPhone: e.target.value})} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Logo</Label>
                    <div className="flex gap-2">
                      <Input type="file" accept="image/*" />
                      <Button variant="outline">Upload</Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Banner trang chủ</Label>
                    <Input type="file" accept="image/*" />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="email">
              <Card>
                <CardHeader>
                  <CardTitle>Cấu hình Email & SMS Gateway</CardTitle>
                  <CardDescription>SMTP server và dịch vụ SMS</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email (SMTP)
                  </h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>SMTP Host</Label>
                      <Input value={settings.smtpHost} onChange={(e) => setSettings({...settings, smtpHost: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label>SMTP Port</Label>
                      <Input value={settings.smtpPort} onChange={(e) => setSettings({...settings, smtpPort: e.target.value})} />
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>SMTP User</Label>
                      <Input value={settings.smtpUser} onChange={(e) => setSettings({...settings, smtpUser: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label>SMTP Password</Label>
                      <Input type="password" placeholder="••••••••" />
                    </div>
                  </div>
                  <Button variant="outline">Test SMTP Connection</Button>

                  <div className="pt-4 border-t">
                    <h3 className="font-semibold mb-3">SMS Gateway</h3>
                    <div className="space-y-2">
                      <Label>API Endpoint</Label>
                      <Input placeholder="https://api.sms-provider.com" />
                    </div>
                    <div className="space-y-2 mt-3">
                      <Label>API Key</Label>
                      <Input type="password" placeholder="Your SMS API key" />
                    </div>
                    <Button variant="outline" className="mt-3">Test SMS</Button>
                  </div>

                  <div className="pt-4 border-t">
                    <h3 className="font-semibold mb-3">Thông báo</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label>Gửi email thông báo</Label>
                        <Switch checked={settings.notificationEmail} onCheckedChange={(v) => setSettings({...settings, notificationEmail: v})} />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>Gửi SMS thông báo</Label>
                        <Switch checked={settings.notificationSMS} onCheckedChange={(v) => setSettings({...settings, notificationSMS: v})} />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="api">
              <Card>
                <CardHeader>
                  <CardTitle>API Configuration</CardTitle>
                  <CardDescription>API keys và webhook settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>API Key</Label>
                    <div className="flex gap-2">
                      <Input type="password" value={settings.apiKey} readOnly />
                      <Button variant="outline">Regenerate</Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Webhook URL</Label>
                    <Input placeholder="https://your-app.com/webhook" />
                  </div>
                  <div className="space-y-2">
                    <Label>Allowed Origins (CORS)</Label>
                    <Textarea placeholder="https://domain1.com&#10;https://domain2.com" rows={4} />
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-semibold mb-2">API Documentation</h4>
                    <p className="text-sm text-muted-foreground mb-2">Base URL: https://api.vinfast.vn/v1</p>
                    <Button variant="outline" size="sm">View API Docs</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="backup">
              <Card>
                <CardHeader>
                  <CardTitle>Backup & Restore Database</CardTitle>
                  <CardDescription>Sao lưu và khôi phục dữ liệu</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div>
                      <h3 className="font-semibold">Tự động backup</h3>
                      <p className="text-sm text-muted-foreground">Backup định kỳ hàng ngày</p>
                    </div>
                    <Switch checked={settings.backupEnabled} onCheckedChange={(v) => setSettings({...settings, backupEnabled: v})} />
                  </div>
                  {settings.backupEnabled && (
                    <div className="space-y-2">
                      <Label>Thời gian backup</Label>
                      <Input type="time" value={settings.backupTime} onChange={(e) => setSettings({...settings, backupTime: e.target.value})} />
                    </div>
                  )}
                  <div className="pt-4 border-t">
                    <h3 className="font-semibold mb-3">Thao tác thủ công</h3>
                    <div className="flex gap-2">
                      <Button onClick={handleBackup}>
                        <Download className="w-4 h-4 mr-2" />
                        Backup ngay
                      </Button>
                      <Button variant="outline" onClick={handleRestore}>
                        <Upload className="w-4 h-4 mr-2" />
                        Restore từ file
                      </Button>
                    </div>
                  </div>
                  <div className="pt-4 border-t">
                    <h3 className="font-semibold mb-3">Lịch sử backup</h3>
                    <div className="space-y-2">
                      {[
                        { date: "2025-10-20 02:00", size: "245 MB", status: "success" },
                        { date: "2025-10-19 02:00", size: "242 MB", status: "success" },
                        { date: "2025-10-18 02:00", size: "240 MB", status: "success" }
                      ].map((backup, i) => (
                        <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{backup.date}</p>
                            <p className="text-sm text-muted-foreground">{backup.size}</p>
                          </div>
                          <Button variant="outline" size="sm">Download</Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="audit">
              <Card>
                <CardHeader>
                  <CardTitle>Audit Log</CardTitle>
                  <CardDescription>Theo dõi hoạt động người dùng</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div>
                      <h3 className="font-semibold">Bật Audit Log</h3>
                      <p className="text-sm text-muted-foreground">Ghi lại tất cả thao tác quan trọng</p>
                    </div>
                    <Switch checked={settings.auditLogEnabled} onCheckedChange={(v) => setSettings({...settings, auditLogEnabled: v})} />
                  </div>

                  {settings.auditLogEnabled && (
                    <>
                      <div className="space-y-2">
                        <Label>Thời gian lưu log (ngày)</Label>
                        <Input type="number" defaultValue="90" />
                      </div>

                      <div className="pt-4 border-t">
                        <h3 className="font-semibold mb-3">Hoạt động gần đây</h3>
                        <div className="space-y-2">
                          {[
                            { user: "admin@vinfast.vn", action: "Tạo tài khoản", target: "dealer.staff@vinfast.vn", time: "2025-10-20 14:30" },
                            { user: "admin@vinfast.vn", action: "Cập nhật chính sách HH", target: "Policy #2", time: "2025-10-20 13:15" },
                            { user: "evm.manager@vinfast.vn", action: "Xóa đại lý", target: "Dealer #15", time: "2025-10-20 11:00" }
                          ].map((log, i) => (
                            <div key={i} className="p-3 border rounded-lg text-sm">
                              <div className="flex items-center justify-between mb-1">
                                <p className="font-medium">{log.user}</p>
                                <p className="text-muted-foreground">{log.time}</p>
                              </div>
                              <p className="text-muted-foreground">
                                {log.action}: <span className="font-medium">{log.target}</span>
                              </p>
                            </div>
                          ))}
                        </div>
                        <Button variant="outline" className="w-full mt-3">Xem tất cả log</Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}