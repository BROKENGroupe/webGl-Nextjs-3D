"use client";

import React, { createContext, useContext, ReactNode } from 'react';
import { useSession } from 'next-auth/react';

interface AccessContextProps {
  permissions: { [key: string]: boolean };
  modules: string[];
  role: string;
  workspace: any;
  user: any;
  hasPermission: (permission: string) => boolean;
  isLoading: boolean;
}

const AccessContext = createContext<AccessContextProps | undefined>(undefined);

export function AccessProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();

  // ✅ Agregar verificación de loading
  const isLoading = status === "loading";

  // ✅ Verificar múltiples posibles estructuras de datos
  let permissions: Record<string, boolean> = {};

  if (session?.user?.permissions) {
   
    
    if (typeof session.user.permissions === 'object') {
      // Si viene como array, convertir a objeto
      if (Array.isArray(session.user.permissions)) {
        permissions = (session.user.permissions as string[]).reduce((acc: Record<string, boolean>, perm: string) => {
          acc[perm] = true;
          return acc;
        }, {});
        
      } else {
        // If permissions is an array, convert to object
        if (Array.isArray(session.user.permissions)) {
          permissions = (session.user.permissions as string[]).reduce((acc: Record<string, boolean>, perm: string) => {
            acc[perm] = true;
            return acc;
          }, {});
          
        } else {
          // Convert string[] to Record<string, boolean> if necessary
          if (Array.isArray(session.user.permissions)) {
            permissions = (session.user.permissions as string[]).reduce((acc: Record<string, boolean>, perm: string) => {
              acc[perm] = true;
              return acc;
            }, {});
          } else {
            permissions = Array.isArray(session.user.permissions)
              ? (session.user.permissions as string[]).reduce((acc: Record<string, boolean>, perm: string) => {
                  acc[perm] = true;
                  return acc;
                }, {})
              : session.user.permissions;
          }
        }
        
      }
    }
  } else {
  }
  
  // ✅ Modules con verificación similar
  let modules: string[] = [];
  
  if (session?.workspace?.enabledModules) {
    if (Array.isArray(session.workspace.enabledModules)) {
      modules = session.workspace.enabledModules;
      
    } else {
      console.log("🔐 enabledModules is not an array:", session.workspace.enabledModules);
    }
  } else {
    
    // ✅ Verificar otros posibles lugares
    if (session?.workspace?.enabledModules) {
      modules = Array.isArray(session.workspace.enabledModules) ? session.workspace.enabledModules : [];     
    }
  }
  
  const role = session?.user?.role || "guest";
  const workspace = session?.workspace || {};
  const user = session?.user || {};

  

  // ✅ Helper function para verificar permisos con logs más claros
  const hasPermission = (permission: string): boolean => {
    if (isLoading) {
      console.log(`🔐 hasPermission("${permission}"): LOADING - returning false`);
      return false;
    }
    
    const result = permissions[permission] === true;    
    return result;
  };

  // ✅ Si está cargando, proporcionar datos vacíos pero seguros
  const value = {
    permissions: isLoading ? {} : permissions,
    modules: isLoading ? [] : modules,
    role: isLoading ? "guest" : role,
    workspace: isLoading ? {} : workspace,
    user: isLoading ? {} : user,
    hasPermission,
    isLoading
  };

  return (
    <AccessContext.Provider value={value}>
      {children}
    </AccessContext.Provider>
  );
}

export function useAccess() {
  const context = useContext(AccessContext);
  if (context === undefined) {    
    throw new Error('useAccess must be used within an AccessProvider');
  }
  
  return context;
}
