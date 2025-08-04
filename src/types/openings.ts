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

export interface Point2D {
  x: number;
  z: number;
}

// ✅ AGREGAR esta interfaz que falta:
export interface WallSegment {
  startX: number;
  endX: number;
  height: number;
  startY?: number;  // Para segmentos superiores (dinteles)
  endY?: number;    // Para segmentos superiores (dinteles)
}