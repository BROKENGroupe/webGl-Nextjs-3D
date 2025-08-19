import { create } from 'zustand';
import { Floor } from '@/types/floor';
import { GeometryEngine } from '@/lib/engine/GeometryEngine';

interface BuildingState {
  floors: Floor[];
  floorElements: any[]; // Add this line to declare floorElements
  addFloor: (floor: Floor) => void;
  replicateFloor: (floorId: string) => void;
  addFloorElement: (element: any) => void; // Se añadió el tipo 'any' como ejemplo, ajustar según sea necesario
}
export const useBuildingStore = create<BuildingState>((set, get) => ({
  floors: [],
  floorElements: [], // Initialize floorElements
  addFloor: (floor) => set(state => ({ floors: [...state.floors, floor] })),
  replicateFloor: (floorId) => {
    const floor = get().floors.find(f => f.id === floorId);
    if (floor) {
      const newHeight = floor.baseHeight + 3; // ejemplo: 3m más arriba
      const newFloor = GeometryEngine.replicateFloor(floor, newHeight);
      set(state => ({ floors: [...state.floors, newFloor] }));
    }
  },
  addFloorElement: (element) => set(state => ({
    floorElements: [...state.floorElements, element]
  }))
}));
