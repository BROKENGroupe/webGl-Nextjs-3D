export type OpeningType = 'door' | 'window' | 'double-door' | 'sliding-door';

export interface Opening {
  id: string;
  type: OpeningType;
  wallIndex: number;           // En qué pared está (0, 1, 2, ...)
  position: number;            // Posición en la pared (0-1, porcentaje)
  width: number;               // Ancho en metros
  height: number;              // Alto en metros
  bottomOffset: number;        // Distancia desde el piso (para ventanas)
}

export interface OpeningTemplate {
  type: OpeningType;
  name: string;
  defaultWidth: number;
  defaultHeight: number;
  defaultBottomOffset: number;
  icon: string;                // Emoji o icono
  color: string;               // Color del template
}