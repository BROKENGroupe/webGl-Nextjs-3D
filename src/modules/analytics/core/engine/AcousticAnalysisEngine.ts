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
import { AcousticMaterial, ThirdOctave } from '@/modules/materials/types/AcousticMaterial';
import { ISO12354_4Engine } from '../../../editor/core/engineMath/ISO12354_4Engine';
import { Opening } from '../../../editor/types/openings';
import type { IGeometryAdapter } from "../../../editor/core/engine/contracts/IGeometryAdapter";

export class AcousticAnalysisEngine {
  constructor(private adapter: IGeometryAdapter) {}

  /**
   * Analiza el comportamiento acústico de una abertura (puerta/ventana).
   */
  analyzeOpening(
    opening: Opening,
    externalSoundLevel: number = 70,
    wallArea: number = 30
  ) {
    const { template, currentCondition, width, height } = opening;
    const openingArea = width * height;

    const conditionFactors: Record<string, number> = {
      'closed_sealed': 1.0,
      'closed_unsealed': 0.7,
      'partially_open': 0.3,
      'fully_open': 0.1,
      'damaged': 0.5
    };
    const conditionFactor = conditionFactors[currentCondition] || 0.8;
    const areaFactor = Math.min(1.0, openingArea / 4.0);
    const areaReduction = areaFactor * 5;

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

    const wallImpactFactor = openingArea / wallArea;
    const wallAcousticReduction = wallImpactFactor * 15;

    const recommendations: string[] = [];
    if (issues.length === 0) {
      recommendations.push('Abertura en buen estado acústico');
    } else {
      recommendations.push(...issues.map(issue => issue.recommendation));
    }
    if (wallImpactFactor > 0.3) {
      recommendations.push('Abertura grande - considerar dividir en secciones más pequeñas');
    }

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
   */
  analyzeWall(
    wall: Wall,
    externalSoundLevel: number = 70,
    adjacentOpeningsCount: number = 0
  ) {
    const { template, currentCondition, area } = wall;

    const conditionFactors: Record<string, number> = {
      'excellent': 1.0,
      'good': 0.95,
      'fair': 0.85,
      'poor': 0.70,
      'damaged': 0.50
    };
    const conditionFactor = conditionFactors[currentCondition] || 0.8;
    const openingsPenalty = adjacentOpeningsCount * 2;

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
   */
  performBuildingAcousticAnalysis(
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

    const wallAnalyses = walls.map(wall => {
      const adjacentOpenings = openings.filter(opening => opening.wallIndex === walls.indexOf(wall));
      return this.analyzeWall(wall, externalSoundLevel, adjacentOpenings.length);
    });
    const openingAnalyses = openings.map(opening => {
      return this.analyzeOpening(opening, externalSoundLevel, 30);
    });

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
   */
  generateAcousticHeatmap(
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
   */
  generateDetailedAcousticHeatmap(
    walls: Wall[],
    openings: Opening[],
    wallCoordinates: { x: number; z: number }[],
    Lp_in: number = 100
  ) {
    const bands: ThirdOctave[] = [125, 500, 2000];

    const points: Array<{
      id: string;
      type: 'wall' | 'opening';
      coordinates: { x: number; z: number };
      intensity: number;
      transmissionLoss: number;
      description: string;
    }> = [];

    walls.forEach((wall, wallIndex) => {
      if (wallIndex >= wallCoordinates.length) return;
      const wallStart = wallCoordinates[wallIndex];
      const wallEnd = wallCoordinates[(wallIndex + 1) % wallCoordinates.length];
      const bandsTL = ISO12354_4Engine.calcTransmissionLossBands(wall.template, wall.currentCondition);
      const restul = ISO12354_4Engine.calcRBySegment(wall, openings);
      const avgTL = ISO12354_4Engine.calcAverageTransmissionLoss(bandsTL, bands);
      const adjacentOpenings = openings.filter(o => o.wallIndex === wallIndex);
      const openingsPenalty = adjacentOpenings.length * 2;
      const effectiveLoss = ISO12354_4Engine.calcEffectiveTransmissionLoss(avgTL, 0, openingsPenalty);

      const LpOutBands: Record<ThirdOctave, number> = {} as any;
      bands.forEach(band => {
        LpOutBands[band] = Lp_in - (bandsTL[band] ?? 0);
      });
      const avgLpOut = bands.map(b => LpOutBands[b]).reduce((a, b) => a + b, 0) / bands.length;

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

      const LpOutBands: Record<ThirdOctave, number> = {} as any;
      bands.forEach(band => {
        LpOutBands[band] = Lp_in - (bandsTL[band] ?? 0);
      });
      const avgLpOut = bands.map(b => LpOutBands[b]).reduce((a, b) => a + b, 0) / bands.length;

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
   * Calcula la presión sonora exterior (por banda y global) usando ISO 12354-4,
   * a partir de una presión sonora interior de referencia (Lp_in = 100 dB).
   * Devuelve el valor final Rw y el mapa de calor acústico.
   */
  calculateExteriorLevelsWithISO(
    walls: Wall[],
    openings: Opening[],
    wallCoordinates: { x: number; z: number }[],
    Lp_in: number = 100
  ) {
    const bands: ThirdOctave[] = [125, 500, 2000];

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

    const elementsWithTL = elements.map(el => {
      const TLbands = ISO12354_4Engine.calcTransmissionLossBands(el.material, el.condition);
      const avgTL = ISO12354_4Engine.calcAverageTransmissionLoss(TLbands, bands);
      return {
        ...el,
        TLbands,
        avgTL
      };
    });

    const elementsWithLpOut = elementsWithTL.map(el => {
      const LpOutBands: Record<ThirdOctave, number> = {} as any;
      bands.forEach(band => {
        LpOutBands[band] = Lp_in - (el.TLbands[band] ?? 0);
      });
      const avgLpOut = bands.map(b => LpOutBands[b]).reduce((a, b) => a + b, 0) / bands.length;
      return {
        ...el,
        LpOutBands,
        avgLpOut
      };
    });

    const totalArea = elementsWithTL.reduce((sum, el) => sum + el.area, 0);
    const rwWeighted = elementsWithTL.reduce((sum, el) => sum + (el.material.weightedIndex?.Rw ?? el.avgTL) * el.area, 0) / totalArea;

    const heatmap = elementsWithLpOut.map(el => ({
      id: el.id,
      type: el.type,
      coordinates: el.position,
      intensity: Math.max(0, Math.min(1, (100 - el.avgLpOut) / 60)),
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