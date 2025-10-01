import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import React from "react";
import EditableHeader, { ElementType } from "./EditableHeader";
import { useOpeningsStore } from "../../store/openingsStore";

interface OpeningContextMenuProps {
  x: number;
  y: number;
  visible: boolean;
  openingId: string;
  title: string;
  onProperties: () => void;
  onChangeMaterial: () => void;
  onClose: () => void;
  onUpdateName?: (newName: string, elementType: ElementType) => void;
  onUpdateOpening?: (openingId: string, newTitle: string) => void;
}

export default function OpeningContextMenu({
  x,
  y,
  visible,
  openingId,
  title,
  onProperties,
  onChangeMaterial,
  onClose,
  onUpdateName,
  onUpdateOpening,
}: OpeningContextMenuProps) {
  if (!visible) return null;

  const { updateOpening, openings, removeOpening } = useOpeningsStore();

  // Obtener el título de la abertura por openingId
  const opening = openings.find((opening) => opening.id === openingId);
  const openingTitle = opening?.title || `Abertura ${openingId}`;

  const handleUpdateName = (newName: string, elementType: ElementType) => {
    // Llamar al callback general
    onUpdateName?.(newName, elementType);

    // Llamar a la función específica del storage para actualizar la abertura
    onUpdateOpening?.(openingId, newName);
    updateOpening(openingId, { title: newName });
  };

  const handleDelete = () => {
    removeOpening(openingId);
    onClose();
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
          title={openingTitle}
          elementType="opening"
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
            handleDelete();
            onClose();
          }}
        >
          Eliminar
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
