import React, { useState } from 'react';
import { useWallsStore } from '@/store/wallsStore';
import { useOpeningsStore } from '@/store/openingsStore';
import { useDrawingStore } from '@/store/drawingStore';
import { WALL_TEMPLATES, WallCondition } from '@/types/walls';
import { AcousticAnalysisEngine } from '@/engine/AcousticAnalysisEngine';

interface WallsManagerProps {
  isVisible: boolean;
  onToggle: () => void;
}

export const WallsManager: React.FC<WallsManagerProps> = ({ isVisible, onToggle }) => {
  const { walls, updateWall, deleteWall, recalculateAllWallsWithOpenings } = useWallsStore();
  const { openings } = useOpeningsStore();
  const { planeXZCoordinates } = useDrawingStore();
  const [selectedWallId, setSelectedWallId] = useState<string | null>(null);
  
  // ✅ FUNCIÓN PARA ANÁLISIS ACÚSTICO DETALLADO
  const showDetailedAcousticAnalysis = () => {
    console.clear();
    console.log('🔊 ANÁLISIS ACÚSTICO DETALLADO DE PAREDES');
    console.log('=========================================\n');
    
    if (walls.length === 0) {
      console.log('⚠️ No hay paredes para analizar');
      return;
    }
    
    walls.forEach((wall, index) => {
      console.log(`🧱 PARED ${index + 1} - ${wall.template.name}:`);
      console.log(`   🆔 ID: ${wall.id}`);
      console.log(`   📐 Área: ${wall.area.toFixed(2)}m²`);
      console.log(`   📊 Espesor: ${(wall.template.thickness * 100).toFixed(1)}cm`);
      console.log(`   🏗️  Estado: ${wall.currentCondition}`);
      console.log(`   ⭐ Rating Acústico: ${wall.acousticRating || 'No calculado'}`);
      
      // Análisis acústico detallado
      const tl = wall.template.acousticProperties.transmissionLoss;
      const abs = wall.template.acousticProperties.absorptionCoefficient;
      
      console.log(`   🔊 PROPIEDADES ACÚSTICAS:`);
      console.log(`      📈 Pérdida de Transmisión:`);
      console.log(`         • Frecuencias Bajas (125-250Hz): ${tl.low}dB`);
      console.log(`         • Frecuencias Medias (500-1000Hz): ${tl.mid}dB`);
      console.log(`         • Frecuencias Altas (2000-4000Hz): ${tl.high}dB`);
      console.log(`         • Promedio Ponderado: ${((tl.low + tl.mid + tl.high) / 3).toFixed(1)}dB`);
      
      console.log(`      📉 Absorción Acústica:`);
      console.log(`         • Bajas: α = ${abs.low} (${(abs.low * 100).toFixed(1)}%)`);
      console.log(`         • Medias: α = ${abs.mid} (${(abs.mid * 100).toFixed(1)}%)`);
      console.log(`         • Altas: α = ${abs.high} (${(abs.high * 100).toFixed(1)}%)`);
      
      console.log(`      🏗️  Propiedades del Material:`);
      console.log(`         • Densidad: ${wall.template.acousticProperties.density} kg/m³`);
      console.log(`         • Porosidad: ${(wall.template.acousticProperties.porosity * 100).toFixed(1)}%`);
      
      // Análisis térmico
      console.log(`   🌡️  ANÁLISIS TÉRMICO:`);
      console.log(`      • Conductividad Térmica: ${wall.template.thermalProperties.conductivity} W/m·K`);
      console.log(`      • Resistencia Térmica: ${wall.template.thermalProperties.resistance} m²·K/W`);
      
      // Análisis económico
      const materialCost = wall.template.cost.material * wall.area;
      const installationCost = wall.template.cost.installation * wall.area;
      const totalCost = materialCost + installationCost;
      
      console.log(`   💰 ANÁLISIS ECONÓMICO:`);
      console.log(`      • Costo Material: €${materialCost.toFixed(2)}`);
      console.log(`      • Costo Instalación: €${installationCost.toFixed(2)}`);
      console.log(`      • Costo Total: €${totalCost.toFixed(2)}`);
      console.log(`      • Costo por m²: €${(totalCost / wall.area).toFixed(2)}/m²`);
      
      // Evaluación del estado
      console.log(`   🔧 EVALUACIÓN DEL ESTADO:`);
      const conditionFactors = {
        'excellent': { factor: 1.0, desc: 'Rendimiento óptimo' },
        'good': { factor: 0.95, desc: 'Rendimiento muy bueno' },
        'fair': { factor: 0.85, desc: 'Rendimiento aceptable' },
        'poor': { factor: 0.7, desc: 'Rendimiento reducido' },
        'damaged': { factor: 0.5, desc: 'Requiere reparación urgente' }
      };
      
      const condition = conditionFactors[wall.currentCondition];
      const effectiveTL = ((tl.low + tl.mid + tl.high) / 3) * condition.factor;
      
      console.log(`      • Factor de estado: ${condition.factor} (${condition.desc})`);
      console.log(`      • Pérdida efectiva: ${effectiveTL.toFixed(1)}dB`);
      
      if (condition.factor < 0.8) {
        console.log(`      ⚠️  RECOMENDACIÓN: Considerar mantenimiento o reemplazo`);
      }
      
      console.log(''); // Separador
    });
    
    // Análisis comparativo
    if (walls.length > 1) {
      console.log('📊 ANÁLISIS COMPARATIVO DEL EDIFICIO:');
      console.log('=====================================');
      
      const totalArea = walls.reduce((sum, w) => sum + w.area, 0);
      const totalCost = walls.reduce((sum, w) => 
        sum + (w.template.cost.material + w.template.cost.installation) * w.area, 0
      );
      
      const avgTL = walls.reduce((sum, wall) => {
        const tl = wall.template.acousticProperties.transmissionLoss;
        return sum + (tl.low + tl.mid + tl.high) / 3;
      }, 0) / walls.length;
      
      const avgDensity = walls.reduce((sum, wall) => 
        sum + wall.template.acousticProperties.density, 0
      ) / walls.length;
      
      const avgCostPerM2 = walls.reduce((sum, wall) => 
        sum + (wall.template.cost.material + wall.template.cost.installation), 0
      ) / walls.length;
      
      console.log(`📈 Estadísticas generales:`);
      console.log(`   • Área total: ${totalArea.toFixed(2)}m²`);
      console.log(`   • Costo total: €${totalCost.toFixed(2)}`);
      console.log(`   • Pérdida de transmisión promedio: ${avgTL.toFixed(1)}dB`);
      console.log(`   • Densidad promedio: ${avgDensity.toFixed(0)} kg/m³`);
      console.log(`   • Costo promedio: €${avgCostPerM2.toFixed(2)}/m²`);
      
      // Distribución por ratings
      const ratingDistribution = walls.reduce((acc, wall) => {
        const rating = wall.acousticRating || 'E';
        acc[rating] = (acc[rating] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      console.log(`\n🏆 Distribución de ratings acústicos:`);
      Object.entries(ratingDistribution).forEach(([rating, count]) => {
        const percentage = (count / walls.length * 100).toFixed(1);
        console.log(`   • Rating ${rating}: ${count} pared(es) (${percentage}%)`);
      });
      
      // Identificar extremos
      const bestAcoustic = walls.reduce((best, wall) => {
        const currentTL = (wall.template.acousticProperties.transmissionLoss.low + 
                          wall.template.acousticProperties.transmissionLoss.mid + 
                          wall.template.acousticProperties.transmissionLoss.high) / 3;
        const bestTL = (best.template.acousticProperties.transmissionLoss.low + 
                       best.template.acousticProperties.transmissionLoss.mid + 
                       best.template.acousticProperties.transmissionLoss.high) / 3;
        return currentTL > bestTL ? wall : best;
      });
      
      const worstAcoustic = walls.reduce((worst, wall) => {
        const currentTL = (wall.template.acousticProperties.transmissionLoss.low + 
                          wall.template.acousticProperties.transmissionLoss.mid + 
                          wall.template.acousticProperties.transmissionLoss.high) / 3;
        const worstTL = (worst.template.acousticProperties.transmissionLoss.low + 
                        worst.template.acousticProperties.transmissionLoss.mid + 
                        worst.template.acousticProperties.transmissionLoss.high) / 3;
        return currentTL < worstTL ? wall : worst;
      });
      
      console.log(`\n🏆 Mejor aislamiento acústico: ${bestAcoustic.template.name}`);
      console.log(`⚠️  Peor aislamiento acústico: ${worstAcoustic.template.name}`);
      
      // Recomendaciones
      console.log(`\n💡 RECOMENDACIONES:`);
      if (avgTL < 40) {
        console.log(`   ⚠️  El aislamiento promedio es bajo (${avgTL.toFixed(1)}dB)`);
        console.log(`   💡 Considerar mejorar las paredes con peor rendimiento`);
      }
      
      const poorWalls = walls.filter(w => 
        w.currentCondition === 'poor' || w.currentCondition === 'damaged'
      ).length;
      
      if (poorWalls > 0) {
        console.log(`   🔧 ${poorWalls} pared(es) necesitan mantenimiento`);
        console.log(`   💡 Priorizar reparaciones para mantener el rendimiento acústico`);
      }
      
      if (totalCost / totalArea > 50) {
        console.log(`   💰 Costo elevado por m² (€${(totalCost / totalArea).toFixed(2)}/m²)`);
        console.log(`   💡 Evaluar alternativas más económicas para futuras expansiones`);
      }
    }
    
    console.log('\n✅ ANÁLISIS ACÚSTICO COMPLETADO');
    console.log('================================\n');
  };

  // ✅ FUNCIÓN PARA GENERAR INFORME COMPLETO
  const generateAcousticReport = () => {
    const report = {
      timestamp: new Date().toISOString(),
      totalWalls: walls.length,
      totalArea: walls.reduce((sum, w) => sum + w.area, 0),
      totalCost: walls.reduce((sum, w) => 
        sum + (w.template.cost.material + w.template.cost.installation) * w.area, 0
      ),
      walls: walls.map((wall, index) => ({
        index: index + 1,
        id: wall.id,
        template: wall.template.name,
        area: wall.area,
        condition: wall.currentCondition,
        acousticRating: wall.acousticRating,
        transmissionLoss: wall.template.acousticProperties.transmissionLoss,
        absorption: wall.template.acousticProperties.absorptionCoefficient,
        density: wall.template.acousticProperties.density,
        cost: (wall.template.cost.material + wall.template.cost.installation) * wall.area
      }))
    };
    
    console.log('📋 INFORME ACÚSTICO GENERADO:');
    console.log(JSON.stringify(report, null, 2));
    
    // También lo guardamos en localStorage para futuras referencias
    localStorage.setItem('acoustic-report', JSON.stringify(report));
    console.log('💾 Informe guardado en localStorage como "acoustic-report"');
  };

  // ✅ AGREGAR función para generar mapa de calor
  const generateAcousticHeatmap = () => {
    console.clear();
    console.log('🔥 GENERANDO MAPA DE CALOR ACÚSTICO DESDE WALLSMANAGER');
    console.log('======================================================\n');
    
    if (walls.length === 0) {
      console.log('⚠️ No hay paredes para analizar');
      alert('⚠️ Primero necesitas extruir una forma 3D para generar paredes');
      return;
    }
    
    const heatmapData = AcousticAnalysisEngine.generateDetailedAcousticHeatmap(
      walls,
      openings,
      planeXZCoordinates,
      70
    );
    
    // Si necesitas mostrar una leyenda, deberías definirla aquí manualmente o eliminar esta sección.
    // Por ahora, solo guardamos y notificamos.
    localStorage.setItem('acoustic-heatmap-data', JSON.stringify(heatmapData));
    console.log('💾 Datos del mapa de calor guardados en localStorage');
    
    alert(`🔥 Mapa de calor generado!\n\n📊 Estadísticas:\n• Total puntos: ${heatmapData.stats.totalPoints}\n• Puntos críticos: ${heatmapData.stats.criticalPoints}\n• Puntos buenos: ${heatmapData.stats.goodPoints}\n\n👀 Revisa la consola para análisis detallado`);
  };

  if (!isVisible) {
    return (
      <button 
        onClick={onToggle}
        className="fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-green-700 transition-colors z-50"
      >
        🧱 Gestionar Paredes
      </button>
    );
  }

  const selectedWall = selectedWallId ? walls.find(w => w.id === selectedWallId) : null;

  // ✅ FUNCIÓN HELPER PARA COLORES DE CONDICIÓN
  const getConditionColor = (condition: WallCondition): string => {
    const colors = {
      'excellent': 'bg-green-100 text-green-800',
      'good': 'bg-blue-100 text-blue-800',
      'fair': 'bg-yellow-100 text-yellow-800',
      'poor': 'bg-orange-100 text-orange-800',
      'damaged': 'bg-red-100 text-red-800'
    };
    return colors[condition] || 'bg-gray-100 text-gray-800';
  };

  const getConditionLabel = (condition: WallCondition): string => {
    const labels = {
      'excellent': 'Excelente',
      'good': 'Bueno',
      'fair': 'Regular',
      'poor': 'Malo',
      'damaged': 'Dañado'
    };
    return labels[condition] || condition;
  };

  return (
    <>
      {/* Botón para cerrar */}
      <button 
        onClick={onToggle}
        className="fixed top-4 right-4 bg-gray-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-gray-700 transition-colors z-50"
      >
        ❌ Cerrar Manager
      </button>

      {/* Panel principal */}
      <div className="fixed top-16 right-4 bg-white rounded-lg shadow-xl p-4 space-y-4 z-40 w-80 max-h-[80vh] overflow-y-auto">
        {/* ✅ HEADER CON BOTONES DE ANÁLISIS */}
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-lg text-gray-800">
            🧱 Gestión de Paredes
          </h3>
          <div className="flex space-x-1">
            <button
              onClick={showDetailedAcousticAnalysis}
              className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition-colors"
              title="Análisis acústico detallado"
            >
              🔊
            </button>
            <button
              onClick={generateAcousticReport}
              className="px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600 transition-colors"
              title="Generar informe"
            >
              📋
            </button>
          </div>
        </div>
        
        {/* Lista de paredes */}
        <div className="space-y-2">
          <h4 className="font-medium text-gray-700">Paredes actuales:</h4>
          {walls.length === 0 ? (
            <p className="text-gray-500 text-sm">No hay paredes creadas</p>
          ) : (
            walls.map((wall, index) => (
              <div
                key={wall.id}
                className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedWallId === wall.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedWallId(wall.id)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium">Pared {index + 1}</div>
                    <div className="text-sm text-gray-600">
                      {wall.template.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {wall.area.toFixed(1)}m² • €{(wall.template.cost.material * wall.area).toFixed(0)}
                    </div>
                    {/* ✅ MOSTRAR STC PROMEDIO */}
                    <div className="text-xs text-blue-600">
                      STC: {((wall.template.acousticProperties.transmissionLoss.low + 
                               wall.template.acousticProperties.transmissionLoss.mid + 
                               wall.template.acousticProperties.transmissionLoss.high) / 3).toFixed(1)}dB
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-1">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getConditionColor(wall.currentCondition)}`}>
                      {getConditionLabel(wall.currentCondition)}
                    </span>
                    {/* ✅ MOSTRAR RATING ACÚSTICO */}
                    {wall.acousticRating && (
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        wall.acousticRating === 'A' ? 'bg-green-100 text-green-800' :
                        wall.acousticRating === 'B' ? 'bg-blue-100 text-blue-800' :
                        wall.acousticRating === 'C' ? 'bg-yellow-100 text-yellow-800' :
                        wall.acousticRating === 'D' ? 'bg-orange-100 text-orange-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {wall.acousticRating}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Panel de detalles de pared seleccionada */}
        {selectedWall && (
          <div className="border-t pt-4 space-y-4">
            <h4 className="font-medium text-gray-700">
              Editar Pared Seleccionada:
            </h4>
            
            {/* Selector de template */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Pared:
              </label>
              <select
                value={selectedWall.template.id}
                onChange={(e) => {
                  const newTemplate = WALL_TEMPLATES[e.target.value];
                  if (newTemplate) {
                    updateWall(selectedWall.id, { template: newTemplate });
                  }
                }}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {Object.values(WALL_TEMPLATES).map(template => (
                  <option key={template.id} value={template.id}>
                    {template.name} (€{template.cost.material}/m²)
                  </option>
                ))}
              </select>
            </div>

            {/* Selector de condición */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado Actual:
              </label>
              <select
                value={selectedWall.currentCondition}
                onChange={(e) => {
                  updateWall(selectedWall.id, { 
                    currentCondition: e.target.value as WallCondition
                  });
                }}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="excellent">Excelente</option>
                <option value="good">Bueno</option>
                <option value="fair">Regular</option>
                <option value="poor">Malo</option>
                <option value="damaged">Dañado</option>
              </select>
            </div>

            {/* ✅ INFORMACIÓN ACÚSTICA MEJORADA */}
            <div className="bg-blue-50 p-3 rounded-lg">
              <h5 className="font-medium text-gray-700 mb-2">🔊 Propiedades Acústicas:</h5>
              <div className="space-y-1 text-sm">
                <div>Pérdida de Transmisión:</div>
                <div className="ml-2 text-gray-600">
                  • Graves: {selectedWall.template.acousticProperties.transmissionLoss.low}dB
                </div>
                <div className="ml-2 text-gray-600">
                  • Medios: {selectedWall.template.acousticProperties.transmissionLoss.mid}dB
                </div>
                <div className="ml-2 text-gray-600">
                  • Agudos: {selectedWall.template.acousticProperties.transmissionLoss.high}dB
                </div>
                <div className="border-t pt-1 mt-1">
                  <div className="flex justify-between">
                    <span>Promedio:</span>
                    <span className="font-medium">
                      {((selectedWall.template.acousticProperties.transmissionLoss.low + 
                         selectedWall.template.acousticProperties.transmissionLoss.mid + 
                         selectedWall.template.acousticProperties.transmissionLoss.high) / 3).toFixed(1)}dB
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Densidad:</span>
                    <span>{selectedWall.template.acousticProperties.density} kg/m³</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Rating:</span>
                    <span className="font-medium">{selectedWall.acousticRating || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Información de costos */}
            <div className="bg-green-50 p-3 rounded-lg">
              <h5 className="font-medium text-gray-700 mb-2">💰 Análisis de Costos:</h5>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Material:</span>
                  <span>€{(selectedWall.template.cost.material * selectedWall.area).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Instalación:</span>
                  <span>€{(selectedWall.template.cost.installation * selectedWall.area).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-medium border-t pt-1">
                  <span>Total:</span>
                  <span>€{((selectedWall.template.cost.material + selectedWall.template.cost.installation) * selectedWall.area).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex space-x-2">
              <button
                onClick={() => setSelectedWallId(null)}
                className="flex-1 px-3 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (confirm('¿Estás seguro de que quieres eliminar esta pared?')) {
                    deleteWall(selectedWall.id);
                    setSelectedWallId(null);
                  }
                }}
                className="flex-1 px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        )}

        {/* ✅ RESUMEN GENERAL MEJORADO */}
        <div className="border-t pt-4">
          <h4 className="font-medium text-gray-700 mb-2">📊 Resumen General:</h4>
          <div className="bg-green-50 p-3 rounded-lg text-sm space-y-2">
            <div className="flex justify-between">
              <span>Total de paredes:</span>
              <span>{walls.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Área total:</span>
              <span>{walls.reduce((sum, w) => sum + w.area, 0).toFixed(1)}m²</span>
            </div>
            <div className="flex justify-between font-medium">
              <span>Costo estimado:</span>
              <span>
                €{walls.reduce((sum, w) => 
                  sum + (w.template.cost.material + w.template.cost.installation) * w.area, 0
                ).toFixed(0)}
              </span>
            </div>
            
            {/* ✅ INFORMACIÓN ACÚSTICA EN EL RESUMEN */}
            {walls.length > 0 && (
              <div className="border-t pt-2 space-y-1">
                <div className="flex justify-between text-xs">
                  <span>STC Promedio:</span>
                  <span>
                    {(walls.reduce((sum, w) => {
                      const tl = w.template.acousticProperties.transmissionLoss;
                      return sum + (tl.low + tl.mid + tl.high) / 3;
                    }, 0) / walls.length).toFixed(1)}dB
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>Densidad Promedio:</span>
                  <span>
                    {(walls.reduce((sum, w) => sum + w.template.acousticProperties.density, 0) / walls.length).toFixed(0)} kg/m³
                  </span>
                </div>
              </div>
            )}
          </div>
          
          {/* ✅ BOTONES DE ANÁLISIS */}
          <div className="flex space-x-2 mt-2">
            <button
              onClick={showDetailedAcousticAnalysis}
              className="flex-1 px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm"
            >
              🔊 Análisis Acústico
            </button>
            <button
              onClick={generateAcousticReport}
              className="flex-1 px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors text-sm"
            >
              📋 Generar Informe
            </button>
          </div>
        </div>

        <div className="border-t pt-4">
          <h3 className="text-lg font-semibold mb-2">🔥 Análisis Acústico</h3>
          
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => recalculateAllWallsWithOpenings(openings)}
              className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm"
            >
              🔊 Recalcular
            </button>
            
            <button
              onClick={generateAcousticHeatmap}
              className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors text-sm"
            >
              🔥 Mapa Calor
            </button>
          </div>
          
          <div className="mt-2 text-xs text-gray-600">
            💡 El mapa de calor se activará automáticamente en la escena 3D
          </div>
        </div>
      </div>
    </>
  );
};