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
  updatePreferredDealer: (dealerId: number | null) => Promise<void>;
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
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      
      // ⭐ Load lại user profile từ backend để verify dealerId
      if (parsedUser.id && parsedUser.id !== 'guest') {
        loadUserFromBackend(parsedUser.id);
      }
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

  // ⭐ Function load user profile từ backend (bao gồm dealerId)
  const loadUserFromBackend = async (userId: string) => {
    try {
      console.log('🔄 Loading user profile from backend...', userId);
      const userProfile = await getUserProfile(parseInt(userId));
      
      // Update user với dealer info từ backend
      setUser(prevUser => {
        if (!prevUser) return null;
        const updated = {
          ...prevUser,
          dealerId: userProfile.dealerId,
          dealerName: userProfile.dealerName,
          dealerAddress: userProfile.dealerAddress
        };
        // Save to localStorage
        localStorage.setItem('user', JSON.stringify(updated));
        return updated;
      });
      
      console.log('✅ User profile loaded, dealerId:', userProfile.dealerId);
    } catch (error) {
      console.error('❌ Error loading user profile from backend:', error);
    }
  };

  const login = async (credentials: LoginRequest) => {
    try {
      setIsLoading(true);
      const { data } = await api.post<LoginResponse>('/auth/login', credentials);

      const userData: User = {
        username: data.username,
        role: {
          name: data.role as RoleName,
        },
        // Thêm thông tin dealer nếu có từ response
        dealerId: (data as any).dealerId,
        dealerName: (data as any).dealerName,
        dealerAddress: (data as any).dealerAddress,
      };

      setToken(data.token);
      
      // ⭐ QUAN TRỌNG: Set userId TRƯỚC KHI gọi API
      if ((data as any).userId) {
        userData.id = (data as any).userId.toString();
        console.log('✅ User ID set:', userData.id);
        
        try {
          const userProfile = await getUserProfile((data as any).userId);
          // ⭐ Cập nhật dealerId từ backend
          if (userProfile.dealerId) {
            userData.dealerId = userProfile.dealerId;
            userData.dealerName = userProfile.dealerName;
            userData.dealerAddress = userProfile.dealerAddress;
            console.log('✅ Login: Found dealerId:', userProfile.dealerId);
          } else {
            console.log('ℹ️ Login: No dealerId');
          }
        } catch (profileError) {
          console.warn('Could not load user profile:', profileError);
        }
      }
      
      // ⭐ Set user state và save to localStorage (với dealerId đã được set)
      setUser(userData);

      localStorage.setItem('token', data.token);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('user', JSON.stringify(userData));
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
      await api.post('/auth/register', userData);

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

  // ⭐ Function để update dealer cho customer
  const updatePreferredDealer = async (dealerId: number | null) => {
    if (!user?.id || user.id === 'guest') {
      console.error('❌ No user ID to update dealer');
      return;
    }

    try {
      console.log('🔄 Updating dealer...', { userId: user.id, dealerId });
      
      // Dynamic import để tránh circular dependency
      const { updatePreferredDealer: updatePreferredDealerApi } = await import('@/lib/userApi');
      
      // Gọi API
      const updatedUser = await updatePreferredDealerApi(parseInt(user.id), dealerId);
      
      console.log('✅ Dealer updated:', updatedUser);
      
      // ⭐ Update user state với dealerId mới
      setUser(prevUser => {
        if (!prevUser) return null;
        const updated = {
          ...prevUser,
          dealerId: updatedUser.dealerId,
          dealerName: updatedUser.dealerName,
          dealerAddress: updatedUser.dealerAddress
        };
        // Save to localStorage
        localStorage.setItem('user', JSON.stringify(updated));
        return updated;
      });
    } catch (error) {
      console.error('❌ Error updating dealer:', error);
      throw error;
    }
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
    updatePreferredDealer,
    hasRole,
    hasPermission,
    isAuthenticated,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};