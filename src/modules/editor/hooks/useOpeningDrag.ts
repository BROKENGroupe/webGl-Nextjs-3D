import { useState, useCallback } from "react";

export function useOpeningDrag(
  updateOpeningPosition: (id: string, wallIndex: number, position: number) => void
) {
  const [draggedOpening, setDraggedOpening] = useState<{ id: string } | null>(null);
  const [isDraggingOpening, setIsDraggingOpening] = useState(false);
  const [previewPosition, setPreviewPosition] = useState<{ wallIndex: number; position: number } | null>(null);

  const handleOpeningPointerDown = useCallback(
    (
      opening: { id: string }, 
      event: any, 
      calculatePositionFromMouse: (event: any) => { wallIndex: number; position: number } | null
    ) => {
    event.stopPropagation();
    setDraggedOpening(opening);
    setIsDraggingOpening(true);
    const initialPos = calculatePositionFromMouse(event);
    if (initialPos) setPreviewPosition(initialPos);
  }, []);

  const handleOpeningPointerUp = useCallback(() => {
    if (isDraggingOpening && draggedOpening && previewPosition) {
      updateOpeningPosition(
        draggedOpening.id,
        previewPosition.wallIndex,
        previewPosition.position
      );
      setDraggedOpening(null);
      setIsDraggingOpening(false);
      setPreviewPosition(null);
    }
  }, [isDraggingOpening, draggedOpening, previewPosition, updateOpeningPosition]);

  const handleMouseMove = useCallback(
    (
      event: any,
      calculatePositionFromMouse: (event: any) => { wallIndex: number; position: number } | null
    ) => {
      if (isDraggingOpening && draggedOpening) {
        const newPosition = calculatePositionFromMouse(event);
        if (newPosition) setPreviewPosition(newPosition);
      }
    },
    [isDraggingOpening, draggedOpening]
  );

  return {
    draggedOpening,
    isDraggingOpening,
    previewPosition,
    setDraggedOpening,
    setIsDraggingOpening,
    setPreviewPosition,
    handleOpeningPointerDown,
    handleOpeningPointerUp,
    handleMouseMove,
  };
}