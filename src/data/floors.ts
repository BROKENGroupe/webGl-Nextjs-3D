import { AcousticMaterial } from "@/modules/editor/types/AcousticMaterial";

// Piso típico de losa de hormigón
export const floorConcreteSlab: AcousticMaterial = {
    id: "floor-concrete-slab",
    descriptor: "Concrete Slab Floor",
    subtype: "Solid slab",
    type: "Floor",
    thickness_mm: 200.0,
    mass_kg_m2: 480.0,
    catalog: "SON Catalog",
    color: "Gray",
    doubleLeaf: false,
    lightweightElement: false,
    layers: [
        { name: "50mm screed", thickness_mm: 50.0 },
        { name: "150mm reinforced concrete", thickness_mm: 150.0 },
    ],
    thirdOctaveBands: {
        50: 34.0, 63: 33.0, 80: 32.0, 100: 31.0, 125: 30.0, 160: 31.5,
        200: 33.0, 250: 34.5, 315: 36.0, 400: 37.5, 500: 39.0, 630: 40.5,
        800: 41.5, 1000: 42.0, 1250: 42.5, 1600: 43.0, 2000: 43.5,
        2500: 44.0, 3150: 44.5, 4000: 45.0, 5000: 45.0,
    },
    octaveBands: [
        { range: "100-3150", value: "41(-2;-4)" },
        { range: "125-4000", value: "41(-2;-4)" },
        { range: "160-5000", value: "41(-2;-4)" },
        { range: "50-5000", value: "41(-1;-4)" },
    ],
    weightedIndex: { Rw: 41, C: -2, Ctr: -4 },
    height: 0.2,
    width: 1.0,
    bottomOffset: 0
};

// Techo típico de losa de hormigón
export const ceilingConcreteSlab: AcousticMaterial = {
    id: "ceiling-concrete-slab",
    descriptor: "Concrete Slab Ceiling",
    subtype: "Solid slab",
    type: "Ceiling",
    thickness_mm: 200.0,
    mass_kg_m2: 480.0,
    catalog: "SON Catalog",
    color: "Light Gray",
    doubleLeaf: false,
    lightweightElement: false,
    layers: [
        { name: "20mm plaster", thickness_mm: 20.0 },
        { name: "180mm reinforced concrete", thickness_mm: 180.0 },
    ],
    thirdOctaveBands: {
        50: 33.0, 63: 32.0, 80: 31.0, 100: 30.0, 125: 29.0, 160: 30.5,
        200: 32.0, 250: 33.5, 315: 35.0, 400: 36.5, 500: 38.0, 630: 39.5,
        800: 40.5, 1000: 41.0, 1250: 41.5, 1600: 42.0, 2000: 42.5,
        2500: 43.0, 3150: 43.5, 4000: 44.0, 5000: 44.0,
    },
    octaveBands: [
        { range: "100-3150", value: "40(-2;-4)" },
        { range: "125-4000", value: "40(-2;-4)" },
        { range: "160-5000", value: "40(-2;-4)" },
        { range: "50-5000", value: "40(-1;-4)" },
    ],
    weightedIndex: { Rw: 40, C: -2, Ctr: -4 },
    height: 0.2,
    width: 1.0,
    bottomOffset: 0
};