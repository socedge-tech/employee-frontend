import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

import { useTheme } from "../../../hooks/useTheme";
import { useAuth } from "../../../context/AuthContext.tsx";
import AuthLayout from "../../../components/Auth/AuthLayout";


function Login() {
  const navigate = useNavigate();
  const theme = useTheme();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ open: false });

  // Load saved email on page load
  useEffect(() => {
    const savedEmail = localStorage.getItem("savedEmail");
    if (savedEmail) {
      setFormData((prev) => ({ ...prev, email: savedEmail }));
      setRememberMe(true);
    }

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("expired") === "true") {
      setConfirmModal({
        open: true,
        actionType: "authError",
        title: "Session Expired",
        message: "Session logged out so please login again...",
        confirmText: "Login Now",
      });
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);



  // Input change
  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));

    // if email cleared → remove saved email
    if (name === "email" && !value) {
      localStorage.removeItem("savedEmail");
      setRememberMe(false);
    }
  };

  // Remember me toggle
  const handleRememberChange = (event) => {
    const checked = event.target.checked;
    setRememberMe(checked);

    if (!checked) {
      localStorage.removeItem("savedEmail");
    }
  };

  const validateForm = () => {
    const newErrors = { email: "", password: "" };

    if (!formData.email.trim()) {
      newErrors.email = "Email address is required.";
    } else {
      const emailPattern = /\S+@\S+\.\S+/;
      if (!emailPattern.test(formData.email.trim())) {
        newErrors.email = "Please enter a valid email address.";
      }
    }

    if (!formData.password) {
      newErrors.password = "Password cannot be empty.";
    }

    setErrors(newErrors);
    return !newErrors.email && !newErrors.password;
  };

  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Mock login using AuthContext
      await login(formData.email, formData.password);
      
      handleRememberLogic();
      navigate("/");
    } catch (error) {
      setConfirmModal({
        open: true,
        actionType: "authError",
        title: "Login Failed",
        message: error.message || "Invalid credentials",
        confirmText: "Try Again",
      });
    }
    setIsSubmitting(false);
  };

  // Remember Me save/remove logic
  const handleRememberLogic = () => {
    if (rememberMe) {
      localStorage.setItem("savedEmail", formData.email);
    } else {
      localStorage.removeItem("savedEmail");
    }
  };

  const statusStyles = {
    container: {
      width: 360,
      height: 56,
      top: 32,
      right: 24,
      borderRadius: 8,
      padding: "12px 16px",
      gap: 16,
      backgroundColor: "#2E3439",
      boxShadow:
        "0px 8px 10px 0px #00000033, 0px 6px 30px 0px #0000001F, 0px 16px 24px 0px #00000024",
    },
  };

  const inputClass = (hasError) => theme.input.base(hasError);

  return (
    <AuthLayout>
      {/* RIGHT FORM */}
      <div className={`relative z-10 flex flex-1 items-center justify-center px-6 py-10 min-h-screen lg:min-h-auto ${theme.colors.background.panel} ${theme.colors.textMain}`}>
        <div className={`w-full max-w-[548px] ${theme.colors.background.panel}`}>

          <div className="mb-10 text-center mt-4">
            <h2 className="text-2xl font-bold text-white lg:text-gray-900 tracking-tight">Welcome To</h2>
            <p className="text-sm mt-1 font-semibold text-white/70 lg:text-black/70 mb-2">
              Employee Experience Portal
            </p>
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit} noValidate>
            <div
              className="flex flex-col mx-auto w-full max-w-[420px] gap-8"
            >

              {/* Email */}
              <div className="flex flex-col gap-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Type your email here"
                  value={formData.email}
                  onChange={handleInputChange}
                  autoComplete="email"
                  className={inputClass(!!errors.email, formData.email)}
                />
                {errors.email && (
                  <p className="text-xs text-[#EB1D2E]">{errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1">
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={window.innerWidth < 1024 ? "Enter your password" : "Enter the password "}
                    value={formData.password}
                    onChange={handleInputChange}
                    autoComplete="current-password"
                    className={inputClass(!!errors.password)}
                  />
                  <button
                    type="button"
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-[#a2aed0]"
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    {showPassword ? (
                      <EyeIcon className="h-5 w-5" />
                    ) : (
                      <EyeSlashIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className={`${theme.colors.error} ${theme.text.caption}`}>{errors.password}</p>
                )}
              </div>

              {/* Remember me */}
              <div className={`flex items-center justify-between ${theme.text.body}`}>
                <label className={`flex items-center gap-2 ${theme.colors.textSecondary} ${theme.states.cursorPointer}`}>
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={handleRememberChange}
                      className="peer absolute h-4 w-4 opacity-0 cursor-pointer"
                    />
                    <div className="h-4 w-4 border border-white lg:border-gray-400 rounded-sm bg-transparent peer-checked:bg-gradient-to-r peer-checked:from-blue-600 peer-checked:to-purple-600 peer-checked:border-transparent lg:peer-checked:border-transparent flex items-center justify-center">
                      <svg
                        className={`w-3 h-3 text-white transition-opacity duration-150 ${rememberMe ? "opacity-100" : "opacity-0"}`}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                      >
                        <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </div>
                  Remember me
                </label>

                {/* Forgot Password */}
                <button
                  type="button"
                  className={theme.button.textLink}
                  onClick={() => navigate("/forgot-password")}
                >
                  Forgot password?
                </button>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className={`
                    w-full h-11 
                    ${formData.email ? theme.button.primary : theme.button.disabled}
                    ${isSubmitting ? theme.states.cursorDisabled : ""}
                  `}
                disabled={!formData.email || isSubmitting}
              >
                {isSubmitting ? "Logging in..." : "Login"}
              </button>

            </div>
          </form>

        </div>
      </div>
    </AuthLayout>
  );
}

export default Login;
