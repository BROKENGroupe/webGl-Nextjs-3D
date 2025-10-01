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
import { ElementType } from "../types/walls";
import { COLORS } from "@/config/materials";

// Props interface
interface ExtrudedShapeWithDraggableOpenings2Props {
  planeCoordinates: { x: number; z: number }[];
  onDropOpening: (wallIndex: number, position: number, template: any) => void;
  isDragActive: boolean;
  draggedTemplate: any;
  showHeatmap?: boolean;
  onToggleHeatmap?: () => void;
  onAddFloor?: () => void;
  floors2?: any[];
  onWallContextMenu?: (
    event: any,
    facadeName: number,
    title: string,
    elementType: ElementType
  ) => void;
  onOpeningContextMenu?: (
    event: any,
    openingId: any,
    title: string,
    elementType: ElementType
  ) => void;
  openings: any[];
  ceilings2: any[];
  onCeilingContextMenu?: (
    event: any,
    facadeName: string,
    title: string,
    elementType: ElementType
  ) => void;
  onFloorContextMenu?: (
    event: any,
    facadeName: string,
    title: string,
    elementType: ElementType
  ) => void;
}

// Componente principal
export function ExtrudedShapeWithDraggableOpenings({
  onDropOpening,
  isDragActive,
  draggedTemplate,
  showHeatmap = false,
  onWallContextMenu,
  onOpeningContextMenu,
  onCeilingContextMenu,
  onFloorContextMenu,
  floors2 = [],
  openings,
  ceilings2,
}: ExtrudedShapeWithDraggableOpenings2Props) {
  const { walls, ceilings, floors } = useWallsStore();
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
      {ceilings2.map((cl, index) => (
        <RoomCeiling
          key={`ceiling-${index}`}
          geometry={ceilingGeometry}
          material={MaterialService.getWallMaterial({
            colorBase: ceilings[index]?.color || COLORS.ceiling,
            isHovered:
              (wallInteractions.hoveredWall === index &&
                (isDragActive || openingDrag.isDraggingOpening)) ||
              openingDrag.previewPosition?.wallIndex === index,
            isDragActive: isDragActive || openingDrag.isDraggingOpening,
            opacity: isDragActive || openingDrag.isDraggingOpening ? 0.8 : 1.0,
          })}
          ceilingId={cl.id}
          ceilingIndex={index}
          eventHandlers={{
            onPointerEnter: (e: any) => {
              e.stopPropagation();
              wallInteractions.handleWallPointerEnter(index);
            },
            onPointerLeave: wallInteractions.handleWallPointerLeave,
            onPointerMove: (e: any) =>
              openingDrag.handleMouseMove(
                e,
                wallInteractions.calculatePositionFromMouse
              ),
            onClick: (e: any) => {
              e.stopPropagation();
              wallInteractions.handleWallClick(index, e);
            },
            onContextMenu: (e: any) => {
              e.stopPropagation();
              if (onCeilingContextMenu) {
                onCeilingContextMenu(
                  e.nativeEvent,
                  cl.id,
                  cl.title,
                  ElementType.Ceiling
                );
              }
            },
          }}
        />
      ))}

      {coordinatesToUse.map((coord, index) => {
        const nextIndex = (index + 1) % coordinatesToUse.length;
        const nextCoord = coordinatesToUse[nextIndex];
        const wallOpenings = GeometryEngine.getOpeningsForWall(openings, index);

        const wall = walls[index];
        const wallColor = wall?.color ?? "#f21111ff";

        return (
          <RoomWall
            key={`wall-group-${index}`}
            geometry={createWallGeometry(index, coord, nextCoord)}
            material={MaterialService.getWallMaterial({
              colorBase: wallColor || COLORS.wall,
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
              onPointerEnter: (e: any) => {
                e.stopPropagation();
                wallInteractions.handleWallPointerEnter(index);
              },
              onPointerLeave: wallInteractions.handleWallPointerLeave,
              onPointerMove: (e: any) =>
                openingDrag.handleMouseMove(
                  e,
                  wallInteractions.calculatePositionFromMouse
                ),
              onClick: (e: any) => {
                e.stopPropagation();
                wallInteractions.handleWallClick(index, e);
              },
              onContextMenu: (e: any) => {
                e.stopPropagation();
                if (onWallContextMenu) {
                  onWallContextMenu(
                    e.nativeEvent,
                    index,
                    "Fachada",
                    ElementType.Wall
                  );
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
                        opening.title,
                        ElementType.Opening
                      );
                    }
                  },
                }}
              />
            ))}
          </RoomWall>
        );
      })}

      {floors2.map((fl, index) => (
        <RoomFloor
          key={`floor-${index}`}
          geometry={floorGeometry}
          floorIndex={index}
          material={MaterialService.getWallMaterial({
            colorBase: floors2[index]?.color || COLORS.ceiling,
            isHovered:
              (wallInteractions.hoveredWall === index &&
                (isDragActive || openingDrag.isDraggingOpening)) ||
              openingDrag.previewPosition?.wallIndex === index,
            isDragActive: isDragActive || openingDrag.isDraggingOpening,
            opacity: isDragActive || openingDrag.isDraggingOpening ? 0.8 : 1.0,
          })}
          floorId={fl.id}
          eventHandlers={{
            onPointerEnter: (e: any) => {
              e.stopPropagation();
              wallInteractions.handleWallPointerEnter(index);
            },
            onPointerLeave: wallInteractions.handleWallPointerLeave,
            onPointerMove: (e: any) =>
              openingDrag.handleMouseMove(
                e,
                wallInteractions.calculatePositionFromMouse
              ),
            onClick: (e: any) => {
              e.stopPropagation();
              wallInteractions.handleWallClick(index, e);
            },
            onContextMenu: (e: any) => {
              e.stopPropagation();
              if (onFloorContextMenu) {
                onFloorContextMenu(
                  e.nativeEvent,
                  fl.id,
                  fl.title,
                  ElementType.Floor
                );
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
