import React from "react";
export function RoomFloor({
  geometry,
  material,
  eventHandlers,
  floorId,
}: {
  geometry: any;
  material: any;
  eventHandlers: any;
  floorId?: string;
}) {
  return (
    <mesh
      geometry={geometry}
      {...eventHandlers}
      userData={{ id: floorId, type: "floor" }}
    >
      <primitive object={material} />
    </mesh>
  );
}
