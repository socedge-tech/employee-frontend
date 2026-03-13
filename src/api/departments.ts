import { apiFetch } from "./config";

export interface Department {
  id: number;
  department_name: string;
  department_code: string;
  description?: string;
  branch_id?: number;
  parent_department_id?: number | null;
  annual_budget?: string | number;
  manager_id?: number;
  teams?: any[];
  permissions?: any;
  created_at?: string;
  updated_at?: string;
  _count?: {
    teams: number;
  };
}

export const getDepartments = async (): Promise<Department[]> => {
  const response = await apiFetch("/departments");
  const json = await response.json();
  if (!json.success) throw new Error(json.message);
  return json.data;
};

export const getDepartment = async (id: number): Promise<Department> => {
  const response = await apiFetch(`/departments/${id}`);
  const json = await response.json();
  if (!json.success) throw new Error(json.message);
  return json.data;
};

export const createDepartment = async (data: Partial<Department>): Promise<Department> => {
  const response = await apiFetch("/departments", {
    method: "POST",
    body: JSON.stringify(data),
  });
  const json = await response.json();
  if (!json.success) throw new Error(json.message);
  return json.data;
};

export const updateDepartment = async (id: number, data: Partial<Department>): Promise<Department> => {
  const response = await apiFetch(`/department/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  const json = await response.json();
  if (!json.success) throw new Error(json.message);
  return json.data;
};
