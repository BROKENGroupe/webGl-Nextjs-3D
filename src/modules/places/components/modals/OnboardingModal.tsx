import React, { useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createPlaceAction } from "@/actions/place/place.actions";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { createPlaceSchema, CreatePlaceSchemaType } from "@/schemas/place.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const steps = [
  {
    title: "Bienvenido al Control Acústico",
    description: "Gestiona y monitorea el rendimiento acústico de tus establecimientos con tecnología ISO 12354-4.",
    icon: "🎵",
    content: (
      <div className="space-y-4">
        <p className="text-gray-600">
          Nuestra plataforma te permite realizar análisis detallados de aislamiento sonoro, cumplir con normativas internacionales y optimizar el rendimiento acústico.
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
    ),
  },
  {
    title: "Establecimientos & Estudios",
    description: "Organiza tus espacios y realiza estudios acústicos profesionales.",
    icon: "🏢",
    content: (
      <div className="space-y-4">
        <p className="text-gray-600">
          Cada establecimiento puede tener múltiples estudios acústicos. Monitorea métricas clave como STC, IIC y cumplimiento ISO.
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
    ),
  },
  {
    title: "Barras de Progreso Interactivas",
    description: "Información detallada al pasar el mouse sobre las métricas.",
    icon: "📊",
    content: (
      <div className="space-y-4">
        <p className="text-gray-600">
          Las barras de progreso muestran popovers con información detallada, recomendaciones y análisis cuando pasas el mouse sobre ellas.
        </p>
        <div className="space-y-3">
          <div className="p-3 bg-green-50 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">ISO Compliance</span>
              <span className="text-sm text-gray-600">92%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: "92%" }}></div>
            </div>
            <p className="text-xs text-green-600 mt-1">💡 Pasa el mouse para ver recomendaciones</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "Sistema de Distinciones",
    description: "Gana insignias por excelencia en control acústico y cumplimiento normativo.",
    icon: "🏆",
    content: (
      <div className="space-y-4">
        <p className="text-gray-600">
          Nuestro sistema gamificado te motiva a mantener altos estándares acústicos y cumplir con las normativas internacionales.
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
    ),
  },
  {
    title: "¡Comienza Ahora!",
    description: "Todo listo para comenzar tu análisis acústico profesional.",
    icon: "🚀",
    content: (
      <div className="space-y-4">
        <p className="text-gray-600">
          Tienes acceso completo a todas las herramientas. Comienza creando tu primer establecimiento o importando datos existentes.
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
    ),
  },
];

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [showEstablishmentForm, setShowEstablishmentForm] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof createPlaceSchema>>({
    resolver: zodResolver(createPlaceSchema),
    defaultValues: {},
  });

  const { mutate, isPending } = useMutation({
    mutationFn: createPlaceAction,
    onSuccess: (res) => {
      if (res.error) {
        toast.error("Error al crear el establecimiento", { id: "create-place" });
        return;
      }
      toast.success("Establecimiento creado exitosamente", { id: "create-place" });
      queryClient.invalidateQueries({ queryKey: ["places"] });
    },
    onError: () => {
      toast.error("Failed to create place", { id: "create-place" });
    },
  });

  const onSubmit = useCallback(
    async (data: CreatePlaceSchemaType) => {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, value as string);
      });
      if (file) {
        formData.append("image", file);
      }
      toast.loading("Creating place...", { id: "create-place" });
      mutate(formData);
    },
    [file, mutate]
  );

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowEstablishmentForm(true);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const backToTutorial = () => setShowEstablishmentForm(false);

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
                      <span className="text-sm text-blue-100">{currentStep + 1} de {steps.length}</span>
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
                              index === currentStep
                                ? "bg-blue-600"
                                : index < currentStep
                                ? "bg-green-500"
                                : "bg-gray-300"
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
                    <form
                      onSubmit={form.handleSubmit(onSubmit)}
                      className="space-y-6"
                      encType="multipart/form-data"
                    >
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Nombre del Establecimiento *</label>
                        <input
                          type="text"
                          {...form.register("name")}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          placeholder="Ej: Biblioteca Municipal"
                          required
                        />
                        {form.formState.errors.name && (
                          <p className="text-xs text-red-600 mt-1">{form.formState.errors.name.message}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Dirección *</label>
                        <input
                          type="text"
                          {...form.register("address")}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          placeholder="Ej: Calle 10 #123, Centro"
                          required
                        />
                        {form.formState.errors.address && (
                          <p className="text-xs text-red-600 mt-1">{form.formState.errors.address.message}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Descripción (opcional)</label>
                        <textarea
                          {...form.register("description")}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                          placeholder="Espacio de lectura y actividades culturales."
                        />
                        {form.formState.errors.description && (
                          <p className="text-xs text-red-600 mt-1">{form.formState.errors.description.message}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Categoría *</label>
                        <select
                          {...form.register("categoryId")}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          required
                        >
                          <option value="">Selecciona una categoría</option>                          
                          <option value="68f1b0f271ab8e232017fe17">Discoteca</option>
                          <option value="68f49311af0963065c1d4bd2">Restaurante</option>
                          <option value="68f492f9af0963065c1d4bd1">Bar</option>
                        </select>
                        {form.formState.errors.categoryId && (
                          <p className="text-xs text-red-600 mt-1">{form.formState.errors.categoryId.message}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Imagen del Establecimiento (opcional)</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setFile(e.target.files?.[0] || null)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg transition-colors"
                        />
                        {file && (
                          <div className="mt-2">
                            <img
                              src={URL.createObjectURL(file)}
                              alt="Vista previa"
                              className="w-32 h-32 object-cover rounded-lg border"
                            />
                          </div>
                        )}
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
                          disabled={isPending}
                          className={`flex justify-center items-center px-2 py-2 bg-black hover:bg-gray-900 text-white font-semibold rounded transition-colors ${
                            isPending ? "opacity-60 cursor-not-allowed" : ""
                          }`}
                        >
                          {isPending ? (
                            <>
                              <svg className="animate-spin w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path d="M12 2a10 10 0 1 1-10 10" stroke="currentColor" strokeWidth="4" fill="none" />
                              </svg>
                              Creando...
                            </>
                          ) : (
                            <>Crear Establecimiento</>
                          )}
                        </button>
                      </div>
                    </form>
                    {/* <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2 flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m-1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Información
                      </h4>
                      <p className="text-sm text-blue-800">
                        Después de crear tu establecimiento, podrás configurar parámetros acústicos detallados, realizar estudios ISO 12354-4 y visualizar el espacio en 3D.
                      </p>
                    </div> */}
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
