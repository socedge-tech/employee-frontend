import { useAuth } from '../context/AuthContext';
import { Permission, UserRole } from '../types/rbac';
import { hasPermission } from '../config/permissions';

export function usePermissions() {
  const { user } = useAuth();

  const can = (permission: Permission): boolean => {
    if (!user) return false;
    
    // Check if the backend provided specific permissions
    if (user.permissions && user.permissions.length > 0) {
      // Map frontend permission constants to backend strings if needed, 
      // but for now, we'll check if the backend permission (normalized) matches
      const normalizedPermission = permission.toLowerCase().replace(/_/g, '.');
      if (user.permissions.includes(normalizedPermission)) return true;
      
      // Also check exact match just in case
      if (user.permissions.includes(permission)) return true;
    }

    return hasPermission(user.role, permission);
  };

  const canAny = (permissionList: Permission[]): boolean => {
    if (!user) return false;
    return permissionList.some(p => can(p));
  };

  const canAll = (permissionList: Permission[]): boolean => {
    if (!user) return false;
    return permissionList.every(p => can(p));
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
