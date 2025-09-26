"use client";
import React, { useState } from "react";

interface LineContextMenuProps {
  x: number;
  y: number;
  visible: boolean;
  lineId: string;
  onClose: () => void;
  onUpdateAppearance?: (lineId: string, color: string) => void;
  onUpdateProperties?: (lineId: string, width: number) => void;
}

const predefinedColors = [
  { name: "Negro", value: "#000000" },
  { name: "Gris", value: "#6b7280" },
  { name: "Rojo", value: "#ef4444" },
  { name: "Azul", value: "#3b82f6" },
  { name: "Verde", value: "#10b981" },
  { name: "Amarillo", value: "#f59e0b" },
];

export function LineContextMenu({
  x,
  y,
  visible,
  lineId,
  onClose,
  onUpdateAppearance,
  onUpdateProperties,
}: LineContextMenuProps) {
  const [activeTab, setActiveTab] = useState<"appearance" | "properties">("appearance");
  const [selectedColor, setSelectedColor] = useState("#000000");
  const [lineWidth, setLineWidth] = useState(0.15);

  if (!visible) return null;

  const handleColorChange = (color: string) => {
    setSelectedColor(color);
    onUpdateAppearance?.(lineId, color);
  };

  const handleWidthChange = (width: number) => {
    setLineWidth(width);
    onUpdateProperties?.(lineId, width);
  };

  return (
    <>
      {/* Overlay para cerrar al hacer clic fuera */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
      />
      
      {/* Menu contextual */}
      <div
        className="fixed z-50 bg-white rounded-lg shadow-lg border border-gray-200 p-0 min-w-[320px]"
        style={{
          left: x,
          top: y,
          transform: 'translate(-50%, -10px)',
        }}
      >
        {/* Header con tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab("appearance")}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors
              ${activeTab === "appearance"
                ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
          >
            Apariencia
          </button>
          <button
            onClick={() => setActiveTab("properties")}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors
              ${activeTab === "properties"
                ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
          >
            Propiedades
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {activeTab === "appearance" && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900">Color de línea</h3>
              
              {/* Selector de color personalizado */}
              <div className="flex items-center gap-3 mb-3">
                <input
                  type="color"
                  value={selectedColor}
                  onChange={(e) => handleColorChange(e.target.value)}
                  className="w-10 h-8 rounded border border-gray-300 cursor-pointer"
                />
                <span className="text-sm text-gray-600">Personalizado</span>
              </div>

              {/* Colores predefinidos */}
              <div className="grid grid-cols-3 gap-2">
                {predefinedColors.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => handleColorChange(color.value)}
                    className={`flex items-center gap-2 p-2 rounded-lg border transition-all hover:bg-gray-50
                      ${selectedColor === color.value
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200"
                      }`}
                  >
                    <div
                      className="w-4 h-4 rounded border border-gray-300"
                      style={{ backgroundColor: color.value }}
                    />
                    <span className="text-xs text-gray-700">{color.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === "properties" && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900">Dimensiones</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ancho de línea (metros)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="0.05"
                    max="1.0"
                    step="0.01"
                    value={lineWidth}
                    onChange={(e) => handleWidthChange(Number(e.target.value))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                  <span className="text-sm text-gray-500">m</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Rango: 0.05m - 1.0m
                </p>
              </div>

              {/* Presets de ancho */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Anchos predefinidos
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[0.10, 0.15, 0.20, 0.25, 0.30, 0.40].map((width) => (
                    <button
                      key={width}
                      onClick={() => handleWidthChange(width)}
                      className={`px-3 py-2 text-sm rounded-md border transition-all
                        ${lineWidth === width
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-gray-200 hover:bg-gray-50"
                        }`}
                    >
                      {width}m
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 p-4 bg-gray-50 rounded-b-lg">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </>
  );
}