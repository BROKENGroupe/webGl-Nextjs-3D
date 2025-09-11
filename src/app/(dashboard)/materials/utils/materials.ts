// utils/materials.ts
import { MATERIAL_CATEGORIES } from '../data';
import { MaterialCategory } from '../types/materials';

// Store para nombres de materiales dinámicos
const dynamicMaterialNames = new Map<string, string>();

export const addMaterialName = (key: string, name: string) => {
  dynamicMaterialNames.set(key, name);
};

export const getMaterialName = (key: string): string => {
  // Primero buscar en nombres dinámicos
  if (dynamicMaterialNames.has(key)) {
    return dynamicMaterialNames.get(key)!;
  }

  // Luego buscar en nombres estáticos
  const names: Record<string, string> = {
    CONCRETE_WALL: 'Pared de Concreto',
    BRICK_WALL: 'Pared de Ladrillo',
    DRYWALL_SINGLE: 'Drywall Simple',
    CONCRETE_FLOOR: 'Piso de Concreto',
    WOOD_FLOOR: 'Piso de Madera',
    WOOD_DOOR_SOLID: 'Puerta de Madera Sólida',
    METAL_DOOR: 'Puerta Metálica',
    SINGLE_GLAZING: 'Vidrio Simple',
    DOUBLE_GLAZING: 'Vidrio Doble'
  };
  return names[key] ?? key;
};

export const getMaterialCategory = (materialKey: string): MaterialCategory => {
  for (const [category, materials] of Object.entries(MATERIAL_CATEGORIES)) {
    if (materials.includes(materialKey)) {
      return category as MaterialCategory;
    }
  }
  return 'OTHER';
};

export const getCategoryColor = (category: MaterialCategory): string => {
  const colors: Record<MaterialCategory, string> = {
    ALL: 'bg-gray-100 text-gray-800',
    WALLS: 'bg-blue-100 text-blue-800',
    FLOORS: 'bg-green-100 text-green-800',
    DOORS: 'bg-yellow-100 text-yellow-800',
    WINDOWS: 'bg-purple-100 text-purple-800',
    OTHER: 'bg-gray-100 text-gray-800'
  };
  return colors[category] ?? colors.OTHER;
};