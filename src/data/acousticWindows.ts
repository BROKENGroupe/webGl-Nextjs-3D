import { AcousticMaterial, ThirdOctave } from '@/modules/materials/types/AcousticMaterial';

enum WindowSubtypes {
  FloatGlass = "Float Glass",
  ArgonFilled = "Argon Filled",
  LaminatedSafetyGlass = "Laminated Safety Glass",
  TripleGlassArgon = "Triple Glass Argon",
  SpecialAcousticGlass = "Special Acoustic Glass"
}

// Ventana simple (window-standard)
export const windowStandard: AcousticMaterial = {
  id: "window-standard",
  descriptor: "Single Glazing Window",
  subtype: WindowSubtypes.FloatGlass,
  type: "window",
  thickness_mm: 6,
  mass_kg_m2: 15,
  catalog: "insonor Catalog",
  color: "Transparent",
  doubleLeaf: false,
  lightweightElement: true,
  layers: [
    { name: "Float glass", thickness_mm: 6 }
  ],
  thirdOctaveBands: {
    50: 14, 63: 15, 80: 16, 100: 17, 125: 18, 160: 19, 200: 20, 250: 22, 315: 23, 400: 24,
    500: 26, 630: 26, 800: 25, 1000: 26, 1250: 25, 1600: 24, 2000: 23, 2500: 22, 3150: 21, 4000: 20, 5000: 19
  },
  "octaveBands": {
    "63": 16.0, "125": 19.0,
    "250": 22.0, "500": 25.0,
    "1000": 28.0, "2000": 31.0,
    "4000": 34.0
  },
  weightedIndex: { Rw: 26, C: -2, Ctr: -4 },
  height: 1,
  width: 1,
  bottomOffset: 1.0
};

// Ventana doble vidrio (window-double-glazed)
export const windowDoubleGlazed: AcousticMaterial = {
  id: "window-double-glazed",
  descriptor: "Double Glazing Window",
  subtype: WindowSubtypes.ArgonFilled,
  type: "window",
  thickness_mm: 24,
  mass_kg_m2: 18,
  catalog: "insonor Catalog",
  color: "Transparent",
  doubleLeaf: false,
  lightweightElement: true,
  layers: [
    { name: "Glass pane 1", thickness_mm: 6 },
    { name: "Argon gap", thickness_mm: 12 },
    { name: "Glass pane 2", thickness_mm: 6 }
  ],
  thirdOctaveBands: {
    50: 22, 63: 24, 80: 26, 100: 27, 125: 28, 160: 30, 200: 32, 250: 33, 315: 34, 400: 35,
    500: 35, 630: 34, 800: 33, 1000: 35, 1250: 34, 1600: 33, 2000: 32, 2500: 31, 3150: 30, 4000: 29,
    5000: 28
  },
  "octaveBands": {
    "63": 16.0, "125": 19.0,
    "250": 22.0, "500": 25.0,
    "1000": 28.0, "2000": 31.0,
    "4000": 34.0
  },
  weightedIndex: { Rw: 35, C: -1, Ctr: -3 },
  height: 1,
  width: 1,
  bottomOffset: 1
};

// Ventana laminada (window-laminated)
export const windowLaminated: AcousticMaterial = {
  id: "window-laminated",
  descriptor: "Laminated Glass Window",
  subtype: WindowSubtypes.LaminatedSafetyGlass,
  type: "window",
  thickness_mm: 8,
  mass_kg_m2: 17,
  catalog: "SON Catalog",
  color: "Transparent",
  doubleLeaf: false,
  lightweightElement: true,
  layers: [
    { name: "Laminated glass", thickness_mm: 8 }
  ],
  thirdOctaveBands: {
    50: 16, 63: 17, 80: 18, 100: 19, 125: 20, 160: 21, 200: 22, 250: 23, 315: 24, 400: 25,
    500: 27, 630: 27, 800: 26, 1000: 27, 1250: 26, 1600: 25, 2000: 24, 2500: 23, 3150: 22, 4000: 21, 5000: 20
  },
  "octaveBands": {
    "63": 16.0, "125": 19.0,
    "250": 22.0, "500": 25.0,
    "1000": 28.0, "2000": 31.0,
    "4000": 34.0
  },
  weightedIndex: { Rw: 28, C: -2, Ctr: -5 },
  height: 1,
  width: 1,
  bottomOffset: 1
};

// Ventana triple vidrio (window-triple-glazed)
export const windowTripleGlazed: AcousticMaterial = {
  id: "window-triple-glazed",
  descriptor: "Triple Glazing Window",
  subtype: WindowSubtypes.TripleGlassArgon,
  type: "window",
  thickness_mm: 36,
  mass_kg_m2: 22,
  catalog: "insonor Catalog",
  color: "Transparent",
  doubleLeaf: false,
  lightweightElement: true,
  layers: [
    { name: "Glass pane 1", thickness_mm: 6 },
    { name: "Argon gap 1", thickness_mm: 12 },
    { name: "Glass pane 2", thickness_mm: 6 },
    { name: "Argon gap 2", thickness_mm: 6 },
    { name: "Glass pane 3", thickness_mm: 6 }
  ],
  thirdOctaveBands: {
    50: 26, 63: 28, 80: 30, 100: 31, 125: 32, 160: 34, 200: 36, 250: 37, 315: 38, 400: 39,
    500: 39, 630: 38, 800: 37, 1000: 39, 1250: 38, 1600: 37, 2000: 36, 2500: 35, 3150: 34, 4000: 33,
    5000: 32
  },
  "octaveBands": {
    "63": 16.0, "125": 19.0,
    "250": 22.0, "500": 25.0,
    "1000": 28.0, "2000": 31.0,
    "4000": 34.0
  },
  weightedIndex: { Rw: 39, C: -1, Ctr: -3 },
  height: 1,
  width: 1,
  bottomOffset: 1
};

// Ventana acústica (window-acoustic)
export const windowAcoustic: AcousticMaterial = {
  id: "window-acoustic",
  descriptor: "Acoustic Window",
  subtype: WindowSubtypes.SpecialAcousticGlass,
  type: "window",
  thickness_mm: 12,
  mass_kg_m2: 25,
  catalog: "insonor Catalog",
  color: "Transparent",
  colorName: "Crystal Clear",
  doubleLeaf: false,
  lightweightElement: false,
  layers: [
    { name: "Acoustic glass", thickness_mm: 12 }
  ],
  thirdOctaveBands: {
    50: 20, 63: 22, 80: 24, 100: 25, 125: 26, 160: 28, 200: 30, 250: 32, 315: 33, 400: 34,
    500: 36, 630: 36, 800: 35, 1000: 36, 1250: 35, 1600: 34, 2000: 33, 2500: 32, 3150: 31, 4000: 30, 5000: 29
  },
  "octaveBands": {
    "63": 16.0, "125": 19.0,
    "250": 22.0, "500": 25.0,
    "1000": 28.0, "2000": 31.0,
    "4000": 34.0
  },
  weightedIndex: { Rw: 43, C: -1, Ctr: -3 },
  height: 1,
  width: 1,
  bottomOffset: 1
};