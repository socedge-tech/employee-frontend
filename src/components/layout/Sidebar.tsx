import { NavLink } from "react-router-dom";
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  Calendar, 
  GraduationCap, 
  TrendingUp, 
  MessageSquare, 
  Settings,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  DollarSign,
  Shield,
  Target,
  Mail,
  Bell
} from "lucide-react";
import { useAuth } from "../../context/AuthContext.tsx";
import { canAccessNavItem } from "../../config/permissions.ts";
import { UserRole as UserRoleVal } from "../../types/rbac.ts";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const navItems = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { path: "/company-structure", label: "Company Structure", icon: Building2 },
  { path: "/employee-management", label: "Employee Management", icon: Users },
  { path: "/ats", label: "Recruitment (ATS)", icon: Briefcase },
  { path: "/leave-management", label: "Time & Attendance", icon: Calendar },
  { path: "/payroll", label: "Payroll", icon: DollarSign },
  { path: "/learning", label: "Talent & Growth", icon: GraduationCap },
  { path: "/performance", label: "Performance", icon: TrendingUp },
  { path: "/engagement", label: "Engagement", icon: MessageSquare },
  { path: "/crm", label: "CRM", icon: Target },
  { path: "/email-management", label: "Email Management", icon: Mail },
  { path: "/notify-management", label: "Notify Management", icon: Bell },
  { path: "/roles-permissions", label: "Roles & Permissions", icon: Shield },
  { path: "/settings", label: "System Settings", icon: Settings },
];

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { user } = useAuth();

  // Filter navigation items based on user role
  const accessibleNavItems = navItems.filter(item => {
    if (!user) return false;
    
    // Special check for CRM: Admin, Super Admin, Finance, or Sales Department
    if (item.path === '/crm') {
      const isSalesDept = user.departmentId === '2'; // ID for Sales Dept based on database
      const isFinanceDept = user.departmentId === '5'; // ID for Finance Dept based on database
      const isAllowedRole = ([UserRoleVal.ADMIN, UserRoleVal.SUPER_ADMIN, UserRoleVal.FINANCE] as string[]).includes(user.role as string);
      return isAllowedRole || isSalesDept || isFinanceDept;
    }

    return canAccessNavItem(user.role, item.path);
  });

  return (
    <aside className={`bg-white border-r border-gray-200 transition-all duration-300 flex flex-col ${collapsed ? 'w-20' : 'w-64'}`}>
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
        {!collapsed && <span className="font-semibold text-xl text-indigo-600">AdminPortal</span>}
        <button
          onClick={onToggle}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {accessibleNavItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.exact}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? 'bg-indigo-50 text-indigo-600'
                  : 'text-gray-700 hover:bg-gray-100'
              }`
            }
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
