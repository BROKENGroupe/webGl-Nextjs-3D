/**
 * Utilidades de cálculo para análisis acústicos
 */

// Tipos para establecimiento
export type EstablishmentTypeKey = 'nightclub' | 'restaurant' | 'bar' | 'hotel' | 'casino' | 'gym' | 'mall' | 'event_hall';

export interface FrequencyWeights {
  bass: number;
  mid: number;
  high: number;
}

// Constantes acústicas
export const ACOUSTIC_CONSTANTS = {
  // Límites ISO 12354-4
  ISO_MIN_COMPLIANCE: 70,
  ISO_EXCELLENT_COMPLIANCE: 85,
  
  // Límites STC (Sound Transmission Class)
  STC_MIN_ACCEPTABLE: 45,
  STC_GOOD: 55,
  STC_EXCELLENT: 60,
  
  // Control de ruido externo (dB)
  NOISE_CONTROL_MIN: 20,
  NOISE_CONTROL_GOOD: 30,
  NOISE_CONTROL_EXCELLENT: 35,
  
  // Frecuencias estándar (Hz)
  STANDARD_FREQUENCIES: [125, 250, 500, 1000, 2000, 4000],
  
  // Pesos por tipo de establecimiento
  ESTABLISHMENT_WEIGHTS: {
    nightclub: { bass: 1.5, mid: 1.2, high: 1.0 },
    restaurant: { bass: 1.0, mid: 1.3, high: 1.1 },
    bar: { bass: 1.2, mid: 1.2, high: 1.0 },
    hotel: { bass: 0.8, mid: 1.0, high: 1.2 },
    casino: { bass: 1.1, mid: 1.1, high: 1.0 },
    gym: { bass: 1.4, mid: 1.0, high: 0.9 },
    mall: { bass: 0.9, mid: 1.1, high: 1.2 },
    event_hall: { bass: 1.3, mid: 1.4, high: 1.1 }
  } as Record<EstablishmentTypeKey, FrequencyWeights>
} as const;

/**
 * Función auxiliar para obtener pesos de establishment de forma segura
 */
const getEstablishmentWeights = (establishmentType: string): FrequencyWeights => {
  const typedKey = establishmentType as EstablishmentTypeKey;
  return ACOUSTIC_CONSTANTS.ESTABLISHMENT_WEIGHTS[typedKey] || 
         ACOUSTIC_CONSTANTS.ESTABLISHMENT_WEIGHTS.restaurant;
};

/**
 * Calcula el nivel de cumplimiento ISO 12354-4
 */
export const calculateISOCompliance = (
  transmissionLoss: number,
  impactInsulation: number,
  airborneInsulation: number,
  establishmentType: string = 'restaurant'
): number => {
  const weights = getEstablishmentWeights(establishmentType);
  
  // Normalizar valores a escala 0-100
  const normalizedTL = Math.min((transmissionLoss / 65) * 100, 100);
  const normalizedII = Math.min((impactInsulation / 70) * 100, 100);
  const normalizedAI = Math.min((airborneInsulation / 65) * 100, 100);
  
  // Calcular promedio ponderado
  const weightedScore = (
    normalizedTL * weights.mid +
    normalizedII * weights.bass +
    normalizedAI * weights.high
  ) / (weights.mid + weights.bass + weights.high);
  
  return Math.round(Math.max(0, Math.min(100, weightedScore)));
};

/**
 * Calcula la clasificación de rendimiento acústico
 */
export const getPerformanceRating = (complianceScore: number): {
  rating: 'excellent' | 'good' | 'acceptable' | 'poor';
  label: string;
  color: string;
} => {
  if (complianceScore >= ACOUSTIC_CONSTANTS.ISO_EXCELLENT_COMPLIANCE) {
    return {
      rating: 'excellent',
      label: 'Excelente',
      color: 'green'
    };
  } else if (complianceScore >= ACOUSTIC_CONSTANTS.ISO_MIN_COMPLIANCE) {
    return {
      rating: 'good',
      label: 'Bueno',
      color: 'blue'
    };
  } else if (complianceScore >= 60) {
    return {
      rating: 'acceptable',
      label: 'Aceptable',
      color: 'orange'
    };
  } else {
    return {
      rating: 'poor',
      label: 'Deficiente',
      color: 'red'
    };
  }
};

/**
 * Calcula el control de ruido externo efectivo
 */
export const calculateExternalNoiseControl = (
  internalLevel: number,
  externalReduction: number,
  establishmentType: string = 'restaurant'
): number => {
  const typeMultipliers: Record<string, number> = {
    nightclub: 1.2,
    gym: 1.1,
    event_hall: 1.15
  };
  
  const typeMultiplier = typeMultipliers[establishmentType] || 1.0;
  const effectiveControl = externalReduction * typeMultiplier;
  return Math.round(Math.max(0, Math.min(50, effectiveControl)));
};

