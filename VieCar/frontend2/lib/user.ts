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
  const response = await api.get<UserRes[]>('/user/available-dealer-managers');
  return response.data;
}

// Get current user profile by ID
export async function getUserProfile(userId: number): Promise<UserRes> {
  const response = await api.get<UserRes>(`/user/Profile/${userId}`);
  return response.data;
}

// Get user by username
export async function getUserByUsername(username: string): Promise<UserRes> {
  const response = await api.get<UserRes>(`/user/profile/by-username/${username}`);
  return response.data;
}

// Delete user by id
export async function deleteUser(id: number): Promise<void> {
	await api.delete(`/user/${id}`);
}

// Get users by dealer ID
export async function getUsersByDealerId(dealerId: number): Promise<UserRes[]> {
  const response = await api.get<UserRes[]>(`/user/dealer/${dealerId}`);
  return response.data;
}

// Get dealer staff by dealer ID (only users with role "Dealer Staff")
export async function getDealerStaffByDealerId(dealerId: number): Promise<UserRes[]> {
  const response = await api.get<UserRes[]>(`/user/dealer/${dealerId}/staff`);
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
  const response = await api.post<UserRes>('/user/register', data);
  return response.data;
}

// Update user
export async function updateUser(id: number, data: Partial<CreateUserReq>): Promise<UserRes> {
  const response = await api.put<UserRes>(`/user/${id}`, data);
  return response.data;
}

// Additional user helpers can be added here as needed
