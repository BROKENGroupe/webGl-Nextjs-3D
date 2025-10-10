"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { LoadingComponent } from "../atoms/loadingcomponent";

interface AppInitializerProps {
  children: React.ReactNode;
}

export function AppInitializer({ children }: AppInitializerProps) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [isReady, setIsReady] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState(
    "Iniciando aplicación..."
  );

  // ✅ Verificar si es página pública
  const isPublicPage = pathname === "/" || pathname?.startsWith("/auth/");

  useEffect(() => {
    const initializeApp = async () => {
      // ✅ Si es página pública, cargar inmediatamente
      if (isPublicPage) {
        console.log("📄 Public page - loading immediately");
        setIsReady(true);
        return;
      }

      // ✅ Esperar a que NextAuth termine de cargar
      if (status === "loading") {
        setLoadingMessage("Verificando sesión...");
        return;
      }

      try {
        // ✅ Simular carga de recursos necesarios
        setLoadingMessage("Preparando workspace...");
        await new Promise((resolve) => setTimeout(resolve, 800));

        setLoadingMessage("Cargando configuración...");
        await new Promise((resolve) => setTimeout(resolve, 600));

        setLoadingMessage("Finalizando...");
        await new Promise((resolve) => setTimeout(resolve, 400));

        console.log("✅ App initialized successfully");
        setIsReady(true);
      } catch (error) {
        console.error("❌ Error initializing app:", error);
        setIsReady(true); // Continuar incluso si hay error
      }
    };

    initializeApp();
  }, [status, isPublicPage, pathname]);

  // ✅ Mostrar loader sutil mientras no esté listo
  if (!isReady && !isPublicPage) {
    return <LoadingComponent />;
  }

  return <>{children}</>;
}
