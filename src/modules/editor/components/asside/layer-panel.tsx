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

import { useState } from "react";
import { LayerTreePanel } from "./LayerTreePanel";
import { OPENING_TEMPLATES } from "@/modules/editor/types/openings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import {
  EyeNoneIcon,
  EyeOpenIcon,
  GearIcon,
  MagicWandIcon,
} from "@radix-ui/react-icons";
import {
  ceilingAcousticPanel,
  ceilingConcreteSlab,
} from "@/data/acousticCeilings";

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
  Pisos: PALETTE_MATERIALS.filter((m) =>
    m.type?.toLowerCase().includes("floor")
  ),
  Techos: PALETTE_MATERIALS.filter((m) =>
    m.type?.toLowerCase().includes("ceiling")
  ),
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
  const [tab, setTab] = useState("layers");
  const [openGroups, setOpenGroups] = useState<string[]>(
    GROUPS.map((g) => g.key)
  );
  const [materialFilter, setMaterialFilter] = useState("");

  // Simulación de selección de capa
  const handleSelect = (key: string, edit: boolean) => {
    onSelect?.(key, edit);
  };

  return (
    <div className="w-96 border-gray-200 bg-white">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        {/* <CardTitle className="text-lg font-semibold">
          Panel de propiedades
        </CardTitle> */}
      </CardHeader>
      <CardContent className="p-0">
        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-2">
            <TabsTrigger value="materials">Materiales</TabsTrigger>
            <TabsTrigger value="layers">Capas</TabsTrigger>
          </TabsList>
          <TabsContent value="materials">
            <div className="p-0">
              <div className="flex items-center justify-between mb-4">
                {/* <Button variant="default" size="sm" aria-label="Crear material">
                  <MagicWandIcon className="mr-1" /> Crear material
                </Button> */}
                <h4 className="text-lg font-semibold">
                  Materiales disponibles
                </h4>
                <div className="relative">
                  <Button
                    variant="outline"
                    size="icon"
                    aria-label="Buscar"
                    onClick={() => setShowMenu(!showMenu)}
                  >
                    <EyeNoneIcon />
                  </Button>
                  {showMenu && (
                    <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-3">
                      <input
                        type="text"
                        placeholder="Buscar materiales..."
                        value={materialFilter}
                        onChange={(e) => setMaterialFilter(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                      />
                    </div>
                  )}
                </div>
              </div>
              {/* Agrupación tipo acordeón estilo Elementor */}
              <div className="overflow-y-auto max-h-[700px] pr-2">
                <Accordion
                  type="multiple"
                  defaultValue={Object.keys(GROUPED_MATERIALS)}
                >
                  {Object.entries(GROUPED_MATERIALS).map(
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
            ${draggedItem?.descriptor === material.descriptor
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
              </div>
            </div>
          </TabsContent>
          <TabsContent value="layers">
            <div className="p-4">
              <div className="font-semibold text-sm mb-2">
                Árbol de Capas en el Modelado
              </div>
              <LayerTreePanel onSelect={onSelect} />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </div>
  );
}
