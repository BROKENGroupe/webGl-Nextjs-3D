"use client";

import { Canvas } from "@react-three/fiber";
import {
  Extrude,
  OrbitControls,
  GizmoHelper,
  GizmoViewport,
} from "@react-three/drei";
import * as THREE from "three";
import { useEffect, useRef, Suspense } from "react";
import { DrawingSurface } from "@/modules/editor/components/DrawingSurface";
import { LineBuilder } from "@/modules/editor/components/2d/LineBuilder";
import { Html } from "@react-three/drei";

import React, { useState } from "react";
import { AcousticAnalysisModal } from "@/modules/analytics/components/modals/AcousticAnalysisModal"; //   NUEVO: Importar modal

import { AppControls } from "@/modules/editor/components/AppControls";
import { AcousticMaterial } from "@/modules/materials/types/AcousticMaterial";

import { IsoStudyConfigModal } from "@/modules/editor/components/modals/IsoStudyConfigModal";
import { useCoordinatesStore } from "@/modules/editor/store/coordinatesStore";
import { useDrawingStore } from "@/modules/editor/store/drawingStore";
import { useIsoStudyConfigStore } from "@/modules/editor/store/isoStudyConfigStore";
import { useOpeningsStore } from "@/modules/editor/store/openingsStore";
import { useIsoResultStore } from "@/modules/editor/store/isoResultStore";
import { useWallsStore } from "@/modules/editor/store/wallsStore";
import { Opening, OpeningType } from "@/modules/editor/types/openings";
import { CollapsibleAside } from "@/modules/editor/components/asside/asside-lateral";
import {
  LayerVisibility,
  LayerPanel,
} from "@/modules/editor/components/asside/layer-panel";
import FacadeContextMenu from "./contextMenus/FacadeContextMenu";
import PropertiesModal from "./modals/PropertiesModal";
import MaterialModal from "./modals/materialModal";
import OpeningContextMenu from "./contextMenus/OpeningContextMenu";
import { ExtrudedShapeWithDraggableOpenings } from "./ExtrudedShapeWithDraggableOpenings";
import { WallsToast } from "./extrudeToast";
import OpenCellingContextMenu from "./contextMenus/openCellingContextMenu";
import OpenFloorContextMenu from "./contextMenus/openFloorContextMenu";

import { ElementType } from "@/modules/editor/types/walls";
import { ISO12354_4Engine } from "@/modules/editor/core/engineMath/ISO12354_4Engine";
import { SegmentsVisualizer } from "./SegmentsVisualizer";
import { FloorReplicationModal } from "./modals/FloorReplicationModal";
import { MultiFloorRenderer } from "./MultiFloorRenderer";
import { useFloorsStore } from "../store/floorsStore";
import { LinePanel } from "./contextMenus/LinePanel";
import { CollapsibleAsideTrigger } from "./asside/asside-lateral-trigger";
import { PressureLevelBar } from "./PressureLevelBar";
import EngineFactory from "../core/engine/EngineFactory";

