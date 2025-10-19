"use client";

import React, { useMemo, memo } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useAccess } from '@/context/AccessContext';
import { useTypedSession } from '@/hooks/useTypedSession';

type ProtectedRouteProps = {
  permission?: string | string[];
  role?: string | string[];
  component: () => Promise<{ default: React.ComponentType<any> }>;
  loading?: React.ReactNode;
  redirectTo?: string;
  requireRegistrationComplete?: boolean;
  allowWithoutPermissions?: boolean; 
  allowedRoutes?: string[];
};

const DefaultLoading = () => <div>Cargando...</div>;

export const ProtectedRoute = memo(function ProtectedRoute({
  permission,
  role,
  component,
  loading = <DefaultLoading />,
  redirectTo = '/home',
  requireRegistrationComplete = true,
  allowWithoutPermissions = false,
  allowedRoutes = []
}: ProtectedRouteProps) {
  const { hasPermission, role: userRole, isLoading } = useAccess();
  const { session, status } = useTypedSession();
  const router = useRouter();
  
  const LazyComponent = useMemo(
    () => dynamic(component, { ssr: false }),
    [component]
  );

  const permissionsArr = useMemo(() => 
    permission ? Array.isArray(permission) ? permission : [permission] : undefined,
    [permission]
  );

  const rolesArr = useMemo(() => 
    role ? Array.isArray(role) ? role : [role] : undefined,
    [role]
  );

  const accessState = useMemo(() => {
    if (status === "loading" || isLoading) {
      return { type: 'loading' as const, message: 'Verificando sesión...' };
    }

    if (status === "unauthenticated") {
      setTimeout(() => router.replace('/auth/login'), 0);
      return { type: 'denied' as const, message: 'No autenticado' };
    }   

    if (allowWithoutPermissions) {
      console.log('🟢 Route allowed without permissions check');
      return { type: 'granted' as const, message: 'Acceso permitido sin permisos' };
    }

    const hasRequiredPermission = 
      !permissionsArr || 
      permissionsArr.some(p => hasPermission(p));

    const hasRequiredRole = !rolesArr || (userRole && rolesArr.includes(userRole));
    const hasAccess = hasRequiredPermission && hasRequiredRole;

    if (!hasAccess) {
      console.log('🔴 Access denied:', { 
        requiredPermissions: permissionsArr, 
        requiredRoles: rolesArr, 
        userRole,
        hasRequiredPermission,
        hasRequiredRole 
      });
      setTimeout(() => router.replace(redirectTo), 0);
      return { type: 'denied' as const, message: 'Permisos insuficientes' };
    }

    console.log('🟢 Access granted with permissions');
    return { type: 'granted' as const, message: 'Acceso concedido' };
    
  }, [
    hasPermission, 
    userRole, 
    isLoading, 
    status,
    session,
    permissionsArr, 
    rolesArr, 
    router, 
    redirectTo,
    requireRegistrationComplete,
    allowWithoutPermissions
  ]);

  switch (accessState.type) {
    case 'loading':
      return <>{loading}</>;
      
    case 'denied':
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div>Verificando permisos...</div>
            <div className="text-sm text-gray-500 mt-2">
              {accessState.message}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              Redirigiendo...
            </div>
          </div>
        </div>
      );
      
    case 'granted':
      return <LazyComponent />;
      
    default:
      return <>{loading}</>;
  }
});
