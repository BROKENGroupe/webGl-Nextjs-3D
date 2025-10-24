/**
 * @fileoverview Modal profesional de análisis acústico con diseño de menú lateral
 * 
 * Componente modal avanzado con navegación lateral estilo configuraciones,
 * que presenta los resultados del análisis acústico en un formato profesional
 * con múltiples secciones y gráficos interactivos.
 * 
 * @module AcousticAnalysisModal
 * @version 3.0.0
 * @author WebGL-NextJS-3D Team
 * @since 2024
 */

import React, { useMemo, useState } from 'react';

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
  Line
} from 'recharts';
import {
  BarChart3,
  Building2,
  Volume2,
  Thermometer,
  Euro,
  Lightbulb,
  X,
  Settings
} from 'lucide-react';
import { Badge } from '@/shared/ui/badge';
import { AcousticMaterial, ThirdOctave } from '@/modules/materials/types/AcousticMaterial';
import { useIsoResultStore } from '@/modules/editor/store/isoResultStore';
import { Button } from '@/shared/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/shared/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/shared/ui/dialog';
import { Progress } from '@react-three/drei';
import { PressureLevelBarHorizontal } from '@/modules/editor/components/PressureLevelBarHorizontal';


/**
 * @interface AcousticAnalysisModalProps
 * @description Propiedades del modal de análisis acústico
 */
interface AcousticAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  walls: AcousticMaterial[];
  handleCalculateInsulation: () => void; // eliminado por ahora
}

/**
 * @interface MenuItem
 * @description Interfaz para los elementos del menú lateral
 */
interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
}

/**
 * @component AcousticAnalysisModal
 * @description Modal profesional con análisis acústico completo - Diseño de menú lateral
 */
