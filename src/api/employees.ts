import { apiFetch } from "./config";

export interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  employeeId?: string;
  departmentId?: string;
  roleId?: string;
  avatar?: string;
  [key: string]: any;
}

export const getEmployees = async (): Promise<Employee[]> => {
  const response = await apiFetch("/employees");
  const json = await response.json();
  if (!json.success) throw new Error(json.message);
  return json.data;
};

export const getEmployee = async (id: number): Promise<Employee> => {
  const response = await apiFetch(`/employees/${id}`);
  const json = await response.json();
  if (!json.success) throw new Error(json.message);
  return json.data;
};

export const createEmployee = async (data: any): Promise<Employee> => {
  const response = await apiFetch("/employees", {
    method: "POST",
    body: JSON.stringify(data),
  });
  const json = await response.json();
  if (!json.success) throw new Error(json.message);
  return json.data;
};

export const updateEmployee = async (id: number, data: any): Promise<Employee> => {
  const response = await apiFetch(`/employees/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  const json = await response.json();
  if (!json.success) throw new Error(json.message);
  return json.data;
};

export const deleteEmployee = async (id: number): Promise<void> => {
  const response = await apiFetch(`/employees/${id}`, {
    method: "DELETE",
  });
  const json = await response.json();
  if (!json.success) throw new Error(json.message);
};
