import React, { useEffect, useState } from "react";
import { useWallInteractions } from "../hooks/useWallInteractions";
import { useOpeningDrag } from "../hooks/useOpeningDrag";
import { useRoomGeometry } from "../hooks/useRoomGeometry";
import { MaterialService } from "@/modules/editor/core/engine/MaterialService";
import { GeometryEngine } from "@/modules/editor/core/engine/GeometryEngine";
import { AcousticHeatmapShader } from "./heatmaps/AcousticHeatmapShader";
import { useWallsStore } from "@/modules/editor/store/wallsStore";
import { useDrawingStore } from "../store/drawingStore";
import { useOpeningsStore } from "../store/openingsStore";
import { OpeningMesh } from "./extrudeFloor/OpeningMesh";
import { RoomCeiling } from "./extrudeFloor/RoomCeiling";
import { RoomFloor } from "./extrudeFloor/RoomFloor";
import { RoomWall } from "./extrudeFloor/RoomWall";
import { ElementType } from "../types/walls";
import { COLORS } from "@/config/materials";
import { useIsoResultStore } from "../store/isoResultStore";
import { Opening } from "../types/openings";
import EngineFactory from "../core/engine/EngineFactory";
import { useSpring, animated } from "@react-spring/three";
import { AcousticHeatmapShader2 } from "./heatmaps/AcousticHeatmapShader2";

// Props interface
interface ExtrudedShapeWithDraggableOpenings2Props {
  planeCoordinates?: { x: number; z: number }[];
  onDropOpening: (wallIndex: number, position: number, template: any) => void;
  isDragActive: boolean;
  draggedTemplate: any;
  showHeatmap?: boolean;
  onToggleHeatmap?: () => void;
  onAddFloor?: () => void;
  floors2?: any[];
  walls2?: any[]; // NUEVA PROP para paredes específicas
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

  // Props multi-planta
  floorHeight?: number;
  floorId?: string;
  opacity?: number;
  interactive?: boolean;
}

