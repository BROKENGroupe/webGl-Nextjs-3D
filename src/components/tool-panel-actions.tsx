/**
 * @fileoverview Componente de panel de herramientas con acciones principales de la aplicación
 * 
 * Este componente proporciona una interfaz unificada para las acciones más importantes
 * del sistema de dibujo 3D, incluyendo navegación entre vistas, gestión de formas,
 * y operaciones de mantenimiento del sistema.
 * 
 * @module ToolPanelActions
 * @version 1.0.0
 * @author WebGL-NextJS-3D Team
 * @since 2024
 * 
 * @requires react
 * @requires @/components/ui/button
 * @requires @/components/ui/alert-dialog
 * @requires lucide-react
 * 
 * @example
 * ```tsx
 * import { ToolPanelActions } from '@/components/tool-panel-actions';
 * 
 * function MyComponent() {
 *   return (
 *     <ToolPanelActions
 *       onReturnTo2D={() => console.log('Returning to 2D view')}
 *       onReExtrude={() => console.log('Re-extruding shape')}
 *       onFixShape={() => console.log('Fixing shape distortion')}
 *       onNewDrawing={() => console.log('Starting new drawing')}
 *       onClearStorage={() => console.log('Clearing localStorage')}
 *       onResetComplete={() => console.log('Complete system reset')}
 *     />
 *   );
 * }
 * ```
 */

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

/**
 * @interface ToolPanelActionsProps
 * @description Propiedades del componente ToolPanelActions
 * 
 * @property {function} [onReturnTo2D] - Callback para volver a la vista 2D
 * @property {function} [onReExtrude] - Callback para re-extruir la forma actual
 * @property {function} [onFixShape] - Callback para reparar formas distorsionadas
 * @property {function} [onNewDrawing] - Callback para iniciar un nuevo dibujo
 * @property {function} [onClearStorage] - Callback para limpiar el localStorage
 * @property {function} [onResetComplete] - Callback para reset completo del sistema
 * 
 * @example
 * ```tsx
 * const props: ToolPanelActionsProps = {
 *   onReturnTo2D: () => setExtruded(false),
 *   onReExtrude: () => handleReExtrude(),
 *   onFixShape: () => handleFixExtrusion(),
 *   onNewDrawing: () => resetAll(),
 *   onClearStorage: () => localStorage.clear(),
 *   onResetComplete: () => window.location.reload()
 * };
 * ```
 */
interface ToolPanelActionsProps {
  /** Función para volver a la vista 2D desde la vista 3D extruida */
  onReturnTo2D?: () => void;
  
  /** Función para re-extruir la forma actual con las coordenadas guardadas */
  onReExtrude?: () => void;
  
  /** Función para corregir distorsiones en formas 3D */
  onFixShape?: () => void;
  
  /** Función para iniciar un nuevo dibujo, limpiando el estado actual */
  onNewDrawing?: () => void;
  
  /** Función para limpiar el almacenamiento local de la aplicación */
  onClearStorage?: () => void;
  
  /** Función para reset completo del sistema y recarga de la aplicación */
  onResetComplete?: () => void;
}

