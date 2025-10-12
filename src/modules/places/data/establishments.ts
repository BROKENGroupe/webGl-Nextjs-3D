import { Establishment, Badge, EstablishmentType, StatusConfig } from '../types';

export const establishmentTypes: Record<string, EstablishmentType> = {
  nightclub: {
    label: "Discoteca",
    icon: "🎵",
    color: "text-purple-800",
    bg: "bg-purple-100"
  },
  restaurant: {
    label: "Restaurante",
    icon: "🍽️",
    color: "text-orange-800", 
    bg: "bg-orange-100"
  },
  bar: {
    label: "Bar",
    icon: "🍻",
    color: "text-blue-800",
    bg: "bg-blue-100"
  },
  event_hall: {
    label: "Salón de Eventos",
    icon: "🎉",
    color: "text-green-800",
    bg: "bg-green-100"
  },
  casino: {
    label: "Casino",
    icon: "🎰",
    color: "text-red-800",
    bg: "bg-red-100"
  },
  hotel: {
    label: "Hotel",
    icon: "🏨",
    color: "text-indigo-800",
    bg: "bg-indigo-100"
  },
  mall: {
    label: "Centro Comercial",
    icon: "🏬",
    color: "text-pink-800",
    bg: "bg-pink-100"
  },
  gym: {
    label: "Gimnasio",
    icon: "💪",
    color: "text-teal-800",
    bg: "bg-teal-100"
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

export const establishments: Establishment[] = [
  {
    id: "1",
    name: "Club Poblado Elite",
    type: "nightclub", 
    status: "active",
    address: "Carrera 37 #8A-40, El Poblado, Medellín",
    image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?ixlib=rb-4.0.3&w=400&h=300&fit=crop",
    compliance_score: 92,
    noise_impact_external: 28,
    acousticProfile: {
      sound_transmission_loss: 58,
      impact_sound_insulation: 65,
      airborne_sound_insulation: 62
    },
    studies: [
      {
        id: "s1a",
        name: "Evaluación ISO 12354-4 Inicial",
        status: "completed",
        date: "2024-01-15",
        metrics: {
          iso_compliance_level: 92,
          noise_isolation: 58,
          sound_transmission_class: 58
        }
      },
      {
        id: "s1b",
        name: "Análisis de Frecuencias Bajas",
        status: "completed",
        date: "2024-03-20",
        metrics: {
          iso_compliance_level: 94,
          noise_isolation: 60,
          sound_transmission_class: 59
        }
      },
      {
        id: "s1c",
        name: "Evaluación Post-Mejoras",
        status: "in_progress",
        date: "2024-05-12",
        metrics: {
          iso_compliance_level: 96,
          noise_isolation: 62,
          sound_transmission_class: 61
        }
      }
    ]
  },
  {
    id: "2", 
    name: "Restaurante Mondongo's",
    type: "restaurant",
    status: "monitoring",
    address: "Calle 10 #38-38, El Poblado, Medellín", 
    image: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?ixlib=rb-4.0.3&w=400&h=300&fit=crop",
    compliance_score: 78,
    noise_impact_external: 22,
    acousticProfile: {
      sound_transmission_loss: 45,
      impact_sound_insulation: 52,
      airborne_sound_insulation: 48
    },
    studies: []
  },
  {
    id: "3",
    name: "Hotel Dann Carlton",
    type: "hotel",
    status: "active",
    address: "Carrera 43A #7-50, El Poblado, Medellín",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&w=400&h=300&fit=crop",
    compliance_score: 87,
    noise_impact_external: 15,
    acousticProfile: {
      sound_transmission_loss: 52,
      impact_sound_insulation: 58,
      airborne_sound_insulation: 55
    },
    studies: [
      {
        id: "s3a",
        name: "Certificación Hotelera",
        status: "completed",
        date: "2024-02-08",
        metrics: {
          iso_compliance_level: 87,
          noise_isolation: 52,
          sound_transmission_class: 52
        }
      },
      {
        id: "s3b",
        name: "Análisis Habitaciones Premium",
        status: "completed",
        date: "2024-04-18",
        metrics: {
          iso_compliance_level: 89,
          noise_isolation: 54,
          sound_transmission_class: 53
        }
      }
    ]
  },
  {
    id: "4",
    name: "Casino Río Grande",
    type: "casino",
    status: "warning",
    address: "Carrera 70 #52-20, Estadio, Medellín",
    image: "https://images.unsplash.com/photo-1596838132731-3301c3fd4317?ixlib=rb-4.0.3&w=400&h=300&fit=crop",
    compliance_score: 72,
    noise_impact_external: 19,
    acousticProfile: {
      sound_transmission_loss: 41,
      impact_sound_insulation: 44,
      airborne_sound_insulation: 42
    },
    studies: []
  },
  {
    id: "5",
    name: "Centro Comercial Santafé",
    type: "mall",
    status: "active",
    address: "Calle 12 Sur #48-78, El Poblado, Medellín",
    image: "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?ixlib=rb-4.0.3&w=400&h=300&fit=crop",
    compliance_score: 84,
    noise_impact_external: 25,
    acousticProfile: {
      sound_transmission_loss: 48,
      impact_sound_insulation: 51,
      airborne_sound_insulation: 49
    },
    studies: []
  },
  {
    id: "6",
    name: "Gimnasio BodyTech",
    type: "gym",
    status: "monitoring",
    address: "Carrera 43A #34-95, El Poblado, Medellín",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&w=400&h=300&fit=crop",
    compliance_score: 75,
    noise_impact_external: 12,
    acousticProfile: {
      sound_transmission_loss: 38,
      impact_sound_insulation: 45,
      airborne_sound_insulation: 41
    },
    studies: []
  },
  {
    id: "7",
    name: "Bar La Octava",
    type: "bar",
    status: "active",
    address: "Calle 8 #43A-35, El Poblado, Medellín",
    image: "https://images.unsplash.com/photo-1544148103-0773bf10d330?ixlib=rb-4.0.3&w=400&h=300&fit=crop",
    compliance_score: 81,
    noise_impact_external: 18,
    acousticProfile: {
      sound_transmission_loss: 46,
      impact_sound_insulation: 49,
      airborne_sound_insulation: 47
    },
    studies: [
      {
        id: "s7a",
        name: "Evaluación Acústica Bar",
        status: "in_progress",
        date: "2024-05-01",
        metrics: {
          iso_compliance_level: 81,
          noise_isolation: 46,
          sound_transmission_class: 46
        }
      }
    ]
  },
  {
    id: "8",
    name: "Teatro Metropolitano",
    type: "event_hall",
    status: "active",
    address: "Calle 41 #57-30, La Candelaria, Medellín",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&w=400&h=300&fit=crop",
    compliance_score: 95,
    noise_impact_external: 42,
    acousticProfile: {
      sound_transmission_loss: 61,
      impact_sound_insulation: 66,
      airborne_sound_insulation: 63
    },
    studies: [
      {
        id: "s8a",
        name: "Certificación Patrimonio Cultural",
        status: "completed",
        date: "2024-03-18",
        metrics: {
          iso_compliance_level: 95,
          noise_isolation: 61,
          sound_transmission_class: 61
        }
      },
      {
        id: "s8b",
        name: "Análisis Acústica Teatral",
        status: "completed",
        date: "2024-04-25",
        metrics: {
          iso_compliance_level: 97,
          noise_isolation: 63,
          sound_transmission_class: 62
        }
      },
      {
        id: "s8c",
        name: "Evaluación Sistemas de Audio",
        status: "pending",
        date: "2024-06-10",
        metrics: {
          iso_compliance_level: 93,
          noise_isolation: 59,
          sound_transmission_class: 60
        }
      }
    ]
  },
  {
    id: "9",
    name: "Discoteca Palmahia",
    type: "nightclub",
    status: "violation",
    address: "Carrera 43A #6-15, El Poblado, Medellín",
    image: "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?ixlib=rb-4.0.3&w=400&h=300&fit=crop",
    compliance_score: 58,
    noise_impact_external: 8,
    acousticProfile: {
      sound_transmission_loss: 32,
      impact_sound_insulation: 35,
      airborne_sound_insulation: 33
    },
    studies: []
  },
  {
    id: "10",
    name: "Hotel InterContinental",
    type: "hotel",
    status: "active",
    address: "Calle 16 #28-51, El Tesoro, El Poblado, Medellín",
    image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?ixlib=rb-4.0.3&w=400&h=300&fit=crop",
    compliance_score: 91,
    noise_impact_external: 32,
    acousticProfile: {
      sound_transmission_loss: 56,
      impact_sound_insulation: 62,
      airborne_sound_insulation: 59
    },
    studies: [
      {
        id: "s10a",
        name: "Evaluación Luxury Suites",
        status: "completed",
        date: "2024-01-22",
        metrics: {
          iso_compliance_level: 91,
          noise_isolation: 56,
          sound_transmission_class: 56
        }
      }
    ]
  },
  {
    id: "11",
    name: "Centro Comercial Oviedo",
    type: "mall",
    status: "monitoring",
    address: "Carrera 43A #6-15, El Poblado, Medellín",
    image: "https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?ixlib=rb-4.0.3&w=400&h=300&fit=crop",
    compliance_score: 79,
    noise_impact_external: 21,
    acousticProfile: {
      sound_transmission_loss: 44,
      impact_sound_insulation: 48,
      airborne_sound_insulation: 46
    },
    studies: []
  },
  {
    id: "12",
    name: "Smart Fit Laureles",
    type: "gym",
    status: "active",
    address: "Calle 33 #74A-44, Laureles, Medellín",
    image: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?ixlib=rb-4.0.3&w=400&h=300&fit=crop",
    compliance_score: 83,
    noise_impact_external: 14,
    acousticProfile: {
      sound_transmission_loss: 47,
      impact_sound_insulation: 52,
      airborne_sound_insulation: 49
    },
    studies: [
      {
        id: "s12a",
        name: "Certificación Gimnasio",
        status: "completed",
        date: "2024-03-10",
        metrics: {
          iso_compliance_level: 83,
          noise_isolation: 47,
          sound_transmission_class: 47
        }
      },
      {
        id: "s12b",
        name: "Evaluación CrossTraining",
        status: "in_progress",
        date: "2024-05-20",
        metrics: {
          iso_compliance_level: 85,
          noise_isolation: 49,
          sound_transmission_class: 48
        }
      }
    ]
  },
  {
    id: "13",
    name: "El Cielo Restaurante",
    type: "restaurant",
    status: "active",
    address: "Calle 9 #43A-83, El Poblado, Medellín",
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&w=400&h=300&fit=crop",
    compliance_score: 0,
    noise_impact_external: 0,
    acousticProfile: {
      sound_transmission_loss: 0,
      impact_sound_insulation: 0,
      airborne_sound_insulation: 0
    },
    studies: []
  },
  {
    id: "14",
    name: "Majestic Casino",
    type: "casino",
    status: "active",
    address: "Carrera 70 #45-30, Estadio, Medellín",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&w=400&h=300&fit=crop",
    compliance_score: 86,
    noise_impact_external: 23,
    acousticProfile: {
      sound_transmission_loss: 49,
      impact_sound_insulation: 54,
      airborne_sound_insulation: 51
    },
    studies: [
      {
        id: "s14a",
        name: "Análisis Sala VIP",
        status: "completed",
        date: "2024-02-28",
        metrics: {
          iso_compliance_level: 86,
          noise_isolation: 49,
          sound_transmission_class: 49
        }
      },
      {
        id: "s14b",
        name: "Evaluación Sala Principal",
        status: "completed",
        date: "2024-04-05",
        metrics: {
          iso_compliance_level: 88,
          noise_isolation: 51,
          sound_transmission_class: 50
        }
      },
      {
        id: "s14c",
        name: "Certificación Espectáculos",
        status: "in_progress",
        date: "2024-05-15",
        metrics: {
          iso_compliance_level: 87,
          noise_isolation: 50,
          sound_transmission_class: 50
        }
      }
    ]
  },
  {
    id: "15",
    name: "Hotel Dann Carlton Belfort",
    type: "hotel",
    status: "warning",
    address: "Carrera 76 #49A-22, Laureles, Medellín",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&w=400&h=300&fit=crop",
    compliance_score: 69,
    noise_impact_external: 16,
    acousticProfile: {
      sound_transmission_loss: 39,
      impact_sound_insulation: 43,
      airborne_sound_insulation: 41
    },
    studies: []
  },
  {
    id: "16",
    name: "Centro de Eventos Llanogrande",
    type: "event_hall",
    status: "active",
    address: "Km 7 Vía Las Palmas, Rionegro, Antioquia",
    image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-4.0.3&w=400&h=300&fit=crop",
    compliance_score: 88,
    noise_impact_external: 35,
    acousticProfile: {
      sound_transmission_loss: 54,
      impact_sound_insulation: 58,
      airborne_sound_insulation: 56
    },
    studies: [
      {
        id: "s16a",
        name: "Certificación Multi-Evento",
        status: "completed",
        date: "2024-01-28",
        metrics: {
          iso_compliance_level: 88,
          noise_isolation: 54,
          sound_transmission_class: 54
        }
      },
      {
        id: "s16b",
        name: "Análisis Salas Simultáneas",
        status: "completed",
        date: "2024-04-05",
        metrics: {
          iso_compliance_level: 90,
          noise_isolation: 56,
          sound_transmission_class: 55
        }
      }
    ]
  },
  {
    id: "17",
    name: "Hard Rock Café",
    type: "bar",
    status: "monitoring",
    address: "Carrera 43A #7-83, El Poblado, Medellín",
    image: "https://images.unsplash.com/photo-1544148103-0773bf10d330?ixlib=rb-4.0.3&w=400&h=300&fit=crop",
    compliance_score: 76,
    noise_impact_external: 20,
    acousticProfile: {
      sound_transmission_loss: 43,
      impact_sound_insulation: 46,
      airborne_sound_insulation: 44
    },
    studies: []
  },
  {
    id: "18",
    name: "Crossfit Sabaneta",
    type: "gym",
    status: "violation",
    address: "Carrera 45 #70 Sur-30, Sabaneta, Antioquia",
    image: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?ixlib=rb-4.0.3&w=400&h=300&fit=crop",
    compliance_score: 55,
    noise_impact_external: 8,
    acousticProfile: {
      sound_transmission_loss: 30,
      impact_sound_insulation: 33,
      airborne_sound_insulation: 31
    },
    studies: []
  },
  {
    id: "19",
    name: "Discoteca La Villa",
    type: "nightclub",
    status: "active",
    address: "Carrera 33 #8A-15, Laureles, Medellín",
    image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?ixlib=rb-4.0.3&w=400&h=300&fit=crop",
    compliance_score: 89,
    noise_impact_external: 26,
    acousticProfile: {
      sound_transmission_loss: 53,
      impact_sound_insulation: 57,
      airborne_sound_insulation: 55
    },
    studies: [
      {
        id: "s19a",
        name: "Evaluación Pista de Baile",
        status: "completed",
        date: "2024-02-14",
        metrics: {
          iso_compliance_level: 89,
          noise_isolation: 53,
          sound_transmission_class: 53
        }
      },
      {
        id: "s19b",
        name: "Análisis VIP Lounge",
        status: "pending",
        date: "2024-06-01",
        metrics: {
          iso_compliance_level: 91,
          noise_isolation: 55,
          sound_transmission_class: 54
        }
      }
    ]
  },
  {
    id: "20",
    name: "Premium Plaza Hotel",
    type: "hotel",
    status: "active",
    address: "Calle 1 Sur #43A-79, El Poblado, Medellín",
    image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?ixlib=rb-4.0.3&w=400&h=300&fit=crop",
    compliance_score: 92,
    noise_impact_external: 29,
    acousticProfile: {
      sound_transmission_loss: 57,
      impact_sound_insulation: 61,
      airborne_sound_insulation: 59
    },
    studies: []
  }
];

export const allStudies = establishments.flatMap(e => e.studies);

// Configuración para el texto del botón de métricas
export const buttonConfig = {
  metricsButton: {
    withStudies: "Ver Métricas",
    withoutStudies: "Iniciar Estudio"
  }
};