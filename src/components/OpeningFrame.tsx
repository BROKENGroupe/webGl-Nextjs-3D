import * as THREE from "three";
import { Opening } from "../types/openings";

interface OpeningFrameProps {
  opening: Opening;
  wallLength: number;
  wallHeight: number;
}

export function OpeningFrame({ opening, wallLength, wallHeight }: OpeningFrameProps) {
  
  // ✅ CALCULAR POSICIÓN LOCAL EN LA PARED
  const localX = (opening.position * wallLength) - wallLength/2;
  const localY = (opening.bottomOffset + opening.height/2) - wallHeight/2;
  const localZ = 0; // En la superficie de la pared

  // ✅ DETERMINAR ESTILO DEL MARCO
  const getFrameStyle = (type: string) => {
    switch (type) {
      case 'door':
      case 'double-door':
      case 'sliding-door':
        return { color: '#8B4513', thickness: 0.08 }; // Marrón para puertas
      case 'window':
        return { color: '#FFFFFF', thickness: 0.05 }; // Blanco para ventanas
      default:
        return { color: '#666666', thickness: 0.06 };
    }
  };

  const frameStyle = getFrameStyle(opening.type);

  return (
    <group position={[localX, localY, localZ]}>
      {/* ✅ MARCO SUPERIOR */}
      <mesh position={[0, opening.height/2 + frameStyle.thickness/2, 0]}>
        <boxGeometry args={[
          opening.width + frameStyle.thickness * 2, 
          frameStyle.thickness, 
          0.15
        ]} />
        <meshStandardMaterial color={frameStyle.color} />
      </mesh>

      {/* ✅ MARCO INFERIOR - Solo para ventanas o si no es puerta */}
      {opening.type === 'window' && (
        <mesh position={[0, -opening.height/2 - frameStyle.thickness/2, 0]}>
          <boxGeometry args={[
            opening.width + frameStyle.thickness * 2, 
            frameStyle.thickness, 
            0.15
          ]} />
          <meshStandardMaterial color={frameStyle.color} />
        </mesh>
      )}

      {/* ✅ MARCO IZQUIERDO */}
      <mesh position={[-opening.width/2 - frameStyle.thickness/2, 0, 0]}>
        <boxGeometry args={[
          frameStyle.thickness, 
          opening.height + (opening.type === 'window' ? frameStyle.thickness * 2 : frameStyle.thickness), 
          0.15
        ]} />
        <meshStandardMaterial color={frameStyle.color} />
      </mesh>

      {/* ✅ MARCO DERECHO */}
      <mesh position={[opening.width/2 + frameStyle.thickness/2, 0, 0]}>
        <boxGeometry args={[
          frameStyle.thickness, 
          opening.height + (opening.type === 'window' ? frameStyle.thickness * 2 : frameStyle.thickness), 
          0.15
        ]} />
        <meshStandardMaterial color={frameStyle.color} />
      </mesh>

      {/* ✅ CONTENIDO DE LA ABERTURA */}
      {opening.type === 'door' && (
        // Puerta simple
        <mesh position={[opening.width/4, 0, 0.05]}>
          <boxGeometry args={[opening.width/2 - 0.02, opening.height * 0.9, 0.03]} />
          <meshStandardMaterial color="#CD853F" />
        </mesh>
      )}

      {opening.type === 'double-door' && (
        <>
          {/* Puerta izquierda */}
          <mesh position={[-opening.width/4, 0, 0.05]}>
            <boxGeometry args={[opening.width/2 - 0.05, opening.height * 0.9, 0.03]} />
            <meshStandardMaterial color="#CD853F" />
          </mesh>
          {/* Puerta derecha */}
          <mesh position={[opening.width/4, 0, 0.05]}>
            <boxGeometry args={[opening.width/2 - 0.05, opening.height * 0.9, 0.03]} />
            <meshStandardMaterial color="#CD853F" />
          </mesh>
        </>
      )}

      {opening.type === 'sliding-door' && (
        <>
          {/* Panel deslizante 1 */}
          <mesh position={[-opening.width/4, 0, 0.05]}>
            <boxGeometry args={[opening.width/2 - 0.02, opening.height * 0.9, 0.02]} />
            <meshStandardMaterial color="#A0A0A0" transparent opacity={0.7} />
          </mesh>
          {/* Panel deslizante 2 */}
          <mesh position={[opening.width/4, 0, 0.05]}>
            <boxGeometry args={[opening.width/2 - 0.02, opening.height * 0.9, 0.02]} />
            <meshStandardMaterial color="#A0A0A0" transparent opacity={0.7} />
          </mesh>
        </>
      )}

      {opening.type === 'window' && (
        // Cristal de ventana
        <mesh position={[0, 0, 0.02]}>
          <boxGeometry args={[opening.width, opening.height, 0.01]} />
          <meshStandardMaterial 
            color="#87CEEB" 
            transparent 
            opacity={0.3}
          />
        </mesh>
      )}
    </group>
  );
}