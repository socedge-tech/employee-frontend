import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { verifyOtp } from "../../../api/auth/auth.jsx";
import { useTheme } from "../../../hooks/useTheme";
import AuthLayout from "../../../components/Auth/AuthLayout";
// import welcomeImg from "../../../assets/login/welcome.svg";
import authlogo from "../../../assets/verify/authlogo.svg";


function VerifyOtp() {
  const navigate = useNavigate();
  const theme = useTheme();
  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(60);
  const [error, setError] = useState("");
  const [sentTime, setSentTime] = useState(new Date());

  const email = localStorage.getItem("pendingEmail");

  // -------------------------------
  // AUTO LOAD PREVIOUS TIMER
  // -------------------------------
  useEffect(() => {
    const savedSent = localStorage.getItem("otpSentTime");
    const savedExpire = localStorage.getItem("otpExpireTime");

    if (savedSent) setSentTime(new Date(savedSent));

    if (savedExpire) {
      const diff = Math.floor((savedExpire - Date.now()) / 1000);
      setTimer(diff > 0 ? diff : 0);
    }
  }, []);

  // -------------------------------
  // TIMER COUNTDOWN
  // -------------------------------
  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // -------------------------------
  // START TIMER FUNCTION
  // -------------------------------
  const startTimer = () => {
    const now = new Date();
    const expireAt = Date.now() + 60000; // 60 sec

    setSentTime(now);
    setTimer(60);

    localStorage.setItem("otpSentTime", now.toISOString());
    localStorage.setItem("otpExpireTime", expireAt);
  };

  // -------------------------------
  // VERIFY OTP
  // -------------------------------
  const handleVerify = async () => {
    setError("");

    try {
      const res = await verifyOtp(email, otp);
      if (res?.data) {
        localStorage.setItem("token", res.data.token);
        sessionStorage.setItem("is_session_active", "true");
        localStorage.setItem(
          "user",
          JSON.stringify({
            user_id: res.data.user_id,
            full_name: res.data.full_name,
            email: res.data.email,
            role: res.data.role,
          })
        );

        localStorage.removeItem("pendingEmail");
        localStorage.removeItem("otpSentTime");
        localStorage.removeItem("otpExpireTime");

        navigate("/dashboard");
        return;
      }

    } catch (err) {
      setError("Incorrect OTP.");
    }
  };

  // OTP formatting
  const getRawOtp = (value) => value.replace(/\D/g, "").slice(0, 4);
  const formatOtp = (value) =>
    value.replace(/\D/g, "").slice(0, 4).split("").join(" ");

  return (
    <AuthLayout>
      {/* RIGHT SIDE */}
      <div className={`relative z-10 flex flex-1 items-center justify-center px-6 py-10 min-h-screen lg:min-h-auto -mt-17 lg:mt-0 ${theme.colors.background.panel} ${theme.colors.textMain}`}>
        <div className="w-full max-w-[420px] flex flex-col items-center gap-3">

          {/* HEADER */}
          <div className="mb-8 text-center mt-4 w-full">
            <h2 className="text-2xl font-bold text-white lg:text-gray-900 tracking-tight">Verify OTP</h2>
            {/* <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70 lg:text-gray-500 mt-1">Multi-Factor Authentication</p> */}
          </div>

          {/* MFA BOX */}
          <div className="w-full  border border-blue-200 lg:border-blue-100 rounded-xl p-4 mb-4">
            <div className="flex items-center gap-3">
              <img src={authlogo} className="w-5 h-5 flex-shrink-0" />
              <div>
                <p className="text-[13px] text-gray-800 font-semibold leading-tight">
                  Multi-Factor Authentication
                </p>
                <p className="text-[11px] text-gray-500 leading-tight mt-0.5">
                  Enter 4-digit OTP sent to your email
                </p>
              </div>
            </div>
          </div>

          {/* OTP INPUT */}
          <input
            autoFocus
            type="text"
            value={formatOtp(otp)}
            onChange={(e) => setOtp(getRawOtp(e.target.value))}
            maxLength={7}
            className={`w-full max-w-[420px] h-[47px] rounded-[10px] px-4 text-black bg-white outline-none transition-all duration-200
              ${error
                ? "border border-[#EB1D2E]"
                : otp
                  ? "border-2 border-blue-500 shadow-[0_0_0_3px_rgba(59,130,246,0.15)]"
                  : "border border-gray-300"
              }`}
            style={{ letterSpacing: otp ? "8px" : "normal" }}
            placeholder="Enter your 4-digit email OTP"
          />

          {error && <p className="text-[#EB1D2E] text-sm  w-full text-left ">{error}</p>}

          {/* BUTTONS */}
          <div className="flex w-full gap-4 mt-2">
            <button
              onClick={() => navigate("/login")}
              className={`h-11 flex-1 ${theme.button.outline}`}
            >
              Back
            </button>

            <button
              onClick={handleVerify}
              disabled={otp.length !== 4}
              className={`h-11 flex-1 ${otp.length === 4 ? theme.button.primary : theme.button.disabled} ${otp.length === 4 ? theme.states.cursorPointer : theme.states.cursorDisabled}`}
            >
              Verify &amp; Login
            </button>
          </div>

          {/* TIMER AREA */}
          <div className="text-center mt-4">
            <p className="text-xs text-gray-400">
              OTP sent at {sentTime.toLocaleTimeString()}
            </p>

            {timer > 0 ? (
              <p className="text-sm text-gray-400 mt-1">
                Resend available in {timer}s
              </p>
            ) : (
              <p
                className="text-sm text-[#155DFC] mt-1 cursor-pointer hover:underline"
                onClick={startTimer}
              >
                Resend OTP
              </p>
            )}
          </div>

        </div>
      </div>
    </AuthLayout>
  );
}

export default VerifyOtp;