export default function DrawingScene() {
  // Usar Zustand para el estado global
  const {
    currentPoints,
    currentHoleLines,
    currentHoles,
    isClosed,
    isExtruded,
    isDragging,
    planeXZCoordinates,
    hasPlaneCoordinates,
    setCurrentPoints,
    addCurrentPoint,
    updateCurrentPoint,
    removeCurrentPoint,
    setCurrentHoleLines,
    setCurrentHoles,
    saveCurrentStateForExtrusion,
    setClosed,
    setExtruded,
    setDragging,
    resetAll,
    savePlaneCoordinates,
    clearPlaneCoordinates,
    updatePlaneCoordinatesFromCurrent,
  } = useDrawingStore();

  const geometryEngine = EngineFactory.getGeometryEngine();

  //   NUEVO: States para el modal de análisis acústico
  const [showAcousticModal, setShowAcousticModal] = useState(false);
  //   NUEVO: State para el modal de configuración ISO
  const [showIsoConfigModal, setShowIsoConfigModal] = useState(false);
  const [segments, setSegments] = useState<any[]>([]);
  const [showSegments, setShowSegments] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  // Nuevo estado para el modal de replicación
  const [showFloorReplicationModal, setShowFloorReplicationModal] =
    useState(false);

  //   NUEVO: Acceso al store de paredes
  const { walls } = useWallsStore();
  const { floorLevels } = useFloorsStore();
  const defaultVisibility: LayerVisibility = {
    sources: true,
    microphones: true,
    heatmap: true,
    cube: true,
  };

  function handleProperties() {
    setShowPropertiesModal(true);
    //handleCloseContextMenu();
  }

  function handleChangeMaterial() {
    // Set selectedWallIndex based on contextMenu.itemIndex if available
    if (contextMenu.itemIndex !== null) {
      setSelectedWallIndex(contextMenu.itemIndex);
    }
    setShowMaterialModal(true);
  }

  const [tempHoleLine, setTempHoleLine] = useState<THREE.Vector3[]>([]);

  const [layerVisibility, setLayerVisibility] =
    useState<LayerVisibility>(defaultVisibility);
  const [selectedLayer, setSelectedLayer] = useState<string | undefined>(
    undefined
  );

  const onSelectLayer = (key: any, edit: boolean) => {
    if (!key) return;
    setSelectedLayer(key);
    if (key.template.type === ElementType.Wall) {
      setSelectedFacadeName(key.wallIndex);
      setElementType(key.template.type);
      setTitle(key.title);
    } else if (key.template.type === ElementType.Window) {
      setSelectedOpeningId(key.id);
      setElementType(key.template.type);
      setTitle(key.title);
    } else if (key.template.type === ElementType.Door) {
      setSelectedOpeningId(key.id);
      setElementType(key.template.type);
      setTitle(key.title);
    } else if (key.template.type === ElementType.Ceiling) {
      setSelectedCeilingId(key.id);
      setElementType(key.template.type);
      setTitle(key.title);
    } else if (key.template.type === ElementType.Floor) {
      setSelectedFloorId(key.id);
      setElementType(key.template.type);
      setTitle(key.title);
    }
    if (!edit) {
      setShowPropertiesModal(true);
    } else {
      setShowMaterialModal(true);
    }
  };

  // Estados para el menú contextual
  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    itemType: null as "line" | "vertex" | null,
    itemIndex: null as number | null,
  });

  // Estados para drag & drop de puertas y ventanas
  const [isDragActive, setIsDragActive] = useState(false);
  const [draggedTemplate, setDraggedTemplate] =
    useState<AcousticMaterial | null>(null);
  const { openings, addOpening } = useOpeningsStore();
  const { ceilings, addCeiling, updateWallByIndex } = useWallsStore();
  const { floors, addFloor, updateCeilingByIndex, updateFloorByIndex } =
    useWallsStore();

  const [elementType, setElementType] = useState<ElementType>(ElementType.Wall);

  const [lineMenuVisible, setLineMenuVisible] = useState(false);
  const [selectedLineId, setSelectedLineId] = useState<string | null>(null);

  const handleWallContextMenu = (
    event: any,
    facadeName: number,
    title: string,
    elementType: ElementType
  ) => {
    event.preventDefault();
    event.stopPropagation();

    //   AGREGAR: Forzar fin de drag si está activo
    if (isDragging) {
      setDragging(false);
    }
    if (isDragActive) {
      setIsDragActive(false);
      setDraggedTemplate(null);
    }

    setMenuPosition({ x: event.clientX, y: event.clientY });
    setSelectedFacadeName(facadeName);
    setElementType(elementType);
    setTitle(title);
    setMenuVisible(true);
  };

  const handleOpeningContextMenu = (
    event: any,
    openingId: string,
    title: string,
    elementType: ElementType
  ) => {
    event.preventDefault();
    event.stopPropagation();

    if (isDragging) {
      setDragging(false);
    }
    if (isDragActive) {
      setIsDragActive(false);
      setDraggedTemplate(null);
    }

    setOpeningMenuPosition({ x: event.clientX, y: event.clientY });
    setSelectedOpeningId(openingId);
    setElementType(elementType);
    setTitle(title);
    setOpeningMenuVisible(true);
  };

  const handleCeilingContextMenu = (
    event: any,
    facadeName: string,
    title: string,
    elementType: ElementType
  ) => {
    event.preventDefault();
    event.stopPropagation();

    if (isDragging) {
      setDragging(false);
    }
    if (isDragActive) {
      setIsDragActive(false);
      setDraggedTemplate(null);
    }

    setCeilingMenuPosition({ x: event.clientX, y: event.clientY });
    setSelectedCeilingId(facadeName);
    setElementType(elementType);
    setTitle(title);
    setCeilingMenuVisible(true);
  };

  const handleFloorContextMenu = (
    event: any,
    facadeName: string,
    title: string,
    elementType: ElementType
  ) => {
    event.preventDefault();
    event.stopPropagation();

    if (isDragging) {
      setDragging(false);
    }
    if (isDragActive) {
      setIsDragActive(false);
      setDraggedTemplate(null);
    }

    setFloorMenuPosition({ x: event.clientX, y: event.clientY });
    setSelectedFloorId(facadeName);
    setElementType(elementType);
    setTitle(title);
    setFloorMenuVisible(true);
  };

  const handleLineContextMenu = (
    id: string,
    event: { clientX: number; clientY: number }
  ) => {
    setContextMenu({
      visible: true,
      x: event.clientX,
      y: event.clientY,
      itemType: "line",
      itemIndex: null,
    });

    setSelectedLineId(id);
    setLineMenuVisible(true);
  };

  // NUEVO: Manejador de clic específico para vértices
  const handleVertexClick = (index: number): boolean => {
    if (isDragging) return false;

    // Si se hace clic en el primer vértice y hay suficientes puntos, cerrar la forma
    if (!isClosed && index === 0 && currentPoints.length > 2) {
      const closedPoints = [...currentPoints, currentPoints[0]];
      setCurrentPoints(closedPoints);
      setClosed(true);
      return true;
    }
    return false;
  };

  const handleClick3D = (point: THREE.Vector3) => {
    if (isDragging) return; // No procesar clicks si se está arrastrando

    if (!isClosed) {
      // RE-INTRODUCIR el cierre por proximidad
      if (
        currentPoints.length > 2 &&
        point.distanceTo(currentPoints[0]) < 0.2
      ) {
        // Cerrar la forma agregando el primer punto al final
        const closedPoints = [...currentPoints, currentPoints[0]];
        setCurrentPoints(closedPoints);
        setClosed(true);
      } else {
        // Si no hay proximidad, simplemente agregar el punto
        addCurrentPoint(point);
      }
    } else if (!isExtruded) {
      if (tempHoleLine.length === 0) {
        setTempHoleLine([point]);
      } else {
        const p1 = tempHoleLine[0];
        const p2 = point;
        const from = new THREE.Vector3(
          Math.min(p1.x, p2.x),
          0,
          Math.min(p1.z, p2.z)
        );
        const to = new THREE.Vector3(
          Math.max(p1.x, p2.x),
          2,
          Math.max(p1.z, p2.z)
        );
        setCurrentHoleLines([...currentHoleLines, [p1, p2]]);
        setCurrentHoles([...currentHoles, { from, to }]);
        setTempHoleLine([]);
      }
    }
  };

  const handlePointMove = (index: number, newPosition: THREE.Vector3) => {
    // Si la forma está cerrada y se está moviendo el vértice de unión (el primero o el último)
    if (isClosed && (index === 0 || index === currentPoints.length - 1)) {
      // Actualizar ambos puntos (el inicial y el final) para que permanezcan unidos
      const newPoints = [...currentPoints];
      newPoints[0] = newPosition;
      newPoints[newPoints.length - 1] = newPosition;
      setCurrentPoints(newPoints);
    } else {
      // Comportamiento normal: mover solo el punto seleccionado
      updateCurrentPoint(index, newPosition);
    }

    // Actualizar las coordenadas del plano si ya están guardadas
    updatePlaneCoordinatesFromCurrent();
  };

  const handleVertexRightClick = (
    vertexIndex: number,
    event: { clientX: number; clientY: number }
  ) => {
    setContextMenu({
      visible: true,
      x: event.clientX,
      y: event.clientY,
      itemType: "vertex",
      itemIndex: vertexIndex,
    });
  };

  // Función para manejar la extrusión con coordenadas XZ
  const handleExtrude = () => {
    // Validar que tenemos una forma cerrada
    if (!isClosed || currentPoints.length < 4) {
      alert("⚠️ Necesitas cerrar la forma antes de extruir");
      return;
    }

    // Guardar las coordenadas XZ del plano 2D actual
    savePlaneCoordinates();

    // Verificar que se guardaron correctamente
    const savedCoords = useDrawingStore.getState().planeXZCoordinates;

    if (savedCoords.length < 3) {
      alert("❌ Error al guardar las coordenadas");
      return;
    }

    // Guardar el estado actual para la extrusión (legacy)
    saveCurrentStateForExtrusion();

    // Cambiar a vista 3D
    setExtruded(true);
  };

  // Función para volver a 2D manteniendo las coordenadas guardadas
  const handleBackTo2D = () => {
    setExtruded(false);
    // NO limpiar las coordenadas del plano - las mantenemos para poder re-extruir
  };

  // Función para empezar un nuevo dibujo
  const handleNewDrawing = () => {
    resetAll();
    clearPlaneCoordinates();
  };

  // Limpiar datos guardados en localStorage y reiniciar el estado
  const handleClearStorage = () => {
    localStorage.clear();
    resetAll();
    clearPlaneCoordinates();
  };

  // Agregar función para limpiar datos corruptos
  const handleCleanAndReset = () => {
    localStorage.removeItem("drawing-storage");
    resetAll();
    clearPlaneCoordinates();
    setContextMenu({
      visible: false,
      x: 0,
      y: 0,
      itemType: null,
      itemIndex: null,
    });
    window.location.reload();
  };

  // ===== FUNCIONES PARA DRAG & DROP DE PUERTAS Y VENTANAS =====

  // Manejar inicio de drag desde la paleta
  const handleStartDrag = (template: AcousticMaterial) => {
    setIsDragActive(true);
    setDraggedTemplate(template);
  };

  // Manejar drop en pared
  const handleDropOpening = (
    wallIndex: number,
    position: number,
    template: AcousticMaterial
  ) => {
    if (
      template.type === ElementType.Door ||
      template.type === ElementType.Window
    ) {
      const newOpening: Opening = {
        id: `opening-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: template.type as OpeningType,
        title: "Abertura",
        wallIndex,
        position,
        color: template.color,
        area: template.width * template.height,
        width: template.width,
        height: template.height,
        bottomOffset: template.bottomOffset,
        template,
        currentCondition: "closed_sealed" as const,
        relativePosition: 0,
      };

      addOpening(newOpening);
      console.log("  Abertura creada:", newOpening);
    }

    if (template.type === ElementType.Wall) {
      updateWallByIndex(wallIndex, {
        color: template.color,
        template: template,
      });
    }

    if (template.type === ElementType.Ceiling) {
      updateCeilingByIndex(wallIndex, {
        color: template.color,
        template: template,
      });
    }

    if (template.type === ElementType.Floor) {
      updateFloorByIndex(wallIndex, {
        color: template.color,
        template: template,
      });
    }

    //   AGREGAR: Reset completo del estado de drag
    setIsDragActive(false);
    setDraggedTemplate(null);
    setDragging(false); //   También resetear isDragging del drawing store

    setTimeout(() => {}, 10);
    setExtruded(true); // Asegurar que seguimos en 3D
  };

  // Manejar fin de drag (sin drop válido)
  const handleDragEnd = () => {
    setIsDragActive(false);
    setDraggedTemplate(null);
    setDragging(false); //   También resetear isDragging del drawing store

    //   AGREGAR: Forzar limpieza de cualquier estado residual
    setTimeout(() => {}, 50);
  };

  // Manejar tecla ESC para cancelar drag
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape" && isDragActive) {
      handleDragEnd();
    }
  };

  // Agregar listener para ESC
  React.useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isDragActive]);

  // Agregar función de emergencia:
  const handleFixExtrusion = () => {
    // Volver a 2D
    setExtruded(false);

    // Esperar un momento y re-guardar coordenadas
    setTimeout(() => {
      if (currentPoints.length >= 4 && isClosed) {
        savePlaneCoordinates();

        // Volver a extruir
        setTimeout(() => {
          setExtruded(true);
        }, 100);
      }
    }, 100);
  };

  // Estado para mostrar/ocultar el mapa de calor
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [floors2, setFloors] = useState<any[]>([]);

  const handleAddFloor = () => {
    // Tu lógica para crear la nueva planta
    const depth = 3;
    const lastHeight =
      floors2.length > 0
        ? floors2[floors2.length - 1].baseHeight + depth
        : depth;

    const coords =
      planeXZCoordinates.length >= 3
        ? planeXZCoordinates
        : [
            { x: -6.5, z: -7 },
            { x: 4, z: -4.5 },
            { x: 2, z: 6 },
            { x: -7.5, z: 4.5 },
            { x: -6.5, z: -6.5 },
          ];

    const rawWalls = geometryEngine.generateWallsFromCoordinates(coords);
    const newWalls = rawWalls.map((wall, idx) => ({
      ...wall,
      id: crypto.randomUUID(),
      wallIndex: idx,
      color: wall.template.color,
      template: wall.template ?? null,
      area: wall.area ?? 0,
      currentCondition: wall.currentCondition ?? "default",
      start: wall.start,
      end: wall.end,
    }));

    const newFloor = {
      id: crypto.randomUUID(),
      name: `Planta ${floors.length + 1}`,
      coordinates: coords.map((c) => ({ x: c.x, y: 0, z: c.z })),
      baseHeight: lastHeight,
      walls: newWalls,
      openings: [],
    };

    setFloors([...floors, newFloor]);
  };

  // Handler para alternar la vista del mapa de calor
  const handleToggleHeatmap = () => setShowHeatmap((prev) => !prev);

  const handleCalculateInsulation = () => {
    if (showSegments) {
      setShowSegments(false);
      setSegments([]);
      return;
    }

    if (!isExtruded) {
      return;
    }

    setIsCalculating(true);

    const wallCalculationResults = walls.map((wall) =>
      ISO12354_4Engine.calculateFacadeSoundInsulation(wall, openings, [])
    );

    const wallSegments = wallCalculationResults.flatMap(
      (result) => result.segments
    );

    const ceilingCalculationResults = ceilings.map((ceiling) =>
      ISO12354_4Engine.calculateFacadeSoundInsulation(ceiling, openings, [])
    );
    const ceilingSegments = ceilingCalculationResults.flatMap(
      (result) => result.segments
    );

    const floorCalculationResults = floors.map((floor) =>
      ISO12354_4Engine.calculateFacadeSoundInsulation(floor, openings, [])
    );
    const floorSegments = floorCalculationResults.flatMap(
      (result) => result.segments
    );

    const allSegments = [
      ...wallSegments,
      ...ceilingSegments,
      ...floorSegments,
    ].map((segment) => {
      if (!segment || !segment.elements || segment.elements.length === 0) {
        return { ...segment, Lw: {}, R_segment: {} };
      }
      const R_segment = ISO12354_4Engine.calcSegmentR(segment.elements, []);
      const Lw_segment = ISO12354_4Engine.calcLw(
        R_segment,
        segment.totalArea,
        useIsoStudyConfigStore.getState().Lp_in
      );
      return { ...segment, Lw: Lw_segment, R_segment: R_segment };
    });

    // Store the results in the Zustand store
    useIsoResultStore.getState().setIsoResult({
      rwFinal:
        allSegments.reduce(
          (acc, segment) => acc + (segment.R_segment[500] || 0),
          0
        ) / allSegments.length, // Example calculation
      input: {
        walls: walls,
        openings: openings,
        wallCoordinates: planeXZCoordinates,
        Lp_in: useIsoStudyConfigStore.getState().Lp_in,
      },
      heatmap: allSegments.map((segment) => ({
        id: segment.segmentIndex,
        type: "segment",
        description: `Segment ${segment.segmentIndex}`,
        coordinates: segment.center,
        intensity: (segment.R_segment[500] || 0) / 100, // Example intensity
      })),
    });

    setTimeout(() => {
      setTimeout(() => {
        setSegments(allSegments);
        setShowSegments(true);
        setIsCalculating(false);
      }, 500);
    }, 500);
  };

  // Define the handler for ISO config confirmation
  const handleIsoConfigConfirm = (config: {
    height: number;
    venueType: string;
  }) => {
    useIsoStudyConfigStore.getState().setConfig({
      height: config.height,
      studyType: "iso12354-4",
      Lp_in: 70,
    });
    // Opcional: puedes cerrar el modal aquí si lo deseas
    setShowIsoConfigModal(false);
    // Opcional: lógica adicional (ejecutar análisis, mostrar resultados, etc.)
  };

  // Menú contextual
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const menuRef = useRef<HTMLDivElement>(null);
  // State for selected facade name for context menu
  const [selectedFacadeName, setSelectedFacadeName] = useState<number | null>(
    null
  );

  const [title, setTitle] = useState<string>("");

  const [openingMenuVisible, setOpeningMenuVisible] = useState(false);
  const [openingMenuPosition, setOpeningMenuPosition] = useState({
    x: 0,
    y: 0,
  });
  const [ceilingMenuVisible, setCeilingMenuVisible] = useState(false);
  const [ceilingMenuPosition, setCeilingMenuPosition] = useState({
    x: 0,
    y: 0,
  });
  const [floorMenuPosition, setFloorMenuPosition] = useState({ x: 0, y: 0 });
  const [floorMenuVisible, setFloorMenuVisible] = useState(false);
  const [selectedCeilingId, setSelectedCeilingId] = useState<string>("");
  const [selectedOpeningId, setSelectedOpeningId] = useState<string>("");
  const [selectedFloorId, setSelectedFloorId] = useState<string>("");
  // State for MaterialModal visibility
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  // State for selected wall index for MaterialModal
  const [selectedWallIndex, setSelectedWallIndex] = useState<number | null>(
    null
  );
  // State for PropertiesModal visibility
  const [showPropertiesModal, setShowPropertiesModal] = useState(false);
  // State for MaterialModal visibility

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuVisible(false);
      }
    };
    if (menuVisible) {
      document.addEventListener("mousedown", handleClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleClick);
    };
  }, [menuVisible]);

  return (
    <div
      className={`w-full relative ${
        isDragActive
          ? "cursor-grabbing"
          : !isExtruded
          ? "cursor-crosshair"
          : "cursor-default"
      }`}
      style={{ height: "93.5vh" }}
    >
      <Canvas
        camera={{ position: [0, 10, 20], fov: 50 }}
        shadows
        onContextMenu={(e) => e.preventDefault()}
      >
        <ambientLight intensity={0.8} />
        <pointLight position={[10, 10, 10]} intensity={1} castShadow />
        {/* OrbitControls: solo permite rotar si no se está arrastrando un vértice */}
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={!isDragging}
          mouseButtons={{ RIGHT: THREE.MOUSE.ROTATE, MIDDLE: THREE.MOUSE.PAN }}
        />

        {/* Control de órbita y vistas tipo CAD */}
        {isExtruded && (
          <GizmoHelper alignment="top-right" margin={[80, 80]}>
            <GizmoViewport
              axisColors={["#f38ba8", "#a6e3a1", "#89b4fa"]}
              labelColor="#cdd6f4"
              hideAxisHeads={true}
            />
          </GizmoHelper>
        )}

        <Suspense fallback={<Html center>Cargando 3D...</Html>}>
          {/* VISTA 2D - Cuando NO está extruido */}
          {!isExtruded && (
            <LineBuilder
              points={currentPoints}
              color="blue"
              onPointMove={handlePointMove}
              onDragStart={() => setDragging(true)}
              onDragEnd={() => setDragging(false)}
              onLineRightClick={handleLineContextMenu}
              onVertexRightClick={handleVertexRightClick}
              onVertexClick={handleVertexClick} // NUEVO: Pasar el manejador de clic
            />
          )}

          {showSegments && <SegmentsVisualizer segments={segments} />}

          {/* VISTA 3D - Cuando está extruido Y tiene coordenadas */}
          {isExtruded &&
            hasPlaneCoordinates &&
            planeXZCoordinates.length >= 3 &&
            (floorLevels.length > 0 ? (
              <MultiFloorRenderer
                onDropOpening={handleDropOpening}
                isDragActive={isDragActive}
                draggedTemplate={draggedTemplate}
                showHeatmap={showHeatmap}
                onToggleHeatmap={handleToggleHeatmap}
                onAddFloor={handleAddFloor}
                onWallContextMenu={handleWallContextMenu}
                onOpeningContextMenu={handleOpeningContextMenu}
                onCeilingContextMenu={handleCeilingContextMenu}
                onFloorContextMenu={handleFloorContextMenu}
                showAllFloors={true}
              />
            ) : (
              // Fallback al sistema original si no hay plantas múltiples
              <ExtrudedShapeWithDraggableOpenings
                onDropOpening={handleDropOpening}
                isDragActive={isDragActive}
                draggedTemplate={draggedTemplate}
                showHeatmap={showHeatmap}
                onToggleHeatmap={handleToggleHeatmap}
                onAddFloor={handleAddFloor}
                floors2={floors}
                openings={openings}
                ceilings2={ceilings}
                onWallContextMenu={handleWallContextMenu}
                onOpeningContextMenu={handleOpeningContextMenu}
                onCeilingContextMenu={handleCeilingContextMenu}
                onFloorContextMenu={handleFloorContextMenu}
              />              
            ))}
        </Suspense>

        {/* Superficie de dibujo y Grid - Solo visible en 2D */}
        {!isExtruded && (
          <>
            <gridHelper args={[200, 100, "#606060", "#f0f0f0"]} />
            <DrawingSurface onClick3D={handleClick3D} />
          </>
        )}
      </Canvas>

      {/* Controles de la aplicación actualizados */}
      <AppControls
        isClosed={isClosed}
        isExtruded={isExtruded}
        walls={walls}
        handleExtrude={handleExtrude}
        handleBackTo2D={handleBackTo2D}
        handleFixExtrusion={handleFixExtrusion}
        handleNewDrawing={handleNewDrawing}
        handleClearStorage={handleClearStorage}
        handleCleanAndReset={handleCleanAndReset}
        handleAddFloor={handleAddFloor}
        handleToggleHeatmap={handleToggleHeatmap}
        setShowAcousticModal={setShowAcousticModal}
        setShowIsoConfigModal={setShowIsoConfigModal}
        handleCalculateInsulation={handleCalculateInsulation}
        setShowFloorReplicationModal={setShowFloorReplicationModal} // NUEVO
      />

      {menuVisible && (
        <FacadeContextMenu
          x={menuPosition.x}
          y={menuPosition.y}
          visible={menuVisible}
          facadeName={selectedFacadeName ?? 0}
          title={title}
          onProperties={handleProperties}
          onChangeMaterial={handleChangeMaterial}
          onClose={() => setMenuVisible(false)}
        />
      )}

      {openingMenuVisible && (
        <OpeningContextMenu
          x={openingMenuPosition.x}
          y={openingMenuPosition.y}
          visible={openingMenuVisible}
          openingId={selectedOpeningId ?? ""}
          title={title}
          onProperties={handleProperties}
          onChangeMaterial={handleChangeMaterial}
          onClose={() => setOpeningMenuVisible(false)}
        />
      )}

      {ceilingMenuVisible && (
        <OpenCellingContextMenu
          x={ceilingMenuPosition.x}
          y={ceilingMenuPosition.y}
          visible={ceilingMenuVisible}
          facadeName={selectedCeilingId ?? ""}
          title={title}
          onProperties={handleProperties}
          onChangeMaterial={handleChangeMaterial}
          onClose={() => setCeilingMenuVisible(false)}
        />
      )}

      {floorMenuVisible && (
        <OpenFloorContextMenu
          x={floorMenuPosition.x}
          y={floorMenuPosition.y}
          visible={floorMenuVisible}
          facadeName={selectedFloorId ?? ""}
          title={title}
          onProperties={handleProperties}
          onChangeMaterial={handleChangeMaterial}
          onClose={() => setFloorMenuVisible(false)}
        />
      )}

      {/*   NUEVO: Modal de Análisis Acústico */}
      <AcousticAnalysisModal
        isOpen={showAcousticModal}
        onClose={() => setShowAcousticModal(false)}
        walls={walls.map((wall) => wall.template).filter(Boolean)}
        handleCalculateInsulation={handleCalculateInsulation}
      />

      {/* Listener global para detectar drag end */}
      {isDragActive && (
        <div
          className="fixed inset-0 pointer-events-none z-20"
          onDragEnd={handleDragEnd}
          onDrop={(e) => {
            e.preventDefault();
            handleDragEnd();
          }}
        />
      )}

      {/*   NUEVO: Indicador de estado de análisis acústico */}
      {isExtruded && walls.length > 0 && (
        <WallsToast isExtruded={isExtruded} walls={walls} />
      )}

      {/* Aside derecho */}
      <CollapsibleAside side="right">
        <LayerPanel
          visibility={layerVisibility}
          onChange={setLayerVisibility}
          onSelect={onSelectLayer}
          onStartDrag={handleStartDrag}
        />
      </CollapsibleAside>

      <IsoStudyConfigModal
        open={showIsoConfigModal}
        onClose={() => setShowIsoConfigModal(false)}
        onConfirm={handleIsoConfigConfirm}
      />

      <PropertiesModal
        visible={showPropertiesModal}
        elementType={elementType}
        wallIndex={selectedFacadeName ?? 0}
        openingId={selectedOpeningId ?? ""}
        ceilingId={selectedCeilingId ?? ""}
        floorId={selectedFloorId ?? ""}
        onClose={() => setShowPropertiesModal(false)}
      />

      <MaterialModal
        visible={showMaterialModal}
        wallIndex={selectedFacadeName ?? 0}
        openingId={selectedOpeningId ?? ""}
        ceilingId={selectedCeilingId ?? ""}
        floorId={selectedFloorId ?? ""}
        elementType={elementType}
        onClose={() => setShowMaterialModal(false)}
      />

      {/* Modal de contexto para la línea, fuera del grupo 3D */}

      <CollapsibleAsideTrigger side="right" open={lineMenuVisible && !!Extrude}>
        <LinePanel
          lineId={selectedLineId ?? ""}
          onClose={() => setLineMenuVisible(false)}
        />
      </CollapsibleAsideTrigger>

      {/* NUEVO: Modal de replicación de plantas */}
      <FloorReplicationModal
        isOpen={showFloorReplicationModal}
        onClose={() => setShowFloorReplicationModal(false)}
        onSuccess={(newFloorId) => {
          setShowFloorReplicationModal(false);
        }}
      />     

    </div>
  );
}
