import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Establishment } from '../../types';
import { LinearProgress } from '../progress/LinearProgress';

interface MetricsPopoverProps {
  establishment: Establishment;
  isOpen: boolean;
  onClose: () => void;
}

export const MetricsPopover: React.FC<MetricsPopoverProps> = ({
  establishment,
  isOpen,
  onClose
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop invisible para cerrar */}
          <div
            className="fixed inset-0 z-40"
            onClick={onClose}
          />
          
          {/* Popover */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="absolute z-50 bottom-full left-0 right-0 mb-2 p-4 bg-white rounded-lg shadow-xl border border-gray-200"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-semibold text-gray-900 text-sm">{establishment.name}</h4>
                <p className="text-xs text-gray-500">Métricas Detalladas</p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Metrics */}
            <div className="space-y-3">
              <div>
                <LinearProgress 
                  percentage={establishment.compliance_score} 
                  color={
                    establishment.compliance_score >= 85
                      ? 'blue'
                      : establishment.compliance_score >= 70
                        ? 'gray'
                        : 'black'
                  }                  
                  height="h-2"
                />
              </div>
              
              <div>
                <LinearProgress 
                  percentage={Math.min((establishment.acousticProfile.sound_transmission_loss / 60) * 100, 100)} 
                  color="blue"                  
                  height="h-2"
                />
              </div>
              
              <div>
                <LinearProgress 
                  percentage={Math.min((establishment.acousticProfile.impact_sound_insulation / 70) * 100, 100)} 
                  color="gray"                 
                  height="h-2"
                />
              </div>
              
              <div>
                <LinearProgress 
                  percentage={establishment.noise_impact_external > 30 ? 90 : (establishment.noise_impact_external / 30) * 100} 
                  color="blue"                  
                  height="h-2"
                />
              </div>
            </div>

            {/* Footer info */}
            <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
              <p>💡 Pasa el mouse sobre las barras de progreso para más detalles</p>
            </div>

            {/* Arrow */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white" />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
