import axiosInstance from "./axiosInstance";

export interface Branch {
  id: number;
  organization_id: number;
  location_name?: string;
  location_code?: string;
  street_address?: string;
  branch_name?: string; // Compatibility
  branch_code?: string; // Compatibility
  address?: string; // Compatibility
  city: string;
  state: string;
  zip_code?: string;
  zip?: string; // Compatibility
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
  entity_name?: string; // Corrected column name per user request
  company_code: string;
  company_type?: string;
  jurisdiction?: string;
  currency?: string;
  fiscal_year_end?: string;
  tax_registration_number?: string; // Corrected column name per user request
  pan?: string;
  tin?: string;
  sin?: string;
  ein?: string;
  siret?: string;
  other_tax_id?: string;
  address?: string;
  legal_address?: string; // Corrected column name per user request
  city?: string;
  state?: string;
  country?: string;
  zip?: string;
  business_unit?: string;
  division?: string;
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
  branch?: Branch[];
}

export const getOrganizations = async (): Promise<Organization[]> => {
  try {
    const response = await axiosInstance.get("/organizations");
    return response.data.data;
  } catch (error: any) {
    throw error.response?.data || { message: "Failed to fetch organizations" };
  }
};

export const createOrganization = async (data: any): Promise<Organization> => {
  try {
    const response = await axiosInstance.post("/organizations", data);
    return response.data.data;
  } catch (error: any) {
    throw error.response?.data || { message: "Failed to create organization" };
  }
};

export const updateOrganization = async (id: number, data: any): Promise<Organization> => {
  try {
    const response = await axiosInstance.put(`/organizations/${id}`, data);
    return response.data.data;
  } catch (error: any) {
    throw error.response?.data || { message: "Failed to update organization" };
  }
};

export const deleteOrganization = async (id: number): Promise<void> => {
  try {
    await axiosInstance.delete(`/organizations/${id}`);
  } catch (error: any) {
    throw error.response?.data || { message: "Failed to delete organization" };
  }
};
