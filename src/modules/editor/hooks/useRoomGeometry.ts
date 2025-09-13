import { useMemo, useCallback } from "react";
import { GeometryEngine } from "../core/engine/GeometryEngine";
import { Point2D } from "../types/openings";
export function useRoomGeometry(
  coordinatesToUse: { x: number; z: number }[], // or a more specific type if available
  depth: number,
  openings: any // replace 'any' with a more specific type if possible
) {
  const points: Point2D[] = useMemo(
    () => coordinatesToUse.map(({ x, z }) => ({ x, z })),
    [coordinatesToUse]
  );

  const floorGeometry = useMemo(
    () => GeometryEngine.createFloorGeometry(points),
    [points]
  );
  const ceilingGeometry = useMemo(
    () => GeometryEngine.createCeilingGeometry(points, depth),
    [points, depth]
  );
  const createWallGeometry = useCallback(
    (wallIndex: number, p1: Point2D, p2: Point2D) => {
      const wallOpenings = GeometryEngine.getOpeningsForWall(openings, wallIndex);
      return GeometryEngine.createWallGeometry(wallIndex, p1, p2, depth, wallOpenings);
    },
    [depth, openings, coordinatesToUse]
  );
  return { floorGeometry, ceilingGeometry, createWallGeometry };
}