import { Button } from "@/shared/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import React, { useEffect, useState } from "react";
import {
  wallCeramicBrick,
  wallConcreteBlock,
  wallGypsumBoard,
  wallLightWoodPanel,
  wallThinBrickPartition,
} from "@/data/acousticWalls";
import { useWallsStore } from "@/modules/editor/store/wallsStore";

interface MaterialModalProps {
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
    wallThinBrickPartition
  ];
}

export default function MaterialModal({ visible, wallIndex, onClose }: MaterialModalProps) {
  const [query, setQuery] = useState("");
  const [wallsData, setWallsData] = useState<any[]>([]);
  const walls = useWallsStore((state) => state.walls);
  const updateWall = useWallsStore((state) => state.updateWall);

  useEffect(() => {
    fetchAcousticWalls().then(setWallsData);
  }, []);

  // Busca la pared seleccionada por nombre de fachada
  const selectedWall = walls.find(w => w.wallIndex === wallIndex);

  const filtered = wallsData.filter(wall =>
    wall.descriptor.toLowerCase().includes(query.toLowerCase())
  );

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
            <span className="text-lg font-semibold">Biblioteca de materiales acústicos</span>
            <span className="block text-base text-gray-500 mt-1">
              Selecciona el material para: <span className="text-blue-700 font-bold">{selectedWall?.template.descriptor}</span>
            </span>
          </DialogTitle>
        </DialogHeader>
        <div className="px-8 pt-4 pb-8">
          <Input
            placeholder="Buscar material..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="mb-6"
          />
          <div
            className="flex flex-wrap gap-6"
            style={{ paddingBottom: "16px" }}
          >
            {filtered.map(wall => (
              <div
                key={wall.id}
                className="min-w-[280px] max-w-[320px] border rounded-xl p-6 bg-white shadow-lg hover:shadow-xl transition flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="font-semibold text-base truncate">{wall.descriptor}</div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (selectedWall) {
                        updateWall(selectedWall.id, { template: wall });
                      }
                      onClose();
                    }}
                  >
                    Seleccionar
                  </Button>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-700 mb-2">
                  <div>
                    <span className="font-medium">Tipo:</span> {wall.type}
                  </div>
                  <div>
                    <span className="font-medium">Subtipo:</span> {wall.subtype}
                  </div>
                  <div>
                    <span className="font-medium">Espesor:</span> {wall.thickness_mm} mm
                  </div>
                  <div>
                    <span className="font-medium">Masa:</span> {wall.mass_kg_m2} kg/m²
                  </div>
                  <div>
                    <span className="font-medium">Rw:</span> {wall.weightedIndex?.Rw} dB
                  </div>
                  <div>
                    <span className="font-medium">Color:</span> {wall.color}
                  </div>
                </div>
                <div className="mt-1">
                  <span className="font-medium">Capas:</span>
                  <ul className="list-disc ml-4 text-xs text-gray-600">
                    {wall.layers.map((layer: any, idx: number) => (
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
          <Button onClick={onClose} variant="secondary">Cerrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}