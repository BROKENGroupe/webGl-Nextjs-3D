import { EngineType, MOTOR_GRAFIC_CANVAS } from "../constans";
import { ThreeGeometryAdapter } from "./adapters/ThreeGeometryAdapter";
// import { BabylonGeometryAdapter } from "./adapters/BabylonGeometryAdapter";
import { GeometryEngine } from "./GeometryEngine";



class EngineFactory {
  private static geometryAdapter: any = null;
  private static geometryEngine: GeometryEngine | null = null;
  private static engineType: EngineType;

  /**
   * Inicializa el tipo de motor una sola vez al arrancar la app.
   * Los componentes no deben decidir el tipo, solo usan el factory.
   */
  static initialize(type: EngineType = MOTOR_GRAFIC_CANVAS.TREE) {
    if (!EngineFactory.engineType) {
      EngineFactory.engineType = type;
      EngineFactory.geometryAdapter = null;
      EngineFactory.geometryEngine = null;
    }
  }

  static getGeometryAdapter() {
    if (!EngineFactory.engineType) {
      // Por defecto usa THREE si no se inicializó
      EngineFactory.initialize(MOTOR_GRAFIC_CANVAS.TREE);
    }
    if (!EngineFactory.geometryAdapter) {
      switch (EngineFactory.engineType) {
        case MOTOR_GRAFIC_CANVAS.TREE:
          EngineFactory.geometryAdapter = new ThreeGeometryAdapter();
          break;
        // case MOTOR_GRAFIC_CANVAS.BABYLON:
        //   EngineFactory.geometryAdapter = new BabylonGeometryAdapter();
        //   break;
        default:
          EngineFactory.geometryAdapter = new ThreeGeometryAdapter();
      }
    }
    return EngineFactory.geometryAdapter;
  }

  static getGeometryEngine() {
    if (!EngineFactory.engineType) {
      EngineFactory.initialize(MOTOR_GRAFIC_CANVAS.TREE);
    }
    if (!EngineFactory.geometryEngine) {
      EngineFactory.geometryEngine = new GeometryEngine(EngineFactory.getGeometryAdapter());
    }
    return EngineFactory.geometryEngine;
  }

  static getEngineType() {
    return EngineFactory.engineType;
  }
}

export default EngineFactory;