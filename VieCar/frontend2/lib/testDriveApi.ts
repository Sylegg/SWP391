import { API_BASE_URL } from './config';

// Test Drive Status
export enum TestDriveStatus {
  PENDING = 'PENDING',         // Customer tạo mới, chờ dealer assign xe
  ASSIGNING = 'ASSIGNING',     // Đang chờ nhân viên phân công xe
  APPROVED = 'APPROVED',       // Dealer đã assign xe và nhân viên
  IN_PROGRESS = 'IN_PROGRESS', // Đang thực hiện lái thử
  DONE = 'DONE',              // Hoàn thành
  REJECTED = 'REJECTED',       // Dealer từ chối
  CANCELLED = 'CANCELLED'      // Bị hủy
}

export interface TestDriveRes {
  id: number;
  scheduleDate: string;
  status: TestDriveStatus;
  notes: string;
  specificVIN?: string;
  productModelName?: string;  // NEW: Tên model customer nhập
  categoryId?: number;         // NEW: Category ID
  categoryName?: string;       // NEW: Category name
  productId?: number;          // NEW: Product ID - xe đã được phân công
  user: {
    userId: number;
    name: string;
    email: string;
    phone: string;
  };
  dealer: {
    id: number;
    name: string;
    address?: string;
    phone?: string;
  };
  productName?: string;        // Nullable - chỉ có sau khi staff assign
  escortStaff?: {              // NEW: Nhân viên đi cùng
    id: number;
    name: string;              // Changed from fullName to match backend UserRes
    email: string;
    phone: string;
  };
  attemptNumber?: number;      // NEW: Số lần đăng ký lái thử category này (1, 2, 3...)
}

export interface TestDriveReq {
  scheduleDate: string;
  notes?: string;
  specificVIN?: string;
  userId: number;
  dealerId: number;
  productId?: number;          // Optional - staff assigns later
  categoryId: number;          // NEW: Required - customer selects category
  productModelName?: string;   // NEW: Optional - customer inputs model name
  escortStaffId?: number;      // NEW: Optional - staff assigns
}

export interface UpdateTestDriveReq {
  status?: string;
  notes?: string;
  specificVIN?: string;
  scheduleDate?: string;
}

export interface AssignVehicleReq {
  productId: number;
  escortStaffId?: number;
}

// Get all test drives
export async function getAllTestDrives(): Promise<TestDriveRes[]> {
  const response = await fetch(`${API_BASE_URL}/api/testdrives/listTestDrives`);
  if (!response.ok) throw new Error('Failed to fetch test drives');
  return response.json();
}

// Get test drives by dealer ID
export async function getTestDrivesByDealerId(dealerId: number): Promise<TestDriveRes[]> {
  console.log('🔄 [API] getTestDrivesByDealerId called with dealerId:', dealerId);
  const url = `${API_BASE_URL}/api/testdrives/search/dealer/${dealerId}`;
  console.log('📡 [API] Fetching from URL:', url);
  
  const response = await fetch(url);
  console.log('📥 [API] Response status:', response.status);
  console.log('📥 [API] Response ok:', response.ok);
  
  if (!response.ok) {
    console.error('❌ [API] Failed to fetch, status:', response.status);
    throw new Error('Failed to fetch test drives by dealer');
  }
  
  const data = await response.json();
  console.log('📦 [API] Data received:', data);
  console.log('📊 [API] Number of test drives:', data.length);
  
  return data;
}

// Get test drives by user ID
export async function getTestDrivesByUserId(userId: number): Promise<TestDriveRes[]> {
  console.log('🔄 [API] getTestDrivesByUserId called with userId:', userId);
  const url = `${API_BASE_URL}/api/testdrives/search/user/${userId}`;
  console.log('📡 [API] Fetching from URL:', url);
  
  const response = await fetch(url);
  console.log('📥 [API] Response status:', response.status);
  
  if (!response.ok) {
    console.error('❌ [API] Failed to fetch, status:', response.status);
    throw new Error('Failed to fetch test drives by user');
  }
  
  const data = await response.json();
  console.log('📦 [API] User Test Drives Data:', data);
  console.log('👤 [API] First test drive escortStaff:', data[0]?.escortStaff);
  
  return data;
}

// Get test drive by ID
export async function getTestDriveById(id: number): Promise<TestDriveRes> {
  const response = await fetch(`${API_BASE_URL}/api/testdrives/search/id/${id}`);
  if (!response.ok) throw new Error('Failed to fetch test drive');
  return response.json();
}

