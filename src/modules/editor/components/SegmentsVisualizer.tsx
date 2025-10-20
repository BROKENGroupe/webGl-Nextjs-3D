
import * as THREE from 'three';
import { Line, Html } from '@react-three/drei';
import { ThirdOctave } from '@/modules/materials/types/AcousticMaterial';

interface Segment {
  corners: {
    bottomLeft: { x: number; y: number; z: number };
    bottomRight: { x: number; y: number; z: number };
    topLeft: { x: number; y: number; z: number };
    topRight: { x: number; y: number; z: number };
  };
  center: { x: number; y: number; z: number };
  Lw: Record<ThirdOctave, number>;
  segmentIndex: number;
}

export function SegmentsVisualizer({ segments }: { segments: Segment[] }) {
  if (!segments || segments.length === 0) {
    return null;
  }

  return (
    <group>
      {segments.filter(segment => segment.corners).map((segment, index) => {
        const points = [
          new THREE.Vector3(segment.corners.bottomLeft.x, segment.corners.bottomLeft.y, segment.corners.bottomLeft.z),
          new THREE.Vector3(segment.corners.bottomRight.x, segment.corners.bottomRight.y, segment.corners.bottomRight.z),
          new THREE.Vector3(segment.corners.topRight.x, segment.corners.topRight.y, segment.corners.topRight.z),
          new THREE.Vector3(segment.corners.topLeft.x, segment.corners.topLeft.y, segment.corners.topLeft.z),
          new THREE.Vector3(segment.corners.bottomLeft.x, segment.corners.bottomLeft.y, segment.corners.bottomLeft.z),
        ];

        return (
          <group key={index}>
            <Line points={points} color="blue" lineWidth={2} />
            <Html position={new THREE.Vector3(segment.center.x, segment.center.y, segment.center.z)}>
              <div style={{ color: 'white', background: 'rgba(0, 0, 0, 0.5)', padding: '2px 5px', borderRadius: '3px' }}>
                <div>Segment: {segment.segmentIndex}</div>
                <div>Lw @ 500Hz: {segment.Lw[500]?.toFixed(1)} dB</div>
              </div>
            </Html>
          </group>
        );
      })}
    </group>
  );
}
