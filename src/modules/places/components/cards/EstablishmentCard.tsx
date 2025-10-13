import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Establishment } from '../../types';
import { establishmentTypes, statusConfig } from '../../data/establishments';
import { LinearProgressWithHover } from '../progress/LinearProgressWithHover';
import { StudyIndicator } from '../indicators/StudyIndicator';
import { MetricsPopover } from '../modals/MetricsPopover';

interface EstablishmentCardProps {
  establishment: Establishment;
  getDisplayMetrics: (establishment: Establishment) => any;
  getActiveStudy: (establishment: Establishment) => any;
  selectStudy: (establishmentId: string, studyIndex: number) => void;
  selectedStudyByEstablishment: {[key: string]: number};
  setShowPopover: (id: string | null) => void;
  showPopover: string | null;
  hoveredProgress: string | null;
  setHoveredProgress: (id: string | null) => void;
}

export const EstablishmentCard: React.FC<EstablishmentCardProps> = ({ 
  establishment,
  getDisplayMetrics,
  getActiveStudy,
  selectStudy,
  selectedStudyByEstablishment,
  setShowPopover,
  showPopover,
  hoveredProgress,
  setHoveredProgress
}) => {
  const router = useRouter();
  const typeInfo = establishmentTypes[establishment.type as keyof typeof establishmentTypes];
  const statusInfo = statusConfig[establishment.status as keyof typeof statusConfig];
  const displayMetrics = getDisplayMetrics(establishment);
  
  // Verificar si tiene estudios
  const hasStudies = establishment.studies && establishment.studies.length > 0;

  const handlerNavigateToEditor = (establishmentId: string) => {
    router.push(`/editor/${establishmentId}`);
  }

  // Datos para los popovers de cada barra de progreso
  const progressData = {
    iso: {
      title: "ISO 12354-4 Compliance",
      value: `${displayMetrics.compliance_score}%`,
      description: `Nivel de cumplimiento con la normativa ISO 12354-4 para aislamiento acústico entre recintos.`,
      recommendation: displayMetrics.compliance_score < 70 ? 
        "Se requieren mejoras en aislamiento para cumplir normativa." : 
        displayMetrics.compliance_score < 85 ? 
        "Buen nivel, considerar optimizaciones menores." : 
        "Excelente cumplimiento, mantener estándares actuales."
    },
    stc: {
      title: "Sound Transmission Class",
      value: `${displayMetrics.sound_transmission_loss} dB`,
      description: `Clasificación de transmisión sonora. Mide la capacidad de un elemento para reducir la transmisión del sonido aéreo.`,
      recommendation: displayMetrics.sound_transmission_loss < 45 ? 
        "Aislamiento insuficiente, implementar mejoras urgentes." : 
        displayMetrics.sound_transmission_loss < 55 ? 
        "Aislamiento aceptable, evaluar mejoras adicionales." : 
        "Excelente aislamiento acústico."
    },
    control: {
      title: "Control de Ruido Externo",
      value: `${displayMetrics.noise_reduction} dB`,
      description: `Reducción del impacto sonoro hacia el exterior. Fundamental para cumplir con regulaciones urbanas.`,
      recommendation: displayMetrics.noise_reduction < 20 ? 
        "Impacto alto, implementar medidas de control inmediatas." : 
        displayMetrics.noise_reduction < 30 ? 
        "Control moderado, considerar mejoras adicionales." : 
        "Excelente control de emisiones sonoras."
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-md relative"
    >
      {/* Imagen del establecimiento */}
      <div className="relative h-32">
        <img 
          src={establishment.image} 
          alt={establishment.name}
          className="w-full h-full object-cover"
        />
        
        {/* Badges flotantes */}
        <div className="absolute top-2 left-2 right-2 flex justify-between items-start">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${typeInfo.bg} ${typeInfo.color} backdrop-blur-sm bg-opacity-90`}>
            {typeInfo.icon} {typeInfo.label}
          </span>
          
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusInfo.bg} ${statusInfo.color} backdrop-blur-sm bg-opacity-90`}>
            <div className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot} mr-1`} />
            {statusInfo.label}
          </span>
        </div>

        {/* Score general en la esquina */}
        <div className="absolute bottom-2 right-2 bg-white bg-opacity-90 backdrop-blur-sm rounded-lg px-2 py-1">
          <div className={`text-xs font-bold ${
            displayMetrics.compliance_score >= 85 ? 'text-green-600' : 
            displayMetrics.compliance_score >= 70 ? 'text-orange-600' : 'text-red-600'
          }`}>
            {displayMetrics.compliance_score}%
          </div>
        </div>
      </div>

      {/* Contenido compacto */}
      <div className="p-3">
        {/* Header */}
        <div className="mb-3">
          <h3 className="font-semibold text-gray-900 text-sm mb-1 truncate">{establishment.name}</h3>
          <p className="text-xs text-gray-600 truncate">{establishment.address}</p>
        </div>

        {/* Indicador de estudios */}
        <StudyIndicator 
          establishment={establishment}
          selectedStudyByEstablishment={selectedStudyByEstablishment}
          selectStudy={selectStudy}
        />

        {/* Barras de progreso lineales con hover popovers */}
        <motion.div 
          className="space-y-3 mb-4 relative"
          key={`${establishment.id}-${selectedStudyByEstablishment[establishment.id] || 0}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <LinearProgressWithHover 
            percentage={displayMetrics.compliance_score} 
            color={displayMetrics.compliance_score >= 85 ? 'green' : displayMetrics.compliance_score >= 70 ? 'orange' : 'red'}
            label="ISO Compliance"
            hoverData={progressData.iso}
            progressId={`${establishment.id}-iso`}
            hoveredProgress={hoveredProgress}
            setHoveredProgress={setHoveredProgress}
          />
          <LinearProgressWithHover 
            percentage={Math.min((displayMetrics.sound_transmission_loss / 60) * 100, 100)} 
            color="blue"
            label="Aislamiento STC"
            hoverData={progressData.stc}
            progressId={`${establishment.id}-stc`}
            hoveredProgress={hoveredProgress}
            setHoveredProgress={setHoveredProgress}
          />
          <LinearProgressWithHover 
            percentage={displayMetrics.noise_reduction > 30 ? 90 : (displayMetrics.noise_reduction / 30) * 100} 
            color="purple"
            label="Control Externo"
            hoverData={progressData.control}
            progressId={`${establishment.id}-control`}
            hoveredProgress={hoveredProgress}
            setHoveredProgress={setHoveredProgress}
          />
        </motion.div>

        {/* Métricas compactas */}
        <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
          <div className="bg-blue-50 rounded p-2 text-center">
            <div className="font-semibold text-blue-900">{displayMetrics.sound_transmission_loss}</div>
            <div className="text-blue-700">dB STC</div>
          </div>
          <div className="bg-green-50 rounded p-2 text-center">
            <div className="font-semibold text-green-900">{displayMetrics.impact_sound_insulation}</div>
            <div className="text-green-700">dB IIC</div>
          </div>
        </div>

        {/* Información del estudio activo */}
        {getActiveStudy(establishment) && establishment.studies.length > 1 && (
          <div className="mb-3 p-2 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-700 truncate">
                {getActiveStudy(establishment).name}
              </span>
              <span className={`text-xs px-1.5 py-0.5 rounded ${
                getActiveStudy(establishment).status === 'completed' ? 'bg-green-100 text-green-700' :
                getActiveStudy(establishment).status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                'bg-gray-100 text-gray-600'
              }`}>
                {getActiveStudy(establishment).status === 'completed' ? '✓' :
                 getActiveStudy(establishment).status === 'in_progress' ? '⏳' : '⏸️'}
              </span>
            </div>
          </div>
        )}

        {/* Botones de acción - Lado a lado, más pequeños y sutiles */}
        <div className="grid grid-cols-2 gap-2">
          {/* Botón dinámico - Ver Métricas o Realizar Estudio */}
          {hasStudies ? (
            <button 
              onClick={() => setShowPopover(showPopover === establishment.id ? null : establishment.id)}
              className="flex items-center justify-center bg-gradient-to-r from-gray-900 to-[#0FA0CE] hover:from-gray-800 hover:to-[#0c8bb0] text-white text-xs font-medium rounded-lg py-2 px-2 transition-colors duration-200"
            >
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Ver Métricas
            </button>
          ) : (
            <button 
              onClick={() => handlerNavigateToEditor(establishment.id)}
              className="flex items-center justify-center bg-gradient-to-r from-gray-900 to-[#0FA0CE] hover:from-gray-800 hover:to-[#0c8bb0] text-white text-xs font-medium rounded-lg py-2 px-2 transition-colors duration-200"
            >
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Realizar Estudio
            </button>
          )}
          
          {/* Botón Ver 3D */}
          <button 
            onClick={() => router.push('/editor')}
            className="flex items-center justify-center bg-gray-900 hover:bg-gray-800 text-white text-xs font-medium rounded-lg py-2 px-2 transition-colors duration-200"
          >
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            Ver 3D
          </button>
        </div>
      </div>

      {/* Popover de métricas */}
      <MetricsPopover 
        establishment={establishment}
        isOpen={showPopover === establishment.id}
        onClose={() => setShowPopover(null)}
      />
    </motion.div>
  );
};

