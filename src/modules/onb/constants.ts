import { OnboardingStep } from "./types/onboarding";

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    title: "Datos Personales",
    subtitle: "Información básica para tu perfil",
    fields: [
      { 
        label: "Nombres", 
        name: "firstName", 
        type: "text",
        placeholder: "Ej: Juan Carlos",
        required: true
      },
      { 
        label: "Apellidos", 
        name: "lastName", 
        type: "text",
        placeholder: "Ej: González López",
        required: true
      },
      { 
        label: "Teléfono de contacto", 
        name: "phone", 
        type: "tel",
        placeholder: "Ej: +57 300 123 4567",
        required: true
      },
    ],
  },
  {
    title: "Tipos de Establecimientos",
    subtitle: "¿Qué tipos de establecimientos posees o manejas?",
    fields: [
      {
        label: "Selecciona todos los tipos que apliquen",
        name: "businessTypes", // ✅ Plural para múltiple selección
        type: "select-cards-multiple", // ✅ Nuevo tipo para múltiple
        required: true,
        options: [
          { label: "Discoteca", value: "discoteca", icon: "🎵" },
          { label: "Bar", value: "bar", icon: "🍺" },
          { label: "Gimnasio", value: "gimnasio", icon: "💪" },
          { label: "Restaurante", value: "restaurante", icon: "🍽️" },
          { label: "Teatro", value: "teatro", icon: "🎭" },
          { label: "Café", value: "cafe", icon: "☕" },
          { label: "Hotel", value: "hotel", icon: "🏨" },
          { label: "Oficina", value: "oficina", icon: "🏢" },
          { label: "Tienda", value: "tienda", icon: "🛍️" },
          { label: "Clínica", value: "clinica", icon: "🏥" },
          { label: "Otro", value: "otro", icon: "📋" },
        ],
      },
    ],
  },
  {
    title: "Experiencia Acústica",
    subtitle: "¿Cuál es tu nivel de experiencia en acústica?",
    fields: [
      {
        label: "Selecciona tu nivel de experiencia",
        name: "acousticExperience",
        type: "select-cards",
        required: true,
        options: [
          { 
            label: "Principiante", 
            value: "beginner",
            description: "Poco o nulo conocimiento en acústica"
          },
          { 
            label: "Intermedio", 
            value: "intermediate",
            description: "Conocimientos básicos, he trabajado con algunos proyectos"
          },
          { 
            label: "Avanzado", 
            value: "advanced",
            description: "Amplia experiencia en proyectos acústicos"
          },
          { 
            label: "Experto", 
            value: "expert",
            description: "Profesional especializado en acústica"
          },
        ],
      },
    ],
  },
  {
    title: "Rol en la Empresa",
    subtitle: "¿Cuál es tu posición en el establecimiento?",
    fields: [
      {
        label: "¿Cuál es tu rol principal?",
        name: "mainRole",
        type: "select-cards",
        required: true,
        options: [
          { 
            label: "Dueño/Propietario", 
            value: "owner",
            description: "Soy el propietario del establecimiento"
          },
          { 
            label: "Administrador", 
            value: "admin",
            description: "Gestiono las operaciones del establecimiento"
          },
          { 
            label: "Gerente", 
            value: "manager",
            description: "Superviso áreas específicas"
          },
          { 
            label: "Consultor", 
            value: "consultant",
            description: "Asesoro en temas específicos"
          },
          { 
            label: "Empleado", 
            value: "employee",
            description: "Trabajo en el establecimiento"
          },
          { 
            label: "Ingeniero Acústico", 
            value: "acoustic_engineer",
            description: "Especialista en diseño acústico"
          },
        ],
      },
      {
        label: "Describe tu cargo específico (opcional)",
        name: "specificRole",
        type: "text",
        placeholder: "Ej: Gerente de Operaciones, DJ Residente, Ingeniero de Sonido",
        required: false
      },
    ],
  },
  {
    title: "Información del Establecimiento",
    subtitle: "Detalles sobre tu negocio principal",
    fields: [
      {
        label: "Nombre del establecimiento principal",
        name: "businessName",
        type: "text",
        placeholder: "Ej: Club Nocturno Aurora",
        required: true
      },
      { 
        label: "Ciudad donde opera", 
        name: "city", 
        type: "text",
        placeholder: "Ej: Bogotá, Medellín, Cali",
        required: true
      },
      {
        label: "¿Cuántos establecimientos manejas?",
        name: "establishmentCount",
        type: "select",
        required: true,
        options: [
          { label: "1 establecimiento", value: "1" },
          { label: "2-3 establecimientos", value: "2-3" },
          { label: "4-10 establecimientos", value: "4-10" },
          { label: "Más de 10 establecimientos", value: "10+" },
        ],
      },
    ],
  },
];