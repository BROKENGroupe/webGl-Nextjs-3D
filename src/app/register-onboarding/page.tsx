"use client";
import { LoadingComponent } from "@/components/atoms/loadingcomponent";
import { ProtectedRoute } from "../auth/protectedRoute";
  
export default function RegisterOnboardingPage() {
  const onboardingComponent = () => import("@/modules/onb/components/onboarding");
  return (
    <ProtectedRoute
      permission="onboarding:view" 
      component={onboardingComponent} 
      loading={<LoadingComponent />}
      allowWithoutPermissions={true} 
      redirectTo="/auth/login" 
    />
  );
}

