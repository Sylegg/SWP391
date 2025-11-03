import { API_CONFIG } from './config';

const API_BASE_URL = API_CONFIG.BACKEND_URL;

export interface UserReq {
  username: string;
  email?: string;
  phone?: string;
  address?: string;
  password: string;
  roleName: string;
  dealerId?: number;
  status?: string;  // "ACTIVE" or "INACTIVE"
}

export interface UserRes {
  id: number;
  username: string;
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  role?: string;  // Backend uses "role", not "roleName"
  roleName?: string;  // Keep for backward compatibility
  status?: string;
  dealerId?: number;
  dealerName?: string;
  dealerAddress?: string;
}

// Get all users by dealer ID
export async function getUsersByDealerId(dealerId: number): Promise<UserRes[]> {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/api/user/dealer/${dealerId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch users');
  }
  
  return response.json();
}

// Get all users by role name
export async function getUsersByRole(roleName: string): Promise<UserRes[]> {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/api/user/listUser`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch users');
  }
  
  const allUsers: UserRes[] = await response.json();
  console.log('📋 All users from backend:', allUsers);
  console.log('📋 Filtering by roleName:', roleName);
  // Backend uses "role" field, not "roleName"
  const filtered = allUsers.filter(u => (u.role === roleName || u.roleName === roleName));
  console.log('📋 Filtered users:', filtered);
  return filtered;
}

// Get user by ID
export async function getUserById(userId: number): Promise<UserRes> {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/api/user/Profile/${userId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch user');
  }
  
  return response.json();
}

// Get dealer staff by dealer ID (only users with role "Dealer Staff")
export async function getDealerStaffByDealerId(dealerId: number): Promise<UserRes[]> {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/api/user/dealer/${dealerId}/staff`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch dealer staff');
  }
  
  return response.json();
}

// Create new user (staff) - using register endpoint
export async function createUser(user: UserReq): Promise<UserRes> {
  const token = localStorage.getItem('token');
  
  // Step 1: Register user with RegisterReq format (now includes dealerId)
  const registerReq = {
    username: user.username,
    password: user.password,
    confirmPassword: user.password, // Same as password
    email: user.email || '',
    phone: user.phone || '',
    address: user.address || '',
    roleName: user.roleName,
    dealerId: user.dealerId || null, // Include dealerId in registration
  };
  
  const registerResponse = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(registerReq),
  });
  
  if (!registerResponse.ok) {
    const errorText = await registerResponse.text();
    throw new Error(errorText || 'Failed to create user');
  }
  
  // Register returns only string message
  const successMessage = await registerResponse.text();
  console.log('✅ User registered successfully:', successMessage);
  
  // Step 2: Retrieve the newly created user to get full details
  const getUserResponse = await fetch(`${API_BASE_URL}/api/user/${user.username}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  
  if (!getUserResponse.ok) {
    throw new Error('User created but failed to retrieve user info');
  }
  
  const newUser: UserRes = await getUserResponse.json();
  console.log('✅ User retrieved with dealerId:', newUser.dealerId);
  
  return newUser;
}

// Update user profile
export async function updateUser(id: number, user: Partial<UserReq>): Promise<UserRes> {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/api/user/profile/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(user),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update user');
  }
  
  return response.json();
}

// Delete user
export async function deleteUser(id: number): Promise<void> {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/api/user/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Failed to delete user');
  }
}

// Update preferred dealer cho customer
export async function updatePreferredDealer(userId: number, dealerId: number | null): Promise<UserRes> {
  const token = localStorage.getItem('token');
  const url = dealerId 
    ? `${API_BASE_URL}/api/user/${userId}/preferred-dealer?dealerId=${dealerId}`
    : `${API_BASE_URL}/api/user/${userId}/preferred-dealer`;
    
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Failed to update preferred dealer');
  }
  
  return response.json();
}
