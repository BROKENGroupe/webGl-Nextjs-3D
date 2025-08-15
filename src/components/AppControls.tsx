import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Undo2, Redo2, Trash2, Wrench, BarChart3, PlusSquare, Plus, Flame } from "lucide-react";

export function AppControls({
  isClosed,
  isExtruded,
  walls,
  handleExtrude,
  handleBackTo2D,
  handleFixExtrusion,
  handleNewDrawing,
  handleClearStorage,
  handleCleanAndReset,
  handleAddFloor,
  handleToggleHeatmap,
  setShowAcousticModal,
}: {
  isClosed: boolean;
  isExtruded: boolean;
  walls: any[];
  handleExtrude: () => void;
  handleBackTo2D: () => void;
  handleFixExtrusion: () => void;
  handleNewDrawing: () => void;
  handleClearStorage: () => void;
  handleCleanAndReset: () => void;
  handleAddFloor: () => void;
  handleToggleHeatmap: () => void;
  setShowAcousticModal: (v: boolean) => void;
}) {
  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-2 z-50">
      {isClosed && !isExtruded && (
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={handleExtrude}
              className="bg-muted hover:bg-accent text-muted-foreground p-2 rounded-lg shadow transition-colors"
              aria-label="Extruir Estructura"
            >
              <Redo2 size={22} />
            </button>
          </TooltipTrigger>
          <TooltipContent>Extruir Estructura</TooltipContent>
        </Tooltip>
      )}
      {isExtruded && (
        <>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleBackTo2D}
                className="bg-muted hover:bg-accent text-muted-foreground p-2 rounded-lg shadow transition-colors"
                aria-label="Volver a 2D"
              >
                <Undo2 size={22} />
              </button>
            </TooltipTrigger>
            <TooltipContent>Volver a 2D</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleExtrude}
                className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded shadow-lg transition-colors"
                aria-label="Re-extruir"
              >
                <Redo2 size={22} />
              </button>
            </TooltipTrigger>
            <TooltipContent>Re-extruir</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleFixExtrusion}
                className="bg-muted hover:bg-accent text-muted-foreground p-2 rounded-lg shadow transition-colors"
                aria-label="Arreglar Forma"
              >
                <Wrench size={22} />
              </button>
            </TooltipTrigger>
            <TooltipContent>Arreglar Forma</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => setShowAcousticModal(true)}
                className="bg-muted hover:bg-accent text-muted-foreground p-2 rounded-lg shadow transition-colors"
                aria-label="Análisis Acústico"
                disabled={walls.length === 0}
              >
                <BarChart3 size={22} />
              </button>
            </TooltipTrigger>
            <TooltipContent>Análisis Acústico</TooltipContent>
          </Tooltip>
        </>
      )}
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={handleNewDrawing}
            className="bg-muted hover:bg-accent text-muted-foreground p-2 rounded-lg shadow transition-colors"
            aria-label="Nuevo Dibujo"
          >
            <PlusSquare size={22} />
          </button>
        </TooltipTrigger>
        <TooltipContent>Nuevo Dibujo</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={handleClearStorage}
            className="bg-muted hover:bg-accent text-muted-foreground p-2 rounded-lg shadow transition-colors"
            aria-label="Limpiar Storage"
          >
            <Trash2 size={22} />
          </button>
        </TooltipTrigger>
        <TooltipContent>Limpiar Storage</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={handleCleanAndReset}
            className="bg-muted hover:bg-accent text-muted-foreground p-2 rounded-lg shadow transition-colors"
            aria-label="Reset Completo"
          >
            <Wrench size={22} />
          </button>
        </TooltipTrigger>
        <TooltipContent>Reset Completo</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={handleAddFloor}
            className="bg-muted hover:bg-accent text-muted-foreground p-2 rounded-lg shadow transition-colors"
            aria-label="Agregar Planta"
          >
            <Plus size={22} />
          </button>
        </TooltipTrigger>
        <TooltipContent>Agregar Planta</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={handleToggleHeatmap}
            className="bg-muted hover:bg-accent text-muted-foreground p-2 rounded-lg shadow transition-colors"
            aria-label="Mapa de Calor"
          >
            <Flame size={22} />
          </button>
        </TooltipTrigger>
        <TooltipContent>Mapa de Calor</TooltipContent>
      </Tooltip>
    </div>
  );
}