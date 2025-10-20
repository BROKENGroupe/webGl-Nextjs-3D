import React, { useState } from "react";
import { useDrawingStore } from "@/modules/editor/store/drawingStore";
import { Button } from "@/shared/ui/button";
import EditableHeaderLine from "./EditableHeaderLine";
import * as THREE from "three";
import { LineAdvanceEngine } from "../../core/engine/LineAdvanceEngine";


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
  const { currentLines, updateCurrentLine, setCurrentPoints } = useDrawingStore();

  const line = currentLines.find((l) => l.id === lineId);

  const name = line?.name ?? "";
  const color = line?.color || "#000000";
  const width = line?.width || 0.02;
  const length = line?.length || (line ? line.start.distanceTo(line.end) : 0);

  const [lineName, setLineName] = useState(name);
  const [selectedColor, setSelectedColor] = useState(color);
  const [lineWidth, setLineWidth] = useState(width);
  const [lineLength, setLineLength] = useState(length);
  const [originalLengths, setOriginalLengths] = useState<number[]>([]);
  const [originalLineLength, setOriginalLineLength] = useState<number>(length);
  const [keepProportion, setKeepProportion] = useState(true); // <-- Switch de proporción
  const [squareMode, setSquareMode] = useState(false); // <-- Nuevo estado
  const [limitVisualSize, setLimitVisualSize] = useState(true); // Nuevo switch

  React.useEffect(() => {
    setLineName(name);
    setSelectedColor(color);
    setLineWidth(width);
    setLineLength(length);
    setOriginalLineLength(length);
    setOriginalLengths(currentLines.map(l => l.length || l.start.distanceTo(l.end)));
  }, [lineId, name, color, width, length, currentLines]);

  if (!visible) return null;

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

  // Handler para cambiar el largo y ajustar proporcionalmente si el switch está activo
  const handleLengthChange = (newLength: number) => {
    if (!originalLineLength || originalLengths.length !== currentLines.length) return;

    const scaledLength = LineAdvanceEngine.scaleLength(newLength, limitVisualSize);

    let action: "square" | "proportion" | "polygon" | "single" = "single";
    if (squareMode && currentLines.length === 4) {
      action = "square";
    } else if (keepProportion) {
      action = "proportion";
    } else if (currentLines.length === 4) {
      action = "polygon";
    }

    switch (action) {
      case "square": {
        const orderedPoints = LineAdvanceEngine.getOrderedSquarePoints(currentLines);
        const avg = orderedPoints.reduce((acc: THREE.Vector3, p: THREE.Vector3) => acc.add(p), new THREE.Vector3(0, 0, 0)).multiplyScalar(1 / orderedPoints.length);
        const dir = new THREE.Vector3().subVectors(orderedPoints[1], orderedPoints[0]).normalize();
        const squarePoints = LineAdvanceEngine.getSquarePoints(avg, scaledLength, dir);
        const newLines = LineAdvanceEngine.generateSquareLines(currentLines, squarePoints, newLength);

        newLines.forEach(l => updateCurrentLine(l.id, l));
        setCurrentPoints(squarePoints);
        setLineLength(newLength);
        setOriginalLineLength(newLength);
        setOriginalLengths(newLines.map(l => l.length));
        break;
      }
      case "proportion": {
        const newLines = LineAdvanceEngine.resizeProportionally(currentLines, originalLengths, originalLineLength, newLength);
        newLines.forEach(l => updateCurrentLine(l.id, l));
        setLineLength(newLength);
        setOriginalLineLength(newLength);
        setOriginalLengths(newLines.map(l => l.length));
        break;
      }
      case "polygon": {
        const result = LineAdvanceEngine.resizePolygonWithOneLine(currentLines, lineId, newLength);
        if (result) {
          result.newLines.forEach(l => updateCurrentLine(l.id, l));
          setCurrentPoints(result.newPoints);
          setLineLength(newLength);
          setOriginalLineLength(newLength);
          setOriginalLengths(result.newLines.map(l => l.length));
        }
        break;
      }
      case "single":
      default: {
        const l = currentLines.find(l => l.id === lineId);
        if (!l) return;
        const { updatedLine, newPoints } = LineAdvanceEngine.resizeLineAndGetPoints(l, newLength);
        updateCurrentLine(lineId, updatedLine);
        setCurrentPoints(newPoints);
        setLineLength(newLength);
        setOriginalLineLength(newLength);
        setOriginalLengths(currentLines.map(l => l.length || l.start.distanceTo(l.end)));
        break;
      }
    }
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

        {/* Switch para mantener proporción */}
        <div style={{ padding: "10px 24px", display: "flex", alignItems: "center", gap: 8 }}>
          <input
            type="checkbox"
            checked={keepProportion}
            onChange={() => setKeepProportion(v => !v)}
            id="keep-proportion-switch"
            style={{ width: 18, height: 18 }}
          />
          <label htmlFor="keep-proportion-switch" style={{ fontSize: 14, fontWeight: 500 }}>
            Mantener proporción al redimensionar
          </label>
        </div>

        {/* Modo cuadrado */}
        <div style={{ padding: "10px 24px", display: "flex", alignItems: "center", gap: 8 }}>
          <input
            type="checkbox"
            checked={squareMode}
            onChange={() => setSquareMode(v => !v)}
            id="square-mode-switch"
            style={{ width: 18, height: 18 }}
          />
          <label htmlFor="square-mode-switch" style={{ fontSize: 14, fontWeight: 500 }}>
            Modo cuadrado (todas las líneas iguales)
          </label>
        </div>

        {/* Limitar tamaño visual */}
        <div style={{ padding: "10px 24px", display: "flex", alignItems: "center", gap: 8 }}>
          <input
            type="checkbox"
            checked={limitVisualSize}
            onChange={() => setLimitVisualSize(v => !v)}
            id="limit-visual-size-switch"
            style={{ width: 18, height: 18 }}
          />
          <label htmlFor="limit-visual-size-switch" style={{ fontSize: 14, fontWeight: 500 }}>
            Limitar tamaño visual (no escalar más allá de un límite)
          </label>
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

        {/* Modo una sola línea */}
        <div style={{ padding: "10px 24px", display: "flex", alignItems: "center", gap: 8 }}>
          <button
            type="button"
            style={{
              padding: "6px 12px",
              borderRadius: 6,
              border: "1px solid #ccc",
              background: !squareMode && !keepProportion ? "#3b82f6" : "#fff",
              color: !squareMode && !keepProportion ? "#fff" : "#222",
              fontWeight: 500,
              cursor: "pointer"
            }}
            onClick={() => {
              setSquareMode(false);
              setKeepProportion(false);
            }}
          >
            Redimensionar solo esta línea
          </button>
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
