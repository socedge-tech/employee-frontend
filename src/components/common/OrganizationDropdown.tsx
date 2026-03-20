import * as React from "react";
import { useState, useEffect } from "react";
import { getOrganizations } from "../../api/organizations";


interface OrganizationDropdownProps {
  value: string;
  onChange: (value: string) => void;
  type: "payroll_statutory_unit" | "legal_employer" | "legislative_data_group";
  label: string;
  required?: boolean;
}

export const OrganizationDropdown: React.FC<OrganizationDropdownProps> = ({
  value,
  onChange,
  type,
  label,
  required = false
}) => {
  const [options, setOptions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const data = await getOrganizations();
        const uniqueOptions = [...new Set(data.map(o => o[type]).filter(Boolean))] as string[];
        setOptions(uniqueOptions);
      } catch (err) {
        console.error(`Failed to fetch ${label}`, err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOptions();
  }, [type, label]);

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        disabled={isLoading}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
      >
        <option value="">{isLoading ? "Loading..." : `Select ${label}`}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
};
