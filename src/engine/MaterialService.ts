import * as THREE from 'three';
import { COLORS, MATERIAL_PROPERTIES } from '../config/materials';

export class MaterialService {
  private static materials = new Map<string, THREE.Material>();
  
  /**
   * ✅ NUEVO: Cache para evitar recrear materiales
   */
  private static materialCache = new Map<string, THREE.Material>();

  /**
   * Obtiene o crea material para paredes (MEJORADO)
   */
  static getWallMaterial(options?: {
    isHovered?: boolean;
    isDragActive?: boolean;
    opacity?: number;
  }): THREE.MeshStandardMaterial {
    
    const key = `wall-${options?.isHovered}-${options?.isDragActive}-${options?.opacity}`;
    
    if (!this.materialCache.has(key)) {
      const material = new THREE.MeshStandardMaterial({
        color: options?.isHovered ? COLORS.HOVER : COLORS.WALLS,
        side: THREE.DoubleSide,
        roughness: MATERIAL_PROPERTIES.WALLS.roughness,
        metalness: MATERIAL_PROPERTIES.WALLS.metalness,
        transparent: options?.isDragActive || (options?.opacity !== undefined),
        opacity: options?.opacity ?? 1.0
      });
      
      this.materialCache.set(key, material);
    }
    
    return this.materialCache.get(key) as THREE.MeshStandardMaterial;
  }

  /**
   * Obtiene material para piso
   */
  static getFloorMaterial(): THREE.MeshStandardMaterial {
    if (!this.materials.has('floor')) {
      const material = new THREE.MeshStandardMaterial({
        color: COLORS.FLOOR,
        roughness: MATERIAL_PROPERTIES.FLOOR.roughness,
        metalness: MATERIAL_PROPERTIES.FLOOR.metalness
      });
      
      this.materials.set('floor', material);
    }
    
    return this.materials.get('floor') as THREE.MeshStandardMaterial;
  }

  /**
   * Obtiene material para techo
   */
  static getCeilingMaterial(): THREE.MeshStandardMaterial {
    if (!this.materials.has('ceiling')) {
      const material = new THREE.MeshStandardMaterial({
        color: COLORS.CEILING,
        roughness: MATERIAL_PROPERTIES.CEILING.roughness,
        metalness: MATERIAL_PROPERTIES.CEILING.metalness
      });
      
      this.materials.set('ceiling', material);
    }
    
    return this.materials.get('ceiling') as THREE.MeshStandardMaterial;
  }

  /**
   * Limpia todos los materiales (para gestión de memoria)
   */
  static dispose(): void {
    this.materials.forEach(material => {
      material.dispose();
    });
    this.materials.clear();
  }
}