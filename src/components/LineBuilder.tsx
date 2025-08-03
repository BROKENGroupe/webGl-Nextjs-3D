/**
 * @fileoverview LineBuilder Component - Professional 3D Line Rendering and Interaction System
 * 
 * Este componente proporciona un sistema completo de renderizado y manipulación de líneas 3D
 * con capacidades de arrastre, efectos visuales profesionales y detección de eventos.
 * 
 * Características principales:
 * - Renderizado de líneas como cilindros 3D con alta calidad visual
 * - Vértices interactivos con efectos de hover y arrastre fluido
 * - Sistema de eventos optimizado para prevenir interferencias
 * - Materiales PBR (Physically Based Rendering) para realismo
 * - Efectos visuales avanzados: brillos, sombras, anillos decorativos
 * 
 * @author Sistema de Diseño 3D
 * @version 1.0.0
 * @since 2025-08-02
 */

import * as THREE from "three";
import { useState, useRef, useEffect } from "react";
import { useThree } from "@react-three/fiber";

/**
 * Propiedades del componente LineBuilder
 * @interface LineBuilderProps
 */
interface LineBuilderProps {
  /** Array de puntos Vector3 que definen la línea */
  points: THREE.Vector3[];
  /** Color base de la línea (formato CSS o nombre) */
  color?: string;
  /** Callback ejecutado cuando un vértice es movido */
  onPointMove?: (index: number, newPosition: THREE.Vector3) => void;
  /** Callback ejecutado al iniciar el arrastre de un vértice */
  onDragStart?: () => void;
  /** Callback ejecutado al finalizar el arrastre de un vértice */
  onDragEnd?: () => void;
  /** Callback ejecutado cuando se hace click derecho en una línea */
  onLineRightClick?: (lineIndex: number, event: { clientX: number; clientY: number }) => void;
  /** Callback ejecutado cuando se hace click derecho en un vértice */
  onVertexRightClick?: (vertexIndex: number, event: { clientX: number; clientY: number }) => void;
}

/**
 * LineBuilder - Componente principal para renderizado y manipulación de líneas 3D
 * 
 * Renderiza líneas como cilindros 3D de alta calidad con vértices interactivos.
 * Implementa un sistema de arrastre fluido usando raycasting global y eventos
 * optimizados para una experiencia de usuario profesional.
 * 
 * @param {LineBuilderProps} props - Propiedades del componente
 * @returns {JSX.Element} Elementos 3D renderizados con R3F
 * 
 * @example
 * ```tsx
 * const points = [
 *   new THREE.Vector3(0, 0, 0),
 *   new THREE.Vector3(1, 0, 1),
 *   new THREE.Vector3(2, 0, 0)
 * ];
 * 
 * <LineBuilder 
 *   points={points}
 *   color="blue"
 *   onPointMove={(index, newPos) => updatePoint(index, newPos)}
 *   onDragStart={() => setDragging(true)}
 *   onDragEnd={() => setDragging(false)}
 * />
 * ```
 */
