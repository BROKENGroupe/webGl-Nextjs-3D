import { useState, useCallback } from "react";
import { InteractionEngine } from "../core/engine/InteractionEngine";
interface UseWallInteractionsProps {
  isDragActive: boolean;
  draggedTemplate: any;
  isDraggingOpening: boolean;
  draggedOpening: any;
  onDropOpening: (wallIndex: number, position: any, template: any) => void;
  coordinatesToUse: any;
  depth: number;
  handleOpeningPointerUp: () => void;
}

export function useWallInteractions({
  isDragActive,
  draggedTemplate,
  isDraggingOpening,
  draggedOpening,
  onDropOpening,
  coordinatesToUse,
  depth,
  handleOpeningPointerUp,
}: UseWallInteractionsProps) {
  const [hoveredWall, setHoveredWall] = useState<number | null>(null);
  const handleWallPointerEnter = useCallback(
    (wallIndex: number) => {
      if ((isDragActive && draggedTemplate) || (isDraggingOpening && draggedOpening)) {
        setHoveredWall(wallIndex);
      }
    },
    [isDragActive, draggedTemplate, isDraggingOpening, draggedOpening]
  );
  const handleWallPointerLeave = useCallback(() => {
    setHoveredWall(null);
  }, []);
  const calculatePositionFromMouse = useCallback(
    (event: any) => {
      return InteractionEngine.calculatePositionFromMouse(
        event,
        isDraggingOpening,
        draggedOpening,
        coordinatesToUse
      );
    },
    [isDraggingOpening, draggedOpening, coordinatesToUse]
  );
  const handleWallClick = useCallback(
    (wallIndex: number, event: any) => {
      if (isDraggingOpening && draggedOpening) {
        handleOpeningPointerUp();
        event.stopPropagation();
        return;
      }
      if (isDragActive && draggedTemplate) {
        const clampedPosition = InteractionEngine.calculateTemplateDropPosition(
          event,
          wallIndex,
          coordinatesToUse,
          depth
        );
        onDropOpening(wallIndex, clampedPosition, draggedTemplate);
        setHoveredWall(null);
        event.stopPropagation();
      }
    },
    [
      isDragActive,
      draggedTemplate,
      isDraggingOpening,
      draggedOpening,
      handleOpeningPointerUp,
      onDropOpening,
      coordinatesToUse,
      depth,
    ]
  );
  return {
    hoveredWall,
    setHoveredWall,
    handleWallPointerEnter,
    handleWallPointerLeave,
    handleWallClick,
    calculatePositionFromMouse,
  };
}