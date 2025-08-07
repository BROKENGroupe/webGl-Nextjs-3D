import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { AcousticAnalysisEngine } from '../engine/AcousticAnalysisEngine';
import { useWallsStore } from '../store/wallsStore';
import { useOpeningsStore } from '../store/openingsStore';

interface AcousticHeatmapShaderProps {
  wallCoordinates: { x: number; z: number }[];
  isVisible: boolean;
  externalSoundLevel?: number;
  showSurface?: boolean;
}

// ✅ SHADER VERTEX PARA SUPERFICIE CONTINUA
const heatmapVertexShader = `
  varying vec2 vUv;
  varying vec3 vWorldPosition;
  
  void main() {
    vUv = uv;
    vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// ✅ SHADER FRAGMENT PARA INTERPOLACIÓN SUAVE
const heatmapFragmentShader = `
  uniform float time;
  uniform int pointCount;
  uniform vec3 pointPositions[32];
  uniform float pointIntensities[32];
  uniform vec3 buildingCenter;
  uniform float buildingSize;
  
  varying vec2 vUv;
  varying vec3 vWorldPosition;
  
  // Función de interpolación IDW (Inverse Distance Weighting)
  float interpolateIntensity(vec3 position) {
    float totalWeight = 0.0;
    float weightedSum = 0.0;
    float minDistance = 999999.0;
    
    for (int i = 0; i < 32; i++) {
      if (i >= pointCount) break;
      
      vec3 pointPos = pointPositions[i];
      float distance = length(position.xz - pointPos.xz) + 0.1;
      
      if (distance < 0.3) {
        return pointIntensities[i];
      }
      
      // Peso inversamente proporcional a la distancia al cuadrado
      float weight = 1.0 / (distance * distance + 0.01);
      totalWeight += weight;
      weightedSum += pointIntensities[i] * weight;
      minDistance = min(minDistance, distance);
    }
    
    if (totalWeight > 0.0) {
      float interpolated = weightedSum / totalWeight;
      
      // Suavizar basado en distancia al centro del edificio
      float distToCenter = length(position.xz - buildingCenter.xz);
      float falloff = smoothstep(buildingSize * 0.8, buildingSize * 1.2, distToCenter);
      
      return mix(interpolated, 0.0, falloff);
    }
    
    return 0.0;
  }
  
  // Función de color del mapa de calor
  vec3 heatmapColor(float intensity) {
    // Colores suaves como en la imagen de referencia
    vec3 coldColor = vec3(0.0, 0.8, 0.4);     // Verde azulado
    vec3 coolColor = vec3(0.0, 1.0, 0.8);     // Cian
    vec3 neutralColor = vec3(0.4, 1.0, 0.4);  // Verde claro
    vec3 warmColor = vec3(1.0, 1.0, 0.0);     // Amarillo
    vec3 hotColor = vec3(1.0, 0.5, 0.0);      // Naranja
    vec3 criticalColor = vec3(1.0, 0.0, 0.0); // Rojo
    
    if (intensity < 0.16) {
      return mix(coldColor, coolColor, intensity * 6.0);
    } else if (intensity < 0.33) {
      return mix(coolColor, neutralColor, (intensity - 0.16) * 6.0);
    } else if (intensity < 0.5) {
      return mix(neutralColor, warmColor, (intensity - 0.33) * 6.0);
    } else if (intensity < 0.75) {
      return mix(warmColor, hotColor, (intensity - 0.5) * 4.0);
    } else {
      return mix(hotColor, criticalColor, (intensity - 0.75) * 4.0);
    }
  }
  
  void main() {
    vec3 worldPos = vWorldPosition;
    float intensity = interpolateIntensity(worldPos);
    
    // Obtener color base
    vec3 color = heatmapColor(intensity);
    
    // Efecto de ondas sutiles
    float wave = sin(time * 0.5 + intensity * 2.0) * 0.05 + 0.95;
    color *= wave;
    
    // Alpha basado en intensidad y proximidad al edificio
    float alpha = smoothstep(0.0, 0.3, intensity) * 0.8;
    
    gl_FragColor = vec4(color, alpha);
  }
