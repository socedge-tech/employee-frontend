import { useNavigate } from "react-router-dom";
import {
  ChevronDown, ChevronRight, Plus, Users, Building2,
  Edit, Settings, Loader2, MapPin, Eye, Trash2, Pencil,
} from "lucide-react";
import { Card, CardHeader, CardContent, CardTitle } from "../components/ui/card.tsx";
import { Button } from "../components/ui/button.tsx";
import { CompanyOverviewCard } from "../components/CompanyOverviewCard.tsx";
import { RoleGate } from "../components/Auth/RoleGate";
import { Permission } from "../types/rbac";
import { usePermissions } from "../hooks/usePermissions";
import { useCompanyStructure, type DepartmentNode, type TeamNode } from "../hooks/useCompanyStructure";

// ─────────────────────────────────────────────────────────────────────────────
// Small, focused sub-components extracted from the monolith
// ─────────────────────────────────────────────────────────────────────────────

interface NodeActionsProps {
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  canEdit?: boolean;
}

function NodeActions({ onView, onEdit, onDelete, canEdit }: NodeActionsProps) {
  return (
    <div
      className="flex items-center gap-1.5 animate-in fade-in slide-in-from-right-2 duration-200"
      onClick={e => e.stopPropagation()}
    >
      {onView && (
        <button
          className="p-1.5 bg-white hover:bg-indigo-600 text-indigo-600 hover:text-white rounded-lg transition-all shadow-sm border border-gray-100"
          title="View"
          onClick={onView}
        >
          <Eye className="w-3.5 h-3.5" />
        </button>
      )}
      {canEdit && onEdit && (
        <button
          className="p-1.5 bg-white hover:bg-indigo-600 text-indigo-600 hover:text-white rounded-lg transition-all shadow-sm border border-gray-100"
          title="Edit"
          onClick={onEdit}
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
      )}
      {canEdit && onDelete && (
        <button
          className="p-1.5 bg-white hover:bg-rose-50 text-rose-600 rounded-lg transition-all shadow-sm border border-gray-100"
          title="Delete"
          onClick={onDelete}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

interface TeamRowProps {
  team: TeamNode;
  isHovered: boolean;
  canEdit: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

function TeamRow({ team, isHovered, canEdit, onMouseEnter, onMouseLeave }: TeamRowProps) {
  return (
    <div
      className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors relative"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
        <Users className="w-4 h-4 text-indigo-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{team.name}</p>
        <p className="text-xs text-gray-500">Lead: {team.lead}</p>
      </div>
      <div className="flex -space-x-2">
        {team.avatars.length > 0
          ? team.avatars.map((avatar, idx) => (
            <div
              key={idx}
              className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-xs text-white font-medium border-2 border-white"
            >
              {avatar}
            </div>
          ))
          : (
            <div className="w-8 h-8 bg-gray-100 rounded-full border-2 border-white flex items-center justify-center">
              <Users className="w-3 h-3 text-gray-400" />
            </div>
          )}
      </div>
      <span className="text-sm text-gray-600 mr-2">{team.members}</span>
      {isHovered && (
        <NodeActions canEdit={canEdit} />
      )}
    </div>
  );
}

interface DepartmentRowProps {
  dept: DepartmentNode;
  isHovered: boolean;
  canEdit: boolean;
  onToggle: () => void;
  onSelect: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onEdit: () => void;
  teamHoveredId: string | number | null;
  onTeamHover: (id: string | number | null) => void;
}

function DepartmentRow({
  dept, isHovered, canEdit,
  onToggle, onSelect, onMouseEnter, onMouseLeave, onEdit,
  teamHoveredId, onTeamHover,
}: DepartmentRowProps) {
  return (
    <div className="space-y-2">
      <div
        className="flex items-center gap-2 p-3 bg-white border border-gray-200 rounded-lg hover:border-indigo-300 cursor-pointer transition-colors relative"
        onClick={() => { onToggle(); onSelect(); }}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <button
          className="p-1 hover:bg-gray-100 rounded flex-shrink-0"
          onClick={e => { e.stopPropagation(); onToggle(); }}
        >
          {dept.expanded
            ? <ChevronDown className="w-4 h-4" />
            : <ChevronRight className="w-4 h-4" />}
        </button>
        <Users className="w-5 h-5 text-gray-600 flex-shrink-0" />
        <span className="font-medium truncate">{dept.name}</span>
        <span className="text-sm text-gray-500 truncate">• {dept.manager}</span>
        <span className="ml-auto text-sm text-gray-600 mr-2 whitespace-nowrap">{dept.headcount} people</span>
        {isHovered && (
          <NodeActions
            canEdit={canEdit}
            onEdit={onEdit}
          />
        )}
      </div>

      {dept.expanded && dept.teams.length > 0 && (
        <div className="ml-8 space-y-2">
          {dept.teams.map(team => (
            <TeamRow
              key={team.id}
              team={team}
              isHovered={teamHoveredId === team.id}
              canEdit={canEdit}
              onMouseEnter={() => onTeamHover(team.id)}
              onMouseLeave={() => onTeamHover(null)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Company Structure Page
// ─────────────────────────────────────────────────────────────────────────────
export function CompanyStructure() {
  const navigate = useNavigate();
  const { can } = usePermissions();
  const canEditStructure = can(Permission.EDIT_COMPANY_STRUCTURE);
  const canManageDepts = can(Permission.MANAGE_DEPARTMENTS);

  const {
    departments,
    selectedDept,
    setSelectedDept,
    companyDetails,
    companyName,
    totalEmployees,
    isLoading,
    isSetupView,
    setIsSetupView,
    expandedBranches,
    hoveredNode,
    setHoveredNode,
    toggleDepartment,
    toggleBranch,
  } = useCompanyStructure();

  // Team hover needs a simpler local key: we can reuse hoveredNode with type='team'
  const teamHoveredId = hoveredNode?.type === "team" ? hoveredNode.id : null;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  const unassignedDepts = departments.filter(d => !d.branch_id);

  return (
    <div className="space-y-6">
      {/* ── Page Header ────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Company Structure</h1>
          <p className="text-gray-500 mt-1 text-sm font-medium">
            Manage organizational hierarchy and departments
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* View toggle */}
          <div className="flex items-center p-1 bg-gray-100 rounded-lg border border-gray-200 shadow-sm">
            {[
              { label: "Setup View", active: isSetupView, onClick: () => setIsSetupView(true) },
              { label: "Details View", active: !isSetupView, onClick: () => setIsSetupView(false) },
            ].map(btn => (
              <button
                key={btn.label}
                onClick={btn.onClick}
                className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all duration-200 ${btn.active
                    ? "bg-white text-indigo-600 shadow-sm ring-1 ring-gray-200"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
                  }`}
              >
                {btn.label}
              </button>
            ))}
          </div>

          {(companyDetails || !isSetupView) && (
            <div className="flex items-center gap-3">
              <RoleGate permissions={[Permission.MANAGE_SYSTEM_SETTINGS]}>
                <Button
                  variant="outline"
                  className="h-10 bg-white border-gray-200 hover:bg-gray-50 text-gray-700 font-medium"
                  onClick={() => navigate("/company-structure/settings")}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Company Settings
                </Button>
              </RoleGate>
              <RoleGate permissions={[Permission.MANAGE_DEPARTMENTS]}>
                <Button
                  className="h-10 bg-[#4F46E5] hover:bg-[#4338CA] text-white font-medium shadow-sm"
                  onClick={() => navigate("/company-structure/add-department")}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Department
                </Button>
              </RoleGate>
            </div>
          )}
        </div>
      </div>

      {/* ── Setup (Empty State) ──────────────────────────────────── */}
      {isSetupView ? (
        <Card className="border-dashed border-gray-300 shadow-sm mt-8">
          <CardContent className="flex flex-col items-center justify-center text-center py-24">
            <div className="w-20 h-20 bg-[#EFF4FF] rounded-full flex items-center justify-center mb-6">
              <Building2 className="w-10 h-10 text-[#3B82F6]" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">No Company Structure Defined</h2>
            <p className="text-gray-500 max-w-lg mb-8 text-sm">
              Set up your company structure with legal, organizational, geographical, and HR/payroll
              information to get started.
            </p>
            <Button
              onClick={() => navigate("/company-structure/settings")}
              className="bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600 hover:opacity-90 text-white px-8 h-11 rounded-lg shadow-sm gap-2 font-medium border-none"
            >
              <Plus className="w-4 h-4" />
              Setup Company Structure
            </Button>
          </CardContent>
        </Card>

      ) : (
        <>
          {/* ── Overview Card ─────────────────────────────────────── */}
          <CompanyOverviewCard companyData={companyDetails} totalEmployees={totalEmployees} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* ── Hierarchy Tree ────────────────────────────────────── */}
            <div className="lg:col-span-2">
              <Card className="shadow-sm border-gray-200">
                <CardHeader className="pb-3 px-6">
                  <CardTitle className="text-lg font-bold">Organization Hierarchy</CardTitle>
                </CardHeader>
                <CardContent className="px-6">
                  <div className="space-y-4">
                    {/* Company root node */}
                    <div className="flex items-center gap-3 p-4 bg-[#EEF2FF] rounded-xl border border-[#C7D2FE]">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                        <Building2 className="w-6 h-6 text-[#4F46E5]" />
                      </div>
                      <div className="flex-1">
                        <span className="font-bold text-[#1E1B4B] text-lg">
                          {companyName || companyDetails?.EntityName}
                        </span>
                        <div className="flex items-center gap-3 mt-0.5 text-xs font-medium text-[#4F46E5]">
                          <span>Code: {companyDetails?.companyCode}</span>
                          {companyDetails?.companyType && <span>• {companyDetails.companyType}</span>}
                          {companyDetails?.currency && <span>• {companyDetails.currency}</span>}
                        </div>
                      </div>
                      <span className="text-sm text-[#4F46E5] font-bold">
                        {totalEmployees.toLocaleString()} employees
                      </span>
                    </div>

                    {/* Branch → Department → Team tree */}
                    <div className="ml-8 space-y-3">
                      {(companyDetails?.locations ?? []).map(branch => {
                        const branchDepts = departments.filter(d => d.branch_id === branch.id);
                        const isExpanded = expandedBranches[branch.id];
                        const isBranchHovered = hoveredNode?.type === "branch" && hoveredNode.id === branch.id;

                        return (
                          <div key={branch.id} className="space-y-2">
                            {/* Branch row */}
                            <div
                              className="flex items-center gap-2 p-3 bg-gray-50/50 border border-gray-100 rounded-lg hover:border-indigo-200 cursor-pointer transition-colors relative"
                              onClick={() => toggleBranch(branch.id)}
                              onMouseEnter={() => setHoveredNode({ type: "branch", id: branch.id })}
                              onMouseLeave={() => setHoveredNode(null)}
                            >
                              <button
                                className="p-1 hover:bg-gray-200 rounded text-gray-400 flex-shrink-0"
                                onClick={e => { e.stopPropagation(); toggleBranch(branch.id); }}
                              >
                                {isExpanded
                                  ? <ChevronDown className="w-4 h-4" />
                                  : <ChevronRight className="w-4 h-4" />}
                              </button>
                              <MapPin className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                              <span className="font-bold text-gray-700 text-sm truncate">
                                {branch.locationName ?? branch.locationCode}
                              </span>
                              <span className="text-xs text-gray-400 font-medium ml-1">Branch</span>
                              <span className="ml-auto text-xs font-bold text-gray-400 mr-2 whitespace-nowrap">
                                {branchDepts.length} departments
                              </span>
                              {isBranchHovered && (
                                <NodeActions
                                  onView={() => { }}
                                  canEdit={canEditStructure}
                                  onEdit={() => navigate("/company-structure/settings")}
                                />
                              )}
                            </div>

                            {/* Departments under branch */}
                            {isExpanded && (
                              <div className="ml-6 space-y-3">
                                {branchDepts.length > 0 ? branchDepts.map(dept => (
                                  <DepartmentRow
                                    key={dept.id}
                                    dept={dept}
                                    isHovered={hoveredNode?.type === "department" && hoveredNode.id === dept.id}
                                    canEdit={canManageDepts}
                                    onToggle={() => toggleDepartment(dept.id)}
                                    onSelect={() => setSelectedDept(dept)}
                                    onMouseEnter={() => setHoveredNode({ type: "department", id: dept.id })}
                                    onMouseLeave={() => setHoveredNode(null)}
                                    onEdit={() => navigate(`/company-structure/edit-department/${dept.id}`)}
                                    teamHoveredId={teamHoveredId}
                                    onTeamHover={id => setHoveredNode(id ? { type: "team", id } : null)}
                                  />
                                )) : (
                                  <p className="text-xs text-gray-400 italic py-2">
                                    No departments assigned to this branch
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}

                      {/* Unassigned departments */}
                      {unassignedDepts.length > 0 && (
                        <div className="space-y-2">
                          <div
                            className="flex items-center gap-2 p-3 bg-red-50/30 border border-red-100 rounded-lg hover:border-red-200 cursor-pointer transition-colors relative"
                            onClick={() => toggleBranch("unassigned")}
                            onMouseEnter={() => setHoveredNode({ type: "unassigned-root", id: "unassigned" })}
                            onMouseLeave={() => setHoveredNode(null)}
                          >
                            <button
                              className="p-1 hover:bg-red-100 rounded text-red-300 flex-shrink-0"
                              onClick={e => { e.stopPropagation(); toggleBranch("unassigned"); }}
                            >
                              {expandedBranches["unassigned"]
                                ? <ChevronDown className="w-4 h-4" />
                                : <ChevronRight className="w-4 h-4" />}
                            </button>
                            <Users className="w-5 h-5 text-red-500 flex-shrink-0" />
                            <span className="font-bold text-gray-700 text-sm">Unassigned Departments</span>
                            <span className="ml-auto text-xs font-bold text-red-400 mr-2 whitespace-nowrap">
                              {unassignedDepts.length} departments
                            </span>
                          </div>

                          {expandedBranches["unassigned"] && (
                            <div className="ml-6 space-y-3">
                              {unassignedDepts.map(dept => (
                                <DepartmentRow
                                  key={dept.id}
                                  dept={dept}
                                  isHovered={hoveredNode?.type === "department" && hoveredNode.id === dept.id}
                                  canEdit={canManageDepts}
                                  onToggle={() => toggleDepartment(dept.id)}
                                  onSelect={() => setSelectedDept(dept)}
                                  onMouseEnter={() => setHoveredNode({ type: "department", id: dept.id })}
                                  onMouseLeave={() => setHoveredNode(null)}
                                  onEdit={() => navigate(`/company-structure/edit-department/${dept.id}`)}
                                  teamHoveredId={teamHoveredId}
                                  onTeamHover={id => setHoveredNode(id ? { type: "team", id } : null)}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* ── Right Sidebar ─────────────────────────────────────── */}
            <div className="space-y-6">
              {/* Company Details */}
              <Card className="shadow-sm border-gray-200">
                <CardHeader className="flex flex-row items-center justify-between pb-2 px-6 pt-6">
                  <CardTitle className="text-lg font-bold">Company Details</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => navigate("/company-structure/settings")}
                  >
                    <Edit className="w-4 h-4 text-gray-400" />
                  </Button>
                </CardHeader>
                <CardContent className="px-6 pb-6">
                  <div className="space-y-5">
                    {[
                      { label: "Legal Entity", value: companyDetails?.EntityName },
                      { label: "Company Code", value: companyDetails?.companyCode },
                      { label: "Company Type", value: companyDetails?.companyType },
                      { label: "Currency", value: companyDetails?.currency },
                      { label: "Pay Frequency", value: companyDetails?.payFrequency },
                      { label: "Business Units", value: companyDetails?.businessUnit },
                      { label: "Cost Centers", value: companyDetails?.costCenter },
                      { label: "Payroll Statutory Unit", value: companyDetails?.payrollStatutoryUnit },
                      { label: "Legal Employer", value: companyDetails?.legalEmployer },
                      { label: "Legislative Data Group", value: companyDetails?.legislativeDataGroup },
                    ].filter(row => row.value).map(row => (
                      <div key={row.label}>
                        <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                          {row.label}
                        </label>
                        <p className="font-semibold text-gray-900 mt-1">{row.value}</p>
                      </div>
                    ))}

                    {(companyDetails?.locations?.length ?? 0) > 0 && (
                      <div>
                        <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                          Office Locations
                        </label>
                        <div className="mt-2 space-y-1">
                          {companyDetails!.locations.map(loc => (
                            <div key={loc.id} className="text-sm">
                              <p className="font-medium text-gray-900">{loc.locationName ?? loc.locationCode}</p>
                              {loc.address.city && (
                                <p className="text-xs text-gray-500">{loc.address.city}, {loc.address.country}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Department Details */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Department Details</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => selectedDept && navigate(`/company-structure/edit-department/${selectedDept.id}`)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                </CardHeader>
                <CardContent className="px-6 pb-6 pt-0">
                  {selectedDept ? (
                    <div className="space-y-6">
                      <div>
                        <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                          Department Name
                        </label>
                        <p className="font-semibold text-gray-900 mt-1">{selectedDept.name}</p>
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                          Department Manager
                        </label>
                        <div className="flex items-center gap-3 mt-2">
                          <div className="w-10 h-10 bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] rounded-full flex items-center justify-center text-white font-bold shadow-sm flex-shrink-0">
                            {selectedDept.manager
                              ? selectedDept.manager.split(" ").map(n => n[0]).join("").toUpperCase()
                              : "—"}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{selectedDept.manager}</p>
                            <p className="text-xs text-gray-400 font-medium">Manager</p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                            Total Headcount
                          </label>
                          <p className="text-2xl font-bold text-[#1E1B4B] mt-1">{selectedDept.headcount}</p>
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                          Active Teams
                        </label>
                        <div className="mt-3 space-y-2">
                          {selectedDept.teams.map(team => (
                            <div
                              key={team.id}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors"
                            >
                              <span className="text-sm font-semibold text-gray-700">{team.name}</span>
                              <div className="bg-white px-2.5 py-1 rounded-lg border border-gray-200 shadow-sm">
                                <span className="text-xs font-bold text-[#4F46E5]">{team.members}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-4 space-y-3">
                        <RoleGate permissions={[Permission.MANAGE_DEPARTMENTS]}>
                          <Button
                            className="w-full h-11 bg-white border-gray-200 text-gray-700 font-bold hover:bg-gray-50 shadow-sm"
                            variant="outline"
                          >
                            Add Team
                          </Button>
                        </RoleGate>
                        <RoleGate permissions={[Permission.MANAGE_DEPARTMENTS]}>
                          <Button
                            className="w-full h-11 bg-gray-50 border-gray-200 text-gray-600 font-bold hover:bg-gray-100 shadow-sm"
                            variant="outline"
                            onClick={() => navigate(`/company-structure/edit-department/${selectedDept.id}`)}
                          >
                            Edit Department
                          </Button>
                        </RoleGate>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                        <Users className="w-6 h-6 text-gray-300" />
                      </div>
                      <p className="text-gray-400 text-sm font-medium">
                        Select a department to view details
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Headcount Analytics */}
              <Card>
                <CardHeader>
                  <CardTitle>Headcount Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {departments.map(dept => (
                      <div key={dept.id}>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="truncate mr-2">{dept.name}</span>
                          <span className="font-medium flex-shrink-0">{dept.headcount}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-indigo-600 h-2 rounded-full transition-all"
                            style={{ width: `${(dept.headcount / (totalEmployees || 1)) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                    {departments.length === 0 && (
                      <p className="text-sm text-gray-400 text-center py-4">No department data available</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
