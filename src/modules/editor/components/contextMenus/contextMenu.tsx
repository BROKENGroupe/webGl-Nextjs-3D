"use client";
import React, { useEffect, useState } from "react";

interface ContextMenuProps {
  x: number;
  y: number;
  visible: boolean;
  onProperties: () => void;
  onChangeMaterial: () => void;
  onClose: () => void;
}

export default function ContextMenu({
  x, y, visible, onProperties, onChangeMaterial, onClose
}: ContextMenuProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient || !visible) return null;

  return (
    <div
      style={{
        position: "absolute",
        top: y,
        left: x,
        background: "#fff",
        border: "1px solid #ccc",
        zIndex: 1000,
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)"
      }}
      onContextMenu={e => e.preventDefault()}
    >
       <button onClick={onChangeMaterial}>Eliminar</button>
      <button onClick={onChangeMaterial}>Cambiar material</button>
      {/* <button onClick={onClose}>Cerrar</button> */}
      <button onClick={onProperties}>Propiedades</button>
    </div>
  );
}