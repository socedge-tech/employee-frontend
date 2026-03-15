import React from "react";

interface ProgressBarProps {
  percentage: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ percentage }) => {
  return (
    <div className="flex items-center gap-2">
      <div className="text-right">
        <p className="text-sm font-medium text-gray-700">{percentage}% Complete</p>
        <p className="text-xs text-gray-500">Configuration Progress</p>
      </div>
      <div className="w-16 h-16">
        <svg className="transform -rotate-90" viewBox="0 0 36 36">
          <circle
            cx="18"
            cy="18"
            r="16"
            fill="none"
            className="stroke-gray-200"
            strokeWidth="3"
          />
          <circle
            cx="18"
            cy="18"
            r="16"
            fill="none"
            className="stroke-indigo-600"
            strokeWidth="3"
            strokeDasharray={`${percentage}, 100`}
            strokeLinecap="round"
          />
          <text
            x="18"
            y="18"
            className="fill-indigo-600 text-[10px] font-bold"
            textAnchor="middle"
            dy="0.3em"
            transform="rotate(90 18 18)"
          >
            {percentage}%
          </text>
        </svg>
      </div>
    </div>
  );
};
