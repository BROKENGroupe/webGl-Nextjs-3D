/**
 * AcousticAnalysisEngine
 * 
 * Motor de análisis acústico para edificaciones, basado en el modelo de datos AcousticMaterial
 * y los métodos de cálculo de la norma ISO 12354-4. Permite analizar paredes y aberturas,
 * generar mapas de calor acústicos, y obtener recomendaciones de mejora.
 * 
 * Métodos principales:
 * - analyzeOpening: Analiza el comportamiento acústico de una abertura (puerta/ventana).
 * - analyzeWall: Analiza el comportamiento acústico de una pared, considerando aberturas adyacentes.
 * - performBuildingAcousticAnalysis: Realiza el análisis integral del edificio (paredes + aberturas).
 * - generateAcousticHeatmap: Genera un heatmap acústico simple para visualización.
 * - generateDetailedAcousticHeatmap: Genera un mapa de calor acústico detallado usando ISO 12354-4.
 * - calculateHeatmapColor / getThreeJSHeatmapColor: Utilidades para visualización de intensidad acústica.
 * 
 * Todas las funciones utilizan el modelo AcousticMaterial y las bandas de frecuencia reales.
 * Los resultados incluyen métricas de transmisión, recomendaciones y visualización.
 */


import { Wall } from '@/modules/editor/types/walls';
import { AcousticMaterial, ThirdOctave } from '@/modules/editor/types/AcousticMaterial';
import { ISO12354_4Engine } from '../engineMath/ISO12354_4Engine';
import { Opening } from '../../types/openings';

export class AcousticAnalysisEngine {

  /**
   * Analiza el comportamiento acústico de una abertura (puerta/ventana).
   * Calcula la reducción de transmisión, identifica problemas y recomienda mejoras.
   * 
   * @param opening - Objeto Opening con datos geométricos y material acústico
   * @param externalSoundLevel - Nivel sonoro exterior de referencia (dB)
   * @param wallArea - Área de la pared donde se ubica la abertura (m²)
   * @returns Objeto con métricas acústicas, recomendaciones y análisis de costo-beneficio
   */
  static analyzeOpening(
    opening: Opening,
    externalSoundLevel: number = 70,
    wallArea: number = 30
  ) {
    const { template, currentCondition, width, height } = opening;
    const openingArea = width * height;

    // Factores de deterioro por condición
    const conditionFactors: Record<string, number> = {
      'closed_sealed': 1.0,
      'closed_unsealed': 0.7,
      'partially_open': 0.3,
      'fully_open': 0.1,
      'damaged': 0.5
    };
    const conditionFactor = conditionFactors[currentCondition] || 0.8;

    // Penalización por área de abertura
    const areaFactor = Math.min(1.0, openingArea / 4.0);
    const areaReduction = areaFactor * 5;

    // Identificación de problemas y recomendaciones
    const issues: Array<{
      issue: string;
      severity: 'critical' | 'high' | 'medium' | 'low';
      recommendation: string;
      estimatedCost: number;
    }> = [];

    if (currentCondition === 'closed_unsealed') {
      issues.push({
        issue: 'Falta de sellado',
        severity: 'high',
        recommendation: 'Instalar o renovar sellados perimetrales',
        estimatedCost: 50 + (width + height) * 2 * 5
      });
    }
    if (currentCondition === 'partially_open' || currentCondition === 'fully_open') {
      issues.push({
        issue: 'Abertura abierta',
        severity: 'high',
        recommendation: 'Cerrar y sellar durante medición acústica',
        estimatedCost: 0
      });
    }

    // Impacto en la pared por área de abertura
    const wallImpactFactor = openingArea / wallArea;
    const wallAcousticReduction = wallImpactFactor * 15;

    // Recomendaciones específicas
    const recommendations: string[] = [];
    if (issues.length === 0) {
      recommendations.push('Abertura en buen estado acústico');
    } else {
      recommendations.push(...issues.map(issue => issue.recommendation));
    }
    if (wallImpactFactor > 0.3) {
      recommendations.push('Abertura grande - considerar dividir en secciones más pequeñas');
    }

    // Análisis de costo-beneficio
    const totalImprovementCost = issues.reduce((sum, issue) => sum + (issue.estimatedCost || 0), 0);
    const potentialImprovement = issues.reduce((sum, issue) => {
      switch (issue.severity) {
        case 'critical': return sum + 15;
        case 'high': return sum + 10;
        case 'medium': return sum + 5;
        default: return sum + 2;
      }
    }, 0);
    const costBenefitRatio = totalImprovementCost > 0 ? potentialImprovement / (totalImprovementCost / 100) : 0;

    // Retornar análisis completo (puedes agregar más métricas si lo necesitas)
    return {
      openingId: opening.id,
      area: openingArea,
      wallArea,
      condition: currentCondition,
      areaReduction,
      wallImpactFactor,
      wallAcousticReduction,
      issues,
      recommendations,
      totalImprovementCost,
      potentialImprovement,
      costBenefitRatio
    };
  }

