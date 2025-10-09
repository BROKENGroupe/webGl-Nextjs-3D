// components/onboarding/Navigation.tsx
interface NavigationProps {
  currentStep: number;
  totalSteps: number;
  loading: boolean;
  onNext: () => void;
  onBack: () => void;
}

export default function Navigation({ 
  currentStep, 
  totalSteps, 
  loading, 
  onNext, 
  onBack 
}: NavigationProps) {
  const isLastStep = currentStep === totalSteps - 1;

  return (
    <div className="w-full max-w-2xl flex justify-between items-center pt-12">
      {currentStep > 0 ? (
        <button
          type="button"
          onClick={onBack}
          className="text-neutral-600 text-base underline underline-offset-4 hover:text-black transition"
        >
          Atrás
        </button>
      ) : (
        <div />
      )}
      
      {!isLastStep ? (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onNext();
          }}
          className="bg-black text-white px-8 py-4 rounded-lg font-semibold text-base hover:bg-neutral-800 transition shadow-lg"
        >
          Siguiente
        </button>
      ) : (
        <button
          type="submit"
          form="onboarding-form"
          disabled={loading}
          className="bg-black text-white px-8 py-4 rounded-lg font-semibold text-base hover:bg-neutral-800 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" strokeDasharray="32" strokeDashoffset="32"></circle>
              </svg>
              Creando cuenta...
            </span>
          ) : (
            "Finalizar"
          )}
        </button>
      )}
    </div>
  );
}