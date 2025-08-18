"use client";
// Lógica drag-and-drop importada
import { getBorderColor, handleOpeningDragStart, handleOpeningDragEnd } from '@/lib/engine/dragOpenings';
import { useOpeningsStore } from '@/store/openingsStore';
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

import { Button } from "@/components/ui/button";
import { OPENING_TEMPLATES } from '@/types/openings';
import { MATERIAL_PROPERTIES } from '@/config/materials';
import {
  EyeOpenIcon,
  EyeNoneIcon,
  SpeakerLoudIcon,
  CubeIcon,
  BorderAllIcon,
  LayersIcon,
  MagicWandIcon,
  TimerIcon,
  BarChartIcon,
  GridIcon,
  VideoIcon,
  ImageIcon,
  CursorArrowIcon,
  DownloadIcon,
  ClockIcon,
  GearIcon,
} from "@radix-ui/react-icons";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";
import { AcousticMaterial } from '@/types/AcousticMaterial';
import { LayerTreePanel } from "./LayerTreePanel"; // importa el componente del árbol de capas

type Layer = {
  key: string;
  label: string;
  icon: React.ReactNode;
  group?: string;
  thumbnail?: string;
};

const PALETTE_TEMPLATES: AcousticMaterial[] = Object.values(OPENING_TEMPLATES);

const LAYERS: Layer[] = [
  // Solo puertas y ventanas
  ...PALETTE_TEMPLATES.map((template) => ({
    key: template.id,
    label: template.type,
    icon: <span style={{fontSize: '1.2em'}}>{template.imageRef || '🏠'}</span>,
    group: 'Openings',
    thumbnail: undefined
  })),
];

const GROUPS = [
  { key: "Openings", label: "Puertas y Ventanas" },
  { key: "Materiales", label: "Materiales" },
];


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
  onStartDrag
}: {
  visibility: LayerVisibility;
  onChange: (v: LayerVisibility) => void;
  selected?: string;
  onSelect?: (key: string) => void;
  onStartDrag?: (template: AcousticMaterial) => void
}) {
  const [showMenu, setShowMenu] = useState(false);
  // Estado local para visual feedback (opcional)
  const [draggedItem, setDraggedItem] = useState<AcousticMaterial | null>(null);
  const [tab, setTab] = useState("layers");
  const [openGroups, setOpenGroups] = useState<string[]>(GROUPS.map(g => g.key));
  const [materialFilter, setMaterialFilter] = useState("");

  // Simulación de selección de capa
  const handleSelect = (key: string) => {
    onSelect?.(key);
  };

  return (
    <div className="w-96 border-gray-200 bg-white">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold">Panel de Capas</CardTitle>
       
      </CardHeader>
      <CardContent className="p-0">
        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-2">
            <TabsTrigger value="materials">Materiales</TabsTrigger>
            <TabsTrigger value="layers">Capas</TabsTrigger>
          </TabsList>
          <TabsContent value="materials">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <Button variant="default" size="sm" aria-label="Crear material">
                  <MagicWandIcon className="mr-1" /> Crear material
                </Button>
                <div className="relative">
                  <Button variant="outline" size="icon" aria-label="Buscar" onClick={() => setShowMenu(!showMenu)}>
                    <EyeNoneIcon />
                  </Button>
                  {showMenu && (
                    <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-3">
                      <input
                        type="text"
                        placeholder="Buscar materiales..."
                        value={materialFilter}
                        onChange={e => setMaterialFilter(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                      />
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                {PALETTE_TEMPLATES.filter(t =>
                  t.type.toLowerCase().includes(materialFilter)
                ).map((template) => {
                  const rw = template.weightedIndex?.Rw;
                  //const avgSTC = Math.round((stc.low + stc.mid + stc.high) / 3);
                  return (
                    <div
                      key={template.id}
                      draggable
                      onDragStart={e => {
                        handleOpeningDragStart(e, template, onStartDrag, setDraggedItem);
                      }}
                      onDragEnd={() => {
                        handleOpeningDragEnd(setDraggedItem);
                      }}
                      className={`
                        flex items-center px-2 py-2 rounded-md bg-white border border-gray-200 cursor-move transition-all
                        ${selected === template.id || draggedItem?.id === template.id
                          ? 'border-blue-500 bg-blue-50 scale-105' 
                          : 'hover:border-blue-400 hover:bg-gray-50'
                        }
                        active:scale-95
                      `}
                      style={{ borderLeft: `4px solid ${getBorderColor(template.type)}` }}
                      role="button"
                      tabIndex={0}
                      aria-label={`Arrastrar ${template.type} - ${template.width}m × ${template.height}m`}
                      onClick={() => handleSelect(template.id)}
                    >
                      <span className="flex-1 font-medium text-gray-800 text-sm">
                        {template.type}
                        <span className="ml-2 text-xs text-gray-500">{template.width}m × {template.height}m</span>
                        <span className="ml-2 px-2 py-0.5 rounded bg-blue-100 text-blue-700 text-xs">Rw: {rw}dB</span>
                      </span>
                      <div className="flex gap-1 items-center">
                        <Button variant="ghost" size="icon" aria-label="Ver material">
                          <EyeOpenIcon />
                        </Button>
                        <Button variant="ghost" size="icon" aria-label="Editar material">
                          <GearIcon />
                        </Button>
                      </div>
                    </div>
                  );
                })}
                {PALETTE_TEMPLATES.filter(t =>
                  t.type.toLowerCase().includes(materialFilter)
                ).length === 0 && (
                  <div className="text-center text-gray-400 text-sm py-8">No se encontraron materiales.</div>
                )}
              </div>
            </div>
          </TabsContent>
          <TabsContent value="layers">
            <div className="p-4">
              <div className="font-semibold text-sm mb-2">Árbol de Capas en el Modelado</div>
              <LayerTreePanel onSelect={onSelect} />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </div>
  );
}