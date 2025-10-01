"use client";

import {
  handleOpeningDragStart,
  handleOpeningDragEnd,
  getBorderColor,
} from "@/modules/editor/core/engine/dragOpenings";
import { Button } from "@/shared/ui/button";
import { CardHeader, CardTitle, CardContent } from "@/shared/ui/card";
import { AcousticMaterial } from "@/modules/editor/types/AcousticMaterial";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/shared/ui/accordion";
import { WALL_TEMPLATES } from "@/modules/editor/types/walls";
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
  windowAcoustic,
  windowLaminated,
  windowTripleGlazed,
} from "@/data/acousticWindows";
import { doorStandard, doorDouble, doorAcoustic } from "@/data/acousticDoors";
import { floorAcousticPanel, floorConcreteSlab } from "@/data/floors";

import { Skeleton } from "@/shared/ui/skeleton";
import { useEffect, useState } from "react";
import { LayerTreePanel } from "./LayerTreePanel";
import { OPENING_TEMPLATES } from "@/modules/editor/types/openings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import {
  EyeNoneIcon,
  EyeOpenIcon,
  GearIcon,
  MagicWandIcon,
  MagnifyingGlassIcon,
} from "@radix-ui/react-icons";
import {
  ceilingAcousticPanel,
  ceilingConcreteSlab,
  ceilingGypsumBoard,
  ceilingMetalPanel,
  ceilingMineralWool,
} from "@/data/acousticCeilings";
import { MaterialSkeletonGrid } from "./MaterialSkeletonGrid";
import { MaterialSearchInput } from "./MaterialSearchInput";
import { Popover, PopoverTrigger, PopoverContent } from "@/shared/ui/popover";

type Layer = {
  key: string;
  label: string;
  icon: React.ReactNode;
  group?: string;
  thumbnail?: string;
};

