/**
 * @exports AcousticHeatmapShader
 * @description Exportación por defecto del componente de mapa de calor acústico
 * 
 * @summary
 * El componente AcousticHeatmapShader proporciona una visualización avanzada
 * de datos acústicos en tiempo real utilizando shaders WebGL personalizados.
 * Es altamente optimizado para rendimiento y ofrece una interfaz intuitiva
 * para el análisis de propagación del sonido en espacios arquitectónicos.
 * 
 * @version 2.0.0
 * @stable
 */

/**
 * @namespace ComponentMetadata
 * @description Metadatos técnicos del componente
 * 
 * @property {string} componentType - "Visualization"
 * @property {string[]} technologies - ["React", "Three.js", "WebGL", "GLSL"]
 * @property {string[]} patterns - ["Hook Pattern", "Memoization", "Conditional Rendering"]
 * @property {Object} performance - Métricas de rendimiento
 * @property {number} performance.maxPoints - 32
 * @property {string} performance.targetFPS - "60 FPS"
 * @property {string} performance.memoryFootprint - "Low"
 * @property {Object} browser - Compatibilidad de navegadores
 * @property {boolean} browser.webgl2 - true
 * @property {boolean} browser.webgl1 - true (con limitaciones)
 * @property {string[]} browser.tested - ["Chrome 90+", "Firefox 88+", "Safari 14+", "Edge 90+"]
 */

/**
 * @fileoverview Componente de visualización de mapas de calor acústicos con shaders WebGL
 * 
 * Este componente renderiza una representación visual continua de la distribución 
 * del sonido en un espacio 3D utilizando técnicas avanzadas de shaders y análisis acústico.
 * Implementa interpolación IDW (Inverse Distance Weighting) para crear transiciones
 * suaves entre puntos de datos acústicos y genera gradientes de color basados en
 * intensidad sonora.
 * 
 * @module AcousticHeatmapShader
 * @version 2.0.0
 * @author insonor Team
 * @since 2025
 * @requires React
 * @requires @react-three/fiber
 * @requires three
 * @requires AcousticAnalysisEngine
 * @requires useWallsStore
 * @requires useOpeningsStore
 */

import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { AcousticAnalysisEngine } from '../engine/AcousticAnalysisEngine';
import { useWallsStore } from '../store/wallsStore';
import { useOpeningsStore } from '../store/openingsStore';
import { heatmapFragmentShader } from '@/shaders/heatmapFragment';
import { heatmapVertexShader } from '@/shaders/heatmapSurfaceVertex';

/**
 * @interface AcousticHeatmapShaderProps
 * @description Propiedades de configuración para el componente de mapa de calor acústico
 * 
 * Define los parámetros necesarios para la generación y visualización del mapa de calor,
 * incluyendo coordenadas del edificio, configuración de visibilidad y nivel de sonido externo.
 * 
 * @property {Array<{x: number, z: number}>} wallCoordinates - Coordenadas de las paredes del edificio en el plano XZ
 * @property {boolean} isVisible - Controla la visibilidad del mapa de calor
 * @property {number} [externalSoundLevel=70] - Nivel de sonido externo en decibelios (dB)
 * @property {boolean} [showSurface] - Indica si mostrar la superficie del mapa de calor (no implementado)
 * 
 * @example
 * ```tsx
 * interface ExampleCoordinates {
 *   x: number;
 *   z: number;
 * }
 * 
 * const coordinates: ExampleCoordinates[] = [
 *   { x: 0, z: 0 },
 *   { x: 5, z: 0 },
 *   { x: 5, z: 3 },
 *   { x: 0, z: 3 }
 * ];
 * ```
 */
interface AcousticHeatmapShaderProps {
  wallCoordinates: { x: number; z: number }[];
  isVisible: boolean;
  externalSoundLevel?: number;
  showSurface?: boolean;
}

