import * as THREE from "three";

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

  // Crear múltiples meshes para construir la forma 3D manualmente
  const meshes = [];
  const depth = 5;

  // Crear piso usando los puntos directamente
  const floorPoints: THREE.Vector3[] = [];
  planeCoordinates.forEach(coord => {
    floorPoints.push(new THREE.Vector3(coord.x, 0, coord.z));
  });

  // Crear el piso como una geometría triangulada
  const floorGeometry = new THREE.BufferGeometry();
  
  // Triangular la forma usando earcut (simplificado para polígonos convexos)
  const vertices = [];
  const indices = [];
  
  // Agregar vértices del piso
  planeCoordinates.forEach(coord => {
    vertices.push(coord.x, 0, coord.z);
  });
  
  // Crear triángulos simples (fan triangulation)
  for (let i = 1; i < planeCoordinates.length - 1; i++) {
    indices.push(0, i, i + 1);
  }
  
  floorGeometry.setFromPoints(floorPoints);
  floorGeometry.setIndex(indices);
  floorGeometry.computeVertexNormals();

  // Crear paredes
  const wallGeometries = [];
  for (let i = 0; i < planeCoordinates.length; i++) {
    const nextIndex = (i + 1) % planeCoordinates.length;
    const p1 = planeCoordinates[i];
    const p2 = planeCoordinates[nextIndex];
    
    const wallGeometry = new THREE.PlaneGeometry();
    const wallVertices = new Float32Array([
      p1.x, 0, p1.z,     // bottom left
      p2.x, 0, p2.z,     // bottom right
      p2.x, depth, p2.z, // top right
      p1.x, depth, p1.z  // top left
    ]);
    
    const wallIndices = [0, 1, 2, 0, 2, 3];
    
    wallGeometry.setAttribute('position', new THREE.BufferAttribute(wallVertices, 3));
    wallGeometry.setIndex(wallIndices);
    wallGeometry.computeVertexNormals();
    
    wallGeometries.push(wallGeometry);
  }

  // Crear techo (copia del piso pero a altura depth)
  const ceilingGeometry = floorGeometry.clone();
  const ceilingVertices: number[] = [];
  planeCoordinates.forEach(coord => {
    ceilingVertices.push(coord.x, depth, coord.z);
  });
  // Group the flat array into Vector3s
  const ceilingPoints: THREE.Vector3[] = [];
  for (let i = 0; i < ceilingVertices.length; i += 3) {
    ceilingPoints.push(new THREE.Vector3(ceilingVertices[i], ceilingVertices[i + 1], ceilingVertices[i + 2]));
  }
  ceilingGeometry.setFromPoints(ceilingPoints);

  return (
    <group>
      {/* Piso */}
      <mesh geometry={floorGeometry}>
        <meshStandardMaterial color="#8B4513" side={THREE.DoubleSide} />
      </mesh>
      
      {/* Paredes */}
      {wallGeometries.map((wallGeom, index) => (
        <mesh key={index} geometry={wallGeom}>
          <meshStandardMaterial color="#D2691E" />
        </mesh>
      ))}
      
      {/* Techo */}
      <mesh geometry={ceilingGeometry}>
        <meshStandardMaterial color="#A0522D" side={THREE.DoubleSide} />
      </mesh>
    </group>

  );
}