/**
 * Genera métricas de tendencia temporal
 */
export const calculateTrends = (historicalData: Array<{
  date: string;
  compliance: number;
  stc: number;
}>): {
  complianceTrend: 'improving' | 'stable' | 'declining';
  stcTrend: 'improving' | 'stable' | 'declining';
  avgImprovement: number;
} => {
  if (historicalData.length < 2) {
    return {
      complianceTrend: 'stable',
      stcTrend: 'stable',
      avgImprovement: 0
    };
  }
  
  const sorted = historicalData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  
  const complianceChange = last.compliance - first.compliance;
  const stcChange = last.stc - first.stc;
  
  return {
    complianceTrend: complianceChange > 2 ? 'improving' : 
                    complianceChange < -2 ? 'declining' : 'stable',
    stcTrend: stcChange > 2 ? 'improving' : 
             stcChange < -2 ? 'declining' : 'stable',
    avgImprovement: Math.round((complianceChange + stcChange) / 2)
  };
};

/**
 * Calcula recomendaciones de mejora
 */
export const generateRecommendations = (
  compliance: number,
  stc: number,
  externalNoise: number,
  establishmentType: string
): string[] => {
  const recommendations: string[] = [];
  
  if (compliance < ACOUSTIC_CONSTANTS.ISO_MIN_COMPLIANCE) {
    recommendations.push("Implementar mejoras urgentes en aislamiento acústico");
    recommendations.push("Revisar sellado de juntas y elementos constructivos");
  }
  
  if (stc < ACOUSTIC_CONSTANTS.STC_MIN_ACCEPTABLE) {
    recommendations.push("Instalar materiales adicionales de absorción sonora");
    recommendations.push("Evaluar sistemas de doble pared o paneles acústicos");
  }
  
  if (externalNoise < ACOUSTIC_CONSTANTS.NOISE_CONTROL_MIN) {
    recommendations.push("Implementar sistemas de control de emisiones");
    recommendations.push("Considerar limitadores de volumen automáticos");
  }
  
  // Recomendaciones específicas por tipo
  const typeSpecificRecommendations: Record<string, () => void> = {
    nightclub: () => {
      if (stc < 55) {
        recommendations.push("Instalar sistemas de aislamiento específicos para bajos");
      }
    },
    gym: () => {
      if (compliance < 80) {
        recommendations.push("Implementar pisos flotantes para reducir impacto");
      }
    },
    hotel: () => {
      if (stc < 50) {
        recommendations.push("Mejorar aislamiento entre habitaciones");
      }
    }
  };
  
  const typeHandler = typeSpecificRecommendations[establishmentType];
  if (typeHandler) {
    typeHandler();
  }
  
  return recommendations;
};

/**
 * Calcula el score de sostenibilidad acústica
 */
export const calculateSustainabilityScore = (
  compliance: number,
  consecutiveMonthsCompliant: number,
  improvementRate: number
): number => {
  const baseScore = compliance * 0.6;
  const consistencyBonus = Math.min(consecutiveMonthsCompliant * 2, 20);
  const improvementBonus = Math.max(improvementRate * 3, -10);
  
  return Math.round(Math.max(0, Math.min(100, baseScore + consistencyBonus + improvementBonus)));
};

/**
 * Valida si un establecimiento califica para una distinción
 */
export const checkBadgeEligibility = (
  badgeId: string,
  metrics: {
    compliance: number;
    stc: number;
    externalReduction: number;
    consecutiveMonths: number;
    hasAdvancedTech: boolean;
  }
): boolean => {
  const eligibilityCheckers: Record<string, () => boolean> = {
    excellence_iso: () => metrics.compliance >= 95 && metrics.consecutiveMonths >= 6,
    sound_master: () => metrics.stc >= 58,
    eco_guardian: () => metrics.externalReduction >= 35,
    innovation_pioneer: () => metrics.hasAdvancedTech && metrics.compliance >= 90,
    compliance_streak: () => metrics.consecutiveMonths >= 12
  };
  
  const checker = eligibilityCheckers[badgeId];
  return checker ? checker() : false;
};

/**
 * Calcula proyecciones futuras basadas en tendencias
 */
export const projectFuturePerformance = (
  currentCompliance: number,
  trend: number,
  months: number
): {
  projectedCompliance: number;
  confidence: number;
} => {
  const monthlyTrend = trend / 12; // Convertir tendencia anual a mensual
  const projected = currentCompliance + (monthlyTrend * months);
  
  // Calcular confianza basada en estabilidad de tendencia
  const confidence = Math.max(0.4, Math.min(0.95, 1 - (Math.abs(trend) * 0.1)));
  
  return {
    projectedCompliance: Math.round(Math.max(0, Math.min(100, projected))),
    confidence: Math.round(confidence * 100)
  };
};