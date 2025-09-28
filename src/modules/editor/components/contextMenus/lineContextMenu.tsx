import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import React, { useState } from "react";
import { useDrawingStore } from "../../store/drawingStore";
import { Button } from "@/shared/ui/button"; // Asegúrate que la ruta es correcta

const predefinedColors = [
  { name: "Negro", value: "#000000" },
  { name: "Gris", value: "#6b7280" },
  { name: "Rojo", value: "#ef4444" },
  { name: "Azul", value: "#3b82f6" },
  { name: "Verde", value: "#10b981" },
  { name: "Amarillo", value: "#f59e0b" },
];

export default function LineContextMenu({
  x,
  y,
  visible,
  lineId,
  onClose,
}: {
  x: number;
  y: number;
  visible: boolean;
  lineId: string;
  onClose: () => void;
}) {
  const { currentLines, updateCurrentLine } = useDrawingStore();

  // Buscar la línea por id
  const line = currentLines.find((l) => l.id === lineId);

  const color = line?.color || "#000000";
  const width = line?.width || 0.02;
  const length = line?.length || (line ? line.start.distanceTo(line.end) : 0);

  const [selectedColor, setSelectedColor] = useState(color);
  const [lineWidth, setLineWidth] = useState(width);
  const [lineLength, setLineLength] = useState(length);

  React.useEffect(() => {
    setSelectedColor(color);
    setLineWidth(width);
    setLineLength(length);
  }, [lineId, color, width, length]);

  if (!visible) return null;

  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;

  // Handler para aplicar cambios
  const handleApplyChanges = () => {
    updateCurrentLine(lineId, {
      color: selectedColor,
      width: lineWidth,
      length: lineLength,
    });
    console.log("🖊️ Cambios aplicados a línea", lineId, {
      color: selectedColor,
      width: lineWidth,
      length: lineLength,
    });
    onClose();
  };

  return (
    <Popover open={visible} onOpenChange={(open: boolean) => !open && onClose()}>
      <PopoverTrigger asChild>
        <div style={{ position: "fixed", top: centerY, left: centerX, width: 0, height: 0 }} />
      </PopoverTrigger>
      <PopoverContent
        side="right"
        align="start"
        style={{
          minWidth: "220px",
          background: "#fff",
          border: "1px solid #ccc",
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          borderRadius: "10px",
          padding: "12px 0",
          zIndex: 1000,
        }}
      >
        {/* Largo de la línea editable */}
        <div style={{ padding: "10px 16px" }}>
          <label style={{ fontSize: 13, fontWeight: 500, marginBottom: 6, display: "block" }}>
            Largo de línea (m)
          </label>
          <input
            type="number"
            min={0.01}
            step={0.01}
            value={lineLength}
            onChange={(e) => setLineLength(Number(e.target.value))}
            style={{
              width: "100%",
              padding: "6px 10px",
              borderRadius: 6,
              border: "1px solid #ccc",
              fontSize: 13,
              marginBottom: 8,
            }}
          />
        </div>

        {/* Selector de color */}
        <div style={{ padding: "10px 16px" }}>
          <label style={{ fontSize: 13, fontWeight: 500, marginBottom: 6, display: "block" }}>
            Color de línea
          </label>
          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <input
              type="color"
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value)}
              style={{ width: 32, height: 32, borderRadius: 6, border: "1px solid #ccc" }}
            />
            {predefinedColors.map((color) => (
              <button
                key={color.value}
                onClick={() => setSelectedColor(color.value)}
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 6,
                  border: selectedColor === color.value ? "2px solid #3b82f6" : "1px solid #ccc",
                  background: color.value,
                  cursor: "pointer",
                }}
                title={color.name}
              />
            ))}
          </div>
        </div>

        {/* Selector de grosor */}
        <div style={{ padding: "10px 16px" }}>
          <label style={{ fontSize: 13, fontWeight: 500, marginBottom: 6, display: "block" }}>
            Grosor de línea (m)
          </label>
          <input
            type="number"
            min={0.01}
            max={1.0}
            step={0.01}
            value={lineWidth}
            onChange={(e) => setLineWidth(Number(e.target.value))}
            style={{
              width: "100%",
              padding: "6px 10px",
              borderRadius: 6,
              border: "1px solid #ccc",
              fontSize: 13,
              marginBottom: 8,
            }}
          />
        </div>

        {/* Botón negro para aplicar cambios */}
        <div style={{ padding: "10px 16px" }}>
          <Button
            variant="default"
            style={{
              width: "100%",
              background: "#222",
              color: "#fff",
              borderRadius: 6,
              fontWeight: 500,
              fontSize: 14,
              padding: "10px 0",
            }}
            onClick={handleApplyChanges}
          >
            Aplicar cambios
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}