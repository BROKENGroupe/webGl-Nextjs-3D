"use client"

import * as React from "react"
import { useState } from "react"
import { 
  X, 
  ChevronRight, 
  ChevronDown,
  RotateCcw,
  Download,
  Trash2,
  Move3D,
  Square,
  Circle,
  Triangle,
  Settings,
  Eye,
  Palette,
  Layers,
  Grid3X3,
  Home,
  DoorOpen
} from "lucide-react"

import { Button } from "@/shared/ui/button"
import { Separator } from "@/shared/ui/separator"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card"
import { Badge } from "@/shared/ui/badge"
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/shared/ui/collapsible"
import { DraggableOpeningsPalette } from "@/modules/editor/components/DraggableOpeningsPalette"
import { AcousticMaterial } from "@/modules/editor/types/AcousticMaterial"

interface ToolPanelProps {
  isOpen?: boolean
  onClose?: () => void
  shapeCount?: number
  currentTool?: string
  onToolSelect?: (tool: string) => void
  showOpeningsPalette?: boolean
  onToggleOpeningsPalette?: () => void
  onStartDrag?: (template: AcousticMaterial) => void
}

export function ToolPanel({ 
  isOpen = true, 
  onClose,
  shapeCount = 4,
  currentTool = "polygon",
  onToolSelect,
  // ✅ PROPS DE LA PALETA
  showOpeningsPalette = false,
  onToggleOpeningsPalette,
  onStartDrag
}: ToolPanelProps) {
  const [shapesExpanded, setShapesExpanded] = useState(true)
  const [viewExpanded, setViewExpanded] = useState(true)
  const [toolsExpanded, setToolsExpanded] = useState(true)
  const [openingsExpanded, setOpeningsExpanded] = useState(true)

  if (!isOpen) return null

  return (
    <>
      {/* Overlay semi-transparente */}
      <div 
        className="fixed inset-0 bg-black/20 z-40"
        onClick={onClose}
      />
      
      {/* Panel flotante */}
      <div className="fixed right-4 top-20 bottom-4 w-80 bg-background border border-border shadow-2xl z-50 flex flex-col rounded-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-muted/50">
          <div className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Panel de Herramientas</h2>
          </div>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          
          {/* Información de la Forma Actual */}
          <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Vista 3D
                </CardTitle>
                <Badge variant="secondary" className="text-xs">
                  Activa
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-xs text-muted-foreground">
                📐 Plano guardado: {shapeCount} puntos
              </div>
              <div className="text-xs text-muted-foreground">
                🎯 Forma extruida activa
              </div>
            </CardContent>
          </Card>

          {/* Botones de Acción Principal */}
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <Button variant="default" size="sm" className="bg-blue-500 hover:bg-blue-600">
                <RotateCcw className="h-4 w-4 mr-1" />
                Volver a 2D
              </Button>
              <Button variant="default" size="sm" className="bg-purple-500 hover:bg-purple-600">
                <Download className="h-4 w-4 mr-1" />
                Re-extruir
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" className="border-orange-500 text-orange-600 hover:bg-orange-50">
                <Triangle className="h-4 w-4 mr-1" />
                Arreglar Forma
              </Button>
              <Button variant="destructive" size="sm">
                <Trash2 className="h-4 w-4 mr-1" />
                Nuevo Dibujo
              </Button>
            </div>
          </div>

          <Separator />

          {/* ✅ SECCIÓN DE PUERTAS Y VENTANAS */}
          <Collapsible open={openingsExpanded} onOpenChange={setOpeningsExpanded}>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-accent rounded-md">
              <div className="flex items-center gap-2">
                <DoorOpen className="h-4 w-4" />
                <span className="font-medium">Puertas y Ventanas</span>
              </div>
              {openingsExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2 pt-2">
              <Button
                variant={showOpeningsPalette ? "default" : "outline"}
                size="sm"
                onClick={onToggleOpeningsPalette}
                className="w-full"
              >
                <Home className="h-4 w-4 mr-2" />
                {showOpeningsPalette ? "Ocultar Paleta" : "Abrir Paleta"}
              </Button>
              
              {/* ✅ PALETA INTEGRADA EN EL PANEL */}
              {showOpeningsPalette && onStartDrag && (
                <div className="border border-border rounded-md p-2 bg-muted/50">
                  <DraggableOpeningsPalette
                    isVisible={showOpeningsPalette}
                    onToggle={onToggleOpeningsPalette || (() => {})}
                    onStartDrag={onStartDrag}
                  />
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>

          {/* Sección de Herramientas */}
          <Collapsible open={toolsExpanded} onOpenChange={setToolsExpanded}>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-accent rounded-md">
              <div className="flex items-center gap-2">
                <Move3D className="h-4 w-4" />
                <span className="font-medium">Herramientas</span>
              </div>
              {toolsExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2 pt-2">
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant={currentTool === "polygon" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => onToolSelect?.("polygon")}
                >
                  <Square className="h-4 w-4 mr-1" />
                  Polígono
                </Button>
                <Button 
                  variant={currentTool === "circle" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => onToolSelect?.("circle")}
                >
                  <Circle className="h-4 w-4 mr-1" />
                  Círculo
                </Button>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Instrucciones */}
          <Card className="bg-muted/50">
            <CardContent className="p-3">
              <h4 className="font-medium mb-2 text-sm">📖 Instrucciones:</h4>
              <ul className="text-xs space-y-1 text-muted-foreground">
                <li>• 🖱️ Usa el mouse para rotar la vista</li>
                <li>• 🔄 Scroll para hacer zoom</li>
                <li>• ↔️ Arrastra para mover la cámara</li>
                <li>• 📝 "Volver a 2D" para editar la forma</li>
                <li>• 🔧 "Re-extruir" para aplicar cambios</li>
                <li>• 🏠 Abre paleta para arrastrar puertas y ventanas</li>
              </ul>
            </CardContent>
          </Card>

          {/* Info del Sistema */}
          <div className="text-xs text-muted-foreground space-y-1 p-2 bg-muted/30 rounded">
            <div>🎯 insonor v1.0</div>
            <div>🎮 Modo: Visualización 3D</div>
            <div>⚡ Rendimiento: 60 FPS</div>
          </div>
        </div>
      </div>
    </>
  )
}