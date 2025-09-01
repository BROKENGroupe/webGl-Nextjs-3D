'use client'

import { useState, useEffect } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

interface Material {
  id: number
  name: string
  description: string
  quantity: number
  price: number
  category: string
  supplier: string
}

interface MaterialModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (formData: Omit<Material, 'id'>) => void
  material?: Material | null
  categories: string[]
  suppliers: string[]
}

const formSteps = [
  { title: "Información Básica", fields: ['name', 'description'] },
  { title: "Propiedades", fields: ['sw', 'md'] },
  { title: "Clasificación", fields: ['category'] }
]

export default function MaterialModal({
  isOpen,
  onClose,
  onSubmit,
  material,
  categories,
  suppliers
}: MaterialModalProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    quantity: 0,
    price: 0,
    category: '',
    supplier: ''
  })

  // Reset form when modal opens/closes or material changes
  useEffect(() => {
    if (isOpen) {
      if (material) {
        setFormData({
          name: material.name,
          description: material.description,
          quantity: material.quantity,
          price: material.price,
          category: material.category,
          supplier: material.supplier
        })
      } else {
        setFormData({
          name: '',
          description: '',
          quantity: 0,
          price: 0,
          category: '',
          supplier: ''
        })
      }
      setCurrentStep(0)
    }
  }, [isOpen, material])

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = () => {
    onSubmit(formData)
    onClose()
  }

  const nextStep = () => {
    if (currentStep < formSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleSubmit()
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const renderFormStep = () => {
    const currentFields = formSteps[currentStep].fields

    return (
      <div className="space-y-4">
        {currentFields.map(field => (
          <div key={field}>
            <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
              {field.replace(/([A-Z])/g, ' $1').toLowerCase()}
            </label>
            {field === 'description' ? (
              <textarea
                value={formData[field as keyof typeof formData] as string}
                onChange={(e) => handleInputChange(field, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="Descripción del material..."
              />
            ) : field === 'category' ? (
              <select
                value={formData[field]}
                onChange={(e) => handleInputChange(field, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Seleccionar categoría</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            ) : field === 'supplier' ? (
              <select
                value={formData[field]}
                onChange={(e) => handleInputChange(field, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Seleccionar proveedor</option>
                {suppliers.map(sup => (
                  <option key={sup} value={sup}>{sup}</option>
                ))}
              </select>
            ) : (
              <input
                type={field === 'quantity' || field === 'price' ? 'number' : 'text'}
                step={field === 'price' ? '0.01' : '1'}
                min={field === 'quantity' || field === 'price' ? '0' : undefined}
                value={formData[field as keyof typeof formData]}
                onChange={(e) => handleInputChange(field, 
                  field === 'quantity' || field === 'price' 
                    ? parseFloat(e.target.value) || 0 
                    : e.target.value
                )}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={
                  field === 'name' ? 'Nombre del material...' :
                  field === 'quantity' ? '0' :
                  field === 'price' ? '0.00' : ''
                }
              />
            )}
          </div>
        ))}
      </div>
    )
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-opacity-700 backdrop-blur-sm flex items-center justify-center p-4 z-100">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto shadow-xl">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {material ? 'Editar Material' : 'Agregar Material'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Progress Indicator */}
        <div className="px-6 pt-4">
          <div className="flex items-center justify-between mb-4">
            {formSteps.map((step, index) => (
              <div key={index} className="flex items-center flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  index <= currentStep 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {index + 1}
                </div>
                <span className={`ml-2 text-xs font-medium transition-colors ${
                  index <= currentStep ? 'text-blue-600' : 'text-gray-500'
                }`}>
                  {step.title}
                </span>
                {index < formSteps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-3 transition-colors ${
                    index < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Modal Content */}
        <div className="px-6 py-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {formSteps[currentStep].title}
          </h3>
          {renderFormStep()}
        </div>

        {/* Modal Footer */}
        <div className="flex justify-between items-center px-6 py-4 bg-gray-50 border-t border-gray-200">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              currentStep === 0
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-700 hover:bg-gray-200'
            }`}
          >
            <ChevronLeft size={16} />
            Anterior
          </button>

          <span className="text-sm text-gray-500">
            {currentStep + 1} de {formSteps.length}
          </span>

          <button
            onClick={nextStep}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {currentStep === formSteps.length - 1 ? 'Guardar' : 'Siguiente'}
            {currentStep < formSteps.length - 1 && <ChevronRight size={16} />}
          </button>
        </div>
      </div>
    </div>
  )
}