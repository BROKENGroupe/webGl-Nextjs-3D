"use client";

import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { useRef, useState, useEffect } from "react";

function snapToGrid(pos: THREE.Vector3, step = 0.5): THREE.Vector3 {
  return new THREE.Vector3(
    Math.round(pos.x / step) * step,
    0,
    Math.round(pos.z / step) * step
  );
}

function DrawingSurface({ onClick3D }: { onClick3D: (pos: THREE.Vector3) => void }) {
  const { camera } = useThree();
  const raycaster = new THREE.Raycaster();
  const plane = useRef<THREE.Mesh>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (e.button !== 0) return;
      const mouse = new THREE.Vector2(
        (e.clientX / window.innerWidth) * 2 - 1,
        -(e.clientY / window.innerHeight) * 2 + 1
      );
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObject(plane.current!);
      if (intersects.length > 0) {
        const snapped = snapToGrid(intersects[0].point);
        onClick3D(snapped);
      }
    };
    window.addEventListener("mousedown", handleClick);
    return () => window.removeEventListener("mousedown", handleClick);
  }, [camera, onClick3D]);

  return (
    <mesh ref={plane} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
      <planeGeometry args={[50, 50]} />
      <meshStandardMaterial transparent opacity={0} />
    </mesh>
  );
}

function LineBuilder({ points, color = "blue" }: { points: THREE.Vector3[]; color?: string }) {
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  return (
    <primitive
      object={
        new THREE.Line(
          geometry,
          new THREE.LineBasicMaterial({ color, linewidth: 2 })
        )
      }
    />
  );
}

function HolePreview({ from, to, color = "skyblue" }: { from: THREE.Vector3; to: THREE.Vector3; color?: string }) {
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

function ExtrudedShape({ points, holes }: { points: THREE.Vector3[]; holes: { from: THREE.Vector3; to: THREE.Vector3 }[] }) {
  const shape = new THREE.Shape();
  shape.moveTo(points[0].x, points[0].z);
  for (let i = 1; i < points.length; i++) {
    shape.lineTo(points[i].x, points[i].z);
  }

  holes.forEach(({ from, to }) => {
    const hole = new THREE.Path();
    hole.moveTo(from.x, from.z);
    hole.lineTo(to.x, from.z);
    hole.lineTo(to.x, to.z);
    hole.lineTo(from.x, to.z);
    hole.lineTo(from.x, from.z);
    shape.holes.push(hole);
  });

  const depth = 5;
  const extrudeSettings = {
    steps: 1,
    depth,
    bevelEnabled: false,
  };

  const wallGeometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  const floorGeometry = new THREE.ShapeGeometry(shape);
  const ceilingGeometry = new THREE.ShapeGeometry(shape);

  return (
    <>
      <mesh geometry={floorGeometry} rotation={[-Math.PI / 2, 0, 0]}>
        <meshStandardMaterial color="#999" transparent opacity={0.9} />
      </mesh>
      <mesh geometry={wallGeometry} rotation={[-Math.PI / 2, 0, 0]}>
        <meshStandardMaterial color="orange" transparent opacity={0.9} />
      </mesh>
      <mesh geometry={ceilingGeometry} rotation={[-Math.PI / 2, 0, 0]} position={[0, depth + 0.01, 0]}>
        <meshStandardMaterial color="#999" transparent opacity={0.9} />
      </mesh>
    </>
  );
}

export default function DrawingScene() {
  const [points, setPoints] = useState<THREE.Vector3[]>([]);
  const [holeLines, setHoleLines] = useState<THREE.Vector3[][]>([]);
  const [holes, setHoles] = useState<{ from: THREE.Vector3; to: THREE.Vector3 }[]>([]);
  const [tempHoleLine, setTempHoleLine] = useState<THREE.Vector3[]>([]);
  const [closed, setClosed] = useState(false);
  const [extruded, setExtruded] = useState(false);

  const handleClick3D = (point: THREE.Vector3) => {
    if (!closed) {
      if (points.length > 2 && point.distanceTo(points[0]) < 0.2) {
        setPoints([...points, points[0]]);
        setClosed(true);
      } else {
        setPoints([...points, point]);
      }
    } else if (!extruded) {
      if (tempHoleLine.length === 0) {
        setTempHoleLine([point]);
      } else {
        const p1 = tempHoleLine[0];
        const p2 = point;
        const from = new THREE.Vector3(Math.min(p1.x, p2.x), 0, Math.min(p1.z, p2.z));
        const to = new THREE.Vector3(Math.max(p1.x, p2.x), 2, Math.max(p1.z, p2.z));
        setHoleLines([...holeLines, [p1, p2]]);
        setHoles([...holes, { from, to }]);
        setTempHoleLine([]);
      }
    }
  };

  return (
    <div className="h-screen w-full relative">
      <Canvas
        camera={{ position: [10, 10, 10], fov: 50 }}
        style={{ background: "#e0e0e0" }}
      >
        <ambientLight intensity={0.8} />
        <directionalLight position={[10, 15, 10]} intensity={0.6} />
        <OrbitControls />
        <gridHelper args={[50, 50, "#888", "#ccc"]} />
        <DrawingSurface onClick3D={handleClick3D} />
        {!extruded && points.length > 1 && <LineBuilder points={points} />}
        {!extruded && holeLines.map((line, i) => <LineBuilder key={i} points={line} color="red" />)}
        {extruded && closed && <ExtrudedShape points={points} holes={holes} />}
      </Canvas>

      <div className="absolute top-4 left-4 space-y-2">
        {closed && !extruded && (
          <button
            className="px-4 py-2 bg-purple-600 text-white rounded"
            onClick={() => setExtruded(true)}
          >
            Extruir estructura
          </button>
        )}
      </div>
    </div>
  );
}
