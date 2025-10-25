import type { IGeometryAdapter } from "./contracts/IGeometryAdapter";
import { Opening, Point2D } from '../../types/openings';
import { ElementType } from '../../types/walls';

type WallSegment = {
  startX: number;
  endX: number;
  height: number;
  startY?: number;
  endY?: number;
};

export interface Wall {
  [key: string]: any;
}

export interface FloorOpening {
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
 * Motor de geometría para generación de pisos, techos y paredes con aberturas.
 */
export class GeometryEngine {
  /**
   * @param adapter Adaptador de geometría compatible (Three.js, Babylon, etc.)
   */
  constructor(private adapter: IGeometryAdapter) {}

  /**
   * Genera geometría de piso a partir de coordenadas 2D usando triangulación fan.
   * @param coordinates Array de puntos 2D del perímetro del piso.
   * @returns BufferGeometry generado por el adaptador.
   */
  createFloorGeometry(coordinates: Point2D[]) {
    const vertices: number[] = [];
    const indices: number[] = [];

    coordinates.forEach(coord => {
      vertices.push(coord.x, 0, coord.z);
    });

    for (let i = 1; i < coordinates.length - 1; i++) {
      indices.push(0, i, i + 1);
    }

    return this.adapter.createBufferGeometry(vertices, indices);
  }

  /**
   * Genera geometría de techo con orientación invertida para normales correctas.
   * @param coordinates Array de puntos 2D del perímetro del techo.
   * @param depth Altura del techo respecto al piso.
   * @returns BufferGeometry generado por el adaptador.
   */
  createCeilingGeometry(coordinates: Point2D[], depth: number) {
    const vertices: number[] = [];
    const indices: number[] = [];

    coordinates.forEach(coord => {
      vertices.push(coord.x, depth, coord.z);
    });

    for (let i = 1; i < coordinates.length - 1; i++) {
      indices.push(0, i + 1, i);
    }

    return this.adapter.createBufferGeometry(vertices, indices);
  }

  /**
   * Genera geometría compleja de pared con soporte para aberturas múltiples.
   * @param wallIndex Índice de la pared.
   * @param p1 Punto inicial de la pared.
   * @param p2 Punto final de la pared.
   * @param depth Altura de la pared.
   * @param wallOpenings Array de aberturas en la pared.
   * @returns BufferGeometry generado por el adaptador.
   */
  createWallGeometry(
    wallIndex: number,
    p1: Point2D,
    p2: Point2D,
    depth: number,
    wallOpenings: Opening[]
  ) {
    const wallLength = Math.sqrt((p2.x - p1.x) ** 2 + (p2.z - p1.z) ** 2);

    if (wallOpenings.length === 0) {
      const wallVertices = [
        p1.x, 0, p1.z,
        p2.x, 0, p2.z,
        p2.x, depth, p2.z,
        p1.x, depth, p1.z
      ];
      const wallIndices = [0, 2, 1, 0, 3, 2];
      return this.adapter.createBufferGeometry(wallVertices, wallIndices);
    } else {
      const vertices: number[] = [];
      const indices: number[] = [];
      let vertexIndex = 0;
      const segments = this.createWallSegments(wallLength, depth, wallOpenings);

      segments.forEach(segment => {
        let segmentVertices: number[];
        if (segment.startY !== undefined && segment.endY !== undefined) {
          segmentVertices = [
            p1.x + (segment.startX / wallLength) * (p2.x - p1.x), segment.startY, p1.z + (segment.startX / wallLength) * (p2.z - p1.z),
            p1.x + (segment.endX / wallLength) * (p2.x - p1.x), segment.startY, p1.z + (segment.endX / wallLength) * (p2.z - p1.z),
            p1.x + (segment.endX / wallLength) * (p2.x - p1.x), segment.endY, p1.z + (segment.endX / wallLength) * (p2.z - p1.z),
            p1.x + (segment.startX / wallLength) * (p2.x - p1.x), segment.endY, p1.z + (segment.startX / wallLength) * (p2.z - p1.z)
          ];
        } else if (
          segment.height > 0.1 &&
          segment.height < depth
        ) {
          segmentVertices = [
            p1.x + (segment.startX / wallLength) * (p2.x - p1.x), 0, p1.z + (segment.startX / wallLength) * (p2.z - p1.z),
            p1.x + (segment.endX / wallLength) * (p2.x - p1.x), 0, p1.z + (segment.endX / wallLength) * (p2.z - p1.z),
            p1.x + (segment.endX / wallLength) * (p2.x - p1.x), segment.height, p1.z + (segment.endX / wallLength) * (p2.z - p1.z),
            p1.x + (segment.startX / wallLength) * (p2.x - p1.x), segment.height, p1.z + (segment.startX / wallLength) * (p2.z - p1.z)
          ];
        } else {
          segmentVertices = [
            p1.x + (segment.startX / wallLength) * (p2.x - p1.x), 0, p1.z + (segment.startX / wallLength) * (p2.z - p1.z),
            p1.x + (segment.endX / wallLength) * (p2.x - p1.x), 0, p1.z + (segment.endX / wallLength) * (p2.z - p1.z),
            p1.x + (segment.endX / wallLength) * (p2.x - p1.x), segment.height, p1.z + (segment.endX / wallLength) * (p2.z - p1.z),
            p1.x + (segment.startX / wallLength) * (p2.x - p1.x), segment.height, p1.z + (segment.startX / wallLength) * (p2.z - p1.z)
          ];
        }
        vertices.push(...segmentVertices);
        indices.push(
          vertexIndex, vertexIndex + 2, vertexIndex + 1,
          vertexIndex, vertexIndex + 3, vertexIndex + 2
        );
        vertexIndex += 4;
      });

      return this.adapter.createBufferGeometry(vertices, indices);
    }
  }

