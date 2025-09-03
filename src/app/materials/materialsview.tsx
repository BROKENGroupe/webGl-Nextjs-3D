import React, { useState } from 'react';
import { Plus, X, Save, AlertCircle, Info } from 'lucide-react';

const MATERIAL_CATEGORIES = {
  WALLS: 'Paredes',
  FLOORS: 'Suelos', 
  DOORS: 'Puertas',
  WINDOWS: 'Ventanas'
};

const FREQUENCY_BANDS = [125, 250, 500, 1000, 2000, 4000];

type NewMaterialModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (material: any) => void; // Replace 'any' with a more specific type if available
};

type FormDataType = {
  name: string;
  category: string;
  surfaceMass: string;
  thickness: string;
  density: string;
  absorption: string[];
  transmissionLoss: string[];
  rw: string;
  c: string;
  ctr: string;
  flowResistivity: string;
  porosity: string;
  tortuosity: string;
  youngModulus: string;
  poissonRatio: string;
  dampingLoss: string;
};

const NewMaterialModal: React.FC<NewMaterialModalProps> = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState<FormDataType>({
    name: '',
    category: 'WALLS',
    surfaceMass: '',
    thickness: '',
    density: '',
    absorption: ['', '', '', '', '', ''],
    transmissionLoss: ['', '', '', '', '', ''],
    rw: '',
    c: '',
    ctr: '',
    flowResistivity: '',
    porosity: '',
    tortuosity: '',
    youngModulus: '',
    poissonRatio: '',
    dampingLoss: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState('basic');

  const validateField = (name: string, value: string) => {
    const newErrors = { ...errors };

    switch (name) {
      case 'name':
        if (!value.trim()) {
          newErrors[name] = 'El nombre es requerido';
        } else {
          delete newErrors[name];
        }
        break;
      case 'surfaceMass':
      case 'thickness':
      case 'density':
      case 'rw':
      case 'flowResistivity':
      case 'porosity':
      case 'tortuosity':
      case 'youngModulus':
      case 'poissonRatio':
      case 'dampingLoss':
        if (value === '' || isNaN(Number(value)) || Number(value) < 0) {
          newErrors[name] = 'Debe ser un número positivo';
        } else {
          delete newErrors[name];
        }
        break;
      case 'c':
      case 'ctr':
        if (value === '' || isNaN(Number(value))) {
          newErrors[name] = 'Debe ser un número válido';
        } else {
          delete newErrors[name];
        }
        break;
      default:
        break;
    }

    setErrors(newErrors);
  };

  const handleInputChange = (name: keyof FormDataType, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    validateField(name, value);
  };

  const handleArrayInputChange = (
    arrayName: 'absorption' | 'transmissionLoss',
    index: number,
    value: string
  ) => {
    const newArray = [...formData[arrayName]];
    newArray[index] = value;
    setFormData(prev => ({
      ...prev,
      [arrayName]: newArray
    }));

    // Validar que el valor sea un número entre 0 y 1 para absorción
    if (arrayName === 'absorption') {
      const newErrors = { ...errors };
      if (value === '' || isNaN(Number(value)) || Number(value) < 0 || Number(value) > 1) {
        newErrors[`${arrayName}_${index}`] = 'Debe ser un número entre 0 y 1';
      } else {
        delete newErrors[`${arrayName}_${index}`];
      }
      setErrors(newErrors);
    }
    
    // Validar que el valor sea un número positivo para transmission loss
    if (arrayName === 'transmissionLoss') {
      const newErrors = { ...errors };
      if (value === '' || isNaN(Number(value)) || Number(value) < 0) {
        newErrors[`${arrayName}_${index}`] = 'Debe ser un número positivo';
      } else {
        delete newErrors[`${arrayName}_${index}`];
      }
      setErrors(newErrors);
    }
  };

  // Calcula el NRC como el promedio de los coeficientes de absorción en 250, 500, 1000 y 2000 Hz
  const calculateNRC = () => {
    // Indices for 250, 500, 1000, 2000 Hz in FREQUENCY_BANDS: [125, 250, 500, 1000, 2000, 4000]
    const indices = [1, 2, 3, 4];
    const values = indices.map(i => {
      const val = Number(formData.absorption[i]);
      return isNaN(val) ? 0 : val;
    });
    const nrc = values.reduce((sum, v) => sum + v, 0) / values.length;
    return nrc.toFixed(3);
  };

  const handleSubmit = (e:any) => {
    e.preventDefault();
    
    // Validar todos los campos
    const requiredFields: (keyof FormDataType)[] = [
      'name', 'surfaceMass', 'thickness', 'density', 'rw', 'c', 'ctr',
      'flowResistivity', 'porosity', 'tortuosity', 'youngModulus',
      'poissonRatio', 'dampingLoss'
    ];
    
    let hasErrors = false;
    const newErrors: Record<string, string> = {};

    requiredFields.forEach(field => {
      if (!formData[field] || formData[field] === '') {
        newErrors[field as string] = 'Campo requerido';
        hasErrors = true;
      }
    });

    // Validar arrays de absorción y transmission loss
    formData.absorption.forEach((val, index) => {
      if (val === '' || isNaN(Number(val)) || Number(val) < 0 || Number(val) > 1) {
        newErrors[`absorption_${index}`] = 'Requerido (0-1)';
        hasErrors = true;
      }
    });

    formData.transmissionLoss.forEach((val, index) => {
      if (val === '' || isNaN(Number(val)) || Number(val) < 0) {
        newErrors[`transmissionLoss_${index}`] = 'Requerido (>0)';
        hasErrors = true;
      }
    });

    if (hasErrors) {
      setErrors(newErrors);
      return;
    }

    // Crear el objeto del material
    const newMaterial = {
      surfaceMass: Number(formData.surfaceMass),
      thickness: Number(formData.thickness),
      density: Number(formData.density),
      absorption: formData.absorption.map(val => Number(val)),
      nrc: Number(calculateNRC()),
      transmissionLoss: formData.transmissionLoss.map(val => Number(val)),
      rw: Number(formData.rw),
      c: Number(formData.c),
      ctr: Number(formData.ctr),
      flowResistivity: Number(formData.flowResistivity),
      porosity: Number(formData.porosity),
      tortuosity: Number(formData.tortuosity),
      youngModulus: Number(formData.youngModulus),
      poissonRatio: Number(formData.poissonRatio),
      dampingLoss: Number(formData.dampingLoss)
    };

    onSave({
      name: formData.name,
      category: formData.category,
      properties: newMaterial
    });

    handleReset();
    onClose();
  };

  const handleReset = () => {
    setFormData({
      name: '',
      category: 'WALLS',
      surfaceMass: '',
      thickness: '',
      density: '',
      absorption: ['', '', '', '', '', ''],
      transmissionLoss: ['', '', '', '', '', ''],
      rw: '',
      c: '',
      ctr: '',
      flowResistivity: '',
      porosity: '',
      tortuosity: '',
      youngModulus: '',
      poissonRatio: '',
      dampingLoss: ''
    });
    setErrors({});
    setActiveTab('basic');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center">
            <Plus className="mr-3 text-blue-600" size={24} />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Nuevo Material Acústico</h2>
              <p className="text-sm text-gray-600">Definir propiedades según ISO 12354-4</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 bg-gray-50">
          <div className="flex space-x-1 p-1">
            {[
              { id: 'basic', label: 'Información Básica' },
              { id: 'acoustic', label: 'Propiedades Acústicas' },
              { id: 'mechanical', label: 'Propiedades Mecánicas' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white text-blue-600 shadow-sm border border-gray-200'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            {/* Basic Information Tab */}
            {activeTab === 'basic' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre del Material *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Ej: Pared de Concreto Personalizada"
                    />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Categoría *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {Object.entries(MATERIAL_CATEGORIES).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Masa Superficial (kg/m²) *
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={formData.surfaceMass}
                      onChange={(e) => handleInputChange('surfaceMass', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.surfaceMass ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.surfaceMass && <p className="text-red-500 text-xs mt-1">{errors.surfaceMass}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Espesor (m) *
                    </label>
                    <input
                      type="number"
                      step="0.001"
                      min="0"
                      value={formData.thickness}
                      onChange={(e) => handleInputChange('thickness', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.thickness ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.thickness && <p className="text-red-500 text-xs mt-1">{errors.thickness}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Densidad (kg/m³) *
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={formData.density}
                      onChange={(e) => handleInputChange('density', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.density ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.density && <p className="text-red-500 text-xs mt-1">{errors.density}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* Acoustic Properties Tab */}
            {activeTab === 'acoustic' && (
              <div className="space-y-6">
                {/* Coeficientes de Absorción */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Coeficientes de Absorción por Banda de Frecuencia *
                  </label>
                  <div className="bg-blue-50 p-4 rounded-lg mb-4">
                    <div className="flex items-center">
                      <Info size={16} className="text-blue-600 mr-2" />
                      <p className="text-sm text-blue-800">
                        Valores entre 0 y 1. NRC calculado: <strong>{calculateNRC()}</strong>
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {FREQUENCY_BANDS.map((freq, index) => (
                      <div key={index}>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          {freq} Hz
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          max="1"
                          value={formData.absorption[index]}
                          onChange={(e) => handleArrayInputChange('absorption', index, e.target.value)}
                          className={`w-full px-2 py-1 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${
                            errors[`absorption_${index}`] ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {errors[`absorption_${index}`] && (
                          <p className="text-red-500 text-xs mt-1">{errors[`absorption_${index}`]}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pérdidas de Transmisión */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Pérdidas de Transmisión por Banda de Frecuencia (dB) *
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {FREQUENCY_BANDS.map((freq, index) => (
                      <div key={index}>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          {freq} Hz
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          value={formData.transmissionLoss[index]}
                          onChange={(e) => handleArrayInputChange('transmissionLoss', index, e.target.value)}
                          className={`w-full px-2 py-1 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${
                            errors[`transmissionLoss_${index}`] ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {errors[`transmissionLoss_${index}`] && (
                          <p className="text-red-500 text-xs mt-1">{errors[`transmissionLoss_${index}`]}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Índices Acústicos */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rw (dB) *
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={formData.rw}
                      onChange={(e) => handleInputChange('rw', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.rw ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.rw && <p className="text-red-500 text-xs mt-1">{errors.rw}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      C (dB) *
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.c}
                      onChange={(e) => handleInputChange('c', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.c ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.c && <p className="text-red-500 text-xs mt-1">{errors.c}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ctr (dB) *
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.ctr}
                      onChange={(e) => handleInputChange('ctr', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.ctr ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.ctr && <p className="text-red-500 text-xs mt-1">{errors.ctr}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Resistividad al Flujo (Pa·s/m²) *
                    </label>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      value={formData.flowResistivity}
                      onChange={(e) => handleInputChange('flowResistivity', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.flowResistivity ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.flowResistivity && <p className="text-red-500 text-xs mt-1">{errors.flowResistivity}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* Mechanical Properties Tab */}
            {activeTab === 'mechanical' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Porosidad (%) *
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={formData.porosity}
                      onChange={(e) => handleInputChange('porosity', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.porosity ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.porosity && <p className="text-red-500 text-xs mt-1">{errors.porosity}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tortuosidad *
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="1"
                      value={formData.tortuosity}
                      onChange={(e) => handleInputChange('tortuosity', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.tortuosity ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.tortuosity && <p className="text-red-500 text-xs mt-1">{errors.tortuosity}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Módulo de Young (Pa) *
                    </label>
                    <input
                      type="number"
                      step="1000000"
                      min="0"
                      value={formData.youngModulus}
                      onChange={(e) => handleInputChange('youngModulus', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.youngModulus ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.youngModulus && <p className="text-red-500 text-xs mt-1">{errors.youngModulus}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Coeficiente de Poisson *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="0.5"
                      value={formData.poissonRatio}
                      onChange={(e) => handleInputChange('poissonRatio', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.poissonRatio ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.poissonRatio && <p className="text-red-500 text-xs mt-1">{errors.poissonRatio}</p>}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Factor de Pérdida por Amortiguamiento *
                    </label>
                    <input
                      type="number"
                      step="0.001"
                      min="0"
                      value={formData.dampingLoss}
                      onChange={(e) => handleInputChange('dampingLoss', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.dampingLoss ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.dampingLoss && <p className="text-red-500 text-xs mt-1">{errors.dampingLoss}</p>}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm text-gray-600">
              <AlertCircle size={16} className="mr-2" />
              Los campos marcados con * son obligatorios
            </div>
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
              >
                Limpiar
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center"
              >
                <Save size={16} className="mr-2" />
                Guardar Material
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente de demostración
const MaterialsCreatorDemo = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [materials, setMaterials] = useState<{ name: string; category: string; properties: any }[]>([]);

  const handleSaveMaterial = (materialData: { name: string; category: string; properties: any }) => {
    console.log('Nuevo material creado:', materialData);
    setMaterials(prev => [...prev, materialData]);
    alert(`Material "${materialData.name}" creado exitosamente!`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Sistema de Gestión de Materiales Acústicos
          </h1>
          <p className="text-gray-600 mb-8">
            Crea nuevos materiales con sus propiedades acústicas y mecánicas según la norma ISO 12354-4.
          </p>

          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium flex items-center"
          >
            <Plus size={20} className="mr-2" />
            Crear Nuevo Material
          </button>

          {materials.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Materiales Creados ({materials.length})
              </h2>
              <div className="space-y-3">
                {materials.map((material, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium text-gray-900">{material.name}</h3>
                    <p className="text-sm text-gray-600">
                      Categoría: {MATERIAL_CATEGORIES[material.category as keyof typeof MATERIAL_CATEGORIES]} | 
                      Rw: {material.properties.rw} dB | 
                      NRC: {material.properties.nrc.toFixed(3)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <NewMaterialModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveMaterial}
      />
    </div>
  );
};

export default MaterialsCreatorDemo;