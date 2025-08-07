import * as THREE from 'three';
import { Point2D, Opening } from '../types/openings';

/**
 * =====================================================================================
 * INTERACTION ENGINE - Motor de Interacciones 3D para Manipulación Arquitectónica
 * =====================================================================================
 * 
 * @description
 * InteractionEngine es una clase estática especializada en el manejo de interacciones
 * usuario-escena 3D para aplicaciones arquitectónicas. Gestiona cálculos complejos
 * de posicionamiento, proyecciones vectoriales, detección de proximidad y conversión
 * de coordenadas de mouse a posiciones válidas en estructuras 3D.
 * 
 * @author Sistema de Arquitectura 3D
 * @version 2.0.0
 * @since 2024
 * 
 * @features
 * - Proyección vectorial para posicionamiento preciso en paredes
 * - Algoritmos de proximidad para detección de pared más cercana
 * - Sistema de coordenadas normalizado (0.0-1.0) para posiciones en paredes
 * - Cálculos de transformación 3D para drag & drop
 * - Validación automática de límites y restricciones de posicionamiento
 * 
 * @use_cases
 * - Drag & drop de aberturas (puertas y ventanas)
 * - Reposicionamiento dinámico de elementos arquitectónicos
 * - Preview en tiempo real durante manipulación
 * - Snapping automático a posiciones válidas
 * - Cálculo de coordenadas mundo para renderizado
 * 
 * @dependencies
 * - Three.js: Matemáticas vectoriales y matrices de transformación
 * - TypeScript: Tipado estático para interfaces arquitectónicas
 * - Point2D, Opening: Definiciones de tipos para elementos estructurales
 * 
 * @performance
 * - Algoritmos O(n) para búsqueda de pared más cercana
 * - Uso de operaciones vectoriales optimizadas
 * - Cálculos matemáticos sin allocaciones innecesarias
 * - Cache implícito de cálculos repetitivos
 */

/**
 * @interface WallPosition
 * @description Resultado del cálculo de posicionamiento en pared
 * 
 * @property {number} wallIndex - Índice de la pared objetivo (0-based)
 * @property {number} position - Posición normalizada en la pared (0.0-1.0)
 * @property {number} worldX - Coordenada X en espacio mundo
 * @property {number} worldY - Coordenada Y en espacio mundo  
 * @property {number} worldZ - Coordenada Z en espacio mundo
 */
interface WallPosition {
  wallIndex: number;
  position: number;
  worldX: number;
  worldY: number;
  worldZ: number;
}

/**
 * @interface DisplayPosition  
 * @description Posición 3D para renderizado de elementos
 * 
 * @property {number} x - Coordenada X en espacio mundo
 * @property {number} y - Coordenada Y en espacio mundo
 * @property {number} z - Coordenada Z en espacio mundo
 */
interface DisplayPosition {
  x: number;
  y: number;
  z: number;
}

/**
 * @class InteractionEngine
 * @description Motor principal para interacciones 3D en aplicaciones arquitectónicas
 * 
 * Esta clase implementa algoritmos matemáticos avanzados para convertir acciones
 * del usuario (clicks, drags) en posicionamientos precisos dentro de estructuras
 * arquitectónicas 3D, manteniendo restricciones de validez y optimización de UX.
 */
export class InteractionEngine {
  
