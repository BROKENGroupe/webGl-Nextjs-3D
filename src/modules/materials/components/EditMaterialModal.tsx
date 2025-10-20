// components/EditMaterialModal.tsx
import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Plus, Waves, Settings, Info, Thermometer, Ruler, Weight, Palette, Flag, Layers as LayersIcon, BarChart2, Save } from 'lucide-react';
import { AcousticMaterial, THIRD_OCTAVE_BANDS, ThirdOctave, OCTAVE_BANDS, Octave, UpdateMaterialRequest } from '../types/AcousticMaterial';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/shared/ui/tooltip';
import { Label } from '@/shared/ui/label';

const FormField = ({ label, tooltip, children, error }: { label: string, tooltip: string, children: React.ReactNode, error?: string }) => (
  <div>
    <div className="flex items-center mb-2">
      <Label className="block text-sm font-medium text-gray-700">{label}</Label>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button type="button" className="ml-2 text-gray-400 hover:text-gray-600">
              <Info size={14} />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
    {children}
    {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
  </div>
);

interface EditMaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, material: UpdateMaterialRequest) => Promise<void>;
  material: AcousticMaterial | null;
}

type FormData = UpdateMaterialRequest;

const STEPS = [
  { id: 'basic', title: 'Información Básica', icon: Info },
  { id: 'acoustic', title: 'Propiedades Acústicas', icon: Waves },
  { id: 'bands', title: 'Bandas de Octava', icon: BarChart2 },
  { id: 'appearance', title: 'Apariencia', icon: Palette },
];

const getInitialFormData = (material: AcousticMaterial | null): Partial<FormData> => {
  if (!material) return {};
  return {
    name: material.name,
    description: material.description,
    type: material.type,
    density: material.density,
    reference: material.reference,
    is_active: material.is_active,
    picture: material.picture,
    descriptor: material.descriptor,
    subtype: material.subtype,
    thickness_mm: material.thickness_mm,
    mass_kg_m2: material.mass_kg_m2,
    catalog: material.catalog,
    color: material.color,
    doubleLeaf: material.doubleLeaf,
    lightweightElement: material.lightweightElement,
    onElasticBands: material.onElasticBands,
    layers: material.layers,
    thirdOctaveBands: material.thirdOctaveBands,
    octaveBands: material.octaveBands,
    weightedIndex: material.weightedIndex,
    imageRef: material.imageRef,
    width: material.width,
    height: material.height,
    bottomOffset: material.bottomOffset,
  };
};

