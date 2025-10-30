"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, LoginRequest, LoginResponse, RegisterRequest, RoleName } from '@/types/auth';
import api from '@/lib/api';
import { getUserProfile } from '@/lib/user';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => void;
  hasRole: (role: RoleName) => boolean;
  hasPermission: (permission: string) => boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    } else {
      // Set as Guest when user hasn't registered or logged in
      const guestUser: User = {
        id: 'guest',
        username: '',
        email: '',
        phone: '',
        address: '',
        role: {
          id: 0,
          name: 'Guest',
          description: 'Khách chưa đăng ký hoặc đăng nhập'
        }
      };
      setUser(guestUser);
      setToken(null);
    }
    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginRequest) => {
    try {
      setIsLoading(true);
      const { data } = await api.post<LoginResponse>('/api/auth/login', credentials);

      // Set token first so subsequent API calls can use it
      setToken(data.token);
      localStorage.setItem('token', data.token);
      localStorage.setItem('refreshToken', data.refreshToken);

      // Get user profile by username to get userId
      try {
        const userProfileRes = await api.get<any[]>(`/api/user/${data.username}`);
        // API trả về array, lấy phần tử đầu tiên
        const userProfile = userProfileRes.data[0];
        
        if (userProfile) {
          const userData: User = {
            id: userProfile.id?.toString(),
            username: data.username,
            email: userProfile.email,
            phone: userProfile.phone,
            address: userProfile.address,
            role: {
              name: data.role as RoleName,
            },
            dealerId: userProfile.dealerId,
            dealerName: userProfile.dealerName,
            dealerAddress: userProfile.dealerAddress,
          };

          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
        } else {
          throw new Error('User profile not found');
        }
      } catch (profileError) {
        console.error('Could not load user profile:', profileError);
        // Fallback to basic user data without id
        const userData: User = {
          username: data.username,
          role: {
            name: data.role as RoleName,
          },
        };
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
      }
    } catch (error) {
      console.error('Login error:', error);
      // Throw a more specific error message
      if ((error as any)?.response?.status === 401) {
        throw new Error('Email hoặc mật khẩu không đúng');
      } else if ((error as any)?.code === 'ECONNREFUSED' || (error as any)?.code === 'ERR_NETWORK') {
        throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra lại.');
      }
      throw new Error('Đã xảy ra lỗi khi đăng nhập. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterRequest) => {
    try {
      setIsLoading(true);
      await api.post('/api/auth/register', userData);

      await login({
        identifier: userData.email,
        password: userData.password,
      });
    } catch (error) {
      console.error('Registration error:', error);
      // Map duplicate email (409) to readable message
      const status = (error as any)?.response?.status;
      const msg = (error as any)?.response?.data;
      
      if (status === 409 || msg?.toString()?.toLowerCase()?.includes('email')) {
        throw new Error('Email đã tồn tại');
      } else if ((error as any)?.code === 'ECONNREFUSED' || (error as any)?.code === 'ERR_NETWORK') {
        throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra lại.');
      }
      throw new Error('Đã xảy ra lỗi khi đăng ký. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    
    // Set back to Guest after logout
    const guestUser: User = {
      id: 'guest',
      username: '',
      email: '',
      phone: '',
      address: '',
      role: {
        id: 0,
        name: 'Guest',
        description: 'Khách chưa đăng ký hoặc đăng nhập'
      }
    };
    setUser(guestUser);
  };

  const hasRole = (role: RoleName): boolean => {
    return user?.role?.name === role;
  };

  const hasPermission = (permission: string): boolean => {
    if (!user?.role?.name) return false;
    
    const rolePermissions: Record<string, string[]> = {
      Guest: ['view_vehicles'],
      Customer: ['view_vehicles', 'purchase', 'view_orders'],
      Admin: ['manage_users', 'manage_vehicles', 'manage_orders', 'view_analytics', 'manage_roles'],
      'EVM Staff': ['manage_vehicles', 'view_orders', 'customer_support'],
      'Dealer Manager': ['manage_dealer', 'view_dealer_analytics', 'manage_dealer_staff'],
      'Dealer Staff': ['view_vehicles', 'assist_customers', 'process_orders']
    };

    const userPermissions = rolePermissions[user.role.name] || [];
    return userPermissions.includes(permission);
  };

  const isAuthenticated = Boolean(user && user.role?.name !== 'Guest' && token);

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    hasRole,
    hasPermission,
    isAuthenticated,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};