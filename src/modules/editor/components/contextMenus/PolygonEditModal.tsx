import React, { useState, useEffect, useMemo } from "react";
import * as THREE from "three";
import { LineAdvanceEngine } from "../../core/engine/LineAdvanceEngine";
import EngineFactory from "../../core/engine/EngineFactory";
import { useDrawingStore } from "@/modules/editor/store/drawingStore";
import { Button } from "@/shared/ui/button";
import { Card, CardHeader, CardContent, CardFooter } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";

/**
 * Modal para editar lados y colores de un polígono.
 */
interface PolygonEditModalProps {
  visible: boolean;
  onClose: () => void;
}

export function PolygonEditModal({ visible, onClose }: PolygonEditModalProps) {
  const { currentPoints, setCurrentPoints, updateCurrentLine } = useDrawingStore();

  const [sideLengths, setSideLengths] = useState<number[]>([]);
  const [sideColors, setSideColors] = useState<string[]>([]);

  const geometryAdapter = EngineFactory.getGeometryAdapter();
  const lineGeometryEngine = useMemo(() => new LineAdvanceEngine(geometryAdapter), [geometryAdapter]);

  useEffect(() => {
    if (visible && currentPoints.length >= 3) {
      setSideLengths(
        currentPoints.map((p, idx, arr) =>
          p.clone
            ? p.clone().distanceTo(arr[(idx + 1) % arr.length])
            : 0
        )
      );
      setSideColors(Array(currentPoints.length).fill("#0000ff"));
    }
  }, [visible, currentPoints]);

  if (!visible) return null;

  if (currentPoints.length < 3) {
    return (
      <div className="fixed inset-0 bg-black/25 z-[99999] flex items-center justify-center" onClick={onClose}>
        <Card className="min-w-[340px] relative" onClick={e => e.stopPropagation()}>
          <CardHeader>
            <h3 className="font-semibold text-lg mb-2">Editar lados y colores</h3>
          </CardHeader>
          <CardContent>
            <p className="text-red-500">Debes tener al menos 3 lados para editar el polígono.</p>
          </CardContent>
          <CardFooter className="flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={onClose}>
              Cerrar
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const handleApplyPolygonChanges = () => {
    const center = currentPoints.reduce((acc, p) => acc.add(p), new THREE.Vector3()).multiplyScalar(1 / currentPoints.length);
    const direction = new THREE.Vector3().subVectors(currentPoints[1], currentPoints[0]).normalize();

    const { lines, points } = lineGeometryEngine.generateQuadrilateralFromSizes(sideLengths, center, direction);

    setCurrentPoints(points);
    lines.forEach(l => updateCurrentLine(l.id, l));
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/25 z-[99999] flex items-center justify-center" onClick={onClose}>
      <Card className="min-w-[340px] relative" onClick={e => e.stopPropagation()}>
        <CardHeader>
          <h3 className="font-semibold text-lg mb-2">Editar lados y colores</h3>
        </CardHeader>
        <CardContent>
          {sideLengths.map((len, idx) => (
            <div key={idx} className="flex items-center gap-2 mb-2">
              <Label htmlFor={`length-${idx}`} className="text-xs text-gray-600">Lado {idx + 1}</Label>
              <Input
                id={`length-${idx}`}
                type="number"
                min={0.01}
                step={0.01}
                value={Number(len.toFixed(2))}
                onChange={e => {
                  const newLengths = [...sideLengths];
                  newLengths[idx] = Number(e.target.value);
                  setSideLengths(newLengths);
                }}
                className="w-20"
              />
              <Input
                id={`color-${idx}`}
                type="color"
                value={sideColors[idx]}
                onChange={e => {
                  const newColors = [...sideColors];
                  newColors[idx] = e.target.value;
                  setSideColors(newColors);
                }}
                className="w-7 h-7 p-0 border rounded"
              />
            </div>
          ))}
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button variant="default" className="flex-1" onClick={handleApplyPolygonChanges}>
            Aplicar
          </Button>
          <Button variant="secondary" className="flex-1" onClick={onClose}>
            Cancelar
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

