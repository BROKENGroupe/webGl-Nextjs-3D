import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface IsoResultState {
  isoResult: any | null;
  setIsoResult: (result: any) => void;
  clearIsoResult: () => void;
}

export const useIsoResultStore = create(
  persist<IsoResultState>(
    (set) => ({
      isoResult: null,
      setIsoResult: (result) => set({ isoResult: result }),
      clearIsoResult: () => set({ isoResult: null }),
    }),
    {
      name: 'isoResult',
    }
  )
);