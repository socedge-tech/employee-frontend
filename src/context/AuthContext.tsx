import * as React from 'react';
import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User, UserRole } from '../types/rbac';
import { UserRole as UserRoleVal } from '../types/rbac';

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
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
  const [user, setUser] = useState<User | null>(null);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('currentUser');
      }
    } else {
      // Default to Super Admin for demo
      const defaultUser = mockUsers['superadmin@company.com'];
      setUser(defaultUser);
      localStorage.setItem('currentUser', JSON.stringify(defaultUser));
    }
  }, []);

  // Save user to localStorage when it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [user]);

  const login = async (email: string, _password?: string) => {
    // Mock login - in production, this would call an API
    const foundUser = mockUsers[email.toLowerCase()];
    if (foundUser) {
      setUser(foundUser);
    } else {
      throw new Error('Invalid credentials');
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
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
