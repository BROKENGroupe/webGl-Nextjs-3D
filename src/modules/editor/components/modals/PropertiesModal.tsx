import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import React, { useEffect, useState } from "react";
import { useWallsStore } from "@/modules/editor/store/wallsStore";
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
import { useOpeningsStore } from "../../store/openingsStore";
import { doorStandard, doorDouble, doorAcoustic } from "@/data/acousticDoors";
import { ElementType } from "../../types/walls";

interface PropertiesModalProps {
  visible: boolean;
  wallIndex?: number;
  openingId?: string;
  floorId?: string;
  ceilingId?: string;
  elementType: ElementType;
  onClose: () => void;
}

async function fetchAcousticWalls() {
  return [
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
  ];
}

export default function PropertiesModal({
  visible,
  wallIndex,
  openingId,
  floorId,
  ceilingId,
  elementType,
  onClose,
}: PropertiesModalProps) {
  const [wallsData, setWallsData] = useState<any[]>([]);
  const walls = useWallsStore((state) => state.walls);
  const openings = useOpeningsStore((state) => state.openings);
  const floors = useWallsStore((state) => state.floors);
  const ceilings = useWallsStore((state) => state.ceilings);

  useEffect(() => {
    fetchAcousticWalls().then(setWallsData);
  }, []);
  debugger;
  // Busca la pared seleccionada por índice
  let selectedElement: any = null;
  if (elementType === ElementType.Wall && wallIndex !== undefined) {
    selectedElement = walls.find((w) => w.wallIndex === wallIndex);
  } else if (
    (elementType === ElementType.Opening ||
      elementType === ElementType.Window ||
      elementType === ElementType.Door) &&
    openingId !== undefined
  ) {
    selectedElement = openings.find((w) => w.id === openingId);
  } else if (elementType === ElementType.Floor && floorId) {
    selectedElement = floors.find((f: any) => f.id === floorId);
  } else if (elementType === ElementType.Ceiling && ceilingId) {
    selectedElement = ceilings.find((c: any) => c.id === ceilingId);
  }

  // Obtiene el template acústico del elemento seleccionado
  const acoustic = selectedElement?.template;

  return (
    <Dialog open={visible} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="w-[70vw]"
        style={{
          maxHeight: "95vh",
          minHeight: "600px",
          overflowY: "auto",
          padding: "0",
        }}
      >
        <DialogHeader>
          <DialogTitle>
            {elementType === ElementType.Wall && "Propiedades de la fachada"}
            {elementType === ElementType.Window && "Propiedades de la ventana"}
            {elementType === ElementType.Door && "Propiedades de la puerta"}
            {elementType === ElementType.Floor && "Propiedades del piso"}
            {elementType === ElementType.Ceiling && "Propiedades del techo"}
          </DialogTitle>
        </DialogHeader>
        {selectedElement ? (
          <div className="mb-4 space-y-2">
            <div>
              <span className="font-semibold">Nombre:</span>{" "}
              {acoustic?.descriptor || "Sin asignar"}
            </div>
            <div>
              <span className="font-semibold">ID:</span> {selectedElement.id}
            </div>
            {acoustic && (
              <div className="border rounded-lg p-4 bg-gray-50 mt-2">
                <div className="font-semibold text-lg mb-2">
                  {acoustic.descriptor}
                </div>
                <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm text-gray-700 mb-2">
                  <div>
                    <span className="font-medium">Tipo:</span> {acoustic.type}
                  </div>
                  <div>
                    <span className="font-medium">Subtipo:</span>{" "}
                    {acoustic.subtype}
                  </div>
                  <div>
                    <span className="font-medium">Espesor:</span>{" "}
                    {acoustic.thickness_mm} mm
                  </div>
                  <div>
                    <span className="font-medium">Masa:</span>{" "}
                    {acoustic.mass_kg_m2} kg/m²
                  </div>
                  <div>
                    <span className="font-medium">Rw:</span>{" "}
                    {acoustic.weightedIndex?.Rw} dB
                  </div>
                  <div>
                    <span className="font-medium">Color:</span> {acoustic.color}
                  </div>
                </div>
                <div className="mt-2">
                  <span className="font-medium">Capas:</span>
                  <ul className="list-disc ml-6 text-xs text-gray-600">
                    {acoustic.layers?.map((layer: any, idx: number) => (
                      <li key={idx}>
                        {layer.name} ({layer.thickness_mm} mm)
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-2">
                  <span className="font-medium">Índices acústicos:</span>
                  <ul className="ml-6 text-xs text-gray-600">
                    <li>Rw: {acoustic.weightedIndex?.Rw} dB</li>
                    <li>C: {acoustic.weightedIndex?.C}</li>
                    <li>Ctr: {acoustic.weightedIndex?.Ctr}</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-gray-500">
            No se encontró el elemento seleccionado.
          </div>
        )}
        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
