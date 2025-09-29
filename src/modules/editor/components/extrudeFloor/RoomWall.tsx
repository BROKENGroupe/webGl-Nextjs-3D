import React from "react";
import * as THREE from "three";

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

  return (
    <mesh
      geometry={geometry}
      {...eventHandlers}
      userData={{ wallIndex, type: "wall" }}
    >
      <primitive object={material} />
      {children}
    </mesh>
  );
}
