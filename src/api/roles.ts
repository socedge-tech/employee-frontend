import { apiFetch } from "./config";

export interface Role {
  id: number;
  role_name: string;
  description: string;
  status: boolean;
  created_at: string;
  updated_at: string;
  permissions?: any[];
}

export const getRoles = async (): Promise<Role[]> => {
  const response = await apiFetch("/roles");
  const json = await response.json();
  if (!json.success) throw new Error(json.message);
  return json.data;
};

export const getRole = async (id: number): Promise<Role> => {
  const response = await apiFetch(`/roles/${id}`);
  const json = await response.json();
  if (!json.success) throw new Error(json.message);
  return json.data;
};

export const createRole = async (data: { role_name: string; description: string }): Promise<Role> => {
  const response = await apiFetch("/roles", {
    method: "POST",
    body: JSON.stringify(data),
  });
  const json = await response.json();
  if (!json.success) throw new Error(json.message);
  return json.data;
};

export const updateRole = async (id: number, data: { role_name?: string; description?: string; status?: boolean }): Promise<Role> => {
  const response = await apiFetch(`/roles/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  const json = await response.json();
  if (!json.success) throw new Error(json.message);
  return json.data;
};

export const deleteRole = async (id: number): Promise<void> => {
  const response = await apiFetch(`/roles/${id}`, {
    method: "DELETE",
  });
  const json = await response.json();
  if (!json.success) throw new Error(json.message);
};
