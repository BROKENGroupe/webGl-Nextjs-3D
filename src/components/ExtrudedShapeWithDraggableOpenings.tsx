import * as THREE from "three";
import { useOpeningsStore } from "../store/openingsStore";
import { useDrawingStore } from "../store/drawingStore";
import { COLORS, MATERIAL_PROPERTIES, GEOMETRY_CONFIG } from "../config/materials";
import { Opening, OpeningTemplate } from "../types/openings";

interface ExtrudedShapeWithDraggableOpeningsProps {
  planeCoordinates: { x: number; z: number }[]; // Mantener por compatibilidad
  onDropOpening: (wallIndex: number, position: number, template: OpeningTemplate) => void;
  isDragActive: boolean;
  draggedTemplate: OpeningTemplate | null;
}

export function ExtrudedShapeWithDraggableOpenings({ 
  planeCoordinates, // ✅ Ignorar este prop
  onDropOpening, 
  isDragActive, 
  draggedTemplate 
}: ExtrudedShapeWithDraggableOpeningsProps) {
  
  // ✅ OBTENER COORDENADAS DIRECTAMENTE DEL STORE (como ExtrudedShape)
  const { planeXZCoordinates, hasPlaneCoordinates } = useDrawingStore();
  
  console.log('🏗️ ExtrudedShapeWithDraggableOpenings renderizando...');
  console.log('✅ Store planeXZCoordinates (USANDO):', planeXZCoordinates);
  console.log('📊 hasPlaneCoordinates:', hasPlaneCoordinates);
  
  // ✅ USAR COORDENADAS DEL STORE (igual que ExtrudedShape)
  const coordinatesToUse = planeXZCoordinates;
  
  // Validar coordenadas del store
  if (!hasPlaneCoordinates || coordinatesToUse.length === 0) {
    console.warn('⚠️ No hay coordenadas guardadas en el store');
    return null;
  }

  // ✅ MISMO ALGORITMO QUE ExtrudedShape.tsx
  const depth = GEOMETRY_CONFIG.EXTRUDE_DEPTH;

  // ✅ CREAR PISO - COPIADO EXACTO DE ExtrudedShape.tsx
  const floorGeometry = new THREE.BufferGeometry();
  
  const vertices: number[] = [];
  const indices: number[] = [];
  
  // Agregar vértices del piso
  coordinatesToUse.forEach(coord => {
    vertices.push(coord.x, 0, coord.z);
  });
  
  // MISMO ALGORITMO: Crear triángulos con orden correcto para piso
  for (let i = 1; i < coordinatesToUse.length - 1; i++) {
    indices.push(0, i, i + 1);
  }
  
  floorGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  floorGeometry.setIndex(indices);
  floorGeometry.computeVertexNormals();
  floorGeometry.computeBoundingBox();

  // ✅ CREAR PAREDES CON GROSOR - MÉTODO PRECISO
  const WALL_THICKNESS = 0.2; // Grosor de 20cm
  
  const wallGeometries: THREE.BufferGeometry[] = [];
  for (let i = 0; i < coordinatesToUse.length; i++) {
    const nextIndex = (i + 1) % coordinatesToUse.length;
    const p1 = coordinatesToUse[i];
    const p2 = coordinatesToUse[nextIndex];
    
    // Calcular vector de la pared y su perpendicular
    const wallVector = new THREE.Vector3(p2.x - p1.x, 0, p2.z - p1.z);
    const wallLength = wallVector.length();
    wallVector.normalize();
    
    // Vector perpendicular hacia el interior (normal)
    const normalVector = new THREE.Vector3(-wallVector.z, 0, wallVector.x);
    const halfThickness = WALL_THICKNESS / 2;
    
    // Calcular las 4 esquinas de la pared (base)
    const outerP1 = {
      x: p1.x - normalVector.x * halfThickness,
      z: p1.z - normalVector.z * halfThickness
    };
    const outerP2 = {
      x: p2.x - normalVector.x * halfThickness,
      z: p2.z - normalVector.z * halfThickness
    };
    const innerP1 = {
      x: p1.x + normalVector.x * halfThickness,
      z: p1.z + normalVector.z * halfThickness
    };
    const innerP2 = {
      x: p2.x + normalVector.x * halfThickness,
      z: p2.z + normalVector.z * halfThickness
    };
    
    // Crear geometría de pared con grosor
    const wallGeometry = new THREE.BufferGeometry();
    
    // 8 vértices: 4 abajo + 4 arriba
    const wallVertices = new Float32Array([
      // Base (Y = 0)
      outerP1.x, 0, outerP1.z,  // 0: exterior P1 base
      outerP2.x, 0, outerP2.z,  // 1: exterior P2 base
      innerP2.x, 0, innerP2.z,  // 2: interior P2 base
      innerP1.x, 0, innerP1.z,  // 3: interior P1 base
      
      // Techo (Y = depth)
      outerP1.x, depth, outerP1.z,  // 4: exterior P1 techo
      outerP2.x, depth, outerP2.z,  // 5: exterior P2 techo
      innerP2.x, depth, innerP2.z,  // 6: interior P2 techo
      innerP1.x, depth, innerP1.z   // 7: interior P1 techo
    ]);
    
    // Índices para las caras de la pared
    const wallIndices = [
      // Cara exterior (hacia el exterior del edificio)
      0, 1, 5,  0, 5, 4,
      // Cara interior (hacia el interior del edificio)
      2, 3, 7,  2, 7, 6,
      // Cara lateral P1 (conexión entre paredes)
      3, 0, 4,  3, 4, 7,
      // Cara lateral P2 (conexión entre paredes)
      1, 2, 6,  1, 6, 5
      // Base y techo se omiten (cubiertos por piso y techo general)
    ];
    
    wallGeometry.setAttribute('position', new THREE.BufferAttribute(wallVertices, 3));
    wallGeometry.setIndex(wallIndices);
    wallGeometry.computeVertexNormals();
    wallGeometry.computeBoundingBox();
    
    wallGeometries.push(wallGeometry);
    
    console.log(`🧱 Pared ${i}: ${wallLength.toFixed(2)}m × ${depth}m × ${WALL_THICKNESS}m`);
    console.log(`   P1: (${p1.x.toFixed(2)}, ${p1.z.toFixed(2)}) → P2: (${p2.x.toFixed(2)}, ${p2.z.toFixed(2)})`);
  }

  // ✅ CREAR TECHO - COPIADO EXACTO DE ExtrudedShape.tsx
  const ceilingGeometry = new THREE.BufferGeometry();
  const ceilingVertices: number[] = [];
  coordinatesToUse.forEach(coord => {
    ceilingVertices.push(coord.x, depth, coord.z);
  });
  
  // MISMO ALGORITMO: Techo con orden normal
  const ceilingIndices: number[] = [];
  for (let i = 1; i < coordinatesToUse.length - 1; i++) {
    ceilingIndices.push(0, i, i + 1);
  }
  
  ceilingGeometry.setAttribute('position', new THREE.Float32BufferAttribute(ceilingVertices, 3));
  ceilingGeometry.setIndex(ceilingIndices);
  ceilingGeometry.computeVertexNormals();
  ceilingGeometry.computeBoundingBox();

  // Obtener aberturas del store
  const openings = useOpeningsStore((state) => state.openings);

  // Filtrar aberturas por pared
  const getOpeningsForWall = (wallIndex: number): Opening[] => {
    return openings.filter((opening: Opening) => opening.wallIndex === wallIndex);
  };

  // ✅ HANDLERS PARA DRAG & DROP EN PAREDES SIMPLES
  const handleWallClick = (wallIndex: number, event: any) => {
    if (isDragActive && draggedTemplate) {
      // Calcular posición relativa en la pared
      const position = 0.5; // Por ahora centro de la pared
      onDropOpening(wallIndex, position, draggedTemplate);
    }
  };

  const handleWallPointerOver = (wallIndex: number) => {
    if (isDragActive) {
      // Cambiar cursor o highlight
    }
  };

  return (
    <group>
      {/* ✅ PISO - EXACTO COMO ExtrudedShape.tsx */}
      <mesh geometry={floorGeometry}>
        <meshStandardMaterial 
          color={COLORS.FLOOR}
          side={THREE[MATERIAL_PROPERTIES.FLOOR.side]}
          roughness={MATERIAL_PROPERTIES.FLOOR.roughness}
          metalness={MATERIAL_PROPERTIES.FLOOR.metalness}
          transparent={MATERIAL_PROPERTIES.FLOOR.transparent}
          opacity={MATERIAL_PROPERTIES.FLOOR.opacity}
          flatShading={false}
        />
      </mesh>
      
      {/* ✅ PAREDES - EXACTO COMO ExtrudedShape.tsx PERO CON EVENTOS */}
      {wallGeometries.map((wallGeom, index) => {
        const wallOpenings = getOpeningsForWall(index);
        const hasOpenings = wallOpenings.length > 0;
        
        return (
          <mesh 
            key={`wall-${index}`} 
            geometry={wallGeom}
            onClick={(e) => {
              e.stopPropagation();
              handleWallClick(index, e);
            }}
            onPointerOver={(e) => {
              e.stopPropagation();
              handleWallPointerOver(index);
            }}
          >
            <meshStandardMaterial 
              color={isDragActive ? "#90EE90" : COLORS.WALLS}
              side={THREE[MATERIAL_PROPERTIES.WALLS.side]}
              roughness={MATERIAL_PROPERTIES.WALLS.roughness}
              metalness={MATERIAL_PROPERTIES.WALLS.metalness}
              transparent={MATERIAL_PROPERTIES.WALLS.transparent}
              opacity={isDragActive ? 0.8 : MATERIAL_PROPERTIES.WALLS.opacity}
              flatShading={false}
              depthWrite={true}
              depthTest={true}
            />
          </mesh>
        );
      })}
      
      {/* ✅ TECHO - EXACTO COMO ExtrudedShape.tsx */}
      <mesh geometry={ceilingGeometry}>
        <meshStandardMaterial 
          color={COLORS.CEILING}
          side={THREE[MATERIAL_PROPERTIES.CEILING.side]}
          roughness={MATERIAL_PROPERTIES.CEILING.roughness}
          metalness={MATERIAL_PROPERTIES.CEILING.metalness}
          transparent={MATERIAL_PROPERTIES.CEILING.transparent}
          opacity={MATERIAL_PROPERTIES.CEILING.opacity}
          flatShading={false}
        />
      </mesh>

      {/* ✅ MOSTRAR ABERTURAS EXISTENTES */}
      {openings.map((opening) => {
        const wallIndex = opening.wallIndex;
        if (wallIndex >= coordinatesToUse.length) return null;
        
        const p1 = coordinatesToUse[wallIndex];
        const p2 = coordinatesToUse[(wallIndex + 1) % coordinatesToUse.length];
        
        // Calcular posición de la abertura en la pared
        const wallLength = Math.sqrt((p2.x - p1.x) ** 2 + (p2.z - p1.z) ** 2);
        const wallAngle = Math.atan2(p2.z - p1.z, p2.x - p1.x);
        
        const openingX = p1.x + (p2.x - p1.x) * opening.position;
        const openingZ = p1.z + (p2.z - p1.z) * opening.position;
        const openingY = opening.bottomOffset + opening.height / 2;
        
        return (
          <group 
            key={opening.id}
            position={[openingX, openingY, openingZ]}
            rotation={[0, wallAngle, 0]}
          >
            <mesh>
              <boxGeometry args={[opening.width, opening.height, 0.3]} />
              <meshStandardMaterial 
                color="#8B4513"
                transparent
                opacity={0.8}
              />
            </mesh>
          </group>
        );
      })}

      {/* ✅ DEBUG: Esferas en las coordenadas exactas del store */}
      {coordinatesToUse.map((coord, index) => (
        <mesh 
          key={`debug-${index}`}
          position={[coord.x, depth + 0.5, coord.z]}
        >
          <sphereGeometry args={[0.05]} />
          <meshBasicMaterial color="#ff0000" />
        </mesh>
      ))}

      {/* Overlay durante drag */}
      {isDragActive && draggedTemplate && (
        <group>
          <mesh position={[0, depth/2, 0]}>
            <boxGeometry args={[50, depth * 1.1, 50]} />
            <meshStandardMaterial 
              color="#00ff00"
              transparent
              opacity={0.05}
              wireframe={false}
            />
          </mesh>
          
          {/* Indicador de que puede hacer drop */}
          <group position={[0, depth + 1, 0]}>
            <mesh>
              <boxGeometry args={[1, 0.2, 1]} />
              <meshBasicMaterial color="#ffff00" />
            </mesh>
          </group>
        </group>
      )}
    </group>
  );
}