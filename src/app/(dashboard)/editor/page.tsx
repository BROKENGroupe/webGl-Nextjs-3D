"use client";
import { ProtectedRoute } from "@/app/auth/protectedRoute";
import { memo } from "react"; // ✅ Agregar memo

// ✅ Memoizar el componente loading
const LoadingComponent = memo(() => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
      <div>Cargando editor...</div>
    </div>
  </div>
));

LoadingComponent.displayName = 'LoadingComponent';

// ✅ Memoizar la referencia del componente
const editorComponent = () => import("@/modules/editor/components/DrawingScene");

export default function EditorPage() {
  return (
    <ProtectedRoute
      permission="render:view"
      component={editorComponent} // ✅ Referencia estable
      loading={<LoadingComponent />} // ✅ Componente memoizado
    />
  );
}
