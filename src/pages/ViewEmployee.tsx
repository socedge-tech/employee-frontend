import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Briefcase, 
  DollarSign, 
  FileText, 
  User, 
  Building2, 
  Loader2
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { getEmployee, deleteEmployee, type Employee } from "../api/employees";
import { toast } from "sonner";
import { RoleGate } from "../components/Auth/RoleGate";
import { Permission } from "../types/rbac";
import { usePermissions } from "../hooks/usePermissions";

export function ViewEmployee() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEmployee = async () => {
      if (!id) return;
      try {
        setIsLoading(true);
        const data = await getEmployee(parseInt(id, 10));
        console.log("Employee API Response:", data);
        setEmployee(data);
      } catch (error) {
        console.error("Failed to fetch employee", error);
        toast.error("Failed to load employee details");
        navigate("/employee-management");
      } finally {
        setIsLoading(false);
      }
    };
    fetchEmployee();
  }, [id, navigate]);

  const handleDelete = async () => {
    if (!id || !window.confirm("Are you sure you want to delete this employee?")) return;
    try {
      await deleteEmployee(parseInt(id, 10));
      toast.success("Employee deleted successfully");
      navigate("/employee-management");
    } catch (error) {
      toast.error("Failed to delete employee");
    }
  };

  const getStatusColor = (status: boolean) => {
    return status 
      ? "bg-green-100 text-green-700 border-green-300" 
      : "bg-gray-100 text-gray-700 border-gray-300";
  };

  const formatDate = (dateString?: string | Date) => {
    if (!dateString) return "—";
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return dateString.toString();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  const { can } = usePermissions();
  const canSeeBank = can(Permission.MANAGE_PAYROLL) || can(Permission.VIEW_ALL_PAYROLL);

  if (!employee) return null;

  const details = employee.details;

  return (
    <RoleGate permissions={[Permission.VIEW_ALL_EMPLOYEES, Permission.VIEW_TEAM_EMPLOYEES, Permission.VIEW_OWN_PROFILE]}>
      <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <button
            onClick={() => navigate("/employee-management")}
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
                  {details?.first_name} {details?.middle_name || ""} {details?.last_name}
                </h1>
                <p className="text-gray-500">{details?.job_role || "No Role Assigned"} • {details?.department?.department_name || "No Department"}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(employee.status)}`}>
                    {employee.status ? "Active" : "Inactive"}
                  </span>
                  <span className="text-xs text-gray-500">
                    Joined: {formatDate(details?.start_date)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <RoleGate permissions={[Permission.EDIT_EMPLOYEE]}>
            <Button variant="outline" className="gap-2" onClick={() => navigate(`/employee-management/edit-employee/${employee.id}`)}>
              <Edit className="w-4 h-4" />
              Edit
            </Button>
          </RoleGate>
          <RoleGate permissions={[Permission.DELETE_EMPLOYEE]}>
            <Button variant="outline" className="gap-2 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-200" onClick={handleDelete}>
              <Trash2 className="w-4 h-4" />
              Delete
            </Button>
          </RoleGate>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <User className="w-5 h-5 text-gray-600" />
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
                  <p className="text-sm text-gray-900 font-medium">{formatDate(details?.date_of_birth)}</p>
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
              {/* Primary Contact */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                   Primary Contact
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
                    <p className="text-sm text-gray-900 font-medium">{employee.email || "—"}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Phone</label>
                    <p className="text-sm text-gray-900 font-medium">{details?.phone || "—"}</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Address</label>
                    <p className="text-sm text-gray-900 font-medium leading-relaxed">{details?.address || "—"}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {[details?.city, details?.state, details?.country].filter(Boolean).join(", ")} {details?.zip ? `- ${details.zip}` : ""}
                    </p>
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="pt-6 border-t border-gray-100">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Emergency Contact</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Name</label>
                    <p className="text-sm text-gray-900 font-medium">{details?.emergency_contact || "—"}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Relationship</label>
                    <p className="text-sm text-gray-900 font-medium">{details?.emergency_relationship || "—"}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Phone</label>
                    <p className="text-sm text-gray-900 font-medium">{details?.emergency_phone || "—"}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
                    <p className="text-sm text-gray-900 font-medium">{details?.emergency_email || "—"}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Job Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <Briefcase className="w-5 h-5 text-gray-600" />
                Job Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Employee ID</label>
                  <p className="text-sm text-gray-900 font-medium">{details?.employee_id || "EMP-" + employee.id}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Department</label>
                  <p className="text-sm text-gray-900 font-medium">{details?.department?.department_name || "—"}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Role</label>
                  <p className="text-sm text-gray-900 font-medium">{details?.job_role || "—"}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Location</label>
                  <p className="text-sm text-gray-900 font-medium">{details?.work_location || "—"}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Start Date</label>
                  <p className="text-sm text-gray-900 font-medium">{formatDate(details?.start_date)}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Employment Type</label>
                  <p className="text-sm text-gray-900 font-medium">{details?.employment_type || "—"}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Manager</label>
                  <p className="text-sm text-gray-900 font-medium">
                    {details?.reporting_manager?.details 
                      ? `${details.reporting_manager.details.first_name} ${details.reporting_manager.details.last_name}` 
                      : (details?.reporting_manager?.username || "—")}
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Work Schedule</label>
                  <p className="text-sm text-gray-900 font-medium">{details?.work_schedule || "—"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Documents */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <FileText className="w-5 h-5 text-gray-600" />
                Documents & Identification
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Passport Number</label>
                  <p className="text-sm text-gray-900 font-medium">{details?.passport_number || "—"}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Passport Expiry</label>
                  <p className="text-sm text-gray-900 font-medium">{formatDate(details?.passport_expiry_date)}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Driving License</label>
                  <p className="text-sm text-gray-900 font-medium">{details?.driving_license_number || "—"}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">License Expiry</label>
                  <p className="text-sm text-gray-900 font-medium">{formatDate(details?.license_expiry_date)}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Social Security Number</label>
                  <p className="text-sm text-gray-900 font-medium">{details?.social_security_number || "—"}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Tax ID</label>
                  <p className="text-sm text-gray-900 font-medium">{details?.tax_id_number || "—"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Quick Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Quick Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <a href={`mailto:${employee.email}`} className="text-indigo-600 hover:underline truncate">
                  {employee.email}
                </a>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="text-gray-900 truncate">{details?.phone || "N/A"}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="text-gray-900 truncate">{details?.work_location || "Not Specified"}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="text-gray-900 truncate">Joined: {formatDate(details?.start_date)}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Building2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="text-gray-900 truncate">{details?.department?.department_name || "No Department"}</span>
              </div>
            </CardContent>
          </Card>

          {/* Compensation */}
          {canSeeBank && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                  <DollarSign className="w-5 h-5 text-gray-600" />
                  Compensation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Base Salary</label>
                    <p className="text-xl font-bold text-gray-900">
                      {details?.base_salary ? `${parseFloat(details.base_salary).toLocaleString()} ${details?.currency || "USD"}` : "—"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Pay Frequency</label>
                    <p className="text-sm text-gray-900 font-medium">{details?.salary_frequency || "Monthly"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Bank Details */}
          {canSeeBank && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                  <Building2 className="w-5 h-5 text-gray-600" />
                  Bank Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Bank Name</label>
                    <p className="text-sm text-gray-900 font-medium">{details?.bank_name || "—"}</p>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Account No</label>
                      <p className="text-sm text-gray-900 font-medium tracking-tight">
                        {details?.account_number ? `****${details.account_number.slice(-4)}` : "—"}
                      </p>
                    </div>
                     <div>
                       <label className="block text-xs font-medium text-gray-500 mb-1">Type</label>
                       <p className="text-sm text-gray-900 font-medium">{details?.account_type || "—"}</p>
                     </div>
                  </div>
                  {(details?.ifsc_number || details?.routing_number) && (
                    <div className="pt-2">
                       <label className="block text-xs font-medium text-gray-500 mb-1">
                         {details?.ifsc_number ? "IFSC Code" : "Routing Number"}
                       </label>
                       <p className="text-sm text-gray-900 font-medium">
                         {details?.ifsc_number || details?.routing_number}
                       </p>
                    </div>
                  )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      </div>
    </RoleGate>
  );
}
