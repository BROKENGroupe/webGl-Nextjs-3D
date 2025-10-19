import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Place } from "../../types";
import { establishmentTypes, statusConfig } from "../../data/establishments";
import { LinearProgress } from "../progress/LinearProgress";

interface DetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  place: Place | null;
}

export const DetailsModal: React.FC<DetailsModalProps> = ({
  isOpen,
  onClose,
  place,
}) => {
  if (!place) return null;

  const typeInfo =
    establishmentTypes[place.category.name as keyof typeof establishmentTypes];
  const statusInfo = statusConfig[place.status as keyof typeof statusConfig];

  const stcValue = Number(place.acousticProfile.soundTransmissionLoss);
  const stcPercent =
    !isNaN(stcValue) && stcValue > 0 ? Math.min((stcValue / 60) * 100, 100) : 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <div className="flex min-h-full items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl bg-white rounded-xl shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={place.image}
                  alt={place.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                {/* Close button */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 bg-black bg-opacity-30 hover:bg-opacity-50 text-white rounded-full transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>

                {/* Title and badges */}
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-2">
                        {place.name}
                      </h2>
                      <p className="text-white/90">{place.address}</p>
                    </div>
                    <div className="flex flex-col space-y-2">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${typeInfo.bg} ${typeInfo.color}`}
                      >
                        {typeInfo.icon} {typeInfo.label}
                      </span>
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusInfo.bg} ${statusInfo.color}`}
                      >
                        <div
                          className={`w-2 h-2 rounded-full ${statusInfo.dot} mr-2`}
                        />
                        {statusInfo.label}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Main metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-blue-50 rounded-xl p-6 text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      {place.complianceScore}%
                    </div>
                    <div className="text-sm text-blue-700 mb-4">
                      Cumplimiento ISO 12354-4
                    </div>
                    <LinearProgress
                      percentage={place.complianceScore}
                      color={
                        place.complianceScore >= 85
                          ? "black"
                          : place.complianceScore >= 70
                          ? "blue"
                          : "gray"
                      }
                      height="h-2"
                    />
                  </div>

                  <div className="bg-green-50 rounded-xl p-6 text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      {place.acousticProfile.soundTransmissionLoss} dB
                    </div>
                    <div className="text-sm text-green-700 mb-4">
                      Aislamiento STC
                    </div>
                    <LinearProgress
                      percentage={Math.min(
                        (place.acousticProfile.soundTransmissionLoss / 60) *
                          100,
                        100
                      )}
                      color="blue"
                      height="h-2"
                    />
                  </div>

                  <div className="bg-purple-50 rounded-xl p-6 text-center">
                    <div className="text-3xl font-bold text-purple-600 mb-2">
                      {place.noiseImpactExternal} dB
                    </div>
                    <div className="text-sm text-purple-700 mb-4">
                      Reducción Externa
                    </div>
                    <LinearProgress
                      percentage={
                        place.noiseImpactExternal > 30
                          ? 90
                          : (place.noiseImpactExternal / 30) * 100
                      }
                      color="blue"
                      height="h-2"
                    />
                  </div>
                </div>

                {/* Additional metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-orange-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-orange-800 mb-4">
                      Perfil Acústico
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-700">
                            Aislamiento Aéreo
                          </span>
                          <span className="text-sm text-gray-600">
                            {place.acousticProfile.airborneSoundInsulation} dB
                          </span>
                        </div>
                        <LinearProgress
                          percentage={Math.min(
                            (place.acousticProfile.airborneSoundInsulation /
                              60) *
                              100,
                            100
                          )}
                          color="blue"
                          height="h-2"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-700">
                            Aislamiento Impacto (IIC)
                          </span>
                          <span className="text-sm text-gray-600">
                            {place.acousticProfile.impactSoundInsulation} dB
                          </span>
                        </div>
                        <LinearProgress
                          percentage={stcPercent}
                          color="blue"
                          height="h-2"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      Estudios Realizados
                    </h3>
                    <div className="space-y-3">
                      {place.simulations.map((study, index) => (
                        <div
                          key={study.id}
                          className="flex items-start space-x-3 p-3 bg-white rounded-lg"
                        >
                          <div
                            className={`w-2 h-2 rounded-full mt-2 ${
                              study.status === "completed"
                                ? "bg-green-500"
                                : study.status === "in_progress"
                                ? "bg-blue-500"
                                : "bg-gray-400"
                            }`}
                          />
                          <div className="flex-1">
                            <div className="font-medium text-gray-900 text-sm">
                              {study.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {study.date}
                            </div>
                            <div className="text-xs text-gray-600 capitalize mt-1">
                              {study.status === "completed"
                                ? "Completado"
                                : study.status === "in_progress"
                                ? "En Progreso"
                                : "Pendiente"}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium text-gray-900">
                              {study.metrics.isoComplianceLevel}%
                            </div>
                            <div className="text-xs text-gray-500">ISO</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    Cerrar
                  </button>
                  <button className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg transition-colors">
                    Ver en 3D
                  </button>
                  <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                    Exportar Informe
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};
