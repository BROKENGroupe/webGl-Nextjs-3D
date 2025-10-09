// hooks/useOnboardingValidation.ts
import { FormData } from '../types/onboarding';

export function useOnboardingValidation() {
  const validateStep = (step: number, formData: FormData): string | null => {
    switch (step) {
      case 0: // Datos Básicos
        if (!formData.name?.trim()) return "Por favor ingresa tu nombre completo";
        if (!formData.email?.trim()) return "Por favor ingresa tu correo electrónico";
        if (!formData.phone?.trim()) return "Por favor ingresa tu teléfono";
        break;
        
      case 1: // Tipo de Establecimiento
        if (!formData.businessType) return "Por favor selecciona el tipo de establecimiento";
        break;
        
      case 2: // Rol en la Empresa
        if (!formData.isOwner) return "Por favor indica si eres dueño del establecimiento";
        if (!formData.role?.trim()) return "Por favor ingresa tu cargo o rol";
        break;
        
      case 3: // Información Adicional
        if (!formData.businessName?.trim()) return "Por favor ingresa el nombre del establecimiento";
        if (!formData.city?.trim()) return "Por favor ingresa la ciudad";
        break;
    }
    return null;
  };

  const validateFinalSubmission = (formData: FormData): string | null => {
    const requiredFields = ['name', 'email', 'businessType', 'isOwner'];
    for (const fieldName of requiredFields) {
      const value = formData[fieldName as keyof FormData];
      if (!value || (typeof value === 'string' && value.trim() === "")) {
        return "Por favor completa todos los campos requeridos";
      }
    }
    return null;
  };

  return { validateStep, validateFinalSubmission };
}