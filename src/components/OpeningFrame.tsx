/**
 * @fileoverview Componente de marcos de aberturas arquitectónicas para elementos 3D
 * 
 * Este componente renderiza marcos visuales detallados para diferentes tipos de aberturas
 * arquitectónicas (puertas, ventanas, puertas corredizas) con estilos específicos,
 * materiales realistas y posicionamiento preciso dentro de las paredes. Utiliza
 * configuración global de colores y materiales para mantener consistencia visual.
 * 
 * @module OpeningFrame
 * @version 2.0.0
 * @author WebGL-NextJS-3D Team
 * @since 2024
 * @requires React
 * @requires three
 * @requires Opening
 * @requires MaterialsConfig
 */

import * as THREE from "three";
import { Opening } from "../types/openings";
import { COLORS, MATERIAL_PROPERTIES, FRAME_DIMENSIONS } from "../config/materials";

/**
 * @interface OpeningFrameProps
 * @description Propiedades de configuración para el componente de marco de abertura
 * 
 * Define los parámetros necesarios para renderizar un marco de abertura con
 * posicionamiento correcto y proporciones adecuadas dentro del contexto de la pared.
 * 
 * @property {Opening} opening - Objeto de abertura con todas sus propiedades
 * @property {number} wallLength - Longitud total de la pared contenedora
 * @property {number} wallHeight - Altura total de la pared contenedora
 */
interface OpeningFrameProps {
  opening: Opening;
  wallLength: number;
  wallHeight: number;
}

/**
 * @component OpeningFrame
 * @description Componente principal para renderizado de marcos de aberturas arquitectónicas
 * 
 * Renderiza marcos detallados con diferentes estilos según el tipo de abertura,
 * utilizando configuración global de colores y materiales para mantener consistencia
 * visual en toda la aplicación. Implementa cálculos precisos de posicionamiento
 * y dimensionado proporcional.
 * 
 * ## Mejoras en v2.0:
 * - **Configuración centralizada**: Colores y dimensiones desde config global
 * - **Materiales consistentes**: Propiedades físicas unificadas
 * - **Mantenimiento simplificado**: Cambios globales desde un solo archivo
 * - **Escalabilidad mejorada**: Fácil adición de nuevos tipos y estilos
 * 
 * @param {OpeningFrameProps} props - Propiedades de configuración
 * @returns {JSX.Element} Grupo de Three.js con geometría completa del marco
 * 
 * @see {@link COLORS} Para configuración de colores globales
 * @see {@link MATERIAL_PROPERTIES} Para propiedades de materiales
 * @see {@link FRAME_DIMENSIONS} Para dimensiones estándar
 */
