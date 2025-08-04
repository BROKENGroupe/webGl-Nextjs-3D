import * as THREE from 'three';
import { LineGeometryEngine } from '../engine/LineGeometryEngine';
import { LineEventHandler } from '../engine/LineEventHandler';

interface LineRendererProps {
  points: THREE.Vector3[];
  color?: string;
  hoveredLineIndex: number | null;
  hoveredVertexIndex: number | null;
  draggedIndex: number | null;
  isShiftMode: boolean;
  eventHandler: LineEventHandler;
}

/**
 * Componente especializado en renderizado de líneas y vértices
 */
export function LineRenderer({
  points,
  color = "blue",
  hoveredLineIndex,
  hoveredVertexIndex,
  draggedIndex,
  isShiftMode,
  eventHandler
}: LineRendererProps) {

  return (
    <>
      {/* RENDERIZADO DE LÍNEAS */}
      {points.length > 1 && points.slice(0, -1).map((point, index) => {
        const start = points[index];
        const end = points[index + 1];
        const transform = LineGeometryEngine.calculateLineTransform(start, end);
        const dimensions = LineGeometryEngine.calculateLineDimensions(
          hoveredLineIndex === index
        );
        const lineHandlers = eventHandler.createLineHandlers(index);
        
        return (
          <group key={`line-group-${index}`}>
            {/* Línea principal */}
            <mesh
              position={[transform.midPoint.x, transform.midPoint.y + 0.005, transform.midPoint.z]}
              quaternion={[transform.quaternion.x, transform.quaternion.y, transform.quaternion.z, transform.quaternion.w]}
              {...lineHandlers}
            >
              <boxGeometry args={[dimensions.width, transform.distance, dimensions.depth]} />
              <meshBasicMaterial
                color={hoveredLineIndex === index ? new THREE.Color("#4DA6FF").multiplyScalar(1.3) : "#4DA6FF"}
                transparent={false}
                side={THREE.DoubleSide}
              />
            </mesh>
            
            {/* Contorno */}
            <mesh
              position={[transform.midPoint.x, transform.midPoint.y + 0.006, transform.midPoint.z]}
              quaternion={[transform.quaternion.x, transform.quaternion.y, transform.quaternion.z, transform.quaternion.w]}
            >
              <boxGeometry args={[dimensions.outlineWidth, transform.distance + 0.015, 0.004]} />
              <meshBasicMaterial
                color={hoveredLineIndex === index ? "#E6F3FF" : "#B3D9FF"}
                transparent={true}
                opacity={0.6}
                side={THREE.DoubleSide}
              />
            </mesh>
          </group>
        );
      })}

      {/* RENDERIZADO DE VÉRTICES */}
      {points.map((point, index) => {
        const isHovered = hoveredVertexIndex === index;
        const isDragged = draggedIndex === index;
        const scale = LineGeometryEngine.calculateVertexScale(isHovered, isDragged);
        const vertexHandlers = eventHandler.createVertexHandlers(index);
        
        // Colores dinámicos
        const baseColor = isDragged 
          ? (isShiftMode ? "#ff6600" : "#00ff00")
          : isHovered ? "#66B3FF" : "#3399FF";
        const outlineColor = isDragged ? "#ffffff" : isHovered ? "#004080" : "#1A66CC";
        
        return (
          <group key={`vertex-group-${index}`}>
            {/* Vértice principal */}
            <mesh
              position={[point.x, point.y + 0.008, point.z]}
              rotation={[-Math.PI / 2, 0, 0]}
              scale={[scale, scale, 1]}
              {...vertexHandlers}
            >
              <planeGeometry args={[0.16, 0.16]} />
              <meshBasicMaterial 
                color={baseColor}
                transparent={false}
                side={THREE.DoubleSide}
              />
            </mesh>
            
            {/* Contorno */}
            <mesh
              position={[point.x, point.y + 0.009, point.z]}
              rotation={[-Math.PI / 2, 0, 0]}
              scale={[scale * 1.05, scale * 1.05, 1]}
            >
              <ringGeometry args={[0.08, 0.086, 4]} />
              <meshBasicMaterial
                color={outlineColor}
                transparent={false}
                side={THREE.DoubleSide}
              />
            </mesh>
            
            {/* Punto central */}
            <mesh
              position={[point.x, point.y + 0.01, point.z]}
              rotation={[-Math.PI / 2, 0, 0]}
              scale={[scale * 0.3, scale * 0.3, 1]}
            >
              <circleGeometry args={[0.025, 8]} />
              <meshBasicMaterial
                color={isDragged ? "#000000" : "#ffffff"}
                transparent={false}
                side={THREE.DoubleSide}
              />
            </mesh>
            
            {/* Cruz de selección */}
            {(isHovered || isDragged) && (
              <>
                <mesh
                  position={[point.x, point.y + 0.011, point.z]}
                  rotation={[-Math.PI / 2, 0, 0]}
                  scale={[scale * 1.4, scale * 0.1, 1]}
                >
                  <planeGeometry args={[0.2, 0.015]} />
                  <meshBasicMaterial
                    color="#ffffff"
                    transparent={true}
                    opacity={0.8}
                    side={THREE.DoubleSide}
                  />
                </mesh>
                
                <mesh
                  position={[point.x, point.y + 0.011, point.z]}
                  rotation={[-Math.PI / 2, 0, 0]}
                  scale={[scale * 0.1, scale * 1.4, 1]}
                >
                  <planeGeometry args={[0.015, 0.2]} />
                  <meshBasicMaterial
                    color="#ffffff"
                    transparent={true}
                    opacity={0.8}
                    side={THREE.DoubleSide}
                  />
                </mesh>
              </>
            )}
          </group>
        );
      })}
    </>
  );
}