export type OpeningType = 'door' | 'window' | 'double-door' | 'sliding-door';

export interface OpeningTemplate {
  id: string;
  type: 'door' | 'window' | 'double-door' | 'sliding-door';
  name: string;
  width: number;   // metros
  height: number;  // metros
  bottomOffset: number; // metros desde el suelo
  icon?: string;   // emoji para la UI
}

export interface Opening {
  id: string;
  wallIndex: number;
  position: number; // 0-1 posición relativa en la pared
  width: number;
  height: number;
  bottomOffset: number;
  type: 'door' | 'window' | 'double-door' | 'sliding-door';
  template?: OpeningTemplate;
}