"use client";

import * as React from "react";
import {
  BookOpen,
  LifeBuoy,
  Send,
  Settings2,
  Home,
  Layers,
  Move3D,
  Eye,
  MapPin,
  Building2,
  MoreHorizontal,
  Plus,
} from "lucide-react";
import { NavProjects } from "@/shared/layout/nav-projects";
import { NavSecondary } from "@/shared/layout/nav-secondary";
import { NavUser } from "@/shared/layout/nav-user";
import { TeamSwitcher } from "@/shared/layout/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/shared/ui/sidebar";
import { useAccess } from "@/context/AccessContext";
import { useTypedSession } from "@/hooks/useTypedSession";
import { Can } from "@/app/auth/can";
import { NavMainWithPermissions } from "./NavMainWithPermissions";
import { AccountType } from "@/modules/onb/types/enum";
import { SidebarSkeleton } from "@/components/atoms/loadingcomponent";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { OnboardingModal } from "@/modules/places/components/modals/OnboardingModal";
import { usePlacesSection } from "./hooks/use-places";
import { NavMainWithPermissions2 } from "./NavMainWithPermissions2";

const STATIC_NAV_SECONDARY = [
  {
    title: "Soporte Técnico",
    url: "#",
    icon: LifeBuoy,
  },
  {
    title: "Documentación API",
    url: "#",
    icon: BookOpen,
  },
  {
    title: "Enviar Feedback",
    url: "#",
    icon: Send,
  },
];

