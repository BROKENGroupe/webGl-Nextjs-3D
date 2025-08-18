import { AcousticMaterial, ThirdOctave } from "@/types/AcousticMaterial";

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
  static normalize(v: [number, number, number]) : [number, number, number] {
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

