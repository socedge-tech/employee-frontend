import { useState, useEffect, useCallback } from "react";
import { getDepartments } from "../api/departments";
import { getOrganizations, type Organization } from "../api/organizations";
import { getEmployees } from "../api/employees";
import { toast } from "sonner";

export interface TeamNode {
  id: string | number;
  name: string;
  description?: string;
  lead: string;
  members: any; // Allow count or array for detailed view mapping
  avatars: string[];
}

export interface DepartmentNode {
  id: string | number;
  name: string;
  manager: string;
  headcount: number;
  teams: TeamNode[];
  branch_id?: number | string;
  expanded?: boolean;
}

export interface MappedOrganization {
  id: number;
  EntityName: string | undefined;
  companyCode: string;
  companyType?: string;
  currency?: string;
  payFrequency?: string;
  jurisdiction?: string;
  fiscalYearEnd?: string;
  pan?: string;
  tin?: string;
  ein?: string;
  siret?: string;
  otherTaxId?: string;
  businessUnit?: string;
  costCenter?: string;
  payrollStatutoryUnit?: string;
  legalEmployer?: string;
  legislativeDataGroup?: string;
  locations: {
    id: number;
    locationName?: string;
    locationCode?: string;
    address: { city: string; country: string; street?: string; state?: string; zipCode?: string };
  }[];
}

function mapOrganization(org: Organization): MappedOrganization {
  return {
    id: org.id,
    EntityName: org.entity_name,
    companyCode: org.company_code,
    companyType: org.company_type,
    currency: org.currency,
    payFrequency: org.pay_frequency,
    jurisdiction: org.jurisdiction,
    fiscalYearEnd: org.fiscal_year_end,
    pan: org.pan,
    tin: org.tin,
    ein: org.ein,
    siret: org.siret,
    otherTaxId: org.other_tax_id,
    businessUnit: org.business_unit,
    costCenter: org.cost_center,
    payrollStatutoryUnit: org.payroll_statutory_unit,
    legalEmployer: org.legal_employer,
    legislativeDataGroup: org.legislative_data_group,
    locations: (org.branches ?? org.branch ?? []).map((b: any) => ({
      id: b.id,
      locationName: b.location_name ?? b.branch_name,
      locationCode: b.location_code ?? b.branch_code,
      address: {
        city: b.city,
        country: b.country,
        street: b.street_address ?? b.address,
        state: b.state,
        zipCode: b.zip_code ?? b.zip,
      },
    })),
  };
}

function mapDepartments(deptData: any[]): DepartmentNode[] {
  return deptData.map(d => ({
    id: d.id,
    name: d.department_name,
    manager: d.manager?.username ?? (d.manager_id ? `Manager #${d.manager_id}` : "Unassigned"),
    headcount: d.people_count ?? d.department_employee_count ?? d.headcount ?? 0,
    teams: (d.teams ?? []).map((t: any) => ({
      id: t.id,
      name: t.team_name ?? t.name,
      lead: t.team_lead?.username ?? t.team_lead ?? t.lead ?? "Unassigned",
      members: Array.isArray(t.members) ? t.members.length : (t.member_count ?? t.members ?? 0),
      avatars: t.members && Array.isArray(t.members) 
        ? t.members.map((m: any) => m.username?.[0]?.toUpperCase()).filter(Boolean).slice(0, 3)
        : (t.avatars ?? []),
    })),
    branch_id: d.branch_id,
    expanded: false,
  }));
}

export function useCompanyStructure() {
  const [departments, setDepartments] = useState<DepartmentNode[]>([]);
  const [selectedDept, setSelectedDept] = useState<DepartmentNode | null>(null);
  const [companyDetails, setCompanyDetails] = useState<MappedOrganization | null>(null);
  const [companyName, setCompanyName] = useState("My Company");
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSetupView, setIsSetupView] = useState(false);
  const [expandedBranches, setExpandedBranches] = useState<Record<string | number, boolean>>({});
  const [hoveredNode, setHoveredNode] = useState<{ type: string; id: string | number } | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [deptData, orgs, emps] = await Promise.all([
        getDepartments(),
        getOrganizations(),
        getEmployees(),
      ]);

      // Departments
      const mappedDepts = mapDepartments(deptData);
      setDepartments(mappedDepts);
      setSelectedDept(mappedDepts[0] ?? null);

      // Organization
      const org = Array.isArray(orgs) ? orgs[0] : orgs;
      if (org?.id) {
        const mapped = mapOrganization(org);
        setCompanyDetails(mapped);
        setCompanyName(org.entity_name ?? "My Company");
        localStorage.setItem("companyData", JSON.stringify(mapped));
        setIsSetupView(false);
      } else {
        setCompanyDetails(null);
        setIsSetupView(true);
      }

      setTotalEmployees(emps?.length ?? 0);
    } catch (err) {
      console.error("[CompanyStructure] Failed to fetch data:", err);
      toast.error("Failed to load company structure. Please refresh.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const toggleDepartment = useCallback((deptId: string | number) => {
    setDepartments(prev =>
      prev.map(d => d.id === deptId ? { ...d, expanded: !d.expanded } : d)
    );
  }, []);

  const toggleBranch = useCallback((branchId: string | number) => {
    setExpandedBranches(prev => ({ ...prev, [branchId]: !prev[branchId] }));
  }, []);

  return {
    departments,
    setDepartments,
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
    refetch: fetchData,
  };
}
