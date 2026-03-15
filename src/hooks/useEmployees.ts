import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { getEmployees, deleteEmployee, type Employee } from "../api/employees";
import { toast } from "sonner";

interface Filters {
  departments: string[];
  roles: string[];
  locations: string[];
  statuses: string[];
}

const DEFAULT_FILTERS: Filters = {
  departments: [],
  roles: [],
  locations: [],
  statuses: [],
};

const DEFAULT_PAGE_SIZE = 10;

export function useEmployees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  // ──────────────────────────────────────────────
  // Search & Filter
  // ──────────────────────────────────────────────
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);

  // ──────────────────────────────────────────────
  // Selection
  // ──────────────────────────────────────────────
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  // ──────────────────────────────────────────────
  // Pagination
  // ──────────────────────────────────────────────
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  // ──────────────────────────────────────────────
  // Hover (for row actions)
  // ──────────────────────────────────────────────
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  // ──────────────────────────────────────────────
  // Filter dropdown ref (for click-outside close)
  // ──────────────────────────────────────────────
  const [showFilters, setShowFilters] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  // ──────────────────────────────────────────────
  // Data fetching
  // ──────────────────────────────────────────────
  const fetchEmployees = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getEmployees();
      setEmployees(data ?? []);
    } catch {
      toast.error("Failed to load employees. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  // ──────────────────────────────────────────────
  // Click-outside handler for filter dropdown
  // ──────────────────────────────────────────────
  useEffect(() => {
    if (!showFilters) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setShowFilters(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showFilters]);

  // ──────────────────────────────────────────────
  // Derived filter options from live data
  // ──────────────────────────────────────────────
  const filterOptions = useMemo(() => ({
    departments: [...new Set(employees.map(e => e.details?.department?.department_name || "Unassigned"))].filter(Boolean),
    roles: [...new Set(employees.map(e => e.details?.job_role || "Associate"))].filter(Boolean),
    locations: [...new Set(employees.map(e => e.details?.work_location || "Remote"))].filter(Boolean),
    statuses: ["Active", "Inactive"],
  }), [employees]);

  const hasActiveFilters = useMemo(() =>
    Object.values(filters).some(arr => arr.length > 0),
    [filters]
  );

  // ──────────────────────────────────────────────
  // Filtered & paginated results
  // ──────────────────────────────────────────────
  const filteredEmployees = useMemo(() => {
    const search = searchTerm.toLowerCase();

    return employees
      .filter(emp => {
        const name = `${emp.details?.first_name ?? ""} ${emp.details?.last_name ?? ""}`.toLowerCase();
        const email = (emp.email ?? "").toLowerCase();
        const dept = (emp.details?.department?.department_name ?? "").toLowerCase();
        return name.includes(search) || email.includes(search) || dept.includes(search);
      })
      .filter(emp =>
        (!filters.departments.length || filters.departments.includes(emp.details?.department?.department_name || "Unassigned")) &&
        (!filters.roles.length || filters.roles.includes(emp.details?.job_role || "Associate")) &&
        (!filters.locations.length || filters.locations.includes(emp.details?.work_location || "Remote")) &&
        (!filters.statuses.length || filters.statuses.includes(emp.status ? "Active" : "Inactive"))
      );
  }, [employees, searchTerm, filters]);

  const totalPages = Math.ceil(filteredEmployees.length / pageSize);

  const paginatedEmployees = useMemo(() =>
    filteredEmployees.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [filteredEmployees, currentPage, pageSize]
  );

  const paginationInfo = {
    total: filteredEmployees.length,
    start: filteredEmployees.length > 0 ? (currentPage - 1) * pageSize + 1 : 0,
    end: Math.min(currentPage * pageSize, filteredEmployees.length),
    currentPage,
    totalPages,
    pageSize,
  };

  // Reset to first page when filter/search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filters]);

  // ──────────────────────────────────────────────
  // Pagination helpers
  // ──────────────────────────────────────────────
  const getPageNumbers = useCallback((): (number | "...")[] => {
    const maxVisible = 5;
    if (totalPages <= maxVisible) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (currentPage <= 3) return [1, 2, 3, 4, "...", totalPages];
    if (currentPage >= totalPages - 2) return [1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
  }, [currentPage, totalPages]);

  // ──────────────────────────────────────────────
  // Selection
  // ──────────────────────────────────────────────
  const isAllSelected = filteredEmployees.length > 0 && selectedIds.size === filteredEmployees.length;

  const toggleSelectAll = useCallback(() => {
    setSelectedIds(prev =>
      prev.size === filteredEmployees.length
        ? new Set()
        : new Set(filteredEmployees.map(e => e.id))
    );
  }, [filteredEmployees]);

  const toggleSelectEmployee = useCallback((id: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => setSelectedIds(new Set()), []);

  // ──────────────────────────────────────────────
  // Filter actions
  // ──────────────────────────────────────────────
  const toggleFilter = useCallback((type: keyof Filters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [type]: prev[type].includes(value)
        ? prev[type].filter(v => v !== value)
        : [...prev[type], value],
    }));
  }, []);

  const clearFilters = useCallback(() => setFilters(DEFAULT_FILTERS), []);

  // ──────────────────────────────────────────────
  // Delete
  // ──────────────────────────────────────────────
  const handleDelete = useCallback(async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this employee? This action cannot be undone.")) return;

    setIsDeleting(true);
    try {
      await deleteEmployee(id);
      toast.success("Employee deleted successfully");
      setSelectedIds(prev => { const next = new Set(prev); next.delete(id); return next; });
      await fetchEmployees();
    } catch {
      toast.error("Failed to delete employee. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  }, [fetchEmployees]);

  return {
    // Data
    employees,
    paginatedEmployees,
    filteredEmployees,
    isLoading,
    isDeleting,
    refetch: fetchEmployees,

    // Search & Filter
    searchTerm,
    setSearchTerm,
    filters,
    toggleFilter,
    clearFilters,
    filterOptions,
    hasActiveFilters,
    showFilters,
    setShowFilters,
    filterRef,

    // Selection
    selectedIds,
    isAllSelected,
    toggleSelectAll,
    toggleSelectEmployee,
    clearSelection,

    // Pagination
    paginationInfo,
    getPageNumbers,
    setCurrentPage,
    setPageSize,

    // Hover
    hoveredId,
    setHoveredId,

    // Actions
    handleDelete,
  };
}
