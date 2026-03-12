import React, { useState, useEffect, Fragment } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Save, Plus, Trash2, Users, Search, X, Shield, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardHeader, CardContent, CardTitle } from "../components/ui/card.tsx";
import { Button } from "../components/ui/button.tsx";
import { UserRole } from "../types/rbac.ts";
import type { DepartmentPermissions, ModulePermissions } from "../types/rbac.ts";
import { 
  getDefaultDepartmentPermissions, 
  moduleDisplayNames, 
  permissionLabels 
} from "../config/defaultPermissions.ts";

interface Team {
  id: string;
  name: string;
  lead: string;
  leadId: string;
  description: string;
  members: string[];
}

interface Employee {
  id: string;
  name: string;
  title: string;
  department: string;
  avatar: string;
}

// Mock employees data
const mockEmployees: Employee[] = [
  { id: "1", name: "Sarah Johnson", title: "VP Engineering", department: "Engineering", avatar: "SJ" },
  { id: "2", name: "Robert Taylor", title: "VP Sales", department: "Sales", avatar: "RT" },
  { id: "3", name: "Jennifer Martinez", title: "VP Marketing", department: "Marketing", avatar: "JM" },
  { id: "4", name: "Patricia Moore", title: "VP Human Resources", department: "HR", avatar: "PM" },
  { id: "5", name: "Mike Chen", title: "Senior Engineering Manager", department: "Engineering", avatar: "MC" },
  { id: "6", name: "Emma Wilson", title: "Engineering Manager", department: "Engineering", avatar: "EW" },
  { id: "7", name: "David Lee", title: "DevOps Manager", department: "Engineering", avatar: "DL" },
  { id: "8", name: "Lisa Park", title: "Mobile Lead", department: "Engineering", avatar: "LP" },
  { id: "9", name: "John Davis", title: "Enterprise Sales Director", department: "Sales", avatar: "JD" },
  { id: "10", name: "Amy Brown", title: "SMB Sales Manager", department: "Sales", avatar: "AB" },
];

