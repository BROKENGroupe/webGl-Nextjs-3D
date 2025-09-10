import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import React from "react";


interface FacadeContextMenuProps {
  x: number;
  y: number;
  visible: boolean;
  openingId: string;
  onProperties: () => void;
  onChangeMaterial: () => void;
  onClose: () => void;
}

export default function OpeningContextMenu({
  x,
  y,
  visible,
  openingId,
  onProperties,
  onChangeMaterial,
  onClose,
}: FacadeContextMenuProps) {
  if (!visible) return null;

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
        <div style={{ padding: "8px 16px", fontWeight: "bold", borderBottom: "1px solid #eee" }}>
          {openingId}
        </div>
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