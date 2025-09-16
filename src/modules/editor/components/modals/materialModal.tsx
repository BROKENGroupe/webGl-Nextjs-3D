import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import React, { useMemo, useState } from "react";
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
import { doorAcoustic, doorDouble, doorStandard } from "@/data/acousticDoors";
import { useWallsStore } from "@/modules/editor/store/wallsStore";
import { useOpeningsStore } from "../../store/openingsStore";
import { floorAcousticPanel, floorConcreteSlab } from "@/data/floors";
import {
  ceilingAcousticPanel,
  ceilingConcreteSlab,
} from "@/data/acousticCeilings";
import { ElementType } from "../../types/walls";

interface MaterialModalProps {
  visible: boolean;
  wallIndex?: number;
  openingId?: string;
  floorId?: string;
  ceilingId?: string;
  elementType: ElementType;
  onClose: () => void;
}

const acousticMaterialsData = [
  wallCeramicBrick,
  wallConcreteBlock,
  wallGypsumBoard,
  wallLightWoodPanel,
  wallThinBrickPartition,
  windowStandard,
  windowTripleGlazed,
  windowAcoustic,
  windowLaminated,
  windowDoubleGlazed,
  doorStandard,
  doorDouble,
  doorAcoustic,
  floorConcreteSlab,
  floorAcousticPanel,
  ceilingConcreteSlab,
  ceilingAcousticPanel,
];

const typeOptions = [
  { value: "all", label: "Todos" },
  { value: "wall", label: "Paredes" },
  { value: "door", label: "Puertas" },
  { value: "window", label: "Ventanas" },
  { value: "floor", label: "Pisos" },
  { value: "ceiling", label: "Techos" },
];

