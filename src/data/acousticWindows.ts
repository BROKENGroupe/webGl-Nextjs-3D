import { AcousticMaterial } from "../modules/editor/types/AcousticMaterial";

// Ventana simple (window-standard)
export const windowStandard: AcousticMaterial = {
  id: "window-standard",
  descriptor: "Single Glazing Window",
  subtype: "Float Glass",
  type: "Window",
  thickness_mm: 6,
  mass_kg_m2: 15,
  catalog: "SON Catalog",
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
  octaveBands: [
    { range: "125-4000", value: "26(-2;-4)" }
  ],
  weightedIndex: { Rw: 26, C: -2, Ctr: -4 },
  height: 0.1,
  width: 0.9,
  bottomOffset: 0
};

// Ventana doble vidrio (window-double-glazed)
export const windowDoubleGlazed: AcousticMaterial = {
  id: "window-double-glazed",
  descriptor: "Double Glazing Window",
  subtype: "Argon Filled",
  type: "Window",
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
  octaveBands: [
    { range: "125-4000", value: "35(-1;-3)" }
  ],
  weightedIndex: { Rw: 35, C: -1, Ctr: -3 },
  height: 0.1,
  width: 0.9,
  bottomOffset: 0
};