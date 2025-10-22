/**
 * @fileoverview Componente de superficie de dibujo interactiva para modelado 3D
 * 
 * Este componente proporciona una superficie invisible que actúa como plano de trabajo
 * para la captura de eventos de clic del usuario. Convierte coordenadas de pantalla 2D
 * en posiciones del mundo 3D, aplicando snap-to-grid para precisión en el dibujo.
 * Es fundamental para la funcionalidad de diseño arquitectónico del sistema.
 * 
 * @module DrawingSurface
 * @version 1.0.0
 * @author insonor Team
 * @since 2025
 * @requires React
 * @requires @react-three/fiber
 * @requires three
 */

"use client";

import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useRef } from "react";

/**
 * @function snapToGrid
 * @description Función utilitaria para ajuste de coordenadas a cuadrícula
 * 
 * Ajusta cualquier posición 3D a la cuadrícula más cercana para garantizar
 * precisión y consistencia en el dibujo arquitectónico. Facilita la alineación
 * de elementos y mantiene proporciones estándar en el diseño.
 * 
 * ## Características del ajuste:
 * - **Eje X**: Redondeo horizontal con paso configurable
 * - **Eje Y**: Siempre 0 (superficie horizontal)
 * - **Eje Z**: Redondeo de profundidad con paso configurable
 * - **Precisión**: Ajuste matemático exacto sin derivaciones
 * 
 * ## Casos de uso típicos:
 * - Colocación de vértices de paredes
 * - Posicionamiento de puertas y ventanas
 * - Alineación de elementos arquitectónicos
 * - Garantía de medidas estándar de construcción
 * 
 * @param {THREE.Vector3} pos - Posición original en el espacio 3D
 * @param {number} [step=0.5] - Tamaño del paso de la cuadrícula en unidades del mundo
 * @returns {THREE.Vector3} Nueva posición ajustada a la cuadrícula más cercana
 * 
 * @example
 * ```typescript
 * // Ajuste estándar (0.5 unidades)
 * const position = new THREE.Vector3(1.23, 0, 2.67);
 * const snapped = snapToGrid(position);
 * // Resultado: Vector3(1.0, 0, 2.5)
 * 
 * // Ajuste personalizado (1.0 unidades)
 * const position2 = new THREE.Vector3(1.23, 0, 2.67);
 * const snapped2 = snapToGrid(position2, 1.0);
 * // Resultado: Vector3(1.0, 0, 3.0)
 * 
 * // Ajuste fino (0.1 unidades)
 * const position3 = new THREE.Vector3(1.234, 0, 2.678);
 * const snapped3 = snapToGrid(position3, 0.1);
 * // Resultado: Vector3(1.2, 0, 2.7)
 * ```
 * 
 * @performance Operación O(1) con cálculos matemáticos simples
 * @precision Mantiene precisión de punto flotante de JavaScript
 */
function snapToGrid(pos: THREE.Vector3, step = 0.5): THREE.Vector3 {
  return new THREE.Vector3(
    Math.round(pos.x / step) * step,    // Ajuste horizontal (X)
    0,                                  // Superficie horizontal fija (Y = 0)
    Math.round(pos.z / step) * step     // Ajuste de profundidad (Z)
  );
}

/**
 * @interface DrawingSurfaceProps
 * @description Propiedades de configuración para el componente de superficie de dibujo
 * 
 * @property {Function} onClick3D - Callback ejecutado cuando se hace clic en la superficie
 * @property {THREE.Vector3} onClick3D.pos - Posición 3D donde se hizo clic (ya ajustada a cuadrícula)
 * 
 * @example
 * ```tsx
 * interface CallbackExample {
 *   onClick3D: (position: THREE.Vector3) => void;
 * }
 * 
 * // Implementación típica en componente padre
 * const handleSurfaceClick = (position: THREE.Vector3) => {
 *   console.log(`Clic en: (${position.x}, ${position.z})`);
 *   addPointToDrawing(position);
 * };
 * ```
 */
interface DrawingSurfaceProps {
  onClick3D: (pos: THREE.Vector3) => void;
}

