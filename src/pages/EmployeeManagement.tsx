import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { Search, Filter, Download, Upload, MoreVertical, Eye, Edit, Trash2, CheckSquare, Plus, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardHeader, CardContent, CardTitle } from "../components/ui/card.tsx";
import { Button } from "../components/ui/button.tsx";

interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  role: string;
  location: string;
  status: "Active" | "Inactive" | "On Leave";
  lastActive: string;
  avatar: string;
}

interface Filters {
  departments: string[];
  roles: string[];
  locations: string[];
  statuses: string[];
}

const mockEmployees: Employee[] = [
  { id: "1", name: "Sarah Johnson", email: "sarah.j@company.com", department: "Engineering", role: "Engineering Manager", location: "San Francisco", status: "Active", lastActive: "2 mins ago", avatar: "SJ" },
  { id: "2", name: "Mike Chen", email: "mike.c@company.com", department: "Engineering", role: "Senior Developer", location: "New York", status: "Active", lastActive: "5 mins ago", avatar: "MC" },
  { id: "3", name: "Emma Wilson", email: "emma.w@company.com", department: "Engineering", role: "Tech Lead", location: "London", status: "Active", lastActive: "1 hour ago", avatar: "EW" },
  { id: "4", name: "John Davis", email: "john.d@company.com", department: "Sales", role: "Sales Director", location: "Chicago", status: "On Leave", lastActive: "2 days ago", avatar: "JD" },
  { id: "5", name: "Lisa Park", email: "lisa.p@company.com", department: "Marketing", role: "Marketing Manager", location: "Los Angeles", status: "Active", lastActive: "10 mins ago", avatar: "LP" },
  { id: "6", name: "David Lee", email: "david.l@company.com", department: "Engineering", role: "DevOps Engineer", location: "Austin", status: "Active", lastActive: "30 mins ago", avatar: "DL" },
  { id: "7", name: "Rachel Green", email: "rachel.g@company.com", department: "Marketing", role: "Content Lead", location: "Seattle", status: "Active", lastActive: "15 mins ago", avatar: "RG" },
  { id: "8", name: "Tom Wilson", email: "tom.w@company.com", department: "Sales", role: "Sales Ops Manager", location: "Boston", status: "Inactive", lastActive: "1 week ago", avatar: "TW" },
];

