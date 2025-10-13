import React, { Suspense, lazy, useMemo, memo, useRef } from 'react';
import { useRouter } from 'next/navigation';
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

export const ProtectedRoute = memo(function ProtectedRoute({
  permission,
  role,
  component,
  loading = <div>Cargando...</div>,
  redirectTo = '/home',
  requireRegistrationComplete = true,
  allowWithoutPermissions = false,
  allowedRoutes = []
}: ProtectedRouteProps) {
  const { hasPermission, role: userRole, isLoading } = useAccess();
  const { session, status } = useTypedSession();
  const router = useRouter();
  
  const LazyComponentRef = useRef<React.LazyExoticComponent<React.ComponentType<any>> | null>(null);
  
  if (!LazyComponentRef.current) {
    LazyComponentRef.current = lazy(component);
  }

  const permissionsArr = useMemo(() => 
    permission ? Array.isArray(permission) ? permission : [permission] : undefined,
    [permission]
  );

  const rolesArr = useMemo(() => 
    role ? Array.isArray(role) ? role : [role] : undefined,
    [role]
  );

  //   Verificar si la ruta actual está en las rutas permitidas
  // const isAllowedRoute = useMemo(() => {
  //   if (allowedRoutes.length === 0 && !allowWithoutPermissions) return false;
    
  //   const currentPath = window?.location?.pathname || '';
  //   return allowedRoutes.some(route => currentPath.startsWith(route)) || allowWithoutPermissions;
  // }, [allowedRoutes, allowWithoutPermissions]);
  
  const accessState = useMemo(() => {
    //   Verificar autenticación primero
    if (status === "loading" || isLoading) {
      return { type: 'loading' as const, message: 'Verificando sesión...' };
    }

    if (status === "unauthenticated") {
      setTimeout(() => router.replace('/auth/login'), 0);
      return { type: 'denied' as const, message: 'No autenticado' };
    }   

    //   Si está en ruta permitida, saltar verificación de permisos
    if (allowWithoutPermissions) {
      console.log('🟢 Route allowed without permissions check');
      return { type: 'granted' as const, message: 'Acceso permitido sin permisos' };
    }

    //   Verificación normal de permisos y roles
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

  //   Renderizado optimizado
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
      return (
        <Suspense fallback={loading}>
          <LazyComponentRef.current />
        </Suspense>
      );
      
    default:
      return <>{loading}</>;
  }
});
