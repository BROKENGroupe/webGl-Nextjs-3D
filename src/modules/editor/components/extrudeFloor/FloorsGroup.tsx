import { COLORS } from "@/config/materials";
import React, { useMemo } from "react";

// Para usar Babylon (cuando implementes el adaptador)
// EngineFactory.setEngineType("babylon");

import { GeometryEngine } from "../../core/engine/GeometryEngine";
import { ThreeGeometryAdapter } from "../../core/engine/adapters/ThreeGeometryAdapter";
import EngineFactory from "../../core/engine/EngineFactory";

export function FloorsGroup({ floors, depth }: { floors: any[]; depth: number }) {  
  const geometryEngine = EngineFactory.getGeometryEngine();

  return (
    <>
      {floors.map((floor, idx) => {
        const wallMeshes = floor.walls.map((wall: any, wIdx: number) => (
          <mesh
            key={`wall-${floor.id}-${wIdx}`}
            geometry={geometryEngine.createWallGeometry(
              wIdx,
              wall.start,
              wall.end,
              depth,
              wall.openings || []
            )}
          >
            <meshStandardMaterial
              color={COLORS.wall}
              transparent
              opacity={COLORS.wallOpacity}
            />
          </mesh>
        ));
        const ceilingMesh = (
          <mesh
            geometry={geometryEngine.createCeilingGeometry(
              floor.coordinates,
              depth
            )}
            position={[0, 0, 0]}
          >
            <meshStandardMaterial
              color={COLORS.ceiling}
              transparent
              opacity={COLORS.ceilingOpacity}
            />
          </mesh>
        );
        const floorMesh = (
          <mesh geometry={geometryEngine.createFloorGeometry(floor.coordinates)}>
            <meshStandardMaterial
              color={COLORS.wall}
              transparent
              opacity={COLORS.wallOpacity}
            />
          </mesh>
        );
        return (
          <group key={floor.id} position={[0, floor.baseHeight, 0]}>
            {floorMesh}
            {wallMeshes}
            {ceilingMesh}
          </group>
        );
      })}
    </>
  );
}