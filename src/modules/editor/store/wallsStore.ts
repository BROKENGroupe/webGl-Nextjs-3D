import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { calculateWallAcousticRating, CEILING_TEMPLATES, FLOOR_TEMPLATES, Wall, WALL_TEMPLATES } from '@/modules/editor/types/walls';

import { AcousticMaterial, ThirdOctave } from '@/modules/editor/types/AcousticMaterial';
import { floorConcreteSlab } from "@/data/floors";
import { Opening } from '../types/openings';
import { ceilingConcreteSlab } from '@/data/acousticCeilings';
import { toast } from 'sonner';

// Tipos para piso y techo (más genéricos)
interface FloorCeiling {
  id: string;
  floorIndex?: number;
  ceilingIndex?: number;
  area: number;
  template: AcousticMaterial;
}

interface WallsStore {
  walls: Wall[];
  floors: FloorCeiling[];
  ceilings: FloorCeiling[];
  wallHeight: number;
  setWallHeight: (height: number) => void;
  addWall: (wallIndex: number, area: number, template?: AcousticMaterial) => void;
  addFloor: (floorIndex: number, area: number, template?: AcousticMaterial) => void;
  addCeiling: (ceilingIndex: number, area: number, template?: AcousticMaterial) => void;
  updateWall: (wallId: string, updates: Partial<Wall>) => void;
  updateCeiling: (ceilingId: string, updates: Partial<FloorCeiling>) => void;
  updateFloor: (floorId: string, updates: Partial<FloorCeiling>) => void;
  updateWallByIndex: (wallIndex: number, updates: Partial<Wall>) => void;
  updateCeilingByIndex: (ceilingIndex: number, updates: Partial<FloorCeiling>) => void;
  updateFloorByIndex: (floorIndex: number, updates: Partial<FloorCeiling>) => void;
  deleteWall: (wallId: string) => void;
  clearWalls: () => void;
  clearFloors: () => void;
  clearCeilings: () => void;
  generateWallsFromCoordinates: (coordinates: any[]) => void;
  calculateCompositeWallSTC: (wall: Wall, openings: Opening[]) => { low: number; mid: number; high: number; average: number };
  calculateRatingFromSTC: (stc: number) => 'A' | 'B' | 'C' | 'D' | 'E';
  analyzeWallWithOpenings: (wallIndex: number, openings: Opening[]) => void;
  recalculateAllWallsWithOpenings: (openings: Opening[]) => void;
  generateFloorFromCoordinates: (coordinates: { x: number; z: number }[]) => void;
  generateCeilingFromCoordinates: (coordinates: { x: number; z: number }[]) => void;
}

