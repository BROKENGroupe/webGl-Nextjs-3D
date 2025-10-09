import { AcousticMaterial, ThirdOctave } from '@/modules/materials/types/AcousticMaterial';

/**
 * Clase base para cálculos acústicos según la norma ISO 12354-4.
 * Permite modelar la transmisión del sonido desde el interior hacia el exterior
 * a través de fachadas, puertas y ventanas, y calcular los niveles de presión sonora
 * en puntos exteriores (mapa de calor).
 * 
 * 
 */

export class ISO12354_4Engine {

  static calcRBySegment(wall: any, openings: any) {

    debugger;
    const openingsInFace = openings.filter((op: any) => op.wallIndex === wall.wallIndex);

    const { start, end, height } = wall;

    // Calcula dimensiones de la pared
    const dx = end.x - start.x;
    const dz = end.z - start.z;
    const wallLength = Math.sqrt(dx * dx + dz * dz);
    const totalWallArea = wallLength * height;

    // Define el tamaño mínimo de segmento según ISO 12354-4
    // Típicamente se recomienda segmentos de aproximadamente 0.5m - 1m
    const minSegmentSize = 0.5; // metros

    // Calcula número de segmentos basado en las dimensiones de la pared
    const numHorizontalSegments = Math.max(2, Math.ceil(wallLength / minSegmentSize));
    const numVerticalSegments = Math.max(2, Math.ceil(height / minSegmentSize));

    // Calcula posiciones relativas y añade coordenadas 3D a los openings
    const positionedOpenings = openingsInFace.map((op: any) => {

      debugger;

      const relPos = op.position ?? 0.5;
      const x = start.x + dx * relPos;
      const z = start.z + dz * relPos;
      const y = (op.bottomOffset ?? 0) + (op.height ?? 0) / 2;

      return {
        ...op,
        relativePosition: { x, y, z },
        // Posiciones horizontales en la pared (0 a 1)
        leftEdge: relPos - (op.width / 2) / wallLength,
        rightEdge: relPos + (op.width / 2) / wallLength,
        // Posiciones verticales (0 = suelo, 1 = techo)
        bottomEdge: (op.bottomOffset ?? 0) / height,
        topEdge: ((op.bottomOffset ?? 0) + op.height) / height
      };
    });
    debugger;

    // Recolecta todos los puntos de división horizontal
    const horizontalDivisions = new Set<number>([0, 1]);

    // Añade divisiones uniformes base
    for (let i = 1; i < numHorizontalSegments; i++) {
      debugger;

      horizontalDivisions.add(i / numHorizontalSegments);
    }

    // Añade divisiones de los openings
    positionedOpenings.forEach(op => {
      debugger;

      horizontalDivisions.add(Math.max(0, Math.min(1, op.leftEdge)));
      horizontalDivisions.add(Math.max(0, Math.min(1, op.rightEdge)));
    });
    debugger;

    const sortedHorizontalDivisions = Array.from(horizontalDivisions).sort((a, b) => a - b);

    // Recolecta todos los puntos de división vertical
    const verticalDivisions = new Set<number>([0, 1]);
    debugger;

    // Añade divisiones uniformes base
    for (let i = 1; i < numVerticalSegments; i++) {
      verticalDivisions.add(i / numVerticalSegments);
    }

    // Añade divisiones de los openings
    positionedOpenings.forEach(op => {
      verticalDivisions.add(Math.max(0, Math.min(1, op.bottomEdge)));
      verticalDivisions.add(Math.max(0, Math.min(1, op.topEdge)));
    });

    const sortedVerticalDivisions = Array.from(verticalDivisions).sort((a, b) => a - b);

    // Crea una matriz de segmentos (horizontal x vertical)
    const segments: any[] = [];
    let segmentIndex = 0;

    for (let h = 0; h < sortedHorizontalDivisions.length - 1; h++) {
      debugger;

      const hStart = sortedHorizontalDivisions[h];
      const hEnd = sortedHorizontalDivisions[h + 1];
      const segmentLength = (hEnd - hStart) * wallLength;

      for (let v = 0; v < sortedVerticalDivisions.length - 1; v++) {
        debugger;

        const vStart = sortedVerticalDivisions[v];
        const vEnd = sortedVerticalDivisions[v + 1];
        const segmentHeight = (vEnd - vStart) * height;
        const segmentArea = segmentLength * segmentHeight;

        // Encuentra qué opening(s) ocupan este segmento
        const openingsInSegment = positionedOpenings.filter(op => {
          const horizontalOverlap = op.leftEdge < hEnd && op.rightEdge > hStart;
          const verticalOverlap = op.bottomEdge < vEnd && op.topEdge > vStart;
          return horizontalOverlap && verticalOverlap;
        });

        const elements: any[] = [];

        if (openingsInSegment.length > 0) {
          // Hay opening(s) en este segmento
          let totalOpeningArea = 0;

          openingsInSegment.forEach(op => {
            // Calcula el área de intersección
            const overlapHStart = Math.max(hStart, op.leftEdge);
            const overlapHEnd = Math.min(hEnd, op.rightEdge);
            const overlapVStart = Math.max(vStart, op.bottomEdge);
            const overlapVEnd = Math.min(vEnd, op.topEdge);

            const overlapLength = (overlapHEnd - overlapHStart) * wallLength;
            const overlapHeight = (overlapVEnd - overlapVStart) * height;
            const overlapArea = overlapLength * overlapHeight;

            totalOpeningArea += overlapArea;

            elements.push({
              type: op.type,
              id: op.id,
              title: op.title,
              area: overlapArea,
              template: op.template,
              currentCondition: op.currentCondition
            });
          });

          // El resto del segmento es pared
          const wallAreaInSegment = segmentArea - totalOpeningArea;
          if (wallAreaInSegment > 0.001) { // Tolerancia para errores numéricos
            elements.push({
              type: 'wall',
              area: wallAreaInSegment,
              material: wall.material || 'default'
            });
          }
        } else {
          // No hay openings, todo el segmento es pared
          elements.push({
            type: 'wall',
            area: segmentArea,
            material: wall.material || 'default'
          });
        }

        segments.push({
          wallIndex: wall.wallIndex,
          segmentIndex: segmentIndex++,
          // Posición horizontal (0 a 1)
          startPosH: hStart,
          endPosH: hEnd,
          // Posición vertical (0 a 1)
          startPosV: vStart,
          endPosV: vEnd,
          // Dimensiones físicas
          length: segmentLength,
          height: segmentHeight,
          totalArea: segmentArea,
          // Elementos que componen el segmento
          elements: elements,
          // Centro del segmento en coordenadas 3D
          center: {
            x: start.x + dx * ((hStart + hEnd) / 2),
            y: height * ((vStart + vEnd) / 2),
            z: start.z + dz * ((hStart + hEnd) / 2)
          },
          // Coordenadas 3D de las 4 esquinas del segmento
          corners: {
            bottomLeft: { x: start.x + dx * hStart, y: height * vStart, z: start.z + dz * hStart },
            bottomRight: { x: start.x + dx * hEnd, y: height * vStart, z: start.z + dz * hEnd },
            topLeft: { x: start.x + dx * hStart, y: height * vEnd, z: start.z + dz * hStart },
            topRight: { x: start.x + dx * hEnd, y: height * vEnd, z: start.z + dz * hEnd }
          }
        });
      }
    }

    console.log('Wall dimensions:', { length: wallLength.toFixed(2), height: height.toFixed(2) });
    console.log('Segmentation grid:', { horizontal: sortedHorizontalDivisions.length - 1, vertical: sortedVerticalDivisions.length - 1 });
    console.log('Total segments created:', segments.length);
    console.log('Segments:', segments);

    // Verificación: la suma de áreas debe ser igual al área total
    const totalCalculatedArea = segments.reduce((sum, seg) => sum + seg.totalArea, 0);
    console.log('Total wall area:', totalWallArea.toFixed(4));
    console.log('Sum of segment areas:', totalCalculatedArea.toFixed(4));
    console.log('Difference:', Math.abs(totalWallArea - totalCalculatedArea).toFixed(6));

    return segments;
  }



