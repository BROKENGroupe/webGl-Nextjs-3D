import React, { useState, useEffect } from "react";
import * as THREE from "three";
import { LineAdvanceEngine } from "../../core/engine/LineAdvanceEngine";
import { useDrawingStore } from "@/modules/editor/store/drawingStore";
import { Button } from "@/shared/ui/button";

interface PolygonEditModalProps {
  visible: boolean;
  onClose: () => void;
}

export function PolygonEditModal({ visible, onClose }: PolygonEditModalProps) {
  const { currentPoints, setCurrentPoints, updateCurrentLine } = useDrawingStore();

  const [sideLengths, setSideLengths] = useState<number[]>([]);
  const [sideColors, setSideColors] = useState<string[]>([]);

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
            minWidth: "340px",
            background: "#fff",
            border: "1px solid #ccc",
            boxShadow: "0 2px 16px rgba(0,0,0,0.25)",
            borderRadius: "12px",
            padding: "24px 0",
            zIndex: 99999,
            position: "relative",
          }}
          onClick={e => e.stopPropagation()}
        >
          <div style={{ padding: "10px 24px" }}>
            <h3 style={{ fontWeight: 600, fontSize: 16, marginBottom: 12 }}>Editar lados y colores</h3>
            <p style={{ color: "#ef4444" }}>Debes tener al menos 3 lados para editar el polígono.</p>
          </div>
          <div style={{ padding: "10px 24px", display: "flex", gap: 8 }}>
            <Button
              variant="secondary"
              style={{
                flex: 1,
                background: "#fff",
                color: "#222",
                borderRadius: 5,
                fontWeight: 400,
                fontSize: 13,
                padding: "7px 0",
                minWidth: 0,
                boxShadow: "none",
                border: "1px solid #e5e7eb"
              }}
              onClick={onClose}
            >
              Cerrar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const handleApplyPolygonChanges = () => {    
      const center = currentPoints.reduce((acc, p) => acc.add(p), new THREE.Vector3()).multiplyScalar(1 / 4);
      const direction = new THREE.Vector3().subVectors(currentPoints[1], currentPoints[0]).normalize();
      const { lines, points } = LineAdvanceEngine.generateQuadrilateralFromSizes(sideLengths, center, direction);

      setCurrentPoints(points);
      lines.forEach(l => updateCurrentLine(l.id, l));
      onClose();    
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
          minWidth: "340px",
          background: "#fff",
          border: "1px solid #ccc",
          boxShadow: "0 2px 16px rgba(0,0,0,0.25)",
          borderRadius: "12px",
          padding: "24px 0",
          zIndex: 99999,
          position: "relative",
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ padding: "10px 24px" }}>
          <h3 style={{ fontWeight: 600, fontSize: 16, marginBottom: 12 }}>Editar lados y colores</h3>
          {sideLengths.map((len, idx) => (
            <div key={idx} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <input
                type="number"
                min={0.01}
                step={0.01}
                value={Number(len.toFixed(2))}
                onChange={e => {
                  const newLengths = [...sideLengths];
                  newLengths[idx] = Number(e.target.value);
                  setSideLengths(newLengths);
                }}
                style={{
                  width: 70,
                  padding: "4px 8px",
                  borderRadius: 5,
                  border: "1px solid #ccc",
                  fontSize: 13,
                }}
              />
              <input
                type="color"
                value={sideColors[idx]}
                onChange={e => {
                  const newColors = [...sideColors];
                  newColors[idx] = e.target.value;
                  setSideColors(newColors);
                }}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 6,
                  border: "1px solid #ccc",
                }}
              />
              <span style={{ fontSize: 12, color: "#666" }}>Lado {idx + 1}</span>
            </div>
          ))}
        </div>
        <div style={{ padding: "10px 24px", display: "flex", gap: 8 }}>
          <Button
            variant="default"
            style={{
              flex: 1,
              background: "#222",
              color: "#fff",
              borderRadius: 5,
              fontWeight: 500,
              fontSize: 13,
              padding: "7px 0",
              minWidth: 0,
              boxShadow: "none",
              border: "1px solid #e5e7eb"
            }}
            onClick={handleApplyPolygonChanges}
          >
            Aplicar
          </Button>
          <Button
            variant="secondary"
            style={{
              flex: 1,
              background: "#fff",
              color: "#222",
              borderRadius: 5,
              fontWeight: 400,
              fontSize: 13,
              padding: "7px 0",
              minWidth: 0,
              boxShadow: "none",
              border: "1px solid #e5e7eb"
            }}
            onClick={onClose}
          >
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );
}

