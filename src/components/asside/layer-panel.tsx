"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

import { Button } from "@/components/ui/button";
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

type Layer = {
  key: string;
  label: string;
  icon: React.ReactNode;
  group?: string;
  thumbnail?: string;
};

const LAYERS: Layer[] = [
  // Simulación
  { key: "sources", label: "Fuentes", icon: <SpeakerLoudIcon />, group: "Simulación" },
//   { key: "microphones", label: "Micrófonos", icon: <MicrophoneIcon />, group: "Simulación" },
//   { key: "audience", label: "Público", icon: <UserIcon />, group: "Simulación" },
  { key: "walls", label: "Paredes", icon: <BorderAllIcon />, group: "Simulación" },
  { key: "floor", label: "Piso", icon: <LayersIcon />, group: "Simulación" },
  { key: "ceiling", label: "Techo", icon: <LayersIcon />, group: "Simulación" },
//   { key: "doors", label: "Puertas", icon: <DoorOpenIcon />, group: "Simulación" },
//   { key: "windows", label: "Ventanas", icon: <WindowIcon />, group: "Simulación" },
  { key: "treatments", label: "Tratamientos acústicos", icon: <MagicWandIcon />, group: "Simulación" },
  { key: "obstacles", label: "Obstáculos", icon: <CubeIcon />, group: "Simulación" },

  // Visualización
  { key: "heatmap", label: "Mapa de calor", icon: <EyeOpenIcon />, group: "Visualización" },
//   { key: "splContours", label: "Contornos SPL", icon: <ActivityIcon />, group: "Visualización" },
  { key: "rt60", label: "RT60 (Reverberación)", icon: <TimerIcon />, group: "Visualización" },
  { key: "frequencyBands", label: "Bandas de frecuencia", icon: <BarChartIcon />, group: "Visualización" },
  { key: "grid", label: "Cuadrícula", icon: <GridIcon />, group: "Visualización" },
//   { key: "labels", label: "Etiquetas", icon: <TagIcon />, group: "Visualización" },
//   { key: "measureLines", label: "Líneas de medición", icon: <RulerIcon />, group: "Visualización" },
  { key: "cameraPath", label: "Trayectoria de cámara", icon: <VideoIcon />, group: "Visualización" },
  { key: "cube", label: "Cubo 3D", icon: <CubeIcon />, group: "Visualización" },
  { key: "background", label: "Fondo", icon: <ImageIcon />, group: "Visualización" },

  // Herramientas
  { key: "selection", label: "Selección", icon: <CursorArrowIcon />, group: "Herramientas" },
//   { key: "notes", label: "Notas", icon: <StickyNoteIcon />, group: "Herramientas" },
  { key: "export", label: "Exportar", icon: <DownloadIcon />, group: "Herramientas" },
  { key: "history", label: "Historial", icon: <ClockIcon />, group: "Herramientas" },
  { key: "settings", label: "Configuración", icon: <GearIcon />, group: "Herramientas" },
];

const GROUPS = [
  { key: "Simulación", label: "Simulación" },
  { key: "Visualización", label: "Visualización" },
  { key: "Herramientas", label: "Herramientas" },
];

export type LayerVisibility = Record<string, boolean>;

export function LayerPanel({
  visibility,
  onChange,
  selected,
  onSelect,
}: {
  visibility: LayerVisibility;
  onChange: (v: LayerVisibility) => void;
  selected?: string;
  onSelect?: (key: string) => void;
}) {
  const [tab, setTab] = useState("layers");
  const [openGroups, setOpenGroups] = useState<string[]>(GROUPS.map(g => g.key));

  // Simulación de selección de capa
  const handleSelect = (key: string) => {
    onSelect?.(key);
  };

  return (
    <Card className="w-72 rounded-none shadow-none border-none">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Panel de Capas</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="layers">Capas</TabsTrigger>
            <TabsTrigger value="channels">Canales</TabsTrigger>
            <TabsTrigger value="paths">Trazados</TabsTrigger>
          </TabsList>
          <TabsContent value="layers">
            <Accordion
              type="multiple"
              value={openGroups}
              onValueChange={setOpenGroups}
              className="mt-2"
            >
              {GROUPS.map((group) => (
                <AccordionItem key={group.key} value={group.key} className="border-b-0">
                  <AccordionTrigger className="text-sm font-semibold px-3">
                    {group.label}
                  </AccordionTrigger>
                  <AccordionContent className="p-0">
                    <ul className="max-h-[400px] overflow-y-auto pr-1">
                      {LAYERS.filter(l => l.group === group.key).map((layer) => (
                        <li
                          key={layer.key}
                          className={`
                            flex items-center justify-between px-3 py-1.5 gap-2
                            cursor-pointer group
                            ${selected === layer.key ? "bg-primary/10 border-l-4 border-primary" : "hover:bg-muted"}
                          `}
                          onClick={() => handleSelect(layer.key)}
                        >
                          <div className="flex items-center gap-2">
                            {/* Miniatura simulada */}
                            <div className="w-6 h-6 bg-muted rounded flex items-center justify-center overflow-hidden border">
                              {layer.thumbnail ? (
                                <img src={layer.thumbnail} alt="" className="w-full h-full object-cover" />
                              ) : (
                                layer.icon
                              )}
                            </div>
                            <span className="text-xs">{layer.label}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            tabIndex={-1}
                            onClick={e => {
                              e.stopPropagation();
                              onChange({ ...visibility, [layer.key]: !visibility[layer.key] });
                            }}
                          >
                            {visibility[layer.key] ? <EyeOpenIcon /> : <EyeNoneIcon />}
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </TabsContent>
          <TabsContent value="channels">
            <div className="p-4 text-xs text-muted-foreground">Aquí puedes mostrar canales de simulación (ejemplo).</div>
          </TabsContent>
          <TabsContent value="paths">
            <div className="p-4 text-xs text-muted-foreground">Aquí puedes mostrar trazados o rutas acústicas (ejemplo).</div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}