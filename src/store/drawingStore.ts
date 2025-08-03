import { create } from 'zustand';
import * as THREE from 'three';

interface DrawingState {
  // Estados existentes
  currentPoints: THREE.Vector3[];
  currentHoleLines: [THREE.Vector3, THREE.Vector3][];
  currentHoles: { from: THREE.Vector3; to: THREE.Vector3 }[];
  savedPointsForExtrusion: THREE.Vector3[];
  savedHoleLinesForExtrusion: [THREE.Vector3, THREE.Vector3][];
  savedHolesForExtrusion: { from: THREE.Vector3; to: THREE.Vector3 }[];
  isClosed: boolean;
  isExtruded: boolean;
  isDragging: boolean;
  
  // Nuevos estados para coordenadas XZ del plano 2D
  planeXZCoordinates: { x: number; z: number }[];
  planeHoleCoordinates: { from: { x: number; z: number }; to: { x: number; z: number } }[];
  hasPlaneCoordinates: boolean;

  // Acciones existentes
  setCurrentPoints: (points: THREE.Vector3[]) => void;
  addCurrentPoint: (point: THREE.Vector3) => void;
  updateCurrentPoint: (index: number, point: THREE.Vector3) => void;
  removeCurrentPoint: (index: number) => void;
  setCurrentHoleLines: (lines: [THREE.Vector3, THREE.Vector3][]) => void;
  setCurrentHoles: (holes: { from: THREE.Vector3; to: THREE.Vector3 }[]) => void;
  saveCurrentStateForExtrusion: () => void;
  setClosed: (closed: boolean) => void;
  setExtruded: (extruded: boolean) => void;
  setDragging: (dragging: boolean) => void;
  resetAll: () => void;
  
  // Nuevas acciones para manejar coordenadas XZ
  savePlaneCoordinates: () => void;
  clearPlaneCoordinates: () => void;
  updatePlaneCoordinatesFromCurrent: () => void;
}

export const useDrawingStore = create<DrawingState>((set, get) => ({
  // Estados iniciales existentes
  currentPoints: [],
  currentHoleLines: [],
  currentHoles: [],
  savedPointsForExtrusion: [],
  savedHoleLinesForExtrusion: [],
  savedHolesForExtrusion: [],
  isClosed: false,
  isExtruded: false,
  isDragging: false,
  
  // Nuevos estados iniciales
  planeXZCoordinates: [],
  planeHoleCoordinates: [],
  hasPlaneCoordinates: false,

  // Acciones existentes
  setCurrentPoints: (points) => set({ currentPoints: points }),
  addCurrentPoint: (point) => set((state) => ({ 
    currentPoints: [...state.currentPoints, point] 
  })),
  updateCurrentPoint: (index, point) => set((state) => ({
    currentPoints: state.currentPoints.map((p, i) => i === index ? point : p)
  })),
  removeCurrentPoint: (index) => set((state) => ({
    currentPoints: state.currentPoints.filter((_, i) => i !== index)
  })),
  setCurrentHoleLines: (lines) => set({ currentHoleLines: lines }),
  setCurrentHoles: (holes) => set({ currentHoles: holes }),
  saveCurrentStateForExtrusion: () => set((state) => ({
    savedPointsForExtrusion: [...state.currentPoints],
    savedHoleLinesForExtrusion: [...state.currentHoleLines],
    savedHolesForExtrusion: [...state.currentHoles]
  })),
  setClosed: (closed) => set({ isClosed: closed }),
  setExtruded: (extruded) => set({ isExtruded: extruded }),
  setDragging: (dragging) => set({ isDragging: dragging }),
  resetAll: () => set({
    currentPoints: [],
    currentHoleLines: [],
    currentHoles: [],
    savedPointsForExtrusion: [],
    savedHoleLinesForExtrusion: [],
    savedHolesForExtrusion: [],
    isClosed: false,
    isExtruded: false,
    isDragging: false,
    planeXZCoordinates: [],
    planeHoleCoordinates: [],
    hasPlaneCoordinates: false
  }),
  
  // Nuevas acciones para coordenadas XZ
  savePlaneCoordinates: () => {
    const state = get();
    console.log('Guardando coordenadas del plano XZ...');
    console.log('Puntos actuales:', state.currentPoints.map(p => ({ x: p.x, y: p.y, z: p.z })));
    
    // Extraer coordenadas X y Z de los puntos actuales (Y siempre es 0 en 2D)
    const xzCoordinates = state.currentPoints.map(point => ({
      x: point.x,
      z: point.z
    }));
    
    // Extraer coordenadas X y Z de los agujeros
    const holeCoordinates = state.currentHoles.map(hole => ({
      from: { x: hole.from.x, z: hole.from.z },
      to: { x: hole.to.x, z: hole.to.z }
    }));
    
    console.log('Coordenadas XZ guardadas:', xzCoordinates);
    console.log('Coordenadas agujeros XZ:', holeCoordinates);
    
    set({
      planeXZCoordinates: xzCoordinates,
      planeHoleCoordinates: holeCoordinates,
      hasPlaneCoordinates: true
    });
  },
  
  clearPlaneCoordinates: () => set({
    planeXZCoordinates: [],
    planeHoleCoordinates: [],
    hasPlaneCoordinates: false
  }),
  
  updatePlaneCoordinatesFromCurrent: () => {
    const state = get();
    if (state.hasPlaneCoordinates) {
      // Solo actualizar si ya tenemos coordenadas guardadas
      state.savePlaneCoordinates();
    }
  }
}));
