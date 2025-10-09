"use client";
import { ProtectedRoute } from "@/app/auth/protectedRoute";
import { LoadingComponent } from "@/components/atoms/loadingcomponent";

// ✅ Referencia estable al componente Dashboard
const dashboardComponent = () => import("@/components/dashboard/DashboardContent");

export default function HomePage() {
  return (
    <ProtectedRoute
      permission="dashboard:view"
      component={dashboardComponent}
      loading={<LoadingComponent />}
    />
  );
}