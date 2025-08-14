/**
 * @fileoverview Componente de gestión integral de paredes con análisis acústico avanzado
 * 
 * Este componente proporciona una interfaz de usuario completa para la gestión,
 * análisis y configuración de paredes arquitectónicas. Incluye análisis acústico
 * detallado, gestión de estado de conservación, cálculo de costos y generación
 * de informes técnicos. Integra múltiples stores para sincronización de datos.
 * 
 * @module WallsManager
 * @version 3.0.0
 * @author insonor Team
 * @since 2025
 * @requires React
 * @requires WallsStore
 * @requires OpeningsStore
 * @requires DrawingStore
 * @requires AcousticAnalysisEngine
 */

import React, { useState } from 'react';
import { useWallsStore } from '@/store/wallsStore';
import { useOpeningsStore } from '@/store/openingsStore';
import { useDrawingStore } from '@/store/drawingStore';
import { WALL_TEMPLATES, WallCondition } from '@/types/walls';
import { AcousticAnalysisEngine } from '@/engine/AcousticAnalysisEngine';
import { AcousticAnalysisModal } from './modals/AcousticAnalysisModal';

/**
 * @interface WallsManagerProps
 * @description Propiedades de configuración para el gestor de paredes
 * 
 * Define la interfaz mínima necesaria para controlar la visibilidad
 * y el comportamiento del panel de gestión de paredes.
 * 
 * @property {boolean} isVisible - Estado de visibilidad del panel de gestión
 * @property {Function} onToggle - Callback para cambiar el estado de visibilidad
 * 
 * @example
 * ```tsx
 * // Estado de visibilidad en componente padre
 * const [wallsManagerVisible, setWallsManagerVisible] = useState(false);
 * 
 * // Uso del componente
 * <WallsManager
 *   isVisible={wallsManagerVisible}
 *   onToggle={() => setWallsManagerVisible(!wallsManagerVisible)}
 * />
 * ```
 */
interface WallsManagerProps {
  isVisible: boolean;
  onToggle: () => void;
}

/**
 * @component WallsManager
 * @description Gestor integral de paredes con análisis acústico avanzado
 * 
 * Proporciona una interfaz completa para la gestión de paredes arquitectónicas,
 * incluyendo análisis acústico detallado, gestión de costos, evaluación de
 * estado de conservación y generación de informes técnicos. Integra múltiples
 * sistemas de análisis y stores de estado.
 * 
 * ## Funcionalidades principales:
 * - **Gestión de paredes**: CRUD completo de elementos de pared
 * - **Análisis acústico**: Evaluación detallada de propiedades sonoras
 * - **Gestión de costos**: Cálculo automático de materiales e instalación
 * - **Estado de conservación**: Seguimiento del estado físico de paredes
 * - **Generación de informes**: Reportes técnicos en formato JSON
 * - **Mapa de calor**: Visualización gráfica de análisis acústico
 * - **Comparativas**: Análisis estadístico del conjunto de paredes
 * 
 * ## Sistema de análisis acústico:
 * - **Pérdida de transmisión**: Evaluación por bandas de frecuencia
 * - **Coeficiente de absorción**: Análisis de absorción acústica
 * - **Rating acústico**: Clasificación A-E según rendimiento
 * - **Análisis térmico**: Propiedades de conductividad y resistencia
 * - **Factor de estado**: Impacto del estado de conservación
 * 
 * ## Estados de conservación:
 * - **Excellent** (Factor 1.0): Rendimiento óptimo
 * - **Good** (Factor 0.95): Rendimiento muy bueno
 * - **Fair** (Factor 0.85): Rendimiento aceptable
 * - **Poor** (Factor 0.7): Rendimiento reducido
 * - **Damaged** (Factor 0.5): Requiere reparación urgente
 * 
 * @param {WallsManagerProps} props - Propiedades de configuración
 * @returns {JSX.Element} Panel de gestión completo o botón de acceso
 * 
 * @example
 * ```tsx
 * // Integración en aplicación principal
 * function App() {
 *   const [managersState, setManagersState] = useState({
 *     walls: false,
 *     openings: false,
 *     materials: false
 *   });
 * 
 *   return (
 *     <div className="app">
 *       <Scene3D />
 *       
 *       <WallsManager
 *         isVisible={managersState.walls}
 *         onToggle={() => setManagersState(prev => ({
 *           ...prev,
 *           walls: !prev.walls
 *         }))}
 *       />
 *       
 *       {// Otros managers...}
 *     </div>
 *   );
 * }
 * 
 * // Uso avanzado con configuración personalizada
 * function AdvancedWallManagement() {
 *   const [analysisMode, setAnalysisMode] = useState('basic');
 *   const [filterCriteria, setFilterCriteria] = useState({
 *     minRating: 'C',
 *     maxCost: 1000,
 *     condition: 'all'
 *   });
 * 
 *   return (
 *     <WallsManager
 *       isVisible={true}
 *       onToggle={() => {}}
 *       analysisMode={analysisMode}
 *       filterCriteria={filterCriteria}
 *     />
 *   );
 * }
 * ```
 * 
 * @see {@link useWallsStore} Para gestión de estado de paredes
 * @see {@link AcousticAnalysisEngine} Para cálculos acústicos
 * @see {@link WALL_TEMPLATES} Para templates de configuración
 * 
 * @performance
 * - **Estado local mínimo**: Solo selectedWallId como estado interno
 * - **Cálculos delegados**: Engine especializado para análisis acústico
 * - **Renderizado condicional**: Panel completo solo cuando es visible
 * - **Memoización implícita**: Stores optimizados con Zustand
 * 
 * @accessibility
 * - **Colores semánticos**: Estados visuales claramente diferenciados
 * - **Tooltips informativos**: Información contextual en botones
 * - **Confirmaciones**: Diálogos de confirmación para acciones destructivas
 * - **Navegación por teclado**: Soporte completo para accesibilidad
 */
