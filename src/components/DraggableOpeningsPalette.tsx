import { useState, useRef } from 'react';
import { OpeningTemplate } from '../types/openings';

const OPENING_TEMPLATES: OpeningTemplate[] = [
  {
    type: 'door',
    name: 'Puerta Simple',
    defaultWidth: 0.9,
    defaultHeight: 2.1,
    defaultBottomOffset: 0,
    icon: '🚪',
    color: '#8B4513'
  },
  {
    type: 'double-door',
    name: 'Puerta Doble',
    defaultWidth: 1.6,
    defaultHeight: 2.1,
    defaultBottomOffset: 0,
    icon: '🚪🚪',
    color: '#A0522D'
  },
  {
    type: 'window',
    name: 'Ventana',
    defaultWidth: 1.2,
    defaultHeight: 1.0,
    defaultBottomOffset: 1.0,
    icon: '🪟',
    color: '#87CEEB'
  },
  {
    type: 'sliding-door',
    name: 'Puerta Corrediza',
    defaultWidth: 2.4,
    defaultHeight: 2.1,
    defaultBottomOffset: 0,
    icon: '🎚️',
    color: '#CD853F'
  }
];

interface DraggableOpeningsPaletteProps {
  isVisible: boolean;
  onToggle: () => void;
  onStartDrag: (template: OpeningTemplate) => void;
}

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
    
    // Crear imagen de drag personalizada
    const dragImage = document.createElement('div');
    dragImage.innerHTML = `
      <div style="
        background: ${template.color}; 
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
    
    // Limpiar después del drag
    setTimeout(() => {
      if (document.body.contains(dragImage)) {
        document.body.removeChild(dragImage);
      }
    }, 0);
    
    // Configurar datos del drag
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
            key={template.type}
            draggable
            onDragStart={(e) => handleDragStart(e, template)}
            onDragEnd={handleDragEnd}
            className={`
              flex items-center space-x-3 p-3 rounded-lg cursor-move transition-all
              ${draggedItem?.type === template.type 
                ? 'bg-blue-100 border-2 border-blue-500 scale-105' 
                : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent hover:border-gray-300'
              }
              hover:shadow-md active:scale-95
            `}
            style={{ 
              borderLeftColor: template.color,
              borderLeftWidth: '4px'
            }}
          >
            <span className="text-2xl">{template.icon}</span>
            <div className="flex-1">
              <div className="font-medium text-gray-800">{template.name}</div>
              <div className="text-sm text-gray-500">
                {template.defaultWidth}m × {template.defaultHeight}m
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

      {/* Overlay para drag feedback */}
      {draggedItem && (
        <div className="fixed inset-0 bg-blue-500 bg-opacity-10 pointer-events-none z-30">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg">
              📍 Suelta sobre una pared para colocar {draggedItem.name}
            </div>
          </div>
        </div>
      )}
    </>
  );
}