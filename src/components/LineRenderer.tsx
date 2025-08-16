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

import { LineEventHandler } from '@/lib/engine/LineEventHandler';
import { LineGeometryEngine } from '@/lib/engine/LineGeometryEngine';
import * as THREE from 'three';

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
  onLineClick?: (lineIndex: number, point: THREE.Vector3) => void; // <-- NUEVO
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
export function LineRenderer({
  points,
  color = "blue",
  hoveredLineIndex,
  hoveredVertexIndex,
  draggedIndex,
  isShiftMode,
  eventHandler,
  onLineClick // <-- NUEVO
}: LineRendererProps) {
  // Variables internas para renderizado de líneas internas y paredes
  // Puedes reemplazar estos valores por props si necesitas control externo
  const isDrawingInternal = false; // Cambia a true cuando estés dibujando una línea interna
  const internalStart: THREE.Vector3 | null = null;
  const internalPreview: THREE.Vector3 | null = null;
  const internalWalls: { start: THREE.Vector3; end: THREE.Vector3 }[] = [];

  return (
    <>
      {/* 
        SISTEMA DE RENDERIZADO DE LÍNEAS
        Renderiza todas las conexiones entre vértices consecutivos
      */}
      {points.length > 1 && points.slice(0, -1).map((point, index) => {
        // Cálculos geométricos delegados al engine especializado
        const start = points[index];
        const end = points[index + 1];
        const transform = LineGeometryEngine.calculateLineTransform(start, end);
        const dimensions = LineGeometryEngine.calculateLineDimensions(
          hoveredLineIndex === index
        );

        // Handler para click en línea
        const handleLinePointerDown = (event: any) => {
          if (onLineClick && event.point) {
            onLineClick(index, event.point.clone());
          }
        };

        const lineHandlers = {
          ...eventHandler.createLineHandlers(index),
          onPointerDown: handleLinePointerDown
        };

        return (
          <group key={`line-group-${index}`}>
            {/* 
              LÍNEA PRINCIPAL
              Cuerpo sólido de la línea con transformación calculada
            */}
            <mesh
              position={[transform.midPoint.x, transform.midPoint.y + 0.005, transform.midPoint.z]}
              quaternion={[transform.quaternion.x, transform.quaternion.y, transform.quaternion.z, transform.quaternion.w]}
              {...lineHandlers}
            >
              <boxGeometry args={[dimensions.width, transform.distance, dimensions.depth]} />
              <meshBasicMaterial
                color={hoveredLineIndex === index 
                  ? new THREE.Color("#4DA6FF").multiplyScalar(1.3)  // 30% más brillante en hover
                  : "#4DA6FF"
                }
                transparent={false}
                side={THREE.DoubleSide}
              />
            </mesh>
            
            {/* 
              CONTORNO DE LÍNEA
              Borde que proporciona mejor definición visual
            */}
            <mesh
              position={[transform.midPoint.x, transform.midPoint.y + 0.006, transform.midPoint.z]}
              quaternion={[transform.quaternion.x, transform.quaternion.y, transform.quaternion.z, transform.quaternion.w]}
            >
              <boxGeometry args={[
                dimensions.outlineWidth,      // Ligeramente más ancho
                transform.distance + 0.015,   // Ligeramente más largo
                0.004                         // Muy fino para definición
              ]} />
              <meshBasicMaterial
                color={hoveredLineIndex === index ? "#E6F3FF" : "#B3D9FF"}
                transparent={true}
                opacity={0.6}
                side={THREE.DoubleSide}
              />
            </mesh>
          </group>
        );
      })}

      {/* 
        SISTEMA DE RENDERIZADO DE VÉRTICES
        Renderiza cada punto como elemento interactivo independiente
      */}
      {points.map((point, index) => {
        // Estados calculados para el vértice actual
        const isHovered = hoveredVertexIndex === index;
        const isDragged = draggedIndex === index;
        
        /**
         * @calculation scale
         * @description Escala dinámica del vértice según estado
         * 
         * Delega al GeometryEngine el cálculo de escala apropiada
         * basada en los estados de hover y drag activos.
         */
        const scale = LineGeometryEngine.calculateVertexScale(isHovered, isDragged);
        
        /**
         * @function vertexHandlers
         * @description Event handlers especializados para vértices
         * 
         * Crea manejadores específicos para eventos de vértices como
         * drag start/end, hover enter/leave, click, etc.
         */
        const vertexHandlers = eventHandler.createVertexHandlers(index);
        
        /**
         * @section Colores dinámicos del vértice
         * @description Sistema de colores basado en estado y modo
         * 
         * ## Lógica de colores:
         * - **Drag + Shift**: Naranja (#ff6600) - Operación especial
         * - **Drag normal**: Verde (#00ff00) - Movimiento estándar
         * - **Hover**: Azul claro (#66B3FF) - Bajo cursor
         * - **Normal**: Azul (#3399FF) - Estado base
         * 
         * ## Contornos:
         * - **Drag**: Blanco (#ffffff) - Máximo contraste
         * - **Hover**: Azul oscuro (#004080) - Definición clara
         * - **Normal**: Azul medio (#1A66CC) - Sutil pero visible
         */
        const baseColor = isDragged 
          ? (isShiftMode ? "#ff6600" : "#00ff00")  // Naranja para Shift, verde para normal
          : isHovered ? "#66B3FF" : "#3399FF";     // Azul claro para hover, azul para normal
        
        const outlineColor = isDragged 
          ? "#ffffff"                              // Blanco para drag
          : isHovered ? "#004080" : "#1A66CC";     // Azul oscuro para hover, medio para normal
        
        return (
          <group key={`vertex-group-${index}`}>
            {/* 
              VÉRTICE PRINCIPAL
              Elemento base cuadrado que representa el punto
            */}
            <mesh
              position={[point.x, point.y + 0.008, point.z]}
              rotation={[-Math.PI / 2, 0, 0]}    // Rotación para que sea horizontal
              scale={[scale, scale, 1]}
              {...vertexHandlers}
            >
              <planeGeometry args={[0.16, 0.16]} />
              <meshBasicMaterial 
                color={baseColor}
                transparent={false}
                side={THREE.DoubleSide}
              />
            </mesh>
            
            {/* 
              CONTORNO DEL VÉRTICE
              Ring geometry que proporciona borde definido
            */}
            <mesh
              position={[point.x, point.y + 0.009, point.z]}
              rotation={[-Math.PI / 2, 0, 0]}
              scale={[scale * 1.05, scale * 1.05, 1]}  // 5% más grande para visibilidad
            >
              <ringGeometry args={[0.08, 0.086, 4]} />  // Ring con 4 segmentos (cuadrado)
              <meshBasicMaterial
                color={outlineColor}
                transparent={false}
                side={THREE.DoubleSide}
              />
            </mesh>
            
            {/* 
              PUNTO CENTRAL
              Círculo pequeño en el centro para indicar posición exacta
            */}
            <mesh
              position={[point.x, point.y + 0.01, point.z]}
              rotation={[-Math.PI / 2, 0, 0]}
              scale={[scale * 0.3, scale * 0.3, 1]}  // 30% del tamaño principal
            >
              <circleGeometry args={[0.025, 8]} />
              <meshBasicMaterial
                color={isDragged ? "#000000" : "#ffffff"}  // Negro para drag, blanco para normal
                transparent={false}
                side={THREE.DoubleSide}
              />
            </mesh>
            
            {/* 
              CRUZ DE SELECCIÓN
              Indicador visual que aparece solo en estados activos (hover/drag)
            */}
            {(isHovered || isDragged) && (
              <>
                {/* Línea horizontal de la cruz */}
                <mesh
                  position={[point.x, point.y + 0.011, point.z]}
                  rotation={[-Math.PI / 2, 0, 0]}
                  scale={[scale * 1.4, scale * 0.1, 1]}  // Ancha y fina
                >
                  <planeGeometry args={[0.2, 0.015]} />
                  <meshBasicMaterial
                    color="#ffffff"
                    transparent={true}
                    opacity={0.8}
                    side={THREE.DoubleSide}
                  />
                </mesh>
                
                {/* Línea vertical de la cruz */}
                <mesh
                  position={[point.x, point.y + 0.011, point.z]}
                  rotation={[-Math.PI / 2, 0, 0]}
                  scale={[scale * 0.1, scale * 1.4, 1]}  // Fina y alta
                >
                  <planeGeometry args={[0.015, 0.2]} />
                  <meshBasicMaterial
                    color="#ffffff"
                    transparent={true}
                    opacity={0.8}
                    side={THREE.DoubleSide}
                  />
                </mesh>
              </>
            )}
          </group>
        );
      })}

      {/* 
        RENDERIZADO INTERNO (NUEVO)
        Sección dedicada a la renderización de líneas internas y paredes
      */}
      {/* 
        Renderizado de preview de línea interna
        Muestra una línea en rojo mientras se está dibujando una nueva línea interna
      */}
      {isDrawingInternal && internalStart && internalPreview && (
        <line>
          <bufferGeometry attach="geometry" setFromPoints={[internalStart, internalPreview]} />
          <lineBasicMaterial attach="material" color="red" linewidth={2} />
        </line>
      )}

      {/* 
        Renderizado de paredes internas definitivas
        Muestra las paredes internas una vez que han sido confirmadas
      */}
      {internalWalls.map((wall, idx) => (
        <line key={idx}>
          <bufferGeometry attach="geometry" setFromPoints={[wall.start, wall.end]} />
          <lineBasicMaterial attach="material" color="red" linewidth={2} />
        </line>
      ))}
    </>
  );
}

