import React from "react";
export function RoomCeiling({
  geometry,
  material,
  eventHandlers,
  ceilingId,
  ceilingIndex
}: {
  geometry: any;
  material: any;
  eventHandlers: any;
  ceilingId: string;
  ceilingIndex:number
}) {
  return (
    <mesh
      geometry={geometry}
      {...eventHandlers}
      userData={{ ceilingId, type: "ceiling", ceilingIndex }}
    >
      <primitive object={material} />
    </mesh>
  );
}
