import { OnboardingStep } from "./types/onboarding";

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    title: "Datos Personales",
    subtitle: "Información básica para tu perfil",
    fields: [
      { 
        label: "Nombre", 
        name: "name", 
        type: "text",
        placeholder: "Ej: Juan Carlos",
        required: true
      },     
      // { 
      //   label: "Email", 
      //   name: "email", 
      //   type: "email",
      //   placeholder: "Ej: juan@empresa.com",
      //   required: true
      // },
      { 
        label: "Teléfono de contacto", 
        name: "phone", 
        type: "tel",
        placeholder: "Ej: +57 300 123 4567",
        required: true
      },
      { 
        label: "Fecha de nacimiento", 
        name: "birthDate", 
        type: "date",
        placeholder: "",
        required: true
      },
      // {
      //   label: "Género",
      //   name: "gender",
      //   type: "select-cards",
      //   required: true,
      //   options: [
      //     { label: "Masculino", value: "male", icon: "♂️" },
      //     { label: "Femenino", value: "female", icon: "♀️" },
      //     { label: "Otro", value: "other", icon: "⚧️" },
      //     { label: "Prefiero no decir", value: "not_specified", icon: "❓" },
      //   ],
      // },
    ],
  },
  {
    title: "Tipos de Establecimientos",
    subtitle: "¿Qué tipos de establecimientos posees o manejas?",
    fields: [
      {
        label: "Selecciona todos los tipos que apliquen",
        name: "businessTypes",
        type: "select-cards-multiple",
        required: true,
        options: [
          { label: "Discoteca", value: "discoteca", icon: "🎵", description: "Espacios nocturnos para baile y entretenimiento" },
          { label: "Bar", value: "bar", icon: "🍺", description: "Establecimientos para consumo de bebidas" },
          { label: "Gimnasio", value: "gimnasio", icon: "💪", description: "Centros de entrenamiento y fitness" },
          { label: "Restaurante", value: "restaurante", icon: "🍽️", description: "Locales de servicio gastronómico" },
          { label: "Teatro", value: "teatro", icon: "🎭", description: "Espacios para artes escénicas" },
          { label: "Café", value: "cafe", icon: "☕", description: "Cafeterías y espacios de encuentro" },
          { label: "Hotel", value: "hotel", icon: "🏨", description: "Establecimientos de hospedaje" },
          { label: "Oficina", value: "oficina", icon: "🏢", description: "Espacios de trabajo corporativo" },
          { label: "Tienda", value: "tienda", icon: "🛍️", description: "Locales comerciales y retail" },
          { label: "Clínica", value: "clinica", icon: "🏥", description: "Centros médicos y de salud" },
          { label: "Centro de Convenciones", value: "convenciones", icon: "🏛️", description: "Espacios para eventos y conferencias" },
          { label: "Estudio de Grabación", value: "estudio", icon: "🎤", description: "Estudios de música y audio" },
          { label: "Otro", value: "otro", icon: "📋", description: "Otro tipo de establecimiento" },
        ],
      },
    ],
  },
  {
    title: "Experiencia y Conocimientos",
    subtitle: "Cuéntanos sobre tu experiencia en acústica y audio",
    fields: [
      {
        label: "Selecciona tu nivel de experiencia en acústica",
        name: "acousticExperience",
        type: "select-cards",
        required: true,
        options: [
          { 
            label: "Principiante", 
            value: "beginner",
            icon: "🌱",
            description: "Poco o nulo conocimiento en acústica"
          },
          { 
            label: "Intermedio", 
            value: "intermediate",
            icon: "📚",
            description: "Conocimientos básicos, he trabajado con algunos proyectos"
          },
          { 
            label: "Avanzado", 
            value: "advanced",
            icon: "🎓",
            description: "Amplia experiencia en proyectos acústicos"
          },
          { 
            label: "Experto", 
            value: "expert",
            icon: "👨‍🔬",
            description: "Profesional especializado en acústica"
          },
        ],
      },
      {
        label: "¿Has trabajado con sistemas de sonido profesional antes?",
        name: "audioSystemExperience",
        type: "select-cards",
        required: true,
        options: [
          { label: "Nunca", value: "never", icon: "❌" },
          { label: "Ocasionalmente", value: "occasionally", icon: "🔄" },
          { label: "Frecuentemente", value: "frequently", icon: "✅" },
          { label: "Soy profesional del audio", value: "professional", icon: "🎚️" },
        ],
      },
      // {
      //   label: "¿Qué marcas de equipos de audio conoces? (Opcional)",
      //   name: "knownBrands",
      //   type: "select-cards-multiple",
      //   required: false,
      //   options: [
      //     { label: "JBL", value: "jbl", icon: "🔊" },
      //     { label: "Bose", value: "bose", icon: "🎵" },
      //     { label: "Yamaha", value: "yamaha", icon: "🎹" },
      //     { label: "Pioneer", value: "pioneer", icon: "🎧" },
      //     { label: "Behringer", value: "behringer", icon: "🎛️" },
      //     { label: "QSC", value: "qsc", icon: "📢" },
      //     { label: "Meyer Sound", value: "meyer", icon: "🔈" },
      //     { label: "d&b audiotechnik", value: "db", icon: "🎤" },
      //     { label: "Ninguna", value: "none", icon: "❓" },
      //   ],
      // },
    ],
  },
  {
    title: "Rol y Responsabilidades",
    subtitle: "¿Cuál es tu posición y responsabilidades en el establecimiento?",
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
            icon: "👑",
            description: "Soy el propietario del establecimiento"
          },
          { 
            label: "Administrador", 
            value: "admin",
            icon: "👨‍💼",
            description: "Gestiono las operaciones del establecimiento"
          },
          { 
            label: "Gerente", 
            value: "manager",
            icon: "📊",
            description: "Superviso áreas específicas"
          },
          { 
            label: "Consultor", 
            value: "consultant",
            icon: "🎯",
            description: "Asesoro en temas específicos"
          },
          { 
            label: "Empleado", 
            value: "employee",
            icon: "👷",
            description: "Trabajo en el establecimiento"
          },
          { 
            label: "Ingeniero Acústico", 
            value: "acoustic_engineer",
            icon: "🔬",
            description: "Especialista en diseño acústico"
          },
          { 
            label: "DJ/Músico", 
            value: "dj_musician",
            icon: "🎧",
            description: "Artista o técnico de sonido"
          },
        ],
      },
      // {
      //   label: "Describe tu cargo específico",
      //   name: "specificRole",
      //   type: "text",
      //   placeholder: "Ej: Gerente de Operaciones, DJ Residente, Ingeniero de Sonido",
      //   required: false
      // },
      // // {
      // //   label: "¿Tienes autoridad para tomar decisiones sobre equipos de audio?",
      // //   name: "decisionAuthority",
      // //   type: "select-cards",
      // //   required: true,
      // //   options: [
      // //     { label: "Sí, tengo autoridad completa", value: "full", icon: "✅" },
      // //     { label: "Tengo autoridad limitada", value: "limited", icon: "⚠️" },
      // //     { label: "Debo consultar con otros", value: "consultation", icon: "🤝" },
      // //     { label: "No tengo autoridad", value: "none", icon: "❌" },
      // //   ],
      // // },
    ],
  },
  // {
  //   title: "Información del Establecimiento",
  //   subtitle: "Detalles sobre tu negocio principal",
  //   fields: [
  //     {
  //       label: "Nombre del establecimiento principal",
  //       name: "businessName",
  //       type: "text",
  //       placeholder: "Ej: Club Nocturno Aurora",
  //       required: true
  //     },
  //     { 
  //       label: "Ciudad donde opera", 
  //       name: "city", 
  //       type: "text",
  //       placeholder: "Ej: Bogotá, Medellín, Cali",
  //       required: true
  //     },
  //     { 
  //       label: "Dirección completa", 
  //       name: "address", 
  //       type: "text",
  //       placeholder: "Ej: Carrera 15 # 93-07, Zona Rosa",
  //       required: false
  //     },
  //     {
  //       label: "¿Cuántos establecimientos manejas?",
  //       name: "establishmentCount",
  //       type: "select-cards",
  //       required: true,
  //       options: [
  //         { label: "1 establecimiento", value: "1", icon: "1️⃣" },
  //         { label: "2-3 establecimientos", value: "2-3", icon: "2️⃣" },
  //         { label: "4-10 establecimientos", value: "4-10", icon: "🔢" },
  //         { label: "Más de 10 establecimientos", value: "10+", icon: "🏢" },
  //       ],
  //     },
  //     {
  //       label: "Tamaño aproximado del establecimiento principal",
  //       name: "venueSize",
  //       type: "select-cards",
  //       required: true,
  //       options: [
  //         { label: "Pequeño (menos de 100m²)", value: "small", icon: "🏠" },
  //         { label: "Mediano (100-300m²)", value: "medium", icon: "🏬" },
  //         { label: "Grande (300-1000m²)", value: "large", icon: "🏢" },
  //         { label: "Muy grande (más de 1000m²)", value: "xlarge", icon: "🏟️" },
  //       ],
  //     },
  //   ],
  // },
  {
    title: "Necesidades y Objetivos",
    subtitle: "¿Qué buscas lograr con tu sistema de audio?",
    fields: [
      {
        label: "¿Cuáles son tus principales objetivos? (Selecciona todos los que apliquen)",
        name: "objectives",
        type: "select-cards-multiple",
        required: true,
        options: [
          { label: "Mejorar calidad de sonido", value: "sound_quality", icon: "🎵" },
          { label: "Reducir quejas de ruido", value: "noise_complaints", icon: "🔇" },
          { label: "Cumplir normativas", value: "compliance", icon: "📋" },
          { label: "Optimizar costos de energía", value: "energy_costs", icon: "⚡" },
          { label: "Mejorar experiencia del cliente", value: "customer_experience", icon: "😊" },
          { label: "Instalación de nuevo sistema", value: "new_installation", icon: "🔧" },
          { label: "Actualización de equipos", value: "equipment_upgrade", icon: "⬆️" },
          { label: "Asesoría técnica", value: "technical_advice", icon: "🎯" },
        ],
      },
      // {
      //   label: "¿Cuál es tu presupuesto aproximado para inversión en audio?",
      //   name: "budget",
      //   type: "select-cards",
      //   required: true,
      //   options: [
      //     { label: "Menos de $5M COP", value: "under_5m", icon: "💰" },
      //     { label: "$5M - $15M COP", value: "5m_15m", icon: "💵" },
      //     { label: "$15M - $50M COP", value: "15m_50m", icon: "💸" },
      //     { label: "Más de $50M COP", value: "over_50m", icon: "🏦" },
      //     { label: "Aún no lo he definido", value: "undefined", icon: "❓" },
      //   ],
      // },
      {
        label: "¿Cuándo planeas implementar mejoras?",
        name: "timeframe",
        type: "select-cards",
        required: true,
        options: [
          { label: "Inmediatamente", value: "immediate", icon: "🚀" },
          { label: "En 1-3 meses", value: "1_3_months", icon: "📅" },
          { label: "En 3-6 meses", value: "3_6_months", icon: "⏰" },
          { label: "En 6-12 meses", value: "6_12_months", icon: "📆" },
          { label: "Aún no lo he decidido", value: "undecided", icon: "🤔" },
        ],
      },
    ],
  },
  {
    title: "Información Adicional",
    subtitle: "Últimos detalles para personalizar tu experiencia",
    fields: [
      {
        label: "¿Cómo nos conociste?",
        name: "referralSource",
        type: "select-cards",
        required: false,
        options: [
          { label: "Google", value: "google", icon: "🔍" },
          { label: "Redes sociales", value: "social_media", icon: "📱" },
          { label: "Recomendación", value: "referral", icon: "👥" },
          { label: "Publicidad", value: "advertising", icon: "📢" },
          { label: "Evento o feria", value: "event", icon: "🎪" },
          { label: "Otro", value: "other", icon: "❓" },
        ],
      },
      // {
      //   label: "¿Tienes algún comentario o necesidad específica?",
      //   name: "comments",
      //   type: "textarea",
      //   placeholder: "Ej: Tengo problemas específicos con el eco en mi local, necesito asesoría urgente para cumplir con normativas municipales...",
      //   required: false
      // },
      {
        label: "¿Te gustaría recibir información sobre nuestros servicios?",
        name: "newsletter",
        type: "select-cards",
        required: true,
        options: [
          { label: "Sí, quiero recibir información", value: "yes", icon: "✅" },
          { label: "No, gracias", value: "no", icon: "❌" },
        ],
      },
      {
        label: "¿Prefieres que te contactemos por?",
        name: "preferredContact",
        type: "select-cards",
        required: true,
        options: [
          { label: "WhatsApp", value: "whatsapp", icon: "📱" },
          { label: "Llamada telefónica", value: "phone", icon: "☎️" },
          { label: "Email", value: "email", icon: "📧" },
          { label: "No deseo ser contactado", value: "no_contact", icon: "🚫" },
        ],
      },
    ],
  },
];

// ✅ Constantes adicionales para validación
// export const VALIDATION_RULES = {
//   firstName: { minLength: 2, maxLength: 50 },
//   lastName: { minLength: 2, maxLength: 50 },
//   email: { type: 'email' },
//   phone: { minLength: 7, maxLength: 20 },
//   city: { minLength: 2, maxLength: 50 },
//   businessName: { minLength: 2, maxLength: 100 },
//   address: { maxLength: 200 },
//   specificRole: { maxLength: 100 },
//   comments: { maxLength: 1000 },
// } as const;

