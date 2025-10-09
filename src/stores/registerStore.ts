import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface RegisterData {
  id?: string;
  email?: string;
  password?: string;
  name?: string;
}

interface RegisterStore {
  registerData: RegisterData;
  setRegisterData: (data: RegisterData) => void;
  clearRegisterData: () => void;
  hasRegisterData: () => boolean;
}

export const useRegisterStore = create<RegisterStore>()(
  persist(
    (set, get) => ({
      registerData: {},
      
      setRegisterData: (data: RegisterData) => {
        console.log('🗃️ Zustand: Saving register data:', data);
        set({ registerData: data });
      },
      
      clearRegisterData: () => {
        console.log('🗑️ Zustand: Clearing register data');
        set({ registerData: {} });
      },
      
      hasRegisterData: () => {
        const data = get().registerData;
        return !!(data.id || data.email || data.password);
      },
    }),
    {
      name: 'register-storage', // nombre en localStorage
      storage: createJSONStorage(() => localStorage),
    }
  )
);