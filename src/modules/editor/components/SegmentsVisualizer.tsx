
import * as THREE from 'three';
import { Line, Html } from '@react-three/drei';
import { ThirdOctave } from '@/modules/materials/types/AcousticMaterial';
import { useThree } from '@react-three/fiber';

interface Segment {
  corners: {
    bottomLeft: { x: number; y: number; z: number };
    bottomRight: { x: number; y: number; z: number };
    topLeft: { x: number; y: number; z: number };
    topRight: { x: number; y: number; z: number };
  };
  center: { x: number; y: number; z: number };
  Lw: Record<ThirdOctave, number>;
  R_segment: Record<ThirdOctave, number>;
  segmentIndex: number;
  orientation: 'vertical' | 'horizontal';
  normal: { x: number; y: number; z: number };
}

export function SegmentsVisualizer({ segments }: { segments: Segment[] }) {
  if (!segments || segments.length === 0) {
    return null;
  }

  const { camera } = useThree();

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

        const segmentNormal = new THREE.Vector3(segment.normal.x, segment.normal.y, segment.normal.z);
        const cameraDirection = new THREE.Vector3();
        camera.getWorldDirection(cameraDirection);
        const dot = segmentNormal.dot(cameraDirection);

        const rotationY = segment.orientation === 'vertical' ? Math.atan2(segment.normal.x, segment.normal.z) : 0;
        const rotationX = segment.orientation === 'horizontal' ? -Math.PI / 2 : 0;

        return (
          <group key={index}>
            <Line points={points} color="blue" lineWidth={2} />
            <Html 
              position={new THREE.Vector3(segment.center.x, segment.center.y, segment.center.z)}
              occlude
              zIndexRange={[100, 0]}
              pointerEvents="none"
              rotation={[rotationX, rotationY, 0]}
              transform
            >
              <div style={{ 
                color: 'white', 
                background: 'rgba(0, 0, 0, 0.5)', 
                padding: '1px 3px', 
                borderRadius: '2px', 
                fontSize: '0.1rem',
                transform: dot > 0 ? 'scaleX(-1)' : 'none',
              }}>
                <div>Seg: {segment.segmentIndex}</div>
                <div>R': {segment.R_segment[500]?.toFixed(1)} dB</div>
                <div>Lw: {segment.Lw[500]?.toFixed(1)} dB</div>
              </div>
            </Html>
          </group>
        );
      })}
    </group>
  );
}