export function OpeningFrame({ opening, wallLength, wallHeight }: OpeningFrameProps) {
  
  /**
   * @section Cálculos de posicionamiento local
   * @description Transformación de coordenadas desde posición relativa a coordenadas locales
   */
  const localX = (opening.position * wallLength) - wallLength/2;
  const localY = (opening.bottomOffset + opening.height/2) - wallHeight/2;
  const localZ = 0;

  /**
   * @function getFrameStyle
   * @description Determina el estilo visual del marco según el tipo de abertura
   * 
   * REFACTORIZADO: Ahora utiliza configuración global de colores y dimensiones
   * para mantener consistencia y facilitar el mantenimiento del sistema.
   * 
   * @param {string} type - Tipo de abertura según enum de Opening
   * @returns {Object} Configuración de estilo con color y grosor desde config global
   * 
   * @example
   * ```typescript
   * // Valores ahora vienen de configuración global
   * getFrameStyle('door')        // { color: COLORS.FRAMES.DOORS, thickness: FRAME_DIMENSIONS.THICKNESS.DOORS }
   * getFrameStyle('window')      // { color: COLORS.FRAMES.WINDOWS, thickness: FRAME_DIMENSIONS.THICKNESS.WINDOWS }
   * getFrameStyle('custom')      // { color: COLORS.FRAMES.DEFAULT, thickness: FRAME_DIMENSIONS.THICKNESS.DEFAULT }
   * ```
   */
  const getFrameStyle = (type: string) => {
    switch (type) {
      case 'door':
      case 'double-door':
      case 'sliding-door':
        return { 
          color: COLORS.FRAMES.DOORS, 
          thickness: FRAME_DIMENSIONS.THICKNESS.DOORS 
        };
      case 'window':
        return { 
          color: COLORS.FRAMES.WINDOWS, 
          thickness: FRAME_DIMENSIONS.THICKNESS.WINDOWS 
        };
      default:
        return { 
          color: COLORS.FRAMES.DEFAULT, 
          thickness: FRAME_DIMENSIONS.THICKNESS.DEFAULT 
        };
    }
  };

  /**
   * @constant frameStyle
   * @description Estilo aplicado al marco actual basado en configuración global
   */
  const frameStyle = getFrameStyle(opening.type);

  /**
   * @section Renderizado del componente
   * @description Estructura JSX con colores y materiales de configuración global
   */
  return (
    <group position={[localX, localY, localZ]}>
      
      {/* MARCO SUPERIOR */}
      <mesh position={[0, opening.height/2 + frameStyle.thickness/2, 0]}>
        <boxGeometry args={[
          opening.width + frameStyle.thickness * 2,
          frameStyle.thickness,
          FRAME_DIMENSIONS.DEPTH
        ]} />
        <meshStandardMaterial 
          color={frameStyle.color}
          roughness={MATERIAL_PROPERTIES.FRAMES.WOOD.roughness}
          metalness={MATERIAL_PROPERTIES.FRAMES.WOOD.metalness}
        />
      </mesh>

      {/* MARCO INFERIOR - Solo para ventanas */}
      {opening.type === 'window' && (
        <mesh position={[0, -opening.height/2 - frameStyle.thickness/2, 0]}>
          <boxGeometry args={[
            opening.width + frameStyle.thickness * 2,
            frameStyle.thickness,
            FRAME_DIMENSIONS.DEPTH
          ]} />
          <meshStandardMaterial 
            color={frameStyle.color}
            roughness={MATERIAL_PROPERTIES.FRAMES.PVC.roughness}
            metalness={MATERIAL_PROPERTIES.FRAMES.PVC.metalness}
          />
        </mesh>
      )}

      {/* MARCO IZQUIERDO */}
      <mesh position={[-opening.width/2 - frameStyle.thickness/2, 0, 0]}>
        <boxGeometry args={[
          frameStyle.thickness,
          opening.height + (opening.type === 'window' ? frameStyle.thickness * 2 : frameStyle.thickness),
          FRAME_DIMENSIONS.DEPTH
        ]} />
        <meshStandardMaterial 
          color={frameStyle.color}
          roughness={opening.type === 'window' ? MATERIAL_PROPERTIES.FRAMES.PVC.roughness : MATERIAL_PROPERTIES.FRAMES.WOOD.roughness}
          metalness={opening.type === 'window' ? MATERIAL_PROPERTIES.FRAMES.PVC.metalness : MATERIAL_PROPERTIES.FRAMES.WOOD.metalness}
        />
      </mesh>

      {/* MARCO DERECHO */}
      <mesh position={[opening.width/2 + frameStyle.thickness/2, 0, 0]}>
        <boxGeometry args={[
          frameStyle.thickness,
          opening.height + (opening.type === 'window' ? frameStyle.thickness * 2 : frameStyle.thickness),
          FRAME_DIMENSIONS.DEPTH
        ]} />
        <meshStandardMaterial 
          color={frameStyle.color}
          roughness={opening.type === 'window' ? MATERIAL_PROPERTIES.FRAMES.PVC.roughness : MATERIAL_PROPERTIES.FRAMES.WOOD.roughness}
          metalness={opening.type === 'window' ? MATERIAL_PROPERTIES.FRAMES.PVC.metalness : MATERIAL_PROPERTIES.FRAMES.WOOD.metalness}
        />
      </mesh>

      {/* CONTENIDO DE ABERTURAS CON COLORES GLOBALES */}
      
      {/* PUERTA SIMPLE */}
      {opening.type === 'door' && (
        <mesh position={[opening.width/4, 0, 0.05]}>
          <boxGeometry args={[
            opening.width/2 - 0.02,
            opening.height * 0.9,
            FRAME_DIMENSIONS.CONTENT_THICKNESS.DOOR_LEAF
          ]} />
          <meshStandardMaterial 
            color={COLORS.OPENINGS.WOOD_DOOR}
            roughness={MATERIAL_PROPERTIES.WOOD.roughness}
            metalness={MATERIAL_PROPERTIES.WOOD.metalness}
          />
        </mesh>
      )}

      {/* PUERTA DOBLE */}
      {opening.type === 'double-door' && (
        <>
          {/* Hoja izquierda */}
          <mesh position={[-opening.width/4, 0, 0.05]}>
            <boxGeometry args={[
              opening.width/2 - 0.05,
              opening.height * 0.9,
              FRAME_DIMENSIONS.CONTENT_THICKNESS.DOOR_LEAF
            ]} />
            <meshStandardMaterial 
              color={COLORS.OPENINGS.WOOD_DOOR}
              roughness={MATERIAL_PROPERTIES.WOOD.roughness}
              metalness={MATERIAL_PROPERTIES.WOOD.metalness}
            />
          </mesh>
          
          {/* Hoja derecha */}
          <mesh position={[opening.width/4, 0, 0.05]}>
            <boxGeometry args={[
              opening.width/2 - 0.05,
              opening.height * 0.9,
              FRAME_DIMENSIONS.CONTENT_THICKNESS.DOOR_LEAF
            ]} />
            <meshStandardMaterial 
              color={COLORS.OPENINGS.WOOD_DOOR}
              roughness={MATERIAL_PROPERTIES.WOOD.roughness}
              metalness={MATERIAL_PROPERTIES.WOOD.metalness}
            />
          </mesh>
        </>
      )}

      {/* PUERTA CORREDERA */}
      {opening.type === 'sliding-door' && (
        <>
          {/* Panel deslizante 1 */}
          <mesh position={[-opening.width/4, 0, 0.05]}>
            <boxGeometry args={[
              opening.width/2 - 0.02,
              opening.height * 0.9,
              0.02
            ]} />
            <meshStandardMaterial 
              color="#A0A0A0"          // Gris para aluminio
              transparent 
              opacity={0.7}            // Translúcido para efecto de vidrio
            />
          </mesh>
          
          {/* Panel deslizante 2 */}
          <mesh position={[opening.width/4, 0, 0.05]}>
            <boxGeometry args={[
              opening.width/2 - 0.02,
              opening.height * 0.9,
              0.02
            ]} />
            <meshStandardMaterial 
              color="#A0A0A0"          // Gris para aluminio
              transparent 
              opacity={0.7}            // Translúcido para efecto de vidrio
            />
          </mesh>
        </>
      )}

      {/* VENTANA */}
      {opening.type === 'window' && (
        <mesh position={[0, 0, 0.02]}>
          <boxGeometry args={[
            opening.width,             // Ancho: completo de la abertura
            opening.height,            // Alto: completo de la abertura
            0.01                       // Grosor: cristal muy fino
          ]} />
          <meshStandardMaterial 
            color="#87CEEB"            // Azul cielo para cristal
            transparent 
            opacity={0.3}              // Muy transparente para efecto de vidrio
          />
        </mesh>
      )}
    </group>
  );
}

