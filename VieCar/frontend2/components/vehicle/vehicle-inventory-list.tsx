"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Vehicle, VehicleStatus, VEHICLE_MODELS, VEHICLE_STATUS_LABELS, VEHICLE_STATUS_COLORS } from "@/types/vehicle";
import { Car, Edit, Trash2, Search, Filter, Plus, RefreshCw, Eye } from "lucide-react";
import { VehicleDialog } from "./vehicle-dialog";
import { DeleteVehicleDialog } from "./delete-vehicle-dialog";
import { VehicleService } from "@/lib/services/vehicle-service";
import { useToast } from "@/hooks/use-toast";

interface VehicleInventoryListProps {
  dealerId: string;
}

export function VehicleInventoryList({ dealerId }: VehicleInventoryListProps) {
  const { toast } = useToast();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterModel, setFilterModel] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    available: 0,
    reserved: 0,
    sold: 0,
    inTransit: 0,
    maintenance: 0,
    display: 0
  });

  // Mock data - thay thế bằng API call thực tế
  const mockVehicles: Vehicle[] = [
    {
      id: '1',
      name: 'VinFast VF 5',
      model: 'VinFast VF 5',
      year: 2024,
      color: 'Trắng',
      vin: 'LZWADAGA1KB001234',
      price: 468000000,
      status: 'available',
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z',
      specifications: {
        battery: '37.2 kWh',
        range: 285,
        maxSpeed: 150,
        acceleration: '10.5s',
        seats: 5,
        transmission: 'Tự động',
        driveType: 'FWD'
      }
    },
    {
      id: '2',
      name: 'VinFast VF 8',
      model: 'VinFast VF 8',
      year: 2024,
      color: 'Đen',
      vin: 'LZWADAGA1KB002345',
      price: 999000000,
      status: 'reserved',
      createdAt: '2024-01-16T10:00:00Z',
      updatedAt: '2024-01-16T10:00:00Z',
      specifications: {
        battery: '87.7 kWh',
        range: 447,
        maxSpeed: 180,
        acceleration: '5.5s',
        seats: 5,
        transmission: 'Tự động',
        driveType: 'AWD'
      }
    },
    {
      id: '3',
      name: 'VinFast VF 9',
      model: 'VinFast VF 9',
      year: 2024,
      color: 'Xanh Dương',
      vin: 'LZWADAGA1KB003456',
      price: 1491000000,
      status: 'available',
      createdAt: '2024-01-17T10:00:00Z',
      updatedAt: '2024-01-17T10:00:00Z',
      specifications: {
        battery: '123 kWh',
        range: 680,
        maxSpeed: 200,
        acceleration: '6.5s',
        seats: 7,
        transmission: 'Tự động',
        driveType: 'AWD'
      }
    },
    {
      id: '4',
      name: 'VinFast VF 3',
      model: 'VinFast VF 3',
      year: 2024,
      color: 'Đỏ',
      vin: 'LZWADAGA1KB004567',
      price: 240000000,
      status: 'in_transit',
      createdAt: '2024-01-18T10:00:00Z',
      updatedAt: '2024-01-18T10:00:00Z',
      specifications: {
        battery: '18.64 kWh',
        range: 210,
        maxSpeed: 100,
        acceleration: '12s',
        seats: 5,
        transmission: 'Tự động',
        driveType: 'FWD'
      }
    },
    {
      id: '5',
      name: 'VinFast Limo Green',
      model: 'VinFast Limo Green',
      year: 2024,
      color: 'Xám',
      vin: 'LZWADAGA1KB005678',
      price: 650000000,
      status: 'display',
      createdAt: '2024-01-19T10:00:00Z',
      updatedAt: '2024-01-19T10:00:00Z',
      specifications: {
        battery: '42 kWh',
        range: 320,
        maxSpeed: 160,
        acceleration: '8.5s',
        seats: 5,
        transmission: 'Tự động',
        driveType: 'FWD'
      }
    }
  ];

  useEffect(() => {
    loadVehicles();
  }, [dealerId]);

  const loadVehicles = async () => {
    setLoading(true);
    try {
      // Trong production, sử dụng API thực
      // const response = await VehicleService.getDealerVehicles(dealerId);
      // setVehicles(response.data);
      
      // Mock data cho demo
      setTimeout(() => {
        setVehicles(mockVehicles);
        calculateStats(mockVehicles);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error loading vehicles:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách xe",
        variant: "destructive"
      });
      setLoading(false);
    }
  };

  const calculateStats = (vehicleList: Vehicle[]) => {
    setStats({
      total: vehicleList.length,
      available: vehicleList.filter(v => v.status === 'available').length,
      reserved: vehicleList.filter(v => v.status === 'reserved').length,
      sold: vehicleList.filter(v => v.status === 'sold').length,
      inTransit: vehicleList.filter(v => v.status === 'in_transit').length,
      maintenance: vehicleList.filter(v => v.status === 'maintenance').length,
      display: vehicleList.filter(v => v.status === 'display').length
    });
  };

  const handleCreate = () => {
    setSelectedVehicle(null);
    setDialogMode('create');
    setDialogOpen(true);
  };

  const handleEdit = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setDialogMode('edit');
    setDialogOpen(true);
  };

  const handleDelete = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setDeleteDialogOpen(true);
  };

  const handleSubmit = async (data: any) => {
    try {
      if (dialogMode === 'create') {
        // await VehicleService.createVehicle(dealerId, data);
        
        // Mock create
        const newVehicle: Vehicle = {
          id: `${vehicles.length + 1}`,
          ...data,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        setVehicles([...vehicles, newVehicle]);
        calculateStats([...vehicles, newVehicle]);
        
        toast({
          title: "Thành công",
          description: "Đã thêm xe mới vào kho",
        });
      } else {
        // await VehicleService.updateVehicle(selectedVehicle!.id, data);
        
        // Mock update
        const updatedVehicles = vehicles.map(v => 
          v.id === selectedVehicle?.id 
            ? { ...v, ...data, updatedAt: new Date().toISOString() }
            : v
        );
        setVehicles(updatedVehicles);
        calculateStats(updatedVehicles);
        
        toast({
          title: "Thành công",
          description: "Đã cập nhật thông tin xe",
        });
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể lưu thông tin xe",
        variant: "destructive"
      });
    }
  };

  const handleConfirmDelete = async () => {
    try {
      // await VehicleService.deleteVehicle(selectedVehicle!.id);
      
      // Mock delete
      const updatedVehicles = vehicles.filter(v => v.id !== selectedVehicle?.id);
      setVehicles(updatedVehicles);
      calculateStats(updatedVehicles);
      
      toast({
        title: "Thành công",
        description: "Đã xóa xe khỏi kho",
      });
      setDeleteDialogOpen(false);
      setSelectedVehicle(null);
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể xóa xe",
        variant: "destructive"
      });
    }
  };

  // Filter vehicles
  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch = vehicle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          vehicle.vin?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesModel = filterModel === 'all' || vehicle.model === filterModel;
    const matchesStatus = filterStatus === 'all' || vehicle.status === filterStatus;
    
    return matchesSearch && matchesModel && matchesStatus;
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <Card className="bg-gradient-to-br from-slate-50 to-slate-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Tổng số</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Sẵn sàng</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{stats.available}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Đã đặt</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">{stats.reserved}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-gray-50 to-gray-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Đã bán</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-gray-600">{stats.sold}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-yellow-700">Vận chuyển</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-yellow-600">{stats.inTransit}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-orange-700">Bảo trì</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-orange-600">{stats.maintenance}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">Trưng bày</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-purple-600">{stats.display}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle className="flex items-center text-xl font-semibold">
                <Car className="mr-2 h-5 w-5 text-indigo-600" />
                Quản lý kho xe
              </CardTitle>
              <CardDescription>
                Thêm, sửa, xóa xe trong kho đại lý
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={loadVehicles}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Làm mới
              </Button>
              <Button
                onClick={handleCreate}
                className="bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-700 hover:to-sky-700"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Thêm xe
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Tìm kiếm theo tên, mẫu, VIN..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={filterModel} onValueChange={setFilterModel}>
              <SelectTrigger>
                <SelectValue placeholder="Lọc theo mẫu" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả mẫu</SelectItem>
                {VEHICLE_MODELS.map(model => (
                  <SelectItem key={model} value={model}>{model}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Lọc theo trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="available">Sẵn sàng</SelectItem>
                <SelectItem value="reserved">Đã đặt</SelectItem>
                <SelectItem value="sold">Đã bán</SelectItem>
                <SelectItem value="in_transit">Đang vận chuyển</SelectItem>
                <SelectItem value="maintenance">Bảo trì</SelectItem>
                <SelectItem value="display">Xe trưng bày</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Vehicle List */}
          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-8 text-slate-500">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
                Đang tải...
              </div>
            ) : filteredVehicles.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <Car className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Không tìm thấy xe nào</p>
              </div>
            ) : (
              filteredVehicles.map((vehicle) => (
                <div
                  key={vehicle.id}
                  className="p-4 border border-slate-200 rounded-2xl hover:border-indigo-200 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-slate-900">{vehicle.name}</h4>
                        <Badge className={VEHICLE_STATUS_COLORS[vehicle.status]}>
                          {VEHICLE_STATUS_LABELS[vehicle.status]}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-slate-600">
                        <div>
                          <span className="font-medium">Mẫu:</span> {vehicle.model}
                        </div>
                        <div>
                          <span className="font-medium">Màu:</span> {vehicle.color}
                        </div>
                        <div>
                          <span className="font-medium">Năm:</span> {vehicle.year}
                        </div>
                        {vehicle.vin && (
                          <div className="col-span-2">
                            <span className="font-medium">VIN:</span> {vehicle.vin}
                          </div>
                        )}
                        <div className="col-span-2">
                          <span className="font-medium">Giá:</span>{' '}
                          <span className="text-indigo-600 font-semibold">
                            {formatPrice(vehicle.price)}
                          </span>
                        </div>
                      </div>

                      {vehicle.specifications && (
                        <div className="flex flex-wrap gap-2 text-xs">
                          {vehicle.specifications.battery && (
                            <Badge variant="outline">🔋 {vehicle.specifications.battery}</Badge>
                          )}
                          {vehicle.specifications.range && (
                            <Badge variant="outline">📏 {vehicle.specifications.range} km</Badge>
                          )}
                          {vehicle.specifications.maxSpeed && (
                            <Badge variant="outline">⚡ {vehicle.specifications.maxSpeed} km/h</Badge>
                          )}
                          {vehicle.specifications.seats && (
                            <Badge variant="outline">👥 {vehicle.specifications.seats} chỗ</Badge>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(vehicle)}
                        className="border-slate-200 hover:border-indigo-300 hover:bg-indigo-50"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Sửa
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(vehicle)}
                        className="border-slate-200 hover:border-red-300 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Xóa
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination info */}
          {!loading && filteredVehicles.length > 0 && (
            <div className="text-sm text-slate-600 text-center pt-2">
              Hiển thị {filteredVehicles.length} trong tổng số {vehicles.length} xe
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <VehicleDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        vehicle={selectedVehicle}
        mode={dialogMode}
      />

      <DeleteVehicleDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        vehicle={selectedVehicle}
      />
    </div>
  );
}
