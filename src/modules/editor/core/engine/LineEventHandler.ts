/** * 
 * LineEventHandler centraliza el manejo de eventos de mouse y teclado para
 * interacciones con líneas y vértices, proporcionando una API limpia y consistente.
 */

/**
 * Callbacks para eventos de interacción con líneas y vértices.
 */
export interface LineEventCallbacks {
  onVertexClick?: (index: number) => boolean;
  onVertexDragStart?: (index: number) => void;
  onVertexDragEnd?: () => void;
  onVertexHover?: (index: number | null) => void;
  onLineHover?: (index: number | null) => void;
  onVertexRightClick?: (index: number, coords: { clientX: number; clientY: number }) => void;
  onLineRightClick?: (index: number, coords: { clientX: number; clientY: number }) => void;
}

/**
 * Gestor de eventos para líneas y vértices.
 */
export class LineEventHandler {
  private callbacks: LineEventCallbacks;

  /**
   * Crea una instancia de LineEventHandler.
   * @param callbacks Callbacks para eventos de interacción.
   */
  constructor(callbacks: LineEventCallbacks) {
    this.callbacks = callbacks;
  }

  /**
   * Crea manejadores de eventos para vértices.
   * @param vertexIndex Índice del vértice.
   * @returns Objeto con handlers de eventos.
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
          // Click izquierdo
          // Primero, intentar manejarlo como un clic de cierre.
          if (this.callbacks.onVertexClick?.(vertexIndex)) {
            // Si onVertexClick devuelve true, significa que manejó el evento (y cerró la forma).
            // No hacemos nada más para no iniciar un arrastre.
            return;
          }
          // Si no, proceder a iniciar el arrastre.
          this.callbacks.onVertexDragStart?.(vertexIndex);
        }
      },

      onPointerUp: (e: any) => {
        e.stopPropagation();
        // El sistema de arrastre maneja la finalización globalmente
      },

      onPointerEnter: (e: any) => {
        e.stopPropagation();
        this.callbacks.onVertexHover?.(vertexIndex);
        document.body.style.cursor = 'grab';
      },

      onPointerLeave: (e: any) => {
        e.stopPropagation();
        this.callbacks.onVertexHover?.(null);
        document.body.style.cursor = 'default';
      }
    };
  }

  /**
   * Crea manejadores de eventos para líneas.
   * @param lineIndex Índice de la línea.
   * @returns Objeto con handlers de eventos.
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
   * Maneja click derecho en vértices.
   * @param e Evento de mouse.
   * @param vertexIndex Índice del vértice.
   * @private
   */
  private handleVertexRightClick(e: any, vertexIndex: number) {
    const nativeEvent = e.nativeEvent || e;
    const clientX = nativeEvent.clientX || e.clientX || 0;
    const clientY = nativeEvent.clientY || e.clientY || 0;
    this.callbacks.onVertexRightClick?.(vertexIndex, { clientX, clientY });
  }

  /**
   * Maneja click derecho en líneas.
   * @param e Evento de mouse.
   * @param lineIndex Índice de la línea.
   * @private
   */
  private handleLineRightClick(e: any, lineIndex: number) {
    const nativeEvent = e.nativeEvent || e;
    const clientX = nativeEvent.clientX || e.clientX || 0;
    const clientY = nativeEvent.clientY || e.clientY || 0;
    this.callbacks.onLineRightClick?.(lineIndex, { clientX, clientY });
  }

  /**
   * Actualiza los callbacks dinámicamente.
   * @param newCallbacks Callbacks nuevos o modificados.
   */
  updateCallbacks(newCallbacks: Partial<LineEventCallbacks>) {
    this.callbacks = { ...this.callbacks, ...newCallbacks };
  }
}