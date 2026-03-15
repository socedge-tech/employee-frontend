import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Building2, Save, MapPin, Briefcase, Calendar, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "../components/ui/button.tsx";
import { toast } from "sonner";
import { getOrganizations, createOrganization, updateOrganization } from "../api/organizations.ts";
import { getDepartments } from "../api/departments.ts";
import { getEmployees } from "../api/employees.ts";
import { ProgressBar } from "../components/company/ProgressBar.tsx";
import { Permission } from "../types/rbac.ts";
import { CompanyStructureForm } from "../components/company/CompanyStructureForm.tsx";
import { usePermissions } from "../hooks/usePermissions";

interface CompanyData {
  // Legal Entity & Tax Data
  legalEntityName: string;
  companyCode: string;
  taxRegistrationNumber: string; // New field from column: tax_registration_number
  taxRegistrationNumbers: {
    pan?: string;
    tin?: string;
    sin?: string;
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
  divisions: string[];
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
    gst?: string;
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
  legalEntityName: "",
  companyCode: "",
  taxRegistrationNumber: "",
  taxRegistrationNumbers: {
    pan: "",
    tin: "",
    sin: "",
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
  companyType: "",
  departments: [],
  businessUnits: [],
  divisions: [],
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
  const [isLoading, setIsLoading] = useState(true);
  const [orgId, setOrgId] = useState<number | null>(null);
  const [departmentsCount, setDepartmentsCount] = useState<number>(0);
  const [employeesCount, setEmployeesCount] = useState<number>(0);
  
  const { can } = usePermissions();
  const isReadOnly = !can(Permission.EDIT_COMPANY_STRUCTURE);

  // Calculate completion percentage dynamically based on actual field values
  const completionPercentage = useMemo(() => {
    const requiredFields = [
      companyData.legalEntityName,
      companyData.companyCode,
      companyData.companyType,
      companyData.currency,
      companyData.legalAddress.street,
      companyData.legalAddress.city,
      companyData.legalAddress.state,
      companyData.legalAddress.zipCode,
      companyData.legalAddress.country,
      companyData.taxRegistrationNumber,
    ];

    const filledRequired = requiredFields.filter(val => typeof val === "string" && val.trim() !== "").length;

    const auxiliaryChecks = [
      { name: "Business Units", value: (companyData.businessUnits || []).some(bu => bu && bu.trim() !== "") },
      { name: "Divisions", value: (companyData.divisions || []).some(div => div && div.trim() !== "") },
      { name: "Cost Centers", value: (companyData.costCenters || []).some(cc => cc && cc.trim() !== "") },
      { name: "Departments", value: departmentsCount > 0 },
      { name: "Locations", value: (companyData.locations || []).length > 0 }
    ];

    const filledAuxiliary = auxiliaryChecks.filter(check => check.value).length;

    const totalPossible = requiredFields.length + auxiliaryChecks.length;
    const totalFilled = filledRequired + filledAuxiliary;

    return Math.round((totalFilled / totalPossible) * 100);
  }, [companyData, departmentsCount]);

  useEffect(() => {
    // Load saved company data from localStorage
    const savedData = localStorage.getItem("companyData");
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        // Map data from CompanyStructure format (singular/string) to CompanySettings format (plural/array)
        const mappedData = {
          ...initialCompanyData,
          ...parsed,
          businessUnits: parsed.businessUnits || (parsed.businessUnit ? [parsed.businessUnit] : []),
          costCenters: parsed.costCenters || (parsed.costCenter ? [parsed.costCenter] : []),
          locations: parsed.locations || [],
          workingCalendar: parsed.workingCalendar || initialCompanyData.workingCalendar,
          taxRegistrationNumbers: parsed.taxRegistrationNumbers || {
            pan: parsed.pan || "",
            tin: parsed.tin || "",
            sin: parsed.sin || "",
            ein: parsed.ein || "",
            siret: parsed.siret || "",
            other: parsed.otherTaxId || "",
          },
          legalAddress: parsed.legalAddress || {
            street: parsed.street || parsed.address || "",
            city: parsed.city || "",
            state: parsed.state || "",
            zipCode: parsed.zip || parsed.zipCode || "",
            country: parsed.country || "",
          }
        };
        setCompanyData(mappedData);
      } catch (e) {
        console.error("Failed to parse localStorage companyData", e);
      }
    }

    const loadOrg = async () => {
      try {
        const orgs = await getOrganizations();
        const organization = Array.isArray(orgs) ? orgs[0] : orgs;
        
        if (organization && organization.id) {
          const mainOrg = organization;
          setOrgId(mainOrg.id);
          setCompanyData({
            legalEntityName: mainOrg.legal_entity_name || mainOrg.entity_name || "",
            companyCode: mainOrg.company_code || "",
            taxRegistrationNumber: mainOrg.tax_registration_number || "",
            companyType: mainOrg.company_type || "",
            jurisdiction: mainOrg.jurisdiction || "",
            currency: mainOrg.currency || "USD",
            fiscalYearEnd: mainOrg.fiscal_year_end || "",
            taxRegistrationNumbers: {
              pan: mainOrg.pan || "",
              tin: mainOrg.tin || "",
              sin: mainOrg.sin || "",
              ein: mainOrg.ein || "",
              siret: mainOrg.siret || "",
              other: mainOrg.other_tax_id || "",
            },
            legalAddress: {
              street: mainOrg.legal_address || mainOrg.address || "",
              city: mainOrg.city || "",
              state: mainOrg.state || "",
              zipCode: mainOrg.zip || "",
              country: mainOrg.country || "",
            },
            departments: [],
            businessUnits: mainOrg.business_unit ? mainOrg.business_unit.split(",").map((i: string) => i.trim()) : [],
            divisions: mainOrg.division ? mainOrg.division.split(",").map((i: string) => i.trim()) : [],
            costCenters: mainOrg.cost_center ? mainOrg.cost_center.split(",").map((i: string) => i.trim()) : [],
            jobArchitecture: {
              enabled: mainOrg.job_architecture || false,
              levels: [],
            },
            locations: (mainOrg.branches || mainOrg.branch || []).map((branch: any) => ({
              id: (branch.id || Date.now()).toString(),
              locationCode: branch.location_code || branch.branch_code || "",
              locationName: branch.location_name || branch.branch_name || "",
              address: {
                street: branch.street_address || branch.address || "",
                city: branch.city || "",
                state: branch.state || "",
                zipCode: branch.zip_code || branch.zip || "",
                country: branch.country || "",
              },
              timeZone: branch.time_zone || "",
              taxLocation: branch.tax_location || "",
              gst: branch.gst || "",
            })),
            payrollStatutoryUnit: mainOrg.payroll_statutory_unit || "",
            legalEmployer: mainOrg.legal_employer || "",
            legislativeDataGroup: mainOrg.legislative_data_group || "",
            payFrequency: mainOrg.pay_frequency || "Monthly",
            workingCalendar: {
              standardHours: mainOrg.standard_working_hours_per_week || 40,
              workingDays: mainOrg.working_days || ["Mon", "Tue", "Wed", "Thu", "Fri"],
              publicHolidays: mainOrg.public_holidays || [],
            },
          });
        }

        try {
          const depts = await getDepartments();
          setDepartmentsCount(Array.isArray(depts) ? depts.length : 0);
        } catch (e) {
          console.error("Failed to load departments count", e);
        }

        try {
          const emps = await getEmployees();
          setEmployeesCount(Array.isArray(emps) ? emps.length : 0);
        } catch (e) {
          console.error("Failed to load employees count", e);
        }
      } catch (error) {
        console.error("Failed to load organization", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadOrg();
  }, []);

  const handleSave = async () => {
    // Validate required fields
    if (!companyData.legalEntityName || !companyData.companyCode) {
      toast.error("Required fields missing", {
        description: "Please fill in Legal Entity Name and Company Code.",
      });
      setActiveTab("legal");
      return;
    }

    // Dynamic Validation based on Country
    const ctry = companyData.legalAddress.country;
    if (ctry === "India") {
      const pan = companyData.taxRegistrationNumbers.pan || "";
      if (!pan || !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan)) {
        toast.error("Invalid PAN Format", { description: "Please enter a valid PAN (e.g., ABCDE1234F)." });
        setActiveTab("legal");
        return;
      }
    } else if (ctry === "USA") {
      const ein = companyData.taxRegistrationNumbers.ein || "";
      if (!ein || !/^\d{2}-\d{7}$/.test(ein)) {
        toast.error("Invalid EIN Format", { description: "Please enter a valid EIN (e.g., 12-3456789)." });
        setActiveTab("legal");
        return;
      }
    } else if (ctry === "France") {
      const siret = companyData.taxRegistrationNumbers.siret || "";
      if (!siret || !/^\d{14}$/.test(siret.replace(/\s/g, ""))) {
        toast.error("Invalid SIRET Format", { description: "Please enter a valid 14-digit SIRET number." });
        setActiveTab("legal");
        return;
      }
    }

    setIsSaving(true);
    // Save to localStorage
    localStorage.setItem("companyData", JSON.stringify(companyData));

    // Save to API
    const apiPayload = {
      entity_name: companyData.legalEntityName,
      legal_entity_name: companyData.legalEntityName,
      company_code: companyData.companyCode,
      company_type: companyData.companyType,
      tax_registration_number: companyData.taxRegistrationNumber,
      jurisdiction: companyData.jurisdiction,
      currency: companyData.currency,
      fiscal_year_end: companyData.fiscalYearEnd,
      pan: companyData.taxRegistrationNumbers.pan,
      tin: companyData.taxRegistrationNumbers.tin,
      sin: companyData.taxRegistrationNumbers.sin,
      ein: companyData.taxRegistrationNumbers.ein,
      siret: companyData.taxRegistrationNumbers.siret,
      other_tax_id: companyData.taxRegistrationNumbers.other,
      address: companyData.legalAddress.street,
      legal_address: companyData.legalAddress.street,
      city: companyData.legalAddress.city,
      state: companyData.legalAddress.state,
      country: companyData.legalAddress.country,
      zip: companyData.legalAddress.zipCode,
      business_unit: (companyData.businessUnits || []).filter(v => v && v.trim()).join(", "),
      division: (companyData.divisions || []).filter(v => v && v.trim()).join(", "),
      cost_center: (companyData.costCenters || []).filter(v => v && v.trim()).join(", "),
      job_architecture: companyData.jobArchitecture.enabled,
      payroll_statutory_unit: companyData.payrollStatutoryUnit,
      legal_employer: companyData.legalEmployer,
      legislative_data_group: companyData.legislativeDataGroup,
      pay_frequency: companyData.payFrequency,
      standard_working_hours_per_week: companyData.workingCalendar.standardHours,
      working_days: companyData.workingCalendar.workingDays,
      public_holidays: companyData.workingCalendar.publicHolidays.filter(v => v.trim()),
      branches: companyData.locations.map(loc => ({
        location_name: loc.locationName,
        location_code: loc.locationCode,
        street_address: loc.address.street,
        city: loc.address.city,
        state: loc.address.state,
        zip_code: loc.address.zipCode,
        country: loc.address.country,
        time_zone: loc.timeZone,
        tax_location: loc.taxLocation,
        gst: loc.gst
      })),
      branch: companyData.locations.map(loc => ({
        location_name: loc.locationName,
        location_code: loc.locationCode,
        street_address: loc.address.street,
        city: loc.address.city,
        state: loc.address.state,
        zip_code: loc.address.zipCode,
        country: loc.address.country,
        time_zone: loc.timeZone,
        tax_location: loc.taxLocation,
        gst: loc.gst
      }))
    };

    try {
      if (orgId) {
        await updateOrganization(orgId, apiPayload);
      } else {
        const newOrg = await createOrganization(apiPayload);
        setOrgId(newOrg.id);
      }
      
      toast.success("Company settings saved successfully!", {
        description: "Your company structure configuration has been updated.",
      });
      setTimeout(() => {
        navigate("/company-structure");
      }, 500);
    } catch (error: any) {
      toast.error("Failed to save to database", {
        description: error.message || "An unexpected error occurred",
      });
    } finally {
      setIsSaving(false);
    }
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
      gst: "",
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

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
          <Button variant="ghost" size="sm" onClick={() => navigate("/company-structure")} className="hover:-translate-y-1 hover:scale-105 transition-all duration-200">
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
          <ProgressBar percentage={completionPercentage} />
          {!isReadOnly && (
            <Button onClick={handleSave} disabled={isSaving} className="gap-2">
              <Save className="w-4 h-4" />
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          )}
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
      <div className="min-h-[500px]">
        <CompanyStructureForm 
          companyData={companyData}
          setCompanyData={setCompanyData}
          updateField={updateField}
          activeTab={activeTab}
          isReadOnly={isReadOnly}
          addLocation={addLocation}
          updateLocation={updateLocation}
          removeLocation={removeLocation}
        />
      </div>

      {/* Footer Actions */}
      {!isReadOnly && (
        <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
          <Button variant="outline" onClick={() => navigate("/company-structure")}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving} className="gap-2">
            <Save className="w-4 h-4" />
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      )}
    </div>
  );
}

