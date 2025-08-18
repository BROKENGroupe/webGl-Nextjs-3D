import { create } from 'zustand';
import { calculateWallAcousticRating, Wall, WALL_TEMPLATES } from '@/types/walls';

import { Opening } from '@/types/openings';
import { AcousticMaterial, ThirdOctave } from '@/types/AcousticMaterial';


interface WallsStore {
  walls: Wall[];
  addWall: (wallIndex: number, area: number, template?: AcousticMaterial) => void;
  updateWall: (wallId: string, updates: Partial<Wall>) => void;
  deleteWall: (wallId: string) => void;
  clearWalls: () => void;
  generateWallsFromCoordinates: (coordinates: any[]) => void;
  analyzeWallWithOpenings: (wallIndex: number, openings: Opening[]) => void;
  recalculateAllWallsWithOpenings: (openings: Opening[]) => void;
  calculateCompositeWallSTC: (wall: Wall, openings: Opening[]) => { low: number; mid: number; high: number; average: number };
  calculateRatingFromSTC: (stc: number) => 'A' | 'B' | 'C' | 'D' | 'E';
}

export const useWallsStore = create<WallsStore>((set, get) => ({
  walls: [],

  addWall: (wallIndex, area, template = WALL_TEMPLATES['wall-ceramic-brick']) => {
    const newWall: Wall = {
      id: `wall-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      wallIndex,
      template,
      area,
      currentCondition: 'excellent',
      start: { x: 0, z: 0 },
      end: { x: 0, z: 0 }
    };

    newWall.acousticRating = calculateWallAcousticRating(newWall);

    set((state) => ({
      walls: [...state.walls, newWall]
    }));

    console.log('🧱 Nueva pared agregada:', newWall);
  },

  updateWall: (wallId, updates) => {
    set((state) => ({
      walls: state.walls.map(wall => {
        if (wall.id === wallId) {
          const updatedWall = { ...wall, ...updates };
          return {
            ...updatedWall,
            acousticRating: calculateWallAcousticRating(updatedWall)
          };
        }
        return wall;
      })
    }));
  },

  deleteWall: (wallId) => {
    set((state) => ({
      walls: state.walls.filter(wall => wall.id !== wallId)
    }));
  },

  clearWalls: () => {
    set({ walls: [] });
  },

  analyzeWallWithOpenings: (wallIndex, openings) => {
    const { walls } = get();
    const wall = walls.find(w => w.wallIndex === wallIndex);

    if (!wall) {
      console.warn(`⚠️ No se encontró pared con índice ${wallIndex}`);
      return;
    }

    const wallOpenings = openings.filter(opening => opening.wallIndex === wallIndex);

    const openingsArea = wallOpenings.reduce((sum, opening) =>
      sum + (opening.width * opening.height), 0
    );

    const solidWallArea = wall.area - openingsArea;
    const openingsPercentage = (openingsArea / wall.area) * 100;

    // Cálculo acústico usando AcousticMaterial
    const bands: ThirdOctave[] = [125, 500, 2000];
    const wallTLBands = bands.map(band => wall.template.thirdOctaveBands[band] ?? 0);
    const wallAvgSTC = wallTLBands.reduce((a, b) => a + b, 0) / wallTLBands.length;

    if (wallOpenings.length > 0) {
      wallOpenings.forEach((opening, idx) => {
        const openingTLBands = bands.map(band => opening.template.thirdOctaveBands[band] ?? 0);
        const openingAvgSTC = openingTLBands.reduce((a, b) => a + b, 0) / openingTLBands.length;
        const openingArea = opening.width * opening.height;

        console.log(`   ${opening.type === 'door' ? '🚪' : '🪟'} ${opening.type.toUpperCase()} ${idx + 1}:`);
        console.log(`      • Template: ${opening.template.descriptor}`);
        console.log(`      • Dimensiones: ${opening.width}m × ${opening.height}m`);
        console.log(`      • Área: ${openingArea.toFixed(2)}m²`);
        console.log(`      • STC: ${openingAvgSTC.toFixed(1)}dB`);
        console.log(`      • Pérdida vs pared: ${(wallAvgSTC - openingAvgSTC).toFixed(1)}dB`);
      });

      // Cálculo de STC efectivo combinado
      const weightedSTC = get().calculateCompositeWallSTC(wall, wallOpenings);

      const reductionFromOriginal = wallAvgSTC - weightedSTC.average;
      const newRating = get().calculateRatingFromSTC(weightedSTC.average);

      console.log(`   • Reducción por aberturas: ${reductionFromOriginal.toFixed(1)}dB`);
      console.log(`   • Rating acústico: ${wall.acousticRating} → ${newRating}`);

      // Recomendaciones
      if (openingsPercentage > 25) {
        console.log(`   ⚠️  Porcentaje alto de aberturas (${openingsPercentage.toFixed(1)}%)`);
        console.log(`   💡 Considerar aberturas con mejor aislamiento acústico`);
      }
      if (reductionFromOriginal > 15) {
        console.log(`   ⚠️  Gran pérdida acústica por aberturas (${reductionFromOriginal.toFixed(1)}dB)`);
        console.log(`   💡 Las aberturas son el punto débil del aislamiento`);
      }
    } else {
      console.log(`\n✅ Pared sin aberturas - Mantiene propiedades originales`);
    }
  },

  recalculateAllWallsWithOpenings: (openings) => {
    const { walls } = get();

    walls.forEach(wall => {
      get().analyzeWallWithOpenings(wall.wallIndex, openings);
    });

    // Resumen general del edificio
    const totalWallArea = walls.reduce((sum, wall) => sum + wall.area, 0);
    const totalOpeningsArea = openings.reduce((sum, opening) =>
      sum + (opening.width * opening.height), 0
    );
    const buildingOpeningsPercentage = (totalOpeningsArea / totalWallArea) * 100;

    // Calcular STC promedio del edificio considerando aberturas
    let buildingWeightedSTC = 0;
    let totalEffectiveArea = 0;

    walls.forEach(wall => {
      const wallOpenings = openings.filter(o => o.wallIndex === wall.wallIndex);
      const wallWeightedSTC = get().calculateCompositeWallSTC(wall, wallOpenings);
      const wallEffectiveArea = wall.area;

      buildingWeightedSTC += wallWeightedSTC.average * wallEffectiveArea;
      totalEffectiveArea += wallEffectiveArea;
    });

    const avgBuildingSTC = buildingWeightedSTC / totalEffectiveArea;
    const buildingRating = get().calculateRatingFromSTC(avgBuildingSTC);

    console.log(`   • STC promedio edificio: ${avgBuildingSTC.toFixed(1)}dB`);
    console.log(`   • Rating acústico edificio: ${buildingRating}`);
  },

  calculateCompositeWallSTC: (wall: Wall, openings: Opening[]) => {
    const bands: ThirdOctave[] = [125, 500, 2000];
    if (openings.length === 0) {
      const wallTLBands = bands.map(band => wall.template.thirdOctaveBands[band] ?? 0);
      return {
        low: wallTLBands[0],
        mid: wallTLBands[1],
        high: wallTLBands[2],
        average: wallTLBands.reduce((a, b) => a + b, 0) / wallTLBands.length
      };
    }

    const totalArea = wall.area;
    const openingsArea = openings.reduce((sum, o) => sum + (o.width * o.height), 0);
    const solidWallArea = totalArea - openingsArea;

    // Weighted average basado en áreas (ISO 12354-4)
    const wallTLBands = bands.map(band => wall.template.thirdOctaveBands[band] ?? 0);

    const composite = bands.map((band, idx) => {
      const wallTL = wallTLBands[idx];
      const sumOpenings = openings.reduce((sum, opening) => {
        const openingTL = opening.template.thirdOctaveBands[band] ?? 0;
        const openingArea = opening.width * opening.height;
        return sum + (Math.pow(10, -openingTL / 10) * openingArea);
      }, 0);
      const total = (Math.pow(10, -wallTL / 10) * solidWallArea) + sumOpenings;
      return -10 * Math.log10(total / totalArea);
    });

    return {
      low: composite[0],
      mid: composite[1],
      high: composite[2],
      average: composite.reduce((a, b) => a + b, 0) / composite.length
    };
  },

  calculateRatingFromSTC: (stc: number): 'A' | 'B' | 'C' | 'D' | 'E' => {
    if (stc >= 55) return 'A';
    if (stc >= 48) return 'B';
    if (stc >= 40) return 'C';
    if (stc >= 30) return 'D';
    return 'E';
  },

  generateWallsFromCoordinates: (coordinates) => {
    set({ walls: [] });

    coordinates.forEach((coord, index) => {
      const nextCoord = coordinates[(index + 1) % coordinates.length];

      const wallLength = Math.sqrt(
        (nextCoord.x - coord.x) ** 2 + (nextCoord.z - coord.z) ** 2
      );

      const wallHeight = 3.0;
      const area = wallLength * wallHeight;
      const template = WALL_TEMPLATES['wall-ceramic-brick'];

      const newWall: Wall = {
        id: `wall-${Date.now()}-${index}`,
        wallIndex: index,
        template,
        area,
        currentCondition: 'excellent',
        start: { x: coord.x, z: coord.z },
        end: { x: nextCoord.x, z: nextCoord.z }
      };

      newWall.acousticRating = calculateWallAcousticRating(newWall);

      set((state) => ({
        walls: [...state.walls, newWall]
      }));
    });
  }
}));