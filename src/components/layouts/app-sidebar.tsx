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
import { LoadingComponent, SidebarSkeleton } from "@/components/atoms/loadingcomponent";

// ✅ Memoizar datos estáticos que nuncan cambian
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

  // ✅ Verificar si todo está listo
  const isDataReady = React.useMemo(() => {
    const authReady = status !== "loading";
    const accessDataReady = accessReady && !accessLoading;

    console.log("🔍 Sidebar readiness check:", {
      authStatus: status,
      authReady,
      accessReady,
      accessLoading,
      accessDataReady,
      finalReady: authReady && accessDataReady,
    });

    return authReady && accessDataReady;
  }, [status, accessReady, accessLoading]);

  // ✅ Solo procesar datos cuando todo esté listo
  const sidebarData = React.useMemo(() => {
    if (!isDataReady) {
      console.log("⏳ Sidebar data not ready, returning empty data");
      return {
        user: { name: "", email: "", avatar: "" },
        teams: [],
        navMain: [],
        navSecondary: STATIC_NAV_SECONDARY,
        projects: [],
      };
    }

    console.log("✅ Processing sidebar data - everything is ready");

    // ✅ Validar modules de forma segura
    const safeModules = Array.isArray(modules) ? modules : [];
    console.log("🏢 Safe Modules:", safeModules);

    // ✅ Datos del usuario
    const userData = {
      name: session?.user?.name || "Usuario",
      email: session?.user?.email || "user@example.com",
      avatar: session?.user?.image?.src || "/avatars/default.jpg",
    };
    console.log("👤 User Data:", userData);

    // ✅ Datos de teams
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
    console.log("🏢 Teams Data:", teamsData);

    // ✅ Sección de Diseño
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

    // ✅ Sección de Biblioteca
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

    // ✅ Sección de Visualización
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
                permission: "render:view",
              },
              {
                title: "Renderizado Avanzado",
                url: "/render",
                permission: "render:view",
              },
              {
                title: "Recorridos Virtuales",
                url: "/walkthrough",
                permission: "render:view",
              },
              {
                title: "Análisis de Iluminación",
                url: "/lighting",
                permission: "render:view",
              },
            ],
          },
        ]
      : [];

    // ✅ Sección de Configuración
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

    // ✅ NavMain completo
    const navMainItems = [
      ...designSection,
      ...librarySection,
      ...renderSection,
      ...settingsSection,
    ];

    // ✅ Proyectos (solo si tiene permisos)
    const projectsData = hasPermission("projects:view")
      ? [
          {
            name: "Casa Moderna Minimalista",
            url: "/projects/modern-house",
            icon: Home,
          },
        ]
      : [];

    return {
      user: userData,
      teams: teamsData,
      navMain: navMainItems,
      navSecondary: STATIC_NAV_SECONDARY,
      projects: projectsData,
    };
  }, [isDataReady, modules, session, workspace, role, hasPermission]);

  // ✅ Mostrar loading mientras espera
  if (!isDataReady) {
    return (
      <Sidebar variant="sidebar" collapsible="icon" {...props}>
        <div className="flex items-center justify-center h-full">
          <SidebarSkeleton />
        </div>
      </Sidebar>
    );
  }

  // ✅ Renderizar sidebar completo cuando todo esté listo
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

        <Can permission="projects:view">
          <NavProjects projects={sidebarData.projects} />
        </Can>

        <NavSecondary items={sidebarData.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={sidebarData.user} />
      </SidebarFooter>
    </Sidebar>
  );
});

AppSidebar.displayName = "AppSidebar";
