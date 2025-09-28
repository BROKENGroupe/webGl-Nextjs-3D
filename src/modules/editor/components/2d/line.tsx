import * as THREE from "three";
import { LineGeometryEngine } from "../../core/engine/LineGeometryEngine";
import { LINE_COLORS } from "@/config/materials";
import { Html } from "@react-three/drei";
import React, { useState, useEffect, useRef } from "react";
import { useDrawingStore } from "@/modules/editor/store/drawingStore";

type LineProps = {
  id?: string;
  start: THREE.Vector3;
  end: THREE.Vector3;
  hovered: boolean;
  eventHandler?: any;
  color?: string;
  onContextLineMenu?: (id: string) => void; // <-- NUEVO
};

export function Line({
  id,
  start,
  end,
  hovered,
  eventHandler = {},
  color = LINE_COLORS.line,
  onContextLineMenu,
}: LineProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const { currentLines, setCurrentLines, updateCurrentLine } =
    useDrawingStore();
  const lineIdRef = useRef(
    id || `line-${Date.now()}-${Math.floor(Math.random() * 100000)}`
  );

  const transform = LineGeometryEngine.calculateLineTransform(start, end);
  const dimensions = LineGeometryEngine.calculateLineDimensions(hovered);
  const distance = transform.distance;

  useEffect(() => {
    // Buscar si la línea ya existe por id
    const exists = currentLines.some((line) => line.id === lineIdRef.current);

    if (exists) {
      // Actualiza la línea existente
      updateCurrentLine(lineIdRef.current, {
        start,
        end,
        color,
        length: distance,
        width: dimensions.width,
      });
    } else {
      // Agrega una nueva línea
      setCurrentLines([
        ...currentLines,
        {
          id: lineIdRef.current,
          start,
          end,
          color,
          length: distance,
          width: dimensions.width,
        },
      ]);
    }
  }, [start, end, color, dimensions.width]);

  // Calcula la distancia en tiempo real

  return (
    <group>
      {/* LÍNEA PRINCIPAL */}
      <mesh
        style={{ pointerEvents: "auto", cursor: "hand" }}
        position={[
          transform.midPoint.x,
          transform.midPoint.y + 0.005,
          transform.midPoint.z,
        ]}
        quaternion={[
          transform.quaternion.x,
          transform.quaternion.y,
          transform.quaternion.z,
          transform.quaternion.w,
        ]}
        {...eventHandler}
        onContextMenu={(e) => {
          e.stopPropagation();
          if (onContextLineMenu) onContextLineMenu(lineIdRef.current);
        }}
      >
        <boxGeometry
          args={[dimensions.width, transform.distance, dimensions.depth]}
        />
        <meshBasicMaterial
          color={color}
          transparent={false}
          side={THREE.DoubleSide}
        />
        {/* Dimensiones visibles en el centro */}
        <Html
          center
          distanceFactor={10}
          style={{ pointerEvents: "auto", fontWeight: "bold", color: "#222" }}
        >
          <span
            onPointerEnter={() => setShowTooltip(true)}
            onPointerLeave={() => setShowTooltip(false)}
            style={{
              padding: "2px 6px",
              borderRadius: 4,
              cursor: "pointer",
              position: "relative",
            }}
            onClick={(e) => {
              e.stopPropagation();
              if (onContextLineMenu) {
                onContextLineMenu(lineIdRef.current);               
              }
            }}
          >
            {distance.toFixed(2)} m
            {showTooltip && (
              <span
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "-2.2em",
                  transform: "translateX(-50%)",
                  background: "#222",
                  color: "#fff",
                  padding: "4px 10px",
                  borderRadius: 4,
                  fontSize: 12,
                  whiteSpace: "nowrap",
                  zIndex: 0,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                }}
              >
                Distancia en metros
              </span>
            )}
          </span>
        </Html>
      </mesh>
      {/* CONTORNO DE LÍNEA */}
      <mesh
        position={[
          transform.midPoint.x,
          transform.midPoint.y + 0.006,
          transform.midPoint.z,
        ]}
        quaternion={[
          transform.quaternion.x,
          transform.quaternion.y,
          transform.quaternion.z,
          transform.quaternion.w,
        ]}
      >
        <boxGeometry
          args={[dimensions.outlineWidth, transform.distance + 0.015, 0.004]}
        />
        <meshBasicMaterial
          // color={
          //   hovered ? LINE_COLORS.lineOutlineHover : LINE_COLORS.lineOutline
          // }
          color={color}
          transparent={true}
          opacity={1}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}