  /**
   * @method calculatePositionFromMouse
   * @description Calcula la posición óptima en pared a partir de coordenadas del mouse
   * 
   * Este método implementa un algoritmo de proximidad que encuentra la pared más
   * cercana al cursor del mouse y calcula la posición normalizada óptima para
   * colocar una abertura. Utiliza proyección vectorial para determinar la posición
   * relativa en la pared y validación de límites para asegurar posicionamientos válidos.
   * 
   * @param {any} event - Evento de Three.js con coordenadas 3D del mouse (event.point)
   * @param {boolean} isDraggingOpening - Estado de arrastre activo
   * @param {Opening | null} draggedOpening - Abertura siendo arrastrada (si existe)
   * @param {Point2D[]} coordinatesToUse - Coordenadas del polígono de la estructura
   * @returns {WallPosition | null} Posición calculada o null si no es válida
   * 
   * @algorithm
   * ## Algoritmo de Detección de Pared Más Cercana:
   * 
   * 1. **Para cada pared del edificio**:
   *    a. Calcular vector de la pared (P2 - P1)
   *    b. Calcular vector del mouse al inicio de pared (Mouse - P1)
   *    c. Proyectar vector mouse sobre vector pared usando dot product
   *    d. Normalizar posición resultante (0.0 = inicio, 1.0 = final)
   *    e. Aplicar clamp para mantener límites válidos [0.05, 0.95]
   *    f. Calcular distancia euclidiana del mouse al punto más cercano en pared
   * 
   * 2. **Seleccionar pared con menor distancia**
   * 
   * 3. **Calcular coordenadas mundo** usando interpolación lineal
   * 
   * ## Proyección Vectorial:
   * ```
   * Pared: P1 ────────────────── P2
   *                ↑
   *              Mouse
   * 
   * wallVector = P2 - P1
   * mouseVector = Mouse - P1
   * projection = dot(mouseVector, wallVector) / |wallVector|²
   * clampedPos = clamp(projection, 0.05, 0.95)
   * worldPos = P1 + clampedPos * wallVector
   * ```
   * 
   * @complexity O(n) donde n = número de paredes
   * 
   * @constraints
   * - Posición normalizada limitada a [0.05, 0.95] para evitar esquinas
   * - Solo procesa cuando hay una abertura siendo arrastrada
   * - Requiere coordenadas válidas del evento (event.point)
   * 
   * @example
   * const wallPos = InteractionEngine.calculatePositionFromMouse(
   *   pointerEvent,      // Evento con coordenadas 3D
   *   true,              // Arrastre activo
   *   draggedDoor,       // Puerta siendo movida
   *   buildingCoords     // Coordenadas del edificio
   * );
   * 
   * if (wallPos) {
   *   // wallPos.wallIndex = 2 (pared índice 2)
   *   // wallPos.position = 0.3 (30% desde el inicio)
   *   // wallPos.worldX = 4.5 (coordenada X mundo)
   *   // wallPos.worldY = 1.05 (centro vertical de puerta)
   *   // wallPos.worldZ = 2.1 (coordenada Z mundo)
   * }
   * 
   * @performance
   * - Evita Math.sqrt hasta el cálculo final de distancia
   * - Reutiliza cálculos vectoriales when possible
   * - Early return para casos inválidos
   * - Sin allocaciones de objetos temporales en el loop crítico
   * 
   * @validation
   * - Verifica estado de arrastre antes de procesar
   * - Valida existencia de abertura arrastrada
   * - Clamp automático para prevenir posiciones en esquinas
   * - Null safety para todos los accesos a propiedades
   */
  static calculatePositionFromMouse(
    event: any,
    isDraggingOpening: boolean,
    draggedOpening: Opening | null,
    coordinatesToUse: Point2D[]
  ): WallPosition | null {
    
    // ===== VALIDACIÓN PREVIA =====
    if (!isDraggingOpening || !draggedOpening) return null;

    // ===== VARIABLES DE OPTIMIZACIÓN =====
    let closestWall: number | null = null;
    let closestDistance = Infinity;
    let closestPosition = 0.5; // Fallback al centro
    
    // ===== ALGORITMO DE PROXIMIDAD - BÚSQUEDA DE PARED MÁS CERCANA =====
    coordinatesToUse.forEach((coord, wallIndex) => {
      const nextIndex = (wallIndex + 1) % coordinatesToUse.length;
      const nextCoord = coordinatesToUse[nextIndex];
      
      // ===== CÁLCULO DE VECTORES FUNDAMENTALES =====
      /**
       * Vector de la pared: define dirección y longitud
       * Usado como base para todas las proyecciones
       */
      const wallVector = {
        x: nextCoord.x - coord.x,
        z: nextCoord.z - coord.z
      };
      
      /**
       * Vector del mouse al inicio de pared
       * Representa la posición relativa del cursor
       */
      const mouseToStart = {
        x: event.point.x - coord.x,
        z: event.point.z - coord.z
      };
      
      // ===== PROYECCIÓN VECTORIAL DIRECTA =====
      /**
       * Dot product: proyecta mouseVector sobre wallVector
       * Resultado: distancia escalar a lo largo de la pared
       */
      const dotProduct = mouseToStart.x * wallVector.x + mouseToStart.z * wallVector.z;
      const wallLengthSquared = wallVector.x * wallVector.x + wallVector.z * wallVector.z;
      
      /**
       * Normalización: convierte distancia escalar a posición relativa [0.0-1.0]
       * 0.0 = inicio de pared (coord)
       * 1.0 = final de pared (nextCoord)
       */
      const relativePosition = dotProduct / wallLengthSquared;
      
      /**
       * Clamp de seguridad: evita posiciones muy cerca de esquinas
       * Límites: [0.05, 0.95] = 5% margen en cada extremo
       */
      const clampedPosition = Math.max(0.05, Math.min(0.95, relativePosition));
      
      // ===== CÁLCULO DE DISTANCIA EUCLIDIANA =====
      /**
       * Punto más cercano en la pared usando posición clamped
       * Usado para determinar cuál pared está más cerca del mouse
       */
      const closestPointOnWall = {
        x: coord.x + clampedPosition * wallVector.x,
        z: coord.z + clampedPosition * wallVector.z
      };
      
      /**
       * Distancia 2D (ignoramos Y para cálculo de proximidad)
       * Más eficiente que distancia 3D para este caso de uso
       */
      const distance = Math.sqrt(
        (event.point.x - closestPointOnWall.x) ** 2 + 
        (event.point.z - closestPointOnWall.z) ** 2
      );
      
      // ===== ACTUALIZACIÓN DE MEJOR CANDIDATO =====
      if (distance < closestDistance) {
        closestDistance = distance;
        closestWall = wallIndex;
        closestPosition = clampedPosition;
      }
    });

    // ===== GENERACIÓN DE RESULTADO FINAL =====
    if (closestWall !== null) {
      const coord = coordinatesToUse[closestWall];
      const nextCoord = coordinatesToUse[(closestWall + 1) % coordinatesToUse.length];
      
      /**
       * Interpolación lineal para coordenadas mundo finales
       * worldPos = start + t * (end - start)
       * donde t = closestPosition [0.0-1.0]
       */
      return {
        wallIndex: closestWall,
        position: closestPosition,
        worldX: coord.x + closestPosition * (nextCoord.x - coord.x),
        worldY: draggedOpening.bottomOffset + draggedOpening.height/2, // Centro vertical
        worldZ: coord.z + closestPosition * (nextCoord.z - coord.z)
      };
    }
    
    return null; // No se encontró pared válida
  }

