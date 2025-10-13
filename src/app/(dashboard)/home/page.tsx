"use client";
import { LoadingComponent } from "@/components/atoms/loadingcomponent";
import * as React from "react";
import { ProtectedRoute } from "@/app/auth/protectedRoute";
const loadDashboardContent = () => import("@/components/dashboard/DashboardContent");

export default function EditorPage() {
  return (
    <ProtectedRoute
      permission="dashboard:view"
      component={loadDashboardContent}
      loading={<LoadingComponent />} 
      allowWithoutPermissions={true}
    />
  );
}
