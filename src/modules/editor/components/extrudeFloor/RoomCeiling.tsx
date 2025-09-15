import React from "react";
export function RoomCeiling({
  geometry,
  material,
  eventHandlers,
  ceilingId,
}: {
  geometry: any;
  material: any;
  eventHandlers: any;
  ceilingId: string;
}) {
  return (
    <mesh
      geometry={geometry}
      {...eventHandlers}
      userData={{ ceilingId, type: "ceiling" }}
    >
      <primitive object={material} />
    </mesh>
  );
}
