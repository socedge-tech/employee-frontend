import { Routes, Route } from "react-router-dom";

import Login from "../pages/Auth/Login/Login";
import VerifyOtp from "../pages/Auth/VerifyLogin/VerifyLogin";
import ResetPassword from "../pages/Auth/ResetPassword/ResetPassword";
import ForgotPassword from "../pages/Auth/ForgetPassword/ForgotPassword";

import { ProtectedRoute } from "../components/Auth/ProtectedRoute.tsx";
import { MainLayout } from "../components/layout/MainLayout.tsx";
import { CompanyStructure } from "../pages/CompanyStructure.tsx";
import { EmployeeManagement } from "../pages/EmployeeManagement.tsx";
import { CompanySettings } from "../pages/CompanySettings.tsx";
import { AddDepartment } from "../pages/AddDepartment.tsx";
import { AddEmployee } from "../pages/AddEmployee.tsx";
import { ViewEmployee } from "../pages/ViewEmployee.tsx";
import { RolesPermissions } from "../pages/RolesPermissions.tsx";
import { UserProfile } from "../pages/UserProfile.tsx";
import { LeaveManagement } from "../pages/LeaveManagement.tsx";
import { Dashboard } from "../pages/Dashboard.tsx";
import { SystemSettings } from "../pages/SystemSettings.tsx";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/verify-login" element={<VerifyOtp />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Protected Routes (with EMPLOYEE layout) */}
      <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="/company-structure" element={<CompanyStructure />} />
        <Route path="/company-structure/settings" element={<CompanySettings />} />
        <Route path="/company-structure/add-department" element={<AddDepartment />} />
        <Route path="/company-structure/edit-department/:id" element={<AddDepartment />} />
        <Route path="/employee-management" element={<EmployeeManagement />} />
        <Route path="/employee-management/view-employee/:id" element={<ViewEmployee />} />
        <Route path="/employee-management/add-employee" element={<AddEmployee />} />
        <Route path="/employee-management/edit-employee/:id" element={<AddEmployee />} />
        <Route path="/leave-management" element={<LeaveManagement />} />
        <Route path="/roles-permissions" element={<RolesPermissions />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/system-settings" element={<SystemSettings />} />
      </Route>

      {/* Fallback to login or dashboard could be added here */}
    </Routes>
  );
}
