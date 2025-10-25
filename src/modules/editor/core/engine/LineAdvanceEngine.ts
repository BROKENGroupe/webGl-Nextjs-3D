import * as THREE from "three";
import type { IGeometryAdapter } from "./contracts/IGeometryAdapter";

/**
 * Motor avanzado para manipulación de líneas y polígonos regulares.
 */
export class LineAdvanceEngine {
  static MAX_VISUAL_SIZE = 50;

  private adapter: IGeometryAdapter;

  /**
   * @param adapter Adaptador de geometría compatible (Three.js, Babylon, etc.)
   */
  constructor(adapter: IGeometryAdapter) {
    this.adapter = adapter;
  }

  /**
   * Aplica snap-to-grid a un valor dado.
   * @param value Valor a ajustar.
   * @param snapSize Tamaño de la cuadrícula.
   * @returns Valor ajustado al snap.
   */
  snapToGrid(value: number, snapSize: number): number {
    return Math.round(value / snapSize) * snapSize;
  }

  /**
   * Escala el largo visual de la línea según el límite visual y aplica snap-to-grid.
   * @param input Largo original.
   * @param limitVisualSize Si se limita el tamaño visual.
   * @param snapSize Tamaño de la cuadrícula.
   * @returns Largo escalado y ajustado.
   */
  scaleLength(input: number, limitVisualSize: boolean, snapSize: number): number {
    let scaled = !limitVisualSize
      ? input
      : input > LineAdvanceEngine.MAX_VISUAL_SIZE
      ? LineAdvanceEngine.MAX_VISUAL_SIZE
      : input;
    return this.snapToGrid(scaled, snapSize);
  }

  /**
   * Genera los 4 puntos de un cuadrado alineado a una dirección y centrado en un punto.
   * Si se pasa una dirección, rota el cuadrado para alinearlo.
   * @param center Centro del cuadrado.
   * @param size Tamaño del lado.
   * @param direction Dirección inicial (opcional).
   * @returns Array de puntos (THREE.Vector3).
   */
  getSquarePoints(center: any, size: number, direction?: any): any[] {
    const half = size / 2;
    let basePoints = [
      this.adapter.createVector3(-half, 0, -half),
      this.adapter.createVector3(half, 0, -half),
      this.adapter.createVector3(half, 0, half),
      this.adapter.createVector3(-half, 0, half),
    ];

    if (direction && direction.clone && direction.angleTo) {
      const baseDir = this.adapter.createVector3(1, 0, 0);
      const angle = baseDir.angleTo(direction);
      const axis = baseDir.clone().cross(direction).normalize();
      if (axis.length() > 0.0001 && angle !== 0) {
        basePoints = basePoints.map(p => p.clone().applyAxisAngle(axis, angle));
      }
    }

    return basePoints.map(p => this.adapter.addVectors(p, center));
  }

