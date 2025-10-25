import { useMemo, useCallback } from "react";
import { GeometryEngine } from "../core/engine/GeometryEngine";
import { Point2D } from "../types/openings";
import { ThreeGeometryAdapter } from "../core/engine/adapters/ThreeGeometryAdapter";
import EngineFactory from "../core/engine/EngineFactory";

export function useRoomGeometry(
  coordinatesToUse: { x: number; z: number }[],
  depth: number,
  openings: any
) {
  const points: Point2D[] = useMemo(
    () => coordinatesToUse.map(({ x, z }) => ({ x, z })),
    [coordinatesToUse]
  );

 

  // Instancia el adaptador y el motor de geometría
  const geometryAdapter = EngineFactory.getGeometryAdapter();
  const geometryEngine = useMemo(() => new GeometryEngine(geometryAdapter), [geometryAdapter]);

  const floorGeometry = useMemo(
    () => geometryEngine.createFloorGeometry(points),
    [geometryEngine, points]
  );
  const ceilingGeometry = useMemo(
    () => geometryEngine.createCeilingGeometry(points, depth),
    [geometryEngine, points, depth]
  );
  const createWallGeometry = useCallback(
    (wallIndex: number, p1: Point2D, p2: Point2D) => {
      const wallOpenings = geometryEngine.getOpeningsForWall(openings, wallIndex);
      return geometryEngine.createWallGeometry(wallIndex, p1, p2, depth, wallOpenings);
    },
    [geometryEngine, depth, openings, coordinatesToUse]
  );
  return { floorGeometry, ceilingGeometry, createWallGeometry };
}