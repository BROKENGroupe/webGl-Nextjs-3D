import { wallCeramicBrick, wallConcreteBlock, wallGypsumBoard } from "@/data/acousticWalls";
import { AcousticMaterial, ThirdOctave } from "./AcousticMaterial";
import { floorAcousticPanel, floorConcreteSlab } from "@/data/floors";
import { ceilingAcousticPanel, ceilingConcreteSlab } from "@/data/acousticCeilings";

export type WallCondition = 'excellent' | 'good' | 'fair' | 'poor' | 'damaged';

export enum ElementType {
  Wall = "wall",
  Floor = "floor",
  Ceiling = "ceiling",
  Door = "door",
  Window = "window",
  Opening = "opening"
}  


export interface WallTemplate {
  id: string;
  name: string;
  material: string;
  thickness: number; // en metros
  acousticProperties: {
    transmissionLoss: { low: number; mid: number; high: number; };
    rw: number; // <- Añadido para ISO
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
  title: string;
  wallIndex: number;
  color: string;
  template: AcousticMaterial;
  start: { x: number; z: number };
  end: { x: number; z: number };
  area: number;
  currentCondition: WallCondition;
  acousticRating?: 'A' | 'B' | 'C' | 'D' | 'E';
}

// ✅ TEMPLATES SIMPLES


// ...materiales definidos arriba...

export const WALL_TEMPLATES: Record<string, AcousticMaterial> = {
  'wall-ceramic-brick': wallCeramicBrick,
  'wall-concrete-block': wallConcreteBlock,
  'wall-gypsum-board': wallGypsumBoard
};

// Define templates para piso y techo igual que para paredes
export const FLOOR_TEMPLATES: Record<string, AcousticMaterial> = {
  "floor-concrete-slab": floorConcreteSlab,
  "floor-acoustic-panel": floorAcousticPanel,
  // puedes agregar más tipos aquí
};

export const CEILING_TEMPLATES: Record<string, AcousticMaterial> = {
  "ceiling-concrete-slab": ceilingConcreteSlab,
  "ceiling-acoustic-panel": ceilingAcousticPanel,
  // puedes agregar más tipos aquí
};

export const calculateWallAcousticRating = (wall: Wall): 'A' | 'B' | 'C' | 'D' | 'E' => {
  // Usar bandas clave del modelo AcousticMaterial
  const bands: ThirdOctave[] = [125, 500, 2000];
  const tlBands = bands.map(band => wall.template.thirdOctaveBands[band] ?? 0);
  const avgTransmissionLoss = tlBands.reduce((a, b) => a + b, 0) / tlBands.length;

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