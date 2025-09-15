import { AcousticMaterial } from "../modules/editor/types/AcousticMaterial";

// Muro de ladrillo cerámico
export const wallCeramicBrick: AcousticMaterial = {
    id: "wall-ceramic-brick",
    descriptor: "Ceramic Brick Wall",
    subtype: "Face brick",
    type: "wall",
    thickness_mm: 397.0,
    mass_kg_m2: 602.3,
    catalog: "insonor Catalog",
    color: "Brown/Red",
    doubleLeaf: false,
    lightweightElement: false,
    layers: [
        { name: "12mm lime plaster", thickness_mm: 12.0 },
        { name: "365mm ceramic block", thickness_mm: 365.0 },
        { name: "20mm light lime plastered", thickness_mm: 20.0 },
    ],
    thirdOctaveBands: {
        50: 37.0, 63: 35.8, 80: 34.5, 100: 33.3, 125: 29.2, 160: 31.9,
        200: 33.8, 250: 35.6, 315: 38.0, 400: 40.7, 500: 42.1, 630: 44.1,
        800: 46.2, 1000: 46.3, 1250: 46.5, 1600: 46.7, 2000: 47.2,
        2500: 48.6, 3150: 49.1, 4000: 49.6, 5000: 49.6,
    },
    octaveBands: [
        { range: "100-3150", value: "43(-2;-4)" },
        { range: "125-4000", value: "43(-2;-4)" },
        { range: "160-5000", value: "43(-2;-4)" },
        { range: "50-5000", value: "43(-1;-4)" },
    ],
    weightedIndex: { Rw: 43, C: -2, Ctr: -4 },
    height: 2.0,
    width: 0.9,
    bottomOffset: 0
};

// Muro de bloque de hormigón
export const wallConcreteBlock: AcousticMaterial = {
    id: "wall-concrete-block",
    descriptor: "Concrete Block Wall",
    subtype: "Hollow block",
    type: "wall",
    thickness_mm: 200.0,
    mass_kg_m2: 320.0,
    catalog: "insonor Catalog",
    color: "Gray",
    doubleLeaf: false,
    lightweightElement: false,
    layers: [
        { name: "15mm cement plaster", thickness_mm: 15.0 },
        { name: "170mm hollow concrete block", thickness_mm: 170.0 },
        { name: "15mm cement plaster", thickness_mm: 15.0 },
    ],
    thirdOctaveBands: {
        50: 32.0, 63: 31.0, 80: 30.0, 100: 29.0, 125: 28.0, 160: 29.5,
        200: 31.0, 250: 32.5, 315: 34.0, 400: 36.0, 500: 37.5, 630: 39.0,
        800: 40.5, 1000: 41.0, 1250: 41.5, 1600: 42.0, 2000: 42.5,
        2500: 43.0, 3150: 43.5, 4000: 44.0, 5000: 44.0,
    },
    octaveBands: [
        { range: "100-3150", value: "39(-2;-4)" },
        { range: "125-4000", value: "39(-2;-4)" },
        { range: "160-5000", value: "39(-2;-4)" },
        { range: "50-5000", value: "39(-1;-4)" },
    ],
    weightedIndex: { Rw: 39, C: -2, Ctr: -4 },
    height: 2.0,
    width: 0.9,
    bottomOffset: 10
};

