import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface IsoStudyConfigState {
  height: number;
  studyType: string;
  Lp_in: number;
  setConfig: (config: { height: number; studyType: string; Lp_in: number }) => void;
  clearConfig: () => void;
}

export const useIsoStudyConfigStore = create<IsoStudyConfigState>()(
  persist(
    (set) => ({
      height: 2.7,
      studyType: 'iso12354-4',
      Lp_in: 70,
      setConfig: (config) => set({ ...config }),
      clearConfig: () => set({ height: 2.7, studyType: 'iso12354-4', Lp_in: 70 }),
    }),
    {
      name: 'isoStudyConfig',
    }
  )
);