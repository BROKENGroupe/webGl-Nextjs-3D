import { useState } from 'react';
import { OpeningTemplate, OPENING_TEMPLATES } from '@/types/openings';

interface DraggableOpeningsPaletteProps {
  isVisible: boolean;
  onToggle: () => void;
  onStartDrag: (template: OpeningTemplate) => void;
}

// ✅ USAR TEMPLATES DEL ARCHIVO DE TIPOS
const PALETTE_TEMPLATES = Object.values(OPENING_TEMPLATES);

// ✅ Función helper para colores corregida
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
    
    // ✅ CORREGIDO: Crear drag image
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
        ${template.icon || '🏠'} ${template.name}
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
        
        {PALETTE_TEMPLATES.map((template) => {
          // ✅ EXTRAER VALORES ACÚSTICOS CORRECTAMENTE
          const stc = template.acousticProperties.soundTransmissionClass;
          const avgSTC = Math.round((stc.low + stc.mid + stc.high) / 3);
          
          return (
            <div
              key={template.id}
              draggable
              onDragStart={(e) => handleDragStart(e, template)}
              onDragEnd={handleDragEnd}
              className={`
                flex items-center space-x-3 p-3 rounded-lg cursor-move transition-all
                ${draggedItem?.id === template.id
                  ? 'bg-blue-100 border-2 border-blue-500 scale-105' 
                  : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent hover:border-gray-300'
                }
                hover:shadow-md active:scale-95
              `}
              style={{ 
                borderLeftColor: getBorderColor(template.type),
                borderLeftWidth: '4px'
              }}
            >
              <span className="text-2xl">{template.icon || '🏠'}</span>
              <div className="flex-1">
                <div className="font-medium text-gray-800">{template.name}</div>
                <div className="text-sm text-gray-500">
                  {template.width}m × {template.height}m
                </div>
                <div className="text-xs text-gray-400">
                  STC: {avgSTC}dB • €{template.cost}
                </div>
              </div>
              <div className="text-gray-400 text-sm">
                ⋮⋮
              </div>
            </div>
          );
        })}
        
        <div className="pt-3 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            💡 Arrastra un elemento a una pared para colocarlo
          </p>
        </div>
      </div>
    </>
  );
}