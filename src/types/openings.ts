export type OpeningType = 'door' | 'window' | 'double-door' | 'sliding-door';

// ✅ PROPIEDADES ACÚSTICAS AVANZADAS
export interface AcousticProperties {
  soundTransmissionClass: number;        // STC rating (dB)
  soundTransmission: number;             // Coeficiente transmisión cerrada (0-1)
  soundTransmissionOpen: number;         // Coeficiente transmisión abierta (0-1)
  absorption: number;                    // Coeficiente absorción acústica (0-1)
  reflection: number;                    // Coeficiente reflexión acústica (0-1)
  materialDensity: number;               // Densidad del material (kg/m³)
  thickness: number;                     // Grosor en metros
  airGapSealing: number;                 // Calidad del sellado (0-1)
  frequencyResponse: {
    low: number;      // 125-250 Hz (graves)
    mid: number;      // 500-1000 Hz (medios)
    high: number;     // 2000-4000 Hz (agudos)
  };
}

// ✅ PROPIEDADES FÍSICAS DEL MATERIAL
export interface MaterialProperties {
  type: 'solid_wood' | 'single_glazing' | 'double_glazing' | 'sliding_glass' | 'acoustic_door';
  
  // Para puertas de madera
  woodType?: 'pine' | 'oak' | 'engineered_composite';
  coreType?: 'solid' | 'hollow' | 'mineral_wool' | 'foam';
  panelConstruction?: 'solid' | 'double_panel' | 'multi_layer';
  
  // Para ventanas y vidrios
  glassType?: 'float_glass' | 'tempered_glass' | 'laminated_glass';
  glassThickness?: number;               // mm
  airGap?: number;                       // mm entre cristales (doble acristalamiento)
  gasType?: 'air' | 'argon' | 'krypton'; // Gas entre cristales
  coatingType?: 'none' | 'low_e' | 'low_e_double' | 'reflective';
  
  // Marcos y herrajes
  frameType?: 'aluminum' | 'upvc' | 'aluminum_thermal' | 'upvc_thermal' | 'wood';
  hardware?: 'standard_hinges' | 'heavy_duty_hinges' | 'acoustic_seals';
  weatherSealing?: 'basic' | 'standard' | 'enhanced' | 'premium' | 'acoustic_premium';
  
  // Porcentajes y acabados
  glassPercentage?: number;              // % de vidrio vs marco
  finish?: 'painted' | 'stained' | 'natural' | 'acoustic_coating';
  
  // Para puertas corredizas
  trackSystem?: 'single_track' | 'dual_track' | 'premium_track';
}

// ✅ CONDICIONES DE USO Y RENDIMIENTO
export interface PerformanceByCondition {
  closed_sealed: {
    transmissionLoss: number;            // dB pérdida de transmisión
    soundTransmission: number;           // Coeficiente transmisión
    description: string;
  };
  closed_unsealed: {
    transmissionLoss: number;
    soundTransmission: number;
    description: string;
  };
  partially_open: {
    transmissionLoss: number;
    soundTransmission: number;
    description: string;
  };
  fully_open: {
    transmissionLoss: number;
    soundTransmission: number;
    description: string;
  };
}

// ✅ TEMPLATE ACTUALIZADO CON PROPIEDADES ACÚSTICAS
export interface OpeningTemplate {
  id: string;
  type: 'door' | 'window' | 'double-door' | 'sliding-door';
  name: string;
  width: number;                         // metros
  height: number;                        // metros
  bottomOffset: number;                  // metros desde el suelo
  icon?: string;                         // emoji para la UI
  
  // ✅ NUEVAS PROPIEDADES ACÚSTICAS
  acousticProperties: AcousticProperties;
  materialProperties: MaterialProperties;
  performanceByCondition: PerformanceByCondition;
}

// ✅ OPENING ACTUALIZADO
export interface Opening {
  id: string;
  wallIndex: number;
  position: number;                      // 0-1 posición relativa en la pared
  width: number;
  height: number;
  bottomOffset: number;
  type: 'door' | 'window' | 'double-door' | 'sliding-door';
  template?: OpeningTemplate;
  
