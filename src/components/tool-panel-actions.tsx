"use client"

import { Button } from "@/components/ui/button"
import { 
  RotateCcw,
  Download,
  Triangle,
  Trash2,
  Upload,
  Settings,
  AlertCircle
} from "lucide-react"
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface ToolPanelActionsProps {
  onReturnTo2D?: () => void
  onReExtrude?: () => void
  onFixShape?: () => void
  onNewDrawing?: () => void
  onClearStorage?: () => void
  onResetComplete?: () => void
}

export function ToolPanelActions({
  onReturnTo2D,
  onReExtrude,
  onFixShape,
  onNewDrawing,
  onClearStorage,
  onResetComplete
}: ToolPanelActionsProps) {
  return (
    <div className="space-y-3">
      {/* Botones principales */}
      <div className="grid grid-cols-2 gap-2">
        <Button 
          variant="default" 
          size="sm" 
          className="bg-blue-500 hover:bg-blue-600"
          onClick={onReturnTo2D}
        >
          <RotateCcw className="h-4 w-4 mr-1" />
          Volver a 2D
        </Button>
        <Button 
          variant="default" 
          size="sm" 
          className="bg-purple-500 hover:bg-purple-600"
          onClick={onReExtrude}
        >
          <Download className="h-4 w-4 mr-1" />
          Re-extruir
        </Button>
      </div>

      {/* Botones secundarios */}
      <div className="grid grid-cols-2 gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="border-orange-500 text-orange-600 hover:bg-orange-50"
          onClick={onFixShape}
        >
          <Triangle className="h-4 w-4 mr-1" />
          Arreglar Forma
        </Button>
        
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm">
              <Trash2 className="h-4 w-4 mr-1" />
              Nuevo Dibujo
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-destructive" />
                ¿Confirmar nuevo dibujo?
              </AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción eliminará la forma actual y no se puede deshacer. 
                ¿Estás seguro de que quieres continuar?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={onNewDrawing} className="bg-destructive hover:bg-destructive/90">
                Sí, crear nuevo dibujo
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Botones de utilidad */}
      <div className="grid grid-cols-2 gap-2">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="sm" className="border-gray-500">
              <Upload className="h-4 w-4 mr-1" />
              Limpiar Storage
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Limpiar almacenamiento local?</AlertDialogTitle>
              <AlertDialogDescription>
                Se eliminarán todos los datos guardados localmente, incluyendo formas guardadas y configuraciones.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={onClearStorage}>
                Limpiar Storage
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="sm" className="border-orange-500 text-orange-600">
              <Settings className="h-4 w-4 mr-1" />
              Reset Completo
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-destructive" />
                ¿Reset completo del sistema?
              </AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción reiniciará completamente la aplicación, eliminando todas las formas, 
                configuraciones y datos. Esta acción no se puede deshacer.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={onResetComplete} className="bg-destructive hover:bg-destructive/90">
                Sí, reset completo
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}