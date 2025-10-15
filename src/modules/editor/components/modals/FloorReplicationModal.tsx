import React, { useState, useEffect, useMemo } from 'react';
import { X, Copy, Building, Settings, CheckCircle, AlertCircle } from 'lucide-react';
import { useFloorReplication, FloorReplicationOptions } from '../../hooks/useFloorReplication';

interface FloorReplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (newFloorId: string) => void;
}

export const FloorReplicationModal: React.FC<FloorReplicationModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const {
    replicateCurrentFloor,
    replicateCurrentFloorMultiple,
    availableFloors,
    isReplicating,
    syncFromCurrentStores,
    hasActiveFloor
  } = useFloorReplication();

  const [selectedFloorIndex, setSelectedFloorIndex] = useState(0);
  const [numberOfFloors, setNumberOfFloors] = useState(1);
  const [floorHeight, setFloorHeight] = useState(3.0);
  const [replicateOpenings, setReplicateOpenings] = useState(true);
  const [replicateMaterials, setReplicateMaterials] = useState(true);
  const [customName, setCustomName] = useState('');
  const [isMultiple, setIsMultiple] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  // Verificar si necesita sincronizar usando useMemo - MEJORADO
  const shouldSync = useMemo(() => {
    // NO HACER NADA si el modal está cerrado
    if (!isOpen) return false;
    
    // NO SINCRONIZAR si ya hay plantas (evita borrar colores)
    if (availableFloors.length > 0) {
      console.log('🎯 Ya hay plantas disponibles, no es necesario sincronizar');
      return false;
    }
    
    // Solo sincronizar si realmente no hay plantas Y no hay planta activa
    const needsSync = availableFloors.length === 0 && !hasActiveFloor;
    
    return needsSync;
  }, [isOpen, availableFloors.length, hasActiveFloor]);

  // useEffect separado para ejecutar la sincronización
  useEffect(() => {
    if (shouldSync) {
      console.log('🔄 Ejecutando sincronización necesaria...');
      
      // Verificar que hay datos válidos antes de sincronizar
      const { useDrawingStore } = require('../../store/drawingStore');
      const drawingState = useDrawingStore.getState();
      
      if (drawingState.hasPlaneCoordinates && drawingState.planeXZCoordinates.length > 0) {
        console.log('🎨 Sincronizando conservando colores de fachadas...');
        syncFromCurrentStores();
      } else {
        console.log('⚠️ No hay coordenadas válidas para sincronizar');
      }
    }
  }, [shouldSync, syncFromCurrentStores]);

  if (!isOpen) return null;

  const selectedFloor = availableFloors[selectedFloorIndex];

  const handleSingleReplication = async () => {
    const targetHeight = (availableFloors.length + 1) * floorHeight;
    
    const options: FloorReplicationOptions = {
      replicateOpenings,
      replicateMaterials,
      customName: customName || 'Duplicada'
    };

    const result = await replicateCurrentFloor(targetHeight, options);
    setResult(result);
    
    if (result.success && onSuccess) {
      onSuccess(result.newFloorId);
    }
  };

  const handleMultipleReplication = async () => {
    const results = await replicateCurrentFloorMultiple(
      numberOfFloors,
      floorHeight,
      { replicateOpenings, replicateMaterials }
    );

    setResult(results);

    if (results.success && results.newFloorIds.length > 0 && onSuccess) {
      onSuccess(results.newFloorIds[0]);
    }
  };

  const handleSubmit = () => {
    setResult(null); // Limpiar resultados anteriores
    
    if (isMultiple) {
      handleMultipleReplication();
    } else {
      handleSingleReplication();
    }
  };

  // Función mejorada para crear planta manual
  const handleCreateFromCurrent = () => {
    console.log('🎨 Creación manual - conservando colores...');
    
    // Verificar estado antes de crear
    const { useWallsStore } = require('../../store/wallsStore');
    const wallsState = useWallsStore.getState();
    
    console.log('🔍 Colores actuales antes de crear:', wallsState.walls.map((w: any) => ({ 
      id: w.id, 
      color: w.color,
      hasColor: !!w.color 
    })));
    
    syncFromCurrentStores();
    
    // Verificar después de crear
    setTimeout(() => {
      console.log('🔍 Plantas después de crear:', availableFloors.map(f => ({ 
        name: f.name, 
        walls: f.wallCount 
      })));
    }, 100);
  };

  return (
    <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Building className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Replicar Planta
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Mensaje si no hay plantas */}
          {availableFloors.length === 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-yellow-800">
                    No hay plantas disponibles
                  </h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    Primero necesitas crear una planta desde tu diseño actual.
                  </p>
                  <button
                    onClick={handleCreateFromCurrent}
                    disabled={isReplicating}
                    className="mt-3 px-3 py-1.5 bg-black text-white text-sm rounded-md hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {isReplicating ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent"></div>
                        <span>Creando...</span>
                      </>
                    ) : (
                      <>
                        <Building className="w-3 h-3" />
                        <span>Crear planta desde diseño actual</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Selección de planta origen - Solo si hay plantas */}
          {availableFloors.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Planta a replicar
              </label>
              <select
                value={selectedFloorIndex}
                onChange={(e) => setSelectedFloorIndex(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {availableFloors.map((floor, index) => (
                  <option key={floor.id} value={index}>
                    {floor.name} ({floor.wallCount} paredes, {floor.openingCount} aberturas)
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Solo mostrar opciones si hay plantas disponibles */}
          {availableFloors.length > 0 && (
            <>
              {/* Tipo de replicación */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de replicación
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="replicationType"
                      checked={!isMultiple}
                      onChange={() => setIsMultiple(false)}
                      className="mr-2"
                    />
                    Una planta
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="replicationType"
                      checked={isMultiple}
                      onChange={() => setIsMultiple(true)}
                      className="mr-2"
                    />
                    Múltiples plantas
                  </label>
                </div>
              </div>

              {/* Configuración múltiple */}
              {isMultiple && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Número de plantas
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={numberOfFloors}
                    onChange={(e) => setNumberOfFloors(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}

              {/* Altura de planta */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Altura por planta (metros)
                </label>
                <input
                  type="number"
                  min="2"
                  max="10"
                  step="0.1"
                  value={floorHeight}
                  onChange={(e) => setFloorHeight(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Nombre personalizado para una planta */}
              {!isMultiple && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre personalizado (opcional)
                  </label>
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="Duplicada"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}

              {/* Opciones de replicación */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-700 flex items-center">
                  <Settings className="w-4 h-4 mr-2" />
                  Opciones de replicación
                </h3>
                
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={replicateOpenings}
                    onChange={(e) => setReplicateOpenings(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">
                    Replicar aberturas (puertas y ventanas)
                  </span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={replicateMaterials}
                    onChange={(e) => setReplicateMaterials(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">
                    Replicar materiales y configuraciones
                  </span>
                </label>
              </div>

              {/* Vista previa */}
              {/* {selectedFloor && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Vista previa</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>Planta origen: <span className="font-medium">{selectedFloor.name}</span></div>
                    <div>Altura actual: <span className="font-medium">{selectedFloor.baseHeight}m</span></div>
                    <div>Nueva altura: <span className="font-medium">
                      {isMultiple 
                        ? `${(availableFloors.length + 1) * floorHeight}m - ${(availableFloors.length + numberOfFloors) * floorHeight}m`
                        : `${(availableFloors.length + 1) * floorHeight}m`
                      }
                    </span></div>
                    {replicateOpenings && (
                      <div>Aberturas: <span className="font-medium">{selectedFloor.openingCount} a replicar</span></div>
                    )}
                  </div>
                </div>
              )} */}
            </>
          )}

          {/* Resultado */}
          {result && (
            <div className={`p-3 rounded-lg flex items-center space-x-2 ${
              result.success 
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {result.success ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
              <span className="text-sm">{result.message}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            disabled={isReplicating}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          
          <button
            onClick={handleSubmit}
            disabled={isReplicating || availableFloors.length === 0}
            className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 min-w-[120px]"
          >
            {isReplicating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span>Replicando...</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>
                  {isMultiple 
                    ? `Replicar ${numberOfFloors} plantas`
                    : 'Replicar planta'
                  }
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};