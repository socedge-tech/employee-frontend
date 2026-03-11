import { useMemo } from 'react';

export const useTheme = () => {
  return useMemo(
    () => ({
      // --- Typography ---
      fontFamily: "font-poppins",
      
      // Font Sizes
      text: {
        heading1: "text-4xl lg:text-5xl font-bold leading-tight",
        heading2: "text-2xl font-semibold",
        subHeading: "text-lg font-medium",
        body: "text-sm",
        caption: "text-xs",
      },

      // --- Colors ---
      colors: {
        primary: "#155DFC",
        textMain: "text-white lg:text-black", // Adaptive based on right-side theme
        textSecondary: "text-[#B5B5B5] lg:text-gray-600",
        error: "text-[#EB1D2E]",
        success: "text-green-500",
        background: {
          main: "bg-[#050814]", // very dark blue for left side desktop & overall mobile
          panel: "bg-white",    // For the right forms on desktop
          inputDark: "bg-[#16191C]",
        },
        border: {
          default: "border-[#155DFC] lg:border-gray-300",
          error: "border-red-400",
          focus: "focus:border-gray-400",
        }
      },

      // --- Components ---
      button: {
        // Gradient from blue-600 to purple-600 with hover effect
        primary: `
          bg-gradient-to-r from-blue-600 to-purple-600 
          hover:from-blue-700 hover:to-purple-700
          text-white font-medium rounded-xl transition-all duration-300
          shadow-md hover:shadow-lg transform hover:-translate-y-0.5
        `,
        // Solid primary brand color with hover
        solid: `
          bg-[#155DFC] hover:bg-[#123A93] 
          text-white font-medium rounded-xl transition-colors duration-200
        `,
        // Disabled grey state
        disabled: `
          bg-[#808080] lg:bg-[#818089] text-white/70 
          cursor-not-allowed rounded-xl font-medium
        `,
        // Outline button (e.g., Back button)
        outline: `
          bg-transparent lg:bg-white border text-black lg:text-gray-700
          border-gray-400 hover:bg-gray-100 transition-colors duration-200 rounded-xl
        `,
        // Icon buttons or text links
        textLink: "font-semibold text-[#155DFC] hover:text-[#123A93] transition-colors cursor-pointer",
      },

      input: {
        // Dynamic class generator based on state
        base: (hasError, hasValue) => `
          w-full px-4 h-11 rounded-xl border text-sm outline-none transition-colors
          text-black bg-white
          backdrop-blur-sm lg:backdrop-blur-none
          ${hasError ? "border-red-500" : "border-[#155DFC] lg:border-gray-300 focus:border-gray-400"}
        `,
      },

      // popups/toast settings
      toast: {
        success: "bg-green-50 border border-green-200 text-green-800 rounded-lg p-4 shadow-sm",
        error: "bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 shadow-sm",
        warning: "bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg p-4 shadow-sm",
        info: "bg-blue-50 border border-blue-200 text-blue-800 rounded-lg p-4 shadow-sm",
      },
      
      // Common states
      states: {
        cursorPointer: "cursor-pointer",
        cursorDisabled: "cursor-not-allowed",
      }
    }),
    []
  );
};
