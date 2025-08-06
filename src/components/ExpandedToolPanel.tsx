"use client"

import { Html } from "@react-three/drei"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { 
  ChevronLeft, 
  ChevronRight,
  RotateCcw,
  Download,
  Triangle,
  Trash2,
  Upload,
  Settings,
  Eye,
  EyeOff,
  Grid3X3,
  Palette,
  Move3D,
  Layers,
  Home,
  DoorOpen,
  Circle,
  Square,
  Hexagon,
  ArrowUp,
  ArrowDown,
  ZoomIn,
  ZoomOut,
  RotateCw
} from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Separator } from "@/components/ui/separator"

interface ExpandedToolPanelProps {
  position?: [number, number, number]
  isExpanded?: boolean
  onToggleExpanded?: () => void
  onReturnTo2D?: () => void
  onReExtrude?: () => void
  onFixShape?: () => void
  onNewDrawing?: () => void
  onClearStorage?: () => void
  onResetComplete?: () => void
  onToggleWireframe?: () => void
  onToggleGrid?: () => void
  onShowMaterials?: () => void
  isWireframe?: boolean
  isGridVisible?: boolean
}

export function ExpandedToolPanel({
  position = [-8, 0, 0],
  isExpanded = false,
  onToggleExpanded,
  onReturnTo2D,
  onReExtrude,
  onFixShape,
  onNewDrawing,
  onClearStorage,
  onResetComplete,
  onToggleWireframe,
  onToggleGrid,
  onShowMaterials,
  isWireframe = false,
  isGridVisible = false
}: ExpandedToolPanelProps) {
  const [activeSection, setActiveSection] = useState<string | null>("main")

  return (
    <Html
      position={position}
      transform={false}
      occlude={false}
      style={{
        pointerEvents: 'auto',
        userSelect: 'none'
      }}
    >
      <TooltipProvider>
        <div className="flex items-start">
          {/* ✅ PANEL EXPANDIDO */}
          {isExpanded && (
            <div className="bg-white/95 backdrop-blur-md border border-gray-200 rounded-xl shadow-2xl p-4 mr-2 min-h-[500px] w-64">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-800 text-sm">🛠️ Herramientas 3D</h3>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={onToggleExpanded}
                    className="h-6 w-6 p-0"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                </div>

                {/* Acciones Principales */}
                <div className="space-y-2">
                  <h4 className="text-xs font-medium text-gray-600 uppercase tracking-wide">Acciones</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="default" 
                          size="sm" 
                          className="bg-blue-500 hover:bg-blue-600 text-white h-8"
                          onClick={onReturnTo2D}
                        >
                          <RotateCcw className="h-3 w-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Volver a 2D</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="default" 
                          size="sm" 
                          className="bg-purple-500 hover:bg-purple-600 text-white h-8"
                          onClick={onReExtrude}
                        >
                          <Download className="h-3 w-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Re-extruir</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="border-orange-500 text-orange-600 hover:bg-orange-50 h-8"
                          onClick={onFixShape}
                        >
                          <Triangle className="h-3 w-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Arreglar Forma</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          className="h-8"
                          onClick={onNewDrawing}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Nuevo Dibujo</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>

                <Separator />

                {/* Visualización */}
                <div className="space-y-2">
                  <h4 className="text-xs font-medium text-gray-600 uppercase tracking-wide">Vista</h4>
                  <div className="grid grid-cols-3 gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant={isWireframe ? "default" : "outline"} 
                          size="sm" 
                          className="h-8"
                          onClick={onToggleWireframe}
                        >
                          {isWireframe ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{isWireframe ? "Vista Sólida" : "Vista Wireframe"}</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant={isGridVisible ? "default" : "outline"} 
                          size="sm" 
                          className="h-8"
                          onClick={onToggleGrid}
                        >
                          <Grid3X3 className="h-3 w-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{isGridVisible ? "Ocultar Grid" : "Mostrar Grid"}</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8"
                          onClick={onShowMaterials}
                        >
                          <Palette className="h-3 w-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Materiales</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>

                <Separator />

                {/* Herramientas de Forma */}
                <div className="space-y-2">
                  <h4 className="text-xs font-medium text-gray-600 uppercase tracking-wide">Formas</h4>
                  <div className="grid grid-cols-3 gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="sm" className="h-8">
                          <Square className="h-3 w-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Rectángulo</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="sm" className="h-8">
                          <Circle className="h-3 w-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Círculo</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="sm" className="h-8">
                          <Hexagon className="h-3 w-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Polígono</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>

                <Separator />

                {/* Elementos Arquitectónicos */}
                <div className="space-y-2">
                  <h4 className="text-xs font-medium text-gray-600 uppercase tracking-wide">Elementos</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="sm" className="h-8">
                          <DoorOpen className="h-3 w-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Puertas</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="sm" className="h-8">
                          <Home className="h-3 w-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Ventanas</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>

                <Separator />

                {/* Controles de Cámara */}
                <div className="space-y-2">
                  <h4 className="text-xs font-medium text-gray-600 uppercase tracking-wide">Cámara</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="sm" className="h-8">
                          <ZoomIn className="h-3 w-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Acercar</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="sm" className="h-8">
                          <ZoomOut className="h-3 w-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Alejar</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="sm" className="h-8">
                          <RotateCw className="h-3 w-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Rotar Vista</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="sm" className="h-8">
                          <Home className="h-3 w-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Vista Inicial</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>

                <Separator />

                {/* Utilidades */}
                <div className="space-y-2">
                  <h4 className="text-xs font-medium text-gray-600 uppercase tracking-wide">Sistema</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8"
                          onClick={onClearStorage}
                        >
                          <Upload className="h-3 w-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Limpiar Storage</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8"
                          onClick={onResetComplete}
                        >
                          <Settings className="h-3 w-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Reset Completo</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>

                {/* Info del Estado */}
                <div className="mt-4 p-2 bg-gray-50 rounded-md">
                  <div className="text-xs text-gray-600 space-y-1">
                    <div>🎯 Modo: Vista 3D</div>
                    <div>⚡ 60 FPS</div>
                    <div>📐 Forma Activa</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ✅ BOTÓN TOGGLE CIRCULAR */}
          <div className="bg-white/95 backdrop-blur-md border border-gray-200 rounded-full shadow-lg">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggleExpanded}
                  className="h-12 w-12 rounded-full p-0 hover:bg-gray-100"
                >
                  {isExpanded ? (
                    <ChevronLeft className="h-5 w-5 text-gray-600" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-gray-600" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isExpanded ? "Ocultar Panel" : "Mostrar Panel"}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </TooltipProvider>
    </Html>
  )
}