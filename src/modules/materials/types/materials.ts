// types/materials.ts

export type ThirdOctave = typeof THIRD_OCTAVE_BANDS[number];

export const THIRD_OCTAVE_BANDS = [
  50, 63, 80, 100, 125, 160, 200, 250, 315, 400, 500, 630,
  800, 1000, 1250, 1600, 2000, 2500, 3150, 4000, 5000,
] as const;

export type MaterialType = 'ALL' | 'wall' | 'floor' | 'door' | 'window' | 'ceiling' | 'other' ;

export interface Material {
  _id?: string;
  name: string;
  description: string;
  density: number;
  reference: string;
  is_active: boolean;
  picture: string | null;
  descriptor: string;
  subtype: string;
  type: MaterialType;
  thickness_mm: number;
  mass_kg_m2: number;
  catalog: string;
  color?: string;
  doubleLeaf?: boolean;
  lightweightElement?: boolean;
  onElasticBands?: boolean;
  layers: { name: string; thickness_mm: number }[];
  thirdOctaveBands: Record<ThirdOctave, number>;
  octaveBands: { range: string; value: string }[];
  weightedIndex?: { Rw: number; C: number; Ctr: number };
  imageRef?: string;
  width: number;
  height: number;
  bottomOffset: number;
}

export interface CreateMaterial extends Omit<Material, '_id' | 'created_at' | 'updated_at'> {
}

export interface UpdateMaterialRequest extends Partial<Material> {
  id?: string;
}


export type ViewMode = 'cards' | 'table';