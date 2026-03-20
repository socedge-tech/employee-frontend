import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { User, UserRole } from '../types/rbac';
import { UserRole as UserRoleVal } from '../types/rbac';
import { loginUser, verifyOtp } from '../api/auth/auth';

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<any>;
  verifyOtp: (email: string, otp: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    
    if (storedUser && storedToken) {
      try {
        return JSON.parse(storedUser);
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    return null;
  });

  // Sync user state to localStorage when it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  const login = async (email: string, password?: string) => {
    try {
      const response = await loginUser(email, password || '');
      if (response.success) {
        return response;
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.data?.message || error.message || 'Invalid credentials');
    }
  };

  const verifyOtpStep = async (email: string, otp: string) => {
    try {
      const response = await verifyOtp(email, otp);
      if (response.success && response.data) {
        const { token, user: userData } = response.data;
        
        // Normalize backend roles to frontend UserRole enum
        const backendRoles = userData.roles || [];
        const normalizedRoles = backendRoles.map((r: string) => 
          r.toUpperCase().replace(/\s+/g, '_')
        );

        // Determine primary role (highest priority)
        let primaryRole: UserRole = UserRoleVal.EMPLOYEE;
        if (normalizedRoles.includes(UserRoleVal.SUPER_ADMIN)) {
          primaryRole = UserRoleVal.SUPER_ADMIN;
        } else if (normalizedRoles.includes(UserRoleVal.ADMIN)) {
          primaryRole = UserRoleVal.ADMIN;
        } else if (normalizedRoles.includes(UserRoleVal.FINANCE)) {
          primaryRole = UserRoleVal.FINANCE;
        } else if (normalizedRoles.includes(UserRoleVal.MANAGER)) {
          primaryRole = UserRoleVal.MANAGER;
        }

        const mappedUser: User = {
          id: userData.id.toString(),
          name: userData.first_name ? `${userData.first_name} ${userData.last_name || ''}` : userData.username || userData.email,
          email: userData.email,
          role: primaryRole,
          roles: backendRoles,
          permissions: userData.permissions || [],
          departmentId: userData.department_id?.toString() || '',
          employeeId: userData.employee_id || userData.id.toString(),
          position: userData.designation || (primaryRole === UserRoleVal.SUPER_ADMIN ? 'Super Admin' : 'Employee'),
          avatar: userData.avatar,
        };

        localStorage.setItem('token', token);
        setUser(mappedUser);
      } else {
        throw new Error(response.message || 'Verification failed');
      }
    } catch (error: any) {
      console.error('OTP verification error:', error);
      throw new Error(error.data?.message || error.message || 'Invalid OTP');
    }
  };

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('pendingEmail');
    sessionStorage.removeItem('is_session_active');
  }, []);

  const value: AuthContextType = {
    user,
    setUser,
    isAuthenticated: !!user,
    login,
    verifyOtp: verifyOtpStep,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
