import { useNavigate } from "react-router-dom";
import {
  Search, Filter, Download, Upload, Eye, Edit, Trash2,
  Plus, X, ChevronLeft, ChevronRight, Loader2,
} from "lucide-react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { RoleGate } from "../components/Auth/RoleGate";
import { Permission } from "../types/rbac";
import { usePermissions } from "../hooks/usePermissions";
import { useEmployees } from "../hooks/useEmployees";

// ─────────────────────────────────────────────────────────────────────────────
// Employee Management Page
// ─────────────────────────────────────────────────────────────────────────────
export function EmployeeManagement() {
  const navigate = useNavigate();
  const { can } = usePermissions();
  const canEdit = can(Permission.EDIT_EMPLOYEE);
  const canDelete = can(Permission.DELETE_EMPLOYEE);

  const {
    paginatedEmployees,
    isLoading,
    isDeleting,

    searchTerm, setSearchTerm,
    filters, toggleFilter, clearFilters,
    filterOptions, hasActiveFilters,
    showFilters, setShowFilters, filterRef,

    selectedIds, isAllSelected, toggleSelectAll, toggleSelectEmployee,
    paginationInfo, getPageNumbers, setCurrentPage, setPageSize,
    hoveredId, setHoveredId,
    handleDelete,
  } = useEmployees();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  const { total, start, end, currentPage, totalPages, pageSize } = paginationInfo;
  const pageNumbers = getPageNumbers();

  return (
    <div className="space-y-6">
      {/* ── Page Header ────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Employee Management</h1>
          <p className="text-gray-500 mt-1">Manage and organize your workforce</p>
        </div>
        <RoleGate permissions={[Permission.ADD_EMPLOYEE]}>
          <Button onClick={() => navigate("/employee-management/add-employee")} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Employee
          </Button>
        </RoleGate>
      </div>

      {/* ── Toolbar ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Search */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search employees…"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 relative" ref={filterRef}>
          {/* Filter dropdown */}
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(v => !v)}
              className="gap-2"
            >
              <Filter className="w-4 h-4" />
              Filters
              {hasActiveFilters && (
                <span className="ml-1 w-2 h-2 rounded-full bg-indigo-500 inline-block" />
              )}
            </Button>

            {showFilters && (
              <div className="absolute right-0 top-full mt-2 w-[800px] bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
                    <div className="flex items-center gap-2">
                      {hasActiveFilters && (
                        <Button size="sm" variant="outline" onClick={clearFilters}>
                          Clear all
                        </Button>
                      )}
                      <button
                        className="p-1.5 hover:bg-gray-200 rounded transition-colors"
                        onClick={() => setShowFilters(false)}
                      >
                        <X className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-6">
                    {(
                      [
                        { key: "departments", label: "Department", options: filterOptions.departments },
                        { key: "roles",       label: "Role",       options: filterOptions.roles },
                        { key: "locations",   label: "Location",   options: filterOptions.locations },
                        { key: "statuses",    label: "Status",     options: filterOptions.statuses },
                      ] as const
                    ).map(col => (
                      <div key={col.key}>
                        <h3 className="text-sm font-medium text-gray-700 mb-3">{col.label}</h3>
                        <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                          {col.options.map(opt => (
                            <label key={opt} className="flex items-center cursor-pointer hover:bg-gray-50 p-1 rounded">
                              <input
                                type="checkbox"
                                checked={filters[col.key].includes(opt)}
                                onChange={() => toggleFilter(col.key, opt)}
                                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                              />
                              <span className="ml-2 text-sm text-gray-900">{opt}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <Button variant="outline" size="sm" className="gap-2">
            <Upload className="w-4 h-4" />
            Import CSV
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      {/* ── Bulk Actions Bar ─────────────────────────────────────── */}
      {selectedIds.size > 0 && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 flex items-center justify-between">
          <span className="text-sm font-medium text-indigo-900">
            {selectedIds.size} employee{selectedIds.size > 1 ? "s" : ""} selected
          </span>
          <div className="flex gap-2">
            <RoleGate permissions={[Permission.EDIT_EMPLOYEE]}>
              <Button size="sm" variant="outline">Update Roles</Button>
            </RoleGate>
            <Button size="sm" variant="outline">Export Selected</Button>
            <RoleGate permissions={[Permission.DELETE_EMPLOYEE]}>
              <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50 hover:text-red-700">
                Deactivate
              </Button>
            </RoleGate>
          </div>
        </div>
      )}

      {/* ── Employee Table ───────────────────────────────────────── */}
      <Card className="rounded-lg shadow-sm border border-gray-200">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full table-fixed border-collapse">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="pl-4 pr-3 py-3 text-left w-12">
                    {(selectedIds.size > 0 || hoveredId !== null) && (
                      <input
                        type="checkbox"
                        checked={isAllSelected}
                        onChange={toggleSelectAll}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                    )}
                  </th>
                  {[
                    { label: "Employee",    width: "280px" },
                    { label: "Department",  width: "140px" },
                    { label: "Role",        width: "180px" },
                    { label: "Location",    width: "140px" },
                    { label: "Status",      width: "110px" },
                    { label: "Last Active", width: undefined },
                  ].map(col => (
                    <th
                      key={col.label}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      style={col.width ? { width: col.width } : undefined}
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      No employees found matching your search.
                    </td>
                  </tr>
                ) : (
                  paginatedEmployees.map(employee => {
                    const isHovered = hoveredId === employee.id;
                    const isSelected = selectedIds.has(employee.id);
                    const hasSelections = selectedIds.size > 0;
                    const showCheckbox = isHovered || isSelected || hasSelections;
                    const showActions = isHovered && !hasSelections;
                    const { details } = employee;

                    return (
                      <tr
                        key={employee.id}
                        className={`hover:bg-gray-50 transition-colors cursor-pointer ${isSelected ? "bg-indigo-50/30" : ""}`}
                        onMouseEnter={() => setHoveredId(employee.id)}
                        onMouseLeave={() => setHoveredId(null)}
                        onClick={() => navigate(`/employee-management/view-employee/${employee.id}`)}
                      >
                        {/* Checkbox */}
                        <td className="pl-4 pr-3 py-3" onClick={e => e.stopPropagation()}>
                          {showCheckbox ? (
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelectEmployee(employee.id)}
                              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            />
                          ) : (
                            <div className="w-4 h-4" />
                          )}
                        </td>

                        {/* Employee name + email */}
                        <td className="pl-3 pr-6 py-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                              {details?.first_name?.[0]}{details?.last_name?.[0]}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-gray-900 truncate text-sm">
                                {details?.first_name} {details?.last_name}
                              </p>
                              <p className="text-xs text-gray-500 truncate">{employee.email}</p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-3">
                          <span className="text-sm text-gray-700 truncate block">
                            {details?.department?.department_name ?? "Unassigned"}
                          </span>
                        </td>
                        <td className="px-6 py-3">
                          <span className="text-sm text-gray-700 truncate block">
                            {details?.job_role ?? "Associate"}
                          </span>
                        </td>
                        <td className="px-6 py-3">
                          <span className="text-sm text-gray-700 truncate block">
                            {details?.work_location ?? "Remote"}
                          </span>
                        </td>

                        {/* Status badge */}
                        <td className="px-6 py-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${
                            employee.status ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                          }`}>
                            {employee.status ? "Active" : "Inactive"}
                          </span>
                        </td>

                        {/* Last active + hover actions */}
                        <td className="px-6 py-3 relative">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">
                              {employee.created_at
                                ? new Date(employee.created_at).toLocaleDateString()
                                : "Just now"}
                            </span>

                            {showActions && (
                              <div className="flex items-center gap-1 ml-4" onClick={e => e.stopPropagation()}>
                                <button
                                  className="p-1.5 hover:bg-gray-200 rounded-md transition-colors"
                                  title="View"
                                  onClick={() => navigate(`/employee-management/view-employee/${employee.id}`)}
                                >
                                  <Eye className="w-4 h-4 text-gray-600" />
                                </button>
                                {canEdit && (
                                  <button
                                    className="p-1.5 hover:bg-gray-200 rounded-md transition-colors"
                                    title="Edit"
                                    onClick={() => navigate(`/employee-management/edit-employee/${employee.id}`)}
                                  >
                                    <Edit className="w-4 h-4 text-gray-600" />
                                  </button>
                                )}
                                {canDelete && (
                                  <button
                                    className="p-1.5 hover:bg-red-50 rounded-md transition-colors group/del"
                                    title="Delete"
                                    disabled={isDeleting}
                                    onClick={() => handleDelete(employee.id)}
                                  >
                                    <Trash2 className="w-4 h-4 text-gray-400 group-hover/del:text-red-600" />
                                  </button>
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
        </CardContent>
      </Card>

      {/* ── Pagination ───────────────────────────────────────────── */}
      {total > 0 && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-white rounded-lg border">
          {/* Count + rows per page */}
          <div className="flex items-center gap-6">
            <p className="text-sm text-gray-500">
              Showing{" "}
              <span className="font-medium text-gray-900">{start}</span>
              {" "}to{" "}
              <span className="font-medium text-gray-900">{end}</span>
              {" "}of{" "}
              <span className="font-medium text-gray-900">{total}</span>
              {" "}employees
            </p>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-500">Rows per page:</label>
              <select
                value={pageSize}
                onChange={e => setPageSize(Number(e.target.value))}
                className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
              >
                {[5, 10, 20, 50].map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Page buttons */}
          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4 text-gray-600" />
              </button>

              <div className="flex items-center gap-1 mx-2">
                {pageNumbers.map((page, idx) =>
                  typeof page === "number" ? (
                    <button
                      key={idx}
                      className={`px-3.5 py-1.5 min-w-[36px] rounded-lg transition-colors text-sm font-medium ${
                        currentPage === page
                          ? "bg-indigo-600 text-white shadow-sm"
                          : "hover:bg-gray-100 text-gray-600 border border-transparent hover:border-gray-200"
                      }`}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  ) : (
                    <span key={idx} className="px-2 text-gray-400">…</span>
                  )
                )}
              </div>

              <button
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
