import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Building2, Save, MapPin, Briefcase, Calendar, ChevronRight } from "lucide-react";
import { Card, CardHeader, CardContent, CardTitle } from "../components/ui/card.tsx";
import { Button } from "../components/ui/button.tsx";
import { toast } from "sonner";

interface CompanyData {
  // Legal Entity & Tax Data
  legalEntityName: string;
  companyCode: string;
  taxRegistrationNumbers: {
    pan?: string;
    ein?: string;
    siret?: string;
    other?: string;
  };
  legalAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  jurisdiction: string;
  currency: string;
  fiscalYearEnd: string;
  companyType: string;

  // Organizational Structure
  departments: string[];
  businessUnits: string[];
  costCenters: string[];
  jobArchitecture: {
    enabled: boolean;
    levels: string[];
  };

  // Geographical/Location Structure
  locations: Array<{
    id: string;
    locationCode: string;
    locationName: string;
    address: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
    timeZone: string;
    taxLocation: string;
  }>;

  // HR & Payroll Structure
  payrollStatutoryUnit: string;
  legalEmployer: string;
  legislativeDataGroup: string;
  payFrequency: string;
  workingCalendar: {
    standardHours: number;
    workingDays: string[];
    publicHolidays: string[];
  };
}

const initialCompanyData: CompanyData = {
  legalEntityName: "TechCorp Inc.",
  companyCode: "TC001",
  taxRegistrationNumbers: {
    pan: "",
    ein: "",
    siret: "",
    other: "",
  },
  legalAddress: {
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
  },
  jurisdiction: "",
  currency: "USD",
  fiscalYearEnd: "",
  companyType: "Private Limited",
  departments: [],
  businessUnits: [],
  costCenters: [],
  jobArchitecture: {
    enabled: false,
    levels: [],
  },
  locations: [],
  payrollStatutoryUnit: "",
  legalEmployer: "",
  legislativeDataGroup: "",
  payFrequency: "Monthly",
  workingCalendar: {
    standardHours: 40,
    workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    publicHolidays: [],
  },
};

