// Vehicle Types for Dealer Manager Inventory Management

export interface Vehicle {
  id: string;
  name: string;
  model: string; // VF3, VF5, VF6, VF7, VF8, VF9, Limo Green
  year: number;
  color: string;
  vin?: string; // Vehicle Identification Number
  price: number;
  images?: string[];
  specifications?: VehicleSpecification;
  status: VehicleStatus;
  createdAt: string;
  updatedAt: string;
}

export interface VehicleSpecification {
  engine?: string;
  battery?: string;
  range?: number; // km
  maxSpeed?: number; // km/h
  acceleration?: string; // 0-100 km/h
  seats?: number;
  transmission?: string;
  driveType?: string; // FWD, RWD, AWD
}

export type VehicleStatus = 
  | 'available'      // Sẵn sàng
  | 'reserved'       // Đã đặt
  | 'sold'           // Đã bán
  | 'in_transit'     // Đang vận chuyển
  | 'maintenance'    // Bảo trì
  | 'display';       // Xe trưng bày

export interface DealerInventoryItem {
  id: string;
  dealerId: string;
  dealerName: string;
  vehicleId: string;
  vehicle?: Vehicle;
  quantity: number;
  status: VehicleStatus;
  location?: string; // Vị trí trong showroom/kho
  notes?: string;
  assignedDate: string;
  updatedAt: string;
}

export interface CreateVehicleRequest {
  name: string;
  model: string;
  year: number;
  color: string;
  vin?: string;
  price: number;
  images?: string[];
  specifications?: VehicleSpecification;
  status: VehicleStatus;
  location?: string;
  notes?: string;
}

export interface UpdateVehicleRequest {
  name?: string;
  model?: string;
  year?: number;
  color?: string;
  vin?: string;
  price?: number;
  images?: string[];
  specifications?: VehicleSpecification;
  status?: VehicleStatus;
  location?: string;
  notes?: string;
}

export interface VehicleFilterParams {
  model?: string;
  status?: VehicleStatus;
  color?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  page?: number;
  limit?: number;
}

export interface VehicleStatsResponse {
  total: number;
  available: number;
  reserved: number;
  sold: number;
  inTransit: number;
  maintenance: number;
  display: number;
  byModel: {
    model: string;
    count: number;
    available: number;
    reserved: number;
    sold: number;
  }[];
}

export const VEHICLE_MODELS = [
  'VinFast VF 3',
  'VinFast VF 5', 
  'VinFast VF 6',
  'VinFast VF 7',
  'VinFast VF 8',
  'VinFast VF 9',
  'VinFast Limo Green'
] as const;

export const VEHICLE_COLORS = [
  'Trắng',
  'Đen',
  'Xanh Dương',
  'Xanh Lá',
  'Đỏ',
  'Xám',
  'Bạc',
  'Nâu'
] as const;

export const VEHICLE_STATUS_LABELS: Record<VehicleStatus, string> = {
  available: 'Sẵn sàng',
  reserved: 'Đã đặt',
  sold: 'Đã bán',
  in_transit: 'Đang vận chuyển',
  maintenance: 'Bảo trì',
  display: 'Xe trưng bày'
};

export const VEHICLE_STATUS_COLORS: Record<VehicleStatus, string> = {
  available: 'bg-green-100 text-green-700 border-green-200',
  reserved: 'bg-blue-100 text-blue-700 border-blue-200',
  sold: 'bg-gray-100 text-gray-700 border-gray-200',
  in_transit: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  maintenance: 'bg-orange-100 text-orange-700 border-orange-200',
  display: 'bg-purple-100 text-purple-700 border-purple-200'
};