  // ✅ ESTADO ACTUAL DE LA ABERTURA
  currentCondition: 'closed_sealed' | 'closed_unsealed' | 'partially_open' | 'fully_open';
  
  // ✅ PROPIEDADES ACÚSTICAS EFECTIVAS (calculadas en tiempo real)
  effectiveAcousticProperties?: {
    currentTransmissionLoss: number;     // dB actual según condición
    currentSoundTransmission: number;    // Coeficiente actual
    leakagePoints: Array<{              // Puntos específicos de filtración
      location: 'top' | 'bottom' | 'left' | 'right' | 'center';
      severity: number;                 // 0-1 severidad de la filtración
      cause: 'wear' | 'poor_sealing' | 'gap' | 'damage';
    }>;
  };
}

// ✅ INTERFACES AUXILIARES
export interface Point2D {
  x: number;
  z: number;
}

export interface WallSegment {
  startX: number;
  endX: number;
  height: number;
  startY?: number;                       // Para segmentos superiores (dinteles)
  endY?: number;                         // Para segmentos superiores (dinteles)
}

// ✅ INTERFACE PARA ANÁLISIS ACÚSTICO
export interface AcousticAnalysis {
  openingId: string;
  wallIndex: number;
  
  // Métricas de aislamiento
  overallTransmissionLoss: number;       // dB pérdida total
  frequencyAnalysis: {
    low: {
      transmissionLoss: number;          // dB
      leakagePercentage: number;         // % sonido que escapa
    };
    mid: {
      transmissionLoss: number;
      leakagePercentage: number;
    };
    high: {
      transmissionLoss: number;
      leakagePercentage: number;
    };
  };
  
  // Puntos débiles identificados
  weakPoints: Array<{
    location: string;
    issue: string;
    impact: 'low' | 'medium' | 'high';
    recommendation: string;
  }>;
  
  // Comparación con estándares
  complianceLevel: 'poor' | 'acceptable' | 'good' | 'excellent';
  improvementPotential: {
    maxPossibleSTC: number;              // STC máximo alcanzable
    costEffectiveUpgrades: Array<{
      upgrade: string;
      stcImprovement: number;
      estimatedCost: 'low' | 'medium' | 'high';
    }>;
  };
}

// ✅ INTERFACE PARA RESULTADOS DE SIMULACIÓN
export interface AcousticSimulationResult {
  totalSoundLeakage: number;             // % total de sonido que escapa
  dominantFrequency: 'low' | 'mid' | 'high'; // Frecuencia más problemática
  criticalOpenings: Array<{
    openingId: string;
    wallIndex: number;
    leakageContribution: number;         // % contribución al total
    priority: 'low' | 'medium' | 'high'; // Prioridad de mejora
  }>;
  overallRating: 'poor' | 'fair' | 'good' | 'excellent';
  recommendations: string[];
}

// ✅ CONSTANTES ACÚSTICAS
export const ACOUSTIC_CONSTANTS = {
  // Estándares de clasificación STC
  STC_RATINGS: {
    POOR: { min: 0, max: 25, description: 'Aislamiento deficiente' },
    FAIR: { min: 25, max: 35, description: 'Aislamiento aceptable' },
    GOOD: { min: 35, max: 45, description: 'Buen aislamiento' },
    EXCELLENT: { min: 45, max: 60, description: 'Excelente aislamiento' }
  },
  
  // Rangos de frecuencia (Hz)
  FREQUENCY_RANGES: {
    LOW: { min: 125, max: 250, name: 'Graves' },
    MID: { min: 500, max: 1000, name: 'Medios' },
    HIGH: { min: 2000, max: 4000, name: 'Agudos' }
  },
  
  // Factores de corrección
  CORRECTION_FACTORS: {
    AGE_DEGRADATION: 0.95,               // Factor por envejecimiento
    INSTALLATION_QUALITY: {
      POOR: 0.8,
      STANDARD: 0.9,
      PROFESSIONAL: 1.0
    },
    MAINTENANCE_LEVEL: {
      POOR: 0.85,
      REGULAR: 0.95,
      EXCELLENT: 1.0
    }
  }
} as const;