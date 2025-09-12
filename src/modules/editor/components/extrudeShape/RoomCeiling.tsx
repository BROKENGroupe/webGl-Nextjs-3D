import React from "react";

export function RoomCeiling({ geometry, material }: { geometry: any; material: any }) {
  return (
    <mesh geometry={geometry}>
      <primitive object={material} />
    </mesh>
  );
}