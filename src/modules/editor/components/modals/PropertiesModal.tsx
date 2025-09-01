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

interface PropertiesModalProps {
  visible: boolean;
  wallIndex: number;
  onClose: () => void;
}

async function fetchAcousticWalls() {
  return [
    wallCeramicBrick,
    wallConcreteBlock,
    wallGypsumBoard,
    wallLightWoodPanel,
    wallThinBrickPartition,
  ];
}

export default function PropertiesModal({
  visible,
  wallIndex,
  onClose,
}: PropertiesModalProps) {
  const [wallsData, setWallsData] = useState<any[]>([]);
  const walls = useWallsStore((state) => state.walls);

  useEffect(() => {
    fetchAcousticWalls().then(setWallsData);
  }, []);

  // Busca la pared seleccionada por índice
  const selectedWall = walls.find((w) => w.wallIndex === wallIndex);

  // Obtiene el template acústico de la pared seleccionada
  const acoustic = selectedWall?.template;

  return (
    <Dialog open={visible} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Propiedades de la fachada</DialogTitle>
        </DialogHeader>
        {selectedWall ? (
          <div className="mb-4 space-y-2">
            <div>
              <span className="font-semibold">Nombre:</span>{" "}
              {selectedWall.template?.descriptor || "Sin asignar"}
            </div>
            <div>
              <span className="font-semibold">ID:</span> {selectedWall.id}
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
            No se encontró la fachada seleccionada.
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
