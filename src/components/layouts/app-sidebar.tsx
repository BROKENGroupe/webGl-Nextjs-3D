"use client"

import * as React from "react"
import {
  BookOpen,
  Bot,
  Command,
  Frame,
  LifeBuoy,
  Map,
  PieChart,
  Send,
  Settings2,
  SquareTerminal,
  Home,
  Layers,
  Move3D,
  Palette,
  Grid3X3,
  Download,
  Upload,
  Ruler,
  Eye
} from "lucide-react"

import { NavMain } from "@/shared/layout/nav-main"
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

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { modules, hasPermission, role, workspace } = useAccess();
  const { session } = useTypedSession();

  // ✅ Validación defensiva para modules
  const safeModules = Array.isArray(modules) ? modules : [];

  // ✅ Datos dinámicos basados en la sesión
  const data = {
    user: {
      name: session?.user?.name || "Usuario",
      email: session?.user?.email || "user@example.com",
      avatar: session?.user?.image?.src || "/avatars/default.jpg",
    },
    teams: [
      {
        name: workspace?.name || "Mi Workspace",
        logo: Home,
        plan: workspace?.accountType === "professional" ? "Professional" : "Básico",
      },
    ],
    navMain: [
      // ✅ Solo mostrar si tiene el módulo "design" habilitado
      ...(safeModules.includes("design") ? [{
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
      }] : []),

      // ✅ Solo mostrar si tiene el módulo "library" habilitado
      ...(safeModules.includes("library") ? [{
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
      }] : []),

      // ✅ Solo mostrar si tiene el módulo "3d-viewer" habilitado
      ...(safeModules.includes("render") ? [{
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
      }] : []),

      // ✅ Solo mostrar si tiene el módulo "settings" o es owner/admin
      ...((safeModules.includes("settings") || ["owner", "admin"].includes(role ?? "")) ? [{
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
      }] : []),
    ],
    navSecondary: [
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
    ],
    projects: [
      // ✅ Usar hasPermission en lugar de permissions.includes
      ...(hasPermission("projects:view") ? [{
        name: "Casa Moderna Minimalista",
        url: "/projects/modern-house",
        icon: Home,
      }] : []),
    ],
  };

  return (
    <Sidebar 
      variant="sidebar"
      collapsible="icon"
      {...props}
    >
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        {/* ✅ Pasar la función hasPermission */}
        <NavMainWithPermissions items={data.navMain} hasPermission={hasPermission} />
        
        <Can permission="projects:view">
          <NavProjects projects={data.projects} />
        </Can>
        
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}

