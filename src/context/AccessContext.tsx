"use client";

import React, {
  createContext,
  useContext,
  ReactNode,
  useEffect,
  useState,
} from "react";
import { useSession } from "next-auth/react";

interface AccessContextProps {
  permissions: { [key: string]: boolean };
  modules: string[];
  role: string;
  workspace: any;
  user: any;
  hasPermission: (permission: string) => boolean;
  isLoading: boolean;
  isReady: boolean;
}

const AccessContext = createContext<AccessContextProps | undefined>(undefined);

export function AccessProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const [isReady, setIsReady] = useState(false);

  //   Estados basados en el status de NextAuth
  const isLoading = status === "loading";
  const isAuthenticated = status === "authenticated";
  const isUnauthenticated = status === "unauthenticated";

  //   Procesar datos solo cuando el status esté listo
  useEffect(() => {
    //   Solo procesar cuando NextAuth haya terminado de cargar
    if (status === "loading") {
      setIsReady(false);
      return;
    }

    //   Marcar como listo independientemente de si hay sesión o no
    setIsReady(true);
  }, [status, session]);

  //   Procesar permisos solo cuando esté listo
  let permissions: Record<string, boolean> = {};

  if (isReady && session?.user?.permissions) {
    if (Array.isArray(session.user.permissions)) {
      permissions = (session.user.permissions as string[]).reduce(
        (acc: Record<string, boolean>, perm: string) => {
          acc[perm] = true;
          return acc;
        },
        {}
      );
    } else if (typeof session.user.permissions === "object") {
      // Ya es un objeto
      permissions = session.user.permissions as Record<string, boolean>;
    }
  }

  //   Procesar módulos solo cuando esté listo
  let modules: string[] = [];

  if (isReady && session?.workspace?.enabledModules) {
    if (Array.isArray(session.workspace.enabledModules)) {
      modules = session.workspace.enabledModules;
    }
  }

  //   Datos del usuario solo cuando esté listo
  const role = isReady ? session?.user?.role || "admin" : "admin";
  const workspace = isReady ? session?.workspace || {} : {};
  const user = isReady ? session?.user || {} : {};

  //   Helper function que respeta el estado de carga
  const hasPermission = (permission: string): boolean => {
    //   Si NextAuth aún está cargando, no dar permisos
    if (isLoading || !isReady) {
      return false;
    }

    //   Si no está autenticado, no dar permisos
    if (isUnauthenticated) {
      return false;
    }

    //   Verificar permiso
    const result = permissions[permission] === true;
    return result;
  };

  const value = {
    permissions: isReady ? permissions : {},
    modules: isReady ? modules : [],
    role,
    workspace,
    user,
    hasPermission,
    isLoading,
    isReady: isReady && !isLoading,
  };

  return (
    <AccessContext.Provider value={value}>{children}</AccessContext.Provider>
  );
}

export function useAccess() {
  const context = useContext(AccessContext);
  if (context === undefined) {
    throw new Error("useAccess must be used within an AccessProvider");
  }

  return context;
}
