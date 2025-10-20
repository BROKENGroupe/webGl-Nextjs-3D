import React, { useState } from "react";
import { useDrawingStore } from "@/modules/editor/store/drawingStore";
import { Button } from "@/shared/ui/button";
import EditableHeaderLine from "./EditableHeaderLine";
import * as THREE from "three";
import { LineAdvanceEngine } from "../../core/engine/LineAdvanceEngine";
import { ArrowRight } from 'lucide-react';
import { predefinedColors } from "@/shared/lib/utils";

export function LinePanel({
  lineId,
  onClose,
}: {
  lineId: string;
  onClose: () => void;
}) {
  const {
    currentLines,
    updateCurrentLine,
    setCurrentPoints,
    removeCurrentLine,
  } = useDrawingStore();
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
  const [keepProportion, setKeepProportion] = useState(true);
  const [squareMode, setSquareMode] = useState(false);
  const [limitVisualSize, setLimitVisualSize] = useState(true);
  const [showPolygonEditModal, setShowPolygonEditModal] = useState(false);

  React.useEffect(() => {
    setLineName(name);
    setSelectedColor(color);
    setLineWidth(width);
    setOriginalLineLength(length);
    setOriginalLengths(
      currentLines.map((l) => l.length || l.start.distanceTo(l.end))
    );
    setLineLength(length);
    // eslint-disable-next-line
  }, [lineId, name, color, width, length]);

  const handleApplyChanges = () => {
    updateCurrentLine(lineId, {
      name: lineName,
      color: selectedColor,
      width: lineWidth,
      length: lineLength,
    });
  };

  const handleChangeTitle = (newTitle: string) => {
    setLineName(newTitle);
    updateCurrentLine(lineId, { name: newTitle });
  };

  const handleLengthChange = (newLength: number) => {
    if (!originalLineLength || originalLengths.length !== currentLines.length)
      return;

    const scaledLength = LineAdvanceEngine.scaleLength(
      newLength,
      limitVisualSize
    );

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
        const orderedPoints =
          LineAdvanceEngine.getOrderedSquarePoints(currentLines);
        const avg = orderedPoints
          .reduce(
            (acc: THREE.Vector3, p: THREE.Vector3) => acc.add(p),
            new THREE.Vector3(0, 0, 0)
          )
          .multiplyScalar(1 / orderedPoints.length);
        const dir = new THREE.Vector3()
          .subVectors(orderedPoints[1], orderedPoints[0])
          .normalize();
        const squarePoints = LineAdvanceEngine.getSquarePoints(
          avg,
          scaledLength,
          dir
        );
        const newLines = LineAdvanceEngine.generateSquareLines(
          currentLines,
          squarePoints,
          newLength
        );

        newLines.forEach((l) => updateCurrentLine(l.id, l));
        setCurrentPoints(squarePoints);
        setLineLength(newLength);
        setOriginalLineLength(newLength);
        setOriginalLengths(newLines.map((l) => l.length));
        break;
      }
      case "proportion": {
        const newLines = LineAdvanceEngine.resizeProportionally(
          currentLines,
          originalLengths,
          originalLineLength,
          newLength
        );
        newLines.forEach((l) => updateCurrentLine(l.id, l));
        setLineLength(newLength);
        setOriginalLineLength(newLength);
        setOriginalLengths(newLines.map((l) => l.length));
        break;
      }
      case "polygon": {
        const result = LineAdvanceEngine.resizePolygonWithOneLine(
          currentLines,
          lineId,
          newLength
        );
        if (result) {
          result.newLines.forEach((l) => updateCurrentLine(l.id, l));
          setCurrentPoints(result.newPoints);
          setLineLength(newLength);
          setOriginalLineLength(newLength);
          setOriginalLengths(result.newLines.map((l) => l.length));
        }
        break;
      }
      case "single":
      default: {
        const l = currentLines.find((l) => l.id === lineId);
        if (!l) return;
        const { updatedLine, newPoints } =
          LineAdvanceEngine.resizeLineAndGetPoints(l, newLength);
        updateCurrentLine(lineId, updatedLine);
        setCurrentPoints(newPoints);
        setLineLength(newLength);
        setOriginalLineLength(newLength);
        setOriginalLengths(
          currentLines.map((l) => l.length || l.start.distanceTo(l.end))
        );
        break;
      }
    }
  };

  const handleDeleteLine = () => {
    removeCurrentLine(lineId);
    //onClose();
  };

  return (
    <div className="w-96 bg-white relative rounded-lg">
      {/* Botón de cerrar en la esquina superior izquierda */}
      <button
        onClick={onClose}
        aria-label="Cerrar panel"
        className="top-2 left-4 text-gray-500 hover:text-gray-700 transition-colors z-10"
      >
        <ArrowRight size={24} />
      </button>
      <div className="p-0 w-full overflow-y-auto mt-2">
        <h3 className="mb-5 px-3 pt-6 text-lg font-semibold">Configuración de línea</h3>
        <div className="flex items-center px-3">
          <EditableHeaderLine
            name={lineName}
            onUpdateName={handleChangeTitle}
          />
        </div>
        <div className="px-3 py-2 flex items-center gap-2">
          <input
            type="checkbox"
            checked={keepProportion}
            onChange={() => setKeepProportion((v) => !v)}
            id="keep-proportion-switch"
            className="w-4 h-4 accent-blue-600"
          />
          <label
            htmlFor="keep-proportion-switch"
            className="text-sm font-medium"
          >
            Mantener proporción al redimensionar
          </label>
        </div>
        <div className="px-3 py-2 flex items-center gap-2">
          <input
            type="checkbox"
            checked={squareMode}
            onChange={() => setSquareMode((v) => !v)}
            id="square-mode-switch"
            className="w-4 h-4 accent-blue-600"
          />
          <label
            htmlFor="square-mode-switch"
            className="text-sm font-medium"
          >
            Modo cuadrado (todas las líneas iguales)
          </label>
        </div>
        <div className="px-3 py-2 flex items-center gap-2">
          <input
            type="checkbox"
            checked={limitVisualSize}
            onChange={() => setLimitVisualSize((v) => !v)}
            id="limit-visual-size-switch"
            className="w-4 h-4 accent-blue-600"
          />
          <label
            htmlFor="limit-visual-size-switch"
            className="text-sm font-medium"
          >
            Limitar tamaño visual (no escalar más allá de un límite)
          </label>
        </div>
        <div className="px-3 py-2">
          <label className="text-sm font-medium mb-1 block">
            Largo de línea (m)
          </label>
          <input
            type="number"
            min={0.01}
            step={0.01}
            value={Number(lineLength.toFixed(2))}
            onChange={(e) => handleLengthChange(Number(e.target.value))}
            className="w-full px-3 py-2 rounded border border-gray-300 text-sm mb-2"
          />
        </div>
        <div className="px-3 py-2">
          <label className="text-sm font-medium mb-1 block">
            Color de línea
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="color"
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value)}
              className="w-8 h-8 rounded border border-gray-300"
            />
            {predefinedColors.map((color) => (
              <button
                key={color.value}
                onClick={() => setSelectedColor(color.value)}
                className={`w-6 h-6 rounded border transition-colors ${
                  selectedColor === color.value
                    ? "border-blue-500 ring-2 ring-blue-300"
                    : "border-gray-300"
                }`}
                style={{ background: color.value }}
                title={color.name}
                type="button"
              />
            ))}
          </div>
        </div>
        <div className="px-3 py-2">
          <label className="text-sm font-medium mb-1 block">
            Grosor de línea (m)
          </label>
          <input
            type="number"
            value={lineWidth}
            onChange={(e) => setLineWidth(Number(e.target.value))}
            className="w-full px-3 py-2 rounded border border-gray-300 text-sm mb-2"
          />
        </div>
        <div className="px-3 py-4 flex gap-4">
          <Button
            variant="default"
            className="flex-1 bg-gray-900 text-white rounded font-semibold text-sm py-2 shadow-none border border-gray-300"
            onClick={handleApplyChanges}
          >
            Aplicar
          </Button>
          <Button
            variant="destructive"
            className="flex-1 bg-red-500 text-white rounded font-semibold text-sm py-2 shadow-none border border-gray-300"
            onClick={handleDeleteLine}
          >
            Eliminar
          </Button>
        </div>
      </div>
    </div>
  );
}


