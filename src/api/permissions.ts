import { apiFetch } from "./config";

export interface Permission {
  id: number;
  permission_name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export const getPermissions = async (): Promise<Permission[]> => {
  const response = await apiFetch("/roles/permissions/all");
  const json = await response.json();
  if (!json.success) throw new Error(json.message);
  return json.data;
};

export const createPermission = async (data: { permission_name: string; description: string }): Promise<Permission> => {
  const response = await apiFetch("/roles/permissions", {
    method: "POST",
    body: JSON.stringify(data),
  });
  const json = await response.json();
  if (!json.success) throw new Error(json.message);
  return json.data;
};

export const assignPermissionsToRole = async (roleId: number, permissionIds: number[]): Promise<void> => {
  const response = await apiFetch(`/roles/${roleId}/permissions`, {
    method: "POST",
    body: JSON.stringify({ permission_ids: permissionIds }),
  });
  const json = await response.json();
  if (!json.success) throw new Error(json.message);
};

export const getAssignedPermissionsForRole = async (roleId: number): Promise<any> => {
  const response = await apiFetch(`/roles/${roleId}/permissions`);
  const json = await response.json();
  if (!json.success) throw new Error(json.message);
  return json.data;
};

export const deletePermissionFromRole = async (roleId: number, permissionId: number): Promise<void> => {
  const response = await apiFetch(`/roles/${roleId}/permissions/${permissionId}`, {
    method: "DELETE",
  });
  const json = await response.json();
  if (!json.success) throw new Error(json.message);
};