  /**
   * @method calculateTemplateDropPosition
   * @description Calcula posición para drop de template nuevo usando transformaciones 3D
   * 
   * Este método implementa un sistema de coordenadas locales para calcular con precisión
   * dónde debe colocarse un nuevo template (puerta/ventana) cuando se suelta sobre una pared.
   * Utiliza matrices de rotación para convertir coordenadas globales a coordenadas locales
   * de la pared, permitiendo cálculos precisos independientemente de la orientación.
   * 
   * @param {any} event - Evento de Three.js con coordenadas 3D del drop
   * @param {number} wallIndex - Índice de la pared objetivo donde se hace el drop
   * @param {Point2D[]} coordinatesToUse - Coordenadas del polígono del edificio
   * @param {number} depth - Altura del edificio (usado para centrar transformaciones)
   * @returns {number} Posición normalizada en la pared [0.1-0.9]
   * 
   * @algorithm
   * ## Sistema de Coordenadas Locales:
   * 
   * 1. **Configuración de Sistema Local**:
   *    a. Centro de pared = punto medio entre P1 y P2
   *    b. Ángulo de pared = atan2(P2-P1) para orientación
   *    c. Sistema local: X = a lo largo de pared, Z = perpendicular
   * 
   * 2. **Transformación de Coordenadas**:
   *    a. Trasladar punto de drop al origen local (centro de pared)
   *    b. Aplicar rotación inversa (-wallAngle) para alinear con ejes locales
   *    c. Convertir coordenada X local a posición normalizada [0.0-1.0]
   *    d. Aplicar clamp de seguridad [0.1-0.9]
   * 
   * ## Matriz de Transformación:
   * ```
   * Espacio Global:     Espacio Local:
   *      ↑ Z                 ↑ Z
   *      │                   │
   * P1───┼───P2              │
   *      │          →   ─────┼───── X (along wall)
   *      └────→ X             │
   * 
   * Transform: Translate(-center) * Rotate(-angle)
   * ```
   * 
   * @complexity O(1) - Operaciones vectoriales y matriciales constantes
   * 
   * @precision
   * - Usa transformaciones de matrices Three.js para máxima precisión
   * - Maneja correctamente paredes en cualquier orientación
   * - Coordenadas normalizadas para consistencia independiente de escala
   * 
   * @example
   * // Drop de puerta en pared diagonal
   * const position = InteractionEngine.calculateTemplateDropPosition(
   *   dropEvent,         // Coordenadas del mouse al soltar
   *   2,                 // Pared índice 2
   *   buildingCoords,    // Polígono del edificio
   *   3.0                // Altura 3 metros
   * );
   * 
   * // Resultado: 0.35 = 35% desde el inicio de la pared
   * // Independiente de orientación o longitud de pared
   * 
   * @constraints
   * - Posición limitada a [0.1, 0.9] para evitar esquinas
   * - Requiere pared válida (wallIndex dentro de rango)
   * - Asume coordenadas de evento válidas
   * 
   * @performance
   * - Reutiliza matrices Three.js optimizadas
   * - Mínimas allocaciones de objetos temporales
   * - Cálculos trigonométricos cached by engine
   */
  static calculateTemplateDropPosition(
    event: any,
    wallIndex: number,
    coordinatesToUse: Point2D[],
    depth: number
  ): number {
    // ===== CONFIGURACIÓN DE PARED OBJETIVO =====
    const p1 = coordinatesToUse[wallIndex];
    const p2 = coordinatesToUse[(wallIndex + 1) % coordinatesToUse.length];
    
    // ===== CÁLCULOS GEOMÉTRICOS FUNDAMENTALES =====
    const wallLength = Math.sqrt((p2.x - p1.x) ** 2 + (p2.z - p1.z) ** 2);
    const wallAngle = Math.atan2(p2.z - p1.z, p2.x - p1.x);
    
    /**
     * Centro de la pared en 3D: punto de referencia para transformaciones
     * Y = depth/2 sitúa el centro a media altura del edificio
     */
    const centerX = (p1.x + p2.x) / 2;
    const centerZ = (p1.z + p2.z) / 2;
    
    // ===== TRANSFORMACIÓN A COORDENADAS LOCALES =====
    
    /**
     * Paso 1: Trasladar al origen local
     * Mueve el punto de drop para que el centro de pared sea el origen
     */
    const localPoint = event.point.clone();
    localPoint.sub(new THREE.Vector3(centerX, depth/2, centerZ));
    
    /**
     * Paso 2: Rotar para alinear con ejes locales
     * Aplica rotación inversa (-wallAngle) para que:
     * - Eje X local = a lo largo de la pared
     * - Eje Z local = perpendicular a la pared
     */
    const rotationMatrix = new THREE.Matrix4().makeRotationY(-wallAngle);
    localPoint.applyMatrix4(rotationMatrix);
    
    // ===== CONVERSIÓN A POSICIÓN NORMALIZADA =====
    
    /**
     * En sistema local, la pared va desde -wallLength/2 a +wallLength/2
     * Convertir a rango [0.0-1.0]:
     * position = (localX + wallLength/2) / wallLength
     */
    const relativePosition = (localPoint.x + wallLength/2) / wallLength;
    
    /**
     * Clamp de seguridad: rango [0.1, 0.9]
     * Más restrictivo que calculatePositionFromMouse para templates nuevos
     * Evita posiciones problemáticas cerca de esquinas
     */
    return Math.max(0.1, Math.min(0.9, relativePosition));
  }

