"use client";

import {
  handleOpeningDragStart,
  handleOpeningDragEnd,
} from "@/modules/editor/core/engine/dragOpenings";
import { Button } from "@/shared/ui/button";
import { CardContent } from "@/shared/ui/card";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/shared/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import {
  EyeOpenIcon,
  GearIcon,
  MagnifyingGlassIcon,
} from "@radix-ui/react-icons";
import { MaterialSkeletonGrid } from "./MaterialSkeletonGrid";
import { MaterialSearchInput } from "./MaterialSearchInput";
import { Popover, PopoverTrigger, PopoverContent } from "@/shared/ui/popover";
import { LayerTreePanel } from "./LayerTreePanel";
import {
  wallCeramicBrick,
  wallConcreteBlock,
  wallGypsumBoard,
  wallLightWoodPanel,
  wallThinBrickPartition,
} from "@/data/acousticWalls";
import {
  windowStandard,
  windowDoubleGlazed,
  windowLaminated,
  windowAcoustic,
  windowTripleGlazed,
} from "@/data/acousticWindows";
import { doorStandard, doorDouble, doorAcoustic } from "@/data/acousticDoors";
import { floorConcreteSlab, floorAcousticPanel } from "@/data/floors";
import {
  ceilingAcousticPanel,
  ceilingConcreteSlab,
  ceilingGypsumBoard,
  ceilingMetalPanel,
  ceilingMineralWool,
} from "@/data/acousticCeilings";
import { materialsService } from "@/services/materialsService";
import { useEffect, useState } from "react";

const PALETTE_MATERIALS = [
  wallCeramicBrick,
  wallConcreteBlock,
  wallGypsumBoard,
  wallLightWoodPanel,
  wallThinBrickPartition,
  windowStandard,
  windowDoubleGlazed,
  windowLaminated,
  windowAcoustic,
  windowTripleGlazed,
  doorStandard,
  doorDouble,
  doorAcoustic,
  floorConcreteSlab,
  floorAcousticPanel,
  ceilingConcreteSlab,
  ceilingAcousticPanel,
  ceilingMetalPanel,
  ceilingGypsumBoard,
  ceilingMineralWool,
];

export type LayerVisibility = Record<string, boolean>;

