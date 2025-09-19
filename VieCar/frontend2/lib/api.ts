import { LoginCredentials, RegisterData, User } from '@/types/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:6969/api';

// Request/Response interfaces matching backend DTOs
interface LoginRequest {
  identifier: string; // Backend uses 'identifier' instead of 'email'
  password: string;
}

interface LoginResponse {
  token: string;
  refreshToken: string;
  username: string;
  role: string;
}

interface RegisterRequest {
  username: string;
  phone: string;
  email: string;
  address: string;
  password: string;
  confirmPassword: string;
}

// API service class
export class AuthAPI {
  private static async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      // Try to parse JSON safely
      const tryParseJson = async () => {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          try {
            return await response.json();
          } catch {
            return null;
          }
        }
        return null;
      };

      if (!response.ok) {
        const json = await tryParseJson();
        // Spring's default error body often contains "message" and "error"
        const message = json?.message || json?.error || (await response.text());
        const statusText = response.statusText || 'Error';
        throw new Error(`HTTP ${response.status} ${statusText}${message ? `: ${message}` : ''}`);
      }

      // For endpoints that return strings (like register), handle differently
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return (await response.json()) as T;
      } else {
        return (await response.text()) as T;
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error occurred');
    }
  }

  static async login(credentials: LoginCredentials): Promise<{
    user: User;
    token: string;
    refreshToken: string;
  }> {
    const loginRequest: LoginRequest = {
      identifier: credentials.email, // Backend expects 'identifier'
      password: credentials.password,
    };

    const response = await this.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(loginRequest),
    });

    // Map backend role to frontend role
    const mapRole = (backendRole: string): User['role'] => {
      switch (backendRole.toUpperCase()) {
        case 'ADMIN':
          return 'ADMIN';
        case 'EVM_STAFF':
          return 'EVM_STAFF';
        case 'DEALER_MANAGER':
          return 'DEALER_MANAGER';
        case 'DEALER_STAFF':
          return 'DEALER_STAFF';
        case 'CUSTOMER':
          return 'CUSTOMER';
        default:
          return 'CUSTOMER';
      }
    };

    // Create user object from response
    const user: User = {
      id: response.username, // Using username as ID for now
      email: credentials.email,
      fullName: response.username,
      phone: '',
      role: mapRole(response.role),
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Store tokens in localStorage
    localStorage.setItem('token', response.token);
    localStorage.setItem('refreshToken', response.refreshToken);

    return {
      user,
      token: response.token,
      refreshToken: response.refreshToken,
    };
  }

  static async register(data: RegisterData): Promise<string> {
    const registerRequest: RegisterRequest = {
      username: data.username,
      phone: data.phone,
      email: data.email,
      address: data.address,
      password: data.password,
      confirmPassword: data.confirmPassword,
    };

    const response = await this.request<string>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(registerRequest),
    });

    return response;
  }

  static async registerAdmin(data: RegisterData): Promise<string> {
    const registerRequest: RegisterRequest = {
      username: data.username,
      phone: data.phone,
      email: data.email,
      address: data.address,
      password: data.password,
      confirmPassword: data.confirmPassword,
    };

    const response = await this.request<string>('/auth/registerAdmin', {
      method: 'POST',
      body: JSON.stringify(registerRequest),
    });

    return response;
  }

  // Helper method to get stored token
  static getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  }

  // Helper method to get stored refresh token
  static getRefreshToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('refreshToken');
    }
    return null;
  }

  // Helper method to clear stored tokens
  static clearTokens(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
    }
  }

  // Helper method to check if user is authenticated
  static isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

// Export default for convenience
export default AuthAPI;