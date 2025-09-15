import React, { useEffect } from "react";
import { useWallInteractions } from "../hooks/useWallInteractions";
import { useOpeningDrag } from "../hooks/useOpeningDrag";
import { useRoomGeometry } from "../hooks/useRoomGeometry";
import { MaterialService } from "@/modules/editor/core/engine/MaterialService";
import { GeometryEngine } from "@/modules/editor/core/engine/GeometryEngine";
import { AcousticHeatmapShader } from "./heatmaps/AcousticHeatmapShader";
import { useWallsStore } from "@/modules/editor/store/wallsStore";
import { useDrawingStore } from "../store/drawingStore";
import { useOpeningsStore } from "../store/openingsStore";
import { FloorsGroup } from "./extrudeFloor/FloorsGroup";
import { OpeningMesh } from "./extrudeFloor/OpeningMesh";
import { RoomCeiling } from "./extrudeFloor/RoomCeiling";
import { RoomFloor } from "./extrudeFloor/RoomFloor";
import { RoomWall } from "./extrudeFloor/RoomWall";

// Props interface
interface ExtrudedShapeWithDraggableOpenings2Props {
  planeCoordinates: { x: number; z: number }[];
  onDropOpening: (wallIndex: number, position: number, template: any) => void;
  isDragActive: boolean;
  draggedTemplate: any;
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
    openingId: any,
    elementType: "wall" | "opening" | "floor" | "ceiling"
  ) => void;
  openings: any[];
  ceilings: any[];
  onCeilingContextMenu?: (
    event: any,
    facadeName: string,
    elementType: "wall" | "opening" | "floor" | "ceiling"
  ) => void;
  onFloorContextMenu?: (
    event: any,
    facadeName: string,
    elementType: "wall" | "opening" | "floor" | "ceiling"
  ) => void;
}

// Componente principal
export function ExtrudedShapeWithDraggableOpenings2({
  onDropOpening,
  isDragActive,
  draggedTemplate,
  showHeatmap = false,
  onWallContextMenu,
  onOpeningContextMenu,
  onCeilingContextMenu,
  onFloorContextMenu,
  floors = [],
  openings,
  ceilings
}: ExtrudedShapeWithDraggableOpenings2Props) {
  // Altura de la habitación (puedes recibirla por props o definirla aquí)
  const depth = 3;
  const { planeXZCoordinates, hasPlaneCoordinates } = useDrawingStore();
  const { updateOpeningPosition } = useOpeningsStore();
  // Validación de coordenadas
  let coordinatesToUse = planeXZCoordinates;

  if (!hasPlaneCoordinates || coordinatesToUse.length < 3) {
    coordinatesToUse = [
      { x: -6.5, z: -7 },
      { x: 4, z: -4.5 },
      { x: 2, z: 6 },
      { x: -7.5, z: 4.5 },
      { x: -6.5, z: -6.5 },
    ];
    console.log("🏗️ Usando coordenadas exactas del localStorage");
  }

  console.log("🔍 COORDENADAS FINALES:", coordinatesToUse);

  // Hooks de lógica
  const { floorGeometry, ceilingGeometry, createWallGeometry } =
    useRoomGeometry(coordinatesToUse, depth, openings);

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

  // Almacenar geometría en el storage
  const {
    generateWallsFromCoordinates,
    recalculateAllWallsWithOpenings,
    generateFloorFromCoordinates,
    generateCeilingFromCoordinates,
  } = useWallsStore();

  useEffect(() => {
    if (coordinatesToUse.length >= 3) {
      generateWallsFromCoordinates(coordinatesToUse);
      generateFloorFromCoordinates(coordinatesToUse);
      generateCeilingFromCoordinates(coordinatesToUse);
    }
  }, [
    coordinatesToUse,
    generateWallsFromCoordinates,
    generateFloorFromCoordinates,
    generateCeilingFromCoordinates,
  ]);

  useEffect(() => {
    if (openings.length > 0 && coordinatesToUse.length >= 3) {
      recalculateAllWallsWithOpenings(openings);
    }
  }, [openings, recalculateAllWallsWithOpenings, coordinatesToUse]);

  if (coordinatesToUse.length < 3) {
    return null;
  }

  // Renderizado
  return (
    <group>
       {floors.map((floor, index) => (
      <RoomFloor
      key={`floor-${index}`}
        geometry={floorGeometry}
        material={MaterialService.getFloorMaterial()}
        floorId={floor.id}
          eventHandlers={{
          onContextMenu: (e: any) => {
            if (onFloorContextMenu) {
              onFloorContextMenu(e.nativeEvent, floor.id, "floor");
            }
          },
        }}
      />
 ))}


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
            eventHandlers={{
              onPointerEnter: () =>
                wallInteractions.handleWallPointerEnter(index),
              onPointerLeave: wallInteractions.handleWallPointerLeave,
              onPointerMove: (e: any) =>
                openingDrag.handleMouseMove(
                  e,
                  wallInteractions.calculatePositionFromMouse
                ),
              onClick: (e: any) => wallInteractions.handleWallClick(index, e),
              onContextMenu: (e: any) => {
                if (onWallContextMenu) {
                  onWallContextMenu(e.nativeEvent, index, "wall");
                }
              },
            }}
          >
            {wallOpenings.map((opening) => (
              <OpeningMesh
                key={opening.id}
                coord={coord}
                nextCoord={nextCoord}
                wallHeight={depth}
                opening={opening}
                eventHandlers={{
                  // Drag existente: arrastrar y soltar aberturas
                  onPointerDown: (e: any) =>
                    openingDrag.handleOpeningPointerDown(
                      opening,
                      e,
                      wallInteractions.calculatePositionFromMouse
                    ),
                  onPointerUp: (e: any) => openingDrag.handleOpeningPointerUp(),
                  onPointerMove: (e: any) =>
                    openingDrag.handleMouseMove(
                      e,
                      wallInteractions.calculatePositionFromMouse
                    ),
                  onPointerEnter: () => (document.body.style.cursor = "move"),
                  onPointerLeave: () =>
                    (document.body.style.cursor = "default"),
                  // Drop desde paleta: click en pared
                  onContextMenu: (e: any) => {
                    if (onOpeningContextMenu) {
                      onOpeningContextMenu(
                        e.nativeEvent,
                        opening.id,
                        "opening"
                      );
                    }
                  },
                }}
              />
            ))}
          </RoomWall>
        );
      })}
      {ceilings.map((ceiling, index) => (
        <RoomCeiling
          key={`ceiling-${index}`}
          geometry={ceilingGeometry}
          material={MaterialService.getCeilingMaterial()}
          ceilingId={ceiling.id}
          eventHandlers={{
          onContextMenu: (e: any) => {
            if (onCeilingContextMenu) {
              onCeilingContextMenu(e.nativeEvent, ceiling.id, "ceiling");
            }
          },
        }}
      />
      ))}

      <AcousticHeatmapShader
        wallCoordinates={coordinatesToUse}
        isVisible={showHeatmap}
        Lp_in={70}
      />
      {/* <FloorsGroup floors={floors} depth={depth} /> */}
    </group>
  );
  
}
