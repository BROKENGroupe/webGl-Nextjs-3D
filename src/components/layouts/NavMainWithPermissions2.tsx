import { NavMain2 } from "@/shared/layout/main-nav2";
import { NavMain } from "@/shared/layout/nav-main";
import React from "react";

interface NavMainWithPermissionsProps {
  items: any[];
  hasPermission: (permission: string) => boolean;
}

export const NavMainWithPermissions2 = React.memo(function NavMainWithPermissions({ 
  items, 
  hasPermission 
}: NavMainWithPermissionsProps) {

  console.log("NavMainWithPermissions2 items:", items);
  
  //   Filtrar items basado en permisos
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

  console.log("NavMainWithPermissions2 filteredItems:", filteredItems);

  return <NavMain2 items={filteredItems.map(section => section.items).flat()} />;
});

NavMainWithPermissions2.displayName = 'NavMainWithPermissions2';