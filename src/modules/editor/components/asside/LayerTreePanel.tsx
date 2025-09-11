import React, { useState } from "react";

import { MoreVertical, Wind, DoorOpen } from "lucide-react";
import { useOpeningsStore } from "@/modules/editor/store/openingsStore";
import { useWallsStore } from "@/modules/editor/store/wallsStore";
import { Switch } from "@/shared/ui/switch";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/shared/ui/accordion";
import { Badge } from "@/shared/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem } from "@/shared/ui/dropdown-menu";
import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";


interface LayerTreePanelProps {
  onSelect?: (type: "wall" | "opening" | "floor" | "ceiling", id: string) => void;
  onVisibilityChange?: (type: "wall" | "opening" | "floor" | "ceiling", id: string, visible: boolean) => void;
}

export const LayerTreePanel: React.FC<LayerTreePanelProps> = ({ onSelect, onVisibilityChange }) => {
  const openings = useOpeningsStore((state) => state.openings) || [];
  const walls = useWallsStore((state) => state.walls) || [];
  const floors = useWallsStore((state) => state.floors) || [];
  const ceilings = useWallsStore((state) => state.ceilings) || [];

  const expandedWalls = walls.map((wall: any, idx: number) => wall.id || `wall-${idx}`);

  const [wallSwitches, setWallSwitches] = useState<Record<string, boolean>>(
    () => Object.fromEntries(expandedWalls.map((id) => [id, true]))
  );
  const [openingSwitches, setOpeningSwitches] = useState<Record<string, boolean>>(
    () => {
      const allOpenings = openings.map((opening: any, oidx: number) => opening.id || `opening-${oidx}`);
      return Object.fromEntries(allOpenings.map((id) => [id, true]));
    }
  );

  // Estado para switches de piso y techo
  const [floorSwitches, setFloorSwitches] = useState<Record<string, boolean>>(
    () => Object.fromEntries(floors.map((floor, idx) => [floor.id || `floor-${idx}`, true]))
  );
  const [ceilingSwitches, setCeilingSwitches] = useState<Record<string, boolean>>(
    () => Object.fromEntries(ceilings.map((ceiling, idx) => [ceiling.id || `ceiling-${idx}`, true]))
  );

  const handleWallSwitch = (id: string, wallIndex: number) => {
    setWallSwitches((prev) => {
      const nextState = !prev[id];
      const next = { ...prev, [id]: nextState };
      onVisibilityChange?.("wall", id, nextState);

      setOpeningSwitches((prevOpenings) => {
        const updated = { ...prevOpenings };
        openings
          .filter((opening: any) => opening.wallIndex === wallIndex)
          .forEach((opening: any, oidx: number) => {
            const openingId = opening.id || `opening-${oidx}`;
            updated[openingId] = nextState;
            onVisibilityChange?.("opening", openingId, nextState);
          });
        return updated;
      });

      return next;
    });
  };

  const handleOpeningSwitch = (id: string, wallIndex: number) => {
    setOpeningSwitches((prev) => {
      const nextState = !prev[id];
      const next = { ...prev, [id]: nextState };
      onVisibilityChange?.("opening", id, nextState);

      const wallOpenings = openings.filter((opening: any) => opening.wallIndex === wallIndex);
      const allActive = wallOpenings.every((opening: any, oidx: number) => {
        const openingId = opening.id || `opening-${oidx}`;
        return openingId === id ? nextState : prev[openingId];
      });
      const allInactive = wallOpenings.every((opening: any, oidx: number) => {
        const openingId = opening.id || `opening-${oidx}`;
        return openingId === id ? !nextState : !prev[openingId];
      });

      setWallSwitches((prevWalls) => {
        const wallId = walls[wallIndex].id || `wall-${wallIndex}`;
        let updated = { ...prevWalls };
        if (allActive) {
          updated[wallId] = true;
          onVisibilityChange?.("wall", wallId, true);
        }
        if (allInactive) {
          updated[wallId] = false;
          onVisibilityChange?.("wall", wallId, false);
        }
        return updated;
      });

      return next;
    });
  };

  // Manejador para piso
  const handleFloorSwitch = (id: string) => {
    setFloorSwitches((prev) => {
      const nextState = !prev[id];
      const next = { ...prev, [id]: nextState };
      onVisibilityChange?.("floor", id, nextState);
      return next;
    });
  };

  // Manejador para techo
  const handleCeilingSwitch = (id: string) => {
    setCeilingSwitches((prev) => {
      const nextState = !prev[id];
      const next = { ...prev, [id]: nextState };
      onVisibilityChange?.("ceiling", id, nextState);
      return next;
    });
  };

  if (!walls.length && !floors.length && !ceilings.length) {
    return (
      <div className="text-gray-400 text-sm my-4">
        No hay datos de capas disponibles.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full my-2">
      <div className="text-[15px] font-semibold text-black flex items-center gap-2 mb-1">
        <span>Árbol de Capas</span>
        <Badge variant="outline" className="ml-2 bg-gray-100 text-black border-gray-300 text-[12px] font-medium">
          {walls.length} fachadas
        </Badge>
      </div>
      <div className="flex-1 overflow-y-auto pr-1">
        {/* Piso */}
        {floors.map((floor, idx) => {
          const floorId = floor.id || `floor-${idx}`;
          return (
            <div
              key={floorId}
              className="flex items-center gap-3 mb-2 px-2 py-1 rounded bg-gray-50 hover:bg-gray-100 transition-all min-h-[28px]"
            >
              <span className="flex items-center justify-center w-5 h-5 rounded bg-gray-100 border border-gray-300 shadow-sm">
                <span role="img" aria-label="floor" className="text-black text-[13px]">🟫</span>
              </span>
              <span className="text-[13px] text-black font-medium min-w-[70px]">
                Piso <span className="font-bold">{floor.template?.descriptor}</span>
              </span>
              <span className="text-[11px] text-gray-500 italic ml-2">
                Área: {floor.area ? floor.area.toFixed(2) : "N/A"} m²
              </span>
              <div className="flex items-center gap-1 ml-auto">
                <Switch
                  checked={!!floorSwitches[floorId]}
                  onCheckedChange={() => handleFloorSwitch(floorId)}
                  className="scale-90"
                />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="p-1 rounded hover:bg-gray-100 transition">
                      <MoreVertical size={13} />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem className="text-[12px]" onClick={() => alert(`Ver detalles de Piso ${floor.template?.descriptor}`)}>
                      Ver detalles
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-[12px]" onClick={() => alert(`Propiedades de Piso ${floor.template?.descriptor}`)}>
                      Propiedades
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          );
        })}

        {/* Techo */}
        {ceilings.map((ceiling, idx) => {
          const ceilingId = ceiling.id || `ceiling-${idx}`;
          return (
            <div
              key={ceilingId}
              className="flex items-center gap-3 mb-2 px-2 py-1 rounded bg-gray-50 hover:bg-gray-100 transition-all min-h-[28px]"
            >
              <span className="flex items-center justify-center w-5 h-5 rounded bg-gray-100 border border-gray-300 shadow-sm">
                <span role="img" aria-label="ceiling" className="text-black text-[13px]">⬛</span>
              </span>
              <span className="text-[13px] text-black font-medium min-w-[70px]">
                Techo <span className="font-bold">{ceiling.template?.descriptor}</span>
              </span>
              <span className="text-[11px] text-gray-500 italic ml-2">
                Área: {ceiling.area ? ceiling.area.toFixed(2) : "N/A"} m²
              </span>
              <div className="flex items-center gap-1 ml-auto">
                <Switch
                  checked={!!ceilingSwitches[ceilingId]}
                  onCheckedChange={() => handleCeilingSwitch(ceilingId)}
                  className="scale-90"
                />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="p-1 rounded hover:bg-gray-100 transition">
                      <MoreVertical size={13} />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem className="text-[12px]" onClick={() => alert(`Ver detalles de Techo ${ceiling.template?.descriptor}`)}>
                      Ver detalles
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-[12px]" onClick={() => alert(`Propiedades de Techo ${ceiling.template?.descriptor}`)}>
                      Propiedades
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          );
        })}

        {/* Fachadas y aberturas */}
        <Accordion type="multiple" defaultValue={expandedWalls}>
          {walls.map((wall: any, idx: number) => {
            const wallId = wall.id || `wall-${idx}`;
            const wallOpenings = openings.filter((opening: any) => opening.wallIndex === idx);
            return (
              <AccordionItem key={wallId} value={wallId}>
                <AccordionTrigger className="flex items-center gap-2 px-2 py-1 bg-gray-50 hover:bg-gray-100 rounded transition-all min-h-[32px]">
                  <span className="flex items-center gap-2">
                    <Badge variant="secondary" className="mr-1 text-lg px-1 py-1 bg-white border border-gray-300 shadow-sm">
                      <span className="text-[15px]">🧱</span>
                    </Badge>
                    <span className="text-[13px] font-medium text-black">
                      Fachada <span className="font-bold">{idx + 1} {wall.template?.descriptor || wall.descriptor}</span>
                    </span>
                  </span>
                  <span className="text-[11px] text-gray-500 italic ml-2">
                    Área: {wall.area ? wall.area.toFixed(2) : "N/A"} m²
                  </span>
                  <div className="flex items-center gap-1 ml-auto">
                    <Switch
                      checked={!!wallSwitches[wallId]}
                      onCheckedChange={() => handleWallSwitch(wallId, idx)}
                      className="scale-90"
                    />
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-1 rounded hover:bg-gray-100 transition">
                          <MoreVertical size={13} />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="text-[12px]" onClick={() => alert(`Ver detalles de Fachada ${idx + 1}`)}>
                          Ver detalles
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-[12px]" onClick={() => alert(`Propiedades de Fachada ${idx + 1}`)}>
                          Propiedades
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="ml-7 mt-1">
                    {wallOpenings.length > 0 ? (
                      wallOpenings.map((opening: any, oidx: number) => {
                        const openingId = opening.id || `opening-${oidx}`;
                        const isWindow = opening.type === "window";
                        return (
                          <div
                            key={openingId}
                            className="flex items-center gap-3 mb-2 px-2 py-1 rounded hover:bg-gray-50 transition-all min-h-[24px]"
                          >
                            <span className="flex items-center justify-center w-5 h-5 rounded bg-gray-100 border border-gray-300 shadow-sm">
                              {isWindow ? (
                                <Wind size={13} className="text-black" />
                              ) : (
                                <DoorOpen size={13} className="text-black" />
                              )}
                            </span>
                            <span className="text-[12px] text-gray-800 font-medium min-w-[70px]">
                              {isWindow ? "Ventana" : "Puerta"} <span className="font-bold">{oidx + 1}</span>
                            </span>
                            <span className="text-[11px] text-gray-500 italic flex-1">
                              {opening.template?.descriptor || "Sin descripción"}
                            </span>
                            <div className="flex items-center gap-1 ml-auto">
                              <Switch
                                checked={!!openingSwitches[openingId]}
                                onCheckedChange={() => handleOpeningSwitch(openingId, idx)}
                                className="scale-90"
                              />
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <button className="p-1 rounded hover:bg-gray-200 transition">
                                    <MoreVertical size={13} />
                                  </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem className="text-[12px]" onClick={() => alert(`Ver detalles de ${isWindow ? "Ventana" : "Puerta"} ${oidx + 1}`)}>
                                    Ver detalles
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="text-[12px]" onClick={() => alert(`Propiedades de ${isWindow ? "Ventana" : "Puerta"} ${oidx + 1}`)}>
                                    Propiedades
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-[11px] text-gray-400 ml-2">Sin puertas ni ventanas en esta fachada.</div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </div>
    </div>
  );
};