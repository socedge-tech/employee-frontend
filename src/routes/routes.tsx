import React from "react";
import { Routes, Route } from "react-router-dom";

import Login from "../pages/Auth/Login/Login";
import VerifyOtp from "../pages/Auth/VerifyLogin/VerifyLogin";
import ResetPassword from "../pages/Auth/ResetPassword/ResetPassword";
import ForgotPassword from "../pages/Auth/ForgetPassword/ForgotPassword"

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/verify-login" element={<VerifyOtp />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Protected Routes (with EMPLOYEE layout) */}
      {/* <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
        <Route index element={<CompanyStructure />} />
        <Route path="/company-structure" element={<CompanyStructure />} />
        <Route path="/employee-management" element={<EmployeeManagement />} />
      </Route> */}

      {/* Legacy Protected Routes (commented out for now) */}
      {/* <Route element={<AppLayout />}>
          ...
      </Route> */}
    </Routes>
  );
}
