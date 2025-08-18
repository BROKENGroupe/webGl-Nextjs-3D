// dragOpenings.ts
// Lógica separada para drag-and-drop de openings (puertas y ventanas)

import { AcousticMaterial } from "@/types/AcousticMaterial";


export function getBorderColor(type: string): string {
  const colors: Record<string, string> = {
    'door': '#8B4513',
    'double-door': '#A0522D',
    'window': '#87CEEB',
    'sliding-door': '#CD853F'
  };
  return colors[type] ?? '#6B7280';
}

export function handleOpeningDragStart(e: React.DragEvent, template: AcousticMaterial, onStartDrag?: (template: AcousticMaterial) => void, setDraggedItem?: (item: AcousticMaterial) => void) {
  if (setDraggedItem) setDraggedItem(template);
  if (onStartDrag) onStartDrag(template);
  // Imagen personalizada
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
      white-space: nowrap;">
      ${template?.imageRef || '🏠'} ${template.type}
    </div>
  `;
  document.body.appendChild(dragImage);
  e.dataTransfer.setDragImage(dragImage, 50, 20);
  setTimeout(() => {
    if (document.body.contains(dragImage)) document.body.removeChild(dragImage);
  }, 0);
  e.dataTransfer.setData('application/json', JSON.stringify(template));
  e.dataTransfer.effectAllowed = 'copy';
}

export function handleOpeningDragEnd(setDraggedItem?: (item: null) => void) {
  if (setDraggedItem) setDraggedItem(null);
}
