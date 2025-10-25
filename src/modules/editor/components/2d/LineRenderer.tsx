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
import React, { useMemo } from "react";
import { LineEventHandler } from "../../core/engine/LineEventHandler";
import { LineGeometryEngine } from "../../core/engine/LineGeometryEngine";
import { ThreeGeometryAdapter } from "../../core/engine/adapters/ThreeGeometryAdapter";
import { Line } from "./line";
import { Vertex } from "./vertex";

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
  /**
   * Instancia el adaptador de geometría para cálculos especializados.
   */
  const geometryAdapter = useMemo(() => new ThreeGeometryAdapter(), []);
  /**
   * Instancia el motor de cálculos geométricos para líneas.
   */
  const lineGeometryEngine = useMemo(() => new LineGeometryEngine(geometryAdapter), [geometryAdapter]);

  // Variables internas para renderizado de líneas internas y paredes
  /**
   * Indica si se está dibujando una pared interna.
   */
  const isDrawingInternal = false;
  /**
   * Punto inicial de la pared interna (si existe).
   */
  const internalStart: THREE.Vector3 | null = null;
  /**
   * Punto de preview de la pared interna (si existe).
   */
  const internalPreview: THREE.Vector3 | null = null;
  /**
   * Array de paredes internas definitivas.
   */
  const internalWalls: { start: THREE.Vector3; end: THREE.Vector3 }[] = [];

  return (
    <>
      <group rotation={props.is2DActive ? [-Math.PI / 2, 0, 0] : [0, 0, 0]}>
        {/* Renderizado de líneas */}
        {props.points.length > 1 &&
          props.points.slice(0, -1).map((point, index) => {
            /**
             * Punto inicial de la línea.
             */
            const start = props.points[index];
            /**
             * Punto final de la línea.
             */
            const end = props.points[index + 1];
            /**
             * Cálculos geométricos para la línea actual.
             */
            const transform = lineGeometryEngine.calculateLineTransform(start, end);
            /**
             * Dimensiones visuales de la línea según estado de interacción.
             */
            const dimensions = lineGeometryEngine.calculateLineDimensions(
              props.hoveredLineIndex === index
            );

            /**
             * Handler para el evento de pointer down en la línea.
             * @param event Evento de interacción.
             */
            const handleLinePointerDown = (event: any) => {
              if (props.onLineClick && event.point) {
                props.onLineClick(index, event.point.clone());
              }
            };

            /**
             * Handlers de eventos para la línea actual.
             */
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
                point={point}
                hovered={props.hoveredLineIndex === index}
                eventHandler={lineHandlers}
                color={props.color}
                onContextLineMenu={props.onContextLineMenu ? (id: string) => props.onContextLineMenu!(id, { clientX: 0, clientY: 0 }) : undefined}
              />
            );
          })}

        {/* Renderizado de vértices */}
        {props.points.map((point, index) => (
          /**
           * Renderiza el vértice manipulable en la posición indicada.
           */
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

        {/* Renderizado de paredes internas definitivas */}
        {internalWalls.map((wall, idx) => (
          /**
           * Renderiza la línea interna definitiva.
           */
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
