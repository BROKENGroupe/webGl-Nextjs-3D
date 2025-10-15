import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import * as THREE from 'three';
import { FloorCeiling } from './wallsStore';
import { Opening } from '../types/openings';
import { AcousticMaterial } from '@/modules/materials/types/AcousticMaterial';
import { Wall } from '../types/walls';

export interface FloorLevel {
  id: string;
  name: string;
  baseHeight: number; // Altura base en metros
  isActive: boolean; // Si es la planta actualmente visible/editable
  
  // Geometría de la planta
  coordinates: { x: number; z: number }[];
  
  // Elementos de la planta
  walls: Wall[];
  floors: FloorCeiling[];
  ceilings: FloorCeiling[];
  openings: Opening[];
  
  // Configuración
  wallHeight: number;
  
  // Metadatos
  createdAt: Date;
  replicatedFrom?: string; // ID de la planta origen si fue replicada
}

interface FloorsState {
  floorLevels: FloorLevel[];
  activeFloorId: string | null;
  globalWallHeight: number;
  
  // Actions
  addFloorLevel: (name: string, baseHeight: number, coordinates?: { x: number; z: number }[]) => string;
  removeFloorLevel: (floorId: string) => void;
  setActiveFloor: (floorId: string) => void;
  updateFloorLevel: (floorId: string, updates: Partial<FloorLevel>) => void;
  
  // Replicación
  replicateFloor: (sourceFloorId: string, targetHeight: number, options?: ReplicationOptions) => Promise<string>;
  replicateFloorMultiple: (sourceFloorId: string, count: number, heightIncrement: number, options?: ReplicationOptions) => Promise<string[]>;
  
  // Sincronización con stores actuales
  syncFromCurrentStores: () => void;
  loadFloorToCurrentStores: (floorId: string) => void;
  saveCurrentStoreToFloor: (floorId: string) => void;
  
  // Utilidades
  getFloorByHeight: (height: number) => FloorLevel | null;
  getAllFloorsAtHeight: (height: number) => FloorLevel[];
  clearAllFloors: () => void;
}

interface ReplicationOptions {
  replicateOpenings?: boolean;
  replicateMaterials?: boolean;
  customName?: string;
}

