// components/EmptyState.tsx
import React from 'react';
import { BarChart3 } from 'lucide-react';

export const EmptyState: React.FC = () => {
  return (
    <div className="text-center py-12">
      <div className="text-gray-400 mb-4">
        <BarChart3 size={64} className="mx-auto" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        No se encontraron materiales
      </h3>
      <p className="text-gray-600">
        Intenta ajustar los filtros de búsqueda
      </p>
    </div>
  );
};