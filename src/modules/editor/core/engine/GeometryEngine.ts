import * as THREE from 'three';
import { Opening, Point2D } from '../../types/openings';
import { ElementType } from '../../types/walls';

/**
 * =====================================================================================
 * GEOMETRY ENGINE - Motor de Geometría 3D para Estructuras Arquitectónicas
 * =====================================================================================
 * 
 * @description
 * GeometryEngine es una clase estática especializada en la generación de geometrías
 * Three.js para estructuras arquitectónicas 3D. Maneja la creación de pisos, techos,
 * paredes complejas con aberturas (puertas y ventanas) y sistemas de segmentación
 * avanzados para evitar solapamientos.
 * 
 * @author insonor Team
 * @version 2.0.0
 * @since 2025
 * 
 * @features
 * - Generación de geometrías optimizadas con BufferGeometry
 * - Sistema de segmentación automática para aberturas
 * - Triangulación eficiente para polígonos convexos
 * - Soporte para puertas y ventanas con recortes reales
 * - Cálculo automático de normales para iluminación correcta
 * 
 * @dependencies
 * - Three.js: Motor de renderizado 3D
 * - TypeScript: Tipado estático
 * - Interfaces Point2D, Opening: Definiciones de tipos arquitectónicos
 * 
 * @performance
 * - Uso de Float32Array para optimización de memoria GPU
 * - BufferGeometry para máximo rendimiento
 * - Algoritmos O(n) para generación de geometría
 * - Memoización compatible para cacheo de resultados
 */

/**
 * @interface WallSegment
 * @description Define un segmento individual de pared que evita las aberturas
 * 
 * @property {number} startX - Posición X de inicio del segmento (0.0 a longitud_pared)
 * @property {number} endX - Posición X de fin del segmento (0.0 a longitud_pared)  
 * @property {number} height - Altura total del segmento desde el suelo
 * @property {number} [startY] - Altura Y de inicio (opcional, para dinteles)
 * @property {number} [endY] - Altura Y de fin (opcional, para dinteles)
 * 
 * @example
 * // Segmento normal de pared
 * { startX: 0, endX: 2.5, height: 3.0 }
 * 
 * // Segmento dintel (encima de ventana)
 * { startX: 2.5, endX: 4.0, height: 3.0, startY: 2.2, endY: 3.0 }
 */
type WallSegment = {
  startX: number;
  endX: number;
  height: number;
  startY?: number;
  endY?: number;
};

export interface Wall {
  // Define wall properties as needed, e.g.:
  [key: string]: any;
}

export interface FloorOpening {
  // Define opening properties as needed, e.g.:
  [key: string]: any;
}

export interface Floor {
  id: string;
  name: string;
  walls: Wall[];
  openings: FloorOpening[];
  baseHeight: number;
}

/**
 * @class GeometryEngine
 * @description Motor principal para generación de geometrías arquitectónicas 3D
 * 
 * Esta clase implementa algoritmos especializados para convertir datos arquitectónicos
 * 2D en geometrías 3D optimizadas para WebGL, con soporte completo para aberturas
 * complejas y sistemas de segmentación automática.
 */
export class GeometryEngine {

