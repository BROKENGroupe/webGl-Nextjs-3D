import * as THREE from 'three';
import type { IGeometryAdapter } from "./contracts/IGeometryAdapter";
import { LineGeometryEngine } from "./LineGeometryEngine";

/**
 * Motor de sistema de arrastre para líneas 3D.
 * Permite manipular vértices de líneas mediante raycasting y eventos globales.
 */
export class LineDragEngine {
  private static instance: LineDragEngine | null = null;
  private draggedIndex: number | null = null;
  private isShiftPressed: boolean = false;
  private raycastPlane: THREE.Mesh | null = null;
  private scene: THREE.Scene | null = null;
  private lineGeometryEngine: LineGeometryEngine;

  // Callbacks
  private onPointMove?: (index: number, position: any) => void;
  private onDragStart?: () => void;
  private onDragEnd?: () => void;

  /**
   * Crea una instancia de LineDragEngine.
   * @param adapter Adaptador de geometría compatible.
   */
  constructor(private adapter: IGeometryAdapter) {
    this.lineGeometryEngine = new LineGeometryEngine(adapter);
  }

  /**
   * Obtiene la instancia singleton de LineDragEngine.
   * @param adapter Adaptador de geometría compatible.
   * @returns Instancia única de LineDragEngine.
   */
  static getInstance(adapter: IGeometryAdapter): LineDragEngine {
    if (!LineDragEngine.instance) {
      LineDragEngine.instance = new LineDragEngine(adapter);
    }
    return LineDragEngine.instance;
  }

  /**
   * Inicializa el sistema de arrastre con la escena y callbacks.
   * @param scene Escena de THREE.js.
   * @param callbacks Callbacks para eventos de arrastre.
   */
  initialize(
    scene: THREE.Scene,
    callbacks: {
      onPointMove?: (index: number, position: any) => void;
      onDragStart?: () => void;
      onDragEnd?: () => void;
    }
  ) {
    this.scene = scene;
    this.onPointMove = callbacks.onPointMove;
    this.onDragStart = callbacks.onDragStart;
    this.onDragEnd = callbacks.onDragEnd;

    // Instancia el plano de raycasting usando la instancia
    this.raycastPlane = this.lineGeometryEngine.createRaycastPlane();

    scene.add(this.raycastPlane);

    // Setup event listeners
    this.setupEventListeners();
  }

  /**
   * Configura listeners globales para el sistema.
   * @private
   */
  private setupEventListeners() {
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    window.addEventListener('pointermove', this.handleGlobalPointerMove);
    window.addEventListener('pointerup', this.handleGlobalPointerUp);
  }

  /**
   * Limpia todos los event listeners.
   * @private
   */
  private removeEventListeners() {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    window.removeEventListener('pointermove', this.handleGlobalPointerMove);
    window.removeEventListener('pointerup', this.handleGlobalPointerUp);
  }

  /**
   * Inicia el arrastre de un vértice específico.
   * @param vertexIndex Índice del vértice a arrastrar.
   */
  startDrag(vertexIndex: number) {
    this.draggedIndex = vertexIndex;
    this.onDragStart?.();
  }

  /**
   * Finaliza el arrastre actual.
   */
  endDrag() {
    if (this.draggedIndex !== null) {
      this.draggedIndex = null;
      this.onDragEnd?.();
    }
  }

  /**
   * Actualiza la posición durante el arrastre usando raycasting.
   * @param raycaster Raycaster de THREE.js.
   */
  updatePosition(raycaster: THREE.Raycaster) {
    if (this.draggedIndex === null || !this.raycastPlane || !this.onPointMove) {
      return;
    }

    // Usa la instancia para obtener la intersección y aplicar snap
    const intersectionPoint = this.lineGeometryEngine.intersectPlane(raycaster, this.raycastPlane);
    if (!intersectionPoint) return;

    // Aplicar snap-to-grid según estado de Shift
    const finalPosition = this.lineGeometryEngine.snapToGrid(
      intersectionPoint,
      0.1,
      !this.isShiftPressed // Snap deshabilitado cuando Shift está presionado
    );

    this.onPointMove(this.draggedIndex, finalPosition);
  }

  /**
   * Limpia recursos y listeners.
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

  /**
   * Handler para evento de tecla presionada.
   * @param e Evento de teclado.
   * @private
   */
  private handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Shift') {
      this.isShiftPressed = true;
    }
  };

  /**
   * Handler para evento de tecla liberada.
   * @param e Evento de teclado.
   * @private
   */
  private handleKeyUp = (e: KeyboardEvent) => {
    if (e.key === 'Shift') {
      this.isShiftPressed = false;
    }
  };

  /**
   * Handler para movimiento global del puntero.
   * @private
   */
  private handleGlobalPointerMove = () => {
    // Este será llamado desde el hook con el raycaster actualizado
  };

  /**
   * Handler para liberación global del puntero.
   * @private
   */
  private handleGlobalPointerUp = () => {
    this.endDrag();
  };

  /**
   * Indica si hay un arrastre activo.
   */
  get isDragging(): boolean {
    return this.draggedIndex !== null;
  }

  /**
   * Devuelve el índice actual del vértice arrastrado.
   */
  get currentDragIndex(): number | null {
    return this.draggedIndex;
  }

  /**
   * Indica si el modo Shift está activo (snap deshabilitado).
   */
  get isShiftMode(): boolean {
    return this.isShiftPressed;
  }
}