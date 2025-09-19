export type UserRole = 
  | 'ADMIN'
  | 'EVM_STAFF'
  | 'DEALER_MANAGER'
  | 'DEALER_STAFF'
  | 'CUSTOMER'
  | 'GUEST';

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  role: UserRole;
  dealerId?: string; // For dealer staff/manager
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Permission {
  resource: string;
  actions: ('create' | 'read' | 'update' | 'delete')[];
}

export interface RolePermissions {
  [key: string]: Permission[];
}

export const ROLE_PERMISSIONS: RolePermissions = {
  ADMIN: [
    { resource: 'users', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'dealers', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'vehicles', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'orders', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'dashboard', actions: ['read'] },
  ],
  EVM_STAFF: [
    { resource: 'vehicles', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'dealers', actions: ['read', 'update'] },
    { resource: 'orders', actions: ['read', 'update'] },
    { resource: 'dashboard', actions: ['read'] },
  ],
  DEALER_MANAGER: [
    { resource: 'dealer_vehicles', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'dealer_staff', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'dealer_orders', actions: ['read', 'update'] },
    { resource: 'dashboard', actions: ['read'] },
  ],
  DEALER_STAFF: [
    { resource: 'dealer_vehicles', actions: ['read', 'update'] },
    { resource: 'dealer_orders', actions: ['read', 'update'] },
    { resource: 'customers', actions: ['read', 'update'] },
    { resource: 'dashboard', actions: ['read'] },
  ],
  CUSTOMER: [
    { resource: 'vehicles', actions: ['read'] },
    { resource: 'orders', actions: ['create', 'read'] },
    { resource: 'profile', actions: ['read', 'update'] },
  ],
  GUEST: [
    { resource: 'vehicles', actions: ['read'] },
    { resource: 'public', actions: ['read'] },
  ],
};

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  phone: string;
  address: string;
  password: string;
  confirmPassword: string;
  role?: UserRole;
}