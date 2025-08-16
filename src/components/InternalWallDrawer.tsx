import { useDrawingStore } from "@/store/drawingStore";
import * as THREE from "three";
import { useState } from "react";

export function InternalWallDrawer() {
  const addInternalWall = useDrawingStore(s => s.addInternalWall);
  const internalWalls = useDrawingStore(s => s.internalWalls);
  const [startPoint, setStartPoint] = useState<THREE.Vector3 | null>(null);

  function handleCanvasClick(position: THREE.Vector3) {
    if (!startPoint) {
      setStartPoint(position);
    } else {
      addInternalWall(startPoint, position);
      setStartPoint(null);
    }
  }

  return (
    <>
      {internalWalls.map((wall, idx) => (
        <line key={idx}>
          <bufferGeometry
            attach="geometry"
            setFromPoints={[wall.start, wall.end]}
          />
          <lineBasicMaterial attach="material" color="red" linewidth={2} />
        </line>
      ))}
      {/* Llama handleCanvasClick(position) cuando el usuario haga click en el canvas */}
    </>
  );
}