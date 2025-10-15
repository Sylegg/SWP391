export interface TestDrive {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  vehicleId: string;
  vehicleName: string;
  dealerId: string;
  dealerName: string;
  dealerStaffId?: string;
  dealerStaffName?: string;
  scheduledDate: string;
  scheduledTime: string;
  status: TestDriveStatus;
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

export type TestDriveStatus = 
  | 'pending'           // Chờ xử lý
  | 'scheduled'         // Đã lên lịch
  | 'confirmed'         // Đã xác nhận
  | 'approved'          // Đã duyệt (Manager)
  | 'completed'         // Hoàn thành
  | 'cancelled'         // Đã hủy
  | 'rejected';         // Từ chối

export interface CreateTestDriveRequest {
  vehicleId: string;
  dealerId: string;
  preferredDate: string;
  preferredTime: string;
  notes?: string;
}

export interface UpdateTestDriveRequest {
  scheduledDate?: string;
  scheduledTime?: string;
  status?: TestDriveStatus;
  notes?: string;
  dealerStaffId?: string;
}
