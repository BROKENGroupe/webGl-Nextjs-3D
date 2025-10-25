import { create } from 'zustand';
import { Floor } from '@/modules/editor/types/floor';
import { GeometryEngine } from '../core/engine/GeometryEngine';
import EngineFactory from '../core/engine/EngineFactory';

interface BuildingState {
  floors: Floor[];
  floorElements: any[];
  addFloor: (floor: Floor) => void;
  replicateFloor: (floorId: string) => void;
  addFloorElement: (element: any) => void;
}
export const useBuildingStore = create<BuildingState>((set, get) => ({
  floors: [],
  floorElements: [],
  addFloor: (floor) => set(state => ({ floors: [...state.floors, floor] })),
  replicateFloor: (floorId) => {
    const floor = get().floors.find(f => f.id === floorId);
    if (floor) {
      const newHeight = floor.baseHeight + 3;

      const GeometryEngine = EngineFactory.getGeometryAdapter();

      const newFloor = GeometryEngine.replicateFloor(floor, newHeight);
      set(state => ({ floors: [...state.floors, newFloor] }));
    }
  },
  addFloorElement: (element) => set(state => ({
    floorElements: [...state.floorElements, element]
  }))
}));
