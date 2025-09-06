// components/MaterialCard.tsx
import React from 'react';
import { Eye } from 'lucide-react';
import { MaterialResponse } from '@/services/materialsService';
import { getCategoryColor } from '../utils/materials';

interface MaterialCardProps {
  material: MaterialResponse;
  onViewDetails: (material: MaterialResponse) => void;
}

export const MaterialCard: React.FC<MaterialCardProps> = ({ 
  material, 
  onViewDetails 
}) => {
  const handleViewDetails = () => {
    onViewDetails(material);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-200">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              {material.name}
            </h3>
            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(material.category)}`}>
              {material.category}
            </span>
          </div>
          <button
            onClick={handleViewDetails}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Eye size={20} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Rw (dB)</p>
            <p className="text-xl font-bold text-gray-900">{material.rw}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Densidad</p>
            <p className="text-sm font-semibold text-gray-900">{material.density} kg/m³</p>
          </div>
        </div>

      </div>
    </div>
  );
};
