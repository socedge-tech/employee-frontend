import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Edit, 
  Mail, 
  Phone, 
  Briefcase, 
  DollarSign, 
  User as UserIcon, 
  Loader2
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { getEmployee, type Employee } from "../api/employees";
import { toast } from "sonner";
import { RoleGate } from "../components/Auth/RoleGate";
import { Permission } from "../types/rbac";
import { usePermissions } from "../hooks/usePermissions";
import { useAuth } from "../context/AuthContext";

export function UserProfile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        // Use user.id which corresponds to the database User table ID
        const data = await getEmployee(parseInt(user.id, 10));
        setEmployee(data);
      } catch (error) {
        console.error("Failed to fetch profile", error);
        toast.error("Failed to load profile details");
        navigate("/");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [user, navigate]);

  const getStatusColor = (status: boolean) => {
    return status 
      ? "bg-green-100 text-green-700 border-green-300" 
      : "bg-gray-100 text-gray-700 border-gray-300";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  const { can } = usePermissions();
  const canSeeBank = can(Permission.MANAGE_PAYROLL) || can(Permission.VIEW_ALL_PAYROLL) || can(Permission.VIEW_OWN_PAYROLL);

  if (!employee) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-500">
      <UserIcon className="w-12 h-12 mb-4 opacity-20" />
      <p>Profile information not found.</p>
    </div>
  );

  const details = employee.details;

  return (
    <RoleGate 
      permissions={[Permission.VIEW_OWN_PROFILE]}
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-500 bg-white rounded-lg border border-dashed border-gray-300 mx-auto max-w-7xl">
          <UserIcon className="w-12 h-12 mb-4 opacity-20" />
          <p className="text-lg font-medium">Access Denied</p>
          <p className="text-sm">You do not have permission to view this profile.</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate("/")}>Go to Dashboard</Button>
        </div>
      }
    >
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-xl shadow-sm">
                  {details?.first_name?.[0]}{details?.last_name?.[0]}
                </div>
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900">
                    {details?.first_name ? `${details.first_name} ${details.middle_name || ""} ${details.last_name || ""}` : employee.username || employee.email}
                  </h1>
                  <p className="text-gray-500">{details?.job_role || (user?.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Employee')} • {details?.department?.department_name || "Organization"}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(employee.status)}`}>
                      {employee.status ? "Active" : "Inactive"}
                    </span>
                    <span className="text-xs text-gray-500">
                      Member since {details?.start_date ? new Date(details.start_date).toLocaleDateString() : (employee.created_at ? new Date(employee.created_at).toLocaleDateString() : "N/A")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-2" onClick={() => navigate(`/employee-management/edit-employee/${employee.id}`)}>
              <Edit className="w-4 h-4" />
              Edit Profile
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                  <UserIcon className="w-5 h-5 text-gray-600" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">First Name</label>
                    <p className="text-sm text-gray-900 font-medium">{details?.first_name || "—"}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Middle Name</label>
                    <p className="text-sm text-gray-900 font-medium">{details?.middle_name || "—"}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Last Name</label>
                    <p className="text-sm text-gray-900 font-medium">{details?.last_name || "—"}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Date of Birth</label>
                    <p className="text-sm text-gray-900 font-medium">{details?.date_of_birth || "—"}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Gender</label>
                    <p className="text-sm text-gray-900 font-medium">{details?.gender || "—"}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Nationality</label>
                    <p className="text-sm text-gray-900 font-medium">{details?.nationality || "—"}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Marital Status</label>
                    <p className="text-sm text-gray-900 font-medium">{details?.marital_status || "—"}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Blood Group</label>
                    <p className="text-sm text-gray-900 font-medium">{details?.blood_group || "—"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                  <Mail className="w-5 h-5 text-gray-600" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Primary Email</label>
                    <p className="text-sm text-gray-900 font-medium">{employee.email || "—"}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Secondary Email</label>
                    <p className="text-sm text-gray-900 font-medium">{details?.secondary_email || "—"}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Phone</label>
                    <p className="text-sm text-gray-900 font-medium">{details?.phone || "—"}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Secondary Phone</label>
                    <p className="text-sm text-gray-900 font-medium">{details?.secondary_phone || "—"}</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Residental Address</label>
                    <p className="text-sm text-gray-900 font-medium leading-relaxed">{details?.address || "—"}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{details?.city}, {details?.state}, {details?.country} - {details?.zip}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Job Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                  <Briefcase className="w-5 h-5 text-gray-600" />
                  Employment Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Employee ID</label>
                    <p className="text-sm text-gray-900 font-medium font-mono">{details?.employee_id || "EMP-" + employee.id}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Department</label>
                    <p className="text-sm text-gray-900 font-medium">{details?.department?.department_name || "Operations"}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Designation</label>
                    <p className="text-sm text-gray-900 font-medium">{details?.job_role || "Associate"}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Work Location</label>
                    <p className="text-sm text-gray-900 font-medium">{details?.work_location || "Remote"}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Reporting Manager</label>
                    <p className="text-sm text-gray-900 font-medium">{details?.reporting_manager_name || "—"}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Employment Type</label>
                    <p className="text-sm text-gray-900 font-medium">{details?.employment_type || "Full-time"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Quick Actions / Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">Account Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Username</span>
                  <span className="font-medium text-gray-900">{employee.username}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Role</span>
                  <span className="font-medium text-indigo-600 capitalize">{user?.role?.toLowerCase().replace('_', ' ')}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Status</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(employee.status)}`}>
                    {employee.status ? "Active" : "Inactive"}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Compensation Summary */}
            {canSeeBank && (
              <Card className="bg-gradient-to-br from-indigo-50/50 to-purple-50/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                    <DollarSign className="w-5 h-5 text-gray-600" />
                    Compensation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Current Base Salary</label>
                    <p className="text-2xl font-bold text-gray-900">
                      {details?.base_salary ? `${parseFloat(details.base_salary).toLocaleString()} ${details?.currency || "USD"}` : "—"}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Paid {details?.salary_frequency?.toLowerCase() || "monthly"}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Identification Documents */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Identification</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {details?.pan_number && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">PAN Card</span>
                    <span className="font-medium font-mono">{details.pan_number}</span>
                  </div>
                )}
                {details?.ssn && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">SSN</span>
                    <span className="font-medium font-mono">***-**-{details.ssn.slice(-4)}</span>
                  </div>
                )}
                {details?.passport_number && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Passport</span>
                    <span className="font-medium font-mono">{details.passport_number}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Emergency Contacts */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Emergency Contacts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {details?.emergency_contact ? (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-semibold text-gray-900">{details.emergency_contact}</p>
                    <p className="text-xs text-gray-500 mb-2">{details.emergency_relationship}</p>
                    <div className="flex items-center gap-2 text-xs text-indigo-600">
                      <Phone className="w-3 h-3" />
                      {details.emergency_phone}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">No emergency contact specified.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </RoleGate>
  );
}