export default function MaterialModal({
  visible,
  wallIndex,
  openingId,
  floorId,
  ceilingId,
  elementType,
  onClose,
}: MaterialModalProps) {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const walls = useWallsStore((state) => state.walls);
  const openings = useOpeningsStore((state) => state.openings);
  const floors = useWallsStore((state) => state.floors);
  const ceilings = useWallsStore((state) => state.ceilings);
  const updateWallByIndex = useWallsStore((state) => state.updateWallByIndex);
  const updateOpeningMaterial = useOpeningsStore(
    (state) => state.updateOpening
  );
  const updateFloorMaterial = useWallsStore((state) => state.updateFloor);
  const updateCeilingMaterial = useWallsStore((state) => state.updateCeiling);

  // Busca el elemento seleccionado según el tipo
  let selectedElement: any = null;
  if (elementType === ElementType.Wall && wallIndex !== undefined) {
    selectedElement = walls.find((w) => w.wallIndex === wallIndex);
  } else if (
    elementType === ElementType.Opening &&
    wallIndex !== undefined &&
    openingId !== undefined
  ) {
    const wall = walls.find((w) => w.wallIndex === wallIndex);
    selectedElement =
      wall &&
      ElementType.Opening in wall &&
      Array.isArray((wall as any).openings)
        ? (wall as any).openings.find((o: any) => o.id === openingId)
        : null;
  } else if (elementType === ElementType.Floor && floorId) {
    selectedElement = floors.find((f: any) => f.id === floorId);
  } else if (elementType === ElementType.Ceiling && ceilingId) {
    selectedElement = ceilings.find((c: any) => c.id === ceilingId);
  }

  // Filtra los materiales usando useMemo
  const filtered = useMemo(() => {
    return acousticMaterialsData.filter((material) => {
      const matchesQuery = material.descriptor
        .toLowerCase()
        .includes(query.toLowerCase());
      const matchesType =
        typeFilter === "all"
          ? true
          : typeFilter === ElementType.Wall
          ? material.type?.toLowerCase().includes("wall") ||
            material.type?.toLowerCase().includes("partition")
          : typeFilter === ElementType.Door
          ? material.type?.toLowerCase().includes("door")
          : typeFilter === ElementType.Window
          ? material.type?.toLowerCase().includes("window")
          : typeFilter === ElementType.Floor
          ? material.type?.toLowerCase().includes("floor")
          : typeFilter === ElementType.Ceiling
          ? material.type?.toLowerCase().includes("ceiling")
          : true;
      return matchesQuery && matchesType;
    });
  }, [query, typeFilter]);

  // Handler para seleccionar material según el tipo de elemento
  const handleSelectMaterial = (material: any) => {
    if (elementType === ElementType.Wall && wallIndex !== undefined) {
      updateWallByIndex(wallIndex, { template: material });
    } else if (
      (elementType === ElementType.Door ||
        elementType === ElementType.Window ||
        elementType === ElementType.Opening) &&
      openingId !== undefined
    ) {
      updateOpeningMaterial(openingId, { template: material });
    } else if (elementType === ElementType.Floor && floorId) {
      updateFloorMaterial(floorId, { template: material });
    } else if (elementType === ElementType.Ceiling && ceilingId) {
      updateCeilingMaterial(ceilingId, { template: material });
    }
    onClose();
  };

  return (
    <Dialog open={visible} onOpenChange={(open: boolean) => !open && onClose()}>
      <DialogContent
        className="w-[90vw] max-w-[1600px]"
        style={{
          maxHeight: "95vh",
          minHeight: "600px",
          overflowY: "auto",
          padding: "0",
        }}
      >
        <DialogHeader className="sticky top-0 bg-white z-10 px-12 pt-10">
          <DialogTitle>
            <span className="text-2xl font-bold">
              Biblioteca de materiales acústicos
            </span>
            <span className="block text-lg text-gray-500 mt-2">
              Selecciona el material para:{" "}
              <span className="text-blue-700 font-bold">
                {selectedElement?.template?.descriptor ||
                  selectedElement?.descriptor ||
                  "Elemento"}
              </span>
            </span>
          </DialogTitle>
        </DialogHeader>
        <div className="px-12 pt-6 pb-12">
          <div className="flex gap-6 mb-8 items-center">
            <Input
              placeholder="Buscar material..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-[350px]"
            />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="border rounded-lg px-4 py-2 text-base bg-white shadow"
            >
              {typeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8"
            style={{ paddingBottom: "16px" }}
          >
            {filtered.map((material, idx) => (
              <div
                key={material.descriptor + idx}
                className="bg-white rounded-2xl shadow-lg border flex flex-col justify-between p-6"
                style={{
                  minWidth: "320px",
                  maxWidth: "380px",
                  minHeight: "320px",
                  margin: "auto",
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="font-semibold text-lg truncate">
                    {material.descriptor}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSelectMaterial(material)}
                  >
                    Seleccionar
                  </Button>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-base text-gray-700 mb-2">
                  <div>
                    <span className="font-medium">Tipo:</span> {material.type}
                  </div>
                  <div>
                    <span className="font-medium">Subtipo:</span>{" "}
                    {material.subtype}
                  </div>
                  <div>
                    <span className="font-medium">Espesor:</span>{" "}
                    {material.thickness_mm} mm
                  </div>
                  <div>
                    <span className="font-medium">Masa:</span>{" "}
                    {material.mass_kg_m2} kg/m²
                  </div>
                  <div>
                    <span className="font-medium">Rw:</span>{" "}
                    {material.weightedIndex?.Rw} dB
                  </div>
                  <div>
                    <span className="font-medium">Color:</span> {material.color}
                  </div>
                </div>
                <div>
                  <span className="font-medium">Capas:</span>
                  <ul className="list-disc ml-4 text-sm text-gray-600">
                    {material.layers.map((layer: any, idx: number) => (
                      <li key={idx}>
                        {layer.name} ({layer.thickness_mm} mm)
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
        <DialogFooter className="px-12 pb-12">
          <Button onClick={onClose} variant="secondary">
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