`;

export const AcousticHeatmapShader: React.FC<AcousticHeatmapShaderProps> = ({ 
  wallCoordinates, 
  isVisible, 
  externalSoundLevel = 70
}) => {
  const { walls } = useWallsStore();
  const { openings } = useOpeningsStore();
  
  const surfaceMeshRef = useRef<THREE.Mesh>(null);
  const shaderMaterialRef = useRef<THREE.ShaderMaterial>(null);

  // ✅ CALCULAR DATOS DEL MAPA DE CALOR
  const heatmapData = useMemo(() => {
    if (!isVisible || !walls.length || !wallCoordinates.length) {
      return null;
    }

    console.log('🔥 Generando mapa de calor continuo...');
    
    try {
      const data = AcousticAnalysisEngine.generateDetailedAcousticHeatmap(
        walls,
        openings,
        wallCoordinates,
        externalSoundLevel
      );
      
      console.log(`✅ Mapa de calor continuo: ${data.points.length} puntos`);
      return data;
    } catch (error) {
      console.error('❌ Error:', error);
      return null;
    }
  }, [walls, openings, wallCoordinates, isVisible, externalSoundLevel]);

  // ✅ GEOMETRÍA DE LA SUPERFICIE EXTENDIDA
  const surfaceGeometry = useMemo(() => {
    if (!wallCoordinates.length) return null;

    const minX = Math.min(...wallCoordinates.map(c => c.x)) - 3;
    const maxX = Math.max(...wallCoordinates.map(c => c.x)) + 3;
    const minZ = Math.min(...wallCoordinates.map(c => c.z)) - 3;
    const maxZ = Math.max(...wallCoordinates.map(c => c.z)) + 3;

    const geometry = new THREE.PlaneGeometry(
      maxX - minX, 
      maxZ - minZ, 
      128, 128 // Alta resolución para gradientes suaves
    );
    
    geometry.rotateX(-Math.PI / 2);
    geometry.translate((minX + maxX) / 2, 0.01, (minZ + maxZ) / 2);

    return geometry;
  }, [wallCoordinates]);

  // ✅ MATERIAL SHADER PARA SUPERFICIE CONTINUA
  const surfaceShaderMaterial = useMemo(() => {
    if (!heatmapData?.points.length || !wallCoordinates.length) return null;

    // Preparar datos para el shader
    const maxPoints = 32;
    const pointPositions = new Array(maxPoints * 3).fill(0);
    const pointIntensities = new Array(maxPoints).fill(0);

    heatmapData.points.forEach((point, index) => {
      if (index < maxPoints) {
        pointPositions[index * 3] = point.coordinates.x;
        pointPositions[index * 3 + 1] = 0;
        pointPositions[index * 3 + 2] = point.coordinates.z;
        pointIntensities[index] = point.intensity;
      }
    });

    // Centro del edificio
    const centerX = wallCoordinates.reduce((sum, c) => sum + c.x, 0) / wallCoordinates.length;
    const centerZ = wallCoordinates.reduce((sum, c) => sum + c.z, 0) / wallCoordinates.length;
    
    // Tamaño del edificio
    const minX = Math.min(...wallCoordinates.map(c => c.x));
    const maxX = Math.max(...wallCoordinates.map(c => c.x));
    const minZ = Math.min(...wallCoordinates.map(c => c.z));
    const maxZ = Math.max(...wallCoordinates.map(c => c.z));
    const buildingSize = Math.max(maxX - minX, maxZ - minZ) * 0.5;

    const material = new THREE.ShaderMaterial({
      vertexShader: heatmapVertexShader,
      fragmentShader: heatmapFragmentShader,
      uniforms: {
        time: { value: 0.0 },
        pointCount: { value: Math.min(heatmapData.points.length, maxPoints) },
        pointPositions: { value: pointPositions },
        pointIntensities: { value: pointIntensities },
        buildingCenter: { value: new THREE.Vector3(centerX, 0, centerZ) },
        buildingSize: { value: buildingSize }
      },
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false
    });

    shaderMaterialRef.current = material;
    return material;
  }, [heatmapData, wallCoordinates]);

  // ✅ ANIMAR EL SHADER
  useFrame((state) => {
    if (shaderMaterialRef.current) {
      shaderMaterialRef.current.uniforms.time.value = state.clock.getElapsedTime();
    }
  });

  if (!isVisible || !heatmapData || !surfaceGeometry || !surfaceShaderMaterial) {
    return null;
  }

  return (
    <group>
      {/* ✅ SUPERFICIE CONTINUA CON GRADIENTES */}
      <mesh
        ref={surfaceMeshRef}
        geometry={surfaceGeometry}
        material={surfaceShaderMaterial}
      />

      {/* ✅ MARCADORES DISCRETOS PARA FUENTES DE CALOR */}
      {heatmapData.points
        .filter(point => point.type === 'opening' || point.intensity > 0.7)
        .map(point => (
          <group key={`marker-${point.id}`}>
            {/* Esfera pequeña para indicar la fuente */}
            <mesh position={[point.coordinates.x, 0.08, point.coordinates.z]}>
              <sphereGeometry args={[0.05, 8, 6]} />
              <meshBasicMaterial 
                color={point.intensity > 0.7 ? 0xff0000 : 0xffaa00}
                transparent
                opacity={0.9}
              />
            </mesh>
            
            {/* Anillo sutil en el piso */}
            <mesh 
              position={[point.coordinates.x, 0.005, point.coordinates.z]}
              rotation={[-Math.PI / 2, 0, 0]}
            >
              <ringGeometry args={[0.1, 0.15, 16]} />
              <meshBasicMaterial 
                color={point.intensity > 0.7 ? 0xff4444 : 0xffaa44}
                transparent
                opacity={0.6}
                side={THREE.DoubleSide}
              />
            </mesh>
          </group>
        ))}

      {/* ✅ ESCALA DE COLORES (LEYENDA) */}
      <group position={[
        Math.min(...wallCoordinates.map(c => c.x)) - 1.5, 
        0.1, 
        Math.min(...wallCoordinates.map(c => c.z)) - 0.5
      ]}>
        {/* Gradiente vertical para leyenda */}
        {[0, 0.2, 0.4, 0.6, 0.8, 1.0].map((intensity, index) => {
          const colors = [0x008040, 0x00ff80, 0x40ff40, 0xffff00, 0xff8000, 0xff0000];
          return (
            <mesh 
              key={index}
              position={[0, index * 0.2, 0]}
            >
              <boxGeometry args={[0.1, 0.15, 0.1]} />
              <meshBasicMaterial color={colors[index]} />
            </mesh>
          );
        })}
      </group>
    </group>
  );
};