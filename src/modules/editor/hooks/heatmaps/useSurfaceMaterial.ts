import { useMemo } from 'react';
import * as THREE from 'three';
import { heatmapVertexShader2 } from '@/modules/editor/shaders/heatmapSurfaceVertex2';
import { heatmapFragmentShader2 } from '@/modules/editor/shaders/heatmapFragment2';

/**
 * Punto para la generación fina de la máscara/heatmap.
 *
 * coordinates.x/z: posición en el plano XZ (m).
 * intensity: valor normalizado 0..1 usado por el shader para picos locales.
 * type: 'facade' | 'opening' (opcional) — indica origen semántico del punto.
 */
type Point = { coordinates: { x: number; z: number }; intensity: number; type?: string };

/**
 * Genera una malla de puntos a lo largo de los segmentos de las fachadas y
 * distribuye puntos sobre las aberturas (doors/windows) para simular
 * influencias puntuales en el heatmap.
 *
 * - Usa λ/6 (frecuencia -> longitud de onda) para determinar el paso espacial.
 * - Evita incluir vértices de esquina (empieza en j=1) para suavizar artefactos.
 * - Devuelve como máximo `maxPoints` puntos para mantener límites de uniforms.
 *
 * Nota sobre rendimiento: el algoritmo es O(N_segments + N_openings) y produce
 * arrays pequeños (limitados por `maxPoints`). Idealmente se llama dentro de
 * un hook memoizado para evitar recomputaciones.
 *
 * @param params.wallCoordinates Array con vértices 2D de la fachada [{x,z}, ...].
 * @param params.openings Array opcional de aberturas; cada objeto puede tener
 *                        `position: {x,z}` y `width`.
 * @param params.freq Frecuencia (Hz) usada para cálculo de lambda. Default 1000.
 * @param params.maxPoints Máximo número de puntos a devolver. Default 32.
 * @returns Array de puntos generados [{ coordinates: {x,z}, intensity, type }, ...]
 */
function generateFinePoints({
  wallCoordinates,
  openings,
  freq = 1000,
  maxPoints = 32,
}: {
  wallCoordinates: { x: number; z: number }[];
  openings: any[];
  freq?: number;
  maxPoints?: number;
}) {
  const c = 343;
  const lambda = c / Math.max(1, freq);
  const dx = Math.max(0.02, lambda / 6);
  const points: Point[] = [];

  for (let i = 0; i < wallCoordinates.length; i++) {
    const a = wallCoordinates[i];
    const b = wallCoordinates[(i + 1) % wallCoordinates.length];
    const segLen = Math.hypot(b.x - a.x, b.z - a.z);
    const n = Math.max(1, Math.ceil(segLen / dx));
    for (let j = 1; j < n; j++) {
      const t = j / n;
      const x = a.x + (b.x - a.x) * t;
      const z = a.z + (b.z - a.z) * t;
      points.push({ coordinates: { x, z }, intensity: 1.0, type: 'facade' });
      if (points.length >= maxPoints) return points;
    }
  }

  for (const opening of openings || []) {
    const width = opening.width || 1.0;
    const n = Math.max(1, Math.ceil(width / dx));
    for (let k = 0; k < n; k++) {
      const offset = (k / n - 0.5) * width;
      const px = opening.position?.x ?? 0;
      const pz = opening.position?.z ?? 0;
      points.push({ coordinates: { x: px + offset, z: pz }, intensity: 1.0, type: 'opening' });
      if (points.length >= maxPoints) return points;
    }
  }

  return points;
}