export const EditMaterialModal: React.FC<EditMaterialModalProps> = ({ isOpen, onClose, onSave, material }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Partial<FormData>>(getInitialFormData(material));
  const [errors, setErrors] = useState<Record<string, any>>({});
  const [preview, setPreview] = useState<string | null>(null);
  const [bandType, setBandType] = useState<'third' | 'octave'>('third');

  useEffect(() => {
    if (isOpen && material) {
      setFormData(getInitialFormData(material));
      setCurrentStep(0);
      setErrors({});
      if (typeof material.picture === 'string') {
        setPreview(material.picture);
      }
      document.body.style.overflow = 'hidden';
    } else if (!isOpen) {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, material]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      updateFormData('picture', file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      updateFormData('picture', null);
      setPreview(null);
    }
  };

  const handleLayerChange = (index: number, field: string, value: string) => {
    const newLayers = [...(formData.layers || [])];
    (newLayers[index] as any)[field] = value;
    updateFormData('layers', newLayers);
  };

  const addLayer = () => {
    updateFormData('layers', [...(formData.layers || []), { name: '', thickness: 0 }]);
  };

  const removeLayer = (index: number) => {
    const newLayers = [...(formData.layers || [])];
    newLayers.splice(index, 1);
    updateFormData('layers', newLayers);
  };

  const updateThirdOctaveBandValue = (frequency: ThirdOctave, value: number) => {
    setFormData(prev => ({
      ...prev,
      thirdOctaveBands: {
        ...(prev.thirdOctaveBands || THIRD_OCTAVE_BANDS.reduce((acc, freq) => {
          acc[freq] = 0;
          return acc;
        }, {} as Record<ThirdOctave, number>)),
        [frequency]: value,
      },
    }));
  };

  const updateOctaveBandValue = (frequency: Octave, value: number) => {
    setFormData(prev => ({
      ...prev,
      octaveBands: {
        ...(prev.octaveBands || OCTAVE_BANDS.reduce((acc, freq) => {
          acc[freq] = 0;
          return acc;
        }, {} as Record<ThirdOctave, number>)),
        [frequency]: value,
      },
    }));;
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, any> = {};
    switch (step) {
      case 0: // Basic info
        if (!formData.name?.trim()) newErrors.name = 'El nombre es requerido';
        if (!formData.reference?.trim()) newErrors.reference = 'La referencia es requerida';
        break;
    }
    setErrors(prev => ({ ...prev, ...newErrors }));
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
    const allStepsValid = STEPS.map((_, i) => validateStep(i)).every(isValid => isValid);

    if (allStepsValid) {
      if (material._id) {
        await onSave(material._id, formData);
      } else {
        alert("El ID del material no está definido.");
      }
    } else {
      alert("Por favor, complete todos los campos requeridos en todos los pasos.");
      for (let i = 0; i < STEPS.length; i++) {
        if (!validateStep(i)) {
          setCurrentStep(i);
          break;
        }
      }
    }
  };

  if (!isOpen || !material) return null;

  const currentStepData = STEPS[currentStep];
  const Icon = currentStepData.icon;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-opacity-40 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg"><Icon className="text-blue-600" size={24} /></div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Editar Material</h2>
                <p className="text-sm text-gray-600">{currentStepData.title}</p>
              </div>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 w-8 h-8 rounded-full flex items-center justify-center transition-colors"><X size={20} /></button>
          </div>
          <div className="mt-6"><div className="bg-gray-200 rounded-full h-2"><div className="bg-blue-500 h-2 rounded-full transition-all duration-300" style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }} /></div></div>
        </div>

        <div className="p-6 overflow-y-auto flex-grow">
          {currentStep === 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField label="Nombre" tooltip="El nombre principal del material." error={errors.name}>
                <input placeholder="Nombre" value={formData.name || ''} onChange={e => updateFormData('name', e.target.value)} className="w-full p-2 border rounded" />
              </FormField>
              <FormField label="Fabricante" tooltip="Un identificador único para el material." error={errors.reference}>
                <input placeholder="Fabricante" value={formData.reference || ''} onChange={e => updateFormData('reference', e.target.value)} className="w-full p-2 border rounded" />
              </FormField>
              <div className="md:col-span-2">
                <FormField label="Descripción" tooltip="Una descripción detallada del material.">
                  <textarea placeholder="Descripción" value={formData.description || ''} onChange={e => updateFormData('description', e.target.value)} className="w-full p-2 border rounded" />
                </FormField>
              </div>
              {/* <FormField label="Tipo" tooltip="El Tipo a la que pertenece el material.">
                <select value={formData.type} onChange={e => updateFormData('type', e.target.value)} className="w-full p-2 border rounded">
                  <option value="wall">Paredes</option>
                  <option value="door">Puertas</option>
                  <option value="ceiling">Techos</option>
                  <option value="window">Ventanas</option>
                  <option value="floor">Pisos</option>
                </select>
              </FormField> */}
              {/* <FormField label="Subtipo" tooltip="Una sub-clasificación del material (ej. Celular, Macizo).">
                <input placeholder="Subtipo" value={formData.subtype || ''} onChange={e => updateFormData('subtype', e.target.value)} className="w-full p-2 border rounded" />
              </FormField>
              <FormField label="Catálogo" tooltip="Catálogo o norma de referencia.">
                <input placeholder="Catálogo" value={formData.catalog || ''} onChange={e => updateFormData('catalog', e.target.value)} className="w-full p-2 border rounded" />
              </FormField> */}
              {(formData.type === 'window' || formData.type === 'door') && (
                <>
                  <FormField label="Ancho (m)" tooltip="Ancho del elemento en metros.">
                    <input type="number" placeholder="Ancho" value={formData.width} onChange={e => updateFormData('width', Number(e.target.value))} className="w-full p-2 border rounded" />
                  </FormField>
                  <FormField label="Alto (m)" tooltip="Altura del elemento en metros.">
                    <input type="number" placeholder="Alto" value={formData.height} onChange={e => updateFormData('height', Number(e.target.value))} className="w-full p-2 border rounded" />
                  </FormField>
                </>
              )}
            </div>
          )}
          {currentStep === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField label="Indice ponderado Rw" tooltip="Índice de reducción acústica ponderado (Rw) del índice ponderado.">
                <input type="number" placeholder="Weighted Rw" value={formData.weightedIndex?.Rw || 0} onChange={e => updateFormData('weightedIndex', { ...formData.weightedIndex, Rw: Number(e.target.value) })} className="w-full p-2 border rounded" />
              </FormField>
              <FormField label="Indice ponderado C" tooltip="Término de adaptación para ruido rosa.">
                <input type="number" placeholder="Weighted C" value={formData.weightedIndex?.C || 0} onChange={e => updateFormData('weightedIndex', { ...formData.weightedIndex, C: Number(e.target.value) })} className="w-full p-2 border rounded" />
              </FormField>
              <FormField label="Indice ponderado Ctr" tooltip="Término de adaptación para ruido de tráfico.">
                <input type="number" placeholder="Weighted Ctr" value={formData.weightedIndex?.Ctr || 0} onChange={e => updateFormData('weightedIndex', { ...formData.weightedIndex, Ctr: Number(e.target.value) })} className="w-full p-2 border rounded" />
              </FormField>
            </div>
          )}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="flex border-b">
                <button
                  className={`px-4 py-2 text-sm font-medium ${bandType === 'third' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
                  onClick={() => setBandType('third')}
                >
                  Tercios de Octava
                </button>
                <button
                  className={`px-4 py-2 text-sm font-medium ${bandType === 'octave' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
                  onClick={() => setBandType('octave')}
                >
                  Octava
                </button>
              </div>
              {bandType === 'third' && (
                <FormField label="Bandas de Tercio de Octava" tooltip="Valores de reducción acústica para cada banda de frecuencia.">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {THIRD_OCTAVE_BANDS.map(freq => (
                      <div key={freq} className="flex items-center">
                        <label className="w-20 text-sm font-medium text-gray-700">{freq} Hz</label>
                        <input type="number" value={formData.thirdOctaveBands ? formData.thirdOctaveBands[freq] : 0} onChange={e => updateThirdOctaveBandValue(freq, Number(e.target.value))} className="w-full p-2 border rounded" />
                      </div>
                    ))}
                  </div>
                </FormField>
              )}
              {bandType === 'octave' && (
                <FormField label="Bandas de Octava" tooltip="Valores de reducción acústica para cada banda de frecuencia.">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {OCTAVE_BANDS.map(freq => (
                      <div key={freq} className="flex items-center">
                        <label className="w-20 text-sm font-medium text-gray-700">{freq} Hz</label>
                        <input type="number" value={formData.octaveBands ? formData.octaveBands[freq] : 0} onChange={e => updateOctaveBandValue(freq, Number(e.target.value))} className="w-full p-2 border rounded" />
                      </div>
                    ))}
                  </div>
                </FormField>
              )}
            </div>
          )}
          {currentStep === 3 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField label="Color" tooltip="Color de representación del material.">
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={formData.color || "#ffffff"}
                    onChange={e => updateFormData('color', e.target.value)}
                    className="w-10 h-10 p-0 border rounded"
                    style={{ minWidth: '2.5rem' }}
                  />
                  <input
                    type="text"
                    placeholder="#RRGGBB"
                    value={formData.color || ''}
                    onChange={e => updateFormData('color', e.target.value)}
                    className="w-full p-2 border rounded"
                    maxLength={7}
                    pattern="^#([A-Fa-f0-9]{6})$"
                    title="Formato hexadecimal: #RRGGBB"
                  />
                </div>
              </FormField>
              <FormField label="Imagen del Material" tooltip="Sube una imagen para el material.">
                <input type="file" accept="image/*" onChange={handleFileChange} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
              </FormField>
              {preview && (
                <div className="md:col-span-2 mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Vista Previa:</p>
                  <img src={preview} alt="Vista previa de la imagen" className="rounded-lg max-h-48 w-auto" />
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
          <button onClick={prevStep} disabled={currentStep === 0} className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 disabled:text-gray-400 hover:bg-gray-100 rounded-lg">Anterior</button>
          <div className="flex space-x-3">
            <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
            {currentStep < STEPS.length - 1 ? (
              <button onClick={nextStep} className="flex items-center px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700">Siguiente</button>
            ) : (
              <button onClick={handleSave} className="flex items-center px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700"><Save size={16} className="mr-2" />Guardar Cambios</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};