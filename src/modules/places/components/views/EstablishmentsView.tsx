import React from 'react';
import { EstablishmentCard } from '../cards/EstablishmentCard';
import { establishmentTypes, statusConfig } from '../../data/establishments';

interface EstablishmentsViewProps {
  filteredEstablishments: any[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedType: string;
  setSelectedType: (type: string) => void;
  selectedStatus: string;
  setSelectedStatus: (status: string) => void;
  getDisplayMetrics: (establishment: any) => any;
  getActiveStudy: (establishment: any) => any;
  selectStudy: (establishmentId: string, studyIndex: number) => void;
  selectedStudyByEstablishment: {[key: string]: number};
  setShowPopover: (id: string | null) => void;
  showPopover: string | null;
  hoveredProgress: string | null;
  setHoveredProgress: (id: string | null) => void;
}

export const EstablishmentsView: React.FC<EstablishmentsViewProps> = ({
  filteredEstablishments,
  searchTerm,
  setSearchTerm,
  selectedType,
  setSelectedType,
  selectedStatus,
  setSelectedStatus,
  getDisplayMetrics,
  getActiveStudy,
  selectStudy,
  selectedStudyByEstablishment,
  setShowPopover,
  showPopover,
  hoveredProgress,
  setHoveredProgress
}) => {
  return (
    <>
      {/* Filtros */}
      <div className="bg-gray-50 border-b border-gray-100 px-8 py-3 -mx-8 mb-6">
        <div className="flex space-x-3">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Buscar por nombre o ubicación..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-1 focus:ring-gray-300 focus:border-gray-300 transition-colors placeholder-gray-400"
            />
          </div>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-1 focus:ring-gray-300 text-gray-600"
          >
            <option value="all">Todos los tipos</option>
            {Object.entries(establishmentTypes).map(([key, type]) => (
              <option key={key} value={key}>{type.label}</option>
            ))}
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-1 focus:ring-gray-300 text-gray-600"
          >
            <option value="all">Todos los estados</option>
            {Object.entries(statusConfig).map(([key, status]) => (
              <option key={key} value={key}>{status.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid de establecimientos */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {filteredEstablishments.map((establishment) => (
          <EstablishmentCard 
            key={establishment.id} 
            establishment={establishment}
            getDisplayMetrics={getDisplayMetrics}
            getActiveStudy={getActiveStudy}
            selectStudy={selectStudy}
            selectedStudyByEstablishment={selectedStudyByEstablishment}
            setShowPopover={setShowPopover}
            showPopover={showPopover}
            hoveredProgress={hoveredProgress}
            setHoveredProgress={setHoveredProgress}
          />
        ))}
      </div>
    </>
  );
};
