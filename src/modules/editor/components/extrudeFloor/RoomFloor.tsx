import React from "react";
export function RoomFloor({
  geometry,
  material,
  eventHandlers,
  floorId,
  floorIndex
}: {
  geometry: any;
  material: any;
  eventHandlers: any;
  floorId?: string;
  floorIndex:number
}) {
  return (
    <mesh
      geometry={geometry}
      {...eventHandlers}
      userData={{ id: floorId, type: "floor", floorIndex }}
    >
      <primitive object={material} />
    </mesh>
  );
}
