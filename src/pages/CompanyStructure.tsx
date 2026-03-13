import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, ChevronRight, Plus, Users, Building2, Edit, Settings, Loader2, MapPin } from "lucide-react";
import { Card, CardHeader, CardContent, CardTitle } from "../components/ui/card.tsx";
import { Button } from "../components/ui/button.tsx";
import { CompanyOverviewCard } from "../components/CompanyOverviewCard.tsx";
import { getDepartments } from "../api/departments.ts";
import { getOrganizations } from "../api/organizations.ts";
import { getEmployees } from "../api/employees.ts";

interface TeamNode {
  id: string | number;
  name: string;
  lead: string;
  members: number;
  avatars: string[];
}

interface DepartmentNode {
  id: string | number;
  name: string;
  manager: string;
  headcount: number;
  teams: TeamNode[];
  branch_id?: number | string;
  expanded?: boolean;
}

const MOCK_COMPANY = {
  id: "mock-1",
  legalEntityName: "TechCorp Inc.",
  companyCode: "TC001",
  companyType: "Private Limited",
  currency: "USD",
  payFrequency: "Monthly",
  locations: [
    {
      id: "loc-1",
      locationName: "HQ - San Francisco",
      locationCode: "SF-01",
      address: { city: "San Francisco", country: "USA" }
    }
  ]
};

const MOCK_DEPTS: DepartmentNode[] = [
  {
    id: "1",
    name: "Engineering",
    manager: "Sarah Johnson",
    headcount: 450,
    branch_id: "loc-1",
    expanded: true,
    teams: [
      { id: "1-1", name: "Frontend Team", lead: "Mike Chen", members: 45, avatars: ["MC", "JD", "SW", "AL"] },
      { id: "1-2", name: "Backend Team", lead: "Emma Wilson", members: 52, avatars: ["EW", "RT", "KL", "PH"] },
    ],
  },
  {
    id: "2",
    name: "Sales",
    manager: "Robert Taylor",
    headcount: 320,
    branch_id: "loc-1",
    teams: [
      { id: "2-1", name: "Enterprise Sales", lead: "John Davis", members: 85, avatars: ["JD", "KM"] },
    ],
  }
];

