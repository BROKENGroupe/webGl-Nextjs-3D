import * as THREE from "three";
import { Opening } from "../types/openings";

interface OpeningFrameProps {
  opening: Opening;
  wallLength: number;
}

export function OpeningFrame({ opening, wallLength }: OpeningFrameProps) {
  const startX = opening.position * wallLength - opening.width / 2;
  const centerX = opening.position * wallLength;
  const centerY = opening.bottomOffset + opening.height / 2;
  
  const getFrameConfig = () => {
    switch (opening.type) {
      case 'door':
        return {
          frameColor: "#8B4513",
          frameThickness: 0.05,
          showHandle: true,
          handleColor: "#FFD700",
          showGlass: false
        };
      case 'double-door':
        return {
          frameColor: "#A0522D", 
          frameThickness: 0.05,
          showHandle: true,
          handleColor: "#FFD700",
          showGlass: false
        };
      case 'window':
        return {
          frameColor: "#FFFFFF",
          frameThickness: 0.03,
          showHandle: false,
          handleColor: "#C0C0C0",
          showGlass: true
        };
      case 'sliding-door':
        return {
          frameColor: "#CD853F",
          frameThickness: 0.04,
          showHandle: true,
          handleColor: "#C0C0C0",
          showGlass: true
        };
      default:
        return {
          frameColor: "#808080",
          frameThickness: 0.05,
          showHandle: false,
          handleColor: "#C0C0C0",
          showGlass: false
        };
    }
  };

  const config = getFrameConfig();

  const createFrameGeometry = () => {
    const frameWidth = opening.width;
    const frameHeight = opening.height;
    const thickness = config.frameThickness;
    
    const outerShape = new THREE.Shape();
    outerShape.moveTo(-frameWidth/2, -frameHeight/2);
    outerShape.lineTo(frameWidth/2, -frameHeight/2);
    outerShape.lineTo(frameWidth/2, frameHeight/2);
    outerShape.lineTo(-frameWidth/2, frameHeight/2);
    outerShape.closePath();
    
    const innerShape = new THREE.Shape();
    const innerWidth = frameWidth - thickness * 2;
    const innerHeight = frameHeight - thickness * 2;
    innerShape.moveTo(-innerWidth/2, -innerHeight/2);
    innerShape.lineTo(innerWidth/2, -innerHeight/2);
    innerShape.lineTo(innerWidth/2, innerHeight/2);
    innerShape.lineTo(-innerWidth/2, innerHeight/2);
    innerShape.closePath();
    
    outerShape.holes.push(innerShape);
    
    return new THREE.ExtrudeGeometry(outerShape, {
      steps: 1,
      depth: thickness,
      bevelEnabled: false
    });
  };

  const createGlassGeometry = () => {
    const glassWidth = opening.width - config.frameThickness * 2;
    const glassHeight = opening.height - config.frameThickness * 2;
    return new THREE.PlaneGeometry(glassWidth, glassHeight);
  };

  const createHandleGeometry = () => {
    return new THREE.CylinderGeometry(0.02, 0.02, 0.1, 8);
  };

  return (
    <group position={[centerX - wallLength/2, centerY, 0.1]}>
      {/* Marco */}
      <mesh geometry={createFrameGeometry()}>
        <meshStandardMaterial 
          color={config.frameColor}
          roughness={0.6}
          metalness={0.1}
        />
      </mesh>

      {/* Vidrio */}
      {config.showGlass && (
        <mesh 
          geometry={createGlassGeometry()}
          position={[0, 0, config.frameThickness/2]}
        >
          <meshStandardMaterial 
            color="#87CEEB"
            transparent
            opacity={0.3}
            roughness={0.1}
            metalness={0.1}
          />
        </mesh>
      )}

      {/* Manija */}
      {config.showHandle && (
        <mesh 
          geometry={createHandleGeometry()}
          position={[
            opening.type === 'double-door' ? opening.width/4 : opening.width/2 - 0.15,
            -opening.height/4,
            config.frameThickness + 0.05
          ]}
          rotation={[0, 0, Math.PI/2]}
        >
          <meshStandardMaterial 
            color={config.handleColor}
            roughness={0.2}
            metalness={0.8}
          />
        </mesh>
      )}
    </group>
  );
}