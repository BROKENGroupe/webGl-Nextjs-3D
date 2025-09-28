/**
 * @fileoverview Componente especializado en renderizado de líneas interactivas y vértices
 *
 * Este componente se encarga del renderizado visual de sistemas de líneas interactivas
 * con vértices manipulables. Proporciona feedback visual avanzado, estados de interacción
 * claros y delegación de eventos especializados a engines externos. Optimizado para
 * aplicaciones de dibujo técnico y CAD en 3D.
 *
 * @module LineRenderer
 * @version 2.0.0
 * @author insonor Team
 * @since 2025
 * @requires React
 * @requires three
 * @requires LineGeometryEngine
 * @requires LineEventHandler
 */

import * as THREE from "three";
import React, { useState, useMemo } from "react";
import { LineEventHandler } from "../../core/engine/LineEventHandler";
import { LineGeometryEngine } from "../../core/engine/LineGeometryEngine";
import { Line } from "./line";
import { Vertex } from "./vertex";

/**
 * @interface LineRendererProps
 * @description Propiedades de configuración para el renderizador de líneas
 *
 * Define todos los parámetros necesarios para renderizar un sistema de líneas
 * interactivo con estados visuales diferenciados y manejo de eventos especializado.
 *
 * @property {THREE.Vector3[]} points - Array de puntos 3D que definen las líneas
 * @property {string} [color="blue"] - Color base del sistema de líneas
 * @property {number | null} hoveredLineIndex - Índice de línea bajo el cursor (-1 si ninguna)
 * @property {number | null} hoveredVertexIndex - Índice de vértice bajo el cursor (-1 si ninguno)
 * @property {number | null} draggedIndex - Índice del vértice siendo arrastrado (-1 si ninguno)
 * @property {boolean} isShiftMode - Estado del modo Shift para operaciones especiales
 * @property {LineEventHandler} eventHandler - Engine de manejo de eventos especializado
 *
 * @example
 * ```tsx
 * // Definición de puntos para una línea poligonal
 * const linePoints = [
 *   new THREE.Vector3(0, 0, 0),     // Punto inicial
 *   new THREE.Vector3(2, 0, 0),     // Punto intermedio
 *   new THREE.Vector3(2, 0, 2),     // Punto final
 *   new THREE.Vector3(0, 0, 2)      // Cierre del polígono
 * ];
 *
 * // Estado de interacciones
 * const [interactions, setInteractions] = useState({
 *   hoveredLine: null,
 *   hoveredVertex: null,
 *   draggedVertex: null,
 *   shiftPressed: false
 * });
 *
 * // Engine de eventos personalizado
 * const eventHandler = new LineEventHandler({
 *   onVertexDrag: handleVertexDrag,
 *   onLineClick: handleLineClick,
 *   onVertexHover: handleVertexHover
 * });
 *
 * // Uso del componente
 * <LineRenderer
 *   points={linePoints}
 *   color="#4DA6FF"
 *   hoveredLineIndex={interactions.hoveredLine}
 *   hoveredVertexIndex={interactions.hoveredVertex}
 *   draggedIndex={interactions.draggedVertex}
 *   isShiftMode={interactions.shiftPressed}
 *   eventHandler={eventHandler}
 * />
 * ```
 */
interface LineRendererProps {
  points: THREE.Vector3[];
  color?: string;
  hoveredLineIndex: number | null;
  hoveredVertexIndex: number | null;
  draggedIndex: number | null;
  isShiftMode: boolean;
  eventHandler: LineEventHandler;
  onLineClick?: (lineIndex: number, point: THREE.Vector3) => void;
  onContextLineMenu?: (id: string, event: { clientX: number; clientY: number }) => void;

}

