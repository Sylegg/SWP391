export interface User {
  id?: string;
  username: string;
  email?: string;
  phone?: string;
  address?: string;
  role: Role;
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
  roleName?: RoleName;
}

export type RoleName = 'Customer' | 'Admin' | 'EVM_Staff' | 'Dealer_Manager' | 'Dealer_Staff';

export const ROLE_PERMISSIONS = {
  Customer: ['view_vehicles', 'purchase', 'view_orders'],
  Admin: ['manage_users', 'manage_vehicles', 'manage_orders', 'view_analytics', 'manage_roles'],
  EVM_Staff: ['manage_vehicles', 'view_orders', 'customer_support'],
  Dealer_Manager: ['manage_dealer', 'view_dealer_analytics', 'manage_dealer_staff'],
  Dealer_Staff: ['view_vehicles', 'assist_customers', 'process_orders']
} as const;