import React from "react";

type PressureLevelBarProps = {
  value: number; // dB value
  min?: number;
  max?: number;
  label?: string;
  unit?: string;
};

const getColor = (value: number, min: number, max: number) => {
  // Gradient: green (low) -> yellow -> orange -> red (high)
  const percent = (value - min) / (max - min);
  if (percent < 0.25) return "#4ade80"; // green
  if (percent < 0.5) return "#fde047"; // yellow
  if (percent < 0.75) return "#fb923c"; // orange
  return "#ef4444"; // red
};

export function PressureLevelBar({
  value,
  min = 40,
  max = 120,
  label = "Nivel de presión sonora",
  unit = "dB",
}: PressureLevelBarProps) {
  const percent = Math.max(0, Math.min(1, (value - min) / (max - min)));
  const barHeight = 180; // px

  return (
    <div className="flex flex-col items-center justify-center w-16 py-4 rounded-xl bg-white shadow-lg border border-gray-200">
      <span className="text-xs font-semibold text-gray-700 mb-2">{label}</span>
      <div className="relative flex flex-col items-center h-[200px] w-8">
        {/* Thermometer background */}
        <div className="absolute left-1/2 -translate-x-1/2 bottom-0 w-6 h-[180px] rounded-full bg-gradient-to-t from-red-200 via-yellow-200 to-green-200 border border-gray-300" />
        {/* Bar */}
        <div
          className="absolute left-1/2 -translate-x-1/2 bottom-0 w-6 rounded-full transition-all duration-300"
          style={{
            height: `${barHeight * percent}px`,
            background: getColor(value, min, max),
            boxShadow: "0 0 8px 2px rgba(0,0,0,0.10)",
          }}
        />
        {/* Bulb */}
        <div
          className="absolute left-1/2 -translate-x-1/2 bottom-[-18px] w-10 h-10 rounded-full border-4 border-white"
          style={{
            background: getColor(value, min, max),
            boxShadow: "0 0 12px 2px rgba(0,0,0,0.10)",
          }}
        />
        {/* Value */}
        <span className="absolute left-1/2 -translate-x-1/2 top-0 text-lg font-bold text-gray-900">
          {value}
          <span className="text-xs font-medium text-gray-500 ml-1">{unit}</span>
        </span>
      </div>
      <span className="text-xs text-gray-400 mt-2">
        {min} - {max} {unit}
      </span>
    </div>
  );
}