import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Filter, Download, Upload, Eye, Edit, Plus } from "lucide-react";
import { Card, CardContent } from "../components/ui/card.tsx";
import { Button } from "../components/ui/button.tsx";

interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  role: string;
  location: string;
  status: "Active" | "Inactive" | "On Leave";
  avatar: string;
}

const mockEmployees: Employee[] = [
  { id: "1", name: "John Doe", email: "john@example.com", department: "Engineering", role: "Frontend Dev", location: "New York", status: "Active", avatar: "JD" },
  { id: "2", name: "Jane Smith", email: "jane@example.com", department: "Design", role: "Product Designer", location: "San Francisco", status: "Active", avatar: "JS" },
  { id: "3", name: "Mike Johnson", email: "mike@example.com", department: "Marketing", role: "Growth Lead", location: "London", status: "On Leave", avatar: "MJ" },
  { id: "4", name: "Sarah Williams", email: "sarah@example.com", department: "Engineering", role: "Backend Dev", location: "Remote", status: "Inactive", avatar: "SW" },
  { id: "5", name: "Robert Brown", email: "robert@example.com", department: "HR", role: "HR Manager", location: "Chicago", status: "Active", avatar: "RB" },
];

export default function EmployeeManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    departments: [] as string[],
    roles: [] as string[],
    locations: [] as string[],
    statuses: [] as string[],
  });
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();
  const filterRef = useRef<HTMLDivElement>(null);

  const [currentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  const uniqueDepartments = Array.from(new Set(mockEmployees.map(e => e.department)));

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setShowFilters(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleFilterChange = (type: keyof typeof filters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [type]: prev[type].includes(value) 
        ? prev[type].filter(v => v !== value)
        : [...prev[type], value]
    }));
  };

  const getStatusColor = (status: Employee["status"]) => {
    switch (status) {
      case "Active": return "bg-green-100 text-green-700";
      case "Inactive": return "bg-gray-100 text-gray-700";
      case "On Leave": return "bg-amber-100 text-amber-700";
    }
  };

  const filteredEmployees = mockEmployees
    .filter(emp => 
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      emp.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
      emp.department.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(emp => 
      (!filters.departments.length || filters.departments.includes(emp.department))
    );

  const paginatedEmployees = filteredEmployees.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Employee Management</h1>
          <p className="text-gray-500 text-sm mt-1">Manage and view all company employees</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" /> Export
          </Button>
          <Button variant="outline" className="gap-2">
            <Upload className="w-4 h-4" /> Import
          </Button>
          <Button className="gap-2" onClick={() => navigate("/engagement/onboarding")}>
            <Plus className="w-4 h-4" /> Add Employee
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="p-4 border-b border-gray-200 flex flex-col md:flex-row gap-4 items-center justify-between bg-gray-50/50">
            <div className="relative flex-1 w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
              />
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative" ref={filterRef}>
                <Button 
                  variant="outline" 
                  onClick={() => setShowFilters(!showFilters)}
                  className={`gap-2 text-sm ${showFilters ? 'bg-gray-100' : ''}`}
                >
                  <Filter className="w-4 h-4" /> Filters
                </Button>
                {showFilters && (
                  <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-xl z-50 p-4">
                    <h3 className="font-semibold text-sm mb-3">Departments</h3>
                    <div className="space-y-2">
                      {uniqueDepartments.map(dept => (
                        <label key={dept} className="flex items-center gap-2 cursor-pointer group">
                          <input 
                            type="checkbox" 
                            checked={filters.departments.includes(dept)} 
                            onChange={() => handleFilterChange('departments', dept)}
                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" 
                          />
                          <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">{dept}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 text-gray-500 text-xs font-semibold uppercase tracking-wider">
                  <th className="px-6 py-4">Employee</th>
                  <th className="px-6 py-4">Department & Role</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-sm">
                {paginatedEmployees.map(emp => (
                  <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className="w-9 h-9 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 text-xs font-bold shadow-sm">{emp.avatar}</div>
                      <div>
                        <div className="font-semibold text-gray-900">{emp.name}</div>
                        <div className="text-xs text-gray-500">{emp.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-900 font-medium">{emp.role}</div>
                      <div className="text-xs text-gray-500">{emp.department}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{emp.location}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusColor(emp.status)}`}>
                        {emp.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"><Eye className="w-4 h-4" /></button>
                        <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Edit className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
