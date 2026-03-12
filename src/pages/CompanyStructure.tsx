import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, ChevronRight, Plus, Users, Building2, Edit, Settings } from "lucide-react";
import { Card, CardHeader, CardContent, CardTitle } from "../components/ui/card.tsx";
import { Button } from "../components/ui/button.tsx";
import { CompanyOverviewCard } from "../components/CompanyOverviewCard.tsx";

interface Department {
  id: string;
  name: string;
  manager: string;
  headcount: number;
  teams: Team[];
  expanded?: boolean;
}

interface Team {
  id: string;
  name: string;
  lead: string;
  members: number;
  avatars: string[];
}

const mockDepartments: Department[] = [
  {
    id: "1",
    name: "Engineering",
    manager: "Sarah Johnson",
    headcount: 450,
    expanded: true,
    teams: [
      { id: "1-1", name: "Frontend Team", lead: "Mike Chen", members: 45, avatars: ["MC", "JD", "SW", "AL"] },
      { id: "1-2", name: "Backend Team", lead: "Emma Wilson", members: 52, avatars: ["EW", "RT", "KL", "PH"] },
      { id: "1-3", name: "DevOps Team", lead: "David Lee", members: 28, avatars: ["DL", "MS", "NP", "QR"] },
      { id: "1-4", name: "Mobile Team", lead: "Lisa Park", members: 35, avatars: ["LP", "BC", "DF", "GH"] },
    ],
  },
  {
    id: "2",
    name: "Sales",
    manager: "Robert Taylor",
    headcount: 320,
    teams: [
      { id: "2-1", name: "Enterprise Sales", lead: "John Davis", members: 85, avatars: ["JD", "KM", "LN", "MO"] },
      { id: "2-2", name: "SMB Sales", lead: "Amy Brown", members: 65, avatars: ["AB", "CD", "EF", "GH"] },
      { id: "2-3", name: "Sales Ops", lead: "Tom Wilson", members: 42, avatars: ["TW", "IJ", "KL", "MN"] },
    ],
  },
  {
    id: "3",
    name: "Marketing",
    manager: "Jennifer Martinez",
    headcount: 180,
    teams: [
      { id: "3-1", name: "Content Marketing", lead: "Alex Kim", members: 35, avatars: ["AK", "BL", "CM", "DN"] },
      { id: "3-2", name: "Product Marketing", lead: "Rachel Green", members: 28, avatars: ["RG", "ST", "UV", "WX"] },
      { id: "3-3", name: "Growth Marketing", lead: "Chris Anderson", members: 45, avatars: ["CA", "YZ", "AB", "CD"] },
    ],
  },
  {
    id: "4",
    name: "HR",
    manager: "Patricia Moore",
    headcount: 120,
    teams: [
      { id: "4-1", name: "Recruitment", lead: "Sam White", members: 35, avatars: ["SW", "EF", "GH", "IJ"] },
      { id: "4-2", name: "People Ops", lead: "Nina Patel", members: 28, avatars: ["NP", "KL", "MN", "OP"] },
      { id: "4-3", name: "L&D", lead: "Mark Thompson", members: 22, avatars: ["MT", "QR", "ST", "UV"] },
    ],
  },
];

