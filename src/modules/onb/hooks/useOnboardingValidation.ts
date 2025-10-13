// hooks/useOnboardingValidation.ts
import { OnboardingFormData, OnboardingField, OnboardingStep } from '../types/onboarding';
import { ONBOARDING_STEPS } from '../constants';

export function useOnboardingValidation() {
  
  // ✅ Validación dinámica basada en la configuración de campos
  const validateField = (field: OnboardingField, value: any): string | null => {
    // ✅ Verificar si el campo es requerido
    if (field.required) {
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        return `Por favor completa el campo: ${field.label}`;
      }
      
      // ✅ Para campos de selección múltiple
      if (field.type === 'select-cards-multiple' && Array.isArray(value) && value.length === 0) {
        return `Por favor selecciona al menos una opción en: ${field.label}`;
      }
    }

    // ✅ Validaciones específicas por tipo de campo
    if (value && typeof value === 'string' && value.trim()) {
      switch (field.type) {
        case 'email':
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            return `Por favor ingresa un email válido en: ${field.label}`;
          }
          break;

        case 'tel':
          // ✅ Validación básica para teléfonos (mínimo 7 dígitos)
          const phoneRegex = /^[\+]?[0-9\s\-\(\)]{7,}$/;
          if (!phoneRegex.test(value)) {
            return `Por favor ingresa un teléfono válido en: ${field.label}`;
          }
          break;

        case 'text':
          // ✅ Validaciones de longitud si están definidas
          if (field.validation?.minLength && value.length < field.validation.minLength) {
            return `${field.label} debe tener al menos ${field.validation.minLength} caracteres`;
          }
          if (field.validation?.maxLength && value.length > field.validation.maxLength) {
            return `${field.label} no puede exceder ${field.validation.maxLength} caracteres`;
          }
          // ✅ Validación con regex personalizada
          if (field.validation?.pattern && !field.validation.pattern.test(value)) {
            return `El formato de ${field.label} no es válido`;
          }
          break;
      }
    }

    return null;
  };

  // ✅ Validación dinámica de paso completo
  const validateStep = (stepIndex: number, formData: OnboardingFormData): string | null => {
    if (stepIndex < 0 || stepIndex >= ONBOARDING_STEPS.length) {
      return "Paso no válido";
    }

    const step: OnboardingStep = ONBOARDING_STEPS[stepIndex];
    
    // ✅ Validar cada campo del paso actual
    for (const field of step.fields) {
      const fieldValue = formData[field.name as keyof OnboardingFormData];
      const error = validateField(field, fieldValue);
      
      if (error) {
        return error;
      }
    }

    // ✅ Validaciones especiales por paso (casos específicos de negocio)
    switch (stepIndex) {
      case 0: // Datos Personales
        if (formData.firstName && formData.lastName) {
          const fullName = `${formData.firstName} ${formData.lastName}`.trim();
          if (fullName.length < 3) {
            return "El nombre completo debe tener al menos 3 caracteres";
          }
        }
        break;

      case 1: // Tipos de Establecimientos
        if (formData.businessTypes && Array.isArray(formData.businessTypes)) {
          if (formData.businessTypes.length > 5) {
            return "Puedes seleccionar máximo 5 tipos de establecimientos";
          }
        }
        break;

      case 3: // Rol en la Empresa
        // ✅ Si es dueño, no necesita specificRole, si es empleado sí
        if (formData.mainRole === 'employee' && !formData.specificRole?.trim()) {
          return "Por favor especifica tu cargo como empleado";
        }
        break;

      case 4: // Información del Establecimiento
        if (formData.businessName && formData.businessName.length < 2) {
          return "El nombre del establecimiento debe tener al menos 2 caracteres";
        }
        break;
    }

    return null;
  };

  // ✅ Validación final dinámica antes del envío
  const validateFinalSubmission = (formData: OnboardingFormData): string | null => {
    // ✅ Recopilar todos los campos requeridos de todos los pasos
    const allRequiredFields: { fieldName: string, fieldLabel: string }[] = [];
    
    ONBOARDING_STEPS.forEach(step => {
      step.fields.forEach(field => {
        if (field.required) {
          allRequiredFields.push({
            fieldName: field.name,
            fieldLabel: field.label
          });
        }
      });
    });

    // ✅ Verificar que todos los campos requeridos estén completos
    for (const { fieldName, fieldLabel } of allRequiredFields) {
      const value = formData[fieldName as keyof OnboardingFormData];
      
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        return `Campo requerido faltante: ${fieldLabel}`;
      }
      
      // ✅ Verificar arrays vacíos
      if (Array.isArray(value) && value.length === 0) {
        return `Debes seleccionar al menos una opción en: ${fieldLabel}`;
      }
    }

    // ✅ Validaciones de negocio finales
    if (!formData.firstName?.trim() || !formData.lastName?.trim()) {
      return "Nombre y apellidos son requeridos";
    }

    if (!formData.businessTypes || formData.businessTypes.length === 0) {
      return "Debes seleccionar al menos un tipo de establecimiento";
    }

    if (!formData.acousticExperience) {
      return "Debes indicar tu nivel de experiencia acústica";
    }

    if (!formData.mainRole) {
      return "Debes especificar tu rol principal";
    }

    // ✅ Validar datos de contexto (email y password del registro)
    if (!formData.email?.trim()) {
      return "Email de registro no encontrado";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return "Email de registro no válido";
    }

    return null;
  };

  // ✅ Función helper para validar un campo específico
  const validateSingleField = (fieldName: string, value: any): string | null => {
    // ✅ Buscar el campo en todos los pasos
    for (const step of ONBOARDING_STEPS) {
      const field = step.fields.find(f => f.name === fieldName);
      if (field) {
        return validateField(field, value);
      }
    }
    return null;
  };

  // ✅ Función para obtener todos los errores de un paso
  const getAllStepErrors = (stepIndex: number, formData: OnboardingFormData): string[] => {
    if (stepIndex < 0 || stepIndex >= ONBOARDING_STEPS.length) {
      return ["Paso no válido"];
    }

    const step: OnboardingStep = ONBOARDING_STEPS[stepIndex];
    const errors: string[] = [];
    
    for (const field of step.fields) {
      const fieldValue = formData[field.name as keyof OnboardingFormData];
      const error = validateField(field, fieldValue);
      
      if (error) {
        errors.push(error);
      }
    }

    return errors;
  };

  // ✅ Función para verificar si un paso está completo
  const isStepComplete = (stepIndex: number, formData: OnboardingFormData): boolean => {
    return validateStep(stepIndex, formData) === null;
  };

  return { 
    validateStep, 
    validateFinalSubmission,
    validateSingleField,
    getAllStepErrors,
    isStepComplete
  };
}