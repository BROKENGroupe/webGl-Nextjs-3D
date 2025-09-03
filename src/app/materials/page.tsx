'use client';

import React, { useState, useMemo } from 'react';
import { Search, Filter, Eye, BarChart3, Info, Waves } from 'lucide-react';

// Simulación de los datos importados del archivo materials.ts
const ACOUSTIC_MATERIAL_PROPERTIES = {
  CONCRETE_WALL: {
    density: 2400,
    acoustic_indices:
      [
        {
          frecuency: 125,
          value_R: 0.1
        },
        {
          frecuency: 250,
          value_R: 0.25
        },
        {
          frecuency: 500,
          value_R: 0.5
        },
        {
          frecuency: 1000,
          value_R: 0.1
        },
        {
          frecuency: 2000,
          value_R: 0.1
        },
        {
          frecuency: 4000,
          value_R: 0.1
        }
      ],
    is_active: true,
    picture: null,
    rw: 45,
  },
};

 interface acusticIndex {
  frecuency: number;
  value_R: number;
}

const MATERIAL_CATEGORIES = {
  WALLS: ['CONCRETE_WALL', 'BRICK_WALL', 'DRYWALL_SINGLE'],
  FLOORS: ['CONCRETE_FLOOR', 'WOOD_FLOOR'],
  DOORS: ['WOOD_DOOR_SOLID', 'METAL_DOOR'],
  WINDOWS: ['SINGLE_GLAZING', 'DOUBLE_GLAZING']
};

const FREQUENCY_BANDS = [125, 250, 500, 1000, 2000, 4000];

