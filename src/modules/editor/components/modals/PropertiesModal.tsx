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
import { Settings, Waves, Info, SlidersHorizontal, X } from "lucide-react";

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
    // wallConcreteBlock,
    // wallGypsumBoard,
    // wallLightWoodPanel,
    // wallThinBrickPartition,
    // windowStandard,
    // windowTripleGlazed,
    // windowAcoustic,
    // windowLaminated,
    // windowDoubleGlazed,
    // doorStandard,
    // doorDouble,
    // doorAcoustic,
  ];
}

const menuItems = [
  { id: "general", label: "General", icon: <Info className="h-4 w-4" />, description: "Datos generales" },
  { id: "acoustic", label: "Acústica", icon: <Waves className="h-4 w-4" />, description: "Gráfica y tabla acústica" },
  { id: "advanced", label: "Opciones avanzadas", icon: <SlidersHorizontal className="h-4 w-4" />, description: "Configuraciones extra" },
];

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
  const [activeSection, setActiveSection] = useState("general");
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

  const renderSection = () => {
    if (!selectedElement) return <div className="text-gray-500 overflow-hidden">No se encontró el elemento seleccionado.</div>;

    switch (activeSection) {
      case "general":
        return (
          <div className="mb-6 space-y-2 overflow-hidden">
            <div className="font-semibold text-xl mb-2">{acoustic?.descriptor || "Sin asignar"}</div>
            <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm text-gray-700 mb-2">
              <div>
                <span className="font-medium">Tipo:</span> {acoustic?.type}
              </div>
              <div>
                <span className="font-medium">Subtipo:</span> {acoustic?.subtype}
              </div>
              <div>
                <span className="font-medium">Espesor:</span> {acoustic?.thickness} mm
              </div>
              <div>
                <span className="font-medium">Masa:</span> {acoustic?.mass} kg/m²
              </div>
              <div>
                <span className="font-medium">Color:</span> {acoustic?.color}
              </div>
            </div>
            <div className="mt-2">
              <span className="font-medium">Capas:</span>
              <ul className="list-disc ml-6 text-xs text-gray-600">
                {acoustic?.layers?.map((layer: any, idx: number) => (
                  <li key={idx}>
                    {layer.name} ({layer.thickness} mm)
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-2">
              <span className="font-medium">Índices acústicos:</span>
              <ul className="ml-6 text-xs text-gray-600">
                <li>Rw: {acoustic?.weightedIndex?.Rw} dB</li>
                <li>C: {acoustic?.weightedIndex?.C}</li>
                <li>Ctr: {acoustic?.weightedIndex?.Ctr}</li>
              </ul>
            </div>
          </div>
        );
      case "acoustic":
        return (
          <div className="border rounded-lg p-4 bg-gray-50 mt-2">
            <div className="font-semibold text-lg mb-2">{acoustic?.descriptor}</div>
            {/* <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm text-gray-700 mb-2">
              <div>
                <span className="font-medium">Tipo:</span> {acoustic.type}
              </div>
              <div>
                <span className="font-medium">Subtipo:</span>{" "}
                {acoustic.subtype}
              </div>
              <div>
                <span className="font-medium">Espesor:</span>{" "}
                {acoustic.thickness} mm
              </div>
              <div>
                <span className="font-medium">Masa:</span>{" "}
                {acoustic.mass} kg/m²
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
                    {layer.name} ({layer.thickness} mm)
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
            </div> */}


            <div className="bg-gray-50 p-4 rounded-l¿">
              <h4 className="text-md font-semibold text-gray-800 mb-4 text-center">
                Curva de Aislamiento Acústico
              </h4>
              <div className="flex flex-col md:flex-row gap-2 p-2" style={{ height: 350 }}>
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
        );
      case "advanced":
        // Recupera el elemento editable desde el store por id
        const editable =
          elementType === ElementType.Wall
            ? walls.find((w) => w.id === selectedElement.id)
            : elementType === ElementType.Opening
            ? openings.find((o) => o.id === selectedElement.id)
            : elementType === ElementType.Floor
            ? floors.find((f) => f.id === selectedElement.id)
            : elementType === ElementType.Ceiling
            ? ceilings.find((c) => c.id === selectedElement.id)
            : null;

        // Handler para actualizar propiedades en el store
        const handleChange = (field: string, value: any) => {
          if (!editable) return;
          if (elementType === ElementType.Wall) {
            if (editable?.id) {
              useWallsStore.getState().updateWall(editable.id, { [field]: value });
            }
          } else if (elementType === ElementType.Opening) {
            if (editable?.id) {
              useOpeningsStore.getState().updateOpening(editable.id, { [field]: value });
            }
          } else if (elementType === ElementType.Floor) {
            if (editable?.id) {
              useWallsStore.getState().updateFloor(editable.id, { [field]: value });
            }
          } else if (elementType === ElementType.Ceiling) {
            if (editable?.id) {
              useWallsStore.getState().updateCeiling(editable.id, { [field]: value });
            }
          }
        };

        return (
          <div className="border rounded-lg p-4 bg-gray-50 mt-2 space-y-4">
            <div className="font-semibold text-lg mb-2">Opciones avanzadas</div>
            <div>
              <span className="font-medium">ID interno:</span> {editable?.id}
            </div>
            <div>
              <span className="font-medium">Área:</span> {editable?.area} m²
            </div>
            <div>
              <span className="font-medium">Titulo:</span> {editable?.title ?? "—"}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                <input
                  type="color"
                  value={editable?.color || "#cccccc"}
                  onChange={e => handleChange("color", e.target.value)}
                  className="w-12 h-8 p-0 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Alto (m)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={editable?.height ?? ""}
                  onChange={e => handleChange("height", parseFloat(e.target.value))}
                  className="w-full border rounded px-2 py-1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ancho (m)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={editable?.width ?? ""}
                  onChange={e => handleChange("width", parseFloat(e.target.value))}
                  className="w-full border rounded px-2 py-1"
                />
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={visible} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[900px] w-full p-0 bg-white border border-gray-200 shadow-2xl">
        <div className="flex h-[60vh]">
          {/* MENÚ LATERAL */}
          <div className="w-72 min-w-60 max-w-72 bg-gray-50 border-r border-gray-200 flex flex-col shrink-0">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-gray-700" />
                <div>
                  <h1 className="text-base font-semibold text-gray-900">Propiedades</h1>
                  <p className="text-xs text-gray-500">{acoustic?.descriptor}</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={onClose} className="h-7 w-7 p-0 hover:bg-gray-200">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <nav className="flex-1 p-3 overflow-y-auto">
              <div className="space-y-1">
                {menuItems.map((item) => (
                  <Button
                    key={item.id}
                    variant={activeSection === item.id ? "secondary" : "ghost"}
                    className={`w-full justify-start h-auto p-2.5 text-sm ${
                      activeSection === item.id
                        ? "bg-white shadow-sm border border-gray-200 text-gray-900"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    }`}
                    onClick={() => setActiveSection(item.id)}
                  >
                    <div className="flex items-center gap-2.5 w-full">
                      <div className="shrink-0">{item.icon}</div>
                      <div className="text-left flex-1 min-w-0">
                        <div className="font-medium truncate">{item.label}</div>
                        <div className="text-xs text-gray-500 mt-0.5 truncate">{item.description}</div>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </nav>
          </div>
          {/* CONTENIDO PRINCIPAL */}
          <div className="flex-1 min-w-0 overflow-hidden">
            <div className="w-full h-full p-6 bg-white overflow-hidden">
              {renderSection()}
            </div>
            {/* <DialogFooter>
              <Button variant="secondary" onClick={onClose}>
                Cerrar
              </Button>
            </DialogFooter> */}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
