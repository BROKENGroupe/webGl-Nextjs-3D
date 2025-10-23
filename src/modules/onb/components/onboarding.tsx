// src/modules/onb/components/OnboardingWizard.tsx
import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import OnboardingHeader from "./onboardingHeader";
import ProgressBar from "./progressBar";
import StepForm from "./stepForm";
import { ONBOARDING_STEPS } from "../constants";
import { useOnboardingValidation } from "../hooks/useOnboardingValidation";
import NavigationButtons from "./Navigation";
import { OnboardingFormData } from "../types/onboarding";
import { AccountType } from "../types/enum";
import { registerOnboardingAction } from "@/actions/user/user";
export default function OnboardingWizard() {
  const { update } = useSession();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<OnboardingFormData>({});
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const totalSteps = ONBOARDING_STEPS.length;
  const { validateStep } = useOnboardingValidation();

  // ✅ Actualizar para soportar más tipos de input
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelect = (fieldName: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  // ✅ Nueva función para selección múltiple
  const handleMultipleSelect = (fieldName: string, values: string[]) => {
    setForm((prev) => ({
      ...prev,
      [fieldName]: values,
    }));
  };

  const handleNext = () => {
    const error = validateStep(step, form);
    if (error) {
      alert(error);
      return;
    }

    if (step < totalSteps - 1) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleSubmit = async (values: OnboardingFormData) => {
    setLoading(true);
    try {           
      const onboardingData = {
        ...values,
        accountType: AccountType.merchant,
        acceptTerms: true,
        registrationComplete: true,
      };
      
      const result = await registerOnboardingAction(onboardingData);  
      if (result.error) {
        console.error("❌ Error en el onboarding:", result.error);
      } else {
        await update({ user: { ...values, registrationComplete: true } });
        router.push("/home");
      }
    } catch (error: any) {
      
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Columna izquierda: Wizard */}
      <div className="w-2/3 flex flex-col relative">
        <OnboardingHeader />
        <ProgressBar currentStep={step} totalSteps={totalSteps} />

        {/* Container principal - Formulario centrado */}
        <div className="flex-1 flex flex-col justify-center items-center px-16 py-24">
          <div className="flex-1 flex items-center justify-center w-full max-w-2xl">
            <StepForm
              step={ONBOARDING_STEPS[step]}
              stepIndex={step}
              formData={form}
              onChange={handleChange}
              onSelect={handleSelect}
              onMultipleSelect={handleMultipleSelect}
              onSubmit={handleSubmit}
            />
          </div>

          <NavigationButtons
            currentStep={step}
            totalSteps={totalSteps}
            loading={loading}
            onNext={handleNext}
            onBack={handleBack}
          />
        </div>
      </div>

      {/* Columna derecha: Imagen */}
      <div className="w-1/3 min-h-screen relative">
        <Image
          src="/assets/images/onm.png"
          alt="Onboarding"
          fill
          style={{ objectFit: "cover" }}
          className="opacity-100"
          priority
        />
      </div>
    </div>
  );
}
