import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import React from "react";
import EditableHeader, { ElementType } from "./EditableHeader";
import { useWallsStore } from "../../store/wallsStore";

interface FacadeContextMenuProps {
  x: number;
  y: number;
  visible: boolean;
  facadeName: number;
  title: string;
  onProperties: () => void;
  onChangeMaterial: () => void;
  onClose: () => void;
  onUpdateName?: (newName: string, elementType: ElementType) => void;
}

export default function FacadeContextMenu({
  x,
  y,
  visible,
  facadeName,
  title,
  onProperties,
  onChangeMaterial,
  onClose,
  onUpdateName,
}: FacadeContextMenuProps) {
  if (!visible) return null;

  const { updateWallByIndex, walls } = useWallsStore();

  // Obtener el título de la pared por wallIndex (facadeName)
  const wall = walls.find((wall) => wall.wallIndex === facadeName);
  const wallTitle = wall?.title || `Fachada ${facadeName + 1}`;

  const handleUpdateName = (newName: string, elementType: ElementType) => {
    onUpdateName?.(newName, elementType);
    updateWallByIndex(facadeName, { title: newName });
  };

  return (
    <Popover
      open={visible}
      onOpenChange={(open: boolean) => !open && onClose()}
    >
      <PopoverTrigger asChild>
        <div
          style={{ position: "fixed", top: y, left: x, width: 0, height: 0 }}
        />
      </PopoverTrigger>
      <PopoverContent
        side="right"
        align="start"
        style={{
          minWidth: "220px",
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
          title={wallTitle}
          elementType="wall"
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
