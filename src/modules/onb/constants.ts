import { OnboardingStep } from "./types/onboarding";

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    title: "Datos Básicos",
    fields: [
      { label: "Nombre completo", name: "name", type: "text" },
      { label: "Correo electrónico", name: "email", type: "email" },
      { label: "Teléfono", name: "phone", type: "tel" },
    ],
  },
  {
    title: "Tipo de Establecimiento",
    fields: [
      {
        label: "Selecciona el tipo de establecimiento",
        name: "businessType",
        type: "select-cards",
        options: [
          { label: "Discoteca", value: "discoteca" },
          { label: "Bar", value: "bar" },
          { label: "Gimnasio", value: "gimnasio" },
          { label: "Restaurante", value: "restaurante" },
          { label: "Teatro", value: "teatro" },
        ],
      },
    ],
  },
  {
    title: "Rol en la Empresa",
    fields: [
      {
        label: "¿Eres dueño del establecimiento?",
        name: "isOwner",
        type: "radio",
        options: [
          { label: "Sí", value: "owner" },
          { label: "No, soy empleado", value: "employee" },
          { label: "Consultor externo", value: "consultant" },
        ],
      },
      {
        label: "Cargo o rol",
        name: "role",
        type: "text",
      },
    ],
  },
  {
    title: "Información Adicional",
    fields: [
      {
        label: "Nombre del establecimiento",
        name: "businessName",
        type: "text",
      },
      { label: "Ciudad", name: "city", type: "text" },
    ],
  },
];