import * as React from 'react';
import { createContext, useContext, useState, useEffect } from 'react';
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
  switchRole: (role: UserRole) => void; // For demo purposes
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demonstration
const mockUsers: Record<string, User> = {
  'superadmin@company.com': {
    id: 'sa-001',
    name: 'Sarah Chen',
    email: 'superadmin@company.com',
    role: UserRoleVal.SUPER_ADMIN,
    departmentId: 'dept-executive',
    employeeId: 'EMP-001',
    position: 'Chief Executive Officer',
    avatar: 'https://i.pravatar.cc/150?img=1',
  },
  'admin@company.com': {
    id: 'admin-001',
    name: 'Michael Rodriguez',
    email: 'admin@company.com',
    role: UserRoleVal.ADMIN,
    departmentId: 'dept-hr',
    employeeId: 'EMP-002',
    position: 'HR Director',
    avatar: 'https://i.pravatar.cc/150?img=33',
  },
  'manager@company.com': {
    id: 'mgr-001',
    name: 'Emily Johnson',
    email: 'manager@company.com',
    role: UserRoleVal.MANAGER,
    departmentId: 'dept-engineering',
    managerId: 'admin-001',
    employeeId: 'EMP-003',
    position: 'Engineering Manager',
    avatar: 'https://i.pravatar.cc/150?img=5',
  },
  'employee@company.com': {
    id: 'emp-001',
    name: 'David Kim',
    email: 'employee@company.com',
    role: UserRoleVal.EMPLOYEE,
    departmentId: 'dept-engineering',
    managerId: 'mgr-001',
    employeeId: 'EMP-004',
    position: 'Software Engineer',
    avatar: 'https://i.pravatar.cc/150?img=12',
  },
};

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
      // Note: We don't remove token here because logout() handles that.
      // This effect is mainly for ensuring the object in storage is up-to-date if setUser is called.
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

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('pendingEmail');
    sessionStorage.removeItem('is_session_active');
  };

  const switchRole = (role: UserRole) => {
    // For demo purposes - switch between roles
    const userByRole = Object.values(mockUsers).find(u => u.role === role);
    if (userByRole) {
      setUser(userByRole);
    }
  };

  const value: AuthContextType = {
    user,
    setUser,
    isAuthenticated: !!user,
    login,
    verifyOtp: verifyOtpStep,
    logout,
    switchRole,
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