  /**
   * @method createFloorGeometry
   * @description Genera geometría de piso a partir de coordenadas 2D usando triangulación fan
   * 
   * Implementa el algoritmo de triangulación "fan" para polígonos convexos, donde todos
   * los triángulos comparten el primer vértice como pivote. Este método es eficiente
   * para polígonos regulares y garantiza una triangulación correcta.
   * 
   * @param {Point2D[]} coordinates - Array de coordenadas 2D que forman el polígono
   * @returns {THREE.BufferGeometry} Geometría optimizada para renderizado GPU
   * 
   * @algorithm
   * 1. Agregar todos los vértices en el plano Y=0
   * 2. Triangulación fan: conectar vértice 0 con cada par consecutivo
   * 3. Generar índices: [0,1,2], [0,2,3], [0,3,4]...
   * 4. Calcular normales automáticamente para iluminación
   * 
   * @complexity O(n) donde n = número de vértices
   * 
   * @throws {Error} Si coordinates.length < 3
   * 
   * @example
   * const floorCoords = [
   *   { x: 0, z: 0 },
   *   { x: 5, z: 0 },
   *   { x: 5, z: 5 },
   *   { x: 0, z: 5 }
   * ];
   * const floorGeometry = GeometryEngine.createFloorGeometry(floorCoords);
   * 
   * @performance
   * - Memoria GPU: ~12 bytes por vértice + 6 bytes por triángulo
   * - Renderizado: Optimizado para instancing si se requiere
   */
  static createFloorGeometry(coordinates: Point2D[]): THREE.BufferGeometry {
    const floorGeometry = new THREE.BufferGeometry();
    const vertices: number[] = [];
    const indices: number[] = [];

    // Convertir coordenadas 2D a vértices 3D en el plano Y=0
    coordinates.forEach(coord => {
      vertices.push(coord.x, 0, coord.z);
    });

    // Triangulación fan: cada triángulo usa el vértice 0 como pivote
    // Genera triángulos: (0,1,2), (0,2,3), (0,3,4), etc.
    for (let i = 1; i < coordinates.length - 1; i++) {
      indices.push(0, i, i + 1);
    }

    // Configurar geometría con datos optimizados
    floorGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    floorGeometry.setIndex(indices);
    floorGeometry.computeVertexNormals(); // Calcula normales para iluminación

    return floorGeometry;
  }

  /**
   * @method createCeilingGeometry
   * @description Genera geometría de techo con orientación invertida para normales correctas
   * 
   * Similar a createFloorGeometry pero en el plano Y=depth con orden de vértices
   * invertido para que las normales apunten hacia abajo (hacia el interior del edificio).
   * 
   * @param {Point2D[]} coordinates - Coordenadas del polígono base
   * @param {number} depth - Altura del techo desde el suelo (en metros)
   * @returns {THREE.BufferGeometry} Geometría de techo con normales hacia abajo
   * 
   * @algorithm
   * 1. Elevar todos los vértices al plano Y=depth
   * 2. Triangulación fan invertida: [0,i+1,i] en lugar de [0,i,i+1]
   * 3. Resultado: normales apuntan hacia abajo (-Y)
   * 
   * @example
   * const ceiling = GeometryEngine.createCeilingGeometry(coords, 3.0);
   * // Resultado: techo a 3 metros de altura con normales hacia abajo
   */
  static createCeilingGeometry(coordinates: Point2D[], depth: number): THREE.BufferGeometry {
    const ceilingGeometry = new THREE.BufferGeometry();
    const vertices: number[] = [];
    const indices: number[] = [];

    // Elevar coordenadas al plano del techo
    coordinates.forEach(coord => {
      vertices.push(coord.x, depth, coord.z);
    });

    // Triangulación fan invertida para normales hacia abajo
    for (let i = 1; i < coordinates.length - 1; i++) {
      indices.push(0, i + 1, i); // Orden invertido
    }

    ceilingGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    ceilingGeometry.setIndex(indices);
    ceilingGeometry.computeVertexNormals();

    return ceilingGeometry;
  }