/**
 * @component DrawingSurface
 * @description Componente de superficie de dibujo invisible para captura de eventos
 * 
 * Crea una superficie de trabajo invisible que detecta clics del usuario y los convierte
 * en coordenadas del mundo 3D. Actúa como la "mesa de dibujo" digital donde los usuarios
 * pueden hacer clic para colocar puntos, crear formas y diseñar estructuras arquitectónicas.
 * 
 * ## Características principales:
 * - **Superficie invisible**: Transparent pero clickeable para UX limpia
 * - **Conversión 2D→3D**: Transforma clics de pantalla en coordenadas mundiales
 * - **Snap-to-grid automático**: Ajuste automático para precisión
 * - **Orientación horizontal**: Simula superficie de trabajo real
 * - **Área extensa**: 50x50 unidades para proyectos grandes
 * - **Filtrado de eventos**: Solo responde a clic izquierdo
 * 
 * ## Flujo de interacción:
 * 1. **Usuario hace clic** en cualquier parte de la vista 3D
 * 2. **Mesh invisible** captura el evento de pointer
 * 3. **Sistema extrae** coordenadas 3D del punto de intersección
 * 4. **Función snapToGrid** ajusta posición a cuadrícula
 * 5. **Callback onClick3D** notifica al componente padre
 * 6. **Componente padre** procesa la nueva posición
 * 
 * ## Configuración técnica:
 * - **Geometría**: PlaneGeometry de 50x50 unidades
 * - **Material**: Completamente transparente (opacity: 0)
 * - **Orientación**: Rotado -90° en X para posición horizontal
 * - **Posición**: Centrado en origen del mundo (0,0,0)
 * - **Eventos**: onPointerDown para máxima compatibilidad
 * 
 * @param {DrawingSurfaceProps} props - Propiedades de configuración
 * @returns {JSX.Element} Mesh invisible de Three.js para captura de eventos
 * 
 * @example
 * ```tsx
 * // Uso básico del componente
 * <DrawingSurface
 *   onClick3D={(position) => addPointToPath(position)}
 * />
 * 
 * // Uso avanzado con múltiples handlers
 * const handleDrawingClick = (position: THREE.Vector3) => {
 *   if (drawingMode === 'walls') {
 *     addWallVertex(position);
 *   } else if (drawingMode === 'rooms') {
 *     addRoomCorner(position);
 *   }
 *   updateDrawing();
 * };
 * 
 * <DrawingSurface onClick3D={handleDrawingClick} />
 * 
 * // Integración con estado de aplicación
 * const [points, setPoints] = useState<THREE.Vector3[]>([]);
 * 
 * const addPoint = (position: THREE.Vector3) => {
 *   setPoints(prev => [...prev, position]);
 *   if (points.length >= 2) {
 *     createWallFromPoints(points);
 *   }
 * };
 * 
 * <DrawingSurface onClick3D={addPoint} />
 * ```
 * 
 * @see {@link snapToGrid} Para el sistema de ajuste a cuadrícula
 * @see {@link THREE.PlaneGeometry} Para la geometría subyacente
 * @see {@link useThree} Para acceso al contexto de Three.js
 * 
 * @performance
 * - **Renderizado estático**: Geometría y material no cambian
 * - **Event handling optimizado**: Solo procesa clic izquierdo
 * - **Memoria mínima**: Un solo mesh invisible
 * - **Cálculos eficientes**: Snap-to-grid con operaciones simples
 * 
 * @accessibility
 * - **Área clickeable amplia**: 50x50 unidades para fácil targeting
 * - **Feedback inmediato**: Callback ejecutado instantáneamente
 * - **Compatibilidad táctil**: onPointerDown soporta touch
 * - **Precisión garantizada**: Snap-to-grid elimina errores de posicionamiento
 * 
 * @browserCompatibility
 * - **Three.js**: Todas las versiones modernas
 * - **Pointer Events**: Chrome 55+, Firefox 59+, Safari 13+
 * - **WebGL**: Soporte requerido para Three.js
 */
