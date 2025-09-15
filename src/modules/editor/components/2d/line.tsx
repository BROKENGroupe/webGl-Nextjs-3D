import * as THREE from "three";
import { LineGeometryEngine } from "../../core/engine/LineGeometryEngine";
import { LINE_COLORS } from "@/config/materials";
import { Html } from "@react-three/drei";
import React, { useState } from "react";

type LineProps = {
  start: THREE.Vector3;
  end: THREE.Vector3;
  hovered: boolean;
  eventHandler?: any;
  color?: string;
};

export function Line({
  start,
  end,
  hovered,
  eventHandler = {},
  color = LINE_COLORS.line,
}: LineProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  const transform = LineGeometryEngine.calculateLineTransform(start, end);
  const dimensions = LineGeometryEngine.calculateLineDimensions(hovered);

  // Calcula la distancia en tiempo real
  const distance = transform.distance;

  return (
    <group>
      {/* LÍNEA PRINCIPAL */}
      <mesh
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
      >
        <boxGeometry
          args={[dimensions.width, transform.distance, dimensions.depth]}
        />
        <meshBasicMaterial
          color={
            hovered
              ? new THREE.Color(LINE_COLORS.line).multiplyScalar(1.3)
              : LINE_COLORS.line
          }
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
              cursor: "help",
              position: "relative",
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
                  zIndex: 10,
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
          color={
            hovered ? LINE_COLORS.lineOutlineHover : LINE_COLORS.lineOutline
          }
          transparent={true}
          opacity={0.6}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}