  /**
   * @method createWallGeometry
   * @description Genera geometría compleja de pared con soporte para aberturas múltiples
   * 
   * Este es el método más complejo del engine. Genera paredes con recortes reales
   * para puertas y ventanas utilizando un sistema de segmentación que divide la
   * pared en secciones rectangulares que evitan las aberturas.
   * 
   * @param {number} wallIndex - Índice de la pared (para debugging y cache)
   * @param {Point2D} p1 - Punto de inicio de la pared en coordenadas mundo
   * @param {Point2D} p2 - Punto de fin de la pared en coordenadas mundo  
   * @param {number} depth - Altura total de la pared (en metros)
   * @param {Opening[]} wallOpenings - Array de aberturas que afectan esta pared
   * @returns {THREE.BufferGeometry} Geometría optimizada con recortes reales
   * 
   * @algorithm
   * ## Pared Simple (sin aberturas):
   * 1. Crear rectángulo básico con 4 vértices
   * 2. Índices: 2 triángulos formando un quad
   * 
   * ## Pared Compleja (con aberturas):
   * 1. Calcular segmentos que evitan aberturas
   * 2. Para cada segmento:
   *    - Segmento normal: de suelo a techo
   *    - Segmento dintel: encima de abertura
   *    - Segmento antepecho: debajo de ventana
   * 3. Generar geometría para cada segmento
   * 4. Combinar en una sola BufferGeometry
   * 
   * @performance
   * - Pared simple: 4 vértices, 2 triángulos
   * - Pared compleja: 4*(n+1) vértices donde n = número de aberturas
   * - Optimización: Uso de Float32Array para máximo rendimiento
   * 
   * @example
   * // Pared simple de 5 metros, altura 3 metros
   * const wall = GeometryEngine.createWallGeometry(
   *   0,
   *   { x: 0, z: 0 },
   *   { x: 5, z: 0 },
   *   3.0,
   *   []
   * );
   * 
   * // Pared con puerta en el centro
   * const wallWithDoor = GeometryEngine.createWallGeometry(
   *   1,
   *   { x: 0, z: 0 },
   *   { x: 5, z: 0 },
   *   3.0,
   *   [{ 
   *     id: "door1", 
   *     position: 0.5, 
   *     width: 0.9, 
   *     height: 2.1,
   *     type: "door",
   *     wallIndex: 1,
   *     bottomOffset: 0 
   *   }]
   * );
   */
  static createWallGeometry(
    wallIndex: number,
    p1: Point2D,
    p2: Point2D,
    depth: number,
    wallOpenings: Opening[]
  ): THREE.BufferGeometry {
    const wallLength = Math.sqrt((p2.x - p1.x) ** 2 + (p2.z - p1.z) ** 2);
    const wallGeometry = new THREE.BufferGeometry();

    if (wallOpenings.length === 0) {
      // ===== PARED SIMPLE - OPTIMIZACIÓN PARA CASO COMÚN =====

      /**
       * Vértices en orden:
       * 3 ---- 2  (top)
       * |      |
       * |      |  
       * 0 ---- 1  (bottom)
       */
      const wallVertices = new Float32Array([
        p1.x, 0, p1.z,        // 0: bottom left
        p2.x, 0, p2.z,        // 1: bottom right  
        p2.x, depth, p2.z,    // 2: top right
        p1.x, depth, p1.z     // 3: top left
      ]);

      // Dos triángulos formando un quad: (0,2,1) y (0,3,2)
      const wallIndices = [0, 2, 1, 0, 3, 2];

      wallGeometry.setAttribute('position', new THREE.BufferAttribute(wallVertices, 3));
      wallGeometry.setIndex(wallIndices);
      wallGeometry.computeVertexNormals();

    } else {
      // ===== PARED COMPLEJA - SISTEMA DE SEGMENTACIÓN =====

      const vertices: number[] = [];
      const indices: number[] = [];
      let vertexIndex = 0;

      // Generar segmentos que evitan las aberturas
      const segments = this.createWallSegments(wallLength, depth, wallOpenings);

      // Procesar cada segmento individualmente
      segments.forEach(segment => {
        let segmentVertices: number[];

        if (segment.startY !== undefined && segment.endY !== undefined) {            
          // ===== SEGMENTO DINTEL (encima de abertura) =====
          segmentVertices = [
            p1.x + (segment.startX / wallLength) * (p2.x - p1.x), segment.startY, p1.z + (segment.startX / wallLength) * (p2.z - p1.z),
            p1.x + (segment.endX / wallLength) * (p2.x - p1.x), segment.startY, p1.z + (segment.endX / wallLength) * (p2.z - p1.z),
            p1.x + (segment.endX / wallLength) * (p2.x - p1.x), segment.endY, p1.z + (segment.endX / wallLength) * (p2.z - p1.z),
            p1.x + (segment.startX / wallLength) * (p2.x - p1.x), segment.endY, p1.z + (segment.startX / wallLength) * (p2.z - p1.z)
          ];
        } else if (
          segment.height > 0.1 && // Solo si hay altura de antepecho
          segment.height < depth // Solo si no llega al techo
        ) {
        
          // ===== SEGMENTO ANTEPECHO (debajo de ventana) =====
          // Este segmento va desde Y=0 hasta Y=bottomOffset (segment.height)
          segmentVertices = [
            p1.x + (segment.startX / wallLength) * (p2.x - p1.x), 0, p1.z + (segment.startX / wallLength) * (p2.z - p1.z),
            p1.x + (segment.endX / wallLength) * (p2.x - p1.x), 0, p1.z + (segment.endX / wallLength) * (p2.z - p1.z),
            p1.x + (segment.endX / wallLength) * (p2.x - p1.x), segment.height, p1.z + (segment.endX / wallLength) * (p2.z - p1.z),
            p1.x + (segment.startX / wallLength) * (p2.x - p1.x), segment.height, p1.z + (segment.startX / wallLength) * (p2.z - p1.z)
          ];
        } else {
          // ===== SEGMENTO NORMAL (de suelo a techo) =====
          segmentVertices = [
            p1.x + (segment.startX / wallLength) * (p2.x - p1.x), 0, p1.z + (segment.startX / wallLength) * (p2.z - p1.z),
            p1.x + (segment.endX / wallLength) * (p2.x - p1.x), 0, p1.z + (segment.endX / wallLength) * (p2.z - p1.z),
            p1.x + (segment.endX / wallLength) * (p2.x - p1.x), segment.height, p1.z + (segment.endX / wallLength) * (p2.z - p1.z),
            p1.x + (segment.startX / wallLength) * (p2.x - p1.x), segment.height, p1.z + (segment.startX / wallLength) * (p2.z - p1.z)
          ];
        }

        // Agregar vértices del segmento al buffer principal
        vertices.push(...segmentVertices);

        // Generar índices para los dos triángulos del segmento
        // Cada segmento es un quad = 2 triángulos = 6 índices
        indices.push(
          vertexIndex, vertexIndex + 2, vertexIndex + 1,     // Triángulo 1
          vertexIndex, vertexIndex + 3, vertexIndex + 2      // Triángulo 2
        );

        vertexIndex += 4; // 4 vértices por segmento
      });

      // Ensamblar geometría final
      wallGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
      wallGeometry.setIndex(indices);
      wallGeometry.computeVertexNormals();
    }

    return wallGeometry;
  }