export function DrawingSurface({ onClick3D }: DrawingSurfaceProps) {
  /**
   * @hook useThree
   * @description Acceso al contexto de Three.js y elementos de la escena
   * 
   * Proporciona acceso a la cámara, renderizador y otros elementos del contexto
   * de Three.js necesarios para operaciones avanzadas.
   * 
   * @property {THREE.Camera} camera - Cámara activa de la escena
   * @property {THREE.WebGLRenderer} gl - Renderizador WebGL
   * @property {THREE.Scene} scene - Escena principal
   */
  const { camera } = useThree();
  
  /**
   * @ref plane
   * @description Referencia al mesh de la superficie de dibujo
   * 
   * Mantiene referencia directa al elemento mesh para operaciones
   * avanzadas o debugging si es necesario.
   * 
   * @type {React.RefObject<THREE.Mesh>}
   */
  const plane = useRef<THREE.Mesh>(null);

  /**
   * @function handlePlaneClick
   * @description Manejador de eventos para clics en la superficie de dibujo
   * 
   * Procesa eventos de pointer para extraer coordenadas 3D del mundo,
   * aplicar snap-to-grid y notificar al componente padre. Implementa
   * validación de eventos y prevención de propagación.
   * 
   * ## Validaciones implementadas:
   * - **Solo clic izquierdo**: Ignora clic derecho y medio
   * - **Prevención de propagación**: Evita eventos en cadena
   * - **Validación de punto**: Verifica existencia de intersección
   * 
   * ## Proceso de transformación:
   * 1. **Validación de botón**: Solo botón izquierdo (button === 0)
   * 2. **Detención de propagación**: Previene eventos adicionales
   * 3. **Extracción de punto**: Obtiene coordenadas de intersección
   * 4. **Aplicación de snap**: Ajusta a cuadrícula más cercana
   * 5. **Notificación**: Ejecuta callback con posición final
   * 
   * @param {PointerEvent} e - Evento de pointer nativo del navegador
   * @param {THREE.Vector3} e.point - Punto de intersección en coordenadas mundiales
   * @param {number} e.button - Código del botón presionado (0=izquierdo, 1=medio, 2=derecho)
   * 
   * @example
   * ```typescript
   * // Estructura del evento recibido:
   * interface PointerEventData {
   *   point: THREE.Vector3;     // Posición de intersección
   *   button: number;           // Botón presionado
   *   target: THREE.Object3D;   // Objeto intersectado
   *   distance: number;         // Distancia desde cámara
   *   face: THREE.Face3;        // Cara intersectada
   *   stopPropagation: () => void;
   * }
   * 
   * // Ejemplo de coordenadas resultantes:
   * const clickPosition = {
   *   x: 2.5,  // Ajustado a cuadrícula
   *   y: 0,    // Siempre en superficie
   *   z: 1.0   // Ajustado a cuadrícula
   * };
   * ```
   * 
   * @throws {Error} Si no se puede obtener el punto de intersección
   * @performance Operación O(1) con validaciones mínimas
   */
  const handlePlaneClick = (e: any) => {
    // Validación: solo responder a clic izquierdo
    if (e.button !== 0) return;
    
    // Prevenir propagación de eventos en cadena
    e.stopPropagation();
    
    // Extracción del punto de intersección 3D
    const point = e.point;
    if (point) {
      // Aplicación de snap-to-grid para precisión
      const snapped = snapToGrid(point);
      
      // Notificación al componente padre con posición ajustada
      onClick3D(snapped);
    }
  };

  /**
   * @section Renderizado del mesh invisible
   * @description Configuración del mesh que actúa como superficie de dibujo
   * 
   * El mesh utiliza una geometría de plano grande con material completamente
   * transparente para crear una superficie invisible pero clickeable.
   */
  return (
    <mesh 
      ref={plane} 
      rotation={[-Math.PI / 2, 0, 0]}    // Rotación para orientación horizontal
      position={[0, 0, 0]}               // Posición centrada en el origen
      onPointerDown={handlePlaneClick}   // Event handler para captura de clics
    >
      {/* 
        Geometría del plano de trabajo
        - 50x50 unidades: Área amplia para proyectos grandes
        - Sin subdivisiones adicionales: Optimización de rendimiento
      */}
      <planeGeometry args={[150, 150]} />
      
      {/* 
        Material invisible pero interactivo
        - transparent: Habilita el uso de opacity
        - opacity: 0: Completamente invisible
        - Mantiene capacidad de intersección para eventos
      */}
      <meshStandardMaterial transparent opacity={0} />
    </mesh>
  );
}

/**
 * @exports DrawingSurface
 * @description Exportación por defecto del componente de superficie de dibujo
 */

/**
 * @namespace ComponentMetadata
 * @description Metadatos técnicos del componente
 * 
 * @property {string} componentType - "Interactive Surface"
 * @property {string[]} technologies - ["React", "Three.js", "WebGL", "Pointer Events"]
 * @property {string[]} patterns - ["Event Handling", "Coordinate Transformation", "Grid Snapping"]
 * @property {Object} geometry - Especificaciones geométricas
 * @property {number[]} geometry.dimensions - [50, 50] unidades
 * @property {string} geometry.orientation - "Horizontal"
 * @property {number[]} geometry.position - [0, 0, 0]
 * @property {Object} interaction - Configuración de interacción
 * @property {string[]} interaction.supportedEvents - ["pointerdown", "click", "touch"]
 * @property {number} interaction.gridStep - 0.5 unidades por defecto
 * @property {string} interaction.buttonFilter - "Left button only"
 * @property {Object} performance - Métricas de rendimiento
 * @property {string} performance.renderCalls - "Static (1 mesh)"
 * @property {string} performance.eventProcessing - "O(1) per click"
 * @property {string} performance.memoryUsage - "Minimal (static geometry)"
 */
