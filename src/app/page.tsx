"use client";
import { redirect } from "next/navigation";
import { useSession } from "next-auth/react";
import { LoadingComponent } from "@/components/atoms/loadingcomponent";

export default function HomePage() {
  const { data: session, status } = useSession();

  // ✅ Mostrar loader mientras verifica sesión
  if (status === "loading") {
    return <LoadingComponent />;
  }

  // ✅ Redireccionar basado en sesión
  if (session) {
    redirect("/home");
  } else {
    redirect("/auth/login");
  }

  // Fallback (no debería mostrarse)
  return <LoadingComponent />;
}
