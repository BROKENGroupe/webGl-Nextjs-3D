export type WallCondition = 'excellent' | 'good' | 'fair' | 'poor' | 'damaged';

export interface WallTemplate {
  id: string;
  name: string;
  material: string;
  thickness: number; // en metros
  acousticProperties: {
    transmissionLoss: {
      low: number;   // 125-250 Hz
      mid: number;   // 500-1000 Hz  
      high: number;  // 2000-4000 Hz
    };
    absorptionCoefficient: {
      low: number;
      mid: number;
      high: number;
    };
    density: number; // kg/m³
    porosity: number; // 0-1
  };
  cost: {
    material: number;     // €/m²
    installation: number; // €/m²
  };
  thermalProperties: {
    conductivity: number;  // W/m·K
    resistance: number;    // m²·K/W
  };
}

export interface Wall {
  id: string;
  wallIndex: number;
  template: WallTemplate;
  start: { x: number; z: number };
  end: { x: number; z: number };
  area: number;
  currentCondition: WallCondition;
  acousticRating?: 'A' | 'B' | 'C' | 'D' | 'E';
}

// ✅ TEMPLATES SIMPLES
export const WALL_TEMPLATES: Record<string, WallTemplate> = {
  'concrete-standard': {
    id: 'concrete-standard',
    name: 'Hormigón Estándar',
    material: 'Hormigón armado',
    thickness: 0.20,
    acousticProperties: {
      transmissionLoss: { low: 45, mid: 52, high: 48 },
      absorptionCoefficient: { low: 0.01, mid: 0.02, high: 0.02 },
      density: 2400,
      porosity: 0.05
    },
    cost: {
      material: 35,
      installation: 25
    },
    thermalProperties: {
      conductivity: 1.7,
      resistance: 0.12
    }
  },
  'brick-standard': {
    id: 'brick-standard',
    name: 'Ladrillo Cerámico',
    material: 'Ladrillo hueco cerámico',
    thickness: 0.15,
    acousticProperties: {
      transmissionLoss: { low: 40, mid: 45, high: 42 },
      absorptionCoefficient: { low: 0.02, mid: 0.03, high: 0.04 },
      density: 1200,
      porosity: 0.30
    },
    cost: {
      material: 28,
      installation: 18
    },
    thermalProperties: {
      conductivity: 0.45,
      resistance: 0.33
    }
  },
  'drywall-standard': {
    id: 'drywall-standard',
    name: 'Pladur Estándar',
    material: 'Placa de yeso laminado',
    thickness: 0.125,
    acousticProperties: {
      transmissionLoss: { low: 35, mid: 42, high: 48 },
      absorptionCoefficient: { low: 0.05, mid: 0.08, high: 0.04 },
      density: 650,
      porosity: 0.15
    },
    cost: {
      material: 25,
      installation: 15
    },
    thermalProperties: {
      conductivity: 0.25,
      resistance: 0.5
    }
  }
};

export const calculateWallAcousticRating = (wall: Wall): 'A' | 'B' | 'C' | 'D' | 'E' => {
  const tl = wall.template.acousticProperties.transmissionLoss;
  const avgTransmissionLoss = (tl.low + tl.mid + tl.high) / 3;

  const conditionFactors = {
    'excellent': 1.0,
    'good': 0.95,
    'fair': 0.85,
    'poor': 0.7,
    'damaged': 0.5
  };

  const adjustedTL = avgTransmissionLoss * (conditionFactors[wall.currentCondition] || 1.0);

  if (adjustedTL >= 55) return 'A';
  if (adjustedTL >= 48) return 'B';
  if (adjustedTL >= 40) return 'C';
  if (adjustedTL >= 30) return 'D';
  return 'E';
};