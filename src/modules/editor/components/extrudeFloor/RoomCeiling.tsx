import { COLORS } from "@/config/materials";
import { Edges } from "@react-three/drei";
import React from "react";
export function RoomCeiling({
  geometry,
  material,
  eventHandlers,
  ceilingId,
  ceilingIndex,
  children,
}: {
  geometry: any;
  material: any;
  eventHandlers: any;
  ceilingId: string;
  ceilingIndex: number;
  children?: React.ReactNode;
}) {
  const [hovered, setHovered] = React.useState(false);
  return (
    <mesh
      castShadow
      receiveShadow
      geometry={geometry}
      {...eventHandlers}
      userData={{ ceilingId, type: "ceiling", ceilingIndex }}
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
