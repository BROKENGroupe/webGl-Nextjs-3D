// components/MaterialDetailModal.tsx
import React, { useEffect } from 'react';
import { Info, Waves, Layers, X, Thermometer, Palette, Flag, BarChart2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Material } from '../types/materials';

interface MaterialDetailModalProps {
  material: Material | null;
  onClose: () => void;
}

const DetailItem = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex justify-between py-2 border-b border-gray-100">
    <span className="text-gray-600">{label}:</span>
    <span className="font-medium text-right">{value}</span>
  </div>
);

export const MaterialDetailModal: React.FC<MaterialDetailModalProps> = ({ 
  material, 
  onClose 
}) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (material) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [material, onClose]);

  if (!material) return null;

  const chartData = Object.entries(material.thirdOctaveBands).map(([freq, val]) => ({
    frequency: parseInt(freq),
    value_R: val,
  }));

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
     className="fixed inset-0 bg-opacity-75 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{material.name}</h2>
            <p className="text-sm text-gray-500">{material.reference}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 w-10 h-10 rounded-full flex items-center justify-center transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center text-gray-800">
                <Info className="mr-2 text-blue-500" size={20} />
                Información General
              </h3>
              <div className="space-y-3">
                <DetailItem label="Descripción" value={material.description} />
                <DetailItem label="Categoría" value={material.type} />
                <DetailItem label="Tipo" value={material.type} />
                <DetailItem label="Subtipo" value={material.subtype} />
                <DetailItem label="Descriptor" value={material.descriptor} />
                <DetailItem label="Catálogo" value={material.catalog} />
                {/* <DetailItem label="Comentarios" value={material.comments} /> */}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center text-gray-800">
                <Thermometer className="mr-2 text-blue-500" size={20} />
                Propiedades Físicas y Geométricas
              </h3>
              <div className="space-y-3">
                <DetailItem label="Densidad" value={`${material.density} kg/m³`} />
                <DetailItem label="Espesor" value={`${material.thickness_mm} mm`} />
                <DetailItem label="Masa superficial" value={`${material.mass_kg_m2} kg/m²`} />
                <DetailItem label="Ancho" value={`${material.width} mm`} />
                <DetailItem label="Alto" value={`${material.height} mm`} />
                <DetailItem label="Offset Inferior" value={`${material.bottomOffset} mm`} />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center text-gray-800">
                <Waves className="mr-2 text-blue-500" size={20} />
                Propiedades Acústicas
              </h3>
              <div className="space-y-3">
                {/* <DetailItem label="Índice de Reducción (Rw)" value={<span className="font-bold text-lg text-blue-600">{material.rw} dB</span>} /> */}
                {material.weightedIndex && (
                  <>
                    <DetailItem label="Adaptador de término C" value={`${material.weightedIndex.C} dB`} />
                    <DetailItem label="Adaptador de término Ctr" value={`${material.weightedIndex.Ctr} dB`} />
                  </>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center text-gray-800">
                <Palette className="mr-2 text-blue-500" size={20} />
                Apariencia
              </h3>
              <div className="space-y-3">
                <DetailItem label="Color" value={material.color} />
                <DetailItem label="Imagen (URL)" value={material.picture} />
                <DetailItem label="Referencia de Imagen" value={material.imageRef} />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center text-gray-800">
                <Flag className="mr-2 text-blue-500" size={20} />
                Flags
              </h3>
              <div className="space-y-3">
                <DetailItem label="Doble Hoja" value={material.doubleLeaf ? 'Sí' : 'No'} />
                <DetailItem label="Elemento Ligero" value={material.lightweightElement ? 'Sí' : 'No'} />
                <DetailItem label="Sobre Bandas Elásticas" value={material.onElasticBands ? 'Sí' : 'No'} />
              </div>
            </div>
          </div>

          {material.layers && material.layers.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4 flex items-center text-gray-800">
                <Layers className="mr-2 text-blue-500" size={20} />
                Capas Constructivas
              </h3>
              <ul className="space-y-2 pl-4 border-l-2 border-blue-200">
                {material.layers.map((layer, index) => (
                  <li key={index} className="text-gray-700">
                    <span className="font-semibold">{layer.name}:</span> {layer.thickness_mm} mm
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {material.octaveBands && material.octaveBands.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4 flex items-center text-gray-800">
                <BarChart2 className="mr-2 text-blue-500" size={20} />
                Bandas de Octava
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {material.octaveBands.map((band, index) => (
                  <div key={index} className="bg-gray-100 p-2 rounded-md text-center">
                    <p className="text-sm font-semibold text-gray-700">{band.range}</p>
                    <p className="text-lg font-bold text-blue-600">{band.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-md font-semibold text-gray-800 mb-4 text-center">
              Curva de Aislamiento Acústico
            </h4>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis 
                    dataKey="frequency"
                    label={{ value: 'Frecuencia (Hz)', position: 'insideBottom', offset: -5, fontSize: 12 }}
                    tick={{ fontSize: 10 }}
                    type="category"
                  />
                  <YAxis 
                    label={{ value: 'Reducción (dB)', angle: -90, position: 'insideLeft', fontSize: 12 }}
                    tick={{ fontSize: 10 }}
                  />
                  <Tooltip 
                    labelFormatter={(value) => `${value} Hz`}
                    formatter={(value: number) => [value.toFixed(1), 'R (dB)']}
                  />
                  <Legend verticalAlign="top" height={36}/>
                  <Line 
                    type="monotone" 
                    dataKey="value_R" 
                    name="Índice de Reducción"
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={{ r: 4, fill: '#3b82f6' }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};