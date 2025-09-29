import { AcousticMaterial, ThirdOctave } from '@/modules/materials/types/AcousticMaterial';

// Techo típico de losa de hormigón
export const ceilingConcreteSlab: AcousticMaterial = {
    id: "ceiling-concrete-slab",
    descriptor: "Concrete Slab Ceiling",
    subtype: "Solid slab",
    type: "ceiling",
    thickness: 200.0,
    mass: 480.0,
    catalog: "insonor Catalog",
    color: "#D3D3D3", // Light Gray hexadecimal
    doubleLeaf: false,
    lightweightElement: false,
    layers: [
        { name: "20mm plaster", thickness: 20.0 },
        { name: "180mm reinforced concrete", thickness: 180.0 },
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
    thickness: 50.0,
    mass: 12.0,
    catalog: "insonor Catalog",
    color: "#FFFFFF", // White hexadecimal
    doubleLeaf: false,
    lightweightElement: true,
    layers: [
        { name: "Acoustic panel", thickness: 50.0 },
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