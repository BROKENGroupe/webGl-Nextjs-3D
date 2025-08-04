import { useState, useRef, useCallback, useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Hook simplificado para sistema de arrastre - SIN singleton
 */
export function useDragSystem(
  onPointMove?: (index: number, position: THREE.Vector3) => void,
  onDragStart?: () => void,
  onDragEnd?: () => void
) {
  const { scene, camera, raycaster, pointer } = useThree();
  
  // Estados locales simples
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [isShiftPressed, setIsShiftPressed] = useState(false);
  const raycastPlaneRef = useRef<THREE.Mesh | null>(null);

  // Crear plano de raycasting si no existe
  if (!raycastPlaneRef.current) {
    const geometry = new THREE.PlaneGeometry(100, 100);
    const material = new THREE.MeshBasicMaterial({ 
      transparent: true, 
      opacity: 0,
      visible: false // Invisible pero intercepta raycast
    });
    raycastPlaneRef.current = new THREE.Mesh(geometry, material);
    raycastPlaneRef.current.rotation.x = -Math.PI / 2; // Horizontal
    raycastPlaneRef.current.position.y = 0;
    scene.add(raycastPlaneRef.current);
  }

  // Función de snap to grid
  const snapToGrid = useCallback((position: THREE.Vector3): THREE.Vector3 => {
    if (isShiftPressed) {
      // Sin snap cuando Shift está presionado
      return new THREE.Vector3(position.x, 0, position.z);
    } else {
      // Con snap normal
      const increment = 0.1;
      return new THREE.Vector3(
        Math.round(position.x / increment) * increment,
        0,
        Math.round(position.z / increment) * increment
      );
    }
  }, [isShiftPressed]);

  // Función para actualizar posición durante arrastre
  const updateDragPosition = useCallback(() => {
    if (draggedIndex === null || !raycastPlaneRef.current || !onPointMove) {
      return;
    }

    // Actualizar raycaster con posición actual del pointer
    raycaster.setFromCamera(pointer, camera);
    
    // Calcular intersección con plano
    const intersects = raycaster.intersectObject(raycastPlaneRef.current);
    
    if (intersects.length > 0) {
      const intersectionPoint = intersects[0].point;
      const snappedPosition = snapToGrid(intersectionPoint);
      
      // Llamar callback con nueva posición
      onPointMove(draggedIndex, snappedPosition);
    }
  }, [draggedIndex, raycaster, pointer, camera, onPointMove, snapToGrid]);

  // Iniciar arrastre
  const startDrag = useCallback((index: number) => {
    setDraggedIndex(index);
    onDragStart?.();
    
    // Event listeners para arrastre global
    const handlePointerMove = () => updateDragPosition();
    const handlePointerUp = () => endDrag();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Shift') setIsShiftPressed(true);
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Shift') setIsShiftPressed(false);
    };

    // Agregar listeners temporales
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Guardar función de cleanup
    const cleanup = () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };

    // Almacenar cleanup en ref para usar en endDrag
    (window as any).__dragCleanup = cleanup;
  }, [updateDragPosition, onDragStart]);

  // Finalizar arrastre
  const endDrag = useCallback(() => {
    if (draggedIndex !== null) {
      setDraggedIndex(null);
      setIsShiftPressed(false);
      onDragEnd?.();
      
      // Ejecutar cleanup si existe
      if ((window as any).__dragCleanup) {
        (window as any).__dragCleanup();
        delete (window as any).__dragCleanup;
      }
    }
  }, [draggedIndex, onDragEnd]);

  return {
    startDrag,
    endDrag,
    isDragging: draggedIndex !== null,
    currentDragIndex: draggedIndex,
    isShiftMode: isShiftPressed
  };
}