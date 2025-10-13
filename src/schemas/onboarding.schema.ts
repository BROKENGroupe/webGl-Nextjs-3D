// src/schemas/onboarding.schema.ts
import { ONBOARDING_STEPS } from "@/modules/onb/constants";
import { z } from "zod";

// ✅ Enums para valores específicos
export const BusinessTypeEnum = z.enum([
  'discoteca', 'bar', 'gimnasio', 'restaurante', 'teatro', 'cafe',
  'hotel', 'oficina', 'tienda', 'clinica', 'otro'
]);

export const AcousticExperienceEnum = z.enum([
  'beginner', 'intermediate', 'advanced', 'expert'
]);

export const MainRoleEnum = z.enum([
  'owner', 'admin', 'manager', 'consultant', 'employee', 'acoustic_engineer'
]);

export const EstablishmentCountEnum = z.enum(['1', '2-3', '4-10', '10+']);

// ✅ Función para generar validación dinámica basada en el tipo de campo
function createFieldValidator(field: any): z.ZodTypeAny {
  let validator: z.ZodTypeAny;

  switch (field.type) {
    case 'text':
      // Explicitly use ZodString for string fields
      let stringValidator: z.ZodString = z.string();
      if (field.required) {
        stringValidator = stringValidator.min(1, { message: `${field.label} es requerido` });
      }
      
      // Validaciones específicas por nombre de campo
      if (field.name === 'firstName' || field.name === 'lastName') {
        stringValidator = stringValidator
          .min(2, { message: `${field.label} debe tener al menos 2 caracteres` })
          .max(50, { message: `${field.label} no puede exceder 50 caracteres` })
          .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, { message: `${field.label} solo puede contener letras` });
      }
      
      if (field.name === 'city') {
        stringValidator = stringValidator
          .min(2, { message: "La ciudad debe tener al menos 2 caracteres" })
          .max(50, { message: "La ciudad no puede exceder 50 caracteres" })
          .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, { message: "La ciudad solo puede contener letras" });
      }
      
      if (field.name === 'businessName') {
        stringValidator = stringValidator
          .min(2, { message: "El nombre del establecimiento debe tener al menos 2 caracteres" })
          .max(100, { message: "El nombre del establecimiento no puede exceder 100 caracteres" });
      }
      
      if (field.name === 'specificRole') {
        stringValidator = stringValidator.max(100, { message: "La descripción del rol no puede exceder 100 caracteres" });
      }
      
      if (!field.required) {
        validator = stringValidator.optional();
      } else {
        validator = stringValidator;
      }
      break;

    case 'tel':
      let telValidator: z.ZodString = z.string();
      if (field.required) {
        telValidator = telValidator.min(1, { message: `${field.label} es requerido` });
      }
      telValidator = telValidator
        .min(7, { message: "El teléfono debe tener al menos 7 dígitos" })
        .max(20, { message: "El teléfono no puede exceder 20 caracteres" })
        .regex(/^[\+]?[0-9\s\-\(\)]+$/, { message: "Formato de teléfono no válido" });
      
      if (!field.required) {
        validator = telValidator.optional();
      } else {
        validator = telValidator;
      }
      break;

    case 'email':
      validator = z.string().email({ message: "Email no válido" });
      if (field.required) {
        validator = (validator as z.ZodString).min(1, { message: `${field.label} es requerido` });
      } else {
        validator = validator.optional();
      }
      break;

    case 'select-cards-multiple':
      if (field.name === 'businessTypes') {
        validator = z.array(BusinessTypeEnum);
      } else {
        validator = z.array(z.string());
      }
      
      if (field.required) {
        // Cast validator to ZodArray to access array-specific methods
        validator = (validator as z.ZodArray<any>).min(1, { message: `Debes seleccionar al menos una opción en ${field.label}` });
      }
      
      if (field.maxSelection) {
        // Cast validator to ZodArray to access array-specific methods
        validator = (validator as z.ZodArray<any>).max(field.maxSelection, { message: `Puedes seleccionar máximo ${field.maxSelection} opciones` });
      }
      break;

    case 'select-cards':
    case 'select':
      // Validaciones específicas por nombre de campo
      if (field.name === 'acousticExperience') {
        validator = AcousticExperienceEnum;
      } else if (field.name === 'mainRole') {
        validator = MainRoleEnum;
      } else if (field.name === 'establishmentCount') {
        validator = EstablishmentCountEnum;
      } else {
        validator = z.string();
      }
      
      if (field.required) {
        validator = validator.refine(val => typeof val === 'string' && val.trim() !== '', {
          message: `Debes seleccionar una opción en ${field.label}`
        });
      } else {
        validator = validator.optional();
      }
      break;

    default:
      validator = z.string().optional();
      break;
  }

  return validator;
}

