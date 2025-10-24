import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/shared/ui/tooltip";
import React from "react";

type PressureLevelBarHorizontalProps = {
  value: number; // dB value
  min?: number;
  max?: number;
  label?: string;
  unit?: string;
  marks?: number[];
};

const getColor = (value: number, min: number, max: number) => {
  const percent = (value - min) / (max - min);
  if (percent < 0.25) return "#4ade80"; // green
  if (percent < 0.5) return "#fde047"; // yellow
  if (percent < 0.75) return "#fb923c"; // orange
  return "#ef4444"; // red
};

export function PressureLevelBarHorizontal({
  value,
  min = 40,
  max = 120,
  label = "Nivel de presión sonora",
  unit = "dB",
  marks = [40, 60, 80, 100, 120],
}: PressureLevelBarHorizontalProps) {
  const percent = Math.max(0, Math.min(1, (value - min) / (max - min)));

  return (
    <TooltipProvider>
      <div className="flex flex-col items-center justify-center w-full py-2 rounded-xl bg-white shadow-lg border border-gray-200">
        <span className="text-xs font-semibold text-gray-700 mb-1">{label}</span>
        <div className="relative flex items-center h-12 w-full px-0">
          {/* Thermometer background */}
          <div
            className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-8"
            style={{
              borderRadius: "9999px",
              background: "linear-gradient(90deg, #4ade80 0%, #fde047 50%, #ef4444 100%)",
              border: "1px solid #e5e7eb",
            }}
          />
          {/* Bar */}
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className="absolute top-1/2 -translate-y-1/2 left-0 h-8 rounded-full transition-all duration-300"
                style={{
                  width: `calc(${percent * 100}% )`,
                  background: getColor(value, min, max),
                  boxShadow: "0 0 8px 2px rgba(0,0,0,0.10)",
                  zIndex: 2,
                }}
              />
            </TooltipTrigger>
            <TooltipContent>
              <span className="font-semibold">{value} {unit}</span>
            </TooltipContent>
          </Tooltip>
          {/* Marks (ruler style) */}
          {marks.map((mark) => {
            const markPercent = (mark - min) / (max - min);
            return (
              <div
                key={mark}
                className="absolute top-2 h-8 flex flex-col items-center"
                style={{
                  left: `calc(${markPercent * 100}% )`,
                  zIndex: 3,
                }}
              >
                <div className="w-0.5 h-5 bg-gray-400 rounded" />
                <span className="text-[10px] text-gray-600 mt-0 font-medium">{mark}</span>
              </div>
            );
          })}
          {/* Bulb (output point) */}
          <div
            className="absolute top-1/2 -translate-y-1/2"
            style={{
              left: `calc(${percent * 100}% )`,
              zIndex: 4,
            }}
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className="w-7 h-7 rounded-full border-4 border-white"
                  style={{
                    background: "#ef4444",
                    boxShadow: "0 0 12px 2px rgba(0,0,0,0.10)",
                  }}
                />
              </TooltipTrigger>
              <TooltipContent>
                <span className="font-semibold">{value} {unit} (Salida)</span>
              </TooltipContent>
            </Tooltip>
          </div>
          {/* Value */}
          <span className="absolute top-[-32px] left-[50%] -translate-x-1/2 text-lg font-bold text-gray-900 z-10">
            {value}
            <span className="text-xs font-medium text-gray-500 ml-1">{unit}</span>
          </span>
        </div>
        <span className="text-xs text-gray-400 mt-1">
          {min} - {max} {unit}
        </span>
      </div>
    </TooltipProvider>
  );
}