import { create } from 'zustand';
import { persist } from 'zustand/middleware';
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

  // Nuevos estados para paredes internas
  internalWalls: { start: THREE.Vector3; end: THREE.Vector3 }[];

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

  // Nuevas acciones para paredes internas
  addInternalWall: (start: THREE.Vector3, end: THREE.Vector3) => void;
  removeInternalWall: (index: number) => void;
}

// Función para asegurar que un objeto es Vector3
const ensureVector3 = (obj: any): THREE.Vector3 => {
  if (obj instanceof THREE.Vector3) {
    return obj;
  }
  return new THREE.Vector3(obj.x || 0, obj.y || 0, obj.z || 0);
};

export const useDrawingStore = create<DrawingState>()(
  persist(
    (set, get) => ({
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
      internalWalls: [],

      // Acciones existentes
      setCurrentPoints: (points) => set({ 
        currentPoints: points.map(ensureVector3) 
      }),
      addCurrentPoint: (point) => set((state) => ({ 
        currentPoints: [...state.currentPoints, ensureVector3(point)] 
      })),
      updateCurrentPoint: (index, point) => set((state) => ({
        currentPoints: state.currentPoints.map((p, i) => i === index ? ensureVector3(point) : ensureVector3(p))
      })),
      removeCurrentPoint: (index) => set((state) => ({
        currentPoints: state.currentPoints.filter((_, i) => i !== index).map(ensureVector3)
      })),
      setCurrentHoleLines: (lines) => set({ 
        currentHoleLines: lines.map(line => [ensureVector3(line[0]), ensureVector3(line[1])] as [THREE.Vector3, THREE.Vector3])
      }),
      setCurrentHoles: (holes) => set({ 
        currentHoles: holes.map(hole => ({
          from: ensureVector3(hole.from),
          to: ensureVector3(hole.to)
        }))
      }),
      saveCurrentStateForExtrusion: () => set((state) => ({
        savedPointsForExtrusion: state.currentPoints.map(ensureVector3),
        savedHoleLinesForExtrusion: state.currentHoleLines.map(line => [ensureVector3(line[0]), ensureVector3(line[1])] as [THREE.Vector3, THREE.Vector3]),
        savedHolesForExtrusion: state.currentHoles.map(hole => ({
          from: ensureVector3(hole.from),
          to: ensureVector3(hole.to)
        }))
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
        hasPlaneCoordinates: false,
        internalWalls: [],
      }),
      
      // Nuevas acciones para coordenadas XZ
      savePlaneCoordinates: () => {
        const state = get();
        console.log('🔍 Guardando coordenadas del plano...');
        console.log('📍 currentPoints antes de guardar:', state.currentPoints);
        
        if (state.currentPoints.length === 0) {
          console.warn('⚠️ No hay puntos para guardar');
          return;
        }

        // Convertir Vector3 a coordenadas XZ planas
        const xzCoordinates = state.currentPoints.map((point, index) => {
          const coord = { x: point.x, z: point.z };
          console.log(`📍 Punto ${index}:`, coord);
          return coord;
        });

        // CRÍTICO: Remover el último punto si es igual al primero (forma cerrada)
        const cleanCoordinates = xzCoordinates.length > 1 && 
          Math.abs(xzCoordinates[0].x - xzCoordinates[xzCoordinates.length - 1].x) < 0.001 &&
          Math.abs(xzCoordinates[0].z - xzCoordinates[xzCoordinates.length - 1].z) < 0.001
          ? xzCoordinates.slice(0, -1) // Remover último punto duplicado
          : xzCoordinates;

        console.log('✅ Coordenadas XZ guardadas:', cleanCoordinates);
        
        set({
          planeXZCoordinates: cleanCoordinates,
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
      },
      
      // Nuevas acciones para paredes internas
      addInternalWall: (start, end) =>
        set((state) => ({
          internalWalls: [
            ...state.internalWalls,
            { start: ensureVector3(start), end: ensureVector3(end) }
          ],
        })),
      removeInternalWall: (index) =>
        set((state) => ({
          internalWalls: state.internalWalls.filter((_, i) => i !== index),
        })),
    }),
    {
      name: 'drawing-storage',
      
      // Persistir solo los datos esenciales (sin Vector3 complejos)
      partialize: (state: DrawingState) => ({
        // Convertir Vector3 a objetos planos para el storage
        currentPoints: state.currentPoints.map(p => ({ x: p.x, y: p.y, z: p.z })),
        currentHoleLines: state.currentHoleLines.map(line => [
          { x: line[0].x, y: line[0].y, z: line[0].z },
          { x: line[1].x, y: line[1].y, z: line[1].z }
        ]),
        currentHoles: state.currentHoles.map(hole => ({
          from: { x: hole.from.x, y: hole.from.y, z: hole.from.z },
          to: { x: hole.to.x, y: hole.to.y, z: hole.to.z }
        })),
        savedPointsForExtrusion: state.savedPointsForExtrusion.map(p => ({ x: p.x, y: p.y, z: p.z })),
        savedHoleLinesForExtrusion: state.savedHoleLinesForExtrusion.map(line => [
          { x: line[0].x, y: line[0].y, z: line[0].z },
          { x: line[1].x, y: line[1].y, z: line[1].z }
        ]),
        savedHolesForExtrusion: state.savedHolesForExtrusion.map(hole => ({
          from: { x: hole.from.x, y: hole.from.y, z: hole.from.z },
          to: { x: hole.to.x, y: hole.to.y, z: hole.to.z }
        })),
        isClosed: state.isClosed,
        isExtruded: state.isExtruded,
        planeXZCoordinates: state.planeXZCoordinates,
        planeHoleCoordinates: state.planeHoleCoordinates,
        hasPlaneCoordinates: state.hasPlaneCoordinates,
        internalWalls: state.internalWalls.map(w => ({
          start: { x: w.start.x, y: w.start.y, z: w.start.z },
          end: { x: w.end.x, y: w.end.y, z: w.end.z }
        })),
      }),
      
      // Reconstruir Vector3 cuando se carga desde storage
      onRehydrateStorage: () => {
        console.log('🔄 Cargando datos desde localStorage...');
        return (state, error) => {
          if (error) {
            console.error('❌ Error al cargar datos desde localStorage:', error);
          } else if (state) {
            console.log('✅ Datos cargados exitosamente desde localStorage');
            
            // Reconstruir Vector3 desde objetos planos
            state.currentPoints = (state.currentPoints as any[])?.map(ensureVector3) || [];
            state.currentHoleLines = (state.currentHoleLines as any[])?.map(line => [
              ensureVector3(line[0]), 
              ensureVector3(line[1])
            ] as [THREE.Vector3, THREE.Vector3]) || [];
            state.currentHoles = (state.currentHoles as any[])?.map(hole => ({
              from: ensureVector3(hole.from),
              to: ensureVector3(hole.to)
            })) || [];
            state.savedPointsForExtrusion = (state.savedPointsForExtrusion as any[])?.map(ensureVector3) || [];
            state.savedHoleLinesForExtrusion = (state.savedHoleLinesForExtrusion as any[])?.map(line => [
              ensureVector3(line[0]), 
              ensureVector3(line[1])
            ] as [THREE.Vector3, THREE.Vector3]) || [];
            state.savedHolesForExtrusion = (state.savedHolesForExtrusion as any[])?.map(hole => ({
              from: ensureVector3(hole.from),
              to: ensureVector3(hole.to)
            })) || [];
            state.internalWalls = (state.internalWalls as any[])?.map(w => ({
              start: ensureVector3(w.start),
              end: ensureVector3(w.end)
            })) || [];
            
            console.log('📊 Estado recuperado con Vector3 reconstruidos');
          }
        };
      },
    }
  )
);
