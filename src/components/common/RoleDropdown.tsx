import * as React from "react";
import { useState, useEffect } from "react";
import { getRoles } from "../../api/roles";
import type { Role } from "../../api/roles";

interface RoleDropdownProps {
  value: string | number;
  onChange: (value: string) => void;
  required?: boolean;
  className?: string;
  label?: string;
}

export const RoleDropdown: React.FC<RoleDropdownProps> = ({
  value,
  onChange,
  required = false,
  className = "",
  label = "System Role"
}) => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const data = await getRoles();
        setRoles(data);
      } catch (err) {
        console.error("Failed to fetch roles", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoles();
  }, []);

  return (
    <div className={`w-full ${className}`}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        disabled={isLoading}
        className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white ${
          isLoading ? "bg-gray-100" : ""
        }`}
      >
        <option value="">{isLoading ? "Loading..." : "Select Role"}</option>
        {roles.map((role) => (
          <option key={role.id} value={role.id}>
            {role.name}
          </option>
        ))}
      </select>
    </div>
  );
};
