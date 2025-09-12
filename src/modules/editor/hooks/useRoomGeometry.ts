import { useMemo, useCallback } from "react";
import { GeometryEngine } from "../core/engine/GeometryEngine";

export function useRoomGeometry(
  coordinatesToUse: number[][], // or a more specific type if needed
  depth: number,
  openings: any // replace 'any' with a more specific type if possible
) {
  const point2DCoordinates = useMemo(
    () => coordinatesToUse.map(([x, z]) => ({ x, z })),
    [coordinatesToUse]
  );

  const floorGeometry = useMemo(
    () => GeometryEngine.createFloorGeometry(point2DCoordinates),
    [point2DCoordinates]
  );

  const ceilingGeometry = useMemo(
    () => GeometryEngine.createCeilingGeometry(point2DCoordinates, depth),
    [point2DCoordinates, depth]
  );

  const createWallGeometry = useCallback(
    (wallIndex: number, p1: { x: number; z: number }, p2: { x: number; z: number }) => {
      const wallOpenings = GeometryEngine.getOpeningsForWall(openings, wallIndex);
      return GeometryEngine.createWallGeometry(wallIndex, p1, p2, depth, wallOpenings);
    },
    [depth, openings, coordinatesToUse]
  );

  return { floorGeometry, ceilingGeometry, createWallGeometry };
}