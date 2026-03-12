import { Routes, Route } from "react-router-dom";

import Login from "../pages/Auth/Login/Login";
import VerifyOtp from "../pages/Auth/VerifyLogin/VerifyLogin";
import ResetPassword from "../pages/Auth/ResetPassword/ResetPassword";
import ForgotPassword from "../pages/Auth/ForgetPassword/ForgotPassword";

import { ProtectedRoute } from "../components/Auth/ProtectedRoute.tsx";
import { MainLayout } from "../components/layout/MainLayout.tsx";
import { CompanyStructure } from "../pages/CompanyStructure.tsx";
import EmployeeManagement from "../pages/EmployeeManagement.tsx";

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
        <Route index element={<CompanyStructure />} />
        <Route path="/company-structure" element={<CompanyStructure />} />
        <Route path="/employee-management" element={<EmployeeManagement />} />
      </Route>

      {/* Fallback to login or dashboard could be added here */}
    </Routes>
  );
}
