import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Bell, Plus, Moon, Sun, ChevronDown, User, X } from "lucide-react";
import { Button } from "../ui/button.tsx";
import { useAuth } from "../../context/AuthContext.tsx";
import { RoleSwitcher } from "../Auth/RoleSwitcher.tsx";

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

export function TopNav() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [activeSection, setActiveSection] = useState("personal");
  
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: "",
    lastName: "",
    middleName: "",
    dateOfBirth: "",
    gender: "",
    nationality: "",
    maritalStatus: "",
    bloodGroup: "",
    
    // Primary Contact
    primaryEmail: "",
    primaryPhone: "",
    primaryAddress: "",
    primaryCity: "",
    primaryState: "",
    primaryZip: "",
    primaryCountry: "",
    
    // Secondary Contact
    secondaryEmail: "",
    secondaryPhone: "",
    secondaryAddress: "",
    secondaryCity: "",
    secondaryState: "",
    secondaryZip: "",
    secondaryCountry: "",
    
    // Emergency Contact
    emergencyContactName: "",
    emergencyContactRelationship: "",
    emergencyContactPhone: "",
    emergencyContactEmail: "",
    
    // Job Details
    department: "",
    role: "",
    location: "",
    startDate: "",
    employeeType: "Full-time",
    employeeId: "",
    workSchedule: "",
    manager: "",
    probationPeriod: "",
    
    // Compensation
    baseSalary: "",
    currency: "USD",
    payFrequency: "Monthly",
    
    // Documents
    passportNumber: "",
    passportExpiry: "",
    drivingLicense: "",
    licenseExpiry: "",
    socialSecurityNumber: "",
    taxId: "",
    
    // Bank Details
    bankName: "",
    accountNumber: "",
    routingNumber: "",
    accountHolderName: "",
    
    // Skills & Qualifications
    skills: "",
    certifications: "",
    languages: "",
  });
  
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [educationHistory, setEducationHistory] = useState<Education[]>([]);
  const [employmentHistory, setEmploymentHistory] = useState<Employment[]>([]);
  const [compensationSplits, setCompensationSplits] = useState<CompensationSplit[]>([
    { componentType: "Base Salary", amount: "", frequency: "Monthly" }
  ]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // helper functions removed for brevity

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const completeData = {
      ...formData,
      familyMembers,
      educationHistory,
      employmentHistory,
      compensationSplits
    };
    console.log("Complete Employee Data:", completeData);
    
    // Reset form
    setFormData({
      firstName: "", lastName: "", middleName: "", dateOfBirth: "", gender: "", nationality: "", 
      maritalStatus: "", bloodGroup: "", primaryEmail: "", primaryPhone: "", primaryAddress: "",
      primaryCity: "", primaryState: "", primaryZip: "", primaryCountry: "", secondaryEmail: "",
      secondaryPhone: "", secondaryAddress: "", secondaryCity: "", secondaryState: "", secondaryZip: "",
      secondaryCountry: "", emergencyContactName: "", emergencyContactRelationship: "", 
      emergencyContactPhone: "", emergencyContactEmail: "", department: "", role: "", location: "",
      startDate: "", employeeType: "Full-time", employeeId: "", workSchedule: "", manager: "",
      probationPeriod: "", baseSalary: "", currency: "USD", payFrequency: "Monthly",
      passportNumber: "", passportExpiry: "", drivingLicense: "", licenseExpiry: "",
      socialSecurityNumber: "", taxId: "", bankName: "", accountNumber: "", routingNumber: "",
      accountHolderName: "", skills: "", certifications: "", languages: ""
    });
    setFamilyMembers([]);
    setEducationHistory([]);
    setEmploymentHistory([]);
    setCompensationSplits([{ componentType: "Base Salary", amount: "", frequency: "Monthly" }]);
    setShowAddEmployee(false);
    setActiveSection("personal");
  };
  
  const sections = [
    { id: "personal", label: "Personal Info" },
    { id: "contact", label: "Contact Details" },
    { id: "emergency", label: "Emergency Contact" },
    { id: "job", label: "Job Details" },
    { id: "compensation", label: "Compensation" },
    { id: "family", label: "Family Members" },
    { id: "education", label: "Education" },
    { id: "employment", label: "Employment History" },
    { id: "documents", label: "Documents" },
    { id: "bank", label: "Bank Details" },
    { id: "skills", label: "Skills & Certifications" },
  ];

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search employees, teams, departments..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <RoleSwitcher />
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2" onClick={() => navigate("/engagement/survey-builder")}>
            <Plus className="w-4 h-4" />
            Create Survey
          </Button>
        </div>

        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Notifications</h3>
                <span className="text-xs text-gray-500">3 pending</span>
              </div>
              <div className="space-y-2">
                {[
                  { title: "Leave Request", desc: "John Doe requested leave for March 15-17", time: "2h ago" },
                  { title: "Profile Update", desc: "Sarah Smith updated her profile", time: "4h ago" },
                  { title: "Survey Response", desc: "50 new survey responses received", time: "1d ago" },
                ].map((notif, idx) => (
                  <div key={idx} className="p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                    <p className="text-sm font-medium">{notif.title}</p>
                    <p className="text-xs text-gray-500">{notif.desc}</p>
                    <span className="text-xs text-gray-400">{notif.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="text-left hidden md:block">
              <p className="text-sm font-medium">{user?.name || 'Admin User'}</p>
              <p className="text-xs text-gray-500">{user?.position || 'Super Admin'}</p>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>
          {showProfile && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 p-2 z-50">
              <button className="w-full text-left px-4 py-2 hover:bg-gray-50 rounded-lg text-sm">Profile</button>
              <button className="w-full text-left px-4 py-2 hover:bg-gray-50 rounded-lg text-sm">Switch to User View</button>
              <button className="w-full text-left px-4 py-2 hover:bg-gray-50 rounded-lg text-sm">Settings</button>
              <hr className="my-2" />
              <button className="w-full text-left px-4 py-2 hover:bg-gray-50 rounded-lg text-sm text-red-600">Logout</button>
            </div>
          )}
        </div>
      </div>

      {showAddEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[95vh] flex flex-col">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-lg">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Add New Employee</h2>
                <p className="text-sm text-gray-500 mt-1">Complete comprehensive employee onboarding</p>
              </div>
              <button
                onClick={() => setShowAddEmployee(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="flex-1 flex overflow-hidden">
              <div className="w-56 bg-gray-50 border-r border-gray-200 p-4 overflow-y-auto">
                <nav className="space-y-1">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        activeSection === section.id
                          ? "bg-indigo-600 text-white"
                          : "text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {section.label}
                    </button>
                  ))}
                </nav>
              </div>

              <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto p-6">
                  {activeSection === "personal" && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
                          <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
                          <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth *</label>
                          <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleInputChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                        </div>
                      </div>
                    </div>
                  )}
                  {/* ... other sections if needed ... */}
                </div>

                <div className="flex gap-3 p-6 border-t border-gray-200 bg-gray-50">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setShowAddEmployee(false)}>Cancel</Button>
                  <Button type="submit" className="flex-1">Add Employee</Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
