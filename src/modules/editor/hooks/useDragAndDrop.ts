import { useState, useCallback } from 'react';
import { AcousticMaterial } from '@/modules/editor/types/AcousticMaterial';

export function useDragAndDrop() {
  const [isDragActive, setIsDragActive] = useState(false);
  const [draggedTemplate, setDraggedTemplate] = useState<AcousticMaterial | null>(null);
  const [hoveredWall, setHoveredWall] = useState<number | null>(null);

  const handleDragStart = useCallback((template: AcousticMaterial) => {
    console.log('🎯 GLOBAL: Iniciando drag de', template.type);
    setIsDragActive(true);
    setDraggedTemplate(template);
    setHoveredWall(null);
  }, []);

  const handleDragEnd = useCallback(() => {
    console.log('🎯 GLOBAL: Finalizando drag');
    setIsDragActive(false);
    setDraggedTemplate(null);
    setHoveredWall(null);
  }, []);

  const handleWallHover = useCallback((wallIndex: number | null) => {
    setHoveredWall(wallIndex);
  }, []);

  const handleDrop = useCallback((wallIndex: number, position: number) => {
    if (!draggedTemplate) return null;
    
    console.log('🎯 GLOBAL: Drop en pared', wallIndex, 'posición', position);
    
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