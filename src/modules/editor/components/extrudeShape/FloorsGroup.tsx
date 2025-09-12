import React from "react";
import { COLORS } from "../../../../config/materials";
import { GeometryEngine } from "../../core/engine/GeometryEngine";

export function FloorsGroup({ floors, depth }: { floors: any[]; depth: number }) {
  return (
    <>
      {floors.map((floor, idx) => {
        const wallMeshes = floor.walls.map((wall: any, wIdx: number) => (
          <mesh
            key={`wall-${floor.id}-${wIdx}`}
            geometry={GeometryEngine.createWallGeometry(
              wIdx,
              wall.start,
              wall.end,
              depth,
              []
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
            geometry={GeometryEngine.createCeilingGeometry(
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
          <mesh geometry={GeometryEngine.createFloorGeometry(floor.coordinates)}>
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