  /**
   * Extrae los 4 puntos únicos del polígono en orden horario.
   * @param currentLines Array de líneas actuales.
   * @returns Array de puntos ordenados.
   */
  getOrderedSquarePoints(currentLines: any[]): any[] {
    const allPoints = [
      ...currentLines.map(l => l.start.toArray().join(",")),
      ...currentLines.map(l => l.end.toArray().join(","))
    ];
    const pointCounts = allPoints.reduce((acc, p) => {
      acc[p] = (acc[p] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const uniquePoints = Object.keys(pointCounts)
      .filter(k => pointCounts[k] >= 1)
      .map(k => {
        const [x, y, z] = k.split(",").map(Number);
        return this.adapter.createVector3(x, y, z);
      });

    const center = uniquePoints.reduce(
      (acc, p) => this.adapter.addVectors(acc, p),
      this.adapter.createVector3(0, 0, 0)
    );
    center.multiplyScalar(1 / uniquePoints.length);

    uniquePoints.sort((a, b) => {
      const angleA = Math.atan2(a.z - center.z, a.x - center.x);
      const angleB = Math.atan2(b.z - center.z, b.x - center.x);
      return angleA - angleB;
    });

    return uniquePoints;
  }

  /**
   * Genera las líneas de un cuadrado a partir de los puntos y asigna el largo real.
   * @param currentLines Líneas originales.
   * @param squarePoints Puntos del cuadrado.
   * @param realLength Largo real de los lados.
   * @returns Array de líneas actualizadas.
   */
  generateSquareLines(currentLines: any[], squarePoints: any[], realLength: number) {
    return [
      { ...currentLines[0], start: squarePoints[0], end: squarePoints[1], length: realLength },
      { ...currentLines[1], start: squarePoints[1], end: squarePoints[2], length: realLength },
      { ...currentLines[2], start: squarePoints[2], end: squarePoints[3], length: realLength },
      { ...currentLines[3], start: squarePoints[3], end: squarePoints[0], length: realLength },
    ];
  }

  /**
   * Redimensiona todas las líneas proporcionalmente y aplica snap-to-grid.
   * @param currentLines Líneas actuales.
   * @param originalLengths Longitudes originales.
   * @param originalLineLength Largo original de referencia.
   * @param newLength Nuevo largo.
   * @param snapSize Tamaño de snap.
   * @returns Array de líneas redimensionadas.
   */
  resizeProportionally(
    currentLines: any[],
    originalLengths: number[],
    originalLineLength: number,
    newLength: number,
    snapSize: number
  ) {
    const factor = newLength / originalLineLength;
    return currentLines.map((l: any, idx: number) => {
      const origLen = originalLengths[idx];
      let scaledLen = origLen * factor;
      scaledLen = this.snapToGrid(scaledLen, snapSize);
      const start = l.start;
      const end = l.end;
      const center = start.clone().add(end).multiplyScalar(0.5);
      const direction = end.clone().sub(start).normalize();
      const halfLength = scaledLen / 2;
      const newStart = center.clone().add(direction.clone().multiplyScalar(-halfLength));
      const newEnd = center.clone().add(direction.clone().multiplyScalar(halfLength));
      return {
        ...l,
        start: newStart,
        end: newEnd,
        length: scaledLen,
      };
    });
  }

  /**
   * Redimensiona solo una línea y aplica snap-to-grid.
   * @param line Línea a redimensionar.
   * @param newLength Nuevo largo.
   * @param snapSize Tamaño de snap.
   * @returns Línea redimensionada.
   */
  resizeSingleLine(line: any, newLength: number, snapSize: number) {
    let snappedLength = this.snapToGrid(newLength, snapSize);
    const start = line.start;
    const end = line.end;
    const center = start.clone().add(end).multiplyScalar(0.5);
    const direction = end.clone().sub(start).normalize();
    const halfLength = snappedLength / 2;
    const newStart = center.clone().add(direction.clone().multiplyScalar(-halfLength));
    const newEnd = center.clone().add(direction.clone().multiplyScalar(halfLength));
    return {
      ...line,
      start: newStart,
      end: newEnd,
      length: snappedLength,
    };
  }

  /**
   * Redimensiona una línea y devuelve los nuevos puntos (start, end) y la línea actualizada, aplicando snap-to-grid.
   * @param line Línea a redimensionar.
   * @param newLength Nuevo largo.
   * @param snapSize Tamaño de snap.
   * @returns Objeto con línea actualizada, nuevos puntos y distancia.
   */
  resizeLineAndGetPoints(line: any, newLength: number, snapSize: number) {
    let snappedLength = this.snapToGrid(newLength, snapSize);
    const start = line.start;
    const end = line.end;
    const center = start.clone().add(end).multiplyScalar(0.5);
    const direction = end.clone().sub(start).normalize();
    const halfLength = snappedLength / 2;
    const newStart = center.clone().add(direction.clone().multiplyScalar(-halfLength));
    const newEnd = center.clone().add(direction.clone().multiplyScalar(halfLength));
    return {
      updatedLine: {
        ...line,
        start: newStart,
        end: newEnd,
        length: snappedLength,
      },
      newPoints: [newStart, newEnd],
      distance: snappedLength
    };
  }

  /**
   * Redimensiona solo la línea seleccionada en el polígono, manteniendo las otras igual.
   * Devuelve las nuevas líneas y los nuevos puntos del polígono.
   * Soporta polígonos de n lados (n >= 3).
   * @param currentLines Líneas actuales del polígono.
   * @param lineId ID de la línea a redimensionar.
   * @param newLength Nuevo largo.
   * @returns { newLines, newPoints } - Líneas y puntos actualizados.
   */
  resizePolygonWithOneLine(currentLines: any[], lineId: string, newLength: number) {
    const n = currentLines.length;
    if (n < 3) return null;

    const lineIdx = currentLines.findIndex(l => l.id === lineId);
    if (lineIdx === -1) return null;

    const orderedPoints = currentLines.map(l => l.start.clone());

    const start = orderedPoints[lineIdx];
    const end = orderedPoints[(lineIdx + 1) % n];
    const center = start.clone().add(end).multiplyScalar(0.5);
    const direction = end.clone().sub(start).normalize();
    const halfLength = newLength / 2;
    const newStart = center.clone().add(direction.clone().multiplyScalar(-halfLength));
    const newEnd = center.clone().add(direction.clone().multiplyScalar(halfLength));

    const newPoints = [...orderedPoints];
    newPoints[lineIdx] = newStart;
    newPoints[(lineIdx + 1) % n] = newEnd;

    const newLines = currentLines.map((l, idx) => {
      const nextIdx = (idx + 1) % n;
      const length = newPoints[idx].distanceTo(newPoints[nextIdx]);
      return {
        ...l,
        start: newPoints[idx],
        end: newPoints[nextIdx],
        length,
      };
    });

    return { newLines, newPoints };
  }

  /**
   * Genera un polígono regular a partir de un array de tamaños (longitudes de lados).
   * El polígono se centra en 'center' y se orienta según 'direction'.
   * @param sizes Array de longitudes de cada lado (mínimo 3).
   * @param center Centro del polígono (THREE.Vector3).
   * @param direction Dirección inicial del primer lado (opcional, por defecto eje X).
   * @returns { lines, points } - Líneas y puntos generados del polígono.
   */
  generatePolygonFromSizes(
    sizes: number[],
    center: any,
    direction?: any
  ) {
    const n = sizes.length;
    if (n < 3) return { lines: [], points: [] };

    if (
      n === 4 &&
      sizes.every(s => Math.abs(s - sizes[0]) < 1e-6)
    ) {
      const points = this.getSquarePoints(center, sizes[0], direction);
      const lines = points.map((start, i) => {
        const end = points[(i + 1) % 4];
        return {
          id: `poly-line-${i}`,
          name: `Lado-${i}`,
          start,
          end,
          color: "blue",
          length: sizes[0],
          width: 0.02
        };
      });
      return { lines, points };
    }

    const angleStep = (2 * Math.PI) / n;
    const baseDir = direction ? direction.clone().normalize() : new THREE.Vector3(1, 0, 0);

    let points: THREE.Vector3[] = [];
    let currentAngle = 0;
    for (let i = 0; i < n; i++) {
      const rot = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), currentAngle);
      const dir = baseDir.clone().applyQuaternion(rot);
      const radius = n === 5 ? (sizes[i] / 2) / Math.sin(Math.PI / n) : sizes[i] / 2;
      const pt = center.clone().add(dir.multiplyScalar(radius));
      points.push(pt);
      currentAngle += angleStep;
    }

    if (points.length > 2) {
      points[points.length - 1] = points[0].clone();
    }

    const lines = points.map((start, i) => {
      const end = points[(i + 1) % n];
      return {
        id: `poly-line-${i}`,
        name: `Lado-${i}`,
        start,
        end,
        color: "blue",
        length: start.distanceTo(end),
        width: 0.02
      };
    });

    return { lines, points };
  }

  /**
   * Genera líneas conectando los puntos dados en ciclo cerrado.
   * @param points Array de puntos (THREE.Vector3) en orden.
   * @param sizes Array de longitudes deseadas (opcional, si quieres ajustar los lados).
   * @returns Array de líneas generadas conectando los puntos.
   */
  generateLinesFromPoints(points: any[], sizes?: number[]) {
    const n = points.length;
    if (n < 3) return [];
    return points.map((start, i) => {
      const end = points[(i + 1) % n];
      return {
        id: `poly-line-${i}`,
        name: `Lado-${i}`,
        start,
        end,
        color: "blue",
        length: sizes ? sizes[i] : start.distanceTo(end),
        width: 0.02
      };
    });
  }

  /**
   * Genera un cuadrilátero a partir de un array de tamaños (longitudes de lados).
   * El cuadrilátero se centra en 'center' y se orienta según 'direction'.
   * @param sizes Array de longitudes de cada lado (debe ser 4).
   * @param center Centro del cuadrilátero (THREE.Vector3).
   * @param direction Dirección inicial del primer lado (opcional, por defecto eje X).
   * @returns { lines, points } - Líneas y puntos generados del cuadrilátero.
   */
  generateQuadrilateralFromSizes(
    sizes: number[],
    center: any,
    direction: any
  ) {
    if (sizes.length !== 5) return { lines: [], points: [] };

    if (sizes.every(s => Math.abs(s - sizes[0]) < 1e-6)) {
      const points = this.getSquarePoints(center, sizes[0], direction);
      const lines = points.map((start, i) => {
        const end = points[(i + 1) % 4];
        return {
          id: `poly-line-${i}`,
          name: `Lado-${i}`,
          start,
          end,
          color: "blue",
          length: sizes[0],
          width: 0.02
        };
      });
      return { lines, points };
    }

    const baseDir = direction.clone().normalize();
    const p0 = center.clone().add(baseDir.clone().multiplyScalar(sizes[0] / 2));
    const p1 = p0.clone().add(
      baseDir.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2).setLength(sizes[1])
    );
    const p2 = p1.clone().add(
      baseDir.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI).setLength(sizes[2])
    );
    const p3 = p2.clone().add(
      baseDir.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), 3 * Math.PI / 2).setLength(sizes[3])
    );
    const points = [p0, p1, p2, p3];

    const lines = points.map((start, i) => {
      const end = points[(i + 1) % 4];
      return {
        id: `poly-line-${i}`,
        name: `Lado-${i}`,
        start,
        end,
        color: "blue",
        length: start.distanceTo(end),
        width: 0.02
      };
    });

    return { lines, points };
  }

  /**
   * Redimensiona una línea sumando snapSize/2 a cada extremo y actualiza las líneas contiguas.
   * @param lineId ID de la línea a redimensionar.
   * @param currentLines Array de líneas actuales.
   * @param newLength Nuevo largo.
   * @returns { updatedLines, newPoints } - Líneas y puntos actualizados.
   */
  resizeLineWithSnapAndUpdateNeighbors(
    lineId: string,
    currentLines: any[],
    newLength: number
  ) {
    const idx = currentLines.findIndex(l => l.id === lineId);
    if (idx === -1) return { updatedLines: currentLines, newPoints: [] };

    const n = currentLines.length;
    const line = currentLines[idx];

    const center = line.start.clone().add(line.end).multiplyScalar(0.5);
    const direction = line.end.clone().sub(line.start).normalize();

    const halfLength = newLength / 2;
    const newStart = center.clone().add(direction.clone().multiplyScalar(-halfLength));
    const newEnd = center.clone().add(direction.clone().multiplyScalar(halfLength));

    const newPoints = currentLines.map((l, i) => {
      if (i === idx) return newStart;
      if (i === (idx + 1) % n) return newEnd;
      return l.start.clone();
    });

    const updatedLines = currentLines.map((l, i) => {
      const start = newPoints[i];
      const end = newPoints[(i + 1) % n];
      return {
        ...l,
        start,
        end,
        length: start.distanceTo(end),
      };
    });

    return { updatedLines, newPoints };
  }

  /**
   * Genera líneas conectando todos los puntos, cerrando el polígono.
   * @param points Array de puntos (THREE.Vector3).
   * @returns Array de líneas conectadas.
   */
  generatePolygonLines(points: any[]) {
    const closedPoints = [...points, points[0].clone()];
    const lines = [];
    for (let i = 0; i < closedPoints.length - 1; i++) {
      const start = closedPoints[i];
      const end = closedPoints[i + 1];
      lines.push({
        id: `line-${i}`,
        start,
        end,
        length: start.distanceTo(end),
      });
    }
    return lines;
  }
}