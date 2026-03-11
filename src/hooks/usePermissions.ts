import { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { Permission, UserRole } from '../types/rbac';
import { hasPermission, hasAnyPermission, hasAllPermissions } from '../config/permissions';

export function usePermissions() {
  const { user } = useAuth();

  const permissions = useMemo(() => {
    if (!user) return [];
    return user.role;
  }, [user]);

  const can = (permission: Permission): boolean => {
    if (!user) return false;
    return hasPermission(user.role, permission);
  };

  const canAny = (permissionList: Permission[]): boolean => {
    if (!user) return false;
    return hasAnyPermission(user.role, permissionList);
  };

  const canAll = (permissionList: Permission[]): boolean => {
    if (!user) return false;
    return hasAllPermissions(user.role, permissionList);
  };

  const isSuperAdmin = user?.role === UserRole.SUPER_ADMIN;
  const isAdmin = user?.role === UserRole.ADMIN;
  const isManager = user?.role === UserRole.MANAGER;
  const isEmployee = user?.role === UserRole.EMPLOYEE;

  const isAdminOrAbove = isSuperAdmin || isAdmin;
  const isManagerOrAbove = isSuperAdmin || isAdmin || isManager;

  return {
    can,
    canAny,
    canAll,
    isSuperAdmin,
    isAdmin,
    isManager,
    isEmployee,
    isAdminOrAbove,
    isManagerOrAbove,
    role: user?.role,
  };
}
