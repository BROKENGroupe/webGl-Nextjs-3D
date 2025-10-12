import React from 'react';
import { OnboardingField } from "../../types/onboarding";


interface TextInputProps {
  field: OnboardingField;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function TextInput({ field, value, onChange }: TextInputProps) {
  const getInputType = () => {
    switch (field.type) {
      case 'email': return 'email';
      case 'tel': return 'tel'; // ✅ Soporte para teléfono
      default: return 'text';
    }
  };

  return (
    <div className="mt-2">
      <input
        type={getInputType()}
        name={field.name}
        placeholder={field.placeholder}
        value={value}
        onChange={onChange}
        required={field.required}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        minLength={field.validation?.minLength}
        maxLength={field.validation?.maxLength}
      />
    </div>
  );
}