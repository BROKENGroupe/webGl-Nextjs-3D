import { OnboardingField } from "../../types/onboarding";

interface SelectCardsProps {
  field: OnboardingField;
  value: string;
  onSelect: (fieldName: string, value: string) => void;
}

export default function SelectCards({ field, value, onSelect }: SelectCardsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-2">
      {field.options?.map((opt) => (
        <button
          type="button"
          key={opt.value}
          className={`
            relative rounded-lg border-2 p-4 text-sm font-medium shadow-sm transition-all duration-200 
            flex flex-col items-center justify-center min-h-[80px] hover:scale-105
            ${value === opt.value
              ? "border-black bg-gray-50 text-black shadow-md" 
              : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-md text-gray-700"
            }
          `}
          onClick={() => onSelect(field.name, opt.value)}
        >
          {/* ✅ Icono si existe */}
          {opt.icon && (
            <span className="text-2xl mb-2" role="img" aria-label={opt.label}>
              {opt.icon}
            </span>
          )}
          
          {/* ✅ Label */}
          <span className="text-center leading-tight">{opt.label}</span>
          
          {/* ✅ Descripción si existe */}
          {opt.description && (
            <span className="text-xs text-gray-500 mt-1 text-center line-clamp-2">
              {opt.description}
            </span>
          )}
          
          {/* ✅ Indicador de selección negro */}
          {value === opt.value && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-black rounded-full flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </button>
      ))}
    </div>
  );
}