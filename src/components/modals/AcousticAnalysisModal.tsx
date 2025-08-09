/**
 * @fileoverview Modal profesional de análisis acústico con pestañas y visualizaciones
 * 
 * Componente modal avanzado que presenta los resultados del análisis acústico
 * en un formato profesional con múltiples pestañas, gráficos interactivos,
 * estadísticas detalladas y recomendaciones técnicas.
 * 
 * @module AcousticAnalysisModal
 * @version 1.0.0
 * @author WebGL-NextJS-3D Team
 * @since 2024
 */

import React, { useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';

/**
 * @interface AcousticAnalysisModalProps
 * @description Propiedades del modal de análisis acústico
 */
interface AcousticAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  walls: any[];
  calculateRw: (tl: any, density: number, thickness: number) => any;
}

/**
 * @component AcousticAnalysisModal
 * @description Modal profesional con análisis acústico completo
 */
export const AcousticAnalysisModal: React.FC<AcousticAnalysisModalProps> = ({
  isOpen,
  onClose,
  walls,
  calculateRw
}) => {

  /**
   * @section Cálculos de datos para visualización
   * @description Procesamiento de datos para gráficos y estadísticas
   */
  const analysisData = useMemo(() => {
    if (!walls.length) return null;

    // Datos procesados para las paredes
    const wallsData = walls.map((wall, index) => {
      const tl = wall.template.acousticProperties.transmissionLoss;
      const rw = calculateRw(tl, wall.template.acousticProperties.density, wall.template.thickness);
      const avgTL = (tl.low + tl.mid + tl.high) / 3;
      const materialCost = wall.template.cost.material * wall.area;
      const installationCost = wall.template.cost.installation * wall.area;
      const totalCost = materialCost + installationCost;

      return {
        id: wall.id,
        name: `Pared ${index + 1}`,
        template: wall.template.name,
        area: wall.area,
        condition: wall.currentCondition,
        acousticRating: wall.acousticRating,
        rw: rw.value,
        rwClassification: rw.classification,
        rwSpectrum: rw.spectrum,
        avgTL,
        tlLow: tl.low,
        tlMid: tl.mid,
        tlHigh: tl.high,
        absorption: wall.template.acousticProperties.absorptionCoefficient,
        density: wall.template.acousticProperties.density,
        thickness: wall.template.thickness,
        porosity: wall.template.acousticProperties.porosity,
        thermalConductivity: wall.template.thermalProperties.conductivity,
        thermalResistance: wall.template.thermalProperties.resistance,
        materialCost,
        installationCost,
        totalCost,
        costPerM2: totalCost / wall.area
      };
    });

    // Estadísticas generales
    const totalArea = wallsData.reduce((sum, w) => sum + w.area, 0);
    const totalCost = wallsData.reduce((sum, w) => sum + w.totalCost, 0);
    const avgRw = wallsData.reduce((sum, w) => sum + w.rw, 0) / wallsData.length;
    const avgTL = wallsData.reduce((sum, w) => sum + w.avgTL, 0) / wallsData.length;
    const avgDensity = wallsData.reduce((sum, w) => sum + w.density, 0) / wallsData.length;
    const avgCostPerM2 = wallsData.reduce((sum, w) => sum + w.costPerM2, 0) / wallsData.length;

    // Distribución por clasificación Rw
    const rwDistribution = wallsData.reduce((acc, wall) => {
      acc[wall.rwClassification] = (acc[wall.rwClassification] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Datos para gráfico de barras (Rw por pared)
    const barChartData = wallsData.map(wall => ({
      name: wall.name,
      rw: wall.rw,
      avgTL: wall.avgTL,
      cost: wall.totalCost / 100 // Dividido por 100 para mejor escala
    }));

    // Datos para gráfico de pie (Distribución de clasificaciones)
    const pieChartData = Object.entries(rwDistribution).map(([classification, count]) => ({
      name: classification,
      value: count,
      percentage: (count / wallsData.length * 100).toFixed(1)
    }));

    // Datos para análisis de frecuencias
    const frequencyData = wallsData.map(wall => ({
      name: wall.name,
      low: wall.tlLow,
      mid: wall.tlMid,
      high: wall.tlHigh
    }));

    return {
      walls: wallsData,
      summary: {
        totalWalls: wallsData.length,
        totalArea,
        totalCost,
        avgRw,
        avgTL,
        avgDensity,
        avgCostPerM2,
        minRw: Math.min(...wallsData.map(w => w.rw)),
        maxRw: Math.max(...wallsData.map(w => w.rw))
      },
      charts: {
        barChart: barChartData,
        pieChart: pieChartData,
        frequency: frequencyData
      },
      distribution: rwDistribution
    };
  }, [walls, calculateRw]);

  if (!analysisData) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>⚠️ Sin Datos para Analizar</DialogTitle>
            <DialogDescription>
              No hay paredes disponibles para generar el análisis acústico.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  /**
   * @function getConditionColor
   * @description Obtiene color según estado de conservación
   */
  const getConditionColor = (condition: string) => {
    const colors = {
      'excellent': 'bg-green-500',
      'good': 'bg-blue-500',
      'fair': 'bg-yellow-500',
      'poor': 'bg-orange-500',
      'damaged': 'bg-red-500'
    };
    return colors[condition as keyof typeof colors] || 'bg-gray-500';
  };

  /**
   * @function getRwColor
   * @description Obtiene color según clasificación Rw
   */
  const getRwColor = (classification: string) => {
    const colors = {
      'Excelente': '#22c55e',
      'Muy Bueno': '#3b82f6',
      'Bueno': '#eab308',
      'Regular': '#f97316',
      'Básico': '#ef4444',
      'Insuficiente': '#dc2626'
    };
    return colors[classification as keyof typeof colors] || '#64748b';
  };

  /**
   * @section Componentes de renderizado
   */
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {/* ✅ OPCIÓN 1: Usar max-w-[95vw] para ocupar 95% del ancho de la pantalla */}
      <DialogContent className="max-w-screen-2xl max-h-[90vh] overflow-y-auto">
        
      {/* ✅ OPCIÓN 2: Usar max-w-screen-2xl para pantallas muy grandes */}
      {/* <DialogContent className="max-w-screen-2xl max-h-[90vh] overflow-y-auto"> */}
      
      {/* ✅ OPCIÓN 3: Usar w-[90vw] para ancho fijo del 90% */}
      {/* <DialogContent className="w-[90vw] max-w-none max-h-[90vh] overflow-y-auto"> */}
      
      {/* ✅ OPCIÓN 4: Usar casi toda la pantalla */}
      {/* <DialogContent className="max-w-[98vw] max-h-[95vh] overflow-y-auto"> */}

        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            🔊 Análisis Acústico Profesional
            <Badge variant="secondary" className="ml-2">
              {analysisData.summary.totalWalls} Paredes
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Análisis completo de propiedades acústicas, térmicas y económicas del proyecto
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">📊 Resumen</TabsTrigger>
            <TabsTrigger value="walls">🧱 Paredes</TabsTrigger>
            <TabsTrigger value="acoustic">🔊 Acústico</TabsTrigger>
            <TabsTrigger value="thermal">🌡️ Térmico</TabsTrigger>
            <TabsTrigger value="cost">💰 Costos</TabsTrigger>
            <TabsTrigger value="recommendations">💡 Recomendaciones</TabsTrigger>
          </TabsList>

          {/* PESTAÑA: RESUMEN GENERAL */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Área Total</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analysisData.summary.totalArea.toFixed(1)}m²</div>
                  <p className="text-xs text-muted-foreground">
                    {analysisData.summary.totalWalls} paredes analizadas
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Rw Promedio</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {analysisData.summary.avgRw.toFixed(1)}dB
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Rango: {analysisData.summary.minRw.toFixed(1)} - {analysisData.summary.maxRw.toFixed(1)}dB
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Costo Total</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    €{analysisData.summary.totalCost.toFixed(0)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    €{analysisData.summary.avgCostPerM2.toFixed(2)}/m² promedio
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Evaluación General</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {analysisData.summary.avgRw >= 55 ? '🏆 Excelente' :
                     analysisData.summary.avgRw >= 45 ? '✅ Bueno' :
                     analysisData.summary.avgRw >= 35 ? '⚠️ Regular' : '❌ Deficiente'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Basado en Rw promedio
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Gráfico de barras - Rw por pared */}
            <Card>
              <CardHeader>
                <CardTitle>Índice Rw por Pared</CardTitle>
                <CardDescription>
                  Comparación del índice de reducción sonora ponderado entre paredes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analysisData.charts.barChart}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: any, name: string) => [
                        name === 'rw' ? `${value.toFixed(1)}dB` :
                        name === 'avgTL' ? `${value.toFixed(1)}dB` :
                        `€${(value * 100).toFixed(0)}`,
                        name === 'rw' ? 'Rw' :
                        name === 'avgTL' ? 'TL Promedio' : 'Costo Total'
                      ]}
                    />
                    <Legend />
                    <Bar dataKey="rw" fill="#3b82f6" name="Rw (dB)" />
                    <Bar dataKey="avgTL" fill="#10b981" name="TL Promedio (dB)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Gráfico de pie - Distribución de clasificaciones */}
            <Card>
              <CardHeader>
                <CardTitle>Distribución de Clasificaciones Rw</CardTitle>
                <CardDescription>
                  Porcentaje de paredes por nivel de calidad acústica
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analysisData.charts.pieChart}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({name, percentage}) => `${name}: ${percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {analysisData.charts.pieChart.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getRwColor(entry.name)} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* PESTAÑA: ANÁLISIS DE PAREDES */}
          <TabsContent value="walls" className="space-y-4">
            <div className="grid gap-4">
              {analysisData.walls.map((wall, index) => (
                <Card key={wall.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{wall.name}</CardTitle>
                        <CardDescription>{wall.template}</CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Badge 
                          className={`${getConditionColor(wall.condition)} text-white`}
                        >
                          {wall.condition}
                        </Badge>
                        <Badge variant="outline">
                          Rw: {wall.rw.toFixed(1)}dB
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm font-medium">Área</p>
                        <p className="text-2xl font-bold">{wall.area.toFixed(1)}m²</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Rw Classification</p>
                        <p className="text-lg font-semibold" style={{color: getRwColor(wall.rwClassification)}}>
                          {wall.rwClassification}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Densidad</p>
                        <p className="text-lg font-semibold">{wall.density} kg/m³</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Costo Total</p>
                        <p className="text-lg font-semibold text-green-600">€{wall.totalCost.toFixed(0)}</p>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <p className="text-sm font-medium mb-2">Pérdida de Transmisión por Frecuencias</p>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="text-center p-2 bg-blue-50 rounded">
                          <p className="text-xs text-muted-foreground">Bajas</p>
                          <p className="font-semibold">{wall.tlLow}dB</p>
                        </div>
                        <div className="text-center p-2 bg-green-50 rounded">
                          <p className="text-xs text-muted-foreground">Medias</p>
                          <p className="font-semibold">{wall.tlMid}dB</p>
                        </div>
                        <div className="text-center p-2 bg-purple-50 rounded">
                          <p className="text-xs text-muted-foreground">Altas</p>
                          <p className="font-semibold">{wall.tlHigh}dB</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* PESTAÑA: ANÁLISIS ACÚSTICO DETALLADO */}
          <TabsContent value="acoustic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Análisis de Frecuencias</CardTitle>
                <CardDescription>
                  Pérdida de transmisión por bandas de frecuencia para cada pared
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={analysisData.charts.frequency}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis label={{ value: 'Pérdida (dB)', angle: -90, position: 'insideLeft' }} />
                    <Tooltip formatter={(value: any) => [`${value}dB`, '']} />
                    <Legend />
                    <Line type="monotone" dataKey="low" stroke="#3b82f6" strokeWidth={2} name="Frecuencias Bajas" />
                    <Line type="monotone" dataKey="mid" stroke="#10b981" strokeWidth={2} name="Frecuencias Medias" />
                    <Line type="monotone" dataKey="high" stroke="#f59e0b" strokeWidth={2} name="Frecuencias Altas" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Estadísticas Rw</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm">
                      <span>Promedio</span>
                      <span>{analysisData.summary.avgRw.toFixed(1)}dB</span>
                    </div>
                    <Progress value={(analysisData.summary.avgRw / 60) * 100} className="mt-1" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm">
                      <span>Mínimo</span>
                      <span>{analysisData.summary.minRw.toFixed(1)}dB</span>
                    </div>
                    <Progress value={(analysisData.summary.minRw / 60) * 100} className="mt-1" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm">
                      <span>Máximo</span>
                      <span>{analysisData.summary.maxRw.toFixed(1)}dB</span>
                    </div>
                    <Progress value={(analysisData.summary.maxRw / 60) * 100} className="mt-1" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Absorción Acústica</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analysisData.walls.map((wall, index) => (
                      <div key={wall.id} className="border-b pb-2">
                        <p className="font-medium text-sm">{wall.name}</p>
                        <div className="grid grid-cols-3 gap-2 text-xs mt-1">
                          <span>Bajas: α={wall.absorption.low}</span>
                          <span>Medias: α={wall.absorption.mid}</span>
                          <span>Altas: α={wall.absorption.high}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* PESTAÑA: ANÁLISIS TÉRMICO */}
          <TabsContent value="thermal" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Conductividad Térmica</CardTitle>
                  <CardDescription>W/m·K por pared</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analysisData.walls}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value: any) => [`${value} W/m·K`]} />
                      <Bar dataKey="thermalConductivity" fill="#ef4444" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Resistencia Térmica</CardTitle>
                  <CardDescription>m²·K/W por pared</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analysisData.walls}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value: any) => [`${value} m²·K/W`]} />
                      <Bar dataKey="thermalResistance" fill="#06b6d4" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Propiedades Térmicas Detalladas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Pared</th>
                        <th className="text-left p-2">Espesor (cm)</th>
                        <th className="text-left p-2">Conductividad (W/m·K)</th>
                        <th className="text-left p-2">Resistencia (m²·K/W)</th>
                        <th className="text-left p-2">Evaluación</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analysisData.walls.map((wall) => (
                        <tr key={wall.id} className="border-b">
                          <td className="p-2 font-medium">{wall.name}</td>
                          <td className="p-2">{(wall.thickness * 100).toFixed(1)}</td>
                          <td className="p-2">{wall.thermalConductivity}</td>
                          <td className="p-2">{wall.thermalResistance}</td>
                          <td className="p-2">
                            <Badge variant={wall.thermalConductivity < 0.5 ? "default" : "secondary"}>
                              {wall.thermalConductivity < 0.5 ? "Buen aislante" : "Aislante regular"}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* PESTAÑA: ANÁLISIS DE COSTOS */}
          <TabsContent value="cost" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Costo Total de Materiales</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    €{analysisData.walls.reduce((sum, w) => sum + w.materialCost, 0).toFixed(0)}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Costo Total de Instalación</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">
                    €{analysisData.walls.reduce((sum, w) => sum + w.installationCost, 0).toFixed(0)}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Costo Promedio por m²</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    €{analysisData.summary.avgCostPerM2.toFixed(2)}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Distribución de Costos</CardTitle>
                <CardDescription>Costos por pared desglosados</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={analysisData.walls}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value: any) => [`€${value.toFixed(0)}`]} />
                    <Legend />
                    <Bar dataKey="materialCost" stackId="cost" fill="#3b82f6" name="Material" />
                    <Bar dataKey="installationCost" stackId="cost" fill="#f59e0b" name="Instalación" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Análisis Costo-Beneficio</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analysisData.walls.map((wall) => (
                    <div key={wall.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium">{wall.name}</h4>
                        <Badge variant="outline">
                          Ratio: {(wall.rw / wall.costPerM2).toFixed(2)} dB/€
                        </Badge>
                      </div>
                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Costo Total</p>
                          <p className="font-semibold">€{wall.totalCost.toFixed(0)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Costo/m²</p>
                          <p className="font-semibold">€{wall.costPerM2.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Rw</p>
                          <p className="font-semibold">{wall.rw.toFixed(1)}dB</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Eficiencia</p>
                          <p className="font-semibold">
                            {wall.rw / wall.costPerM2 > 1 ? '👍 Alta' : 
                             wall.rw / wall.costPerM2 > 0.5 ? '👌 Media' : '👎 Baja'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* PESTAÑA: RECOMENDACIONES */}
          <TabsContent value="recommendations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>🎯 Recomendaciones Técnicas</CardTitle>
                <CardDescription>
                  Análisis automático y sugerencias de mejora basadas en los datos actuales
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Evaluación general */}
                <div className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-semibold text-lg mb-2">📊 Evaluación General del Proyecto</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Basado en {analysisData.summary.totalWalls} paredes con un área total de {analysisData.summary.totalArea.toFixed(1)}m²
                  </p>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="font-medium">
                      Rw promedio: {analysisData.summary.avgRw.toFixed(1)}dB - 
                      {analysisData.summary.avgRw >= 55 ? ' 🏆 Excelente rendimiento acústico' :
                       analysisData.summary.avgRw >= 45 ? ' ✅ Buen rendimiento acústico' :
                       analysisData.summary.avgRw >= 35 ? ' ⚠️ Rendimiento acústico básico' : 
                       ' ❌ Rendimiento acústico insuficiente'}
                    </p>
                  </div>
                </div>

                {/* Recomendaciones específicas por pared */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-lg">🔧 Recomendaciones por Pared</h4>
                  {analysisData.walls.map((wall) => (
                    <div key={wall.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h5 className="font-medium">{wall.name} - {wall.template}</h5>
                        <Badge className={`${getConditionColor(wall.condition)} text-white`}>
                          {wall.condition}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        {/* Evaluación Rw */}
                        {wall.rw < 40 && (
                          <div className="bg-red-50 border border-red-200 p-2 rounded">
                            <p className="text-red-800">
                              ❌ <strong>Rw bajo ({wall.rw.toFixed(1)}dB)</strong> - 
                              Considerar aumento de espesor o cambio de material
                            </p>
                          </div>
                        )}
                        
                        {wall.rw >= 55 && (
                          <div className="bg-green-50 border border-green-200 p-2 rounded">
                            <p className="text-green-800">
                              ✅ <strong>Excelente Rw ({wall.rw.toFixed(1)}dB)</strong> - 
                              Mantener especificaciones actuales
                            </p>
                          </div>
                        )}

                        {/* Evaluación de estado */}
                        {(wall.condition === 'poor' || wall.condition === 'damaged') && (
                          <div className="bg-orange-50 border border-orange-200 p-2 rounded">
                            <p className="text-orange-800">
                              🔧 <strong>Estado deficiente</strong> - 
                              Priorizar mantenimiento para mantener rendimiento acústico
                            </p>
                          </div>
                        )}

                        {/* Evaluación costo-beneficio */}
                        {wall.rw / wall.costPerM2 < 0.5 && (
                          <div className="bg-yellow-50 border border-yellow-200 p-2 rounded">
                            <p className="text-yellow-800">
                              💰 <strong>Baja eficiencia costo-beneficio</strong> - 
                              Evaluar alternativas más económicas
                            </p>
                          </div>
                        )}

                        {/* Evaluación térmica */}
                        {wall.thermalConductivity > 1.0 && (
                          <div className="bg-blue-50 border border-blue-200 p-2 rounded">
                            <p className="text-blue-800">
                              🌡️ <strong>Alta conductividad térmica</strong> - 
                              Considerar aislamiento adicional
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Recomendaciones generales */}
                <div className="border-l-4 border-green-500 pl-4">
                  <h4 className="font-semibold text-lg mb-2">💡 Recomendaciones Generales</h4>
                  <div className="space-y-2 text-sm">
                    {analysisData.summary.avgRw < 40 && (
                      <p>• Considerar mejora general del aislamiento acústico del edificio</p>
                    )}
                    
                    {analysisData.walls.filter(w => w.condition === 'poor' || w.condition === 'damaged').length > 0 && (
                      <p>• Planificar programa de mantenimiento preventivo para paredes en mal estado</p>
                    )}
                    
                    {analysisData.summary.avgCostPerM2 > 50 && (
                      <p>• Evaluar optimización de costos para futuras expansiones</p>
                    )}
                    
                    {analysisData.summary.maxRw - analysisData.summary.minRw > 20 && (
                      <p>• Gran variabilidad en rendimiento acústico - considerar estandarización</p>
                    )}

                    <p>• Realizar mediciones acústicas in-situ para validar cálculos teóricos</p>
                    <p>• Considerar análisis de vibraciones para evaluación completa</p>
                    <p>• Documentar especificaciones para mantenimiento futuro</p>
                  </div>
                </div>

                {/* Próximos pasos */}
                <div className="border-l-4 border-purple-500 pl-4">
                  <h4 className="font-semibold text-lg mb-2">🚀 Próximos Pasos</h4>
                  <div className="space-y-1 text-sm">
                    <p>1. Priorizar intervenciones según impacto en Rw y estado de conservación</p>
                    <p>2. Solicitar cotizaciones para mejoras identificadas</p>
                    <p>3. Programar mediciones acústicas de verificación</p>
                    <p>4. Desarrollar plan de mantenimiento preventivo</p>
                    <p>5. Considerar certificación acústica del edificio</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};