// ✅ Generar schemas dinámicamente basados en ONBOARDING_STEPS
function generateStepSchemas() {
  return ONBOARDING_STEPS.map((step: typeof ONBOARDING_STEPS[number], index: number) => {
    const schemaObject: Record<string, z.ZodTypeAny> = {};
    
    step.fields.forEach((field: (typeof step.fields)[number]) => {
      schemaObject[field.name] = createFieldValidator(field);
    });

    let schema = z.object(schemaObject);

    // ✅ Validaciones cruzadas específicas por paso
    if (index === 3) { // Paso del rol
      schema = schema.refine((data: any) => {
        if (data.mainRole === 'employee' && (!data.specificRole || data.specificRole.trim() === '')) {
          return false;
        }
        return true;
      }, {
        message: "Los empleados deben especificar su cargo específico",
        path: ["specificRole"]
      });
    }

    return schema;
  });
}

// ✅ Generar schemas dinámicamente
export const stepSchemas = generateStepSchemas();

// ✅ Schema completo combinando todos los pasos
function generateCompleteSchema() {
  const allFields: Record<string, z.ZodTypeAny> = {};
  
  ONBOARDING_STEPS.forEach((step: typeof ONBOARDING_STEPS[number]) => {
    step.fields.forEach((field: (typeof step.fields)[number]) => {
      allFields[field.name] = createFieldValidator(field);
    });
  });

  let schema = z.object(allFields);

  // Validaciones cruzadas globales
  schema = schema.refine((data: any) => {
    if (data.mainRole === 'employee' && (!data.specificRole || data.specificRole.trim() === '')) {
      return false;
    }
    return true;
  }, {
    message: "Los empleados deben especificar su cargo específico",
    path: ["specificRole"]
  });

  return schema;
}

export const onboardingSchema = generateCompleteSchema();

// ✅ Tipos derivados
export type OnboardingSchemaType = z.infer<typeof onboardingSchema>;

// ✅ Funciones de validación
export function validateStep(stepIndex: number, data: any) {
  if (stepIndex < 0 || stepIndex >= stepSchemas.length) {
    return {
      success: false,
      error: { errors: [{ path: ['step'], message: 'Índice de paso no válido' }] }
    } as any;
  }
  
  return stepSchemas[stepIndex].safeParse(data);
}

export function getValidationErrors(result: any) {
  if (!result.success) {
    return result.error.errors.map((err: z.ZodIssue) => ({
      field: err.path.join('.'),
      message: err.message
    }));
  }
  return [];
}

// ✅ Función para obtener campos requeridos dinámicamente
export function getRequiredFields(): Record<number, string[]> {
  const requiredFields: Record<number, string[]> = {};
  
  ONBOARDING_STEPS.forEach((step, index) => {
    requiredFields[index] = step.fields
      .filter(field => field.required)
      .map(field => field.name);
  });
  
  return requiredFields;
}

export function isFieldRequired(stepIndex: number, fieldName: string): boolean {
  const step = ONBOARDING_STEPS[stepIndex];
  if (!step) return false;
  
  const field = step.fields.find(f => f.name === fieldName);
  return field?.required === true;
}