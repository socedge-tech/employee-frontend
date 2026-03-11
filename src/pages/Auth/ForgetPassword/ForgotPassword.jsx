import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { sendResetPasswordEmail } from "../../../api/auth/auth.jsx";
import { useTheme } from "../../../hooks/useTheme";
import AuthLayout from "../../../components/Auth/AuthLayout";
import mail from "../../../assets/forgotpassword/mail.svg";

function ForgotPassword() {
  const navigate = useNavigate();
  const theme = useTheme();
  
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const savedEmail = localStorage.getItem("pendingEmail");
    if (savedEmail) {
      setEmail(savedEmail);
    }
  }, []);

  const handleContinue = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!email) {
      setErrorMessage("Email field cannot be empty.");
      return;
    }

    try {
      await sendResetPasswordEmail(email);
      setSubmitted(true);
    } catch (err) {
      setErrorMessage(
        err?.response?.data?.message ||
        err?.message ||
        "Failed to send reset email"
      );
    }
  };

  return (
    <AuthLayout>
        {/* RIGHT CONTENT SECTION */}
        <div className={`relative z-10 flex flex-1 items-center justify-center px-8 ${theme.colors.background.panel} ${theme.colors.textMain}`}>

          <div className={`w-full ${submitted ? "max-w-[528px]" : "max-w-[420px]"}`}>

            {!submitted ? (
              <>
                <div className="flex flex-col gap-2 items-center text-center">
                  <h2 className={`${theme.text.heading2} mb-4`}>
                    Forgot Password
                  </h2>

                  <p className={`${theme.colors.textSecondary} ${theme.text.body} mb-6`} >
                    To reset your password, please enter your<br className="hidden lg:block" /> email address below.
                  </p>
                </div>

                <div className="mb-4">
                  <input
                    type="email"
                    placeholder="Type your email here"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={theme.input.base(errorMessage, email)}
                  />
                  {errorMessage && (
                    <p className={`${theme.colors.error} ${theme.text.caption} mt-1`}>{errorMessage}</p>
                  )}
                </div>

                <div className="flex justify-between gap-4 mt-6">
                  <button
                    className={`w-1/2 h-11 ${theme.button.outline}`}
                    onClick={() => navigate("/login")}
                  >
                    Back
                  </button>

                  <button
                    className={`w-1/2 h-11 
                    ${email ? theme.button.primary : theme.button.disabled}
                    `}
                    disabled={!email}
                    onClick={handleContinue}
                  >
                    Continue
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center  mx-auto">


                {/* MAIL ICON WITH RADIAL GLOW */}
                <div className="relative flex items-center justify-center mb-10">
                  <div className="hidden lg:block absolute w-[150px] h-[150px] 
        bg-[#155DFC] opacity-20 blur-[60px] rounded-full"></div>

                  <img src={mail} alt="mail" className="w-14 h-14 relative z-10" />
                </div>



                <h2 className={`${theme.text.heading2} font-normal leading-relaxed text-center`}>
                  A temporary access link <br className="hidden lg:block" />
                  has been sent to your email <br className="hidden lg:block" />
                  address.
                </h2>


                <p className={`${theme.colors.textSecondary} ${theme.text.body} mt-5`}>
                  Please click the link in the email to create a new<br />
                  password for your account.
                </p>
              </div>
            )}
          </div>
        </div>
    </AuthLayout>
  );
}

export default ForgotPassword;
