import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import React from "react";
import EditableHeader, { ElementType } from "./EditableHeader";
import { useWallsStore } from "../../store/wallsStore";

interface openFloorContextMenuProps {
  x: number;
  y: number;
  visible: boolean;
  facadeName: string;
  title?: string;
  onProperties: () => void;
  onChangeMaterial: () => void;
  onClose: () => void;
  onUpdateName?: (newName: string, elementType: ElementType) => void;
}

export default function openFloorContextMenu({
  x,
  y,
  visible,
  facadeName,
  title = "Piso",
  onProperties,
  onChangeMaterial,
  onClose,
  onUpdateName,
}: openFloorContextMenuProps) {
  if (!visible) return null;

  const { updateFloorByIndex, floors } = useWallsStore();

  // Obtener el título del piso por wallIndex (facadeName)
  const wall = floors.find((floor) => floor.floorIndex === Number(facadeName));
  const floorTitle = wall?.title || `Fachada ${facadeName + 1}`;

  const handleUpdateName = (newName: string, elementType: ElementType) => {
    onUpdateName?.(newName, elementType);
    updateFloorByIndex(0, { title: newName });
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
          title={floorTitle}
          elementType="floor"
          onUpdateName={handleUpdateName}
        />

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