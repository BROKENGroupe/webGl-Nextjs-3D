// data/materials.ts
import { MaterialProperties } from './types/materials';

export const ACOUSTIC_MATERIAL_PROPERTIES: Record<string, MaterialProperties> = {
    CONCRETE_WALL: {
        density: 2400,
        refernce: 'CONCRETE_WALL',
        name: 'Pared de Concreto',
        description: 'Pared construida con concreto sólido, común en edificaciones modernas.',
        category: 'WALLS',
        acoustic_indices: [
            { frequency: 50, value_R: 19.2 },
            { frequency: 63, value_R: 21.0 },
            { frequency: 80, value_R: 15.3 },
            { frequency: 100, value_R: 37.2 },
            { frequency: 125, value_R: 38.1 },
            { frequency: 160, value_R: 38.7 },
            { frequency: 200, value_R: 45.5 },
            { frequency: 250, value_R: 42.7 },
            { frequency: 315, value_R: 40.3 },
            { frequency: 400, value_R: 43.0 },
            { frequency: 500, value_R: 40.9 },
            { frequency: 630, value_R: 41.6 },
            { frequency: 800, value_R: 42.5 },
            { frequency: 1000, value_R: 42.6 },
            { frequency: 1250, value_R: 46.6 },
            { frequency: 1600, value_R: 45.1 },
            { frequency: 2000, value_R: 47.3 },
            { frequency: 2500, value_R: 46.7 },
            { frequency: 3150, value_R: 45.3 },
            { frequency: 4000, value_R: 49.0 },
            { frequency: 5000, value_R: 53.9 }
        ],
        is_active: true,
        picture: null,
        rw: 45,
    },
};

export const MATERIAL_CATEGORIES = {
    WALLS: ['CONCRETE_WALL', 'BRICK_WALL', 'DRYWALL_SINGLE'],
    FLOORS: ['CONCRETE_FLOOR', 'WOOD_FLOOR'],
    DOORS: ['WOOD_DOOR_SOLID', 'METAL_DOOR'],
    WINDOWS: ['SINGLE_GLAZING', 'DOUBLE_GLAZING']
};

export const FREQUENCY_BANDS = [50, 63, 80, 100, 125, 160, 200, 250, 315, 400, 500, 630, 800, 1000, 1250, 1600, 2000, 2500, 3150, 4000, 5000];