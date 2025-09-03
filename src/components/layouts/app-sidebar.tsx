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

const data = {
  user: {
    name: "Arquitecto 3D",
    email: "admin@webgl3d.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "WebGL 3D Builder",
      logo: Home,
      plan: "Professional",
    },
    {
      name: "Architecture Studio", 
      logo: Home,
      plan: "Premium",
    },
  ],
  navMain: [
    {
      title: "Herramientas de Diseño",
      url: "#",
      icon: Move3D,
      isActive: true,
      items: [
        {
          title: "Creador de Formas",
          url: "/",
        },
        {
          title: "Editor de Líneas",
          url: "/line-builder",
        },
        {
          title: "Manipulador 3D",
          url: "/3d-manipulator",
        },
        {
          title: "Generador de Planos",
          url: "/floor-plans",
        },
      ],
    },
    {
      title: "Biblioteca",
      url: "#",
      icon: Layers,
      items: [
        {
          title: "Plantillas de Edificios",
          url: "/templates",
        },
        {
          title: "Elementos Arquitectónicos", 
          url: "/elements",
        },
        {
          title: "Materiales y Texturas",
          url: "/materials",
        },
        {
          title: "Componentes Reutilizables",
          url: "/components",
        },
      ],
    },
    {
      title: "Visualización",
      url: "#",
      icon: Eye,
      items: [
        {
          title: "Vista 3D Interactiva", // ✅ Este es el texto que mencionas
          url: "/viewer",
        },
        {
          title: "Renderizado Avanzado",
          url: "/render",
        },
        {
          title: "Recorridos Virtuales",
          url: "/walkthrough",
        },
        {
          title: "Análisis de Iluminación",
          url: "/lighting",
        },
      ],
    },
    {
      title: "Configuración",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "Preferencias de Dibujo",
          url: "/settings/drawing",
        },
        {
          title: "Configuración de Render",
          url: "/settings/render",
        },
        {
          title: "Atajos de Teclado",
          url: "/settings/shortcuts",
        },
        {
          title: "Exportar/Importar", 
          url: "/settings/export",
        },
      ],
    },
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
    {
      name: "Casa Moderna Minimalista",
      url: "/projects/modern-house",
      icon: Home,
    },
    // {
    //   name: "Edificio Corporativo",
    //   url: "/projects/corporate-building", 
    //   icon: Frame,
    // },
    // {
    //   name: "Complejo Residencial",
    //   url: "/projects/residential-complex",
    //   icon: Grid3X3,
    // },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar 
      variant="sidebar" // ✅ CAMBIAR: de "inset" a "sidebar" para comportamiento correcto
      collapsible="icon"  // ✅ AGREGAR: permite colapsar mostrando solo iconos
      {...props}
    >
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}