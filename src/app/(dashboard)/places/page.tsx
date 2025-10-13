"use client";
import { ProtectedRoute } from "@/app/auth/protectedRoute";
import { LoadingComponent } from "@/components/atoms/loadingcomponent";
const placeComponent = () => import("@/app/(dashboard)/places/placesComponent");

export default function EditorPage() {
  return (
    <ProtectedRoute
      permission="places:view"
      component={placeComponent} 
      loading={<LoadingComponent />} 
      allowWithoutPermissions={true}
    />
  );
}
