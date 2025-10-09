'use client';
import React, { createContext, useContext, useReducer, ReactNode } from 'react';

// ✅ Tipos del contexto
export interface RegisterData {
  id?: string;
  email?: string;
  name?: string;
  password?: string;
}

interface RegisterState {
  registerData: RegisterData;
  isLoading: boolean;
  error: string | null;
}

// ✅ Acciones del reducer
type RegisterAction =
  | { type: 'SET_REGISTER_DATA'; payload: RegisterData }
  | { type: 'UPDATE_REGISTER_DATA'; payload: Partial<RegisterData> }
  | { type: 'CLEAR_REGISTER_DATA' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

// ✅ Estado inicial
const initialState: RegisterState = {
  registerData: {},
  isLoading: false,
  error: null,
};

// ✅ Reducer
function registerReducer(state: RegisterState, action: RegisterAction): RegisterState {
  switch (action.type) {
    case 'SET_REGISTER_DATA':
      return {
        ...state,
        registerData: action.payload,
        error: null,
      };
    case 'UPDATE_REGISTER_DATA':
      return {
        ...state,
        registerData: { ...state.registerData, ...action.payload },
        error: null,
      };
    case 'CLEAR_REGISTER_DATA':
      return {
        ...state,
        registerData: {},
        error: null,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };
    default:
      return state;
  }
}

// ✅ Context interface
interface RegisterContextType extends RegisterState {
  setRegisterData: (data: RegisterData) => void;
  updateRegisterData: (updates: Partial<RegisterData>) => void;
  clearRegisterData: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  hasRegisterData: () => boolean;
  validateRegistrationData: () => boolean;
  isComplete: () => boolean;
}

// ✅ Crear el contexto
const RegisterContext = createContext<RegisterContextType | undefined>(undefined);

// ✅ Provider component
export function RegisterProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(registerReducer, initialState);

  // ✅ Actions
  const setRegisterData = (data: RegisterData) => {
    console.log('🔄 Context: Setting register data:', data);
    dispatch({ type: 'SET_REGISTER_DATA', payload: data });
  };

  const updateRegisterData = (updates: Partial<RegisterData>) => {
    console.log('🔄 Context: Updating register data:', updates);
    dispatch({ type: 'UPDATE_REGISTER_DATA', payload: updates });
  };

  const clearRegisterData = () => {
    console.log('🗑️ Context: Clearing register data');
    dispatch({ type: 'CLEAR_REGISTER_DATA' });
  };

  const setLoading = (loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  };

  const setError = (error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  };

  // ✅ Helper functions
  const hasRegisterData = (): boolean => {
    const { registerData } = state;
    return !!(registerData.id && registerData.email);
  };

  const isComplete = (): boolean => {
    const { registerData } = state;
    return !!(registerData.id && registerData.email && registerData.name && registerData.password);
  };

  const validateRegistrationData = (): boolean => {
    if (!hasRegisterData()) {
      setError("No hay datos de registro");
      return false;
    }

    if (!isComplete()) {
      setError("Datos de registro incompletos");
      return false;
    }

    setError(null);
    return true;
  };

  const contextValue: RegisterContextType = {
    ...state,
    setRegisterData,
    updateRegisterData,
    clearRegisterData,
    setLoading,
    setError,
    hasRegisterData,
    validateRegistrationData,
    isComplete,
  };

  return (
    <RegisterContext.Provider value={contextValue}>
      {children}
    </RegisterContext.Provider>
  );
}

// ✅ Hook personalizado para usar el contexto
export function useRegister() {
  const context = useContext(RegisterContext);
  
  if (context === undefined) {
    throw new Error('useRegister must be used within a RegisterProvider');
  }
  
  return context;
}

// ✅ Hook con funciones adicionales para el flujo de registro
export function useRegisterFlow() {
  const context = useRegister();

  const saveRegistrationData = (userData: any, formData: any): boolean => {
    try {
      context.setLoading(true);
      
      // ✅ Validar estructura de datos
      if (!userData) {
        throw new Error("Invalid user data structure");
      }

      const { email, name, id } = userData;

      if (!email || !name || !id) {
        throw new Error("Missing required user fields");
      }

      const registerDataToSave: RegisterData = {
        id: id,
        email: email,
        name: name,
        password: formData.password
      };

      console.log('💾 Context: Saving registration data:', registerDataToSave);
      context.setRegisterData(registerDataToSave);
      context.setError(null);
      
      return true;
      
    } catch (error: any) {
      console.error('❌ Error saving registration data:', error);
      context.setError(error.message);
      return false;
    } finally {
      context.setLoading(false);
    }
  };

  const validateRegistrationData = (): boolean => {
    if (!context.hasRegisterData()) {
      context.setError("No hay datos de registro");
      return false;
    }

    if (!context.isComplete()) {
      context.setError("Datos de registro incompletos");
      return false;
    }

    context.setError(null);
    return true;
  };

  return {
    ...context,
    saveRegistrationData,
    validateRegistrationData,
  };
}