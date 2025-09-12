/**
 * @fileoverview Componente principal de habitación 3D con funcionalidades avanzadas
 *
 * Este componente integra múltiples sistemas para crear una experiencia completa
 * de modelado arquitectónico 3D, incluyendo geometría dinámica, drag-and-drop de
 * aberturas, análisis acústico en tiempo real y visualización de mapas de calor.
 * Utiliza engines especializados para delegar responsabilidades específicas.
 *
 * @module ExtrudedShapeWithDraggableOpenings
 * @version 3.0.0
 * @author insonor Team
 * @since 2025
 * @requires React
 * @requires Three.js
 * @requires @react-three/fiber
 * @requires @react-three/drei
 * @requires GeometryEngine
 * @requires InteractionEngine
 * @requires MaterialService
 * @requires AcousticHeatmapShader
 */

import { useEffect } from "react";

import { AcousticMaterial } from "@/modules/editor/types/AcousticMaterial";
import { useDrawingStore } from "@/modules/editor/store/drawingStore";
import { useIsoStudyConfigStore } from "@/modules/editor/store/isoStudyConfigStore";
import { useOpeningsStore } from "@/modules/editor/store/openingsStore";
import { useWallsStore } from "@/modules/editor/store/wallsStore";
import { GeometryEngine } from "@/modules/editor/core/engine/GeometryEngine";
import { InteractionEngine } from "@/modules/editor/core/engine/InteractionEngine";
import { MaterialService } from "@/modules/editor/core/engine/MaterialService";
import { AcousticHeatmapShader } from "./heatmaps/AcousticHeatmapShader";
import { useRoomGeometry } from "../hooks/useRoomGeometry";
import { useWallInteractions } from "../hooks/useWallInteractions";
import { useOpeningDrag } from "../hooks/useOpeningDrag";
import { RoomFloor } from "./extrudeShape/RoomFloor";
import { RoomCeiling } from "./extrudeShape/RoomCeiling";
import { RoomWall } from "./extrudeShape/RoomWall";
import { OpeningMesh } from "./extrudeShape/OpeningMesh";
import { FloorsGroup } from "./extrudeShape/FloorsGroup";
import { OpeningPreviewIndicator } from "./extrudeShape/OpeningPreviewIndicator";

interface ExtrudedShapeWithDraggableOpeningsProps {
  planeCoordinates: { x: number; z: number }[];
  onDropOpening: (
    wallIndex: number,
    position: number,
    template: AcousticMaterial
  ) => void;
  isDragActive: boolean;
  draggedTemplate: AcousticMaterial | null;
  showHeatmap?: boolean;
  onToggleHeatmap?: () => void;
  onAddFloor?: () => void;
  floors?: any[];
  onWallContextMenu?: (
    event: any,
    facadeName: number,
    elementType: "wall" | "opening" | "floor" | "ceiling"
  ) => void;
  onOpeningContextMenu?: (
    event: any,
    openingId: string,
    elementType: "wall" | "opening" | "floor" | "ceiling"
  ) => void;
}