/**
 * @component LineRenderer
 * @description Componente principal de renderizado de líneas interactivas
 *
 * Renderiza un sistema completo de líneas conectadas con vértices manipulables,
 * proporcionando feedback visual avanzado y delegando la gestión de eventos a
 * engines especializados. Optimizado para aplicaciones CAD y de dibujo técnico.
 *
 * ## Características principales:
 * - **Renderizado dual**: Líneas conectadas y vértices independientes
 * - **Estados visuales**: Feedback claro para hover, drag y selección
 * - **Geometría dinámica**: Cálculos automáticos de transformaciones
 * - **Event delegation**: Gestión especializada de eventos por tipo
 * - **Optimización visual**: Capas superpuestas para mejor definición
 * - **Modo Shift**: Comportamiento especial para operaciones avanzadas
 *
 * ## Sistema de capas por elemento:
 * 1. **Líneas**: Cuerpo principal + contorno para definición
 * 2. **Vértices**: Base + contorno + punto central + cruz de selección
 * 3. **Z-layering**: Separación vertical para evitar z-fighting
 *
 * ## Estados de interacción:
 * - **Normal**: Colores base sin efectos especiales
 * - **Hover**: Colores intensificados y escalado sutil
 * - **Drag**: Colores distintivos según modo (normal/shift)
 * - **Selección**: Cruz de selección y escalado aumentado
 *
 * @param {LineRendererProps} props - Propiedades de configuración
 * @returns {JSX.Element} Fragmento con todos los elementos renderizados
 *
 * @example
 * ```tsx
 * // Uso básico para editor de planos
 * function PlanEditor() {
 *   const [points, setPoints] = useState([
 *     new THREE.Vector3(0, 0, 0),
 *     new THREE.Vector3(5, 0, 0),
 *     new THREE.Vector3(5, 0, 3),
 *     new THREE.Vector3(0, 0, 3)
 *   ]);
 *
 *   const [hoverState, setHoverState] = useState({
 *     line: null,
 *     vertex: null
 *   });
 *
 *   const [dragState, setDragState] = useState({
 *     index: null,
 *     startPosition: null
 *   });
 *
 *   const eventHandler = useMemo(() => new LineEventHandler({
 *     onVertexHover: (index) => setHoverState(prev => ({ ...prev, vertex: index })),
 *     onLineHover: (index) => setHoverState(prev => ({ ...prev, line: index })),
 *     onVertexDragStart: (index, position) => {
 *       setDragState({ index, startPosition: position });
 *     },
 *     onVertexDrag: (index, newPosition) => {
 *       setPoints(prev => prev.map((p, i) => i === index ? newPosition : p));
 *     },
 *     onVertexDragEnd: () => {
 *       setDragState({ index: null, startPosition: null });
 *     }
 *   }), []);
 *
 *   return (
 *     <Canvas>
 *       <LineRenderer
 *         points={points}
 *         color="#2196F3"
 *         hoveredLineIndex={hoverState.line}
 *         hoveredVertexIndex={hoverState.vertex}
 *         draggedIndex={dragState.index}
 *         isShiftMode={keys.shift}
 *         eventHandler={eventHandler}
 *       />
 *     </Canvas>
 *   );
 * }
 *
 * // Uso avanzado con snapping y validación
 * function AdvancedEditor() {
 *   const eventHandler = useMemo(() => new LineEventHandler({
 *     onVertexDrag: (index, position) => {
 *       // Aplicar snapping a grid
 *       const snappedPosition = snapToGrid(position, gridSize);
 *       updateVertex(index, snappedPosition);
 *     },
 *     onLineClick: (index) => {
 *       // Insertar nuevo vértice en el medio de la línea
 *       insertVertexAtLine(index);
 *     },
 *     validation: {
 *       minDistance: 0.1,        // Distancia mínima entre vértices
 *       maxVertices: 50,         // Límite de vértices
 *       selfIntersection: false  // Prevenir auto-intersecciones
 *     }
 *   }), [gridSize]);
 *
 *   return (
 *     <LineRenderer
 *       points={validatedPoints}
 *       hoveredLineIndex={interaction.hoveredLine}
 *       hoveredVertexIndex={interaction.hoveredVertex}
 *       draggedIndex={interaction.draggedVertex}
 *       isShiftMode={modifierKeys.shift}
 *       eventHandler={eventHandler}
 *     />
 *   );
 * }
 * ```
 *
 * @see {@link LineGeometryEngine} Para cálculos geométricos especializados
 * @see {@link LineEventHandler} Para gestión de eventos y validaciones
 *
 * @performance
 * - **Engine delegation**: Cálculos complejos delegados a engines optimizados
 * - **Geometría estática**: Primitive geometries reutilizables
 * - **Renderizado condicional**: Elementos de selección solo cuando es necesario
 * - **Event optimization**: Handlers memoizados en engine externo
 *
 * @accessibility
 * - **Feedback visual claro**: Estados diferenciados por color y escala
 * - **Área de interacción generosa**: Tolerancia amplia para targeting
 * - **Modo Shift distintivo**: Color especial para operaciones avanzadas
 * - **Capas de definición**: Contornos que mejoran la visibilidad
 */
