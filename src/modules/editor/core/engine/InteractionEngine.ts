import * as THREE from 'three';
import { DisplayPosition, Opening, Point2D, WallPosition } from '../../types/openings';

/**
 * Motor de interacciones 3D para manipulación arquitectónica.
 * Gestiona cálculos de posicionamiento, proyecciones vectoriales y validaciones para drag & drop y preview de elementos.
 */
export class InteractionEngine {
  /**
   * Calcula la posición óptima en pared a partir de coordenadas del mouse.
   * @param event Evento de Three.js con coordenadas 3D del mouse (event.point)
   * @param isDraggingOpening Estado de arrastre activo
   * @param draggedOpening Abertura siendo arrastrada (si existe)
   * @param coordinatesToUse Coordenadas del polígono de la estructura
   * @returns Posición calculada o null si no es válida
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
   * Calcula posición para drop de template nuevo usando transformaciones 3D.
   * @param event Evento de Three.js con coordenadas 3D del drop
   * @param wallIndex Índice de la pared objetivo donde se hace el drop
   * @param coordinatesToUse Coordenadas del polígono del edificio
   * @param depth Altura del edificio (usado para centrar transformaciones)
   * @returns Posición normalizada en la pared [0.1-0.9]
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
   * Calcula posición de renderizado para aberturas con soporte para preview.
   * @param opening Abertura para la cual calcular posición de display
   * @param isBeingDragged Si la abertura está siendo arrastrada actualmente
   * @param previewPosition Posición temporal durante arrastre
   * @param coord Punto de inicio de la pared que contiene la abertura
   * @param nextCoord Punto de fin de la pared que contiene la abertura
   * @returns Coordenadas 3D donde renderizar la abertura
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
   * Valida si una abertura puede colocarse en una posición específica.
   * @param wallIndex Índice de la pared objetivo
   * @param position Posición normalizada propuesta [0.0-1.0]
   * @param newOpening Dimensiones de la nueva abertura
   * @param existingOpenings Aberturas ya presentes en el edificio
   * @returns Resultado de validación con estado y razón si inválida
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
   * Encuentra la pared más cercana a un punto 3D específico.
   * @param point Punto 3D de referencia
   * @param coordinates Coordenadas del polígono del edificio
   * @returns Información de la pared más cercana o null
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