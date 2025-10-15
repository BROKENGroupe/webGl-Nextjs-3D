"use client";

import { Canvas } from "@react-three/fiber";
import { Extrude, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { useEffect, useRef, Suspense } from "react";
import { DrawingSurface } from "@/modules/editor/components/DrawingSurface";
import { LineBuilder } from "@/modules/editor/components/2d/LineBuilder";
import { Html } from "@react-three/drei";

import React, { useState } from "react";
import { AcousticAnalysisModal } from "@/modules/analytics/components/modals/AcousticAnalysisModal"; //   NUEVO: Importar modal

import { AppControls } from "@/modules/editor/components/AppControls";
// import { AcousticMaterial } from "@/modules/editor/types/AcousticMaterial";
import { AcousticMaterial, ThirdOctave } from '@/modules/materials/types/AcousticMaterial';

import { IsoStudyConfigModal } from "@/modules/editor/components/modals/IsoStudyConfigModal";
import { useCoordinatesStore } from "@/modules/editor/store/coordinatesStore";
import { useDrawingStore } from "@/modules/editor/store/drawingStore";
import { useIsoStudyConfigStore } from "@/modules/editor/store/isoStudyConfigStore";
import { useOpeningsStore } from "@/modules/editor/store/openingsStore";
import { useWallsStore } from "@/modules/editor/store/wallsStore";
import { GeometryEngine } from "@/modules/editor/core/engine/GeometryEngine";
import { Opening, OpeningType } from "@/modules/editor/types/openings";
import { CollapsibleAside } from "@/modules/editor/components/asside/asside-lateral";
import {
  LayerVisibility,
  LayerPanel,
} from "@/modules/editor/components/asside/layer-panel";
import ContextMenu from "./contextMenus/contextMenu";
import FacadeContextMenu from "./contextMenus/FacadeContextMenu";
import PropertiesModal from "./modals/PropertiesModal";
import MaterialModal from "./modals/materialModal";
import OpeningContextMenu from "./contextMenus/OpeningContextMenu";
import { ExtrudedShapeWithDraggableOpenings } from "./ExtrudedShapeWithDraggableOpenings";
import { WallsToast } from "./extrudeToast";
import OpenCellingContextMenu from "./contextMenus/openCellingContextMenu";
import OpenFloorContextMenu from "./contextMenus/openFloorContextMenu";

import { ElementType, Wall } from "@/modules/editor/types/walls";
import { LINE_COLORS } from "@/config/materials";
import LineContextMenu from "./contextMenus/lineContextMenu";
import { set } from "zod";
import { color } from "framer-motion";
import { FloorReplicationModal } from './modals/FloorReplicationModal';
import { MultiFloorRenderer } from './MultiFloorRenderer';
import { useFloorsStore } from '../store/floorsStore';

export default function DrawingScene() {
  // Usar Zustand para el estado global
  const {
    currentPoints,
    currentHoleLines,
    currentHoles,
    savedPointsForExtrusion,
    savedHoleLinesForExtrusion,
    savedHolesForExtrusion,
    isClosed,
    isExtruded,
    isDragging,
    planeXZCoordinates,
    planeHoleCoordinates,
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

  //   NUEVO: States para el modal de análisis acústico
  const [showAcousticModal, setShowAcousticModal] = useState(false);
  const [showWallsManager, setShowWallsManager] = useState(false);
  //   NUEVO: State para el modal de configuración ISO
  const [showIsoConfigModal, setShowIsoConfigModal] = useState(false);
  // Nuevo estado para el modal de replicación
  const [showFloorReplicationModal, setShowFloorReplicationModal] = useState(false);

  //   NUEVO: Acceso al store de paredes
  const { walls } = useWallsStore();
  const { floorLevels } = useFloorsStore();
  const defaultVisibility: LayerVisibility = {
    sources: true,
    microphones: true,
    heatmap: true,
    cube: true,
  };

  function handleCloseContextMenu() {
    setContextMenu({ ...contextMenu, visible: false });
  }

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
    //handleCloseContextMenu();
  }
  //handleCloseContextMenu();

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
  const [showOpeningsPalette, setShowOpeningsPalette] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const [draggedTemplate, setDraggedTemplate] =
    useState<AcousticMaterial | null>(null);
  const { openings, addOpening } = useOpeningsStore();
  const { ceilings, addCeiling, updateWallByIndex } = useWallsStore();
  const { floors, addFloor, updateCeilingByIndex, updateFloorByIndex } =
    useWallsStore();
  const { coordinates } = useCoordinatesStore();

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
    event.stopPropagation(); //   AGREGAR: Evitar que el evento se propague

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

  const handleClick3D = (point: THREE.Vector3) => {
    if (isDragging) return; // No procesar clicks si se está arrastrando

    if (!isClosed) {
      if (
        currentPoints.length > 2 &&
        point.distanceTo(currentPoints[0]) < 0.2
      ) {
        // Cerrar la forma agregando el primer punto al final
        const closedPoints = [...currentPoints, currentPoints[0]];
        setCurrentPoints(closedPoints);
        setClosed(true);
      } else {
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
    updateCurrentPoint(index, newPosition);
    // Actualizar las coordenadas del plano si ya están guardadas
    updatePlaneCoordinatesFromCurrent();
  };

  // Manejadores del menú contextual
  const handleLineRightClick = (
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

  const handleContextMenuClose = () => {
    setContextMenu((prev) => ({ ...prev, visible: false }));
  };

  // Función para manejar la extrusión con coordenadas XZ
  const handleExtrude = () => {
    console.log("🏗️ Iniciando extrusión...");
    console.log("📊 Estado actual currentPoints:", currentPoints);
    console.log("📊 Estado actual isClosed:", isClosed);

    // Validar que tenemos una forma cerrada
    if (!isClosed || currentPoints.length < 4) {
      console.error(
        "❌ No se puede extruir: forma no cerrada o insuficientes puntos"
      );
      alert("⚠️ Necesitas cerrar la forma antes de extruir");
      return;
    }

    // Guardar las coordenadas XZ del plano 2D actual
    savePlaneCoordinates();

    // Verificar que se guardaron correctamente
    const savedCoords = useDrawingStore.getState().planeXZCoordinates;
    console.log("  Coordenadas guardadas para extrusión:", savedCoords);

    if (savedCoords.length < 3) {
      console.error("❌ Error: coordenadas insuficientes para extrusión");
      alert("❌ Error al guardar las coordenadas");
      return;
    }

    // Guardar el estado actual para la extrusión (legacy)
    saveCurrentStateForExtrusion();

    // Cambiar a vista 3D
    setExtruded(true);

    console.log(
      "🎯 Extrusión completada. Coordenadas XZ finales:",
      savedCoords
    );
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

  const handleDelete = () => {
    if (contextMenu.itemType === "line" && contextMenu.itemIndex !== null) {
      // Eliminar el segmento de línea (quitar el punto en el índice + 1)
      if (contextMenu.itemIndex + 1 < currentPoints.length) {
        removeCurrentPoint(contextMenu.itemIndex + 1);
      }
    } else if (
      contextMenu.itemType === "vertex" &&
      contextMenu.itemIndex !== null
    ) {
      // Eliminar el vértice
      removeCurrentPoint(contextMenu.itemIndex);
    }
  };

  // Limpiar datos guardados en localStorage y reiniciar el estado
  const handleClearStorage = () => {
    localStorage.clear();
    resetAll();
    clearPlaneCoordinates();
  };

  // Agregar función para limpiar datos corruptos
  const handleCleanAndReset = () => {
    console.log("🧹 Limpiando datos y reiniciando...");
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
    console.log("🎯 Iniciando drag:", template.type);
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
      updateWallByIndex(wallIndex, { color: template.color, template: template });
    }

    if (template.type === ElementType.Ceiling) {
      updateCeilingByIndex(wallIndex, { color: template.color, template: template });
    }

    if (template.type === ElementType.Floor) {
      updateFloorByIndex(wallIndex, { color: template.color, template: template });
    }

    //   AGREGAR: Reset completo del estado de drag
    setIsDragActive(false);
    setDraggedTemplate(null);
    setDragging(false); //   También resetear isDragging del drawing store
     
    setTimeout(() => {
      // Esto asegura que todos los event listeners se reactiven correctamente
      console.log("🔄 Estado de drag reseteado completamente");
    }, 10);
    setExtruded(true); // Asegurar que seguimos en 3D
  };

  // Manejar fin de drag (sin drop válido)
  const handleDragEnd = () => {
    console.log("🚫 Drag cancelado");
    setIsDragActive(false);
    setDraggedTemplate(null);
    setDragging(false); //   También resetear isDragging del drawing store

    //   AGREGAR: Forzar limpieza de cualquier estado residual
    setTimeout(() => {
      console.log("🔄 Drag end completado");
    }, 50);
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
    console.log("🔧 Intentando arreglar extrusión...");

    // Volver a 2D
    setExtruded(false);

    // Esperar un momento y re-guardar coordenadas
    setTimeout(() => {
      if (currentPoints.length >= 4 && isClosed) {
        console.log("🔄 Re-guardando coordenadas...");
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

    const rawWalls = GeometryEngine.generateWallsFromCoordinates(coords);
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

  // Define the handler for ISO config confirmation
  const handleIsoConfigConfirm = (config: {
    height: number;
    studyType: string;
    Lp_in: number;
  }) => {
    // Guarda los datos en el estado global zustand
    useIsoStudyConfigStore.getState().setConfig(config);
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
        isDragActive ? "cursor-grabbing" : "cursor-default"
      }`}
      style={{ height: "93.5vh" }}
    >
      <Canvas
        camera={{ position: [0, 10, 15], fov: 50 }}
        shadows
        onContextMenu={(e) => e.preventDefault()}
      >
        <ambientLight intensity={0.8} />
        <pointLight position={[10, 10, 10]} intensity={1} castShadow />
        <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />

        <Suspense fallback={<Html center>Cargando 3D...</Html>}>
          {/* VISTA 2D - Cuando NO está extruido */}
          {!isExtruded && (
            <>
              <LineBuilder
                points={currentPoints}
                color="blue"
                onPointMove={handlePointMove}
                onDragStart={() => setDragging(true)}
                onDragEnd={() => setDragging(false)}
                onLineRightClick={handleLineRightClick}
                onVertexRightClick={handleVertexRightClick}
              />
            </>
          )}

          {/* VISTA 3D - Cuando está extruido Y tiene coordenadas */}
          {isExtruded && hasPlaneCoordinates && planeXZCoordinates.length >= 3 && (
            floorLevels.length > 0 ? (
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
            )
          )}
        </Suspense>

        {/* Superficie de dibujo - Solo visible en 2D */}
        {!isExtruded && <DrawingSurface onClick3D={handleClick3D} />}
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
        setShowFloorReplicationModal={setShowFloorReplicationModal} // NUEVO
      />

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

      {/* PALETA DRAGGABLE DE PUERTAS Y VENTANAS */}
      {/* <DraggableOpeningsPalette
        isVisible={showOpeningsPalette}
        onToggle={() => setShowOpeningsPalette(!showOpeningsPalette)}
        onStartDrag={handleStartDrag}
      /> */}

      {/*   NUEVO: Modal de Análisis Acústico */}
      <AcousticAnalysisModal
        isOpen={showAcousticModal}
        onClose={() => setShowAcousticModal(false)}
        walls={walls.map((wall) => wall.template).filter(Boolean)}
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

      <LineContextMenu        
        visible={lineMenuVisible}
        lineId={selectedLineId ?? ""}
        onClose={() => setLineMenuVisible(false)}        
      />

      {/* NUEVO: Modal de replicación de plantas */}
      <FloorReplicationModal
        isOpen={showFloorReplicationModal}
        onClose={() => setShowFloorReplicationModal(false)}
        onSuccess={(newFloorId) => {
          console.log('✅ Planta replicada exitosamente:', newFloorId);
          setShowFloorReplicationModal(false);
        }}
      />
    </div>
  );
}