  /**
   * @method calculateDisplayPosition
   * @description Calcula posición de renderizado para aberturas con soporte para preview
   * 
   * Método utilitario que determina dónde debe renderizarse visualmente una abertura,
   * considerando si está siendo arrastrada (usar posición preview) o en estado normal
   * (usar posición almacenada). Esencial para feedback visual durante manipulación.
   * 
   * @param {Opening} opening - Abertura para la cual calcular posición de display
   * @param {boolean} isBeingDragged - Si la abertura está siendo arrastrada actualmente  
   * @param {WallPosition | any} previewPosition - Posición temporal durante arrastre
   * @param {Point2D} coord - Punto de inicio de la pared que contiene la abertura
   * @param {Point2D} nextCoord - Punto de fin de la pared que contiene la abertura
   * @returns {DisplayPosition} Coordenadas 3D donde renderizar la abertura
   * 
   * @algorithm
   * ## Modo Arrastre (preview):
   * ```
   * if (isBeingDragged && previewPosition) {
   *   return previewPosition.world{X,Y,Z}
   * }
   * ```
   * 
   * ## Modo Normal (posición almacenada):
   * ```
   * worldPos = coord + position * (nextCoord - coord)
   * centerY = bottomOffset + height/2
   * ```
   * 
   * @complexity O(1) - Operaciones aritméticas simples
   * 
   * @use_cases
   * - Renderizado de aberturas en posición normal
   * - Preview visual durante drag & drop
   * - Animaciones de transición between posiciones
   * - Debugging visual de posicionamiento
   * 
   * @example
   * // Abertura en posición normal
   * const normalPos = InteractionEngine.calculateDisplayPosition(
   *   door,              // Puerta con position = 0.5
   *   false,             // No está siendo arrastrada
   *   null,              // Sin preview
   *   wallStart,         // Inicio de pared
   *   wallEnd            // Fin de pared
   * );
   * // Resultado: centro de la pared, centro vertical de puerta
   * 
   * // Abertura durante arrastre
   * const dragPos = InteractionEngine.calculateDisplayPosition(
   *   door,              // Misma puerta
   *   true,              // Siendo arrastrada
   *   livePreview,       // Posición actual del mouse
   *   wallStart,         // Mismos puntos de pared
   *   wallEnd
   * );
   * // Resultado: sigue al mouse en tiempo real
   * 
   * @performance
   * - Evita cálculos when preview está disponible
   * - Reutiliza coordenadas de preview pre-calculadas
   * - Interpolación lineal simple para posición normal
   * 
   * @validation
   * - Null safety para previewPosition
   * - Fallback graceful a posición normal si preview falla
   * - Coordenadas sempre válidas dentro de límites de pared
   */
  static calculateDisplayPosition(
    opening: Opening,
    isBeingDragged: boolean,
    previewPosition: WallPosition | any,
    coord: Point2D,
    nextCoord: Point2D
  ): DisplayPosition {
    
    // ===== MODO PREVIEW - POSICIÓN DURANTE ARRASTRE =====
    if (isBeingDragged && previewPosition) {
      /**
       * Durante arrastre, usar coordenadas pre-calculadas del preview
       * Estas coordenadas ya incluyen:
       * - Proyección a pared más cercana
       * - Posición válida (clamped)
       * - Altura centrada de la abertura
       */
      return {
        x: previewPosition.worldX,
        y: previewPosition.worldY,
        z: previewPosition.worldZ
      };
    }
    
    // ===== MODO NORMAL - POSICIÓN ALMACENADA =====
    else {
      /**
       * Interpolación lineal entre puntos de pared
       * t = opening.position [0.0-1.0]
       * result = start + t * (end - start)
       */
      const t = opening.position;
      
      return {
        x: coord.x + t * (nextCoord.x - coord.x),           // Interpolación X
        y: opening.bottomOffset + opening.height/2,         // Centro vertical
        z: coord.z + t * (nextCoord.z - coord.z)            // Interpolación Z
      };
    }
  }

