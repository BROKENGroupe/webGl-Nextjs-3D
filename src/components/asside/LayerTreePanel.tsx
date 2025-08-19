import React, { useState } from "react";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useOpeningsStore } from "@/store/openingsStore";
import { useWallsStore } from "@/store/wallsStore";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { MoreVertical, Wind, DoorOpen } from "lucide-react";

interface LayerTreePanelProps {
  onSelect?: (type: "wall" | "opening", id: string) => void;
  onVisibilityChange?: (type: "wall" | "opening", id: string, visible: boolean) => void;
}

export const LayerTreePanel: React.FC<LayerTreePanelProps> = ({ onSelect, onVisibilityChange }) => {
  const openings = useOpeningsStore((state) => state.openings) || [];
  const walls = useWallsStore((state) => state.walls) || [];

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

  if (!walls.length) {
    return (
      <div className="text-gray-400 text-sm my-4">
        No hay datos de capas disponibles.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full my-2">
      <div className="text-base font-semibold text-blue-700 flex items-center gap-2 mb-1">
        <span>Árbol de Capas</span>
        <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700 border-blue-200">
          {walls.length} fachadas
        </Badge>
      </div>
      <div className="flex-1 overflow-y-auto pr-1">
        <Accordion type="multiple" defaultValue={expandedWalls}>
          {walls.map((wall: any, idx: number) => {
            const wallId = wall.id || `wall-${idx}`;
            const wallOpenings = openings.filter((opening: any) => opening.wallIndex === idx);
            return (
              <AccordionItem key={wallId} value={wallId}>
                <AccordionTrigger className="flex items-center gap-2 px-2 py-1 bg-blue-50 hover:bg-blue-100 rounded transition-all min-h-[38px]">
                  <span className="flex items-center gap-2">
                    <Badge variant="secondary" className="mr-1 text-lg px-1 py-1 bg-white border border-blue-200 shadow-sm">
                      🧱
                    </Badge>
                    <span className="text-[15px] font-medium text-blue-800">
                      Fachada <span className="font-bold">{idx + 1} {wall.template.descriptor}</span>
                    </span>
                  </span>
                  <div className="flex items-center gap-1 ml-auto">
                    <Switch
                      checked={!!wallSwitches[wallId]}
                      onCheckedChange={() => handleWallSwitch(wallId, idx)}
                      className="scale-90"
                    />
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-1 rounded hover:bg-blue-100 transition">
                          <MoreVertical size={17} />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => alert(`Ver detalles de Fachada ${idx + 1}`)}>
                          Ver detalles
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => alert(`Propiedades de Fachada ${idx + 1}`)}>
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
                            className="flex items-center gap-3 mb-2 px-2 py-1 rounded hover:bg-blue-50 transition-all min-h-[32px]"
                          >
                            <span className="flex items-center justify-center w-6 h-6 rounded bg-gray-100 border border-gray-300 shadow-sm">
                              {isWindow ? (
                                <Wind size={15} className="text-blue-500" />
                              ) : (
                                <DoorOpen size={15} className="text-orange-700" />
                              )}
                            </span>
                            <span className="text-[14px] text-gray-700 font-medium min-w-[70px]">
                              {isWindow ? "Ventana" : "Puerta"} <span className="font-bold">{oidx + 1}</span>
                            </span>
                            <span className="text-xs text-gray-500 italic flex-1">
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
                                    <MoreVertical size={15} />
                                  </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => alert(`Ver detalles de ${isWindow ? "Ventana" : "Puerta"} ${oidx + 1}`)}>
                                    Ver detalles
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => alert(`Propiedades de ${isWindow ? "Ventana" : "Puerta"} ${oidx + 1}`)}>
                                    Propiedades
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-xs text-gray-400 ml-2">Sin puertas ni ventanas en esta fachada.</div>
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