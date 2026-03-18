import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router";
import { capitalizeFirstLetter } from "../utils/stringUtils";
import { ArrowLeft, Building2, Save, MapPin, Briefcase, Calendar, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "../components/ui/button.tsx";
import { toast } from "sonner";
import { getOrganizations, createOrganization, updateOrganization } from "../api/organizations.ts";
import { getDepartments } from "../api/departments.ts";
import { ProgressBar } from "../components/company/ProgressBar.tsx";
import { Permission } from "../types/rbac.ts";
import { CompanyStructureForm } from "../components/company/CompanyStructureForm.tsx";
import { usePermissions } from "../hooks/usePermissions";

interface CompanyData {
  // Legal Entity & Tax Data
  EntityName: string;
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
  EntityName: "",
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

  const { can } = usePermissions();
  const isReadOnly = !can(Permission.EDIT_COMPANY_STRUCTURE);

  // Calculate completion percentage dynamically based on actual field values
  const completionPercentage = useMemo(() => {
    const requiredFields = [
      companyData.EntityName,
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
    const loadOrg = async () => {
      try {
        const orgs = await getOrganizations();
        const organization = Array.isArray(orgs) ? orgs[0] : orgs;

        if (organization && organization.id) {
          const mainOrg = organization;
          setOrgId(mainOrg.id);
          setCompanyData({
            EntityName: capitalizeFirstLetter(mainOrg.entity_name || mainOrg.entity_name || ""),
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
              street: capitalizeFirstLetter(mainOrg.legal_address || mainOrg.address || ""),
              city: capitalizeFirstLetter(mainOrg.city || ""),
              state: capitalizeFirstLetter(mainOrg.state || ""),
              zipCode: mainOrg.zip || "",
              country: capitalizeFirstLetter(mainOrg.country || ""),
            },
            departments: [],
            businessUnits: mainOrg.business_unit ? mainOrg.business_unit.split(",").map((i: string) => capitalizeFirstLetter(i.trim())) : [],
            divisions: mainOrg.division ? mainOrg.division.split(",").map((i: string) => capitalizeFirstLetter(i.trim())) : [],
            costCenters: mainOrg.cost_center ? mainOrg.cost_center.split(",").map((i: string) => capitalizeFirstLetter(i.trim())) : [],

            locations: (mainOrg.branches || mainOrg.branch || []).map((branch: any) => ({
              id: (branch.id || Date.now()).toString(),
              locationCode: branch.location_code || branch.branch_code || "",
              locationName: capitalizeFirstLetter(branch.location_name || branch.branch_name || ""),
              address: {
                street: capitalizeFirstLetter(branch.street_address || branch.address || ""),
                city: capitalizeFirstLetter(branch.city || ""),
                state: capitalizeFirstLetter(branch.state || ""),
                zipCode: branch.zip_code || branch.zip || "",
                country: capitalizeFirstLetter(branch.country || ""),
              },
              timeZone: branch.time_zone || "",
              taxLocation: capitalizeFirstLetter(branch.tax_location || ""),
              gst: branch.gst || "",
            })),
            payrollStatutoryUnit: capitalizeFirstLetter(mainOrg.payroll_statutory_unit || ""),
            legalEmployer: capitalizeFirstLetter(mainOrg.legal_employer || ""),
            legislativeDataGroup: capitalizeFirstLetter(mainOrg.legislative_data_group || ""),
            payFrequency: mainOrg.pay_frequency || "Monthly",
            workingCalendar: {
              standardHours: mainOrg.standard_working_hours_per_week || 40,
              workingDays: mainOrg.working_days || ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
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
    if (!companyData.EntityName || !companyData.companyCode) {
      toast.error("Required fields missing", {
        description: "Please fill in Legal Entity Name and Company Code.",
      });
      setActiveTab("legal");
      return;
    }

    // Dynamic Validation based on Country
    const ctry = companyData.legalAddress.country;
    if (ctry === "India") {
      // Trim + uppercase so whitespace/case never causes false failures
      const pan = (companyData.taxRegistrationNumbers.pan || "").trim().toUpperCase();
      if (!pan) {
        toast.error("PAN Required", { description: "Please enter your Permanent Account Number (PAN)." });
        setActiveTab("legal");
        return;
      }
      // Soft format warning — does NOT block save. Real PAN: 5 alpha + 4 digits + 1 alpha
      if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan)) {
        toast.warning("PAN Format Notice", {
          description: "The PAN entered doesn't match the standard format (e.g., ABCDE1234F). Saving anyway — please verify with your tax authority.",
        });
      }
    } else if (ctry === "USA") {
      const ein = (companyData.taxRegistrationNumbers.ein || "").trim();
      if (!ein) {
        toast.error("EIN Required", { description: "Please enter your Employer Identification Number (EIN)." });
        setActiveTab("legal");
        return;
      }
      if (!/^\d{2}-\d{7}$/.test(ein)) {
        toast.warning("EIN Format Notice", {
          description: "EIN should be in the format 12-3456789. Saving anyway.",
        });
      }
    } else if (ctry === "France") {
      const siret = (companyData.taxRegistrationNumbers.siret || "").trim().replace(/\s/g, "");
      if (!siret) {
        toast.error("SIRET Required", { description: "Please enter your SIRET number." });
        setActiveTab("legal");
        return;
      }
      if (!/^\d{14}$/.test(siret)) {
        toast.warning("SIRET Format Notice", {
          description: "SIRET should be 14 digits. Saving anyway.",
        });
      }
    }

    setIsSaving(true);

    // Normalize the stored value before sending to the API
    const normalizedTaxNumbers = {
      ...companyData.taxRegistrationNumbers,
      pan: (companyData.taxRegistrationNumbers.pan || "").trim().toUpperCase(),
      ein: (companyData.taxRegistrationNumbers.ein || "").trim().toUpperCase(),
      siret: (companyData.taxRegistrationNumbers.siret || "").trim(),
      tin: (companyData.taxRegistrationNumbers.tin || "").trim().toUpperCase(),
    };

    // Build the API payload.
    // IMPORTANT: The backend Zod validator for `branch` expects:
    //   branch_name, branch_code, address (street), zip (not zip_code)
    //   time_zone, tax_location, city, state, country
    const apiPayload = {
      entity_name: capitalizeFirstLetter(companyData.EntityName),
      company_code: companyData.companyCode,
      company_type: companyData.companyType,
      jurisdiction: companyData.jurisdiction,
      currency: companyData.currency,
      fiscal_year_end: companyData.fiscalYearEnd,
      // Individual per-country tax columns — send normalized (trimmed/uppercased) values
      pan: normalizedTaxNumbers.pan || "",
      tin: normalizedTaxNumbers.tin || "",
      sin: (companyData.taxRegistrationNumbers.sin || "").trim(),
      ein: normalizedTaxNumbers.ein || "",
      siret: normalizedTaxNumbers.siret || "",
      other_tax_id: (companyData.taxRegistrationNumbers.other || "").trim(),
      address: capitalizeFirstLetter(companyData.legalAddress.street),
      city: capitalizeFirstLetter(companyData.legalAddress.city),
      state: capitalizeFirstLetter(companyData.legalAddress.state),
      country: capitalizeFirstLetter(companyData.legalAddress.country),
      zip: companyData.legalAddress.zipCode,
      business_unit: (companyData.businessUnits || []).filter(v => v && v.trim()).map(v => capitalizeFirstLetter(v.trim())).join(", "),
      cost_center: (companyData.costCenters || []).filter(v => v && v.trim()).map(v => capitalizeFirstLetter(v.trim())).join(", "),

      payroll_statutory_unit: capitalizeFirstLetter(companyData.payrollStatutoryUnit),
      legal_employer: capitalizeFirstLetter(companyData.legalEmployer),
      legislative_data_group: capitalizeFirstLetter(companyData.legislativeDataGroup),
      pay_frequency: companyData.payFrequency,
      standard_working_hours_per_week: companyData.workingCalendar.standardHours,
      working_days: companyData.workingCalendar.workingDays,
      public_holidays: companyData.workingCalendar.publicHolidays.filter(v => v.trim()),
      // `branch` key with field names that match the backend Zod validator
      branch: companyData.locations.map(loc => {
        const numId = parseInt(loc.id, 10);
        // Date.now() is 13 digits. Real DB IDs are much smaller.
        const isDbId = !isNaN(numId) && numId < 1000000000;

        return {
          ...(isDbId ? { id: numId } : {}),
          branch_name: capitalizeFirstLetter(loc.locationName),
          branch_code: loc.locationCode,
          address: capitalizeFirstLetter(loc.address.street),
          city: capitalizeFirstLetter(loc.address.city),
          state: capitalizeFirstLetter(loc.address.state),
          zip: loc.address.zipCode,
          country: capitalizeFirstLetter(loc.address.country),
          time_zone: loc.timeZone,
          tax_location: capitalizeFirstLetter(loc.taxLocation),
          gst: loc.gst || "",
        };
      }),
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
          <button
            onClick={() => navigate("/company-structure")}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
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
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
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

