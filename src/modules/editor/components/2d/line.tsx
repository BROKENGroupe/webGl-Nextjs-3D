import * as THREE from "three";
import { LineGeometryEngine } from "../../core/engine/LineGeometryEngine";
import { LINE_COLORS } from "@/config/materials";


type LineProps = {
  start: THREE.Vector3;
  end: THREE.Vector3;
  hovered: boolean;
  eventHandler?: any;
  color?: string;
};

export function Line({
  start,
  end,
  hovered,
  eventHandler = {},
  color = LINE_COLORS.line
}: LineProps) {
  const transform = LineGeometryEngine.calculateLineTransform(start, end);
  const dimensions = LineGeometryEngine.calculateLineDimensions(hovered);

  return (
    <group>
      {/* LÍNEA PRINCIPAL */}
      <mesh
        position={[transform.midPoint.x, transform.midPoint.y + 0.005, transform.midPoint.z]}
        quaternion={[transform.quaternion.x, transform.quaternion.y, transform.quaternion.z, transform.quaternion.w]}
        {...eventHandler}
      >
        <boxGeometry args={[dimensions.width, transform.distance, dimensions.depth]} />
        <meshBasicMaterial
          color={hovered
            ? new THREE.Color(LINE_COLORS.line).multiplyScalar(1.3)
            : LINE_COLORS.line
          }
          transparent={false}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* CONTORNO DE LÍNEA */}
      <mesh
        position={[transform.midPoint.x, transform.midPoint.y + 0.006, transform.midPoint.z]}
        quaternion={[transform.quaternion.x, transform.quaternion.y, transform.quaternion.z, transform.quaternion.w]}
      >
        <boxGeometry args={[
          dimensions.outlineWidth,
          transform.distance + 0.015,
          0.004
        ]} />
        <meshBasicMaterial
          color={hovered ? LINE_COLORS.lineOutlineHover : LINE_COLORS.lineOutline}
          transparent={true}
          opacity={0.6}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}