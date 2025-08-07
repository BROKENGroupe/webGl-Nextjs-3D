// ✅ AGREGAR import del store de paredes
import { useWallsStore } from "../store/wallsStore";
import { MaterialService } from "../engine/MaterialService";

// ✅ AGREGAR imports de engines
import * as THREE from "three";
import { useOpeningsStore } from "../store/openingsStore";
import { useDrawingStore } from "../store/drawingStore";
import { COLORS, MATERIAL_PROPERTIES, GEOMETRY_CONFIG } from "../config/materials";
import { Opening, OpeningTemplate } from "../types/openings";
import { useState, useCallback, useMemo, useEffect } from "react"; // ✅ AGREGAR useEffect

// ✅ NUEVOS IMPORTS - ENGINES
import { GeometryEngine } from "../engine/GeometryEngine";
import { InteractionEngine } from "../engine/InteractionEngine";

interface ExtrudedShapeWithDraggableOpeningsProps {
  planeCoordinates: { x: number; z: number }[];
  onDropOpening: (wallIndex: number, position: number, template: OpeningTemplate) => void;
  isDragActive: boolean;
  draggedTemplate: OpeningTemplate | null;
}

export function ExtrudedShapeWithDraggableOpenings({ 
  planeCoordinates,
  onDropOpening, 
  isDragActive, 
  draggedTemplate 
}: ExtrudedShapeWithDraggableOpeningsProps) {
  
  // Stores
  const { generateWallsFromCoordinates, recalculateAllWallsWithOpenings } = useWallsStore();
  const { planeXZCoordinates, hasPlaneCoordinates } = useDrawingStore();
  const { openings, updateOpeningPosition } = useOpeningsStore();
  const [hoveredWall, setHoveredWall] = useState<number | null>(null);
  const [draggedOpening, setDraggedOpening] = useState<Opening | null>(null);
  const [isDraggingOpening, setIsDraggingOpening] = useState(false);
  const [previewPosition, setPreviewPosition] = useState<{
    wallIndex: number;
    position: number;
    worldX: number;
    worldY: number;
    worldZ: number;
  } | null>(null);

  // ✅ COORDENADAS SIN CAMBIOS
  let coordinatesToUse = planeXZCoordinates;
  
  if (!hasPlaneCoordinates || coordinatesToUse.length < 3) {
    coordinatesToUse = [
      { x: -6.5, z: -7 },
      { x: 4, z: -4.5 },
      { x: 2, z: 6 },
      { x: -7.5, z: 4.5 },
      { x: -6.5, z: -6.5 }
    ];
    console.log('🏗️ Usando coordenadas exactas del localStorage');
  }

  console.log('🔍 COORDENADAS FINALES:', coordinatesToUse);

  // ✅ AGREGAR USEEFFECT PARA GENERAR PAREDES CUANDO SE MONTA EL COMPONENTE
  useEffect(() => {
    if (coordinatesToUse.length >= 3) {
      console.log('🎯 COMPONENTE ExtrudedShape MONTADO - Generando paredes...');
      generateWallsFromCoordinates(coordinatesToUse);
    }
  }, [coordinatesToUse, generateWallsFromCoordinates]);

  // ✅ NUEVO USEEFFECT PARA RECALCULAR CUANDO CAMBIAN LAS ABERTURAS
  useEffect(() => {
    if (openings.length > 0 && coordinatesToUse.length >= 3) {
      console.log('🔄 ABERTURAS DETECTADAS - Recalculando análisis acústico...');
      recalculateAllWallsWithOpenings(openings);
    }
  }, [openings, recalculateAllWallsWithOpenings, coordinatesToUse]);

  if (coordinatesToUse.length < 3) {
    return null;
  }

  const depth = 3;
  
  // ✅ DELEGAR A ENGINE - getOpeningsForWall
  const getOpeningsForWall = (wallIndex: number): Opening[] => {
    return GeometryEngine.getOpeningsForWall(openings, wallIndex);
  };

  // ✅ GEOMETRÍAS MEMOIZADAS USANDO ENGINES
  const floorGeometry = useMemo(() => 
    GeometryEngine.createFloorGeometry(coordinatesToUse), 
    [coordinatesToUse]
  );

  const ceilingGeometry = useMemo(() => 
    GeometryEngine.createCeilingGeometry(coordinatesToUse, depth), 
    [coordinatesToUse, depth]
  );

  // ✅ DELEGAR A ENGINE - createWallGeometry
  const createWallGeometry = useCallback((wallIndex: number, p1: {x: number, z: number}, p2: {x: number, z: number}) => {
    const wallOpenings = getOpeningsForWall(wallIndex);
    return GeometryEngine.createWallGeometry(wallIndex, p1, p2, depth, wallOpenings);
  }, [depth, openings]);

  // ✅ EVENTOS SIN CAMBIOS
  const handleWallPointerEnter = useCallback((wallIndex: number) => {
    if ((isDragActive && draggedTemplate) || (isDraggingOpening && draggedOpening)) {
      setHoveredWall(wallIndex);
    }
  }, [isDragActive, draggedTemplate, isDraggingOpening, draggedOpening]);

  const handleWallPointerLeave = useCallback(() => {
    setHoveredWall(null);
  }, []);

  // ✅ DELEGAR A ENGINE - calculatePositionFromMouse
  const calculatePositionFromMouse = useCallback((event: any) => {
    return InteractionEngine.calculatePositionFromMouse(
      event,
      isDraggingOpening,
      draggedOpening,
      coordinatesToUse
    );
  }, [isDraggingOpening, draggedOpening, coordinatesToUse]);

  // ✅ MANEJADORES SIN CAMBIOS - SOLO USAN ENGINE
  const handleOpeningPointerDown = useCallback((opening: Opening, event: any) => {
    if (!isDragActive) {
      event.stopPropagation();
      setDraggedOpening(opening);
      setIsDraggingOpening(true);
      
      // ✅ USAR ENGINE
      const initialPos = calculatePositionFromMouse(event);
      if (initialPos) {
        setPreviewPosition(initialPos);
      }
      
      console.log(`🎯 INICIANDO ARRASTRE de abertura ${opening.id}`);
    }
  }, [isDragActive, calculatePositionFromMouse]);

  const handleOpeningPointerUp = useCallback(() => {
    if (isDraggingOpening && draggedOpening && previewPosition) {
      console.log(`🎯 FINALIZANDO ARRASTRE de abertura ${draggedOpening.id}`);
      
      updateOpeningPosition(draggedOpening.id, previewPosition.wallIndex, previewPosition.position);
      
      setDraggedOpening(null);
      setIsDraggingOpening(false);
      setPreviewPosition(null);
    }
  }, [isDraggingOpening, draggedOpening, previewPosition, updateOpeningPosition]);

  const handleMouseMove = useCallback((event: any) => {
    if (isDraggingOpening && draggedOpening) {
      // ✅ USAR ENGINE
      const newPosition = calculatePositionFromMouse(event);
      if (newPosition) {
        setPreviewPosition(newPosition);
      }
    }
  }, [isDraggingOpening, draggedOpening, calculatePositionFromMouse]);

  const handleWallClick = useCallback((wallIndex: number, event: any) => {
    if (isDraggingOpening && draggedOpening) {
      handleOpeningPointerUp();
      event.stopPropagation();
      return;
    }
    
    if (isDragActive && draggedTemplate) {
      // ✅ USAR ENGINE
      const clampedPosition = InteractionEngine.calculateTemplateDropPosition(
        event,
        wallIndex,
        coordinatesToUse,
        depth
      );
      
      console.log(`🎯 DROP template en pared ${wallIndex} en posición ${clampedPosition.toFixed(2)}`);
      onDropOpening(wallIndex, clampedPosition, draggedTemplate);
      
      setHoveredWall(null);
    }
  }, [isDragActive, draggedTemplate, isDraggingOpening, draggedOpening, handleOpeningPointerUp, onDropOpening, coordinatesToUse, depth]);

  // ✅ RENDER EXACTAMENTE IGUAL - SOLO CAMBIAN LAS LLAMADAS A ENGINES
  return (
    <group>
      {/* ✅ PISO - SOLO CAMBIAR MATERIAL */}
      <mesh geometry={floorGeometry}>
        {/* ❌ REEMPLAZAR: <meshStandardMaterial 
          color={COLORS.FLOOR}
          side={THREE.DoubleSide}
          roughness={MATERIAL_PROPERTIES.FLOOR.roughness}
          metalness={MATERIAL_PROPERTIES.FLOOR.metalness}
        /> */}
        
        {/* ✅ POR: */}
        <primitive object={MaterialService.getFloorMaterial()} />
      </mesh>
      
      {/* ✅ PAREDES - SOLO CAMBIAR MATERIAL */}
      {coordinatesToUse.map((coord, index) => {
        const nextIndex = (index + 1) % coordinatesToUse.length;
        const nextCoord = coordinatesToUse[nextIndex];
        const wallOpenings = getOpeningsForWall(index);
        
        return (
          <group key={`wall-group-${index}`}>
            <mesh 
              geometry={createWallGeometry(index, coord, nextCoord)}
              userData={{ wallIndex: index, type: 'wall' }}
              onPointerEnter={(e) => {
                e.stopPropagation();
                handleWallPointerEnter(index);
              }}
              onPointerLeave={(e) => {
                e.stopPropagation();
                handleWallPointerLeave();
              }}
              onPointerMove={(e) => {
                e.stopPropagation();
                handleMouseMove(e);
              }}
              onClick={(e) => {
                e.stopPropagation();
                handleWallClick(index, e);
              }}
            >
              {/* ❌ REEMPLAZAR: <meshStandardMaterial 
                color={
                  (hoveredWall === index && (isDragActive || isDraggingOpening)) ||
                  (previewPosition?.wallIndex === index)
                    ? "#4CAF50" 
                    : COLORS.WALLS
                }
                side={THREE.DoubleSide}
                roughness={MATERIAL_PROPERTIES.WALLS.roughness}
                metalness={MATERIAL_PROPERTIES.WALLS.metalness}
                transparent={isDragActive || isDraggingOpening}
                opacity={(isDragActive || isDraggingOpening) ? 0.8 : 1.0}
              /> */}
              
              {/* ✅ POR: */}
              <primitive object={MaterialService.getWallMaterial({
                isHovered: (hoveredWall === index && (isDragActive || isDraggingOpening)) ||
                          (previewPosition?.wallIndex === index),
                isDragActive: isDragActive || isDraggingOpening,
                opacity: (isDragActive || isDraggingOpening) ? 0.8 : 1.0
              })} />
            </mesh>
            
            {/* ✅ PUNTOS DE ABERTURA - SOLO CAMBIAR MATERIAL */}
            {wallOpenings.map(opening => {
              const isBeingDragged = draggedOpening?.id === opening.id;
              const displayPosition = InteractionEngine.calculateDisplayPosition(
                opening,
                isBeingDragged,
                previewPosition,
                coord,
                nextCoord
              );
              
              return (
                <group key={`opening-${index}-${opening.id}`}>
                  <mesh 
                    position={[displayPosition.x, displayPosition.y, displayPosition.z]}
                    userData={{ opening, type: 'opening' }}
                    onPointerDown={(e) => {
                      e.stopPropagation();
                      handleOpeningPointerDown(opening, e);
                    }}
                    onPointerUp={(e) => {
                      e.stopPropagation();
                      handleOpeningPointerUp();
                    }}
                    onPointerMove={(e) => {
                      e.stopPropagation();
                      if (isBeingDragged) {
                        handleMouseMove(e);
                      }
                    }}
                    onPointerEnter={(e) => {
                      e.stopPropagation();
                      if (!isDragActive && !isDraggingOpening) {
                        document.body.style.cursor = 'grab';
                      }
                    }}
                    onPointerLeave={(e) => {
                      e.stopPropagation();
                      if (!isDraggingOpening) {
                        document.body.style.cursor = 'default';
                      }
                    }}
                  >
                    <sphereGeometry args={[isBeingDragged ? 0.06 : 0.03]} />
                    
                    {/* ❌ REEMPLAZAR: <meshBasicMaterial 
                      color={isBeingDragged ? "#FF4444" : "#FFD700"}
                      transparent={true}
                      opacity={isBeingDragged ? 0.8 : 1.0}
                    /> */}
                    
                    {/* ✅ POR: */}
                    <primitive object={MaterialService.getOpeningMaterial(
                      isBeingDragged ? 'dragging' : 'normal'
                    )} />
                  </mesh>
                  
                  {/* ✅ ELEMENTO PEQUEÑO - SOLO CAMBIAR MATERIAL */}
                  <mesh position={[displayPosition.x, displayPosition.y + 0.2, displayPosition.z]}>
                    <sphereGeometry args={[0.01]} />
                    
                    {/* ❌ REEMPLAZAR: <meshBasicMaterial color="#FFFFFF" /> */}
                    {/* ✅ POR: */}
                    <primitive object={MaterialService.getPreviewMaterial('indicator')} />
                  </mesh>
                  
                  {/* ✅ PREVIEW ELEMENTS - SOLO CAMBIAR MATERIALES */}
                  {isBeingDragged && previewPosition && (
                    <group>
                      <mesh position={[
                        (coord.x + opening.position * (nextCoord.x - coord.x) + displayPosition.x) / 2,
                        displayPosition.y,
                        (coord.z + opening.position * (nextCoord.z - coord.z) + displayPosition.z) / 2
                      ]}>
                        <boxGeometry args={[
                          Math.abs(displayPosition.x - (coord.x + opening.position * (nextCoord.x - coord.x))),
                          0.01,
                          Math.abs(displayPosition.z - (coord.z + opening.position * (nextCoord.z - coord.z)))
                        ]} />
                        
                        {/* ❌ REEMPLAZAR: <meshBasicMaterial color="#FF4444" transparent opacity={0.5} /> */}
                        {/* ✅ POR: */}
                        <primitive object={MaterialService.getPreviewMaterial('line')} />
                      </mesh>
                      
                      <mesh position={[displayPosition.x, displayPosition.y + 0.3, displayPosition.z]}>
                        <sphereGeometry args={[0.05]} />
                        
                        {/* ❌ REEMPLAZAR: <meshBasicMaterial color="#00FF00" /> */}
                        {/* ✅ POR: */}
                        <primitive object={MaterialService.getPreviewMaterial('indicator')} />
                      </mesh>
                    </group>
                  )}
                </group>
              );
            })}
          </group>
        );
      })}
      
      {/* ✅ TECHO - SOLO CAMBIAR MATERIAL */}
      <mesh geometry={ceilingGeometry}>
        {/* ❌ REEMPLAZAR: <meshStandardMaterial 
          color={COLORS.CEILING}
          side={THREE.DoubleSide}
          roughness={MATERIAL_PROPERTIES.CEILING.roughness}
          metalness={MATERIAL_PROPERTIES.CEILING.metalness}
          transparent={true}
          opacity={0.7}
        /> */}
        
        {/* ✅ POR: */}
        <primitive object={MaterialService.getCeilingMaterial()} />
      </mesh>

      {/* ✅ ELEMENTOS DEBUG - MANTENER EXACTAMENTE IGUAL */}
      {coordinatesToUse.map((coord, index) => (
        <mesh 
          key={`point-${index}`}
          position={[coord.x, depth + 0.2, coord.z]}
        >
          <sphereGeometry args={[0.05]} />
          <meshBasicMaterial color={index === 0 ? "#00ff00" : "#ff0000"} />
        </mesh>
      ))}

      {coordinatesToUse.map((coord, index) => {
        const nextIndex = (index + 1) % coordinatesToUse.length;
        const nextCoord = coordinatesToUse[nextIndex];
        
        const length = Math.sqrt(
          (nextCoord.x - coord.x) ** 2 + (nextCoord.z - coord.z) ** 2
        );
        const angle = Math.atan2(nextCoord.z - coord.z, nextCoord.x - coord.x);
        const centerX = (coord.x + nextCoord.x) / 2;
        const centerZ = (coord.z + nextCoord.z) / 2;
        
        return (
          <mesh 
            key={`line-${index}`}
            position={[centerX, 0.05, centerZ]}
            rotation={[0, angle, 0]}
          >
            <boxGeometry args={[length, 0.02, 0.02]} />
            <meshBasicMaterial color="#00ff00" />
          </mesh>
        );
      })}
      
      {/* ✅ DRAG INDICATOR - MANTENER EXACTAMENTE IGUAL */}
      {isDraggingOpening && draggedOpening && (
        <group>
          <mesh position={[0, depth + 1, 0]}>
            <sphereGeometry args={[0.1]} />
            <meshBasicMaterial color="#FF4444" />
          </mesh>
        </group>
      )}
    </group>
  );
}