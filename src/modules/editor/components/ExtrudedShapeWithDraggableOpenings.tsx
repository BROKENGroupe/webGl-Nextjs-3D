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

// ✅ IMPORTS DE SISTEMAS PRINCIPALES
import * as THREE from "three";
import { COLORS, MATERIAL_PROPERTIES, GEOMETRY_CONFIG } from "../../../config/materials";

import { useState, useCallback, useMemo, useEffect } from "react";

import { AcousticMaterial } from "@/modules/editor/types/AcousticMaterial";
import { useBuildingStore } from "@/modules/editor/store/buildingStore";
import { useDrawingStore } from "@/modules/editor/store/drawingStore";
import { useIsoStudyConfigStore } from "@/modules/editor/store/isoStudyConfigStore";
import { useOpeningsStore } from "@/modules/editor/store/openingsStore";
import { useWallsStore } from "@/modules/editor/store/wallsStore";
import { GeometryEngine } from "@/modules/editor/core/engine/GeometryEngine";
import { InteractionEngine } from "@/modules/editor/core/engine/InteractionEngine";
import { MaterialService } from "@/modules/editor/core/engine/MaterialService";
import { Opening } from "../types/openings";
import { AcousticHeatmapShader } from "./heatmaps/AcousticHeatmapShader";


/**
 * @interface ExtrudedShapeWithDraggableOpeningsProps
 * @description Propiedades de configuración para el componente principal de habitación
 * 
 * Define los parámetros de entrada necesarios para renderizar una habitación 3D
 * completa con todas sus funcionalidades interactivas y de análisis.
 * 
 * @property {Array<{x: number, z: number}>} planeCoordinates - Coordenadas 2D del perímetro de la habitación
 * @property {Function} onDropOpening - Callback para manejo de drop de elementos arquitectónicos
 * @property {boolean} isDragActive - Estado global de operación de arrastre desde paleta
 * @property {OpeningTemplate | null} draggedTemplate - Template siendo arrastrado desde paleta
 * 
 * @example
 * ```tsx
 * // Definición de habitación rectangular
 * const roomCoordinates = [
 *   { x: 0, z: 0 },     // Esquina inferior izquierda
 *   { x: 5, z: 0 },     // Esquina inferior derecha
 *   { x: 5, z: 4 },     // Esquina superior derecha
 *   { x: 0, z: 4 }      // Esquina superior izquierda
 * ];
 * 
 * // Callback para manejo de drops
 * const handleDropOpening = (wallIndex: number, position: number, template: OpeningTemplate) => {
 *   console.log(`Nueva abertura: ${template.name} en pared ${wallIndex}`);
 *   addOpeningToRoom(wallIndex, position, template);
 * };
 * 
 * // Uso del componente
 * <ExtrudedShapeWithDraggableOpenings
 *   planeCoordinates={roomCoordinates}
 *   onDropOpening={handleDropOpening}
 *   isDragActive={isDraggingFromPalette}
 *   draggedTemplate={currentDraggedTemplate}
 * />
 * ```
 */
interface ExtrudedShapeWithDraggableOpeningsProps {
  planeCoordinates: { x: number; z: number }[];
  onDropOpening: (wallIndex: number, position: number, template: AcousticMaterial) => void;
  isDragActive: boolean;
  draggedTemplate: AcousticMaterial | null;
  showHeatmap?: boolean;
  onToggleHeatmap?: () => void;
  onAddFloor?: () => void;
  floors?: any[];
}

