// dragOpenings.ts
// Lógica separada para drag-and-drop de openings (puertas y ventanas)

import { AcousticMaterial } from "@/modules/editor/types/AcousticMaterial";
import { ElementType } from "../../types/walls";


export function getBorderColor(type: string): string {
  const colors: Record<string, string> = {
    [ElementType.Door]: '#8B4513',
    [ElementType.Window]: '#87CEEB',
    [ElementType.Ceiling]: '#CD853F'
  };
  return colors[type] ?? '#6B7280';
}

function getDragIcon(type: string): string {
  switch (type) {
    case ElementType.Door:
      return "🚪";
    case ElementType.Window:
      return "🪟";
    case ElementType.Ceiling:
      return "⬜";
    case ElementType.Floor:
      return "⬛";
    case ElementType.Wall:
      return "🧱";
    default:
      return "❓";
  }
}

export function handleOpeningDragStart(
  e: React.DragEvent,
  template: AcousticMaterial,
  onStartDrag?: (template: AcousticMaterial) => void,
  setDraggedItem?: (item: AcousticMaterial) => void
) {
  if (setDraggedItem) setDraggedItem(template);
  if (onStartDrag) onStartDrag(template);

  // Imagen personalizada mejorada según tipo
  const dragImage = document.createElement('div');
  dragImage.innerHTML = `
    <div style="
      display: flex;
      align-items: center;
      gap: 10px;
      background: white;
      border: 2px solid ${getBorderColor(template.type)};
      color: #222;
      padding: 10px 18px;
      border-radius: 12px;
      font-size: 16px;
      font-weight: 600;
      box-shadow: 0 6px 18px rgba(0,0,0,0.18);
      pointer-events: none;
      font-family: system-ui;
      white-space: nowrap;
      min-width: 120px;
    ">
      <span style="
        font-size: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        background: ${getBorderColor(template.type)};
        color: white;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.10);
      ">
        ${getDragIcon(template.type)}
      </span>
      <span>
        ${template.descriptor.charAt(0).toUpperCase() + template.descriptor.slice(1)}
      </span>
    </div>
  `;
  document.body.appendChild(dragImage);
  e.dataTransfer.setDragImage(dragImage, 70, 30);
  setTimeout(() => {
    if (document.body.contains(dragImage)) document.body.removeChild(dragImage);
  }, 0);
  e.dataTransfer.setData('application/json', JSON.stringify(template));
  e.dataTransfer.effectAllowed = 'copy';
}

export function handleOpeningDragEnd(setDraggedItem?: (item: null) => void) {
  if (setDraggedItem) setDraggedItem(null);
}
