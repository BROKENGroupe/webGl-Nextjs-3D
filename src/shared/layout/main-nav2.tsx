import {
  SidebarGroup,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/shared/ui/sidebar";
import {
  MoreHorizontal,
  Plus,
  ChevronRight,
  type LucideIcon,
  Landmark,
} from "lucide-react";
import router from "next/router";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { useSidebar } from "@/shared/ui/sidebar"; // <-- Importa tu hook/contexto real

export function NavMain2({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: LucideIcon;
    isActive?: boolean;
    items?: {
      title: string;
      url: string;
      icon?: LucideIcon;
      address?: string;
      id?: string;
      simulations?: any[];
    }[];
  }[];
}) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const sidebar = useSidebar(); // <-- Usa el hook real de tu sidebar
  const collapsed = (sidebar as any)?.collapsed ?? false; // fallback to false if undefined

  // Asegúrate de mapear sobre los subitems (establecimientos)
  const places = items
  .map((item) => item || [])
  .flat()
  .slice(0, 3);


  return (
    <SidebarGroup>
      <div className="flex items-center justify-between mb-2 px-3">
        {!collapsed && (
          <span
            className="text-xs font-semibold text-neutral-500 tracking-wide truncate"
            style={{ maxWidth: "calc(100% - 32px)" }}
          >
            Establecimientos
          </span>
        )}
        <button
          className="p-1 rounded hover:bg-neutral-200 transition text-neutral-400 hover:text-neutral-900 flex-shrink-0"
          title="Crear establecimiento"
          onClick={() => setShowCreateModal(true)}
          aria-label="Crear establecimiento"
        >
          <Plus size={16} />
        </button>
      </div>
      <ul
        className={`list-none space-y-1 ${
          collapsed ? "flex flex-col items-center px-0" : "px-1"
        }`}
      >
        {places.length > 0 && places.map((place: any) => (
          <li
            key={place.url}
            className={`group ${
              collapsed
                ? "w-full flex justify-center"
                : "flex items-center justify-between"
            } rounded-lg hover:bg-neutral-100 transition cursor-pointer ${
              collapsed ? "px-0 py-1" : "px-2 py-1.5"
            }`}
            style={{ minWidth: 0 }}
          >
            <SidebarMenuItem className="flex-1 min-w-0 p-0 m-0">
              <SidebarMenuButton
                tooltip={place.title}
                className={`flex ${
                  collapsed
                    ? "items-center justify-center gap-2"
                    : "flex-col min-w-0 text-left"
                } px-0 py-0`}
                onClick={() => router.push(place.url)}
              >
                {collapsed ? (
                  // Usa el icono del item o uno por defecto
                  place.icon ? <place.icon size={20} /> : <Landmark size={20} />
                ) : (
                  <>
                    <span className="font-medium text-neutral-900 text-sm truncate">
                      {place.title}
                    </span>
                    {place.address && (
                      <span className="text-xs text-neutral-500 truncate">
                        {place.address}
                      </span>
                    )}
                  </>
                )}
              </SidebarMenuButton>
            </SidebarMenuItem>
            {!collapsed && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="opacity-0 group-hover:opacity-100 ml-2 p-1 rounded hover:bg-neutral-200 transition flex-shrink-0"
                    tabIndex={-1}
                    title="Más acciones"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreHorizontal size={16} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  {Array.isArray(place.simulations) && place.simulations.length === 0 ? (
                    <DropdownMenuItem
                      onClick={() => {
                        router.push(`/editor/${place.id}`);
                      }}
                    >
                      Crear simulación
                    </DropdownMenuItem>
                  ) : (
                    <>
                      <DropdownMenuItem
                        onClick={() => {
                          router.push(`/places/${place.id}`);
                        }}
                      >
                        Ver simulación
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          router.push(`/editor/${place.id}`);
                        }}
                      >
                        Ver en 3D
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuItem
                    onClick={() => {
                      router.push(place.url);
                    }}
                  >
                    Ver detalles
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </li>
        ))}
        {places.length === 3 && (
          <li className="flex justify-center pt-2 px-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs text-neutral-500 hover:text-neutral-900 justify-center whitespace-nowrap rounded-lg border"
              onClick={() => router.push("/places")}
              aria-label="Ver todos los establecimientos"
            >
              Ver todos
            </Button>
          </li>
        )}
      </ul>
      {/* Modal para crear establecimiento */}
      {/* {showCreateModal && (
        <YourCreatePlaceModal
          open={showCreateModal}
          onClose={() => setShowCreateModal(false)}
        />
      )} */}
    </SidebarGroup>
  );
}