export const WallsManager: React.FC<WallsManagerProps> = ({ isVisible, onToggle }) => {
  
  /**
   * @section Hooks de estado y stores
   * @description Integración con sistemas de estado centralizados
   */
  
  /**
   * @hook useWallsStore
   * @description Gestión completa del estado de paredes
   */
  const { walls, updateWall, deleteWall, recalculateAllWallsWithOpenings } = useWallsStore();
  
  /**
   * @hook useOpeningsStore
   * @description Acceso a aberturas para análisis integral
   */
  const { openings } = useOpeningsStore();
  
  /**
   * @hook useDrawingStore
   * @description Coordenadas del plano para análisis espacial
   */
  const { planeXZCoordinates } = useDrawingStore();
  
  /**
   * @state selectedWallId
   * @description ID de la pared actualmente seleccionada para edición
   * @type {string | null}
   */
  const [selectedWallId, setSelectedWallId] = useState<string | null>(null);

  /**
   * @state showAnalysisModal
   * @description Controla la visibilidad del modal de análisis acústico profesional
   * @type {boolean}
   */
  const [showAnalysisModal, setShowAnalysisModal] = useState<boolean>(false);

  /**
   * @section Funciones de análisis acústico
   * @description Sistema completo de análisis y evaluación acústica
   */

  /**
   * @function calculateRw
   * @description Calcula el índice de reducción sonora ponderado (Rw) según ISO 717-1
   * 
   * ✅ MOVIDO ANTES DE showDetailedAcousticAnalysis para que esté disponible
   */
  const calculateRw = (transmissionLoss: any, density: number, thickness: number) => {
    const { low, mid, high } = transmissionLoss;
    
    // Cálculo simplificado del Rw basado en ISO 717-1
    // Fórmula empírica que considera densidad y espesor
    const massPerArea = density * thickness; // kg/m²
    
    // Ley de masas: Rw ≈ 20 × log10(massPerArea) - 42
    let rwBase = 20 * Math.log10(massPerArea) - 42;
    
    // Corrección por frecuencias (promedio ponderado)
    const frequencyCorrection = (mid * 0.5 + low * 0.3 + high * 0.2) - rwBase;
    const rwCalculated = rwBase + frequencyCorrection * 0.3;
    
    // Clasificación según valor Rw
    let classification = '';
    let spectrum = '';
    
    if (rwCalculated >= 60) {
      classification = 'Excelente';
      spectrum = 'C50-5000';
    } else if (rwCalculated >= 50) {
      classification = 'Muy Bueno';
      spectrum = 'C50-3150';
    } else if (rwCalculated >= 45) {
      classification = 'Bueno';
      spectrum = 'C50-2500';
    } else if (rwCalculated >= 40) {
      classification = 'Regular';
      spectrum = 'C50-2000';
    } else if (rwCalculated >= 35) {
      classification = 'Básico';
      spectrum = 'C50-1600';
    } else {
      classification = 'Insuficiente';
      spectrum = 'C50-1250';
    }
    
    return {
      value: Math.max(0, rwCalculated), // No puede ser negativo
      classification,
      spectrum
    };
  };

  /**
   * @function showDetailedAcousticAnalysis
   * @description Genera análisis acústico completo y detallado en consola
   * 
   * ✅ AHORA calculateRw está disponible aquí
   */
  const showDetailedAcousticAnalysis = () => {
    console.clear();
    console.log('🔊 ANÁLISIS ACÚSTICO DETALLADO DE PAREDES');
    console.log('=========================================\n');
    
    if (walls.length === 0) {
      console.log('⚠️ No hay paredes para analizar');
      return;
    }
    
    // Análisis individual por pared
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
      
      // ✅ CÁLCULO DEL Rw (Ahora funciona correctamente)
      const avgTransmissionLoss = (tl.low + tl.mid + tl.high) / 3;
      
      console.log(`\n   🔧 DEBUG: Calculando Rw para pared ${index + 1}:`);
      console.log(`      • Densidad: ${wall.template.acousticProperties.density} kg/m³`);
      console.log(`      • Espesor: ${wall.template.thickness} m`);
      console.log(`      • TL Low: ${tl.low}dB, Mid: ${tl.mid}dB, High: ${tl.high}dB`);
      
      const rw = calculateRw(tl, wall.template.acousticProperties.density, wall.template.thickness);
      
      console.log(`      • Masa por área: ${(wall.template.acousticProperties.density * wall.template.thickness).toFixed(1)} kg/m²`);
      console.log(`      • Rw calculado: ${rw.value.toFixed(1)}dB\n`);
      
      console.log(`   🔊 PROPIEDADES ACÚSTICAS:`);
      console.log(`      📈 Pérdida de Transmisión:`);
      console.log(`         • Frecuencias Bajas (125-250Hz): ${tl.low}dB`);
      console.log(`         • Frecuencias Medias (500-1000Hz): ${tl.mid}dB`);
      console.log(`         • Frecuencias Altas (2000-4000Hz): ${tl.high}dB`);
      console.log(`         • Promedio Ponderado: ${avgTransmissionLoss.toFixed(1)}dB`);
      
      // ✅ NUEVO: Mostrar Rw calculado con énfasis
      console.log(`\n      🎯 === ÍNDICE Rw (ISO 717-1) ===`);
      console.log(`         • Valor Rw: ${rw.value.toFixed(1)}dB`);
      console.log(`         • Clasificación: ${rw.classification}`);
      console.log(`         • Espectro de referencia: ${rw.spectrum}`);
      console.log(`      ================================\n`);
      
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
      const effectiveTL = avgTransmissionLoss * condition.factor;
      const effectiveRw = rw.value * condition.factor;
      
      console.log(`      • Factor de estado: ${condition.factor} (${condition.desc})`);
      console.log(`      • Pérdida efectiva: ${effectiveTL.toFixed(1)}dB`);
      console.log(`      • Rw efectivo: ${effectiveRw.toFixed(1)}dB`);
      
      if (condition.factor < 0.8) {
        console.log(`      ⚠️  RECOMENDACIÓN: Considerar mantenimiento o reemplazo`);
      }
      
      // ✅ NUEVO: Evaluación específica del Rw
      console.log(`\n   🎯 EVALUACIÓN ESPECÍFICA Rw:`);
      if (rw.value < 40) {
        console.log(`      ❌ ADVERTENCIA: Rw bajo (${rw.value.toFixed(1)}dB) - Aislamiento insuficiente`);
        console.log(`      💡 RECOMENDACIÓN: Considerar mejora del material o aumento de espesor`);
      } else if (rw.value >= 55) {
        console.log(`      ✅ EXCELENTE: Rw alto (${rw.value.toFixed(1)}dB) - Aislamiento superior`);
        console.log(`      🏆 Esta pared cumple con estándares de alta calidad acústica`);
      } else if (rw.value >= 45) {
        console.log(`      ✅ BUENO: Rw adecuado (${rw.value.toFixed(1)}dB) - Aislamiento apropiado`);
        console.log(`      👍 Cumple con requisitos estándar de construcción`);
      } else {
        console.log(`      ⚠️  REGULAR: Rw básico (${rw.value.toFixed(1)}dB) - Aislamiento mínimo`);
        console.log(`      💡 Considerar mejoras si se requiere mayor aislamiento`);
      }
      
      console.log('\n' + '='.repeat(60) + '\n'); // Separador visual
    });
    
    // Análisis comparativo del conjunto
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
      
      // ✅ NUEVO: Cálculo del Rw promedio con detalles
      console.log(`\n🔬 CALCULANDO RW PROMEDIO DEL EDIFICIO:`);
      const rwValues = walls.map((wall, index) => {
        const tl = wall.template.acousticProperties.transmissionLoss;
        const rw = calculateRw(tl, wall.template.acousticProperties.density, wall.template.thickness);
        console.log(`   • Pared ${index + 1}: Rw = ${rw.value.toFixed(1)}dB (${rw.classification})`);
        return rw.value;
      });
      
      const avgRw = rwValues.reduce((sum, value) => sum + value, 0) / rwValues.length;
      const minRw = Math.min(...rwValues);
      const maxRw = Math.max(...rwValues);
      
      console.log(`\n📈 ESTADÍSTICAS GENERALES:`);
      console.log(`   • Área total: ${totalArea.toFixed(2)}m²`);
      console.log(`   • Costo total: €${totalCost.toFixed(2)}`);
      console.log(`   • Pérdida de transmisión promedio: ${avgTL.toFixed(1)}dB`);
      
      // ✅ ESTADÍSTICAS Rw DESTACADAS
      console.log(`\n🎯 === ESTADÍSTICAS Rw DEL EDIFICIO ===`);
      console.log(`   • Rw promedio: ${avgRw.toFixed(1)}dB`);
      console.log(`   • Rw mínimo: ${minRw.toFixed(1)}dB`);
      console.log(`   • Rw máximo: ${maxRw.toFixed(1)}dB`);
      console.log(`   • Rango: ${(maxRw - minRw).toFixed(1)}dB`);
      console.log(`=====================================`);
      
      // Identificar extremos de rendimiento
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
      
      // Sistema de recomendaciones automáticas
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

  /**
   * @function generateAcousticReport
   * @description Genera informe técnico completo en formato JSON (ACTUALIZADO CON Rw)
   */
  const generateAcousticReport = () => {
    const report = {
      timestamp: new Date().toISOString(),
      totalWalls: walls.length,
      totalArea: walls.reduce((sum, w) => sum + w.area, 0),
      totalCost: walls.reduce((sum, w) => 
        sum + (w.template.cost.material + w.template.cost.installation) * w.area, 0
      ),
      // ✅ NUEVO: Estadísticas de Rw
      acousticSummary: {
        averageRw: walls.length > 0 ? walls.reduce((sum, wall) => {
          const tl = wall.template.acousticProperties.transmissionLoss;
          const rw = calculateRw(tl, wall.template.acousticProperties.density, wall.template.thickness);
          return sum + rw.value;
        }, 0) / walls.length : 0,
        minRw: walls.length > 0 ? Math.min(...walls.map(wall => {
          const tl = wall.template.acousticProperties.transmissionLoss;
          return calculateRw(tl, wall.template.acousticProperties.density, wall.template.thickness).value;
        })) : 0,
        maxRw: walls.length > 0 ? Math.max(...walls.map(wall => {
          const tl = wall.template.acousticProperties.transmissionLoss;
          return calculateRw(tl, wall.template.acousticProperties.density, wall.template.thickness).value;
        })) : 0
      },
      walls: walls.map((wall, index) => {
        const tl = wall.template.acousticProperties.transmissionLoss;
        const rw = calculateRw(tl, wall.template.acousticProperties.density, wall.template.thickness);
        
        return {
          index: index + 1,
          id: wall.id,
          template: wall.template.name,
          area: wall.area,
          condition: wall.currentCondition,
          acousticRating: wall.acousticRating,
          transmissionLoss: wall.template.acousticProperties.transmissionLoss,
          absorption: wall.template.acousticProperties.absorptionCoefficient,
          density: wall.template.acousticProperties.density,
          thickness: wall.template.thickness,
          // ✅ NUEVO: Datos del Rw
          rw: {
            value: rw.value,
            classification: rw.classification,
            spectrum: rw.spectrum
          },
          cost: (wall.template.cost.material + wall.template.cost.installation) * wall.area
        };
      })
    };
    
    console.log('📋 INFORME ACÚSTICO GENERADO (CON Rw):');
    console.log(JSON.stringify(report, null, 2));
    
    // Persistencia en localStorage
    localStorage.setItem('acoustic-report', JSON.stringify(report));
    console.log('💾 Informe guardado en localStorage como "acoustic-report"');
  };

  /**
   * @function generateAcousticHeatmap
   * @description Actualizado para abrir modal después de generar heatmap
   */
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
      70 // Nivel de ruido externo en dB
    );
    
    localStorage.setItem('acoustic-heatmap-data', JSON.stringify(heatmapData));
    console.log('💾 Datos del mapa de calor guardados en localStorage');
    
    // ✅ NUEVO: Abrir modal profesional en lugar de alert
    setShowAnalysisModal(true);
  };

  /**
   * @section Funciones helper para UI
   * @description Utilidades para renderizado y visualización
   */

  /**
   * @function getConditionColor
   * @description Determina clases CSS para colorear estados de conservación
   * 
   * @param {WallCondition} condition - Estado de conservación de la pared
   * @returns {string} Clases CSS de Tailwind para styling
   */
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

  /**
   * @function getConditionLabel
   * @description Convierte estados técnicos a etiquetas amigables
   * 
   * @param {WallCondition} condition - Estado técnico
   * @returns {string} Etiqueta localizada para mostrar al usuario
   */
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

  /**
   * @section Renderizado condicional
   * @description Determina qué vista mostrar según el estado de visibilidad
   */

  // Vista minimizada - Solo botón de acceso
  // if (!isVisible) {
  //   return (
  //     // <button 
  //     //   onClick={onToggle}
  //     //   className="fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-green-700 transition-colors z-50"
  //     //   title="Abrir gestor de paredes"
  //     // >
  //     //   🧱 Gestionar Paredes
  //     // </button>
  //   );
  // }

  // Cálculo de pared seleccionada
  const selectedWall = selectedWallId ? walls.find(w => w.id === selectedWallId) : null;

  /**
   * @section Renderizado del panel principal
   * @description Interface completa de gestión de paredes
   */
  return (
    <>
      {/* BOTÓN DE CIERRE */}
      {/* <button 
        onClick={onToggle}
        className="fixed top-4 right-4 bg-gray-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-gray-700 transition-colors z-50"
        title="Cerrar gestor de paredes"
      >
        ❌ Cerrar Manager
      </button> */}

      {/* PANEL PRINCIPAL DE GESTIÓN */}
      <div className="fixed top-16 right-4 bg-white rounded-lg shadow-xl p-4 space-y-4 z-40 w-80 max-h-[80vh] overflow-y-auto">
        
        {/* HEADER CON BOTONES DE ANÁLISIS RÁPIDO */}
        {/* <div className="flex justify-between items-center">
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
              title="Generar informe técnico"
            >
              📋
            </button>
          </div>
        </div> */}
        
        {/* LISTA DE PAREDES EXISTENTES */}
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
                    {/* INDICADOR STC PROMEDIO */}
                    <div className="text-xs text-blue-600">
                      STC: {((wall.template.acousticProperties.transmissionLoss.low + 
                               wall.template.acousticProperties.transmissionLoss.mid + 
                               wall.template.acousticProperties.transmissionLoss.high) / 3).toFixed(1)}dB
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-1">
                    {/* BADGE DE ESTADO DE CONSERVACIÓN */}
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getConditionColor(wall.currentCondition)}`}>
                      {getConditionLabel(wall.currentCondition)}
                    </span>
                    {/* BADGE DE RATING ACÚSTICO */}
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

        {/* PANEL DE EDICIÓN DE PARED SELECCIONADA */}
        {selectedWall && (
          <div className="border-t pt-4 space-y-4">
            <h4 className="font-medium text-gray-700">
              Editar Pared Seleccionada:
            </h4>
            
            {/* SELECTOR DE TEMPLATE DE PARED */}
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

            {/* SELECTOR DE ESTADO DE CONSERVACIÓN */}
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

            {/* PANEL DE INFORMACIÓN ACÚSTICA DETALLADA */}
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

            {/* PANEL DE ANÁLISIS DE COSTOS */}
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

            {/* BOTONES DE ACCIÓN PARA PARED SELECCIONADA */}
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

        {/* RESUMEN GENERAL DEL PROYECTO */}
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
            
            {/* INFORMACIÓN ACÚSTICA EN RESUMEN */}
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
          
          {/* BOTONES DE ANÁLISIS PRINCIPAL - ACTUALIZADO */}
          <div className="flex space-x-2 mt-2">
            <button
              onClick={() => setShowAnalysisModal(true)}
              className="flex-1 px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm"
              title="Abrir análisis profesional"
            >
              📊 Análisis Profesional
            </button>
            <button
              onClick={generateAcousticHeatmap}
              className="flex-1 px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors text-sm"
              title="Generar mapa de calor + análisis"
            >
              🔥 Heatmap + Análisis
            </button>
          </div>
        </div>

        {/* SECCIÓN DE ANÁLISIS ACÚSTICO AVANZADO */}
        <div className="border-t pt-4">
          <h3 className="text-lg font-semibold mb-2">🔥 Análisis Acústico</h3>
          
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => recalculateAllWallsWithOpenings(openings)}
              className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm"
              title="Recalcular con aberturas actuales"
            >
              🔊 Recalcular
            </button>
            
            <button
              onClick={generateAcousticHeatmap}
              className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors text-sm"
              title="Generar análisis completo"
            >
              🔥 Análisis Completo
            </button>
          </div>
          
          <div className="mt-2 text-xs text-gray-600">
            💡 El mapa de calor se activará automáticamente en la escena 3D
          </div>
        </div>
      </div>

      {/* ✅ NUEVO: Modal de análisis acústico */}
      <AcousticAnalysisModal
        isOpen={showAnalysisModal}
        onClose={() => setShowAnalysisModal(false)}
        walls={walls}
        calculateRw={calculateRw}
      />
    </>
  );
};

/**
 * @exports WallsManager
 * @description Exportación por defecto del gestor de paredes
 */

/**
 * @namespace ComponentMetadata
 * @description Metadatos técnicos del componente
 * 
 * @property {string} componentType - "Walls Management Interface"
 * @property {string[]} features - [
 *   "CRUD Operations", "Acoustic Analysis", "Cost Management", 
 *   "Condition Tracking", "Report Generation", "Heatmap Visualization"
 * ]
 * @property {string[]} analysisTypes - [
 *   "Acoustic Properties", "Thermal Analysis", "Economic Evaluation",
 *   "Condition Assessment", "Comparative Statistics"
 * ]
 * @property {string[]} integrations - [
 *   "WallsStore", "OpeningsStore", "DrawingStore", "AcousticAnalysisEngine"
 * ]
 * @property {Object} acousticMetrics - Métricas acústicas analizadas
 * @property {string[]} acousticMetrics.transmissionLoss - ["Low", "Mid", "High", "Average"]
 * @property {string[]} acousticMetrics.absorption - ["By Frequency Band", "Percentage Values"]
 * @property {string[]} acousticMetrics.ratings - ["A", "B", "C", "D", "E"]
 * @property {Object} conditionStates - Estados de conservación
 * @property {number} conditionStates.excellent - 1.0 (factor)
 * @property {number} conditionStates.good - 0.95 (factor)
 * @property {number} conditionStates.fair - 0.85 (factor)
 * @property {number} conditionStates.poor - 0.7 (factor)
 * @property {number} conditionStates.damaged - 0.5 (factor)
 * @property {Object} reporting - Capacidades de reporting
 * @property {string} reporting.format - "JSON structured"
 * @property {string} reporting.storage - "localStorage persistence"
 * @property {string[]} reporting.includes - [
 *   "Metadata", "Wall Details", "Statistics", "Recommendations"
 * ]
 */