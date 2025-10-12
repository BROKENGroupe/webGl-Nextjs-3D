// src/modules/onb/components/OnboardingWizard.tsx
"use client";
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
export default function OnboardingWizard() {
  const { update } = useSession();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<OnboardingFormData>({});
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const totalSteps = ONBOARDING_STEPS.length;
  const { validateStep, validateFinalSubmission } = useOnboardingValidation();

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setLoading(true);

    try {
      // ✅ Generar nombre completo desde firstName y lastName
      const fullName =
        `${form.firstName || ""} ${form.lastName || ""}`.trim() || "Usuario";

      // ✅ Generar descripción más rica
      const businessTypesText =
        form.businessTypes?.join(", ") ||
        form.businessType ||
        "establecimientos comerciales";
      const description = form.businessName
        ? `${form.businessName} - ${businessTypesText} ubicado en ${
            form.city || "ubicación no especificada"
          }`
        : `Propietario/administrador de ${businessTypesText} en ${
            form.city || "No especificada"
          }`;

      // ✅ Mapear mainRole a campos legacy
      const mapMainRoleToLegacy = (mainRole?: string) => {
        switch (mainRole) {
          case "owner":
            return "owner";
          case "admin":
            return "admin";
          case "manager":
            return "manager";
          case "consultant":
            return "consultant";
          default:
            return form.role || "admin";
        }
      };

      // ✅ Determinar platformRole y platformUsage
      const platformRole =
        form.mainRole === "owner"
          ? ("owner" as const)
          : form.mainRole === "employee"
          ? ("collaborator" as const)
          : ("admin" as const);

      const platformUsage =
        form.acousticExperience === "expert" ||
        form.acousticExperience === "advanced"
          ? ("professional" as const)
          : ("educational" as const);

      // ✅ Generar intereses expandidos
      const interests = [
        ...(form.businessTypes || [form.businessType].filter(Boolean)),
        "acustica",
        "control-ruido",
      ].filter(Boolean);

      // ✅ Generar experiencia expandida
      const experienceParts = [
        form.acousticExperience &&
          `Experiencia acústica: ${form.acousticExperience}`,
        form.specificRole && `Rol específico: ${form.specificRole}`,
        form.businessName && `Trabaja en: ${form.businessName}`,
        form.establishmentCount &&
          `Maneja ${form.establishmentCount} establecimiento(s)`,
        form.role && `${form.role}`,
      ].filter(Boolean);

      const experience =
        experienceParts.length > 0
          ? experienceParts.join(". ")
          : "Sin experiencia especificada";

      const onboardingData = {
        id: "temp-id",
        name: fullName, // ✅ Nombre completo generado
        email: form.email || "",
        phone: form.phone, // ✅ Nuevo campo
        description,
        accountType: AccountType.merchant,
        ownerId: form.id || "temp-owner-id",
        department: mapMainRoleToLegacy(form.mainRole), // ✅ Mapeo mejorado
        city: form.city || "",
        gender: "other" as const,
        birthDate: "1990-01-01",
        platformUsage,
        platformRole,
        interests,
        experience,
        acceptTerms: true,

        // ✅ Campos adicionales para referencia futura
        businessTypes: form.businessTypes,
        acousticExperience: form.acousticExperience,
        mainRole: form.mainRole,
        specificRole: form.specificRole,
        establishmentCount: form.establishmentCount,
      };

      console.log("📋 Datos enviados desde el formulario:", onboardingData);
      console.log("📝 Datos originales del formulario:", form);

       // ✅ Función para marcar registro como completado
  
    try {
      await update({        
          registrationComplete: true,
          completedAt: new Date().toISOString() 
      });
      router.refresh();
      console.log("✅ Sesión actualizada - Registration marked as complete");
    } catch (error) {
      console.error('❌ Error updating session:', error);
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
