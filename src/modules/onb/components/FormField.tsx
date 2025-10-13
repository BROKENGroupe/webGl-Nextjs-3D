import { OnboardingField } from "../types/onboarding";
import RadioGroup from "./fields/radioGroup";
import SelectCards from "./fields/selectCards";
import TextInput from "./fields/textInput";

interface FormFieldProps {
  field: OnboardingField;
  formData: { [key: string]: string }; 
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelect: (fieldName: string, value: string) => void;
}

export default function FormField({ field, formData, onChange, onSelect }: FormFieldProps) {
  const value = formData[field.name] || "";

  return (
    <div className="w-full">
      <label
        className="block mb-3 text-lg text-neutral-800 font-medium"
        htmlFor={field.name}
      >
        {field.label}
      </label>
      
      {field.type === "radio" ? (
        <RadioGroup 
          field={field} 
          value={value} 
          onChange={onChange} 
        />
      ) : field.type === "select-cards" ? (
        <SelectCards field={field} value={value} onSelect={onSelect} />
      ) : (
        <TextInput field={field} value={value} onChange={onChange} />
      )}
    </div>
  );
}