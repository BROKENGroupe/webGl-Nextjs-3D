import * as THREE from 'three';

/**
 * =====================================================================================
 * LINE GEOMETRY ENGINE - Motor de Cálculos Geométricos para Líneas 3D
 * =====================================================================================
 * 
 * @description
 * LineGeometryEngine centraliza todos los cálculos geométricos necesarios para
 * el renderizado y manipulación de líneas 3D. Proporciona métodos optimizados
 * para transformaciones, orientaciones y posicionamiento de elementos lineales.
 * 
 * @author insonor Team
 * @version 1.0.0
 * @since 2025
 */

export class LineGeometryEngine {
  
  /**
   * @method calculateLineTransform
   * @description Calcula la transformación completa para un segmento de línea
   * 
   * @param {THREE.Vector3} start - Punto de inicio de la línea
   * @param {THREE.Vector3} end - Punto final de la línea
   * @returns {Object} Datos de transformación para renderizado
   * 
   * @example
   * const transform = LineGeometryEngine.calculateLineTransform(
   *   new THREE.Vector3(0, 0, 0),
   *   new THREE.Vector3(1, 0, 1)
   * );
   * // Resultado: { distance: 1.414, direction: Vector3, midPoint: Vector3, quaternion: Quaternion }
   */
  static calculateLineTransform(start: THREE.Vector3, end: THREE.Vector3) {
    const distance = start.distanceTo(end);

    // FIX: Si la distancia es casi cero, no se puede normalizar el vector de dirección.
    // Devuelve una transformación por defecto para evitar errores de NaN.
    const epsilon = 0.0001;
    if (distance < epsilon) {
      return {
        distance: 0,
        direction: new THREE.Vector3(1, 0, 0), // Dirección por defecto, no importa cuál
        midPoint: start,
        quaternion: new THREE.Quaternion(), // Cuaternión identidad
      };
    }

    const direction = new THREE.Vector3().subVectors(end, start).normalize();
    const midPoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
    
    // Calcular cuaternión para orientación
    const axis = new THREE.Vector3(1, 0, 0); // Eje X (longitud del rectángulo)
    const quaternion = new THREE.Quaternion().setFromUnitVectors(axis, direction);
    
    return {
      distance,
      direction,
      midPoint,
      quaternion
    };
  }

  /**
   * @method calculateLineDimensions
   * @description Calcula dimensiones de línea basadas en estado de interacción
   * 
   * @param {boolean} isHovered - Si la línea está en estado hover
   * @param {Object} options - Opciones de configuración
   * @returns {Object} Dimensiones para geometría de línea
   */
  static calculateLineDimensions(
    isHovered: boolean, 
    options: { 
      baseWidth?: number; 
      hoverWidth?: number; 
      depth?: number 
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
   * @method calculateVertexScale
   * @description Calcula la escala de vértice basada en estado de interacción
   * 
   * @param {boolean} isHovered - Si el vértice está en hover
   * @param {boolean} isDragged - Si el vértice está siendo arrastrado
   * @returns {number} Factor de escala
   */
  static calculateVertexScale(isHovered: boolean, isDragged: boolean): number {
    if (isDragged) return 1.3;
    if (isHovered) return 1.2;
    return 1.0;
  }

  /**
   * @method snapToGrid
   * @description Aplica snap-to-grid a una posición 3D
   * 
   * @param {THREE.Vector3} position - Posición original
   * @param {number} increment - Incremento de grid
   * @param {boolean} enabled - Si el snap está habilitado
   * @returns {THREE.Vector3} Posición con snap aplicado
   */
  static snapToGrid(
    position: THREE.Vector3, 
    increment: number = 0.1, 
    enabled: boolean = true
  ): THREE.Vector3 {
    if (!enabled) return position.clone();
    
    return new THREE.Vector3(
      Math.round(position.x / increment) * increment,
      0, // Mantener en plano Y=0
      Math.round(position.z / increment) * increment
    );
  }

  /**
   * @method createRaycastPlane
   * @description Crea un plano invisible para raycasting
   * 
   * @param {number} size - Tamaño del plano
   * @returns {THREE.Mesh} Plano configurado para raycasting
   */
  static createRaycastPlane(size: number = 100): THREE.Mesh {
    const geometry = new THREE.PlaneGeometry(size, size);
    const material = new THREE.MeshBasicMaterial({ 
      transparent: true, 
      opacity: 0 
    });
    const plane = new THREE.Mesh(geometry, material);
    
    plane.rotation.x = -Math.PI / 2; // Orientación horizontal
    plane.position.y = 0; // Nivel del suelo
    
    return plane;
  }

  /**
   * @method intersectPlane
   * @description Calcula intersección de rayo con plano para posicionamiento
   * 
   * @param {THREE.Raycaster} raycaster - Raycaster configurado
   * @param {THREE.Mesh} plane - Plano de intersección
   * @returns {THREE.Vector3 | null} Punto de intersección o null
   */
  static intersectPlane(
    raycaster: THREE.Raycaster, 
    plane: THREE.Mesh
  ): THREE.Vector3 | null {
    const intersects = raycaster.intersectObject(plane);
    return intersects.length > 0 ? intersects[0].point : null;
  }

  /**
   * @method createInternalWall
   * @description Crea una línea interna (pared divisoria) entre dos puntos
   * 
   * @param {THREE.Vector3} start - Punto inicial de la división
   * @param {THREE.Vector3} end - Punto final de la división
   * @returns {Object} Objeto pared interna para renderizado y lógica
   * 
   * @example
   * const wall = LineGeometryEngine.createInternalWall(
   *   new THREE.Vector3(1, 0, 1),
   *   new THREE.Vector3(4, 0, 1)
   * );
   */
  static createInternalWall(start: THREE.Vector3, end: THREE.Vector3) {
    return {
      id: crypto.randomUUID(),
      start,
      end,
      type: "internal",
      material: "divider", // Puedes personalizar el material
      color: "#e53935",    // Rojo para divisiones internas
      thickness: 0.03,
      height: 2.5,         // Altura estándar, ajusta según tu lógica
      // Puedes agregar más propiedades si lo necesitas
    };
  }
}