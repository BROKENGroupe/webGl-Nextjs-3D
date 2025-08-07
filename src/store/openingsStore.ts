import { Opening } from '@/types/openings';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useWallsStore } from './wallsStore';

interface OpeningsState {
  openings: Opening[];
  
  // Actions
  addOpening: (opening: Opening) => void;
  removeOpening: (id: string) => void;
  updateOpening: (id: string, updates: Partial<Opening>) => void;
  clearOpenings: () => void;
  getOpeningsByWall: (wallIndex: number) => Opening[];
  updateOpeningPosition: (openingId: string, newWallIndex: number, newPosition: number) => void;
}

export const useOpeningsStore = create<OpeningsState>()(
  persist(
    (set, get) => ({
      openings: [],
      
      addOpening: (opening) => {
        console.log('🏠 Agregando abertura:', opening);
        set((state) => ({
          openings: [...state.openings, opening]
        }));
        
        // ✅ TRIGGER RECÁLCULO ACÚSTICO
        const { recalculateAllWallsWithOpenings } = useWallsStore.getState();
        setTimeout(() => {
          recalculateAllWallsWithOpenings(get().openings);
        }, 100);
      },
      
      removeOpening: (id) => {
        console.log('🗑️ Eliminando abertura:', id);
        set((state) => ({
          openings: state.openings.filter(opening => opening.id !== id)
        }));
        
        // ✅ TRIGGER RECÁLCULO ACÚSTICO
        const { recalculateAllWallsWithOpenings } = useWallsStore.getState();
        setTimeout(() => {
          recalculateAllWallsWithOpenings(get().openings);
        }, 100);
      },
      
      updateOpening: (id, updates) => {
        console.log('✏️ Actualizando abertura:', id, updates);
        set((state) => ({
          openings: state.openings.map(opening => 
            opening.id === id ? { ...opening, ...updates } : opening
          )
        }));
        
        // ✅ TRIGGER RECÁLCULO ACÚSTICO
        const { recalculateAllWallsWithOpenings } = useWallsStore.getState();
        setTimeout(() => {
          recalculateAllWallsWithOpenings(get().openings);
        }, 100);
      },
      
      clearOpenings: () => {
        console.log('🧹 Limpiando todas las aberturas');
        set({ openings: [] });
        
        // ✅ TRIGGER RECÁLCULO ACÚSTICO
        const { recalculateAllWallsWithOpenings } = useWallsStore.getState();
        setTimeout(() => {
          recalculateAllWallsWithOpenings(get().openings);
        }, 100);
      },
      
      getOpeningsByWall: (wallIndex) => {
        return get().openings.filter(opening => opening.wallIndex === wallIndex);
      },
      
      updateOpeningPosition: (openingId, newWallIndex, newPosition) => {
        set((state) => ({
          openings: state.openings.map(opening => 
            opening.id === openingId 
              ? { ...opening, wallIndex: newWallIndex, position: newPosition }
              : opening
          )
        }));
      },
    }),
    {
      name: 'openings-storage',
    }
  )
);