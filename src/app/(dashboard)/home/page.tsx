"use client";

import { LoadingComponent } from "@/components/atoms/loadingcomponent";
import * as React from "react";
import { ProtectedRoute } from "@/app/auth/protectedRoute";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const loadDashboardContent = () => import("@/components/dashboard/DashboardContent");

export default function EditorPage() {
  const router = useRouter();
  const { data: session } = useSession();

  React.useEffect(() => {
    const register = localStorage.getItem("register_onboarding_completed");
    if (session && register === "false") {
      router.replace("/register-onboarding");
    }
  }, [session, router]);

  return (
    <ProtectedRoute
      permission="dashboard:view"
      component={loadDashboardContent}
      loading={<LoadingComponent />}
      allowWithoutPermissions={true}
    />
  );
}
