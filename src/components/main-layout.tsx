"use client"

import { useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { ToolPanel } from "@/components/tool-panel"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Home, X } from "lucide-react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { FloatingPanelToggle } from "./floating-panel-toggle"

export function MainLayout({ children }: { children: React.ReactNode }) {
  const [isToolPanelOpen, setIsToolPanelOpen] = useState(true)

  return (
    <div className="relative min-h-screen">
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 bg-background border-b z-40 relative">
          <div className="flex items-center gap-2 px-4 flex-1">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">
                    WebGL 3D Builder
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Creador de Formas 3D</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          {/* ✅ BOTONES EN EL HEADER - DONDE SEÑALASTE */}
          <div className="flex items-center gap-2 px-4">
            <Button 
              variant="default" 
              size="sm" 
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              Volver a 2D
            </Button>
            
            <Button 
              variant="default" 
              size="sm" 
              className="bg-purple-500 hover:bg-purple-600 text-white"
            >
              Re-extruir
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="border-orange-500 text-orange-600 hover:bg-orange-50"
            >
              🔧 Arreglar Forma
            </Button>

            <Separator orientation="vertical" className="h-6" />

            {/* BOTÓN TOGGLE DEL PANEL */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsToolPanelOpen(!isToolPanelOpen)}
              className="bg-background hover:bg-accent border-2"
            >
              {isToolPanelOpen ? (
                <>
                  <X className="h-4 w-4 mr-2" />
                  Ocultar Panel
                </>
              ) : (
                <>
                  <Home className="h-4 w-4 mr-2" />
                  Mostrar Panel
                </>
              )}
            </Button>
          </div>
        </header>
        
        <div className={`flex flex-1 flex-col gap-4 p-4 pt-0 transition-all duration-300 ${
          isToolPanelOpen ? 'mr-80' : 'mr-0'
        }`}>
          {children}
        </div>
      </SidebarInset>
      
      {/* ✅ TOOL PANEL */}
      <ToolPanel 
        isOpen={isToolPanelOpen}
        onClose={() => setIsToolPanelOpen(false)}
        shapeCount={4}
        currentTool="polygon"
        onToolSelect={(tool) => {
          console.log("Tool selected:", tool)
        }}
      />
      <FloatingPanelToggle
        isOpen={isToolPanelOpen}
        onToggle={() => setIsToolPanelOpen(!isToolPanelOpen)}
      />
    </div>
  )
}