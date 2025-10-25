import * as THREE from 'three';
import type { IGeometryAdapter } from "./contracts/IGeometryAdapter";

/** 
 * Motor de Cálculos Geométricos para Líneas 3D
 */
export class LineGeometryEngine {
  /**
   * @param adapter Adaptador de geometría compatible (Three.js, Babylon, etc.)
   */
  constructor(private adapter: IGeometryAdapter) {}

  /**
   * Calcula la transformación completa para un segmento de línea.
   * @param start Punto inicial.
   * @param end Punto final.
   * @returns Objeto con distancia, dirección, punto medio y cuaternión de orientación.
   */
  calculateLineTransform(start: any, end: any) {
    const distance = this.adapter.distance(start, end);

    const epsilon = 0.0001;
    if (distance < epsilon) {
      return {
        distance: 0,
        direction: this.adapter.createVector3(1, 0, 0),
        midPoint: start,
        quaternion: new THREE.Quaternion(),
      };
    }

    const direction = this.adapter.subVectors(end, start).normalize();
    const midPoint = this.adapter.addVectors(start, end).multiplyScalar(0.5);

    // Cuaternión para orientación (solo con THREE.js, si usas otro motor, adapta aquí)
    const axis = this.adapter.createVector3(1, 0, 0);
    const quaternion = new THREE.Quaternion().setFromUnitVectors(axis, direction);

    return {
      distance,
      direction,
      midPoint,
      quaternion
    };
  }

  /**
   * Calcula dimensiones de línea basadas en estado de interacción.
   * @param isHovered Si la línea está en estado hover.
   * @param options Opciones de ancho base, ancho hover y profundidad.
   * @returns Objeto con width, depth y outlineWidth.
   */
  calculateLineDimensions(
    isHovered: boolean,
    options: {
      baseWidth?: number;
      hoverWidth?: number;
      depth?: number;
    } = {}
  ) {
    const {
      baseWidth = 0.1,
      hoverWidth = 0.06,
      depth = 0.005
    } = options;

    return {
      width: isHovered ? hoverWidth : baseWidth,
      depth,
      outlineWidth: isHovered ? 0.083 : 0.065
    };
  }

  /**
   * Calcula la escala de vértice basada en estado de interacción.
   * @param isHovered Si el vértice está en estado hover.
   * @param isDragged Si el vértice está siendo arrastrado.
   * @returns Escala numérica para el vértice.
   */
  calculateVertexScale(isHovered: boolean, isDragged: boolean): number {
    if (isDragged) return 1.3;
    if (isHovered) return 1.2;
    return 1.0;
  }

  /**
   * Aplica snap-to-grid a una posición 3D.
   * @param position Vector de posición.
   * @param increment Tamaño del snap.
   * @param enabled Si el snap está habilitado.
   * @returns Vector ajustado al snap.
   */
  snapToGrid(
    position: any,
    increment: number = 0.1,
    enabled: boolean = true
  ): any {
    if (!enabled) return this.adapter.cloneVector(position);

    return this.adapter.createVector3(
      Math.round(position.x / increment) * increment,
      0,
      Math.round(position.z / increment) * increment
    );
  }

  /**
   * Crea un plano invisible para raycasting.
   * @param size Tamaño del plano.
   * @returns Mesh plano para raycasting.
   */
  createRaycastPlane(size: number = 100): THREE.Mesh {
    const geometry = new THREE.PlaneGeometry(size, size);
    const material = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0
    });
    const plane = new THREE.Mesh(geometry, material);

    plane.rotation.x = -Math.PI / 2;
    plane.position.y = 0;

    return plane;
  }

  /**
   * Calcula intersección de rayo con plano para posicionamiento.
   * @param raycaster Raycaster de THREE.js.
   * @param plane Plano de raycasting.
   * @returns Vector de intersección o null.
   */
  intersectPlane(
    raycaster: THREE.Raycaster,
    plane: THREE.Mesh
  ): THREE.Vector3 | null {
    const intersects = raycaster.intersectObject(plane);
    return intersects.length > 0 ? intersects[0].point : null;
  }

  /**
   * Crea una línea interna (pared divisoria) entre dos puntos.
   * @param start Punto inicial.
   * @param end Punto final.
   * @returns Objeto representando la pared interna.
   */
  createInternalWall(start: any, end: any) {
    return {
      id: crypto.randomUUID(),
      start,
      end,
      type: "internal",
      material: "divider",
      color: "#e53935",
      thickness: 0.03,
      height: 2.5,
    };
  }

  /**
   * Calcula el punto medio entre dos puntos.
   * @param a Primer punto.
   * @param b Segundo punto.
   * @returns Vector punto medio.
   */
  getMidpoint(a: any, b: any) {
    return this.adapter.multiplyScalar(
      this.adapter.addVectors(a, b),
      0.5
    );
  }

  /**
   * Calcula la distancia entre dos puntos.
   * @param a Primer punto.
   * @param b Segundo punto.
   * @returns Distancia numérica.
   */
  getLength(a: any, b: any) {
    return this.adapter.distance(a, b);
  }
}