const PALETTE_MATERIALS: AcousticMaterial[] = [
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

const PALETTE_TEMPLATES: AcousticMaterial[] = Object.values(OPENING_TEMPLATES);

const LAYERS: Layer[] = [
  // Solo puertas y ventanas
  ...PALETTE_TEMPLATES.map((template) => ({
    key: template.id,
    label: template.type,
    icon: (
      <span style={{ fontSize: "1.2em" }}>{template.imageRef || "🏠"}</span>
    ),
    group: "Openings",
    thumbnail: undefined,
  })),
];

const GROUPS = [
  { key: "Openings", label: "Puertas y Ventanas" },
  { key: "Materiales", label: "Materiales" },
];

const GROUPED_TEMPLATES = {
  Puertas: PALETTE_TEMPLATES.filter((t) =>
    t.type.toLowerCase().includes("door")
  ),
  Ventanas: PALETTE_TEMPLATES.filter((t) =>
    t.type.toLowerCase().includes("window")
  ),
  Fachadas: PALETTE_TEMPLATES.filter(
    (t) =>
      t.type.toLowerCase().includes("wall") ||
      t.type.toLowerCase().includes("partition")
  ),
  Pisos: PALETTE_TEMPLATES.filter((t) =>
    t.type.toLowerCase().includes("floor")
  ),
  Techos: PALETTE_TEMPLATES.filter((t) =>
    t.type.toLowerCase().includes("ceiling")
  ),
};

const GROUPED_MATERIALS = {
  Fachadas: PALETTE_MATERIALS.filter(
    (m) =>
      m.type?.toLowerCase().includes("wall") ||
      m.type?.toLowerCase().includes("partition")
  ),
  Puertas: PALETTE_MATERIALS.filter((m) =>
    m.type?.toLowerCase().includes("door")
  ),
  Ventanas: PALETTE_MATERIALS.filter((m) =>
    m.type?.toLowerCase().includes("window")
  ),
  Techos: PALETTE_MATERIALS.filter((m) =>
    m.type?.toLowerCase().includes("ceiling")
  ),
  Pisos: PALETTE_MATERIALS.filter((m) =>
    m.type?.toLowerCase().includes("floor")
  )
};

export type LayerVisibility = Record<string, boolean>;

// Lógica drag-and-drop separada
// const handleDragStart = (e: React.DragEvent, template: OpeningTemplate) => {
//   handleOpeningDragStart(e, template, onStartDrag, setDraggedItem);
// };

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
  onStartDrag?: (template: AcousticMaterial) => void;
}) {
  const [showMenu, setShowMenu] = useState(false);
  // Estado local para visual feedback (opcional)
  const [draggedItem, setDraggedItem] = useState<AcousticMaterial | null>(null);
  const [tab, setTab] = useState("materials");
  const [loading, setLoading] = useState(true);
  const [materialFilter, setMaterialFilter] = useState("");
  const [groupedMaterials, setGroupedMaterials] = useState<
    typeof GROUPED_MATERIALS | null
  >(null);
  const [showSearch, setShowSearch] = useState(false);

  // Simula petición HTTP al cambiar de tab
  useEffect(() => {
    if (tab === "materials") {
      setLoading(true);
      setGroupedMaterials(null);
      const timer = setTimeout(() => {
        setGroupedMaterials(GROUPED_MATERIALS); // "Respuesta" de la petición
        setLoading(false);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [tab]);

  const handleTabChange = (value: string) => {
    setTab(value);
  };

  // Simulación de selección de capa
  const handleSelect = (key: string, edit: boolean) => {
    onSelect?.(key, edit);
  };

  return (
    <div className="w-96 border-gray-200 bg-white">
      <CardHeader className="flex flex-row items-center justify-between pb-2" />
      <CardContent className="p-0">
        <Tabs value={tab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid grid-cols-2 mb-2">
            <TabsTrigger value="materials">Materiales</TabsTrigger>
            <TabsTrigger value="layers">Capas</TabsTrigger>
          </TabsList>
          <TabsContent value="materials">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold">Materiales disponibles</h4>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Buscar material"
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
                          <AccordionTrigger className="bg-gray-50 hover:bg-gray-100 px-4 py-2 rounded text-black font-semibold text-[15px] mb-2">
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
                                  className={`flex flex-col border border-gray-200 rounded-2xl shadow-md bg-white p-5 transition-all
            ${
              draggedItem?.descriptor === material.descriptor
                ? "cursor-grabbing"
                : "cursor-grab"
            }
            w-full min-w-0
            hover:shadow-lg
          `}
                                  style={{
                                    minHeight: "150px",
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
                                    {/* Círculo de color sutil */}
                                    {material.color && (
                                      <span
                                        style={{
                                          display: "inline-block",
                                          width: 28,
                                          height: 16,
                                          borderRadius: "50%",
                                          background: material.color,
                                          border: "1px solid #eee",
                                          marginRight: 6,
                                          boxShadow: "0 0 2px #ccc",
                                        }}
                                        title={`Color: ${material.color}`}
                                      />
                                    )}
                                    <span className="font-semibold text-black text-[14px] truncate">
                                      {material.descriptor}
                                    </span>
                                  </div>
                                  <div className="text-[12px] text-gray-800 mb-1">
                                    <span className="font-medium">Tipo:</span>{" "}
                                    {material.type}
                                  </div>
                                  <div className="text-[11px] text-gray-600 mb-1">
                                    <span className="font-medium">
                                      Espesor:
                                    </span>{" "}
                                    {material.thickness_mm} mm
                                    <span className="ml-2 font-medium">
                                      Masa:
                                    </span>{" "}
                                    {material.mass_kg_m2} kg/m²
                                  </div>
                                  <div className="text-[11px] text-black mb-1">
                                    <span className="font-medium">Rw:</span>{" "}
                                    {material.weightedIndex?.Rw} dB
                                  </div>
                                  <div className="flex gap-2 mt-2">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      aria-label="Ver material"
                                    >
                                      <EyeOpenIcon />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      aria-label="Editar material"
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
            <div className="p-4">
              <div className="font-semibold text-sm mb-2">
                Árbol de capas
              </div>
              <LayerTreePanel onSelect={onSelect} />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </div>
  );
}