/**
 * @component ExtrudedShapeWithDraggableOpenings
 * @description Componente principal que integra todos los sistemas de la habitación 3D
 * 
 * Renderiza una habitación 3D completa con capacidades avanzadas de interacción,
 * análisis acústico y visualización. Integra múltiples engines especializados
 * para mantener separación de responsabilidades y facilitar el mantenimiento.
 * 
 * ## Sistemas integrados:
 * - **Geometría dinámica**: Paredes, piso y techo con aberturas
 * - **Drag-and-drop**: Colocación de aberturas desde paleta
 * - **Reposicionamiento**: Movimiento de aberturas existentes
 * - **Análisis acústico**: Cálculo en tiempo real de propiedades
 * - **Mapa de calor**: Visualización de niveles de ruido
 * - **Materiales avanzados**: Sistema unificado de MaterialService
 * 
 * ## Arquitectura de engines:
 * - **GeometryEngine**: Creación y manipulación de geometrías 3D
 * - **InteractionEngine**: Gestión de eventos y cálculos de posicionamiento
 * - **MaterialService**: Provisión unificada de materiales Three.js
 * 
 * ## Estados de interacción:
 * 1. **Normal**: Visualización estándar de la habitación
 * 2. **Drag desde paleta**: Colocación de nuevas aberturas
 * 3. **Drag de abertura**: Reposicionamiento de aberturas existentes
 * 4. **Mapa de calor**: Visualización de análisis acústico
 * 5. **Preview**: Feedback visual en tiempo real
 * 
 * @param {ExtrudedShapeWithDraggableOpeningsProps} props - Propiedades de configuración
 * @returns {JSX.Element} Grupo completo de Three.js con todos los elementos de la habitación
 * 
 * @example
 * ```tsx
 * // Uso básico en aplicación principal
 * function RoomViewer() {
 *   const [dragState, setDragState] = useState({
 *     active: false,
 *     template: null
 *   });
 * 
 *   const roomCoords = [
 *     { x: -3, z: -3 }, { x: 3, z: -3 },
 *     { x: 3, z: 3 }, { x: -3, z: 3 }
 *   ];
 * 
 *   return (
 *     <Canvas>
 *       <ExtrudedShapeWithDraggableOpenings
 *         planeCoordinates={roomCoords}
 *         onDropOpening={(wall, pos, template) => {
 *           addOpening(wall, pos, template);
 *           setDragState({ active: false, template: null });
 *         }}
 *         isDragActive={dragState.active}
 *         draggedTemplate={dragState.template}
 *       />
 *     </Canvas>
 *   );
 * }
 * 
 * // Integración con sistema de paletas
 * function ElementPalette() {
 *   const startDrag = (template: OpeningTemplate) => {
 *     setDragState({ active: true, template });
 *   };
 * 
 *   return (
 *     <div>
 *       <button onClick={() => startDrag(doorTemplate)}>
 *         Arrastrar Puerta
 *       </button>
 *       <button onClick={() => startDrag(windowTemplate)}>
 *         Arrastrar Ventana
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 * 
 * @see {@link GeometryEngine} Para creación de geometrías 3D
 * @see {@link InteractionEngine} Para gestión de eventos y posicionamiento
 * @see {@link MaterialService} Para provisión de materiales unificados
 * @see {@link AcousticHeatmapShader} Para visualización de mapas de calor
 * 
 * @performance
 * - **Geometrías memoizadas**: Recálculo solo cuando cambian las coordenadas
 * - **Event handlers optimizados**: Callbacks memoizados con dependencias específicas
 * - **Engine delegation**: Separación de responsabilidades para mejor rendimiento
 * - **Renderizado condicional**: Elementos visuales solo cuando son necesarios
 * 
 * @accessibility
 * - **Feedback visual claro**: Estados distinguibles por colores y opacidades
 * - **Interacciones intuitivas**: Cursors y previews apropiados
 * - **Controles accesibles**: Botones con estados claros
 * - **Logging detallado**: Para debugging y monitoreo
 */
