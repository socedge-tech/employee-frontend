import * as React from "react";
import {
  Pencil,
  Trash2,
  Eye
} from "lucide-react";
import type { Employee } from "../../api/employees";

interface EmployeeListProps {
  employees: Employee[];
  onEdit: (employee: Employee) => void;
  onDelete: (id: string | number) => void;
  onView: (employee: Employee) => void;
  isLoading: boolean;
  currentUserRole: string;
  departments?: any[];
  selectedIds: Set<number | string>;
  onToggleSelect: (id: number | string) => void;
  onToggleSelectAll: () => void;
}

export const EmployeeList: React.FC<EmployeeListProps> = ({
  employees,
  onEdit,
  onDelete,
  onView,
  isLoading,
  currentUserRole,
  departments = [],
  selectedIds,
  onToggleSelect,
  onToggleSelectAll
}) => {
  const [hoveredRowId, setHoveredRowId] = React.useState<number | string | null>(null);

  const canManage = ["super admin", "admin", "hr manager"].includes(currentUserRole.toLowerCase());

  if (isLoading) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-gray-100 shadow-sm">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-indigo-50 border-t-indigo-500 rounded-full animate-spin"></div>
        </div>
        <p className="mt-4 text-sm font-bold text-gray-500 tracking-tight">Syncing Workforce Data...</p>
      </div>
    );
  }

  const hasSelections = selectedIds.size > 0;

  const getStatusColor = (status: boolean) => {
    return status
      ? "bg-emerald-50 text-emerald-700 border-emerald-100"
      : "bg-gray-50 text-gray-500 border-gray-200";
  };

  return (
    <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-100/50 border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse table-fixed">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100">
              <th className="pl-6 pr-3 py-5 w-14 text-left">
                {(hasSelections || hoveredRowId !== null) && (
                  <input
                    type="checkbox"
                    className="rounded-lg border-gray-300 text-indigo-600 focus:ring-indigo-500 h-5 w-5 cursor-pointer transition-all"
                    checked={employees.length > 0 && selectedIds.size === employees.length}
                    onChange={onToggleSelectAll}
                  />
                )}
              </th>
              <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest" style={{ width: '300px' }}>Member Identity</th>
              <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest" style={{ width: '160px' }}>Department</th>
              <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest" style={{ width: '180px' }}>Designation</th>
              <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest" style={{ width: '140px' }}>Workspace</th>
              <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest" style={{ width: '120px' }}>Availability</th>
              <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Onboarded</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {employees.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-20 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center">
                      <Eye className="w-6 h-6 text-gray-300" />
                    </div>
                    <p className="text-sm font-bold text-gray-400">No workforce records found</p>
                  </div>
                </td>
              </tr>
            ) : (
              employees.map((employee) => {
                const details = employee.details;
                const isHovered = hoveredRowId === employee.id;
                const isSelected = selectedIds.has(employee.id);
                const showCheckbox = isHovered || isSelected || hasSelections;
                const showActions = isHovered && !hasSelections;

                return (
                  <tr
                    key={employee.id}
                    className={`transition-all duration-200 cursor-pointer group ${isSelected ? 'bg-indigo-50/40' : 'hover:bg-gray-50/50'}`}
                    onMouseEnter={() => setHoveredRowId(employee.id)}
                    onMouseLeave={() => setHoveredRowId(null)}
                    onClick={() => onView(employee)}
                  >
                    <td className="pl-6 pr-3 py-5" onClick={(e) => e.stopPropagation()}>
                      {showCheckbox ? (
                        <input
                          type="checkbox"
                          className="rounded-lg border-gray-300 text-indigo-600 focus:ring-indigo-500 h-5 w-5 cursor-pointer transition-all animate-in fade-in"
                          checked={isSelected}
                          onChange={() => onToggleSelect(employee.id)}
                        />
                      ) : (
                        <div className="w-5 h-5" />
                      )}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="relative flex-shrink-0">
                          <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center text-white text-sm font-black shadow-lg shadow-indigo-100 transition-transform group-hover:scale-105">
                            {details?.first_name?.[0]}{details?.last_name?.[0]}
                          </div>
                          <div className={`absolute -bottom-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center border-2 border-white shadow-sm`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${employee.status ? 'bg-emerald-500' : 'bg-gray-300'}`}></div>
                          </div>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-extrabold text-gray-900 truncate tracking-tight">
                            {details?.first_name} {details?.last_name}
                          </p>
                          <p className="text-[11px] font-bold text-gray-400 truncate tracking-tight">{employee.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-xs font-bold text-gray-600 truncate block uppercase tracking-tight">
                        {details?.department?.department_name ||
                          departments.find(d => d.id.toString() === details?.department_id?.toString())?.department_name ||
                          "Operations"}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-xs font-bold text-gray-600 truncate block uppercase tracking-tight">
                        {details?.job_role || "Associate"}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-xs font-bold text-gray-400 truncate block uppercase tracking-tight">
                        {details?.work_location || "Headquarters"}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${getStatusColor(employee.status)}`}>
                        <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${employee.status ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`}></div>
                        {employee.status ? "Online" : "Away"}
                      </span>
                    </td>
                    <td className="px-6 py-5 relative">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-tighter">
                          {employee.created_at ? new Date(employee.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : "Recently"}
                        </span>
                        {showActions && (
                          <div className="flex items-center gap-2 ml-4 animate-in slide-in-from-right-2 duration-300" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => onView(employee)}
                              className="p-2 bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white rounded-xl transition-all shadow-sm"
                              title="View Profile"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {canManage && (
                              <>
                                <button
                                  onClick={() => onEdit(employee)}
                                  className="p-2 bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white rounded-xl transition-all shadow-sm"
                                  title="Edit Records"
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => onDelete(employee.id)}
                                  className="p-2 bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white rounded-xl transition-all shadow-sm"
                                  title="Terminate Access"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
