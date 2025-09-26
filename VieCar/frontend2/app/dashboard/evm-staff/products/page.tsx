"use client";

import { ProtectedRoute } from "@/components/auth-guards";
import EvmStaffLayout from "@/components/layout/evm-staff-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Edit, Eye } from "lucide-react";

export default function EvmStaffProductsPage() {
  // Mock data - replace with actual API calls
  const products = [
    {
      id: 1,
      name: "VinFast VF e34",
      category: "Xe máy điện",
      price: "65,900,000",
      stock: 15,
      status: "Có sẵn"
    },
    {
      id: 2,
      name: "VinFast VF 8",
      category: "Ô tô điện",
      price: "1,200,000,000",
      stock: 8,
      status: "Có sẵn"
    },
    {
      id: 3,
      name: "VinFast VF 9",
      category: "Ô tô điện",
      price: "1,500,000,000",
      stock: 5,
      status: "Có sẵn"
    }
  ];

  return (
    <ProtectedRoute allowedRoles={['EVM_Staff', 'Admin']}>
      <EvmStaffLayout>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold">Danh mục sản phẩm</h1>
              <p className="text-muted-foreground mt-2">
                Quản lý thông tin sản phẩm xe điện
              </p>
            </div>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Thêm sản phẩm mới
            </Button>
          </div>

          {/* Search and filters */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Tìm kiếm và lọc</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Tìm kiếm theo tên sản phẩm..."
                      className="pl-10"
                    />
                  </div>
                </div>
                <Button variant="outline">Lọc theo danh mục</Button>
                <Button variant="outline">Lọc theo trạng thái</Button>
              </div>
            </CardContent>
          </Card>

          {/* Products table */}
          <Card>
            <CardHeader>
              <CardTitle>Danh sách sản phẩm</CardTitle>
              <CardDescription>
                Tổng cộng {products.length} sản phẩm
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Tên sản phẩm</TableHead>
                    <TableHead>Danh mục</TableHead>
                    <TableHead>Giá</TableHead>
                    <TableHead>Tồn kho</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.id}</TableCell>
                      <TableCell>{product.name}</TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell>{product.price} ₫</TableCell>
                      <TableCell>{product.stock}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{product.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </EvmStaffLayout>
    </ProtectedRoute>
  );
}