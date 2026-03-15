import type { PermissionMap, UserRole, Permission } from '../types/rbac';
import { UserRole as UserRoleVal, Permission as PermissionVal } from '../types/rbac';

// Define permissions for each role
export const rolePermissions: PermissionMap = {
  [UserRoleVal.SUPER_ADMIN]: [
    // Full access to everything
    PermissionVal.VIEW_COMPANY_STRUCTURE,
    PermissionVal.EDIT_COMPANY_STRUCTURE,
    PermissionVal.MANAGE_DEPARTMENTS,
    PermissionVal.VIEW_ALL_EMPLOYEES,
    PermissionVal.ADD_EMPLOYEE,
    PermissionVal.EDIT_EMPLOYEE,
    PermissionVal.DELETE_EMPLOYEE,
    PermissionVal.VIEW_ALL_LEAVES,
    PermissionVal.APPROVE_LEAVES,
    PermissionVal.MANAGE_LEAVE_POLICIES,
    PermissionVal.VIEW_ALL_REVIEWS,
    PermissionVal.CREATE_REVIEW_TEMPLATE,
    PermissionVal.CONDUCT_REVIEWS,
    PermissionVal.VIEW_ALL_SURVEYS,
    PermissionVal.CREATE_SURVEYS,
    PermissionVal.VIEW_SURVEY_RESULTS,
    PermissionVal.VIEW_ALL_CANDIDATES,
    PermissionVal.MANAGE_JOB_POSTINGS,
    PermissionVal.SCREEN_APPLICATIONS,
    PermissionVal.SCHEDULE_INTERVIEWS,
    PermissionVal.APPROVE_OFFERS,
    PermissionVal.VIEW_ALL_PAYROLL,
    PermissionVal.MANAGE_PAYROLL,
    PermissionVal.PROCESS_PAYROLL,
    PermissionVal.VIEW_CRM,
    PermissionVal.MANAGE_CRM,
    PermissionVal.VIEW_EMAIL_MANAGEMENT,
    PermissionVal.VIEW_NOTIFY_MANAGEMENT,
    PermissionVal.MANAGE_SYSTEM_SETTINGS,
  ],
  
  [UserRoleVal.ADMIN]: [
    // Admin has broad access but cannot edit company structure
    PermissionVal.VIEW_COMPANY_STRUCTURE,
    PermissionVal.MANAGE_DEPARTMENTS,
    PermissionVal.VIEW_ALL_EMPLOYEES,
    PermissionVal.ADD_EMPLOYEE,
    PermissionVal.EDIT_EMPLOYEE,
    PermissionVal.VIEW_ALL_LEAVES,
    PermissionVal.APPROVE_LEAVES,
    PermissionVal.MANAGE_LEAVE_POLICIES,
    PermissionVal.VIEW_ALL_REVIEWS,
    PermissionVal.CREATE_REVIEW_TEMPLATE,
    PermissionVal.CONDUCT_REVIEWS,
    PermissionVal.VIEW_ALL_SURVEYS,
    PermissionVal.CREATE_SURVEYS,
    PermissionVal.VIEW_SURVEY_RESULTS,
    PermissionVal.VIEW_ALL_CANDIDATES,
    PermissionVal.MANAGE_JOB_POSTINGS,
    PermissionVal.SCREEN_APPLICATIONS,
    PermissionVal.SCHEDULE_INTERVIEWS,
    PermissionVal.VIEW_ALL_PAYROLL,
    PermissionVal.MANAGE_PAYROLL,
    PermissionVal.PROCESS_PAYROLL,
    PermissionVal.VIEW_CRM,
    PermissionVal.VIEW_SYSTEM_SETTINGS,
  ],
  
  [UserRoleVal.FINANCE]: [
    PermissionVal.VIEW_COMPANY_STRUCTURE,
    PermissionVal.VIEW_ALL_EMPLOYEES,
    PermissionVal.VIEW_OWN_PROFILE,
    PermissionVal.VIEW_ALL_PAYROLL,
    PermissionVal.MANAGE_PAYROLL,
    PermissionVal.PROCESS_PAYROLL,
    PermissionVal.VIEW_CRM,
    PermissionVal.VIEW_SYSTEM_SETTINGS,
  ],
  
  [UserRoleVal.MANAGER]: [
    // Manager has access to their team's data
    PermissionVal.VIEW_COMPANY_STRUCTURE,
    PermissionVal.VIEW_TEAM_EMPLOYEES,
    PermissionVal.VIEW_OWN_PROFILE,
    PermissionVal.VIEW_TEAM_LEAVES,
    PermissionVal.VIEW_OWN_LEAVES,
    PermissionVal.APPROVE_LEAVES,
    PermissionVal.VIEW_TEAM_REVIEWS,
    PermissionVal.VIEW_OWN_REVIEWS,
    PermissionVal.CONDUCT_REVIEWS,
    PermissionVal.VIEW_ASSIGNED_CANDIDATES,
    PermissionVal.SCREEN_APPLICATIONS,
    PermissionVal.SCHEDULE_INTERVIEWS,
    PermissionVal.VIEW_TEAM_PAYROLL,
    PermissionVal.VIEW_OWN_PAYROLL,
  ],
  
  [UserRoleVal.EMPLOYEE]: [
    // Employee has access only to their own data
    PermissionVal.VIEW_COMPANY_STRUCTURE,
    PermissionVal.VIEW_OWN_PROFILE,
    PermissionVal.VIEW_OWN_LEAVES,
    PermissionVal.VIEW_OWN_REVIEWS,
    PermissionVal.VIEW_OWN_PAYROLL,
  ],
};

