import React from "react";

interface FacadeContextMenuProps {
  x: number;
  y: number;
  visible: boolean;
  facadeName: string;
  onProperties: () => void;
  onChangeMaterial: () => void;
  onClose: () => void;
}

export default function FacadeContextMenu({
  x,
  y,
  visible,
  facadeName,
  onProperties,
  onChangeMaterial,
  onClose,
}: FacadeContextMenuProps) {
  if (!visible) return null;

  console.log(facadeName)

  return (
    <div
      style={{
        position: "fixed",
        top: y,
        left: x,
        background: "#fff",
        border: "1px solid #ccc",
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        zIndex: 1000,
        minWidth: "200px",
        padding: "12px 0",
        borderRadius: "10px",
      }}
      onContextMenu={e => e.preventDefault()}
    >
      <div style={{ padding: "8px 16px", fontWeight: "bold", borderBottom: "1px solid #eee" }}>
        {facadeName}
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
        Propiedades
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
          color: "#888",
          cursor: "pointer",
        }}
        onClick={onClose}
      >
        Cerrar
      </button>
    </div>
  );
}