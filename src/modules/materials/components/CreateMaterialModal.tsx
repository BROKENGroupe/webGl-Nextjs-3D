// components/CreateMaterialModal.tsx
import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Plus, Waves, Settings, Info, Thermometer, Ruler, Weight, Palette, Flag, Layers as LayersIcon, BarChart2 } from 'lucide-react';
// import { MaterialType, THIRD_OCTAVE_BANDS, ThirdOctave } from '../types/materials';
// import { Material } from '../types/materials';
import { AcousticMaterial, THIRD_OCTAVE_BANDS, ThirdOctave } from '../types/AcousticMaterial';
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

interface CreateMaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (material: AcousticMaterial) => Promise<void>;
}

type FormData = AcousticMaterial;

const STEPS = [
  { id: 'basic', title: 'Información Básica', icon: Info },
  { id: 'physical', title: 'Propiedades Físicas', icon: Thermometer },
  { id: 'acoustic', title: 'Propiedades Acústicas', icon: Waves },
  { id: 'bands', title: 'Bandas de Octava', icon: BarChart2 },
  // { id: 'layers', title: 'Capas y Flags', icon: LayersIcon },
  { id: 'appearance', title: 'Apariencia', icon: Palette },
];

const initialThirdOctaveBands = THIRD_OCTAVE_BANDS.reduce((acc, freq) => {
  acc[freq] = 0;
  return acc;
}, {} as Record<ThirdOctave, number>);

const getInitialFormData = (): FormData => ({
  id: '',
  name: '',
  description: '',
  density: 0,
  reference: '',
  is_active: true,
  picture: null,
  descriptor: '',
  subtype: '',
  type: 'wall',
  thickness_mm: 0,
  mass_kg_m2: 0,
  catalog: '',
  color: '',
  doubleLeaf: false,
  lightweightElement: false,
  onElasticBands: false,
  layers: [],
  thirdOctaveBands: initialThirdOctaveBands,
  octaveBands: [],
  weightedIndex: { Rw: 0, C: 0, Ctr: 0 },
  imageRef: '',
  width: 0,
  height: 0,
  bottomOffset: 0,
});

