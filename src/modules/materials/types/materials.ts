// types/materials.ts

export type ThirdOctave = typeof THIRD_OCTAVE_BANDS[number];

export const THIRD_OCTAVE_BANDS = [
  50, 63, 80, 100, 125, 160, 200, 250, 315, 400, 500, 630,
  800, 1000, 1250, 1600, 2000, 2500, 3150, 4000, 5000,
] as const;

export type MaterialCategory = 'ALL' | 'WALLS' | 'FLOORS' | 'DOORS' | 'WINDOWS' | 'OTHER';

export interface Material {
  id: string;
  name: string;
  description: string;
  category: MaterialCategory;
  density: number;
  reference: string;
  is_active: boolean;
  picture: string | null;
  rw: number;
  descriptor: string;
  subtype: string;
  type: string;
  comments?: string;
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

export type ViewMode = 'cards' | 'table';