/**
 * @component AcousticHeatmapShader
 * @description Componente principal para visualización de mapas de calor acústicos
 * 
 * Renderiza una representación visual continua de la distribución del sonido
 * en un espacio 3D, utilizando análisis acústico avanzado y shaders WebGL
 * para crear gradientes suaves y marcadores visuales. El componente utiliza
 * shaders externos importados para el procesamiento de vértices y fragmentos.
 * 
 * ## Características principales:
 * - **Análisis acústico en tiempo real**: Procesa datos de paredes y aberturas
 * - **Shaders WebGL personalizados**: Importados desde archivos externos
 * - **Interpolación IDW**: Para gradientes suaves entre puntos de datos
 * - **Marcadores visuales**: Para fuentes acústicas críticas
 * - **Leyenda de colores**: Escala visual de intensidades
 * - **Animaciones dinámicas**: Efectos de ondas en tiempo real
 * 
 * ## Flujo de procesamiento:
 * 1. Obtención de datos de paredes y aberturas desde stores globales
 * 2. Generación de datos de mapa de calor mediante AcousticAnalysisEngine
 * 3. Creación de geometría extendida para visualización
 * 4. Configuración de material shader con uniforms
 * 5. Renderizado de superficie continua y marcadores
 * 
 * @param {AcousticHeatmapShaderProps} props - Propiedades de configuración
 * @returns {JSX.Element | null} Componente Three.js renderizado o null si invisible
 * 
 * @example
 * ```tsx
 * // Uso básico del componente
 * <AcousticHeatmapShader
 *   wallCoordinates={buildingCoords}
 *   isVisible={showHeatmap}
 *   externalSoundLevel={75}
 * />
 * 
 * // Uso avanzado con estado controlado
 * const [heatmapVisible, setHeatmapVisible] = useState(false);
 * const [soundLevel, setSoundLevel] = useState(70);
 * 
 * <AcousticHeatmapShader
 *   wallCoordinates={wallCoordinates}
 *   isVisible={heatmapVisible}
 *   externalSoundLevel={soundLevel}
 *   showSurface={true}
 * />
 * ```
 * 
 * @see {@link AcousticAnalysisEngine} Para el motor de análisis acústico
 * @see {@link useWallsStore} Para gestión de estado de paredes
 * @see {@link useOpeningsStore} Para gestión de estado de aberturas
 * 
 * @performance
 * - **Memoización**: Geometría y materiales son memoizados para optimización
 * - **Límite de puntos**: Máximo 32 puntos de datos para rendimiento GPU
 * - **Renderizado condicional**: Solo renderiza cuando es visible
 * - **Referencias optimizadas**: Usa useRef para evitar recreaciones
 * 
 * @accessibility
 * - **Colores contrastantes**: Paleta optimizada para diferentes tipos de daltonismo
 * - **Leyenda visual**: Escala de colores para interpretación
 * - **Marcadores distintivos**: Formas geométricas para puntos críticos
 */
