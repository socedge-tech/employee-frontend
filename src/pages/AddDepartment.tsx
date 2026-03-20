import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { capitalizeFirstLetter } from "../utils/stringUtils";
import { ArrowLeft, Save, Plus, Trash2, Users, Search, X, Shield, ChevronDown, ChevronUp, Loader2, Pencil, Eye } from "lucide-react";
import { Card, CardHeader, CardContent, CardTitle } from "../components/ui/card.tsx";
import { Button } from "../components/ui/button.tsx";
import { UserRole } from "../types/rbac.ts";
import type { DepartmentPermissions, ModulePermissions } from "../types/rbac.ts";
import {
  getDefaultDepartmentPermissions,
  moduleDisplayNames,
  permissionLabels
} from "../config/defaultPermissions.ts";
import { getEmployees } from "../api/employees.ts";
import { getDepartment, getDepartments, createDepartment, updateDepartment } from "../api/departments.ts";
import { getOrganizations } from "../api/organizations.ts";
import { createTeam, updateTeam, deleteTeam, getTeam } from "../api/teams.ts";
import type { Branch } from "../api/organizations.ts";
import { toast } from "sonner";
import { Permission } from "../types/rbac";
import { RoleGate } from "../components/Auth/RoleGate";

interface Team {
  id: string;
  name: string;
  lead: string;
  leadId: string;
  description: string;
  members: string[];
}

interface UIEmployee {
  id: string;
  name: string;
  title: string;
  department: string;
  avatar: string;
}

