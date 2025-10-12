import React from 'react';
import { Establishment } from '../../types';

interface StudyIndicatorProps {
  establishment: Establishment;
  selectedStudyByEstablishment: {[key: string]: number};
  selectStudy: (establishmentId: string, studyIndex: number) => void;
}

export const StudyIndicator: React.FC<StudyIndicatorProps> = ({
  establishment,
  selectedStudyByEstablishment,
  selectStudy
}) => {
  if (establishment.studies.length <= 1) {
    return null;
  }

  const selectedIndex = selectedStudyByEstablishment[establishment.id] || 0;

  return (
    <div className="mb-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-gray-600">Estudios ({establishment.studies.length})</span>
        {establishment.studies.length > 1 && (
          <div className="flex space-x-1">
            {establishment.studies.map((_, index) => (
              <button
                key={index}
                onClick={() => selectStudy(establishment.id, index)}
                className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                  selectedIndex === index 
                    ? 'bg-blue-500' 
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Información del estudio activo */}
      <div className="text-xs text-gray-500 truncate">
        {establishment.studies[selectedIndex]?.name || 'Estudio Principal'}
      </div>
      
      {/* Estado del estudio */}
      <div className="flex items-center mt-1">
        <div className={`w-1.5 h-1.5 rounded-full mr-2 ${
          establishment.studies[selectedIndex]?.status === 'completed' ? 'bg-green-500' :
          establishment.studies[selectedIndex]?.status === 'in_progress' ? 'bg-blue-500' :
          'bg-gray-400'
        }`} />
        <span className="text-xs text-gray-600 capitalize">
          {establishment.studies[selectedIndex]?.status === 'completed' ? 'Completado' :
           establishment.studies[selectedIndex]?.status === 'in_progress' ? 'En Progreso' :
           'Pendiente'}
        </span>
      </div>
    </div>
  );
};