export const useFloorsStore = create<FloorsState>()(
  persist(
    (set, get) => ({
      floorLevels: [],
      activeFloorId: null,
      globalWallHeight: 3.0,

      addFloorLevel: (name, baseHeight, coordinates = []) => {
        const newFloorId = crypto.randomUUID();
        const newFloor: FloorLevel = {
          id: newFloorId,
          name,
          baseHeight,
          isActive: false,
          coordinates,
          walls: [],
          floors: [],
          ceilings: [],
          openings: [],
          wallHeight: get().globalWallHeight,
          createdAt: new Date(),
        };
        
        set((state) => ({
          floorLevels: [...state.floorLevels, newFloor]
        }));
        
        console.log('🏗️ Nueva planta creada:', newFloor);
        return newFloorId;
      },

      removeFloorLevel: (floorId) => {
        set((state) => {
          const newFloors = state.floorLevels.filter(f => f.id !== floorId);
          const newActiveId = state.activeFloorId === floorId 
            ? (newFloors[0]?.id || null) 
            : state.activeFloorId;
            
          return {
            floorLevels: newFloors,
            activeFloorId: newActiveId
          };
        });
      },

      setActiveFloor: (floorId) => {
        // Guardar la planta actual antes de cambiar
        const currentActive = get().activeFloorId;
        if (currentActive) {
          get().saveCurrentStoreToFloor(currentActive);
        }
        
        set((state) => ({
          floorLevels: state.floorLevels.map(floor => ({
            ...floor,
            isActive: floor.id === floorId
          })),
          activeFloorId: floorId
        }));
        
        // Cargar la nueva planta activa
        get().loadFloorToCurrentStores(floorId);
        console.log('🎯 Planta activa cambiada a:', floorId);
      },

      updateFloorLevel: (floorId, updates) => {
        set((state) => ({
          floorLevels: state.floorLevels.map(floor =>
            floor.id === floorId ? { ...floor, ...updates } : floor
          )
        }));
      },

      replicateFloor: async (sourceFloorId, targetHeight, options = {}) => {
        const { replicateOpenings = true, replicateMaterials = true, customName } = options;
        const sourceFloor = get().floorLevels.find(f => f.id === sourceFloorId);
        
        if (!sourceFloor) {
          throw new Error('Planta origen no encontrada');
        }

        console.log('🎨 Replicando planta con colores:', {
          sourceFloor: sourceFloor.name,
          wallsWithColors: sourceFloor.walls.filter(w => w.color).length,
          totalWalls: sourceFloor.walls.length
        });
        
        const newFloorName = customName || `${sourceFloor.name} (Duplicada)`;
        const newFloorId = get().addFloorLevel(newFloorName, targetHeight, [...sourceFloor.coordinates]);
        
        // Replicar paredes CONSERVANDO EXACTAMENTE LOS COLORES
        const replicatedWalls: Wall[] = sourceFloor.walls.map((wall, index) => {
          const newWall = {
            ...wall,
            id: `wall-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            // CONSERVAR COLORES DE FORMA EXPLÍCITA
            color: wall.color || "#f21111ff", // Color por defecto si no existe
            template: wall.template,
            currentCondition: wall.currentCondition,
            // Mantener posiciones
            start: { ...wall.start },
            end: { ...wall.end }
          };

          console.log(`🎨 Pared ${index} replicada:`, {
            original: wall.color,
            replicada: newWall.color,
            hasTemplate: !!wall.template
          });

          return newWall;
        });
        
        // Replicar pisos conservando colores
        const replicatedFloors: FloorCeiling[] = sourceFloor.floors.map((floor) => ({
          ...floor,
          id: `floor-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          color: floor.color || "#cccccc",
          template: floor.template
        }));
        
        // Replicar techos conservando colores
        const replicatedCeilings: FloorCeiling[] = sourceFloor.ceilings.map((ceiling) => ({
          ...ceiling,
          id: `ceiling-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          color: ceiling.color || "#ffffff",
          template: ceiling.template
        }));
        
        // Replicar aberturas conservando colores
        const replicatedOpenings: Opening[] = replicateOpenings 
          ? sourceFloor.openings.map((opening) => ({
              ...opening,
              id: `opening-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              color: opening.color,
              template: opening.template,
              position: opening.position
            }))
          : [];
        
        // Actualizar la nueva planta
        get().updateFloorLevel(newFloorId, {
          walls: replicatedWalls,
          floors: replicatedFloors,
          ceilings: replicatedCeilings,
          openings: replicatedOpenings,
          wallHeight: sourceFloor.wallHeight,
          replicatedFrom: sourceFloorId
        });
        
        console.log('✅ Planta replicada con colores conservados:', {
          sourceId: sourceFloorId,
          newId: newFloorId,
          wallsWithColors: replicatedWalls.filter(w => w.color && w.color !== "#f21111ff").length,
          totalWalls: replicatedWalls.length
        });
        
        return newFloorId;
      },

      replicateFloorMultiple: async (sourceFloorId, count, heightIncrement, options = {}) => {
        const results: string[] = [];
        const sourceFloor = get().floorLevels.find(f => f.id === sourceFloorId);
        
        if (!sourceFloor) {
          throw new Error('Planta origen no encontrada');
        }
        
        for (let i = 0; i < count; i++) {
          const targetHeight = sourceFloor.baseHeight + ((i + 1) * heightIncrement);
          const customName = `${sourceFloor.name} - Planta ${get().floorLevels.length + i + 1}`;
          
          try {
            const newFloorId = await get().replicateFloor(sourceFloorId, targetHeight, {
              ...options,
              customName
            });
            results.push(newFloorId);
          } catch (error) {
            console.error(`❌ Error replicando planta ${i + 1}:`, error);
            break;
          }
        }
        
        return results;
      },

      syncFromCurrentStores: () => {
        // NO SINCRONIZAR SI YA HAY PLANTAS (evita borrar colores)
        if (get().floorLevels.length > 0) {
          console.log('🚫 Ya existen plantas, evitando sincronización que borre colores');
          return;
        }

        // Importar los stores actuales
        const { useWallsStore } = require('./wallsStore');
        const { useOpeningsStore } = require('./openingsStore');
        const { useDrawingStore } = require('./drawingStore');
        
        const wallsState = useWallsStore.getState();
        const openingsState = useOpeningsStore.getState();
        const drawingState = useDrawingStore.getState();
        
        console.log('🎨 Estado actual de paredes antes de sincronizar:', wallsState.walls.map((w: Wall) => ({ id: w.id, color: w.color })));
        
        if (drawingState.hasPlaneCoordinates && drawingState.planeXZCoordinates.length > 0) {
          const floorId = get().addFloorLevel(
            'Planta Principal', 
            0, 
            drawingState.planeXZCoordinates
          );
          
          // CONSERVAR TODOS LOS COLORES Y MATERIALES EXACTOS
          get().updateFloorLevel(floorId, {
            walls: wallsState.walls.map((wall: Wall) => ({
              ...wall,
              // CONSERVAR EXACTAMENTE LOS COLORES ORIGINALES
              color: wall.color,
              template: wall.template,
              currentCondition: wall.currentCondition,
              // Asegurar que el ID se mantenga para referencia
              originalId: wall.id
            })),
            floors: wallsState.floors.map((floor: FloorCeiling) => ({
              ...floor,
              color: floor.color,
              template: floor.template,
              originalId: floor.id
            })),
            ceilings: wallsState.ceilings.map((ceiling: FloorCeiling) => ({
              ...ceiling,
              color: ceiling.color,
              template: ceiling.template,
              originalId: ceiling.id
            })),
            openings: openingsState.openings.map((opening: Opening) => ({
              ...opening,
              color: opening.color,
              template: opening.template,
              originalId: opening.id
            })),
            wallHeight: wallsState.wallHeight
          });
          
          get().setActiveFloor(floorId);
          console.log('✅ Sincronizado conservando colores:', {
            walls: wallsState.walls.length,
            colorsPreserved: wallsState.walls.filter((w: Wall) => w.color).length
          });
        }
      },

      loadFloorToCurrentStores: (floorId) => {
        const floor = get().floorLevels.find(f => f.id === floorId);
        if (!floor) return;
        
        // Cargar en los stores actuales
        const { useWallsStore } = require('./wallsStore');
        const { useOpeningsStore } = require('./openingsStore');
        const { useDrawingStore } = require('./drawingStore');
        
        const wallsActions = useWallsStore.getState();
        const openingsActions = useOpeningsStore.getState();
        const drawingActions = useDrawingStore.getState();
        
        // Limpiar stores actuales
        wallsActions.clearWalls();
        wallsActions.clearFloors();
        wallsActions.clearCeilings();
        openingsActions.clearOpenings();
        
        // Cargar datos de la planta
        wallsActions.setWallHeight(floor.wallHeight);
        
        // Cargar coordenadas
        drawingActions.clearPlaneCoordinates();
        if (floor.coordinates.length > 0) {
          const points = floor.coordinates.map(coord => 
            new THREE.Vector3(coord.x, floor.baseHeight, coord.z)
          );
          drawingActions.setCurrentPoints(points);
          drawingActions.savePlaneCoordinates();
        }
        
        // Cargar elementos CONSERVANDO COLORES
        floor.walls.forEach(wall => {
          useWallsStore.setState((state: any) => ({
            walls: [...state.walls, {
              ...wall,
              // ASEGURAR QUE SE MANTENGAN LOS COLORES
              color: wall.color,
              template: wall.template,
              currentCondition: wall.currentCondition
            }]
          }));
        });
        
        floor.floors.forEach(floorElement => {
          useWallsStore.setState((state: any) => ({
            floors: [...state.floors, {
              ...floorElement,
              // CONSERVAR COLORES DE PISOS
              color: floorElement.color,
              template: floorElement.template
            }]
          }));
        });
        
        floor.ceilings.forEach(ceiling => {
          useWallsStore.setState((state: any) => ({
            ceilings: [...state.ceilings, {
              ...ceiling,
              // CONSERVAR COLORES DE TECHOS
              color: ceiling.color,
              template: ceiling.template
            }]
          }));
        });
        
        floor.openings.forEach(opening => {
          useOpeningsStore.setState((state: any) => ({
            openings: [...state.openings, {
              ...opening,
              // CONSERVAR COLORES DE ABERTURAS
              color: opening.color,
              template: opening.template
            }]
          }));
        });
        
        console.log('📂 Planta cargada en stores actuales CON COLORES CONSERVADOS:', floorId);
      },

      saveCurrentStoreToFloor: (floorId) => {
        const { useWallsStore } = require('./wallsStore');
        const { useOpeningsStore } = require('./openingsStore');
        const { useDrawingStore } = require('./drawingStore');
        
        const wallsState = useWallsStore.getState();
        const openingsState = useOpeningsStore.getState();
        const drawingState = useDrawingStore.getState();
        
        get().updateFloorLevel(floorId, {
          coordinates: drawingState.planeXZCoordinates,
          walls: wallsState.walls,
          floors: wallsState.floors,
          ceilings: wallsState.ceilings,
          openings: openingsState.openings,
          wallHeight: wallsState.wallHeight
        });
        
        console.log('💾 Stores actuales guardados en planta:', floorId);
      },

      getFloorByHeight: (height) => {
        return get().floorLevels.find(floor => 
          Math.abs(floor.baseHeight - height) < 0.1
        ) || null;
      },

      getAllFloorsAtHeight: (height) => {
        return get().floorLevels.filter(floor => 
          Math.abs(floor.baseHeight - height) < 0.1
        );
      },

      clearAllFloors: () => {
        set({
          floorLevels: [],
          activeFloorId: null
        });
      }
    }),
    {
      name: 'floors-storage',
      partialize: (state) => ({
        floorLevels: state.floorLevels.map(floor => ({
          ...floor,
          createdAt: floor.createdAt.toISOString() // Serializar fecha
        })),
        activeFloorId: state.activeFloorId,
        globalWallHeight: state.globalWallHeight
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.floorLevels) {
          // Deserializar fechas
          state.floorLevels = state.floorLevels.map(floor => ({
            ...floor,
            createdAt: new Date(floor.createdAt)
          }));
        }
      }
    }
  )
);