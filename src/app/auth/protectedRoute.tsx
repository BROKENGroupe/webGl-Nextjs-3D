import React, { Suspense, lazy, useMemo, memo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAccess } from '@/context/AccessContext';

type ProtectedRouteProps = {
  permission?: string | string[];
  role?: string | string[];
  component: () => Promise<{ default: React.ComponentType<any> }>;
  loading?: React.ReactNode;
  redirectTo?: string;
};

export const ProtectedRoute = memo(function ProtectedRoute({
  permission,
  role,
  component,
  loading = <div>Cargando...</div>,
  redirectTo = '/home'
}: ProtectedRouteProps) {
  const { hasPermission, role: userRole, isLoading } = useAccess();
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
  
  const accessState = useMemo(() => {
    if (isLoading) {      
      return { type: 'loading' as const };
    }

    const hasRequiredPermission = 
      !permissionsArr || 
      permissionsArr.some(p => hasPermission(p));

    const hasRequiredRole = !rolesArr || (userRole && rolesArr.includes(userRole));
    const hasAccess = hasRequiredPermission && hasRequiredRole;

    console.log('🔒 ProtectedRoute Access Check:', {
      requestedPermissions: permissionsArr,
      requestedRoles: rolesArr,
      userRole,
      hasRequiredPermission,
      hasRequiredRole,
      finalAccess: hasAccess,
    });

    if (!hasAccess) {
      setTimeout(() => router.replace(redirectTo), 0);
      return { type: 'denied' as const };
    }
    return { type: 'granted' as const };
    
  }, [hasPermission, userRole, isLoading, permissionsArr, rolesArr, router, redirectTo]);

  // ✅ Renderizado optimizado
  switch (accessState.type) {
    case 'loading':
      return <>{loading}</>;
      
    case 'denied':
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div>Verificando permisos...</div>
            <div className="text-sm text-gray-500 mt-2">
              Redirigiendo a {redirectTo}
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
