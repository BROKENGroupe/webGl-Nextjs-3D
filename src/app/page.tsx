"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { useState } from "react";
import { DrawingSurface } from "@/components/DrawingSurface";
import { LineBuilder } from "@/components/LineBuilder";
import { ContextMenu } from "@/components/ContextMenu";
import { useDrawingStore } from "@/store/drawingStore";
import { useOpeningsStore } from "@/store/openingsStore";
import { useWallsStore } from "@/store/wallsStore"; // ✅ NUEVO: Importar WallsStore

import React from "react";
import { ExtrudedShapeWithDraggableOpenings } from "@/components/ExtrudedShapeWithDraggableOpenings";
import { DraggableOpeningsPalette } from "@/components/DraggableOpeningsPalette";
import { useCoordinatesStore } from "@/store/coordinatesStore";
import { AcousticAnalysisModal } from "@/components/modals/AcousticAnalysisModal"; // ✅ NUEVO: Importar modal

import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import {
  Undo2,
  Redo2,
  Trash2,
  Wrench,
  BarChart3,
  PlusSquare,
  Plus,
  Flame,
} from "lucide-react"; // Ejemplo con Lucide
import { GeometryEngine } from "@/lib/engine/GeometryEngine";
import { AppControls } from "@/components/AppControls";
import { LayerPanel, LayerVisibility } from "@/components/asside/layer-panel";
import { CollapsibleAside } from "@/components/asside/asside-lateral";
import { AcousticMaterial } from "@/types/AcousticMaterial";
import { OpeningType } from "@/types/openings";

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

  // ✅ NUEVO: States para el modal de análisis acústico
  const [showAcousticModal, setShowAcousticModal] = useState(false);
  const [showWallsManager, setShowWallsManager] = useState(false);

  // ✅ NUEVO: Acceso al store de paredes
  const { walls } = useWallsStore();

  const defaultVisibility: LayerVisibility = {
    sources: true,
    microphones: true,
    heatmap: true,
    cube: true,
  };

  const [tempHoleLine, setTempHoleLine] = useState<THREE.Vector3[]>([]);

  const [layerVisibility, setLayerVisibility] =
    useState<LayerVisibility>(defaultVisibility);
  const [selectedLayer, setSelectedLayer] = useState<string | undefined>(
    undefined
  );
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
  const { coordinates } = useCoordinatesStore();

  // ✅ NUEVO: Función para calcular Rw (necesaria para el modal)
  const calculateRw = (
    transmissionLoss: any,
    density: number,
    thickness: number
  ) => {
    const { low, mid, high } = transmissionLoss;

    // Cálculo simplificado del Rw basado en ISO 717-1
    const massPerArea = density * thickness; // kg/m²

    // Ley de masas: Rw ≈ 20 × log10(massPerArea) - 42
    let rwBase = 20 * Math.log10(massPerArea) - 42;

    // Corrección por frecuencias (promedio ponderado)
    const frequencyCorrection = mid * 0.5 + low * 0.3 + high * 0.2 - rwBase;
    const rwCalculated = rwBase + frequencyCorrection * 0.3;

    // Clasificación según valor Rw
    let classification = "";
    let spectrum = "";

    if (rwCalculated >= 60) {
      classification = "Excelente";
      spectrum = "C50-5000";
    } else if (rwCalculated >= 50) {
      classification = "Muy Bueno";
      spectrum = "C50-3150";
    } else if (rwCalculated >= 45) {
      classification = "Bueno";
      spectrum = "C50-2500";
    } else if (rwCalculated >= 40) {
      classification = "Regular";
      spectrum = "C50-2000";
    } else if (rwCalculated >= 35) {
      classification = "Básico";
      spectrum = "C50-1600";
    } else {
      classification = "Insuficiente";
      spectrum = "C50-1250";
    }

    return {
      value: Math.max(0, rwCalculated),
      classification,
      spectrum,
    };
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
    lineIndex: number,
    event: { clientX: number; clientY: number }
  ) => {
    setContextMenu({
      visible: true,
      x: event.clientX,
      y: event.clientY,
      itemType: "line",
      itemIndex: lineIndex,
    });
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
    console.log("✅ Coordenadas guardadas para extrusión:", savedCoords);

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
    console.log(
      "📍 Drop en pared:",
      wallIndex,
      "posición:",
      position,
      "template:",
      template.type
    );

    const newOpening = {
      id: `opening-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: template.type as OpeningType,
      wallIndex,
      position,
      width: template.width,
      height: template.height,
      bottomOffset: template.bottomOffset,
      template, // ✅ AGREGAR: referencia al template original
      currentCondition: "closed_sealed" as const, // ✅ CORREGIDO: tipo literal correcto
      relativePosition: 0, // <-- Añadido: valor por defecto, ajusta según lógica necesaria
    };

    addOpening(newOpening);

    // Resetear estado de drag
    setIsDragActive(false);
    setDraggedTemplate(null);

    console.log("✅ Abertura creada:", newOpening);
  };

  // Manejar fin de drag (sin drop válido)
  const handleDragEnd = () => {
    console.log("🚫 Drag cancelado");
    setIsDragActive(false);
    setDraggedTemplate(null);
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
  const [floors, setFloors] = useState<any[]>([]);

  const handleAddFloor = () => {
    // Tu lógica para crear la nueva planta
    const depth = 3;
    const lastHeight =
      floors.length > 0 ? floors[floors.length - 1].baseHeight + depth : depth;

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

  return (
    <div
      className={`h-screen w-full relative ${
        isDragActive ? "cursor-grabbing" : "cursor-default"
      }`}
      onContextMenu={(e) => {
        e.preventDefault();
        if (contextMenu.visible) {
          handleContextMenuClose();
        }
      }}
    >
      <Canvas
        camera={{ position: [10, 10, 10], fov: 50 }}
        style={{
          background: "linear-gradient(135deg, #f0f2f5 0%, #e8ebf0 100%)",
        }} // ✅ GRADIENTE SUAVE
        onContextMenu={(e) => e.preventDefault()}
      >
        <ambientLight intensity={0.8} />
        <directionalLight position={[10, 15, 10]} intensity={0.6} />
        <OrbitControls enabled={!isDragging && !isDragActive} />

        {/* ✅ YA ESTÁ COMENTADO - SIN CUADRÍCULA */}
        {/* <gridHelper args={[50, 50, "#888", "#ccc"]} /> */}

        <DrawingSurface onClick3D={handleClick3D} />

        {/* MODO 2D - Solo renderizar cuando NO está extruido Y hay puntos válidos */}
        {!isExtruded && (
          <>
            {/* Líneas principales - Solo si hay más de 1 punto */}
            {currentPoints.length > 1 && (
              <LineBuilder
                points={currentPoints}
                onPointMove={handlePointMove}
                onDragStart={() => setDragging(true)}
                onDragEnd={() => setDragging(false)}
                onLineRightClick={handleLineRightClick}
                onVertexRightClick={handleVertexRightClick}
              />
            )}
          </>
        )}

        {/* MODO 3D - Renderizar con funcionalidad de drag & drop */}
        {isExtruded && hasPlaneCoordinates && planeXZCoordinates.length > 2 && (
          <ExtrudedShapeWithDraggableOpenings
            planeCoordinates={[]} // Se ignora, usa drawingStore internamente
            onDropOpening={handleDropOpening}
            isDragActive={isDragActive}
            draggedTemplate={draggedTemplate}
            showHeatmap={showHeatmap} // <-- PASA EL ESTADO
            onToggleHeatmap={handleToggleHeatmap} // <-- PASA EL HANDLER
            onAddFloor={handleAddFloor}
            floors={floors}
          />
        )}
      </Canvas>

      {/* Controles de la aplicación */}
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
      />

      <ContextMenu
        x={contextMenu.x}
        y={contextMenu.y}
        visible={contextMenu.visible}
        onClose={handleContextMenuClose}
        onDelete={handleDelete}
        itemType={contextMenu.itemType}
        itemIndex={contextMenu.itemIndex}
      />

      {/* PALETA DRAGGABLE DE PUERTAS Y VENTANAS */}
      {/* <DraggableOpeningsPalette
        isVisible={showOpeningsPalette}
        onToggle={() => setShowOpeningsPalette(!showOpeningsPalette)}
        onStartDrag={handleStartDrag}
      /> */}

      {/* ✅ NUEVO: Modal de Análisis Acústico */}
      <AcousticAnalysisModal
        isOpen={showAcousticModal}
        onClose={() => setShowAcousticModal(false)}
        walls={walls.map(wall => wall.template).filter(Boolean)}
        
      />

      {/* Overlay de drag activo */}
      {/* {isDragActive && draggedTemplate && (
        <div className="fixed inset-0 bg-blue-500 bg-opacity-10 pointer-events-none z-30">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg">
              📍 Suelta sobre una pared para colocar {draggedTemplate.name}
              <div className="text-sm mt-1 opacity-80">
                ESC para cancelar
              </div>
            </div>
          </div>
        </div>
      )} */}

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

      {/* ✅ NUEVO: Indicador de estado de análisis acústico */}
      {isExtruded && walls.length > 0 && (
        <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-gray-700 font-medium">
              {walls.length} pared{walls.length !== 1 ? "es" : ""} lista
              {walls.length !== 1 ? "s" : ""} para análisis
            </span>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Haz clic en "📊 Análisis Acústico" para ver resultados detallados
          </div>
        </div>
      )}

      {/* Aside derecho */}
      <CollapsibleAside side="right">
        <LayerPanel
          visibility={layerVisibility}
          onChange={setLayerVisibility}
          onSelect={setSelectedLayer}
          onStartDrag={handleStartDrag}
        />
      </CollapsibleAside>
    </div>
  );
}
