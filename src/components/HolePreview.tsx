import * as THREE from "three";

export function HolePreview({ from, to, color = "skyblue" }: { from: THREE.Vector3; to: THREE.Vector3; color?: string }) {
  const shape = new THREE.Shape();
  shape.moveTo(from.x, from.z);
  shape.lineTo(to.x, from.z);
  shape.lineTo(to.x, to.z);
  shape.lineTo(from.x, to.z);
  shape.lineTo(from.x, from.z);
  const geometry = new THREE.ShapeGeometry(shape);

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]}>
      <meshStandardMaterial color={color} transparent opacity={0.4} />
      <primitive object={geometry} />
    </mesh>
  );
}