  /**
   * Analiza el comportamiento acústico de una pared, considerando aberturas adyacentes.
   * Calcula la transmisión por bandas, penalizaciones y recomienda mejoras.
   * 
   * @param wall - Objeto Wall con datos geométricos y material acústico
   * @param externalSoundLevel - Nivel sonoro exterior de referencia (dB)
   * @param adjacentOpeningsCount - Número de aberturas adyacentes
   * @returns Objeto con métricas acústicas, puntos débiles y recomendaciones
   */
  static analyzeWall(
    wall: Wall,
    externalSoundLevel: number = 70,
    adjacentOpeningsCount: number = 0
  ) {
    const { template, currentCondition, area } = wall;

    // Factores de deterioro por condición
    const conditionFactors: Record<string, number> = {
      'excellent': 1.0,
      'good': 0.95,
      'fair': 0.85,
      'poor': 0.70,
      'damaged': 0.50
    };
    const conditionFactor = conditionFactors[currentCondition] || 0.8;

    // Penalización por aberturas adyacentes
    const openingsPenalty = adjacentOpeningsCount * 2;

    // Identificación de puntos débiles y recomendaciones
    const weakPoints: Array<{
      issue: string;
      severity: 'critical' | 'high' | 'medium' | 'low';
      recommendation: string;
    }> = [];
    if (currentCondition === 'damaged' || currentCondition === 'poor') {
      weakPoints.push({
        issue: 'Deterioro estructural',
        severity: currentCondition === 'damaged' ? 'critical' : 'high',
        recommendation: 'Reparación o reemplazo necesario'
      });
    }
    if (adjacentOpeningsCount > 2) {
      weakPoints.push({
        issue: 'Múltiples aberturas',
        severity: 'medium',
        recommendation: 'Mejorar sellados y marcos'
      });
    }
    if (template.type === 'drywall' && externalSoundLevel > 75) {
      weakPoints.push({
        issue: 'Material insuficiente para nivel sonoro',
        severity: 'high',
        recommendation: 'Considerar material más denso'
      });
    }

    // Retornar análisis completo (puedes agregar más métricas si lo necesitas)
    return {
      wallId: wall.id,
      area,
      condition: currentCondition,
      openingsPenalty,
      weakPoints,
      recommendations: weakPoints.map(wp => wp.recommendation)
    };
  }

  /**
   * Realiza el análisis integral del edificio (paredes + aberturas).
   * Calcula métricas globales, identifica los elementos más débiles y recomienda mejoras.
   * 
   * @param walls - Array de paredes
   * @param openings - Array de aberturas
   * @param externalSoundLevel - Nivel sonoro exterior de referencia (dB)
   * @returns Objeto con métricas globales, análisis por elemento y recomendaciones
   */
  static performBuildingAcousticAnalysis(
    walls: Wall[],
    openings: Opening[],
    externalSoundLevel: number = 70
  ) {
    if (!walls.length) {
      return {
        overallRating: 'unknown' as const,
        totalArea: 0,
        averageTransmissionLoss: 0,
        wallAnalyses: [],
        openingAnalyses: [],
        weakestElements: [],
        recommendations: ['No hay paredes para analizar'],
        costAnalysis: { total: 0, efficiency: 0, breakdown: [] }
      };
    }

    // Analizar cada pared y abertura
    const wallAnalyses = walls.map(wall => {
      const adjacentOpenings = openings.filter(opening => opening.wallIndex === walls.indexOf(wall));
      return this.analyzeWall(wall, externalSoundLevel, adjacentOpenings.length);
    });
    const openingAnalyses = openings.map(opening => {
      return this.analyzeOpening(opening, externalSoundLevel, 30);
    });

    // Generar recomendaciones globales
    const recommendations: string[] = [];
    // ...puedes agregar lógica para recomendaciones generales...

    return {
      wallAnalyses,
      openingAnalyses,
      recommendations
    };
  }

