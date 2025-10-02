// data/materials.ts

import { Material } from "@/modules/materials/types/materials";


export const ACOUSTIC_MATERIALS: Record<string, Material> = {
    CONCRETE_WALL: {
        density: 2400,
        reference: 'CONCRETE_WALL',
        name: 'Pared de Concreto',
        description: 'Pared construida con concreto sólido, común en edificaciones modernas.',
        is_active: true,
        picture: null,
        descriptor: 'Concrete Wall',
        subtype: 'Solid',
        type: 'wall',
        thickness: 200,
        mass: 480,
        catalog: 'Standard',
        layers: [{ name: 'Concrete', thickness: 200 }],
        octaveBands: [],
        width: 0,
        height: 0,
        bottomOffset: 0,
        thirdOctaveBands: {
            50: 19.2,
            63: 21.0,
            80: 15.3,
            100: 37.2,
            125: 38.1,
            160: 38.7,
            200: 45.5,
            250: 42.7,
            315: 40.3,
            400: 43.0,
            500: 40.9,
            630: 41.6,
            800: 42.5,
            1000: 42.6,
            1250: 46.6,
            1600: 45.1,
            2000: 47.3,
            2500: 46.7,
            3150: 45.3,
            4000: 49.0,
            5000: 53.9
        },
    },
};

export const MATERIAL_CATEGORIES = {
    WALLS: ['CONCRETE_WALL', 'BRICK_WALL', 'DRYWALL_SINGLE'],
    FLOORS: ['CONCRETE_FLOOR', 'WOOD_FLOOR'],
    DOORS: ['WOOD_DOOR_SOLID', 'METAL_DOOR'],
    WINDOWS: ['SINGLE_GLAZING', 'DOUBLE_GLAZING']
};