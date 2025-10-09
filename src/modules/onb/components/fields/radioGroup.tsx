import { OnboardingField } from "../../types/onboarding";

interface RadioGroupProps {
  field: OnboardingField;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function RadioGroup({ field, value, onChange }: RadioGroupProps) {
  return (
    <div className="flex flex-col gap-4">
      {field.options?.map((opt) => (
        <label
          key={opt.value}
          className="flex items-center gap-3 text-neutral-700 cursor-pointer p-4 border border-neutral-200 rounded-lg hover:border-black transition"
        >
          <input
            type="radio"
            name={field.name}
            value={opt.value}
            checked={value === opt.value}
            onChange={onChange}
            className="accent-black w-5 h-5"
          />
          <span className="text-base">{opt.label}</span>
        </label>
      ))}
    </div>
  );
}