"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { useState } from "react";
import { DrawingSurface } from "@/components/DrawingSurface";
import { LineBuilder } from "@/components/LineBuilder";
import { HolePreview } from "@/components/HolePreview";
import { ExtrudedShape } from "@/components/ExtrudedShape";
import { ContextMenu } from "@/components/ContextMenu";
import { useDrawingStore } from "@/store/drawingStore";
import { useOpeningsStore } from '@/store/openingsStore';

import React from "react";
import { OpeningTemplate } from "@/types/openings";
import { ExtrudedShapeWithDraggableOpenings } from "@/components/ExtrudedShapeWithDraggableOpenings";
import { DraggableOpeningsPalette } from "@/components/DraggableOpeningsPalette";
import { useCoordinatesStore } from "@/store/coordinatesStore";
import { WallsManager } from "@/components/WallsManager"; // ✅ IMPORTAR

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

  const [tempHoleLine, setTempHoleLine] = useState<THREE.Vector3[]>([]);
  
  // Estados para el menú contextual
  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    itemType: null as 'line' | 'vertex' | null,
    itemIndex: null as number | null
  });

  // Estados para drag & drop de puertas y ventanas
  const [showOpeningsPalette, setShowOpeningsPalette] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const [draggedTemplate, setDraggedTemplate] = useState<OpeningTemplate | null>(null);
  const { openings, addOpening } = useOpeningsStore();
  const { coordinates } = useCoordinatesStore();

  const handleClick3D = (point: THREE.Vector3) => {
    if (isDragging) return; // No procesar clicks si se está arrastrando
    
    if (!isClosed) {
      if (currentPoints.length > 2 && point.distanceTo(currentPoints[0]) < 0.2) {
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
        const from = new THREE.Vector3(Math.min(p1.x, p2.x), 0, Math.min(p1.z, p2.z));
        const to = new THREE.Vector3(Math.max(p1.x, p2.x), 2, Math.max(p1.z, p2.z));
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
  const handleLineRightClick = (lineIndex: number, event: { clientX: number; clientY: number }) => {
    setContextMenu({
      visible: true,
      x: event.clientX,
      y: event.clientY,
      itemType: 'line',
      itemIndex: lineIndex
    });
  };

  const handleVertexRightClick = (vertexIndex: number, event: { clientX: number; clientY: number }) => {
    setContextMenu({
      visible: true,
      x: event.clientX,
      y: event.clientY,
      itemType: 'vertex',
      itemIndex: vertexIndex
    });
  };

  const handleContextMenuClose = () => {
    setContextMenu(prev => ({ ...prev, visible: false }));
  };

  // Función para manejar la extrusión con coordenadas XZ
  const handleExtrude = () => {
    console.log('🏗️ Iniciando extrusión...');
    console.log('📊 Estado actual currentPoints:', currentPoints);
    console.log('📊 Estado actual isClosed:', isClosed);
    
    // Validar que tenemos una forma cerrada
    if (!isClosed || currentPoints.length < 4) {
      console.error('❌ No se puede extruir: forma no cerrada o insuficientes puntos');
      alert('⚠️ Necesitas cerrar la forma antes de extruir');
      return;
    }
    
    // Guardar las coordenadas XZ del plano 2D actual
    savePlaneCoordinates();
    
    // Verificar que se guardaron correctamente
    const savedCoords = useDrawingStore.getState().planeXZCoordinates;
    console.log('✅ Coordenadas guardadas para extrusión:', savedCoords);
    
    if (savedCoords.length < 3) {
      console.error('❌ Error: coordenadas insuficientes para extrusión');
      alert('❌ Error al guardar las coordenadas');
      return;
    }
    
    // Guardar el estado actual para la extrusión (legacy)
    saveCurrentStateForExtrusion();
    
    // Cambiar a vista 3D
    setExtruded(true);
    
    console.log('🎯 Extrusión completada. Coordenadas XZ finales:', savedCoords);
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
    if (contextMenu.itemType === 'line' && contextMenu.itemIndex !== null) {
      // Eliminar el segmento de línea (quitar el punto en el índice + 1)
      if (contextMenu.itemIndex + 1 < currentPoints.length) {
        removeCurrentPoint(contextMenu.itemIndex + 1);
      }
    } else if (contextMenu.itemType === 'vertex' && contextMenu.itemIndex !== null) {
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
    console.log('🧹 Limpiando datos y reiniciando...');
    localStorage.removeItem('drawing-storage');
    resetAll();
    clearPlaneCoordinates();
    setContextMenu({ visible: false, x: 0, y: 0, itemType: null, itemIndex: null });
    window.location.reload();
  };

  // ===== FUNCIONES PARA DRAG & DROP DE PUERTAS Y VENTANAS =====

  // Manejar inicio de drag desde la paleta
  const handleStartDrag = (template: OpeningTemplate) => {
    console.log('🎯 Iniciando drag:', template.name);
    setIsDragActive(true);
    setDraggedTemplate(template);
  };

  // Manejar drop en pared
  const handleDropOpening = (wallIndex: number, position: number, template: OpeningTemplate) => {
    console.log('📍 Drop en pared:', wallIndex, 'posición:', position, 'template:', template.name);
    
    const newOpening = {
      id: `opening-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: template.type,
      wallIndex,
      position,
      width: template.width,
      height: template.height,
      bottomOffset: template.bottomOffset,
      template, // ✅ AGREGAR: referencia al template original
      currentCondition: "closed_sealed" as const, // ✅ CORREGIDO: tipo literal correcto
      relativePosition: 0 // <-- Añadido: valor por defecto, ajusta según lógica necesaria
    };
    
    addOpening(newOpening);
    
    // Resetear estado de drag
    setIsDragActive(false);
    setDraggedTemplate(null);
    
    console.log('✅ Abertura creada:', newOpening);
  };

  // Manejar fin de drag (sin drop válido)
  const handleDragEnd = () => {
    console.log('🚫 Drag cancelado');
    setIsDragActive(false);
    setDraggedTemplate(null);
  };

  // Manejar tecla ESC para cancelar drag
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && isDragActive) {
      handleDragEnd();
    }
  };

  // Agregar listener para ESC
  React.useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDragActive]);

  // Agregar función de emergencia:
  const handleFixExtrusion = () => {
    console.log('🔧 Intentando arreglar extrusión...');
    
    // Volver a 2D
    setExtruded(false);
    
    // Esperar un momento y re-guardar coordenadas
    setTimeout(() => {
      if (currentPoints.length >= 4 && isClosed) {
        console.log('🔄 Re-guardando coordenadas...');
        savePlaneCoordinates();
        
        // Volver a extruir
        setTimeout(() => {
          setExtruded(true);
        }, 100);
      }
    }, 100);
  };

  return (
    <div 
      className={`h-screen w-full relative ${
        isDragActive ? 'cursor-grabbing' : 'cursor-default'
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
        style={{ background: "linear-gradient(135deg, #f0f2f5 0%, #e8ebf0 100%)" }}  // ✅ GRADIENTE SUAVE
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
          />
        )}
      </Canvas>

      {/* Controles de la aplicación */}
      <div className="absolute top-4 right-4 space-y-2">
        {isClosed && !isExtruded && (
          <button 
            onClick={handleExtrude}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded shadow-lg transition-colors"
          >
            Extruir Estructura
          </button>
        )}
        
        {isExtruded && (
          <>
            <button 
              onClick={handleBackTo2D}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded shadow-lg transition-colors"
            >
              Volver a 2D
            </button>
            <button 
              onClick={handleExtrude}
              className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded shadow-lg transition-colors"
            >
              Re-extruir
            </button>
            {/* BOTÓN DE EMERGENCIA */}
            <button 
              onClick={handleFixExtrusion}
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded shadow-lg transition-colors text-xs"
              title="Arreglar forma distorsionada"
            >
              🔧 Arreglar Forma
            </button>
          </>
        )}
        
        <button 
          onClick={handleNewDrawing}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded shadow-lg transition-colors"
        >
          Nuevo Dibujo
        </button>
        
        <button 
          onClick={handleClearStorage}
          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded shadow-lg transition-colors text-xs"
          title="Limpiar datos guardados"
        >
          🗑️ Limpiar Storage
        </button>

        <button 
          onClick={handleCleanAndReset}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded shadow-lg transition-colors text-xs"
          title="Limpieza completa y reinicio"
        >
          🔧 Reset Completo
        </button>
      </div>

      {/* Panel de instrucciones dinámico */}
      {/* <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg text-sm max-w-xs">
        {!isClosed && !isExtruded && (
          <>
            <h3 className="font-semibold text-gray-800 mb-2">Dibujando Forma</h3>
            <div className="space-y-1 text-gray-600">
              <div>• Haz clic para agregar puntos</div>
              <div>• Arrastra para crear líneas</div>
              <div>• Cierra la forma haciendo clic cerca del primer punto</div>
            </div>
          </>
        )}
        
        {isClosed && !isExtruded && (
          <>
            <h3 className="font-semibold text-gray-800 mb-2">
              Controles de Edición 2D
              {hasPlaneCoordinates && (
                <span className="text-xs text-purple-600 ml-1">(Coordenadas guardadas)</span>
              )}
            </h3>
            <div className="space-y-1 text-gray-600">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span>Arrastrar vértice: Movimiento con snap</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-orange-500 rounded"></div>
                <span>Shift + Arrastrar: Movimiento libre</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <span>Click derecho: Menú contextual</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span>Botón verde: Extruir a 3D</span>
              </div>
            </div>
          </>
        )}       
        
      </div> */}

      {/* Indicador de estado */}
      {/* <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-lg text-xs">
        <div className="font-semibold text-gray-800">
          {!isClosed ? "Dibujando" : !isExtruded ? "Editando 2D" : "Vista 3D"}
        </div>
        {hasPlaneCoordinates && (
          <div className="text-purple-600">
            Plano guardado: {planeXZCoordinates.length} puntos
          </div>
        )}
        {isExtruded && (
          <div className="text-green-600">
            Forma extruida activa
          </div>
        )}
        {isDragActive && draggedTemplate && (
          <div className="text-orange-600 font-medium">
            🎯 Arrastrando: {draggedTemplate.name}
          </div>
        )}
      </div> */}

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
      <DraggableOpeningsPalette
        isVisible={showOpeningsPalette}
        onToggle={() => setShowOpeningsPalette(!showOpeningsPalette)}
        onStartDrag={handleStartDrag}
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
    </div>
  );
}