export function EmployeeManagement() {
  const [employees] = useState(mockEmployees);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const navigate = useNavigate();
  const filterRef = useRef<HTMLDivElement>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Filter states
  const [filters, setFilters] = useState<Filters>({
    departments: [],
    roles: [],
    locations: [],
    statuses: [],
  });

  // Get unique values for filter options
  const uniqueDepartments = Array.from(new Set(mockEmployees.map(e => e.department)));
  const uniqueRoles = Array.from(new Set(mockEmployees.map(e => e.role)));
  const uniqueLocations = Array.from(new Set(mockEmployees.map(e => e.location)));
  const uniqueStatuses: Employee["status"][] = ["Active", "Inactive", "On Leave"];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setShowFilters(false);
      }
    };

    if (showFilters) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showFilters]);

  const toggleFilter = (filterType: keyof Filters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: prev[filterType].includes(value)
        ? prev[filterType].filter(v => v !== value)
        : [...prev[filterType], value]
    }));
  };

  const clearFilters = () => {
    setFilters({
      departments: [],
      roles: [],
      locations: [],
      statuses: [],
    });
  };

  const hasActiveFilters = 
    filters.departments.length > 0 || 
    filters.roles.length > 0 || 
    filters.locations.length > 0 || 
    filters.statuses.length > 0;

  const toggleSelectAll = () => {
    if (selectedEmployees.length === employees.length) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees(employees.map(e => e.id));
    }
  };

  const toggleSelectEmployee = (id: string) => {
    if (selectedEmployees.includes(id)) {
      setSelectedEmployees(selectedEmployees.filter(e => e !== id));
    } else {
      setSelectedEmployees([...selectedEmployees, id]);
    }
  };

  const getStatusColor = (status: Employee["status"]) => {
    switch (status) {
      case "Active": return "bg-green-100 text-green-700";
      case "Inactive": return "bg-gray-100 text-gray-700";
      case "On Leave": return "bg-amber-100 text-amber-700";
    }
  };

  // Calculate filtered employees
  const filteredEmployees = employees
    .filter(emp => 
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.department.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(emp => 
      (!filters.departments.length || filters.departments.includes(emp.department)) &&
      (!filters.roles.length || filters.roles.includes(emp.role)) &&
      (!filters.locations.length || filters.locations.includes(emp.location)) &&
      (!filters.statuses.length || filters.statuses.includes(emp.status))
    );

  // Pagination calculations
  const totalItems = filteredEmployees.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, totalItems);
  const paginatedEmployees = filteredEmployees.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Reset to first page when filters or search change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filters]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Employee Management</h1>
          <p className="text-gray-500 mt-1">Manage and organize your workforce</p>
        </div>
        <Button onClick={() => navigate("/employee-management/add-employee")} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Employee
        </Button>
      </div>

      {/* Filters and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
        <div className="flex gap-2 relative">
          <div className="relative" ref={filterRef}>
            <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)} className="gap-2">
              <Filter className="w-4 h-4" />
              Filters
            </Button>
            
            {/* Filter Dropdown Modal */}
            {showFilters && (
              <div className="absolute right-0 top-full mt-2 w-[800px] bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
                    <div className="flex items-center gap-2">
                      {hasActiveFilters && (
                        <Button size="sm" variant="outline" onClick={clearFilters}>
                          Clear All
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
                    {/* Department Filter */}
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-3">Department</h3>
                      <div className="space-y-2">
                        {uniqueDepartments.map(dept => (
                          <label key={dept} className="flex items-center cursor-pointer hover:bg-gray-50 p-1 rounded">
                            <input
                              type="checkbox"
                              checked={filters.departments.includes(dept)}
                              onChange={() => toggleFilter("departments", dept)}
                              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className="ml-2 text-sm text-gray-900">{dept}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Role Filter */}
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-3">Role</h3>
                      <div className="space-y-2">
                        {uniqueRoles.map(role => (
                          <label key={role} className="flex items-center cursor-pointer hover:bg-gray-50 p-1 rounded">
                            <input
                              type="checkbox"
                              checked={filters.roles.includes(role)}
                              onChange={() => toggleFilter("roles", role)}
                              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className="ml-2 text-sm text-gray-900">{role}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Location Filter */}
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-3">Location</h3>
                      <div className="space-y-2">
                        {uniqueLocations.map(loc => (
                          <label key={loc} className="flex items-center cursor-pointer hover:bg-gray-50 p-1 rounded">
                            <input
                              type="checkbox"
                              checked={filters.locations.includes(loc)}
                              onChange={() => toggleFilter("locations", loc)}
                              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className="ml-2 text-sm text-gray-900">{loc}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Status Filter */}
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-3">Status</h3>
                      <div className="space-y-2">
                        {uniqueStatuses.map(status => (
                          <label key={status} className="flex items-center cursor-pointer hover:bg-gray-50 p-1 rounded">
                            <input
                              type="checkbox"
                              checked={filters.statuses.includes(status)}
                              onChange={() => toggleFilter("statuses", status)}
                              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className="ml-2 text-sm text-gray-900">{status}</span>
                          </label>
                        ))}
                      </div>
                    </div>
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

      {/* Bulk Actions Bar */}
      {selectedEmployees.length > 0 && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 flex items-center justify-between">
          <span className="text-sm font-medium text-indigo-900">
            {selectedEmployees.length} employee{selectedEmployees.length > 1 ? 's' : ''} selected
          </span>
          <div className="flex gap-2">
            <Button size="sm" variant="outline">Update Roles</Button>
            <Button size="sm" variant="outline">Export Selected</Button>
            <Button size="sm" variant="outline" className="text-red-600">Deactivate</Button>
          </div>
        </div>
      )}

      {/* Employee Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-hidden">
            <table className="w-full table-fixed">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="pl-2 pr-3 py-2 text-left w-12">
                    {(selectedEmployees.length > 0 || hoveredRow !== null) && (
                      <input
                        type="checkbox"
                        checked={selectedEmployees.length === employees.length}
                        onChange={toggleSelectAll}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                    )}
                  </th>
                  <th className="pl-3 pr-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ width: '280px' }}>
                    Employee
                  </th>
                  <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ width: '140px' }}>
                    Department
                  </th>
                  <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ width: '180px' }}>
                    Role
                  </th>
                  <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ width: '140px' }}>
                    Location
                  </th>
                  <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ width: '110px' }}>
                    Status
                  </th>
                  <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Active
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedEmployees.map((employee) => {
                    const isHovered = hoveredRow === employee.id;
                    const isSelected = selectedEmployees.includes(employee.id);
                    const hasSelections = selectedEmployees.length > 0;
                    const showCheckbox = isHovered || isSelected || hasSelections;
                    const showActions = isHovered && !hasSelections;
                    
                    return (
                      <tr 
                        key={employee.id} 
                        className="hover:bg-gray-50 transition-colors group cursor-pointer" 
                        onMouseEnter={() => setHoveredRow(employee.id)} 
                        onMouseLeave={() => setHoveredRow(null)}
                        onClick={() => navigate(`/employee-management/employee/${employee.id}`)}
                      >
                        <td className="pl-2 pr-3 py-2">
                          <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
                            {showCheckbox ? (
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleSelectEmployee(employee.id)}
                                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                              />
                            ) : (
                              <div className="w-4 h-4"></div>
                            )}
                          </div>
                        </td>
                        <td className="pl-3 pr-6 py-2">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                              {employee.avatar}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-gray-900 truncate text-sm">{employee.name}</p>
                              <p className="text-xs text-gray-500 truncate">{employee.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-2">
                          <span className="text-sm text-gray-900 truncate block">{employee.department}</span>
                        </td>
                        <td className="px-6 py-2">
                          <span className="text-sm text-gray-900 truncate block">{employee.role}</span>
                        </td>
                        <td className="px-6 py-2">
                          <span className="text-sm text-gray-900 truncate block">{employee.location}</span>
                        </td>
                        <td className="px-6 py-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${getStatusColor(employee.status)}`}>
                            {employee.status}
                          </span>
                        </td>
                        <td className="px-6 py-2 relative">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">
                              {employee.lastActive}
                            </span>
                            {showActions && (
                              <div className="flex items-center gap-1 ml-4" onClick={(e) => e.stopPropagation()}>
                                <button 
                                  className="p-1.5 hover:bg-gray-200 rounded transition-colors"
                                  title="View"
                                  onClick={() => navigate(`/employee-management/employee/${employee.id}`)}
                                >
                                  <Eye className="w-4 h-4 text-gray-600" />
                                </button>
                                <button 
                                  className="p-1.5 hover:bg-gray-200 rounded transition-colors"
                                  title="Edit"
                                  onClick={() => navigate(`/employee-management/edit-employee/${employee.id}`)}
                                >
                                  <Edit className="w-4 h-4 text-gray-600" />
                                </button>
                                <button 
                                  className="p-1.5 hover:bg-red-100 rounded transition-colors"
                                  title="Delete"
                                >
                                  <Trash2 className="w-4 h-4 text-red-600" />
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalItems > 0 && (
        <div className="flex items-center justify-between mt-4 px-6 py-4 border-t border-gray-200">
          <div className="flex items-center gap-4">
            <p className="text-sm text-gray-500">
              Showing {totalItems > 0 ? startIndex : 0} to {endIndex} of {totalItems} employees
            </p>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-500">Rows per page:</label>
              <select
                value={itemsPerPage}
                onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>
          
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button
                className="p-1.5 hover:bg-gray-100 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4 text-gray-600" />
              </button>
              {getPageNumbers().map((page, index) => (
                typeof page === 'number' ? (
                  <button
                    key={index}
                    className={`px-3 py-1.5 min-w-[36px] rounded transition-colors text-sm ${
                      currentPage === page 
                        ? 'bg-indigo-600 text-white' 
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </button>
                ) : (
                  <span key={index} className="px-2 text-gray-400">...</span>
                )
              ))}
              <button
                className="p-1.5 hover:bg-gray-100 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => handlePageChange(currentPage + 1)}
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

