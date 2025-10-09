import React, { memo } from 'react';
import { Study, STATUS_COLORS, STATUS_LABELS } from '@/types/dashboard';

interface StudiesSectionProps {
  studies: Study[];
  onCreateStudy: () => void;
  loading?: boolean;
}

export const StudiesSection = memo(function StudiesSection({ 
  studies, 
  onCreateStudy,
  loading = false 
}: StudiesSectionProps) {
  return (
    <section className="mb-14">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-2xl font-semibold text-neutral-900">Estudios</h2>
        <button 
          onClick={onCreateStudy}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2 bg-black text-white rounded-lg shadow-sm hover:bg-neutral-800 transition font-medium text-base disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="text-xl font-bold">+</span> 
          {loading ? 'Creando...' : 'Nuevo estudio'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {studies.map(study => (
          <StudyCard key={study.id} study={study} />
        ))}
        
        {/* Card para crear nuevo */}
        <button 
          onClick={onCreateStudy}
          disabled={loading}
          className="flex flex-col items-center justify-center border-2 border-dashed border-neutral-400 rounded-2xl p-6 hover:bg-neutral-100 transition min-h-[110px] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="text-3xl text-neutral-800 font-bold">+</span>
          <span className="text-sm text-neutral-700 mt-1">Nuevo estudio</span>
        </button>
      </div>
    </section>
  );
});

// ✅ Componente individual de estudio
const StudyCard = memo(function StudyCard({ study }: { study: Study }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 flex items-center gap-4 border border-neutral-200 hover:border-black transition min-h-[110px]">
      <div className={`w-3 h-3 rounded-full ${STATUS_COLORS[study.status]}`} />
      <div>
        <div className="font-semibold text-lg text-neutral-900">{study.name}</div>
        <div className="text-sm text-neutral-500">
          {STATUS_LABELS[study.status]}
        </div>
      </div>
    </div>
  );
});

StudiesSection.displayName = 'StudiesSection';
StudyCard.displayName = 'StudyCard';