import * as THREE from "three";
import { useRef, useState } from "react";
import { ThreeEvent } from "@react-three/fiber";
import { Opening, OpeningTemplate } from "../types/openings";
import { COLORS, MATERIAL_PROPERTIES } from "../config/materials";
import { OpeningFrame } from "./OpeningFrame";

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
  const [dropPreview, setDropPreview] = useState<{ position: number; visible: boolean }>({
    position: 0.5,
    visible: false
  });
  
  // Calcular propiedades de la pared
  const wallLength = Math.sqrt((p2.x - p1.x) ** 2 + (p2.z - p1.z) ** 2);
  const wallAngle = Math.atan2(p2.z - p1.z, p2.x - p1.x);
  const centerX = (p1.x + p2.x) / 2;
  const centerZ = (p1.z + p2.z) / 2;
  
  // Crear geometría de pared con aberturas
  const createWallGeometry = () => {
    if (openings.length === 0) {
      return new THREE.BoxGeometry(wallLength, height, 0.2);
    }
    
    const wallShape = new THREE.Shape();
    wallShape.moveTo(-wallLength/2, -height/2);
    wallShape.lineTo(wallLength/2, -height/2);
    wallShape.lineTo(wallLength/2, height/2);
    wallShape.lineTo(-wallLength/2, height/2);
    wallShape.closePath();
    
    openings.forEach(opening => {
      const startX = (opening.position - 0.5) * wallLength - opening.width / 2;
      const endX = startX + opening.width;
      const startY = opening.bottomOffset - height/2;
      const endY = startY + opening.height;
      
      const hole = new THREE.Shape();
      hole.moveTo(startX, startY);
      hole.lineTo(endX, startY);
      hole.lineTo(endX, endY);
      hole.lineTo(startX, endY);
      hole.closePath();
      
      wallShape.holes.push(hole);
    });
    
    return new THREE.ExtrudeGeometry(wallShape, {
      steps: 1,
      depth: 0.2,
      bevelEnabled: false
    });
  };

  const handlePointerMove = (event: ThreeEvent<PointerEvent>) => {
    if (!isDragActive || !draggedTemplate) return;
    
    const localPoint = event.point.clone();
    localPoint.sub(new THREE.Vector3(centerX, height/2, centerZ));
    
    const rotationMatrix = new THREE.Matrix4().makeRotationY(-wallAngle);
    localPoint.applyMatrix4(rotationMatrix);
    
    const relativePosition = (localPoint.x + wallLength/2) / wallLength;
    const clampedPosition = Math.max(0.1, Math.min(0.9, relativePosition));
    
    setDropPreview({
      position: clampedPosition,
      visible: true
    });
  };

  const handlePointerEnter = () => {
    if (isDragActive) {
      setIsHovered(true);
    }
  };

  const handlePointerLeave = () => {
    setIsHovered(false);
    setDropPreview(prev => ({ ...prev, visible: false }));
  };

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    if (!isDragActive || !draggedTemplate) return;
    
    event.stopPropagation();
    onDropOpening(wallIndex, dropPreview.position, draggedTemplate);
  };

  const getWallColor = () => {
    if (isDragActive && isHovered) return "#90EE90";
    if (isDragActive) return "#E6FFE6";
    return COLORS.WALLS;
  };

  const getWallOpacity = () => {
    if (isDragActive && isHovered) return 0.9;
    if (isDragActive) return 0.8;
    return MATERIAL_PROPERTIES.WALLS.opacity;
  };

  return (
    <group position={[centerX, height/2, centerZ]} rotation={[0, wallAngle, 0]}>
      <mesh 
        ref={meshRef}
        geometry={createWallGeometry()}
        onPointerMove={handlePointerMove}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        onClick={handleClick}
      >
        <meshStandardMaterial 
          color={getWallColor()}
          side={THREE.FrontSide}
          roughness={MATERIAL_PROPERTIES.WALLS.roughness}
          metalness={MATERIAL_PROPERTIES.WALLS.metalness}
          transparent={MATERIAL_PROPERTIES.WALLS.transparent}
          opacity={getWallOpacity()}
          flatShading={false}
        />
      </mesh>
      
      {/* Marcos de aberturas existentes */}
      {openings.map(opening => (
        <OpeningFrame 
          key={opening.id}
          opening={opening}
          wallLength={wallLength}
        />
      ))}
      
      {/* Preview de drop */}
      {dropPreview.visible && draggedTemplate && isDragActive && (
        <group 
          position={[
            (dropPreview.position - 0.5) * wallLength,
            draggedTemplate.defaultBottomOffset + draggedTemplate.defaultHeight/2 - height/2,
            0.15
          ]}
        >
          <mesh>
            <boxGeometry args={[
              draggedTemplate.defaultWidth, 
              draggedTemplate.defaultHeight, 
              0.1
            ]} />
            <meshStandardMaterial 
              color="#00ff00"
              transparent
              opacity={0.7}
              wireframe={false}
            />
          </mesh>
        </group>
      )}

      {/* Indicador de zona droppable */}
      {isDragActive && (
        <mesh position={[0, 0, 0.1]}>
          <boxGeometry args={[wallLength * 1.02, height * 1.02, 0.05]} />
          <meshStandardMaterial 
            color={isHovered ? "#00ff00" : "#90EE90"}
            transparent
            opacity={isHovered ? 0.3 : 0.15}
            wireframe={true}
          />
        </mesh>
      )}
    </group>
  );
}