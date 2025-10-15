export interface VehicleDistribution {
  id: string;
  vehicleId: string;
  vehicleName: string;
  vehicleModel: string;
  dealerId: string;
  dealerName: string;
  quantity: number;
  assignedDate: string;
  status: DistributionStatus;
  deliveryDate?: string;
  receivedDate?: string;
  notes?: string;
  assignedBy?: string;
  receivedBy?: string;
}

export type DistributionStatus = 
  | 'planned'           // Đã lên kế hoạch
  | 'allocated'         // Đã phân bổ
  | 'in_transit'        // Đang vận chuyển
  | 'delivered'         // Đã giao
  | 'received'          // Đã nhận
  | 'completed';        // Hoàn thành

export interface VehicleInventory {
  vehicleId: string;
  vehicleName: string;
  vehicleModel: string;
  totalQuantity: number;
  allocatedQuantity: number;
  availableQuantity: number;
  dealerInventories?: {
    dealerId: string;
    dealerName: string;
    quantity: number;
    status: DistributionStatus;
  }[];
}

export interface CreateDistributionRequest {
  vehicleId: string;
  dealerId: string;
  quantity: number;
  plannedDeliveryDate: string;
  notes?: string;
}

export interface UpdateDistributionRequest {
  status: DistributionStatus;
  deliveryDate?: string;
  receivedDate?: string;
  notes?: string;
}

export interface CustomerVehicleDelivery {
  orderId: string;
  vehicleId: string;
  vehicleName: string;
  customerName: string;
  dealerName: string;
  status: DistributionStatus;
  estimatedDeliveryDate?: string;
  actualDeliveryDate?: string;
  trackingInfo?: string;
}
