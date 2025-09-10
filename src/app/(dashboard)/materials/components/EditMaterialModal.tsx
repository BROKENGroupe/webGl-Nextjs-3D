// components/EditMaterialModal.tsx
import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Save, Waves, Settings, Info } from 'lucide-react';
import { MaterialCategory } from '../types/materials';
import { UpdateMaterialRequest, MaterialResponse } from '@/services/materialsService';

interface EditMaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, data: UpdateMaterialRequest) => Promise<void>;
  material: MaterialResponse | null;
}

type FormData = Omit<UpdateMaterialRequest, 'id'>;

const STEPS = [
  { id: 'basic', title: 'Información Básica', icon: Info },
  { id: 'acoustic', title: 'Propiedades Acústicas', icon: Waves },
  { id: 'frequencies', title: 'Índices Acústicos', icon: Settings },
];

export const EditMaterialModal: React.FC<EditMaterialModalProps> = ({
  isOpen,
  onClose,
  onSave,
  material
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<any>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (material) {
      setFormData({
        reference: material.reference,
        name: material.name,
        description: material.description,
        category: material.category,
        // density: material.density, // Removed because 'density' does not exist on MaterialResponse
        // rw: material.rw, // Removed because 'rw' does not exist on MaterialResponse
        acoustic_indices: material.acoustic_indices,
        is_active: material.is_active,
      });
    } else {
      setFormData({});
      setCurrentStep(0);
      setErrors({});
    }
  }, [material]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData((prev: FormData) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev: Record<string, string>) => ({ ...prev, [field]: '' }));
    }
  };

  const updateAcousticIndex = (index: number, value: number) => {
    if (!formData.acoustic_indices) return;
    const newIndices = [...formData.acoustic_indices];
    newIndices[index].value_R = value;
    setFormData((prev: FormData) => ({ ...prev, acoustic_indices: newIndices }));
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};
    switch (step) {
      case 0:
        if (!formData.reference?.trim()) newErrors.reference = 'La referencia es requerida';
        if (!formData.name?.trim()) newErrors.name = 'El nombre es requerido';
        if (!formData.description?.trim()) newErrors.description = 'La descripción es requerida';
        if (formData.density && formData.density <= 0) newErrors.density = 'La densidad debe ser mayor a 0';
        break;
      case 1:
        if (formData.rw && formData.rw <= 0) newErrors.rw = 'El valor Rw debe ser mayor a 0';
        break;
      case 2:
        const hasInvalidIndices = formData.acoustic_indices?.some((index: { value_R: number }) => index.value_R < 0);
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
    if (!material) return;
    if (validateStep(0) && validateStep(1) && validateStep(2)) {
      await onSave(material._id, formData);
    }
  };

  if (!isOpen || !material) return null;

  const currentStepData = STEPS[currentStep];
  const Icon = currentStepData.icon;

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black bg-opacity-40 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl">
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-teal-50">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                        <Icon className="text-green-600" size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Editar Material</h2>
                        <p className="text-sm text-gray-600">{currentStepData.title}</p>
                    </div>
                </div>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600 w-8 h-8 rounded-full flex items-center justify-center transition-colors">
                    <X size={20} />
                </button>
            </div>
            <div className="mt-6"><div className="bg-gray-200 rounded-full h-2"><div className="bg-green-500 h-2 rounded-full transition-all duration-300" style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}/></div></div>
        </div>

        <div className="p-6 overflow-y-auto flex-grow">
          {currentStep === 0 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Referencia *</label>
                  <input type="text" value={formData.reference || ''} onChange={(e) => updateFormData('reference', e.target.value.toUpperCase())} placeholder="ej. MURO_HORMIGON_01" className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${errors.reference ? 'border-red-500' : 'border-gray-300'}`} />
                  {errors.reference && <p className="text-red-500 text-xs mt-1">{errors.reference}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nombre del Material *</label>
                  <input type="text" value={formData.name || ''} onChange={(e) => updateFormData('name', e.target.value)} placeholder="ej. Pared de Concreto Nueva" className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${errors.name ? 'border-red-500' : 'border-gray-300'}`} />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Descripción *</label>
                <textarea value={formData.description || ''} onChange={(e) => updateFormData('description', e.target.value)} placeholder="Describe el material..." rows={3} className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${errors.description ? 'border-red-500' : 'border-gray-300'}`} />
                {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Categoría</label>
                  <select value={formData.category || ''} onChange={(e) => updateFormData('category', e.target.value as MaterialCategory)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                    <option value="WALLS">Paredes</option>
                    <option value="FLOORS">Suelos</option>
                    <option value="DOORS">Puertas</option>
                    <option value="WINDOWS">Ventanas</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Densidad (kg/m³) *</label>
                  <input type="number" value={formData.density || 0} onChange={(e) => updateFormData('density', Number(e.target.value))} min="0" className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${errors.density ? 'border-red-500' : 'border-gray-300'}`} />
                  {errors.density && <p className="text-red-500 text-xs mt-1">{errors.density}</p>}
                </div>
              </div>
            </div>
          )}
          {currentStep === 1 && (
             <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rw - Índice de Reducción Acústica (dB) *</label>
                <input type="number" value={formData.rw || 0} onChange={(e) => updateFormData('rw', Number(e.target.value))} min="0" className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${errors.rw ? 'border-red-500' : 'border-gray-300'}`} />
                {errors.rw && <p className="text-red-500 text-xs mt-1">{errors.rw}</p>}
              </div>
            </div>
          )}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {formData.acoustic_indices?.map(
                  (
                    index: { frequency: number; value_R: number },
                    i: number
                  ) => (
                    <div key={i} className="flex items-center space-x-3">
                      <label className="text-sm text-gray-600 w-16">{index.frequency} Hz</label>
                      <input type="number" value={index.value_R} onChange={(e) => updateAcousticIndex(i, Number(e.target.value))} step="0.01" min="0" className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" />
                    </div>
                  )
                )}
              </div>
              {errors.acoustic_indices && <p className="text-red-500 text-xs mt-2">{errors.acoustic_indices}</p>}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
          <button onClick={prevStep} disabled={currentStep === 0} className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed hover:bg-gray-100 rounded-lg transition-colors">
            <ChevronLeft size={16} className="mr-1" /> Anterior
          </button>
          <div className="flex space-x-3">
            <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Cancelar</button>
            {currentStep < STEPS.length - 1 ? (
              <button onClick={nextStep} className="flex items-center px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors shadow-sm">
                Siguiente <ChevronRight size={16} className="ml-1" />
              </button>
            ) : (
              <button onClick={handleSave} className="flex items-center px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors shadow-sm">
                <Save size={16} className="mr-2" /> Guardar Cambios
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};