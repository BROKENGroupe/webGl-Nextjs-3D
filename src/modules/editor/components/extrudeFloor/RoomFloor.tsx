import { COLORS } from "@/config/materials";
import { Edges } from "@react-three/drei";
import React from "react";
export function RoomFloor({
  geometry,
  material,
  eventHandlers,
  floorId,
  floorIndex,
}: {
  geometry: any;
  material: any;
  eventHandlers: any;
  floorId?: string;
  floorIndex: number;
}) {
  const [hovered, setHovered] = React.useState(false);
  return (
    <mesh
      castShadow
      receiveShadow
      geometry={geometry}
      {...eventHandlers}
      userData={{ id: floorId, type: "floor", floorIndex }}
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
    </mesh>
  );
}