// Helper function to check if a role has a specific permission
export function hasPermission(role: UserRole, permission: Permission): boolean {
  return rolePermissions[role]?.includes(permission) ?? false;
}

// Helper function to check if a role has any of the specified permissions
export function hasAnyPermission(role: UserRole, permissions: Permission[]): boolean {
  return permissions.some(permission => hasPermission(role, permission));
}

// Helper function to check if a role has all of the specified permissions
export function hasAllPermissions(role: UserRole, permissions: Permission[]): boolean {
  return permissions.every(permission => hasPermission(role, permission));
}

// Navigation items with role-based visibility
export interface NavItemConfig {
  path: string;
  label: string;
  icon: string;
  exact?: boolean;
  requiredPermissions?: Permission[];
  minRole?: UserRole;
}

// Define which roles can access which navigation items
export const navItemPermissions: Record<string, Permission[]> = {
  '/': [], // Dashboard accessible to all
  '/company-structure': [PermissionVal.VIEW_COMPANY_STRUCTURE],
  '/employee-management': [PermissionVal.VIEW_ALL_EMPLOYEES, PermissionVal.VIEW_TEAM_EMPLOYEES, PermissionVal.VIEW_OWN_PROFILE],
  '/ats': [PermissionVal.VIEW_ALL_CANDIDATES, PermissionVal.VIEW_ASSIGNED_CANDIDATES],
  '/leave-management': [PermissionVal.VIEW_ALL_LEAVES, PermissionVal.VIEW_TEAM_LEAVES, PermissionVal.VIEW_OWN_LEAVES],
  '/payroll': [PermissionVal.VIEW_ALL_PAYROLL, PermissionVal.VIEW_TEAM_PAYROLL, PermissionVal.VIEW_OWN_PAYROLL],
  '/learning': [], // Accessible to all
  '/performance': [PermissionVal.VIEW_ALL_REVIEWS, PermissionVal.VIEW_TEAM_REVIEWS, PermissionVal.VIEW_OWN_REVIEWS],
  '/engagement': [PermissionVal.VIEW_ALL_SURVEYS, PermissionVal.CREATE_SURVEYS],
  '/crm': [PermissionVal.VIEW_CRM],
  '/email-management': [PermissionVal.VIEW_EMAIL_MANAGEMENT],
  '/notify-management': [PermissionVal.VIEW_NOTIFY_MANAGEMENT],
  '/settings': [PermissionVal.MANAGE_SYSTEM_SETTINGS, PermissionVal.VIEW_SYSTEM_SETTINGS],
};

// Check if user can access a navigation item
export function canAccessNavItem(role: UserRole, path: string): boolean {
  const permissions = navItemPermissions[path];
  if (!permissions || permissions.length === 0) return true;
  return hasAnyPermission(role, permissions);
}
