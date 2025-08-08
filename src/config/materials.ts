/**
 * @fileoverview Configuración global de materiales y colores del sistema
 * 
 * Centraliza todas las definiciones de colores, materiales y propiedades visuales
 * para mantener consistencia en toda la aplicación y facilitar el mantenimiento.
 * 
 * @module MaterialsConfig
 * @version 2.0.0
 * @author insonor Team
 * @since 2025
 */

/**
 * @namespace COLORS
 * @description Paleta de colores global del sistema
 */
export const COLORS = {
  // Colores principales de paredes
  WALLS: "#E0E0E0",
  
  // Colores de marcos por tipo de abertura
  FRAMES: {
    DOORS: "#8B4513",      // Marrón sillín - marcos de puertas
    WINDOWS: "#FFFFFF",    // Blanco - marcos de ventanas
    DEFAULT: "#666666"     // Gris neutro - elementos desconocidos
  },
  
  // Colores de contenido de aberturas
  OPENINGS: {
    WOOD_DOOR: "#CD853F",     // Dorado Perú - hojas de puertas de madera
    SLIDING_PANEL: "#A0A0A0", // Gris - paneles de puertas correderas
    GLASS: "#87CEEB"          // Azul cielo - cristales de ventanas
  },
  
  // Colores de estado y feedback visual
  INTERACTIONS: {
    VALID_DROP: "#4CAF50",    // Verde - posición válida para drop
    INVALID_DROP: "#FF5722", // Rojo - posición inválida para drop
    HOVER: "#2196F3"         // Azul - estado hover
  },
  
  // Colores de debug y herramientas
  DEBUG: {
    GRID: "#00ff00",         // Verde brillante - elementos de debug
    CENTER_LINE: "#ff0000",  // Rojo - líneas centrales
    HELPER: "#ffff00"        // Amarillo - elementos auxiliares
  }
};

/**
 * @namespace MATERIAL_PROPERTIES
 * @description Propiedades físicas de materiales para renderizado realista
 */
export const MATERIAL_PROPERTIES = {
  WALLS: {
    roughness: 0.8,
    metalness: 0.1,
    opacity: 1.0
  },
  
  FRAMES: {
    WOOD: {
      roughness: 0.7,
      metalness: 0.0,
      opacity: 1.0
    },
    METAL: {
      roughness: 0.3,
      metalness: 0.8,
      opacity: 1.0
    },
    PVC: {
      roughness: 0.4,
      metalness: 0.0,
      opacity: 1.0
    }
  },
  
  GLASS: {
    roughness: 0.0,
    metalness: 0.0,
    opacity: 0.3,
    transparent: true
  },
  
  WOOD: {
    roughness: 0.6,
    metalness: 0.0,
    opacity: 1.0
  }
};

/**
 * @namespace FRAME_DIMENSIONS
 * @description Dimensiones estándar para marcos de aberturas
 */
export const FRAME_DIMENSIONS = {
  THICKNESS: {
    DOORS: 0.08,      // Grosor robusto para marcos de puertas
    WINDOWS: 0.05,    // Grosor fino para marcos de ventanas
    DEFAULT: 0.06     // Grosor intermedio para elementos desconocidos
  },
  
  DEPTH: 0.15,        // Profundidad estándar de saliente desde pared
  
  CONTENT_THICKNESS: {
    DOOR_LEAF: 0.03,  // Grosor de hojas de puertas
    GLASS_PANE: 0.01, // Grosor de cristales
    SLIDING_PANEL: 0.02 // Grosor de paneles correderos
  }
};