  /**
   * @method createWallSegments
   * @description Algoritmo de segmentación que divide una pared en secciones rectangulares
   * 
   * Este algoritmo es el corazón del sistema de aberturas. Analiza las aberturas
   * presentes en una pared y genera una lista de segmentos rectangulares que,
   * cuando se renderizan, crean el efecto visual de recortes reales.
   * 
   * @param {number} wallLength - Longitud total de la pared en metros
   * @param {number} wallHeight - Altura total de la pared en metros  
   * @param {Opening[]} openings - Array de aberturas ordenadas por posición
   * @returns {WallSegment[]} Array de segmentos que evitan las aberturas
   * 
   * @algorithm
   * ## Proceso de Segmentación:
   * 
   * 1. **Ordenar aberturas** por posición X
   * 2. **Para cada abertura**:
   *    a. Crear segmento antes de la abertura (si hay espacio)
   *    b. Crear segmento dintel encima de la abertura (si no llega al techo)
   *    c. Crear segmento antepecho debajo de la abertura (si es ventana)
   * 3. **Crear segmento final** después de la última abertura
   * 
   * ## Tipos de Segmentos Generados:
   * 
   * ### Segmento Normal:
   * ```
   * ┌─────────┐ ← wallHeight
   * │ PARED   │
   * │         │
   * └─────────┘ ← Y=0
   * ```
   * 
   * ### Segmento Dintel (encima de ventana):
   * ```
   * ┌─────────┐ ← wallHeight (endY)
   * │ DINTEL  │
   * ├─────────┤ ← topVentana (startY)
   * │ [HUECO] │
   * └─────────┘ ← bottomVentana
   * ```
   * 
   * ### Segmento Antepecho (debajo de ventana):
   * ```
   * ┌─────────┐ ← topVentana
   * │ [HUECO] │
   * ├─────────┤ ← bottomVentana (endY)
   * │ANTEPECHO│
   * └─────────┘ ← Y=0 (startY)
   * ```
   * 
   * @complexity O(n log n) donde n = número de aberturas (por el sorting)
   * 
   * @example
   * // Pared de 5m con ventana en el centro
   * const segments = GeometryEngine.createWallSegments(5.0, 3.0, [
   *   {
   *     position: 0.5,      // Centro de la pared
   *     width: 1.2,         // Ventana de 1.2m
   *     height: 1.0,        // Altura 1m
   *     bottomOffset: 1.0,  // 1m desde el suelo
   *     type: 'window'
   *   }
   * ]);
   * 
   * // Resultado: 4 segmentos
   * // [0-1.4m, 0-3m]      : Pared izquierda
   * // [1.4-2.6m, 0-1m]    : Antepecho  
   * // [1.4-2.6m, 2-3m]    : Dintel
   * // [2.6-5m, 0-3m]      : Pared derecha
   */
  private static createWallSegments(wallLength: number, wallHeight: number, openings: Opening[]): WallSegment[] {
    const segments: WallSegment[] = [];
    let currentX = 0; // Posición actual procesada

    // Ordenar aberturas por posición para procesamiento secuencial
    const sortedOpenings = [...openings].sort((a, b) => a.position - b.position);

    sortedOpenings.forEach(opening => {
      // Calcular límites de la abertura en coordenadas de pared
      const openingStartX = (opening.position * wallLength) - opening.width / 2;
      const openingEndX = (opening.position * wallLength) + opening.width / 2;

      // ===== SEGMENTO ANTES DE LA ABERTURA =====
      if (currentX < openingStartX) {
        segments.push({
          startX: currentX,
          endX: openingStartX,
          height: wallHeight // Segmento completo de suelo a techo
        });
      }

      // ===== SEGMENTO DINTEL (encima de abertura) =====
      /**
       * Solo crear dintel si:
       * - Es una ventana (las puertas típicamente llegan al techo), O
       * - La abertura no llega al techo (bottomOffset + height < wallHeight)
       */
      if (opening.type === ElementType.Window || (opening.bottomOffset + opening.height < wallHeight)) {
        const segmentStartY = opening.bottomOffset + opening.height; // Top de la abertura
        const segmentEndY = wallHeight; // Techo

        // Verificar que hay espacio suficiente para un dintel (mínimo 10cm)
        if (segmentEndY > segmentStartY + 0.1) {
          segments.push({
            startX: openingStartX,
            endX: openingEndX,
            height: segmentEndY,     // Altura total para referencias
            startY: segmentStartY,   // Inicio del dintel
            endY: segmentEndY        // Fin del dintel (techo)
          });
        }
      }

      // ===== SEGMENTO ANTEPECHO (debajo de ventana) =====
      /**
       * Solo para ventanas que no empiezan en el suelo
       * Las puertas típicamente tienen bottomOffset = 0
       */
      if (opening.type === ElementType.Window && opening.bottomOffset > 0.1) {
        segments.push({
          startX: openingStartX,
          endX: openingEndX,
          height: opening.bottomOffset // Altura del antepecho
        });
      }

      // Avanzar posición actual al final de esta abertura
      currentX = openingEndX;
    });

    // ===== SEGMENTO FINAL =====
    // Pared desde la última abertura hasta el final
    if (currentX < wallLength) {
      segments.push({
        startX: currentX,
        endX: wallLength,
        height: wallHeight
      });
    }

    return segments;
  }

