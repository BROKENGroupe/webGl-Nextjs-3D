import { Opening } from '@/types/openings';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface OpeningsState {
  openings: Opening[];
  
  // Actions
  addOpening: (opening: Opening) => void;
  removeOpening: (id: string) => void;
  updateOpening: (id: string, updates: Partial<Opening>) => void;
  clearOpenings: () => void;
  getOpeningsByWall: (wallIndex: number) => Opening[];
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
      },
      
      removeOpening: (id) => {
        console.log('🗑️ Eliminando abertura:', id);
        set((state) => ({
          openings: state.openings.filter(opening => opening.id !== id)
        }));
      },
      
      updateOpening: (id, updates) => {
        console.log('✏️ Actualizando abertura:', id, updates);
        set((state) => ({
          openings: state.openings.map(opening => 
            opening.id === id ? { ...opening, ...updates } : opening
          )
        }));
      },
      
      clearOpenings: () => {
        console.log('🧹 Limpiando todas las aberturas');
        set({ openings: [] });
      },
      
      getOpeningsByWall: (wallIndex) => {
        return get().openings.filter(opening => opening.wallIndex === wallIndex);
      },
    }),
    {
      name: 'openings-storage',
    }
  )
);