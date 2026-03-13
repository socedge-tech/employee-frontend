import { apiFetch } from "./config";

export interface Branch {
  id: number;
  organization_id: number;
  branch_name: string;
  branch_code: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  time_zone?: string;
  tax_location?: string;
  gst?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Organization {
  id: number;
  entity_name: string;
  company_code: string;
  company_type?: string;
  jurisdiction?: string;
  currency?: string;
  fiscal_year_end?: string;
  pan?: string;
  tin?: string;
  sin?: string;
  ein?: string;
  siret?: string;
  other_tax_id?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zip?: string;
  business_unit?: string;
  cost_center?: string;
  job_architecture?: boolean;
  payroll_statutory_unit?: string;
  legal_employer?: string;
  legislative_data_group?: string;
  pay_frequency?: string;
  standard_working_hours_per_week?: number;
  working_days?: string[];
  public_holidays?: string[];
  created_at: string;
  updated_at: string;
  branches?: Branch[];
}

export const getOrganizations = async (): Promise<Organization[]> => {
  const response = await apiFetch("/organizations");
  const json = await response.json();
  if (!json.success) throw new Error(json.message);
  return json.data;
};

export const createOrganization = async (data: any): Promise<Organization> => {
  const response = await apiFetch("/organizations", {
    method: "POST",
    body: JSON.stringify(data),
  });
  const json = await response.json();
  if (!json.success) throw new Error(json.message);
  return json.data;
};

export const updateOrganization = async (id: number, data: any): Promise<Organization> => {
  const response = await apiFetch(`/organizations/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  const json = await response.json();
  if (!json.success) throw new Error(json.message);
  return json.data;
};
