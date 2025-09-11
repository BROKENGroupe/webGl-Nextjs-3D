// components/EmptyState.tsx
import React from 'react';
import { BarChart3, Plus } from 'lucide-react';

interface EmptyStateProps {
  onCreateNew: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onCreateNew }) => {
  return (
    <div className="text-center py-16 border-2 border-dashed border-gray-300 rounded-lg">
      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100">
        <BarChart3 size={32} className="text-gray-400" />
      </div>
      <h3 className="mt-6 text-lg font-medium text-gray-900">
        No se encontraron materiales
      </h3>
      <p className="mt-1 text-sm text-gray-500">
        Comienza creando un nuevo material para ver tus datos aquí.
      </p>
      <div className="mt-6">
        <button
          type="button"
          onClick={onCreateNew}
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus size={20} className="-ml-1 mr-2" />
          Crear Nuevo Material
        </button>
      </div>
    </div>
  );
};
