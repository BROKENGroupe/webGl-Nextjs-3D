import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [showEstablishmentForm, setShowEstablishmentForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    address: '',
    capacity: '',
    description: ''
  });

  const steps = [
    {
      title: "Bienvenido al Control Acústico",
      description: "Gestiona y monitorea el rendimiento acústico de tus establecimientos con tecnología ISO 12354-4.",
      icon: "🎵",
      content: (
        <div className="space-y-4">
          <p className="text-gray-600">
            Nuestra plataforma te permite realizar análisis detallados de aislamiento sonoro,
            cumplir con normativas internacionales y optimizar el rendimiento acústico.
          </p>
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">Características principales:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Análisis en tiempo real según ISO 12354-4</li>
              <li>• Visualización 3D interactiva</li>
              <li>• Sistema de distinciones y logros</li>
              <li>• Reportes de cumplimiento automatizados</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      title: "Establecimientos & Estudios",
      description: "Organiza tus espacios y realiza estudios acústicos profesionales.",
      icon: "🏢",
      content: (
        <div className="space-y-4">
          <p className="text-gray-600">
            Cada establecimiento puede tener múltiples estudios acústicos. Monitorea
            métricas clave como STC, IIC y cumplimiento ISO.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-50 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">STC</div>
              <div className="text-sm text-green-700">Sound Transmission Class</div>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-purple-600">IIC</div>
              <div className="text-sm text-purple-700">Impact Insulation Class</div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Barras de Progreso Interactivas",
      description: "Información detallada al pasar el mouse sobre las métricas.",
      icon: "📊",
      content: (
        <div className="space-y-4">
          <p className="text-gray-600">
            Las barras de progreso muestran popovers con información detallada, 
            recomendaciones y análisis cuando pasas el mouse sobre ellas.
          </p>
          <div className="space-y-3">
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">ISO Compliance</span>
                <span className="text-sm text-gray-600">92%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '92%' }}></div>
              </div>
              <p className="text-xs text-green-600 mt-1">💡 Pasa el mouse para ver recomendaciones</p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Sistema de Distinciones",
      description: "Gana insignias por excelencia en control acústico y cumplimiento normativo.",
      icon: "🏆",
      content: (
        <div className="space-y-4">
          <p className="text-gray-600">
            Nuestro sistema gamificado te motiva a mantener altos estándares acústicos
            y cumplir con las normativas internacionales.
          </p>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
              <span className="text-2xl">🏆</span>
              <div>
                <div className="font-semibold text-yellow-800">Excelencia Acústica ISO</div>
                <div className="text-sm text-yellow-700">Cumplimiento ≥ 95% por 6 meses</div>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
              <span className="text-2xl">🔇</span>
              <div>
                <div className="font-semibold text-blue-800">Maestro del Aislamiento</div>
                <div className="text-sm text-blue-700">STC Rating ≥ 58 dB consistente</div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "¡Comienza Ahora!",
      description: "Todo listo para comenzar tu análisis acústico profesional.",
      icon: "🚀",
      content: (
        <div className="space-y-4">
          <p className="text-gray-600">
            Tienes acceso completo a todas las herramientas. Comienza creando tu primer
            establecimiento o importando datos existentes.
          </p>
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">Próximos pasos:</h4>
            <ol className="text-sm text-gray-700 space-y-1">
              <li>1. Crear tu primer establecimiento</li>
              <li>2. Configurar parámetros acústicos</li>
              <li>3. Realizar análisis inicial ISO 12354-4</li>
              <li>4. Visualizar resultados en 3D</li>
            </ol>
          </div>
        </div>
      )
    }
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Cuando llegue al último paso, mostrar formulario
      setShowEstablishmentForm(true);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Nuevo establecimiento:', formData);
    // Aquí puedes agregar la lógica para guardar el establecimiento
    onClose();
  };

  const backToTutorial = () => {
    setShowEstablishmentForm(false);
  };

  const currentStepData = steps[currentStep];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-opacity-50 backdrop-blur-sm"
            onClick={onClose}
          />
          
          {/* Modal */}
          <div className="flex min-h-full items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden"
            >
              {!showEstablishmentForm ? (
                <>
                  {/* Header con progreso */}
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <span className="text-3xl">{currentStepData.icon}</span>
                        <div>
                          <h2 className="text-xl font-bold">{currentStepData.title}</h2>
                          <p className="text-blue-100 text-sm">{currentStepData.description}</p>
                        </div>
                      </div>
                      <button
                        onClick={onClose}
                        className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    
                    {/* Progress bar */}
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-blue-100">
                        {currentStep + 1} de {steps.length}
                      </span>
                      <div className="flex-1 bg-blue-400 bg-opacity-30 rounded-full h-2">
                        <div 
                          className="bg-white h-2 rounded-full transition-all duration-300 ease-out"
                          style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <motion.div
                      key={currentStep}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      {currentStepData.content}
                    </motion.div>

                    {/* Navigation */}
                    <div className="flex justify-between items-center mt-8">
                      <div className="flex space-x-1">
                        {steps.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentStep(index)}
                            className={`w-2 h-2 rounded-full transition-colors ${
                              index === currentStep ? 'bg-blue-600' : 
                              index < currentStep ? 'bg-green-500' : 'bg-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      
                      <div className="flex space-x-3">
                        {currentStep > 0 && (
                          <button
                            onClick={prevStep}
                            className="px-4 py-2 text-white bg-gray-900 hover:bg-black rounded-lg transition-colors flex items-center"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Anterior
                          </button>
                        )}
                        
                        <button
                          onClick={nextStep}
                          className="px-6 py-2 bg-gray-900 hover:bg-black text-white rounded-lg transition-colors flex items-center"
                        >
                          {currentStep === steps.length - 1 ? (
                            <>
                              ¡Comenzar!
                              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                              </svg>
                            </>
                          ) : (
                            <>
                              Siguiente
                              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Skip option */}
                    <div className="text-center mt-4">
                      <button
                        onClick={onClose}
                        className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        Saltar tutorial
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Formulario de creación de establecimiento */}
                  <div className="bg-gradient-to-r from-green-600 to-blue-600 p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-3xl">🏢</span>
                        <div>
                          <h2 className="text-xl font-bold">Crear tu Primer Establecimiento</h2>
                          <p className="text-green-100 text-sm">Completa la información básica</p>
                        </div>
                      </div>
                      <button
                        onClick={onClose}
                        className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nombre del Establecimiento *
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          placeholder="Ej: Club Nocturno Aurora"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tipo de Establecimiento *
                        </label>
                        <select
                          name="type"
                          value={formData.type}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          required
                        >
                          <option value="">Selecciona un tipo</option>
                          <option value="nightclub">🎵 Discoteca</option>
                          <option value="restaurant">🍽️ Restaurante</option>
                          <option value="bar">🍺 Bar</option>
                          <option value="event_hall">🎉 Salón de Eventos</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Dirección *
                        </label>
                        <input
                          type="text"
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          placeholder="Ej: Calle 85 #15-30, Zona Rosa, Bogotá"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Capacidad (personas)
                        </label>
                        <input
                          type="number"
                          name="capacity"
                          value={formData.capacity}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          placeholder="Ej: 250"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Descripción (opcional)
                        </label>
                        <textarea
                          name="description"
                          value={formData.description}
                          onChange={handleInputChange}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                          placeholder="Describe tu establecimiento..."
                        />
                      </div>

                      <div className="flex justify-between space-x-3 pt-4">
                        <button
                          type="button"
                          onClick={backToTutorial}
                          className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                          Volver al Tutorial
                        </button>
                        
                        <button
                          type="submit"
                          className="px-6 py-2 bg-gray-900 hover:bg-black text-white rounded-lg transition-colors flex items-center"
                        >
                          Crear Establecimiento
                          <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        </button>
                      </div>
                    </form>

                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2 flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Información
                      </h4>
                      <p className="text-sm text-blue-800">
                        Después de crear tu establecimiento, podrás configurar parámetros acústicos detallados,
                        realizar estudios ISO 12354-4 y visualizar el espacio en 3D.
                      </p>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};
