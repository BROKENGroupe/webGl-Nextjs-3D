import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import React from "react";
import EditableHeader, { ElementType } from "./EditableHeader";
import { useOpeningDrag } from "../../hooks/useOpeningDrag";
import { useOpeningsStore } from "../../store/openingsStore";
import { useWallsStore } from "../../store/wallsStore";


interface openCellingContextMenuProps {
  x: number;
  y: number;
  visible: boolean;
  facadeName: string;
  title: string;
  onProperties: () => void;
  onChangeMaterial: () => void;
  onClose: () => void;
  onUpdateName?: (newName: string, elementType: ElementType) => void;
}

export default function openCellingContextMenu({
  x,
  y,
  visible,
  facadeName,
  title = "Techo",
  onProperties,
  onChangeMaterial,
  onClose,
  onUpdateName,
}: openCellingContextMenuProps) {
  if (!visible) return null;

const { updateCeiling, ceilings } = useWallsStore();

// Obtener el título de la pared por wallIndex (facadeName)
  const wall = ceilings.find((ceiling) => ceiling.ceilingIndex === Number(facadeName));
  const ceilingTitle = wall?.title || `Fachada ${facadeName + 1}`;

  const handleUpdateName = (newName: string, elementType: ElementType) => {
    onUpdateName?.(newName, elementType);
    updateCeiling(facadeName, { title: newName });
  };

  return (
    <Popover open={visible} onOpenChange={(open: boolean) => !open && onClose()}>
      <PopoverTrigger asChild>
        <div style={{ position: "fixed", top: y, left: x, width: 0, height: 0 }} />
      </PopoverTrigger>
      <PopoverContent
        side="right"
        align="start"
        style={{
          minWidth: "180px",
          background: "#fff",
          border: "1px solid #ccc",
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          borderRadius: "10px",
          padding: "12px 0",
          zIndex: 1000,
        }}
      >
        {/* Header editable */}
        <EditableHeader
          title={ceilingTitle}
           elementType="ceiling"
          onUpdateName={handleUpdateName}
        />

        {/* Opciones del menú */}
        <button
          style={{
            width: "100%",
            padding: "10px 16px",
            border: "none",
            background: "none",
            textAlign: "left",
            cursor: "pointer",
          }}
          onClick={() => {
            onChangeMaterial();
            onClose();
          }}
        >
          Cambiar material
        </button>        
        <button
          style={{
            width: "100%",
            padding: "10px 16px",
            border: "none",
            background: "none",
            textAlign: "left",
            cursor: "pointer",
          }}
          onClick={() => {
            onProperties();
            onClose();
          }}
        >
          Propiedades
        </button>       
      </PopoverContent>
    </Popover>
  );
}