export function CompanyStructure() {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState(mockDepartments);
  const [selectedDept, setSelectedDept] = useState<Department | null>(mockDepartments[0]);
  const [companyName, setCompanyName] = useState("TechCorp Inc.");
  const [companyDetails, setCompanyDetails] = useState<any>(null);

  useEffect(() => {
    // Load company details from localStorage
    const savedData = localStorage.getItem("companyData");
    if (savedData) {
      const data = JSON.parse(savedData);
      setCompanyDetails(data);
      setCompanyName(data.legalEntityName || "TechCorp Inc.");
    }
  }, []);

  const toggleDepartment = (deptId: string) => {
    setDepartments(departments.map(dept =>
      dept.id === deptId ? { ...dept, expanded: !dept.expanded } : dept
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Company Structure</h1>
          <p className="text-gray-500 mt-1">Manage organizational hierarchy and departments</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2" onClick={() => navigate("/company-structure/settings")}>
            <Settings className="w-4 h-4" />
            Company Settings
          </Button>
          <Button className="gap-2" onClick={() => navigate("/company-structure/add-department")}>
            <Plus className="w-4 h-4" />
            Add Department
          </Button>
        </div>
      </div>

      {!companyDetails && (
        <Card className="border-indigo-200 bg-indigo-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Building2 className="w-6 h-6 text-indigo-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-indigo-900 mb-1">
                  Complete Your Company Structure Setup
                </h3>
                <p className="text-sm text-indigo-700 mb-3">
                  Configure legal entity details, organizational structure, office locations, and HR/payroll settings to establish the foundation for your HRIS system.
                </p>
                <Button 
                  size="sm" 
                  onClick={() => navigate("/company-structure/settings")}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  Configure Company Settings
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {companyDetails && (
        <CompanyOverviewCard companyData={companyDetails} totalEmployees={1247} />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Organization Hierarchy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2 p-3 bg-indigo-50 rounded-lg border-2 border-indigo-200">
                  <Building2 className="w-5 h-5 text-indigo-600" />
                  <div className="flex-1">
                    <span className="font-semibold text-indigo-900">{companyName}</span>
                    {companyDetails && (
                      <div className="flex items-center gap-3 mt-1 text-xs text-indigo-600">
                        {companyDetails.companyCode && (
                          <span>Code: {companyDetails.companyCode}</span>
                        )}
                        {companyDetails.companyType && (
                          <span>• {companyDetails.companyType}</span>
                        )}
                        {companyDetails.currency && (
                          <span>• {companyDetails.currency}</span>
                        )}
                      </div>
                    )}
                  </div>
                  <span className="text-sm text-indigo-600">1,247 employees</span>
                </div>

                <div className="ml-8 space-y-2">
                  {departments.map((dept) => (
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
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {companyDetails && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Company Details</CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate("/company-structure/settings")}
                >
                  <Edit className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-gray-500">Legal Entity</label>
                    <p className="font-medium text-sm mt-1">{companyDetails.legalEntityName}</p>
                  </div>
                  
                  {companyDetails.companyCode && (
                    <div>
                      <label className="text-xs text-gray-500">Company Code</label>
                      <p className="font-medium text-sm mt-1">{companyDetails.companyCode}</p>
                    </div>
                  )}

                  {companyDetails.companyType && (
                    <div>
                      <label className="text-xs text-gray-500">Company Type</label>
                      <p className="font-medium text-sm mt-1">{companyDetails.companyType}</p>
                    </div>
                  )}

                  {companyDetails.currency && (
                    <div>
                      <label className="text-xs text-gray-500">Currency</label>
                      <p className="font-medium text-sm mt-1">{companyDetails.currency}</p>
                    </div>
                  )}

                  {companyDetails.payFrequency && (
                    <div>
                      <label className="text-xs text-gray-500">Pay Frequency</label>
                      <p className="font-medium text-sm mt-1">{companyDetails.payFrequency}</p>
                    </div>
                  )}

                  {companyDetails.locations && companyDetails.locations.length > 0 && (
                    <div>
                      <label className="text-xs text-gray-500">Office Locations</label>
                      <div className="mt-2 space-y-1">
                        {companyDetails.locations.map((loc: any) => (
                          <div key={loc.id} className="text-sm">
                            <p className="font-medium">{loc.locationName || loc.locationCode}</p>
                            {loc.address.city && (
                              <p className="text-xs text-gray-500">
                                {loc.address.city}
                                {loc.address.country && `, ${loc.address.country}`}
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
          )}

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Department Details</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => selectedDept && navigate(`/company-structure/edit-department/${selectedDept.id}`)}>
                <Edit className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent>
              {selectedDept ? (
                <div className="space-y-6">
                  <div>
                    <label className="text-sm text-gray-500">Department Name</label>
                    <p className="font-medium mt-1">{selectedDept.name}</p>
                  </div>

                  <div>
                    <label className="text-sm text-gray-500">Department Manager</label>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                        {selectedDept.manager.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-medium">{selectedDept.manager}</p>
                        <p className="text-xs text-gray-500">Manager</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-gray-500">Total Headcount</label>
                    <p className="text-2xl font-semibold mt-1">{selectedDept.headcount}</p>
                  </div>

                  <div>
                    <label className="text-sm text-gray-500">Teams</label>
                    <div className="mt-2 space-y-2">
                      {selectedDept.teams.map((team) => (
                        <div key={team.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                          <span className="text-sm font-medium">{team.name}</span>
                          <span className="text-sm text-gray-500">{team.members}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 space-y-2">
                    <Button className="w-full" variant="outline">
                      Add Team
                    </Button>
                    <Button 
                      className="w-full" 
                      variant="outline"
                      onClick={() => navigate(`/company-structure/edit-department/${selectedDept.id}`)}
                    >
                      Edit Department
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-sm">Select a department to view details</p>
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
                        style={{ width: `${(dept.headcount / 1247) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
