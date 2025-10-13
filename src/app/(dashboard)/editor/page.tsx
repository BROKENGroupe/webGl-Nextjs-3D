"use client";
import { ProtectedRoute } from "@/app/auth/protectedRoute";
import { LoadingComponent } from "@/components/atoms/loadingcomponent";
const editorComponent = () => import("@/modules/editor/components/DrawingScene");

export default function EditorPage() {
  return (
    <ProtectedRoute
      permission="render:view"
      component={editorComponent} 
      loading={<LoadingComponent />} 
    />
  );
}
