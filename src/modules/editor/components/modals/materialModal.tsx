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
import { windowStandard, windowDoubleGlazed } from "@/data/acousticWindows";

import { useWallsStore } from "@/modules/editor/store/wallsStore";
import { useOpeningsStore } from "../../store/openingsStore";
import { doorAcoustic, doorDouble, doorStandard } from "@/data/acousticDoors";

type ElementType = "wall" | "opening" | "floor" | "ceiling";

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
  windowDoubleGlazed,
  windowStandard,
  windowDoubleGlazed,
  doorStandard,
  doorDouble,
  doorAcoustic,
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
  const walls = useWallsStore((state) => state.walls);
  const openings = useOpeningsStore((state) => state.openings);
  const floors = useWallsStore((state) => state.floors);
  const ceilings = useWallsStore((state) => state.ceilings);
  const updateWallByIndex = useWallsStore((state) => state.updateWallByIndex);
  const updateOpeningMaterial = useOpeningsStore(
    (state) => state.updateOpening
  );
  const updateFloorMaterial = useWallsStore((state) => state.addFloor);
  const updateCeilingMaterial = useWallsStore((state) => state.addCeiling);

  // Busca el elemento seleccionado según el tipo
  let selectedElement: any = null;
  if (elementType === "wall" && wallIndex !== undefined) {
    selectedElement = walls.find((w) => w.wallIndex === wallIndex);
  } else if (
    elementType === "opening" &&
    wallIndex !== undefined &&
    openingId !== undefined
  ) {
    const wall = walls.find((w) => w.wallIndex === wallIndex);
    selectedElement =
      wall && "openings" in wall && Array.isArray((wall as any).openings)
        ? (wall as any).openings.find((o: any) => o.id === openingId)
        : null;
  } else if (elementType === "floor" && floorId) {
    selectedElement = floors.find((f: any) => f.id === floorId);
  } else if (elementType === "ceiling" && ceilingId) {
    selectedElement = ceilings.find((c: any) => c.id === ceilingId);
  }

  // Filtra los materiales usando useMemo
  const filtered = useMemo(() => {
    return acousticMaterialsData.filter((material) =>
      material.descriptor.toLowerCase().includes(query.toLowerCase())
    );
  }, [query]);

  // Handler para seleccionar material según el tipo de elemento
  const handleSelectMaterial = (material: any) => {
    if (elementType === "wall" && wallIndex !== undefined) {
      updateWallByIndex(wallIndex, { template: material });
    } else if (
      elementType === "opening" &&
      wallIndex !== undefined &&
      openingId !== undefined
    ) {
      updateOpeningMaterial(openingId, { template: material });
    } else if (elementType === "floor" && floorId) {
      updateFloorMaterial(Number(floorId), material);
    } else if (elementType === "ceiling" && ceilingId) {
      updateCeilingMaterial(Number(ceilingId), material);
    }
    onClose();
  };

  return (
    <Dialog open={visible} onOpenChange={(open: boolean) => !open && onClose()}>
      <DialogContent
        className="w-[90vw] max-w-full"
        style={{
          maxHeight: "90vh",
          minHeight: "500px",
          overflowY: "auto",
          padding: "0",
        }}
      >
        <DialogHeader className="sticky top-0 bg-white z-10 px-8 pt-8">
          <DialogTitle>
            <span className="text-lg font-semibold">
              Biblioteca de materiales acústicos
            </span>
            <span className="block text-base text-gray-500 mt-1">
              Selecciona el material para:{" "}
              <span className="text-blue-700 font-bold">
                {selectedElement?.template?.descriptor ||
                  selectedElement?.descriptor ||
                  "Elemento"}
              </span>
            </span>
          </DialogTitle>
        </DialogHeader>
        <div className="px-8 pt-4 pb-8">
          <Input
            placeholder="Buscar material..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="mb-6"
          />
          <div
            className="flex flex-wrap gap-6"
            style={{ paddingBottom: "16px" }}
          >
            {filtered.map((material, idx) => (
              <div
                key={material.descriptor + idx}
                className="min-w-[280px] max-w-[320px] border rounded-xl p-6 bg-white shadow-lg hover:shadow-xl transition flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="font-semibold text-base truncate">
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
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-700 mb-2">
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
                <div className="mt-1">
                  <span className="font-medium">Capas:</span>
                  <ul className="list-disc ml-4 text-xs text-gray-600">
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
        <DialogFooter className="px-8 pb-8">
          <Button onClick={onClose} variant="secondary">
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
