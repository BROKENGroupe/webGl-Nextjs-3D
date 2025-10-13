// src/modules/onb/components/fields/selectCardsMultiple.tsx
import React from 'react';
import { OnboardingField } from '../../types/onboarding';

interface SelectCardsMultipleProps {
  field: OnboardingField;
  value: string[];
  onSelect: (fieldName: string, values: string[]) => void;
}

export default function SelectCardsMultiple({ field, value = [], onSelect }: SelectCardsMultipleProps) {
  
  const handleCardClick = (optionValue: string) => {
    console.log(`🎯 Card clicked: ${optionValue}, current values:`, value);
    
    const newValues = value.includes(optionValue)
      ? value.filter(v => v !== optionValue)
      : [...value, optionValue];
    
    console.log(`🔄 New values:`, newValues);
    
    if (onSelect) {
      onSelect(field.name, newValues);
    } else {
      console.error('❌ onSelect is not defined!');
    }
  };

  return (
    <div className="mt-3">
      {/* ✅ Grid más compacto con más columnas */}
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3">
        {field.options?.map((option) => (
          <div
            key={option.value}
            onClick={() => handleCardClick(option.value)}
            className={`
              relative p-3 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md
              ${value.includes(option.value)
                ? 'border-blue-500 bg-blue-50 shadow-md'
                : 'border-gray-200 bg-white hover:border-gray-300'
              }
            `}
          >
            {/* ✅ Checkbox más pequeño */}
            <div className="absolute top-1.5 right-1.5">
              <div className={`
                w-4 h-4 rounded border-2 flex items-center justify-center transition-colors
                ${value.includes(option.value)
                  ? 'bg-blue-500 border-blue-500'
                  : 'border-gray-300 bg-white'
                }
              `}>
                {value.includes(option.value) && (
                  <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            </div>

            {/* ✅ Contenido más compacto */}
            <div className="text-center pr-4">
              {option.icon && (
                <div className="text-2xl mb-1.5">{option.icon}</div>
              )}
              <div className="font-medium text-gray-900 text-xs leading-tight">{option.label}</div>
              {option.description && (
                <div className="text-xs text-gray-500 mt-0.5 leading-tight">{option.description}</div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {/* ✅ Resumen más compacto */}
      {/* {value.length > 0 && (
        <div className="mt-3 p-2.5 bg-blue-50 rounded-lg border border-blue-200">
          <div className="text-xs text-blue-700 font-medium mb-1.5">
            Seleccionados ({value.length}):
          </div>
          <div className="flex flex-wrap gap-1.5">
            {value.map(val => {
              const option = field.options?.find(opt => opt.value === val);
              return (
                <span 
                  key={val} 
                  className="inline-flex items-center px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded"
                >
                  {option?.icon && <span className="mr-1 text-xs">{option.icon}</span>}
                  <span className="text-xs">{option?.label}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCardClick(val);
                    }}
                    className="ml-1 text-blue-600 hover:text-blue-800 text-sm leading-none"
                  >
                    ×
                  </button>
                </span>
              );
            })}
          </div>
        </div>
      )} */}
    </div>
  );
}