export const AcousticAnalysisModal: React.FC<AcousticAnalysisModalProps> = ({
  isOpen,
  onClose,
  walls,
  handleCalculateInsulation // eliminiado por ahora
}) => {
  const [activeSection, setActiveSection] = useState('general');
  const isoResult = useIsoResultStore((state) => state.isoResult);

  /**
   * @section Elementos del menú lateral
   */
  const menuItems: MenuItem[] = [
    {
      id: 'general',
      label: 'General',
      icon: <BarChart3 className="h-4 w-4" />,
      description: 'Resumen general del proyecto'
    },
    {
      id: 'walls',
      label: 'Paredes',
      icon: <Building2 className="h-4 w-4" />,
      description: 'Análisis detallado por pared'
    },
    {
      id: 'acoustic',
      label: 'Acústico',
      icon: <Volume2 className="h-4 w-4" />,
      description: 'Propiedades y análisis acústico'
    },
    {
      id: 'recommendations',
      label: 'Recomendaciones',
      icon: <Lightbulb className="h-4 w-4" />,
      description: 'Sugerencias y mejoras'
    },
    {
      id: 'iso',
      label: 'ISO 12354-4',
      icon: <Volume2 className="h-4 w-4" />,
      description: 'Rw final, presión interior y estado de fachadas/aberturas'
    }
  ];

  // Utilidades para AcousticMaterial
  const getRw = (material: AcousticMaterial) => material.weightedIndex?.Rw ?? 0;
  const getTLBands = (material: AcousticMaterial) => {
    const bands: ThirdOctave[] = [125, 500, 2000];
    return {
      low: material.thirdOctaveBands[125] ?? 0,
      mid: material.thirdOctaveBands[500] ?? 0,
      high: material.thirdOctaveBands[2000] ?? 0,
      average: bands.map(b => material.thirdOctaveBands[b] ?? 0).reduce((a, b) => a + b, 0) / bands.length
    };
  };

  const getRwClassification = (rw: number) => {
    if (rw >= 55) return 'Excelente';
    if (rw >= 48) return 'Muy Bueno';
    if (rw >= 40) return 'Bueno';
    if (rw >= 35) return 'Regular';
    if (rw >= 28) return 'Básico';
    return 'Insuficiente';
  };

  /**
   * @section Cálculos de datos para visualización
   */
  const analysisData = useMemo(() => {
    if (!walls || !Array.isArray(walls) || walls.length === 0) return null;

    const wallsData = walls.map((material, index) => {
      const tlBands = getTLBands(material);
      const rw = getRw(material);
      const rwClassification = getRwClassification(rw);

      // Simulación de costos y térmico si existen
      const materialCost = (material as any).cost?.material ?? 50;
      const installationCost = (material as any).cost?.installation ?? 30;
      const area = (material as any).area ?? 10;
      const totalCost = (materialCost + installationCost) * area;

      return {
        id: material.id ?? `wall-${index}`,
        name: material.descriptor ?? `Pared ${index + 1}`,
        template: material.subtype ?? '',
        area,
        condition: (material as any).condition ?? 'excellent',
        acousticRating: rwClassification,
        rw,
        rwClassification,
        avgTL: tlBands.average,
        tlLow: tlBands.low,
        tlMid: tlBands.mid,
        tlHigh: tlBands.high,
        density: material.mass_kg_m2,
        thickness: material.thickness_mm / 100,
        thermalConductivity: (material as any).thermalConductivity ?? 0.4,
        thermalResistance: (material as any).thermalResistance ?? 2.0,
        materialCost,
        installationCost,
        totalCost,
        costPerM2: totalCost / area
      };
    });

    const totalArea = wallsData.reduce((sum, w) => sum + w.area, 0);
    const totalCost = wallsData.reduce((sum, w) => sum + w.totalCost, 0);
    const avgRw = wallsData.reduce((sum, w) => sum + w.rw, 0) / wallsData.length;
    const avgTL = wallsData.reduce((sum, w) => sum + w.avgTL, 0) / wallsData.length;
    const avgDensity = wallsData.reduce((sum, w) => sum + w.density, 0) / wallsData.length;
    const avgCostPerM2 = wallsData.reduce((sum, w) => sum + w.costPerM2, 0) / wallsData.length;

    const rwDistribution = wallsData.reduce((acc, wall) => {
      acc[wall.rwClassification] = (acc[wall.rwClassification] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const barChartData = wallsData.map(wall => ({
      name: wall.name,
      rw: wall.rw,
      avgTL: wall.avgTL,
      cost: wall.totalCost / 100
    }));

    const pieChartData = Object.entries(rwDistribution).map(([classification, count]) => ({
      name: classification,
      value: count,
      percentage: (count / wallsData.length * 100).toFixed(1)
    }));

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
  }, [walls]);

  if (!analysisData) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-gray-900 flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Sin Datos para Analizar
            </DialogTitle>
            <DialogDescription className="text-gray-600">
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
      'excellent': 'bg-emerald-500',
      'good': 'bg-blue-500',
      'fair': 'bg-amber-500',
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
      'Excelente': '#10b981',
      'Muy Bueno': '#3b82f6',
      'Bueno': '#f59e0b',
      'Regular': '#f97316',
      'Básico': '#ef4444',
      'Insuficiente': '#dc2626'
    };
    return colors[classification as keyof typeof colors] || '#6b7280';
  };

  /**
   * @function renderContent
   * @description Renderiza el contenido según la sección activa
   */
  const renderContent = () => {
    switch (activeSection) {
      case 'general':
        return (
          <div className="min-w-72">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Resumen General</h2>
              <p className="text-gray-600">
                Visión general del análisis acústico del proyecto con {analysisData.summary.totalWalls} paredes
              </p>
            </div>

            {/* Cards de métricas principales */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 mb-3">
              <Card className="border border-gray-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Área Total</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">{analysisData.summary.totalArea.toFixed(1)}m²</div>
                  <p className="text-sm text-gray-500 mt-1">
                    {analysisData.summary.totalWalls} paredes analizadas
                  </p>
                </CardContent>
              </Card>

              <Card className="border border-gray-200 mb-3">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Rw Promedio</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">
                    {analysisData.summary.avgRw.toFixed(1)}dB
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Rango: {analysisData.summary.minRw.toFixed(1)} - {analysisData.summary.maxRw.toFixed(1)}dB
                  </p>
                </CardContent>
              </Card>              

              <Card className="border border-gray-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Evaluación General</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">
                    {analysisData.summary.avgRw >= 55 ? 'Excelente' :
                     analysisData.summary.avgRw >= 45 ? 'Bueno' :
                     analysisData.summary.avgRw >= 35 ? 'Regular' : 'Deficiente'}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Basado en Rw promedio
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Gráfico de barras */}
            <Card className="border border-gray-200 mb-3">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">Índice Rw por Pared</CardTitle>
                <CardDescription className="text-gray-600">
                  Comparación del índice de reducción sonora ponderado
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analysisData.charts.barChart}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 12 }} />
                    <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e5e7eb', 
                        borderRadius: '8px',
                        color: '#374151'
                      }}
                    />
                    <Legend />
                    <Bar dataKey="rw" fill="#3b82f6" name="Rw (dB)" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="avgTL" fill="#10b981" name="TL Promedio (dB)" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

             <PressureLevelBarHorizontal
            value={75}
            min={40}
            max={120}
            label="Nivel de presión sonora"
            unit="dB"
          />

            {isoResult && (
              <Card className="border border-gray-200 mt-6">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900">Resultado ISO 12354-4</CardTitle>
                  <CardDescription className="text-gray-600">
                    Cálculo profesional con parámetros reales y persistencia automática
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row gap-6 items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        <Volume2 className="h-8 w-8 text-blue-600" />
                        <div>
                          <div className="text-4xl font-extrabold text-blue-700 leading-tight drop-shadow">
                            Rw Final: {isoResult.rwFinal?.toFixed(1)} dB
                          </div>
                          <div className="text-base text-gray-600 font-medium mt-1">
                            <span className="bg-blue-50 px-2 py-1 rounded">ISO 12354-4</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-700 mb-2">
                        <strong>Presión sonora interior (Lp_in):</strong> {isoResult.input?.Lp_in} dB
                      </div>
                      <div className="text-sm text-gray-700 mb-2">
                        <strong>Paredes:</strong> {isoResult.input?.walls?.length}
                        <br />
                        <strong>Aberturas:</strong> {isoResult.input?.openings?.length}
                      </div>
                      <div className="text-sm text-gray-700 mb-2">
                        <strong>Coordenadas:</strong> {JSON.stringify(isoResult.input?.wallCoordinates)}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 mb-2">Mapa de calor acústico</div>
                      <div className="text-xs text-gray-600 mb-2">
                        <strong>Puntos totales:</strong> {isoResult.heatmap?.length}
                        <br />
                        <strong>Puntos críticos (&gt;0.7):</strong> {isoResult.heatmap?.filter((p: any) => p.intensity > 0.7).length}
                        <br />
                        <strong>Puntos buenos (&lt;0.3):</strong> {isoResult.heatmap?.filter((p: any) => p.intensity < 0.3).length}
                      </div>
                      <div className="max-h-40 overflow-y-auto border rounded bg-gray-50 p-2 text-xs">
                        {isoResult.heatmap?.slice(0, 10).map((p: any) => (
                          <div key={p.id} className="mb-1">
                            <span className="font-bold">{p.type === 'wall' ? '🧱' : '🚪'}</span> 
                            <span className="ml-1">{p.description}</span>
                            {/* <span className="ml-2 text-gray-400">({p.coordinates.x.toFixed(2)}, {p.coordinates.z.toFixed(2)})</span> */}
                            <span className={`ml-2 px-2 py-0.5 rounded text-white text-xs ${p.intensity > 0.7 ? 'bg-red-500' : p.intensity < 0.3 ? 'bg-green-500' : 'bg-yellow-500'}`}>
                              {Math.round(p.intensity * 100)}%
                            </span>
                          </div>
                        ))}
                        {isoResult.heatmap?.length > 10 && (
                          <div className="text-gray-400 mt-2">...y {isoResult.heatmap.length - 10} puntos más</div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        );

      case 'walls':
        return (
          <div className="w-180 min-w-72">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Análisis por Paredes</h2>
              <p className="text-gray-600">
                Detalle individual de cada pared del proyecto
              </p>
            </div>

            <div className="grid gap-4">
              {analysisData.walls.map((wall) => (
                <Card key={wall.id} className="border border-gray-200">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg font-semibold text-gray-900">{wall.name}</CardTitle>
                        <CardDescription className="text-gray-600">{wall.template}</CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Badge className={`${getConditionColor(wall.condition)} text-white border-0`}>
                          {wall.condition}
                        </Badge>
                        <Badge variant="outline" className="border-gray-300 text-gray-700">
                          Rw: {wall.rw.toFixed(1)}dB
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Área</p>
                        <p className="text-2xl font-bold text-gray-900">{wall.area.toFixed(1)}m²</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Clasificación Rw</p>
                        <p className="text-lg font-semibold" style={{color: getRwColor(wall.rwClassification)}}>
                          {wall.rwClassification}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Densidad</p>
                        <p className="text-lg font-semibold text-gray-900">{wall.density} kg/m³</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Costo Total</p>
                        <p className="text-lg font-semibold text-emerald-600">€{wall.totalCost.toFixed(0)}</p>
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <p className="text-sm font-medium text-gray-700 mb-3">Pérdida de Transmisión por Frecuencias</p>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-100">
                          <p className="text-xs text-gray-600 mb-1">Bajas</p>
                          <p className="font-semibold text-gray-900">{wall.tlLow}dB</p>
                        </div>
                        <div className="text-center p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                          <p className="text-xs text-gray-600 mb-1">Medias</p>
                          <p className="font-semibold text-gray-900">{wall.tlMid}dB</p>
                        </div>
                        <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-100">
                          <p className="text-xs text-gray-600 mb-1">Altas</p>
                          <p className="font-semibold text-gray-900">{wall.tlHigh}dB</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case 'acoustic':
        return (
          <div className="w-180 min-w-72">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Análisis Acústico</h2>
              <p className="text-gray-600">
                Propiedades acústicas detalladas y análisis de frecuencias
              </p>
            </div>

            <Card className="border border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">Análisis de Frecuencias</CardTitle>
                <CardDescription className="text-gray-600">
                  Pérdida de transmisión por bandas de frecuencia
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={analysisData.charts.frequency}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 12 }} />
                    <YAxis 
                      label={{ value: 'Pérdida (dB)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#6b7280' } }}
                      tick={{ fill: '#6b7280', fontSize: 12 }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e5e7eb', 
                        borderRadius: '8px',
                        color: '#374151'
                      }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="low" stroke="#3b82f6" strokeWidth={3} name="Frecuencias Bajas" />
                    <Line type="monotone" dataKey="mid" stroke="#10b981" strokeWidth={3} name="Frecuencias Medias" />
                    <Line type="monotone" dataKey="high" stroke="#f59e0b" strokeWidth={3} name="Frecuencias Altas" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border border-gray-200">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900">Estadísticas Rw</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Promedio</span>
                      <span className="font-semibold text-gray-900">{analysisData.summary.avgRw.toFixed(1)}dB</span>
                    </div>
                    {/* Replace with a compatible progress bar, e.g. shadcn/ui Progress */}
                    <div className="w-full bg-gray-200 rounded h-2">
                      <div
                        className="bg-blue-500 h-2 rounded"
                        style={{ width: `${(analysisData.summary.avgRw / 60) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Mínimo</span>
                      <span className="font-semibold text-gray-900">{analysisData.summary.minRw.toFixed(1)}dB</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded h-2">
                      <div
                        className="bg-blue-500 h-2 rounded"
                        style={{ width: `${(analysisData.summary.minRw / 60) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Máximo</span>
                      <span className="font-semibold text-gray-900">{analysisData.summary.maxRw.toFixed(1)}dB</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded h-2">
                      <div
                        className="bg-blue-500 h-2 rounded"
                        style={{ width: `${(analysisData.summary.maxRw / 60) * 100}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-gray-200">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900">Distribución de Clasificaciones</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
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
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e5e7eb', 
                          borderRadius: '8px',
                          color: '#374151'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      
      case 'recommendations':
        return (
          <div className="w-180 min-w-72">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Recomendaciones</h2>
              <p className="text-gray-600">
                Sugerencias técnicas y próximos pasos basados en el análisis
              </p>
            </div>

            {/* Evaluación general */}
            <div className="border-l-4 border-blue-500 pl-4 bg-blue-50 p-4 rounded-r-lg">
              <h4 className="font-semibold text-lg mb-2 text-gray-900">Evaluación General del Proyecto</h4>
              <p className="text-sm text-gray-600 mb-3">
                Basado en {analysisData.summary.totalWalls} paredes con un área total de {analysisData.summary.totalArea.toFixed(1)}m²
              </p>
              <div className="bg-white p-3 rounded-lg border border-blue-200">
                <p className="font-medium text-gray-900">
                  Rw promedio: {analysisData.summary.avgRw.toFixed(1)}dB - 
                  {analysisData.summary.avgRw >= 55 ? ' Excelente rendimiento acústico' :
                   analysisData.summary.avgRw >= 45 ? ' Buen rendimiento acústico' :
                   analysisData.summary.avgRw >= 35 ? ' Rendimiento acústico básico' : 
                   ' Rendimiento acústico insuficiente'}
                </p>
              </div>
            </div>

            {/* Recomendaciones generales */}
            <div className="border-l-4 border-emerald-500 pl-4 bg-emerald-50 p-4 rounded-r-lg">
              <h4 className="font-semibold text-lg mb-3 text-gray-900">Recomendaciones Generales</h4>
              <div className="space-y-2 text-sm text-gray-700">
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
            <div className="border-l-4 border-purple-500 pl-4 bg-purple-50 p-4 rounded-r-lg">
              <h4 className="font-semibold text-lg mb-3 text-gray-900">Próximos Pasos</h4>
              <div className="space-y-1 text-sm text-gray-700">
                <p>1. Priorizar intervenciones según impacto en Rw y estado de conservación</p>
                <p>2. Solicitar cotizaciones para mejoras identificadas</p>
                <p>3. Programar mediciones acústicas de verificación</p>
                <p>4. Desarrollar plan de mantenimiento preventivo</p>
                <p>5. Considerar certificación acústica del edificio</p>
              </div>
            </div>
          </div>
        );

      case 'iso':
        return (
          <div className="w-180 min-w-72">
            <h2 className="text-2xl font-semibold text-blue-800 mb-4 flex items-center gap-2">
              <Volume2 className="h-7 w-7 text-blue-600" />
              Resultados ISO 12354-4 Detallados
            </h2>
            {isoResult ? (
              <div>
                <Card className="border border-blue-200 mb-6">
                  <CardHeader>
                    <CardTitle className="text-3xl font-extrabold text-blue-700">Rw Final: {isoResult.rwFinal?.toFixed(1)} dB</CardTitle>
                    <CardDescription className="text-gray-600">
                      Presión sonora interior (Lp_in): <span className="font-bold">{isoResult.input?.Lp_in} dB</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-gray-700 mb-2">
                      <strong>Paredes:</strong> {isoResult.input?.walls?.length}
                      <br />
                      <strong>Aberturas:</strong> {isoResult.input?.openings?.length}
                    </div>
                    <div className="text-sm text-gray-700 mb-2">
                      <strong>Coordenadas:</strong> {JSON.stringify(isoResult.input?.wallCoordinates)}
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="border border-gray-200">
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold text-gray-900">Estado de Fachadas</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {isoResult.input?.walls?.length > 0 ? (
                          isoResult.input.walls.map((wall: any, idx: number) => (
                            <div key={wall.id || idx} className="flex items-center gap-3 border-b border-gray-100 py-2">
                              <span className="font-bold text-blue-700">🧱 Fachada {idx + 1}</span>
                              <span className="ml-2 text-gray-700">Estado: <span className="font-semibold">{wall.currentCondition}</span></span>
                              <span className="ml-2 text-gray-700">Rw: <span className="font-semibold">{wall.template?.weightedIndex?.Rw ?? '-'}</span> dB</span>
                              <span className="ml-2 text-gray-700">Área: <span className="font-semibold">{wall.area?.toFixed(2) ?? '-'}</span> m²</span>
                            </div>
                          ))
                        ) : (
                          <div className="text-gray-400">No hay fachadas registradas.</div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border border-gray-200">
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold text-gray-900">Estado de Puertas y Ventanas</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {isoResult.input?.openings?.length > 0 ? (
                          isoResult.input.openings.map((opening: any, idx: number) => (
                            <div key={opening.id || idx} className="flex items-center gap-3 border-b border-gray-100 py-2">
                              <span className="font-bold text-orange-700">{opening.type === 'door' ? '🚪 Puerta' : '🪟 Ventana'} {idx + 1}</span>
                              <span className="ml-2 text-gray-700">Estado: <span className="font-semibold">{opening.currentCondition}</span></span>
                              <span className="ml-2 text-gray-700">Rw: <span className="font-semibold">{opening.template?.weightedIndex?.Rw ?? '-'}</span> dB</span>
                              <span className="ml-2 text-gray-700">Área: <span className="font-semibold">{(opening.width * opening.height)?.toFixed(2) ?? '-'}</span> m²</span>
                            </div>
                          ))
                        ) : (
                          <div className="text-gray-400">No hay puertas ni ventanas registradas.</div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : (
              <div className="text-gray-500 text-lg mt-10">No hay resultados ISO disponibles.</div>
            )}
             <Button onClick={handleCalculateInsulation} className="mt-4">Calculate Insulation (Eliminar)</Button> 
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[1200px] w-full max-h-[96vh] p-0 bg-white border border-gray-200 shadow-2xl">
        <div className="flex h-[96vh]">
          {/* MENÚ LATERAL */}
          <div className="w-80 min-w-72 max-w-80 bg-gray-50 border-r border-gray-200 flex flex-col shrink-0">
            {/* Header del menú */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-gray-700" />
                  <div>
                    <h1 className="text-base font-semibold text-gray-900">Análisis Acústico</h1>
                    <p className="text-xs text-gray-500">
                      {analysisData.summary.totalWalls} paredes - {analysisData.summary.totalArea.toFixed(1)}m²
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="h-7 w-7 p-0 hover:bg-gray-200"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Lista de navegación - Optimizada */}
            <nav className="flex-1 p-3 overflow-y-auto">
              <div className="space-y-1">
                {menuItems.map((item) => (
                  <Button
                    key={item.id}
                    variant={activeSection === item.id ? "secondary" : "ghost"}
                    className={`w-full justify-start h-auto p-2.5 text-sm ${
                      activeSection === item.id 
                        ? "bg-white shadow-sm border border-gray-200 text-gray-900" 
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    }`}
                    onClick={() => setActiveSection(item.id)}
                  >
                    <div className="flex items-center gap-2.5 w-full">
                      <div className="shrink-0">{item.icon}</div>
                      <div className="text-left flex-1 min-w-0">
                        <div className="font-medium truncate">{item.label}</div>
                        <div className="text-xs text-gray-500 mt-0.5 truncate">{item.description}</div>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </nav>

            {/* Footer del menú - Compacto */}
            <div className="p-3 border-t border-gray-200">
              <div className="text-xs text-gray-500 space-y-0.5">
                <p>Generado: {new Date().toLocaleDateString()}</p>
                <p>Versión: 3.0.0</p>
              </div>
            </div>
          </div>

          {/* CONTENIDO PRINCIPAL */}
          <div className="flex-1 min-w-0 overflow-y-auto">
            <div className="w-full h-full p-6 bg-white">
              {renderContent()}
            </div>
          </div>         
        </div>
      </DialogContent>
    </Dialog>
  );
};