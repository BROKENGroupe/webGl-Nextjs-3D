import React from "react";

export function RoomWall({
  geometry,
  material,
  wallIndex,
  wallOpenings,
  eventHandlers,
  children,
}: {
  geometry: any;
  material: any;
  wallIndex: number;
  wallOpenings: any[];
  eventHandlers: any;
  children?: React.ReactNode;
}) {
  return (
    <group>
      <mesh geometry={geometry} {...eventHandlers}>
        <primitive object={material} />
      </mesh>
      {children}
    </group>
  );
}