export const AppSidebar = React.memo(function AppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const {
    modules,
    hasPermission,
    role,
    workspace,
    isReady: accessReady,
    isLoading: accessLoading,
  } = useAccess();
  const { session, status } = useTypedSession();
  const router = useRouter();
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  //   Verificar si todo está listo
  const isDataReady = React.useMemo(() => {
    const authReady = status !== "loading";
    const accessDataReady = accessReady && !accessLoading;

    return authReady && accessDataReady;
  }, [status, accessReady, accessLoading]);

  // Hook para establecimientos
  const { placesData, placesSection } = usePlacesSection("places");

  console.log("Places Section:", placesSection);
  // SidebarData para el menú principal
  const sidebarData = React.useMemo(() => {
    if (!isDataReady) {
      return {
        user: { name: "", email: "", avatar: "" },
        teams: [],
        navMain: [],
        navSecondary: STATIC_NAV_SECONDARY,
        projects: [],
      };
    }

    const safeModules = Array.isArray(modules) ? modules : [];

    //   Datos del usuario
    const userData = {
      name: session?.user?.name || "Usuario",
      email: session?.user?.email || "user@example.com",
      avatar: session?.user?.image || "/avatars/default.jpg",
    };

    const teamsData = [
      {
        name: workspace?.name || "Mi Workspace",
        logo: Home,
        plan:
          workspace?.accountType === AccountType.merchant
            ? "Comerciante"
            : "Empresarial",
      },
    ];

    const designSection = safeModules.includes("design")
      ? [
          {
            title: "Herramientas de Diseño",
            url: "#",
            icon: Move3D,
            isActive: true,
            items: [
              {
                title: "Creador de Formas",
                url: "/",
                permission: "design:create",
              },
              {
                title: "Editor de Líneas",
                url: "/line-builder",
                permission: "design:edit",
              },
              {
                title: "Manipulador 3D",
                url: "/3d-manipulator",
                permission: "3d:manipulate",
              },
              {
                title: "Generador de Planos",
                url: "/floor-plans",
                permission: "design:plans",
              },
            ],
          },
        ]
      : [];

    //   Sección de Biblioteca
    const librarySection = safeModules.includes("library")
      ? [
          {
            title: "Biblioteca",
            url: "#",
            icon: Layers,
            items: [
              {
                title: "Plantillas de Edificios",
                url: "/templates",
                permission: "library:read",
              },
              {
                title: "Elementos Arquitectónicos",
                url: "/elements",
                permission: "library:read",
              },
              {
                title: "Materiales y Texturas",
                url: "/materials",
                permission: "library:materials",
              },
              {
                title: "Componentes Reutilizables",
                url: "/components",
                permission: "library:components",
              },
            ],
          },
        ]
      : [];

    //   Sección de Places (Establecimientos)
    const placesSection = safeModules.includes("places")
      ? [
          {
            title: "Mis Establecimientos",
            url: "#",
            icon: Building2,
            items: [
              {
                title: "Lista de Establecimientos",
                url: "/places",
                permission: "places:view",
              },
              {
                title: "Mapa de Ubicaciones",
                url: "/places/map",
                permission: "places:view",
              },
              {
                title: "Análisis Acústicos",
                url: "/places/studies",
                permission: "places:view",
              },
              {
                title: "Reportes y Métricas",
                url: "/places/reports",
                permission: "places:view",
              },
              {
                title: "Configurar Establecimiento",
                url: "/places/create",
                permission: "places:view",
              },
            ],
          },
        ]
      : [];

    //   Sección de Visualización
    const renderSection = safeModules.includes("render")
      ? [
          {
            title: "Visualización",
            url: "#",
            icon: Eye,
            items: [
              {
                title: "Vista 3D Interactiva",
                url: "/viewer",
                permission: "editor:view",
              },
              {
                title: "Editor 3D",
                url: "/editor",
                permission: "editor:edit",
              },
              {
                title: "Renderizado Avanzado",
                url: "/render",
                permission: "editor:view",
              },
              {
                title: "Recorridos Virtuales",
                url: "/walkthrough",
                permission: "editor:view",
              },
              {
                title: "Análisis de Iluminación",
                url: "/lighting",
                permission: "editor:view",
              },
            ],
          },
        ]
      : [];

    const settingsSection =
      safeModules.includes("settings") ||
      ["owner", "admin"].includes(role ?? "")
        ? [
            {
              title: "Configuración",
              url: "#",
              icon: Settings2,
              items: [
                {
                  title: "Preferencias de Dibujo",
                  url: "/settings/drawing",
                  permission: "settings:drawing",
                },
                {
                  title: "Configuración de Render",
                  url: "/settings/render",
                  permission: "settings:render",
                },
                {
                  title: "Atajos de Teclado",
                  url: "/settings/shortcuts",
                  permission: "settings:shortcuts",
                },
                {
                  title: "Exportar/Importar",
                  url: "/settings/export",
                  permission: "settings:export",
                },
              ],
            },
          ]
        : [];

    const navMainItems = [
      ...designSection,
      ...librarySection,
      ...placesSection,
      ...renderSection,
      ...settingsSection,
    ];

    return {
      user: userData,
      teams: teamsData,
      navMain: navMainItems,
      navSecondary: STATIC_NAV_SECONDARY,
    };
  }, [
    isDataReady,
    modules,
    session,
    workspace,
    role,
    hasPermission,
    placesData,
  ]);
  // SidebarData para el menú principal
  const sidebarData2 = React.useMemo(() => {
    // if (!isDataReady) {
    //   return {
    //     user: { name: "", email: "", avatar: "" },
    //     teams: [],
    //     navMain: [],
    //     navSecondary: STATIC_NAV_SECONDARY,
    //     projects: [],
    //   };
    // }

    const navMainItems = placesSection;

    return {
      navMain: navMainItems,
    };
  }, [
    isDataReady,
    modules,
    session,
    workspace,
    role,
    hasPermission,
    placesData,
  ]);

  console.log("Sidebar Data 2:", sidebarData2);

  if (!isDataReady) {
    return (
      <Sidebar variant="sidebar" collapsible="icon" {...props}>
        <div className="flex items-center justify-center h-full">
          <SidebarSkeleton />
        </div>
      </Sidebar>
    );
  }

  //   Renderizar sidebar completo cuando todo esté listo
  return (
    <Sidebar variant="sidebar" collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={sidebarData.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMainWithPermissions
          items={sidebarData.navMain}
          hasPermission={hasPermission}
        />

        {/* Nuevo menú lateral de establecimientos con permisos y vista adaptada */}
        <NavMainWithPermissions2
          items={sidebarData2.navMain}
          hasPermission={hasPermission}
        />       

        <NavSecondary items={sidebarData.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={sidebarData.user} />
      </SidebarFooter>
    </Sidebar>
  );
});

AppSidebar.displayName = "AppSidebar";
