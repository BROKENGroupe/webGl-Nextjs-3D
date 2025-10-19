"use client";

import React, { useState, useRef } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { mockPlace } from "@/modules/places/data/summary";
import { motion } from "framer-motion";
import { Pencil2Icon, InfoCircledIcon, BarChartIcon, FileTextIcon, LayersIcon, EyeOpenIcon, ReloadIcon } from "@radix-ui/react-icons";

// Card shadcn style
function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border bg-white shadow-sm p-5 ${className}`}>
      {children}
    </div>
  );
}

// ProgressBar shadcn style
function ProgressBar({ value, max = 100, label }: { value: number; max?: number; label?: string }) {
  const percent = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div>
      {label && (
        <div className="flex justify-between text-xs mb-1">
          <span className="text-neutral-700">{label}</span>
          <span className="font-semibold text-neutral-900">{percent.toFixed(1)}%</span>
        </div>
      )}
      <div className="w-full bg-neutral-200 rounded-full h-2">
        <motion.div
          className="bg-neutral-900 h-2 rounded-full"
          style={{ width: `${percent}%` }}
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.6, type: "spring" }}
        />
      </div>
    </div>
  );
}

// DonutChart shadcn style
function DonutChart({ value, max = 100, label }: { value: number; max?: number; label?: string }) {
  const percent = Math.max(0, Math.min(100, (value / max) * 100));
  const radius = 32;
  const stroke = 7;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (percent / 100) * circ;
  return (
    <div className="flex flex-col items-center">
      <svg width="80" height="80">
        <circle
          cx="40"
          cy="40"
          r={radius}
          stroke="#e5e7eb"
          strokeWidth={stroke}
          fill="none"
        />
        <motion.circle
          cx="40"
          cy="40"
          r={radius}
          stroke="#111"
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.8, type: "spring" }}
        />
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dy=".3em"
          fontSize="1.1em"
          className="font-bold"
          fill="#111"
        >
          {percent.toFixed(0)}%
        </text>
      </svg>
      {label && <span className="text-xs text-neutral-700 mt-1">{label}</span>}
    </div>
  );
}

const secondaryTabs = [
  { key: "info", label: "Información", icon: <InfoCircledIcon className="mr-2" /> },
  { key: "simulation", label: "Simulación", icon: <LayersIcon className="mr-2" /> },
  { key: "metrics", label: "Métricas", icon: <BarChartIcon className="mr-2" /> },
  { key: "history", label: "Historial", icon: <FileTextIcon className="mr-2" /> },
];

const getPlaceById = async (id: string) => mockPlace;

export default function PlaceDetailPage() {
  const { id } = useParams();
  const [activeStudy, setActiveStudy] = useState(0);
  const [activeTab, setActiveTab] = useState("info");
  const [editingTab, setEditingTab] = useState<number | null>(null);
  const [studyNames, setStudyNames] = useState<string[]>(
    (mockPlace.simulations || []).map((_, idx) => `Estudio ${idx + 1}`)
  );
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const { data: place, isLoading } = useQuery({
    queryKey: ["place", id],
    queryFn: () => getPlaceById(id as string),
    enabled: !!id,
  });

  if (isLoading) return <div className="p-8 text-center">Cargando...</div>;
  if (!place) return <div className="p-8 text-center text-red-500">No se encontró el establecimiento.</div>;

  const studies = place.simulations || [];
  const currentStudy = studies[activeStudy];

  // KPIs globales (puedes ajustar si quieres por estudio)
  const isoAvg = studies.length
    ? studies.reduce((acc: number, sim: any) => acc + (sim.metrics?.isoComplianceLevel || 0), 0) / studies.length
    : 0;
  const stcAvg = studies.length
    ? studies.reduce((acc: number, sim: any) => acc + (sim.metrics?.soundTransmissionClass || 0), 0) / studies.length
    : 0;
  const noiseAvg = studies.length
    ? studies.reduce((acc: number, sim: any) => acc + (sim.metrics?.noiseIsolation || 0), 0) / studies.length
    : 0;

  // Editable tab name
  const handleTabNameChange = (idx: number, value: string) => {
    setStudyNames((prev) => prev.map((n, i) => (i === idx ? value : n)));
  };
  const handleTabBlur = () => setEditingTab(null);
  const handleTabKeyDown = (e: React.KeyboardEvent, idx: number) => {
    if (e.key === "Enter") setEditingTab(null);
  };

  return (
    <div className="min-h-screen px-8 py-6 bg-white">
      {/* Header global */}
      <div className="w-full border-b bg-white">
        <div className="max-w-6xl flex flex-row items-center gap-6 py-6 px-4">
          <img
            src={place.image}
            alt={place.name}
            className="w-[120px] h-[120px] object-cover rounded-xl border bg-gray-100"
            style={{ flexShrink: 0 }}
          />
          <div className="flex-1 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-neutral-900">{place.name}</span>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  place.status === "activo"
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-200 text-gray-600"
                }`}>
                  {place.status === "activo" ? "Activo" : "Inactivo"}
                </span>
                <span className="px-2 py-1 rounded text-xs bg-neutral-100 text-neutral-900 font-medium">
                  {place.category?.name}
                </span>
              </div>
              <div className="text-neutral-700">{place.address}</div>
            </div>
            <div className="text-xs text-gray-400 mt-1 md:mt-0 text-right">
              Creado: {new Date(place.createdAt).toLocaleDateString()}<br />
              Última actualización: {new Date(place.updatedAt).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>      

      {/* Tabs de estudios (PRINCIPALES) */}
      <div className="max-w-6xl px-4 mt-15">
        <div className="flex flex-wrap gap-2 border-b pb-2">
          {studies.map((sim: any, idx: number) => (
            <div
              key={sim.id}
              className={`relative flex items-center group cursor-pointer select-none
                ${activeStudy === idx ? "border-b-2 border-neutral-900" : ""}
                px-0 py-0 mr-2`}
              style={{ minWidth: 120 }}
              onClick={() => setActiveStudy(idx)}
            >
              {editingTab === idx ? (
                <input
                  ref={el => { inputRefs.current[idx] = el; }}
                  className="px-2 py-1 rounded-lg border text-sm font-medium outline-none focus:ring-2 focus:ring-neutral-900 transition w-[120px]"
                  value={studyNames[idx]}
                  onChange={e => handleTabNameChange(idx, e.target.value)}
                  onBlur={handleTabBlur}
                  onKeyDown={e => handleTabKeyDown(e, idx)}
                  autoFocus
                />
              ) : (
                <>
                  <span
                    className={`text-sm font-medium transition-colors ${
                      activeStudy === idx
                        ? "text-neutral-900"
                        : "text-neutral-500 group-hover:text-neutral-900"
                    }`}
                  >
                    {studyNames[idx]}
                  </span>
                  <button
                    type="button"
                    className="ml-1 opacity-60 hover:opacity-100 transition-opacity p-1 rounded focus:outline-none focus:ring-2 focus:ring-neutral-900"
                    style={{ fontSize: 16, lineHeight: 1 }}
                    onClick={e => {
                      e.stopPropagation();
                      setEditingTab(idx);
                      setTimeout(() => inputRefs.current[idx]?.focus(), 10);
                    }}
                    tabIndex={-1}
                    aria-label="Editar nombre del estudio"
                  >
                    <Pencil2Icon />
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* KPIs/Progress globales */}
      <div className="max-w-6xl px-4 mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="flex flex-col items-center">
          <DonutChart value={isoAvg} label="ISO Promedio" />
        </Card>
        <Card>
          <ProgressBar value={stcAvg} max={60} label="STC Promedio" />
        </Card>
        <Card>
          <ProgressBar value={noiseAvg} max={60} label="Red. Externa" />
        </Card>
        <Card className="flex flex-col items-center justify-center">
          <span className="text-xs text-neutral-700 mb-1">Completados</span>
          <span className="text-2xl font-bold text-neutral-900">
            {studies.filter((s: any) => s.status === "completed").length || 0}
          </span>
        </Card>
      </div>

      {/* Tabs secundarios por estudio */}
      <div className="max-w-6xl px-4 mt-10">
        <div className="flex border-b gap-2">
          {secondaryTabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 font-medium border-b-2 transition-colors flex items-center ${
                activeTab === tab.key
                  ? "border-neutral-900 text-neutral-900"
                  : "border-transparent text-gray-500 hover:text-neutral-900"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      

      {/* Contenido del estudio y tab secundario */}
      <motion.div
        key={activeTab + activeStudy}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="max-w-6xl px-4 py-6"
      >
        {/* Información */}
        {activeTab === "info" && (
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xl font-semibold mb-4 text-neutral-900 flex items-center">
                <InfoCircledIcon className="mr-2" /> Información del Estudio
              </h2>
              <ul className="space-y-3 text-base">
                <li><b>Nombre:</b> {studyNames[activeStudy]}</li>
                <li><b>Estado:</b> {currentStudy.status === "completed" ? "Completado" : "Borrador"}</li>
                <li><b>Creado:</b> {place.createdAt ? new Date(place.createdAt).toLocaleString() : "-"}</li>
                <li><b>Última actualización:</b> {place.updatedAt ? new Date(place.updatedAt).toLocaleString() : "-"}</li>
                <li><b>Descripción global:</b> {place.description || "Sin descripción"}</li>
              </ul>
            </div>
            <div className="flex flex-col items-center justify-center">
              <div className="w-full flex flex-col gap-4">
                <Card className="bg-neutral-100 flex flex-col items-center">
                  <DonutChart value={currentStudy.metrics?.isoComplianceLevel || 0} label="ISO Estudio" />
                </Card>
                <Card className="bg-neutral-100 flex flex-col items-center">
                  <span className="text-xs text-neutral-700 mb-1">Elementos modelados</span>
                  <span className="text-2xl font-bold text-neutral-900">
                    {currentStudy.elements?.length || 0}
                  </span>
                </Card>
              </div>
            </div>
          </div>
        )}

        {/* Simulación */}
        {activeTab === "simulation" && (
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <LayersIcon className="text-neutral-700" />
                <span className="font-semibold text-neutral-800">
                  {studyNames[activeStudy]}
                </span>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                  currentStudy.status === "completed"
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}>
                  {currentStudy.status === "completed" ? "Completado" : "Borrador"}
                </span>
              </div>
              {currentStudy.elements?.length > 0 ? (
                <ul className="flex flex-wrap gap-3">
                  {currentStudy.elements.map((el: any) => (
                    <Card
                      key={el.id}
                      className="w-[220px] min-w-[180px] max-w-[240px] flex-1 bg-gray-50 hover:bg-neutral-100 transition cursor-pointer p-4"
                    >
                      <div>
                        <span className="font-bold text-neutral-900">{el.type}:</span>{" "}
                        <span className="font-semibold text-neutral-800">{el.name}</span>
                        <div className="text-xs text-neutral-600 mt-1">
                          Material: {el.material || "N/A"}<br />
                          Área: {el.area ? `${el.area} m²` : "N/A"}<br />
                          Espesor: {el.thickness ? `${el.thickness} mm` : "N/A"}
                        </div>
                      </div>
                      <div className="flex flex-col items-end mt-2">
                        <span className="text-xs text-neutral-600">ISO: <span className="font-semibold text-neutral-900">{el.isoResult ?? "N/A"}</span></span>
                        <span className={`text-xs font-semibold ${el.status === "completed" ? "text-green-600" : "text-yellow-600"}`}>
                          {el.status === "completed" ? "Completado" : "Borrador"}
                        </span>
                      </div>
                    </Card>
                  ))}
                </ul>
              ) : (
                <div className="text-neutral-500">No hay elementos modelados.</div>
              )}
              <div className="flex gap-2 mt-4">
                <button
                  className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg font-semibold transition-colors flex items-center"
                  onClick={() => {
                    // Navegar a la vista 3D de este estudio
                  }}
                >
                  <EyeOpenIcon className="mr-2" />
                  Ver en 3D
                </button>
                {currentStudy.status !== "completed" && (
                  <button
                    className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-semibold transition-colors flex items-center"
                    onClick={() => {
                      // Acción para continuar el estudio borrador
                    }}
                  >
                    <ReloadIcon className="mr-2" />
                    Continuar
                  </button>
                )}
              </div>
            </div>
            {/* Resumen */}
            <div className="w-full lg:w-[340px] flex-shrink-0">
              <Card className="bg-neutral-100">
                <h4 className="font-semibold text-neutral-900 mb-2 text-sm">Resumen de Cálculo ISO 12354-4</h4>
                {currentStudy.isoSummary ? (
                  <ul className="text-sm text-neutral-800 space-y-1">
                    <li><b>Resultado global:</b> {currentStudy.isoSummary.resultadoGlobal ?? "N/A"}</li>
                    <li><b>Observaciones:</b> {currentStudy.isoSummary.observaciones ?? "Sin observaciones"}</li>
                    <li><b>Recomendaciones:</b> {currentStudy.isoSummary.recomendaciones ?? "Sin recomendaciones"}</li>
                  </ul>
                ) : (
                  <div className="text-neutral-700">No hay resumen de cálculo disponible.</div>
                )}
              </Card>
            </div>
          </div>
        )}

        {/* Métricas */}
        {activeTab === "metrics" && (
          <div>
            <h2 className="text-xl font-semibold mb-6 text-neutral-900 flex items-center">
              <BarChartIcon className="mr-2" /> Métricas del Estudio
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <div className="mb-4">
                  <b>ISO Compliance:</b> {currentStudy.metrics?.isoComplianceLevel ?? "N/A"}
                </div>
                <div className="mb-4">
                  <b>STC:</b> {currentStudy.metrics?.soundTransmissionClass ?? "N/A"}
                </div>
                <div className="mb-4">
                  <b>Reducción Externa:</b> {currentStudy.metrics?.noiseIsolation ?? "N/A"}
                </div>
                <div className="mb-4">
                  <b>Recomendaciones:</b>
                  <ul className="list-disc ml-6 text-neutral-800">
                    {currentStudy.metrics?.recommendations?.length > 0
                      ? currentStudy.metrics.recommendations.map((rec: string, i: number) => (
                          <li key={i}>{rec}</li>
                        ))
                      : <li>No hay recomendaciones registradas.</li>
                    }
                  </ul>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-3 text-neutral-800">Indicadores</h3>
                <Card className="bg-neutral-100 flex flex-col gap-4">
                  <ProgressBar value={currentStudy.metrics?.isoComplianceLevel || 0} label="ISO Estudio" />
                  <ProgressBar value={currentStudy.metrics?.soundTransmissionClass || 0} max={60} label="STC" />
                  <ProgressBar value={currentStudy.metrics?.noiseIsolation || 0} max={60} label="Red. Externa" />
                </Card>
              </div>
            </div>
          </div>
        )}

        {/* Historial */}
        {activeTab === "history" && (
          <div>
            <h2 className="text-xl font-semibold mb-6 text-neutral-900 flex items-center">
              <FileTextIcon className="mr-2" /> Historial del Estudio
            </h2>
            <ul className="divide-y">
              {place.history?.length > 0 ? (
                place.history
                  .filter((h: any) => h.details?.toLowerCase().includes(studyNames[activeStudy].toLowerCase()))
                  .map((h: any, i: number) => (
                    <li key={i} className="py-2">
                      <div className="flex items-center justify-between">
                        <span>
                          <b>{h.user}</b> {h.action}
                        </span>
                        <span className="text-xs text-gray-500">{new Date(h.date).toLocaleString()}</span>
                      </div>
                      <div className="text-xs text-neutral-700">{h.details}</div>
                    </li>
                  ))
              ) : (
                <li className="text-neutral-500">No hay historial de cambios.</li>
              )}
            </ul>
          </div>
        )}
      </motion.div>
    </div>
  );
}