// Componente principal
export function ExtrudedShapeWithDraggableOpenings({
  planeCoordinates,
  onDropOpening,
  isDragActive,
  draggedTemplate,
  showHeatmap = false,
  onWallContextMenu,
  onOpeningContextMenu,
  onCeilingContextMenu,
  onFloorContextMenu,
  floors2 = [],
  walls2 = [],
  openings,
  ceilings2,
  floorHeight,
  floorId,
  opacity = 1.0,
  interactive = true,
}: ExtrudedShapeWithDraggableOpenings2Props) {
  const { walls, ceilings, floors, wallHeight,  } = useWallsStore();

  const geometryEngine = EngineFactory.getGeometryEngine();

  const depth = wallHeight ?? 3;
  const { planeXZCoordinates, hasPlaneCoordinates, currentLines, isExtruded } =
    useDrawingStore();
  const { updateOpeningPosition } = useOpeningsStore();

  // LÓGICA DE COORDENADAS MEJORADA
  let coordinatesToUse: { x: number; z: number }[];

  if (planeCoordinates && planeCoordinates.length >= 3) {
    // 1. Prioridad: coordenadas pasadas por props (sistema multi-planta)
    coordinatesToUse = planeCoordinates;
  } else if (hasPlaneCoordinates && planeXZCoordinates.length >= 3) {
    // 2. Fallback: coordenadas del store (sistema original)
    coordinatesToUse = planeXZCoordinates;
  } else {
    // 3. Fallback final: coordenadas por defecto
    coordinatesToUse = [
      { x: -6.5, z: -7 },
      { x: 4, z: -4.5 },
      { x: 2, z: 6 },
      { x: -7.5, z: 4.5 },
      { x: -6.5, z: -6.5 },
    ];
  }

  // Hooks de lógica (con datos específicos si están disponibles)
  const { floorGeometry, ceilingGeometry, createWallGeometry } =
    useRoomGeometry(coordinatesToUse, depth, openings);

  const openingDrag = useOpeningDrag(updateOpeningPosition);

  const wallInteractions = useWallInteractions({
    isDragActive: interactive ? isDragActive : false, // Solo interactivo si está habilitado
    draggedTemplate: interactive ? draggedTemplate : null,
    isDraggingOpening: interactive ? openingDrag.isDraggingOpening : false,
    draggedOpening: openingDrag.draggedOpening,
    handleOpeningPointerUp: openingDrag.handleOpeningPointerUp,
    onDropOpening: interactive ? onDropOpening : () => {},
    coordinatesToUse,
    depth,
  });

  // Almacenar geometría en el storage (solo si no viene de multi-planta)
  const {
    generateWallsFromCoordinates,
    recalculateAllWallsWithOpenings,
    generateFloorFromCoordinates,
    generateCeilingFromCoordinates,
  } = useWallsStore();

  useEffect(() => {
    // Solo generar si no es parte del sistema multi-planta
    if (!floorId && coordinatesToUse.length >= 3) {
      generateWallsFromCoordinates(coordinatesToUse, currentLines);
      generateFloorFromCoordinates(coordinatesToUse);
      generateCeilingFromCoordinates(coordinatesToUse);
    }
  }, [
    coordinatesToUse,
    floorId, // Dependencia importante
    generateWallsFromCoordinates,
    generateFloorFromCoordinates,
    generateCeilingFromCoordinates,
  ]);

  useEffect(() => {
    // Solo recalcular si no es parte del sistema multi-planta
    if (!floorId && openings.length > 0 && coordinatesToUse.length >= 3) {
      recalculateAllWallsWithOpenings(openings);
    }
  }, [openings, recalculateAllWallsWithOpenings, coordinatesToUse, floorId]);

  const [animateExtrude, setAnimateExtrude] = useState(false);

  useEffect(() => {
    if (isExtruded) {
      setAnimateExtrude(true);
    }
  }, [isExtruded]);

  if (coordinatesToUse.length < 3) {
    return null;
  }

  // RENDERIZADO CON SOPORTE DE OPACIDAD - CORREGIDO
  const materialProps = {
    // Solo aplicar transparencia durante drag, NO a plantas duplicadas
    opacity: isDragActive || openingDrag.isDraggingOpening ? 0.8 : 1.0,
    transparent: isDragActive || openingDrag.isDraggingOpening,
  };

  // SPRING PARA ESCALA EN Y (EXTRUSIÓN)
  const { scaleY } = useSpring({
    scaleY: animateExtrude ? 1.0 : 0.0,
    config: { duration: 200 },
  });

  return (
    <animated.group scale-y={scaleY}>
      <group name={floorId ? `floor-${floorId}` : "single-floor"}>
        {/* Techos */}
        {(ceilings2.length > 0 ? ceilings2 : ceilings).map((cl, index) => (
          <RoomCeiling
            key={`ceiling-${floorId || "default"}-${index}`}
            geometry={ceilingGeometry}
            material={MaterialService.getWallMaterial({
              colorBase: cl?.color || COLORS.ceiling,
              isHovered:
                interactive &&
                ((wallInteractions.hoveredWall === index &&
                  (isDragActive || openingDrag.isDraggingOpening)) ||
                  openingDrag.previewPosition?.wallIndex === index),
              isDragActive:
                interactive && (isDragActive || openingDrag.isDraggingOpening),
              // OPACIDAD COMPLETA SIEMPRE
              opacity: 1.0,
            })}
            ceilingId={cl.id}
            ceilingIndex={index}
            eventHandlers={
              interactive
                ? {
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
                  }
                : {}
            }
          />
        ))}

        {/* Paredes - SIN TRANSPARENCIA */}
        {coordinatesToUse.map((coord, index) => {
          const nextIndex = (index + 1) % coordinatesToUse.length;
          const nextCoord = coordinatesToUse[nextIndex];
          const wallOpenings = geometryEngine.getOpeningsForWall(openings, index);

          // USAR PAREDES ESPECÍFICAS DE LA PLANTA O DEL STORE
          const wallsToUse = walls2.length > 0 ? walls2 : walls;
          const wall = wallsToUse[index];
          const wallColor = wall?.color || COLORS.wall;

          return (
            <RoomWall
              key={`wall-${floorId || "default"}-${index}`}
              geometry={createWallGeometry(index, coord, nextCoord)}
              material={MaterialService.getWallMaterial({
                colorBase: wallColor,
                isHovered:
                  interactive &&
                  ((wallInteractions.hoveredWall === index &&
                    (isDragActive || openingDrag.isDraggingOpening)) ||
                    openingDrag.previewPosition?.wallIndex === index),
                isDragActive:
                  interactive && (isDragActive || openingDrag.isDraggingOpening),
                // PAREDES SIEMPRE OPACAS
                opacity: 1.0,
              })}
              wallIndex={index}
              eventHandlers={
                interactive
                  ? {
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
                    }
                  : {}
              }
            >
              {/* Aberturas específicas de esta planta */}
              {wallOpenings.map((opening: Opening) => (
                <OpeningMesh
                  key={`opening-${floorId || "default"}-${opening.id}`}
                  coord={coord}
                  nextCoord={nextCoord}
                  wallHeight={depth}
                  opening={opening}
                  eventHandlers={
                    interactive
                      ? {
                          onPointerDown: (e: any) =>
                            openingDrag.handleOpeningPointerDown(
                              opening,
                              e,
                              wallInteractions.calculatePositionFromMouse
                            ),
                          onPointerUp: (e: any) =>
                            openingDrag.handleOpeningPointerUp(),
                          onPointerMove: (e: any) =>
                            openingDrag.handleMouseMove(
                              e,
                              wallInteractions.calculatePositionFromMouse
                            ),
                          onPointerEnter: () =>
                            (document.body.style.cursor = "move"),
                          onPointerLeave: () =>
                            (document.body.style.cursor = "default"),
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
                        }
                      : {}
                  }
                />
              ))}
            </RoomWall>
          );
        })}

        {/* Pisos */}
        {(floors2.length > 0 ? floors2 : floors).map((fl, index) => (
          <RoomFloor
            key={`floor-${floorId || "default"}-${index}`}
            geometry={floorGeometry}
            floorIndex={index}
            material={MaterialService.getWallMaterial({
              colorBase: fl?.color || COLORS.ceiling,
              isHovered:
                interactive &&
                ((wallInteractions.hoveredWall === index &&
                  (isDragActive || openingDrag.isDraggingOpening)) ||
                  openingDrag.previewPosition?.wallIndex === index),
              isDragActive:
                interactive && (isDragActive || openingDrag.isDraggingOpening),
              // PISOS SIEMPRE OPACOS
              opacity: 1.0,
            })}
            floorId={fl.id}
            eventHandlers={
              interactive
                ? {
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
                  }
                : {}
            }
          />
        ))}

        {/* Heatmap solo para planta activa */}
        {interactive && (
          <AcousticHeatmapShader2
            wallCoordinates={coordinatesToUse}
            isVisible={showHeatmap}
            Lp_in={70}
          />
        )}
      </group>
    </animated.group>
  );
}
