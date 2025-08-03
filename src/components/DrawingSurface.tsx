"use client";

import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useRef, useEffect } from "react";

function snapToGrid(pos: THREE.Vector3, step = 0.5): THREE.Vector3 {
  return new THREE.Vector3(
    Math.round(pos.x / step) * step,
    0,
    Math.round(pos.z / step) * step
  );
}

export function DrawingSurface({ onClick3D }: { onClick3D: (pos: THREE.Vector3) => void }) {
  const { camera } = useThree();
  const plane = useRef<THREE.Mesh>(null);

  const handlePlaneClick = (e: any) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    
    const point = e.point;
    if (point) {
      const snapped = snapToGrid(point);
      onClick3D(snapped);
    }
  };

  return (
    <mesh 
      ref={plane} 
      rotation={[-Math.PI / 2, 0, 0]} 
      position={[0, 0, 0]}
      onPointerDown={handlePlaneClick}
    >
      <planeGeometry args={[50, 50]} />
      <meshStandardMaterial transparent opacity={0} />
    </mesh>
  );
}