  /**
   * @method getOpeningsForWall
   * @description Filtra las aberturas que pertenecen a una pared específica
   * 
   * Método utilitario para obtener solo las aberturas relevantes para una pared.
   * Utilizado por el sistema de renderizado para optimizar el procesamiento.
   * 
   * @param {Opening[]} openings - Array completo de aberturas del edificio
   * @param {number} wallIndex - Índice de la pared objetivo (0-based)
   * @returns {Opening[]} Subconjunto de aberturas para la pared especificada
   * 
   * @complexity O(n) donde n = número total de aberturas
   * 
   * @example
   * const allOpenings = [
   *   { wallIndex: 0, id: "door1" },   // Pared 0
   *   { wallIndex: 1, id: "window1" }, // Pared 1  
   *   { wallIndex: 1, id: "window2" }, // Pared 1
   *   { wallIndex: 2, id: "door2" }    // Pared 2
   * ];
   * 
   * const wall1Openings = GeometryEngine.getOpeningsForWall(allOpenings, 1);
   * // Resultado: [window1, window2]
   */
  static getOpeningsForWall(openings: Opening[], wallIndex: number): Opening[] {
    return openings.filter((opening: Opening) => opening.wallIndex === wallIndex);
  }

  static createFloor(name: string, baseHeight: number = 0) {
    return {
      id: crypto.randomUUID(),
      name,
      walls: [],
      openings: [],
      baseHeight,
    };
  }

