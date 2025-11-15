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
  DollarSign, 
  Search, 
  Filter, 
  Eye, 
  CheckCircle2,
  Download,
  FileText,
  AlertCircle,
  Calendar
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

// Mock data - replace with actual API
interface Payment {
  id: number;
  orderId: string;
  type: "distribution" | "retail";
  amount: number;
  status: "pending" | "confirmed" | "completed" | "issue";
  dueDate: string;
  paidDate?: string;
  invoiceNumber?: string;
  notes?: string;
}

const mockPayments: Payment[] = [
  {
    id: 1,
    orderId: "DIST-001",
    type: "distribution",
    amount: 1500000000,
    status: "pending",
    dueDate: "2025-10-30",
    invoiceNumber: "INV-2025-001"
  },
  {
    id: 2,
    orderId: "RETAIL-045",
    type: "retail",
    amount: 850000000,
    status: "confirmed",
    dueDate: "2025-10-25",
    paidDate: "2025-10-24",
    invoiceNumber: "INV-2025-002"
  },
  {
    id: 3,
    orderId: "DIST-002",
    type: "distribution",
    amount: 2000000000,
    status: "completed",
    dueDate: "2025-10-20",
    paidDate: "2025-10-19",
    invoiceNumber: "INV-2025-003"
  },
];

const statusLabels = {
  pending: "Chờ thanh toán",
  confirmed: "Đã xác nhận",
  completed: "Hoàn thành",
  issue: "Có vấn đề"
};

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  confirmed: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  issue: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
};

const typeLabels = {
  distribution: "Phân phối",
  retail: "Bán lẻ"
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>(mockPayments);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch = 
      payment.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = 
      statusFilter === "all" || 
      payment.status === statusFilter;
    const matchesType = 
      typeFilter === "all" || 
      payment.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);
  const pendingAmount = payments
    .filter(p => p.status === "pending")
    .reduce((sum, p) => sum + p.amount, 0);
  const completedAmount = payments
    .filter(p => p.status === "completed")
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <ProtectedRoute allowedRoles={['Dealer Manager', 'Admin']}>
      <DealerManagerLayout>
        <div className="p-6 space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <DollarSign className="mr-2 h-8 w-8" />
              Quản lý thanh toán
            </h1>
            <p className="text-muted-foreground mt-2">
              Theo dõi và quản lý các giao dịch thanh toán với Hãng
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tổng giao dịch</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{payments.length}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatCurrency(totalAmount)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Chờ thanh toán</CardTitle>
                <AlertCircle className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {payments.filter(p => p.status === "pending").length}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatCurrency(pendingAmount)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Đã hoàn thành</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {payments.filter(p => p.status === "completed").length}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatCurrency(completedAmount)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Có vấn đề</CardTitle>
                <AlertCircle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {payments.filter(p => p.status === "issue").length}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Cần xử lý
                </p>
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
                    placeholder="Tìm kiếm theo mã đơn, số hóa đơn..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[180px]">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Loại giao dịch" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả loại</SelectItem>
                    <SelectItem value="distribution">Phân phối</SelectItem>
                    <SelectItem value="retail">Bán lẻ</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[200px]">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả trạng thái</SelectItem>
                    <SelectItem value="pending">Chờ thanh toán</SelectItem>
                    <SelectItem value="confirmed">Đã xác nhận</SelectItem>
                    <SelectItem value="completed">Hoàn thành</SelectItem>
                    <SelectItem value="issue">Có vấn đề</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Payments Table */}
          <Card>
            <CardHeader>
              <CardTitle>Danh sách giao dịch</CardTitle>
              <CardDescription>
                {filteredPayments.length} giao dịch
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredPayments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Không có giao dịch nào
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mã đơn</TableHead>
                      <TableHead>Loại</TableHead>
                      <TableHead>Số tiền</TableHead>
                      <TableHead>Hạn thanh toán</TableHead>
                      <TableHead>Ngày thanh toán</TableHead>
                      <TableHead>Số hóa đơn</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPayments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-medium">{payment.orderId}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {typeLabels[payment.type]}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-semibold">
                          {formatCurrency(payment.amount)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {new Date(payment.dueDate).toLocaleDateString('vi-VN')}
                          </div>
                        </TableCell>
                        <TableCell>
                          {payment.paidDate 
                            ? new Date(payment.paidDate).toLocaleDateString('vi-VN')
                            : '-'}
                        </TableCell>
                        <TableCell>{payment.invoiceNumber || '-'}</TableCell>
                        <TableCell>
                          <Badge className={statusColors[payment.status]}>
                            {statusLabels[payment.status]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Link href={`/dashboard/dealer-manager/payments/${payment.id}`}>
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            {payment.invoiceNumber && (
                              <Button variant="outline" size="sm">
                                <Download className="h-4 w-4" />
                              </Button>
                            )}
                            {payment.status === "pending" && (
                              <Button size="sm" variant="default">
                                <CheckCircle2 className="h-4 w-4 mr-1" />
                                Xác nhận
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <FileText className="mr-2 h-5 w-5 text-blue-600" />
                  Tải hóa đơn & chứng từ
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Tải xuống hóa đơn và chứng từ thanh toán
                </p>
                <Link href="/dashboard/dealer-manager/payments/documents">
                  <Button variant="outline" className="w-full">
                    <Download className="mr-2 h-4 w-4" />
                    Xem tài liệu
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <AlertCircle className="mr-2 h-5 w-5 text-orange-600" />
                  Yêu cầu hỗ trợ
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Tạo yêu cầu hỗ trợ về thanh toán, công nợ
                </p>
                <Link href="/dashboard/dealer-manager/payments/support">
                  <Button variant="outline" className="w-full">
                    <AlertCircle className="mr-2 h-4 w-4" />
                    Tạo yêu cầu
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <FileText className="mr-2 h-5 w-5 text-green-600" />
                  Lịch sử thanh toán
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Xem lịch sử các giao dịch đã hoàn thành
                </p>
                <Link href="/dashboard/dealer-manager/payments?status=completed">
                  <Button variant="outline" className="w-full">
                    <FileText className="mr-2 h-4 w-4" />
                    Xem lịch sử
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </DealerManagerLayout>
    </ProtectedRoute>
  );
}
