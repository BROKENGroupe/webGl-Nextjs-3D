import { memo } from "react";

const LoadingComponent = memo(() => (
  <div className="flex items-center justify-center min-h-screen">
    {/* <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
      <div>Cargando...</div>
    </div> */}
  </div>
));

LoadingComponent.displayName = 'LoadingComponent';

//   Componente Skeleton para el Sidebar - Más sutil
const SidebarSkeleton = memo(() => {
  return (
    <div className="flex flex-col h-full">
      {/* Header Skeleton - Solo elementos esenciales */}
      <div className="flex items-center gap-2 p-2">
        <div className="w-8 h-8 bg-gray-200 rounded-md animate-pulse"></div>
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded animate-pulse mb-1"></div>
          <div className="h-3 bg-gray-150 rounded animate-pulse w-2/3"></div>
        </div>
        <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
      </div>

      {/* Content Skeleton - Sin fondos, solo elementos */}
      <div className="flex-1 p-2 space-y-2">
        {/* Menu items skeleton */}
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="space-y-1">
            {/* Main menu item - Solo los elementos básicos */}
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse flex-1 max-w-32"></div>
              <div className="w-3 h-3 bg-gray-200 rounded animate-pulse"></div>
            </div>
            
            {/* Sub-menu items - Más sutiles */}
            {item <= 2 && (
              <div className="ml-7 space-y-1">
                {[1, 2, 3].map((subItem) => (
                  <div key={subItem} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-gray-150 rounded-full animate-pulse"></div>
                    <div className="h-3 bg-gray-150 rounded animate-pulse flex-1 max-w-28"></div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Projects section skeleton - Muy minimalista */}
      <div className="p-2 space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
        </div>
        <div className="ml-7 space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-150 rounded animate-pulse"></div>
            <div className="h-3 bg-gray-150 rounded animate-pulse w-32"></div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-100 rounded animate-pulse"></div>
            <div className="h-3 bg-gray-100 rounded animate-pulse w-20"></div>
          </div>
        </div>
      </div>

      {/* Secondary nav skeleton - Solo elementos */}
      <div className="p-2 mt-auto space-y-1">
        {[1, 2, 3].map((item) => (
          <div key={item} className="flex items-center gap-3">
            <div className="w-4 h-4 bg-gray-150 rounded animate-pulse"></div>
            <div className="h-3 bg-gray-150 rounded animate-pulse w-24"></div>
          </div>
        ))}
      </div>

      {/* Footer Skeleton - Minimalista */}
      <div className="flex items-center gap-3 p-2 border-t border-gray-100">
        <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
        <div className="flex-1">
          <div className="h-3 bg-gray-200 rounded animate-pulse mb-1 w-20"></div>
          <div className="h-2 bg-gray-150 rounded animate-pulse w-16"></div>
        </div>
        <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
      </div>
    </div>
  );
});

SidebarSkeleton.displayName = 'SidebarSkeleton';

export { LoadingComponent, SidebarSkeleton };