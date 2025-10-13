/**
 * =====================================================================================
 * LINE EVENT HANDLER - Gestor de Eventos para Interacciones de Líneas
 * =====================================================================================
 * 
 * @description
 * LineEventHandler centraliza el manejo de eventos de mouse y teclado para
 * interacciones con líneas y vértices, proporcionando una API limpia y consistente.
 */

export interface LineEventCallbacks {
  onVertexDragStart?: (index: number) => void;
  onVertexDragEnd?: () => void;
  onVertexHover?: (index: number | null) => void;
  onLineHover?: (index: number | null) => void;
  onVertexRightClick?: (index: number, coords: { clientX: number; clientY: number }) => void;
  onLineRightClick?: (index: number, coords: { clientX: number; clientY: number }) => void;
}

export class LineEventHandler {
  private callbacks: LineEventCallbacks;

  constructor(callbacks: LineEventCallbacks) {
    this.callbacks = callbacks;
  }

  /**
   * @method createVertexHandlers
   * @description Crea manejadores de eventos para vértices
   */
  createVertexHandlers(vertexIndex: number) {
    return {
      onPointerDown: (e: any) => {
        e.stopPropagation();
        
        //   VERIFICAR: ¿Este callback se está llamando?
        console.log('🔥 Vertex pointerDown:', vertexIndex); // DEBUG
        
        if (e.button === 2) {
          // Click derecho
          this.handleVertexRightClick(e, vertexIndex);
        } else {
          // Click izquierdo - iniciar arrastre
          this.callbacks.onVertexDragStart?.(vertexIndex);
        }
      },

      onPointerUp: (e: any) => {
        e.stopPropagation();
        // El sistema de arrastre maneja la finalización globalmente
      },

      onPointerEnter: (e: any) => {
        e.stopPropagation();
        console.log('🔥 Vertex hover enter:', vertexIndex); // DEBUG
        this.callbacks.onVertexHover?.(vertexIndex);
        document.body.style.cursor = 'grab';
      },

      onPointerLeave: (e: any) => {
        e.stopPropagation();
        console.log('🔥 Vertex hover leave:', vertexIndex); // DEBUG
        this.callbacks.onVertexHover?.(null);
        document.body.style.cursor = 'default';
      }
    };
  }

  /**
   * @method createLineHandlers
   * @description Crea manejadores de eventos para líneas
   */
  createLineHandlers(lineIndex: number) {
    return {
      onPointerEnter: (e: any) => {
        e.stopPropagation();
        this.callbacks.onLineHover?.(lineIndex);
        document.body.style.cursor = 'pointer';
      },

      onPointerLeave: (e: any) => {
        e.stopPropagation();
        this.callbacks.onLineHover?.(null);
        document.body.style.cursor = 'default';
      },

      onPointerDown: (e: any) => {
        e.stopPropagation();
        
        if (e.button === 2) {
          this.handleLineRightClick(e, lineIndex);
        } else {
          // Prevenir propagación hacia DrawingSurface
        }
      },

      onClick: (e: any) => {
        e.stopPropagation();
        // Prevenir creación de nuevos puntos
      }
    };
  }

  /**
   * @method handleVertexRightClick
   * @description Maneja click derecho en vértices
   */
  private handleVertexRightClick(e: any, vertexIndex: number) {
    const nativeEvent = e.nativeEvent || e;
    const clientX = nativeEvent.clientX || e.clientX || 0;
    const clientY = nativeEvent.clientY || e.clientY || 0;
    
    this.callbacks.onVertexRightClick?.(vertexIndex, { clientX, clientY });
  }

  /**
   * @method handleLineRightClick
   * @description Maneja click derecho en líneas
   */
  private handleLineRightClick(e: any, lineIndex: number) {
    const nativeEvent = e.nativeEvent || e;
    const clientX = nativeEvent.clientX || e.clientX || 0;
    const clientY = nativeEvent.clientY || e.clientY || 0;
    
    this.callbacks.onLineRightClick?.(lineIndex, { clientX, clientY });
  }

  /**
   * @method updateCallbacks
   * @description Actualiza los callbacks dinámicamente
   */
  updateCallbacks(newCallbacks: Partial<LineEventCallbacks>) {
    this.callbacks = { ...this.callbacks, ...newCallbacks };
  }
}