  /**
   * Calcula el área de absorción equivalente (A) en m² sabins.
   * @param V Volumen del recinto (m³)
   * @param T60 Tiempo de reverberación por banda (s)
   * @returns Absorción equivalente por banda { [bandHz]: sabins }
   */
  static calcAbsorption(V: number, T60: Record<string, number>): Record<string, number> {
    const A: Record<string, number> = {};
    for (const f in T60) {
      A[f] = 0.16 * V / T60[f];
    }
    return A;
  }

  /**
   * Calcula el nivel medio de presión sonora interior (Lp_in) por banda.
   * @param Lw Potencia sonora de la fuente por banda (dB)
   * @param A Absorción equivalente por banda (sabins)
   * @returns Nivel de presión sonora interior por banda { [bandHz]: dB }
   */
  static calcLpInside(Lw: Record<string, number>, A: Record<string, number>): Record<string, number> {
    const Lp: Record<string, number> = {};
    for (const f in Lw) {
      Lp[f] = Lw[f] + 10 * Math.log10(4 / A[f]);
    }
    return Lp;
  }

  /**
   * Calcula la potencia transmitida por cada elemento de fachada (puerta, ventana, muro).
   * @param LpIn Nivel de presión sonora interior por banda (dB)
   * @param element Elemento con área y R por banda
   * @param A Absorción equivalente por banda (sabins)
   * @param delta Corrección adicional (dB)
   * @returns Potencia transmitida por banda { [bandHz]: dB }
   */
  static calcLWoutPerElement(
    LpIn: Record<string, number>,
    element: { area: number; R: Record<string, number> },
    A: Record<string, number>,
    delta = 0
  ): Record<string, number> {
    const LW: Record<string, number> = {};
    for (const f in LpIn) {
      LW[f] = LpIn[f] + 10 * Math.log10(element.area / A[f]) - element.R[f] + delta;
    }
    return LW;
  }

