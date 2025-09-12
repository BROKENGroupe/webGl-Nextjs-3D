import React from "react";
import { MaterialService } from "../../core/engine/MaterialService";

type OpeningPreviewIndicatorProps = {
  coord: { x: number; z: number };
  nextCoord: { x: number; z: number };
  opening: { position: number };
  displayPosition: { x: number; z: number; previewWallIndex: number };
};

export function OpeningPreviewIndicator({
  coord,
  nextCoord,
  opening,
  displayPosition,
}: OpeningPreviewIndicatorProps) {
  return (
    <group>
      <mesh
        position={[
          (coord.x +
            opening.position * (nextCoord.x - coord.x) +
            displayPosition.x) /
            2,
          displayPosition.previewWallIndex - 20,
          (coord.z +
            opening.position * (nextCoord.z - coord.z) +
            displayPosition.z) /
            2,
        ]}
      >
        <boxGeometry
          args={[
            Math.abs(
              displayPosition.x -
                (coord.x + opening.position * (nextCoord.x - coord.x))
            ),
            0.01,
            Math.abs(
              displayPosition.z -
                (coord.z + opening.position * (nextCoord.z - coord.z))
            ),
          ]}
        />
        <primitive object={MaterialService.getPreviewMaterial("line")} />
      </mesh>
      <mesh
        position={[
          displayPosition.x,
          displayPosition.z,
          displayPosition.previewWallIndex,
        ]}
      >
        <sphereGeometry args={[0.05]} />
        <primitive object={MaterialService.getPreviewMaterial("indicator")} />
      </mesh>
    </group>
  );
}