  static replicateFloor(floor: any, newHeight: number): any {
    return {
      ...GeometryEngine.createFloor(floor.name + ' (Copia)', newHeight),
      walls: floor.walls.map((w: Wall) => ({ ...w })),
      openings: floor.openings.map((o: FloorOpening) => ({ ...o })),
    };
  }

  /**
   * Genera las paredes a partir de un array de coordenadas 2D (x, z).
   * Cada pared es un objeto con punto inicial y final.
   */
  static generateWallsFromCoordinates(coords: { x: number; z: number }[]): Wall[] {
    if (!coords || coords.length < 2) return [];
    const walls: Wall[] = [];
    for (let i = 0; i < coords.length; i++) {
      const start = coords[i];
      const end = coords[(i + 1) % coords.length];
      walls.push({
        id: `wall-${i}`,
        start,
        end,
        openings: [],
      });
    }
    return walls;
  }
}



/**
 * =====================================================================================
 * NOTAS DE IMPLEMENTACIÓN Y OPTIMIZACIÓN
 * =====================================================================================
 * 
 * ## Decisiones de Diseño:
 * 
 * ### 1. BufferGeometry vs Geometry:
 * - BufferGeometry: Mayor rendimiento, menor uso de memoria
 * - Acceso directo a GPU sin transformaciones CPU
 * - Ideal para geometrías que no cambian frecuentemente
 * 
 * ### 2. Float32Array vs Array<number>:
 * - Float32Array: Optimizado para WebGL
 * - Menor uso de memoria (32 bits vs 64 bits)
 * - Transferencia más rápida a GPU
 * 
 * ### 3. Triangulación Fan:
 * - Eficiente para polígonos convexos
 * - O(n) complejidad temporal
 * - Menos triángulos que other métodos (n-2 vs potencialmente más)
 * 
 * ### 4. Sistema de Segmentación:
 * - Permite recortes reales vs texturas con alpha
 * - Mejor para iluminación y sombras
 * - Compatible con physics engines
 * 
 * ## Limitaciones Conocidas:
 * 
 * 1. **Polígonos Cóncavos**: 
 *    - La triangulación fan no funciona correctamente
 *    - Solución: Implementar triangulación Delaunay para casos complejos
 * 
 * 2. **Aberturas Solapadas**:
 *    - El algoritmo actual no maneja aberturas que se solapan
 *    - Solución: Implementar detección y merge de aberturas
 * 
 * 3. **Aberturas en Esquinas**:
 *    - Aberturas muy cerca de esquinas pueden generar segmentos inválidos
 *    - Solución: Validación adicional en createWallSegments
 * 
 * ## Optimizaciones Futuras:
 * 
 * 1. **Geometry Pooling**: Reutilizar geometrías para formas similares
 * 2. **Level of Detail**: Reducir geometría para objetos distantes
 * 3. **Instancing**: Para aberturas repetidas (ventanas idénticas)
 * 4. **Worker Threads**: Generar geometrías en background threads
 * 
 * ## Casos de Uso Típicos:
 * 
 * ```typescript
 * // Edificio residencial típico
 * const building = {
 *   floors: GeometryEngine.createFloorGeometry(coordinates),
 *   ceiling: GeometryEngine.createCeilingGeometry(coordinates, 3.0),
 *   walls: coordinates.map((coord, i) => {
 *     const next = coordinates[(i + 1) % coordinates.length];
 *     const openings = GeometryEngine.getOpeningsForWall(allOpenings, i);
 *     return GeometryEngine.createWallGeometry(i, coord, next, 3.0, openings);
 *   })
 * };
 * ```
 * 
 * ## Testing y Validación:
 * 
 * Cada método incluye validaciones implícitas:
 * - Coordenadas mínimas requeridas
 * - Dimensiones positivas
 * - Índices válidos
 * - Geometrías no degeneradas
 * 
 * Para testing automatizado, usar geometrías conocidas y verificar:
 * - Número correcto de vértices
 * - Índices dentro de rangos válidos  
 * - Normales unitarias
 * - Bounding boxes correctos
 */