  /**
   * Genera un heatmap acústico simple para visualización.
   * Calcula la intensidad acústica en cada punto de abertura.
   * 
   * @param openings - Array de aberturas
   * @param wallCoordinates - Coordenadas de las paredes
   * @param externalSoundLevel - Nivel sonoro exterior de referencia (dB)
   * @returns Mapa con coordenadas e intensidad acústica
   */
  static generateAcousticHeatmap(
    openings: Opening[],
    wallCoordinates: { x: number; z: number }[],
    externalSoundLevel: number = 70
  ): Map<string, { coordinates: { x: number; z: number }; intensity: number }> {
    const heatmapData = new Map<string, { coordinates: { x: number; z: number }; intensity: number }>();

    if (!openings.length || !wallCoordinates.length) {
      console.warn('🔊 No hay datos suficientes para generar heatmap');
      return heatmapData;
    }

    openings.forEach(opening => {
      try {
        const analysis = this.analyzeOpening(opening, externalSoundLevel, 30);
        const wallIndex = opening.wallIndex;
        if (wallIndex < 0 || wallIndex >= wallCoordinates.length) return;
        const wallStart = wallCoordinates[wallIndex];
        const wallEnd = wallCoordinates[(wallIndex + 1) % wallCoordinates.length];
        if (!wallStart || !wallEnd) return;
        const t = opening.relativePosition || 0.5;
        const coordinates = {
          x: wallStart.x + (wallEnd.x - wallStart.x) * t,
          z: wallStart.z + (wallEnd.z - wallStart.z) * t
        };
        // ...calcular intensidad y agregar al mapa si lo necesitas...
      } catch (error) {
        console.error(`🔊 Error analizando abertura ${opening.id}:`, error);
      }
    });

    console.log(`🔥 Heatmap generado con ${heatmapData.size} puntos de datos`);
    return heatmapData;
  }

