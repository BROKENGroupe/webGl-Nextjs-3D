import * as THREE from "three";
import { LineGeometryEngine } from "../../core/engine/LineGeometryEngine";
import { ThreeGeometryAdapter } from "../../core/engine/adapters/ThreeGeometryAdapter";
import { LINE_COLORS } from "@/config/materials";
import React, { useMemo } from "react";
import EngineFactory from "../../core/engine/EngineFactory";

type VertexProps = {
  point: THREE.Vector3;
  hovered: boolean;
  dragged: boolean;
  isShiftMode: boolean;
  eventHandler?: any;
  index: number;
};

export function Vertex({
  point,
  hovered,
  dragged,
  isShiftMode,
  eventHandler = {},
  index,
}: VertexProps) {
  // Instancia el adaptador y el motor de geometría
  const geometryAdapter = EngineFactory.getGeometryAdapter();
  const lineGeometryEngine = useMemo(() => new LineGeometryEngine(geometryAdapter), [geometryAdapter]);

  // Usa la instancia para calcular el scale
  const scale = lineGeometryEngine.calculateVertexScale(hovered, dragged);

  const baseColor = dragged
    ? (isShiftMode ? LINE_COLORS.vertexDragged : LINE_COLORS.vertexDragged)
    : hovered ? LINE_COLORS.vertexHover : LINE_COLORS.vertex;

  const outlineColor = dragged
    ? "#ffffff"
    : hovered ? LINE_COLORS.vertexOutlineHover : LINE_COLORS.vertexOutline;

  return (
    <group>
      {/* VÉRTICE PRINCIPAL */}
      <mesh
        position={[point.x, point.y + 0.008, point.z]}
        rotation={[-Math.PI / 2, 0, 0]}
        scale={[scale, scale, 1]}
        {...eventHandler}
      >
        <planeGeometry args={[0.16, 0.16]} />
        <meshBasicMaterial
          color={baseColor}
          transparent={false}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* CONTORNO DEL VÉRTICE */}
      <mesh
        position={[point.x, point.y + 0.009, point.z]}
        rotation={[-Math.PI / 2, 0, 0]}
        scale={[scale * 1.05, scale * 1.05, 1]}
      >
        <ringGeometry args={[0.08, 0.086, 4]} />
        <meshBasicMaterial
          color={outlineColor}
          transparent={false}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* PUNTO CENTRAL */}
      <mesh
        position={[point.x, point.y + 0.01, point.z]}
        rotation={[-Math.PI / 2, 0, 0]}
        scale={[scale * 0.3, scale * 0.3, 1]}
      >
        <circleGeometry args={[0.025, 8]} />
        <meshBasicMaterial
          color={dragged ? "#000000" : "#ffffff"}
          transparent={false}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* CRUZ DE SELECCIÓN */}
      {(hovered || dragged) && (
        <>
          {/* Línea horizontal */}
          <mesh
            position={[point.x, point.y + 0.011, point.z]}
            rotation={[-Math.PI / 2, 0, 0]}
            scale={[scale * 1.4, scale * 0.1, 1]}
          >
            <planeGeometry args={[0.2, 0.015]} />
            <meshBasicMaterial
              color="#ffffff"
              transparent={true}
              opacity={0.8}
              side={THREE.DoubleSide}
            />
          </mesh>
          {/* Línea vertical */}
          <mesh
            position={[point.x, point.y + 0.011, point.z]}
            rotation={[-Math.PI / 2, 0, 0]}
            scale={[scale * 0.1, scale * 1.4, 1]}
          >
            <planeGeometry args={[0.015, 0.2]} />
            <meshBasicMaterial
              color="#ffffff"
              transparent={true}
              opacity={0.8}
              side={THREE.DoubleSide}
            />
          </mesh>
        </>
      )}
    </group>
  );
}