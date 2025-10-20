import * as THREE from "three";

/**
 * Motor avanzado para manipulación de líneas y polígonos regulares.
 */
export class LineAdvanceEngine {
  /** Tamaño visual máximo permitido para el cuadrado en modo limitado */
  static MAX_VISUAL_SIZE = 50;

  /**
   * Escala el largo visual de la línea según el límite visual.
   * @param input Valor real ingresado por el usuario.
   * @param limitVisualSize Si es true, limita el tamaño visual a MAX_VISUAL_SIZE.
   * @returns Largo visual a usar para la geometría.
   */
  static scaleLength(input: number, limitVisualSize: boolean): number {
    if (!limitVisualSize) return input;
    return input > LineAdvanceEngine.MAX_VISUAL_SIZE
      ? LineAdvanceEngine.MAX_VISUAL_SIZE
      : input;
  }

  /**
   * Genera los 4 puntos de un cuadrado alineado a una dirección y centrado en un punto.
   * @param center Centro del cuadrado.
   * @param size Tamaño del lado.
   * @param direction Dirección del primer lado (opcional, por defecto eje X).
   * @returns Array de 4 puntos (THREE.Vector3) en orden horario.
   */
  static getSquarePoints(center: THREE.Vector3, size: number, direction?: THREE.Vector3): THREE.Vector3[] {
    const half = size / 2;
    const basePoints = [
      new THREE.Vector3(-half, 0, -half),
      new THREE.Vector3(half, 0, -half),
      new THREE.Vector3(half, 0, half),
      new THREE.Vector3(-half, 0, half),
    ];
    let quaternion = new THREE.Quaternion();
    if (direction) {
      const baseDir = new THREE.Vector3(1, 0, 0);
      quaternion.setFromUnitVectors(baseDir, direction.clone().normalize());
    }
    return basePoints.map(p => p.applyQuaternion(quaternion).add(center));
  }