  /**
   * Genera los segmentos de pared considerando aberturas.
   * @param wallLength Longitud total de la pared.
   * @param wallHeight Altura de la pared.
   * @param openings Array de aberturas en la pared.
   * @returns Array de segmentos de pared.
   */
  createWallSegments(wallLength: number, wallHeight: number, openings: Opening[]): WallSegment[] {
    const segments: WallSegment[] = [];
    let currentX = 0;
    const sortedOpenings = [...openings].sort((a, b) => a.position - b.position);

    sortedOpenings.forEach(opening => {
      const openingStartX = (opening.position * wallLength) - opening.width / 2;
      const openingEndX = (opening.position * wallLength) + opening.width / 2;

      if (currentX < openingStartX) {
        segments.push({
          startX: currentX,
          endX: openingStartX,
          height: wallHeight
        });
      }

      if (opening.type === ElementType.Window || (opening.bottomOffset + opening.height < wallHeight)) {
        const segmentStartY = opening.bottomOffset + opening.height;
        const segmentEndY = wallHeight;
        if (segmentEndY > segmentStartY + 0.1) {
          segments.push({
            startX: openingStartX,
            endX: openingEndX,
            height: segmentEndY,
            startY: segmentStartY,
            endY: segmentEndY
          });
        }
      }

      if (opening.type === ElementType.Window && opening.bottomOffset > 0.1) {
        segments.push({
          startX: openingStartX,
          endX: openingEndX,
          height: opening.bottomOffset
        });
      }

      currentX = openingEndX;
    });

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
   * Devuelve las aberturas asociadas a una pared.
   * @param openings Array de aberturas.
   * @param wallIndex Índice de la pared.
   * @returns Array de aberturas asociadas a la pared.
   */
  getOpeningsForWall(openings: Opening[], wallIndex: number): Opening[] {
    return openings.filter((opening: Opening) => opening.wallIndex === wallIndex);
  }

  /**
   * Crea un piso nuevo.
   * @param name Nombre del piso.
   * @param baseHeight Altura base del piso (por defecto 0).
   * @returns Objeto Floor creado.
   */
  createFloor(name: string, baseHeight: number = 0): Floor {
    return {
      id: crypto.randomUUID(),
      name,
      walls: [],
      openings: [],
      baseHeight,
    };
  }

  /**
   * Replica un piso existente con nueva altura.
   * @param floor Piso a replicar.
   * @param newHeight Nueva altura base para el piso replicado.
   * @returns Objeto Floor replicado.
   */
  replicateFloor(floor: Floor, newHeight: number): Floor {
    return {
      ...this.createFloor(floor.name + ' (Copia)', newHeight),
      walls: floor.walls.map((w: Wall) => ({ ...w })),
      openings: floor.openings.map((o: FloorOpening) => ({ ...o })),
    };
  }

  /**
   * Genera las paredes a partir de coordenadas.
   * @param coords Array de puntos 2D del perímetro.
   * @returns Array de objetos Wall generados.
   */
  generateWallsFromCoordinates(coords: { x: number; z: number }[]): Wall[] {
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

  /**
   * Calcula el punto medio entre dos puntos.
   * @param a Primer punto.
   * @param b Segundo punto.
   * @returns Punto medio calculado.
   */
  createMidpoint(a: any, b: any) {
    return this.adapter.multiplyScalar(
      this.adapter.addVectors(a, b),
      0.5
    );
  }

  /**
   * Calcula la distancia entre dos puntos.
   * @param a Primer punto.
   * @param b Segundo punto.
   * @returns Distancia entre los puntos.
   */
  getLength(a: any, b: any) {
    return this.adapter.distance(a, b);
  }
}