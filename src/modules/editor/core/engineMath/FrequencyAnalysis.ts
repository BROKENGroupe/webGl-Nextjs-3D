import { ThirdOctave } from '@/modules/materials/types/AcousticMaterial';

/**
 * Tipo de banda de frecuencia que se usará en los cálculos
 */
export type FrequencyBandType = 'third-octave' | 'octave';

/**
 * Resultado de la determinación de frecuencias
 */
export interface FrequencyAnalysisResult {
  bandType: FrequencyBandType;
  frequencies: ThirdOctave[];
  elementsWithMissingData: Array<{
    type: string;
    id?: string;
    missingBandType: string;
  }>;
}

/**
 * Clase para gestionar la determinación y conversión de bandas de frecuencia
 * según la norma ISO 266 y ISO 12354-4.
 * 
 * Esta clase centraliza toda la lógica relacionada con:
 * - Determinación del tipo de banda a usar (tercio de octava u octava)
 * - Conversión entre tipos de banda
 * - Extracción y validación de datos de frecuencia
 * - Gestión de elementos con datos faltantes
 */
export class FrequencyBandManager {
  
  // Frecuencias estándar según ISO 266
  private static readonly THIRD_OCTAVE_FREQUENCIES: ThirdOctave[] = [
    50, 63, 80, 100, 125, 160, 200, 250, 315, 400, 500, 630, 800, 1000, 
    1250, 1600, 2000, 2500, 3150, 4000, 5000
  ];

  private static readonly OCTAVE_FREQUENCIES: ThirdOctave[] = [
    63, 125, 250, 500, 1000, 2000, 4000
  ];

  // Mapeo de frecuencias centrales de octava a sus tercios componentes según ISO 266
  private static readonly OCTAVE_TO_THIRD_MAPPING: Record<number, number[]> = {
    63: [50, 63, 80],
    125: [100, 125, 160],
    250: [200, 250, 315],
    500: [400, 500, 630],
    1000: [800, 1000, 1250],
    2000: [1600, 2000, 2500],
    4000: [3150, 4000, 5000]
  };

  /**
   * Obtiene las frecuencias estándar de tercio de octava
   */
  static getThirdOctaveFrequencies(): ThirdOctave[] {
    return [...this.THIRD_OCTAVE_FREQUENCIES];
  }

  /**
   * Obtiene las frecuencias estándar de octava
   */
  static getOctaveFrequencies(): ThirdOctave[] {
    return [...this.OCTAVE_FREQUENCIES];
  }

  /**
   * Convierte bandas de tercio de octava a bandas de octava según ISO 266.
   * Toma el promedio energético de las tres bandas de tercio que componen una octava.
   * 
   * Formula: R_octave = 10 * log10(1/3 * Σ(10^(R_third_i / 10)))
   * 
   * @param thirdOctaveBands - Objeto con valores de tercio de octava
   * @returns Objeto con valores de octava calculados
   */
  static convertThirdOctaveToOctave(
    thirdOctaveBands: Record<number, number>
  ): Record<number, number> {
    const octaveBands: Record<number, number> = {};

    for (const [octaveFreq, thirdFreqs] of Object.entries(this.OCTAVE_TO_THIRD_MAPPING)) {
      const octaveFreqNum = Number(octaveFreq);
      
      // Obtener los valores de las tres bandas de tercio
      const values = thirdFreqs
        .map(f => thirdOctaveBands[f])
        .filter(v => v !== undefined && v !== null && !isNaN(v));

      if (values.length === 0) {
        // Si no hay ningún valor disponible, no calculamos esta octava
        continue;
      }

      // Promedio energético: 10 * log10(mean(10^(Li/10)))
      const energySum = values.reduce((sum, val) => sum + Math.pow(10, val / 10), 0);
      const energyAvg = energySum / values.length;
      octaveBands[octaveFreqNum] = 10 * Math.log10(energyAvg);
    }

    return octaveBands;
  }

  /**
   * Verifica si un objeto de bandas tiene datos válidos (no todos en cero o vacíos)
   * 
   * @param bands - Objeto con bandas de frecuencia
   * @returns true si tiene al menos un valor válido diferente de cero
   */
  static hasValidBandData(bands: Record<number, number> | undefined | null): boolean {
    if (!bands || typeof bands !== 'object') return false;
    
    const values = Object.values(bands);
    if (values.length === 0) return false;
    
    // Verificar que al menos un valor sea diferente de 0
    return values.some(v => typeof v === 'number' && !isNaN(v) && v !== 0);
  }