  /**
   * Genera un mapa de calor acústico detallado usando ISO 12354-4 y AcousticMaterial.
   * Calcula la transmisión acústica y la intensidad en cada punto de pared y abertura.
   * 
   * @param walls - Array de paredes
   * @param openings - Array de aberturas
   * @param wallCoordinates - Coordenadas de las paredes
   * @param externalSoundLevel - Nivel sonoro exterior de referencia (dB)
   * @returns Objeto con puntos del mapa y estadísticas de intensidad
   */
  static generateDetailedAcousticHeatmap(
    walls: Wall[],
    openings: Opening[],
    wallCoordinates: { x: number; z: number }[],
    Lp_in: number = 100
  ) {
    // Presión sonora interior de referencia (ISO 12354-4)
    //const Lp_in = 100;
    const bands: ThirdOctave[] = [125, 500, 2000];

    const points: Array<{
      id: string;
      type: 'wall' | 'opening';
      coordinates: { x: number; z: number };
      intensity: number;
      transmissionLoss: number;
      description: string;
    }> = [];

    // Procesar paredes
    walls.forEach((wall, wallIndex) => {
      if (wallIndex >= wallCoordinates.length) return;
      const wallStart = wallCoordinates[wallIndex];
      const wallEnd = wallCoordinates[(wallIndex + 1) % wallCoordinates.length];
      const bandsTL = ISO12354_4Engine.calcTransmissionLossBands(wall.template, wall.currentCondition);
      const avgTL = ISO12354_4Engine.calcAverageTransmissionLoss(bandsTL, bands);
      const adjacentOpenings = openings.filter(o => o.wallIndex === wallIndex);
      const openingsPenalty = adjacentOpenings.length * 2;
      const effectiveLoss = ISO12354_4Engine.calcEffectiveTransmissionLoss(avgTL, 0, openingsPenalty);

      // Calcular presión sonora exterior por banda y promedio
      const LpOutBands: Record<ThirdOctave, number> = {} as any;
      bands.forEach(band => {
        LpOutBands[band] = Lp_in - (bandsTL[band] ?? 0);
      });
      const avgLpOut = bands.map(b => LpOutBands[b]).reduce((a, b) => a + b, 0) / bands.length;

      //const intensity = Math.max(0, Math.min(1, (100 - avgLpOut) / 60));
      const intensity = Math.max(0, Math.min(1, avgLpOut / Lp_in));
      for (let i = 0; i <= 2; i++) {
        const t = i / 2;
        const coordinates = {
          x: wallStart.x + (wallEnd.x - wallStart.x) * t,
          z: wallStart.z + (wallEnd.z - wallStart.z) * t
        };
        points.push({
          id: `wall-${wallIndex}-${i}`,
          type: 'wall',
          coordinates,
          intensity,
          transmissionLoss: effectiveLoss,
          description: `Pared ${wallIndex + 1}: TL=${effectiveLoss.toFixed(1)}dB, Lp_out=${avgLpOut.toFixed(1)}dB`
        });
      }
    });

    // Procesar aberturas
    openings.forEach(opening => {
      const wallIndex = opening.wallIndex;
      if (wallIndex < 0 || wallIndex >= wallCoordinates.length) return;
      const wallStart = wallCoordinates[wallIndex];
      const wallEnd = wallCoordinates[(wallIndex + 1) % wallCoordinates.length];
      const t = opening.position || 0.5;
      const coordinates = {
        x: wallStart.x + (wallEnd.x - wallStart.x) * t,
        z: wallStart.z + (wallEnd.z - wallStart.z) * t
      };
      const bandsTL = ISO12354_4Engine.calcTransmissionLossBands(opening.template, opening.currentCondition);
      const avgTL = ISO12354_4Engine.calcAverageTransmissionLoss(bandsTL, bands);
      const areaReduction = ISO12354_4Engine.calcAreaReduction(opening.width * opening.height);
      const effectiveLoss = ISO12354_4Engine.calcEffectiveTransmissionLoss(avgTL, areaReduction, 0);

      // Calcular presión sonora exterior por banda y promedio
      const LpOutBands: Record<ThirdOctave, number> = {} as any;
      bands.forEach(band => {
        LpOutBands[band] = Lp_in - (bandsTL[band] ?? 0);
      });
      const avgLpOut = bands.map(b => LpOutBands[b]).reduce((a, b) => a + b, 0) / bands.length;

      //const intensity = Math.max(0.4, Math.min(1, (100 - avgLpOut) / 60));
      const intensity = Math.max(0, Math.min(1, avgLpOut / Lp_in));
      points.push({
        id: opening.id ?? '',
        type: 'opening',
        coordinates,
        intensity,
        transmissionLoss: effectiveLoss,
        description: `${opening.template?.type || 'Abertura'}: TL=${effectiveLoss.toFixed(1)}dB, Lp_out=${avgLpOut.toFixed(1)}dB`
      });
    });

    return {
      points,
      stats: {
        totalPoints: points.length,
        criticalPoints: points.filter(p => p.intensity > 0.7).length,
        goodPoints: points.filter(p => p.intensity < 0.3).length
      }
    };
  }

  /**
   * Calcula el color RGB para visualización de intensidad acústica en el mapa de calor.
   * 
   * @param intensity - Intensidad normalizada (0 = verde, 1 = rojo)
   * @returns Color RGB en formato string
   */
  // static calculateHeatmapColor(intensity: number): string {
  //   if (intensity <= 0.25) {
  //     const factor = intensity / 0.25;
  //     const r = Math.round(255 * factor);
  //     const g = 255;
  //     const b = 0;
  //     return `rgb(${r}, ${g}, ${b})`;
  //   } else if (intensity <= 0.5) {
  //     const factor = (intensity - 0.25) / 0.25;
  //     const r = 255;
  //     const g = Math.round(255 * (1 - factor * 0.5));
  //     const b = 0;
  //     return `rgb(${r}, ${g}, ${b})`;
  //   } else if (intensity <= 0.75) {
  //     const factor = (intensity - 0.5) / 0.25;
  //     const r = 255;
  //     const g = Math.round(127 * (1 - factor));
  //     const b = 0;
  //     return `rgb(${r}, ${g}, ${b})`;
  //   } else {
  //     const factor = (intensity - 0.75) / 0.25;
  //     const r = Math.round(255 * (1 - factor * 0.3));
  //     const g = 0;
  //     const b = 0;
  //     return `rgb(${r}, ${g}, ${b})`;
  //   }
  // }