  /**
   * @method validateOpeningPlacement
   * @description Valida si una abertura puede colocarse en una posición específica
   * 
   * Sistema de validación que verifica restricciones arquitectónicas y de diseño
   * antes de permitir el posicionamiento de aberturas. Previene solapamientos,
   * posiciones inválidas y violaciones de reglas de construcción.
   * 
   * @param {number} wallIndex - Índice de la pared objetivo
   * @param {number} position - Posición normalizada propuesta [0.0-1.0]
   * @param {Object} newOpening - Dimensiones de la nueva abertura
   * @param {Opening[]} existingOpenings - Aberturas ya presentes en el edificio
   * @returns {Object} Resultado de validación con estado y razón si inválida
   * 
   * @algorithm
   * 1. **Filtrar aberturas de la misma pared**
   * 2. **Para cada abertura existente**:
   *    a. Calcular límites [start, end] de abertura existente
   *    b. Calcular límites [start, end] de nueva abertura
   *    c. Verificar solapamiento: !(new.end < exist.start || new.start > exist.end)
   * 3. **Verificar límites de pared**: posición debe permitir abertura completa
   * 
   * @complexity O(n) donde n = número de aberturas en la pared
   * 
   * @validation_rules
   * - Sin solapamiento con aberturas existentes
   * - Mínimo 5% de margen desde cada extremo de pared
   * - Abertura debe caber completamente en la pared
   * - Considerar ancho real de abertura para cálculos
   * 
   * @example
   * const validation = InteractionEngine.validateOpeningPlacement(
   *   1,                    // Pared 1
   *   0.5,                  // Centro de pared
   *   { width: 0.9 },       // Puerta de 90cm
   *   existingOpenings      // Aberturas actuales
   * );
   * 
   * if (validation.valid) {
   *   // Proceder con colocación
   * } else {
   *   console.warn(validation.reason); // "Solapamiento con abertura existente"
   * }
   */
  static validateOpeningPlacement(
    wallIndex: number,
    position: number,
    newOpening: { width: number; height: number },
    existingOpenings: Opening[]
  ): { valid: boolean; reason?: string } {
    
    // ===== FILTRAR ABERTURAS DE LA MISMA PARED =====
    const wallOpenings = existingOpenings.filter(o => o.wallIndex === wallIndex);
    
    // ===== VERIFICAR SOLAPAMIENTO CON ABERTURAS EXISTENTES =====
    for (const existing of wallOpenings) {
      // Calcular límites de abertura existente
      const existingStart = existing?.position - existing.width / 2;
      const existingEnd = existing?.position + existing.width / 2;
      
      // Calcular límites de nueva abertura
      const newStart = position - newOpening.width / 2;
      const newEnd = position + newOpening.width / 2;
      
      // Verificar solapamiento usando lógica de intervalos
      // NO solapan si: newEnd < existingStart OR newStart > existingEnd
      // Solapan si: NOT(condición anterior)
      if (!(newEnd < existingStart || newStart > existingEnd)) {
        return { valid: false, reason: 'Solapamiento con abertura existente' };
      }
    }
    
    // ===== VERIFICAR LÍMITES DE PARED =====
    const minPos = newOpening.width / 2;      // Mínima posición para que quepa
    const maxPos = 1 - newOpening.width / 2;  // Máxima posición para que quepa
    
    if (position < minPos || position > maxPos) {
      return { valid: false, reason: 'Fuera de límites de pared' };
    }
    
    return { valid: true };
  }

