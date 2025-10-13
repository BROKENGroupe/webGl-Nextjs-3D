// src/modules/onb/types/onboarding.ts

// types/onboarding.ts
export interface RegisterAccountResponse {
  id: string;
  name: string;
  email: string;
  image: {
    src: string;
    height: number;
    width: number;
    _id: string;
  };
  createdAt: string;
  updatedAt: string;
  accessToken: string;
  refreshToken: string;
}

export interface OnboardingField {
  label: string;
  name: string;
  placeholder?: string;
  type: "text" | "email" | "tel" | "radio" | "select" | "select-cards" | "select-cards-multiple" | "date" | "textarea";
  required?: boolean;
  description?: string; // ✅ Para descripciones en las cards
  options?: Array<{ 
    label: string; 
    value: string;
    icon?: string;
    description?: string;
  }>;
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
  };
}

export interface OnboardingStep {
  title: string;
  subtitle?: string; // ✅ Subtítulo opcional
  fields: OnboardingField[];
}

// ✅ FormData legacy (mantener para compatibilidad)
export interface FormData {
  id?: string;
  name?: string;
  email?: string;
  phone?: string;
  businessType?: string;
  isOwner?: string;
  role?: string;
  businessName?: string;
  city?: string;
  password?: string;
}

// ✅ Nueva interfaz completa para onboarding
export interface OnboardingFormData {
  // ✅ Datos personales
  firstName?: string;
  lastName?: string;
  phone?: string;
  
  // ✅ Tipos de establecimiento (múltiple selección)
  businessTypes?: string[]; // Array para múltiple selección
  
  // ✅ Experiencia acústica
  acousticExperience?: string;
  
  // ✅ Rol en la empresa
  mainRole?: string;
  specificRole?: string;
  
  // ✅ Información del establecimiento
  businessName?: string;
  city?: string;
  establishmentCount?: string;
  
  // ✅ Datos legacy (mantener compatibilidad con sistema existente)
  id?: string;
  email?: string;
  password?: string;
  name?: string; // Se puede generar desde firstName + lastName
  businessType?: string; // Para compatibilidad, se puede mapear desde businessTypes[0]
  role?: string; // Para compatibilidad, se puede mapear desde mainRole
  isOwner?: string; // Para compatibilidad, se puede derivar de mainRole
  
  // ✅ Flexibilidad para campos adicionales
  [key: string]: any;
}

// ✅ Interface para datos transformados al enviar al backend
export interface TransformedOnboardingData {
  id: string;
  name: string; // firstName + lastName
  email: string;
  phone?: string;
  description: string; // Descripción generada automáticamente
  accountType: string;
  ownerId: string;
  department: string;
  city: string;
  gender: "male" | "female" | "other";
  birthDate: string;
  platformUsage: "personal" | "educational" | "professional";
  platformRole: "admin" | "owner" | "collaborator";
  interests: string[];
  experience: string;
  acceptTerms: boolean;
  
  // ✅ Campos específicos de tu sistema
  businessTypes?: string[];
  acousticExperience?: string;
  mainRole?: string;
  specificRole?: string;
  establishmentCount?: string;
}

// ✅ Tipos helper para el manejo de formularios
export type OnboardingFieldValue = string | string[] | boolean | number;

export interface OnboardingValidationError {
  field: string;
  message: string;
}

export interface OnboardingStepValidation {
  isValid: boolean;
  errors: OnboardingValidationError[];
}

// ✅ Estados del onboarding
export type OnboardingStatus = 'idle' | 'loading' | 'success' | 'error';

// ✅ Configuración de pasos
export interface OnboardingConfig {
  steps: OnboardingStep[];
  currentStep: number;
  totalSteps: number;
  canGoBack: boolean;
  canGoNext: boolean;
  isLastStep: boolean;
}