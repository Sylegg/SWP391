export interface User {
  id?: string;
  username: string;
  email?: string;
  phone?: string;
  address?: string;
  role: Role;
  dealerId?: number;
  dealerName?: string;
  dealerAddress?: string;
}

// Backend UserRes DTO
export interface UserRes {
  id: number;
  username: string;
  email?: string;
  phone?: string;
  address?: string;
  role?: Role;
  roleName?: string;
  dealerId?: number;
  dealerName?: string;
  dealerAddress?: string;
}

export interface Role {
  id?: number;
  name: string;
  description?: string;
}

export interface LoginRequest {
  identifier: string; // email or phone
  password: string;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  username: string;
  role: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  phone: string;
  address: string;
  password: string;
  confirmPassword: string;
  roleName?: string; // Backend expects "Customer", "Admin", "EVM Staff", "Dealer Manager", "Dealer Staff"
}

export type RoleName = 'Guest' | 'Customer' | 'Admin' | 'EVM Staff' | 'Dealer Manager' | 'Dealer Staff';

export const ROLE_PERMISSIONS = {
  Guest: ['view_vehicles'],
  Customer: ['view_vehicles', 'purchase', 'view_orders', 'register_test_drive', 'view_test_drive_history'],
  Admin: ['manage_users', 'manage_vehicles', 'manage_orders', 'view_analytics', 'manage_roles'],
  'EVM Staff': ['manage_vehicles', 'view_orders', 'customer_support'],
  'Dealer Manager': ['manage_dealer', 'view_dealer_analytics', 'manage_dealer_staff', 'manage_test_drives'],
  'Dealer Staff': ['view_vehicles', 'assist_customers', 'process_orders', 'manage_test_drives']
} as const;