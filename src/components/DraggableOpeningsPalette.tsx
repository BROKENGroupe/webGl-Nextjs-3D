import { useState, useRef } from 'react';
import { OpeningTemplate } from '../types/openings';

const OPENING_TEMPLATES: OpeningTemplate[] = [
  {
    id: 'door-standard',
    type: 'door',
    name: 'Puerta Simple',
    width: 0.9,
    height: 2.1,
    bottomOffset: 0,
    icon: '🚪',
    // ✅ PROPIEDADES ACÚSTICAS REALISTAS
    acousticProperties: {
      // Puerta de madera maciza estándar (35mm)
      soundTransmissionClass: 28,        // STC rating
      soundTransmission: 0.16,           // 16% del sonido pasa (cerrada)
      soundTransmissionOpen: 0.95,       // 95% del sonido pasa (abierta)
      absorption: 0.15,                  // Absorción acústica de madera
      reflection: 0.69,                  // Reflexión acústica
      materialDensity: 600,              // kg/m³ - Densidad madera de pino
      thickness: 0.035,                  // 35mm grosor estándar
      airGapSealing: 0.7,                // 70% sellado (juntas normales)
      frequencyResponse: {
        low: 0.20,      // 125-250 Hz (graves) - peor aislamiento
        mid: 0.16,      // 500-1000 Hz (medios) - aislamiento nominal
        high: 0.12      // 2000-4000 Hz (agudos) - mejor aislamiento
      }
    },
    // ✅ PROPIEDADES FÍSICAS DEL MATERIAL
    materialProperties: {
      type: 'solid_wood',
      woodType: 'pine',                  // Tipo de madera
      finish: 'painted',                 // Acabado
      hardware: 'standard_hinges',       // Herrajes estándar
      weatherSealing: 'basic',           // Sellado básico
      glassPercentage: 0,                // Sin vidrio
      panelConstruction: 'solid'         // Construcción sólida
    },
    // ✅ COEFICIENTES POR CONDICIONES
    performanceByCondition: {
      closed_sealed: {
        transmissionLoss: 28,            // dB de pérdida de transmisión
        soundTransmission: 0.16,
        description: 'Puerta cerrada con sellado normal'
      },
      closed_unsealed: {
        transmissionLoss: 22,            // Peor rendimiento sin sellar
        soundTransmission: 0.25,
        description: 'Puerta cerrada sin sellado'
      },
      partially_open: {
        transmissionLoss: 8,             // Muy poco aislamiento
        soundTransmission: 0.75,
        description: 'Puerta entreabierta'
      },
      fully_open: {
        transmissionLoss: 0,             // Sin aislamiento
        soundTransmission: 0.95,
        description: 'Puerta completamente abierta'
      }
    }
  },
  {
    id: 'door-double',
    type: 'double-door',
    name: 'Puerta Doble',
    width: 1.6,
    height: 2.1,
    bottomOffset: 0,
    icon: '🚪🚪',
    // ✅ PROPIEDADES ACÚSTICAS - PUERTA DOBLE
    acousticProperties: {
      // Puerta doble con sellado central
      soundTransmissionClass: 32,        // Mejor STC por doble hoja
      soundTransmission: 0.10,           // Mejor aislamiento que simple
      soundTransmissionOpen: 0.98,       // Casi todo el sonido pasa abierta
      absorption: 0.18,                  // Más superficie = más absorción
      reflection: 0.72,                  // Mejor reflexión
      materialDensity: 600,              // kg/m³
      thickness: 0.040,                  // 40mm grosor (más robusta)
      airGapSealing: 0.8,                // Mejor sellado con juntas centrales
      frequencyResponse: {
        low: 0.15,      // Mejor en graves por masa adicional
        mid: 0.10,      // Excelente en medios
        high: 0.08      // Muy bueno en agudos
      }
    },
    materialProperties: {
      type: 'solid_wood',
      woodType: 'oak',                   // Madera más densa
      finish: 'stained',
      hardware: 'heavy_duty_hinges',     // Herrajes reforzados
      weatherSealing: 'enhanced',        // Sellado mejorado
      glassPercentage: 0,
      panelConstruction: 'double_panel'  // Doble panel
    },
    performanceByCondition: {
      closed_sealed: {
        transmissionLoss: 32,
        soundTransmission: 0.10,
        description: 'Puerta doble cerrada con sellado mejorado'
      },
      closed_unsealed: {
        transmissionLoss: 26,
        soundTransmission: 0.18,
        description: 'Puerta doble cerrada sin sellado'
      },
      partially_open: {
        transmissionLoss: 5,
        soundTransmission: 0.80,
        description: 'Una hoja entreabierta'
      },
      fully_open: {
        transmissionLoss: 0,
        soundTransmission: 0.98,
        description: 'Ambas hojas abiertas'
      }
    }
  },
  {
    id: 'window-standard',
    type: 'window',
    name: 'Ventana',
    width: 1.2,
    height: 1.0,
    bottomOffset: 1.0,
    icon: '🪟',
    // ✅ PROPIEDADES ACÚSTICAS - VENTANA SIMPLE
    acousticProperties: {
      // Ventana de vidrio simple con marco de aluminio
      soundTransmissionClass: 26,        // STC típico ventana simple
      soundTransmission: 0.25,           // 25% del sonido pasa (cerrada)
      soundTransmissionOpen: 1.0,        // Todo el sonido pasa (abierta)
      absorption: 0.05,                  // Vidrio absorbe muy poco
      reflection: 0.70,                  // Alta reflexión del vidrio
      materialDensity: 2500,             // kg/m³ - Densidad del vidrio
      thickness: 0.006,                  // 6mm vidrio simple
      airGapSealing: 0.6,                // Sellado moderado (marco aluminio)
      frequencyResponse: {
        low: 0.35,      // Muy malo en graves (coincidencia)
        mid: 0.25,      // Aislamiento nominal
        high: 0.20      // Mejor en agudos
      }
    },
    materialProperties: {
      type: 'single_glazing',
      glassType: 'float_glass',          // Vidrio flotado
      glassThickness: 6,                 // mm
      frameType: 'aluminum',             // Marco de aluminio
      weatherSealing: 'standard',        // Sellado estándar
      glassPercentage: 85,               // 85% vidrio, 15% marco
      coatingType: 'none',               // Sin recubrimiento
      gasType: 'air'                     // Aire (no gas inerte)
    },
    performanceByCondition: {
      closed_sealed: {
        transmissionLoss: 26,
        soundTransmission: 0.25,
        description: 'Ventana cerrada herméticamente'
      },
      closed_unsealed: {
        transmissionLoss: 20,
        soundTransmission: 0.40,
        description: 'Ventana cerrada con infiltraciones'
      },
      partially_open: {
        transmissionLoss: 3,
        soundTransmission: 0.90,
        description: 'Ventana entreabierta'
      },
      fully_open: {
        transmissionLoss: 0,
        soundTransmission: 1.0,
        description: 'Ventana completamente abierta'
      }
    }
  },
  {
    id: 'sliding-door',
    type: 'sliding-door',
    name: 'Puerta Corrediza',
    width: 2.4,
    height: 2.1,
    bottomOffset: 0,
    icon: '🎚️',
    // ✅ PROPIEDADES ACÚSTICAS - PUERTA CORREDIZA
    acousticProperties: {
      // Puerta corrediza con vidrio templado y marco de aluminio
      soundTransmissionClass: 30,        // STC bueno para corrediza
      soundTransmission: 0.12,           // Buen aislamiento cerrada
      soundTransmissionOpen: 0.98,       // Casi todo pasa abierta
      absorption: 0.08,                  // Absorción mixta (vidrio + marco)
      reflection: 0.80,                  // Alta reflexión
      materialDensity: 2400,             // kg/m³ - Vidrio templado
      thickness: 0.008,                  // 8mm vidrio templado
      airGapSealing: 0.85,               // Excelente sellado con rieles
      frequencyResponse: {
        low: 0.18,      // Bueno en graves por masa del vidrio
        mid: 0.12,      // Excelente en medios
        high: 0.10      // Muy bueno en agudos
      }
    },
    materialProperties: {
      type: 'sliding_glass',
      glassType: 'tempered_glass',       // Vidrio templado
      glassThickness: 8,                 // mm - más grueso
      frameType: 'aluminum_thermal',     // Aluminio con rotura térmica
      weatherSealing: 'premium',         // Sellado premium
      glassPercentage: 75,               // 75% vidrio, 25% marco
      coatingType: 'low_e',              // Recubrimiento bajo emisivo
      gasType: 'air',                    // Aire
      trackSystem: 'dual_track'          // Sistema de doble riel
    },
    performanceByCondition: {
      closed_sealed: {
        transmissionLoss: 30,
        soundTransmission: 0.12,
        description: 'Puerta corrediza cerrada herméticamente'
      },
      closed_unsealed: {
        transmissionLoss: 24,
        soundTransmission: 0.20,
        description: 'Puerta corrediza con desgaste en rieles'
      },
      partially_open: {
        transmissionLoss: 6,
        soundTransmission: 0.85,
        description: 'Puerta corrediza parcialmente abierta'
      },
      fully_open: {
        transmissionLoss: 0,
        soundTransmission: 0.98,
        description: 'Puerta corrediza completamente abierta'
      }
    }
  },
  // ✅ NUEVOS TEMPLATES CON PROPIEDADES ACÚSTICAS AVANZADAS
  {
    id: 'window-double-glazed',
    type: 'window',
    name: 'Ventana Doble Vidrio',
    width: 1.2,
    height: 1.0,
    bottomOffset: 1.0,
    icon: '🪟🪟',
    acousticProperties: {
      // Ventana de doble acristalamiento con gas argón
      soundTransmissionClass: 35,        // Excelente STC
      soundTransmission: 0.08,           // Solo 8% del sonido pasa
      soundTransmissionOpen: 1.0,
      absorption: 0.10,                  // Algo de absorción entre cristales
      reflection: 0.82,                  // Muy alta reflexión
      materialDensity: 2500,
      thickness: 0.022,                  // 6mm + 10mm cámara + 6mm
      airGapSealing: 0.95,               // Excelente sellado
      frequencyResponse: {
        low: 0.12,      // Excelente en graves
        mid: 0.08,      // Óptimo en medios
        high: 0.06      // Excepcional en agudos
      }
    },
    materialProperties: {
      type: 'double_glazing',
      glassType: 'laminated_glass',      // Vidrio laminado
      glassThickness: 6,                 // mm cada cristal
      airGap: 10,                        // mm entre cristales
      frameType: 'upvc_thermal',         // PVC con rotura térmica
      weatherSealing: 'premium',
      glassPercentage: 80,
      coatingType: 'low_e_double',       // Doble recubrimiento bajo E
      gasType: 'argon'                   // Gas argón
    },
    performanceByCondition: {
      closed_sealed: {
        transmissionLoss: 35,
        soundTransmission: 0.08,
        description: 'Ventana doble acristalamiento hermética'
      },
      closed_unsealed: {
        transmissionLoss: 28,
        soundTransmission: 0.15,
        description: 'Ventana doble cristal con infiltraciones menores'
      },
      partially_open: {
        transmissionLoss: 3,
        soundTransmission: 0.90,
        description: 'Ventana doble cristal entreabierta'
      },
      fully_open: {
        transmissionLoss: 0,
        soundTransmission: 1.0,
        description: 'Ventana doble cristal abierta'
      }
    }
  },
  {
    id: 'door-acoustic',
    type: 'door',
    name: 'Puerta Acústica',
    width: 0.9,
    height: 2.1,
    bottomOffset: 0,
    icon: '🔇🚪',
    acousticProperties: {
      // Puerta específicamente diseñada para aislamiento acústico
      soundTransmissionClass: 45,        // STC muy alto
      soundTransmission: 0.03,           // Solo 3% del sonido pasa
      soundTransmissionOpen: 0.95,
      absorption: 0.35,                  // Alta absorción (núcleo especial)
      reflection: 0.62,                  // Absorción reduce reflexión
      materialDensity: 800,              // kg/m³ - Más densa
      thickness: 0.055,                  // 55mm grosor mayor
      airGapSealing: 0.98,               // Sellado casi perfecto
      frequencyResponse: {
        low: 0.05,      // Excelente en todas las frecuencias
        mid: 0.03,
        high: 0.02
      }
    },
    materialProperties: {
      type: 'acoustic_door',
      woodType: 'engineered_composite',   // Material compuesto
      coreType: 'mineral_wool',          // Núcleo de lana mineral
      finish: 'acoustic_coating',        // Recubrimiento acústico
      hardware: 'acoustic_seals',        // Sellados acústicos especiales
      weatherSealing: 'acoustic_premium', // Sellado acústico premium
      glassPercentage: 0,
      panelConstruction: 'multi_layer'    // Construcción multicapa
    },
    performanceByCondition: {
      closed_sealed: {
        transmissionLoss: 45,
        soundTransmission: 0.03,
        description: 'Puerta acústica con todos los sellados'
      },
      closed_unsealed: {
        transmissionLoss: 38,
        soundTransmission: 0.06,
        description: 'Puerta acústica sin sellado perimetral'
      },
      partially_open: {
        transmissionLoss: 12,
        soundTransmission: 0.65,
        description: 'Puerta acústica entreabierta (pierde eficacia)'
      },
      fully_open: {
        transmissionLoss: 0,
        soundTransmission: 0.95,
        description: 'Puerta acústica abierta'
      }
    }
  }
];

