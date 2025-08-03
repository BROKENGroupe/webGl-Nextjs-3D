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
    console.log('Iniciando extrusión...');
    
    // Guardar las coordenadas XZ del plano 2D actual
    savePlaneCoordinates();
    
    // Guardar el estado actual para la extrusión (legacy, por compatibilidad)
    saveCurrentStateForExtrusion();
    
    // Cambiar a vista 3D
    setExtruded(true);
    
    console.log('Coordenadas XZ guardadas para extrusión:', planeXZCoordinates);
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

  return (
    <div 
      className="h-screen w-full relative"
      onContextMenu={(e) => {
        e.preventDefault();
        if (contextMenu.visible) {
          handleContextMenuClose();
        }
      }}
    >
      <Canvas
        camera={{ position: [10, 10, 10], fov: 50 }}
        style={{ background: "#e0e0e0" }}
        onContextMenu={(e) => e.preventDefault()}
      >
        <ambientLight intensity={0.8} />
        <directionalLight position={[10, 15, 10]} intensity={0.6} />
        <OrbitControls enabled={!isDragging} />
        <gridHelper args={[50, 50, "#888", "#ccc"]} />
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
            
            {/* TEMPORALMENTE DESHABILITADAS las líneas de agujeros hasta solucionar el problema */}
            {/* {currentHoleLines.map((line, i) => (
              <LineBuilder key={`hole-${i}`} points={line} color="red" />
            ))} */}
          </>
        )}
        
        {/* MODO 3D - Solo renderizar cuando está extruido Y hay coordenadas válidas */}
        {isExtruded && hasPlaneCoordinates && planeXZCoordinates.length > 2 && (
          <ExtrudedShape 
            planeCoordinates={planeXZCoordinates} 
            holeCoordinates={[]} // Temporalmente sin agujeros hasta solucionar el problema
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
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg text-sm max-w-xs">
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
        
        {isExtruded && (
          <>
            <h3 className="font-semibold text-gray-800 mb-2">Vista 3D - Forma Extruida</h3>
            <div className="space-y-1 text-gray-600">
              <div>• Usa el mouse para rotar la vista</div>
              <div>• Scroll para hacer zoom</div>
              <div>• Arrastra para mover la cámara</div>
              <div>• "Volver a 2D" para editar la forma</div>
              <div>• "Re-extruir" para aplicar cambios</div>
            </div>
          </>
        )}
      </div>

      {/* Indicador de estado */}
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-lg text-xs">
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
      </div>

      <ContextMenu
        x={contextMenu.x}
        y={contextMenu.y}
        visible={contextMenu.visible}
        onClose={handleContextMenuClose}
        onDelete={handleDelete}
        itemType={contextMenu.itemType}
        itemIndex={contextMenu.itemIndex}
      />
    </div>
  );
}
