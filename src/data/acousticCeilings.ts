import { AcousticMaterial } from "@/modules/editor/types/AcousticMaterial";

// Techo típico de losa de hormigón
export const ceilingConcreteSlab: AcousticMaterial = {
    id: "ceiling-concrete-slab",
    descriptor: "Concrete Slab Ceiling",
    subtype: "Solid slab",
    type: "ceiling",
    thickness_mm: 200.0,
    mass_kg_m2: 480.0,
    catalog: "insonor Catalog",
    colorName: "Light Gray",
    color: "#D3D3D3", // Light Gray hexadecimal
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

export const ceilingAcousticPanel: AcousticMaterial = {
    id: "ceiling-acoustic-panel",
    descriptor: "Acoustic Panel Ceiling",
    subtype: "Suspended acoustic panel",
    type: "ceiling",
    thickness_mm: 50.0,
    mass_kg_m2: 12.0,
    catalog: "insonor Catalog",
    colorName: "White",
    color: "#FFFFFF", // White hexadecimal
    doubleLeaf: false,
    lightweightElement: true,
    layers: [
        { name: "Acoustic panel", thickness_mm: 50.0 },
    ],
    thirdOctaveBands: {
        50: 15.0, 63: 16.0, 80: 17.0, 100: 18.0, 125: 19.0, 160: 20.0,
        200: 21.0, 250: 22.0, 315: 23.0, 400: 24.0, 500: 25.0, 630: 26.0,
        800: 27.0, 1000: 28.0, 1250: 29.0, 1600: 30.0, 2000: 31.0,
        2500: 32.0, 3150: 33.0, 4000: 34.0, 5000: 34.0,
    },
    octaveBands: [
        { range: "100-3150", value: "25(-3;-6)" },
        { range: "125-4000", value: "25(-3;-6)" },
        { range: "160-5000", value: "25(-3;-6)" },
        { range: "50-5000", value: "25(-2;-6)" },
    ],
    weightedIndex: { Rw: 25, C: -3, Ctr: -6 },
    height: 0.05,
    width: 1.0,
    bottomOffset: 0
};

// Techo de panel metálico acústico
export const ceilingMetalPanel: AcousticMaterial = {
    id: "ceiling-metal-panel",
    descriptor: "Metal Acoustic Panel Ceiling",
    subtype: "Metal panel",
    type: "ceiling",
    thickness_mm: 30.0,
    mass_kg_m2: 18.0,
    catalog: "insonor Catalog",
    colorName: "Silver",
    color: "#C0C0C0", // Silver
    doubleLeaf: false,
    lightweightElement: true,
    layers: [
        { name: "Metal acoustic panel", thickness_mm: 30.0 },
    ],
    thirdOctaveBands: {
        50: 18.0, 63: 19.0, 80: 20.0, 100: 21.0, 125: 22.0, 160: 23.0,
        200: 24.0, 250: 25.0, 315: 26.0, 400: 27.0, 500: 28.0, 630: 29.0,
        800: 30.0, 1000: 31.0, 1250: 32.0, 1600: 33.0, 2000: 34.0,
        2500: 35.0, 3150: 36.0, 4000: 37.0, 5000: 37.0,
    },
    octaveBands: [
        { range: "100-3150", value: "28(-3;-5)" },
        { range: "125-4000", value: "28(-3;-5)" },
    ],
    weightedIndex: { Rw: 28, C: -3, Ctr: -5 },
    height: 0.03,
    width: 1.0,
    bottomOffset: 0
};

// Techo de lana mineral suspendida
export const ceilingMineralWool: AcousticMaterial = {
    id: "ceiling-mineral-wool",
    descriptor: "Mineral Wool Suspended Ceiling",
    subtype: "Mineral wool panel",
    type: "ceiling",
    thickness_mm: 60.0,
    mass_kg_m2: 8.0,
    catalog: "insonor Catalog",
    colorName: "Beige",
    color: "#F5DEB3", // Wheat/Beige
    doubleLeaf: false,
    lightweightElement: true,
    layers: [
        { name: "Mineral wool panel", thickness_mm: 60.0 },
    ],
    thirdOctaveBands: {
        50: 10.0, 63: 11.0, 80: 12.0, 100: 13.0, 125: 14.0, 160: 15.0,
        200: 16.0, 250: 17.0, 315: 18.0, 400: 19.0, 500: 20.0, 630: 21.0,
        800: 22.0, 1000: 23.0, 1250: 24.0, 1600: 25.0, 2000: 26.0,
        2500: 27.0, 3150: 28.0, 4000: 29.0, 5000: 29.0,
    },
    octaveBands: [
        { range: "100-3150", value: "20(-4;-7)" },
        { range: "125-4000", value: "20(-4;-7)" },
    ],
    weightedIndex: { Rw: 20, C: -4, Ctr: -7 },
    height: 0.06,
    width: 1.0,
    bottomOffset: 0
};

// Techo de yeso acústico
export const ceilingGypsumBoard: AcousticMaterial = {
    id: "ceiling-gypsum-board",
    descriptor: "Gypsum Board Acoustic Ceiling",
    subtype: "Gypsum board",
    type: "ceiling",
    thickness_mm: 25.0,
    mass_kg_m2: 9.0,
    catalog: "insonor Catalog",
    colorName: "Light Blue",
    color: "#B0C4DE", // Light Steel Blue
    doubleLeaf: false,
    lightweightElement: true,
    layers: [
        { name: "Gypsum board", thickness_mm: 25.0 },
    ],
    thirdOctaveBands: {
        50: 14.0, 63: 15.0, 80: 16.0, 100: 17.0, 125: 18.0, 160: 19.0,
        200: 20.0, 250: 21.0, 315: 22.0, 400: 23.0, 500: 24.0, 630: 25.0,
        800: 26.0, 1000: 27.0, 1250: 28.0, 1600: 29.0, 2000: 30.0,
        2500: 31.0, 3150: 32.0, 4000: 33.0, 5000: 33.0,
    },
    octaveBands: [
        { range: "100-3150", value: "22(-3;-6)" },
        { range: "125-4000", value: "22(-3;-6)" },
    ],
    weightedIndex: { Rw: 22, C: -3, Ctr: -6 },
    height: 0.025,
    width: 1.0,
    bottomOffset: 0
};