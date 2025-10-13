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

  static calcRBySegment(element: any, openings: any[]) {
    // Type guard for vertical walls

    debugger;
    if (element.start && element.end && typeof element.height !== 'undefined') {
        const wall = element;
        const { start, end, height } = wall;

        const openingsInFace = openings.filter((op: any) => op.wallIndex === wall.wallIndex);

        const dx = end.x - start.x;
        const dz = end.z - start.z;
        const wallLength = Math.sqrt(dx * dx + dz * dz);

        const minSegmentSize = 0.5;
        const numHorizontalSegments = Math.max(2, Math.ceil(wallLength / minSegmentSize));
        const numVerticalSegments = Math.max(2, Math.ceil(height / minSegmentSize));

        const positionedOpenings = openingsInFace.map((op: any) => {
            const relPos = op.position ?? 0.5;
            return {
                ...op,
                leftEdge: relPos - (op.width / 2) / wallLength,
                rightEdge: relPos + (op.width / 2) / wallLength,
                bottomEdge: (op.bottomOffset ?? 0) / height,
                topEdge: ((op.bottomOffset ?? 0) + op.height) / height
            };
        });

        const horizontalDivisions = new Set<number>([0, 1]);
        for (let i = 1; i < numHorizontalSegments; i++) {
            horizontalDivisions.add(i / numHorizontalSegments);
        }
        positionedOpenings.forEach(op => {
            horizontalDivisions.add(Math.max(0, Math.min(1, op.leftEdge)));
            horizontalDivisions.add(Math.max(0, Math.min(1, op.rightEdge)));
        });
        const sortedHorizontalDivisions = Array.from(horizontalDivisions).sort((a, b) => a - b);

        const verticalDivisions = new Set<number>([0, 1]);
        for (let i = 1; i < numVerticalSegments; i++) {
            verticalDivisions.add(i / numVerticalSegments);
        }
        positionedOpenings.forEach(op => {
            verticalDivisions.add(Math.max(0, Math.min(1, op.bottomEdge)));
            verticalDivisions.add(Math.max(0, Math.min(1, op.topEdge)));
        });
        const sortedVerticalDivisions = Array.from(verticalDivisions).sort((a, b) => a - b);

        const segments: any[] = [];
        let segmentIndex = 0;

        for (let h = 0; h < sortedHorizontalDivisions.length - 1; h++) {
            const hStart = sortedHorizontalDivisions[h];
            const hEnd = sortedHorizontalDivisions[h + 1];
            const segmentLength = (hEnd - hStart) * wallLength;

            for (let v = 0; v < sortedVerticalDivisions.length - 1; v++) {
                const vStart = sortedVerticalDivisions[v];
                const vEnd = sortedVerticalDivisions[v + 1];
                const segmentHeight = (vEnd - vStart) * height;
                const segmentArea = segmentLength * segmentHeight;

                const openingsInSegment = positionedOpenings.filter(op => {
                    const horizontalOverlap = op.leftEdge < hEnd && op.rightEdge > hStart;
                    const verticalOverlap = op.bottomEdge < vEnd && op.topEdge > vStart;
                    return horizontalOverlap && verticalOverlap;
                });

                const elements: any[] = [];
                if (openingsInSegment.length > 0) {
                    let totalOpeningArea = 0;
                    openingsInSegment.forEach(op => {
                        const overlapHStart = Math.max(hStart, op.leftEdge);
                        const overlapHEnd = Math.min(hEnd, op.rightEdge);
                        const overlapVStart = Math.max(vStart, op.bottomEdge);
                        const overlapVEnd = Math.min(vEnd, op.topEdge);
                        const overlapLength = (overlapHEnd - overlapHStart) * wallLength;
                        const overlapHeight = (overlapVEnd - overlapVStart) * height;
                        const overlapArea = overlapLength * overlapHeight;
                        totalOpeningArea += overlapArea;
                        elements.push({ type: op.type, id: op.id, title: op.title, area: overlapArea, template: op.template, currentCondition: op.currentCondition });
                    });
                    const wallAreaInSegment = segmentArea - totalOpeningArea;
                    if (wallAreaInSegment > 0.001) {
                        elements.push({ type: 'wall', area: wallAreaInSegment, material: wall.material || 'default' });
                    }
                } else {
                    elements.push({ type: 'wall', area: segmentArea, material: wall.material || 'default' });
                }

                segments.push({
                    wallIndex: wall.wallIndex,
                    segmentIndex: segmentIndex++,
                    startPosH: hStart,
                    endPosH: hEnd,
                    startPosV: vStart,
                    endPosV: vEnd,
                    length: segmentLength,
                    height: segmentHeight,
                    totalArea: segmentArea,
                    elements: elements,
                    center: { x: start.x + dx * ((hStart + hEnd) / 2), y: height * ((vStart + vEnd) / 2), z: start.z + dz * ((hStart + hEnd) / 2) },
                    corners: {
                        bottomLeft: { x: start.x + dx * hStart, y: height * vStart, z: start.z + dz * hStart },
                        bottomRight: { x: start.x + dx * hEnd, y: height * vStart, z: start.z + dz * hEnd },
                        topLeft: { x: start.x + dx * hStart, y: height * vEnd, z: start.z + dz * hStart },
                        topRight: { x: start.x + dx * hEnd, y: height * vEnd, z: start.z + dz * hEnd }
                    }
                });
            }
        }
        return segments;
    }

    // Type guard for horizontal surfaces
    else if (element.coordinates && typeof element.baseHeight !== 'undefined') {

      debugger;
        const surface = element;
        const { coordinates, baseHeight, type, material, id } = surface;

        if (!coordinates || coordinates.length < 3) {
            return [];
        }

        let openingsInFace: any[] = [];
        if (type === 'ceiling' && typeof surface.ceilingIndex !== 'undefined') {
            openingsInFace = openings.filter(op => op.ceilingIndex === surface.ceilingIndex);
        } else if (type === 'floor' && typeof surface.floorIndex !== 'undefined') {
            openingsInFace = openings.filter(op => op.floorIndex === surface.floorIndex);
        }

        const xs = coordinates.map((c: any) => c.x);
        const zs = coordinates.map((c: any) => c.z);
        const minX = Math.min(...xs);
        const maxX = Math.max(...xs);
        const minZ = Math.min(...zs);
        const maxZ = Math.max(...zs);

        const surfaceWidth = maxX - minX;
        const surfaceDepth = maxZ - minZ;
        const minSegmentSize = 0.5;
        const numHorizontalSegments = Math.max(2, Math.ceil(surfaceWidth / minSegmentSize));
        const numVerticalSegments = Math.max(2, Math.ceil(surfaceDepth / minSegmentSize));

        const positionedOpenings = openingsInFace.map((op: any) => {
            const opCenterX = op.x ?? (minX + surfaceWidth / 2);
            const opCenterZ = op.z ?? (minZ + surfaceDepth / 2);
            const opWidth = op.width ?? 1;
            const opDepth = op.depth ?? 1;

            return {
                ...op,
                leftEdge: (opCenterX - opWidth / 2 - minX) / surfaceWidth,
                rightEdge: (opCenterX + opWidth / 2 - minX) / surfaceWidth,
                bottomEdge: (opCenterZ - opDepth / 2 - minZ) / surfaceDepth,
                topEdge: (opCenterZ + opDepth / 2 - minZ) / surfaceDepth,
            };
        });

        const horizontalDivisions = new Set<number>([0, 1]);
        for (let i = 1; i < numHorizontalSegments; i++) {
            horizontalDivisions.add(i / numHorizontalSegments);
        }
        positionedOpenings.forEach(op => {
            horizontalDivisions.add(Math.max(0, Math.min(1, op.leftEdge)));
            horizontalDivisions.add(Math.max(0, Math.min(1, op.rightEdge)));
        });
        const sortedHorizontalDivisions = Array.from(horizontalDivisions).sort((a, b) => a - b);

        const verticalDivisions = new Set<number>([0, 1]);
        for (let i = 1; i < numVerticalSegments; i++) {
            verticalDivisions.add(i / numVerticalSegments);
        }
        positionedOpenings.forEach(op => {
            verticalDivisions.add(Math.max(0, Math.min(1, op.bottomEdge)));
            verticalDivisions.add(Math.max(0, Math.min(1, op.topEdge)));
        });
        const sortedVerticalDivisions = Array.from(verticalDivisions).sort((a, b) => a - b);

        const segments: any[] = [];
        let segmentIndex = 0;

        for (let h = 0; h < sortedHorizontalDivisions.length - 1; h++) {
            const hStart = sortedHorizontalDivisions[h];
            const hEnd = sortedHorizontalDivisions[h + 1];
            const segmentWidth = (hEnd - hStart) * surfaceWidth;

            for (let v = 0; v < sortedVerticalDivisions.length - 1; v++) {
                const vStart = sortedVerticalDivisions[v];
                const vEnd = sortedVerticalDivisions[v + 1];
                const segmentDepth = (vEnd - vStart) * surfaceDepth;
                const segmentArea = segmentWidth * segmentDepth;
                const centerX = minX + ((hStart + hEnd) / 2) * surfaceWidth;
                const centerZ = minZ + ((vStart + vEnd) / 2) * surfaceDepth;

                if (!ISO12354_4Engine.pointInPolygon({ x: centerX, z: centerZ }, coordinates)) {
                    continue;
                }

                const openingsInSegment = positionedOpenings.filter(op => {
                    const horizontalOverlap = op.leftEdge < hEnd && op.rightEdge > hStart;
                    const verticalOverlap = op.bottomEdge < vEnd && op.topEdge > vStart;
                    return horizontalOverlap && verticalOverlap;
                });

                const elements: any[] = [];
                if (openingsInSegment.length > 0) {
                    let totalOpeningArea = 0;
                    openingsInSegment.forEach(op => {
                        const overlapHStart = Math.max(hStart, op.leftEdge);
                        const overlapHEnd = Math.min(hEnd, op.rightEdge);
                        const overlapVStart = Math.max(vStart, op.bottomEdge);
                        const overlapVEnd = Math.min(vEnd, op.topEdge);
                        const overlapWidth = (overlapHEnd - overlapHStart) * surfaceWidth;
                        const overlapDepth = (overlapVEnd - overlapVStart) * surfaceDepth;
                        const overlapArea = overlapWidth * overlapDepth;
                        totalOpeningArea += overlapArea;
                        elements.push({ type: op.type, id: op.id, title: op.title, area: overlapArea, template: op.template, currentCondition: op.currentCondition });
                    });
                    const surfaceAreaInSegment = segmentArea - totalOpeningArea;
                    if (surfaceAreaInSegment > 0.001) {
                        elements.push({ type: surface.type, area: surfaceAreaInSegment, material: surface.material || 'default' });
                    }
                } else {
                    elements.push({ type: surface.type, area: segmentArea, material: surface.material || 'default' });
                }

                const x1 = minX + hStart * surfaceWidth;
                const x2 = minX + hEnd * surfaceWidth;
                const z1 = minZ + vStart * surfaceDepth;
                const z2 = minZ + vEnd * surfaceDepth;

                const newSegment: any = {
                    segmentIndex: segmentIndex++,
                    startPosH: hStart,
                    endPosH: hEnd,
                    startPosV: vStart,
                    endPosV: vEnd,
                    length: segmentWidth,
                    height: segmentDepth,
                    totalArea: segmentArea,
                    elements: elements,
                    center: { x: centerX, y: baseHeight, z: centerZ },
                    corners: {
                        bottomLeft: { x: x1, y: baseHeight, z: z1 },
                        bottomRight: { x: x2, y: baseHeight, z: z1 },
                        topLeft: { x: x1, y: baseHeight, z: z2 },
                        topRight: { x: x2, y: baseHeight, z: z2 }
                    }
                };


                if (type === 'ceiling') {
                    newSegment.ceilingIndex = surface.ceilingIndex;
                } else if (type === 'floor') {
                    newSegment.floorIndex = surface.floorIndex;
                }

                segments.push(newSegment);
            }
        }
        return segments;
    }
    else {
        console.warn("calcRBySegment: Could not determine element type.", element);
        return [];
    }
  }

  /**
   * Checks if a point is inside a polygon using the ray-casting algorithm.
   * @param point The point to check {x, z}.
   * @param polygon An array of vertices [{x, z}, ...].
   * @returns True if the point is inside the polygon.
   */
  static pointInPolygon(point: { x: number; z: number }, polygon: Array<{ x: number; z: number }>): boolean {
    let isInside = false;
    // The polygon needs to be closed, so we assume the last point connects to the first.
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const xi = polygon[i].x, zi = polygon[i].z;
        const xj = polygon[j].x, zj = polygon[j].z;

        const intersect = ((zi > point.z) !== (zj > point.z))
            && (point.x < (xj - xi) * (point.z - zi) / (zj - zi) + xi);
        if (intersect) isInside = !isInside;
    }
    return isInside;
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

  /**
   * Calcula el índice de reducción acústica aparente de un segmento compuesto.
   * @param elements Elementos que componen el segmento (muro, ventanas, etc.).
   * @param materialsData Catálogo de materiales con sus propiedades acústicas.
   * @returns El índice de reducción R' por banda de frecuencia.
   */
  static calcSegmentR(elements: any[], materialsData: any): Record<ThirdOctave, number> {
    const totalArea = elements.reduce((sum, el) => sum + el.area, 0);

    if (totalArea === 0) {
      return {};
    }

    // Find a representative material to get the frequency bands from
    const firstElementWithMaterial = elements.find(el => {
      const materialId = el.material || el.template;
      return materialsData[materialId];
    });

    if (!firstElementWithMaterial) {
      console.error("No valid materials found for elements in segment.");
      return {};
    }
    
    const materialId = firstElementWithMaterial.material || firstElementWithMaterial.template;
    const referenceBands = materialsData[materialId].thirdOctaveBands;
    const frequencies = Object.keys(referenceBands).map(Number) as ThirdOctave[];

    const compositeR: Record<ThirdOctave, number> = {} as any;

    for (const freq of frequencies) {
      let transmissionFactorSum = 0;

      for (const element of elements) {
        const elementMaterialId = element.material || element.template;
        const material = materialsData[elementMaterialId];

        if (!material || !material.thirdOctaveBands || typeof material.thirdOctaveBands[freq] === 'undefined') {
          // If a material or its R value for the band is missing, treat it as a hole (R=0)
          // A transmission factor of 1 (10^(-0/10)) means full transmission.
          transmissionFactorSum += element.area * 1; 
          continue;
        }

        const R_i = material.thirdOctaveBands[freq];
        const transmissionFactor = Math.pow(10, -R_i / 10);
        transmissionFactorSum += element.area * transmissionFactor;
      }

      const averageTransmissionFactor = transmissionFactorSum / totalArea;
      
      if (averageTransmissionFactor > 0) {
        compositeR[freq] = -10 * Math.log10(averageTransmissionFactor);
      } else {
        // Avoid log(0) - theoretically means infinite insulation
        compositeR[freq] = 999; // A very high R value
      }
    }

    return compositeR;
  }

  /**
   * Calcula la diferencia de nivel normalizada D_2m,nT para un segmento de fachada.
   * @param R_segment Índice de reducción acústica del segmento.
   * @param S_segment Área del segmento en m².
   * @param V_receiver Volumen del recinto receptor (exterior, teóricamente infinito).
   * @returns D_2m,nT por banda de frecuencia.
   */
  static calcD2mnT(R_segment: Record<ThirdOctave, number>, S_segment: number, V_receiver: number): Record<ThirdOctave, number> {
    // TODO: Implementar la fórmula D_2m,nT = R' + 10 * log10(A_0 * T_0 / (S_segment * 0.16 * V_receiver))
    // Esta fórmula es compleja para exterior, se simplificará.
    console.log("TODO: Implementar calcD2mnT");
    return {}; // Placeholder
  }

  /**
   * Función principal para calcular el aislamiento acústico de una fachada según ISO 12354-4.
   * @param wall La pared a analizar.
   * @param openings Las aberturas en la pared.
   * @param materialsData Catálogo de todos los materiales disponibles.
   * @param roomData Datos del recinto emisor (volumen, tiempo de reverberación).
   * @returns Un objeto con los resultados del cálculo.
   */
  static calculateFacadeSoundInsulation(
    wall: any,
    openings: any[],
    materialsData: any,
    roomData: any
  ) {
    // 1. Discretizar la fachada en segmentos
    const segments = this.calcRBySegment(wall, openings);

    // 2. Para cada segmento, calcular su índice de reducción acústica combinado
    const segmentsWithR = segments.map(segment => {
      const R_segment = this.calcSegmentR(segment.elements, materialsData);
      return { ...segment, R_segment };
    });

    // 3. (Simplificación) Calcular un R' total para la fachada
    // En una implementación completa, se calcularía la contribución de cada segmento a un punto receptor.
    const totalArea = segments.reduce((sum, seg) => sum + seg.totalArea, 0);
    const totalR = this.calcSegmentR(
      segmentsWithR.flatMap(s => s.elements.map(e => ({...e, area: e.area}))),
      materialsData
    );


    // 4. Calcular la diferencia de nivel D_2m,nT
    // Aquí V_receiver es teóricamente infinito. Se usan simplificaciones.
    // Por ahora, devolvemos los datos intermedios.
    
    console.log("Cálculo de aislamiento de fachada completado (versión simplificada).");

    return {
      totalFacadeR: totalR,
      segments: segmentsWithR,
    };
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

