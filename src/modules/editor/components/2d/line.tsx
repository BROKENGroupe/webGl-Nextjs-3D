import * as THREE from "three";
import { LineGeometryEngine } from "../../core/engine/LineGeometryEngine";
import { ThreeGeometryAdapter } from "../../core/engine/adapters/ThreeGeometryAdapter";
import { LINE_COLORS } from "@/config/materials";
import { Html } from "@react-three/drei";
import React, { useState, useEffect, useRef, useMemo } from "react";
import { useDrawingStore } from "@/modules/editor/store/drawingStore";
import EngineFactory from "../../core/engine/EngineFactory";

type LineProps = {
  id?: string;
  point: THREE.Vector3;
  start: THREE.Vector3;
  end: THREE.Vector3;
  hovered: boolean;
  eventHandler?: any;
  color?: string;
  onContextLineMenu?: (id: string) => void;
};

export function Line({
  id,
  start,
  point,
  end,
  hovered,
  eventHandler = {},
  color = LINE_COLORS.line,
  onContextLineMenu,
}: LineProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const { currentLines, setCurrentLines, updateCurrentLine } = useDrawingStore();

  const lineIdRef = useRef(
    id || `line-${Date.now()}-${Math.floor(Math.random() * 100000)}`
  );

  // Instancia el adaptador y el motor de geometría
  const geometryAdapter = EngineFactory.getGeometryAdapter();
  const lineGeometryEngine = useMemo(() => new LineGeometryEngine(geometryAdapter), [geometryAdapter]);

  // Busca la línea actualizada en el store
  const line = currentLines.find((l) => l.id === lineIdRef.current);

  // Calcula la distancia real usando la instancia
  const realDistance = lineGeometryEngine.calculateLineTransform(start, end).distance;

  // Usa el valor editado si existe, si no la distancia real
  const legendDistance = line?.length ?? realDistance;

  const transform = lineGeometryEngine.calculateLineTransform(start, end);
  const dimensions = lineGeometryEngine.calculateLineDimensions(hovered);

  useEffect(() => {
    // Buscar si la línea ya existe por id
    const exists = currentLines.some((line) => line.id === lineIdRef.current);

    if (exists) {
      // Actualiza la línea existente
      updateCurrentLine(lineIdRef.current, {
        start,
        end,
        color,
        length: realDistance,
        width: dimensions.width,
      });
    } else {
      // Agrega una nueva línea
      setCurrentLines([
        ...currentLines,
        {
          id: lineIdRef.current,
          name: lineIdRef.current || "line",
          start,
          end,
          color,
          length: realDistance,
          width: dimensions.width,
        },
      ]);
    }
  }, [start, end, color, dimensions.width]);

  // Usa el color del store si existe, si no el prop
  const renderColor = line?.color ?? color;

  return (
    <group>
      {/* LÍNEA PRINCIPAL */}
      <mesh
        style={{ pointerEvents: "auto", cursor: "hand" }}
        position={[
          transform.midPoint.x,
          transform.midPoint.y,
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
          args={[transform.distance, dimensions.width, dimensions.depth]}
        />
        <meshBasicMaterial
          color={renderColor}
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
            {legendDistance.toFixed(2)} m
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
                {line?.name || <span style={{ fontStyle: "italic" }}>Sin nombre</span>}<br />
              </span>
            )}
          </span>
        </Html>
      </mesh>
      {/* CONTORNO DE LÍNEA */}
      <mesh
        position={[
          transform.midPoint.x,
          transform.midPoint.y,
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
          args={[transform.distance + 0.015, 0.004, dimensions.outlineWidth]}
        />
        <meshBasicMaterial
          color={renderColor}
          transparent={true}
          opacity={1}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

