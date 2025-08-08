import { create } from 'zustand';
import { Wall, WallTemplate, WALL_TEMPLATES, calculateWallAcousticRating } from '@/types/walls';
import { Opening } from '@/types/openings';

interface WallsStore {
  walls: Wall[];
  addWall: (wallIndex: number, area: number, template?: WallTemplate) => void;
  updateWall: (wallId: string, updates: Partial<Wall>) => void;
  deleteWall: (wallId: string) => void;
  clearWalls: () => void;
  generateWallsFromCoordinates: (coordinates: any[]) => void;
  // ✅ NUEVAS FUNCIONES PARA ANÁLISIS CON ABERTURAS
  analyzeWallWithOpenings: (wallIndex: number, openings: Opening[]) => void;
  recalculateAllWallsWithOpenings: (openings: Opening[]) => void;
  calculateCompositeWallSTC: (wall: Wall, openings: Opening[]) => { low: number; mid: number; high: number; average: number };
  calculateRatingFromSTC: (stc: number) => 'A' | 'B' | 'C' | 'D' | 'E';
}

export const useWallsStore = create<WallsStore>((set, get) => ({
  walls: [],
  
  addWall: (wallIndex, area, template = WALL_TEMPLATES['drywall-standard']) => {
    const newWall: Wall = {
      id: `wall-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      wallIndex,
      template,
      area,
      currentCondition: 'excellent'
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

  // ✅ ANÁLISIS INDIVIDUAL DE PARED CON ABERTURAS
  analyzeWallWithOpenings: (wallIndex, openings) => {
    const { walls } = get();
    const wall = walls.find(w => w.wallIndex === wallIndex);
    
    if (!wall) {
      console.warn(`⚠️ No se encontró pared con índice ${wallIndex}`);
      return;
    }

    // Filtrar aberturas de esta pared
    const wallOpenings = openings.filter(opening => opening.wallIndex === wallIndex);
    
    console.log(`\n🔍 ANÁLISIS PARED ${wallIndex + 1} CON ABERTURAS:`);
    console.log('===============================================');
    
    // Área de aberturas
    const openingsArea = wallOpenings.reduce((sum, opening) => 
      sum + (opening.width * opening.height), 0
    );
    
    // Área sólida de la pared
    const solidWallArea = wall.area - openingsArea;
    const openingsPercentage = (openingsArea / wall.area) * 100;
    
    console.log(`🧱 Información base de la pared:`);
    console.log(`   • Área total: ${wall.area.toFixed(2)}m²`);
    console.log(`   • Área sólida: ${solidWallArea.toFixed(2)}m²`);
    console.log(`   • Área de aberturas: ${openingsArea.toFixed(2)}m²`);
    console.log(`   • Porcentaje aberturas: ${openingsPercentage.toFixed(1)}%`);
    
    // Propiedades acústicas originales de la pared
    const wallTL = wall.template.acousticProperties.transmissionLoss;
    const wallAvgSTC = (wallTL.low + wallTL.mid + wallTL.high) / 3;
    
    console.log(`\n🔊 Análisis acústico de la pared:`);
    console.log(`   • STC original pared: ${wallAvgSTC.toFixed(1)}dB`);
    
    if (wallOpenings.length > 0) {
      console.log(`\n🚪 Análisis de aberturas (${wallOpenings.length}):`);
      
      wallOpenings.forEach((opening, idx) => {
        const openingSTC = opening.template.acousticProperties.soundTransmissionClass;
        const openingAvgSTC = (openingSTC.low + openingSTC.mid + openingSTC.high) / 3;
        const openingArea = opening.width * opening.height;
        
        console.log(`   ${opening.type === 'door' ? '🚪' : '🪟'} ${opening.type.toUpperCase()} ${idx + 1}:`);
        console.log(`      • Template: ${opening.template.name}`);
        console.log(`      • Dimensiones: ${opening.width}m × ${opening.height}m`);
        console.log(`      • Área: ${openingArea.toFixed(2)}m²`);
        console.log(`      • STC: ${openingAvgSTC.toFixed(1)}dB`);
        console.log(`      • Pérdida vs pared: ${(wallAvgSTC - openingAvgSTC).toFixed(1)}dB`);
      });

      // ✅ CÁLCULO DE STC EFECTIVO COMBINADO
      const weightedSTC = get().calculateCompositeWallSTC(wall, wallOpenings);
      
      console.log(`\n📊 RESULTADO ACÚSTICO COMBINADO:`);
      console.log(`   • STC efectivo combinado:`);
      console.log(`     - Graves: ${weightedSTC.low.toFixed(1)}dB`);
      console.log(`     - Medios: ${weightedSTC.mid.toFixed(1)}dB`);
      console.log(`     - Agudos: ${weightedSTC.high.toFixed(1)}dB`);
      console.log(`     - Promedio: ${weightedSTC.average.toFixed(1)}dB`);
      
      const reductionFromOriginal = wallAvgSTC - weightedSTC.average;
      console.log(`   • Reducción por aberturas: ${reductionFromOriginal.toFixed(1)}dB`);
      
      // Rating actualizado
      const newRating = get().calculateRatingFromSTC(weightedSTC.average);
      console.log(`   • Rating acústico: ${wall.acousticRating} → ${newRating}`);
      
      // ✅ RECOMENDACIONES
      console.log(`\n💡 RECOMENDACIONES:`);
      if (openingsPercentage > 25) {
        console.log(`   ⚠️  Porcentaje alto de aberturas (${openingsPercentage.toFixed(1)}%)`);
        console.log(`   💡 Considerar aberturas con mejor aislamiento acústico`);
      }
      
      if (reductionFromOriginal > 15) {
        console.log(`   ⚠️  Gran pérdida acústica por aberturas (${reductionFromOriginal.toFixed(1)}dB)`);
        console.log(`   💡 Las aberturas son el punto débil del aislamiento`);
      }
      
      const worstOpening = wallOpenings.reduce((worst, opening) => {
        const currentSTC = (opening.template.acousticProperties.soundTransmissionClass.low + 
                           opening.template.acousticProperties.soundTransmissionClass.mid + 
                           opening.template.acousticProperties.soundTransmissionClass.high) / 3;
        const worstSTC = (worst.template.acousticProperties.soundTransmissionClass.low + 
                         worst.template.acousticProperties.soundTransmissionClass.mid + 
                         worst.template.acousticProperties.soundTransmissionClass.high) / 3;
        return currentSTC < worstSTC ? opening : worst;
      });
      
      const worstSTC = (worstOpening.template.acousticProperties.soundTransmissionClass.low + 
                       worstOpening.template.acousticProperties.soundTransmissionClass.mid + 
                       worstOpening.template.acousticProperties.soundTransmissionClass.high) / 3;
      
      console.log(`   🎯 Elemento más débil: ${worstOpening.type} (${worstSTC.toFixed(1)}dB)`);
      
    } else {
      console.log(`\n✅ Pared sin aberturas - Mantiene propiedades originales`);
    }
    
    console.log(`===============================================\n`);
  },

  // ✅ RECALCULAR TODAS LAS PAREDES CON ABERTURAS
  recalculateAllWallsWithOpenings: (openings) => {
    const { walls } = get();
    
    console.log('\n🏢 RECÁLCULO COMPLETO DEL EDIFICIO CON ABERTURAS');
    console.log('================================================');
    
    walls.forEach(wall => {
      get().analyzeWallWithOpenings(wall.wallIndex, openings);
    });
    
    // ✅ RESUMEN GENERAL DEL EDIFICIO
    console.log('📊 RESUMEN GENERAL DEL EDIFICIO:');
    console.log('================================');
    
    const totalWallArea = walls.reduce((sum, wall) => sum + wall.area, 0);
    const totalOpeningsArea = openings.reduce((sum, opening) => 
      sum + (opening.width * opening.height), 0
    );
    const buildingOpeningsPercentage = (totalOpeningsArea / totalWallArea) * 100;
    
    console.log(`🏗️  Estadísticas generales:`);
    console.log(`   • Total paredes: ${walls.length}`);
    console.log(`   • Área total paredes: ${totalWallArea.toFixed(2)}m²`);
    console.log(`   • Total aberturas: ${openings.length}`);
    console.log(`   • Área total aberturas: ${totalOpeningsArea.toFixed(2)}m²`);
    console.log(`   • Porcentaje aberturas edificio: ${buildingOpeningsPercentage.toFixed(1)}%`);
    
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

    console.log(`\n🎯 CALIFICACIÓN ACÚSTICA FINAL:`);
    console.log(`   • STC promedio edificio: ${avgBuildingSTC.toFixed(1)}dB`);
    console.log(`   • Rating acústico edificio: ${buildingRating}`);
    
    // Distribución por tipos de abertura
    const openingsByType = openings.reduce((acc, opening) => {
      acc[opening.type] = (acc[opening.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    console.log(`\n📈 Distribución de aberturas:`);
    Object.entries(openingsByType).forEach(([type, count]) => {
      console.log(`   • ${type}s: ${count}`);
    });
    
    console.log('\n✅ ANÁLISIS COMPLETO FINALIZADO\n');
  },

  // ✅ FUNCIÓN AUXILIAR PARA CALCULAR STC COMPUESTO
  calculateCompositeWallSTC: (wall: Wall, openings: Opening[]) => {
    if (openings.length === 0) {
      const wallTL = wall.template.acousticProperties.transmissionLoss;
      return {
        low: wallTL.low,
        mid: wallTL.mid,
        high: wallTL.high,
        average: (wallTL.low + wallTL.mid + wallTL.high) / 3
      };
    }

    const totalArea = wall.area;
    const openingsArea = openings.reduce((sum, o) => sum + (o.width * o.height), 0);
    const solidWallArea = totalArea - openingsArea;

    // Weighted average basado en áreas (método estándar para paredes compuestas)
    const wallTL = wall.template.acousticProperties.transmissionLoss;
    
    const compositeLow = openings.reduce((sum, opening) => {
      const openingArea = opening.width * opening.height;
      const openingSTC = opening.template.acousticProperties.soundTransmissionClass.low;
      return sum + (Math.pow(10, -openingSTC/10) * openingArea);
    }, Math.pow(10, -wallTL.low/10) * solidWallArea) / totalArea;

    const compositeMid = openings.reduce((sum, opening) => {
      const openingArea = opening.width * opening.height;
      const openingSTC = opening.template.acousticProperties.soundTransmissionClass.mid;
      return sum + (Math.pow(10, -openingSTC/10) * openingArea);
    }, Math.pow(10, -wallTL.mid/10) * solidWallArea) / totalArea;

    const compositeHigh = openings.reduce((sum, opening) => {
      const openingArea = opening.width * opening.height;
      const openingSTC = opening.template.acousticProperties.soundTransmissionClass.high;
      return sum + (Math.pow(10, -openingSTC/10) * openingArea);
    }, Math.pow(10, -wallTL.high/10) * solidWallArea) / totalArea;

    const resultLow = -10 * Math.log10(compositeLow);
    const resultMid = -10 * Math.log10(compositeMid);
    const resultHigh = -10 * Math.log10(compositeHigh);

    return {
      low: resultLow,
      mid: resultMid,
      high: resultHigh,
      average: (resultLow + resultMid + resultHigh) / 3
    };
  },

  // ✅ FUNCIÓN AUXILIAR PARA CALCULAR RATING DESDE STC
  calculateRatingFromSTC: (stc: number): 'A' | 'B' | 'C' | 'D' | 'E' => {
    if (stc >= 55) return 'A';
    if (stc >= 48) return 'B';
    if (stc >= 40) return 'C';
    if (stc >= 30) return 'D';
    return 'E';
  },
  
  // ✅ FUNCIÓN ORIGINAL PARA GENERAR PAREDES DESDE COORDENADAS
  generateWallsFromCoordinates: (coordinates) => {
    console.log('🏗️ GENERANDO PAREDES DESDE EXTRUSIÓN...\n');
    
    set({ walls: [] });
    
    coordinates.forEach((coord, index) => {
      const nextCoord = coordinates[(index + 1) % coordinates.length];
      
      const wallLength = Math.sqrt(
        (nextCoord.x - coord.x) ** 2 + (nextCoord.z - coord.z) ** 2
      );
      
      const wallHeight = 3.0;
      const area = wallLength * wallHeight;
      const template = WALL_TEMPLATES['drywall-standard'];
      
      const newWall: Wall = {
        id: `wall-${Date.now()}-${index}`,
        wallIndex: index,
        template,
        area,
        currentCondition: 'excellent'
      };
      
      newWall.acousticRating = calculateWallAcousticRating(newWall);
      
      console.log(`🧱 PARED ${index + 1} CREADA:`);
      console.log(`   📏 Longitud: ${wallLength.toFixed(2)}m`);
      console.log(`   📐 Área: ${area.toFixed(2)}m²`);
      console.log(`   🏗️  Material: ${template.name}`);
      console.log(`   📊 Espesor: ${(template.thickness * 100).toFixed(1)}cm`);
      
      const tl = template.acousticProperties.transmissionLoss;
      console.log(`   🔊 PROPIEDADES ACÚSTICAS:`);
      console.log(`      • Pérdida Transmisión Graves: ${tl.low}dB`);
      console.log(`      • Pérdida Transmisión Medios: ${tl.mid}dB`);
      console.log(`      • Pérdida Transmisión Agudos: ${tl.high}dB`);
      console.log(`      • STC Promedio: ${((tl.low + tl.mid + tl.high) / 3).toFixed(1)}dB`);
      console.log(`      • Densidad: ${template.acousticProperties.density} kg/m³`);
      console.log(`      • Rating Acústico: ${newWall.acousticRating}`);
      
      console.log(`   🌡️  PROPIEDADES TÉRMICAS:`);
      console.log(`      • Conductividad: ${template.thermalProperties.conductivity} W/m·K`);
      console.log(`      • Resistencia: ${template.thermalProperties.resistance} m²·K/W`);
      
      const materialCost = template.cost.material * area;
      const installationCost = template.cost.installation * area;
      console.log(`   💰 COSTOS:`);
      console.log(`      • Material: €${materialCost.toFixed(2)}`);
      console.log(`      • Instalación: €${installationCost.toFixed(2)}`);
      console.log(`      • Total: €${(materialCost + installationCost).toFixed(2)}`);
      
      console.log('');
      
      set((state) => ({
        walls: [...state.walls, newWall]
      }));
    });
    
    const { walls } = get();
    const totalArea = walls.reduce((sum, w) => sum + w.area, 0);
    const totalCost = walls.reduce((sum, w) => 
      sum + (w.template.cost.material + w.template.cost.installation) * w.area, 0
    );
    const avgSTC = walls.reduce((sum, w) => {
      const tl = w.template.acousticProperties.transmissionLoss;
      return sum + (tl.low + tl.mid + tl.high) / 3;
    }, 0) / walls.length;
    
    console.log('📊 RESUMEN FINAL DE LA EXTRUSIÓN:');
    console.log('==================================');
    console.log(`🏢 Total de paredes generadas: ${walls.length}`);
    console.log(`📐 Área total de paredes: ${totalArea.toFixed(2)}m²`);
    console.log(`💰 Costo total estimado: €${totalCost.toFixed(2)}`);
    console.log(`🔊 STC promedio del edificio: ${avgSTC.toFixed(1)}dB`);
    console.log(`⭐ Edificio con rating acústico general: ${avgSTC >= 50 ? 'A' : avgSTC >= 45 ? 'B' : avgSTC >= 40 ? 'C' : 'D'}`);
    console.log('\n✅ EXTRUSIÓN Y ANÁLISIS COMPLETADOS!\n');
  }
}));