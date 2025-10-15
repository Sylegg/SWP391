"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Vehicle, CreateVehicleRequest, UpdateVehicleRequest, VEHICLE_MODELS, VEHICLE_COLORS, VehicleStatus } from "@/types/vehicle";
import { Loader2 } from "lucide-react";

interface VehicleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateVehicleRequest | UpdateVehicleRequest) => Promise<void>;
  vehicle?: Vehicle | null;
  mode: 'create' | 'edit';
}

export function VehicleDialog({ open, onOpenChange, onSubmit, vehicle, mode }: VehicleDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateVehicleRequest>({
    name: '',
    model: 'VinFast VF 5',
    year: new Date().getFullYear(),
    color: 'Trắng',
    vin: '',
    price: 0,
    status: 'available',
    location: '',
    notes: '',
    specifications: {
      seats: 5,
      battery: '',
      range: 0,
      maxSpeed: 0,
      acceleration: '',
      transmission: 'Tự động',
      driveType: 'FWD'
    }
  });

  useEffect(() => {
    if (vehicle && mode === 'edit') {
      setFormData({
        name: vehicle.name,
        model: vehicle.model,
        year: vehicle.year,
        color: vehicle.color,
        vin: vehicle.vin || '',
        price: vehicle.price,
        status: vehicle.status,
        location: '',
        notes: '',
        specifications: vehicle.specifications
      });
    } else {
      // Reset form when creating new
      setFormData({
        name: '',
        model: 'VinFast VF 5',
        year: new Date().getFullYear(),
        color: 'Trắng',
        vin: '',
        price: 0,
        status: 'available',
        location: '',
        notes: '',
        specifications: {
          seats: 5,
          battery: '',
          range: 0,
          maxSpeed: 0,
          acceleration: '',
          transmission: 'Tự động',
          driveType: 'FWD'
        }
      });
    }
  }, [vehicle, mode, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(formData);
      onOpenChange(false);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-slate-900">
            {mode === 'create' ? 'Thêm xe mới vào kho' : 'Chỉnh sửa thông tin xe'}
          </DialogTitle>
          <DialogDescription className="text-slate-600">
            {mode === 'create' ? 'Điền thông tin xe để thêm vào kho đại lý' : 'Cập nhật thông tin xe trong kho'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900 border-b pb-2">Thông tin cơ bản</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Tên xe *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="VD: VinFast VF 5"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="model">Mẫu xe *</Label>
                <Select value={formData.model} onValueChange={(value) => setFormData({ ...formData, model: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {VEHICLE_MODELS.map((model) => (
                      <SelectItem key={model} value={model}>{model}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="year">Năm sản xuất *</Label>
                <Input
                  id="year"
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                  min="2020"
                  max="2030"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="color">Màu sắc *</Label>
                <Select value={formData.color} onValueChange={(value) => setFormData({ ...formData, color: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {VEHICLE_COLORS.map((color) => (
                      <SelectItem key={color} value={color}>{color}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Giá (VNĐ) *</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) })}
                  placeholder="500000000"
                  min="0"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="vin">VIN (số khung)</Label>
                <Input
                  id="vin"
                  value={formData.vin}
                  onChange={(e) => setFormData({ ...formData, vin: e.target.value })}
                  placeholder="VD: LZWADAGA1KB123456"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Trạng thái *</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as VehicleStatus })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Sẵn sàng</SelectItem>
                    <SelectItem value="reserved">Đã đặt</SelectItem>
                    <SelectItem value="sold">Đã bán</SelectItem>
                    <SelectItem value="in_transit">Đang vận chuyển</SelectItem>
                    <SelectItem value="maintenance">Bảo trì</SelectItem>
                    <SelectItem value="display">Xe trưng bày</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Vị trí trong kho</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="VD: Khu A - Dãy 1 - Ô 05"
              />
            </div>
          </div>

          {/* Specifications */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900 border-b pb-2">Thông số kỹ thuật</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="battery">Pin</Label>
                <Input
                  id="battery"
                  value={formData.specifications?.battery || ''}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    specifications: { ...formData.specifications!, battery: e.target.value }
                  })}
                  placeholder="VD: 42.7 kWh"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="range">Quãng đường (km)</Label>
                <Input
                  id="range"
                  type="number"
                  value={formData.specifications?.range || 0}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    specifications: { ...formData.specifications!, range: parseInt(e.target.value) }
                  })}
                  placeholder="320"
                  min="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxSpeed">Tốc độ tối đa (km/h)</Label>
                <Input
                  id="maxSpeed"
                  type="number"
                  value={formData.specifications?.maxSpeed || 0}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    specifications: { ...formData.specifications!, maxSpeed: parseInt(e.target.value) }
                  })}
                  placeholder="160"
                  min="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="acceleration">Tăng tốc 0-100km/h</Label>
                <Input
                  id="acceleration"
                  value={formData.specifications?.acceleration || ''}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    specifications: { ...formData.specifications!, acceleration: e.target.value }
                  })}
                  placeholder="VD: 9.8s"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="seats">Số chỗ ngồi</Label>
                <Input
                  id="seats"
                  type="number"
                  value={formData.specifications?.seats || 5}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    specifications: { ...formData.specifications!, seats: parseInt(e.target.value) }
                  })}
                  min="2"
                  max="9"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="driveType">Hệ dẫn động</Label>
                <Select 
                  value={formData.specifications?.driveType || 'FWD'} 
                  onValueChange={(value) => setFormData({ 
                    ...formData, 
                    specifications: { ...formData.specifications!, driveType: value }
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FWD">Cầu trước (FWD)</SelectItem>
                    <SelectItem value="RWD">Cầu sau (RWD)</SelectItem>
                    <SelectItem value="AWD">4 bánh (AWD)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Ghi chú</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Thông tin bổ sung về xe..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Hủy
            </Button>
            <Button type="submit" disabled={loading} className="bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-700 hover:to-sky-700">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === 'create' ? 'Thêm xe' : 'Cập nhật'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