export function LayerPanel({
  visibility,
  onChange,
  selected,
  onSelect,
  onStartDrag,
}: {
  visibility: LayerVisibility;
  onChange: (v: LayerVisibility) => void;
  selected?: string;
  onSelect?: (key: any, edit: boolean) => void;
  onStartDrag?: (template: any) => void;
}) {
  const [draggedItem, setDraggedItem] = useState<any | null>(null);
  const [tab, setTab] = useState("materials");
  const [loading, setLoading] = useState(true);
  const [materialFilter, setMaterialFilter] = useState("");
  const [groupedMaterials, setGroupedMaterials] = useState<Record<
    string,
    any[]
  > | null>(null);
  const [dataSource, setDataSource] = useState<"local" | "backend">("local");

  useEffect(() => {
    const fetchAndGroupMaterials = async () => {
      if (tab !== "materials") {
        setGroupedMaterials(null);
        return;
      }
      setLoading(true);
      setGroupedMaterials(null);
      try {
        let materials: any[] = [];
        if (dataSource === "backend") {
          materials = await materialsService.getMaterials();
          await new Promise((resolve) => setTimeout(resolve, 1500));
        } else {
          materials = PALETTE_MATERIALS;
        }
        const newGroupedMaterials = {
          Fachadas: materials.filter(
            (m) =>
              m.type?.toLowerCase().includes("wall") ||
              m.type?.toLowerCase().includes("partition")
          ),
          Puertas: materials.filter((m) =>
            m.type?.toLowerCase().includes("door")
          ),
          Ventanas: materials.filter((m) =>
            m.type?.toLowerCase().includes("window")
          ),
          Pisos: materials.filter((m) =>
            m.type?.toLowerCase().includes("floor")
          ),
          Techos: materials.filter((m) =>
            m.type?.toLowerCase().includes("ceiling")
          ),
        };
        setGroupedMaterials(newGroupedMaterials);
      } catch (error) {
        console.error("Error fetching materials for palette:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAndGroupMaterials();
  }, [tab, dataSource]);

  const handleTabChange = (value: string) => {
    setTab(value);
  };

  const handleSelect = (key: string, edit: boolean) => {
    onSelect?.(key, edit);
  };

  return (
    <div className="bg-white overflow-hidden">
      <CardContent className="p-0">
        <Tabs value={tab} onValueChange={handleTabChange} className="w-full">
          <TabsList>
            <TabsTrigger value="materials" className="text-base font-semibold">
              Materiales
            </TabsTrigger>
            <TabsTrigger value="layers" className="text-base font-semibold">
              Capas
            </TabsTrigger>
          </TabsList>
          <TabsContent value="materials">
            <div className="flex items-center justify-between mb-4 pt-6">
              <h4 className="font-bold text-base mb-4 text-gray-900">
                Materiales disponibles
              </h4>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Buscar material"
                    className="hover:bg-gray-100"
                  >
                    <MagnifyingGlassIcon />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-2" align="end">
                  <MaterialSearchInput
                    value={materialFilter}
                    onChange={(e) =>
                      setMaterialFilter(e.target.value.toLowerCase())
                    }
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="overflow-y-auto max-h-[700px] pr-2">
              {loading || !groupedMaterials ? (
                <MaterialSkeletonGrid count={6} />
              ) : (
                <Accordion
                  type="multiple"
                  defaultValue={Object.keys(groupedMaterials)}
                  className="space-y-2"
                >
                  {Object.entries(groupedMaterials).map(
                    ([group, materials]) => {
                      const filteredMaterials = materials.filter(
                        (m) =>
                          m.type?.toLowerCase().includes(materialFilter) ||
                          m.descriptor?.toLowerCase().includes(materialFilter)
                      );
                      return (
                        <AccordionItem key={group} value={group}>
                          <AccordionTrigger className="bg-gray-50 hover:bg-gray-100 px-4 py-2 rounded-lg text-gray-900 font-semibold text-base mb-2 transition">
                            {group}
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                              {filteredMaterials.map((material) => (
                                <div
                                  key={material.descriptor}
                                  draggable
                                  onDragStart={(e) => {
                                    handleOpeningDragStart(
                                      e,
                                      material,
                                      onStartDrag,
                                      setDraggedItem
                                    );
                                  }}
                                  onDragEnd={() => {
                                    handleOpeningDragEnd(setDraggedItem);
                                  }}
                                  className={`flex flex-col border border-gray-200 rounded-xl shadow-sm bg-white p-4 transition-all
            ${
              draggedItem?.descriptor === material.descriptor
                ? "cursor-grabbing ring-2 ring-blue-300"
                : "cursor-grab"
            }
            w-full min-w-0
            hover:shadow-lg
          `}
                                  style={{
                                    minHeight: "140px",
                                    margin: "0",
                                  }}
                                  role="button"
                                  tabIndex={0}
                                  aria-label={`Arrastrar ${material.type} - ${material.descriptor}`}
                                  onClick={() =>
                                    handleSelect(material.descriptor, false)
                                  }
                                  onMouseDown={() => setDraggedItem(material)}
                                  onMouseUp={() => setDraggedItem(null)}
                                >
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="text-2xl">
                                      {material.imageRef || "🧱"}
                                    </span>
                                    {material.color && (
                                      <span
                                        className="inline-block w-7 h-4 rounded-full border border-gray-200 mr-2"
                                        style={{
                                          background: material.color,
                                          boxShadow: "0 0 2px #ccc",
                                        }}
                                        title={`Color: ${material.color}`}
                                      />
                                    )}
                                    <span className="font-semibold text-gray-900 text-[15px] truncate">
                                      {material.descriptor}
                                    </span>
                                  </div>
                                  <div className="text-[13px] text-gray-700 mb-1">
                                    <span className="font-medium">Tipo:</span>{" "}
                                    {material.type}
                                  </div>
                                  <div className="text-[12px] text-gray-500 mb-1">
                                    <span className="font-medium">
                                      Espesor:
                                    </span>{" "}
                                    {material.thickness_mm} mm
                                    <span className="ml-2 font-medium">
                                      Masa:
                                    </span>{" "}
                                    {material.mass_kg_m2} kg/m²
                                  </div>
                                  <div className="text-[12px] text-gray-700 mb-1">
                                    <span className="font-medium">Rw:</span>{" "}
                                    {material.weightedIndex?.Rw} dB
                                  </div>
                                  <div className="flex gap-2 mt-2">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      aria-label="Ver material"
                                      className="hover:bg-gray-100"
                                    >
                                      <EyeOpenIcon />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      aria-label="Editar material"
                                      className="hover:bg-gray-100"
                                    >
                                      <GearIcon />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                              {filteredMaterials.length === 0 && (
                                <div className="text-center text-gray-400 text-sm py-8">
                                  No se encontraron materiales.
                                </div>
                              )}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      );
                    }
                  )}
                </Accordion>
              )}
            </div>
          </TabsContent>
          <TabsContent value="layers">
            <div className="flex items-center justify-between mb-4 pt-6">
              <div className="font-bold text-base mb-4 text-gray-900">
                Árbol de capas
              </div>
            </div>
            <LayerTreePanel onSelect={onSelect} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </div>
  );
}
