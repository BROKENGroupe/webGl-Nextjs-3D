/**
 * @fileoverview LineBuilder Component - Professional 3D Line Rendering and Interaction System
 * 
 * Este componente proporciona un sistema completo de renderizado y manipulación de líneas 3D
 * con capacidades de arrastre, efectos visuales profesionales y detección de eventos.
 * 
 * Características principales:
 * - Renderizado de líneas como cilindros 3D con alta calidad visual
 * - Vértices interactivos con efectos de hover y arrastre fluido
 * - Sistema de eventos optimizado para prevenir interferencias
 * - Materiales PBR (Physically Based Rendering) para realismo
 * - Efectos visuales avanzados: brillos, sombras, anillos decorativos
 * 
 * @author Sistema de Diseño 3D
 * @version 1.0.0
 * @since 2025-08-02
 */

import * as THREE from "three";
import { useState } from "react";
import { LineRenderer } from "./LineRenderer";
import { LineEventHandler } from "../engine/LineEventHandler";
import { useDragSystem } from "../hooks/useDragSystem";

/**
 * Propiedades del componente LineBuilder
 * @interface LineBuilderProps
 */
interface LineBuilderProps {
  /** Array de puntos Vector3 que definen la línea */
  points: THREE.Vector3[];
  /** Color base de la línea (formato CSS o nombre) */
  color?: string;
  /** Callback ejecutado cuando un vértice es movido */
  onPointMove?: (index: number, newPosition: THREE.Vector3) => void;
  /** Callback ejecutado al iniciar el arrastre de un vértice */
  onDragStart?: () => void;
  /** Callback ejecutado al finalizar el arrastre de un vértice */
  onDragEnd?: () => void;
  /** Callback ejecutado cuando se hace click derecho en una línea */
  onLineRightClick?: (lineIndex: number, event: { clientX: number; clientY: number }) => void;
  /** Callback ejecutado cuando se hace click derecho en un vértice */
  onVertexRightClick?: (vertexIndex: number, event: { clientX: number; clientY: number }) => void;
}

/**
 * LineBuilder simplificado - Componente principal orquestador
 */
export function LineBuilder({ 
  points, 
  color = "blue", 
  onPointMove, 
  onDragStart, 
  onDragEnd,
  onLineRightClick,
  onVertexRightClick
}: LineBuilderProps) {
  
  // Estados de UI
  const [hoveredVertexIndex, setHoveredVertexIndex] = useState<number | null>(null);
  const [hoveredLineIndex, setHoveredLineIndex] = useState<number | null>(null);
  
  // ✅ VERIFICAR: ¿El hook se está ejecutando?
  console.log('🔥 LineBuilder render, points:', points.length); // DEBUG
  
  // Hook de sistema de arrastre
  const dragSystem = useDragSystem(
    (index, position) => {
      console.log('🔥 Point move:', index, position); // DEBUG
      onPointMove?.(index, position);
    },
    () => {
      console.log('🔥 Drag start'); // DEBUG
      onDragStart?.();
    },
    () => {
      console.log('🔥 Drag end'); // DEBUG
      onDragEnd?.();
    }
  );
  
  // Event handler
  const eventHandler = new LineEventHandler({
    onVertexDragStart: (index) => {
      console.log('🔥 EventHandler: Starting drag for vertex', index); // DEBUG
      dragSystem.startDrag(index);
    },
    onVertexDragEnd: () => {
      console.log('🔥 EventHandler: Ending drag'); // DEBUG
      dragSystem.endDrag();
    },
    onVertexHover: (index) => {
      console.log('🔥 EventHandler: Vertex hover', index); // DEBUG
      setHoveredVertexIndex(index);
    },
    onLineHover: setHoveredLineIndex,
    onVertexRightClick,
    onLineRightClick
  });

  return (
    <LineRenderer
      points={points}
      color={color}
      hoveredLineIndex={hoveredLineIndex}
      hoveredVertexIndex={hoveredVertexIndex}
      draggedIndex={dragSystem.currentDragIndex}
      isShiftMode={dragSystem.isShiftMode}
      eventHandler={eventHandler}
    />
  );
}
