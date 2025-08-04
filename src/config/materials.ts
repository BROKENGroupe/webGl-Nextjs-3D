/**
 * Configuración de materiales y colores para la aplicación 3D
 * Centraliza todos los valores para fácil mantenimiento y consistencia
 */

// Colores principales del sistema
export const COLORS = {
  // Colores de la estructura 3D (tipo CAD profesional)
  FLOOR: "#D2B48C",        // Beige para piso
  WALLS: "#808080",        // Gris para paredes  
  CEILING: "#F5F5F5",      // Blanco roto para techo
  
  // Colores de las líneas 2D
  LINE_PRIMARY: "#2563eb", // Azul para líneas principales
  LINE_HOLES: "#dc2626",   // Rojo para líneas de agujeros
  VERTEX: "#3b82f6",       // Azul para vértices
  
  // Colores de interfaz
  GRID: "#888888",         // Gris para grilla
  GRID_MINOR: "#cccccc",   // Gris claro para grilla menor
  BACKGROUND: "#e0e0e0",   // Fondo de la aplicación

  HOVER: "#4CAF50",       // Verde Material Design (recomendado)  
} as const;

// Propiedades de materiales
export const MATERIAL_PROPERTIES = {
  FLOOR: {
    roughness: 0.8,
    metalness: 0.1,
    side: "DoubleSide" as const,
    transparent: true,      // CAMBIADO: Ahora transparente
    opacity: 0.6,          // CORREGIDO: Era 2.0, ahora 0.6 (60% visible)
  },
  WALLS: {
    roughness: 0.8,
    metalness: 0.1,
    side: "FrontSide" as const,
    transparent: true,      // Mantener transparente
    opacity: 0.5,          // CAMBIADO: De 0.4 a 0.5 (50% visible)
  },
  CEILING: {
    roughness: 0.7,
    metalness: 0.1,
    side: "DoubleSide" as const,
    transparent: true,      // CAMBIADO: Ahora transparente
    opacity: 0.7,          // CORREGIDO: Era 4.0, ahora 0.7 (70% visible)
  },
} as const;

// Dimensiones y configuraciones 3D
export const GEOMETRY_CONFIG = {
  EXTRUDE_DEPTH: 5,        // Altura de extrusión por defecto
  WALL_THICKNESS: 0.1,     // Grosor de paredes (para futuras mejoras)
  BEVEL_ENABLED: false,    // Sin biseles para geometría limpia
  CURVE_SEGMENTS: 8,       // Segmentos de curva para ExtrudeGeometry
} as const;

// Configuraciones de líneas 2D
export const LINE_CONFIG = {
  PRIMARY_WIDTH: 0.1,      // Ancho de líneas principales
  HOLE_WIDTH: 0.08,        // Ancho de líneas de agujeros
  VERTEX_SIZE: 0.3,        // Tamaño de vértices
  HOVER_SCALE: 1.2,        // Escala al hacer hover
} as const;

// Configuraciones de cámara y luces
export const SCENE_CONFIG = {
  CAMERA_POSITION: [10, 10, 10] as const,
  CAMERA_FOV: 50,
  AMBIENT_LIGHT: 0.8,
  DIRECTIONAL_LIGHT: 0.6,
  DIRECTIONAL_POSITION: [10, 15, 10] as const,
} as const;

// Grid configuración
export const GRID_CONFIG = {
  SIZE: 50,
  DIVISIONS: 50,
  COLOR_MAJOR: COLORS.GRID,
  COLOR_MINOR: COLORS.GRID_MINOR,
} as const;