  /**
   * Extrae los 4 puntos únicos del polígono en orden horario.
   * @param currentLines Array de líneas del polígono.
   * @returns Array de 4 puntos únicos en orden.
   */
  static getOrderedSquarePoints(currentLines: any[]): THREE.Vector3[] {
    // Extrae todos los puntos
    const allPoints = [
      ...currentLines.map(l => l.start.toArray().join(",")),
      ...currentLines.map(l => l.end.toArray().join(","))
    ];
    // Cuenta ocurrencias para encontrar los vértices únicos
    const pointCounts = allPoints.reduce((acc, p) => {
      acc[p] = (acc[p] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    // Extrae los puntos únicos
    const uniquePoints = Object.keys(pointCounts)
      .filter(k => pointCounts[k] >= 1)
      .map(k => {
        const [x, y, z] = k.split(",").map(Number);
        return new THREE.Vector3(x, y, z);
      });

    // Ordena por ángulo respecto al centro (horario)
    const center = uniquePoints.reduce((acc, p) => acc.add(p), new THREE.Vector3()).multiplyScalar(1 / uniquePoints.length);
    uniquePoints.sort((a, b) => {
      const angleA = Math.atan2(a.z - center.z, a.x - center.x);
      const angleB = Math.atan2(b.z - center.z, b.x - center.x);
      return angleA - angleB;
    });

    return uniquePoints;
  }

  /**
   * Genera las líneas de un cuadrado a partir de los puntos y asigna el largo real.
   * @param currentLines Líneas actuales (para conservar id y propiedades).
   * @param squarePoints Puntos del cuadrado en orden.
   * @param realLength Largo real a asignar a cada línea.
   * @returns Array de líneas actualizadas.
   */
  static generateSquareLines(currentLines: any[], squarePoints: THREE.Vector3[], realLength: number) {
    return [
      { ...currentLines[0], start: squarePoints[0], end: squarePoints[1], length: realLength },
      { ...currentLines[1], start: squarePoints[1], end: squarePoints[2], length: realLength },
      { ...currentLines[2], start: squarePoints[2], end: squarePoints[3], length: realLength },
      { ...currentLines[3], start: squarePoints[3], end: squarePoints[0], length: realLength },
    ];
  }

  /**
   * Redimensiona todas las líneas proporcionalmente.
   */
  static resizeProportionally(currentLines: any[], originalLengths: number[], originalLineLength: number, newLength: number) {
    const factor = newLength / originalLineLength;
    return currentLines.map((l: any, idx: number) => {
      const origLen = originalLengths[idx];
      const scaledLen = origLen * factor;
      const start = l.start;
      const end = l.end;
      const center = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
      const direction = new THREE.Vector3().subVectors(end, start).normalize();
      const halfLength = scaledLen / 2;
      const newStart = new THREE.Vector3().addVectors(center, direction.clone().multiplyScalar(-halfLength));
      const newEnd = new THREE.Vector3().addVectors(center, direction.clone().multiplyScalar(halfLength));
      return {
        ...l,
        start: newStart,
        end: newEnd,
        length: scaledLen,
      };
    });
  }

  /**
   * Redimensiona solo una línea.
   */
  static resizeSingleLine(line: any, newLength: number) {
    const start = line.start;
    const end = line.end;
    const center = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
    const direction = new THREE.Vector3().subVectors(end, start).normalize();
    const halfLength = newLength / 2;
    const newStart = new THREE.Vector3().addVectors(center, direction.clone().multiplyScalar(-halfLength));
    const newEnd = new THREE.Vector3().addVectors(center, direction.clone().multiplyScalar(halfLength));
    return {
      ...line,
      start: newStart,
      end: newEnd,
      length: newLength,
    };
  }

  /**
   * Redimensiona una línea y devuelve los nuevos puntos (start, end) y la línea actualizada.
   */
  static resizeLineAndGetPoints(line: any, newLength: number) {
    const start = line.start;
    const end = line.end;
    const center = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
    const direction = new THREE.Vector3().subVectors(end, start).normalize();
    const halfLength = newLength / 2;
    const newStart = new THREE.Vector3().addVectors(center, direction.clone().multiplyScalar(-halfLength));
    const newEnd = new THREE.Vector3().addVectors(center, direction.clone().multiplyScalar(halfLength));
    return {
      updatedLine: {
        ...line,
        start: newStart,
        end: newEnd,
        length: newLength,
      },
      newPoints: [newStart, newEnd],
      distance: newLength
    };
  }

  /**
   * Redimensiona solo la línea seleccionada en el polígono, manteniendo las otras igual.
   * Devuelve las nuevas líneas y los nuevos puntos del polígono.
   * Solo para cuadriláteros (4 lados).
   */
  static resizePolygonWithOneLine(currentLines: any[], lineId: string, newLength: number) {
    if (currentLines.length !== 4) return null;

    // Encuentra el índice de la línea editada
    const lineIdx = currentLines.findIndex(l => l.id === lineId);
    if (lineIdx === -1) return null;

    // Copia los puntos originales en orden
    const orderedPoints = LineAdvanceEngine.getOrderedSquarePoints(currentLines);

    // Redimensiona solo la línea seleccionada
    const start = orderedPoints[lineIdx];
    const end = orderedPoints[(lineIdx + 1) % 4];
    const center = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
    const direction = new THREE.Vector3().subVectors(end, start).normalize();
    const halfLength = newLength / 2;
    const newStart = new THREE.Vector3().addVectors(center, direction.clone().multiplyScalar(-halfLength));
    const newEnd = new THREE.Vector3().addVectors(center, direction.clone().multiplyScalar(halfLength));

    // Actualiza los puntos del polígono
    const newPoints = [...orderedPoints];
    newPoints[lineIdx] = newStart;
    newPoints[(lineIdx + 1) % 4] = newEnd;

    // Genera las nuevas líneas
    const newLines = currentLines.map((l, idx) => {
      const nextIdx = (idx + 1) % 4;
      const length = idx === lineIdx ? newLength : newPoints[idx].distanceTo(newPoints[nextIdx]);
      return {
        ...l,
        start: newPoints[idx],
        end: newPoints[nextIdx],
        length,
      };
    });

    return { newLines, newPoints };
  }
}