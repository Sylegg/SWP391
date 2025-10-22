"use client";

import { ProtectedRoute } from "@/components/auth-guards";
import DealerManagerLayout from "@/components/layout/dealer-manager-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Users, 
  Search, 
  Filter, 
  Eye, 
  Edit,
  Trash2,
  UserPlus,
  Mail,
  Phone,
  CheckCircle2,
  XCircle
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

// Mock data - replace with actual API
interface Staff {
  id: number;
  username: string;
  fullName: string;
  email: string;
  phone: string;
  role: "Dealer Staff";
  status: "active" | "inactive";
  joinedDate: string;
}

const mockStaff: Staff[] = [
  {
    id: 1,
    username: "staff001",
    fullName: "Nguyễn Văn A",
    email: "nguyenvana@dealer.com",
    phone: "0901234567",
    role: "Dealer Staff",
    status: "active",
    joinedDate: "2025-01-15"
  },
  {
    id: 2,
    username: "staff002",
    fullName: "Trần Thị B",
    email: "tranthib@dealer.com",
    phone: "0912345678",
    role: "Dealer Staff",
    status: "active",
    joinedDate: "2025-02-20"
  },
  {
    id: 3,
    username: "staff003",
    fullName: "Lê Văn C",
    email: "levanc@dealer.com",
    phone: "0923456789",
    role: "Dealer Staff",
    status: "inactive",
    joinedDate: "2024-12-10"
  },
];

const statusLabels = {
  active: "Đang hoạt động",
  inactive: "Không hoạt động"
};

const statusColors = {
  active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  inactive: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
};

export default function StaffManagementPage() {
  const [staff, setStaff] = useState<Staff[]>(mockStaff);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredStaff = staff.filter((s) => {
    const matchesSearch = 
      s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.phone.includes(searchTerm);
    const matchesStatus = 
      statusFilter === "all" || 
      s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDelete = (id: number) => {
    if (confirm("Bạn có chắc chắn muốn xóa nhân viên này?")) {
      setStaff(prev => prev.filter(s => s.id !== id));
    }
  };

  const toggleStatus = (id: number) => {
    setStaff(prev => 
      prev.map(s => 
        s.id === id 
          ? { ...s, status: s.status === "active" ? "inactive" as const : "active" as const }
          : s
      )
    );
  };

  return (
    <ProtectedRoute allowedRoles={['Dealer Manager', 'Admin']}>
      <DealerManagerLayout>
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold flex items-center">
                <Users className="mr-2 h-8 w-8" />
                Quản lý nhân viên
              </h1>
              <p className="text-muted-foreground mt-2">
                Quản lý tài khoản Dealer Staff thuộc đại lý
              </p>
            </div>
            <Link href="/dashboard/dealer-manager/staff/create">
              <Button size="lg">
                <UserPlus className="mr-2 h-4 w-4" />
                Thêm nhân viên mới
              </Button>
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tổng nhân viên</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{staff.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Đang hoạt động</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {staff.filter(s => s.status === "active").length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Không hoạt động</CardTitle>
                <XCircle className="h-4 w-4 text-gray-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {staff.filter(s => s.status === "inactive").length}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters & Search */}
          <Card>
            <CardHeader>
              <CardTitle>Tìm kiếm & Lọc</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Tìm kiếm theo tên, username, email, SĐT..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[200px]">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Lọc trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả trạng thái</SelectItem>
                    <SelectItem value="active">Đang hoạt động</SelectItem>
                    <SelectItem value="inactive">Không hoạt động</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Staff Table */}
          <Card>
            <CardHeader>
              <CardTitle>Danh sách nhân viên</CardTitle>
              <CardDescription>
                {filteredStaff.length} nhân viên
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredStaff.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Không có nhân viên nào
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Họ tên</TableHead>
                      <TableHead>Username</TableHead>
                      <TableHead>Liên hệ</TableHead>
                      <TableHead>Ngày tham gia</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStaff.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell className="font-medium">#{s.id}</TableCell>
                        <TableCell className="font-semibold">{s.fullName}</TableCell>
                        <TableCell>
                          <code className="text-sm bg-muted px-2 py-1 rounded">
                            {s.username}
                          </code>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm">
                              <Mail className="h-3 w-3 text-muted-foreground" />
                              {s.email}
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="h-3 w-3 text-muted-foreground" />
                              {s.phone}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(s.joinedDate).toLocaleDateString('vi-VN')}
                        </TableCell>
                        <TableCell>
                          <Badge className={statusColors[s.status]}>
                            {statusLabels[s.status]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Link href={`/dashboard/dealer-manager/staff/${s.id}`}>
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Link href={`/dashboard/dealer-manager/staff/${s.id}/edit`}>
                              <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => toggleStatus(s.id)}
                            >
                              {s.status === "active" ? (
                                <XCircle className="h-4 w-4 text-orange-600" />
                              ) : (
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                              )}
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDelete(s.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </DealerManagerLayout>
    </ProtectedRoute>
  );
}
