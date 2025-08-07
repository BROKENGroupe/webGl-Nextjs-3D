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

// ✅ TIPOS DE CONDICIÓN DE APERTURA
export type OpeningCondition = 
  | 'closed_sealed' 
  | 'closed_unsealed' 
  | 'partially_open' 
  | 'fully_open' 
  | 'damaged';

// ✅ OPENING ACTUALIZADO
export interface Opening {
  id: string;
  type: 'door' | 'window' | 'double-door' | 'sliding-door'; // ✅ CORREGIDO
  wallIndex: number;
  relativePosition: number;
  position: number; // Alias para compatibilidad
  width: number;
  height: number;
  bottomOffset: number;
  
  template: OpeningTemplate;
  currentCondition: OpeningCondition;
  
  area?: number;
  acousticRating?: 'A' | 'B' | 'C' | 'D' | 'E';
  
  constructionDate?: Date;
  lastInspectionDate?: Date;
  maintenanceHistory?: Array<{
    date: Date;
    type: 'repair' | 'replacement' | 'improvement';
    description: string;
    cost?: number;
  }>;
  
  notes?: string;
}

// ✅ TEMPLATE ACTUALIZADO CON PROPIEDADES ACÚSTICAS
export interface OpeningTemplate {
  id: string;
  name: string;
  type: 'door' | 'window' | 'double-door' | 'sliding-door'; // ✅ CORREGIDO - Tipos expandidos
  width: number;
  height: number;
  bottomOffset: number;
  icon?: string; // ✅ AGREGADO - Para UI
  
  // ✅ ESTRUCTURA ACÚSTICA CORREGIDA
  acousticProperties: {
    soundTransmissionClass: {
      low: number;  // 125-250 Hz
      mid: number;  // 500-1000 Hz  
      high: number; // 2000-4000 Hz
    };
    absorptionCoefficient?: {
      low: number;
      mid: number;
      high: number;
    };
    airLeakage: number;
    weatherResistance: number;
  };
  
  cost: number;
  material: string;
  description: string;
  category: 'standard' | 'acoustic' | 'security' | 'fire_rated';
  availability: 'common' | 'specialized' | 'custom';
}

// ✅ TEMPLATES CON TODAS LAS PROPIEDADES REQUERIDAS
export const OPENING_TEMPLATES: Record<string, OpeningTemplate> = {
  'door-standard': {
    id: 'door-standard',
    name: 'Puerta Simple',
    type: 'door',
    width: 0.9,
    height: 2.1,
    bottomOffset: 0,
    icon: '🚪',
    acousticProperties: {
      soundTransmissionClass: { low: 20, mid: 28, high: 25 },
      absorptionCoefficient: { low: 0.15, mid: 0.18, high: 0.12 },
      airLeakage: 3.5,
      weatherResistance: 6
    },
    cost: 300,
    material: 'Madera maciza',
    description: 'Puerta de madera estándar',
    category: 'standard',
    availability: 'common'
  },
  
  'door-double': {
    id: 'door-double',
    name: 'Puerta Doble',
    type: 'double-door',
    width: 1.6,
    height: 2.1,
    bottomOffset: 0,
    icon: '🚪🚪',
    acousticProperties: {
      soundTransmissionClass: { low: 25, mid: 32, high: 28 },
      absorptionCoefficient: { low: 0.18, mid: 0.22, high: 0.15 },
      airLeakage: 2.8,
      weatherResistance: 8
    },
    cost: 600,
    material: 'Madera de roble',
    description: 'Puerta doble hoja con sellado central',
    category: 'standard',
    availability: 'common'
  },
  
  'window-standard': {
    id: 'window-standard',
    name: 'Ventana Simple',
    type: 'window',
    width: 1.2,
    height: 1.0,
    bottomOffset: 1.0,
    icon: '🪟',
    acousticProperties: {
      soundTransmissionClass: { low: 18, mid: 26, high: 22 },
      absorptionCoefficient: { low: 0.05, mid: 0.06, high: 0.04 },
      airLeakage: 4.0,
      weatherResistance: 5
    },
    cost: 200,
    material: 'Vidrio simple 6mm',
    description: 'Ventana de vidrio simple con marco de aluminio',
    category: 'standard',
    availability: 'common'
  },
  
  'sliding-door': {
    id: 'sliding-door',
    name: 'Puerta Corrediza',
    type: 'sliding-door',
    width: 2.4,
    height: 2.1,
    bottomOffset: 0,
    icon: '🎚️',
    acousticProperties: {
      soundTransmissionClass: { low: 22, mid: 30, high: 26 },
      absorptionCoefficient: { low: 0.08, mid: 0.10, high: 0.06 },
      airLeakage: 2.5,
      weatherResistance: 7
    },
    cost: 800,
    material: 'Vidrio templado 8mm',
    description: 'Puerta corrediza de vidrio templado',
    category: 'standard',
    availability: 'common'
  },
  
  'window-double-glazed': {
    id: 'window-double-glazed',
    name: 'Ventana Doble Vidrio',
    type: 'window',
    width: 1.2,
    height: 1.0,
    bottomOffset: 1.0,
    icon: '🪟🪟',
    acousticProperties: {
      soundTransmissionClass: { low: 28, mid: 35, high: 32 },
      absorptionCoefficient: { low: 0.10, mid: 0.12, high: 0.08 },
      airLeakage: 1.5,
      weatherResistance: 9
    },
    cost: 450,
    material: 'Doble acristalamiento con gas argón',
    description: 'Ventana de doble acristalamiento',
    category: 'acoustic',
    availability: 'common'
  },
  
  'door-acoustic': {
    id: 'door-acoustic',
    name: 'Puerta Acústica',
    type: 'door',
    width: 0.9,
    height: 2.1,
    bottomOffset: 0,
    icon: '🔇🚪',
    acousticProperties: {
      soundTransmissionClass: { low: 40, mid: 45, high: 42 },
      absorptionCoefficient: { low: 0.35, mid: 0.40, high: 0.30 },
      airLeakage: 0.8,
      weatherResistance: 10
    },
    cost: 1200,
    material: 'Núcleo de lana mineral',
    description: 'Puerta especializada para aislamiento acústico',
    category: 'acoustic',
    availability: 'specialized'
  }
};

// ✅ EXPORTAR Point2D QUE FALTABA
export interface Point2D {
  x: number;
  z: number;
}

// ✅ FUNCIONES UTILITARIAS
export const calculateOpeningArea = (opening: Opening): number => {
  return opening.width * opening.height;
};

export const calculateOpeningAcousticRating = (opening: Opening): 'A' | 'B' | 'C' | 'D' | 'E' => {
  const stc = opening.template.acousticProperties.soundTransmissionClass;
  const avgSTC = (stc.low + stc.mid + stc.high) / 3;

  const conditionFactors = {
    'closed_sealed': 1.0,
    'closed_unsealed': 0.8,
    'partially_open': 0.4,
    'fully_open': 0.1,
    'damaged': 0.5
  };

  const adjustedSTC = avgSTC * (conditionFactors[opening.currentCondition] || 1.0);

  if (adjustedSTC >= 35) return 'A';
  if (adjustedSTC >= 28) return 'B';
  if (adjustedSTC >= 20) return 'C';
  if (adjustedSTC >= 15) return 'D';
  return 'E';
};

export const syncOpeningPosition = (opening: Opening): Opening => {
  return {
    ...opening,
    position: opening.relativePosition,
    relativePosition: opening.position || opening.relativePosition
  };
};