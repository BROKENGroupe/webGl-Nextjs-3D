import * as THREE from "three";
import { useRef, useState, useCallback, useMemo } from "react";
import { ThreeEvent } from "@react-three/fiber";
import { Opening, OpeningTemplate } from "../types/openings";
import { COLORS, MATERIAL_PROPERTIES } from "../config/materials";
import { OpeningFrame } from "./OpeningFrame";
import { useDrawingStore } from "../store/drawingStore";

interface DroppableWallProps {
  p1: { x: number; z: number };
  p2: { x: number; z: number };
  height: number;
  wallIndex: number;
  openings: Opening[];
  onDropOpening: (wallIndex: number, position: number, template: OpeningTemplate) => void;
  isDragActive: boolean;
  draggedTemplate: OpeningTemplate | null;
}

export function DroppableWall({ 
  p1, p2, height, wallIndex, openings, onDropOpening, isDragActive, draggedTemplate 
}: DroppableWallProps) {
  
  const meshRef = useRef<THREE.Mesh>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [canDrop, setCanDrop] = useState(false);
  const [dropPreview, setDropPreview] = useState<{ 
    position: number; 
    visible: boolean;
  }>({
    position: 0.5,
    visible: false
  });

  // ✅ USAR COORDENADAS DEL STORAGE
  const { planeXZCoordinates } = useDrawingStore();
  
  console.log('🏗️ DroppableWall Debug:', {
    wallIndex,
    p1, p2,
    storeCoordinates: planeXZCoordinates,
    storageCoords: planeXZCoordinates.length > 0 ? planeXZCoordinates : 'vacío'
  });

  // ✅ CALCULAR PROPIEDADES EXACTAS DE LA PARED
  const wallLength = Math.sqrt((p2.x - p1.x) ** 2 + (p2.z - p1.z) ** 2);
  const wallAngle = Math.atan2(p2.z - p1.z, p2.x - p1.x);
  const centerX = (p1.x + p2.x) / 2;
  const centerZ = (p1.z + p2.z) / 2;

  // ✅ CREAR GEOMETRÍA DE LA PARED
  const createWallGeometry = useCallback(() => {
    if (openings.length === 0) {
      return new THREE.BoxGeometry(wallLength, height, 0.1);
    }

    const wallShape = new THREE.Shape();
    wallShape.moveTo(-wallLength/2, -height/2);
    wallShape.lineTo(wallLength/2, -height/2);
    wallShape.lineTo(wallLength/2, height/2);
    wallShape.lineTo(-wallLength/2, height/2);
    wallShape.closePath();

    // Agregar agujeros para aberturas
    openings.forEach(opening => {
      const centerX = (opening.position * wallLength) - wallLength/2;
      const centerY = opening.bottomOffset + opening.height/2 - height/2;
      
      const holeStartX = centerX - opening.width/2;
      const holeEndX = centerX + opening.width/2;
      const holeStartY = centerY - opening.height/2;
      const holeEndY = centerY + opening.height/2;

      if (holeStartX > -wallLength/2 && holeEndX < wallLength/2 &&
          holeStartY > -height/2 && holeEndY < height/2) {
        
        const hole = new THREE.Shape();
        hole.moveTo(holeStartX, holeStartY);
        hole.lineTo(holeEndX, holeStartY);
        hole.lineTo(holeEndX, holeEndY);
        hole.lineTo(holeStartX, holeEndY);
        hole.closePath();

        wallShape.holes.push(hole);
      }
    });

    return new THREE.ExtrudeGeometry(wallShape, {
      steps: 1,
      depth: 0.1,
      bevelEnabled: false
    });
  }, [wallLength, height, openings]);

  const wallGeometry = useMemo(() => createWallGeometry(), [createWallGeometry]);

  // ✅ VALIDACIÓN DE POSICIÓN PARA ABERTURAS
  const validateOpeningPlacement = useCallback((position: number, template: OpeningTemplate) => {
    if (!template) return false;
    
    const openingStart = position - template.width / (2 * wallLength);
    const openingEnd = position + template.width / (2 * wallLength);
    
    if (openingStart < 0.05 || openingEnd > 0.95) return false;
    
    for (const existing of openings) {
      const existingStart = existing.position - existing.width / (2 * wallLength);
      const existingEnd = existing.position + existing.width / (2 * wallLength);
      
      if (!(openingEnd < existingStart || openingStart > existingEnd)) {
        return false;
      }
    }
    
    return true;
  }, [wallLength, openings]);

  // ✅ EVENTOS DE MOUSE/POINTER
  const handlePointerEnter = useCallback((event: ThreeEvent<PointerEvent>) => {
    if (!isDragActive || !draggedTemplate) return;
    
    if (event.object.userData?.wallIndex !== wallIndex) return;
    
    event.stopPropagation();
    console.log(`🎯 HOVER ENTER pared ${wallIndex}`);
    setIsHovered(true);
  }, [isDragActive, draggedTemplate, wallIndex]);

  const handlePointerLeave = useCallback((event: ThreeEvent<PointerEvent>) => {
    if (!isDragActive) return;
    
    if (event.object.userData?.wallIndex !== wallIndex) return;
    
    event.stopPropagation();
    console.log(`🎯 HOVER LEAVE pared ${wallIndex}`);
    setIsHovered(false);
    setCanDrop(false);
    setDropPreview(prev => ({ ...prev, visible: false }));
  }, [isDragActive, wallIndex]);

  const handlePointerMove = useCallback((event: ThreeEvent<PointerEvent>) => {
    if (!isDragActive || !draggedTemplate || !isHovered) return;
    
    if (event.object.userData?.wallIndex !== wallIndex) return;

    event.stopPropagation();

    const localPoint = event.point.clone();
    localPoint.sub(new THREE.Vector3(centerX, height/2, centerZ));
    
    const rotationMatrix = new THREE.Matrix4().makeRotationY(-wallAngle);
    localPoint.applyMatrix4(rotationMatrix);
    
    const relativePosition = (localPoint.x + wallLength/2) / wallLength;
    const clampedPosition = Math.max(0.05, Math.min(0.95, relativePosition));
    
    const canPlaceHere = validateOpeningPlacement(clampedPosition, draggedTemplate);
    
    setCanDrop(canPlaceHere);
    setDropPreview({
      position: clampedPosition,
      visible: canPlaceHere
    });
  }, [isDragActive, draggedTemplate, isHovered, wallLength, centerX, centerZ, wallAngle, height, wallIndex, validateOpeningPlacement]);

  const handleClick = useCallback((event: ThreeEvent<MouseEvent>) => {
    if (!isDragActive || !draggedTemplate || !dropPreview.visible) return;
    
    if (event.object.userData?.wallIndex !== wallIndex) return;
    
    event.stopPropagation();
    console.log(`🎯 DROP en pared ${wallIndex} en posición ${dropPreview.position}`);
    
    onDropOpening(wallIndex, dropPreview.position, draggedTemplate);
    setDropPreview({ position: 0.5, visible: false });
    setIsHovered(false);
    setCanDrop(false);
  }, [isDragActive, draggedTemplate, dropPreview, wallIndex, onDropOpening]);

  // ✅ COLORES DINÁMICOS
  const getWallColor = () => {
    if (isDragActive && isHovered) {
      if (canDrop) return "#4CAF50";
      else return "#FF5722";
    }
    return COLORS.WALLS;
  };

  const getWallOpacity = () => {
    if (isDragActive && !isHovered) return 0.4;
    return MATERIAL_PROPERTIES.WALLS.opacity || 1.0;
  };

  return (
    <group 
      position={[centerX, height/2, centerZ]} 
      rotation={[0, wallAngle, 0]}
    >
      {/* ✅ PARED PRINCIPAL */}
      <mesh 
        ref={meshRef}
        geometry={wallGeometry}
        userData={{ wallIndex, type: 'wall' }}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        onPointerMove={handlePointerMove}
        onClick={handleClick}
      >
        <meshStandardMaterial 
          color={getWallColor()}
          side={THREE.DoubleSide}
          roughness={MATERIAL_PROPERTIES.WALLS.roughness}
          metalness={MATERIAL_PROPERTIES.WALLS.metalness}
          transparent={true}
          opacity={getWallOpacity()}
        />
      </mesh>

      {/* ✅ MARCOS DE ABERTURAS */}
      {openings.map(opening => (
        <OpeningFrame 
          key={opening.id}
          opening={opening}
          wallLength={wallLength}
          wallHeight={height}
        />
      ))}

      {/* ✅ PREVIEW DE DROP */}
      {dropPreview.visible && draggedTemplate && isDragActive && isHovered && canDrop && (
        <group position={[
          (dropPreview.position * wallLength) - wallLength/2,
          (draggedTemplate.bottomOffset + draggedTemplate.height/2) - height/2,
          0.11
        ]}>
          <mesh>
            <boxGeometry args={[
              draggedTemplate.width, 
              draggedTemplate.height, 
              0.02
            ]} />
            <meshStandardMaterial 
              color="#4CAF50"
              transparent
              opacity={0.4}
            />
          </mesh>
          
          <mesh>
            <boxGeometry args={[
              draggedTemplate.width + 0.05, 
              draggedTemplate.height + 0.05, 
              0.01
            ]} />
            <meshStandardMaterial 
              color="#ffffff"
              transparent
              opacity={0.9}
              wireframe={true}
            />
          </mesh>
        </group>
      )}

      {/* ✅ DEBUG: Línea central de la pared */}
      <mesh position={[0, height + 0.1, 0]}>
        <boxGeometry args={[wallLength, 0.02, 0.02]} />
        <meshBasicMaterial color="#00ff00" />
      </mesh>
    </group>
  );
}