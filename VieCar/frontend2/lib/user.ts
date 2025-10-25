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

// Additional user helpers can be added here as needed
