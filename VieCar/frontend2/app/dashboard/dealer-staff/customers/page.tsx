"use client";

import { useState } from "react";
import { ProtectedRoute } from "@/components/auth-guards";
import DealerStaffLayout from "@/components/layout/dealer-staff-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Users, Plus, Eye, Phone, Mail, History, MessageSquare, Search } from "lucide-react";

const mockCustomers = [
  {
    id: 1,
    name: "Nguyễn Văn A",
    phone: "0901234567",
    email: "nguyenvana@gmail.com",
    status: "Tiềm năng",
    interestedVehicle: "VinFast VF8",
    lastContact: "2025-10-19",
    notes: "Quan tâm trả góp 0%",
    purchaseHistory: []
  },
  {
    id: 2,
    name: "Trần Thị B",
    phone: "0907654321",
    email: "tranthib@gmail.com",
    status: "Đã mua",
    interestedVehicle: "VinFast VF6",
    lastContact: "2025-10-15",
    notes: "Đã mua VF6 màu đỏ",
    purchaseHistory: [{ vehicle: "VinFast VF6 Eco", date: "2025-09-20", price: 665000000 }]
  },
  {
    id: 3,
    name: "Lê Văn C",
    phone: "0909876543",
    email: "levanc@gmail.com",
    status: "Đang tư vấn",
    interestedVehicle: "VinFast VF5",
    lastContact: "2025-10-18",
    notes: "Đang so sánh VF5 và VF6",
    purchaseHistory: []
  }
];

export default function CustomersPage() {
  const { toast } = useToast();
  const [customers, setCustomers] = useState(mockCustomers);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm)
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Tiềm năng": return "secondary";
      case "Đang tư vấn": return "default";
      case "Đã mua": return "outline";
      default: return "secondary";
    }
  };

  return (
    <ProtectedRoute allowedRoles={["Dealer Staff"]}>
      <DealerStaffLayout>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Khách hàng</h1>
              <p className="text-muted-foreground mt-2">Quản lý thông tin và lịch sử khách hàng</p>
            </div>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Thêm khách hàng
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                Tìm kiếm
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                placeholder="Tìm theo tên hoặc số điện thoại..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </CardContent>
          </Card>

          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">Tất cả ({customers.length})</TabsTrigger>
              <TabsTrigger value="potential">Tiềm năng ({customers.filter(c => c.status === "Tiềm năng").length})</TabsTrigger>
              <TabsTrigger value="consulting">Đang tư vấn ({customers.filter(c => c.status === "Đang tư vấn").length})</TabsTrigger>
              <TabsTrigger value="purchased">Đã mua ({customers.filter(c => c.status === "Đã mua").length})</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-6">
              <CustomerList customers={filteredCustomers} getStatusColor={getStatusColor} setSelectedCustomer={setSelectedCustomer} />
            </TabsContent>
            <TabsContent value="potential" className="mt-6">
              <CustomerList customers={filteredCustomers.filter(c => c.status === "Tiềm năng")} getStatusColor={getStatusColor} setSelectedCustomer={setSelectedCustomer} />
            </TabsContent>
            <TabsContent value="consulting" className="mt-6">
              <CustomerList customers={filteredCustomers.filter(c => c.status === "Đang tư vấn")} getStatusColor={getStatusColor} setSelectedCustomer={setSelectedCustomer} />
            </TabsContent>
            <TabsContent value="purchased" className="mt-6">
              <CustomerList customers={filteredCustomers.filter(c => c.status === "Đã mua")} getStatusColor={getStatusColor} setSelectedCustomer={setSelectedCustomer} />
            </TabsContent>
          </Tabs>
        </div>
      </DealerStaffLayout>
    </ProtectedRoute>
  );
}

function CustomerList({ customers, getStatusColor, setSelectedCustomer }: any) {
  return (
    <div className="grid gap-4">
      {customers.map((customer: any) => (
        <Card key={customer.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg">{customer.name}</CardTitle>
                <CardDescription className="flex items-center gap-2 mt-1">
                  <Phone className="w-3 h-3" /> {customer.phone}
                  {customer.email && (
                    <>
                      <span>•</span>
                      <Mail className="w-3 h-3" /> {customer.email}
                    </>
                  )}
                </CardDescription>
              </div>
              <Badge variant={getStatusColor(customer.status)}>{customer.status}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2 md:grid-cols-3">
              <div>
                <p className="text-sm text-muted-foreground">Xe quan tâm</p>
                <p className="font-medium">{customer.interestedVehicle}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Liên hệ gần nhất</p>
                <p>{customer.lastContact}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Lịch sử mua</p>
                <p className="font-medium">{customer.purchaseHistory.length} xe</p>
              </div>
            </div>

            {customer.notes && (
              <div>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <MessageSquare className="w-3 h-3" /> Ghi chú
                </p>
                <p className="text-sm">{customer.notes}</p>
              </div>
            )}

            <div className="flex gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" onClick={() => setSelectedCustomer(customer)}>
                    <Eye className="w-4 h-4 mr-2" />
                    Chi tiết
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{customer.name}</DialogTitle>
                    <DialogDescription>Thông tin chi tiết khách hàng</DialogDescription>
                  </DialogHeader>
                  <CustomerDetails customer={customer} />
                </DialogContent>
              </Dialog>
              <Button variant="outline" size="sm">
                <History className="w-4 h-4 mr-2" />
                Lịch sử
              </Button>
              <Button variant="outline" size="sm">
                <MessageSquare className="w-4 h-4 mr-2" />
                Ghi chú
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      {customers.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Không có khách hàng nào</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function CustomerDetails({ customer }: { customer: any }) {
  return (
    <div className="space-y-4">
      <div>
        <h4 className="font-medium mb-2">Thông tin liên hệ</h4>
        <div className="space-y-1 text-sm">
          <p><strong>Tên:</strong> {customer.name}</p>
          <p><strong>SĐT:</strong> {customer.phone}</p>
          <p><strong>Email:</strong> {customer.email}</p>
        </div>
      </div>

      <div>
        <h4 className="font-medium mb-2">Thông tin mua hàng</h4>
        <div className="space-y-1 text-sm">
          <p><strong>Trạng thái:</strong> {customer.status}</p>
          <p><strong>Xe quan tâm:</strong> {customer.interestedVehicle}</p>
          <p><strong>Liên hệ gần nhất:</strong> {customer.lastContact}</p>
        </div>
      </div>

      {customer.purchaseHistory.length > 0 && (
        <div>
          <h4 className="font-medium mb-2">Lịch sử mua hàng</h4>
          <div className="space-y-2">
            {customer.purchaseHistory.map((purchase: any, idx: number) => (
              <div key={idx} className="p-3 border rounded-lg">
                <p className="font-medium">{purchase.vehicle}</p>
                <p className="text-sm text-muted-foreground">Ngày: {purchase.date}</p>
                <p className="text-sm text-primary font-medium">{purchase.price.toLocaleString('vi-VN')} VNĐ</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {customer.notes && (
        <div>
          <h4 className="font-medium mb-2">Ghi chú</h4>
          <p className="text-sm">{customer.notes}</p>
        </div>
      )}
    </div>
  );
}
