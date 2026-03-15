import axiosInstance from "./axiosInstance";

export interface TeamMember {
  id: number;
  username: string;
}

export interface Team {
  id: number;
  team_name: string;
  description?: string;
  team_lead_id?: number | null;
  team_lead?: { username: string } | null;
  members: TeamMember[];
}

export interface Department {
  id: number;
  department_name: string;
  department_code: string;
  description?: string;
  branch_id?: number;
  parent_department_id?: number | null;
  annual_budget?: string | number;
  manager_id?: number;
  teams?: Team[];
  permissions?: any;
  created_at?: string;
  updated_at?: string;
  _count?: {
    teams: number;
  };
}

export const getDepartments = async (): Promise<Department[]> => {
  try {
    const response = await axiosInstance.get("/departments");
    return response.data.data;
  } catch (error: any) {
    throw error.response?.data || { message: "Failed to fetch departments" };
  }
};

export const getDepartment = async (id: number): Promise<Department> => {
  try {
    const response = await axiosInstance.get(`/departments/${id}`);
    return response.data.data;
  } catch (error: any) {
    throw error.response?.data || { message: "Failed to fetch department details" };
  }
};

export const createDepartment = async (data: any): Promise<Department> => {
  try {
    const response = await axiosInstance.post("/departments", data);
    return response.data.data;
  } catch (error: any) {
    throw error.response?.data || { message: "Failed to create department" };
  }
};

export const updateDepartment = async (id: number, data: any): Promise<Department> => {
  try {
    const response = await axiosInstance.put(`/departments/${id}`, data);
    return response.data.data;
  } catch (error: any) {
    throw error.response?.data || { message: "Failed to update department" };
  }
};

export const deleteDepartment = async (id: number): Promise<void> => {
  try {
    await axiosInstance.delete(`/departments/${id}`);
  } catch (error: any) {
    throw error.response?.data || { message: "Failed to delete department" };
  }
};