/**
 * Hook que construye y memoiza un THREE.ShaderMaterial para representar la
 * superficie de heatmap exterior. El material:
 * - usa `heatmapVertexShader2` y `heatmapFragmentShader2`.
 * - expone uniforms tipados y empaquetados para eficiencia (Float32Array).
 * - incluye la máscara de la fachada (`facadePoints`) como Float32Array plano [x,z,...].
 *
 * Uniforms principales pasados al shader (formato esperado por shader):
 * - time: float (animación)
 * - pointCount: int (número de puntos activos)
 * - pointPositions: Float32Array (length = maxPoints * 3) plano [x,y,z,...]
 * - pointIntensities: Float32Array (length = maxPoints)
 * - facadePoints: Float32Array (length = maxFacadePoints * 2) plano [x,z,...]
 * - facadePointCount: int (número de vértices válidos en facadePoints)
 * - spread: float (controla la extensión del halo/perímetro)
 * - buildingCenter: vec3 (centro geométrico del edificio)
 * - buildingSize: float (escala característica del edificio)
 * - plateColor: vec3 (color de fondo/placa)
 * - plateAlpha: float (opacidad base de la placa)
 *
 * Recomendaciones:
 * - `heatmapData` debe contener `.points` o al menos false para no crear material.
 * - `facadePolygon` debe ser un array de tuplas [x,z] en orden CW/CCW sin duplicados.
 * - Si cambias la frecuencia o resolución, ajusta `maxPoints` o `dx` en generateFinePoints.
 *
 * @param params.heatmapData Resultado de análisis acústico; se usa para decidir crear material.
 * @param params.wallCoordinates Vértices de la fachada en el espacio XZ.
 * @param params.openings Array de aberturas (opcional) para picos locales.
 * @param params.facadePolygon Array de puntos [x,z] (máx 16) que definen el perímetro.
 * @param params.groundColor Color de la placa/ground que se pasará al shader (THREE.Color).
 * @returns THREE.ShaderMaterial memoizado o null si no hay datos suficientes.
 */
export function useSurfaceMaterial({
  heatmapData,
  wallCoordinates,
  openings,
  facadePolygon,
  groundColor = new THREE.Color(0x03203a),
}: {
  heatmapData: { points: Point[] } | null;
  wallCoordinates: { x: number; z: number }[];
  openings: any[];
  facadePolygon: [number, number][];
  groundColor?: THREE.Color;
}) {
  return useMemo(() => {
    if (!heatmapData?.points?.length || !wallCoordinates?.length) return null;

    const maxPoints = 32;
    const fineHeatmapPoints = generateFinePoints({ wallCoordinates, openings, freq: 1000, maxPoints });

    if (!fineHeatmapPoints.length) return null;

    // Typed arrays para pasar como uniforms a WebGL (mejor rendimiento)
    const pointPositions = new Float32Array(maxPoints * 3);
    const pointIntensities = new Float32Array(maxPoints);
    fineHeatmapPoints.forEach((pt, i) => {
      if (i >= maxPoints) return;
      pointPositions[i * 3] = pt.coordinates.x;
      pointPositions[i * 3 + 1] = 0; // Y = 0 (superficie)
      pointPositions[i * 3 + 2] = pt.coordinates.z;
      pointIntensities[i] = Math.max(0, Math.min(1, pt.intensity));
    });

    const minX = Math.min(...wallCoordinates.map((c) => c.x));
    const maxX = Math.max(...wallCoordinates.map((c) => c.x));
    const minZ = Math.min(...wallCoordinates.map((c) => c.z));
    const maxZ = Math.max(...wallCoordinates.map((c) => c.z));
    const buildingSize = Math.max(maxX - minX, maxZ - minZ);

    // facade polygon -> Float32Array plano [x,z,...]
    const maxFacadePoints = 16;
    const fpCount = Math.min(facadePolygon?.length || 0, maxFacadePoints);
    const facadePointsArr = new Float32Array(maxFacadePoints * 2);
    for (let i = 0; i < fpCount; i++) {
      facadePointsArr[i * 2] = facadePolygon[i][0];
      facadePointsArr[i * 2 + 1] = facadePolygon[i][1];
    }

    // spread: controla hasta dónde llega el halo; basado en diagonal del área
    const areaWidth = maxX - minX;
    const areaHeight = maxZ - minZ;
    const areaDiagonal = Math.hypot(areaWidth, areaHeight);
    const spreadMultiplier = 0
    const spreadValue = Math.max(2.0, areaDiagonal * spreadMultiplier);

    const material = new THREE.ShaderMaterial({
      vertexShader: heatmapVertexShader2,
      fragmentShader: heatmapFragmentShader2,
      uniforms: {
        time: { value: 0.0 },
        pointCount: { value: fineHeatmapPoints.length },
        pointPositions: { value: pointPositions },
        pointIntensities: { value: pointIntensities },

        facadePoints: { value: facadePointsArr },
        facadePointCount: { value: fpCount },
        spread: { value: spreadValue },

        buildingCenter: { value: new THREE.Vector3((minX + maxX) / 2, 0, (minZ + maxZ) / 2) },
        buildingSize: { value: buildingSize },

        plateColor: { value: groundColor },
        plateAlpha: { value: 0.9 },
      },
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
    });

    return material;
  }, [heatmapData, wallCoordinates, openings, facadePolygon, groundColor]);
}