/**
 * @component ToolPanelActions
 * @description Panel de herramientas con acciones principales del sistema de dibujo 3D
 * 
 * Proporciona una interfaz organizada en tres niveles:
 * 1. **Acciones Principales**: Navegación entre vistas 2D/3D
 * 2. **Acciones Secundarias**: Reparación de formas y nuevo dibujo
 * 3. **Utilidades**: Mantenimiento del sistema y reset
 * 
 * ### Características:
 * - **Confirmaciones de Seguridad**: Diálogos de confirmación para acciones destructivas
 * - **Iconografía Consistente**: Íconos de Lucide React para mejor UX
 * - **Layout Responsivo**: Grid adaptable con ShadCN UI
 * - **Accesibilidad**: Botones con estados y descripciones claras
 * - **Feedback Visual**: Colores semánticos para diferentes tipos de acciones
 * 
 * ### Organización Visual:
 * ```
 * ┌─────────────────┬─────────────────┐
 * │  🔄 Volver 2D   │  🔄 Re-extruir  │  ← Navegación principal
 * ├─────────────────┼─────────────────┤
 * │  🔧 Arreglar    │  🗑️ Nuevo       │  ← Acciones de forma
 * ├─────────────────┼─────────────────┤
 * │  📦 Limpiar     │  ⚙️ Reset       │  ← Utilidades
 * └─────────────────┴─────────────────┘
 * ```
 * 
 * @param {ToolPanelActionsProps} props - Propiedades del componente
 * @returns {JSX.Element} Panel de herramientas renderizado
 * 
 * @example
 * ```tsx
 * // Uso básico
 * <ToolPanelActions
 *   onReturnTo2D={() => setViewMode('2D')}
 *   onNewDrawing={() => resetDrawing()}
 * />
 * 
 * // Uso completo con todas las funciones
 * <ToolPanelActions
 *   onReturnTo2D={handleReturnTo2D}
 *   onReExtrude={handleReExtrude}
 *   onFixShape={handleFixShape}
 *   onNewDrawing={handleNewDrawing}
 *   onClearStorage={handleClearStorage}
 *   onResetComplete={handleResetComplete}
 * />
 * ```
 * 
 * @see {@link https://ui.shadcn.com/docs/components/button} - Documentación de Button
 * @see {@link https://ui.shadcn.com/docs/components/alert-dialog} - Documentación de AlertDialog
 * @see {@link https://lucide.dev/icons} - Iconos disponibles en Lucide React
 */
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
      {/* 
        SECCIÓN 1: BOTONES PRINCIPALES 
        Acciones de navegación entre vistas 2D y 3D
      */}
      <div className="grid grid-cols-2 gap-2">
        {/* Botón: Volver a Vista 2D */}
        <Button 
          variant="default" 
          size="sm" 
          className="bg-blue-500 hover:bg-blue-600"
          onClick={onReturnTo2D}
          title="Cambiar a modo de edición 2D manteniendo las coordenadas guardadas"
        >
          <RotateCcw className="h-4 w-4 mr-1" />
          Volver a 2D
        </Button>
        
        {/* Botón: Re-extruir Forma */}
        <Button 
          variant="default" 
          size="sm" 
          className="bg-purple-500 hover:bg-purple-600"
          onClick={onReExtrude}
          title="Volver a extruir la forma usando las coordenadas guardadas"
        >
          <Download className="h-4 w-4 mr-1" />
          Re-extruir
        </Button>
      </div>

      {/* 
        SECCIÓN 2: BOTONES SECUNDARIOS 
        Acciones de reparación y gestión de formas
      */}
      <div className="grid grid-cols-2 gap-2">
        {/* Botón: Arreglar Forma Distorsionada */}
        <Button 
          variant="outline" 
          size="sm" 
          className="border-orange-500 text-orange-600 hover:bg-orange-50"
          onClick={onFixShape}
          title="Corregir distorsiones en la forma 3D actual"
        >
          <Triangle className="h-4 w-4 mr-1" />
          Arreglar Forma
        </Button>
        
        {/* Botón: Nuevo Dibujo (con confirmación) */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              variant="destructive" 
              size="sm"
              title="Iniciar un nuevo dibujo eliminando el actual"
            >
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
              <AlertDialogAction 
                onClick={onNewDrawing} 
                className="bg-destructive hover:bg-destructive/90"
              >
                Sí, crear nuevo dibujo
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* 
        SECCIÓN 3: BOTONES DE UTILIDAD 
        Acciones de mantenimiento del sistema
      */}
      <div className="grid grid-cols-2 gap-2">
        {/* Botón: Limpiar Storage Local (con confirmación) */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              className="border-gray-500"
              title="Eliminar todos los datos guardados en localStorage"
            >
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

        {/* Botón: Reset Completo del Sistema (con confirmación) */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              className="border-orange-500 text-orange-600"
              title="Reiniciar completamente la aplicación"
            >
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
              <AlertDialogAction 
                onClick={onResetComplete} 
                className="bg-destructive hover:bg-destructive/90"
              >
                Sí, reset completo
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}

/**
 * @namespace ToolPanelActionsTypes
 * @description Tipos y interfaces relacionados con ToolPanelActions
 */
export namespace ToolPanelActionsTypes {
  /**
   * @typedef {Object} ActionCategory
   * @description Categorías de acciones disponibles en el panel
   * @property {string} primary - Acciones principales de navegación
   * @property {string} secondary - Acciones de gestión de formas
   * @property {string} utility - Utilidades de mantenimiento
   */
  export type ActionCategory = 'primary' | 'secondary' | 'utility';

  /**
   * @typedef {Object} ButtonConfig
   * @description Configuración para cada botón del panel
   * @property {string} label - Texto del botón
   * @property {string} icon - Nombre del ícono de Lucide
   * @property {string} variant - Variante de estilo del botón
   * @property {ActionCategory} category - Categoría de la acción
   * @property {boolean} requiresConfirmation - Si requiere diálogo de confirmación
   */
  export interface ButtonConfig {
    label: string;
    icon: string;
    variant: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
    category: ActionCategory;
    requiresConfirmation: boolean;
  }
}

/**
 * @constant BUTTON_CONFIGURATIONS
 * @description Configuraciones predefinidas para cada botón del panel
 * @type {Record<string, ToolPanelActionsTypes.ButtonConfig>}
 * 
 * @example
 * ```tsx
 * const config = BUTTON_CONFIGURATIONS.returnTo2D;
 * console.log(config.label); // "Volver a 2D"
 * console.log(config.requiresConfirmation); // false
 * ```
 */
export const BUTTON_CONFIGURATIONS: Record<string, ToolPanelActionsTypes.ButtonConfig> = {
  returnTo2D: {
    label: 'Volver a 2D',
    icon: 'RotateCcw',
    variant: 'default',
    category: 'primary',
    requiresConfirmation: false
  },
  reExtrude: {
    label: 'Re-extruir',
    icon: 'Download',
    variant: 'default',
    category: 'primary',
    requiresConfirmation: false
  },
  fixShape: {
    label: 'Arreglar Forma',
    icon: 'Triangle',
    variant: 'outline',
    category: 'secondary',
    requiresConfirmation: false
  },
  newDrawing: {
    label: 'Nuevo Dibujo',
    icon: 'Trash2',
    variant: 'destructive',
    category: 'secondary',
    requiresConfirmation: true
  },
  clearStorage: {
    label: 'Limpiar Storage',
    icon: 'Upload',
    variant: 'outline',
    category: 'utility',
    requiresConfirmation: true
  },
  resetComplete: {
    label: 'Reset Completo',
    icon: 'Settings',
    variant: 'outline',
    category: 'utility',
    requiresConfirmation: true
  }
} as const;

/**
 * @example Ejemplo de uso completo del componente
 * ```tsx
 * import { ToolPanelActions } from '@/components/tool-panel-actions';
 * import { useDrawingStore } from '@/store/drawingStore';
 * 
 * function DrawingInterface() {
 *   const { setExtruded, resetAll } = useDrawingStore();
 *   
 *   const handleReturnTo2D = () => {
 *     setExtruded(false);
 *     console.log('Cambiando a vista 2D');
 *   };
 *   
 *   const handleReExtrude = () => {
 *     setExtruded(false);
 *     setTimeout(() => setExtruded(true), 100);
 *   };
 *   
 *   const handleNewDrawing = () => {
 *     resetAll();
 *     localStorage.removeItem('drawing-storage');
 *   };
 *   
 *   const handleClearStorage = () => {
 *     localStorage.clear();
 *     console.log('Storage limpiado');
 *   };
 *   
 *   const handleResetComplete = () => {
 *     localStorage.clear();
 *     resetAll();
 *     window.location.reload();
 *   };
 *   
 *   return (
 *     <div className="p-4">
 *       <h2>Panel de Herramientas</h2>
 *       <ToolPanelActions
 *         onReturnTo2D={handleReturnTo2D}
 *         onReExtrude={handleReExtrude}
 *         onFixShape={() => console.log('Reparando forma...')}
 *         onNewDrawing={handleNewDrawing}
 *         onClearStorage={handleClearStorage}
 *         onResetComplete={handleResetComplete}
 *       />
 *     </div>
 *   );
 * }
 * ```
 */