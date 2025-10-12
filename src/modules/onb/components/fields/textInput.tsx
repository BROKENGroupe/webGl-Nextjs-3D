import React, { useState, useRef } from 'react';
import { UseFormRegister, FieldError } from 'react-hook-form';
import { OnboardingField } from "../../types/onboarding";


interface TextInputProps {
  field: OnboardingField;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  hasError?: boolean;
  error?: FieldError;
  register?: UseFormRegister<any>;
  onBlur?: (fieldName: string, value: string) => void; // ✅ Nueva prop para validar al perder foco
}

export default function TextInput({ 
  field, 
  value, 
  onChange, 
  hasError = false,
  error,
  register,
  onBlur
}: TextInputProps) {
  const [showError, setShowError] = useState(false);
  const [hasBeenTouched, setHasBeenTouched] = useState(false);
  
  const getInputType = () => {
    switch (field.type) {
      case 'email': return 'email';
      case 'tel': return 'tel';
      default: return 'text';
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setHasBeenTouched(true);
    setShowError(true);
    
    // Llamar onBlur personalizado si existe
    if (onBlur) {
      onBlur(field.name, e.target.value);
    }
  };

  const handleFocus = () => {
    // Ocultar error al hacer focus para mejor UX
    if (!hasError) {
      setShowError(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e);
    
    // Si ya ha sido tocado y no hay error, ocultar mensaje
    if (hasBeenTouched && !hasError) {
      setShowError(false);
    }
  };

  // ✅ Registro de react-hook-form si está disponible
  const inputProps = register ? register(field.name as any) : {};

  // ✅ Determinar si mostrar el error
  const shouldShowError = showError && hasBeenTouched && (hasError || error);

  return (
    <div className="mt-2">
      <input
        type={getInputType()}
        placeholder={field.placeholder}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        className={`
          w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent transition-all duration-200
          ${hasError || (error && hasBeenTouched)
            ? 'border-red-300 bg-red-50 focus:ring-red-500 focus:border-red-500 text-red-900 placeholder-red-400' 
            : 'border-gray-300 bg-white focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400'
          }
        `}
        {...inputProps}
      />
      
      {/* ✅ Mensaje de error al perder el foco */}
      {shouldShowError && (
        <div className="mt-1 text-sm text-red-600 flex items-start animate-fadeIn">
          <svg className="w-4 h-4 mr-1 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span>{error?.message || 'Campo requerido'}</span>
        </div>
      )}
    </div>
  );
}