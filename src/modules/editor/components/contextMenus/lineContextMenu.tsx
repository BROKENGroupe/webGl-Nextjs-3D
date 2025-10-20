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

function getSquarePoints(center: THREE.Vector3, size: number, direction?: THREE.Vector3) {
  // Si tienes una dirección principal, úsala para rotar el cuadrado
  const half = size / 2;
  // Puntos de un cuadrado alineado a los ejes
  const basePoints = [
    new THREE.Vector3(-half, 0, -half),
    new THREE.Vector3(half, 0, -half),
    new THREE.Vector3(half, 0, half),
    new THREE.Vector3(-half, 0, half),
  ];

  // Si tienes una dirección, calcula el cuaternión de rotación
  let quaternion = new THREE.Quaternion();
  if (direction) {
    // Rota el cuadrado para que el primer lado coincida con la dirección original
    const baseDir = new THREE.Vector3(1, 0, 0); // eje X
    quaternion.setFromUnitVectors(baseDir, direction.clone().normalize());
  }

  // Aplica la rotación y traslada al centro
  return basePoints.map(p => p.applyQuaternion(quaternion).add(center));
}

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

    if (squareMode && currentLines.length === 4) {
      // Extrae los puntos únicos en orden (asumiendo líneas conectadas)
      const orderedPoints = [
        currentLines[0].start,
        currentLines[0].end,
        currentLines[1].end,
        currentLines[2].end
      ];

      // Calcula el centro real del polígono
      const avg = orderedPoints.reduce((acc, p) => acc.add(p), new THREE.Vector3(0, 0, 0)).multiplyScalar(1 / orderedPoints.length);

      // Dirección del primer lado
      const dir = new THREE.Vector3().subVectors(currentLines[0].end, currentLines[0].start).normalize();

      // Obtén los nuevos puntos del cuadrado alineado
      const squarePoints = getSquarePoints(avg, newLength, dir);

      // Actualiza las líneas para formar el cuadrado cerrado
      const newLines = [
        { ...currentLines[0], start: squarePoints[0], end: squarePoints[1], length: newLength },
        { ...currentLines[1], start: squarePoints[1], end: squarePoints[2], length: newLength },
        { ...currentLines[2], start: squarePoints[2], end: squarePoints[3], length: newLength },
        { ...currentLines[3], start: squarePoints[3], end: squarePoints[0], length: newLength }, // <-- Cierra el cuadrado
      ];

      newLines.forEach(l => updateCurrentLine(l.id, l));
      setCurrentPoints(squarePoints);
      return;
    }

    if (keepProportion) {
      // Mantener proporción
      const factor = newLength / originalLineLength;
      const newLines = currentLines.map((l, idx) => {
        const origLen = originalLengths[idx];
        const scaledLen = origLen * factor;
        const start = l.start;
        const end = l.end;
        const center = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
        const direction = new THREE.Vector3().subVectors(end, start).normalize();
        const halfLength = scaledLen / 2;
        const newStart = new THREE.Vector3().addVectors(center, direction.clone().multiplyScalar(-halfLength));
        const newEnd = new THREE.Vector3().addVectors(center, direction.clone().multiplyScalar(halfLength));
        return {
          ...l,
          start: newStart,
          end: newEnd,
          length: scaledLen,
        };
      });
      newLines.forEach(l => updateCurrentLine(l.id, l));
      setLineLength(newLength);
      setOriginalLineLength(newLength);
      setOriginalLengths(newLines.map(l => l.length));
    } else {
      // Solo cambia la línea seleccionada
      const l = currentLines.find(l => l.id === lineId);
      if (!l) return;
      const start = l.start;
      const end = l.end;
      const center = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
      const direction = new THREE.Vector3().subVectors(end, start).normalize();
      const halfLength = newLength / 2;
      const newStart = new THREE.Vector3().addVectors(center, direction.clone().multiplyScalar(-halfLength));
      const newEnd = new THREE.Vector3().addVectors(center, direction.clone().multiplyScalar(halfLength));
      updateCurrentLine(lineId, {
        ...l,
        start: newStart,
        end: newEnd,
        length: newLength,
      });
      setLineLength(newLength);
      setOriginalLineLength(newLength);
      setOriginalLengths(currentLines.map(l => l.length || l.start.distanceTo(l.end)));
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
