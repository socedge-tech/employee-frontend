import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { capitalizeFirstLetter } from "../utils/stringUtils";
import { ArrowLeft, Upload, Trash2, PlusCircle, Loader2 } from "lucide-react";
import { Button } from "../components/ui/button.tsx";
import { getDepartments } from "../api/departments.ts";
import { getEmployees, createEmployee, getEmployee, updateEmployee } from "../api/employees.ts";
import { getRoles } from "../api/roles.ts";
import type { Role } from "../api/roles.ts";
import { toast } from "sonner";
import { RoleGate } from "../components/Auth/RoleGate";
import { Permission } from "../types/rbac";

interface FamilyMember {
  name: string;
  relationship: string;
  dateOfBirth: string;
  phone: string;
}

interface Education {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string;
  grade: string;
}

interface Employment {
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  responsibilities: string;
  reasonForLeaving: string;
}

interface CompensationSplit {
  componentType: string;
  amount: string;
  frequency: string;
}

export function AddEmployee() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeSection, setActiveSection] = useState("job");
  
  const [formData, setFormData] = useState({
    // ... same as before
    firstName: "",
    lastName: "",
    middleName: "",
    dateOfBirth: "",
    gender: "",
    nationality: "",
    maritalStatus: "",
    bloodGroup: "",
    
    primaryEmail: "",
    primaryPhone: "",
    primaryAddress: "",
    primaryCity: "",
    primaryState: "",
    primaryZip: "",
    primaryCountry: "",
    
    secondaryEmail: "",
    secondaryPhone: "",
    secondaryAddress: "",
    secondaryCity: "",
    secondaryState: "",
    secondaryZip: "",
    secondaryCountry: "",
    
    emergencyContactName: "",
    emergencyContactRelationship: "",
    emergencyContactPhone: "",
    emergencyContactEmail: "",
    
    department: "",
    role: "",
    location: "",
    startDate: "",
    employeeType: "Full-time",
    employeeId: "",
    workSchedule: "",
    manager: "",
    probationPeriod: "",
    
    baseSalary: "",
    currency: "USD",
    payFrequency: "Monthly",
    
    branchId: "", // Added to store branch ID
    
    passportNumber: "",
    passportExpiry: "",
    drivingLicense: "",
    licenseExpiry: "",
    socialSecurityNumber: "",
    taxId: "",
    
    bankName: "",
    accountNumber: "",
    routingNumber: "",
    accountHolderName: "",
    
    skills: "",
    certifications: "",
    languages: ""
  });

  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string | null>(null);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [certificateFiles, setCertificateFiles] = useState<File[]>([]);
  const [otherDocuments, setOtherDocuments] = useState<File[]>([]);

  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [educationHistory, setEducationHistory] = useState<Education[]>([]);
  const [employmentHistory, setEmploymentHistory] = useState<Employment[]>([]);
  const [compensationSplits, setCompensationSplits] = useState<CompensationSplit[]>([
    { componentType: "Base Salary", amount: "", frequency: "Monthly" }
  ]);

  const [departmentsList, setDepartmentsList] = useState<any[]>([]);
  const [rolesList, setRolesList] = useState<Role[]>([]);
  const [managersList, setManagersList] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [locationsList, setLocationsList] = useState<{id: number | string, name: string}[]>([]);
  
  const [loadingStates, setLoadingStates] = useState({
    departments: false,
    roles: false,
    managers: false,
    locations: false,
    employee: false
  });
  
  const [errorStates, setErrorStates] = useState({
    departments: "",
    roles: "",
    managers: "",
    locations: "",
    employee: ""
  });

  useEffect(() => {
    const fetchInitialData = async () => {
      // Departments
      setLoadingStates(prev => ({ ...prev, departments: true }));
      try {
        const deps = await getDepartments();
        setDepartmentsList(deps || []);
        setErrorStates(prev => ({ ...prev, departments: "" }));
      } catch (error: any) {
        console.error("Failed to load departments", error);
        setErrorStates(prev => ({ ...prev, departments: error.message || "Failed to load departments" }));
      } finally {
        setLoadingStates(prev => ({ ...prev, departments: false }));
      }

      // Roles
      setLoadingStates(prev => ({ ...prev, roles: true }));
      try {
        const roles = await getRoles();
        setRolesList(roles || []);
        setErrorStates(prev => ({ ...prev, roles: "" }));
      } catch (error: any) {
        console.error("Failed to load roles", error);
        setErrorStates(prev => ({ ...prev, roles: error.message || "Failed to load roles" }));
      } finally {
        setLoadingStates(prev => ({ ...prev, roles: false }));
      }

      // Employees (Managers)
      setLoadingStates(prev => ({ ...prev, managers: true }));
      try {
        const emps = await getEmployees();
        setManagersList(emps || []);
        setErrorStates(prev => ({ ...prev, managers: "" }));
      } catch (error: any) {
        console.error("Failed to load managers", error);
        setErrorStates(prev => ({ ...prev, managers: error.message || "Failed to load managers" }));
      } finally {
        setLoadingStates(prev => ({ ...prev, managers: false }));
      }

      // Generate Employee ID if it's a new employee
      if (!id) {
        try {
          const employees = await getEmployees();
          const currentYear = new Date().getFullYear();
          let nextNumber = 1;

          if (Array.isArray(employees) && employees.length > 0) {
            const yearPattern = new RegExp(`EMP-${currentYear}-(\\d+)`);
            const yearIds = employees
              .map(emp => emp.details?.employee_id || "")
              .filter(empId => yearPattern.test(empId))
              .map(empId => {
                const match = empId.match(yearPattern);
                return match ? parseInt(match[1], 10) : 0;
              });

            if (yearIds.length > 0) {
              nextNumber = Math.max(...yearIds) + 1;
            }
          }

          const generatedId = `EMP-${currentYear}-${nextNumber.toString().padStart(3, "0")}`;
          setFormData(prev => ({ ...prev, employeeId: generatedId }));
        } catch (error) {
          console.error("Failed to generate employee ID", error);
        }
      }

      // Organizations/Branches
      setLoadingStates(prev => ({ ...prev, locations: true }));
      try {
        const { getOrganizations } = await import("../api/organizations");
        const orgs = await getOrganizations();
        
        const locations: {id: number | string, name: string}[] = [];
        
        // Ensure orgs is an array before iterating
        if (Array.isArray(orgs)) {
          orgs.forEach((org: any) => {
            const branches = org.branches || org.branch || [];
            if (Array.isArray(branches)) {
              branches.forEach((b: any) => {
                const name = b.branch_name || b.location_name;
                if (name) {
                  locations.push({ id: b.id, name: name });
                }
              });
            }
          });
        }
        
        setLocationsList(locations);
        setErrorStates(prev => ({ ...prev, locations: "" }));
      } catch (error: any) {
        console.error("Failed to load locations", error);
        setErrorStates(prev => ({ ...prev, locations: error.message || "Failed to load branches" }));
      } finally {
        setLoadingStates(prev => ({ ...prev, locations: false }));
      }

      // If ID exists, fetch employee data
      if (id) {
        setLoadingStates(prev => ({ ...prev, employee: true }));
        setIsSubmitting(true);
        try {
          const emp = await getEmployee(parseInt(id, 10));
          const details: any = emp.details || {};
          
          setFormData({
            firstName: details.first_name || "",
            lastName: details.last_name || "",
            middleName: details.middle_name || "",
            dateOfBirth: details.date_of_birth ? details.date_of_birth.split('T')[0] : "",
            gender: details.gender || "",
            nationality: details.nationality || "",
            maritalStatus: details.marital_status || "",
            bloodGroup: details.blood_group || "",
            
            primaryEmail: emp.email || "",
            primaryPhone: details.phone || "",
            primaryAddress: details.address || "",
            primaryCity: details.city || "",
            primaryState: details.state || "",
            primaryZip: details.zip || "",
            primaryCountry: details.country || "",
            
            secondaryEmail: details.secondary_email || "",
            secondaryPhone: details.secondary_phone || "",
            secondaryAddress: details.secondary_address || "",
            secondaryCity: details.secondary_city || "",
            secondaryState: details.secondary_state || "",
            secondaryZip: details.secondary_zip || "",
            secondaryCountry: details.secondary_country || "",
            
            emergencyContactName: details.emergency_contact || "",
            emergencyContactRelationship: details.emergency_relationship || "",
            emergencyContactPhone: details.emergency_phone || "",
            emergencyContactEmail: details.emergency_email || "",
            
            department: details.department_id?.toString() || "",
            role: emp.roles?.[0]?.role_id?.toString() || "",
            location: details.work_location || "",
            startDate: details.start_date ? details.start_date.split('T')[0] : "",
            employeeType: details.employment_type || "Full-time",
            employeeId: details.employee_id || "",
            workSchedule: details.work_schedule || "",
            manager: details.reporting_manager_id?.toString() || "",
            probationPeriod: details.probation_period?.toString() || "",
            
            baseSalary: details.base_salary?.toString() || "",
            currency: details.currency || "USD",
            payFrequency: details.salary_frequency || "Monthly",
            
            branchId: details.branch_id?.toString() || (details.work_location === "Remote" ? "remote" : ""),
            
            passportNumber: details.passport_number || "",
            passportExpiry: details.passport_expiry_date ? details.passport_expiry_date.split('T')[0] : "",
            drivingLicense: details.driving_license_number || "",
            licenseExpiry: details.license_expiry_date ? details.license_expiry_date.split('T')[0] : "",
            socialSecurityNumber: details.social_security_number || "",
            taxId: details.tax_id_number || "",
            
            bankName: details.bank_name || "",
            accountNumber: details.account_number || "",
            routingNumber: details.routing_number || "",
            accountHolderName: details.account_holder_name || "",
            
            skills: details.skills || "",
            certifications: details.certificates || "",
            languages: details.languages || ""
          });
          
          if (details.family_members) setFamilyMembers(details.family_members);
          if (details.education) setEducationHistory(details.education);
          if (details.employment_history) setEmploymentHistory(details.employment_history);
          if (details.compensation_breakdown) setCompensationSplits(details.compensation_breakdown);
          setErrorStates(prev => ({ ...prev, employee: "" }));
        } catch (error: any) {
          console.error("Failed to load employee details", error);
          setErrorStates(prev => ({ ...prev, employee: error.message || "Failed to load employee details" }));
          toast.error("Failed to load employee data");
        } finally {
          setIsSubmitting(false);
          setLoadingStates(prev => ({ ...prev, employee: false }));
        }
      }
    };
    fetchInitialData();
  }, [id]);

  const handleNext = () => {
    const currentIndex = sections.findIndex(s => s.id === activeSection);
    if (currentIndex < sections.length - 1) {
      setActiveSection(sections[currentIndex + 1].id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevious = () => {
    const currentIndex = sections.findIndex(s => s.id === activeSection);
    if (currentIndex > 0) {
      setActiveSection(sections[currentIndex - 1].id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const sections = [
    { id: "job", label: "Job Details" },
    { id: "personal", label: "Personal Info" },
    { id: "contact", label: "Contact Details" },
    { id: "emergency", label: "Emergency Contact" },
    { id: "compensation", label: "Compensation" },
    { id: "family", label: "Family Members" },
    { id: "education", label: "Education" },
    { id: "employment", label: "Employment History" },
    { id: "documents", label: "Documents" },
    { id: "bank", label: "Bank Details" },
    { id: "skills", label: "Skills & Certifications" },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type, tagName } = e.target;
    
    // Fields to skip capitalization (IDs, emails, phones, numbers, etc.)
    const skipCapitalization = [
      "primaryEmail", "secondaryEmail", "emergencyContactEmail",
      "primaryPhone", "secondaryPhone", "emergencyContactPhone",
      "primaryZip", "secondaryZip", "employeeId",
      "passportNumber", "drivingLicense", "socialSecurityNumber", "taxId",
      "accountNumber", "routingNumber", "dateOfBirth", "passportExpiry", 
      "licenseExpiry", "startDate", "probationPeriod", "baseSalary"
    ];

    let formattedValue = value;
    if (
      !skipCapitalization.includes(name) && 
      (type === "text" || tagName === "TEXTAREA")
    ) {
      formattedValue = capitalizeFirstLetter(value);
    }

    if (name === "location") {
      if (formattedValue === "Remote") {
        setFormData(prev => ({ ...prev, location: "Remote", branchId: "remote" }));
      } else {
        const selectedBranch = locationsList.find(loc => loc.id.toString() === formattedValue);
        if (selectedBranch) {
          setFormData(prev => ({ 
            ...prev, 
            location: selectedBranch.name, 
            branchId: selectedBranch.id.toString() 
          }));
        } else {
          setFormData(prev => ({ ...prev, location: "", branchId: "" }));
        }
      }
      return;
    }
    
    setFormData(prev => ({ ...prev, [name]: formattedValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Check if required fields are provided
    if (!formData.firstName || !formData.primaryEmail) {
      toast.error("Please fill in basic required fields (First Name and Email)");
      setIsSubmitting(false);
      return;
    }
    
    // Create a clean payload object with correct data types
    const payload: any = {
      // User Table Fields
      email: formData.primaryEmail,
      status: true, // Boolean
      username: formData.primaryEmail.split('@')[0],
      
      // UserDetail Table Fields
      first_name: capitalizeFirstLetter(formData.firstName),
      last_name: capitalizeFirstLetter(formData.lastName),
      middle_name: capitalizeFirstLetter(formData.middleName) || undefined,
      date_of_birth: formData.dateOfBirth || undefined,
      gender: formData.gender || undefined,
      nationality: capitalizeFirstLetter(formData.nationality) || undefined,
      marital_status: formData.maritalStatus || undefined,
      blood_group: formData.bloodGroup || undefined,
      
      phone: formData.primaryPhone || undefined,
      secondary_phone: formData.secondaryPhone || undefined,
      secondary_email: (formData.secondaryEmail && formData.secondaryEmail.includes('@')) ? formData.secondaryEmail : null,
      
      address: capitalizeFirstLetter(formData.primaryAddress) || undefined,
      city: capitalizeFirstLetter(formData.primaryCity) || undefined,
      state: capitalizeFirstLetter(formData.primaryState) || undefined,
      zip: formData.primaryZip || undefined,
      country: capitalizeFirstLetter(formData.primaryCountry) || undefined,
      
      secondary_address: capitalizeFirstLetter(formData.secondaryAddress) || undefined,
      secondary_city: capitalizeFirstLetter(formData.secondaryCity) || undefined,
      secondary_state: capitalizeFirstLetter(formData.secondaryState) || undefined,
      secondary_zip: formData.secondaryZip || undefined,
      secondary_country: capitalizeFirstLetter(formData.secondaryCountry) || undefined,
      
      emergency_contact: capitalizeFirstLetter(formData.emergencyContactName) || undefined,
      emergency_relationship: formData.emergencyContactRelationship || undefined,
      emergency_phone: formData.emergencyContactPhone || undefined,
      emergency_email: (formData.emergencyContactEmail && formData.emergencyContactEmail.includes('@')) ? formData.emergencyContactEmail : null,
      
      employee_id: formData.employeeId || undefined,
      department_id: formData.department ? Number(formData.department) : undefined,
      job_role: capitalizeFirstLetter(rolesList.find(r => r.id.toString() === formData.role)?.role_name || formData.role) || undefined,
      role_id: formData.role ? Number(formData.role) : undefined,
      employment_type: formData.employeeType || undefined,
      start_date: formData.startDate || undefined,
      work_location: capitalizeFirstLetter(formData.location) || undefined,
      branch_id: formData.branchId && formData.branchId !== "remote" ? Number(formData.branchId) : undefined,
      work_schedule: formData.workSchedule || undefined,
      reporting_manager_id: formData.manager ? Number(formData.manager) : undefined,
      probation_period: formData.probationPeriod ? Number(formData.probationPeriod) : undefined,
      
      base_salary: formData.baseSalary ? Number(formData.baseSalary) : undefined,
      currency: formData.currency || "USD",
      salary_frequency: formData.payFrequency || "Monthly",
      compensation_breakdown: compensationSplits, // Array
      
      passport_number: formData.passportNumber || undefined,
      passport_expiry_date: formData.passportExpiry || undefined,
      driving_license_number: formData.drivingLicense || undefined,
      license_expiry_date: formData.licenseExpiry || undefined,
      social_security_number: formData.socialSecurityNumber || undefined,
      tax_id_number: formData.taxId || undefined,
      
      bank_name: capitalizeFirstLetter(formData.bankName) || undefined,
      account_holder_name: capitalizeFirstLetter(formData.accountHolderName) || undefined,
      account_number: formData.accountNumber || undefined,
      routing_number: formData.routingNumber || undefined,
      
      // Skills, Languages, Certifications as arrays
      skills: formData.skills ? formData.skills.split(',').map(s => s.trim()).filter(Boolean) : [],
      languages: formData.languages ? formData.languages.split(',').map(l => l.trim()).filter(Boolean) : [],
      certificates: formData.certifications ? formData.certifications.split(',').map(c => c.trim()).filter(Boolean) : [],
      
      // Objects/Arrays
      family_members: familyMembers,
      education: educationHistory, // Correct field name for backend
      employment_history: employmentHistory,
    };

    // Add password only for new employees
    if (!id) {
      payload.password = "Socedge@123"; // Default password since it's required by backend schema
    }
    
    console.log("Submitting employee payload:", payload);
    
    try {
      if (id) {
        await updateEmployee(parseInt(id, 10), payload);
        toast.success("Employee updated successfully!");
      } else {
        await createEmployee(payload);
        toast.success("Employee added successfully!");
      }
      navigate("/employee-management");
    } catch (error: any) {
      console.error("Failed to save employee", error);
      const errorMessage = error.message || (error.errors && error.errors[0]?.message) || "Failed to save employee";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Family Members
  const addFamilyMember = () => {
    setFamilyMembers([...familyMembers, { name: "", relationship: "", dateOfBirth: "", phone: "" }]);
  };

  const removeFamilyMember = (index: number) => {
    setFamilyMembers(familyMembers.filter((_, i) => i !== index));
  };

  const updateFamilyMember = (index: number, field: keyof FamilyMember, value: string) => {
    const skipFields = ["dateOfBirth", "phone"];
    const formattedValue = skipFields.includes(field) ? value : capitalizeFirstLetter(value);
    const updated = [...familyMembers];
    updated[index][field] = formattedValue;
    setFamilyMembers(updated);
  };

  // Education
  const addEducation = () => {
    setEducationHistory([...educationHistory, {
      institution: "", degree: "", fieldOfStudy: "", startDate: "", endDate: "", grade: ""
    }]);
  };

  const removeEducation = (index: number) => {
    setEducationHistory(educationHistory.filter((_, i) => i !== index));
  };

  const updateEducation = (index: number, field: keyof Education, value: string) => {
    const skipFields = ["startDate", "endDate", "grade"];
    const formattedValue = skipFields.includes(field) ? value : capitalizeFirstLetter(value);
    const updated = [...educationHistory];
    updated[index][field] = formattedValue;
    setEducationHistory(updated);
  };

  // Employment
  const addEmployment = () => {
    setEmploymentHistory([...employmentHistory, {
      company: "", position: "", startDate: "", endDate: "", responsibilities: "", reasonForLeaving: ""
    }]);
  };

  const removeEmployment = (index: number) => {
    setEmploymentHistory(employmentHistory.filter((_, i) => i !== index));
  };

  const updateEmployment = (index: number, field: keyof Employment, value: string) => {
    const skipFields = ["startDate", "endDate"];
    const formattedValue = skipFields.includes(field) ? value : capitalizeFirstLetter(value);
    const updated = [...employmentHistory];
    updated[index][field] = formattedValue;
    setEmploymentHistory(updated);
  };

  // Compensation
  const addCompensationSplit = () => {
    setCompensationSplits([...compensationSplits, { componentType: "", amount: "", frequency: "Monthly" }]);
  };

  const removeCompensationSplit = (index: number) => {
    if (compensationSplits.length > 1) {
      setCompensationSplits(compensationSplits.filter((_, i) => i !== index));
    }
  };

  const updateCompensationSplit = (index: number, field: keyof CompensationSplit, value: string) => {
    const skipFields = ["amount", "frequency"];
    const formattedValue = skipFields.includes(field) ? value : capitalizeFirstLetter(value);
    const updated = [...compensationSplits];
    updated[index][field] = formattedValue;
    setCompensationSplits(updated);
  };

  return (
    <RoleGate permissions={[Permission.ADD_EMPLOYEE, Permission.EDIT_EMPLOYEE]}>
      <div className="-m-8 flex flex-col bg-gray-50" style={{ height: 'calc(100vh - 64px)' }}>
      {/* Sticky Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0 shadow-sm">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/employee-management")}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">{id ? "Edit Employee" : "Add New Employee"}</h1>
              <p className="text-sm text-gray-500 mt-1">
                {id ? "Update employee information and records" : "Complete comprehensive employee onboarding"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable Body */}
      <div className="flex-1 overflow-y-auto scroll-smooth">
        <div className="max-w-7xl mx-auto p-6 pb-8">
        <div className="flex gap-6 items-start">
          {/* Side Navigation */}
          <div className="w-56 flex-shrink-0">
            <div className="bg-white rounded-lg border border-gray-200 p-4 sticky top-6">
              <nav className="space-y-1">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeSection === section.id
                        ? "bg-indigo-600 text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {section.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Form Content */}
          <div className="flex-1">
            <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 flex flex-col">
              <div className="p-8 flex-1">
                {/* Personal Information Section */}
                {activeSection === "personal" && (
                  <div className="animate-in fade-in slide-in-from-left-2 duration-300 space-y-6">
                    <h3 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-3">Personal Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          First Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="John"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Middle Name
                        </label>
                        <input
                          type="text"
                          name="middleName"
                          value={formData.middleName}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="Michael"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Last Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="Doe"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Date of Birth <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          name="dateOfBirth"
                          value={formData.dateOfBirth}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Gender <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="gender"
                          value={formData.gender}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="">Select Gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                          <option value="Prefer not to say">Prefer not to say</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nationality
                        </label>
                        <input
                          type="text"
                          name="nationality"
                          value={formData.nationality}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="American"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Marital Status
                        </label>
                        <select
                          name="maritalStatus"
                          value={formData.maritalStatus}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="">Select Status</option>
                          <option value="Single">Single</option>
                          <option value="Married">Married</option>
                          <option value="Divorced">Divorced</option>
                          <option value="Widowed">Widowed</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Blood Group
                        </label>
                        <select
                          name="bloodGroup"
                          value={formData.bloodGroup}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="">Select Blood Group</option>
                          <option value="A+">A+</option>
                          <option value="A-">A-</option>
                          <option value="B+">B+</option>
                          <option value="B-">B-</option>
                          <option value="AB+">AB+</option>
                          <option value="AB-">AB-</option>
                          <option value="O+">O+</option>
                          <option value="O-">O-</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t border-gray-100">
                      <h4 className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wider">Profile Photo</h4>
                      <input
                        type="file"
                        id="profile-photo-input"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setProfilePhoto(file);
                            setProfilePhotoPreview(URL.createObjectURL(file));
                          }
                        }}
                      />
                      <div 
                        onClick={() => document.getElementById("profile-photo-input")?.click()}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const file = e.dataTransfer.files?.[0];
                          if (file && file.type.startsWith("image/")) {
                            setProfilePhoto(file);
                            setProfilePhotoPreview(URL.createObjectURL(file));
                          }
                        }}
                        className="max-w-md border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-indigo-500 hover:bg-indigo-50/30 transition-all cursor-pointer group relative overflow-hidden h-48 flex flex-col items-center justify-center"
                      >
                        {profilePhotoPreview ? (
                          <>
                            <img 
                              src={profilePhotoPreview} 
                              alt="Profile Preview" 
                              className="absolute inset-0 w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <p className="text-white text-sm font-medium">Change Photo</p>
                            </div>
                          </>
                        ) : (
                          <>
                            <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3 group-hover:text-indigo-500 transition-colors" />
                            <p className="text-sm font-medium text-gray-700">Click to upload or drag and drop</p>
                            <p className="text-xs text-gray-400 mt-2">PNG, JPG or JPEG (Max. 5MB)</p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Contact Details Section */}
                {activeSection === "contact" && (
                  <div className="animate-in fade-in slide-in-from-left-2 duration-300 space-y-8">
                    <div className="space-y-6">
                      <h3 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-3">Primary Contact Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email Address <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="email"
                            name="primaryEmail"
                            value={formData.primaryEmail}
                            onChange={handleInputChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="john.doe@company.com"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Phone Number <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="tel"
                            name="primaryPhone"
                            value={formData.primaryPhone}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="+1 (555) 123-4567"
                          />
                        </div>
                        <div className="md:col-span-3">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Street Address <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="primaryAddress"
                            value={formData.primaryAddress}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="123 Main Street"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            City <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="primaryCity"
                            value={formData.primaryCity}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="San Francisco"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            State/Province <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="primaryState"
                            value={formData.primaryState}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="California"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            ZIP/Postal Code <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="primaryZip"
                            value={formData.primaryZip}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="94102"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Country <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="primaryCountry"
                            value={formData.primaryCountry}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="United States"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-gray-100 space-y-6">
                      <h3 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-3">Secondary Contact Information (Optional)</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email Address
                          </label>
                          <input
                            type="email"
                            name="secondaryEmail"
                            value={formData.secondaryEmail}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="alternate@email.com"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            name="secondaryPhone"
                            value={formData.secondaryPhone}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="+1 (555) 987-6543"
                          />
                        </div>
                        <div className="md:col-span-3">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Street Address
                          </label>
                          <input
                            type="text"
                            name="secondaryAddress"
                            value={formData.secondaryAddress}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="456 Oak Avenue"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                          <input
                            type="text"
                            name="secondaryCity"
                            value={formData.secondaryCity}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">State/Province</label>
                          <input
                            type="text"
                            name="secondaryState"
                            value={formData.secondaryState}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">ZIP/Postal Code</label>
                          <input
                            type="text"
                            name="secondaryZip"
                            value={formData.secondaryZip}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                          <input
                            type="text"
                            name="secondaryCountry"
                            value={formData.secondaryCountry}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Emergency Contact Section */}
                {activeSection === "emergency" && (
                  <div className="animate-in fade-in slide-in-from-left-2 duration-300 space-y-6">
                    <h3 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-3">Emergency Contact Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Contact Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="emergencyContactName"
                          value={formData.emergencyContactName}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="Jane Doe"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Relationship <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="emergencyContactRelationship"
                          value={formData.emergencyContactRelationship}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="">Select Relationship</option>
                          <option value="Spouse">Spouse</option>
                          <option value="Parent">Parent</option>
                          <option value="Sibling">Sibling</option>
                          <option value="Child">Child</option>
                          <option value="Friend">Friend</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          name="emergencyContactPhone"
                          value={formData.emergencyContactPhone}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="+1 (555) 111-2222"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address
                        </label>
                        <input
                          type="email"
                          name="emergencyContactEmail"
                          value={formData.emergencyContactEmail}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="emergency@email.com"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Job Details Section */}
                {activeSection === "job" && (
                  <div className="animate-in fade-in slide-in-from-left-2 duration-300 space-y-6">
                    <h3 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-3">Job Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Employee ID <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="employeeId"
                          value={formData.employeeId}
                          onChange={handleInputChange}
                          readOnly
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50"
                          placeholder="EMP-2026-001"
                        />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Department <span className="text-red-500">*</span>
                          </label>
                          {loadingStates.departments && <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />}
                        </div>
                        <select
                          name="department"
                          value={formData.department}
                          onChange={handleInputChange}
                          disabled={loadingStates.departments}
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errorStates.departments ? 'border-red-500' : 'border-gray-300'}`}
                        >
                          <option value="">{loadingStates.departments ? "Loading Departments..." : "Select Department"}</option>
                          {departmentsList.map((dep) => (
                            <option key={dep.id} value={dep.id}>{dep.department_name}</option>
                          ))}
                        </select>
                        {errorStates.departments && <p className="text-xs text-red-500 mt-1">{errorStates.departments}</p>}
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-sm font-medium text-gray-700">
                            System Role <span className="text-red-500">*</span>
                          </label>
                          {loadingStates.roles && <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />}
                        </div>
                        <select
                          name="role"
                          value={formData.role}
                          onChange={handleInputChange}
                          disabled={loadingStates.roles}
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errorStates.roles ? 'border-red-500' : 'border-gray-300'}`}
                        >
                          <option value="">{loadingStates.roles ? "Loading Roles..." : "Select Role"}</option>
                          {rolesList.map((role) => (
                            <option key={role.id} value={role.id}>{role.role_name}</option>
                          ))}
                        </select>
                        {errorStates.roles && <p className="text-xs text-red-500 mt-1">{errorStates.roles}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Employment Type <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="employeeType"
                          value={formData.employeeType}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="Full-time">Full-time</option>
                          <option value="Part-time">Part-time</option>
                          <option value="Contract">Contract</option>
                          <option value="Intern">Intern</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Start Date <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          name="startDate"
                          value={formData.startDate}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Work Location <span className="text-red-500">*</span>
                          </label>
                          {loadingStates.locations && <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />}
                        </div>
                        <select
                          name="location"
                          value={formData.branchId || formData.location}
                          onChange={handleInputChange}
                          disabled={loadingStates.locations}
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errorStates.locations ? 'border-red-500' : 'border-gray-300'}`}
                        >
                          <option value="">{loadingStates.locations ? "Loading Branches..." : "Select Work Location"}</option>
                          <option value="Remote">Remote</option>
                          {locationsList.map(loc => (
                            <option key={loc.id} value={loc.id.toString()}>{loc.name}</option>
                          ))}
                        </select>
                        {errorStates.locations && <p className="text-xs text-red-500 mt-1">{errorStates.locations}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Work Schedule
                        </label>
                        <select
                          name="workSchedule"
                          value={formData.workSchedule}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="">Select Schedule</option>
                          <option value="9am-5pm">9:00 AM - 5:00 PM</option>
                          <option value="8am-4pm">8:00 AM - 4:00 PM</option>
                          <option value="10am-6pm">10:00 AM - 6:00 PM</option>
                          <option value="Flexible">Flexible</option>
                          <option value="Shifts">Shifts</option>
                        </select>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Reporting Manager
                          </label>
                          {loadingStates.managers && <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />}
                        </div>
                        <select
                          name="manager"
                          value={formData.manager}
                          onChange={handleInputChange}
                          disabled={loadingStates.managers}
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errorStates.managers ? 'border-red-500' : 'border-gray-300'}`}
                        >
                          <option value="">{loadingStates.managers ? "Loading Managers..." : "Select Manager"}</option>
                          {managersList.map(mgr => (
                            <option key={mgr.id} value={mgr.id}>
                              {mgr.details?.first_name} {mgr.details?.last_name || mgr.username}
                            </option>
                          ))}
                        </select>
                        {errorStates.managers && <p className="text-xs text-red-500 mt-1">{errorStates.managers}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Probation Period (months)
                        </label>
                        <input
                          type="number"
                          name="probationPeriod"
                          value={formData.probationPeriod}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="3"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Compensation Section */}
                {activeSection === "compensation" && (
                  <div className="animate-in fade-in slide-in-from-left-2 duration-300 space-y-8">
                    <div className="space-y-6">
                      <h3 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-3">Base Compensation</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Base Salary <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            name="baseSalary"
                            value={formData.baseSalary}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="75000"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Currency
                          </label>
                          <select
                            name="currency"
                            value={formData.currency}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          >
                            <option value="USD">USD</option>
                            <option value="INR">INR – Indian Rupee</option>
                            <option value="EUR">EUR</option>
                            <option value="GBP">GBP</option>
                            <option value="CAD">CAD</option>
                            <option value="AUD">AUD</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Pay Frequency
                          </label>
                          <select
                            name="payFrequency"
                            value={formData.payFrequency}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          >
                            <option value="Monthly">Monthly</option>
                            <option value="Bi-weekly">Bi-weekly</option>
                            <option value="Weekly">Weekly</option>
                            <option value="Annually">Annually</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-gray-100 space-y-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-3 flex-1">Compensation Breakdown</h3>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={addCompensationSplit}
                          className="gap-2 ml-4 mb-3"
                        >
                          <PlusCircle className="w-4 h-4" />
                          Add Component
                        </Button>
                      </div>
                      <div className="space-y-4">
                        {compensationSplits.map((split, index) => (
                          <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                              <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Component Type
                                </label>
                                <input
                                  type="text"
                                  value={split.componentType}
                                  onChange={(e) => updateCompensationSplit(index, "componentType", e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                  placeholder="e.g., Bonus, Commission, Allowance"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Amount
                                </label>
                                <input
                                  type="number"
                                  value={split.amount}
                                  onChange={(e) => updateCompensationSplit(index, "amount", e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                  placeholder="5000"
                                />
                              </div>
                              <div className="flex items-end gap-2">
                                <div className="flex-1">
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Frequency
                                  </label>
                                  <select
                                    value={split.frequency}
                                    onChange={(e) => updateCompensationSplit(index, "frequency", e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                  >
                                    <option value="Monthly">Monthly</option>
                                    <option value="Quarterly">Quarterly</option>
                                    <option value="Annually">Annually</option>
                                    <option value="One-time">One-time</option>
                                  </select>
                                </div>
                                {compensationSplits.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => removeCompensationSplit(index)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  >
                                    <Trash2 className="w-5 h-5" />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Family Members Section */}
                {activeSection === "family" && (
                  <div className="animate-in fade-in slide-in-from-left-2 duration-300 space-y-6">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                      <h3 className="text-xl font-bold text-gray-900">Family Members</h3>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={addFamilyMember}
                        className="gap-2"
                      >
                        <PlusCircle className="w-4 h-4" />
                        Add Family Member
                      </Button>
                    </div>
                    {familyMembers.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <p>No family members added yet</p>
                        <p className="text-sm">Click "Add Family Member" to get started</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {familyMembers.map((member, index) => (
                          <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-medium text-gray-900">Family Member #{index + 1}</h4>
                              <button
                                type="button"
                                onClick={() => removeFamilyMember(index)}
                                className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                                <input
                                  type="text"
                                  value={member.name}
                                  onChange={(e) => updateFamilyMember(index, "name", e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                  placeholder="Jane Doe"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Relationship</label>
                                <select
                                  value={member.relationship}
                                  onChange={(e) => updateFamilyMember(index, "relationship", e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                  <option value="">Select Relationship</option>
                                  <option value="Spouse">Spouse</option>
                                  <option value="Child">Child</option>
                                  <option value="Parent">Parent</option>
                                  <option value="Sibling">Sibling</option>
                                  <option value="Other">Other</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                                <input
                                  type="date"
                                  value={member.dateOfBirth}
                                  onChange={(e) => updateFamilyMember(index, "dateOfBirth", e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                                <input
                                  type="tel"
                                  value={member.phone}
                                  onChange={(e) => updateFamilyMember(index, "phone", e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                  placeholder="+1 (555) 123-4567"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Education History Section */}
                {activeSection === "education" && (
                  <div className="animate-in fade-in slide-in-from-left-2 duration-300 space-y-6">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                      <h3 className="text-xl font-bold text-gray-900">Educational History</h3>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={addEducation}
                        className="gap-2"
                      >
                        <PlusCircle className="w-4 h-4" />
                        Add Education
                      </Button>
                    </div>
                    {educationHistory.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <p>No education records added yet</p>
                        <p className="text-sm">Click "Add Education" to get started</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {educationHistory.map((edu, index) => (
                          <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-medium text-gray-900">Education #{index + 1}</h4>
                              <button
                                type="button"
                                onClick={() => removeEducation(index)}
                                className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                              <div className="md:col-span-3">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Institution Name</label>
                                <input
                                  type="text"
                                  value={edu.institution}
                                  onChange={(e) => updateEducation(index, "institution", e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                  placeholder="Stanford University"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Degree</label>
                                <input
                                  type="text"
                                  value={edu.degree}
                                  onChange={(e) => updateEducation(index, "degree", e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                  placeholder="Bachelor of Science"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Field of Study</label>
                                <input
                                  type="text"
                                  value={edu.fieldOfStudy}
                                  onChange={(e) => updateEducation(index, "fieldOfStudy", e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                  placeholder="Computer Science"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                                <input
                                  type="date"
                                  value={edu.startDate}
                                  onChange={(e) => updateEducation(index, "startDate", e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                                <input
                                  type="date"
                                  value={edu.endDate}
                                  onChange={(e) => updateEducation(index, "endDate", e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Grade/GPA</label>
                                <input
                                  type="text"
                                  value={edu.grade}
                                  onChange={(e) => updateEducation(index, "grade", e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                  placeholder="3.8/4.0"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Employment History Section */}
                {activeSection === "employment" && (
                  <div className="animate-in fade-in slide-in-from-left-2 duration-300 space-y-6">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                      <h3 className="text-xl font-bold text-gray-900">Employment History</h3>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={addEmployment}
                        className="gap-2"
                      >
                        <PlusCircle className="w-4 h-4" />
                        Add Employment
                      </Button>
                    </div>
                    {employmentHistory.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <p>No employment history added yet</p>
                        <p className="text-sm">Click "Add Employment" to get started</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {employmentHistory.map((emp, index) => (
                          <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-medium text-gray-900">Previous Employment #{index + 1}</h4>
                              <button
                                type="button"
                                onClick={() => removeEmployment(index)}
                                className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                                <input
                                  type="text"
                                  value={emp.company}
                                  onChange={(e) => updateEmployment(index, "company", e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                  placeholder="Tech Corp"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
                                <input
                                  type="text"
                                  value={emp.position}
                                  onChange={(e) => updateEmployment(index, "position", e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                  placeholder="Software Engineer"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                                <input
                                  type="date"
                                  value={emp.startDate}
                                  onChange={(e) => updateEmployment(index, "startDate", e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                                <input
                                  type="date"
                                  value={emp.endDate}
                                  onChange={(e) => updateEmployment(index, "endDate", e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                              </div>
                              <div className="md:col-span-3">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Key Responsibilities</label>
                                <textarea
                                  value={emp.responsibilities}
                                  onChange={(e) => updateEmployment(index, "responsibilities", e.target.value)}
                                  rows={3}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                  placeholder="Describe main responsibilities..."
                                />
                              </div>
                              <div className="md:col-span-3">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Leaving</label>
                                <input
                                  type="text"
                                  value={emp.reasonForLeaving}
                                  onChange={(e) => updateEmployment(index, "reasonForLeaving", e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                  placeholder="Career growth, relocation, etc."
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Documents Section */}
                {activeSection === "documents" && (
                  <div className="animate-in fade-in slide-in-from-left-2 duration-300 space-y-6">
                    <h3 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-3">Identity & Legal Documents</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Passport Number
                        </label>
                        <input
                          type="text"
                          name="passportNumber"
                          value={formData.passportNumber}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="A12345678"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Passport Expiry Date
                        </label>
                        <input
                          type="date"
                          name="passportExpiry"
                          value={formData.passportExpiry}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Driving License Number
                        </label>
                        <input
                          type="text"
                          name="drivingLicense"
                          value={formData.drivingLicense}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="DL123456789"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          License Expiry Date
                        </label>
                        <input
                          type="date"
                          name="licenseExpiry"
                          value={formData.licenseExpiry}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Social Security Number
                        </label>
                        <input
                          type="text"
                          name="socialSecurityNumber"
                          value={formData.socialSecurityNumber}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="XXX-XX-XXXX"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tax ID Number
                        </label>
                        <input
                          type="text"
                          name="taxId"
                          value={formData.taxId}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="12-3456789"
                        />
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">Upload Documents</h4>
                      <div className="space-y-4">
                        {/* CV Upload */}
                        <div className="space-y-2">
                          <label className="text-xs font-medium text-gray-500 uppercase">Resume/CV</label>
                          <input
                            type="file"
                            id="cv-upload-input"
                            className="hidden"
                            accept=".pdf,.doc,.docx"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) setCvFile(file);
                            }}
                          />
                          <div 
                            onClick={() => document.getElementById("cv-upload-input")?.click()}
                            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-500 transition-colors cursor-pointer group"
                          >
                            <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2 group-hover:text-indigo-500" />
                            <p className="text-sm text-gray-600">{cvFile ? cvFile.name : "Upload Resume/CV"}</p>
                            <p className="text-xs text-gray-400 mt-1">PDF, DOC up to 10MB</p>
                          </div>
                        </div>

                        {/* Certificates Upload */}
                        <div className="space-y-2">
                          <label className="text-xs font-medium text-gray-500 uppercase">Certificates</label>
                          <input
                            type="file"
                            id="certificate-upload-input"
                            className="hidden"
                            multiple
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => {
                              const files = Array.from(e.target.files || []);
                              setCertificateFiles(prev => [...prev, ...files]);
                            }}
                          />
                          <div 
                            onClick={() => document.getElementById("certificate-upload-input")?.click()}
                            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-500 transition-colors cursor-pointer group"
                          >
                            <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2 group-hover:text-indigo-500" />
                            <p className="text-sm text-gray-600">Upload Certificates</p>
                            <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG up to 10MB</p>
                          </div>
                          {certificateFiles.length > 0 && (
                            <ul className="mt-2 space-y-1">
                              {certificateFiles.map((f, i) => (
                                <li key={i} className="text-xs text-gray-600 flex items-center justify-between bg-gray-50 p-2 rounded">
                                  <span className="truncate max-w-[200px]">{f.name}</span>
                                  <button 
                                    type="button" 
                                    onClick={() => setCertificateFiles(prev => prev.filter((_, idx) => idx !== i))}
                                    className="text-red-500 hover:text-red-700"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>

                        {/* Other Documents */}
                        <div className="space-y-2">
                          <label className="text-xs font-medium text-gray-500 uppercase">Other Documents</label>
                          <input
                            type="file"
                            id="other-docs-upload-input"
                            className="hidden"
                            multiple
                            onChange={(e) => {
                              const files = Array.from(e.target.files || []);
                              setOtherDocuments(prev => [...prev, ...files]);
                            }}
                          />
                          <div 
                            onClick={() => document.getElementById("other-docs-upload-input")?.click()}
                            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-500 transition-colors cursor-pointer group"
                          >
                            <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2 group-hover:text-indigo-500" />
                            <p className="text-sm text-gray-600">Upload Other Documents</p>
                            <p className="text-xs text-gray-400 mt-1">Max 10MB per file</p>
                          </div>
                          {otherDocuments.length > 0 && (
                            <ul className="mt-2 space-y-1">
                              {otherDocuments.map((f, i) => (
                                <li key={i} className="text-xs text-gray-600 flex items-center justify-between bg-gray-50 p-2 rounded">
                                  <span className="truncate max-w-[200px]">{f.name}</span>
                                  <button 
                                    type="button" 
                                    onClick={() => setOtherDocuments(prev => prev.filter((_, idx) => idx !== i))}
                                    className="text-red-500 hover:text-red-700"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Bank Details Section */}
                {activeSection === "bank" && (
                  <div className="animate-in fade-in slide-in-from-left-2 duration-300 space-y-6">
                    <h3 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-3">Bank Account Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Bank Name
                        </label>
                        <input
                          type="text"
                          name="bankName"
                          value={formData.bankName}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="Bank of America"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Account Holder Name
                        </label>
                        <input
                          type="text"
                          name="accountHolderName"
                          value={formData.accountHolderName}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="John Doe"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Account Number
                        </label>
                        <input
                          type="text"
                          name="accountNumber"
                          value={formData.accountNumber}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="1234567890"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Routing Number
                        </label>
                        <input
                          type="text"
                          name="routingNumber"
                          value={formData.routingNumber}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="021000021"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Skills & Certifications Section */}
                {activeSection === "skills" && (
                  <div className="animate-in fade-in slide-in-from-left-2 duration-300 space-y-6">
                    <h3 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-3">Skills & Certifications</h3>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Skills
                        </label>
                        <textarea
                          name="skills"
                          value={formData.skills}
                          onChange={handleInputChange}
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="e.g., JavaScript, Python, Project Management, Team Leadership"
                        />
                        <p className="text-xs text-gray-500 mt-1">Separate skills with commas</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Certifications
                        </label>
                        <textarea
                          name="certifications"
                          value={formData.certifications}
                          onChange={handleInputChange}
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="e.g., AWS Certified Solutions Architect, PMP, Scrum Master"
                        />
                        <p className="text-xs text-gray-500 mt-1">List all professional certifications</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Languages
                        </label>
                        <textarea
                          name="languages"
                          value={formData.languages}
                          onChange={handleInputChange}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="e.g., English (Native), Spanish (Fluent), French (Intermediate)"
                        />
                        <p className="text-xs text-gray-500 mt-1">Include proficiency level for each language</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Form Actions */}
              <div className="bg-white border-t border-gray-200 px-8 py-4 flex items-center justify-between rounded-b-lg">
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => navigate("/employee-management")}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    Cancel
                  </Button>
                  
                  {activeSection !== sections[0].id && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handlePrevious}
                      className="gap-2"
                    >
                      Previous
                    </Button>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {activeSection !== sections[sections.length - 1].id ? (
                    <Button
                      type="button"
                      onClick={handleNext}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 min-w-[100px]"
                    >
                      Next
                    </Button>
                  ) : (
                    <Button 
                      type="submit" 
                      disabled={isSubmitting} 
                      className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 min-w-[140px]"
                    >
                      {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                      {id ? "Update Employee" : "Save Employee"}
                    </Button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
        </div>
      </div>
      </div>
    </RoleGate>
  );
}