const MaterialsViewer = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'table'
  type MaterialDetail = typeof ACOUSTIC_MATERIAL_PROPERTIES[keyof typeof ACOUSTIC_MATERIAL_PROPERTIES] & { key: string } | null;
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialDetail>(null);

  // Función para obtener el nombre legible del material
  const getMaterialName = (key: string) => {
    const names: Record<string, string> = {
      CONCRETE_WALL: 'Pared de Concreto',
      BRICK_WALL: 'Pared de Ladrillo',
      DRYWALL_SINGLE: 'Drywall Simple',
      CONCRETE_FLOOR: 'Piso de Concreto',
      WOOD_FLOOR: 'Piso de Madera',
      WOOD_DOOR_SOLID: 'Puerta de Madera Sólida',
      METAL_DOOR: 'Puerta Metálica',
      SINGLE_GLAZING: 'Vidrio Simple',
      DOUBLE_GLAZING: 'Vidrio Doble'
    };
    return names[key as keyof typeof names] ?? key;
  };

  // Función para obtener la categoría de un material
  const getMaterialCategory = (materialKey: string) => {
    for (const [category, materials] of Object.entries(MATERIAL_CATEGORIES)) {
      if (materials.includes(materialKey)) {
        return category;
      }
    }
    return 'OTHER';
  };

  // Función para obtener el color de la categoría
  const getCategoryColor = (
    category: 'WALLS' | 'FLOORS' | 'DOORS' | 'WINDOWS' | 'OTHER' | string
  ) => {
    const colors: Record<'WALLS' | 'FLOORS' | 'DOORS' | 'WINDOWS' | 'OTHER', string> = {
      WALLS: 'bg-blue-100 text-blue-800',
      FLOORS: 'bg-green-100 text-green-800',
      DOORS: 'bg-yellow-100 text-yellow-800',
      WINDOWS: 'bg-purple-100 text-purple-800',
      OTHER: 'bg-gray-100 text-gray-800'
    };
    return colors[category as keyof typeof colors] ?? colors.OTHER;
  };

  // Filtrar materiales
  const filteredMaterials = useMemo(() => {
    return Object.entries(ACOUSTIC_MATERIAL_PROPERTIES).filter(([key, material]) => {
      const matchesSearch = getMaterialName(key).toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'ALL' || getMaterialCategory(key) === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory]);

  // Componente para mostrar gráfico de absorción
  const AbsorptionChart = ({ absorption, title }: { absorption: acusticIndex[]; title: string }) => {
    const maxValue = Math.max(...absorption.map(a => a.value_R));
    return (
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="text-sm font-medium text-gray-700 mb-3">{title}</h4>
        <div className="flex items-end space-x-1 h-20">
          {absorption.map((value, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div
                className="w-full bg-blue-500 rounded-t"
                style={{ height: `${(value.value_R / maxValue) * 100}%` }}
              />
              <span className="text-xs text-gray-500 mt-1">
                {FREQUENCY_BANDS[index]}
              </span>
              <span className="text-xs font-medium">
                {value.value_R.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Componente Card para vista de tarjetas
  const MaterialCard = ({
    materialKey,
    material
  }: {
    materialKey: string;
    material: typeof ACOUSTIC_MATERIAL_PROPERTIES[keyof typeof ACOUSTIC_MATERIAL_PROPERTIES];
  }) => {
    const category = getMaterialCategory(materialKey);
    return (
      <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-200">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {getMaterialName(materialKey)}
              </h3>
              <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(category)}`}>
                {category}
              </span>
            </div>
            <button
              onClick={() => setSelectedMaterial({ key: materialKey, ...material })}
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
            {/* <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-500 uppercase tracking-wide">NRC</p>
              <p className="text-xl font-bold text-gray-900">{material.nrc.toFixed(2)}</p>
            </div> */}
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Densidad</p>
              <p className="text-sm font-semibold text-gray-900">{material.density} kg/m³</p>
            </div>
            {/* <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Espesor</p>
              <p className="text-sm font-semibold text-gray-900">{(material.thickness * 1000).toFixed(1)} mm</p>
            </div> */}
          </div>

          <AbsorptionChart absorption={material.acoustic_indices} title="Coeficientes de Absorción" />
        </div>
      </div>
    );
  };

  // Modal de detalles
  const MaterialDetailModal = () => {
    if (!selectedMaterial) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                {getMaterialName(selectedMaterial.key)}
              </h2>
              <button
                onClick={() => setSelectedMaterial(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Propiedades principales */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Info className="mr-2" size={20} />
                  Propiedades Físicas
                </h3>
                {/* <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Masa Superficial:</span>
                    <span className="font-medium">{selectedMaterial.surfaceMass} kg/m²</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Espesor:</span>
                    <span className="font-medium">{(selectedMaterial.thickness * 1000).toFixed(1)} mm</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Densidad:</span>
                    <span className="font-medium">{selectedMaterial.density} kg/m³</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Porosidad:</span>
                    <span className="font-medium">{selectedMaterial.porosity}%</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Tortuosidad:</span>
                    <span className="font-medium">{selectedMaterial.tortuosity}</span>
                  </div>
                </div> */}
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
                    <span className="font-medium">{selectedMaterial.rw} dB</span>
                  </div>
                  {/* <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">C (Término espectral):</span>
                    <span className="font-medium">{selectedMaterial.c} dB</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Ctr (Término espectral):</span>
                    <span className="font-medium">{selectedMaterial.ctr} dB</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">NRC:</span>
                    <span className="font-medium">{selectedMaterial.nrc.toFixed(3)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Resistividad al flujo:</span>
                    <span className="font-medium">{selectedMaterial.flowResistivity} Pa·s/m²</span>
                  </div> */}
                </div>
              </div>
            </div>

            {/* Gráficos */}
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AbsorptionChart
                absorption={selectedMaterial.acoustic_indices}
                title="Coeficientes de Absorción por Frecuencia"
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Biblioteca de Materiales Acústicos
          </h1>
          <p className="text-gray-600">
            Propiedades según norma ISO 12354-4 para cálculos acústicos en recintos 3D
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar materiales..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center space-x-2">
              <Filter size={20} className="text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="ALL">Todas las categorías</option>
                <option value="WALLS">Paredes</option>
                <option value="FLOORS">Suelos</option>
                <option value="DOORS">Puertas</option>
                <option value="WINDOWS">Ventanas</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('cards')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${viewMode === 'cards'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                Tarjetas
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${viewMode === 'table'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                Tabla
              </button>
            </div>
          </div>
        </div>

        {/* Results count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Mostrando {filteredMaterials.length} material{filteredMaterials.length !== 1 ? 'es' : ''}
          </p>
        </div>

        {/* Materials Grid/Table */}
        {viewMode === 'cards' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMaterials.map(([key, material]) => (
              <MaterialCard key={key} materialKey={key} material={material} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Material
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Categoría
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rw (dB)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      NRC
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Densidad
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredMaterials.map(([key, material]) => {
                    const category = getMaterialCategory(key);
                    return (
                      <tr key={key} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {getMaterialName(key)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(category)}`}>
                            {category}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {material.rw}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {material.density} kg/m³
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => setSelectedMaterial({ key, ...material })}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Eye size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty state */}
        {filteredMaterials.length === 0 && (
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
        )}

        {/* Detail Modal */}
        <MaterialDetailModal />
      </div>
    </div>
  );
};

export default MaterialsViewer;