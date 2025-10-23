import { useState, useCallback } from 'react';
import { AcousticMaterial } from '@/modules/materials/types/AcousticMaterial';

export function useDragAndDrop() {
  const [isDragActive, setIsDragActive] = useState(false);
  const [draggedTemplate, setDraggedTemplate] = useState<AcousticMaterial | null>(null);
  const [hoveredWall, setHoveredWall] = useState<number | null>(null);

  const handleDragStart = useCallback((template: AcousticMaterial) => {    
    setIsDragActive(true);
    setDraggedTemplate(template);
    setHoveredWall(null);
  }, []);

  const handleDragEnd = useCallback(() => {    
    setIsDragActive(false);
    setDraggedTemplate(null);
    setHoveredWall(null);
  }, []);

  const handleWallHover = useCallback((wallIndex: number | null) => {
    setHoveredWall(wallIndex);
  }, []);

  const handleDrop = useCallback((wallIndex: number, position: number) => {
    if (!draggedTemplate) return null;
    
    const droppedTemplate = draggedTemplate;
    handleDragEnd();
    
    return droppedTemplate;
  }, [draggedTemplate, handleDragEnd]);

  return {
    isDragActive,
    draggedTemplate,
    hoveredWall,
    handleDragStart,
    handleDragEnd,
    handleWallHover,
    handleDrop
  };
}