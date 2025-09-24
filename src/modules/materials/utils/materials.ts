// utils/materials.ts
import { MATERIAL_CATEGORIES } from '../../../app/(dashboard)/materials/data';
import { MaterialType } from '../types/materials';

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

export const getMaterialCategory = (materialKey: string): MaterialType => {
  for (const [category, materials] of Object.entries(MATERIAL_CATEGORIES)) {
    if (materials.includes(materialKey)) {
      return category as MaterialType;
    }
  }
  return 'other';
};

export const getCategoryColor = (category: MaterialType): string => {
  const colors: Record<MaterialType, string> = {
    ALL: 'bg-gray-100 text-gray-800',
    wall: 'bg-blue-100 text-blue-800',
    floor: 'bg-green-100 text-green-800',
    door: 'bg-yellow-100 text-yellow-800',
    window: 'bg-purple-100 text-purple-800',
    ceiling: 'bg-purple-100 text-purple-800',
    other: 'bg-gray-100 text-gray-800'
  };
  return colors[category] ?? colors.other;
};