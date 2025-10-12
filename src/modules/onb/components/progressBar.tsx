// components/onboarding/ProgressBar.tsx
import { motion } from "framer-motion";

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

export default function ProgressBar({ currentStep, totalSteps }: ProgressBarProps) {
  const progress = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className="absolute top-32 left-0 right-0 z-10 mb-6">
      <div className="w-full flex justify-center">
        <div className="w-[520px] flex items-center gap-4">
          <div className="flex-1 h-1 bg-neutral-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-black rounded-full"
              initial={false}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <span className="text-sm font-medium text-neutral-700 min-w-max">
            Paso {currentStep + 1} de {totalSteps}
          </span>
        </div>
      </div>
    </div>
  );
}