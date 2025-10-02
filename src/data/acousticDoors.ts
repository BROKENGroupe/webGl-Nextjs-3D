import { AcousticMaterial, ThirdOctave } from '@/modules/materials/types/AcousticMaterial';

export const doorStandard: AcousticMaterial = {
  "id": "door-standard",
  "descriptor": "Standard Wood Door",
  "name": "Standard Wood Door",
  "description": "description",
  "subtype": "Solid Pine",
  "type": "door",
  "thickness_mm": 40,
  "mass_kg_m2": 28,
  "catalog": "insonor Catalog",
  "color": "Light Brown",
  "doubleLeaf": false,
  "lightweightElement": false,
  "layers": [
    { "name": "Solid pine panel", "thickness_mm": 40 }
  ],
  "thirdOctaveBands": {
    "50": 18, "63": 19, "80": 20, "100": 20, "125": 20, "160": 21, "200": 22, "250": 24, "315": 25, "400": 26,
    "500": 28, "630": 28, "800": 27, "1000": 28, "1250": 27, "1600": 26, "2000": 25, "2500": 24, "3150": 23, "4000": 22, "5000": 21
  },
  "octaveBands": [
    { "range": "125-4000", "value": "28(-2;-4)" }
  ],
  "weightedIndex": { "Rw": 28, "C": -2, "Ctr": -4 },
  "height": 2.0,
  "width": 0.9,
  "bottomOffset": 0
};

export const doorDouble: AcousticMaterial = {
  "id": "door-double",
  "description": "description",
  "descriptor": "Double Wood Door",
  "name": "Double Wood Door",
  "subtype": "Oak Double Leaf",
  "type": "door",
  "thickness_mm": 45,
  "mass_kg_m2": 32,
  "catalog": "insonor Catalog",
  "color": "Brown",
  "doubleLeaf": true,
  "lightweightElement": false,
  "layers": [
    { "name": "Solid oak panel", "thickness_mm": 45 }
  ],
  "thirdOctaveBands": {
    50: 22, "63": 23, "80": 24, "100": 25, "125": 25, "160": 26, "200": 27, "250": 29, "315": 30, "400": 31,
    "500": 32, "630": 32, "800": 31, "1000": 32, "1250": 31, "1600": 30, "2000": 29, "2500": 28, "3150": 27, "4000": 26, "5000": 25
  },
  "octaveBands": [
    { "range": "125-4000", "value": "32(-2;-4)" }
  ],
  "weightedIndex": { "Rw": 32, "C": -2, "Ctr": -4 },
  "height": 2.0,
  "width": 0.9,
  "bottomOffset": 0
};

export const doorAcoustic: AcousticMaterial = {
    "id": "door-acoustic",
    "description": "description",
    "descriptor": "Acoustic Door",
    "name": "Acoustic Door",
    "subtype": "Mineral Wool Core",
    "type": 'door',
    "thickness_mm": 55,
    "mass_kg_m2": 48,
    "catalog": "insonor Catalog",
    "color": "Gray",
    "doubleLeaf": false,
    "lightweightElement": false,
    "layers": [
      { "name": "Steel sheet", "thickness_mm": 2 },
      { "name": "Mineral wool core", "thickness_mm": 51 },
      { "name": "Steel sheet", "thickness_mm": 2 }
    ],
    "thirdOctaveBands": {
      "50": 35, "63": 36, "80": 37, "100": 38, "125": 40, "160": 41, "200": 42, "250": 43, "315": 44, "400": 45,
      "500": 45, "630": 44, "800": 43, "1000": 45, "1250": 44, "1600": 43, "2000": 42, "2500": 41, "3150": 40, "4000": 39, "5000": 38
    },
    "octaveBands": [
      { "range": "125-4000", "value": "45(-2;-4)" }
    ],
    "weightedIndex": { "Rw": 45, "C": -2, "Ctr": -4 },
    "height": 2.0,
    "width": 0.9,
    "bottomOffset": 0
};