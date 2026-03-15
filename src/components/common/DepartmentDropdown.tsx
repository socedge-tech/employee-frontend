import * as React from "react";
import { useState, useEffect } from "react";
import { getDepartments } from "../../api/departments";
import type { Department } from "../../api/departments";

interface DepartmentDropdownProps {
  value: string | number;
  onChange: (value: string) => void;
  required?: boolean;
  className?: string;
  error?: string;
}

export const DepartmentDropdown: React.FC<DepartmentDropdownProps> = ({
  value,
  onChange,
  required = false,
  className = "",
  error
}) => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const data = await getDepartments();
        // Ensure static required departments are merged or handled if backend is empty
        const staticDepts = ["Sales", "Marketing", "HR", "Finance"];
        const fetchedNames = data.map(d => d.department_name.toLowerCase());
        
        const filteredStatic = staticDepts.filter(sd => !fetchedNames.includes(sd.toLowerCase()))
          .map((name, index) => ({
            id: `static-${index}`,
            department_name: name,
            status: true,
            permissions: []
          }));

        setDepartments([...data, ...(filteredStatic as any)]);
      } catch (err) {
        console.error("Failed to fetch departments", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDepartments();
  }, []);

  return (
    <div className={`w-full ${className}`}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Department {required && <span className="text-red-500">*</span>}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        disabled={isLoading}
        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
          error ? "border-red-500" : "border-gray-300"
        } ${isLoading ? "bg-gray-100 animate-pulse" : "bg-white"}`}
      >
        <option value="">{isLoading ? "Loading..." : "Select Department"}</option>
        {departments.map((dep) => (
          <option key={dep.id} value={dep.id}>
            {dep.department_name}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
};