export function AddDepartment() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const isEditMode = !!id;

  const [departmentName, setDepartmentName] = useState("");
  const [departmentCode, setDepartmentCode] = useState("");
  const [description, setDescription] = useState("");
  const [manager, setManager] = useState<UIEmployee | null>(null);
  const [parentDepartment, setParentDepartment] = useState<string | number>("None");
  const [budget, setBudget] = useState("");
  const [branches, setBranches] = useState<Branch[]>([]);
  const [organizationName, setOrganizationName] = useState("");
  const [selectedBranchId, setSelectedBranchId] = useState<string>("");
  const [teams, setTeams] = useState<Team[]>([]);

  const [showManagerSearch, setShowManagerSearch] = useState(false);
  const [managerSearchQuery, setManagerSearchQuery] = useState("");
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [isTeamEdit, setIsTeamEdit] = useState(false);
  const [isTeamView, setIsTeamView] = useState(false);
  const [isSavingTeam, setIsSavingTeam] = useState(false);

  // Team modal state
  const [teamName, setTeamName] = useState("");
  const [teamDescription, setTeamDescription] = useState("");
  const [teamLead, setTeamLead] = useState<UIEmployee | null>(null);
  const [teamMembers, setTeamMembers] = useState<UIEmployee[]>([]);
  const [showTeamLeadSearch, setShowTeamLeadSearch] = useState(false);
  const [showMemberSearch, setShowMemberSearch] = useState(false);
  const [memberSearchQuery, setMemberSearchQuery] = useState("");

  // Permissions state
  const [departmentPermissions, setDepartmentPermissions] = useState<DepartmentPermissions>(
    getDefaultDepartmentPermissions()
  );
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

  const [employees, setEmployees] = useState<UIEmployee[]>([]);
  const [departmentsList, setDepartmentsList] = useState<Array<{id: number, department_name: string}>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeptView, setIsDeptView] = useState(false);

  const fetchById = async () => {
    try {
      if (isLoading === false) setIsLoading(true);
      
      const [empData, depData, orgResponse] = await Promise.all([
        getEmployees(),
        getDepartments(),
        getOrganizations()
      ]);

      const mappedEmployees: UIEmployee[] = empData.map((emp: any) => ({
        id: emp.id.toString(),
        name: emp.details ? `${emp.details.first_name || ""} ${emp.details.last_name || ""}` : (emp.username || "Anonymous"),
        title: emp.details?.job_role || emp.role || "Employee",
        department: emp.details?.department_id ? emp.details.department_id.toString() : "",
        avatar: emp.details ? `${emp.details.first_name?.[0] || ""}${emp.details.last_name?.[0] || ""}`.toUpperCase() : "U",
      }));
      setEmployees(mappedEmployees);
      setDepartmentsList(depData);

      const mainOrg = Array.isArray(orgResponse) ? orgResponse[0] : orgResponse;
      if (mainOrg) {
        setOrganizationName(mainOrg.entity_name || "");
        setBranches(mainOrg.branches || []);
      }

      if (isEditMode && id) {
        const departmentData = await getDepartment(parseInt(id, 10));
        if (departmentData) {
          setDepartmentName(departmentData.department_name || "");
          setDepartmentCode(departmentData.department_code || "");
          setDescription(departmentData.description || "");
          setSelectedBranchId(departmentData.branch_id?.toString() || "");
          setParentDepartment(departmentData.parent_department_id?.toString() || "None");
          setBudget(departmentData.annual_budget?.toString() || "");

          if (departmentData.manager_id) {
            const mId = departmentData.manager_id.toString();
            const managerData = mappedEmployees.find(emp => emp.id === mId);
            if (managerData) setManager(managerData);
          }

          if (departmentData.teams) {
            const mappedTeams = departmentData.teams.map((t: any) => ({
              id: t.id?.toString() || `temp-${Math.random()}`,
              name: t.team_name || "",
              description: t.description || "",
              lead: t.team_lead?.full_name || t.team_lead?.username || t.team_lead_id?.toString() || "",
              leadId: t.team_lead_id?.toString() || "",
              members: Array.isArray(t.members) 
                ? t.members.map((m: any) => (m?.id || m?.user_id)?.toString()).filter((id: any) => id != null)
                : []
            }));
            setTeams(mappedTeams);
          }

          if (departmentData.permissions) setDepartmentPermissions(departmentData.permissions);
        }
      }
    } catch (error) {
      console.error("Failed to load data", error);
      toast.error("Failed to load required data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchById();
  }, [id, isEditMode]);

  const filteredManagers = employees.filter((emp: UIEmployee) =>
    emp.name.toLowerCase().includes(managerSearchQuery.toLowerCase()) ||
    emp.title.toLowerCase().includes(managerSearchQuery.toLowerCase())
  );

  const filteredMembers = employees.filter((emp: UIEmployee) =>
    emp.name.toLowerCase().includes(memberSearchQuery.toLowerCase()) &&
    !teamMembers.some((m: UIEmployee) => m.id === emp.id)
  );

  const handleDeptUpdate = async () => {
    if (isDeptView) {
      toast.error("Cannot save while in view mode.");
      return;
    }

    if (!departmentName || !departmentCode) {
      toast.error("Missing required fields");
      return;
    }

    const payload = {
      department_name: departmentName.trim(),
      department_code: departmentCode.trim(),
      description: description.trim(),
      branch_id: selectedBranchId ? parseInt(selectedBranchId, 10) : null,
      manager_id: manager?.id ? parseInt(manager.id, 10) : null,
      parent_department_id: parentDepartment !== "None" ? parseInt(parentDepartment as string, 10) : null,
      annual_budget: budget ? parseFloat(budget) : 0,
      teams: teams.map(t => ({
        // Include ID only if it's an existing team (for updates)
        ...(isEditMode && !t.id.startsWith("team-") ? { id: parseInt(t.id, 10) } : {}),
        team_name: t.name,
        description: t.description,
        team_lead_id: t.leadId ? parseInt(t.leadId, 10) : null,
        team_members: t.members.map(m => parseInt(m, 10))
      }))
    };

    try {
      setIsSaving(true);
      if (isEditMode && id) {
        await updateDepartment(parseInt(id, 10), payload);
        toast.success("Department updated successfully");
      } else {
        await createDepartment(payload);
        toast.success("Department created successfully");
      }
      navigate("/company-structure", { replace: true });
    } catch (error) {
      console.error("Failed to save department", error);
      toast.error(error instanceof Error ? error.message : "Failed to save department");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddTeam = () => {
    setTeamName("");
    setTeamDescription("");
    setTeamLead(null);
    setTeamMembers([]);
    setSelectedTeam(null);
    setIsTeamEdit(false);
    setIsTeamView(false);
    setShowTeamModal(true);
  };

  const handleTeamUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName) return;

    const teamPayload = {
      team_name: capitalizeFirstLetter(teamName),
      description: capitalizeFirstLetter(teamDescription),
      team_lead_id: teamLead?.id ? parseInt(teamLead.id, 10) : null,
      team_members: teamMembers.map(m => parseInt(m.id, 10)),
      department_id: isEditMode && id ? parseInt(id, 10) : undefined
    };

    try {
      setIsSavingTeam(true);
      if (isEditMode && id) {
        if (isTeamEdit && selectedTeam && !selectedTeam.id.startsWith("team-")) {
          await updateTeam(parseInt(selectedTeam.id, 10), teamPayload);
          toast.success("Team updated successfully");
        } else {
          await createTeam(teamPayload);
          toast.success("Team added successfully");
        }
        await fetchById();
        setShowTeamModal(false);
      } else {
        const newTeam: Team = {
          id: selectedTeam?.id || `team-${Date.now()}`,
          name: teamName,
          lead: teamLead?.name || "",
          leadId: teamLead?.id || "",
          description: teamDescription,
          members: teamMembers.map(m => m.id),
        };
        if (isTeamEdit) {
          setTeams(teams.map(t => t.id === selectedTeam?.id ? newTeam : t));
        } else {
          setTeams([...teams, newTeam]);
        }
        setShowTeamModal(false);
      }
    } catch (error) {
      console.error("Failed to save team", error);
      toast.error("Failed to save team");
    } finally {
      setIsSavingTeam(false);
    }
  };

  const handleTeamView = async (team: Team) => {
    if (!team || !team.id) return;

    // Reset modal states before loading to prevent flash of old data
    setTeamName("");
    setTeamDescription("");
    setTeamLead(null);
    setTeamMembers([]);
    setIsTeamView(true);
    setIsTeamEdit(false);

    // If it's a temp team (not saved in backend), show local data immediately
    if (String(team.id).startsWith("team-")) {
      setTeamName(team.name);
      setTeamDescription(team.description);
      const lead = employees.find(e => e.id === String(team.leadId));
      setTeamLead(lead || null);
      setTeamMembers(employees.filter(e => team.members.includes(e.id)));
      setSelectedTeam(team);
      setShowTeamModal(true);
      return;
    }

    try {
      setIsSavingTeam(true); // Using this as the loading indicator
      
      const response = await getTeam(parseInt(String(team.id), 10));
      // Handle the case where the API might return the wrapped or unwrapped object
      const teamDetails = response; 
      
      if (teamDetails) {
        // 1. Bind basic fields
        setTeamName(teamDetails.team_name || "");
        setTeamDescription(teamDetails.description || "");
        
        // 2. Bind Team Lead
        const leadId = teamDetails.team_lead_id?.toString();
        if (leadId) {
          const matchedLead = employees.find(e => e.id === leadId);
          setTeamLead(matchedLead || null);
        }

        // 3. Bind Members List
        if (teamDetails.members && Array.isArray(teamDetails.members)) {
          const membersList = teamDetails.members
            .map((member: { id?: number | string; user_id?: number | string }) => {
              const mId = (member.id || member.user_id)?.toString();
              return employees.find(emp => emp.id === mId);
            })
            .filter((emp): emp is UIEmployee => emp !== undefined);
          setTeamMembers(membersList);
        }

        // 4. Finalize state and open modal
        setSelectedTeam(team);
        setShowTeamModal(true);
      } else {
        toast.error("Team data not found");
      }
    } catch (error) {
      console.error("[TeamView] Error fetching data:", error);
      toast.error("Failed to load team details. Please try again.");
    } finally {
      setIsSavingTeam(false);
    }
  };

  const handleDeleteTeam = async (teamId: string) => {
    try {
      if (isEditMode && id && !teamId.startsWith("team-")) {
        await deleteTeam(parseInt(teamId, 10));
        toast.success("Team deleted successfully");
        fetchById();
      } else {
        setTeams(teams.filter(t => t.id !== teamId));
      }
    } catch (error) {
      console.error("Failed to delete team", error);
      toast.error("Failed to delete team");
    }
  };

  const handleEditTeam = (team: Team) => {
    setTeamName(team.name);
    setTeamDescription(team.description);
    const lead = employees.find(e => e.id === team.leadId);
    setTeamLead(lead || null);
    setTeamMembers(employees.filter(e => team.members.includes(e.id)));
    setSelectedTeam(team);
    setIsTeamEdit(true);
    setIsTeamView(false);
    setShowTeamModal(true);
  };

  useEffect(() => {
    if (!isEditMode || isLoading) return;
    const params = new URLSearchParams(location.search);
    const teamId = params.get("teamId");
    const isViewMode = params.get("view") === "true";

    setIsDeptView(isViewMode);

    if (!teamId || teams.length === 0) return;

    const existingTeam = teams.find(t => {
      const tId = typeof t.id === "string" ? t.id : String(t.id);
      return tId === String(teamId);
    });

    if (!existingTeam) {
      console.warn(`Team with id ${teamId} not found in teams list`);
      return;
    }

    setTeamName(existingTeam.name);
    setTeamDescription(existingTeam.description);
    const lead = employees.find(e => e.id === existingTeam.leadId);
    setTeamLead(lead || null);
    setTeamMembers(employees.filter(e => existingTeam.members.includes(e.id)));
    setSelectedTeam(existingTeam);
    setIsTeamEdit(!isViewMode);
    setIsTeamView(isViewMode);
    setShowTeamModal(true);
  }, [location.search, teams, employees, isEditMode, isLoading]);

  const removeMember = (memberId: string) => {
    setTeamMembers(teamMembers.filter(m => m.id !== memberId));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <RoleGate permissions={[Permission.MANAGE_DEPARTMENTS]}>
      <div className="-m-8 flex flex-col bg-gray-50 overflow-hidden" style={{ height: 'calc(100vh - 64px)' }}>
        {/* Fixed Header Section */}
        <div className="bg-white border-b border-gray-200 shadow-sm px-8 py-6 z-20 flex-shrink-0">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate("/company-structure")}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900">
                    {isDeptView ? "View Department" : isEditMode ? "Edit Department" : "Add New Department"}
                  </h1>
                  <p className="text-sm text-gray-500 mt-1">
                    {isDeptView
                      ? "Review department information"
                      : isEditMode
                        ? "Update department information"
                        : "Create a new department in your organization"
                    }
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => navigate("/company-structure")} disabled={isSaving}>
                  {isDeptView ? "Close" : "Cancel"}
                </Button>
                {!isDeptView && (
                  <Button className="gap-2" onClick={handleDeptUpdate} disabled={isSaving}>
                    {isSaving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    {isSaving ? "Saving..." : "Save Department"}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Content Section */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto w-full">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-12">
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
                          onChange={(e) => setDepartmentName(capitalizeFirstLetter(e.target.value))}
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
                        onChange={(e) => setDescription(capitalizeFirstLetter(e.target.value))}
                        rows={3}
                        placeholder="Brief description of the department's purpose and responsibilities..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Organization
                        </label>
                        <input
                          type="text"
                          value={organizationName}
                          disabled
                          className="w-full px-3 py-2 border border-gray-200 bg-gray-50 rounded-lg text-gray-500 cursor-not-allowed"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Branch <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={selectedBranchId}
                          onChange={(e) => setSelectedBranchId(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="">Select branch</option>
                          {branches.map((branch) => (
                            <option key={branch.id} value={branch.id}>
                              {branch.branch_name} ({branch.branch_code})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
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
                          {departmentsList.map((dep: any) => (
                            <option key={dep.id} value={dep.id}>{dep.department_name}</option>
                          ))}
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
                      <div 
                        key={team.id} 
                        className="p-4 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:border-indigo-300 transition-colors"
                        onClick={() => handleTeamView(team)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{team.name}</h4>
                            <p className="text-sm text-gray-500 mt-1">{team.description}</p>
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={(e) => { e.stopPropagation(); handleTeamView(team); }}
                              className="p-1.5 hover:bg-indigo-50 rounded transition-colors"
                              title="View Team"
                            >
                              <Eye className="w-4 h-4 text-indigo-600" />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleEditTeam(team); }}
                              className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                              title="Edit Team"
                            >
                              <Pencil className="w-4 h-4 text-gray-600" />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDeleteTeam(team.id); }}
                              className="p-1.5 hover:bg-red-50 rounded transition-colors"
                              title="Delete Team"
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </button>
                          </div>
                        </div>
                          <div className="flex items-center justify-between text-sm mt-3 pt-3 border-t border-gray-100">
                            <span className="text-gray-600">Team Lead: <span className="font-medium text-gray-900">{team.lead || "Not assigned"}</span></span>
                            <span className="text-gray-600">{(team.members?.length || 0)} members</span>
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

        {/* Add/Edit Team Modal */}
        {showTeamModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <Card className="max-w-2xl bg-white w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
              <form onSubmit={handleTeamUpdate} className="flex flex-col h-full overflow-hidden">
                <CardHeader className="flex-shrink-0 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-bold text-gray-900 border-none p-0">
                       {isTeamView ? "Team Details" : isTeamEdit ? "Update Team" : "Add Team"}
                    </CardTitle>
                    <button
                      type="button"
                      onClick={() => setShowTeamModal(false)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 overflow-y-auto p-6 space-y-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Team Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={teamName}
                        onChange={(e) => setTeamName(capitalizeFirstLetter(e.target.value))}
                        placeholder="e.g., Frontend Team"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-500"
                        required
                        disabled={isTeamView}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        value={teamDescription}
                        onChange={(e) => setTeamDescription(capitalizeFirstLetter(e.target.value))}
                        rows={3}
                        placeholder="Brief description of the team's responsibilities..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-500"
                        disabled={isTeamView}
                      />
                    </div>

                    <div className="relative">
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
                              <p className="font-medium text-sm text-gray-900">{teamLead.name}</p>
                              <p className="text-xs text-gray-500">{teamLead.title}</p>
                            </div>
                          </div>
                          {!isTeamView && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setTeamLead(null)}
                            >
                              Change
                            </Button>
                          )}
                        </div>
                      ) : (
                        <div className="relative">
                          {!isTeamView && (
                            <Button
                              type="button"
                              variant="outline"
                              className="w-full gap-2 text-gray-600 border-dashed"
                              onClick={() => setShowTeamLeadSearch(!showTeamLeadSearch)}
                            >
                              <Search className="w-4 h-4" />
                              Select Team Lead
                            </Button>
                          )}

                          {showTeamLeadSearch && !isTeamView && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-20 max-h-60 overflow-y-auto ring-1 ring-black ring-opacity-5">
                              <div className="p-2">
                                {employees.map((emp) => (
                                  <button
                                    key={emp.id}
                                    type="button"
                                    onClick={() => {
                                      setTeamLead(emp);
                                      setShowTeamLeadSearch(false);
                                    }}
                                    className="w-full flex items-center gap-3 p-2 hover:bg-indigo-50 rounded-lg transition-colors"
                                  >
                                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-xs">
                                      {emp.avatar}
                                    </div>
                                    <div className="flex-1 text-left">
                                      <p className="font-medium text-sm text-gray-900">{emp.name}</p>
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
                        <div className="mb-4 space-y-2 max-h-48 overflow-y-auto border border-gray-100 rounded-lg p-2 bg-gray-50/50">
                          {teamMembers.map((member) => (
                            <div key={member.id} className="flex items-center justify-between p-2.5 bg-white border border-gray-100 rounded-lg shadow-sm">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-xs">
                                  {member.avatar}
                                </div>
                                <div>
                                  <p className="font-medium text-sm text-gray-900">{member.name}</p>
                                  <p className="text-xs text-gray-500">{member.title}</p>
                                </div>
                              </div>
                              {!isTeamView && (
                                <button
                                  type="button"
                                  onClick={() => removeMember(member.id)}
                                  className="p-1.5 hover:bg-red-50 rounded-md transition-colors"
                                >
                                  <X className="w-4 h-4 text-red-500" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                        {!isTeamView && (
                        <div className="relative">
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full gap-2 text-gray-600 border-dashed"
                            onClick={() => setShowMemberSearch(!showMemberSearch)}
                          >
                            <Plus className="w-4 h-4" />
                            Add Members
                          </Button>

                          {showMemberSearch && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-20 max-h-60 overflow-y-auto ring-1 ring-black ring-opacity-5">
                              <div className="p-3 border-b border-gray-200 sticky top-0 bg-white">
                                <div className="relative">
                                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                  <input
                                    type="text"
                                    value={memberSearchQuery}
                                    onChange={(e) => setMemberSearchQuery(e.target.value)}
                                    placeholder="Search employees..."
                                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                  />
                                </div>
                              </div>
                              <div className="p-2">
                                {filteredMembers.map((emp) => (
                                  <button
                                    key={emp.id}
                                    type="button"
                                    onClick={() => {
                                      setTeamMembers([...teamMembers, emp]);
                                      setMemberSearchQuery("");
                                    }}
                                    className="w-full flex items-center gap-3 p-2 hover:bg-indigo-50 rounded-lg transition-colors"
                                  >
                                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-xs">
                                      {emp.avatar}
                                    </div>
                                    <div className="flex-1 text-left">
                                      <p className="font-medium text-sm text-gray-900">{emp.name}</p>
                                      <p className="text-xs text-gray-500">{emp.title}</p>
                                    </div>
                                  </button>
                                ))}
                                {filteredMembers.length === 0 && (
                                  <p className="text-center text-gray-500 py-4 text-sm font-medium">No more employees available</p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>

                <div className="flex-shrink-0 p-6 border-t border-gray-100 bg-gray-50 flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowTeamModal(false)}
                  >
                    {isTeamView ? "Close" : "Cancel"}
                  </Button>
                  {!isTeamView && (
                    <Button
                      type="submit"
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                      disabled={!teamName || isSavingTeam}
                    >
                      {isSavingTeam ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        isTeamEdit ? "Update Team" : "Add Team"
                      )}
                    </Button>
                  )}
                </div>
              </form>
            </Card>
          </div>
        )}
      </div>
    </div>
  </div>
</RoleGate>
  );
}