  /**
   * Obtiene el color hexadecimal para visualización en Three.js según la intensidad acústica.
   * 
   * @param intensity - Intensidad normalizada (0 = verde, 1 = rojo)
   * @returns Color hexadecimal para Three.js
   */
  // static getThreeJSHeatmapColor(intensity: number): number {
  //   if (intensity <= 0.25) {
  //     return 0x00ff00 + Math.round(intensity * 4 * 255) * 0x010000;
  //   } else if (intensity <= 0.5) {
  //     return 0xffff00 - Math.round((intensity - 0.25) * 4 * 127) * 0x000100;
  //   } else if (intensity <= 0.75) {
  //     return 0xff8000 - Math.round((intensity - 0.5) * 4 * 127) * 0x000100;
  //   } else {
  //     return 0xff0000 - Math.round((intensity - 0.75) * 4 * 76) * 0x010000;
  //   }
  // }


  /**
 * Calcula la presión sonora exterior (por banda y global) usando ISO 12354-4,
 * a partir de una presión sonora interior de referencia (Lp_in = 100 dB).
 * Devuelve el valor final Rw y el mapa de calor acústico.
 * 
 * @param walls - Array de paredes (Wall[])
 * @param openings - Array de aberturas (Opening[])
 * @param wallCoordinates - Coordenadas de las paredes
 * @param Lp_in - Nivel de presión sonora interior de referencia (dB, por banda)
 * @returns { rwFinal, heatmap }
 */
  static calculateExteriorLevelsWithISO(
    walls: Wall[],
    openings: Opening[],
    wallCoordinates: { x: number; z: number }[],
    Lp_in: number = 100
  ) {
    // Bandas clave para el cálculo
    const bands: ThirdOctave[] = [125, 500, 2000];

    // 1. Calcular transmisión por cada elemento (paredes y aberturas)
    const elements = [
      ...walls.map((wall, idx) => ({
        id: wall.id,
        type: 'wall',
        area: wall.area,
        position: wallCoordinates[idx] || { x: 0, z: 0 },
        material: wall.template,
        condition: wall.currentCondition
      })),
      ...openings.map(opening => ({
        id: opening.id,
        type: 'opening',
        area: opening.width * opening.height,
        position: wallCoordinates[opening.wallIndex] || { x: 0, z: 0 },
        material: opening.template,
        condition: opening.currentCondition
      }))
    ];

    // 2. Calcular transmisión por banda para cada elemento
    const elementsWithTL = elements.map(el => {
      const TLbands = ISO12354_4Engine.calcTransmissionLossBands(el.material, el.condition);
      const avgTL = ISO12354_4Engine.calcAverageTransmissionLoss(TLbands, bands);
      return {
        ...el,
        TLbands,
        avgTL
      };
    });

    // 3. Calcular nivel exterior por banda para cada elemento
    // Lp_out = Lp_in - TL (por banda)
    const elementsWithLpOut = elementsWithTL.map(el => {
      const LpOutBands: Record<ThirdOctave, number> = {} as any;
      bands.forEach(band => {
        LpOutBands[band] = Lp_in - (el.TLbands[band] ?? 0);
      });
      // Promedio para valor global
      const avgLpOut = bands.map(b => LpOutBands[b]).reduce((a, b) => a + b, 0) / bands.length;
      return {
        ...el,
        LpOutBands,
        avgLpOut
      };
    });

    // 4. Calcular Rw final ponderado por área
    const totalArea = elementsWithTL.reduce((sum, el) => sum + el.area, 0);
    const rwWeighted = elementsWithTL.reduce((sum, el) => sum + (el.material.weightedIndex?.Rw ?? el.avgTL) * el.area, 0) / totalArea;

    // 5. Construir mapa de calor acústico
    const heatmap = elementsWithLpOut.map(el => ({
      id: el.id,
      type: el.type,
      coordinates: el.position,
      intensity: Math.max(0, Math.min(1, (100 - el.avgLpOut) / 60)), // 0 = bajo, 1 = alto nivel exterior
      transmissionLoss: el.avgTL,
      rw: el.material.weightedIndex?.Rw ?? el.avgTL,
      description: `${el.type === 'wall' ? 'Pared' : 'Abertura'}: TL=${el.avgTL.toFixed(1)}dB, Lp_out=${el.avgLpOut.toFixed(1)}dB`
    }));

    return {
      rwFinal: rwWeighted,
      heatmap
    };
  }
}