  /**
   * Calcula el nivel de presión sonora en un punto exterior, sumando la contribución de todos los elementos.
   * Incluye atenuación geométrica, directividad y corrección de suelo.
   * @param point Coordenadas del punto receptor [x, y, z]
   * @param elements Elementos con LWout, posición y normal
   * @param opts Opciones físicas (directividad, corrección de suelo)
   * @returns Nivel de presión sonora por banda { [bandHz]: dB }
   */
  static calcLpAtPointFromElements(
    point: [number, number, number],
    elements: Array<{
      LWout: Record<string, number>;
      position: [number, number, number] | number[];
      normal: [number, number, number];
    }>,
    opts: { directivityN?: number; ground?: Record<string, number> } = {}
  ): Record<string, number> {
    const sum: Record<string, number> = {};
    for (const e of elements) {
      // Asegura que position y normal sean tuplas de 3 elementos
      const pos = Array.isArray(e.position) ? ISO12354_4Engine.toTuple3(e.position) : e.position;
      const norm = Array.isArray(e.normal) ? ISO12354_4Engine.toTuple3(e.normal) : e.normal;
      const pt = Array.isArray(point) ? ISO12354_4Engine.toTuple3(point) : point;

      const r = ISO12354_4Engine.distance(pt, pos);

      const theta = ISO12354_4Engine.angleBetween(
        ISO12354_4Engine.normalize(e.normal),
        ISO12354_4Engine.normalize(ISO12354_4Engine.sub(pt, pos))
      );
      const Q = Math.max(0.0001, Math.pow(Math.cos(theta), opts.directivityN || 1));
      for (const f in e.LWout) {
        const Lp =
          e.LWout[f] -
          (20 * Math.log10(r) + 11) -
          (-10 * Math.log10(Q)) -
          (opts.ground?.[f] || 0);
        sum[f] = (sum[f] || 0) + Math.pow(10, Lp / 10);
      }
    }
    const LpSpec: Record<string, number> = {};
    for (const f in sum) LpSpec[f] = 10 * Math.log10(sum[f]);
    return LpSpec;
  }

  /**
   * Integra espectralmente (A-pesado) el nivel de presión sonora.
   * @param spec Espectro por banda { [bandHz]: dB }
   * @param Aweight Corrección A-weighting por banda { [bandHz]: dB }
   * @returns Nivel A-pesado (dB)
   */
  static calcLAeq(spec: Record<string, number>, Aweight: Record<string, number>): number {
    let lin = 0;
    for (const f in spec) lin += Math.pow(10, (spec[f] + Aweight[f]) / 10);
    return 10 * Math.log10(lin);
  }