// Muro de yeso laminado (tabique ligero)
export const wallGypsumBoard: AcousticMaterial = {
    id: "wall-gypsum-board",
    descriptor: "Gypsum Board Partition",
    subtype: "Double 12.5mm boards + mineral wool",
    type: "wall",
    thickness_mm: 100.0,
    mass_kg_m2: 42.0,
    catalog: "insonor Catalog",
    color: "White",
    doubleLeaf: true,
    lightweightElement: true,
    layers: [
        { name: "12.5mm gypsum board", thickness_mm: 12.5 },
        { name: "75mm mineral wool", thickness_mm: 75.0 },
        { name: "12.5mm gypsum board", thickness_mm: 12.5 },
    ],
    thirdOctaveBands: {
        50: 22.0, 63: 23.0, 80: 24.0, 100: 25.0, 125: 26.0, 160: 27.0,
        200: 28.0, 250: 29.0, 315: 30.0, 400: 31.0, 500: 32.0, 630: 33.0,
        800: 34.0, 1000: 35.0, 1250: 36.0, 1600: 37.0, 2000: 38.0,
        2500: 39.0, 3150: 40.0, 4000: 41.0, 5000: 41.0,
    },
    octaveBands: [
        { range: "100-3150", value: "33(-2;-4)" },
        { range: "125-4000", value: "33(-2;-4)" },
        { range: "160-5000", value: "33(-2;-4)" },
        { range: "50-5000", value: "33(-1;-4)" },
    ],
    weightedIndex: { Rw: 33, C: -2, Ctr: -4 },
    height: 2.0,
    width: 0.9,
    bottomOffset: 10
};

// Muro de tabique hueco de ladrillo fino
export const wallThinBrickPartition: AcousticMaterial = {
    id: "wall-thin-brick-partition",
    descriptor: "Thin Brick Partition",
    subtype: "Single 70mm brick",
    type: "wall",
    thickness_mm: 70.0,
    mass_kg_m2: 95.0,
    catalog: "insonor Catalog",
    color: "LightBrown",
    doubleLeaf: false,
    lightweightElement: true,
    layers: [
        { name: "70mm hollow brick", thickness_mm: 70.0 },
        { name: "10mm plaster", thickness_mm: 10.0 },
    ],
    thirdOctaveBands: {
        50: 18.0, 63: 19.0, 80: 20.0, 100: 21.0, 125: 22.0, 160: 23.0,
        200: 24.0, 250: 25.0, 315: 26.0, 400: 27.0, 500: 28.0, 630: 29.0,
        800: 30.0, 1000: 31.0, 1250: 32.0, 1600: 33.0, 2000: 34.0,
        2500: 35.0, 3150: 36.0, 4000: 36.5, 5000: 37.0,
    },
    octaveBands: [
        { range: "100-3150", value: "28(-3;-6)" },
        { range: "125-4000", value: "28(-3;-6)" },
    ],
    weightedIndex: { Rw: 28, C: -3, Ctr: -6 },
    height: 2.0,
    width: 0.9,
    bottomOffset: 0
};

// Muro de madera liviana
export const wallLightWoodPanel: AcousticMaterial = {
    id: "wall-light-wood-panel",
    descriptor: "Light Wood Panel",
    subtype: "Single 18mm panel",
    type: "wall",
    thickness_mm: 18.0,
    mass_kg_m2: 12.0,
    catalog: "insnor Catalog",
    color: "Wood",
    doubleLeaf: false,
    lightweightElement: true,
    layers: [
        { name: "18mm wood panel", thickness_mm: 18.0 },
    ],
    thirdOctaveBands: {
        50: 12.0, 63: 13.0, 80: 14.0, 100: 15.0, 125: 16.0, 160: 17.0,
        200: 18.0, 250: 19.0, 315: 20.0, 400: 21.0, 500: 22.0, 630: 23.0,
        800: 24.0, 1000: 25.0, 1250: 26.0, 1600: 27.0, 2000: 28.0,
        2500: 29.0, 3150: 30.0, 4000: 30.5, 5000: 31.0,
    },
    octaveBands: [
        { range: "100-3150", value: "22(-4;-8)" },
        { range: "125-4000", value: "22(-4;-8)" },
    ],
    weightedIndex: { Rw: 22, C: -4, Ctr: -8 },
    height: 2.0,
    width: 0.9,
    bottomOffset: 0
};

export const materialColorMap: Record<string, string> = {
  "Brown/Red": "#B55239",
  "Gray": "#A0A0A0",
  "White": "#F5F5F5",
  "LightBrown": "#D2B48C",
  "Wood": "#C19A6B",
  // Agrega más colores según tus materiales
};

export function getMaterialColor(material: { color?: string }) {
  return materialColorMap[material.color ?? "White"] ?? "#CCCCCC";
}

