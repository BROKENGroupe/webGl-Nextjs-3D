import * as THREE from "three";
import { COLORS, MATERIAL_PROPERTIES, GEOMETRY_CONFIG } from "../config/materials";

interface ExtrudedShapeProps {
  planeCoordinates: { x: number; z: number }[];
  holeCoordinates: { from: { x: number; z: number }; to: { x: number; z: number } }[];
}

export function ExtrudedShape({ planeCoordinates, holeCoordinates }: ExtrudedShapeProps) {
  console.log('ExtrudedShape - Coordenadas XZ del plano:', planeCoordinates);
  console.log('ExtrudedShape - Coordenadas agujeros:', holeCoordinates);
  
  if (planeCoordinates.length === 0) {
    return null;
  }

  // ✅ CORREGIDO: Usar la altura correcta para extrusión de formas
  const depth = GEOMETRY_CONFIG.EXTRUDE_DEPTH; // 2.5 metros de altura

  // Crear múltiples meshes para construir la forma 3D manualmente
  const floorGeometry = new THREE.BufferGeometry();
  
  // Triangular la forma usando earcut (simplificado para polígonos convexos)
  const vertices: number[] = [];
  const indices: number[] = [];
  
  // Agregar vértices del piso
  planeCoordinates.forEach(coord => {
    vertices.push(coord.x, 0, coord.z);
  });
  
  // CORREGIDO: Crear triángulos con orden correcto para piso (normal hacia arriba)
  for (let i = 1; i < planeCoordinates.length - 1; i++) {
    indices.push(0, i, i + 1); // CAMBIO: Quité el +1 y cambié el orden
  }
  
  floorGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  floorGeometry.setIndex(indices);
  floorGeometry.computeVertexNormals();
  floorGeometry.computeBoundingBox();

  // Crear paredes
  const wallGeometries: THREE.BufferGeometry[] = [];
  for (let i = 0; i < planeCoordinates.length; i++) {
    const nextIndex = (i + 1) % planeCoordinates.length;
    const p1 = planeCoordinates[i];
    const p2 = planeCoordinates[nextIndex];
    
    const wallGeometry = new THREE.BufferGeometry();
    const wallVertices = new Float32Array([
      p1.x, 0, p1.z,     // bottom left
      p2.x, 0, p2.z,     // bottom right
      p2.x, depth, p2.z, // top right
      p1.x, depth, p1.z  // top left
    ]);
    
    // CORREGIDO: Orden de índices para que las normales apunten hacia afuera
    const wallIndices = [0, 2, 1, 0, 3, 2]; // Cambiado el orden
    
    wallGeometry.setAttribute('position', new THREE.BufferAttribute(wallVertices, 3));
    wallGeometry.setIndex(wallIndices);
    wallGeometry.computeVertexNormals();
    wallGeometry.computeBoundingBox();
    
    wallGeometries.push(wallGeometry);
  }

  // Crear techo (copia del piso pero a altura depth)
  const ceilingGeometry = new THREE.BufferGeometry();
  const ceilingVertices: number[] = [];
  planeCoordinates.forEach(coord => {
    ceilingVertices.push(coord.x, depth, coord.z);
  });
  
  // CORREGIDO: Techo con orden normal (hacia abajo desde arriba)
  const ceilingIndices: number[] = [];
  for (let i = 1; i < planeCoordinates.length - 1; i++) {
    ceilingIndices.push(0, i, i + 1); // Orden normal para techo
  }
  
  ceilingGeometry.setAttribute('position', new THREE.Float32BufferAttribute(ceilingVertices, 3));
  ceilingGeometry.setIndex(ceilingIndices);
  ceilingGeometry.computeVertexNormals();
  ceilingGeometry.computeBoundingBox();

  return (
    <group>
      {/* Piso - Usando variables centralizadas CORREGIDAS */}
      <mesh geometry={floorGeometry}>
        <meshStandardMaterial 
          color={COLORS.FLOOR}
          side={THREE.DoubleSide}  // ✅ CORREGIDO: Acceso directo a THREE.DoubleSide
          roughness={MATERIAL_PROPERTIES.FLOOR.roughness}
          metalness={MATERIAL_PROPERTIES.FLOOR.metalness}
          transparent={MATERIAL_PROPERTIES.FLOOR.transparent}
          opacity={MATERIAL_PROPERTIES.FLOOR.opacity}
          flatShading={false}
        />
      </mesh>
      
      {/* Paredes - Con transparencia desde variables CORREGIDAS */}
      {wallGeometries.map((wallGeom, index) => (
        <mesh key={`wall-${index}`} geometry={wallGeom}>
          <meshStandardMaterial 
            color={COLORS.WALLS}
            side={THREE.DoubleSide}  // ✅ CORREGIDO: Acceso directo a THREE.DoubleSide
            roughness={MATERIAL_PROPERTIES.WALLS.roughness}
            metalness={MATERIAL_PROPERTIES.WALLS.metalness}
            transparent={MATERIAL_PROPERTIES.WALLS.transparent}
            opacity={MATERIAL_PROPERTIES.WALLS.opacity}
            flatShading={false}
            depthWrite={true}
            depthTest={true}
          />
        </mesh>
      ))}
      
      {/* Techo - Usando variables centralizadas CORREGIDAS */}
      <mesh geometry={ceilingGeometry}>
        <meshStandardMaterial 
          color={COLORS.CEILING}
          side={THREE.DoubleSide}  // ✅ CORREGIDO: Acceso directo a THREE.DoubleSide
          roughness={MATERIAL_PROPERTIES.CEILING.roughness}
          metalness={MATERIAL_PROPERTIES.CEILING.metalness}
          transparent={MATERIAL_PROPERTIES.CEILING.transparent}
          opacity={MATERIAL_PROPERTIES.CEILING.opacity}
          flatShading={false}
        />
      </mesh>
    </group>
  );
}