export function LineRenderer(
  props: LineRendererProps & { is2DActive?: boolean }
) {
  // Variables internas para renderizado de líneas internas y paredes
  // Puedes reemplazar estos valores por props si necesitas control externo
  const isDrawingInternal = false; // Cambia a true cuando estés dibujando una línea interna
  const internalStart: THREE.Vector3 | null = null;
  const internalPreview: THREE.Vector3 | null = null;
  const internalWalls: { start: THREE.Vector3; end: THREE.Vector3 }[] = [];

  // Estado para el modal y la línea seleccionada
  

  return (
    <>
      <group rotation={props.is2DActive ? [-Math.PI / 2, 0, 0] : [0, 0, 0]}>
        {/* Renderizado de líneas */}
        {props.points.length > 1 &&
          props.points.slice(0, -1).map((point, index) => {
            // Cálculos geométricos delegados al engine especializado
            const start = props.points[index];
            const end = props.points[index + 1];
            const transform = LineGeometryEngine.calculateLineTransform(
              start,
              end
            );
            const dimensions = LineGeometryEngine.calculateLineDimensions(
              props.hoveredLineIndex === index
            );

            // Handler para click en línea
            const handleLinePointerDown = (event: any) => {
              if (props.onLineClick && event.point) {
                props.onLineClick(index, event.point.clone());
              }
            };

            const lineHandlers = {
              ...props.eventHandler.createLineHandlers(index),
              onPointerDown: handleLinePointerDown,
            };

            return (
              <Line
                key={`line-${index}`}
                id={`line-${index}`}
                start={start}
                end={end}
                hovered={props.hoveredLineIndex === index}
                eventHandler={lineHandlers}
                color={props.color}
                onContextLineMenu={props.onContextLineMenu ? (id: string) => props.onContextLineMenu!(id, { clientX: 0, clientY: 0 }) : undefined}
              />
            );
          })}

        {/* 
          SISTEMA DE RENDERIZADO DE VÉRTICES
          Renderiza cada punto como elemento interactivo independiente
        */}
        {props.points.map((point, index) => (
          <Vertex
            key={`vertex-${index}`}
            point={point}
            hovered={props.hoveredVertexIndex === index}
            dragged={props.draggedIndex === index}
            isShiftMode={props.isShiftMode}
            eventHandler={props.eventHandler.createVertexHandlers(index)}
            index={index}
          />
        ))}

        {/* 
          RENDERIZADO INTERNO (NUEVO)
          Sección dedicada a la renderización de líneas internas y paredes
        */}
        {/* 
          Renderizado de preview de línea interna
          Muestra una línea en rojo mientras se está dibujando una nueva línea interna
        */}
        {/* {isDrawingInternal && internalStart && internalPreview && (
          <line>
            <bufferGeometry attach="geometry" setFromPoints={[internalStart, internalPreview]} />
            <lineBasicMaterial attach="material" color="red" linewidth={2} />
          </line>
        )} */}

        {/* 
          Renderizado de paredes internas definitivas
          Muestra las paredes internas una vez que han sido confirmadas
        */}
        {internalWalls.map((wall, idx) => (
          <line key={idx}>
            <bufferGeometry
              attach="geometry"
              setFromPoints={[wall.start, wall.end]}
            />
            <lineBasicMaterial attach="material" color="red" linewidth={2} />
          </line>
        ))}
      </group>

      
    </>
  );
}
