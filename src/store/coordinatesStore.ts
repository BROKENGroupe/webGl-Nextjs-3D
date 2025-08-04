// Verificar que tenga esta estructura:

import { create } from "zustand";

interface Coordinate {
  x: number;
  z: number;
}

interface CoordinatesStore {
  coordinates: Coordinate[];
  setCoordinates: (coordinates: Coordinate[]) => void;
  addCoordinate: (coordinate: Coordinate) => void;
  clearCoordinates: () => void;
}

export const useCoordinatesStore = create<CoordinatesStore>((set) => ({
  coordinates: [],
  setCoordinates: (coordinates) => set({ coordinates }),
  addCoordinate: (coordinate) => set((state) => ({ 
    coordinates: [...state.coordinates, coordinate] 
  })),
  clearCoordinates: () => set({ coordinates: [] }),
}));