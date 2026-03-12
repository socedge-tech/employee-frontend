import { useState, useRef, useEffect } from "react";
import { ChevronDown, ShieldCheck, Shield, UserCog, User } from "lucide-react";
import { useAuth } from "../../context/AuthContext.tsx";
import { UserRole as UserRoleVal } from "../../types/rbac.ts";

const roleConfig = [
  { value: UserRoleVal.SUPER_ADMIN, label: "Super Admin", icon: ShieldCheck, color: "text-purple-600", bg: "bg-purple-100" },
  { value: UserRoleVal.ADMIN, label: "Admin", icon: Shield, color: "text-indigo-600", bg: "bg-indigo-100" },
  { value: UserRoleVal.MANAGER, label: "Manager", icon: UserCog, color: "text-blue-600", bg: "bg-blue-100" },
  { value: UserRoleVal.EMPLOYEE, label: "Employee", icon: User, color: "text-gray-600", bg: "bg-gray-100" },
];

export function RoleSwitcher() {
  const { user, switchRole } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentRoleConfig = roleConfig.find(r => r.value === user?.role) || roleConfig[3];
  const CurrentIcon = currentRoleConfig.icon;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors ${currentRoleConfig.bg}`}
      >
        <CurrentIcon className={`w-4 h-4 ${currentRoleConfig.color}`} />
        <span className="text-sm font-medium text-gray-700 hidden md:block">
          {currentRoleConfig.label}
        </span>
        <ChevronDown className="w-4 h-4 text-gray-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
          <div className="px-3 py-2 border-b border-gray-100 mb-1">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Switch Role View
            </p>
          </div>
          {roleConfig.map((role) => {
            const Icon = role.icon;
            const isActive = user?.role === role.value;
            return (
              <button
                key={role.value}
                onClick={() => {
                  switchRole(role.value as any);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 text-sm text-left hover:bg-gray-50 transition-colors ${
                  isActive ? "bg-gray-50 font-medium text-indigo-600" : "text-gray-700"
                }`}
              >
                <div className={`p-1 rounded-md ${role.bg}`}>
                  <Icon className={`w-4 h-4 ${role.color}`} />
                </div>
                {role.label}
                {isActive && (
                  <span className="ml-auto w-2 h-2 rounded-full bg-indigo-600" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