  /**
   * Extrae y normaliza las bandas de frecuencia de un material
   * 
   * @param material - Material con propiedades acústicas
   * @returns Objeto con bandas de tercio de octava y octava (si existen)
   */
  static extractBands(material: any): {
    thirdOctave: Record<number, number> | null;
    octave: Record<number, number> | null;
  } {
    const result = {
      thirdOctave: null as Record<number, number> | null,
      octave: null as Record<number, number> | null
    };

    // Intentar extraer thirdOctaveBands
    if (material?.thirdOctaveBands && this.hasValidBandData(material.thirdOctaveBands)) {
      result.thirdOctave = { ...material.thirdOctaveBands };
    }

    // Intentar extraer octaveBands
    if (material?.octaveBands && this.hasValidBandData(material.octaveBands)) {
      result.octave = { ...material.octaveBands };
    }

    return result;
  }

  /**
   * Procesa un elemento individual y cuenta sus bandas disponibles
   * 
   * @param element - Elemento del modelo (pared, techo, piso, abertura)
   * @param elementType - Tipo de elemento para logging
   * @param counters - Objeto con contadores a actualizar
   * @param missingDataList - Array para registrar elementos con datos faltantes
   */
  private static processElement(
    element: any,
    elementType: string,
    counters: { thirdOctave: number; octave: number; total: number },
    missingDataList: Array<{ type: string; id?: string; missingBandType: string }>
  ): void {
    const material = element.material || element.template;
    if (!material) return;

    counters.total++;
    const bands = this.extractBands(material);

    if (bands.thirdOctave) {
      counters.thirdOctave++;
    } else if (bands.octave) {
      counters.octave++;
      // Si tiene octave pero no third, lo marcamos
      missingDataList.push({
        type: elementType,
        id: element.id,
        missingBandType: 'thirdOctave'
      });
    } else {
      // No tiene ninguna banda válida
      missingDataList.push({
        type: elementType,
        id: element.id,
        missingBandType: 'both'
      });
    }

    // Si tiene thirdOctave pero no octave, generar octave automáticamente
    if (bands.thirdOctave && !bands.octave && material) {
      material.octaveBands = this.convertThirdOctaveToOctave(bands.thirdOctave);
    }
  }

  /**
   * Analiza todos los elementos del modelo para determinar qué tipo de banda usar
   * y genera las bandas faltantes cuando sea necesario.
   * 
   * Esta es la función principal de la clase que debe ser llamada al inicio
   * de cualquier cálculo acústico.
   * 
   * @param walls - Array de paredes del modelo
   * @param ceilings - Array de techos del modelo
   * @param floors - Array de pisos del modelo
   * @param openings - Array de aberturas (puertas, ventanas) del modelo
   * @returns Resultado del análisis con el tipo de banda a usar y frecuencias
   */
  static determineFrequencyBands(
    walls: any[],
    ceilings: any[],
    floors: any[],
    openings: any[]
  ): FrequencyAnalysisResult {
    const elementsWithMissingData: Array<{
      type: string;
      id?: string;
      missingBandType: string;
    }> = [];

    // Contadores para determinar cuál banda usar
    const counters = {
      thirdOctave: 0,
      octave: 0,
      total: 0
    };

    // Procesar todos los elementos
    walls.forEach(wall => 
      this.processElement(wall, 'wall', counters, elementsWithMissingData)
    );
    ceilings.forEach(ceiling => 
      this.processElement(ceiling, 'ceiling', counters, elementsWithMissingData)
    );
    floors.forEach(floor => 
      this.processElement(floor, 'floor', counters, elementsWithMissingData)
    );
    openings.forEach(opening => 
      this.processElement(opening, 'opening', counters, elementsWithMissingData)
    );

    // Determinar qué tipo de banda usar
    // Prioridad: si la mayoría tiene thirdOctave, usar thirdOctave
    const useThirdOctave = counters.thirdOctave >= counters.octave;

    // Si decidimos usar thirdOctave pero algunos elementos solo tienen octave,
    // no podemos interpolar de octave a thirdOctave de manera precisa según ISO 266
    // Por lo tanto, si necesitamos thirdOctave y algún elemento solo tiene octave,
    // debemos usar octave en su lugar
    const hasOnlyOctave = counters.octave > 0 && counters.thirdOctave === 0;
    
    let finalBandType: FrequencyBandType;
    let finalFrequencies: ThirdOctave[];

    if (useThirdOctave && !hasOnlyOctave) {
      finalBandType = 'third-octave';
      finalFrequencies = this.THIRD_OCTAVE_FREQUENCIES;
    } else {
      finalBandType = 'octave';
      finalFrequencies = this.OCTAVE_FREQUENCIES;
      
      // Convertir todos los thirdOctave a octave si aún no se ha hecho
      const allElements = [...walls, ...ceilings, ...floors, ...openings];
      allElements.forEach(element => {
        const material = element.material || element.template;
        if (material?.thirdOctaveBands && !material.octaveBands) {
          material.octaveBands = this.convertThirdOctaveToOctave(material.thirdOctaveBands);
        }
      });
    }

    return {
      bandType: finalBandType,
      frequencies: finalFrequencies,
      elementsWithMissingData
    };
  }