export function LineBuilder({ 
  points, 
  color = "blue", 
  onPointMove, 
  onDragStart, 
  onDragEnd,
  onLineRightClick,
  onVertexRightClick
}: LineBuilderProps) {
  // ===================================================================
  // ESTADO DEL COMPONENTE
  // ===================================================================
  
  /** Índice del vértice actualmente siendo arrastrado */
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  
  /** Índice del vértice sobre el cual está el cursor */
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  
  /** Índice de la línea sobre la cual está el cursor */
  const [hoveredLineIndex, setHoveredLineIndex] = useState<number | null>(null);
  
  /** Estado para detectar si se está presionando Shift para movimiento libre */
  const [isShiftPressed, setIsShiftPressed] = useState<boolean>(false);
  
  // ===================================================================
  // HOOKS Y REFERENCIAS
  // ===================================================================
  
  /** Hooks de React Three Fiber para acceso a escena y herramientas 3D */
  const { scene, camera, raycaster, pointer } = useThree();
  
  /** Referencia al grupo de líneas (legacy, mantenida para cleanup) */
  const linesGroupRef = useRef<THREE.Group | null>(null);
  
  /** Referencia al plano invisible usado para raycasting durante el arrastre */
  const planeRef = useRef<THREE.Mesh | null>(null);

  // ===================================================================
  // SISTEMA DE ARRASTRE GLOBAL
  // ===================================================================
  
  /**
   * Efecto que maneja el sistema de arrastre global de vértices.
   * 
   * Funcionalidad:
   * - Crea un plano invisible para raycasting preciso
   * - Configura listeners globales para movimiento y liberación del mouse
   * - Convierte coordenadas 2D del mouse a posiciones 3D en el plano
   * - Aplica snap-to-grid automático con incrementos de 0.5 unidades
   * - Limpia recursos al desmontar el componente
   * 
   * @dependencies draggedIndex, onPointMove, onDragEnd, scene, camera, raycaster, pointer
   */

  useEffect(() => {
    // Inicialización del plano de raycasting
    if (!planeRef.current) {
      const geometry = new THREE.PlaneGeometry(100, 100);
      const material = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 });
      const plane = new THREE.Mesh(geometry, material);
      plane.rotation.x = -Math.PI / 2; // Orientación horizontal
      plane.position.y = 0; // Nivel del suelo
      planeRef.current = plane;
      scene.add(plane);
    }

    /**
     * Detectar teclas presionadas para modificar el comportamiento del arrastre
     */
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Shift') {
        setIsShiftPressed(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Shift') {
        setIsShiftPressed(false);
      }
    };

    /**
     * Manejador de movimiento global del puntero durante el arrastre.
     * Convierte las coordenadas 2D del mouse a coordenadas 3D del mundo.
     */
    const handleGlobalPointerMove = () => {
      if (draggedIndex !== null && onPointMove && planeRef.current) {
        // Configurar raycaster desde la cámara hacia la posición del mouse
        raycaster.setFromCamera(pointer, camera);
        const intersects = raycaster.intersectObject(planeRef.current);
        
        if (intersects.length > 0) {
          let newPosition: THREE.Vector3;
          
          if (isShiftPressed) {
            // Movimiento completamente fluido sin snap cuando se presiona Shift
            newPosition = new THREE.Vector3(
              intersects[0].point.x,
              0, // Mantener en el plano Y=0
              intersects[0].point.z
            );
          } else {
            // Aplicar snap-to-grid con incrementos más pequeños para movimiento suave
            const snapIncrement = 0.1; // Incremento más pequeño para mayor suavidad
            newPosition = new THREE.Vector3(
              Math.round(intersects[0].point.x / snapIncrement) * snapIncrement,
              0, // Mantener en el plano Y=0
              Math.round(intersects[0].point.z / snapIncrement) * snapIncrement
            );
          }
          
          onPointMove(draggedIndex, newPosition);
        }
      }
    };

    /**
     * Manejador de liberación global del puntero.
     * Finaliza el proceso de arrastre y ejecuta callbacks correspondientes.
     */
    const handleGlobalPointerUp = () => {
      if (draggedIndex !== null) {
        setDraggedIndex(null);
        onDragEnd?.();
      }
    };

    // Registrar listeners globales solo durante el arrastre
    if (draggedIndex !== null) {
      window.addEventListener('pointermove', handleGlobalPointerMove);
      window.addEventListener('pointerup', handleGlobalPointerUp);
    }

    // Registrar listeners de teclado siempre (para detectar Shift)
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Cleanup: remover listeners y recursos
    return () => {
      window.removeEventListener('pointermove', handleGlobalPointerMove);
      window.removeEventListener('pointerup', handleGlobalPointerUp);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (planeRef.current) {
        scene.remove(planeRef.current);
        planeRef.current = null;
      }
    };
  }, [draggedIndex, onPointMove, onDragEnd, scene, camera, raycaster, pointer, isShiftPressed]);

  // ===================================================================
  // MANEJADORES DE EVENTOS DE VÉRTICES
  // ===================================================================
  
  /**
   * Inicia el proceso de arrastre de un vértice.
   * @param e - Evento de puntero de React Three Fiber
   * @param index - Índice del vértice a arrastrar
   */
  const handlePointerDown = (e: any, index: number) => {
    e.stopPropagation(); // Prevenir interferencia con otros elementos
    setDraggedIndex(index);
    onDragStart?.();
  };

  /**
   * Maneja la liberación del puntero sobre un vértice.
   * El manejo real se delega al sistema global.
   * @param e - Evento de puntero de React Three Fiber
   */
  const handlePointerUp = (e: any) => {
    e.stopPropagation();
    // El sistema global maneja la liberación
  };

  /**
   * Maneja la entrada del cursor sobre un vértice.
   * Activa el estado de hover y cambia el cursor.
   * @param e - Evento de puntero de React Three Fiber
   * @param index - Índice del vértice
   */
  const handlePointerEnter = (e: any, index: number) => {
    e.stopPropagation();
    setHoveredIndex(index);
    document.body.style.cursor = 'grab';
  };

  /**
   * Maneja la salida del cursor de un vértice.
   * Desactiva el estado de hover y restaura el cursor.
   * @param e - Evento de puntero de React Three Fiber
   */
  const handlePointerLeave = (e: any) => {
    e.stopPropagation();
    setHoveredIndex(null);
    document.body.style.cursor = 'default';
  };

  // ===================================================================
  // MANEJADORES DE EVENTOS DE LÍNEAS
  // ===================================================================
  
  /**
   * Maneja la entrada del cursor sobre una línea.
   * @param e - Evento de puntero de React Three Fiber
   * @param lineIndex - Índice de la línea
   */
  const handleLinePointerEnter = (e: any, lineIndex: number) => {
    e.stopPropagation();
    setHoveredLineIndex(lineIndex);
    document.body.style.cursor = 'pointer';
  };

  /**
   * Maneja la salida del cursor de una línea.
   * @param e - Evento de puntero de React Three Fiber
   */
  const handleLinePointerLeave = (e: any) => {
    e.stopPropagation();
    setHoveredLineIndex(null);
    document.body.style.cursor = 'default';
  };

  /**
   * Maneja los clicks sobre líneas para prevenir la creación de nuevos puntos.
   * @param e - Evento de puntero de React Three Fiber
   */
  const handleLineClick = (e: any) => {
    e.stopPropagation();
    // Prevenir propagación hacia DrawingSurface
  };

  /**
   * Maneja el click derecho sobre líneas para mostrar menú contextual.
   * @param e - Evento de puntero de React Three Fiber
   * @param lineIndex - Índice de la línea
   */
  const handleLineRightClick = (e: any, lineIndex: number) => {
    e.stopPropagation();
    
    if (e.button === 2 && onLineRightClick) { // Click derecho
      // Usar las coordenadas del evento nativo si están disponibles
      const nativeEvent = e.nativeEvent || e;
      const clientX = nativeEvent.clientX || e.clientX || 0;
      const clientY = nativeEvent.clientY || e.clientY || 0;
      
      onLineRightClick(lineIndex, { clientX, clientY });
    }
  };

  /**
   * Maneja el click derecho sobre vértices para mostrar menú contextual.
   * @param e - Evento de puntero de React Three Fiber
   * @param vertexIndex - Índice del vértice
   */
  const handleVertexRightClick = (e: any, vertexIndex: number) => {
    e.stopPropagation();
    
    if (e.button === 2 && onVertexRightClick) { // Click derecho
      // Usar las coordenadas del evento nativo si están disponibles
      const nativeEvent = e.nativeEvent || e;
      const clientX = nativeEvent.clientX || e.clientX || 0;
      const clientY = nativeEvent.clientY || e.clientY || 0;
      
      onVertexRightClick(vertexIndex, { clientX, clientY });
    }
  };

  // ===================================================================
  // RENDERIZADO DE ELEMENTOS 3D
  // ===================================================================
  
  return (
    <>
      {/* 
        SISTEMA DE LÍNEAS ESTILO CAD PROFESIONAL
        ========================================
        
        Renderiza líneas con el estilo característico de software CAD:
        
        - Líneas como rectángulos planos (no cilindros)
        - Grosor uniforme y constante
        - Colores sólidos sin efectos metálicos
        - Hover con cambio de grosor sutil
        - Sin efectos de brillo o reflexiones
        - Orientación siempre hacia la cámara
      */}
      {points.length > 1 && points.slice(0, -1).map((point, index) => {
        // Cálculos geométricos para cada segmento de línea
        const start = points[index];
        const end = points[index + 1];
        const distance = start.distanceTo(end);
        const direction = new THREE.Vector3().subVectors(end, start).normalize();
        const midPoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
        const isLineHovered = hoveredLineIndex === index;
        
        // Cálculo de orientación para línea plana (rectángulo)
        const axis = new THREE.Vector3(0, 1, 0); // Eje Y (altura del rectángulo)
        const quaternion = new THREE.Quaternion().setFromUnitVectors(axis, direction);
        
        return (
          <group key={`line-group-${index}`}>
            {/* Línea principal estilo CAD (rectángulo plano) */}
            <mesh
              position={[midPoint.x, midPoint.y + 0.005, midPoint.z]}
              quaternion={[quaternion.x, quaternion.y, quaternion.z, quaternion.w]}
              onPointerEnter={(e) => handleLinePointerEnter(e, index)}
              onPointerLeave={handleLinePointerLeave}
              onPointerDown={(e) => {
                if (e.button === 2) {
                  handleLineRightClick(e, index);
                } else {
                  handleLineClick(e);
                }
              }}
              onClick={handleLineClick}
            >
              <boxGeometry 
                args={[
                  isLineHovered ? 0.04 : 0.032,  // Ancho (grosor de línea) - más grueso
                  distance,                       // Altura (longitud de la línea)
                  0.005                          // Profundidad - más gruesa
                ]} 
              />
              <meshBasicMaterial
                color={isLineHovered ? new THREE.Color("#4DA6FF").multiplyScalar(1.3) : "#4DA6FF"} // Azul más claro
                transparent={false}
                side={THREE.DoubleSide}
              />
            </mesh>
            
            {/* Línea de contorno para mayor definición (estilo CAD) */}
            <mesh
              position={[midPoint.x, midPoint.y + 0.006, midPoint.z]}
              quaternion={[quaternion.x, quaternion.y, quaternion.z, quaternion.w]}
            >
              <boxGeometry 
                args={[
                  isLineHovered ? 0.043 : 0.035, // Ligeramente más ancho - más grueso
                  distance + 0.015,               // Ligeramente más largo - aumentado
                  0.004                          // Más grueso
                ]} 
              />
              <meshBasicMaterial
                color={isLineHovered ? "#E6F3FF" : "#B3D9FF"} // Azul muy claro para contorno
                transparent={true}
                opacity={0.6} // Reducida para mayor sutileza
                side={THREE.DoubleSide}
              />
            </mesh>
          </group>
        );
      })}
      
      {/* 
        SISTEMA DE VÉRTICES ESTILO CAD PROFESIONAL
        ===========================================
        
        Renderiza vértices con el estilo característico de software CAD:
        
        - Cuadrados/rectángulos simples sin decoración
        - Colores sólidos y contrastantes
        - Sin efectos metálicos o brillos
        - Escalado mínimo durante interacción
        - Contorno definido para claridad
        - Apariencia plana y funcional
      */}
      {points.map((point, index) => {
        // Estados y propiedades visuales del vértice estilo CAD
        const isHovered = hoveredIndex === index;
        const isDragged = draggedIndex === index;
        const scale = isDragged ? 1.3 : isHovered ? 1.2 : 1.0; // Escalado más prominente
        
        // Colores típicos de software CAD con tonos azules
        // Cambiar color si se está arrastrando con Shift (movimiento libre)
        const baseColor = isDragged 
          ? (isShiftPressed ? "#ff6600" : "#00ff00") // Naranja para movimiento libre, verde para snap
          : isHovered ? "#66B3FF" : "#3399FF"; // Azul más claro para vértices
        const outlineColor = isDragged ? "#ffffff" : isHovered ? "#004080" : "#1A66CC"; // Azul más oscuro para contraste
        
        return (
          <group key={`vertex-group-${index}`}>
            {/* Cuadrado principal del vértice (estilo CAD) */}
            <mesh
              position={[point.x, point.y + 0.008, point.z]}
              rotation={[-Math.PI / 2, 0, 0]} // Orientación horizontal (plano)
              scale={[scale, scale, 1]}
              onPointerDown={(e) => {
                if (e.button === 2) {
                  handleVertexRightClick(e, index);
                } else {
                  handlePointerDown(e, index);
                }
              }}
              onPointerUp={handlePointerUp}
              onPointerEnter={(e) => handlePointerEnter(e, index)}
              onPointerLeave={handlePointerLeave}
            >
              <planeGeometry args={[0.16, 0.16]} /> {/* Cuadrado simple - tamaño más grande */}
              <meshBasicMaterial 
                color={baseColor}
                transparent={false}
                side={THREE.DoubleSide} // Visible desde ambos lados
              />
            </mesh>
            
            {/* Contorno del vértice para mayor definición */}
            <mesh
              position={[point.x, point.y + 0.009, point.z]}
              rotation={[-Math.PI / 2, 0, 0]} // Orientación horizontal
              scale={[scale * 1.05, scale * 1.05, 1]}
            >
              <ringGeometry args={[0.08, 0.086, 4]} /> {/* Anillo cuadrado más grande */}
              <meshBasicMaterial
                color={outlineColor}
                transparent={false}
                side={THREE.DoubleSide}
              />
            </mesh>
            
            {/* Punto central para mayor precisión (típico de CAD) */}
            <mesh
              position={[point.x, point.y + 0.01, point.z]}
              rotation={[-Math.PI / 2, 0, 0]}
              scale={[scale * 0.3, scale * 0.3, 1]}
            >
              <circleGeometry args={[0.025, 8]} /> {/* Tamaño más grande */}
              <meshBasicMaterial
                color={isDragged ? "#000000" : "#ffffff"}
                transparent={false}
                side={THREE.DoubleSide}
              />
            </mesh>
            
            {/* Indicador de selección (cruz típica de CAD) */}
            {(isHovered || isDragged) && (
              <>
                {/* Línea horizontal de la cruz */}
                <mesh
                  position={[point.x, point.y + 0.011, point.z]}
                  rotation={[-Math.PI / 2, 0, 0]}
                  scale={[scale * 1.4, scale * 0.1, 1]} // Escala más prominente
                >
                  <planeGeometry args={[0.2, 0.015]} /> {/* Tamaño más grande */}
                  <meshBasicMaterial
                    color="#ffffff"
                    transparent={true}
                    opacity={0.8}
                    side={THREE.DoubleSide}
                  />
                </mesh>
                
                {/* Línea vertical de la cruz */}
                <mesh
                  position={[point.x, point.y + 0.011, point.z]}
                  rotation={[-Math.PI / 2, 0, 0]}
                  scale={[scale * 0.1, scale * 1.4, 1]} // Escala más prominente
                >
                  <planeGeometry args={[0.015, 0.2]} /> {/* Tamaño más grande */}
                  <meshBasicMaterial
                    color="#ffffff"
                    transparent={true}
                    opacity={0.8}
                    side={THREE.DoubleSide}
                  />
                </mesh>
              </>
            )}
          </group>
        );
      })}
    </>
  );
}
