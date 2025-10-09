import { NavMain } from "./nav-main";

// ✅ Componente actualizado para usar hasPermission function
export function NavMainWithPermissions({ items, hasPermission }: { 
  items: any[], 
  hasPermission: (permission: string) => boolean 
}) {
  return (
    <NavMain 
      items={items.map(section => ({
        ...section,
        items: section.items?.filter((item: any) => {
          // Si no tiene permission definida, mostrarlo
          if (!item.permission) return true;

          // ✅ Usar la función hasPermission
          return hasPermission(item.permission);
        })
      }))} 
    />
  );
}