export function CompanyStructure() {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState<DepartmentNode[]>([]);
  const [selectedDept, setSelectedDept] = useState<DepartmentNode | null>(null);
  const [companyName, setCompanyName] = useState("TechCorp Inc.");
  const [companyDetails, setCompanyDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [isSetupView, setIsSetupView] = useState(false);
  const [expandedBranches, setExpandedBranches] = useState<Record<string | number, boolean>>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [deptData, orgs, employees] = await Promise.all([
          getDepartments(),
          getOrganizations(),
          getEmployees(),
        ]);

        // Map departments
        const mappedDepts = deptData.map((d: any) => ({
          id: d.id,
          name: d.department_name,
          manager: d.manager?.username || (d.manager_id ? `Manager #${d.manager_id}` : "Unassigned"),
          headcount: d.headcount || 0,
          teams: (d.teams || []).map((t: any) => ({
            id: t.id,
            name: t.team_name || t.name,
            lead: t.team_lead?.username || t.team_lead || t.lead || "Unassigned",
            members: Array.isArray(t.members) ? t.members.length : (t.member_count || t.members || 0),
            avatars: t.avatars || []
          })),
          branch_id: d.branch_id,
          expanded: false
        }));
        setDepartments(mappedDepts);
        if (mappedDepts.length > 0) {
          setSelectedDept(mappedDepts[0]);
        }

        // Map organization
        const organization = Array.isArray(orgs) ? orgs[0] : orgs;
        
        if (organization && organization.id) {
          const mainOrg = organization;
          const mappedOrg = {
            id: mainOrg.id,
            legalEntityName: mainOrg.entity_name,
            companyCode: mainOrg.company_code,
            companyType: mainOrg.company_type,
            currency: mainOrg.currency,
            payFrequency: mainOrg.pay_frequency,
            jurisdiction: mainOrg.jurisdiction,
            fiscalYearEnd: mainOrg.fiscal_year_end,
            pan: mainOrg.pan,
            tin: mainOrg.tin,
            ein: mainOrg.ein,
            siret: mainOrg.siret,
            otherTaxId: mainOrg.other_tax_id,
            businessUnit: mainOrg.business_unit,
            costCenter: mainOrg.cost_center,
            payrollStatutoryUnit: mainOrg.payroll_statutory_unit,
            legalEmployer: mainOrg.legal_employer,
            legislativeDataGroup: mainOrg.legislative_data_group,
            locations: (mainOrg.branches || []).map((b: any) => ({
              id: b.id,
              locationName: b.branch_name,
              locationCode: b.branch_code,
              address: {
                city: b.city,
                country: b.country,
                street: b.address,
                state: b.state,
                zipCode: b.zip
              }
            }))
          };
          setCompanyDetails(mappedOrg);
          setCompanyName(mainOrg.entity_name || "TechCorp Inc.");
          localStorage.setItem("companyData", JSON.stringify(mappedOrg));
          setIsSetupView(false);
        } else {
          setCompanyDetails(null);
          setIsSetupView(true);
        }

        setTotalEmployees(employees.length || 0);

      } catch (error) {
        console.error("Failed to fetch company data", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const toggleDepartment = (deptId: string | number) => {
    setDepartments(departments.map(dept =>
      dept.id === deptId ? { ...dept, expanded: !dept.expanded } : dept
    ));
  };

  const toggleBranch = (branchId: string | number) => {
    setExpandedBranches(prev => ({
      ...prev,
      [branchId]: !prev[branchId]
    }));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Company Structure</h1>
          <p className="text-gray-500 mt-1 text-sm font-medium">Manage organizational hierarchy and departments</p>
        </div>
        <div className="flex items-center gap-4">
          {/* View Switcher Toggle */}
          <div className="flex items-center p-1 bg-gray-100 rounded-lg border border-gray-200 shadow-sm">
            <button
              onClick={() => setIsSetupView(true)}
              className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all duration-200 ${
                isSetupView 
                  ? "bg-white text-indigo-600 shadow-sm ring-1 ring-gray-200" 
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
              }`}
            >
              Setup View
            </button>
            <button
              onClick={() => setIsSetupView(false)}
              className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all duration-200 ${
                !isSetupView 
                  ? "bg-white text-indigo-600 shadow-sm ring-1 ring-gray-200" 
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
              }`}
            >
              Details View
            </button>
          </div>

          {(companyDetails || !isSetupView) && (
            <div className="flex items-center gap-3">
              <Button variant="outline" className="h-10 bg-white border-gray-200 hover:bg-gray-50 text-gray-700 font-medium" onClick={() => navigate("/company-structure/settings")}>
                <Settings className="w-4 h-4 mr-2" />
                Company Settings
              </Button>
              <Button className="h-10 bg-[#4F46E5] hover:bg-[#4338CA] text-white font-medium shadow-sm" onClick={() => navigate("/company-structure/add-department")}>
                <Plus className="w-4 h-4 mr-2" />
                Add Department
              </Button>
            </div>
          )}
        </div>
      </div>

      {isSetupView ? (
        <Card className="border-dashed border-gray-300 shadow-sm mt-8">
          <CardContent className="flex flex-col items-center justify-center text-center py-24">
            <div className="w-20 h-20 bg-[#EFF4FF] rounded-full flex items-center justify-center mb-6">
              <Building2 className="w-10 h-10 text-[#3B82F6]" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">No Company Structure Defined</h2>
            <p className="text-gray-500 max-w-lg mb-8 text-sm">
              Set up your company structure with legal, organizational, geographical, and HR/payroll information to get started.
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
          <CompanyOverviewCard 
            companyData={companyDetails || MOCK_COMPANY} 
            totalEmployees={totalEmployees} 
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
          <Card className="shadow-sm border-gray-200">
            <CardHeader className="pb-3 px-6">
              <CardTitle className="text-lg font-bold">Organization Hierarchy</CardTitle>
            </CardHeader>
            <CardContent className="px-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-[#EEF2FF] rounded-xl border border-[#C7D2FE]">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                    <Building2 className="w-6 h-6 text-[#4F46E5]" />
                  </div>
                  <div className="flex-1">
                    <span className="font-bold text-[#1E1B4B] text-lg">{companyName || (companyDetails?.legalEntityName || MOCK_COMPANY.legalEntityName)}</span>
                    <div className="flex items-center gap-3 mt-0.5 text-xs font-medium text-[#4F46E5]">
                      <span>Code: {(companyDetails?.companyCode || MOCK_COMPANY.companyCode)}</span>
                      <span>• {(companyDetails?.companyType || MOCK_COMPANY.companyType)}</span>
                      <span>• {(companyDetails?.currency || MOCK_COMPANY.currency)}</span>
                    </div>
                  </div>
                  <span className="text-sm text-[#4F46E5] font-bold">{totalEmployees.toLocaleString()} employees</span>
                </div>

                <div className="ml-8 space-y-3">
                  {(companyDetails?.locations || MOCK_COMPANY.locations).map((branch: any) => {
                   const branchDepts = departments.filter(d => d.branch_id === branch.id);
                    const isExpanded = expandedBranches[branch.id];

                    return (
                      <div key={branch.id} className="space-y-2">
                        <div
                          className="flex items-center gap-2 p-3 bg-gray-50/50 border border-gray-100 rounded-lg hover:border-indigo-200 cursor-pointer transition-colors"
                          onClick={() => toggleBranch(branch.id)}
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleBranch(branch.id);
                            }}
                            className="p-1 hover:bg-gray-200 rounded text-gray-400"
                          >
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </button>
                          <MapPin className="w-5 h-5 text-indigo-500" />
                          <span className="font-bold text-gray-700 text-sm">{branch.locationName || branch.locationCode}</span>
                          <span className="text-xs text-gray-400 font-medium ml-1">Branch</span>
                          <span className="ml-auto text-xs font-bold text-gray-400">{branchDepts.length} departments</span>
                        </div>

                        {isExpanded && (
                          <div className="ml-6 space-y-3">
                            {branchDepts.length > 0 ? branchDepts.map((dept) => (
                              <div key={dept.id} className="space-y-2">
                                <div
                                  className="flex items-center gap-2 p-3 bg-white border border-gray-200 rounded-lg hover:border-indigo-300 cursor-pointer transition-colors"
                                  onClick={() => {
                                    toggleDepartment(dept.id);
                                    setSelectedDept(dept);
                                  }}
                                >
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleDepartment(dept.id);
                                    }}
                                    className="p-1 hover:bg-gray-100 rounded"
                                  >
                                    {dept.expanded ? (
                                      <ChevronDown className="w-4 h-4" />
                                    ) : (
                                      <ChevronRight className="w-4 h-4" />
                                    )}
                                  </button>
                                  <Users className="w-5 h-5 text-gray-600" />
                                  <span className="font-medium">{dept.name}</span>
                                  <span className="text-sm text-gray-500">• {dept.manager}</span>
                                  <span className="ml-auto text-sm text-gray-600">{dept.headcount} people</span>
                                </div>

                                {dept.expanded && (
                                  <div className="ml-8 space-y-2">
                                    {dept.teams.map((team) => (
                                      <div
                                        key={team.id}
                                        className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                                      >
                                        <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                                          <Users className="w-4 h-4 text-indigo-600" />
                                        </div>
                                        <div className="flex-1">
                                          <p className="font-medium text-sm">{team.name}</p>
                                          <p className="text-xs text-gray-500">Lead: {team.lead}</p>
                                        </div>
                                        <div className="flex -space-x-2">
                                          {team.avatars.map((avatar, idx) => (
                                            <div
                                              key={idx}
                                              className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-xs text-white font-medium border-2 border-white"
                                            >
                                              {avatar}
                                            </div>
                                          ))}
                                        </div>
                                        <span className="text-sm text-gray-600">{team.members}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )) : (
                              <p className="text-xs text-gray-400 italic py-2">No departments assigned to this branch</p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Unassigned Departments Section */}
                  {(() => {
                    const unassignedDepts = departments.filter(d => !d.branch_id);
                    if (unassignedDepts.length === 0) return null;

                    return (
                      <div className="space-y-2">
                        <div
                          className="flex items-center gap-2 p-3 bg-red-50/30 border border-red-100 rounded-lg hover:border-red-200 cursor-pointer transition-colors"
                          onClick={() => toggleBranch("unassigned")}
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleBranch("unassigned");
                            }}
                            className="p-1 hover:bg-red-100 rounded text-red-300"
                          >
                            {expandedBranches["unassigned"] ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </button>
                          <Users className="w-5 h-5 text-red-500" />
                          <span className="font-bold text-gray-700 text-sm">Unassigned Departments</span>
                          <span className="ml-auto text-xs font-bold text-red-400">{unassignedDepts.length} departments</span>
                        </div>

                        {expandedBranches["unassigned"] && (
                          <div className="ml-6 space-y-3">
                            {unassignedDepts.map((dept) => (
                              <div key={dept.id} className="space-y-2">
                                <div
                                  className="flex items-center gap-2 p-3 bg-white border border-gray-200 rounded-lg hover:border-indigo-300 cursor-pointer transition-colors"
                                  onClick={() => {
                                    toggleDepartment(dept.id);
                                    setSelectedDept(dept);
                                  }}
                                >
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleDepartment(dept.id);
                                    }}
                                    className="p-1 hover:bg-gray-100 rounded"
                                  >
                                    {dept.expanded ? (
                                      <ChevronDown className="w-4 h-4" />
                                    ) : (
                                      <ChevronRight className="w-4 h-4" />
                                    )}
                                  </button>
                                  <Users className="w-5 h-5 text-gray-600" />
                                  <span className="font-medium">{dept.name}</span>
                                  <span className="text-sm text-gray-500">• {dept.manager}</span>
                                  <span className="ml-auto text-sm text-gray-600">{dept.headcount} people</span>
                                </div>

                                {dept.expanded && (
                                  <div className="ml-8 space-y-2">
                                    {dept.teams.map((team) => (
                                      <div
                                        key={team.id}
                                        className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                                      >
                                        <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                                          <Users className="w-4 h-4 text-indigo-600" />
                                        </div>
                                        <div className="flex-1">
                                          <p className="font-medium text-sm">{team.name}</p>
                                          <p className="text-xs text-gray-500">Lead: {team.lead}</p>
                                        </div>
                                        <div className="flex -space-x-2">
                                          {team.avatars.length > 0 ? team.avatars.map((avatar, idx) => (
                                            <div
                                              key={idx}
                                              className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-xs text-white font-medium border-2 border-white"
                                            >
                                              {avatar}
                                            </div>
                                          )) : (
                                            <div className="w-8 h-8 bg-gray-100 rounded-full border-2 border-white flex items-center justify-center">
                                              <Users className="w-3 h-3 text-gray-400" />
                                            </div>
                                          )}
                                        </div>
                                        <span className="text-sm text-gray-600">{team.members}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
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
                <div>
                  <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Legal Entity</label>
                  <p className="font-semibold text-gray-900 mt-1">{(companyDetails?.legalEntityName || MOCK_COMPANY.legalEntityName)}</p>
                </div>
                
                <div>
                  <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Company Code</label>
                  <p className="font-semibold text-gray-900 mt-1">{(companyDetails?.companyCode || MOCK_COMPANY.companyCode)}</p>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Company Type</label>
                  <p className="font-semibold text-gray-900 mt-1">{(companyDetails?.companyType || MOCK_COMPANY.companyType)}</p>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Currency</label>
                  <p className="font-semibold text-gray-900 mt-1">{(companyDetails?.currency || MOCK_COMPANY.currency)}</p>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Pay Frequency</label>
                  <p className="font-semibold text-gray-900 mt-1">{(companyDetails?.payFrequency || MOCK_COMPANY.payFrequency)}</p>
                </div>

                {companyDetails?.businessUnit && (
                  <div>
                    <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Business Units</label>
                    <p className="font-semibold text-gray-900 mt-1">{companyDetails.businessUnit}</p>
                  </div>
                )}

                {companyDetails?.costCenter && (
                  <div>
                    <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Cost Centers</label>
                    <p className="font-semibold text-gray-900 mt-1">{companyDetails.costCenter}</p>
                  </div>
                )}

                {companyDetails?.payrollStatutoryUnit && (
                  <div>
                    <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Payroll Statutory Unit</label>
                    <p className="font-semibold text-gray-900 mt-1">{companyDetails.payrollStatutoryUnit}</p>
                  </div>
                )}

                {companyDetails?.legalEmployer && (
                  <div>
                    <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Legal Employer</label>
                    <p className="font-semibold text-gray-900 mt-1">{companyDetails.legalEmployer}</p>
                  </div>
                )}

                {companyDetails?.legislativeDataGroup && (
                  <div>
                    <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Legislative Data Group</label>
                    <p className="font-semibold text-gray-900 mt-1">{companyDetails.legislativeDataGroup}</p>
                  </div>
                )}

                {companyDetails?.locations && companyDetails.locations.length > 0 && (
                    <div>
                      <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Office Locations</label>
                      <div className="mt-2 space-y-1">
                        {companyDetails.locations.map((loc: any) => (
                          <div key={loc.id} className="text-sm">
                            <p className="font-medium text-gray-900">{loc.locationName || loc.locationCode}</p>
                            {loc.address.city && (
                              <p className="text-xs text-gray-500">
                                {loc.address.city}, {loc.address.country}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Department Details</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => selectedDept && navigate(`/company-structure/edit-department/${selectedDept.id}`)}>
                <Edit className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="px-6 pb-6 pt-0">
              {(selectedDept || (!isSetupView && MOCK_DEPTS[0])) ? (
                (() => {
                  const dept = selectedDept || MOCK_DEPTS[0];
                  return (
                    <div className="space-y-6">
                      <div>
                        <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Department Name</label>
                        <p className="font-semibold text-gray-900 mt-1">{dept.name}</p>
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Department Manager</label>
                        <div className="flex items-center gap-3 mt-2">
                          <div className="w-10 h-10 bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] rounded-full flex items-center justify-center text-white font-bold shadow-sm">
                            {typeof dept.manager === 'string' && dept.manager.trim() !== '' 
                              ? dept.manager.split(' ').map(n => n[0]).join('').toUpperCase() 
                              : 'UN'}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{dept.manager}</p>
                            <p className="text-xs text-gray-400 font-medium whitespace-nowrap">Manager</p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Total Headcount</label>
                          <p className="text-2xl font-bold text-[#1E1B4B] mt-1">{dept.headcount}</p>
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Active Teams</label>
                        <div className="mt-3 space-y-2">
                          {dept.teams.map((team) => (
                            <div key={team.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors">
                              <span className="text-sm font-semibold text-gray-700">{team.name}</span>
                              <div className="bg-white px-2.5 py-1 rounded-lg border border-gray-200 shadow-sm">
                                <span className="text-xs font-bold text-[#4F46E5]">{team.members}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-4 space-y-3">
                        <Button className="w-full h-11 bg-white border-gray-200 text-gray-700 font-bold hover:bg-gray-50 shadow-sm" variant="outline">
                          Add Team
                        </Button>
                        <Button 
                          className="w-full h-11 bg-gray-50 border-gray-200 text-gray-600 font-bold hover:bg-gray-100 shadow-sm" 
                          variant="outline"
                          onClick={() => navigate(`/company-structure/edit-department/${dept.id}`)}
                        >
                          Edit Department
                        </Button>
                      </div>
                    </div>
                  );
                })()
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                    <Users className="w-6 h-6 text-gray-300" />
                  </div>
                  <p className="text-gray-400 text-sm font-medium">Select a department to view details</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Headcount Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {departments.map((dept) => (
                  <div key={dept.id}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span>{dept.name}</span>
                      <span className="font-medium">{dept.headcount}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-indigo-600 h-2 rounded-full"
                        style={{ width: `${(dept.headcount / (totalEmployees || 1)) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
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
