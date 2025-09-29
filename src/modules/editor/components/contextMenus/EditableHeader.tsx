import { CheckIcon, TrashIcon, EditIcon } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";

export type ElementType = 'wall' | 'opening' | 'ceiling' | 'floor' | 'facade';

interface EditableHeaderProps {
  title: string;
  elementType: ElementType;
  onUpdateName: (newName: string, elementType: ElementType) => void;
}

export default function EditableHeader({ 
  title, 
  elementType, 
  onUpdateName 
}: EditableHeaderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editableName, setEditableName] = useState(title);

  const handleSaveName = () => {
    onUpdateName(editableName, elementType);
    setIsEditing(false);
    toast.success("Nombre actualizado");
  };

  const handleCancelEdit = () => {
    setEditableName(title);
    setIsEditing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveName();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  return (
    <div style={{ padding: "8px 16px", borderBottom: "1px solid #eee" }}>
      {isEditing ? (
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={editableName}
            onChange={(e) => setEditableName(e.target.value)}
            onKeyDown={handleKeyPress}
            className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{ fontSize: "14px", fontWeight: "bold" }}
            autoFocus
          />
          <button
            onClick={handleSaveName}
            className="p-1 text-green-600 hover:bg-green-50 rounded"
            title="Guardar"
          >
            <CheckIcon className="w-4 h-4" />
          </button>
          <button
            onClick={handleCancelEdit}
            className="p-1 text-red-600 hover:bg-red-50 rounded"
            title="Cancelar"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <span style={{ fontWeight: "bold" }}>{editableName}</span>
          <button
            onClick={() => setIsEditing(true)}
            className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
            title="Editar nombre"
          >
            <EditIcon className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}