// components/MaterialsFilters.tsx
import React from 'react';
import { Search, Filter, Plus } from 'lucide-react';
//import { MaterialType, ViewMode } from '../types/materials';

interface MaterialsFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedCategory: any;
  onCategoryChange: (category: any) => void;
  viewMode: any;
  onViewModeChange: (mode: any) => void;
  onCreateMaterial?: () => void;
}

export const MaterialsFilters: React.FC<MaterialsFiltersProps> = ({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  viewMode,
  onViewModeChange,
  onCreateMaterial
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar materiales..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="flex items-center gap-4">
          {/* Category Filter */}
          <div className="flex items-center space-x-2">
            <Filter size={20} className="text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="ALL">Todas las categorías</option>
              <option value="WALLS">Paredes</option>
              <option value="FLOORS">Suelos</option>
              <option value="DOORS">Puertas</option>
              <option value="WINDOWS">Ventanas</option>
            </select>
          </div>

          {/* Create Material Button */}
          {onCreateMaterial && (
            <button
              onClick={onCreateMaterial}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Plus size={16} className="mr-2" />
              Crear Material
            </button>
          )}

          {/* View Mode Toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => onViewModeChange('cards')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'cards'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Tarjetas
            </button>
            <button
              onClick={() => onViewModeChange('table')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'table'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Tabla
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};