import { useMemo } from 'react';
import * as THREE from 'three';

/**
 * Hook que construye y memoiza la geometría de la "placa" (PlaneGeometry)
 * usada como superficie para el heatmap exterior.
 *
 * Comportamiento:
 * - Calcula los límites AABB de las coordenadas de la fachada en XZ.
 * - Calcula un centro y unas dimensiones base (width, height).
 * - Escala las dimensiones por un factor (por defecto 3.0) y añade un pequeño
 *   margen (6 unidades) para garantizar que el gradiente pueda extenderse.
 * - Crea una THREE.PlaneGeometry subdividida (128x128) para tener una buena
 *   resolución del shader y la rota a horizontal (X-Z) y la traslada al centro.
 *
 * Razones de diseño:
 * - La geometría se memoiza con useMemo para evitar recreaciones innecesarias.
 * - La alta subdivisión (128,128) permite un mapeado suave del fragment shader.
 * - La traducción en Y a 0.01 evita z-fighting con la base de la escena.
 *
 * Notas:
 * - `wallCoordinates` espera un array de vértices en orden (CW/CCW) con forma:
 *   [{ x: number, z: number }, ...]. Sólo se usan X y Z.
 * - Si `wallCoordinates` está vacío se devuelve null.
 * - Ajusta `scale` o el offset `+6` si quieres una placa más/menos holgada.
 *
 * @param wallCoordinates Array de vértices de la fachada en coordenadas XZ.
 * @returns THREE.PlaneGeometry | null - geometría memoizada o null si no hay datos.
 */
export function useSurfaceGeometry(wallCoordinates: { x: number; z: number }[]) {
  return useMemo(() => {
    if (!wallCoordinates?.length) return null;

    const minX = Math.min(...wallCoordinates.map((c) => c.x));
    const maxX = Math.max(...wallCoordinates.map((c) => c.x));
    const minZ = Math.min(...wallCoordinates.map((c) => c.z));
    const maxZ = Math.max(...wallCoordinates.map((c) => c.z));

    const centerX = (minX + maxX) / 2;
    const centerZ = (minZ + maxZ) / 2;

    const baseWidth = Math.max(0.001, maxX - minX);
    const baseHeight = Math.max(0.001, maxZ - minZ);

    const scale = 2.0;
    const width = baseWidth * scale + 6;
    const height = baseHeight * scale + 6;

    const geometry = new THREE.PlaneGeometry(width, height, 128, 128);
    geometry.rotateX(-Math.PI / 2);
    geometry.translate(centerX, 0.01, centerZ);

    return geometry;
  }, [wallCoordinates]);
}