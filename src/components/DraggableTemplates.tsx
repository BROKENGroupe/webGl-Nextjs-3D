import React, { useState } from 'react';
import { OpeningTemplate } from '../types/openings';

interface DraggableTemplatesProps {
  onDragStart: (template: OpeningTemplate) => void;
  onDragEnd: () => void;
}

export function DraggableTemplates({ onDragStart, onDragEnd }: DraggableTemplatesProps) {
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  // const templates: OpeningTemplate[] = [
  //   {
  //     id: 'door-standard',
  //     type: 'door',
  //     name: 'Puerta Estándar',
  //     width: 0.9,
  //     height: 2.1,
  //     bottomOffset: 0,
  //     icon: '🚪'
  //   },
  //   {
  //     id: 'door-double',
  //     type: 'double-door', 
  //     name: 'Puerta Doble',
  //     width: 1.6,
  //     height: 2.1,
  //     bottomOffset: 0,
  //     icon: '🚪🚪'
  //   },
  //   {
  //     id: 'window-standard',
  //     type: 'window',
  //     name: 'Ventana Estándar',
  //     width: 1.2,
  //     height: 1.2,
  //     bottomOffset: 1.0,
  //     icon: '🪟'
  //   },
  //   {
  //     id: 'window-large',
  //     type: 'window',
  //     name: 'Ventana Grande',
  //     width: 2.0,
  //     height: 1.5,
  //     bottomOffset: 0.8,
  //     icon: '🪟+'
  //   }
  // ];

  const handleDragStart = (e: React.DragEvent, template: OpeningTemplate) => {
    console.log('🎯 Iniciando drag:', template.name);
    setDraggedItem(template.id);
    onDragStart(template);
    
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('application/json', JSON.stringify(template));
  };

  const handleDragEnd = () => {
    console.log('🎯 Finalizando drag');
    setDraggedItem(null);
    onDragEnd();
  };

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      width: '280px',
      background: 'white',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      padding: '16px',
      zIndex: 1000,
      fontFamily: 'Arial, sans-serif'
    }}>
      <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: 600 }}>
        🏗️ Aberturas
      </h3>
      
      {/* <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {templates.map((template) => (
          <div
            key={template.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '12px',
              background: draggedItem === template.id ? '#f0f0f0' : '#f8f9fa',
              border: '2px solid #e9ecef',
              borderRadius: '6px',
              cursor: 'grab',
              transition: 'all 0.2s ease',
              opacity: draggedItem === template.id ? 0.5 : 1
            }}
            draggable
            onDragStart={(e) => handleDragStart(e, template)}
            onDragEnd={handleDragEnd}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#e8f5e8';
              e.currentTarget.style.borderColor = '#4CAF50';
            }}
            onMouseLeave={(e) => {
              if (draggedItem !== template.id) {
                e.currentTarget.style.background = '#f8f9fa';
                e.currentTarget.style.borderColor = '#e9ecef';
              }
            }}
          >
            <div style={{ fontSize: '24px', marginRight: '12px', minWidth: '30px' }}>
              {template.icon}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 500, fontSize: '14px', marginBottom: '2px' }}>
                {template.name}
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                {template.width}m × {template.height}m
              </div>
            </div>
          </div>
        ))}
      </div> */}
    </div>
  );
}