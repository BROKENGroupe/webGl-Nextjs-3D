// types/materials.ts
export interface AcousticIndex {
  frequency: number;
  value_R: number;
}

export interface MaterialProperties {
  density: number;
  refernce: string; 
  name: string;
  description: string;
  category: MaterialCategory;
  acoustic_indices: AcousticIndex[];
  is_active: boolean;
  picture: string | null;
  rw: number;
}

export interface MaterialDetail extends MaterialProperties {
  reference: string;
}

export type ViewMode = 'cards' | 'table';
export type MaterialCategory = 'ALL' | 'WALLS' | 'FLOORS' | 'DOORS' | 'WINDOWS' | 'OTHER';