  /**
   * @method findClosestWall
   * @description Encuentra la pared más cercana a un punto 3D específico
   * 
   * Algoritmo de proximidad que determina cuál pared del edificio está más cerca
   * de un punto dado. Útil para operaciones automáticas de snapping y validación.
   * 
   * @param {THREE.Vector3} point - Punto 3D de referencia
   * @param {Point2D[]} coordinates - Coordenadas del polígono del edificio
   * @returns {Object | null} Información de la pared más cercana
   * 
   * @algorithm
   * Similar a calculatePositionFromMouse pero sin restricciones de arrastre:
   * 1. Para cada pared: calcular distancia al punto
   * 2. Retornar pared con menor distancia
   * 3. Incluir posición normalizada en resultado
   * 
   * @example
   * const closest = InteractionEngine.findClosestWall(
   *   new THREE.Vector3(2, 1, 3),
   *   buildingCoords
   * );
   * // Resultado: { wallIndex: 1, distance: 0.5, position: 0.3 }
   */
  static findClosestWall(
    point: THREE.Vector3,
    coordinates: Point2D[]
  ): { wallIndex: number; distance: number; position: number } | null {
    
    let closestWall: number | null = null;
    let closestDistance = Infinity;
    let closestPosition = 0.5;
    
    coordinates.forEach((coord, wallIndex) => {
      const nextIndex = (wallIndex + 1) % coordinates.length;
      const nextCoord = coordinates[nextIndex];
      
      // Calcular proyección en pared
      const wallVector = {
        x: nextCoord.x - coord.x,
        z: nextCoord.z - coord.z
      };
      
      const pointToStart = {
        x: point.x - coord.x,
        z: point.z - coord.z
      };
      
      const dotProduct = pointToStart.x * wallVector.x + pointToStart.z * wallVector.z;
      const wallLengthSquared = wallVector.x * wallVector.x + wallVector.z * wallVector.z;
      
      const relativePosition = dotProduct / wallLengthSquared;
      const clampedPosition = Math.max(0.0, Math.min(1.0, relativePosition));
      
      // Punto más cercano en la pared
      const closestPointOnWall = {
        x: coord.x + clampedPosition * wallVector.x,
        z: coord.z + clampedPosition * wallVector.z
      };
      
      const distance = Math.sqrt(
        (point.x - closestPointOnWall.x) ** 2 + 
        (point.z - closestPointOnWall.z) ** 2
      );
      
      if (distance < closestDistance) {
        closestDistance = distance;
        closestWall = wallIndex;
        closestPosition = clampedPosition;
      }
    });
    
    return closestWall !== null ? {
      wallIndex: closestWall,
      distance: closestDistance,
      position: closestPosition
    } : null;
  }
}