export function AddDepartment() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [departmentName, setDepartmentName] = useState("");
  const [departmentCode, setDepartmentCode] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [costCenter, setCostCenter] = useState("");
  const [manager, setManager] = useState<Employee | null>(null);
  const [parentDepartment, setParentDepartment] = useState("None");
  const [budget, setBudget] = useState("");
  const [teams, setTeams] = useState<Team[]>([]);
  
  const [showManagerSearch, setShowManagerSearch] = useState(false);
  const [managerSearchQuery, setManagerSearchQuery] = useState("");
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);

  // Team modal state
  const [teamName, setTeamName] = useState("");
  const [teamDescription, setTeamDescription] = useState("");
  const [teamLead, setTeamLead] = useState<Employee | null>(null);
  const [teamMembers, setTeamMembers] = useState<Employee[]>([]);
  const [showTeamLeadSearch, setShowTeamLeadSearch] = useState(false);
  const [showMemberSearch, setShowMemberSearch] = useState(false);
  const [memberSearchQuery, setMemberSearchQuery] = useState("");

  // Permissions state
  const [departmentPermissions, setDepartmentPermissions] = useState<DepartmentPermissions>(
    getDefaultDepartmentPermissions()
  );
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

  // Load department data in edit mode
  useEffect(() => {
    if (isEditMode && id) {
      // Mock departments data (matching CompanyStructure.tsx)
      const mockDepartments = [
        {
          id: "1",
          name: "Engineering",
          manager: "Sarah Johnson",
          managerId: "1",
          code: "ENG",
          description: "Technology and Engineering Department",
          location: "San Francisco",
          costCenter: "CC-001",
          headcount: 450,
          budget: "5000000",
          parentDepartment: "None",
          teams: [
            { id: "1-1", name: "Frontend Team", lead: "Mike Chen", leadId: "5", description: "Frontend development team", members: ["5"] },
            { id: "1-2", name: "Backend Team", lead: "Emma Wilson", leadId: "6", description: "Backend development team", members: ["6"] },
            { id: "1-3", name: "DevOps Team", lead: "David Lee", leadId: "7", description: "DevOps and infrastructure team", members: ["7"] },
            { id: "1-4", name: "Mobile Team", lead: "Lisa Park", leadId: "8", description: "Mobile development team", members: ["8"] },
          ],
        },
        {
          id: "2",
          name: "Sales",
          manager: "Robert Taylor",
          managerId: "2",
          code: "SAL",
          description: "Sales and Revenue Department",
          location: "New York",
          costCenter: "CC-002",
          headcount: 320,
          budget: "3000000",
          parentDepartment: "None",
          teams: [
            { id: "2-1", name: "Enterprise Sales", lead: "John Davis", leadId: "9", description: "Enterprise sales team", members: ["9"] },
            { id: "2-2", name: "SMB Sales", lead: "Amy Brown", leadId: "10", description: "SMB sales team", members: ["10"] },
            { id: "2-3", name: "Sales Ops", lead: "Tom Wilson", leadId: "2", description: "Sales operations team", members: ["2"] },
          ],
        },
        {
          id: "3",
          name: "Marketing",
          manager: "Jennifer Martinez",
          managerId: "3",
          code: "MKT",
          description: "Marketing and Communications Department",
          location: "Los Angeles",
          costCenter: "CC-003",
          headcount: 180,
          budget: "2000000",
          parentDepartment: "None",
          teams: [
            { id: "3-1", name: "Content Marketing", lead: "Alex Kim", leadId: "3", description: "Content marketing team", members: ["3"] },
            { id: "3-2", name: "Product Marketing", lead: "Rachel Green", leadId: "3", description: "Product marketing team", members: ["3"] },
            { id: "3-3", name: "Growth Marketing", lead: "Chris Anderson", leadId: "3", description: "Growth marketing team", members: ["3"] },
          ],
        },
        {
          id: "4",
          name: "HR",
          manager: "Patricia Moore",
          managerId: "4",
          code: "HR",
          description: "Human Resources Department",
          location: "Chicago",
          costCenter: "CC-004",
          headcount: 120,
          budget: "1500000",
          parentDepartment: "None",
          teams: [
            { id: "4-1", name: "Recruitment", lead: "Sam White", leadId: "4", description: "Recruitment team", members: ["4"] },
            { id: "4-2", name: "People Ops", lead: "Nina Patel", leadId: "4", description: "People operations team", members: ["4"] },
            { id: "4-3", name: "L&D", lead: "Mark Thompson", leadId: "4", description: "Learning and development team", members: ["4"] },
          ],
        },
      ];

      // Try to load from localStorage first
      const savedDepartments = JSON.parse(localStorage.getItem('departments') || '[]');
      let departmentData = savedDepartments.find((dept: any) => dept.id === id);
      
      // If not in localStorage, use mock data
      if (!departmentData) {
        departmentData = mockDepartments.find(dept => dept.id === id);
      }

      if (departmentData) {
        setDepartmentName(departmentData.name || "");
        setDepartmentCode(departmentData.code || "");
        setDescription(departmentData.description || "");
        setLocation(departmentData.location || "");
        setCostCenter(departmentData.costCenter || "");
        setParentDepartment(departmentData.parentDepartment || "None");
        setBudget(departmentData.budget || "");
        
        // Set manager
        if (departmentData.managerId || departmentData.manager) {
          const managerId = departmentData.managerId;
          const managerData = mockEmployees.find(emp => emp.id === managerId);
          if (managerData) {
            setManager(managerData);
          } else if (departmentData.manager) {
            // Fallback: create a mock manager from the name
            const managerName = departmentData.manager;
            const initials = managerName.split(' ').map((n: string) => n[0]).join('');
            setManager({
              id: managerId || `mgr-${id}`,
              name: managerName,
              title: "Department Manager",
              department: departmentData.name,
              avatar: initials
            });
          }
        }
        
        // Set teams
        if (departmentData.teams) {
          setTeams(departmentData.teams);
        }

        // Set permissions if available
        if (departmentData.permissions) {
          setDepartmentPermissions(departmentData.permissions);
        }
      }
    }
  }, [isEditMode, id]);

  const filteredManagers = mockEmployees.filter(emp =>
    emp.name.toLowerCase().includes(managerSearchQuery.toLowerCase()) ||
    emp.title.toLowerCase().includes(managerSearchQuery.toLowerCase())
  );

  const filteredMembers = mockEmployees.filter(emp =>
    emp.name.toLowerCase().includes(memberSearchQuery.toLowerCase()) &&
    !teamMembers.some(m => m.id === emp.id)
  );

  const handleSave = () => {
    const departmentData = {
      name: departmentName,
      code: departmentCode,
      description,
      location,
      costCenter,
      manager: manager?.id,
      parentDepartment,
      budget,
      teams,
      permissions: departmentPermissions, // Include department permissions
    };
    console.log("Saving department:", departmentData);
    
    // Save to localStorage (demo purposes)
    const existingDepartments = JSON.parse(localStorage.getItem('departments') || '[]');
    if (isEditMode) {
      const updatedDepartments = existingDepartments.map((dept: any) => 
        dept.id === id ? { ...departmentData, id } : dept
      );
      localStorage.setItem('departments', JSON.stringify(updatedDepartments));
    } else {
      const newDepartment = { ...departmentData, id: `dept-${Date.now()}` };
      localStorage.setItem('departments', JSON.stringify([...existingDepartments, newDepartment]));
    }
    
    navigate("/company-structure");
  };

  const handleAddTeam = () => {
    setTeamName("");
    setTeamDescription("");
    setTeamLead(null);
    setTeamMembers([]);
    setEditingTeam(null);
    setShowTeamModal(true);
  };

  const handleSaveTeam = () => {
    const newTeam: Team = {
      id: editingTeam?.id || `team-${Date.now()}`,
      name: teamName,
      lead: teamLead?.name || "",
      leadId: teamLead?.id || "",
      description: teamDescription,
      members: teamMembers.map(m => m.id),
    };

    if (editingTeam) {
      setTeams(teams.map(t => t.id === editingTeam.id ? newTeam : t));
    } else {
      setTeams([...teams, newTeam]);
    }

    setShowTeamModal(false);
  };

  const handleDeleteTeam = (teamId: string) => {
    setTeams(teams.filter(t => t.id !== teamId));
  };

  const handleEditTeam = (team: Team) => {
    setTeamName(team.name);
    setTeamDescription(team.description);
    const lead = mockEmployees.find(e => e.id === team.leadId);
    setTeamLead(lead || null);
    setTeamMembers(mockEmployees.filter(e => team.members.includes(e.id)));
    setEditingTeam(team);
    setShowTeamModal(true);
  };

  const removeMember = (memberId: string) => {
    setTeamMembers(teamMembers.filter(m => m.id !== memberId));
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/company-structure")}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  {isEditMode ? "Edit Department" : "Add New Department"}
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  {isEditMode ? "Update department information" : "Create a new department in your organization"}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => navigate("/company-structure")}>
                Cancel
              </Button>
              <Button className="gap-2" onClick={handleSave}>
                <Save className="w-4 h-4" />
                Save Department
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Department Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={departmentName}
                        onChange={(e) => setDepartmentName(e.target.value)}
                        placeholder="e.g., Engineering"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Department Code <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={departmentCode}
                        onChange={(e) => setDepartmentCode(e.target.value)}
                        placeholder="e.g., ENG"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      placeholder="Brief description of the department's purpose and responsibilities..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Location
                      </label>
                      <select
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="">Select location</option>
                        <option value="HQ - San Francisco">HQ - San Francisco</option>
                        <option value="New York Office">New York Office</option>
                        <option value="London Office">London Office</option>
                        <option value="Remote">Remote</option>
                        <option value="Multiple Locations">Multiple Locations</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cost Center
                      </label>
                      <input
                        type="text"
                        value={costCenter}
                        onChange={(e) => setCostCenter(e.target.value)}
                        placeholder="e.g., CC-1001"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Parent Department
                    </label>
                    <select
                      value={parentDepartment}
                      onChange={(e) => setParentDepartment(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="None">None (Top Level)</option>
                      <option value="Engineering">Engineering</option>
                      <option value="Sales">Sales</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Operations">Operations</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Annual Budget
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                      <input
                        type="text"
                        value={budget}
                        onChange={(e) => setBudget(e.target.value)}
                        placeholder="0"
                        className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Department Manager */}
            <Card>
              <CardHeader>
                <CardTitle>Department Manager</CardTitle>
              </CardHeader>
              <CardContent>
                {manager ? (
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                        {manager.avatar}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{manager.name}</p>
                        <p className="text-sm text-gray-500">{manager.title}</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setManager(null)}
                    >
                      Change
                    </Button>
                  </div>
                ) : (
                  <div className="relative">
                    <Button
                      variant="outline"
                      className="w-full gap-2"
                      onClick={() => setShowManagerSearch(true)}
                    >
                      <Search className="w-4 h-4" />
                      Select Manager
                    </Button>

                    {showManagerSearch && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-80 overflow-y-auto">
                        <div className="p-3 border-b border-gray-200 sticky top-0 bg-white">
                          <div className="relative">
                            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                            <input
                              type="text"
                              value={managerSearchQuery}
                              onChange={(e) => setManagerSearchQuery(e.target.value)}
                              placeholder="Search employees..."
                              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              autoFocus
                            />
                          </div>
                        </div>
                        <div className="p-2">
                          {filteredManagers.map((emp) => (
                            <button
                              key={emp.id}
                              onClick={() => {
                                setManager(emp);
                                setShowManagerSearch(false);
                                setManagerSearchQuery("");
                              }}
                              className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                            >
                              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                                {emp.avatar}
                              </div>
                              <div className="flex-1 text-left">
                                <p className="font-medium text-sm">{emp.name}</p>
                                <p className="text-xs text-gray-500">{emp.title}</p>
                              </div>
                            </button>
                          ))}
                          {filteredManagers.length === 0 && (
                            <p className="text-center text-gray-500 py-4 text-sm">No employees found</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Teams */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Teams ({teams.length})</CardTitle>
                  <Button size="sm" className="gap-2" onClick={handleAddTeam}>
                    <Plus className="w-4 h-4" />
                    Add Team
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {teams.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500 mb-2">No teams added yet</p>
                    <p className="text-sm text-gray-400 mb-4">Teams help organize employees within departments</p>
                    <Button size="sm" onClick={handleAddTeam}>Add First Team</Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {teams.map((team) => (
                      <div key={team.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{team.name}</h4>
                            <p className="text-sm text-gray-500 mt-1">{team.description}</p>
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleEditTeam(team)}
                              className="p-1.5 hover:bg-gray-200 rounded"
                            >
                              <Search className="w-4 h-4 text-gray-600" />
                            </button>
                            <button
                              onClick={() => handleDeleteTeam(team.id)}
                              className="p-1.5 hover:bg-red-50 rounded"
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Team Lead: <span className="font-medium text-gray-900">{team.lead || "Not assigned"}</span></span>
                          <span className="text-gray-600">{team.members.length} members</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Module Permissions */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-indigo-600" />
                  <CardTitle>Module Permissions</CardTitle>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Configure which modules and features each role can access within this department
                </p>
              </CardHeader>
              <CardContent>
                {/* Info Banner */}
                <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex gap-2">
                    <Shield className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-700">
                      <p className="font-medium mb-1">Role-Based Access Control</p>
                      <p>Configure permissions for each role. Check the boxes to grant access to specific modules and features.</p>
                    </div>
                  </div>
                </div>

                {/* Permissions Table */}
                <div className="overflow-x-auto border border-gray-200 rounded-lg">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="text-left py-3 px-4 font-semibold text-gray-900 border-b-2 border-gray-200 min-w-[200px]">
                          Module
                        </th>
                        <th className="text-center py-3 px-4 font-semibold text-gray-900 border-b-2 border-gray-200 bg-purple-50 min-w-[120px]">
                          Super Admin
                        </th>
                        <th className="text-center py-3 px-4 font-semibold text-gray-900 border-b-2 border-gray-200 bg-blue-50 min-w-[120px]">
                          Admin
                        </th>
                        <th className="text-center py-3 px-4 font-semibold text-gray-900 border-b-2 border-gray-200 bg-green-50 min-w-[120px]">
                          Manager
                        </th>
                        <th className="text-center py-3 px-4 font-semibold text-gray-900 border-b-2 border-gray-200 bg-gray-100 min-w-[120px]">
                          User
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Dashboard Row */}
                      <tr className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="py-4 px-4 font-medium text-gray-900">
                          <div>
                            <div className="font-medium">Dashboard</div>
                            <div className="text-xs text-gray-500 mt-0.5">Access to main dashboard</div>
                          </div>
                        </td>
                        {[UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.EMPLOYEE].map((role) => (
                          <td key={role} className="py-4 px-4 text-center">
                            <input
                              type="checkbox"
                              checked={departmentPermissions[role]?.dashboard || false}
                              onChange={(e) => {
                                setDepartmentPermissions({
                                  ...departmentPermissions,
                                  [role]: {
                                    ...departmentPermissions[role],
                                    dashboard: e.target.checked,
                                  },
                                });
                              }}
                              className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-600 cursor-pointer"
                            />
                          </td>
                        ))}
                      </tr>

                      {/* Other Modules with Sub-permissions */}
                      {Object.entries(permissionLabels).map(([moduleKey, labels]) => {
                        const moduleName = moduleDisplayNames[moduleKey as keyof typeof moduleDisplayNames];
                        const isExpanded = expandedModules.has(moduleKey);
                        
                        return (
                          <React.Fragment key={moduleKey}>
                            {/* Module Header Row */}
                            <tr className="border-b border-gray-200 bg-gray-50">
                              <td className="py-3 px-4">
                                <button
                                  onClick={() => {
                                    const newExpanded = new Set(expandedModules);
                                    if (isExpanded) {
                                      newExpanded.delete(moduleKey);
                                    } else {
                                      newExpanded.add(moduleKey);
                                    }
                                    setExpandedModules(newExpanded);
                                  }}
                                  className="flex items-center gap-2 font-medium text-gray-900 hover:text-indigo-600 transition-colors"
                                >
                                  {isExpanded ? (
                                    <ChevronDown className="w-4 h-4" />
                                  ) : (
                                    <ChevronUp className="w-4 h-4" />
                                  )}
                                  {moduleName}
                                </button>
                              </td>
                              {[UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.EMPLOYEE].map((role) => {
                                const modulePerms = departmentPermissions[role]?.[moduleKey as keyof ModulePermissions] as any;
                                const enabledCount = modulePerms && typeof modulePerms === 'object' 
                                  ? Object.values(modulePerms).filter(Boolean).length 
                                  : 0;
                                const totalCount = Object.keys(labels).length;
                                
                                return (
                                  <td key={role} className="py-3 px-4 text-center">
                                    <span className="text-xs text-gray-600 font-medium">
                                      {enabledCount}/{totalCount}
                                    </span>
                                  </td>
                                );
                              })}
                            </tr>

                            {/* Permission Detail Rows */}
                            {isExpanded && Object.entries(labels).map(([permKey, permLabel]) => (
                              <tr key={`${moduleKey}-${permKey}`} className="border-b border-gray-100 hover:bg-gray-50">
                                <td className="py-3 px-4 pl-12 text-sm text-gray-700">
                                  {permLabel}
                                </td>
                                {[UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.EMPLOYEE].map((role) => {
                                  const modulePerms = departmentPermissions[role]?.[moduleKey as keyof ModulePermissions] as any;
                                  
                                  return (
                                    <td key={role} className="py-3 px-4 text-center">
                                      <input
                                        type="checkbox"
                                        checked={modulePerms?.[permKey] || false}
                                        onChange={(e) => {
                                          setDepartmentPermissions({
                                            ...departmentPermissions,
                                            [role]: {
                                              ...departmentPermissions[role],
                                              [moduleKey]: {
                                                ...modulePerms,
                                                [permKey]: e.target.checked,
                                              },
                                            },
                                          });
                                        }}
                                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-600 cursor-pointer"
                                      />
                                    </td>
                                  );
                                })}
                              </tr>
                            ))}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Quick Actions */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Quick Actions</p>
                      <p className="text-xs text-gray-500 mt-0.5">Bulk permission management</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // Expand all modules
                          const allModules = new Set(Object.keys(permissionLabels));
                          setExpandedModules(allModules);
                        }}
                      >
                        Expand All
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // Collapse all modules
                          setExpandedModules(new Set());
                        }}
                      >
                        Collapse All
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // Reset to defaults
                          setDepartmentPermissions(getDefaultDepartmentPermissions());
                        }}
                      >
                        Reset to Defaults
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Department Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-2 border-b border-gray-200">
                    <span className="text-sm text-gray-600">Total Teams</span>
                    <span className="font-semibold">{teams.length}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-200">
                    <span className="text-sm text-gray-600">Total Members</span>
                    <span className="font-semibold">
                      {teams.reduce((sum, team) => sum + team.members.length, 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-200">
                    <span className="text-sm text-gray-600">Department Manager</span>
                    <span className="font-semibold text-sm">{manager ? "Assigned" : "Not set"}</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-gray-600">Annual Budget</span>
                    <span className="font-semibold">{budget ? `$${budget}` : "Not set"}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Guidelines */}
            <Card>
              <CardHeader>
                <CardTitle>Guidelines</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex gap-2">
                    <span className="text-indigo-600 font-medium">•</span>
                    <p>Choose a clear, descriptive name for the department</p>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-indigo-600 font-medium">•</span>
                    <p>Assign an experienced manager to lead the department</p>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-indigo-600 font-medium">•</span>
                    <p>Organize employees into teams based on function or project</p>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-indigo-600 font-medium">•</span>
                    <p>Set realistic budget allocations for department operations</p>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-indigo-600 font-medium">•</span>
                    <p>Use cost centers to track departmental expenses</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Status */}
            <Card>
              <CardHeader>
                <CardTitle>Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Form Completion</span>
                    <span className="text-sm font-semibold text-indigo-600">
                      {Math.round(
                        ((departmentName ? 1 : 0) +
                        (departmentCode ? 1 : 0) +
                        (manager ? 1 : 0) +
                        (teams.length > 0 ? 1 : 0)) / 4 * 100
                      )}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-indigo-600 h-2 rounded-full transition-all"
                      style={{
                        width: `${Math.round(
                          ((departmentName ? 1 : 0) +
                          (departmentCode ? 1 : 0) +
                          (manager ? 1 : 0) +
                          (teams.length > 0 ? 1 : 0)) / 4 * 100
                        )}%`
                      }}
                    ></div>
                  </div>
                  <div className="pt-3 space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <div className={`w-2 h-2 rounded-full ${departmentName ? "bg-green-500" : "bg-gray-300"}`}></div>
                      <span className={departmentName ? "text-gray-900" : "text-gray-500"}>Department name</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className={`w-2 h-2 rounded-full ${departmentCode ? "bg-green-500" : "bg-gray-300"}`}></div>
                      <span className={departmentCode ? "text-gray-900" : "text-gray-500"}>Department code</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className={`w-2 h-2 rounded-full ${manager ? "bg-green-500" : "bg-gray-300"}`}></div>
                      <span className={manager ? "text-gray-900" : "text-gray-500"}>Manager assigned</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className={`w-2 h-2 rounded-full ${teams.length > 0 ? "bg-green-500" : "bg-gray-300"}`}></div>
                      <span className={teams.length > 0 ? "text-gray-900" : "text-gray-500"}>Teams added</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Add/Edit Team Modal */}
      {showTeamModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{editingTeam ? "Edit Team" : "Add New Team"}</CardTitle>
                <button
                  onClick={() => setShowTeamModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Team Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="e.g., Frontend Team"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={teamDescription}
                    onChange={(e) => setTeamDescription(e.target.value)}
                    rows={2}
                    placeholder="Brief description of the team's responsibilities..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Team Lead
                  </label>
                  {teamLead ? (
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                          {teamLead.avatar}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{teamLead.name}</p>
                          <p className="text-xs text-gray-500">{teamLead.title}</p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setTeamLead(null)}
                      >
                        Change
                      </Button>
                    </div>
                  ) : (
                    <div className="relative">
                      <Button
                        variant="outline"
                        className="w-full gap-2"
                        onClick={() => setShowTeamLeadSearch(!showTeamLeadSearch)}
                      >
                        <Search className="w-4 h-4" />
                        Select Team Lead
                      </Button>

                      {showTeamLeadSearch && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto">
                          <div className="p-2">
                            {mockEmployees.map((emp) => (
                              <button
                                key={emp.id}
                                onClick={() => {
                                  setTeamLead(emp);
                                  setShowTeamLeadSearch(false);
                                }}
                                className="w-full flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors"
                              >
                                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-xs">
                                  {emp.avatar}
                                </div>
                                <div className="flex-1 text-left">
                                  <p className="font-medium text-sm">{emp.name}</p>
                                  <p className="text-xs text-gray-500">{emp.title}</p>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Team Members ({teamMembers.length})
                  </label>
                  
                  {teamMembers.length > 0 && (
                    <div className="mb-3 space-y-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-2">
                      {teamMembers.map((member) => (
                        <div key={member.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-xs">
                              {member.avatar}
                            </div>
                            <div>
                              <p className="font-medium text-sm">{member.name}</p>
                              <p className="text-xs text-gray-500">{member.title}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => removeMember(member.id)}
                            className="p-1 hover:bg-red-50 rounded"
                          >
                            <X className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="relative">
                    <Button
                      variant="outline"
                      className="w-full gap-2"
                      onClick={() => setShowMemberSearch(!showMemberSearch)}
                    >
                      <Plus className="w-4 h-4" />
                      Add Members
                    </Button>

                    {showMemberSearch && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto">
                        <div className="p-3 border-b border-gray-200 sticky top-0 bg-white">
                          <div className="relative">
                            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                            <input
                              type="text"
                              value={memberSearchQuery}
                              onChange={(e) => setMemberSearchQuery(e.target.value)}
                              placeholder="Search employees..."
                              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                          </div>
                        </div>
                        <div className="p-2">
                          {filteredMembers.map((emp) => (
                            <button
                              key={emp.id}
                              onClick={() => {
                                setTeamMembers([...teamMembers, emp]);
                                setMemberSearchQuery("");
                              }}
                              className="w-full flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors"
                            >
                              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-xs">
                                {emp.avatar}
                              </div>
                              <div className="flex-1 text-left">
                                <p className="font-medium text-sm">{emp.name}</p>
                                <p className="text-xs text-gray-500">{emp.title}</p>
                              </div>
                            </button>
                          ))}
                          {filteredMembers.length === 0 && (
                            <p className="text-center text-gray-500 py-4 text-sm">No more employees available</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowTeamModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    className="flex-1"
                    onClick={handleSaveTeam}
                    disabled={!teamName}
                  >
                    {editingTeam ? "Update Team" : "Add Team"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

