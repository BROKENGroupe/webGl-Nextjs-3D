import * as THREE from "three";
import { useOpeningsStore } from "../store/openingsStore";
import { useDrawingStore } from "../store/drawingStore";
import { COLORS, MATERIAL_PROPERTIES, GEOMETRY_CONFIG } from "../config/materials";
import { Opening, OpeningTemplate } from "../types/openings";
import { useState, useCallback } from "react";

interface ExtrudedShapeWithDraggableOpeningsProps {
  planeCoordinates: { x: number; z: number }[];
  onDropOpening: (wallIndex: number, position: number, template: OpeningTemplate) => void;
  isDragActive: boolean;
  draggedTemplate: OpeningTemplate | null;
}

export function ExtrudedShapeWithDraggableOpenings({ 
  planeCoordinates,
  onDropOpening, 
  isDragActive, 
  draggedTemplate 
}: ExtrudedShapeWithDraggableOpeningsProps) {
  
  const { planeXZCoordinates, hasPlaneCoordinates } = useDrawingStore();
  const { openings } = useOpeningsStore();
  const [hoveredWall, setHoveredWall] = useState<number | null>(null);
  
  // ✅ USAR COORDENADAS EXACTAS DEL STORAGE
  let coordinatesToUse = planeXZCoordinates;
  
  if (!hasPlaneCoordinates || coordinatesToUse.length < 3) {
    coordinatesToUse = [
      { x: -6.5, z: -7 },
      { x: 4, z: -4.5 },
      { x: 2, z: 6 },
      { x: -7.5, z: 4.5 },
      { x: -6.5, z: -6.5 }
    ];
    console.log('🏗️ Usando coordenadas exactas del localStorage');
  }

  console.log('🔍 COORDENADAS FINALES:', coordinatesToUse);

  if (coordinatesToUse.length < 3) {
    return null;
  }

  const depth = 3;
  
  // ✅ OBTENER ABERTURAS POR PARED
  const getOpeningsForWall = (wallIndex: number): Opening[] => {
    return openings.filter((opening: Opening) => opening.wallIndex === wallIndex);
  };

  // ✅ CREAR PISO USANDO TRIANGULACIÓN
  const createFloorGeometry = () => {
    const floorGeometry = new THREE.BufferGeometry();
    const vertices: number[] = [];
    const indices: number[] = [];
    
    coordinatesToUse.forEach(coord => {
      vertices.push(coord.x, 0, coord.z);
    });
    
    for (let i = 1; i < coordinatesToUse.length - 1; i++) {
      indices.push(0, i, i + 1);
    }
    
    floorGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    floorGeometry.setIndex(indices);
    floorGeometry.computeVertexNormals();
    
    return floorGeometry;
  };

  // ✅ CREAR TECHO GEOMETRÍA
  const createCeilingGeometry = () => {
    const ceilingGeometry = new THREE.BufferGeometry();
    const vertices: number[] = [];
    const indices: number[] = [];
    
    coordinatesToUse.forEach(coord => {
      vertices.push(coord.x, depth, coord.z);
    });
    
    for (let i = 1; i < coordinatesToUse.length - 1; i++) {
      indices.push(0, i, i + 1);
    }
    
    ceilingGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    ceilingGeometry.setIndex(indices);
    ceilingGeometry.computeVertexNormals();
    
    return ceilingGeometry;
  };

  // ✅ CREAR GEOMETRÍA DE PARED CON ABERTURAS - COORDENADAS LOCALES
  const createWallGeometry = (wallIndex: number, p1: {x: number, z: number}, p2: {x: number, z: number}) => {
    const wallOpenings = getOpeningsForWall(wallIndex);
    const wallLength = Math.sqrt((p2.x - p1.x) ** 2 + (p2.z - p1.z) ** 2);
    
    // ✅ SIEMPRE USAR BUFFERGEOMETRY - SISTEMA UNIFICADO
    const wallGeometry = new THREE.BufferGeometry();
    
    if (wallOpenings.length === 0) {
      // ✅ PARED SIMPLE
      const wallVertices = new Float32Array([
        p1.x, 0, p1.z,     // bottom left
        p2.x, 0, p2.z,     // bottom right  
        p2.x, depth, p2.z, // top right
        p1.x, depth, p1.z  // top left
      ]);
      
      const wallIndices = [0, 2, 1, 0, 3, 2];
      
      wallGeometry.setAttribute('position', new THREE.BufferAttribute(wallVertices, 3));
      wallGeometry.setIndex(wallIndices);
      wallGeometry.computeVertexNormals();
      
    } else {
      // ✅ PARED CON ABERTURAS - CREAR MANUALMENTE CON BUFFERGEOMETRY
      const vertices: number[] = [];
      const indices: number[] = [];
      let vertexIndex = 0;
      
      // Crear segmentos de pared evitando las aberturas
      const segments = createWallSegments(wallLength, depth, wallOpenings);
      
      segments.forEach(segment => {
        let segmentVertices;
        
        if (segment.startY !== undefined && segment.endY !== undefined) {
          // ✅ SEGMENTO SUPERIOR (encima de abertura)
          segmentVertices = [
            p1.x + (segment.startX / wallLength) * (p2.x - p1.x), segment.startY, p1.z + (segment.startX / wallLength) * (p2.z - p1.z),
            p1.x + (segment.endX / wallLength) * (p2.x - p1.x), segment.startY, p1.z + (segment.endX / wallLength) * (p2.z - p1.z),
            p1.x + (segment.endX / wallLength) * (p2.x - p1.x), segment.endY, p1.z + (segment.endX / wallLength) * (p2.z - p1.z),
            p1.x + (segment.startX / wallLength) * (p2.x - p1.x), segment.endY, p1.z + (segment.startX / wallLength) * (p2.z - p1.z)
          ];
        } else {
          // ✅ SEGMENTO NORMAL
          segmentVertices = [
            p1.x + (segment.startX / wallLength) * (p2.x - p1.x), 0, p1.z + (segment.startX / wallLength) * (p2.z - p1.z),
            p1.x + (segment.endX / wallLength) * (p2.x - p1.x), 0, p1.z + (segment.endX / wallLength) * (p2.z - p1.z),
            p1.x + (segment.endX / wallLength) * (p2.x - p1.x), segment.height, p1.z + (segment.endX / wallLength) * (p2.z - p1.z),
            p1.x + (segment.startX / wallLength) * (p2.x - p1.x), segment.height, p1.z + (segment.startX / wallLength) * (p2.z - p1.z)
          ];
        }
        
        vertices.push(...segmentVertices);
        
        // Indices para el segmento
        indices.push(
          vertexIndex, vertexIndex + 2, vertexIndex + 1,
          vertexIndex, vertexIndex + 3, vertexIndex + 2
        );
        
        vertexIndex += 4;
      });
      
      wallGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
      wallGeometry.setIndex(indices);
      wallGeometry.computeVertexNormals();
    }
    
    return wallGeometry;
  };

  // ✅ Tipo para segmentos de pared
  type WallSegment = {
    startX: number;
    endX: number;
    height: number;
    startY?: number;
    endY?: number;
  };
  
  // ✅ FUNCIÓN AUXILIAR PARA CREAR SEGMENTOS DE PARED
  const createWallSegments = (wallLength: number, wallHeight: number, openings: Opening[]): WallSegment[] => {
    const segments: WallSegment[] = [];
    let currentX = 0;
    
    // Ordenar aberturas por posición
    const sortedOpenings = [...openings].sort((a, b) => a.position - b.position);
    
    sortedOpenings.forEach(opening => {
      const openingStartX = (opening.position * wallLength) - opening.width/2;
      const openingEndX = (opening.position * wallLength) + opening.width/2;
      
      // Segmento antes de la abertura
      if (currentX < openingStartX) {
        segments.push({
          startX: currentX,
          endX: openingStartX,
          height: wallHeight
        });
      }
      
      // Segmento superior de la abertura (si no es puerta hasta el techo)
      if (opening.type === 'window' || (opening.bottomOffset + opening.height < wallHeight)) {
        const segmentStartY = opening.bottomOffset + opening.height;
        const segmentEndY = wallHeight;
        
        if (segmentEndY > segmentStartY + 0.1) { // ✅ MARGEN MÍNIMO
          segments.push({
            startX: openingStartX,
            endX: openingEndX,
            height: segmentEndY, // ✅ ALTURA TOTAL DEL SEGMENTO
            startY: segmentStartY,
            endY: segmentEndY
          });
        }
      }
      
      currentX = openingEndX;
    });
    
    // Segmento final
    if (currentX < wallLength) {
      segments.push({
        startX: currentX,
        endX: wallLength,
        height: wallHeight
      });
    }
    
    return segments;
  };

  // ✅ EVENTOS DE DRAG & DROP
  const handleWallPointerEnter = useCallback((wallIndex: number) => {
    if (isDragActive && draggedTemplate) {
      setHoveredWall(wallIndex);
    }
  }, [isDragActive, draggedTemplate]);

  const handleWallPointerLeave = useCallback(() => {
    setHoveredWall(null);
  }, []);

  const handleWallClick = useCallback((wallIndex: number, event: any) => {
    if (!isDragActive || !draggedTemplate) return;
    
    // Calcular posición relativa en la pared
    const p1 = coordinatesToUse[wallIndex];
    const p2 = coordinatesToUse[(wallIndex + 1) % coordinatesToUse.length];
    const wallLength = Math.sqrt((p2.x - p1.x) ** 2 + (p2.z - p1.z) ** 2);
    const wallAngle = Math.atan2(p2.z - p1.z, p2.x - p1.x);
    const centerX = (p1.x + p2.x) / 2;
    const centerZ = (p1.z + p2.z) / 2;
    
    // Convertir punto de clic a coordenadas locales de la pared
    const localPoint = event.point.clone();
    localPoint.sub(new THREE.Vector3(centerX, depth/2, centerZ));
    
    const rotationMatrix = new THREE.Matrix4().makeRotationY(-wallAngle);
    localPoint.applyMatrix4(rotationMatrix);
    
    const relativePosition = (localPoint.x + wallLength/2) / wallLength;
    const clampedPosition = Math.max(0.1, Math.min(0.9, relativePosition));
    
    console.log(`🎯 DROP en pared ${wallIndex} en posición ${clampedPosition.toFixed(2)}`);
    onDropOpening(wallIndex, clampedPosition, draggedTemplate);
    
    setHoveredWall(null);
  }, [isDragActive, draggedTemplate, coordinatesToUse, depth, onDropOpening]);

  const floorGeometry = createFloorGeometry();
  const ceilingGeometry = createCeilingGeometry();

  return (
    <group>
      {/* ✅ PISO */}
      <mesh geometry={floorGeometry}>
        <meshStandardMaterial 
          color={COLORS.FLOOR}
          side={THREE.DoubleSide}
          roughness={MATERIAL_PROPERTIES.FLOOR.roughness}
          metalness={MATERIAL_PROPERTIES.FLOOR.metalness}
        />
      </mesh>
      
      {/* ✅ PAREDES CON DRAG & DROP UNIFICADAS */}
      {coordinatesToUse.map((coord, index) => {
        const nextIndex = (index + 1) % coordinatesToUse.length;
        const nextCoord = coordinatesToUse[nextIndex];
        const wallLength = Math.sqrt((nextCoord.x - coord.x) ** 2 + (nextCoord.z - coord.z) ** 2);
        const wallAngle = Math.atan2(nextCoord.z - coord.z, nextCoord.x - coord.x);
        const centerX = (coord.x + nextCoord.x) / 2;
        const centerZ = (coord.z + nextCoord.z) / 2;
        const wallOpenings = getOpeningsForWall(index);
        
        return (
          <group key={`wall-group-${index}`}>
            {/* ✅ PARED PRINCIPAL - SIN TRANSFORMACIONES */}
            <mesh 
              geometry={createWallGeometry(index, coord, nextCoord)}
              userData={{ wallIndex: index, type: 'wall' }}
              onPointerEnter={(e) => {
                e.stopPropagation();
                handleWallPointerEnter(index);
              }}
              onPointerLeave={(e) => {
                e.stopPropagation();
                handleWallPointerLeave();
              }}
              onClick={(e) => {
                e.stopPropagation();
                handleWallClick(index, e);
              }}
            >
              <meshStandardMaterial 
                color={hoveredWall === index && isDragActive ? "#4CAF50" : COLORS.WALLS}
                side={THREE.DoubleSide}
                roughness={MATERIAL_PROPERTIES.WALLS.roughness}
                metalness={MATERIAL_PROPERTIES.WALLS.metalness}
                transparent={isDragActive}
                opacity={isDragActive ? (hoveredWall === index ? 0.8 : 0.4) : 1.0}
              />
            </mesh>
            
            {/* ✅ SIN MARCOS - SOLO AGUJEROS LIMPIOS */}
            {wallOpenings.map(opening => {
              // ✅ SOLO PUNTO DE DEBUG OPCIONAL
              const t = opening.position;
              const openingX = coord.x + t * (nextCoord.x - coord.x);
              const openingZ = coord.z + t * (nextCoord.z - coord.z);
              const openingY = opening.bottomOffset + opening.height/2;
              
              return (
                <group key={`opening-${index}-${opening.id}`}>
                  {/* ✅ SOLO PUNTO DE REFERENCIA (OPCIONAL - PUEDES ELIMINARLO) */}
                  <mesh position={[openingX, openingY, openingZ]}>
                    <sphereGeometry args={[0.02]} />
                    <meshBasicMaterial color="#FFD700" />
                  </mesh>
                </group>
              );
            })}
          </group>
        );
      })}
      
      {/* ✅ TECHO */}
      <mesh geometry={ceilingGeometry}>
        <meshStandardMaterial 
          color={COLORS.CEILING}
          side={THREE.DoubleSide}
          roughness={MATERIAL_PROPERTIES.CEILING.roughness}
          metalness={MATERIAL_PROPERTIES.CEILING.metalness}
          transparent={true}
          opacity={0.7}
        />
      </mesh>

      {/* ✅ PUNTOS DE REFERENCIA - DEBUG */}
      {coordinatesToUse.map((coord, index) => (
        <mesh 
          key={`point-${index}`}
          position={[coord.x, depth + 0.2, coord.z]}
        >
          <sphereGeometry args={[0.05]} />
          <meshBasicMaterial color={index === 0 ? "#00ff00" : "#ff0000"} />
        </mesh>
      ))}

      {/* ✅ LÍNEAS DE VERIFICACIÓN - DEBUG */}
      {coordinatesToUse.map((coord, index) => {
        const nextIndex = (index + 1) % coordinatesToUse.length;
        const nextCoord = coordinatesToUse[nextIndex];
        
        const length = Math.sqrt(
          (nextCoord.x - coord.x) ** 2 + (nextCoord.z - coord.z) ** 2
        );
        const angle = Math.atan2(nextCoord.z - coord.z, nextCoord.x - coord.x);
        const centerX = (coord.x + nextCoord.x) / 2;
        const centerZ = (coord.z + nextCoord.z) / 2;
        
        return (
          <mesh 
            key={`line-${index}`}
            position={[centerX, 0.05, centerZ]}
            rotation={[0, angle, 0]}
          >
            <boxGeometry args={[length, 0.02, 0.02]} />
            <meshBasicMaterial color="#00ff00" />
          </mesh>
        );
      })}
    </group>
  );
}