/**
 * @exports OpeningFrame
 * @description Exportación por defecto del componente de marco de abertura
 */

/**
 * @namespace ComponentMetadata
 * @description Metadatos técnicos del componente
 * 
 * @property {string} componentType - "3D Architectural Element"
 * @property {string[]} supportedTypes - ["door", "double-door", "sliding-door", "window"]
 * @property {string[]} features - ["Dynamic Styling", "Material Differentiation", "Proportional Sizing", "Local Positioning"]
 * @property {Object} materials - Configuración de materiales
 * @property {Object} materials.frame - Materiales de marcos
 * @property {string} materials.frame.doors - "#8B4513 (Saddle Brown)"
 * @property {string} materials.frame.windows - "#FFFFFF (White)"
 * @property {Object} materials.content - Materiales de contenido
 * @property {string} materials.content.woodDoor - "#CD853F (Peru Gold)"
 * @property {string} materials.content.slidingPanel - "#A0A0A0 (Gray)"
 * @property {string} materials.content.glass - "#87CEEB (Sky Blue)"
 * @property {Object} dimensions - Especificaciones dimensionales
 * @property {Object} dimensions.frameThickness - Grosores de marco por tipo
 * @property {number} dimensions.frameThickness.doors - 0.08 unidades
 * @property {number} dimensions.frameThickness.windows - 0.05 unidades
 * @property {number} dimensions.frameDepth - 0.15 unidades (saliente desde pared)
 * @property {Object} performance - Métricas de rendimiento
 * @property {string} performance.geometry - "Static BoxGeometry instances"
 * @property {string} performance.materials - "Shared StandardMaterial instances"
 * @property {string} performance.rendering - "Conditional content rendering"
 */