export function CompanySettings() {
  const navigate = useNavigate();
  const [companyData, setCompanyData] = useState<CompanyData>(initialCompanyData);
  const [activeTab, setActiveTab] = useState<"legal" | "organizational" | "geographical" | "hrPayroll">("legal");
  const [isSaving, setIsSaving] = useState(false);

  // Calculate completion percentage
  const calculateCompletion = () => {
    let completed = 0;
    let total = 10; // Total key fields

    // Legal fields (4)
    if (companyData.legalEntityName) completed++;
    if (companyData.companyCode) completed++;
    if (companyData.companyType) completed++;
    if (companyData.currency) completed++;

    // Organizational fields (1)
    if (companyData.businessUnits.length > 0 || companyData.costCenters.length > 0) completed++;

    // Geographical fields (1)
    if (companyData.locations.length > 0) completed++;

    // HR/Payroll fields (4)
    if (companyData.payFrequency) completed++;
    if (companyData.workingCalendar.standardHours > 0) completed++;
    if (companyData.workingCalendar.workingDays.length > 0) completed++;
    if (companyData.payrollStatutoryUnit || companyData.legalEmployer) completed++;

    return Math.round((completed / total) * 100);
  };

  const completionPercentage = calculateCompletion();

  useEffect(() => {
    // Load saved company data from localStorage
    const savedData = localStorage.getItem("companyData");
    if (savedData) {
      setCompanyData(JSON.parse(savedData));
    }
  }, []);

  const handleSave = () => {
    // Validate required fields
    if (!companyData.legalEntityName || !companyData.companyCode) {
      toast.error("Required fields missing", {
        description: "Please fill in Legal Entity Name and Company Code.",
      });
      setActiveTab("legal");
      return;
    }

    setIsSaving(true);
    // Save to localStorage
    localStorage.setItem("companyData", JSON.stringify(companyData));
    
    setTimeout(() => {
      setIsSaving(false);
      toast.success("Company settings saved successfully!", {
        description: "Your company structure configuration has been updated.",
      });
      setTimeout(() => {
        navigate("/company-structure");
      }, 500);
    }, 500);
  };

  const updateField = (section: keyof CompanyData, field: string, value: any) => {
    setCompanyData((prev) => ({
      ...prev,
      [section]: typeof prev[section] === "object" && !Array.isArray(prev[section])
        ? { ...(prev[section] as any), [field]: value }
        : value,
    }));
  };

  const addLocation = () => {
    const newLocation = {
      id: Date.now().toString(),
      locationCode: "",
      locationName: "",
      address: {
        street: "",
        city: "",
        state: "",
        zipCode: "",
        country: "",
      },
      timeZone: "",
      taxLocation: "",
    };
    setCompanyData((prev) => ({
      ...prev,
      locations: [...prev.locations, newLocation],
    }));
  };

  const updateLocation = (id: string, field: string, value: any) => {
    setCompanyData((prev) => ({
      ...prev,
      locations: prev.locations.map((loc) =>
        loc.id === id ? { ...loc, [field]: value } : loc
      ),
    }));
  };

  const removeLocation = (id: string) => {
    setCompanyData((prev) => ({
      ...prev,
      locations: prev.locations.filter((loc) => loc.id !== id),
    }));
  };

  const tabs = [
    { id: "legal", label: "Legal Entity & Tax", icon: Building2 },
    { id: "organizational", label: "Organizational Structure", icon: Briefcase },
    { id: "geographical", label: "Geographical/Location", icon: MapPin },
    { id: "hrPayroll", label: "HR & Payroll", icon: Calendar },
  ];

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <button
          onClick={() => navigate("/company-structure")}
          className="hover:text-indigo-600 transition-colors"
        >
          Company Structure
        </button>
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-900 font-medium">Company Settings</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/company-structure")}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-semibold text-gray-900">Company Structure Settings</h1>
              {completionPercentage === 100 && (
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                  Complete
                </span>
              )}
            </div>
            <p className="text-gray-500 mt-1">
              Configure legal entity, organizational structure, and payroll settings
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {/* Completion Progress */}
          <div className="flex items-center gap-2">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-700">{completionPercentage}% Complete</p>
              <p className="text-xs text-gray-500">Configuration Progress</p>
            </div>
            <div className="w-16 h-16">
              <svg className="transform -rotate-90" viewBox="0 0 36 36">
                <circle
                  cx="18"
                  cy="18"
                  r="16"
                  fill="none"
                  className="stroke-gray-200"
                  strokeWidth="3"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="16"
                  fill="none"
                  className="stroke-indigo-600"
                  strokeWidth="3"
                  strokeDasharray={`${completionPercentage}, 100`}
                  strokeLinecap="round"
                />
                <text
                  x="18"
                  y="18"
                  className="fill-indigo-600 text-xs font-semibold"
                  textAnchor="middle"
                  dy="0.3em"
                  transform="rotate(90 18 18)"
                >
                  {completionPercentage}%
                </text>
              </svg>
            </div>
          </div>
          <Button onClick={handleSave} disabled={isSaving} className="gap-2">
            <Save className="w-4 h-4" />
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {/* Legal Entity & Tax Data */}
        {activeTab === "legal" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Info Panel */}
            <div className="lg:col-span-2">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Building2 className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-blue-900 text-sm mb-1">
                      Legal Entity & Tax Information
                    </h4>
                    <p className="text-sm text-blue-700">
                      Define the legally registered entity, which is critical for taxation and statutory compliance. This information will be used across payroll, reporting, and compliance modules.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Legal Entity Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Legal Entity Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={companyData.legalEntityName}
                      onChange={(e) =>
                        setCompanyData({ ...companyData, legalEntityName: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                      placeholder="Enter legal entity name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Code/ID <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={companyData.companyCode}
                      onChange={(e) =>
                        setCompanyData({ ...companyData, companyCode: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                      placeholder="Enter company code"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={companyData.companyType}
                      onChange={(e) =>
                        setCompanyData({ ...companyData, companyType: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                    >
                      <option value="Private Limited">Private Limited</option>
                      <option value="Public Limited">Public Limited</option>
                      <option value="LLP">Limited Liability Partnership (LLP)</option>
                      <option value="Sole Proprietorship">Sole Proprietorship</option>
                      <option value="Partnership">Partnership</option>
                      <option value="Corporation">Corporation</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Jurisdiction
                    </label>
                    <input
                      type="text"
                      value={companyData.jurisdiction}
                      onChange={(e) =>
                        setCompanyData({ ...companyData, jurisdiction: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                      placeholder="e.g., Delaware, USA"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Currency <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={companyData.currency}
                      onChange={(e) =>
                        setCompanyData({ ...companyData, currency: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                    >
                      <option value="USD">USD - US Dollar</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="GBP">GBP - British Pound</option>
                      <option value="INR">INR - Indian Rupee</option>
                      <option value="AUD">AUD - Australian Dollar</option>
                      <option value="CAD">CAD - Canadian Dollar</option>
                      <option value="SGD">SGD - Singapore Dollar</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fiscal Year End
                    </label>
                    <input
                      type="date"
                      value={companyData.fiscalYearEnd}
                      onChange={(e) =>
                        setCompanyData({ ...companyData, fiscalYearEnd: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Tax Registration Numbers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      PAN (India)
                    </label>
                    <input
                      type="text"
                      value={companyData.taxRegistrationNumbers.pan}
                      onChange={(e) =>
                        updateField("taxRegistrationNumbers", "pan", e.target.value)
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                      placeholder="ABCDE1234F"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      EIN/TIN (US)
                    </label>
                    <input
                      type="text"
                      value={companyData.taxRegistrationNumbers.ein}
                      onChange={(e) =>
                        updateField("taxRegistrationNumbers", "ein", e.target.value)
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                      placeholder="12-3456789"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      SIRET (France)
                    </label>
                    <input
                      type="text"
                      value={companyData.taxRegistrationNumbers.siret}
                      onChange={(e) =>
                        updateField("taxRegistrationNumbers", "siret", e.target.value)
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                      placeholder="123 456 789 01234"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Other Tax ID
                    </label>
                    <input
                      type="text"
                      value={companyData.taxRegistrationNumbers.other}
                      onChange={(e) =>
                        updateField("taxRegistrationNumbers", "other", e.target.value)
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                      placeholder="Enter other tax registration number"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Legal Address</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Street Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={companyData.legalAddress.street}
                      onChange={(e) => updateField("legalAddress", "street", e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                      placeholder="Enter street address"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={companyData.legalAddress.city}
                        onChange={(e) => updateField("legalAddress", "city", e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                        placeholder="Enter city"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        State/Province <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={companyData.legalAddress.state}
                        onChange={(e) => updateField("legalAddress", "state", e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                        placeholder="Enter state/province"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Zip/Postal Code <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={companyData.legalAddress.zipCode}
                        onChange={(e) => updateField("legalAddress", "zipCode", e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                        placeholder="Enter zip/postal code"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Country <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={companyData.legalAddress.country}
                        onChange={(e) => updateField("legalAddress", "country", e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                        placeholder="Enter country"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Organizational Structure */}
        {activeTab === "organizational" && (
          <div className="grid grid-cols-1 gap-6">
            {/* Info Panel */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Briefcase className="w-5 h-5 text-purple-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-purple-900 text-sm mb-1">
                    Organizational Structure
                  </h4>
                  <p className="text-sm text-purple-700">
                    Define how your company is divided into functional units. Business units, cost centers, and job architecture help with financial tracking and reporting.
                  </p>
                </div>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Business Units & Divisions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Business Units
                    </label>
                    <textarea
                      value={companyData.businessUnits.join("\n")}
                      onChange={(e) =>
                        setCompanyData({
                          ...companyData,
                          businessUnits: e.target.value.split("\n").filter((v) => v.trim()),
                        })
                      }
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                      placeholder="Enter each business unit on a new line&#10;e.g., Product A&#10;Region B&#10;Service C"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Enter each business unit on a new line
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cost Centers</CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cost Center Codes
                  </label>
                  <textarea
                    value={companyData.costCenters.join("\n")}
                    onChange={(e) =>
                      setCompanyData({
                        ...companyData,
                        costCenters: e.target.value.split("\n").filter((v) => v.trim()),
                      })
                    }
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                    placeholder="Enter each cost center on a new line&#10;e.g., CC-100 - Engineering&#10;CC-200 - Sales&#10;CC-300 - Marketing"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Used for financial tracking and allocating employee costs
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Job Architecture</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="jobArchitecture"
                      checked={companyData.jobArchitecture.enabled}
                      onChange={(e) =>
                        setCompanyData({
                          ...companyData,
                          jobArchitecture: {
                            ...companyData.jobArchitecture,
                            enabled: e.target.checked,
                          },
                        })
                      }
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-600"
                    />
                    <label htmlFor="jobArchitecture" className="text-sm font-medium text-gray-700">
                      Enable Job Architecture (Job Levels & Codes)
                    </label>
                  </div>

                  {companyData.jobArchitecture.enabled && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Job Levels
                      </label>
                      <textarea
                        value={companyData.jobArchitecture.levels.join("\n")}
                        onChange={(e) =>
                          setCompanyData({
                            ...companyData,
                            jobArchitecture: {
                              ...companyData.jobArchitecture,
                              levels: e.target.value.split("\n").filter((v) => v.trim()),
                            },
                          })
                        }
                        rows={6}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                        placeholder="Enter each job level on a new line&#10;e.g., Executive&#10;Senior Manager&#10;Manager&#10;Senior Analyst&#10;Analyst&#10;Associate"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Define job levels from highest to lowest
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Geographical/Location Structure */}
        {activeTab === "geographical" && (
          <div className="space-y-6">
            {/* Info Panel */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-green-900 text-sm mb-1">
                    Geographical & Location Structure
                  </h4>
                  <p className="text-sm text-green-700">
                    Add physical or logical locations for your organization. This is crucial for regional compliance such as tax, labor laws, and time tracking.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Office Locations</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Add physical or logical locations for regional compliance
                </p>
              </div>
              <Button onClick={addLocation} size="sm">
                <MapPin className="w-4 h-4 mr-2" />
                Add Location
              </Button>
            </div>

            {companyData.locations.length === 0 ? (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center">
                    <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <h3 className="text-sm font-medium text-gray-900 mb-1">No locations added</h3>
                    <p className="text-sm text-gray-500 mb-4">
                      Add your first office location to get started
                    </p>
                    <Button onClick={addLocation} size="sm">
                      Add Location
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {companyData.locations.map((location) => (
                  <Card key={location.id}>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="text-base">
                        {location.locationName || "New Location"}
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeLocation(location.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Remove
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Location Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={location.locationName}
                            onChange={(e) =>
                              updateLocation(location.id, "locationName", e.target.value)
                            }
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                            placeholder="e.g., Headquarters, New York Office"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Location Code <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={location.locationCode}
                            onChange={(e) =>
                              updateLocation(location.id, "locationCode", e.target.value)
                            }
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                            placeholder="e.g., HQ-001, NYC-001"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Street Address
                          </label>
                          <input
                            type="text"
                            value={location.address.street}
                            onChange={(e) =>
                              updateLocation(location.id, "address", {
                                ...location.address,
                                street: e.target.value,
                              })
                            }
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                            placeholder="Enter street address"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            City
                          </label>
                          <input
                            type="text"
                            value={location.address.city}
                            onChange={(e) =>
                              updateLocation(location.id, "address", {
                                ...location.address,
                                city: e.target.value,
                              })
                            }
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                            placeholder="Enter city"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            State/Province
                          </label>
                          <input
                            type="text"
                            value={location.address.state}
                            onChange={(e) =>
                              updateLocation(location.id, "address", {
                                ...location.address,
                                state: e.target.value,
                              })
                            }
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                            placeholder="Enter state/province"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Zip/Postal Code
                          </label>
                          <input
                            type="text"
                            value={location.address.zipCode}
                            onChange={(e) =>
                              updateLocation(location.id, "address", {
                                ...location.address,
                                zipCode: e.target.value,
                              })
                            }
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                            placeholder="Enter zip/postal code"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Country
                          </label>
                          <input
                            type="text"
                            value={location.address.country}
                            onChange={(e) =>
                              updateLocation(location.id, "address", {
                                ...location.address,
                                country: e.target.value,
                              })
                            }
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                            placeholder="Enter country"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Time Zone
                          </label>
                          <select
                            value={location.timeZone}
                            onChange={(e) =>
                              updateLocation(location.id, "timeZone", e.target.value)
                            }
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                          >
                            <option value="">Select time zone</option>
                            <option value="America/New_York">Eastern Time (ET)</option>
                            <option value="America/Chicago">Central Time (CT)</option>
                            <option value="America/Denver">Mountain Time (MT)</option>
                            <option value="America/Los_Angeles">Pacific Time (PT)</option>
                            <option value="Europe/London">London (GMT)</option>
                            <option value="Europe/Paris">Paris (CET)</option>
                            <option value="Asia/Kolkata">India (IST)</option>
                            <option value="Asia/Singapore">Singapore (SGT)</option>
                            <option value="Asia/Tokyo">Tokyo (JST)</option>
                            <option value="Australia/Sydney">Sydney (AEDT)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tax Location/Establishment
                          </label>
                          <input
                            type="text"
                            value={location.taxLocation}
                            onChange={(e) =>
                              updateLocation(location.id, "taxLocation", e.target.value)
                            }
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                            placeholder="Specific taxing jurisdiction"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* HR & Payroll Structure */}
        {activeTab === "hrPayroll" && (
          <div className="grid grid-cols-1 gap-6">
            {/* Info Panel */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-orange-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-orange-900 text-sm mb-1">
                    HR & Payroll Structure
                  </h4>
                  <p className="text-sm text-orange-700">
                    Configure payroll and HR settings that connect employees to the legal entity for pay and reporting. Define working schedules and public holidays.
                  </p>
                </div>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Payroll Configuration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payroll Statutory Unit (PSU)
                    </label>
                    <input
                      type="text"
                      value={companyData.payrollStatutoryUnit}
                      onChange={(e) =>
                        setCompanyData({ ...companyData, payrollStatutoryUnit: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                      placeholder="Entity responsible for paying employees"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Entity that pays employees and submits tax/social security reports
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Legal Employer
                    </label>
                    <input
                      type="text"
                      value={companyData.legalEmployer}
                      onChange={(e) =>
                        setCompanyData({ ...companyData, legalEmployer: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                      placeholder="Entity that signs employment contracts"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Legislative Data Group (LDG)
                    </label>
                    <input
                      type="text"
                      value={companyData.legislativeDataGroup}
                      onChange={(e) =>
                        setCompanyData({ ...companyData, legislativeDataGroup: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                      placeholder="Payroll information grouping"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Contains currency, tax rules, and pension types
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pay Frequency <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={companyData.payFrequency}
                      onChange={(e) =>
                        setCompanyData({ ...companyData, payFrequency: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                    >
                      <option value="Weekly">Weekly</option>
                      <option value="Bi-weekly">Bi-weekly</option>
                      <option value="Semi-monthly">Semi-monthly</option>
                      <option value="Monthly">Monthly</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Working Calendar & Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Standard Working Hours per Week
                    </label>
                    <input
                      type="number"
                      value={companyData.workingCalendar.standardHours}
                      onChange={(e) =>
                        setCompanyData({
                          ...companyData,
                          workingCalendar: {
                            ...companyData.workingCalendar,
                            standardHours: parseInt(e.target.value),
                          },
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                      min="0"
                      max="168"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Working Days
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        "Monday",
                        "Tuesday",
                        "Wednesday",
                        "Thursday",
                        "Friday",
                        "Saturday",
                        "Sunday",
                      ].map((day) => (
                        <label key={day} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={companyData.workingCalendar.workingDays.includes(day)}
                            onChange={(e) => {
                              const days = e.target.checked
                                ? [...companyData.workingCalendar.workingDays, day]
                                : companyData.workingCalendar.workingDays.filter((d) => d !== day);
                              setCompanyData({
                                ...companyData,
                                workingCalendar: {
                                  ...companyData.workingCalendar,
                                  workingDays: days,
                                },
                              });
                            }}
                            className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-600"
                          />
                          <span className="text-sm text-gray-700">{day}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Public Holidays
                    </label>
                    <textarea
                      value={companyData.workingCalendar.publicHolidays.join("\n")}
                      onChange={(e) =>
                        setCompanyData({
                          ...companyData,
                          workingCalendar: {
                            ...companyData.workingCalendar,
                            publicHolidays: e.target.value.split("\n").filter((v) => v.trim()),
                          },
                        })
                      }
                      rows={6}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                      placeholder="Enter each holiday on a new line&#10;e.g., New Year's Day - Jan 1&#10;Independence Day - Jul 4&#10;Thanksgiving - Nov 23&#10;Christmas - Dec 25"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Enter each public holiday on a new line
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
        <Button variant="outline" onClick={() => navigate("/company-structure")}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={isSaving} className="gap-2">
          <Save className="w-4 h-4" />
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}

