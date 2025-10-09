import { OnboardingField } from "../../types/onboarding";

interface SelectCardsProps {
  field: OnboardingField;
  value: string;
  onSelect: (fieldName: string, value: string) => void;
}

export default function SelectCards({ field, value, onSelect }: SelectCardsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
      {field.options?.map((opt) => (
        <button
          type="button"
          key={opt.value}
          className={`rounded-xl border-2 px-6 py-8 text-lg font-medium shadow-sm transition flex flex-col items-center justify-center min-h-[120px]
            ${value === opt.value
              ? "border-black bg-neutral-100"
              : "border-neutral-200 bg-white hover:border-black"
            }`}
          onClick={() => onSelect(field.name, opt.value)}
        >
          <span>{opt.label}</span>
          {value === opt.value && (
            <span className="block mt-3 text-xs bg-black text-white px-3 py-1 rounded">
              Seleccionado
            </span>
          )}
        </button>
      ))}
    </div>
  );
}