import React from 'react';
import { motion } from 'framer-motion';
import { availableBadges } from '../../data/establishments';
import { LinearProgress } from '../progress/LinearProgress';

export const DistinctionsView: React.FC = () => {
  const earnedBadges = availableBadges.filter(badge => badge.earned);
  const availableToEarn = availableBadges.filter(badge => !badge.earned);

  return (
    <div className="space-y-6">
      {/* Insignias Obtenidas */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Distinciones Obtenidas</h3>
            <p className="text-sm text-gray-600">Reconocimientos por excelencia en control acústico</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="text-2xl font-bold text-gray-900">{earnedBadges.length}</div>
            <div className="text-sm text-gray-600">de {availableBadges.length}</div>
          </div>
        </div>

        {earnedBadges.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {earnedBadges.map((badge) => (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`relative ${badge.bgColor} ${badge.borderColor} border-2 rounded-xl p-6 text-center hover:shadow-lg transition-all duration-200`}
              >
                {/* Badge Icon */}
                <div className="text-4xl mb-3">{badge.icon}</div>
                
                {/* Badge Info */}
                <h4 className={`font-bold text-lg ${badge.color} mb-2`}>{badge.name}</h4>
                <p className="text-sm text-gray-600 mb-3">{badge.description}</p>
                
                {/* Achievement Details */}
                <div className="bg-white bg-opacity-60 rounded-lg p-3 mb-3">
                  <div className="text-xs text-gray-500 mb-1">Requisito:</div>
                  <div className="text-sm font-medium text-gray-700">{badge.requirement}</div>
                </div>
                
                {badge.earnedDate && (
                  <div className="text-xs text-gray-500">
                    Obtenida: {new Date(badge.earnedDate).toLocaleDateString('es-CO', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                )}

                {/* Ribbon */}
                <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                  ✓
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">🏅</div>
            <h4 className="font-semibold text-gray-900 mb-2">¡Comienza tu colección!</h4>
            <p className="text-gray-600">Cumple los requisitos para obtener tu primera distinción.</p>
          </div>
        )}
      </div>

      {/* Insignias Por Obtener */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Próximas Distinciones</h3>
          <p className="text-sm text-gray-600">Trabaja hacia estos reconocimientos</p>
        </div>

        {availableToEarn.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableToEarn.map((badge) => (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative bg-gray-50 border-2 border-gray-200 rounded-xl p-6 text-center opacity-75 hover:opacity-90 transition-all duration-200"
              >
                {/* Badge Icon - Grayscale */}
                <div className="text-4xl mb-3 grayscale">{badge.icon}</div>
                
                {/* Badge Info */}
                <h4 className="font-bold text-lg text-gray-600 mb-2">{badge.name}</h4>
                <p className="text-sm text-gray-500 mb-3">{badge.description}</p>
                
                {/* Achievement Requirements */}
                <div className="bg-white rounded-lg p-3 mb-3">
                  <div className="text-xs text-gray-400 mb-1">Para obtener:</div>
                  <div className="text-sm font-medium text-gray-600">{badge.requirement}</div>
                </div>

                <div className="text-xs text-gray-400">
                  🔒 Requisito no cumplido
                </div>

                {/* Lock overlay */}
                <div className="absolute top-2 right-2 text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">🎉</div>
            <h4 className="font-semibold text-gray-900 mb-2">¡Colección Completa!</h4>
            <p className="text-gray-600">Has obtenido todas las distinciones disponibles.</p>
          </div>
        )}
      </div>

      {/* Estadísticas de progreso */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Progreso General</h3>
        
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Distinciones Completadas</span>
            <span className="text-sm text-gray-600">{earnedBadges.length}/{availableBadges.length}</span>
          </div>
          <LinearProgress 
            percentage={(earnedBadges.length / availableBadges.length) * 100} 
            color="green"
            height="h-3"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div className="p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{earnedBadges.length}</div>
            <div className="text-sm text-yellow-700">Obtenidas</div>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{availableToEarn.length}</div>
            <div className="text-sm text-blue-700">Por Obtener</div>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{Math.round((earnedBadges.length / availableBadges.length) * 100)}%</div>
            <div className="text-sm text-green-700">Completado</div>
          </div>
        </div>
      </div>
    </div>
  );
};
