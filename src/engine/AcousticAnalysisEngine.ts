// ...existing imports...
import { Opening } from '@/types/openings';
import { Wall } from '@/types/walls';

export class AcousticAnalysisEngine {
  
  /**
   * 🚪 ANÁLISIS ACÚSTICO DE ABERTURAS (PUERTAS Y VENTANAS)
   */
  static analyzeOpening(
    opening: Opening,
    externalSoundLevel: number = 70,
    wallArea: number = 30
  ) {
    const { template, currentCondition, width, height } = opening;
    const openingArea = width * height;

    // ✅ FACTORES DE DETERIORO POR CONDICIÓN - CORREGIDOS
    const conditionFactors: Record<string, number> = {
      'closed_sealed': 1.0,
      'closed_unsealed': 0.7,
      'partially_open': 0.3,
      'fully_open': 0.1,
      'damaged': 0.5
    };

    const conditionFactor = conditionFactors[currentCondition] || 0.8;

    // ✅ ANÁLISIS POR FRECUENCIAS - CORREGIDO
    const frequencyAnalysis = {
      low: {
        transmissionLoss: template?.acousticProperties?.soundTransmissionClass?.low
          ? template.acousticProperties.soundTransmissionClass.low * conditionFactor
          : 0,
        absorption: template?.acousticProperties?.absorptionCoefficient?.low ?? 0.05,
        leakagePercentage: template?.acousticProperties?.soundTransmissionClass?.low
          ? Math.max(0, 100 - (template.acousticProperties.soundTransmissionClass.low * conditionFactor))
          : 100
      },
      mid: {
        transmissionLoss: template?.acousticProperties?.soundTransmissionClass?.mid
          ? template.acousticProperties.soundTransmissionClass.mid * conditionFactor
          : 0,
        absorption: template?.acousticProperties?.absorptionCoefficient?.mid ?? 0.05,
        leakagePercentage: Math.max(0, 100 - ((template?.acousticProperties?.soundTransmissionClass?.mid ?? 0) * conditionFactor))
      },
      high: {
        transmissionLoss: template?.acousticProperties?.soundTransmissionClass?.high
          ? template.acousticProperties.soundTransmissionClass?.high * conditionFactor
          : 0,
        absorption: template?.acousticProperties?.absorptionCoefficient?.high ?? 0.05,
        leakagePercentage: template?.acousticProperties?.soundTransmissionClass?.high
          ? Math.max(0, 100 - (template?.acousticProperties?.soundTransmissionClass?.high * conditionFactor))
          : 100
      }
    };

    // ✅ PÉRDIDA DE TRANSMISIÓN PROMEDIO
    const averageTransmissionLoss = (
      frequencyAnalysis.low.transmissionLoss +
      frequencyAnalysis.mid.transmissionLoss +
      frequencyAnalysis.high.transmissionLoss
    ) / 3;

    // ✅ FACTOR DE ÁREA (las aberturas grandes son más problemáticas)
    const areaFactor = Math.min(1.0, openingArea / 4.0); // Normalizado para abertura de 2x2m
    const areaReduction = areaFactor * 5; // Hasta 5dB de reducción por tamaño

    // ✅ PÉRDIDA EFECTIVA
    const effectiveTransmissionLoss = Math.max(averageTransmissionLoss - areaReduction, 5);

    // ✅ NIVEL SONORO RESULTANTE
    const resultingSoundLevel = Math.max(externalSoundLevel - effectiveTransmissionLoss, 25);

    // ✅ IDENTIFICAR PROBLEMAS ESPECÍFICOS
    const issues: Array<{
      issue: string;
      severity: 'critical' | 'high' | 'medium' | 'low';
      recommendation: string;
      estimatedCost: number;
    }> = [];

    // 'damaged' is not a valid currentCondition for Opening, so this block is removed.

    if (currentCondition === 'closed_unsealed') {
      issues.push({
        issue: 'Falta de sellado',
        severity: 'high',
        recommendation: 'Instalar o renovar sellados perimetrales',
        estimatedCost: 50 + (width + height) * 2 * 5 // €5 por metro lineal
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

    if (
      template &&
      template.type === 'window' &&
      typeof template.acousticProperties.soundTransmissionClass === 'object' &&
      template.acousticProperties.soundTransmissionClass.mid < 25
    ) {
      issues.push({
        issue: 'Ventana con bajo aislamiento',
        severity: 'medium',
        recommendation: 'Considerar vidrio laminado o doble acristalamiento',
        estimatedCost: openingArea * 150 // €150/m² para mejora
      });
    }

    if (
      template &&
      template.type === 'door' &&
      typeof template.acousticProperties.soundTransmissionClass === 'object' &&
      template.acousticProperties.soundTransmissionClass.mid < 20
    ) {
      issues.push({
        issue: 'Puerta con bajo aislamiento',
        severity: 'medium',
        recommendation: 'Instalar puerta acústica o mejorar sellados',
        estimatedCost: Math.min(((template as any).cost ?? 0) * 0.8, 800) // Mejora o reemplazo
      });
    }

    // ✅ CÁLCULO DE FUGA SONORA
    const totalSoundLeakage = (
      frequencyAnalysis.low.leakagePercentage +
      frequencyAnalysis.mid.leakagePercentage +
      frequencyAnalysis.high.leakagePercentage
    ) / 3;

    // ✅ IMPACTO EN LA PARED
    const wallImpactFactor = openingArea / wallArea;
    const wallAcousticReduction = wallImpactFactor * 15; // Hasta 15dB de reducción en la pared

    // ✅ RATING GENERAL
    const overallTransmissionLoss = effectiveTransmissionLoss;
    const overallRating: 'excellent' | 'good' | 'moderate' | 'poor' | 'critical' = 
      overallTransmissionLoss >= 35 ? 'excellent' :
      overallTransmissionLoss >= 25 ? 'good' :
      overallTransmissionLoss >= 18 ? 'moderate' :
      overallTransmissionLoss >= 12 ? 'poor' : 'critical';

    // ✅ RECOMENDACIONES ESPECÍFICAS
    const recommendations: string[] = [];

    if (issues.length === 0) {
      recommendations.push('Abertura en buen estado acústico');
    } else {
      recommendations.push(...issues.map(issue => issue.recommendation));
    }

    if (totalSoundLeakage > 70) {
      recommendations.push('Priorizar mejoras en esta abertura');
    }

    if (wallImpactFactor > 0.3) {
      recommendations.push('Abertura grande - considerar dividir en secciones más pequeñas');
    }

    // ✅ ANÁLISIS DE COSTO-BENEFICIO
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

    console.log(`🔍 Análisis de abertura ${opening.id}:`, {
      tipo: template?.name,
      condición: currentCondition,
      pérdida: effectiveTransmissionLoss.toFixed(1) + 'dB',
      rating: overallRating,
      fuga: totalSoundLeakage.toFixed(1) + '%',
      problemas: issues.length
    });

    return {
      openingId: opening.id,
      type: template?.type ?? 'unknown',
      template: template?.name,
      area: openingArea,
      condition: currentCondition,
      frequencyAnalysis,
      averageTransmissionLoss,
      effectiveTransmissionLoss,
      overallTransmissionLoss,
      resultingSoundLevel,
      totalSoundLeakage,
      wallImpactFactor,
      wallAcousticReduction,
      overallRating,
      issues,
      recommendations,
      costBenefitAnalysis: {
        improvementCost: totalImprovementCost,
        potentialImprovement,
        costBenefitRatio,
        priority: issues.some(i => i.severity === 'critical') ? 'high' as const :
                 issues.some(i => i.severity === 'high') ? 'medium' as const : 'low' as const
      }
    };
  }

  /**
   * 🧱 ANÁLISIS ACÚSTICO DE PAREDES
   */
  static analyzeWall(
    wall: Wall,
    externalSoundLevel: number = 70,
    adjacentOpeningsCount: number = 0
  ) {
    const { template, currentCondition, area } = wall;
    const { acousticProperties } = template;

    // ✅ FACTORES DE DETERIORO POR CONDICIÓN - CORREGIDOS
    const conditionFactors: Record<string, number> = {
      'excellent': 1.0,
      'good': 0.95,
      'fair': 0.85,
      'poor': 0.70,
      'damaged': 0.50
    };

    const conditionFactor = conditionFactors[currentCondition] || 0.8;

    // ✅ CÁLCULO POR FRECUENCIAS
    const frequencyAnalysis = {
      low: {
        transmissionLoss: acousticProperties.transmissionLoss.low * conditionFactor,
        absorption: acousticProperties.absorptionCoefficient.low,
        leakagePercentage: Math.max(0, 100 - (acousticProperties.transmissionLoss.low * conditionFactor * 1.5))
      },
      mid: {
        transmissionLoss: acousticProperties.transmissionLoss.mid * conditionFactor,
        absorption: acousticProperties.absorptionCoefficient.mid,
        leakagePercentage: Math.max(0, 100 - (acousticProperties.transmissionLoss.mid * conditionFactor * 1.5))
      },
      high: {
        transmissionLoss: acousticProperties.transmissionLoss.high * conditionFactor,
        absorption: acousticProperties.absorptionCoefficient.high,
        leakagePercentage: Math.max(0, 100 - (acousticProperties.transmissionLoss.high * conditionFactor * 1.5))
      }
    };

    // ✅ PÉRDIDA DE TRANSMISIÓN PROMEDIO
    const averageTransmissionLoss = (
      frequencyAnalysis.low.transmissionLoss +
      frequencyAnalysis.mid.transmissionLoss +
      frequencyAnalysis.high.transmissionLoss
    ) / 3;

    // ✅ PENALIZACIÓN POR ABERTURAS ADYACENTES
    const openingsPenalty = adjacentOpeningsCount * 2; // 2dB por abertura
    const effectiveTransmissionLoss = Math.max(averageTransmissionLoss - openingsPenalty, 15);

    // ✅ NIVEL SONORO RESULTANTE
    const resultingSoundLevel = Math.max(externalSoundLevel - effectiveTransmissionLoss, 20);

    // ✅ IDENTIFICAR PUNTOS DÉBILES - TIPO CORREGIDO
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

    if (template.material === 'drywall' && externalSoundLevel > 75) {
      weakPoints.push({
        issue: 'Material insuficiente para nivel sonoro',
        severity: 'high',
        recommendation: 'Considerar material más denso'
      });
    }

    // ✅ RATING GENERAL - TIPO CORREGIDO
    const rating: 'excellent' | 'good' | 'moderate' | 'poor' | 'critical' = 
      effectiveTransmissionLoss >= 50 ? 'excellent' :
      effectiveTransmissionLoss >= 40 ? 'good' :
      effectiveTransmissionLoss >= 30 ? 'moderate' :
      effectiveTransmissionLoss >= 20 ? 'poor' : 'critical';

    return {
      wallId: wall.id,
      material: template.name,
      area: area,
      frequencyAnalysis,
      averageTransmissionLoss,
      effectiveTransmissionLoss,
      resultingSoundLevel,
      rating,
      weakPoints,
      recommendations: weakPoints.map(wp => wp.recommendation),
      costEfficiencyRatio: effectiveTransmissionLoss / (template.cost.material + template.cost.installation)
    };
  }

  /**
   * 🏠 ANÁLISIS INTEGRAL DEL EDIFICIO (PAREDES + ABERTURAS)
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

    // ✅ ANALIZAR CADA PARED
    const wallAnalyses = walls.map(wall => {
      const adjacentOpenings = openings.filter(opening => opening.wallIndex === walls.indexOf(wall));
      return this.analyzeWall(wall, externalSoundLevel, adjacentOpenings.length);
    });

    // ✅ ANALIZAR CADA ABERTURA
    const openingAnalyses = openings.map(opening => {
      return this.analyzeOpening(opening, externalSoundLevel, 30); // Área promedio de pared
    });

    // ✅ CALCULAR MÉTRICAS GLOBALES
    const totalArea = walls.reduce((sum, wall) => sum + wall.area, 0);
    const weightedTransmissionLoss = totalArea > 0 ? wallAnalyses.reduce((sum, analysis) => 
      sum + (analysis.effectiveTransmissionLoss * analysis.area), 0
    ) / totalArea : 0;

    // ✅ IDENTIFICAR ELEMENTOS MÁS DÉBILES - TIPOS CORREGIDOS
    const allElements: Array<{
      type: 'wall' | 'opening';
      id: string;
      rating: 'excellent' | 'good' | 'moderate' | 'poor' | 'critical';
      loss: number;
    }> = [
      ...wallAnalyses.map(w => ({ 
        type: 'wall' as const, 
        id: w.wallId, 
        rating: w.rating, 
        loss: w.effectiveTransmissionLoss 
      })),
      ...openingAnalyses.map(o => ({ 
        type: 'opening' as const, 
        id: o.openingId, 
        rating: o.overallRating, 
        loss: o.overallTransmissionLoss 
      }))
    ];

    const weakestElements = allElements
      .filter(el => el.rating === 'critical' || el.rating === 'poor')
      .sort((a, b) => a.loss - b.loss)
      .slice(0, 5);

    // ✅ GENERAR RECOMENDACIONES - TIPO CORREGIDO
    const recommendations: string[] = [];
    
    const criticalWalls = wallAnalyses.filter(w => w.rating === 'critical');
    if (criticalWalls.length > 0) {
      recommendations.push(`Reemplazar ${criticalWalls.length} pared(es) en estado crítico`);
    }

    const criticalOpenings = openingAnalyses.filter(o => o.overallRating === 'critical');
    if (criticalOpenings.length > 0) {
      recommendations.push(`Reparar ${criticalOpenings.length} abertura(s) en estado crítico`);
    }

    const poorWalls = wallAnalyses.filter(w => w.rating === 'poor');
    if (poorWalls.length > 0) {
      recommendations.push(`Mejorar ${poorWalls.length} pared(es) con rendimiento pobre`);
    }

    if (weightedTransmissionLoss < 35) {
      recommendations.push('Considerar materiales de mayor densidad acústica');
    }

    // ✅ ANÁLISIS DE COSTO-EFICIENCIA
    const totalCost = walls.reduce((sum, wall) => 
      sum + (wall.template.cost.material + wall.template.cost.installation) * wall.area, 0
    );
    const costEfficiency = totalArea > 0 ? weightedTransmissionLoss / (totalCost / totalArea) : 0;

    // ✅ RATING GENERAL - TIPO CORREGIDO
    const overallRating: 'excellent' | 'good' | 'fair' | 'poor' | 'critical' = 
      weightedTransmissionLoss >= 50 ? 'excellent' :
      weightedTransmissionLoss >= 40 ? 'good' :
      weightedTransmissionLoss >= 30 ? 'fair' :
      weightedTransmissionLoss >= 25 ? 'poor' : 'critical';

    console.log('🏠 Análisis integral completo:', {
      paredes: walls.length,
      aberturas: openings.length,
      pérdidaPromedio: weightedTransmissionLoss.toFixed(1) + 'dB',
      rating: overallRating,
      costoTotal: totalCost.toFixed(0) + '€'
    });

    return {
      overallRating,
      totalArea,
      averageTransmissionLoss: weightedTransmissionLoss,
      wallAnalyses,
      openingAnalyses,
      weakestElements,
      recommendations,
      costAnalysis: {
        total: totalCost,
        efficiency: costEfficiency,
        breakdown: walls.map(wall => ({
          wallId: wall.id,
          material: wall.template.name,
          cost: (wall.template.cost.material + wall.template.cost.installation) * wall.area
        }))
      }
    };
  }

  /**
   * 🔥 GENERAR HEATMAP ACÚSTICO
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
        
        // Calcular posición en la pared
        const wallIndex = opening.wallIndex;
        if (wallIndex < 0 || wallIndex >= wallCoordinates.length) {
          console.warn(`🔊 Índice de pared inválido: ${wallIndex}`);
          return;
        }

        const wallStart = wallCoordinates[wallIndex];
        const wallEnd = wallCoordinates[(wallIndex + 1) % wallCoordinates.length];
        
        if (!wallStart || !wallEnd) {
          console.warn(`🔊 Coordenadas de pared no válidas para índice ${wallIndex}`);
          return;
        }

        // Posición en la pared (centro por defecto)
        const t = opening.relativePosition || 0.5;
        const coordinates = {
          x: wallStart.x + (wallEnd.x - wallStart.x) * t,
          z: wallStart.z + (wallEnd.z - wallStart.z) * t
        };

        // Intensidad basada en fuga sonora
        const intensity = Math.min(1.0, analysis.totalSoundLeakage / 100);

        heatmapData.set(opening.id, { coordinates, intensity });
        
      } catch (error) {
        console.error(`🔊 Error analizando abertura ${opening.id}:`, error);
      }
    });

    console.log(`🔥 Heatmap generado con ${heatmapData.size} puntos de datos`);
    return heatmapData;
  }
}