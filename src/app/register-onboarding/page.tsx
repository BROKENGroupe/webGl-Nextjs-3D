"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { registerAccount } from "@/services/userService";
import OnboardingHeader from "@/modules/onb/components/onboardingHeader";
import ProgressBar from "@/modules/onb/components/progressBar";
import StepForm from "@/modules/onb/components/stepForm";
import { ONBOARDING_STEPS } from "@/modules/onb/constants";
import { useOnboardingValidation } from "@/modules/onb/hooks/useOnboardingValidation";
import NavigationButtons from "@/modules/onb/components/Navigation";
import { OnboardingFormData } from "@/modules/onb/types/onboarding";
import { AccountType } from "@/modules/onb/types/enum";

export default function RegisterOnboardingPage() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<OnboardingFormData>({});
  const [loading, setLoading] = useState(false);
  const totalSteps = ONBOARDING_STEPS.length;
  const router = useRouter();
  const { validateStep, validateFinalSubmission } = useOnboardingValidation();

  useEffect(() => {
    const registerData = localStorage.getItem("registerData");
    if (registerData) {
      try {
        const userData = JSON.parse(registerData);
        setForm((prev) => ({
          ...prev,
          id: userData.id,
          email: userData.email,
          password: userData.password,
        }));
      } catch (error) {
        console.error("Error parsing register data:", error);
      }
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (step !== totalSteps - 1) {
      console.log("No es el último step, no ejecutar submit");
      return;
    }

    const validationError = validateFinalSubmission(form);
    if (validationError) {
      alert(validationError);
      return;
    }

    setLoading(true);

    try {
      const onboardingData = {
        id: form.id || "temp-id",
        name: form.name || "",
        email: form.email || "",
        description: form.businessName
          ? `${form.businessName} - Establecimiento de tipo ${form.businessType} ubicado en ${form.city}`
          : `Establecimiento de tipo ${
              form.businessType || "comercial"
            } ubicado en ${form.city || "No especificada"}`,
        accountType: AccountType.merchant,
        ownerId: form.id || "temp-owner-id",
        department: form.role || "admin",
        city: form.city || "",
        gender: "other" as const,
        birthDate: "1990-01-01",
        platformUsage:
          form.isOwner === "owner"
            ? ("professional" as const)
            : ("educational" as const),
        platformRole:
          form.isOwner === "owner"
            ? ("owner" as const)
            : form.isOwner === "employee"
            ? ("collaborator" as const)
            : ("admin" as const),
        interests: form.businessType
          ? [form.businessType, "acustica", "control-ruido"]
          : ["comercial"],
        experience:
          form.role && form.businessName
            ? `${form.role} en ${form.businessName}`
            : form.role
            ? `${form.role}`
            : "Sin experiencia especificada",
        acceptTerms: true,
      };

      console.log("📋 Datos enviados desde el formulario:", onboardingData);

      const res = await registerAccount(onboardingData);

      if (res.user) {
        console.log("✅ Cuenta creada:", res.user.name);

        const signInResult = await signIn("credentials", {
          email: res.user.email,
          password: form.password,
          redirect: false,
        });

        if (signInResult?.ok) {
          console.log("✅ Login automático exitoso");
          sessionStorage.removeItem("registerData");
          router.push("/home");
        } else {
          throw new Error("Error en el login automático");
        }
      } else {
        throw new Error("Error al crear la cuenta");
      }
    } catch (error: any) {
      console.error("❌ Error en el onboarding:", error);
      alert(
        "Error al crear la cuenta: " + (error.message || "Error desconocido")
      );
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
              onSubmit={handleSubmit}
            />
          </div>

          {/* ✅ Usar NavigationButtons en lugar de Navigation */}
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
