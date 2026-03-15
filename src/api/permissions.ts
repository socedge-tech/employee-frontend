import axiosInstance from "./axiosInstance";

export interface Permission {
  id: number;
  permission_name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export const getPermissions = async (): Promise<Permission[]> => {
  try {
    const response = await axiosInstance.get("/roles/permissions/all");
    return response.data.data;
  } catch (error: any) {
    throw error.response?.data || { message: "Failed to fetch permissions" };
  }
};

export const createPermission = async (data: any): Promise<Permission> => {
  try {
    const response = await axiosInstance.post("/roles/permissions", data);
    return response.data.data;
  } catch (error: any) {
    throw error.response?.data || { message: "Failed to create permission" };
  }
};

export const assignPermissionsToRole = async (roleId: number, permissionIds: number[]): Promise<void> => {
  try {
    await axiosInstance.post(`/roles/${roleId}/permissions`, { permission_ids: permissionIds });
  } catch (error: any) {
    throw error.response?.data || { message: "Failed to assign permissions" };
  }
};

export const getAssignedPermissionsForRole = async (roleId: number): Promise<any> => {
  try {
    const response = await axiosInstance.get(`/roles/${roleId}/permissions`);
    return response.data.data;
  } catch (error: any) {
    throw error.response?.data || { message: "Failed to fetch assigned permissions" };
  }
};

export const deletePermissionFromRole = async (roleId: number, permissionId: number): Promise<void> => {
  try {
    await axiosInstance.delete(`/roles/${roleId}/permissions/${permissionId}`);
  } catch (error: any) {
    throw error.response?.data || { message: "Failed to remove permission" };
  }
};
