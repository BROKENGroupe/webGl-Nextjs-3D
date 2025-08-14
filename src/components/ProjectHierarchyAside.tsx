import React, { useState } from "react";

// Ejemplo de jerarquía de proyecto
const exampleFloors = [
  {
    id: "floor-1",
    name: "Planta Baja",
    walls: [
      {
        id: "wall-1",
        name: "Fachada Norte",
        elements: [
          { id: "door-1", type: "Puerta", name: "Puerta Principal" },
          { id: "window-1", type: "Ventana", name: "Ventana 1" },
        ],
      },
      {
        id: "wall-2",
        name: "Fachada Sur",
        elements: [],
      },
    ],
  },
  {
    id: "floor-2",
    name: "Planta Alta",
    walls: [
      {
        id: "wall-3",
        name: "Fachada Este",
        elements: [{ id: "window-2", type: "Ventana", name: "Ventana Balcón" }],
      },
    ],
  },
];

export function ProjectHierarchyAside({
  floors = exampleFloors,
  onSelectFloor,
  onSelectWall,
  onSelectElement,
}: {
  floors?: any[];
  onSelectFloor?: (floorId: string) => void;
  onSelectWall?: (wallId: string) => void;
  onSelectElement?: (elementId: string) => void;
}) {
  const [expandedFloors, setExpandedFloors] = useState<string[]>([]);
  const [expandedWalls, setExpandedWalls] = useState<string[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [visible, setVisible] = useState(true);

  const toggleFloor = (id: string) => {
    setExpandedFloors((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  const toggleWall = (id: string) => {
    setExpandedWalls((prev) =>
      prev.includes(id) ? prev.filter((w) => w !== id) : [...prev, id]
    );
  };

  return (
    <>
      {/* Botón flotante para expandir/cerrar */}
      <button
        className={`fixed left-2 top-4 z-50 bg-blue-600 text-white px-2 py-1 rounded shadow-lg transition-all ${
          visible ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
        style={{ minWidth: 32 }}
        onClick={() => setVisible(true)}
        aria-label="Abrir jerarquía"
      >
        ☰
      </button>
      <aside
        className={`fixed left-0 top-0 h-screen w-72 bg-white/95 shadow-lg border-r border-gray-200 z-40 overflow-y-auto transition-transform duration-300 ${
          visible ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ minWidth: 260 }}
      >
        <div className="flex items-center justify-between p-4 border-b font-bold text-lg text-gray-700">
          <span>Jerarquía del Proyecto</span>
          <button
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-2 py-1 rounded"
            onClick={() => setVisible(false)}
            aria-label="Cerrar jerarquía"
          >
            ✕
          </button>
        </div>
        <div className="p-2">
          <ul className="space-y-2">
            {floors.map((floor) => (
              <li key={floor.id}>
                <div
                  className={`flex items-center cursor-pointer px-2 py-1 rounded hover:bg-blue-50 ${
                    selectedId === floor.id ? "bg-blue-100 font-semibold" : ""
                  }`}
                  onClick={() => {
                    setSelectedId(floor.id);
                    onSelectFloor?.(floor.id);
                    toggleFloor(floor.id);
                  }}
                >
                  <span className="mr-2">
                    {expandedFloors.includes(floor.id) ? "▼" : "▶"}
                  </span>
                  🏢 {floor.name}
                </div>
                {expandedFloors.includes(floor.id) && (
                  <ul className="ml-6 space-y-1">
                    {floor.walls.map((wall: any) => (
                      <li key={wall.id}>
                        <div
                          className={`flex items-center cursor-pointer px-2 py-1 rounded hover:bg-green-50 ${
                            selectedId === wall.id ? "bg-green-100 font-semibold" : ""
                          }`}
                          onClick={() => {
                            setSelectedId(wall.id);
                            onSelectWall?.(wall.id);
                            toggleWall(wall.id);
                          }}
                        >
                          <span className="mr-2">
                            {expandedWalls.includes(wall.id) ? "▼" : "▶"}
                          </span>
                          🧱 {wall.name}
                        </div>
                        {expandedWalls.includes(wall.id) && (
                          <ul className="ml-6 space-y-1">
                            {wall.elements.length === 0 && (
                              <li className="text-gray-400 italic px-2">Sin elementos</li>
                            )}
                            {wall.elements.map((el: any) => (
                              <li
                                key={el.id}
                                className={`flex items-center cursor-pointer px-2 py-1 rounded hover:bg-yellow-50 ${
                                  selectedId === el.id ? "bg-yellow-100 font-semibold" : ""
                                }`}
                                onClick={() => {
                                  setSelectedId(el.id);
                                  onSelectElement?.(el.id);
                                }}
                              >
                                {el.type === "Puerta" ? "🚪" : "🪟"} {el.name}
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </>
  );
}

// En tu JSX:
// <ProjectHierarchyAside floors={exampleFloors} />