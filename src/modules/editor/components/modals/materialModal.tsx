import React from "react";

interface MaterialModalProps {
  visible: boolean;
  onSelect: (materialId: string) => void;
  onClose: () => void;
}

const materials = [
  { id: "mat1", name: "Ladrillo" },
  { id: "mat2", name: "Concreto" },
  { id: "mat3", name: "Vidrio" },
];

export default function MaterialModal({ visible, onSelect, onClose }: MaterialModalProps) {
  const [query, setQuery] = React.useState("");
  const filtered = materials.filter(m => m.name.toLowerCase().includes(query.toLowerCase()));

  if (!visible) return null;
  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h2>Selecciona un material</h2>
        <input
          type="text"
          placeholder="Buscar material..."
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        <ul>
          {filtered.map(mat => (
            <li key={mat.id}>
              <button onClick={() => onSelect(mat.id)}>{mat.name}</button>
            </li>
          ))}
        </ul>
        <button onClick={onClose}>Cerrar</button>
      </div>
    </div>
  );
}