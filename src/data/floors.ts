import { AcousticMaterial } from "@/modules/editor/types/AcousticMaterial";

// Piso típico de losa de hormigón
export const floorConcreteSlab: AcousticMaterial = {
    id: "floor-concrete-slab",
    descriptor: "Concrete Slab Floor",
    subtype: "Solid slab",
    type: "floor",
    thickness_mm: 200.0,
    mass_kg_m2: 480.0,
    catalog: "insonor Catalog",
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

export const floorAcousticPanel: AcousticMaterial = {
    id: "floor-acoustic-panel",
    descriptor: "Acoustic Panel Floor",
    subtype: "Suspended acoustic panel",
    type: "floor",
    thickness_mm: 40.0,
    mass_kg_m2: 10.0,
    catalog: "SON Catalog",
    color: "Light Beige",
    doubleLeaf: false,
    lightweightElement: true,
    layers: [
        { name: "Acoustic panel", thickness_mm: 40.0 },
    ],
    thirdOctaveBands: {
        50: 12.0, 63: 13.0, 80: 14.0, 100: 15.0, 125: 16.0, 160: 17.0,
        200: 18.0, 250: 19.0, 315: 20.0, 400: 21.0, 500: 22.0, 630: 23.0,
        800: 24.0, 1000: 25.0, 1250: 26.0, 1600: 27.0, 2000: 28.0,
        2500: 29.0, 3150: 30.0, 4000: 31.0, 5000: 31.0,
    },
    octaveBands: [
        { range: "100-3150", value: "22(-3;-6)" },
        { range: "125-4000", value: "22(-3;-6)" },
        { range: "160-5000", value: "22(-3;-6)" },
        { range: "50-5000", value: "22(-2;-6)" },
    ],
    weightedIndex: { Rw: 22, C: -3, Ctr: -6 },
    height: 0.04,
    width: 1.0,
    bottomOffset: 0
};



