// components/MaterialsTable.tsx
import React from 'react';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import { MaterialResponse } from '@/services/materialsService';
import { getCategoryColor } from '../utils/materials';
import { Material } from '../types/materials';

interface MaterialsTableProps {
  materials: Material[];
  onViewDetails: (material: Material) => void;
  onEdit: (material: Material) => void;
  onDelete: (material: Material) => void;
}

export const MaterialsTable: React.FC<MaterialsTableProps> = ({ 
  materials, 
  onViewDetails, 
  onEdit,
  onDelete
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Material</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rw (dB)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Densidad</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {materials.map((material) => (
              <tr key={material._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium text-gray-900">{material.name}</div>
                  <div className="text-sm text-gray-500">{material.reference}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(material.type)}`}>
                    {material.type}
                  </span>
                </td>
                {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{material.rw}</td> */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{material.density} kg/m³</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-3">
                    <button
                      onClick={() => onViewDetails(material)}
                      className="text-gray-500 hover:text-blue-600 transition-colors"
                      title="Ver Detalles"
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      onClick={() => onEdit(material)}
                      className="text-gray-500 hover:text-green-600 transition-colors"
                      title="Editar Material"
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={() => onDelete(material)}
                      className="text-gray-500 hover:text-red-600 transition-colors"
                      title="Eliminar Material"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};