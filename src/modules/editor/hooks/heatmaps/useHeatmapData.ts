import { useMemo } from 'react';
import EngineFactory from '@/modules/editor/core/engine/EngineFactory';
import { AcousticAnalysisEngine } from '@/modules/analytics/core/engine/AcousticAnalysisEngine';
import { useWallsStore } from '@/modules/editor/store/wallsStore';
import { useOpeningsStore } from '@/modules/editor/store/openingsStore';
import { useIsoResultStore } from '@/modules/editor/store/isoResultStore';

/**
 * Hook que genera y memoiza los datos del heatmap acústico.
 *
 * Resumen:
 * - Envuelve la creación del motor de análisis acústico y ejecuta las funciones
 *   que producen los datos detallados del heatmap exterior.
 * - Guarda el resultado ISO en el store `useIsoResultStore` como efecto secundario.
 * - Está memoizado con useMemo para evitar recomputaciones innecesarias mientras
 *   las dependencias no cambien.
 *
 * Comportamiento:
 * - Si `isVisible` es false, o no hay paredes (`walls`) o no hay `wallCoordinates`,
 *   devuelve `null` para indicar que no hay datos.
 * - Captura errores y devuelve `null` en caso de fallo interno para no romper el render.
 *
 * Notas de rendimiento:
 * - `acousticAnalysisEngine` se instancia en cada render aquí (ligero). Si la
 *   creación del engine es costosa, mover la instancia fuera del hook o memoizarla
 *   a nivel de módulo/component puede ser recomendable.
 *
 * @param wallCoordinates Array de vértices de la fachada en XZ: [{ x:number, z:number }, ...].
 * @param isVisible Controla si se debe generar el heatmap (optimización). Si false -> null.
 * @param Lp_in Nivel de referencia (dB) para el cálculo acústico. Default = 70.
 * @returns { heatmapData: any | null, openings: any[] } Objeto con los datos generados
 *          (`heatmapData` puede tener la forma definida por AcousticAnalysisEngine) y
 *          `openings` reenviado para conveniencia del consumidor.
 */
export function useHeatmapData(
  wallCoordinates: { x: number; z: number }[],
  isVisible: boolean,
  Lp_in = 70
) {
  const { walls } = useWallsStore();
  const { openings } = useOpeningsStore();

  // Adapter/engine: se crea aquí a partir de la factoría
  const geometryEngine = EngineFactory.getGeometryAdapter();
  const acousticAnalysisEngine = new AcousticAnalysisEngine(geometryEngine);

  const heatmapData = useMemo(() => {
    // Rechaza temprano si no hay condiciones para calcular
    if (!isVisible || !walls?.length || !wallCoordinates?.length) return null;

    try {
      // Genera datos detallados para el heatmap
      const data = acousticAnalysisEngine.generateDetailedAcousticHeatmap(
        walls,
        openings,
        wallCoordinates,
        Lp_in
      );

      // Calcula ISO y almacena resultado en el store (efecto secundario intencional)
      const dataResult = acousticAnalysisEngine.calculateExteriorLevelsWithISO(
        walls,
        openings,
        wallCoordinates,
        Lp_in
      );

      useIsoResultStore.getState().setIsoResult(dataResult);

      return data;
    } catch (err) {
      // Si hay error, no propagar excepción al render; devolver null facilita el fallback UI.
      // Considerar logging centralizado si se desea rastrear fallos.
      return null;
    }
    // acousticAnalysisEngine es recreado en cada render; si se memoiza externamente,
    // puede agregarse como dependencia para evitar recreaciones.
  }, [walls, openings, wallCoordinates, isVisible, Lp_in, acousticAnalysisEngine]);

  return { heatmapData, openings };
}