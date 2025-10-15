import { useState } from 'react';
import { useFloorsStore } from '../store/floorsStore';

export interface FloorReplicationOptions {
  replicateOpenings?: boolean;
  replicateMaterials?: boolean;
  customName?: string;
}

export const useFloorReplication = () => {
  const [isReplicating, setIsReplicating] = useState(false);
  const {
    floorLevels,
    activeFloorId,
    replicateFloor,
    replicateFloorMultiple,
    syncFromCurrentStores,
    setActiveFloor
  } = useFloorsStore();

  const replicateCurrentFloor = async (
    targetHeight: number,
    options: FloorReplicationOptions = {}
  ) => {
    if (!activeFloorId) {
      // Si no hay plantas en el store, crear una desde los stores actuales
      syncFromCurrentStores();
      const newActiveId = useFloorsStore.getState().activeFloorId;
      if (!newActiveId) {
        throw new Error('No hay planta activa para replicar');
      }
    }

    setIsReplicating(true);
    try {
      const newFloorId = await replicateFloor(
        activeFloorId!,
        targetHeight,
        options
      );
      return {
        success: true,
        newFloorId,
        message: 'Planta replicada exitosamente'
      };
    } catch (error) {
      return {
        success: false,
        newFloorId: '',
        message: error instanceof Error ? error.message : 'Error desconocido'
      };
    } finally {
      setIsReplicating(false);
    }
  };

  const replicateCurrentFloorMultiple = async (
    count: number,
    heightIncrement: number,
    options: FloorReplicationOptions = {}
  ) => {
    if (!activeFloorId) {
      syncFromCurrentStores();
      const newActiveId = useFloorsStore.getState().activeFloorId;
      if (!newActiveId) {
        throw new Error('No hay planta activa para replicar');
      }
    }

    setIsReplicating(true);
    try {
      const newFloorIds = await replicateFloorMultiple(
        activeFloorId!,
        count,
        heightIncrement,
        options
      );
      return {
        success: true,
        newFloorIds,
        message: `${newFloorIds.length}/${count} plantas replicadas exitosamente`
      };
    } catch (error) {
      return {
        success: false,
        newFloorIds: [],
        message: error instanceof Error ? error.message : 'Error desconocido'
      };
    } finally {
      setIsReplicating(false);
    }
  };

  const getAvailableFloors = () => {
    return floorLevels.map(floor => ({
      id: floor.id,
      name: floor.name,
      baseHeight: floor.baseHeight,
      isActive: floor.isActive,
      wallCount: floor.walls.length,
      openingCount: floor.openings.length,
      hasValidData: floor.coordinates.length >= 3
    }));
  };

  return {
    // Estados
    isReplicating,
    floorLevels,
    activeFloorId,
    availableFloors: getAvailableFloors(),
    
    // Acciones principales
    replicateCurrentFloor,
    replicateCurrentFloorMultiple,
    
    // Acciones del store
    setActiveFloor,
    syncFromCurrentStores,
    
    // Utilidades
    hasActiveFloor: !!activeFloorId,
    totalFloors: floorLevels.length
  };
};