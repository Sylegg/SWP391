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
  loadUserFromToken: () => Promise<void>;
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
      
      // ⭐ Set userId từ response (backend login đã trả đủ thông tin)
      if ((data as any).userId) {
        userData.id = (data as any).userId.toString();
        console.log('✅ User logged in:', userData.id, 'Role:', data.role);
        if (userData.dealerId) {
          console.log('✅ DealerId:', userData.dealerId);
        }
      }
      
      // ⭐ Set user state và save to localStorage
      setUser(userData);

      localStorage.setItem('token', data.token);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      console.error('Login error:', error);
      
      // Xử lý response data từ backend
      const responseData = (error as any)?.response?.data;
      const errorMessage = responseData?.message;
      
      // Kiểm tra nếu là lỗi email chưa xác thực
      if (responseData?.requireOtp && responseData?.email) {
        // Throw error với thông tin đặc biệt để page xử lý
        const otpError = new Error(errorMessage || 'Email chưa được xác thực');
        (otpError as any).requireOtp = true;
        (otpError as any).email = responseData.email;
        throw otpError;
      }
      
      if (errorMessage) {
        // Backend đã trả về message rõ ràng (tiếng Việt)
        throw new Error(errorMessage);
      } else if ((error as any)?.response?.status === 401) {
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

  /**
   * LOAD USER FROM TOKEN
   * 
   * Method này load user info từ JWT token có sẵn trong localStorage.
   * Dùng cho Google OAuth callback vì Google user không có password.
   * 
   * Flow:
   * 1. Đọc token từ localStorage (được lưu từ Google OAuth callback)
   * 2. Decode JWT payload để lấy username (không cần verify signature vì chỉ đọc info)
   * 3. Tạo User object với thông tin cơ bản từ token
   * 4. Gọi getUserProfile() để lấy full user info từ backend (email, phone, dealerId, etc.)
   * 5. Update AuthContext state và lưu vào localStorage
   * 
   * Lý do không gọi login API:
   * - Google user được tạo với password empty
   * - Gọi POST /api/auth/login với empty credentials sẽ bị 401 Unauthorized
   * - Token đã có sẵn từ backend, chỉ cần load user info
   * 
   * Note: Method này chỉ dùng cho Google OAuth callback.
   * Normal login vẫn dùng login() method với username/password.
   */
  const loadUserFromToken = async () => {
    // Đọc token, role và userId từ localStorage
    const storedToken = localStorage.getItem('token');
    const storedRole = localStorage.getItem('role');
    const storedUserId = localStorage.getItem('userId');
    
    // Nếu không có token thì return (không thể load user)
    if (!storedToken) {
      console.error('No token found in localStorage');
      return;
    }

    try {
      setIsLoading(true);
      
      // Decode JWT để lấy username từ payload
      // JWT format: header.payload.signature
      // Payload là base64 encoded JSON object chứa claims (sub, exp, iat, etc.)
      const payload = JSON.parse(atob(storedToken.split('.')[1])); // atob() decode base64
      const username = payload.sub;  // 'sub' (subject) là username trong JWT
      
      // Tạo User object với thông tin cơ bản từ token và localStorage
      const userData: User = {
        username: username,
        role: {
          name: (storedRole || 'Customer') as RoleName, // Fallback to Customer nếu không có role
        },
      };

      // Set token vào state
      setToken(storedToken);

      // Gọi getUserProfile() để lấy full user info từ backend nếu có userId
      // API này trả về: id, email, phone, address, dealerId, dealerName, etc.
      if (storedUserId) {
        try {
          const profile = await getUserProfile(parseInt(storedUserId));
          
          // Update userData với thông tin đầy đủ từ backend
          userData.id = profile.id?.toString();
          userData.username = profile.name; // Backend trả về 'name' field
          userData.email = profile.email;
          userData.phone = profile.phone;
          userData.address = profile.address;
          userData.dealerId = profile.dealerId;
          userData.dealerName = profile.dealerName;
          userData.dealerAddress = profile.dealerAddress;
          
          console.log('✅ User loaded from token:', userData.id, 'Role:', storedRole);
          if (userData.dealerId) {
            console.log('✅ DealerId:', userData.dealerId);
          }
        } catch (error) {
          console.warn('⚠️ Could not fetch user profile, using basic info from token');
        }
      }

      // Update AuthContext state
      setUser(userData);

      // Lưu user info vào localStorage để persist
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      console.error('Error loading user from token:', error);
    } finally {
      setIsLoading(false);
    }
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
    loadUserFromToken,
    hasRole,
    hasPermission,
    isAuthenticated,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};