import React from 'react';

const studies = [
  { id: 1, name: "Estudio Acústico Oficina", status: "ok" },
  { id: 2, name: "Estudio Restaurante", status: "review" },
];

const establishments = [
  { id: 1, name: "Oficina Central" },
  { id: 2, name: "Restaurante Sur" },
];

const statusColors: Record<string, string> = {
  ok: "bg-green-400",
  review: "bg-yellow-300",
};

export default function HomePage() {
  const totalStudies = studies.length;
  const studiesOk = studies.filter(s => s.status === "ok").length;
  const studiesReview = studies.filter(s => s.status === "review").length;

  return (
    <main className="p-10 max-w-7xl">
      {/* Indicadores */}
      <div className="flex gap-8 mb-12">
        <div className="flex-1 bg-neutral-50 rounded-2xl p-6 flex items-center gap-4 shadow-sm min-h-[90px]">
          <div className="w-4 h-4 rounded-full bg-green-400 animate-pulse" />
          <div>
            <div className="text-2xl font-bold text-neutral-900">{studiesOk}</div>
            <div className="text-sm text-neutral-600">Cumplen la norma</div>
          </div>
        </div>
        <div className="flex-1 bg-neutral-50 rounded-2xl p-6 flex items-center gap-4 shadow-sm min-h-[90px]">
          <div className="w-4 h-4 rounded-full bg-yellow-300 animate-pulse" />
          <div>
            <div className="text-2xl font-bold text-neutral-900">{studiesReview}</div>
            <div className="text-sm text-neutral-600">Por revisar</div>
          </div>
        </div>
        <div className="flex-1 bg-neutral-50 rounded-2xl p-6 flex items-center gap-4 shadow-sm min-h-[90px]">
          <div className="w-4 h-4 rounded-full bg-neutral-800" />
          <div>
            <div className="text-2xl font-bold text-neutral-900">{totalStudies}</div>
            <div className="text-sm text-neutral-600">Total estudios</div>
          </div>
        </div>
      </div>

      {/* Sección de Estudios */}
      <section className="mb-14">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-2xl font-semibold text-neutral-900">Estudios</h2>
          <button className="flex items-center gap-2 px-5 py-2 bg-black text-white rounded-lg shadow-sm hover:bg-neutral-800 transition font-medium text-base">
            <span className="text-xl font-bold">+</span> Nuevo estudio
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {studies.map(study => (
            <div
              key={study.id}
              className="bg-white rounded-2xl shadow-sm p-6 flex items-center gap-4 border border-neutral-200 hover:border-black transition min-h-[110px]"
            >
              <div className={`w-3 h-3 rounded-full ${statusColors[study.status]}`} />
              <div>
                <div className="font-semibold text-lg text-neutral-900">{study.name}</div>
                <div className="text-sm text-neutral-500">
                  {study.status === "ok" ? "Cumple norma" : "Por revisar"}
                </div>
              </div>
            </div>
          ))}
          {/* Cuadro para crear nuevo */}
          <button className="flex flex-col items-center justify-center border-2 border-dashed border-neutral-400 rounded-2xl p-6 hover:bg-neutral-100 transition min-h-[110px]">
            <span className="text-3xl text-neutral-800 font-bold">+</span>
            <span className="text-sm text-neutral-700 mt-1">Nuevo estudio</span>
          </button>
        </div>
      </section>

      {/* Sección de Establecimientos */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-2xl font-semibold text-neutral-900">Mis Establecimientos</h2>
          <button className="flex items-center gap-2 px-5 py-2 bg-black text-white rounded-lg shadow-sm hover:bg-neutral-800 transition font-medium text-base">
            <span className="text-xl font-bold">+</span> Nuevo establecimiento
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {establishments.map(est => (
            <div
              key={est.id}
              className="bg-white rounded-2xl shadow-sm p-6 flex items-center gap-4 border border-neutral-200 hover:border-black transition min-h-[110px]"
            >
              <div className="w-3 h-3 rounded-full bg-emerald-400" />
              <div>
                <div className="font-semibold text-lg text-neutral-900">{est.name}</div>
              </div>
            </div>
          ))}
          {/* Cuadro para crear nuevo */}
          <button className="flex flex-col items-center justify-center border-2 border-dashed border-neutral-400 rounded-2xl p-6 hover:bg-neutral-100 transition min-h-[110px]">
            <span className="text-3xl text-neutral-800 font-bold">+</span>
            <span className="text-sm text-neutral-700 mt-1">Nuevo establecimiento</span>
          </button>
        </div>
      </section>
    </main>
  );
}