// components/MaterialDetailModal.tsx
import React, { useEffect } from 'react';
import { Info, Waves } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MaterialDetail } from '../types/materials';
import { getMaterialName } from '../utils/materials';

interface MaterialDetailModalProps {
  material: MaterialDetail | null;
  onClose: () => void;
}

export const MaterialDetailModal: React.FC<MaterialDetailModalProps> = ({ 
  material, 
  onClose 
}) => {
  // Cerrar modal con Escape
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

  // Preparar datos para el gráfico de líneas
  const chartData = material.acoustic_indices.map(index => ({
    frequency: index.frequency,
    value_R: index.value_R,
    frequencyLabel: `${index.frequency} Hz`
  }));

  // Manejar click en backdrop
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
     className="fixed inset-0 backdrop-blur-md flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              {getMaterialName(material.reference)}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl hover:bg-gray-100 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Propiedades físicas */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Info className="mr-2" size={20} />
                Propiedades Físicas
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Densidad:</span>
                  <span className="font-medium">{material.density} kg/m³</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Estado:</span>
                  <span className="font-medium">
                    {material.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              </div>
            </div>

            {/* Propiedades acústicas */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Waves className="mr-2" size={20} />
                Propiedades Acústicas
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Rw (Índice de reducción):</span>
                  <span className="font-medium">{material.rw} dB</span>
                </div>
              </div>
            </div>
          </div>

          {/* Gráfico de barras existente */}
          <div className="mt-8">

            {/* Nuevo gráfico de líneas */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-3">
                Coeficientes de Absorción (Línea)
              </h4>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="frequency"
                      tick={{ fontSize: 12 }}
                      axisLine={{ stroke: '#e5e7eb' }}
                      tickLine={{ stroke: '#e5e7eb' }}
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      axisLine={{ stroke: '#e5e7eb' }}
                      tickLine={{ stroke: '#e5e7eb' }}
                    />
                    <Tooltip 
                      labelFormatter={(value) => `${value} Hz`}
                      formatter={(value: number) => [value.toFixed(3), 'Value R']}
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '12px'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="value_R" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2, fill: 'white' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};