interface DraggableOpeningsPaletteProps {
  isVisible: boolean;
  onToggle: () => void;
  onStartDrag: (template: OpeningTemplate) => void;
}

// Reemplazar las funciones handleDragStart y el mapeo:

// ✅ Función helper para colores
const getBorderColor = (type: string): string => {
  const colors = {
    'door': '#8B4513',
    'double-door': '#A0522D', 
    'window': '#87CEEB',
    'sliding-door': '#CD853F'
  };
  return colors[type as keyof typeof colors] || '#6B7280';
};

export function DraggableOpeningsPalette({ 
  isVisible, 
  onToggle, 
  onStartDrag 
}: DraggableOpeningsPaletteProps) {
  const [draggedItem, setDraggedItem] = useState<OpeningTemplate | null>(null);

  const handleDragStart = (e: React.DragEvent, template: OpeningTemplate) => {
    console.log('🎯 Drag start:', template.name);
    setDraggedItem(template);
    onStartDrag(template);
    
    // ✅ CORREGIDO: Usar getBorderColor en lugar de template.color
    const dragImage = document.createElement('div');
    dragImage.innerHTML = `
      <div style="
        background: ${getBorderColor(template.type)}; 
        color: white; 
        padding: 8px 12px; 
        border-radius: 8px; 
        font-size: 14px; 
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        pointer-events: none;
        font-family: system-ui;
      ">
        ${template.icon} ${template.name}
      </div>
    `;
    
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, 50, 20);
    
    setTimeout(() => {
      if (document.body.contains(dragImage)) {
        document.body.removeChild(dragImage);
      }
    }, 0);
    
    e.dataTransfer.setData('application/json', JSON.stringify(template));
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDragEnd = () => {
    console.log('🔚 Drag end');
    setDraggedItem(null);
  };

  if (!isVisible) {
    return (
      <button 
        onClick={onToggle}
        className="fixed top-4 left-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-blue-700 transition-colors z-50"
      >
        🏠 Puertas y Ventanas
      </button>
    );
  }

  return (
    <>
      {/* Botón para cerrar */}
      <button 
        onClick={onToggle}
        className="fixed top-4 left-4 bg-gray-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-gray-700 transition-colors z-50"
      >
        ❌ Cerrar Paleta
      </button>

      {/* Paleta de elementos */}
      <div className="fixed top-16 left-4 bg-white rounded-lg shadow-xl p-4 space-y-3 z-40 max-w-xs">
        <h3 className="font-bold text-lg text-gray-800 mb-4">
          🏠 Arrastra para colocar
        </h3>
        
        {OPENING_TEMPLATES.map((template) => (
          <div
            key={template.id} // ✅ CORREGIDO: usar template.id en lugar de template.type
            draggable
            onDragStart={(e) => handleDragStart(e, template)}
            onDragEnd={handleDragEnd}
            className={`
              flex items-center space-x-3 p-3 rounded-lg cursor-move transition-all
              ${draggedItem?.id === template.id  // ✅ CORREGIDO: comparar por id
                ? 'bg-blue-100 border-2 border-blue-500 scale-105' 
                : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent hover:border-gray-300'
              }
              hover:shadow-md active:scale-95
            `}
            style={{ 
              borderLeftColor: getBorderColor(template.type), // ✅ CORREGIDO: usar función helper
              borderLeftWidth: '4px'
            }}
          >
            <span className="text-2xl">{template.icon}</span>
            <div className="flex-1">
              <div className="font-medium text-gray-800">{template.name}</div>
              <div className="text-sm text-gray-500">
                {template.width}m × {template.height}m {/* ✅ CORREGIDO: usar width/height */}
              </div>
            </div>
            <div className="text-gray-400 text-sm">
              ⋮⋮
            </div>
          </div>
        ))}
        
        <div className="pt-3 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            💡 Arrastra un elemento a una pared para colocarlo
          </p>
        </div>
      </div>
    </>
  );
}