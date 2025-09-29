import React, { useState } from "react";
import { useDrawingStore } from "@/modules/editor/store/drawingStore";
import { Button } from "@/shared/ui/button";
import EditableHeaderLine from "./EditableHeaderLine";
import * as THREE from "three";

const predefinedColors = [
  { name: "Negro", value: "#000000" },
  { name: "Gris", value: "#6b7280" },
  { name: "Rojo", value: "#ef4444" },
  { name: "Azul", value: "#3b82f6" },
  { name: "Verde", value: "#10b981" },
  { name: "Amarillo", value: "#f59e0b" },
];

export default function LineContextModal({
  visible,
  lineId,
  onClose
}: {
  visible: boolean;
  lineId: string;
  onClose: () => void;
}) {
  const { currentLines, updateCurrentLine, currentPoints, setCurrentPoints } = useDrawingStore();

  // Buscar la línea por id
  const line = currentLines.find((l) => l.id === lineId);

  const name = line?.name ?? "";
  const color = line?.color || "#000000";
  const width = line?.width || 0.02;
  const length = line?.length || (line ? line.start.distanceTo(line.end) : 0);

  const [lineName, setLineName] = useState(name);
  const [selectedColor, setSelectedColor] = useState(color);
  const [lineWidth, setLineWidth] = useState(width);
  const [lineLength, setLineLength] = useState(length);

  React.useEffect(() => {
    setLineName(name);
    setSelectedColor(color);
    setLineWidth(width);
    setLineLength(length);
  }, [lineId, name, color, width, length]);

  if (!visible) return null;

  // Handler para aplicar cambios
  const handleApplyChanges = () => {
    updateCurrentLine(lineId, {
      name: lineName,
      color: selectedColor,
      width: lineWidth,
      length: lineLength,
    });
    onClose();
  };

  const handleChangeTitle = (newTitle: string) => {
    setLineName(newTitle);
    updateCurrentLine(lineId, { name: newTitle });
  };

  // Handler para cambiar el largo en tiempo real
  const handleLengthChange = (newLength: number) => {
    const line = currentLines.find((l) => l.id === lineId);
    if (!line) return;

    const start = line.start;
    const end = line.end;
    const center = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
    const direction = new THREE.Vector3().subVectors(end, start).normalize();

    const halfLength = newLength / 2;
    const newStart = new THREE.Vector3().addVectors(center, direction.clone().multiplyScalar(-halfLength));
    const newEnd = new THREE.Vector3().addVectors(center, direction.clone().multiplyScalar(halfLength));

    // Actualiza la línea en el store
    updateCurrentLine(lineId, {
      start: newStart,
      end: newEnd,
      length: newLength,
    });

    // Actualiza los puntos extremos en el array de puntos
    // setCurrentPoints((points: THREE.Vector3[]) =>
    //   points.map((p, i) =>
    //     i === startIndex ? newStart :
    //     i === endIndex ? newEnd : p
    //   )
    // );
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.25)",
        zIndex: 99999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onClick={onClose}
    >
      <div
        style={{
          minWidth: "320px",
          background: "#fff",
          border: "1px solid #ccc",
          boxShadow: "0 2px 16px rgba(0,0,0,0.25)",
          borderRadius: "12px",
          padding: "24px 0",
          zIndex: 99999,
          position: "relative",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Nombre de la línea editable */}
        <div style={{ padding: "10px 24px" }}>
          <EditableHeaderLine
            name={name}
            onUpdateName={(newName) => handleChangeTitle(newName)}
          />
        </div>

        {/* Largo de la línea editable */}
        <div style={{ padding: "10px 24px" }}>
          <label
            style={{
              fontSize: 13,
              fontWeight: 500,
              marginBottom: 6,
              display: "block",
            }}
          >
            Largo de línea (m)
          </label>
          <input
            type="number"
            min={0.01}
            step={0.01}
            value={lineLength}
            onChange={(e) => handleLengthChange(Number(e.target.value))}
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
        <div style={{ padding: "10px 24px" }}>
          <label
            style={{
              fontSize: 13,
              fontWeight: 500,
              marginBottom: 6,
              display: "block",
            }}
          >
            Color de línea
          </label>
          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <input
              type="color"
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value)}
              style={{
                width: 32,
                height: 32,
                borderRadius: 6,
                border: "1px solid #ccc",
              }}
            />
            {predefinedColors.map((color) => (
              <button
                key={color.value}
                onClick={() => setSelectedColor(color.value)}
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 6,
                  border:
                    selectedColor === color.value
                      ? "2px solid #3b82f6"
                      : "1px solid #ccc",
                  background: color.value,
                  cursor: "pointer",
                }}
                title={color.name}
              />
            ))}
          </div>
        </div>

        {/* Selector de grosor */}
        <div style={{ padding: "10px 24px" }}>
          <label
            style={{
              fontSize: 13,
              fontWeight: 500,
              marginBottom: 6,
              display: "block",
            }}
          >
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
        <div style={{ padding: "10px 24px" }}>
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
      </div>
    </div>
  );
}
