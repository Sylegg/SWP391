import api from './api';

// User response type
export interface UserRes {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  role: string;
  status: string;
  dealerId?: number;
  dealerName?: string;
  dealerAddress?: string;
}

// Get available dealer managers (users with role "dealer manager" without dealer)
export async function getAvailableDealerManagers(): Promise<UserRes[]> {
  const response = await api.get<UserRes[]>('/api/user/available-dealer-managers');
  return response.data;
}

// Get current user profile by ID
export async function getUserProfile(userId: number): Promise<UserRes> {
  const response = await api.get<UserRes>(`/api/user/Profile/${userId}`);
  return response.data;
}

// Delete user by id
export async function deleteUser(id: number): Promise<void> {
	await api.delete(`/api/user/${id}`);
}

// Get users by dealer ID
export async function getUsersByDealerId(dealerId: number): Promise<UserRes[]> {
  const response = await api.get<UserRes[]>(`/api/user/dealer/${dealerId}`);
  return response.data;
}

// Get dealer staff by dealer ID (only users with role "Dealer Staff")
export async function getDealerStaffByDealerId(dealerId: number): Promise<UserRes[]> {
  const response = await api.get<UserRes[]>(`/api/user/dealer/${dealerId}/staff`);
  return response.data;
}

// Create user request type
export interface CreateUserReq {
  name: string;
  email: string;
  password: string;
  phone: string;
  address: string;
  role: string;
  dealerId?: number;
}

// Create new user (staff)
export async function createUser(data: CreateUserReq): Promise<UserRes> {
  const response = await api.post<UserRes>('/api/user/register', data);
  return response.data;
}

// Update user
export async function updateUser(id: number, data: Partial<CreateUserReq>): Promise<UserRes> {
  const response = await api.put<UserRes>(`/api/user/${id}`, data);
  return response.data;
}

// Additional user helpers can be added here as needed