/**
 * @exports LineRenderer
 * @description Exportación por defecto del componente de renderizado de líneas
 */

/**
 * @namespace ComponentMetadata
 * @description Metadatos técnicos del componente
 * 
 * @property {string} componentType - "Interactive Line Renderer"
 * @property {string[]} features - [
 *   "Line Rendering", "Vertex Manipulation", "Visual Feedback", 
 *   "Engine Delegation", "State-Based Styling", "Z-Layer Management"
 * ]
 * @property {string[]} engines - ["LineGeometryEngine", "LineEventHandler"]
 * @property {string[]} interactions - [
 *   "Vertex Dragging", "Line Clicking", "Hover Effects", 
 *   "Shift Mode", "Multi-Select", "Snap Operations"
 * ]
 * @property {Object} renderingLayers - Información de capas de renderizado
 * @property {Object} renderingLayers.lines - Configuración de líneas
 * @property {number} renderingLayers.lines.main - 0.005 (cuerpo principal)
 * @property {number} renderingLayers.lines.outline - 0.006 (contorno)
 * @property {Object} renderingLayers.vertices - Configuración de vértices
 * @property {number} renderingLayers.vertices.base - 0.008 (base del vértice)
 * @property {number} renderingLayers.vertices.outline - 0.009 (contorno)
 * @property {number} renderingLayers.vertices.center - 0.010 (punto central)
 * @property {number} renderingLayers.vertices.selection - 0.011 (cruz de selección)
 * @property {Object} colorScheme - Esquema de colores del sistema
 * @property {Object} colorScheme.lines - Colores de líneas
 * @property {string} colorScheme.lines.normal - "#4DA6FF"
 * @property {string} colorScheme.lines.hover - "#4DA6FF * 1.3"
 * @property {string} colorScheme.lines.outline - "#B3D9FF / #E6F3FF"
 * @property {Object} colorScheme.vertices - Colores de vértices
 * @property {string} colorScheme.vertices.normal - "#3399FF"
 * @property {string} colorScheme.vertices.hover - "#66B3FF"
 * @property {string} colorScheme.vertices.dragNormal - "#00ff00"
 * @property {string} colorScheme.vertices.dragShift - "#ff6600"
 * @property {Object} performance - Optimizaciones de rendimiento
 * @property {string} performance.geometry - "Static primitive geometries"
 * @property {string} performance.calculations - "Delegated to specialized engines"
 * @property {string} performance.events - "Memoized handlers in external engine"
 * @property {string} performance.rendering - "Conditional selection elements"
 * @accessibility
 * - **Feedback visual claro**: Estados diferenciados por color y escala
 * - **Área de interacción generosa**: Tolerancia amplia para targeting
 * - **Modo Shift distintivo**: Color especial para operaciones avanzadas
 * - **Capas de definición**: Contornos que mejoran la visibilidad
 */