"use client"

import * as React from "react"
import {
  BookOpen,
  LifeBuoy,
  Send,
  Settings2,
  Home,
  Layers,
  Move3D,
  Eye
} from "lucide-react"
import { NavProjects } from "@/shared/layout/nav-projects"
import { NavSecondary } from "@/shared/layout/nav-secondary"
import { NavUser } from "@/shared/layout/nav-user"
import { TeamSwitcher } from "@/shared/layout/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader
} from "@/shared/ui/sidebar"
import { useAccess } from "@/context/AccessContext"
import { useTypedSession } from "@/hooks/useTypedSession"
import { Can } from "@/app/auth/can"
import { NavMainWithPermissions } from "./NavMainWithPermissions"
import { AccountType } from "@/modules/onb/types/enum"

// ✅ Memoizar datos estáticos que nunca cambian
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
  const { modules, hasPermission, role, workspace } = useAccess();
  const { session } = useTypedSession();

  // ✅ Memoizar validación de modules
  const safeModules = React.useMemo(() => 
    Array.isArray(modules) ? modules : [], 
    [modules]
  );
  console.log('Safe Modules:', workspace);
  // ✅ Memoizar datos del usuario
  const userData = React.useMemo(() => ({
    name: session?.user?.name || "Usuario",
    email: session?.user?.email || "user@example.com",
    avatar: session?.user?.image?.src || "/avatars/default.jpg",
  }), [session?.user?.name, session?.user?.email, session?.user?.image?.src]);
console.log('User Data:', userData);
  // ✅ Memoizar datos de teams
  const teamsData = React.useMemo(() => [{
    name: workspace?.name || "Mi Workspace",
    logo: Home,
    plan: workspace?.accountType === AccountType.merchant ? "Comerciante" : "Empresarial",
  }], [workspace?.name, workspace?.accountType]);

  // ✅ Memoizar sección de Diseño
  const designSection = React.useMemo(() => 
    safeModules.includes("design") ? [{
      title: "Herramientas de Diseño",
      url: "#",
      icon: Move3D,
      isActive: true,
      items: [
        {
          title: "Creador de Formas",
          url: "/",
          permission: "design:create"
        },
        {
          title: "Editor de Líneas", 
          url: "/line-builder",
          permission: "design:edit"
        },
        {
          title: "Manipulador 3D",
          url: "/3d-manipulator", 
          permission: "3d:manipulate"
        },
        {
          title: "Generador de Planos",
          url: "/floor-plans",
          permission: "design:plans"
        },
      ],
    }] : [],
    [safeModules]
  );

  // ✅ Memoizar sección de Biblioteca
  const librarySection = React.useMemo(() => 
    safeModules.includes("library") ? [{
      title: "Biblioteca",
      url: "#",
      icon: Layers,
      items: [
        {
          title: "Plantillas de Edificios",
          url: "/templates",
          permission: "library:read"
        },
        {
          title: "Elementos Arquitectónicos",
          url: "/elements", 
          permission: "library:read"
        },
        {
          title: "Materiales y Texturas",
          url: "/materials",
          permission: "library:materials"
        },
        {
          title: "Componentes Reutilizables",
          url: "/components",
          permission: "library:components"
        },
      ],
    }] : [],
    [safeModules]
  );

  // ✅ Memoizar sección de Visualización
  const renderSection = React.useMemo(() => 
    safeModules.includes("render") ? [{
      title: "Visualización",
      url: "#", 
      icon: Eye,
      items: [
        {
          title: "Vista 3D Interactiva",
          url: "/viewer",
          permission: "render:view"
        },
        {
          title: "Renderizado Avanzado", 
          url: "/render",
          permission: "render:view"
        },
        {
          title: "Recorridos Virtuales",
          url: "/walkthrough",
          permission: "render:view"
        },
        {
          title: "Análisis de Iluminación",
          url: "/lighting", 
          permission: "render:view"
        },
      ],
    }] : [],
    [safeModules]
  );

  // ✅ Memoizar sección de Configuración
  const settingsSection = React.useMemo(() => 
    (safeModules.includes("settings") || ["owner", "admin"].includes(role ?? "")) ? [{
      title: "Configuración",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "Preferencias de Dibujo",
          url: "/settings/drawing",
          permission: "settings:drawing"
        },
        {
          title: "Configuración de Render", 
          url: "/settings/render",
          permission: "settings:render"
        },
        {
          title: "Atajos de Teclado",
          url: "/settings/shortcuts",
          permission: "settings:shortcuts"
        },
        {
          title: "Exportar/Importar",
          url: "/settings/export",
          permission: "settings:export"
        },
      ],
    }] : [],
    [safeModules, role]
  );

  // ✅ Memoizar navMain completo
  const navMainItems = React.useMemo(() => [
    ...designSection,
    ...librarySection,
    ...renderSection,
    ...settingsSection,
  ], [designSection, librarySection, renderSection, settingsSection]);

  // ✅ Memoizar proyectos
  const projectsData = React.useMemo(() => 
    hasPermission("projects:view") ? [{
      name: "Casa Moderna Minimalista",
      url: "/projects/modern-house",
      icon: Home,
    }] : [],
    [hasPermission]
  );

  // ✅ Memoizar el objeto data completo
  const sidebarData = React.useMemo(() => ({
    user: userData,
    teams: teamsData,
    navMain: navMainItems,
    navSecondary: STATIC_NAV_SECONDARY,
    projects: projectsData,
  }), [userData, teamsData, navMainItems, projectsData]);

  return (
    <Sidebar 
      variant="sidebar"
      collapsible="icon"
      {...props}
    >
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
  )
});

AppSidebar.displayName = 'AppSidebar';

