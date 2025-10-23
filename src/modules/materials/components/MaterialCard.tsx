// components/MaterialCard.tsx
import React from 'react';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import { MaterialResponse } from '@/services/materialsService';
import { getCategoryColor } from '../utils/materials';
//import { Material } from '../types/materials';

interface MaterialCardProps {
  material: any;
  onViewDetails: (material: any) => void;
  onEdit: (material: any) => void;
  onDelete: (material: any) => void;
}

export const MaterialCard: React.FC<MaterialCardProps> = ({ 
  material, 
  onViewDetails, 
  onEdit,
  onDelete
}) => {
  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-200 flex flex-col">
      <div className="p-6 flex-grow">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 mb-2 truncate" title={material.name}>
              {material.name}
            </h3>
            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(material.type)}`}>
              {material.type}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          {/* <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Rw (dB)</p>
            <p className="text-xl font-bold text-gray-900">{material.rw}</p>
          </div> */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Densidad</p>
            <p className="text-sm font-semibold text-gray-900">{material.density} kg/m³</p>
          </div>
        </div>
        <p className="text-sm text-gray-600 line-clamp-2" title={material.description}>
          {material.description}
        </p>
      </div>
      <div className="p-4 bg-gray-50 border-t border-gray-200 rounded-b-xl">
        <div className="flex items-center justify-end space-x-4">
            <button
              onClick={() => onViewDetails(material)}
              className="flex items-center text-sm text-gray-600 hover:text-blue-600 transition-colors"
              title="Ver Detalles"
            >
              <Eye size={18} className="mr-1"/> Ver
            </button>
            <button
              onClick={() => onEdit(material)}
              className="flex items-center text-sm text-gray-600 hover:text-green-600 transition-colors"
              title="Editar Material"
            >
              <Pencil size={18} className="mr-1"/> Editar
            </button>
            <button
              onClick={() => onDelete(material)}
              className="flex items-center text-sm text-gray-600 hover:text-red-600 transition-colors"
              title="Eliminar Material"
            >
              <Trash2 size={18} className="mr-1"/> Eliminar
            </button>
        </div>
      </div>
    </div>
  );
};