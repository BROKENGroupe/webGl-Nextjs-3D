// components/CreateMaterialModal.tsx
import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Plus, Waves, Settings, Info } from 'lucide-react';
import { MaterialCategory } from '../types/materials';
import { FREQUENCY_BANDS } from '../data';
import { CreateMaterialRequest } from '@/services/materialsService';

interface CreateMaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (material: CreateMaterialRequest) => Promise<void>;
}

type FormData = CreateMaterialRequest;

const STEPS = [
  { id: 'basic', title: 'Información Básica', icon: Info },
  { id: 'acoustic', title: 'Propiedades Acústicas', icon: Waves },
  { id: 'frequencies', title: 'Índices Acústicos', icon: Settings },
];

export const CreateMaterialModal: React.FC<CreateMaterialModalProps> = ({
  isOpen,
  onClose,
  onSave
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    reference: '',
    name: '',
    description: '',
    category: 'WALLS',
    density: 0,
    rw: 0,
    acoustic_indices: FREQUENCY_BANDS.map(freq => ({ frequency: freq, value_R: 0 })),
    is_active: true,
    picture: null,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
      setFormData({
        reference: '',
        name: '',
        description: '',
        category: 'WALLS',
        density: 0,
        rw: 0,
        acoustic_indices: FREQUENCY_BANDS.map(freq => ({ frequency: freq, value_R: 0 })),
        is_active: true,
        picture: null,
      });
      setErrors({});
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // ... (other useEffects and handlers are fine)
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const updateAcousticIndex = (index: number, value: number) => {
    const newIndices = [...formData.acoustic_indices];
    newIndices[index].value_R = value;
    setFormData(prev => ({ ...prev, acoustic_indices: newIndices }));
  };


  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 0: // Basic info
        if (!formData.reference.trim()) newErrors.reference = 'La referencia es requerida';
        if (!formData.name.trim()) newErrors.name = 'El nombre es requerido';
        if (!formData.description.trim()) newErrors.description = 'La descripción es requerida';
        if (formData.density <= 0) newErrors.density = 'La densidad debe ser mayor a 0';
        break;
      case 1: // Acoustic properties
        if (formData.rw <= 0) newErrors.rw = 'El valor Rw debe ser mayor a 0';
        break;
      case 2: // Frequencies
        const hasInvalidIndices = formData.acoustic_indices.some(index => index.value_R < 0);
        if (hasInvalidIndices) newErrors.acoustic_indices = 'Los valores no pueden ser negativos';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const handleSave = async () => {
    const isStep0Valid = validateStep(0);
    const isStep1Valid = validateStep(1);
    const isStep2Valid = validateStep(2);

    if (isStep0Valid && isStep1Valid && isStep2Valid) {
      await onSave(formData);
    } else {
      if (!isStep0Valid) setCurrentStep(0);
      else if (!isStep1Valid) setCurrentStep(1);
      else if (!isStep2Valid) setCurrentStep(2);
    }
  };

  if (!isOpen) return null;

  const currentStepData = STEPS[currentStep];
  const Icon = currentStepData.icon;

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black bg-opacity-40 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl">
        {/* ... Header ... */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
               <div className="p-2 bg-blue-100 rounded-lg">
                 <Icon className="text-blue-600" size={24} />
               </div>
               <div>
                 <h2 className="text-xl font-bold text-gray-900">
                   Crear Nuevo Material
                 </h2>
                 <p className="text-sm text-gray-600">{currentStepData.title}</p>
               </div>
             </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          <div className="mt-6">
            <div className="bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-grow">
          {currentStep === 0 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Referencia *</label>
                  <input
                    type="text"
                    value={formData.reference}
                    onChange={(e) => updateFormData('reference', e.target.value.toUpperCase())}
                    placeholder="ej. MURO_HORMIGON_01"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.reference ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.reference && <p className="text-red-500 text-xs mt-1">{errors.reference}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nombre del Material *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => updateFormData('name', e.target.value)}
                    placeholder="ej. Pared de Concreto Nueva"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Descripción *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => updateFormData('description', e.target.value)}
                  placeholder="Describe el material, sus usos, composición, etc."
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Categoría</label>
                  <select
                    value={formData.category}
                    onChange={(e) => updateFormData('category', e.target.value as MaterialCategory)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="WALLS">Paredes</option>
                    <option value="FLOORS">Suelos</option>
                    <option value="DOORS">Puertas</option>
                    <option value="WINDOWS">Ventanas</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Densidad (kg/m³) *</label>
                  <input
                    type="number"
                    value={formData.density}
                    onChange={(e) => updateFormData('density', Number(e.target.value))}
                    placeholder="ej. 2400"
                    min="0"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.density ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.density && <p className="text-red-500 text-xs mt-1">{errors.density}</p>}
                </div>
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => updateFormData('is_active', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Material activo</span>
                </label>
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rw - Índice de Reducción Acústica (dB) *</label>
                <input
                  type="number"
                  value={formData.rw}
                  onChange={(e) => updateFormData('rw', Number(e.target.value))}
                  placeholder="ej. 45"
                  min="0"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.rw ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.rw && <p className="text-red-500 text-xs mt-1">{errors.rw}</p>}
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-4">Coeficientes de Absorción por Frecuencia</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {formData.acoustic_indices.map((index, i) => (
                    <div key={i} className="flex items-center space-x-3">
                      <label className="text-sm text-gray-600 w-16">{index.frequency} Hz</label>
                      <input
                        type="number"
                        value={index.value_R}
                        onChange={(e) => updateAcousticIndex(i, Number(e.target.value))}
                        step="0.01"
                        min="0"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  ))}
                </div>
                {errors.acoustic_indices && <p className="text-red-500 text-xs mt-2">{errors.acoustic_indices}</p>}
              </div>
            </div>
          )}

          {/* ... other steps ... */}
        </div>

        {/* ... Footer ... */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft size={16} className="mr-1" />
            Anterior
          </button>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            {currentStep < STEPS.length - 1 ? (
              <button
                onClick={nextStep}
                className="flex items-center px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
              >
                Siguiente
                <ChevronRight size={16} className="ml-1" />
              </button>
            ) : (
              <button
                onClick={handleSave}
                className="flex items-center px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors shadow-sm"
              >
                <Plus size={16} className="mr-2" />
                Crear Material
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
