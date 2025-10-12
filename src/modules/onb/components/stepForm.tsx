// components/onboarding/StepForm.tsx
import React from 'react';
import { motion, AnimatePresence } from "framer-motion";
import TextInput from './fields/textInput';
import SelectCards from './fields/selectCards';
import SelectCardsMultiple from './fields/selectCardsMultiple';
import { OnboardingStep, OnboardingFormData } from '../types/onboarding';

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
  
  const renderField = (field: any) => {
    const value = formData[field.name as keyof OnboardingFormData];
    
    console.log(`🔍 Rendering field: ${field.name}, type: ${field.type}, value:`, value); // ✅ Debug

    switch (field.type) {
      case 'select-cards-multiple':
        console.log(`🎯 SelectCardsMultiple - field: ${field.name}, onMultipleSelect:`, !!onMultipleSelect); // ✅ Debug
        return (
          <SelectCardsMultiple
            field={field}
            value={Array.isArray(value) ? value : []}
            onSelect={onMultipleSelect}
          />
        );
      
      case 'select-cards':
        return (
          <SelectCards
            field={field}
            value={typeof value === 'string' ? value : ''}
            onSelect={onSelect}
          />
        );
      
      // case 'select':
      //   return (
      //     <SelectInput
      //       field={field}
      //       value={typeof value === 'string' ? value : ''}
      //       onChange={onChange}
      //     />
      //   );
        
      case 'text':
      case 'email':
      case 'tel':
      default:
        return (
          <TextInput
            field={field}
            value={typeof value === 'string' ? value : ''}
            onChange={onChange}
          />
        );
    }
  };

  return (
    <form
      id="onboarding-form"
      className="w-full max-w-2xl"
      onSubmit={onSubmit}
      autoComplete="off"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={stepIndex}
          variants={variants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.4 }}
          className="flex flex-col gap-8"
        >
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">{step.title}</h2>
            {step.subtitle && (
              <p className="text-gray-600">{step.subtitle}</p>
            )}
          </div>
          
          <div className="space-y-6">
            {step.fields.map((field) => (
              <div key={field.name}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                {renderField(field)}
              </div>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </form>
  );
}