import { doorStandard, doorDouble, doorAcoustic } from "@/data/acousticDoors";
import { windowStandard, windowDoubleGlazed } from "@/data/acousticWindows";
import { AcousticMaterial } from "./AcousticMaterial";


export type OpeningType = 'door' | 'window' | 'double-door' | 'sliding-door';

export interface Point2D {
  x: number;  
  z: number;
}

export interface Opening {
  id?: string;
  type: OpeningType;
  title: string;
  wallIndex: number;
  relativePosition: number;
  position: number;
  width: number;
  height: number;
  bottomOffset: number;
  template: AcousticMaterial; // Ahora el template es el material real
  currentCondition: 'closed_sealed' | 'closed_unsealed' | 'partially_open' | 'fully_open' | 'damaged';
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

// Ahora OPENING_TEMPLATES contiene los materiales reales
export const OPENING_TEMPLATES: Record<string, AcousticMaterial> = {
  'door-standard': doorStandard,
  'door-double': doorDouble,
  'window-standard': windowStandard,
  'window-double-glazed': windowDoubleGlazed,
  'door-acoustic': doorAcoustic
};

// Ejemplo de uso en cálculo
export const calculateOpeningArea = (opening: Opening): number => {
  return opening.width * opening.height;
};

export const calculateOpeningAcousticRating = (opening: Opening): 'A' | 'B' | 'C' | 'D' | 'E' => {
  // Usamos el índice ponderado real del material
  const rw = opening.template.weightedIndex?.Rw ?? 0;

  const conditionFactors = {
    'closed_sealed': 1.0,
    'closed_unsealed': 0.8,
    'partially_open': 0.4,
    'fully_open': 0.1,
    'damaged': 0.5
  };

  const adjustedRw = rw * (conditionFactors[opening.currentCondition] || 1.0);

  if (adjustedRw >= 35) return 'A';
  if (adjustedRw >= 28) return 'B';
  if (adjustedRw >= 20) return 'C';
  if (adjustedRw >= 15) return 'D';
  return 'E';
};

export const syncOpeningPosition = (opening: Opening): Opening => {
  return {
    ...opening,
    position: opening.relativePosition,
    relativePosition: opening.position || opening.relativePosition
  };
};