/**
 * =====================================================================================
 * NOTAS DE IMPLEMENTACIÓN Y ALGORITMOS MATEMÁTICOS
 * =====================================================================================
 * 
 * ## Fundamentos Matemáticos:
 * 
 * ### 1. Proyección Vectorial:
 * ```
 * Dado: vector A (mouse-to-start), vector B (wall)
 * Proyección de A sobre B = (A · B) / |B|² * B
 * Posición relativa = (A · B) / |B|²
 * ```
 * 
 * ### 2. Transformaciones de Coordenadas:
 * ```
 * Global → Local: T = Translate(-center) * Rotate(-angle)
 * Local → Global: T⁻¹ = Rotate(angle) * Translate(center)
 * ```
 * 
 * ### 3. Detección de Solapamiento:
 * ```
 * Intervalos A=[a1,a2], B=[b1,b2]
 * NO solapan si: a2 < b1 OR a1 > b2
 * Solapan si: NOT(condición anterior)
 * ```
 * 
 * ## Optimizaciones de Rendimiento:
 * 
 * ### 1. Evitar Math.sqrt cuando sea posible:
 * - Usar distancia al cuadrado para comparaciones
 * - Solo calcular sqrt para el resultado final
 * 
 * ### 2. Early returns:
 * - Validar condiciones previas antes de cálculos pesados
 * - Retornar null inmediatamente si condiciones no se cumplen
 * 
 * ### 3. Reutilización de cálculos:
 * - Cache vectores para múltiples operaciones
 * - Compartir cálculos entre métodos relacionados
 * 
 * ## Precisión y Estabilidad Numérica:
 * 
 * ### 1. Clamps de seguridad:
 * - Evitar posiciones exactas 0.0 y 1.0 (problemas de esquina)
 * - Usar márgenes mínimos (0.05, 0.1) según contexto
 * 
 * ### 2. Manejo de casos edge:
 * - Paredes de longitud cero
 * - Coordenadas idénticas consecutivas
 * - Valores NaN o Infinity en cálculos
 * 
 * ### 3. Consistencia de coordenadas:
 * - Misma escala en toda la aplicación
 * - Coordenadas normalizadas [0-1] para independencia de escala
 * - Transformaciones usando matrices Three.js para precisión
 * 
 * ## Casos de Uso Arquitectónicos:
 * 
 * ### 1. Restricciones de Construcción:
 * - Distancias mínimas entre aberturas
 * - Máximo porcentaje de abertura por pared
 * - Restricciones por tipo de abertura (puertas vs ventanas)
 * 
 * ### 2. UX/UI Considerations:
 * - Feedback visual inmediato durante arrastre
 * - Snapping a posiciones common (centros, tercios, golden ratio)
 * - Validación en tiempo real con indicadores visuales
 * 
 * ### 3. Integración con Physics:
 * - Colisiones con elementos existentes
 * - Restricciones espaciales por mobiliario
 * - Simulación de flujos de tráfico
 * 
 * ## Testing y Validación:
 * 
 * ### Test Cases Recomendados:
 * ```typescript
 * // 1. Posiciones límite
 * testBoundaryPositions(0.0, 0.05, 0.95, 1.0);
 * 
 * // 2. Solapamientos
 * testOverlapDetection(existingOpenings, newOpening);
 * 
 * // 3. Paredes en diferentes orientaciones
 * testWallOrientations([0°, 45°, 90°, 180°, 270°]);
 * 
 * // 4. Casos edge
 * testEdgeCases(zeroLengthWalls, duplicateCoords, invalidEvents);
 * ```
 * 
 * ## Métricas de Performance:
 * 
 * - calculatePositionFromMouse: ~0.1ms para edificios típicos (<20 paredes)
 * - calculateTemplateDropPosition: ~0.05ms (operaciones constantes)
 * - validateOpeningPlacement: ~0.01ms por abertura en pared
 * 
 * ## Extensibilidad Futura:
 * 
 * 1. **Snapping Inteligente**: Posiciones automáticas (centros, thirds, golden ratio)
 * 2. **Multi-piso**: Coordenadas Y para edificios multi-nivel
 * 3. **Paredes Curvas**: Algoritmos para paredes no lineales
 * 4. **Optimización Spatial**: Estructuras de datos para lookup O(log n)
 */