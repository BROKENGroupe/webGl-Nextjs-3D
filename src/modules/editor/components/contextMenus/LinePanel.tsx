import React, { useState } from "react";
import { useDrawingStore } from "@/modules/editor/store/drawingStore";
import { Button } from "@/shared/ui/button";
import EditableHeaderLine from "./EditableHeaderLine";
import * as THREE from "three";
import { LineAdvanceEngine, resizeLineWithSnapAndUpdateNeighbors } from "../../core/engine/LineAdvanceEngine";
import { ArrowRight } from "lucide-react";
import { predefinedColors } from "@/shared/lib/utils";
import { Checkbox } from "@/shared/ui/checkbox";

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

  // Snap-to-grid size (puedes obtenerlo de la configuración global si lo tienes)
  const snapSize = 0.5;

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

    // NO aplicar snap-to-grid al valor ingresado, usar el valor exacto del input
    const scaledLength = LineAdvanceEngine.scaleLength(
      newLength,
      limitVisualSize,
      snapSize
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
      case "square":
      case "polygon": {
        const { updatedLines, newPoints } = resizeLineWithSnapAndUpdateNeighbors(
          lineId,
          currentLines,
          scaledLength
        );
        updatedLines.forEach((l) => updateCurrentLine(l.id, l));
        setCurrentPoints(newPoints[0].clone ? [...newPoints, newPoints[0].clone()] : []);
        setLineLength(scaledLength);
        setOriginalLineLength(scaledLength);
        setOriginalLengths(updatedLines.map((l) => l.length));
        break;
      }
      case "proportion": {
        const newLines = LineAdvanceEngine.resizeProportionally(
          currentLines,
          originalLengths,
          originalLineLength,
          scaledLength,
          snapSize
        );
        newLines.forEach((l) => updateCurrentLine(l.id, l));
        setLineLength(scaledLength);
        setOriginalLineLength(scaledLength);
        setOriginalLengths(newLines.map((l) => l.length));
        break;
      }
      case "single":
      default: {
        const l = currentLines.find((l) => l.id === lineId);
        if (!l) return;
        const { updatedLines, newPoints } = resizeLineWithSnapAndUpdateNeighbors(
          lineId,
          currentLines,
          scaledLength
        );
        updatedLines.forEach((l) => updateCurrentLine(l.id, l));
        setCurrentPoints(newPoints[0].clone ? [...newPoints, newPoints[0].clone()] : []);
        setLineLength(scaledLength);
        setOriginalLineLength(scaledLength);
        setOriginalLengths(
          currentLines.map((l) => l.length || l.start.distanceTo(l.end))
        );
        break;
      }
    }
  };

  const handleDeleteLine = () => {
    removeCurrentLine(lineId);
  };

  // Permite edición controlada del input
  const [inputLength, setInputLength] = useState(lineLength);

  React.useEffect(() => {
    setInputLength(lineLength);
  }, [lineLength]);

  const handleLengthInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if(value === "") {
      return;
    }
    // Permite vacío o número válido
    setInputLength(Number(value));
  };

  const handleLengthBlur = () => {
    // Solo aplica el cambio si es un número válido
    if (typeof inputLength === "number" && !isNaN(inputLength)) {
      handleLengthChange(inputLength);
    }
  };

  return (
    <div className="bg-white relative">
      {/* Botón de cerrar en la esquina superior izquierda */}
      <button
        onClick={onClose}
        aria-label="Cerrar panel"
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors z-10"
      >
        <ArrowRight size={22} />
      </button>
      <div className="p-0 pt-8 w-full overflow-y-auto">
        <h3 className="mb-6 px-3 text-xl font-bold text-gray-900 tracking-tight">
          Configuración de línea
        </h3>
        <div className="flex items-center px-3 mb-4">
          <EditableHeaderLine
            name={lineName}
            onUpdateName={handleChangeTitle}
          />
        </div>
        <div className="space-y-2 px-3">
          <div className="flex items-center gap-3">
            <Checkbox
              id="keep-proportion-switch"
              checked={keepProportion}
              onCheckedChange={(v: boolean | "indeterminate") =>
                setKeepProportion(!!v)
              }
            />
            <label
              htmlFor="keep-proportion-switch"
              className="text-sm font-medium text-gray-700"
            >
              Mantener proporción al redimensionar
            </label>
          </div>
          <div className="flex items-center gap-3">
            <Checkbox
              id="square-mode-switch"
              checked={squareMode}
              onCheckedChange={(v: boolean | "indeterminate") =>
                setSquareMode(!!v)
              }
            />
            <label
              htmlFor="square-mode-switch"
              className="text-sm font-medium text-gray-700"
            >
              Modo cuadrado{" "}
              <span className="text-gray-400">(todas las líneas iguales)</span>
            </label>
          </div>
          <div className="flex items-center gap-3">
            <Checkbox
              id="limit-visual-size-switch"
              checked={limitVisualSize}
              onCheckedChange={(v: boolean | "indeterminate") =>
                setLimitVisualSize(!!v)
              }
            />
            <label
              htmlFor="limit-visual-size-switch"
              className="text-sm font-medium text-gray-700"
            >
              Limitar tamaño visual{" "}
              <span className="text-gray-400">
                (no escalar más allá de un límite)
              </span>
            </label>
          </div>
        </div>
        <div className="px-3 pt-6">
          <label className="text-sm font-semibold mb-1 block text-gray-700">
            Largo de línea (m)
          </label>
          <input
            type="number"
            min={1}
            value={inputLength}
            onChange={handleLengthInput}
            onBlur={handleLengthBlur}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
          />
          <span className="text-xs text-gray-400">
            Snap-to-grid: {snapSize} m
          </span>
        </div>
        <div className="px-3 pt-4">
          <label className="text-sm font-semibold mb-1 block text-gray-700">
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
        <div className="px-3 pt-4">
          <label className="text-sm font-semibold mb-1 block text-gray-700">
            Grosor de línea (m)
          </label>
          <input
            type="number"
            value={lineWidth}
            onChange={(e) => setLineWidth(Number(e.target.value))}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
          />
        </div>
        <div className="px-3 py-6 flex gap-4">
          <Button
            variant="default"
            className="flex-1 bg-gray-900 text-white rounded-lg font-semibold text-base py-2 shadow-none border border-gray-300 hover:bg-gray-800 transition"
            onClick={handleApplyChanges}
          >
            Aplicar
          </Button>
          <Button
            variant="destructive"
            className="flex-1 bg-red-500 text-white rounded-lg font-semibold text-base py-2 shadow-none border border-gray-300 hover:bg-red-600 transition"
            onClick={handleDeleteLine}
          >
            Eliminar
          </Button>
        </div>
      </div>
    </div>
  );
}
