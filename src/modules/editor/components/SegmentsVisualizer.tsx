
import * as THREE from 'three';
import { Line } from '@react-three/drei';

interface Segment {
  corners: {
    bottomLeft: { x: number; y: number; z: number };
    bottomRight: { x: number; y: number; z: number };
    topLeft: { x: number; y: number; z: number };
    topRight: { x: number; y: number; z: number };
  };
}

export function SegmentsVisualizer({ segments }: { segments: Segment[] }) {
  if (!segments || segments.length === 0) {
    return null;
  }

  return (
    <group>
      {segments.map((segment, index) => {
        const points = [
          new THREE.Vector3(segment.corners.bottomLeft.x, segment.corners.bottomLeft.y, segment.corners.bottomLeft.z),
          new THREE.Vector3(segment.corners.bottomRight.x, segment.corners.bottomRight.y, segment.corners.bottomRight.z),
          new THREE.Vector3(segment.corners.topRight.x, segment.corners.topRight.y, segment.corners.topRight.z),
          new THREE.Vector3(segment.corners.topLeft.x, segment.corners.topLeft.y, segment.corners.topLeft.z),
        ];

        return <Line key={index} points={points} color="blue" lineWidth={2} />;
      })}
    </group>
  );
}