export function ExtrudedShapeWithDraggableOpenings({
  planeCoordinates,
  onDropOpening,
  isDragActive,
  draggedTemplate,
  showHeatmap = false,
  onToggleHeatmap,
  onAddFloor,
  onWallContextMenu,
  onOpeningContextMenu,
  floors = [],
}: ExtrudedShapeWithDraggableOpeningsProps) {
  // Stores y estados globales
  const { planeXZCoordinates, hasPlaneCoordinates } = useDrawingStore();
  const { openings, updateOpeningPosition } = useOpeningsStore();
  const { height } = useIsoStudyConfigStore();
  const { setWallHeight } = useWallsStore();
  const depth = height ?? 3;

  useEffect(() => {
    if (height) setWallHeight(depth);
  }, [height, setWallHeight]);

  // Determinación de coordenadas
  let coordinatesToUse = planeXZCoordinates;
  if (!hasPlaneCoordinates || coordinatesToUse.length < 3) {
    coordinatesToUse = [
      { x: -6.5, z: -7 },
      { x: 4, z: -4.5 },
      { x: 2, z: 6 },
      { x: -7.5, z: 4.5 },
      { x: -6.5, z: -6.5 },
    ];
  }
  
  const coordinatesArray: number[][] = coordinatesToUse.map((coord) => [
    coord.x,
    coord.z,
  ]);

  const { floorGeometry, ceilingGeometry, createWallGeometry } =
    useRoomGeometry(coordinatesArray, depth, openings);

  const openingDrag = useOpeningDrag(updateOpeningPosition);

  const wallInteractions = useWallInteractions({
    isDragActive,
    draggedTemplate,
    isDraggingOpening: openingDrag.isDraggingOpening,
    draggedOpening: openingDrag.draggedOpening,
    handleOpeningPointerUp: openingDrag.handleOpeningPointerUp,
    onDropOpening,
    coordinatesToUse,
    depth,
  });

  return (
    <group>
      <RoomFloor
        geometry={floorGeometry}
        material={MaterialService.getFloorMaterial()}
      />
      {coordinatesToUse.map((coord, index) => {
        const nextIndex = (index + 1) % coordinatesToUse.length;
        const nextCoord = coordinatesToUse[nextIndex];
        const wallOpenings = GeometryEngine.getOpeningsForWall(openings, index);

        return (
          <RoomWall
            key={`wall-group-${index}`}
            geometry={createWallGeometry(index, coord, nextCoord)}
            material={MaterialService.getWallMaterial({
              isHovered:
                (wallInteractions.hoveredWall === index &&
                  (isDragActive || openingDrag.isDraggingOpening)) ||
                openingDrag.previewPosition?.wallIndex === index,
              isDragActive: isDragActive || openingDrag.isDraggingOpening,
              opacity:
                isDragActive || openingDrag.isDraggingOpening ? 0.8 : 1.0,
            })}
            wallIndex={index}
            wallOpenings={wallOpenings}
            eventHandlers={{
              onPointerEnter: (e: any) => {
                e.stopPropagation();
                wallInteractions.handleWallPointerEnter(index);
              },
              onPointerLeave: (e: any) => {
                e.stopPropagation();
                wallInteractions.handleWallPointerLeave();
              },
              onPointerMove: (e: any) => {
                e.stopPropagation();
                openingDrag.handleMouseMove(
                  e,
                  wallInteractions.calculatePositionFromMouse
                );
              },
              onClick: (e: any) => {
                e.stopPropagation();
                wallInteractions.handleWallClick(index, e);
              },
              onContextMenu: (e: any) => {
                e.stopPropagation();
                if (onWallContextMenu) {
                  onWallContextMenu(e.nativeEvent, index, "wall");
                }
              },
            }}
          >
            {wallOpenings.map((opening) => (
              <OpeningMesh
                key={opening.id}
                position={[
                  opening.position * (nextCoord.x - coord.x) + coord.x,
                  opening.height ?? 1.2,
                  opening.position * (nextCoord.z - coord.z) + coord.z,
                ]}
                opening={opening}
                material={MaterialService.getOpeningMaterial(
                  openingDrag.isDraggingOpening ? "dragging" : "normal"
                )}
                eventHandlers={{
                  onPointerDown: (e: any) => {
                    if (e.button === 0) {
                      e.stopPropagation();
                      openingDrag.handleOpeningPointerDown(
                        opening,
                        e,
                        wallInteractions.calculatePositionFromMouse
                      );
                      document.body.style.cursor = "grabbing";
                    }
                  },
                  onPointerUp: (e: any) => {
                    if (e.button === 0) {                      
                      openingDrag.handleOpeningPointerUp();
                    }
                  },
                  onPointerMove: (e: any) => {
                    if (openingDrag.isDraggingOpening) {                      
                      openingDrag.handleMouseMove(
                        e,
                        wallInteractions.calculatePositionFromMouse
                      );
                      document.body.style.cursor = "move";
                    }
                  },
                  onPointerEnter: (e: any) => {                    
                    if (!isDragActive && !openingDrag.isDraggingOpening) {
                      document.body.style.cursor = "move";
                    }
                  },
                  onPointerLeave: (e: any) => {                    
                    if (!openingDrag.isDraggingOpening) {
                      document.body.style.cursor = "move";
                    }
                  },
                  onContextMenu: (e: any) => {
                    e.stopPropagation();
                    onOpeningContextMenu &&
                      onOpeningContextMenu(
                        e.nativeEvent,
                        opening.id,
                        "opening"
                      );
                  },
                }}
                indicatorMaterial={MaterialService.getPreviewMaterial(
                  "indicator"
                )}
                previewElements={
                  openingDrag.isDraggingOpening &&
                  openingDrag.previewPosition &&
                  (() => {
                    // Calculate preview X and Z based on wallIndex and position
                    const previewWallIndex =
                      openingDrag.previewPosition.wallIndex;
                    const previewPosition =
                      openingDrag.previewPosition.position;
                    const previewCoord = coordinatesToUse[previewWallIndex];
                    const previewNextCoord =
                      coordinatesToUse[
                        (previewWallIndex + 1) % coordinatesToUse.length
                      ];
                    const previewX =
                      previewPosition * (previewNextCoord.x - previewCoord.x) +
                      previewCoord.x;
                    const previewZ =
                      previewPosition * (previewNextCoord.z - previewCoord.z) +
                      previewCoord.z;
                    const displayPosition = {
                      x: previewX,
                      z: previewZ,
                      previewWallIndex: openingDrag.previewPosition.wallIndex,
                    };
                    return (
                      <group>
                        <mesh
                          position={[
                            (coord.x +
                              opening.position * (nextCoord.x - coord.x) +
                              displayPosition.x) /
                              2,
                            displayPosition.previewWallIndex,
                            (coord.z +
                              opening.position * (nextCoord.z - coord.z) +
                              displayPosition.z) /
                              2,
                          ]}
                        >
                          {/* <boxGeometry
                            args={[
                              Math.abs(
                                displayPosition.x -
                                  (coord.x +
                                    opening.position * (nextCoord.x - coord.x))
                              ),
                              0.01,
                              Math.abs(
                                displayPosition.z -
                                  (coord.z +
                                    opening.position * (nextCoord.z - coord.z))
                              ),
                            ]}
                          /> */}
                          <primitive
                            object={MaterialService.getPreviewMaterial("line")}
                          />
                        </mesh>
                        <mesh
                          position={[
                            displayPosition.x,
                            displayPosition.z,
                            displayPosition.previewWallIndex,
                          ]}
                        >
                          {/* <sphereGeometry args={[0.05]} /> */}
                          {/* <primitive
                            object={MaterialService.getPreviewMaterial(
                              "indicator"
                            )}
                          /> */}
                        </mesh>
                        {/* <OpeningPreviewIndicator
                          coord={coord}
                          nextCoord={nextCoord}
                          opening={opening}
                          displayPosition={displayPosition}
                        /> */}
                      </group>
                    );
                  })()
                }
              />
            ))}
          </RoomWall>
        );
      })}
      <RoomCeiling
        geometry={ceilingGeometry}
        material={MaterialService.getCeilingMaterial()}
      />
      <AcousticHeatmapShader
        wallCoordinates={coordinatesToUse}
        isVisible={showHeatmap}
        Lp_in={70}
      />
      <FloorsGroup floors={floors} depth={depth} />
    </group>
  );
}