// Create test drive
export async function createTestDrive(data: TestDriveReq): Promise<TestDriveRes> {
  console.log('Creating test drive with data:', data);
  const response = await fetch(`${API_BASE_URL}/api/testdrives/createTestDrive`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Backend error:', errorText);
    throw new Error(errorText || 'Failed to create test drive');
  }
  
  return response.json();
}

// Update test drive
export async function updateTestDrive(id: number, data: UpdateTestDriveReq): Promise<TestDriveRes> {
  const response = await fetch(`${API_BASE_URL}/api/testdrives/updateTestDrive/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update test drive');
  return response.json();
}

// Delete test drive
export async function deleteTestDrive(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/testdrives/deleteTestDrive/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete test drive');
}

// Check availability
export interface AvailabilityCheckRes {
  available: boolean;
  message: string;
  conflictingBookings?: {
    testDriveId: number;
    scheduleDate: string;
    customerName: string;
  }[];
}

export async function checkAvailability(
  productId: number,
  scheduleDate: string,
  durationHours: number = 2
): Promise<AvailabilityCheckRes> {
  const response = await fetch(
    `${API_BASE_URL}/api/testdrives/check-availability?productId=${productId}&scheduleDate=${scheduleDate}&durationHours=${durationHours}`
  );
  if (!response.ok) throw new Error('Failed to check availability');
  return response.json();
}

// Get available time slots
export interface TimeSlot {
  startTime: string;
  endTime: string;
  available: boolean;
  label: string;
}

export interface AvailableSlotsRes {
  date: string;
  slots: TimeSlot[];
}

export async function getAvailableSlots(
  productId: number,
  date: string
): Promise<AvailableSlotsRes> {
  const response = await fetch(
    `${API_BASE_URL}/api/testdrives/available-slots?productId=${productId}&date=${date}`
  );
  if (!response.ok) throw new Error('Failed to get available slots');
  return response.json();
}

// ============ Dealer Staff APIs ============

// Assign vehicle and escort staff (PENDING -> APPROVED)
export async function assignVehicleAndStaff(id: number, data: AssignVehicleReq): Promise<TestDriveRes> {
  const token = localStorage.getItem('token');
  
  console.log('🔧 API Call - Assign Vehicle:', {
    url: `${API_BASE_URL}/api/testdrives/${id}/assign`,
    method: 'POST',
    data,
    hasToken: !!token
  });
  
  const response = await fetch(`${API_BASE_URL}/api/testdrives/${id}/assign`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ API Error Response:', {
      status: response.status,
      statusText: response.statusText,
      body: errorText
    });
    
    let error;
    try {
      error = JSON.parse(errorText);
    } catch {
      error = { message: errorText || 'Unknown error' };
    }
    
    throw {
      response: { 
        data: error,
        status: response.status,
        statusText: response.statusText
      }
    };
  }
  
  const result = await response.json();
  console.log('✅ API Success Response:', result);
  return result;
}

// Approve test drive (PENDING -> APPROVED) - alias for backward compatibility
export async function approveTestDrive(id: number): Promise<TestDriveRes> {
  const response = await fetch(`${API_BASE_URL}/api/testdrives/${id}/approve`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) throw new Error('Failed to approve test drive');
  return response.json();
}

// Start test drive (APPROVED -> IN_PROGRESS)
export async function startTestDrive(id: number): Promise<TestDriveRes> {
  const response = await fetch(`${API_BASE_URL}/api/testdrives/${id}/start`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) throw new Error('Failed to start test drive');
  return response.json();
}

// Complete test drive (IN_PROGRESS -> DONE)
export async function completeTestDrive(id: number): Promise<TestDriveRes> {
  const response = await fetch(`${API_BASE_URL}/api/testdrives/${id}/complete`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) throw new Error('Failed to complete test drive');
  return response.json();
}

// Reject test drive (PENDING -> REJECTED)
export async function rejectTestDrive(id: number, notes?: string): Promise<TestDriveRes> {
  const response = await fetch(`${API_BASE_URL}/api/testdrives/${id}/reject`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ notes }),
  });
  if (!response.ok) throw new Error('Failed to reject test drive');
  return response.json();
}

// Cancel test drive (any -> CANCELLED)
export async function cancelTestDrive(id: number, notes?: string): Promise<TestDriveRes> {
  const response = await fetch(`${API_BASE_URL}/api/testdrives/${id}/cancel`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ notes }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw {
      response: { data: error }
    };
  }
  return response.json();
}

// Get calendar file
export function getCalendarUrl(id: number): string {
  return `${API_BASE_URL}/api/testdrives/${id}/calendar.ics`;
}
