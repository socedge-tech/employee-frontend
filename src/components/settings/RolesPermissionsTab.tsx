import { useState, useEffect, useCallback } from "react";
import { Loader2, AlertCircle, Plus, Settings2, Trash2 } from "lucide-react";
import { Card, CardHeader, CardContent, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { getRoles, getRole, createRole, updateRolePermissions, type Role } from "../../api/roles.ts";
import { 
  getGroupedPermissions, 
  createModule, 
  deleteModule, 
  createPermissionNew as createPermissionStruct,
  deletePermissionNew as deletePermissionStruct,
  seedHierarchy
} from "../../api/permissions.ts";
import { toast } from "sonner";
import { Dialog } from "../ui/dialog";

export function RolesPermissionsTab() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [permissions, setPermissions] = useState<any[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isPermissionsLoading, setIsPermissionsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Management Mode State
  const [isManageMode, setIsManageMode] = useState(false);
  const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
  const [isPermModalOpen, setIsPermModalOpen] = useState(false);
  
  const [newModuleData, setNewModuleData] = useState({ id: "", label: "" });
  const [newPermData, setNewPermData] = useState({ name: "", moduleId: "" });
  const [isStructLoading, setIsStructLoading] = useState(false);

  // Add Role Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRole, setNewRole] = useState({ name: "", description: "" });
  const [isCreating, setIsCreating] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [rolesData, groupedPerms] = await Promise.all([
        getRoles(),
        getGroupedPermissions()
      ]);

      const rolesArray = Array.isArray(rolesData) ? rolesData : (rolesData as any)?.data || [];
      const permsArray = Array.isArray(groupedPerms) ? groupedPerms : (groupedPerms as any)?.data || [];

      setRoles(rolesArray);
      setPermissions(permsArray);

      if (rolesArray.length > 0) {
        setSelectedRole(rolesArray[0]);
      }
    } catch (error: any) {
      console.error("Failed to fetch roles", error);
      toast.error(error.message || "Failed to load roles");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const loadRolePermissions = useCallback(async (roleId: number) => {
    try {
      setIsPermissionsLoading(true);
      const roleData = await getRole(roleId);
      const permissionsList = roleData?.permissions || (roleData as any)?.data || [];
      const ids = Array.isArray(permissionsList)
        ? permissionsList.map((p: any) => p.permission?.id || p.permission_id || p.id).filter(Boolean)
        : [];
      setSelectedPermissions(ids);
    } catch (error: any) {
      console.error("Failed to load permissions", error);
      toast.error("Failed to load role permissions");
    } finally {
      setIsPermissionsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedRole) {
      loadRolePermissions(selectedRole.id);
    }
  }, [selectedRole, loadRolePermissions]);

  const handleToggle = async (permId: number) => {
    if (!selectedRole || isSaving) return;

    const isRemoving = selectedPermissions.includes(permId);
    const newSelected = isRemoving
      ? selectedPermissions.filter((id) => id !== permId)
      : [...selectedPermissions, permId];

    // Optimistically update UI
    setSelectedPermissions(newSelected);

    try {
      setIsSaving(true);
      await updateRolePermissions(selectedRole.id, {
        permissions: newSelected.map((id) => ({ id })),
      });
      toast.success(isRemoving ? "Permission removed" : "Permission granted", {
        duration: 2000,
        position: "top-right"
      });
    } catch (error) {
      console.error("Failed to update permissions", error);
      toast.error("Failed to update permission");
      // Rollback on error
      setSelectedPermissions(selectedPermissions);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateRole = async () => {
    if (!newRole.name.trim()) {
      toast.error("Role name is required");
      return;
    }

    try {
      setIsCreating(true);
      const createdRole = await createRole({
        name: newRole.name,
        description: newRole.description,
        status: true
      });
      
      toast.success("Role created successfully!");
      setIsModalOpen(false);
      setNewRole({ name: "", description: "" });
      
      // Refresh roles list and select the new role
      await fetchData();
      setSelectedRole(createdRole);
    } catch (error: any) {
      console.error("Failed to create role", error);
      toast.error(error.message || "Failed to create role");
    } finally {
      setIsCreating(false);
    }
  };

  // Dynamic Structure Handlers
  const handleCreateModule = async () => {
    if (!newModuleData.id || !newModuleData.label) {
      toast.error("Module ID and Label are required");
      return;
    }
    try {
      setIsStructLoading(true);
      await createModule(newModuleData);
      toast.success("Module added successfully!");
      setIsModuleModalOpen(false);
      setNewModuleData({ id: "", label: "" });
      fetchData();
    } catch (error) {
      toast.error("Failed to add module");
    } finally {
      setIsStructLoading(false);
    }
  };

  const handleCreatePermission = async () => {
    if (!newPermData.name || !newPermData.moduleId) {
      toast.error("Permission name is required");
      return;
    }
    try {
      setIsStructLoading(true);
      await createPermissionStruct({
        permission_name: newPermData.name,
        key_name: `${newPermData.moduleId}.${newPermData.name.toLowerCase()}`,
        moduleId: newPermData.moduleId,
        description: `Can ${newPermData.name} ${newPermData.moduleId}`
      });
      toast.success("Permission added!");
      setIsPermModalOpen(false);
      setNewPermData({ name: "", moduleId: "" });
      fetchData();
    } catch (error) {
      toast.error("Failed to add permission");
    } finally {
      setIsStructLoading(false);
    }
  };

  const openPermModal = (moduleId: string) => {
    setNewPermData({ name: "", moduleId });
    setIsPermModalOpen(true);
  };

  const handleDeleteModule = async (id: string) => {
    if (!confirm("Are you sure? This will delete all permissions within this module.")) return;
    try {
      await deleteModule(id);
      toast.success("Module deleted");
      fetchData();
    } catch (error) {
      toast.error("Failed to delete module");
    }
  };

  const handleDeletePermission = async (id: number) => {
    if (!confirm("Delete this permission?")) return;
    try {
      await deletePermissionStruct(id);
      toast.success("Permission deleted");
      fetchData();
    } catch (error) {
      toast.error("Failed to delete permission");
    }
  };

  const handleSyncHierarchy = async () => {
    if (!confirm("This will synchronize the permission matrix with the standard hierarchy. Existing modules will be updated. Continue?")) return;
    try {
      setIsStructLoading(true);
      await seedHierarchy();
      toast.success("Hierarchy synchronized successfully! 🚀");
      fetchData();
    } catch (error) {
      toast.error("Failed to sync hierarchy");
    } finally {
      setIsStructLoading(false);
    }
  };

  const STANDARD_ACTIONS = ["View", "Create", "Edit", "Delete", "Import", "Export"];

  // Calculate dynamic actions from data
  const dynamicActions = Array.from(
    new Set(
      permissions.flatMap((m: any) => 
        (Array.isArray(m.actions) ? m.actions : []).map((a: any) => 
          a.action ? a.action.charAt(0).toUpperCase() + a.action.slice(1).toLowerCase() : 
          a.permission_name ? a.permission_name.charAt(0).toUpperCase() + a.permission_name.slice(1).toLowerCase() :
          ""
        )
      )
    )
  ).filter(Boolean) as string[];

  // Merge and sort: standard first, then others alphabetically
  const ACTIONS = [
    ...STANDARD_ACTIONS,
    ...dynamicActions.filter(a => !STANDARD_ACTIONS.includes(a)).sort()
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Roles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {roles.map((role) => (
              <button
                key={role.id}
                onClick={() => setSelectedRole(role)}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  selectedRole?.id === role.id ? "bg-indigo-50 border-2 border-indigo-500" : "bg-gray-50 border-2 border-transparent hover:bg-gray-100"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{role.name}</span>
                  <span className="text-sm text-gray-500">{role.user_count}</span>
                </div>
              </button>
            ))}
            <Button 
              variant="outline" 
              className="w-full mt-4 gap-2" 
              size="sm"
              onClick={() => setIsModalOpen(true)}
            >
              <Plus className="w-4 h-4" /> Add New Role
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Add Role Modal */}
      <Dialog 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Add New Role"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Role Name</label>
            <input 
              type="text"
              placeholder="e.g. Finance Manager"
              className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              value={newRole.name}
              onChange={(e) => setNewRole({...newRole, name: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Description</label>
            <textarea 
              placeholder="Briefly describe this role's responsibilities"
              className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all min-h-[100px]"
              value={newRole.description}
              onChange={(e) => setNewRole({...newRole, description: e.target.value})}
            />
          </div>
          <div className="flex items-center gap-3 pt-4">
            <Button 
              variant="outline" 
              className="flex-1" 
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              className="flex-1" 
              onClick={handleCreateRole}
              disabled={isCreating}
            >
              {isCreating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Create Role"}
            </Button>
          </div>
        </div>
      </Dialog>

      <Card className="lg:col-span-3">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <CardTitle>Permissions for {selectedRole?.name || "Role"}</CardTitle>
              <Button 
                variant={isManageMode ? "primary" : "outline"} 
                size="sm" 
                className="rounded-full h-8"
                onClick={() => setIsManageMode(!isManageMode)}
              >
                <Settings2 className="w-3.5 h-3.5 mr-1.5" />
                {isManageMode ? "Finish Editing" : "Manage Matrix"}
              </Button>
            </div>
            <div className="flex items-center gap-2">
              {isManageMode && (
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" className="text-gray-500" onClick={handleSyncHierarchy}>
                    Restore Defaults
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setIsModuleModalOpen(true)}>
                    <Plus className="w-4 h-4 mr-1.5" /> Add Module
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isPermissionsLoading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-2" />
              <p className="text-sm text-gray-500">Fetching permissions...</p>
            </div>
          ) : permissions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 opacity-60">
              <AlertCircle className="w-12 h-12 text-gray-300 mb-2" />
              <p className="text-gray-500 font-medium">No permissions found</p>
            </div>
          ) : (
            <div className="overflow-x-auto ring-1 ring-gray-100 rounded-xl">
              <table className="w-full border-collapse bg-white">
                <thead className="bg-gray-50/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                      Module / Feature
                    </th>
                    {ACTIONS.map((action) => (
                      <th key={action} className="px-4 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                        {action}
                      </th>
                    ))}
                    {isManageMode && (
                      <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                        Config
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {permissions.map((moduleItem: any) => (
                    <tr key={moduleItem.module} className="hover:bg-indigo-50/30 transition-colors">
                      <td className="px-6 py-5 text-sm font-semibold text-gray-900 border-b border-gray-50">
                        <div className="flex items-center justify-between group/mod">
                          <span>{moduleItem.label}</span>
                          {isManageMode && (
                            <button 
                              onClick={() => handleDeleteModule(moduleItem.module)}
                              className="opacity-0 group-hover/mod:opacity-100 p-1 text-red-500 hover:bg-red-50 rounded transition-all"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                      {ACTIONS.map((action) => {
                        const permsArray = Array.isArray(moduleItem.actions) ? moduleItem.actions : [];
                        const permission = permsArray.find(
                          (p: any) =>
                            p?.action?.toLowerCase() === action.toLowerCase() ||
                            p?.permission_name?.toLowerCase() === action.toLowerCase() ||
                            p?.key_name?.split('.').pop()?.toLowerCase() === action.toLowerCase()
                        );

                        if (!permission) {
                          return <td key={action} className="px-4 py-5 border-b border-gray-50 bg-gray-50/5"></td>;
                        }

                        const isChecked = selectedPermissions.includes(permission.id);

                        return (
                          <td key={action} className="px-4 py-5 text-center border-b border-gray-50 group/cell">
                            <div className="flex flex-col items-center gap-1.5">
                              <label className="relative flex items-center justify-center cursor-pointer group/cb">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => handleToggle(permission.id)}
                                  className="peer sr-only"
                                />
                                <div className={`w-5 h-5 border-2 rounded-md transition-all duration-200 flex items-center justify-center
                                  ${isChecked 
                                    ? "bg-indigo-600 border-indigo-600 text-white shadow-sm scale-110" 
                                    : "bg-white border-gray-200 hover:border-indigo-400 hover:shadow-md hover:scale-105"}
                                `}>
                                  {isChecked && (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 animate-in fade-in zoom-in duration-300" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                  )}
                                </div>
                              </label>
                              {isManageMode && (
                                <button 
                                  onClick={() => handleDeletePermission(permission.id)}
                                  className="opacity-0 group-hover/cell:opacity-100 p-0.5 text-red-400 hover:text-red-600 transition-all"
                                  title="Delete this action"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </td>
                        );
                      })}
                      {isManageMode && (
                        <td className="px-6 py-5 text-right border-b border-gray-50">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg"
                            onClick={() => openPermModal(moduleItem.module)}
                          >
                            <Plus className="w-3.5 h-3.5 mr-1" /> Add Action
                          </Button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Module Modal */}
      <Dialog 
        isOpen={isModuleModalOpen} 
        onClose={() => setIsModuleModalOpen(false)} 
        title="Add New Permission Module"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Module ID (Keyword)</label>
            <input 
              type="text"
              placeholder="e.g. inventory_management"
              className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              value={newModuleData.id}
              onChange={(e) => setNewModuleData({...newModuleData, id: e.target.value})}
            />
            <p className="text-xs text-gray-400 italic">This will be used for permission keys (e.g. module.action)</p>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Module Label (Display Name)</label>
            <input 
              type="text"
              placeholder="e.g. Inventory"
              className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              value={newModuleData.label}
              onChange={(e) => setNewModuleData({...newModuleData, label: e.target.value})}
            />
          </div>
          <div className="flex items-center gap-3 pt-4">
            <Button variant="outline" className="flex-1" onClick={() => setIsModuleModalOpen(false)}>Cancel</Button>
            <Button className="flex-1" onClick={handleCreateModule} disabled={isStructLoading}>
              {isStructLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Add Module"}
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Add Permission Modal */}
      <Dialog 
        isOpen={isPermModalOpen} 
        onClose={() => setIsPermModalOpen(false)} 
        title={`Add Permission to ${newPermData.moduleId}`}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Action Name</label>
            <input 
              type="text"
              placeholder="e.g. approve, export"
              className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              value={newPermData.name}
              onChange={(e) => setNewPermData({...newPermData, name: e.target.value})}
            />
          </div>
          <div className="flex items-center gap-3 pt-4">
            <Button variant="outline" className="flex-1" onClick={() => setIsPermModalOpen(false)}>Cancel</Button>
            <Button className="flex-1" onClick={handleCreatePermission} disabled={isStructLoading}>
              {isStructLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Add Permission"}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
