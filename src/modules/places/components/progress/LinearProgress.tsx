import * as React from "react";

interface LinearProgressProps {
  percentage: number;
  color?: "black" | "gray" | "white" | "blue";
  className?: string;
  height?: string;
}

export const LinearProgress: React.FC<LinearProgressProps> = ({
  percentage,
  color = "black",
  className = "",
  height = "h-2",
}) => {
  // Define color classes based on the theme
  const colorMap = {
    black: "bg-gray-900",
    gray: "bg-gray-400",
    white: "bg-white",
    blue: "bg-blue-500",
  };
  const bgMap = {
    black: "bg-gray-200",
    gray: "bg-gray-200",
    white: "bg-gray-700",
    blue: "bg-blue-100",
  };

  return (
    <div
      role="progressbar"
      aria-valuenow={percentage}
      aria-valuemin={0}
      aria-valuemax={100}
      className={`relative w-full overflow-hidden rounded-full ${bgMap[color]} ${height} ${className}`}
    >
      <div
        className={`absolute left-0 top-0 h-full rounded-full transition-all duration-500 ease-out ${colorMap[color]}`}
        style={{ width: `${Math.min(Math.max(percentage, 0), 100)}%` }}
      />
    </div>
  );
};