export function ExtrudedShapeWithDraggableOpenings({ 
  planeCoordinates,
  onDropOpening, 
  isDragActive, 
  draggedTemplate,
  showHeatmap = false,
  onToggleHeatmap,
  onAddFloor,
  floors = [],
}: ExtrudedShapeWithDraggableOpeningsProps) {

  // Obtén los valores configurados desde zustand
  const { height } = useIsoStudyConfigStore();
  const { setWallHeight } = useWallsStore();

  // Usa height para la variable depth
  const depth = height ?? 3;

  // Sincroniza la altura global con el store de paredes
  useEffect(() => {
    if (height) {
      setWallHeight(depth);
    }
  }, [height, setWallHeight]);

  /**
   * @section Stores y estado global
   * @description Integración con sistemas de estado centralizados
   */
  
  /**
   * @hook useWallsStore
   * @description Gestión de estado de paredes y análisis estructural
   */
  const { generateWallsFromCoordinates, recalculateAllWallsWithOpenings, generateFloorFromCoordinates, generateCeilingFromCoordinates } = useWallsStore();
  
  /**
   * @hook useDrawingStore
   * @description Estado de coordenadas del plano de trabajo
   */
  const { planeXZCoordinates, hasPlaneCoordinates } = useDrawingStore();
  
  /**
   * @hook useOpeningsStore
   * @description Gestión de aberturas y sus posiciones
   */
  const { openings, updateOpeningPosition } = useOpeningsStore();
  
  // Store de plantas
  const floorsStore = useBuildingStore((state: { floors: any[] }) => state.floors);
  const addFloor = useBuildingStore((state: { addFloor: (floor: any) => void }) => state.addFloor);

  /**
   * @section Estados locales del componente
   * @description Gestión de interacciones y estado visual
   */
  
  /**
   * @state hoveredWall
   * @description Índice de la pared actualmente bajo el cursor
   * @type {number | null}
   */
  const [hoveredWall, setHoveredWall] = useState<number | null>(null);
  
  /**
   * @state draggedOpening
   * @description Abertura siendo arrastrada para reposicionamiento
   * @type {Opening | null}
   */
  const [draggedOpening, setDraggedOpening] = useState<Opening | null>(null);
  
  /**
   * @state isDraggingOpening
   * @description Estado de operación de arrastre de abertura existente
   * @type {boolean}
   */
  const [isDraggingOpening, setIsDraggingOpening] = useState(false);
  
  /**
   * @state previewPosition
   * @description Posición de preview durante operaciones de arrastre
   * @type {Object | null}
   */
  const [previewPosition, setPreviewPosition] = useState<{
    wallIndex: number;
    position: number;
    worldX: number;
    worldY: number;
    worldZ: number;
  } | null>(null);

  /**
   * @state showHeatmap
   * @description Control de visibilidad del mapa de calor acústico
   * @type {boolean}
   */
  const [showHeatmapLocal, setShowHeatmap] = useState(false);

  /**
   * @section Determinación de coordenadas
   * @description Selección entre coordenadas del store o fallback
   */
  
  /**
   * @calculation coordinatesToUse
   * @description Coordenadas finales para renderización
   * 
   * Sistema de fallback que utiliza coordenadas del store si están disponibles,
   * o coordenadas predefinidas como backup para desarrollo y testing.
   */
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

  /**
   * @section Efectos de inicialización
   * @description Configuración automática al montar el componente
   */

  /**
   * @effect generateWallsOnMount
   * @description Genera paredes automáticamente cuando se monta el componente
   * 
   * Se ejecuta una vez al montar si hay coordenadas válidas disponibles.
   * Inicializa el sistema de análisis estructural y acústico.
   */
  useEffect(() => {
    if (coordinatesToUse.length >= 3) {
      generateWallsFromCoordinates(coordinatesToUse);
      generateFloorFromCoordinates(coordinatesToUse);
      generateCeilingFromCoordinates(coordinatesToUse);
    }
  }, [coordinatesToUse, generateWallsFromCoordinates, generateFloorFromCoordinates, generateCeilingFromCoordinates]);

  /**
   * @effect recalculateOnOpeningsChange
   * @description Recalcula análisis cuando cambian las aberturas
   * 
   * Se ejecuta cada vez que se agregan, eliminan o mueven aberturas.
   * Mantiene sincronizado el análisis acústico con la configuración actual.
   */
  useEffect(() => {
    if (openings.length > 0 && coordinatesToUse.length >= 3) {
      console.log('🔄 ABERTURAS DETECTADAS - Recalculando análisis acústico...');
      recalculateAllWallsWithOpenings(openings);
    }
  }, [openings, recalculateAllWallsWithOpenings, coordinatesToUse]);

  // Validación temprana - retornar null si no hay coordenadas suficientes
  if (coordinatesToUse.length < 3) {
    return null;
  }

  /**
   * @constant depth
   * @description Altura estándar de la habitación en metros
   * @type {number}
   */
  
  /**
   * @section Funciones delegadas a engines
   * @description Operaciones especializadas manejadas por engines externos
   */
  
  /**
   * @function getOpeningsForWall
   * @description Obtiene aberturas asociadas a una pared específica
   * 
   * Delega al GeometryEngine la lógica de filtrado de aberturas por pared.
   * 
   * @param {number} wallIndex - Índice de la pared
   * @returns {Opening[]} Array de aberturas en la pared especificada
   */
  const getOpeningsForWall = (wallIndex: number): Opening[] => {
    return GeometryEngine.getOpeningsForWall(openings, wallIndex);
  };

  /**
   * @section Geometrías memoizadas
   * @description Geometrías principales optimizadas con memoización
   */

  /**
   * @memo floorGeometry
   * @description Geometría del piso memoizada
   * 
   * Se recalcula solo cuando cambian las coordenadas de la habitación.
   * Utiliza GeometryEngine para creación optimizada.
   */
  const floorGeometry = useMemo(() => 
    GeometryEngine.createFloorGeometry(coordinatesToUse), 
    [coordinatesToUse]
  );

  /**
   * @memo ceilingGeometry
   * @description Geometría del techo memoizada
   * 
   * Se recalcula cuando cambian coordenadas o altura de la habitación.
   * Posicionada en la parte superior del volumen 3D.
   */
  const ceilingGeometry = useMemo(() => 
    GeometryEngine.createCeilingGeometry(coordinatesToUse, depth), 
    [coordinatesToUse, depth]
  );

  /**
   * @function createWallGeometry
   * @description Crea geometría de pared con aberturas dinámicamente
   * 
   * Función memoizada que delega al GeometryEngine la creación de
   * geometrías de pared con holes para aberturas. Se recalcula solo
   * cuando cambian las aberturas asociadas a la pared específica.
   * 
   * @param {number} wallIndex - Índice de la pared
   * @param {Object} p1 - Punto inicial de la pared
   * @param {Object} p2 - Punto final de la pared
   * @returns {THREE.BufferGeometry} Geometría de pared con aberturas
   */
  const createWallGeometry = useCallback((wallIndex: number, p1: {x: number, z: number}, p2: {x: number, z: number}) => {
    const wallOpenings = getOpeningsForWall(wallIndex);
    return GeometryEngine.createWallGeometry(wallIndex, p1, p2, depth, wallOpenings);
  }, [depth, openings]);

  /**
   * @section Event handlers para interacciones
   * @description Manejadores de eventos optimizados y memoizados
   */

  /**
   * @function handleWallPointerEnter
   * @description Maneja entrada del cursor en pared durante operaciones de drag
   * 
   * Solo activo durante operaciones de arrastre (desde paleta o reposicionamiento).
   * Establece el estado visual de hover para feedback al usuario.
   * 
   * @param {number} wallIndex - Índice de la pared donde entra el cursor
   */
  const handleWallPointerEnter = useCallback((wallIndex: number) => {
    if ((isDragActive && draggedTemplate) || (isDraggingOpening && draggedOpening)) {
      setHoveredWall(wallIndex);
    }
  }, [isDragActive, draggedTemplate, isDraggingOpening, draggedOpening]);

  /**
   * @function handleWallPointerLeave
   * @description Maneja salida del cursor de pared
   * 
   * Limpia el estado de hover cuando el cursor sale de cualquier pared.
   * Restablece el estado visual normal.
   */
  const handleWallPointerLeave = useCallback(() => {
    setHoveredWall(null);
  }, []);

  /**
   * @function calculatePositionFromMouse
   * @description Calcula posición 3D desde coordenadas del cursor
   * 
   * Delega al InteractionEngine los cálculos complejos de transformación
   * de coordenadas de pantalla a posición en el mundo 3D.
   * 
   * @param {any} event - Evento de Three.js con información del cursor
   * @returns {Object | null} Posición calculada o null si no es válida
   */
  const calculatePositionFromMouse = useCallback((event: any) => {
    return InteractionEngine.calculatePositionFromMouse(
      event,
      isDraggingOpening,
      draggedOpening,
      coordinatesToUse
    );
  }, [isDraggingOpening, draggedOpening, coordinatesToUse]);

  /**
   * @function handleOpeningPointerDown
   * @description Inicia operación de arrastre de abertura existente
   * 
   * Solo activo cuando no hay operación de drag desde paleta en curso.
   * Establece el estado de arrastre y calcula posición inicial.
   * 
   * @param {Opening} opening - Abertura siendo seleccionada para arrastre
   * @param {any} event - Evento de pointer de Three.js
   */
  const handleOpeningPointerDown = useCallback((opening: Opening, event: any) => {
    if (!isDragActive) {
      event.stopPropagation();
      setDraggedOpening(opening);
      setIsDraggingOpening(true);
      
      // Calcular posición inicial usando engine
      const initialPos = calculatePositionFromMouse(event);
      if (initialPos) {
        setPreviewPosition(initialPos);
      }
      
      console.log(`🎯 INICIANDO ARRASTRE de abertura ${opening.id}`);
    }
  }, [isDragActive, calculatePositionFromMouse]);

  /**
   * @function handleOpeningPointerUp
   * @description Finaliza operación de arrastre de abertura
   * 
   * Confirma la nueva posición si hay un preview válido y actualiza
   * el store. Limpia todos los estados relacionados con el arrastre.
   */
  const handleOpeningPointerUp = useCallback(() => {
    if (isDraggingOpening && draggedOpening && previewPosition) {
      console.log(`🎯 FINALIZANDO ARRASTRE de abertura ${draggedOpening.id}`);
      
      // Actualizar posición en el store
      updateOpeningPosition(draggedOpening.id, previewPosition.wallIndex, previewPosition.position);
      
      // Limpiar estados
      setDraggedOpening(null);
      setIsDraggingOpening(false);
      setPreviewPosition(null);
    }
  }, [isDraggingOpening, draggedOpening, previewPosition, updateOpeningPosition]);

  /**
   * @function handleMouseMove
   * @description Actualiza preview durante movimiento del cursor
   * 
   * Solo activo durante arrastre de abertura existente. Calcula nueva
   * posición en tiempo real para feedback visual continuo.
   * 
   * @param {any} event - Evento de movimiento de Three.js
   */
  const handleMouseMove = useCallback((event: any) => {
    if (isDraggingOpening && draggedOpening) {
      // Calcular nueva posición usando engine
      const newPosition = calculatePositionFromMouse(event);
      if (newPosition) {
        setPreviewPosition(newPosition);
      }
    }
  }, [isDraggingOpening, draggedOpening, calculatePositionFromMouse]);

  /**
   * @function handleWallClick
   * @description Maneja clics en paredes para diferentes operaciones
   * 
   * Comportamiento dual según el estado actual:
   * - Durante arrastre de abertura: Confirma nueva posición
   * - Durante drag desde paleta: Coloca nuevo elemento
   * 
   * @param {number} wallIndex - Índice de la pared clickeada
   * @param {any} event - Evento de clic de Three.js
   */
  const handleWallClick = useCallback((wallIndex: number, event: any) => {
    // Caso 1: Finalizando arrastre de abertura existente
    if (isDraggingOpening && draggedOpening) {
      handleOpeningPointerUp();
      event.stopPropagation();
      return;
    }
    
    // Caso 2: Drop de template desde paleta
    if (isDragActive && draggedTemplate) {
      // Calcular posición usando engine
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

  // Función para agregar una nueva planta duplicada
  function handleAddFloor(event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void {
    event.preventDefault();

    const depth = 3;
    const lastHeight = floors.length > 0
      ? floors[floors.length - 1].baseHeight + depth
      : depth;

    const coords = planeXZCoordinates.length >= 3 ? planeXZCoordinates : coordinatesToUse;
    const rawWalls = GeometryEngine.generateWallsFromCoordinates(coords);
    const newWalls = rawWalls.map((wall, idx) => ({
      ...wall,
      id: crypto.randomUUID(),
      wallIndex: idx,
      template: wall.template ?? null,
      area: wall.area ?? 0,
      currentCondition: wall.currentCondition ?? 'default',
      start: wall.start,
      end: wall.end,
    }));

    const newFloor = {
      id: crypto.randomUUID(),
      name: `Planta ${floors.length + 1}`,
      coordinates: coords.map((c: { x: number; z: number }) => ({ x: c.x, y: 0, z: c.z })),
      baseHeight: lastHeight,
      walls: newWalls,
      openings: []
    };

    addFloor(newFloor);
    console.log("➕ Planta agregada correctamente:", newFloor);
  }

  /**
   * @section Renderizado del componente
   * @description Estructura JSX completa con todos los elementos de la habitación
   */
  return (
    <group>
      {/* 
        PISO
        Utiliza MaterialService para material unificado con propiedades apropiadas
      */}
      <mesh geometry={floorGeometry}>
        <primitive object={MaterialService.getFloorMaterial()} />
      </mesh>
      
      {/* 
        SISTEMA DE PAREDES CON ABERTURAS
        Renderiza cada pared con sus aberturas asociadas y eventos interactivos
      */}
      {coordinatesToUse.map((coord: { x: number; z: number }, index: number) => {
        const nextIndex = (index + 1) % coordinatesToUse.length;
        const nextCoord = coordinatesToUse[nextIndex];
        const wallOpenings = getOpeningsForWall(index);
        
        return (
          <group key={`wall-group-${index}`}>
            {/* MESH DE PARED con eventos interactivos */}
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
              {/* Material dinámico según estado de interacción */}
              <primitive object={MaterialService.getWallMaterial({
                isHovered: (hoveredWall === index && (isDragActive || isDraggingOpening)) ||
                          (previewPosition?.wallIndex === index),
                isDragActive: isDragActive || isDraggingOpening,
                opacity: (isDragActive || isDraggingOpening) ? 0.8 : 1.0
              })} />
            </mesh>
            
            {/* 
              ABERTURAS EN LA PARED
              Cada abertura se renderiza como elemento interactivo independiente
            */}
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
                  {/* ESFERA PRINCIPAL de la abertura */}
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
                    <primitive object={MaterialService.getOpeningMaterial(
                      isBeingDragged ? 'dragging' : 'normal'
                    )} />
                  </mesh>
                  
                  {/* INDICADOR PEQUEÑO encima de la abertura */}
                  <mesh position={[displayPosition.x, displayPosition.y + 0.2, displayPosition.z]}>
                    <sphereGeometry args={[0.01]} />
                    <primitive object={MaterialService.getPreviewMaterial('indicator')} />
                  </mesh>
                  
                  {/* 
                    ELEMENTOS DE PREVIEW durante arrastre
                    Solo visible cuando la abertura está siendo arrastrada
                  */}
                  {isBeingDragged && previewPosition && (
                    <group>
                      {/* LÍNEA DE CONEXIÓN entre posición original y nueva */}
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
                        <primitive object={MaterialService.getPreviewMaterial('line')} />
                      </mesh>
                      
                      {/* INDICADOR DE NUEVA POSICIÓN */}
                      <mesh position={[displayPosition.x, displayPosition.y + 0.3, displayPosition.z]}>
                        <sphereGeometry args={[0.05]} />
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
      
      {/* 
        TECHO
        Utiliza MaterialService para material con transparencia apropiada
      */}
      <mesh geometry={ceilingGeometry}>
        <primitive object={MaterialService.getCeilingMaterial()} />
      </mesh>

      {/* 
        INDICADOR GLOBAL DE ARRASTRE
        Elemento visual en la parte superior durante operaciones de arrastre
      */}
      {isDraggingOpening && draggedOpening && (
        <group>
          <mesh position={[0, depth + 1, 0]}>
            <sphereGeometry args={[0.1]} />
            <meshBasicMaterial color="#FF4444" />
          </mesh>
        </group>
      )}

      {/* 
        SISTEMA DE MAPA DE CALOR ACÚSTICO
        Análisis en tiempo real de propiedades acústicas de la habitación
      */}
      <AcousticHeatmapShader
        wallCoordinates={coordinatesToUse}
        isVisible={showHeatmap}
        Lp_in={70}
      />      

      {/* 
        RENDERIZADO DE PLANTAS EXISTENTES
        Duplica el volumen de la habitación para cada planta en el store
      */}
      {onAddFloor && floors.map((floor, idx) => {
        // Extruir paredes de la planta duplicada
        const wallMeshes = floor.walls.map((wall: {
          id: string;
          wallIndex: number;
          template?: any;
          area?: number;
          currentCondition?: string;
          start: { x: number; z: number };
          end: { x: number; z: number };
        }, wIdx: number) => (
          <mesh
            key={`wall-${floor.id}-${wIdx}`}
            geometry={GeometryEngine.createWallGeometry(
              wIdx,
              wall.start,
              wall.end,
              depth,
              [] // Si quieres aberturas, pásalas aquí
            )}
          >
            <meshStandardMaterial
              color={COLORS.wall}
              transparent
              opacity={COLORS.wallOpacity}
            />
          </mesh>
        ));

        // Extruir techo de la planta duplicada
        const ceilingMesh = (
          <mesh
            geometry={GeometryEngine.createCeilingGeometry(floor.coordinates, depth)}
            position={[0, 0, 0]}
          >
            <meshStandardMaterial
              color={COLORS.ceiling}
              transparent
              opacity={COLORS.ceilingOpacity}
            />
          </mesh>
        );

        // Extruir piso de la planta duplicada
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

      {/* 
        Si necesitas renderizar paredes internas, define el array 'internalWalls' arriba.
        Ejemplo:
        const internalWalls = [
          { start: [0, 0, 0], end: [1, 0, 1] },
          // ...más paredes internas
        ];
        Luego descomenta el siguiente bloque:
        {internalWalls && internalWalls.map((wall: { start: [number, number, number]; end: [number, number, number] }, idx: number) => (
          <Line
            key={idx}
            points={[wall.start, wall.end]}
            color="red"
            lineWidth={2}
          />
        ))}
      */}
    </group>
  );
}

/**
 * @exports ExtrudedShapeWithDraggableOpenings
 * @description Exportación por defecto del componente principal de habitación 3D
 */

/**
 * @namespace ComponentMetadata
 * @description Metadatos técnicos del componente
 * 
 * @property {string} componentType - "Advanced 3D Room System"
 * @property {string[]} features - [
 *   "Dynamic Geometry", "Drag and Drop", "Opening Repositioning", 
 *   "Acoustic Analysis", "Heat Map Visualization", "Material Service Integration"
 * ]
 * @property {string[]} engines - ["GeometryEngine", "InteractionEngine", "MaterialService"]
 * @property {string[]} patterns - [
 *   "Engine Delegation", "State Management", "Event Handling", 
 *   "Performance Optimization", "Separation of Concerns"
 * ]
 * @property {Object} performance - Optimizaciones de rendimiento
 * @property {string} performance.geometry - "Memoized with dependency tracking"
 * @property {string} performance.events - "Memoized callbacks with specific dependencies"
 * @property {string} performance.materials - "Unified MaterialService instances"
 * @property {string} performance.rendering - "Conditional preview elements"
 * @property {Object} interactions - Tipos de interacciones soportadas
 * @property {string[]} interactions.dragTypes - ["Palette to Wall", "Opening Repositioning"]
 * @property {string[]} interactions.visualFeedback - ["Color Coding", "Opacity Changes", "Preview Elements"]
 * @property {string[]} interactions.cursorStates - ["Default", "Grab", "Grabbing", "Drop"]
 * @property {Object} analysis - Capacidades de análisis
 * @property {string[]} analysis.acoustic - ["Real-time Calculation", "Heat Map Visualization"]
 * @property {string[]} analysis.structural - ["Wall Generation", "Opening Integration"]
 * @property {string[]} analysis.visual - ["Material Properties", "Lighting Response"]
 */