import { create } from 'zustand';
import { GeometryEngine } from '@/engine/GeometryEngine';
import { Floor } from '@/types/floor';

interface BuildingState {
  floors: Floor[];
  addFloor: (floor: Floor) => void;
  replicateFloor: (floorId: string) => void;
}

export const useBuildingStore = create<BuildingState>((set, get) => ({
  floors: [],
  addFloor: (floor) => set(state => ({ floors: [...state.floors, floor] })),
  replicateFloor: (floorId) => {
    const floor = get().floors.find(f => f.id === floorId);
    if (floor) {
      const newHeight = floor.baseHeight + 3; // ejemplo: 3m más arriba
      const newFloor = GeometryEngine.replicateFloor(floor, newHeight);
      set(state => ({ floors: [...state.floors, newFloor] }));
    }
  },
}));