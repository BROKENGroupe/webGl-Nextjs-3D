import { AcousticMaterial, ThirdOctave } from '@/modules/materials/types/AcousticMaterial';
import { FrequencyAnalysisResult } from './FrequencyAnalysis';
import * as THREE from 'three';
/**
 * Clase base para cálculos acústicos según la norma ISO 12354-4.
 * Permite modelar la transmisión del sonido desde el interior hacia el exterior
 * a través de fachadas, puertas y ventanas, y calcular los niveles de presión sonora
 * en puntos exteriores (mapa de calor).
 * 
 * 
 */

export class ISO12354_4Engine {

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



  // CALCULOS BASADOS EN LA NORMA ISO 12354-4 SEGMENTADOS






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

      const minSegmentSize = 3;
      const numHorizontalSegments = 3;
      // const numHorizontalSegments = Math.max(2, Math.ceil(wallLength / minSegmentSize));
      // const numVerticalSegments = Math.max(1, Math.ceil(height / minSegmentSize));
      const numVerticalSegments = 1;
      debugger;
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
      const sortedHorizontalDivisions = Array.from(horizontalDivisions).sort((a, b) => a - b);

      const verticalDivisions = new Set<number>([0, 1]);
      for (let i = 1; i < numVerticalSegments; i++) {
        verticalDivisions.add(i / numVerticalSegments);
      }
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
              elements.push({ type: op.type, id: op.id, title: op.title, area: overlapArea, template: op.template, material: op.template, currentCondition: op.currentCondition });
            });
            const wallAreaInSegment = segmentArea - totalOpeningArea;
            if (wallAreaInSegment > 0.001) {
              debugger;
              elements.push({ type: 'wall', area: wallAreaInSegment, material: wall.template || 'default' });
            }
          } else {
            elements.push({ type: 'wall', area: segmentArea, material: wall.template || 'default' });
          }

          const wallNormal = new THREE.Vector3(-dz, 0, dx).normalize();

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
            orientation: 'vertical',
            normal: { x: wallNormal.x, y: wallNormal.y, z: wallNormal.z },
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
      const sortedHorizontalDivisions = Array.from(horizontalDivisions).sort((a, b) => a - b);

      const verticalDivisions = new Set<number>([0, 1]);
      for (let i = 1; i < numVerticalSegments; i++) {
        verticalDivisions.add(i / numVerticalSegments);
      }
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
              elements.push({ type: op.type, id: op.id, title: op.title, area: overlapArea, template: op.template, material: op.template, currentCondition: op.currentCondition });
            });
            const surfaceAreaInSegment = segmentArea - totalOpeningArea;
            if (surfaceAreaInSegment > 0.001) {
              elements.push({ type: surface.type, area: surfaceAreaInSegment, material: surface.template || 'default' });
            }
          } else {
            elements.push({ type: surface.type, area: segmentArea, material: surface.template || 'default' });
          }

          const x1 = minX + hStart * surfaceWidth;
          const x2 = minX + hEnd * surfaceWidth;
          const z1 = minZ + vStart * surfaceDepth;
          const z2 = minZ + vEnd * surfaceDepth;

          const normal = type === 'ceiling' ? { x: 0, y: 1, z: 0 } : { x: 0, y: -1, z: 0 };

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
            orientation: 'horizontal',
            normal: normal,
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
   * Calculates the weighted sound reduction index (R) for a composite segment of building elements.
   * 
   * Uses the formula for composite transmission based on ISO 12354:
   * τ = Σ(Si * τi) / Stotal
   * where:
   * - τ is the transmission factor (τ = 10^(-R/10))
   * - Si is the area of each element
   * - Stotal is the total area
   * - R is the sound reduction index in dB
   * 
   * The transmission calculation for each element follows:
   * τi = 10^(-Ri/10) 
   * where Ri is the sound reduction index of element i
   * 
   * @param elements - Array of building elements with area and material/template properties
   * @param materialsData - Object containing acoustic data for materials including third octave band values
   * @returns Record of sound reduction indices (R) for each third octave band frequency
   * 
   * @throws Will log error if no valid materials are found for the elements
   */


  static calcSegmentR(elements: any[], freqType: string, frequencies: ThirdOctave[]): Record<ThirdOctave, number> {
    const totalArea = elements.reduce((sum, el) => sum + (el.area || 0), 0);

    const compositeR: Record<number, number> = {} as any;
    debugger
    for (const freq of frequencies) {
      let transmissionFactorSum = 0;

      for (const element of elements) {
        debugger
        const material = element.material || element.template || null;
        let R_i: number | undefined = undefined;

        if (freqType === 'third-octave') {
          R_i = material.thirdOctaveBands[freq];
        } else {
          R_i = material.octaveBands[freq];
        }
        // debugger
        if (typeof R_i === 'undefined' || R_i === null) {
          // hueco => transmisión completa
          transmissionFactorSum += (element.area || 0) * 1;
        } else {
          const tf = Math.pow(10, -Number(R_i) / 10);
          transmissionFactorSum += (element.area || 0) * tf;
        }
      }

      const averageTransmissionFactor = transmissionFactorSum / totalArea;
      // debugger
      if (averageTransmissionFactor > 0) {
        compositeR[freq] = -10 * Math.log10(averageTransmissionFactor);
      } else {
        compositeR[freq] = 999; // muy alto si transmisión es 0
      }
    }

    return compositeR as Record<ThirdOctave, number>;
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
    frequencies: FrequencyAnalysisResult,
    Lpint = 70
  ) {
    // 1. Discretizar la fachada en segmentos
    const segments = this.calcRBySegment(wall, openings);
    debugger;
    // 2. Para cada segmento, calcular su índice de reducción acústica combinado
    const segmentsWithR = segments.map(segment => {
      // debugger;
      const R_segment = this.calcSegmentR(segment.elements, frequencies.bandType, frequencies.frequencies);
      return { ...segment, R_segment };
    });
    // 3. Para cada segmento, calcular su Nivel de potencia acústica
    const segmentsWithLw = segmentsWithR.map(segment => {
      debugger
      const Lw_segment = this.calcLw(segment.R_segment, segment.totalArea, Lpint, frequencies.frequencies)
      return { ...segment, Lw_segment };
    })

    // 4.Con todas las potencias calculadas se hace la sumatoria 
    const Lw = this.calcLwTotal(segmentsWithLw, frequencies.frequencies)

//5. Calculo Lpext 

    return {
      totalFacadeR: [],
      segments: segmentsWithLw,
      Lw: Lw
    };

  }


  /**
  * Calculates the sound power level (Lw) radiated by a building element.
  * Lw = Lp_in - R + 10 * log10(S)
  * This is a simplified model. The full ISO 12354-4 is more complex.
  *
  * @param R_element - Sound reduction index of the element for each frequency band.
  * @param S_element - Area of the element in m².
  * @param Lp_in - Sound pressure level in the source room.
  * @returns The sound power level (Lw) for each frequency band.
  */
  static calcLw(
    R_element: Record<ThirdOctave, number>,
    S_element: number,
    Lp_in: number,
    frequencies: ThirdOctave[]
  ): Record<ThirdOctave, number> {
    const Lw: Record<ThirdOctave, number> = {} as any;
    debugger
    for (const freq of frequencies) {
      const R = R_element[freq];
      // Formula: Lw = Lp_in - R + 10 * log10(S)
      // This is a simplification. The standard is more complex and considers direct and reverberant fields.
      // For this simplified model, we assume the sound power radiated is related to the incident sound pressure level,
      // the element's sound reduction index, and its area.
      if (S_element > 0) {
        Lw[freq] = Lp_in - R + 10 * Math.log10(S_element);
      } else {
        Lw[freq] = -Infinity; // Or some other indicator of no sound power
      }
    }
    return Lw;
  }

  /**
   * Calculates the sound power level (Lw) radiated by a building element.
   * Lw = Lp_in - R + 10 * log10(S)
   * This is a simplified model. The full ISO 12354-4 is more complex.
   *
   * @param R_element - Sound reduction index of the element for each frequency band.
   * @param S_element - Area of the element in m².
   * @param Lp_in - Sound pressure level in the source room.
   * @returns The sound power level (Lw) for each frequency band.
   */
  static calcLwTotal(
    segments: any[],
    frequencies: ThirdOctave[]
  ): Record<ThirdOctave, number> {

    // const Lw_segment: Record<ThirdOctave, number>,
    const LwTotal: Record<ThirdOctave, number> = {} as any;
    // const frequencies = Object.keys(Lw_segment).map(Number) as ThirdOctave[];

    for (const freq of frequencies) {
      debugger
      let sumLw = 0;
      for (const segment of segments) {
        const Lw = segment.Lw_segment[freq];
        const factorElevation = Lw / 10;
        sumLw += Math.pow(10, factorElevation)
      }
      LwTotal[freq] = 10 * Math.log10(sumLw);
    }
    return LwTotal;
  }

  /**
   * Calculates the sound pressure level (Lp) at a certain distance from a source.
   * Assumes hemispherical free field radiation (e.g., from a facade).
   * Lp = Lw - 10 * log10(2 * pi * r^2)
   *
   * @param Lw - Sound power level of the source for each frequency band.
   * @param r - Distance from the source to the receiver in meters.
   * @returns The sound pressure level (Lp) at the receiver for each frequency band.
   */
  static calcLpExterior(
    Lw: Record<ThirdOctave, number>,
    r: number,
    frequencies: ThirdOctave[]
  ): Record<ThirdOctave, number> {
    const Lp: Record<ThirdOctave, number> = {} as any;
    // const frequencies = Object.keys(Lw).map(Number) as ThirdOctave[];

    for (const freq of frequencies) {
      if (r > 0) {
        const geometricDivergence = 10 * Math.log10(2 * Math.PI * r * r);
        Lp[freq] = Lw[freq] - geometricDivergence;
      } else {
        Lp[freq] = Infinity; // Or handle as an error, distance cannot be zero
      }
    }
    return Lp;
  }




}

