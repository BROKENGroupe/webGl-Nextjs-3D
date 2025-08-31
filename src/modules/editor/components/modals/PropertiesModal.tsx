import React from "react";

interface PropertiesModalProps {
  visible: boolean;
  facadeId: string;
  onClose: () => void;
}

export default function PropertiesModal({ visible, facadeId, onClose }: PropertiesModalProps) {
  if (!visible) return null;
  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h2>Propiedades de la fachada</h2>
        {/* Aquí puedes mostrar o editar las propiedades */}
        <div>ID: {facadeId}</div>
        {/* ...otros campos */}
        <button onClick={onClose}>Cerrar</button>
      </div>
    </div>
  );
}