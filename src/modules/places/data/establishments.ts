import { Place, Badge, EstablishmentType, StatusConfig } from '../types';

export const establishmentTypes: Record<string, EstablishmentType> = {
  Discoteca: {
    label: "Discoteca",
    icon: "🎵",
    color: "text-purple-800",
    bg: "bg-purple-100"
  },
  Restaurante: {
    label: "Restaurante",
    icon: "🍽️",
    color: "text-orange-800", 
    bg: "bg-orange-100"
  },
  Bar: {
    label: "Bar",
    icon: "🍻",
    color: "text-blue-800",
    bg: "bg-blue-100"
  }
};

export const statusConfig: Record<string, StatusConfig> = {
  active: {
    label: "Activo",
    color: "text-green-800",
    bg: "bg-green-100",
    dot: "bg-green-500"
  },
  monitoring: {
    label: "Monitoreo",
    color: "text-blue-800", 
    bg: "bg-blue-100",
    dot: "bg-blue-500"
  },
  warning: {
    label: "Advertencia",
    color: "text-yellow-800",
    bg: "bg-yellow-100", 
    dot: "bg-yellow-500"
  },
  violation: {
    label: "Infracción",
    color: "text-red-800",
    bg: "bg-red-100",
    dot: "bg-red-500"
  }
};

export const availableBadges: Badge[] = [
  {
    id: "excellence_iso",
    name: "Excelencia Acústica ISO",
    description: "Otorgada por mantener un cumplimiento ISO 12354-4 superior al 95% durante 6 meses consecutivos.",
    icon: "🏆",
    color: "text-yellow-700",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-300", 
    requirement: "Cumplimiento ISO ≥ 95%",
    earned: true,
    earnedDate: "2024-09-15"
  },
  {
    id: "sound_master",
    name: "Maestro del Aislamiento",
    description: "Reconocimiento por lograr un STC Rating superior a 58 dB en todos los estudios completados.",
    icon: "🔇",
    color: "text-blue-700",
    bgColor: "bg-blue-50", 
    borderColor: "border-blue-300",
    requirement: "STC Rating ≥ 58 dB",
    earned: true,
    earnedDate: "2024-08-20"
  },
  {
    id: "eco_guardian", 
    name: "Guardián del Entorno",
    description: "Distinción por reducir el impacto sonoro externo en más de 35 dB, protegiendo el entorno urbano.",
    icon: "🌿",
    color: "text-green-700",
    bgColor: "bg-green-50",
    borderColor: "border-green-300",
    requirement: "Reducción Externa ≥ 35 dB",
    earned: false
  },
  {
    id: "innovation_pioneer",
    name: "Pionero en Innovación",
    description: "Por implementar tecnologías acústicas avanzadas y superar estándares convencionales.",
    icon: "⚡",
    color: "text-purple-700",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-300",
    requirement: "Tecnología Avanzada + ISO ≥ 90%",
    earned: false
  },
  {
    id: "compliance_streak",
    name: "Racha de Cumplimiento",
    description: "12 meses consecutivos sin infracciones ni advertencias acústicas.",
    icon: "📈",
    color: "text-indigo-700",
    bgColor: "bg-indigo-50",
    borderColor: "border-indigo-300",
    requirement: "12 meses sin infracciones",
    earned: true,
    earnedDate: "2024-07-10"
  }
];



//export const allStudies = establishments.flatMap(e => e.studies);

// Configuración para el texto del botón de métricas
export const buttonConfig = {
  metricsButton: {
    withStudies: "Ver Métricas",
    withoutStudies: "Iniciar Estudio"
  }
};