// components/onboarding/StepForm.tsx
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from "framer-motion";
import TextInput from './fields/textInput';
import SelectCards from './fields/selectCards';
import SelectCardsMultiple from './fields/selectCardsMultiple';
import { OnboardingStep, OnboardingFormData } from '../types/onboarding';
import { stepSchemas } from '../../../schemas/onboarding.schema';

interface StepFormProps {
  step: OnboardingStep;
  stepIndex: number;
  formData: OnboardingFormData;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  onSelect: (fieldName: string, value: string) => void;
  onMultipleSelect: (fieldName: string, values: string[]) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const variants = {
  initial: { opacity: 0, x: 80 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -80 },
};

export default function StepForm({ 
  step, 
  stepIndex, 
  formData, 
  onChange, 
  onSelect, 
  onMultipleSelect,
  onSubmit 
}: StepFormProps) {
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors, isValid, touchedFields },
  } = useForm({
    resolver: zodResolver(stepSchemas[stepIndex]), 
    mode: "onBlur", 
    defaultValues: (() => {     
      const defaults: any = {};
      step.fields.forEach(field => {
        const value = formData[field.name as keyof OnboardingFormData];
        if (field.type === 'select-cards-multiple') {
          defaults[field.name] = Array.isArray(value) ? value : [];
        } else {
          defaults[field.name] = value || '';
        }
      });
      return defaults;
    })(),
  });

  useEffect(() => {
    step.fields.forEach(field => {
      const value = formData[field.name as keyof OnboardingFormData];
      if (value !== undefined) {
        setValue(field.name as any, value);
      }
    });
  }, [formData, step.fields, setValue]);

  const watchedValues = watch();
  
  useEffect(() => {
    Object.keys(watchedValues).forEach(key => {
      const value = watchedValues[key as keyof typeof watchedValues];
      const currentValue = formData[key as keyof OnboardingFormData];
      
      if (JSON.stringify(value) !== JSON.stringify(currentValue)) {
        if (Array.isArray(value)) {
          onMultipleSelect(key, value);
        } else if (typeof value === 'string') {
          const field = step.fields.find(f => f.name === key);
          if (field?.type?.includes('select')) {
            onSelect(key, value);
          } else {
            const event = {
              target: { name: key, value: value }
            } as React.ChangeEvent<HTMLInputElement>;
            onChange(event);
          }
        }
      }
    });
  }, [watchedValues]);

  const handleFieldBlur = async (fieldName: string, value: string) => {
    await trigger(fieldName as any);
  };

  const onFormSubmit = (data: any) => {
    const event = { preventDefault: () => {} } as React.FormEvent;
    onSubmit(event);
  };

  const onFormError = (errors: any) => {
    console.log(`❌ Step ${stepIndex} validation failed:`, errors);
  };

  const renderField = (field: any) => {
    const fieldName = typeof field.name === 'string' ? field.name : String(field.name);
    const error = errors[fieldName];
    const hasError = !!error;
    
    switch (field.type) {
      case 'select-cards-multiple':
        return (
          <div>
            <SelectCardsMultiple
              field={field}
              value={watchedValues[field.name] || []}
              onSelect={(fieldName, values) => {
                setValue(fieldName as any, values);
                onMultipleSelect(fieldName, values);
                trigger(fieldName as any);
              }}
            />
            {error && touchedFields[field.name] && (
              <div className="mt-2 text-sm text-red-600 flex items-center animate-fadeIn">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {typeof error?.message === 'string' ? error.message : null}
              </div>
            )}
          </div>
        );
      
      case 'select-cards':
        return (
          <div>
            <SelectCards
              field={field}
              value={watchedValues[field.name] || ''}
              onSelect={(fieldName, value) => {
                setValue(fieldName as any, value);
                onSelect(fieldName, value);
                trigger(fieldName as any);
              }}
            />
            {error && touchedFields[field.name] && (
              <div className="mt-2 text-sm text-red-600 flex items-center animate-fadeIn">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {typeof error?.message === 'string' ? error.message : null}
              </div>
            )}
          </div>
        );
        
      case 'text':
      case 'email':
      case 'tel':
      case 'date':
      default:
        return (
          <TextInput
            field={field}
            value={watchedValues[field.name] || ''}
            onChange={(e) => {
              setValue(field.name as any, e.target.value);
              onChange(e);
            }}
            hasError={hasError}
            error={error && typeof error === 'object' && 'type' in error ? error as import('react-hook-form').FieldError : undefined}
            register={register}
            onBlur={handleFieldBlur}
          />
        );
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-6">
      <form
        id="onboarding-form"
        className="w-full"
        onSubmit={handleSubmit(onFormSubmit, onFormError)}
        autoComplete="off"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={stepIndex}
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="space-y-8"
          >
            {/* ✅ Header reorganizado como en la imagen */}
            <div className="flex items-start justify-between mt-20">
              {/* Lado izquierdo - Paso y título */}
              <div className="flex-1">
               
                
                {/* <div className="border-b-2 border-gray-900 pb-2 mb-4 max-w-md">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {step.title}
                  </h1>
                </div> */}
                
                {step.subtitle && (
                  <h4 className="text-sm text-gray-600 max-w-lg font-bold">
                    {step.subtitle}
                  </h4>
                )}
              </div>

              {/* Lado derecho - Indicadores de progreso */}
              {/* <div className="flex flex-col items-end">
                
                <div className="flex space-x-1">
                  {Array.from({ length: 7 }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-2.5 h-2.5 rounded-full transition-colors duration-300 ${
                        i <= stepIndex ? 'bg-black' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div> */}
            </div>

            {/* ✅ Campos del formulario */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
              {step.fields.map((field) => {
                const isFullWidth = ['select-cards', 'select-cards-multiple', 'textarea'].includes(field.type);
                
                return (
                  <div 
                    key={field.name}
                    className={`space-y-3 ${isFullWidth ? 'md:col-span-2' : ''}`}
                  >
                    <label className="block text-sm font-medium text-gray-700">
                      {field.label}
                      {field.required && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </label>
                    
                    {renderField(field)}
                  </div>
                );
              })}
            </div>

            {/* ✅ Indicador de validación */}
            {Object.keys(touchedFields).length > 0 && (
              <div className="flex justify-center mt-8">
                <div className={`
                  px-4 py-2 rounded-full text-sm font-medium flex items-center space-x-2 transition-all duration-300
                  ${isValid 
                    ? 'bg-green-50 text-green-700 border border-green-200' 
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }
                `}>
                  {isValid ? (
                    <>
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Información completa</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <span>Completa los campos requeridos</span>
                    </>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </form>
    </div>
  );
}