  /**
   * Atenuación geométrica en campo libre (en metros).
   * ISO 12354-4: Δr = 20*log10(r) + 11
   * @param r Distancia en metros
   * @returns Atenuación en dB
   */
  static freeFieldAttenuation(r: number): number {
    return 20 * Math.log10(r) + 11;
  }

  /**
   * Calcula la transmisión acústica por bandas ajustada por condición.
   * @param material Material acústico
   * @param condition Estado de la abertura o muro
   * @returns Transmisión por banda { [ThirdOctave]: dB }
   */
  static calcTransmissionLossBands(
    material: AcousticMaterial,
    condition: string
  ): Record<ThirdOctave, number> {
    const conditionFactors: Record<string, number> = {
      'closed_sealed': 1.0,
      'closed_unsealed': 0.7,
      'partially_open': 0.3,
      'fully_open': 0.1,
      'damaged': 0.5,
      'excellent': 1.0,
      'good': 0.95,
      'fair': 0.85,
      'poor': 0.70
    };
    const factor = conditionFactors[condition] ?? 0.8;
    const bands: Record<ThirdOctave, number> = {} as any;
    for (const bandStr of Object.keys(material.thirdOctaveBands)) {
      const band = Number(bandStr) as ThirdOctave;
      bands[band] = material.thirdOctaveBands[band] * factor;
    }
    return bands;
  }

  /**
   * Calcula el promedio de transmisión acústica en bandas clave.
   * @param bands Transmisión por banda { [ThirdOctave]: dB }
   * @param keys Bandas clave (por defecto [125, 500, 2000])
   * @returns Promedio de transmisión (dB)
   */
  static calcAverageTransmissionLoss(
    bands: Record<ThirdOctave, number>,
    keys: ThirdOctave[] = [125, 500, 2000]
  ): number {
    const values = keys.map(b => bands[b] ?? 0);
    return values.reduce((a, b) => a + b, 0) / values.length;
  }

  /**
   * Calcula la pérdida efectiva de transmisión acústica.
   * @param avgLoss Promedio de transmisión (dB)
   * @param areaReduction Penalización por área (dB)
   * @param openingsPenalty Penalización por aberturas adyacentes (dB)
   * @returns Pérdida efectiva (dB)
   */
  static calcEffectiveTransmissionLoss(
    avgLoss: number,
    areaReduction: number,
    openingsPenalty: number = 0
  ): number {
    return Math.max(avgLoss - areaReduction - openingsPenalty, 5);
  }

  /**
   * Calcula la penalización por área de abertura (ISO 12354-4).
   * @param openingArea Área de la abertura en m²
   * @returns Penalización en dB
   */
  static calcAreaReduction(openingArea: number): number {
    return Math.min(10 * Math.log10(openingArea), 20);
  }

  // --- Métodos auxiliares matemáticos ---
  static distance(a: [number, number, number], b: [number, number, number]) {
    return Math.sqrt(
      Math.pow(a[0] - b[0], 2) +
      Math.pow(a[1] - b[1], 2) +
      Math.pow(a[2] - b[2], 2)
    );
  }
  static sub(a: [number, number, number], b: [number, number, number]) {
    return [a[0] - b[0], a[1] - b[1], a[2] - b[2]] as [number, number, number];
  }
  static normalize(v: [number, number, number]): [number, number, number] {
    const len = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
    return len > 0 ? [v[0] / len, v[1] / len, v[2] / len] : [0, 0, 0];
  }
  static angleBetween(a: [number, number, number], b: [number, number, number]) {
    const dot =
      a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    const lenA = Math.sqrt(a[0] * a[0] + a[1] * a[1] + a[2] * a[2]);
    const lenB = Math.sqrt(b[0] * b[0] + b[1] * b[1] + b[2] * b[2]);
    return Math.acos(Math.max(-1, Math.min(1, dot / (lenA * lenB))));
  }

  // Ejemplo de conversión segura
  static toTuple3(arr: number[] | [number, number, number]): [number, number, number] {
    if (arr.length !== 3) throw new Error("Array must have exactly 3 elements");
    return [arr[0], arr[1], arr[2]];
  }
}

