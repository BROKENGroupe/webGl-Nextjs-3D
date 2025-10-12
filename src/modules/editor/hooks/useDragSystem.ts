import { useState, useRef, useCallback, useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Hook simplificado para sistema de arrastre - FUNCIONAL
 */
export function useDragSystem(
  onPointMove?: (index: number, position: THREE.Vector3) => void,
  onDragStart?: () => void,
  onDragEnd?: () => void
) {
  const { scene, camera, raycaster, pointer } = useThree();
  
  //   Estados simples que funcionan
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [isShiftPressed, setIsShiftPressed] = useState(false);
  const raycastPlaneRef = useRef<THREE.Mesh | null>(null);

  //   Crear plano solo una vez
  useEffect(() => {
    if (!raycastPlaneRef.current) {
      const geometry = new THREE.PlaneGeometry(100, 100);
      const material = new THREE.MeshBasicMaterial({ 
        transparent: true, 
        opacity: 0,
        visible: false
      });
      raycastPlaneRef.current = new THREE.Mesh(geometry, material);
      raycastPlaneRef.current.rotation.x = -Math.PI / 2;
      raycastPlaneRef.current.position.y = 0;
      scene.add(raycastPlaneRef.current);
    }

    return () => {
      if (raycastPlaneRef.current) {
        scene.remove(raycastPlaneRef.current);
        raycastPlaneRef.current.geometry.dispose();
        (raycastPlaneRef.current.material as THREE.Material).dispose();
        raycastPlaneRef.current = null;
      }
    };
  }, [scene]);

  //   Snap to grid simple
  const snapToGrid = useCallback((position: THREE.Vector3): THREE.Vector3 => {
    if (isShiftPressed) {
      return new THREE.Vector3(position.x, 0, position.z);
    } else {
      const increment = 0.1;
      return new THREE.Vector3(
        Math.round(position.x / increment) * increment,
        0,
        Math.round(position.z / increment) * increment
      );
    }
  }, [isShiftPressed]);

  //   Update position simple
  const updateDragPosition = useCallback(() => {
    if (draggedIndex === null || !raycastPlaneRef.current || !onPointMove) {
      return;
    }

    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObject(raycastPlaneRef.current);
    
    if (intersects.length > 0) {
      const intersectionPoint = intersects[0].point;
      const snappedPosition = snapToGrid(intersectionPoint);
      onPointMove(draggedIndex, snappedPosition);
    }
  }, [draggedIndex, raycaster, pointer, camera, onPointMove, snapToGrid]);

  //   Iniciar arrastre
  const startDrag = useCallback((index: number) => {
    setDraggedIndex(index);
    onDragStart?.();
  }, [onDragStart]);

  //   Finalizar arrastre
  const endDrag = useCallback(() => {
    setDraggedIndex(null);
    setIsShiftPressed(false);
    onDragEnd?.();
  }, [onDragEnd]);

  //   Effect para manejar eventos globales durante arrastre
  useEffect(() => {
    if (draggedIndex === null) return;

    const handlePointerMove = () => {
      updateDragPosition();
    };

    const handlePointerUp = () => {
      endDrag();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Shift') {
        setIsShiftPressed(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Shift') {
        setIsShiftPressed(false);
      }
    };

    // Agregar listeners
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Cleanup
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [draggedIndex, updateDragPosition, endDrag]);

  return {
    startDrag,
    endDrag,
    isDragging: draggedIndex !== null,
    currentDragIndex: draggedIndex,
    isShiftMode: isShiftPressed
  };
}