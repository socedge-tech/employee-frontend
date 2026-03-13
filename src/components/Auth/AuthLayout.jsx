import React from "react";
import mobbg from "../../assets/login/mobbg.png";
import { useTheme } from "../../hooks/useTheme";

const AuthLayout = ({ children }) => {
  const theme = useTheme();

  return (
    <>
      <style>{`
        @media (max-width: 1023px) {
          input:-webkit-autofill,
          input:-webkit-autofill:hover,
          input:-webkit-autofill:focus,
          input:-webkit-autofill:active {
            -webkit-text-fill-color: #000000 !important;
            -webkit-box-shadow: 0 0 0 30px white inset !important;
            box-shadow: 0 0 0 30px white inset !important;
          }
        }
        @media (min-width: 1024px) {
          input:-webkit-autofill,
          input:-webkit-autofill:hover,
          input:-webkit-autofill:focus,
          input:-webkit-autofill:active {
            -webkit-text-fill-color: #000000 !important;
            -webkit-box-shadow: 0 0 0 30px white inset !important;
            box-shadow: 0 0 0 30px white inset !important;
          }
        }
      `}</style>
      <div className={`flex flex-col lg:flex-row h-screen overflow-hidden ${theme.colors.background.main} text-white ${theme.fontFamily}`}>

        {/* MOBILE BACKGROUND - Visible on mobile only */}
        <div className="lg:hidden absolute inset-0 z-0">
          <img
            src={mobbg}
            alt="Mobile background"
            className="h-full w-full object-cover"
          />
        </div>

        {/* DESKTOP COLOR BACKGROUND - Visible on desktop only */}
        <div className="hidden lg:relative lg:flex lg:flex-1 min-h-[260px] bg-gradient-to-r from-blue-600 to-purple-600 overflow-hidden items-center justify-center p-12">
          {/* Decorative shapes and overlay */}
          <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px]"></div>

          <div className="relative z-10 flex flex-col gap-6 max-w-lg">
            <div className="w-20 h-2 bg-white/30 rounded-full mb-4"></div>
            <h2 className={theme.text.heading1}>
              Streamline your workflow
            </h2>
            <p className={`text-white/80 ${theme.text.subHeading}`}>
              Access your personalized dashboard, manage tools, and collaborate with your team all in one secure portal.
            </p>
          </div>
        </div>

        {/* RIGHT DYNAMIC FORM CONTAINER */}
        {children}
      </div>
    </>
  );
};

export default AuthLayout;
