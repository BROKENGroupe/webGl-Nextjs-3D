import React from 'react';
import { useFloorsStore } from '../store/floorsStore';
import { ExtrudedShapeWithDraggableOpenings } from './ExtrudedShapeWithDraggableOpenings';

interface MultiFloorRendererProps {
  // Props que se pasan a cada ExtrudedShape
  onDropOpening: (wallIndex: number, position: number, template: any) => void;
  isDragActive: boolean;
  draggedTemplate: any;
  showHeatmap?: boolean;
  onToggleHeatmap?: () => void;
  onAddFloor?: () => void;
  onWallContextMenu?: (event: any, facadeName: number, title: string, elementType: any) => void;
  onOpeningContextMenu?: (event: any, openingId: any, title: string, elementType: any) => void;
  onCeilingContextMenu?: (event: any, facadeName: string, title: string, elementType: any) => void;
  onFloorContextMenu?: (event: any, facadeName: string, title: string, elementType: any) => void;
  
  // Configuración multi-planta
  showAllFloors?: boolean;
  selectedFloorId?: string | null;
}

export const MultiFloorRenderer: React.FC<MultiFloorRendererProps> = ({
  onDropOpening,
  isDragActive,
  draggedTemplate,
  showHeatmap = false,
  onToggleHeatmap,
  onAddFloor,
  onWallContextMenu,
  onOpeningContextMenu,
  onCeilingContextMenu,
  onFloorContextMenu,
  showAllFloors = false,
  selectedFloorId = null
}) => {
  const { floorLevels, activeFloorId } = useFloorsStore();

  // Determinar qué plantas renderizar
  const floorsToRender = React.useMemo(() => {
    if (selectedFloorId) {
      return floorLevels.filter(floor => floor.id === selectedFloorId);
    }
    
    if (showAllFloors) {
      return floorLevels;
    }
    
    // Solo mostrar la planta activa
    return floorLevels.filter(floor => floor.id === activeFloorId);
  }, [floorLevels, activeFloorId, showAllFloors, selectedFloorId]);

  console.log('🏗️ MultiFloorRenderer:', {
    totalFloors: floorLevels.length,
    floorsToRender: floorsToRender.length,
    activeFloorId,
    showAllFloors
  });

  // Si no hay plantas en el sistema multi-planta, usar el sistema original
  if (floorLevels.length === 0) {
    return (
      <ExtrudedShapeWithDraggableOpenings
        onDropOpening={onDropOpening}
        isDragActive={isDragActive}
        draggedTemplate={draggedTemplate}
        showHeatmap={showHeatmap}
        onToggleHeatmap={onToggleHeatmap}
        onAddFloor={onAddFloor}
        onWallContextMenu={onWallContextMenu}
        onOpeningContextMenu={onOpeningContextMenu}
        onCeilingContextMenu={onCeilingContextMenu}
        onFloorContextMenu={onFloorContextMenu}
        floors2={[]}
        openings={[]}
        ceilings2={[]}
        // Sin coordenadas específicas - usará las del store
      />
    );
  }

  return (
    <group name="multi-floor-renderer">
      {floorsToRender.map((floor, index) => {
        const isActiveFloor = floor.id === activeFloorId;
        const opacity = showAllFloors && !isActiveFloor ? 0.4 : 1.0;
        
        return (
          <group 
            key={floor.id}
            name={`floor-level-${floor.name}`}
            position={[0, floor.baseHeight, 0]}
          >
            <ExtrudedShapeWithDraggableOpenings
              // Coordenadas específicas de esta planta
              planeCoordinates={floor.coordinates}
              
              // Elementos específicos de esta planta
              floors2={floor.floors}
              openings={floor.openings}
              ceilings2={floor.ceilings}
              
              // AGREGAR: Pasar las paredes específicas de esta planta
              // walls2={floor.walls} // Nueva prop para paredes específicas
              
              // Props multi-planta
              floorHeight={floor.baseHeight}
              floorId={floor.id}
              opacity={opacity}
              interactive={isActiveFloor} // Solo la planta activa es interactiva
              
              // Event handlers (solo para planta activa)
              onDropOpening={isActiveFloor ? onDropOpening : () => {}}
              isDragActive={isActiveFloor ? isDragActive : false}
              draggedTemplate={isActiveFloor ? draggedTemplate : null}
              showHeatmap={isActiveFloor ? showHeatmap : false}
              onToggleHeatmap={onToggleHeatmap}
              onAddFloor={onAddFloor}
              onWallContextMenu={isActiveFloor ? onWallContextMenu : undefined}
              onOpeningContextMenu={isActiveFloor ? onOpeningContextMenu : undefined}
              onCeilingContextMenu={isActiveFloor ? onCeilingContextMenu : undefined}
              onFloorContextMenu={isActiveFloor ? onFloorContextMenu : undefined}
            />
          </group>
        );
      })}
    </group>
  );
};