export const useWallsStore = create<WallsStore>()(
  persist(
    (set, get) => ({

      walls: [],
      floors: [],
      ceilings: [],
      wallHeight: 3.0,

      setWallHeight: (height: number) => set({ wallHeight: height }),

      addWall: (wallIndex, area, template = WALL_TEMPLATES['wall-gypsum-board']) => {
        const newWall: Wall = {
          id: `wall-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          wallIndex,
          template,
          area,
          currentCondition: 'excellent',
          start: { x: 0, z: 0 },
          end: { x: 0, z: 0 },
          acousticRating: calculateWallAcousticRating({
            id: '',
            wallIndex,
            template,
            area,
            currentCondition: 'excellent',
            start: { x: 0, z: 0 },
            end: { x: 0, z: 0 }
          })
        };
        console.log('🧱 WallsStore initialized'),

          newWall.acousticRating = calculateWallAcousticRating(newWall);
        set((state) => ({
          walls: [...state.walls, newWall]
        }));
        console.log('🧱 Nueva pared agregada:', newWall);
      },

      addFloor: (floorIndex, area, template = FLOOR_TEMPLATES['floor-concrete-slab']) => {
        const newFloor: FloorCeiling = {
          id: `floor-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          area,
          template,
          floorIndex
        };
        set((state) => ({
          floors: [...state.floors, newFloor]
        }));
        console.log('🟫 Piso agregado:', newFloor);
      },

      addCeiling: (ceilingIndex, area, template = CEILING_TEMPLATES['ceiling-concrete-slab']) => {
        const newCeiling: FloorCeiling = {
          id: `ceiling-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          area,
          template,
          ceilingIndex
        };
        set((state) => ({
          ceilings: [...state.ceilings, newCeiling]
        }));
        console.log('⬛ Techo agregado:', newCeiling);
      },

      updateCeiling: (ceilingId: string, updates: Partial<FloorCeiling>) => {
        set((state) => ({
          ceilings: state.ceilings.map(ceiling => {
            if (ceiling.id === ceilingId) {
              toast.success("Material actualizado: " + (updates.template?.descriptor || ceiling.template.descriptor));
              return { ...ceiling, ...updates };
            }
            return ceiling;
          })
        }));
      },

      updateFloor: (floorId: string, updates: Partial<FloorCeiling>) => {
        set((state) => ({
          floors: state.floors.map(floor => {
            if (floor.id === floorId) {
              const updatedFloor = { ...floor, ...updates };
              toast.success("Material actualizado: " + updatedFloor.template.descriptor);
              return updatedFloor;
            }
            return floor;
          })
        }));
      },

      updateWall: (wallId, updates) => {
        console.log('🔧 Actualizando pared:', wallId, updates);
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

      updateCeilingByIndex: (ceilingIndex, updates) => {
        set((state) => ({
          ceilings: state.ceilings.map(ceiling => {
            if (ceiling.ceilingIndex === ceilingIndex) {
              const updatedCeiling = { ...ceiling, ...updates };
              toast.success("Material actualizado: " + updatedCeiling.template.descriptor);
              return {
                ...updatedCeiling
              };
            }

            return ceiling;
          })
        }));
      },
      updateFloorByIndex: (floorIndex, updates) => {
        set((state) => ({
          floors: state.floors.map(floor => {
            if (floor.floorIndex === floorIndex) {
              const updatedFloor = { ...floor, ...updates };
              toast.success("Material actualizado: " + updatedFloor.template.descriptor);
              return {
                ...updatedFloor
              };
            }

            return floor;
          })
        }));
      },

      // NUEVO: Actualiza la pared por wallIndex
      updateWallByIndex: (wallIndex, updates) => {
        set((state) => ({
          walls: state.walls.map(wall => {
            if (wall.wallIndex === wallIndex) {
              const updatedWall = { ...wall, ...updates };
              toast.success("Material actualizado: " + updatedWall.template.descriptor);
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

      clearFloors: () => {
        set({ floors: [] });
      },

      clearCeilings: () => {
        set({ ceilings: [] });
      },

      analyzeWallWithOpenings: (wallIndex: number, openings: Opening[]) => {
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

      recalculateAllWallsWithOpenings: (openings: Opening[]) => {
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
        // Calcular área del polígono (piso/techo) usando la fórmula de Shoelace
        console.log('🧱 Generando paredes desde coordenadas:', coordinates);
        let totalFloorArea = 0;
        if (coordinates.length > 2) {
          totalFloorArea = Math.abs(
            coordinates.reduce((sum, curr, i, arr) => {
              const next = arr[(i + 1) % arr.length];
              return sum + (curr.x * next.z - next.x * curr.z);
            }, 0) / 2
          );
        }

        set((state) => {
          const wallHeight = state.wallHeight;

          const updatedWalls = coordinates.map((coord, index) => {
            const nextCoord = coordinates[(index + 1) % coordinates.length];
            const wallLength = Math.sqrt(
              (nextCoord.x - coord.x) ** 2 + (nextCoord.z - coord.z) ** 2
            );
            const area = wallLength * wallHeight;

            // Busca si ya existe la pared en el store y conserva el material/template
            const prevWall = state.walls.find(w => w.wallIndex === index);

            return {
              id: prevWall?.id ?? `wall-${Date.now()}-${index}`,
              wallIndex: index,
              template: prevWall?.template ?? WALL_TEMPLATES['wall-gypsum-board'],
              area,
              currentCondition: prevWall?.currentCondition ?? 'excellent',
              start: { x: coord.x, z: coord.z },
              end: { x: nextCoord.x, z: nextCoord.z },
              acousticRating: undefined
            };
          });

          // // Calcula el rating acústico para cada pared
          // updatedWalls.forEach(wall => {
          //   wall.acousticRating = calculateWallAcousticRating(wall);
          // });

          return { walls: updatedWalls };
        });

        // Piso y techo igual
        const { floors, ceilings } = get();

        if (floors.length === 0) {
          get().addFloor(0, totalFloorArea, floorConcreteSlab);
        }
        if (ceilings.length === 0) {
          get().addCeiling(0, totalFloorArea, ceilingConcreteSlab);
        }
      },

      generateFloorFromCoordinates: (coordinates: { x: number; z: number }[]) => {
        let area = 0;
        if (coordinates.length > 2) {
          area = Math.abs(
            coordinates.reduce((sum, curr, i, arr) => {
              const next = arr[(i + 1) % arr.length];
              return sum + (curr.x * next.z - next.x * curr.z);
            }, 0) / 2
          );
        }
        const template = FLOOR_TEMPLATES['floor-concrete-slab'];
        set((state) => {
          if (state.floors.length === 0) {
            // Si no hay piso, lo agrega
            return {
              floors: [{
                id: `floor-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                area,
                template
              }]
            };
          } else {
            // Si ya hay piso, lo actualiza
            return {
              floors: state.floors.map((f, idx) =>
                idx === 0
                  ? { ...f, area, template }
                  : f
              )
            };
          }
        });
      },

      generateCeilingFromCoordinates: (coordinates: { x: number; z: number }[]) => {
        let area = 0;
        if (coordinates.length > 2) {
          area = Math.abs(
            coordinates.reduce((sum, curr, i, arr) => {
              const next = arr[(i + 1) % arr.length];
              return sum + (curr.x * next.z - next.x * curr.z);
            }, 0) / 2
          );
        }
        const template = CEILING_TEMPLATES['ceiling-concrete-slab'];
        set((state) => {
          if (state.ceilings.length === 0) {
            // Si no hay techo, lo agrega
            return {
              ceilings: [{
                id: `ceiling-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                area,
                template
              }]
            };
          } else {
            // Si ya hay techo, lo actualiza
            return {
              ceilings: state.ceilings.map((c, idx) =>
                idx === 0
                  ? { ...c, area, template }
                  : c
              )
            };
          }
        });
      },
    }),
    {
      name: "walls-storage",
      partialize: (state) => ({
        walls: state.walls,
        floors: state.floors,
        ceilings: state.ceilings,
        wallHeight: state.wallHeight
      })
    }
  )
);





