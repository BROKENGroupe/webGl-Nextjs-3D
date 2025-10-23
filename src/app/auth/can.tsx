import { useAccess } from '@/context/AccessContext';
import { Skeleton } from '@/shared/ui/skeleton';
import { ReactNode } from 'react';

type CanProps = {
  permission?: string | string[];
  role?: string | string[];
  children: ReactNode;
  fallback?: ReactNode;
  loadingType?: 'button' | 'card' | 'text' | 'nav' | 'custom';
  loadingSkeleton?: ReactNode;
};

export function Can({ 
  permission, 
  role, 
  children, 
  fallback = null, 
  loadingType = 'text',
  loadingSkeleton 
}: CanProps) {
  const { hasPermission, role: userRole, isLoading } = useAccess();

  //   Si está cargando, mostrar skeleton apropiado
  if (isLoading) {
    // Si hay skeleton personalizado, usarlo
    if (loadingSkeleton) {
      return <>{loadingSkeleton}</>;
    }

    // Skeleton basado en el tipo
    switch (loadingType) {
      case 'button':
        return <Skeleton className="h-10 w-24" />;
      
      case 'card':
        return (
          <div className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
        );
      
      case 'nav':
        return (
          <div className="flex items-center space-x-2">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-[120px]" />
          </div>
        );
      
      case 'text':
      default:
        return <Skeleton className="h-4 w-[180px]" />;
    }
  }

  // Convertir permission a array si es necesario
  const permissionsArr = typeof permission === 'string' ? [permission] : permission || [];
  const rolesArr = typeof role === 'string' ? [role] : role || [];

  //   Verificar permisos usando la función hasPermission
  const hasRequiredPermission =
    permissionsArr.length === 0 || 
    permissionsArr.some((p: string) => hasPermission(p));

  // Verificar roles
  const hasRequiredRole =
    rolesArr.length === 0 ||
    (userRole && rolesArr.includes(userRole)); 

  // Solo mostrar children si tiene tanto el permiso como el rol requerido
  if (hasRequiredPermission && hasRequiredRole) {
    return <>{children}</>;
  }

  // Mostrar fallback si no tiene permisos
  return <>{fallback}</>;
}