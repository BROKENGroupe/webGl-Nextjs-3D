import { Opening } from '@/types/openings';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface OpeningsState {
  openings: Opening[];
  
  // Actions
  addOpening: (opening: Opening) => void;
  removeOpening: (id: string) => void;
  updateOpening: (id: string, updates: Partial<Opening>) => void;
  clearAllOpenings: () => void;
  getOpeningsForWall: (wallIndex: number) => Opening[];
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
          openings: state.openings.filter(o => o.id !== id)
        }));
      },
      
      updateOpening: (id, updates) => {
        console.log('✏️ Actualizando abertura:', id, updates);
        set((state) => ({
          openings: state.openings.map(o => 
            o.id === id ? { ...o, ...updates } : o
          )
        }));
      },
      
      clearAllOpenings: () => {
        console.log('🧹 Limpiando todas las aberturas');
        set({ openings: [] });
      },
      
      getOpeningsForWall: (wallIndex) => {
        return get().openings.filter(opening => opening.wallIndex === wallIndex);
      },
    }),
    {
      name: 'openings-storage',
    }
  )
);