export const CreateMaterialModal: React.FC<CreateMaterialModalProps> = ({ isOpen, onClose, onSave }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>(getInitialFormData());
  const [errors, setErrors] = useState<Record<string, any>>({});
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
      setFormData(getInitialFormData());
      setErrors({});
      setPreview(null);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

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
    const newLayers = [...formData.layers];
    (newLayers[index] as any)[field] = value;
    updateFormData('layers', newLayers);
  };

  const addLayer = () => {
    updateFormData('layers', [...formData.layers, { name: '', thickness: 0 }]);
  };

  const removeLayer = (index: number) => {
    const newLayers = [...formData.layers];
    newLayers.splice(index, 1);
    updateFormData('layers', newLayers);
  };

  const updateThirdOctaveBandValue = (frequency: ThirdOctave, value: number) => {
    setFormData(prev => ({
      ...prev,
      thirdOctaveBands: {
        ...prev.thirdOctaveBands,
        [frequency]: value,
      },
    }));
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, any> = {};
    switch (step) {
      case 0: // Basic info
        if (!(formData.name?.trim() ?? '')) newErrors.name = 'El nombre es requerido';
        if (!(formData.reference?.trim() ?? '')) newErrors.reference = 'La referencia es requerida';
        break;
      case 1: // Physical Properties
      console.log(formData.layers.length)
        if ((formData.density || 0) <= 0) newErrors.density = 'La densidad debe ser > 0';
        if (formData.thickness_mm <= 0) newErrors.thickness = 'El espesor debe ser > 0';
        if (formData.mass_kg_m2 <= 0) newErrors.mass = 'La masa debe ser > 0';
        if (formData.layers.length > 0) newErrors.layers = 'Deben de haber al menos 1 capa';
        break;
      // case 2: // Acoustic Properties
      //   if (formData.rw <= 0) newErrors.rw = 'Rw debe ser > 0';
      //   break;
      // Add validation for other steps as needed
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
    const allStepsValid = STEPS.map((_, i) => validateStep(i)).every(isValid => isValid);

    if (allStepsValid) {
      formData.descriptor = formData.name ?? '';
      // console.log(formData)
      await onSave(formData);
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

  if (!isOpen) return null;

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
                <h2 className="text-xl font-bold text-gray-900">Crear Nuevo Material</h2>
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
                <input placeholder="Nombre" value={formData.name} onChange={e => updateFormData('name', e.target.value)} className="w-full p-2 border rounded" />
              </FormField>
              <FormField label="Referencia" tooltip="Un identificador único para el material." error={errors.reference}>
                <input placeholder="Referencia" value={formData.reference} onChange={e => updateFormData('reference', e.target.value)} className="w-full p-2 border rounded" />
              </FormField>
              <div className="md:col-span-2">
                <FormField label="Descripción" tooltip="Una descripción detallada del material.">
                  <textarea placeholder="Descripción" value={formData.description} onChange={e => updateFormData('description', e.target.value)} className="w-full p-2 border rounded" />
                </FormField>
              </div>
              <FormField label="Tipo" tooltip="El Tipo a la que pertenece el material.">
                <select value={formData.type} onChange={e => updateFormData('type', e.target.value)} className="w-full p-2 border rounded">
                  <option value="wall">Paredes</option>
                  <option value="door">Suelos</option>
                  <option value="ceiling">Techos</option>
                  <option value="window">Ventanas</option>
                  <option value="floor">Ventanas</option>
                </select>
              </FormField>
              {/* <FormField label="Tipo" tooltip="El tipo general del material (ej. Hormigón, Ladrillo).">
                <input placeholder="Tipo" value={formData.type} onChange={e => updateFormData('type', e.target.value)} className="w-full p-2 border rounded" />
              </FormField> */}
              <FormField label="Subtipo" tooltip="Una sub-clasificación del material (ej. Celular, Macizo).">
                <input placeholder="Subtipo" value={formData.subtype} onChange={e => updateFormData('subtype', e.target.value)} className="w-full p-2 border rounded" />
              </FormField>
              {/* <FormField label="Descriptor" tooltip="Una descripción corta y técnica.">
                <input placeholder="Descriptor" value={formData.descriptor} onChange={e => updateFormData('descriptor', e.target.value)} className="w-full p-2 border rounded" />
              </FormField> */}
              <FormField label="Catálogo" tooltip="Catálogo o norma de referencia.">
                <input placeholder="Catálogo" value={formData.catalog} onChange={e => updateFormData('catalog', e.target.value)} className="w-full p-2 border rounded" />
              </FormField>
              {/* <div className="md:col-span-2">
                <FormField label="Comentarios" tooltip="Notas o comentarios adicionales.">
                  <textarea placeholder="Comentarios" value={formData.comments} onChange={e => updateFormData('comments', e.target.value)} className="w-full p-2 border rounded" />
                </FormField>
              </div> */}
            </div>
          )}
          {currentStep === 1 && (
            <div className="space-y-4">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField label="Densidad (kg/m³)" tooltip="La densidad del material." error={errors.density}>
                  <input type="number" placeholder="Densidad (kg/m³)" value={formData.density} onChange={e => updateFormData('density', Number(e.target.value))} className="w-full p-2 border rounded" />
                </FormField>
                <FormField label="Espesor (mm)" tooltip="El espesor del material en milímetros." error={errors.thickness}>
                  <input type="number" placeholder="Espesor (mm)" value={formData.thickness_mm} onChange={e => updateFormData('thickness_mm', Number(e.target.value))} className="w-full p-2 border rounded" />
                </FormField>
                <FormField label="Masa (kg/m²)" tooltip="La masa por unidad de superficie del material." error={errors.mass}>
                  <input type="number" placeholder="Masa (kg/m²)" value={formData.mass_kg_m2} onChange={e => updateFormData('mass_kg_m2', Number(e.target.value))} className="w-full p-2 border rounded" />
                </FormField>


              </div>


              <FormField label="Capas" tooltip="Las capas que componen el material."  error={errors.layers}>
                {formData.layers.map((layer, index) => (
                  <div key={index} className="flex gap-2 mb-2 items-center">
                    <div className="flex flex-col flex-1">
                      <span className="text-xs text-gray-500 mb-1">Nombre de capa</span>
                      <input
                        placeholder="Nombre de capa"
                        value={layer.name}
                        onChange={e => handleLayerChange(index, 'name', e.target.value)}
                        className="w-full p-2 border rounded"
                      />
                    </div>
                    <div className="flex flex-col flex-1">
                      <span className="text-xs text-gray-500 mb-1">Espesor (mm)</span>
                      <input
                        type="number"
                        placeholder="Espesor (mm)"
                        value={layer.thickness_mm}
                        onChange={e => handleLayerChange(index, 'thickness', e.target.value)}
                        className="w-full p-2 border rounded"
                      />
                    </div>
                    <button
                      onClick={() => removeLayer(index)}
                      className="p-2 bg-red-500 text-white rounded"
                    >
                      X
                    </button>
                  </div>
                ))}
                <button onClick={addLayer} className="p-2 bg-blue-500 text-white rounded">Añadir Capa</button>
              </FormField>
            </div>

          )}
          {currentStep === 2 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* <FormField label="Rw" tooltip="Índice de reducción acústica ponderado." error={errors.rw}>
                <input type="number" placeholder="Rw" value={formData.rw} onChange={e => updateFormData('rw', Number(e.target.value))} className="w-full p-2 border rounded" />
              </FormField> */}
              <FormField label="Indice ponderado Rw" tooltip="Índice de reducción acústica ponderado (Rw) del índice ponderado.">
                <input type="number" placeholder="Weighted Rw" value={formData.weightedIndex?.Rw} onChange={e => updateFormData('weightedIndex', { ...formData.weightedIndex, Rw: Number(e.target.value) })} className="w-full p-2 border rounded" />
              </FormField>
              <FormField label="Indice ponderado C" tooltip="Término de adaptación para ruido rosa.">
                <input type="number" placeholder="Weighted C" value={formData.weightedIndex?.C} onChange={e => updateFormData('weightedIndex', { ...formData.weightedIndex, C: Number(e.target.value) })} className="w-full p-2 border rounded" />
              </FormField>
              <FormField label="Indice ponderado Ctr" tooltip="Término de adaptación para ruido de tráfico.">
                <input type="number" placeholder="Weighted Ctr" value={formData.weightedIndex?.Ctr} onChange={e => updateFormData('weightedIndex', { ...formData.weightedIndex, Ctr: Number(e.target.value) })} className="w-full p-2 border rounded" />
              </FormField>
              {/* <div className="mt-6">
                <FormField label="Flags" tooltip="Propiedades booleanas adicionales del material.">
                  <div className="flex items-center gap-4">
                      <label className="flex items-center"><input type="checkbox" checked={formData.doubleLeaf} onChange={e => updateFormData('doubleLeaf', e.target.checked)} className="mr-2" /> Doble Hoja</label>
                      <label className="flex items-center"><input type="checkbox" checked={formData.lightweightElement} onChange={e => updateFormData('lightweightElement', e.target.checked)} className="mr-2" /> Elemento Ligero</label>
                      <label className="flex items-center"><input type="checkbox" checked={formData.onElasticBands} onChange={e => updateFormData('onElasticBands', e.target.checked)} className="mr-2" /> Bandas Elásticas</label>
                  </div>
                </FormField>
              </div>
   */}
            </div>
          )}
          {currentStep === 3 && (
            <div className="space-y-4">
              <FormField label="Bandas de Tercio de Octava" tooltip="Valores de reducción acústica para cada banda de frecuencia.">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {THIRD_OCTAVE_BANDS.map(freq => (
                    <div key={freq} className="flex items-center">
                      <label className="w-20 text-sm font-medium text-gray-700">{freq} Hz</label>
                      <input type="number" value={formData.thirdOctaveBands[freq]} onChange={e => updateThirdOctaveBandValue(freq, Number(e.target.value))} className="w-full p-2 border rounded" />
                    </div>
                  ))}
                </div>
              </FormField>
            </div>
          )}
          {/* {currentStep === 4 && (
            <div>
              <FormField label="Capas" tooltip="Las capas que componen el material.">
                {formData.layers.map((layer, index) => (
                    <div key={index} className="flex gap-2 mb-2 items-center">
                        <input placeholder="Nombre de capa" value={layer.name} onChange={e => handleLayerChange(index, 'name', e.target.value)} className="w-full p-2 border rounded" />
                        <input type="number" placeholder="Espesor (mm)" value={layer.thickness} onChange={e => handleLayerChange(index, 'thickness', e.target.value)} className="w-full p-2 border rounded" />
                        <button onClick={() => removeLayer(index)} className="p-2 bg-red-500 text-white rounded">X</button>
                    </div>
                ))}
                <button onClick={addLayer} className="p-2 bg-blue-500 text-white rounded">Añadir Capa</button>
              </FormField>
              <div className="mt-6">
                <FormField label="Flags" tooltip="Propiedades booleanas adicionales del material.">
                  <div className="flex items-center gap-4">
                      <label className="flex items-center"><input type="checkbox" checked={formData.doubleLeaf} onChange={e => updateFormData('doubleLeaf', e.target.checked)} className="mr-2" /> Doble Hoja</label>
                      <label className="flex items-center"><input type="checkbox" checked={formData.lightweightElement} onChange={e => updateFormData('lightweightElement', e.target.checked)} className="mr-2" /> Elemento Ligero</label>
                      <label className="flex items-center"><input type="checkbox" checked={formData.onElasticBands} onChange={e => updateFormData('onElasticBands', e.target.checked)} className="mr-2" /> Bandas Elásticas</label>
                  </div>
                </FormField>
              </div>
            </div>
          )} */}
          {currentStep === 4 && (
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
                    value={formData.color}
                    onChange={e => updateFormData('color', e.target.value)}
                    className="w-full p-2 border rounded"
                    maxLength={7}
                    pattern="^#([A-Fa-f0-9]{6})$"
                    title="Formato hexadecimal: #RRGGBB"
                  />
                  {/* Paleta de colores rápida */}
                  {/* <div className="flex gap-1 ml-2">
                    {["#ffffff", "#000000", "#f44336", "#2196f3", "#4caf50", "#ffeb3b", "#ff9800", "#9c27b0"].map(color => (
                      <button
                        key={color}
                        type="button"
                        className="w-6 h-6 rounded border"
                        style={{ backgroundColor: color }}
                        onClick={() => updateFormData('color', color)}
                        aria-label={`Elegir color ${color}`}
                      />
                    ))}
                  </div> */}
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
              <button onClick={handleSave} className="flex items-center px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700"><Plus size={16} className="mr-2" />Crear Material</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
