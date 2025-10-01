import { COLORS } from "@/config/materials";
import { Edges } from "@react-three/drei";
import React, { useState, useMemo } from "react";
import * as THREE from "three";

export function OpeningMesh({
  opening,
  coord,
  nextCoord,
  wallHeight,
  eventHandlers,
  previewElements,
}: {
  opening: any;
  coord: { x: number; z: number };
  nextCoord: { x: number; z: number };
  wallHeight: number;
  eventHandlers: any;
  previewElements?: React.ReactNode;
}) {
  const [hovered, setHovered] = useState(false);

  // Posición alineada con la pared y abertura
  const x = coord.x + opening.position * (nextCoord.x - coord.x);
  const z = coord.z + opening.position * (nextCoord.z - coord.z);
  const y = (opening.bottomOffset ?? 1.0) + (opening.height ?? 1.2) / 2;

  // Ángulo de la pared (en radianes)
  const dx = nextCoord.x - coord.x;
  const dz = nextCoord.z - coord.z;
  const wallAngle = Math.atan2(dz, dx);

  // Memoiza la geometría del borde
  const edgeGeometry = useMemo(
    () =>
      new THREE.BoxGeometry(
        opening.width ?? 0.8,
        opening.height ?? 1.2,
        0.01
      ),
    [opening.width, opening.height]
  );

  return (
    <group>
      <mesh
        position={[x, y, z]}
        rotation={[0, -wallAngle, 0]}
        {...eventHandlers}
        onPointerEnter={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = "pointer";
          if (eventHandlers?.onPointerEnter) eventHandlers.onPointerEnter(e);
        }}
        onPointerLeave={(e) => {
          setHovered(false);
          document.body.style.cursor = "default";
          if (eventHandlers?.onPointerLeave) eventHandlers.onPointerLeave(e);
        }}
        onPointerDown={(e) => {
          if (e.button === 0 && eventHandlers?.onPointerDown) {
            eventHandlers.onPointerDown(e);
          }
        }}
        onContextMenu={(e) => {
          e.stopPropagation();
          if (eventHandlers?.onContextMenu) eventHandlers.onContextMenu(e);
        }}
      >
        <boxGeometry
          args={[opening.width ?? 0.8, opening.height ?? 1.2, 0.01]}
        />
        <meshBasicMaterial
          transparent
          opacity={0.1}
        />
        {/* Borde resaltado solo en hover */}
        {hovered && <Edges color={COLORS.hover} lineWidth={2} />}
      </mesh>
    </group>
  );
}