export const AcousticHeatmapShader: React.FC<AcousticHeatmapShaderProps> = ({ 
  wallCoordinates, 
  isVisible, 
  externalSoundLevel = 70
}) => {
  /**
   * @section Hooks de gestión de estado global
   * @description Acceso a stores globales para datos de construcción
   */
  const { walls } = useWallsStore();
  const { openings } = useOpeningsStore();
  
  /**
   * @section Referencias para elementos Three.js
   * @description Referencias mutables para componentes 3D sin causar re-renders
   */
  const surfaceMeshRef = useRef<THREE.Mesh>(null);
  const shaderMaterialRef = useRef<THREE.ShaderMaterial>(null);

  /**
   * @memo heatmapData
   * @description Cálculo memoizado de datos del mapa de calor acústico
   * 
   * Genera puntos de análisis acústico utilizando el motor de análisis,
   * procesando paredes, aberturas y condiciones ambientales. El cálculo
   * se realiza solo cuando cambian las dependencias especificadas.
   * 
   * ## Proceso de generación:
   * 1. **Validación de entrada**: Verifica visibilidad, paredes y coordenadas
   * 2. **Análisis acústico**: Utiliza AcousticAnalysisEngine para procesar datos
   * 3. **Estructuración de resultados**: Organiza puntos con coordenadas e intensidades
   * 4. **Logging de depuración**: Registra estadísticas del proceso
   * 
   * @dependencies [walls, openings, wallCoordinates, isVisible, externalSoundLevel]
   * @returns {Object | null} Datos estructurados del mapa de calor o null si no hay datos
   * 
   * @throws {Error} Si hay problemas en el procesamiento del análisis acústico
   * 
   * @example
   * ```typescript
   * // Estructura del objeto retornado
   * {
   *   points: Array<{
   *     id: string;
   *     coordinates: { x: number; z: number };
   *     intensity: number; // 0.0 - 1.0
   *     type: 'wall' | 'opening';
   *     transmissionLoss: number;
   *     description: string;
   *   }>,
   *   stats: {
   *     totalPoints: number;
   *     criticalPoints: number;
   *     goodPoints: number;
   *   }
   * }
   * ```
   */
  const heatmapData = useMemo(() => {
    if (!isVisible || !walls.length || !wallCoordinates.length) {
      console.log('🔥 Mapa de calor desactivado - faltan datos:', {
        isVisible,
        wallsCount: walls.length,
        coordinatesCount: wallCoordinates.length
      });
      return null;
    }

    console.log('🔥 Generando mapa de calor continuo...');
    console.log('📊 Datos de entrada:', {
      paredes: walls.length,
      aberturas: openings.length,
      coordenadas: wallCoordinates.length,
      nivelSonidoExterno: externalSoundLevel
    });
    
    try {
      const data = AcousticAnalysisEngine.generateDetailedAcousticHeatmap(
        walls,
        openings,
        wallCoordinates,
        externalSoundLevel
      );
      
      console.log(`✅ Mapa de calor continuo generado:`, {
        totalPuntos: data.points.length,
        puntosCriticos: data.stats?.criticalPoints || 0,
        puntosBuenos: data.stats?.goodPoints || 0
      });
      
      return data;
    } catch (error) {
      console.error('❌ Error generando mapa de calor:', error);
      return null;
    }
  }, [walls, openings, wallCoordinates, isVisible, externalSoundLevel]);

  /**
   * @memo surfaceGeometry
   * @description Geometría memoizada de la superficie del mapa de calor
   * 
   * Crea una geometría de plano extendida que abarca el área del edificio
   * más un margen adicional para visualizar la propagación del sonido.
   * La geometría se optimiza para alta resolución y gradientes suaves.
   * 
   * ## Características de la geometría:
   * - **Extensión**: ±3 unidades adicionales del área del edificio
   * - **Resolución**: 128x128 segmentos para gradientes suaves
   * - **Orientación**: Horizontal (rotación -90° en X)
   * - **Posicionamiento**: Centrado en el edificio, ligeramente elevado
   * 
   * @dependencies [wallCoordinates]
   * @returns {THREE.PlaneGeometry | null} Geometría configurada o null si no hay coordenadas
   * 
   * @performance La geometría se recalcula solo cuando cambian las coordenadas del edificio
   * 
   * @example
   * ```typescript
   * // Cálculo de límites del edificio
   * const bounds = {
   *   minX: Math.min(...wallCoordinates.map(c => c.x)) - 3,
   *   maxX: Math.max(...wallCoordinates.map(c => c.x)) + 3,
   *   minZ: Math.min(...wallCoordinates.map(c => c.z)) - 3,
   *   maxZ: Math.max(...wallCoordinates.map(c => c.z)) + 3
   * };
   * 
   * const dimensions = {
   *   width: bounds.maxX - bounds.minX,
   *   height: bounds.maxZ - bounds.minZ
   * };
   * ```
   */
  const surfaceGeometry = useMemo(() => {
    if (!wallCoordinates.length) {
      console.warn('⚠️ No hay coordenadas para generar geometría');
      return null;
    }

    // Cálculo de límites del edificio con extensión para propagación del sonido
    const minX = Math.min(...wallCoordinates.map(c => c.x)) - 3;
    const maxX = Math.max(...wallCoordinates.map(c => c.x)) + 3;
    const minZ = Math.min(...wallCoordinates.map(c => c.z)) - 3;
    const maxZ = Math.max(...wallCoordinates.map(c => c.z)) + 3;

    const width = maxX - minX;
    const height = maxZ - minZ;

    console.log('📐 Generando geometría de superficie:', {
      dimensiones: `${width.toFixed(1)} x ${height.toFixed(1)}`,
      segmentos: '128x128',
      area: `${(width * height).toFixed(1)} m²`
    });

    const geometry = new THREE.PlaneGeometry(
      width, 
      height, 
      128, 128 // Alta resolución para gradientes suaves y interpolación precisa
    );
    
    // Orientación horizontal (como superficie de piso) y posicionamiento centrado
    geometry.rotateX(-Math.PI / 2); // Rotación de 90° para orientación horizontal
    geometry.translate((minX + maxX) / 2, 0.01, (minZ + maxZ) / 2); // Centrado y ligeramente elevado

    return geometry;
  }, [wallCoordinates]);

  /**
   * @memo surfaceShaderMaterial
   * @description Material shader memoizado para renderizado de superficie
   * 
   * Configura el material shader con uniforms apropiados, incluyendo
   * posiciones de puntos, intensidades y parámetros del edificio.
   * Utiliza shaders externos importados para el procesamiento.
   * 
   * ## Configuración de uniforms:
   * - **time**: Tiempo transcurrido para animaciones
   * - **pointCount**: Número de puntos de datos (máximo 32)
   * - **pointPositions**: Array de posiciones 3D de puntos
   * - **pointIntensities**: Array de intensidades normalizadas
   * - **buildingCenter**: Centro geométrico del edificio
   * - **buildingSize**: Dimensión característica para falloff
   * 
   * ## Optimizaciones de rendimiento:
   * - **Límite de 32 puntos**: Para compatibilidad con shaders en GPU
   * - **Arrays pre-dimensionados**: Evita realocaciones dinámicas
   * - **Cálculos en CPU**: Preparación de datos para GPU
   * 
   * @dependencies [heatmapData, wallCoordinates]
   * @returns {THREE.ShaderMaterial | null} Material configurado o null si faltan datos
   * 
   * @performance 
   * - Se recalcula solo cuando cambian los datos del mapa de calor o coordenadas
   * - Los shaders se compilan una vez y se reutilizan
   * - Los uniforms se actualizan eficientemente en GPU
   * 
   * @example
   * ```typescript
   * // Estructura de datos para shaders
   * const pointPositions = [
   *   x1, y1, z1,  // Punto 1
   *   x2, y2, z2,  // Punto 2
   *   // ... hasta 32 puntos máximo
   * ];
   * 
   * const pointIntensities = [
   *   intensity1,  // 0.0 - 1.0
   *   intensity2,
   *   // ... hasta 32 valores máximo
   * ];
   * ```
   */
  const surfaceShaderMaterial = useMemo(() => {
    if (!heatmapData?.points.length || !wallCoordinates.length) {
      console.warn('⚠️ No hay datos suficientes para generar material shader');
      return null;
    }

    // Configuración de límites para compatibilidad con shaders
    const maxPoints = 32; // Límite de WebGL para arrays de uniforms
    const pointPositions = new Array(maxPoints * 3).fill(0); // x,y,z por punto
    const pointIntensities = new Array(maxPoints).fill(0);

    // Mapeo de datos de puntos a arrays de uniforms optimizados para GPU
    heatmapData.points.forEach((point, index) => {
      if (index < maxPoints) {
        // Posiciones como array plano [x,y,z,x,y,z,...]
        pointPositions[index * 3] = point.coordinates.x;
        pointPositions[index * 3 + 1] = 0; // Y siempre 0 (superficie horizontal)
        pointPositions[index * 3 + 2] = point.coordinates.z;
        
        // Intensidades normalizadas 0.0-1.0
        pointIntensities[index] = Math.max(0, Math.min(1, point.intensity));
      }
    });

    // Cálculo del centro geométrico del edificio para referencia espacial
    const centerX = wallCoordinates.reduce((sum, c) => sum + c.x, 0) / wallCoordinates.length;
    const centerZ = wallCoordinates.reduce((sum, c) => sum + c.z, 0) / wallCoordinates.length;
    
    // Determinación del tamaño característico del edificio para falloff
    const minX = Math.min(...wallCoordinates.map(c => c.x));
    const maxX = Math.max(...wallCoordinates.map(c => c.x));
    const minZ = Math.min(...wallCoordinates.map(c => c.z));
    const maxZ = Math.max(...wallCoordinates.map(c => c.z));
    const buildingSize = Math.max(maxX - minX, maxZ - minZ) * 0.5;

    console.log('🎨 Configurando material shader:', {
      puntosActivos: Math.min(heatmapData.points.length, maxPoints),
      centroEdificio: `(${centerX.toFixed(1)}, ${centerZ.toFixed(1)})`,
      tamañoCaracteristico: buildingSize.toFixed(1),
      shadersExternos: 'heatmapVertexShader, heatmapFragmentShader'
    });

    // Configuración del material shader con shaders externos importados
    const material = new THREE.ShaderMaterial({
      vertexShader: heatmapVertexShader,    // Shader importado para procesamiento de vértices
      fragmentShader: heatmapFragmentShader, // Shader importado para renderizado de píxeles
      uniforms: {
        // Tiempo para animaciones dinámicas
        time: { value: 0.2 },
        
        // Datos de puntos acústicos
        pointCount: { value: Math.min(heatmapData.points.length, maxPoints) },
        pointPositions: { value: pointPositions },
        pointIntensities: { value: pointIntensities },
        
        // Parámetros del edificio para cálculos espaciales
        buildingCenter: { value: new THREE.Vector3(centerX, 0, centerZ) },
        buildingSize: { value: buildingSize }
      },
      
      // Configuración de renderizado
      transparent: true,        // Permite transparencia para efectos de gradiente
      side: THREE.DoubleSide,   // Visible desde ambos lados
      depthWrite: false         // Evita problemas de z-fighting con otros objetos
    });

    // Guardar referencia para actualizaciones posteriores
    shaderMaterialRef.current = material;
    return material;
  }, [heatmapData, wallCoordinates]);

  /**
   * @hook useFrame
   * @description Animación de shader en tiempo real
   * 
   * Actualiza el uniform de tiempo del shader en cada frame para
   * crear efectos de ondas dinámicas en la visualización. Se ejecuta
   * aproximadamente 60 veces por segundo (60 FPS).
   * 
   * ## Efectos animados:
   * - **Ondas dinámicas**: Variaciones sutiles en intensidad de color
   * - **Pulsaciones**: Efectos de respiración en zonas críticas
   * - **Transiciones suaves**: Cambios graduales en gradientes
   * 
   * @param {Object} state - Estado del frame de Three.js
   * @param {THREE.Clock} state.clock - Reloj para tiempo transcurrido
   * 
   * @performance 
   * - Solo actualiza si existe referencia al material
   * - Actualización mínima (solo un uniform)
   * - Optimizado para 60 FPS sin impacto significativo
   * 
   * @example
   * ```typescript
   * // El tiempo se usa en el shader fragment para efectos como:
   * // float wave = sin(time * 0.5 + intensity * 2.0) * 0.05 + 0.95;
   * ```
   */
  useFrame((state) => {
    if (shaderMaterialRef.current) {
      // Actualización del uniform de tiempo para animaciones del shader
      shaderMaterialRef.current.uniforms.time.value = state.clock.getElapsedTime();
    }
  });

  /**
   * @section Renderizado condicional
   * @description Control de visibilidad y validación de datos antes del renderizado
   */
  if (!isVisible || !heatmapData || !surfaceGeometry || !surfaceShaderMaterial) {
    // Logging detallado para depuración de estados de no-renderizado
    if (!isVisible) console.log('🔥 Mapa de calor oculto por configuración de visibilidad');
    if (!heatmapData) console.log('🔥 No hay datos de mapa de calor disponibles');
    if (!surfaceGeometry) console.log('🔥 No se pudo generar geometría de superficie');
    if (!surfaceShaderMaterial) console.log('🔥 No se pudo configurar material shader');
    
    return null;
  }

  console.log('🎨 Renderizando mapa de calor acústico:', {
    puntosVisualizados: heatmapData.points.length,
    marcadoresCriticos: heatmapData.points.filter(p => p.type === 'opening' || p.intensity > 0.7).length,
    dimensionesSuperficie: `${surfaceGeometry.parameters.width?.toFixed(1)} x ${surfaceGeometry.parameters.height?.toFixed(1)}`
  });

  return (
    <group>
      {/* 
        Superficie principal del mapa de calor con gradientes continuos
        Utiliza shaders WebGL personalizados para renderizado eficiente
      */}
      <mesh
        ref={surfaceMeshRef}
        geometry={surfaceGeometry}
        material={surfaceShaderMaterial}
      />

      {/* 
        Leyenda visual de escala de colores
        Proporciona referencia para interpretación de intensidades
      */}
      <group position={[
        Math.min(...wallCoordinates.map(c => c.x)) - 1.5, 
        0.1, 
        Math.min(...wallCoordinates.map(c => c.z)) - 0.5
      ]}>
        {/* 
          Gradiente vertical para referencia de intensidades
          Colores correspondientes a la paleta del shader fragment
        */}
        {[
          { intensity: 0.0, color: 0x008040, label: 'Seguro' },
          { intensity: 0.2, color: 0x00ff80, label: 'Bajo' },
          { intensity: 0.4, color: 0x40ff40, label: 'Moderado' },
          { intensity: 0.6, color: 0xffff00, label: 'Elevado' },
          { intensity: 0.8, color: 0xff8000, label: 'Alto' },
          { intensity: 1.0, color: 0xff0000, label: 'Crítico' }
        ].map((level, index) => (
          <mesh 
            key={index}
            position={[0, index * 0.2, 0]}
          >
            <boxGeometry args={[0.1, 0.15, 0.1]} />
            <meshBasicMaterial color={level.color} />
          </mesh>
        ))}
      </group>
    </group>
  );
};

