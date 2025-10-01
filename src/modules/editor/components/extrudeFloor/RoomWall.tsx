import React, { useState } from "react";
import { Edges } from "@react-three/drei";
import { COLORS } from "@/config/materials";

export function RoomWall({
  geometry,
  material,
  wallIndex,
  eventHandlers,
  children,
}: {
  geometry: any;
  material: any;
  wallIndex: number;
  color?: string;
  eventHandlers: any;
  children?: React.ReactNode;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <mesh
      castShadow
      receiveShadow
      geometry={geometry}
      {...eventHandlers}
      userData={{ wallIndex, type: "wall" }}
      onPointerOver={(event) => {
        event.stopPropagation();
        document.body.style.cursor = "pointer";
        setHovered(true);
      }}
      onPointerOut={(event) => {
        event.stopPropagation();
        document.body.style.cursor = "auto";
        setHovered(false);
      }}
    >
      <primitive object={material} />
      {hovered && <Edges color={COLORS.hover} />}
      {children}
    </mesh>
  );
}
