import { CheckIcon } from "lucide-react";
import React, { useState } from "react";

interface EditableHeaderLineProps {
  name: string;
  onUpdateName: (newName: string) => void;
}

export default function EditableHeaderLine({ name, onUpdateName }: EditableHeaderLineProps) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(name);

  React.useEffect(() => {
    setValue(name);
  }, [name]);

  const handleBlur = () => {
    setEditing(false);
    if (value !== name) {
      onUpdateName(value.trim());
    }
  };

  const handleCheck = () => {
    setEditing(false);
    if (value !== name) {
      onUpdateName(value.trim());
    }
  };

  return (
    <div style={{ marginBottom: 8 }}>    
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {editing ? (
          <>
            <input
              type="text"
              value={value}
              autoFocus
              onChange={(e) => setValue(e.target.value)}
              onBlur={handleBlur}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleCheck();
                }
              }}
              style={{
                width: "100%",
                padding: "6px 10px",
                borderRadius: 6,
                border: "1px solid #ccc",
                fontSize: 15,
                fontWeight: 600,
              }}
            />
            <button
              type="button"
              onClick={handleCheck}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: 20,
                color: "#10b981",
                padding: 0,
                marginLeft: 4,
              }}
              title="Guardar nombre"
            >
               <CheckIcon className="w-4 h-4" />
            </button>
          </>
        ) : (
          <div
            style={{
              fontSize: 16,
              fontWeight: 600,
              cursor: "pointer",
              padding: "6px 10px",
              borderRadius: 6,
              border: "1px solid transparent",
              background: "#f8fafc",
              width: "100%",
            }}
            onClick={() => setEditing(true)}
            title="Editar nombre"
          >
            {name || "Sin nombre"}
          </div>
        )}
      </div>
    </div>
  );
}