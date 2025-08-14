import * as THREE from 'three';
import { LineGeometryEngine } from './LineGeometryEngine';

/**
 * =====================================================================================
 * LINE DRAG ENGINE - Motor de Sistema de Arrastre para Líneas 3D
 * =====================================================================================
 * 
 * @description
 * LineDragEngine maneja todo el sistema de arrastre de vértices con raycasting
 * preciso, snap-to-grid y feedback visual en tiempo real.
 */

export class LineDragEngine {
  private static instance: LineDragEngine | null = null;
  private draggedIndex: number | null = null;
  private isShiftPressed: boolean = false;
  private raycastPlane: THREE.Mesh | null = null;
  private scene: THREE.Scene | null = null;
  
  // Callbacks
  private onPointMove?: (index: number, position: THREE.Vector3) => void;
  private onDragStart?: () => void;
  private onDragEnd?: () => void;

  /**
   * @method getInstance
   * @description Patrón Singleton para gestión global del arrastre
   */
  static getInstance(): LineDragEngine {
    if (!LineDragEngine.instance) {
      LineDragEngine.instance = new LineDragEngine();
    }
    return LineDragEngine.instance;
  }

  /**
   * @method initialize
   * @description Inicializa el sistema de arrastre con dependencias
   */
  initialize(
    scene: THREE.Scene,
    callbacks: {
      onPointMove?: (index: number, position: THREE.Vector3) => void;
      onDragStart?: () => void;
      onDragEnd?: () => void;
    }
  ) {
    this.scene = scene;
    this.onPointMove = callbacks.onPointMove;
    this.onDragStart = callbacks.onDragStart;
    this.onDragEnd = callbacks.onDragEnd;

    // Crear plano de raycasting
    this.raycastPlane = LineGeometryEngine.createRaycastPlane();
    scene.add(this.raycastPlane);

    // Setup event listeners
    this.setupEventListeners();
  }

  /**
   * @method setupEventListeners
   * @description Configura listeners globales para el sistema
   */
  private setupEventListeners() {
    // Keyboard listeners para Shift
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    
    // Mouse listeners para arrastre global
    window.addEventListener('pointermove', this.handleGlobalPointerMove);
    window.addEventListener('pointerup', this.handleGlobalPointerUp);
  }

  /**
   * @method removeEventListeners
   * @description Limpia todos los event listeners
   */
  private removeEventListeners() {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    window.removeEventListener('pointermove', this.handleGlobalPointerMove);
    window.removeEventListener('pointerup', this.handleGlobalPointerUp);
  }

  /**
   * @method startDrag
   * @description Inicia el arrastre de un vértice específico
   */
  startDrag(vertexIndex: number) {
    this.draggedIndex = vertexIndex;
    this.onDragStart?.();
  }

  /**
   * @method endDrag
   * @description Finaliza el arrastre actual
   */
  endDrag() {
    if (this.draggedIndex !== null) {
      this.draggedIndex = null;
      this.onDragEnd?.();
    }
  }

  /**
   * @method updatePosition
   * @description Actualiza posición durante arrastre con raycasting
   */
  updatePosition(raycaster: THREE.Raycaster) {
    if (this.draggedIndex === null || !this.raycastPlane || !this.onPointMove) {
      return;
    }

    const intersectionPoint = LineGeometryEngine.intersectPlane(raycaster, this.raycastPlane);
    if (!intersectionPoint) return;

    // Aplicar snap-to-grid según estado de Shift
    const finalPosition = LineGeometryEngine.snapToGrid(
      intersectionPoint,
      0.1,
      !this.isShiftPressed // Snap deshabilitado cuando Shift está presionado
    );

    this.onPointMove(this.draggedIndex, finalPosition);
  }

  /**
   * @method cleanup
   * @description Limpia recursos y listeners
   */
  cleanup() {
    this.removeEventListeners();
    
    if (this.raycastPlane && this.scene) {
      this.scene.remove(this.raycastPlane);
      this.raycastPlane = null;
    }
    
    this.scene = null;
    LineDragEngine.instance = null;
  }

  // ===== EVENT HANDLERS =====

  private handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Shift') {
      this.isShiftPressed = true;
    }
  };

  private handleKeyUp = (e: KeyboardEvent) => {
    if (e.key === 'Shift') {
      this.isShiftPressed = false;
    }
  };

  private handleGlobalPointerMove = () => {
    // Este será llamado desde el hook con el raycaster actualizado
  };

  private handleGlobalPointerUp = () => {
    this.endDrag();
  };

  // ===== GETTERS =====

  get isDragging(): boolean {
    return this.draggedIndex !== null;
  }

  get currentDragIndex(): number | null {
    return this.draggedIndex;
  }

  get isShiftMode(): boolean {
    return this.isShiftPressed;
  }
}