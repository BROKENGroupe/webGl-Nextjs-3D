// components/onboarding/StepForm.tsx
import { motion, AnimatePresence } from "framer-motion";
import FormField from './FormField';
import { OnboardingStep } from "../types/onboarding";

interface StepFormProps {
  step: OnboardingStep;
  stepIndex: number;
  formData: { [key: string]: string };
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelect: (fieldName: string, value: string) => void;
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
  onSubmit 
}: StepFormProps) {
  return (
    <form
      id="onboarding-form"
      className="w-full"
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
          <h2 className="text-3xl font-semibold text-center mb-6 text-neutral-900">
            {step.title}
          </h2>
          
          <div className="flex flex-col gap-6">
            {step.fields.map((field) => (
              <FormField
                key={field.name}
                field={field}
                formData={formData}
                onChange={onChange}
                onSelect={onSelect}
              />
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </form>
  );
}