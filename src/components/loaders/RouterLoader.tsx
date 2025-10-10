"use client";
import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { LoadingComponent } from "../atoms/loadingcomponent";

interface RouterLoaderProps {
  children: React.ReactNode;
}

export function RouterLoader({ children }: RouterLoaderProps) {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);
  const [previousPath, setPreviousPath] = useState(pathname);

  useEffect(() => {
    // ✅ Detectar cambio de ruta
    if (previousPath !== pathname) {
      setIsLoading(true);
      setPreviousPath(pathname);

      // ✅ Simular tiempo de carga de página
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [pathname, previousPath]);

  // ✅ Mostrar loader durante navegación
  if (isLoading) {
    return <LoadingComponent />;
  }

  return <>{children}</>;
}
