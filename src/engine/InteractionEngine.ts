import * as THREE from 'three';
import { Point2D, Opening } from '../types/openings';

export class InteractionEngine {
  
  /**
   * ✅ EXTRAÍDO: calculatePositionFromMouse del componente original
   */
  static calculatePositionFromMouse(
    event: any,
    isDraggingOpening: boolean,
    draggedOpening: Opening | null,
    coordinatesToUse: Point2D[]
  ): {
    wallIndex: number;
    position: number;
    worldX: number;
    worldY: number;
    worldZ: number;
  } | null {
    
    if (!isDraggingOpening || !draggedOpening) return null;

    // Buscar la pared más cercana al punto del ratón
    let closestWall = null;
    let closestDistance = Infinity;
    let closestPosition = 0.5;

    coordinatesToUse.forEach((coord, wallIndex) => {
      const nextIndex = (wallIndex + 1) % coordinatesToUse.length;
      const nextCoord = coordinatesToUse[nextIndex];
      
      // ✅ CALCULAR POSICIÓN DIRECTA SIN ROTACIONES COMPLEJAS
      const wallVector = {
        x: nextCoord.x - coord.x,
        z: nextCoord.z - coord.z
      };
      
      const mouseToStart = {
        x: event.point.x - coord.x,
        z: event.point.z - coord.z
      };
      
      // ✅ PROYECCIÓN VECTORIAL DIRECTA
      const dotProduct = mouseToStart.x * wallVector.x + mouseToStart.z * wallVector.z;
      const wallLengthSquared = wallVector.x * wallVector.x + wallVector.z * wallVector.z;
      
      // Posición normalizada en la pared (0.0 = inicio, 1.0 = final)
      const relativePosition = dotProduct / wallLengthSquared;
      const clampedPosition = Math.max(0.05, Math.min(0.95, relativePosition));
      
      // Calcular distancia del ratón a esta pared (para encontrar la más cercana)
      const closestPointOnWall = {
        x: coord.x + clampedPosition * wallVector.x,
        z: coord.z + clampedPosition * wallVector.z
      };
      
      const distance = Math.sqrt(
        (event.point.x - closestPointOnWall.x) ** 2 + 
        (event.point.z - closestPointOnWall.z) ** 2
      );
      
      if (distance < closestDistance) {
        closestDistance = distance;
        closestWall = wallIndex;
        closestPosition = clampedPosition;
      }
    });

    if (closestWall !== null) {
      const coord = coordinatesToUse[closestWall];
      const nextCoord = coordinatesToUse[(closestWall + 1) % coordinatesToUse.length];
      
      return {
        wallIndex: closestWall,
        position: closestPosition,
        worldX: coord.x + closestPosition * (nextCoord.x - coord.x),
        worldY: draggedOpening.bottomOffset + draggedOpening.height/2,
        worldZ: coord.z + closestPosition * (nextCoord.z - coord.z)
      };
    }
    
    return null;
  }

  /**
   * ✅ EXTRAÍDO: Lógica de cálculo para template drop del componente original
   */
  static calculateTemplateDropPosition(
    event: any,
    wallIndex: number,
    coordinatesToUse: Point2D[],
    depth: number
  ): number {
    const p1 = coordinatesToUse[wallIndex];
    const p2 = coordinatesToUse[(wallIndex + 1) % coordinatesToUse.length];
    const wallLength = Math.sqrt((p2.x - p1.x) ** 2 + (p2.z - p1.z) ** 2);
    const wallAngle = Math.atan2(p2.z - p1.z, p2.x - p1.x);
    const centerX = (p1.x + p2.x) / 2;
    const centerZ = (p1.z + p2.z) / 2;
    
    const localPoint = event.point.clone();
    localPoint.sub(new THREE.Vector3(centerX, depth/2, centerZ));
    
    const rotationMatrix = new THREE.Matrix4().makeRotationY(-wallAngle);
    localPoint.applyMatrix4(rotationMatrix);
    
    const relativePosition = (localPoint.x + wallLength/2) / wallLength;
    return Math.max(0.1, Math.min(0.9, relativePosition));
  }

  /**
   * ✅ NUEVA: Calcular posición de display para aberturas
   */
  static calculateDisplayPosition(
    opening: Opening,
    isBeingDragged: boolean,
    previewPosition: any,
    coord: Point2D,
    nextCoord: Point2D
  ): { x: number; y: number; z: number } {
    if (isBeingDragged && previewPosition) {
      return {
        x: previewPosition.worldX,
        y: previewPosition.worldY,
        z: previewPosition.worldZ
      };
    } else {
      const t = opening.position;
      return {
        x: coord.x + t * (nextCoord.x - coord.x),
        y: opening.bottomOffset + opening.height/2,
        z: coord.z + t * (nextCoord.z - coord.z)
      };
    }
  }
}