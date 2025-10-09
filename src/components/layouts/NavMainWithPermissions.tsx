import { NavMain } from "@/shared/layout/nav-main";
import React from "react";

interface NavMainWithPermissionsProps {
  items: any[];
  hasPermission: (permission: string) => boolean;
}

export const NavMainWithPermissions = React.memo(function NavMainWithPermissions({ 
  items, 
  hasPermission 
}: NavMainWithPermissionsProps) {
  
  // ✅ Filtrar items basado en permisos
  const filteredItems = React.useMemo(() => 
    items.map(section => ({
      ...section,
      items: section.items?.filter((item: any) => {
        // Si no tiene permission definida, mostrarlo
        if (!item.permission) return true;
        
        // Verificar si tiene el permiso
        return hasPermission(item.permission);
      })
    })),
    [items, hasPermission]
  );

  return <NavMain items={filteredItems} />;
});

NavMainWithPermissions.displayName = 'NavMainWithPermissions';