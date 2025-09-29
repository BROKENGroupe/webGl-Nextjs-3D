export const THIRD_OCTAVE_BANDS = [
  50, 63, 80, 100, 125, 160, 200, 250, 315, 400, 500, 630,
  800, 1000, 1250, 1600, 2000, 2500, 3150, 4000, 5000,
] as const;

export type ThirdOctave = typeof THIRD_OCTAVE_BANDS[number];

export interface AcousticMaterial {
  id: string;
  descriptor: string;
  subtype: string;
  type: string;
  comments?: string;
  thickness_mm: number;
  mass_kg_m2: number;
  catalog: string;

  // Flags
  colorName?: string;
  color?: string;
  doubleLeaf?: boolean;
  lightweightElement?: boolean;
  onElasticBands?: boolean;

  // Capas constructivas
  layers: { name: string; thickness_mm: number }[];

  // Tercios de octava (valores R[dB])
  thirdOctaveBands: Record<ThirdOctave, number>;

  // Bandas de octava resumidas (como aparecen en la tabla final)
  octaveBands: { range: string; value: string }[];

  // Índice ponderado
  weightedIndex?: { Rw: number; C: number; Ctr: number };

  imageRef?: string;

  width:number,
  height:number,
  bottomOffset:number
}