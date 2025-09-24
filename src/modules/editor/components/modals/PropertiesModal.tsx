import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
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


  const acoustic = selectedElement?.template;

  const raw = acoustic?.thirdOctaveBands ?? {};

  const chartData: { frequency: number; value_R: number }[] = Object.entries(raw)
    .map(([freq, val]) => {
      const frequency = parseInt(freq, 10);
      const value_R = typeof val === 'number' ? val : Number(val);
      return { frequency, value_R };
    })
    .filter(d => !Number.isNaN(d.frequency) && !Number.isNaN(d.value_R));
  console.log("Selected Element:", acoustic);

  return (
    <Dialog open={visible} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="w-[40vw]"
        style={{
          maxHeight: "95vh",
          minHeight: "600px",
          overflowY: "auto",
          padding: "15px",

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
          <div className="mb-6 space-y-2">
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


                <div className="bg-gray-50 p-4 rounded-l¿">
                  <h4 className="text-md font-semibold text-gray-800 mb-4 text-center">
                    Curva de Aislamiento Acústico
                  </h4>
                  <div className="flex flex-col md:flex-row gap-2 p-2" style={{ height: 300 }}>
                    {/* Left: table (fixed width on md+, full width on small screens) */}
                    <div className="w-full md:w-1/3 lg:w-1/4 overflow-hidden">
                      <h3 className="text-sm font-semibold mb-2">Tabla de valores</h3>

                      {/* make this container fill the available height and scroll when content overflows */}
                      <div className="h-full overflow-auto" style={{ maxHeight: 'calc(100% - 56px)' }}>
                        <table className="w-full text-sm border-collapse">
                          <thead>
                            <tr className="text-left text-xs text-gray-500">
                              <th className="pb-2">Frecuencia (Hz)</th>
                              <th className="pb-2">R (dB)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {chartData && chartData.length > 0 ? (
                              chartData.map((p, i) => (
                                <tr key={i} className="border-t last:border-b">
                                  <td className="py-2">{p.frequency}</td>
                                  <td className="py-2">{Number(p.value_R).toFixed(1)}</td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={2} className="py-4 text-center text-gray-400">
                                  Sin datos
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>


                    {/* Right: chart */}
                    <div className="flex-1 p-3 h-full">
                      <div style={{ width: '100%', height: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                            <XAxis
                              dataKey="frequency"
                              label={{ value: 'Frecuencia (Hz)', position: 'insideBottom', offset: -5, fontSize: 12 }}
                              tick={{ fontSize: 10 }}
                              type="category"
                            />
                            <YAxis label={{ value: 'R (dB)', angle: -90, position: 'insideLeft', fontSize: 12 }} tick={{ fontSize: 10 }} />
                            <Tooltip labelFormatter={(value) => `${value} Hz`} formatter={(value: number) => [Number(value).toFixed(1), 'R (dB)']} />
                            <Legend verticalAlign="top" height={36} />
                            <Line type="monotone" dataKey="value_R" name="Índice de Reducción" stroke="#000000ff" strokeWidth={2} dot={{ r: 4, fill: '#000000ff' }} activeDot={{ r: 6 }} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
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