  /**
   * Obtiene las bandas apropiadas de un material según el tipo de frecuencia determinado.
   * Esta función se debe usar en los cálculos para extraer los valores correctos.
   * 
   * @param material - Material del que extraer las bandas
   * @param bandType - Tipo de banda determinado por determineFrequencyBands
   * @returns Objeto con bandas de frecuencia o null si no hay datos
   */
  static getMaterialBands(
    material: any,
    bandType: FrequencyBandType
  ): Record<number, number> | null {
    if (!material) return null;

    const bands = this.extractBands(material);

    if (bandType === 'third-octave') {
      return bands.thirdOctave;
    } else {
      // Si necesitamos octave pero solo tenemos third, convertir
      if (bands.octave) {
        return bands.octave;
      } else if (bands.thirdOctave) {
        return this.convertThirdOctaveToOctave(bands.thirdOctave);
      }
    }

    return null;
  }

  /**
   * Valida que todos los elementos tengan los datos de frecuencia necesarios
   * 
   * @param elements - Array de elementos a validar
   * @param bandType - Tipo de banda requerido
   * @returns true si todos los elementos tienen datos válidos
   */
  static validateElementsBands(
    elements: any[],
    bandType: FrequencyBandType
  ): boolean {
    return elements.every(element => {
      const material = element.material || element.template;
      const bands = this.getMaterialBands(material, bandType);
      return bands !== null && this.hasValidBandData(bands);
    });
  }

  /**
   * Obtiene un resumen de los datos de frecuencia disponibles en el modelo
   * 
   * @param walls - Array de paredes
   * @param ceilings - Array de techos
   * @param floors - Array de pisos
   * @param openings - Array de aberturas
   * @returns Objeto con estadísticas de los datos disponibles
   */
  static getFrequencyDataSummary(
    walls: any[],
    ceilings: any[],
    floors: any[],
    openings: any[]
  ): {
    totalElements: number;
    withThirdOctave: number;
    withOctave: number;
    withBoth: number;
    withNone: number;
    percentageComplete: number;
  } {
    const counters = {
      total: 0,
      thirdOctave: 0,
      octave: 0,
      both: 0,
      none: 0
    };

    const allElements = [...walls, ...ceilings, ...floors, ...openings];
    
    allElements.forEach(element => {
      const material = element.material || element.template;
      if (!material) return;

      counters.total++;
      const bands = this.extractBands(material);

      if (bands.thirdOctave && bands.octave) {
        counters.both++;
      } else if (bands.thirdOctave) {
        counters.thirdOctave++;
      } else if (bands.octave) {
        counters.octave++;
      } else {
        counters.none++;
      }
    });

    const withData = counters.thirdOctave + counters.octave + counters.both;
    const percentageComplete = counters.total > 0 
      ? (withData / counters.total) * 100 
      : 0;

    return {
      totalElements: counters.total,
      withThirdOctave: counters.thirdOctave,
      withOctave: counters.octave,
      withBoth: counters.both,
      withNone: counters.none,
      percentageComplete
    };
  }

  /**
   * Prepara todos los materiales del modelo generando las bandas faltantes
   * Esta función debe llamarse una vez al cargar el modelo para asegurar
   * que todos los materiales tengan ambos tipos de banda disponibles.
   * 
   * @param walls - Array de paredes
   * @param ceilings - Array de techos
   * @param floors - Array de pisos
   * @param openings - Array de aberturas
   */
  static prepareMaterialsBands(
    walls: any[],
    ceilings: any[],
    floors: any[],
    openings: any[]
  ): void {
    const allElements = [...walls, ...ceilings, ...floors, ...openings];
    
    allElements.forEach(element => {
      const material = element.material || element.template;
      if (!material) return;

      const bands = this.extractBands(material);

      // Si tiene thirdOctave pero no octave, generar octave
      if (bands.thirdOctave && !bands.octave) {
        material.octaveBands = this.convertThirdOctaveToOctave(bands.thirdOctave);
      }
    });
  }
}